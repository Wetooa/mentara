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
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async createAdminAccount(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    adminLevel: string = 'admin',
    permissions: string[] = [],
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

    // Create user and admin profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin',
          emailVerified: true, // Admins are pre-verified
        },
      });

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          adminLevel,
          permissions,
        },
      });

      return { user, admin };
    });

    return {
      user: result.user,
      message: 'Admin account created successfully.',
    };
  }

  async loginAdmin(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user with admin role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'admin',
      },
      include: {
        admin: true,
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

    // Generate single token
    const { token } = await this.tokenService.generateToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      user,
      token,
    };
  }

  async getAdminProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
      },
    });

    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Admin not found');
    }

    return user;
  }

  async getAdminPermissions(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      select: {
        permissions: true,
        adminLevel: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return admin;
  }

  async getAdminDashboardStats(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // Get various platform statistics
    const [
      totalUsers,
      totalClients,
      totalTherapists,
      totalModerators,
      totalAdmins,
      pendingApplications,
      totalCommunities,
      totalPosts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.client.count(),
      this.prisma.therapist.count(),
      this.prisma.moderator.count(),
      this.prisma.admin.count(),
      this.prisma.therapist.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.community.count(),
      this.prisma.post.count(),
    ]);

    return {
      totalUsers,
      totalClients,
      totalTherapists,
      totalModerators,
      totalAdmins,
      pendingApplications,
      totalCommunities,
      totalPosts,
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
