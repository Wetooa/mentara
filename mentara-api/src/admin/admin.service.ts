import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
} from './dto/admin.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<AdminResponseDto[]> {
    try {
      const admins = await this.prisma.admin.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return admins.map((admin) => ({
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve admins:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AdminResponseDto | null> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { userId: id },
      });

      if (!admin) {
        return null;
      }

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve admin ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateAdminDto): Promise<AdminResponseDto> {
    try {
      // First check if user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!userExists) {
        throw new NotFoundException(`User with ID ${data.userId} not found`);
      }

      // Check if admin already exists
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { userId: data.userId },
      });

      if (existingAdmin) {
        throw new ConflictException(`User ${data.userId} is already an admin`);
      }

      const admin = await this.prisma.admin.create({
        data: {
          userId: data.userId,
          permissions: data.permissions,
          adminLevel: data.adminLevel ?? 'admin',
        },
      });

      this.logger.log(`Created admin for user ${data.userId}`);

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User ${data.userId} is already an admin`,
          );
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(`User with ID ${data.userId} not found`);
        }
      }

      this.logger.error('Failed to create admin:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateAdminDto): Promise<AdminResponseDto> {
    try {
      const admin = await this.prisma.admin.update({
        where: { userId: id },
        data: {
          permissions: data.permissions,
          adminLevel: data.adminLevel,
        },
      });

      this.logger.log(`Updated admin ${id}`);

      return {
        userId: admin.userId,
        permissions: admin.permissions,
        adminLevel: admin.adminLevel,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Admin with ID ${id} not found`);
        }
      }

      this.logger.error(`Failed to update admin ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.admin.delete({ where: { userId: id } });
      this.logger.log(`Deleted admin ${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Admin with ID ${id} not found`);
        }
      }

      this.logger.error(`Failed to delete admin ${id}:`, error);
      throw error;
    }
  }

  // ===== THERAPIST APPLICATION MANAGEMENT =====

  async getAllTherapistApplications(params: {
    status?: string;
    page: number;
    limit: number;
  }) {
    try {
      const { status, page, limit } = params;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [applications, totalCount] = await Promise.all([
        this.prisma.therapist.findMany({
          where,
          skip,
          take: limit,
          orderBy: { submissionDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
            processedByAdmin: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.therapist.count({ where }),
      ]);

      return {
        applications,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error('Failed to retrieve therapist applications:', error);
      throw error;
    }
  }

  async getTherapistApplication(applicationId: string) {
    try {
      return await this.prisma.therapist.findUnique({
        where: { userId: applicationId },
        include: {
          user: true,
          processedByAdmin: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve therapist application:', error);
      throw error;
    }
  }

  async approveTherapistApplication(
    applicationId: string,
    adminId: string,
    notes?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Update therapist status
        const therapist = await tx.therapist.update({
          where: { userId: applicationId },
          data: {
            status: 'approved',
            processedByAdminId: adminId,
            processingDate: new Date(),
          },
        });

        // Update user role
        await tx.user.update({
          where: { id: applicationId },
          data: { role: 'therapist' },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'APPROVE_THERAPIST_APPLICATION',
            entityType: 'therapist',
            entityId: applicationId,
            details: {
              applicationId,
              notes,
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { success: true, therapist };
      });
    } catch (error) {
      this.logger.error('Failed to approve therapist application:', error);
      throw error;
    }
  }

  async rejectTherapistApplication(
    applicationId: string,
    adminId: string,
    reason: string,
    notes?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Update therapist status
        const therapist = await tx.therapist.update({
          where: { userId: applicationId },
          data: {
            status: 'rejected',
            processedByAdminId: adminId,
            processingDate: new Date(),
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'REJECT_THERAPIST_APPLICATION',
            entityType: 'therapist',
            entityId: applicationId,
            details: {
              applicationId,
              reason,
              notes,
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { success: true, therapist, reason };
      });
    } catch (error) {
      this.logger.error('Failed to reject therapist application:', error);
      throw error;
    }
  }

  // ===== USER MANAGEMENT =====

  async getAllUsers(params: {
    role?: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    try {
      const { role, page, limit, search } = params;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (role) {
        where.role = role;
      }
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
            suspendedAt: true,
            suspensionReason: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        users,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error('Failed to retrieve users:', error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: true,
          therapist: true,
          admin: true,
          moderator: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve user:', error);
      throw error;
    }
  }

  async suspendUser(
    userId: string,
    adminId: string,
    reason: string,
    duration?: number,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const suspensionEnd = duration
          ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
          : null;

        const user = await tx.user.update({
          where: { id: userId },
          data: {
            suspendedAt: new Date(),
            suspendedBy: adminId,
            suspensionReason: reason,
            isActive: false,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'SUSPEND_USER',
            entityType: 'user',
            entityId: userId,
            details: {
              userId,
              reason,
              duration,
              suspensionEnd: suspensionEnd?.toISOString(),
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { success: true, user };
      });
    } catch (error) {
      this.logger.error('Failed to suspend user:', error);
      throw error;
    }
  }

  async unsuspendUser(userId: string, adminId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            suspendedAt: null,
            suspendedBy: null,
            suspensionReason: null,
            isActive: true,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'UNSUSPEND_USER',
            entityType: 'user',
            entityId: userId,
            details: {
              userId,
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { success: true, user };
      });
    } catch (error) {
      this.logger.error('Failed to unsuspend user:', error);
      throw error;
    }
  }

  // ===== PLATFORM ANALYTICS =====

  async getPlatformOverview() {
    try {
      const [
        totalUsers,
        totalClients,
        totalTherapists,
        pendingApplications,
        totalCommunities,
        totalPosts,
        totalSessions,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.client.count(),
        this.prisma.therapist.count({ where: { status: 'approved' } }),
        this.prisma.therapist.count({ where: { status: 'pending' } }),
        this.prisma.community.count(),
        this.prisma.post.count(),
        this.prisma.meeting.count(),
      ]);

      const recentActivity = await this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        overview: {
          totalUsers,
          totalClients,
          totalTherapists,
          pendingApplications,
          totalCommunities,
          totalPosts,
          totalSessions,
        },
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve platform overview:', error);
      throw error;
    }
  }

  async getMatchingPerformance(startDate?: string, endDate?: string) {
    try {
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchingMetrics = await this.prisma.matchHistory.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      const totalRecommendations = matchingMetrics.length;
      const successfulMatches = matchingMetrics.filter(
        (m) => m.becameClient,
      ).length;
      const viewedRecommendations = matchingMetrics.filter(
        (m) => m.wasViewed,
      ).length;
      const contactedTherapists = matchingMetrics.filter(
        (m) => m.wasContacted,
      ).length;

      const averageMatchScore =
        totalRecommendations > 0
          ? matchingMetrics.reduce((sum, m) => sum + m.totalScore, 0) /
            totalRecommendations
          : 0;

      const conversionRate =
        totalRecommendations > 0
          ? (successfulMatches / totalRecommendations) * 100
          : 0;

      const clickThroughRate =
        totalRecommendations > 0
          ? (viewedRecommendations / totalRecommendations) * 100
          : 0;

      return {
        period: { start, end },
        metrics: {
          totalRecommendations,
          successfulMatches,
          viewedRecommendations,
          contactedTherapists,
          averageMatchScore,
          conversionRate,
          clickThroughRate,
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve matching performance:', error);
      throw error;
    }
  }

  // ===== CONTENT MODERATION =====

  async getFlaggedContent(params: {
    type?: string;
    page: number;
    limit: number;
  }) {
    try {
      const { type, page, limit } = params;
      const skip = (page - 1) * limit;

      // For now, we'll consider posts and comments that might need moderation
      // In a real system, you'd have a flagging mechanism
      const flaggedPosts = await this.prisma.post.findMany({
        where: {
          // Add conditions for flagged content
          // For now, let's get recent posts that might need review
        },
        skip,
        take: type === 'comment' ? 0 : limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          community: {
            select: {
              name: true,
            },
          },
        },
      });

      const flaggedComments = await this.prisma.comment.findMany({
        where: {
          // Add conditions for flagged content
        },
        skip: type === 'post' ? 0 : skip,
        take: type === 'post' ? 0 : limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          post: {
            select: {
              title: true,
            },
          },
        },
      });

      return {
        posts: flaggedPosts,
        comments: flaggedComments,
        page,
        totalItems: flaggedPosts.length + flaggedComments.length,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve flagged content:', error);
      throw error;
    }
  }

  async moderateContent(
    contentType: string,
    contentId: string,
    adminId: string,
    action: 'approve' | 'remove' | 'flag',
    reason?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        let moderatedContent;

        if (contentType === 'post') {
          if (action === 'remove') {
            moderatedContent = await tx.post.delete({
              where: { id: contentId },
            });
          } else {
            // For approve/flag, we could add moderation status fields
            moderatedContent = await tx.post.findUnique({
              where: { id: contentId },
            });
          }
        } else if (contentType === 'comment') {
          if (action === 'remove') {
            moderatedContent = await tx.comment.delete({
              where: { id: contentId },
            });
          } else {
            moderatedContent = await tx.comment.findUnique({
              where: { id: contentId },
            });
          }
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action:
              contentType === 'post' ? 'MODERATE_POST' : 'MODERATE_COMMENT',
            entityType: contentType,
            entityId: contentId,
            details: {
              contentId,
              contentType,
              moderationAction: action,
              reason,
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { success: true, action, moderatedContent };
      });
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw error;
    }
  }
}
