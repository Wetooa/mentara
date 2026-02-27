import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { type UpdateAdminDto, type AdminResponseDto } from './types/admin.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit = 100, offset = 0): Promise<AdminResponseDto[]> {
    try {
      const admins = await this.prisma.admin.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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

  // ===== USER MANAGEMENT =====
  // Note: Therapist application management moved to AdminTherapistService

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
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            suspendedAt: new Date(),
            suspendedBy: adminId,
            suspensionReason: reason,
            isActive: false,
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

  // Note: getMatchingPerformance removed - was returning fake/zero data
  // Use AdminAnalyticsService for actual analytics instead

  // ===== CONTENT MODERATION =====
  // Note: getFlaggedContent removed - incomplete implementation with empty WHERE clauses
  // Use AdminReportsService for actual content moderation instead

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

        return { success: true, action, moderatedContent };
      });
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw error;
    }
  }
}
