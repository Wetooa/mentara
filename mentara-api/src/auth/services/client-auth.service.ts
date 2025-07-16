import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TokenService } from './token.service';
import { EmailVerificationService } from './email-verification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async registerClient(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and client profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'client',
          emailVerified: false,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
        },
      });

      return { user, client };
    });

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      result.user.id,
      result.user.email,
      result.user.role,
    );

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(result.user.id);

    return {
      user: result.user,
      tokens,
      message:
        'Client registration successful. Please check your email for verification.',
    };
  }

  async loginClient(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user with client role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'client',
      },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to failed login attempts',
      );
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Account setup incomplete');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login count
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login count and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockoutUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(
      user.id,
      user.email,
      user.role,
      ipAddress,
      userAgent,
    );

    return {
      user,
      tokens,
    };
  }

  async getClientProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: {
          include: {
            assignedTherapists: {
              include: {
                therapist: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== 'client') {
      throw new UnauthorizedException('Client not found');
    }

    return user;
  }

  async getFirstSignInStatus(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        hasSeenTherapistRecommendations: true,
      },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    return {
      hasSeenTherapistRecommendations: client.hasSeenTherapistRecommendations,
    };
  }

  async markRecommendationsSeen(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    await this.prisma.client.update({
      where: { userId },
      data: {
        hasSeenTherapistRecommendations: true,
      },
    });

    return {
      message: 'Recommendations marked as seen',
    };
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginCount: true },
    });

    const newFailedCount = (user?.failedLoginCount || 0) + 1;
    const maxAttempts = 5;
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes

    const updateData: any = {
      failedLoginCount: newFailedCount,
    };

    if (newFailedCount >= maxAttempts) {
      updateData.lockoutUntil = new Date(Date.now() + lockoutDuration);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
