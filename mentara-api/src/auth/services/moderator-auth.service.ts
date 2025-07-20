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
export class ModeratorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async createModeratorAccount(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    permissions: string[] = [],
    assignedCommunities: string[] = [],
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

    // Create user and moderator profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'moderator',
          emailVerified: true, // Moderators are pre-verified
        },
      });

      const moderator = await tx.moderator.create({
        data: {
          userId: user.id,
          permissions,
          assignedCommunities:
            assignedCommunities.length > 0 ? assignedCommunities : [],
        },
      });

      return { user, moderator };
    });

    return {
      user: result.user,
      message: 'Moderator account created successfully.',
    };
  }

  async loginModerator(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Find user with moderator role
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'moderator',
      },
      include: {
        moderator: true,
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

  async getModeratorProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        moderator: {
          include: {
            moderatorCommunities: {
              include: {
                community: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== 'moderator') {
      throw new UnauthorizedException('Moderator not found');
    }

    return user;
  }

  async getModeratorPermissions(userId: string) {
    const moderator = await this.prisma.moderator.findUnique({
      where: { userId },
      select: {
        permissions: true,
        assignedCommunities: true,
      },
    });

    if (!moderator) {
      throw new UnauthorizedException('Moderator not found');
    }

    return moderator;
  }

  async getAssignedCommunities(userId: string) {
    const moderator = await this.prisma.moderator.findUnique({
      where: { userId },
      select: {
        assignedCommunities: true,
      },
    });

    if (!moderator) {
      throw new UnauthorizedException('Moderator not found');
    }

    // If assignedCommunities is stored as JSON array of community IDs
    const communityIds = Array.isArray(moderator.assignedCommunities)
      ? (moderator.assignedCommunities as string[])
      : [];

    if (communityIds.length === 0) {
      return [];
    }

    // Get the actual community data
    return this.prisma.community.findMany({
      where: {
        id: { in: communityIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
      },
    });
  }

  async getModeratorDashboardStats(userId: string) {
    const moderator = await this.prisma.moderator.findUnique({
      where: { userId },
      include: {
        moderatorCommunities: true,
      },
    });

    if (!moderator) {
      throw new UnauthorizedException('Moderator not found');
    }

    const communityIds = moderator.moderatorCommunities.map(
      (mc) => mc.communityId,
    );

    // Get statistics for communities the moderator manages
    const [
      totalManagedCommunities,
      totalMembersInManagedCommunities,
      totalPostsInManagedCommunities,
      totalReportsInManagedCommunities,
    ] = await Promise.all([
      this.prisma.community.count({
        where: { id: { in: communityIds } },
      }),
      this.prisma.membership.count({
        where: { communityId: { in: communityIds } },
      }),
      this.prisma.post.count(),
      this.prisma.report.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    const pendingJoinRequests = 0; // Simplified - no complex join request system

    return {
      totalManagedCommunities,
      totalMembersInManagedCommunities,
      pendingJoinRequests,
      totalPostsInManagedCommunities,
      totalReportsInManagedCommunities,
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
