import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  type CreateAdminDto,
  type UpdateAdminDto,
  type AdminResponseDto,
} from './types/admin.dto';
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
            status: 'APPROVED',
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
        // Audit log removed - not needed for student project

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
            status: 'REJECTED',
            processedByAdminId: adminId,
            processingDate: new Date(),
          },
        });

        // Create audit log
        // Audit log removed - not needed for student project

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
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      const { role, page, limit, search, status, sortBy, sortOrder } = params;
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
      if (status) {
        if (status === 'active') {
          where.isActive = true;
        } else if (status === 'inactive') {
          where.isActive = false;
        } else if (status === 'suspended') {
          where.suspendedAt = { not: null };
        }
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (
        sortBy &&
        ['createdAt', 'firstName', 'lastName', 'email', 'role'].includes(sortBy)
      ) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            emailVerified: true,
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
        // Audit log removed - not needed for student project

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
        // Audit log removed - not needed for student project

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
        this.prisma.therapist.count({ where: { status: 'APPROVED' } }),
        this.prisma.therapist.count({ where: { status: 'PENDING' } }),
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
      // Matching analytics removed - not needed for student project
      // Return basic stats instead
      const totalTherapists = await this.prisma.therapist.count({
        where: { status: 'APPROVED' },
      });
      const totalClients = await this.prisma.client.count();

      return {
        period: {
          start: startDate
            ? new Date(startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date(),
        },
        metrics: {
          totalTherapists,
          totalClients,
          // Simplified metrics without complex tracking
          totalRecommendations: 0,
          successfulMatches: 0,
          viewedRecommendations: 0,
          contactedTherapists: 0,
          averageMatchScore: 0,
          conversionRate: 0,
          clickThroughRate: 0,
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
          room: {
            select: {
              name: true,
              roomGroup: {
                select: {
                  community: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
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
        // Audit log removed - not needed for student project

        return { success: true, action, moderatedContent };
      });
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw error;
    }
  }
}
