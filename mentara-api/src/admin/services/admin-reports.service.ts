import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { ReportStatus } from '@prisma/client';

interface ReportFilters {
  type?: 'post' | 'comment' | 'user';
  status?: 'pending' | 'reviewed' | 'dismissed';
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);

  constructor(private prisma: PrismaService) {}

  async getReports(filters: ReportFilters) {
    try {
      const { type, status, page, limit, search } = filters;
      const skip = (page - 1) * limit;

      // Build where conditions
      const where: any = {};

      if (status) {
        where.status = status.toUpperCase() as ReportStatus;
      }

      if (search) {
        where.OR = [
          { reason: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { reporter: { firstName: { contains: search, mode: 'insensitive' } } },
          { reporter: { lastName: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Filter by type
      if (type === 'post') {
        where.postId = { not: null };
        where.commentId = null;
      } else if (type === 'comment') {
        where.commentId = { not: null };
        where.postId = null;
      }

      const reports = await this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
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
          },
          comment: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
              post: {
                select: {
                  id: true,
                  title: true,
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
              },
            },
          },
        },
      });

      const totalCount = await this.prisma.report.count({ where });

      // Transform data to match frontend expectations
      const transformedReports = reports.map((report) => {
        const baseReport = {
          id: report.id,
          reason: report.reason,
          description: report.content || '',
          dateReported: report.createdAt.toISOString(),
          status: report.status.toLowerCase(),
          reporterName: `${report.reporter.firstName} ${report.reporter.lastName}`,
          reporterId: report.reporter.id,
        };

        if (report.post) {
          return {
            ...baseReport,
            type: 'post' as const,
            reportedItemId: report.post.id,
            content: report.post.content,
            postTitle: report.post.title,
            reportedUserName: `${report.post.user.firstName} ${report.post.user.lastName}`,
            reportedUserId: report.post.user.id,
            reportedUserIsTherapist: report.post.user.role === 'therapist',
            community: report.post.room?.roomGroup?.community?.name || 'General',
          };
        } else if (report.comment) {
          return {
            ...baseReport,
            type: 'comment' as const,
            reportedItemId: report.comment.id,
            content: report.comment.content,
            postTitle: report.comment.post.title,
            reportedUserName: `${report.comment.user.firstName} ${report.comment.user.lastName}`,
            reportedUserId: report.comment.user.id,
            reportedUserIsTherapist: report.comment.user.role === 'therapist',
            community: report.comment.post.room?.roomGroup?.community?.name || 'General',
          };
        }

        // For user reports (if implemented later)
        return {
          ...baseReport,
          type: 'user' as const,
          reportedItemId: report.reporterId, // This would need to be adjusted for actual user reports
          content: '',
          reportedUserName: 'Unknown User',
          reportedUserId: report.reporterId,
          reportedUserIsTherapist: false,
        };
      });

      return {
        reports: transformedReports,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to retrieve reports:', error);
      throw error;
    }
  }

  async getReportById(reportId: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id: reportId },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              email: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  email: true,
                  isActive: true,
                  suspendedAt: true,
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
          },
          comment: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  email: true,
                  isActive: true,
                  suspendedAt: true,
                },
              },
              post: {
                select: {
                  id: true,
                  title: true,
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
              },
            },
          },
        },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      // Transform to match frontend expectations
      const baseReport = {
        id: report.id,
        reason: report.reason,
        description: report.content || '',
        dateReported: report.createdAt.toISOString(),
        status: report.status.toLowerCase(),
        reporterName: `${report.reporter.firstName} ${report.reporter.lastName}`,
        reporterId: report.reporter.id,
        reporterEmail: report.reporter.email,
      };

      if (report.post) {
        return {
          ...baseReport,
          type: 'post' as const,
          reportedItemId: report.post.id,
          content: report.post.content,
          postTitle: report.post.title,
          reportedUserName: `${report.post.user.firstName} ${report.post.user.lastName}`,
          reportedUserId: report.post.user.id,
          reportedUserEmail: report.post.user.email,
          reportedUserIsTherapist: report.post.user.role === 'therapist',
          reportedUserIsActive: report.post.user.isActive,
          reportedUserIsSuspended: !!report.post.user.suspendedAt,
          community: report.post.room?.roomGroup?.community?.name || 'General',
          postCreatedAt: report.post.createdAt.toISOString(),
        };
      } else if (report.comment) {
        return {
          ...baseReport,
          type: 'comment' as const,
          reportedItemId: report.comment.id,
          content: report.comment.content,
          postTitle: report.comment.post.title,
          reportedUserName: `${report.comment.user.firstName} ${report.comment.user.lastName}`,
          reportedUserId: report.comment.user.id,
          reportedUserEmail: report.comment.user.email,
          reportedUserIsTherapist: report.comment.user.role === 'therapist',
          reportedUserIsActive: report.comment.user.isActive,
          reportedUserIsSuspended: !!report.comment.user.suspendedAt,
          community: report.comment.post.room?.roomGroup?.community?.name || 'General',
          commentCreatedAt: report.comment.createdAt.toISOString(),
        };
      }

      return baseReport;
    } catch (error) {
      this.logger.error(`Failed to retrieve report ${reportId}:`, error);
      throw error;
    }
  }

  async updateReportStatus(
    reportId: string,
    status: 'reviewed' | 'dismissed',
    adminId: string,
    reason?: string,
  ) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      const updatedReport = await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: status.toUpperCase() as ReportStatus,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `Report ${reportId} status updated to ${status} by admin ${adminId}`,
      );

      return {
        success: true,
        reportId,
        status: status,
        updatedAt: updatedReport.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to update report ${reportId} status:`, error);
      throw error;
    }
  }

  async handleReportAction(
    reportId: string,
    action: 'ban_user' | 'restrict_user' | 'delete_content' | 'dismiss',
    adminId: string,
    reason?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const report = await tx.report.findUnique({
          where: { id: reportId },
          include: {
            post: {
              select: {
                id: true,
                userId: true,
              },
            },
            comment: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        });

        if (!report) {
          throw new NotFoundException(`Report with ID ${reportId} not found`);
        }

        const reportedUserId = report.post?.userId || report.comment?.userId;
        let actionResult: any = { success: true, action };

        switch (action) {
          case 'ban_user':
            if (reportedUserId) {
              await tx.user.update({
                where: { id: reportedUserId },
                data: {
                  isActive: false,
                  deactivatedAt: new Date(),
                  deactivatedBy: adminId,
                  deactivationReason: reason || 'Banned due to reported content',
                },
              });
              actionResult.userBanned = true;
            }
            // Update report status to REVIEWED
            await tx.report.update({
              where: { id: reportId },
              data: { status: 'REVIEWED', updatedAt: new Date() },
            });
            break;

          case 'restrict_user':
            if (reportedUserId) {
              await tx.user.update({
                where: { id: reportedUserId },
                data: {
                  suspendedAt: new Date(),
                  suspendedBy: adminId,
                  suspensionReason: reason || 'Suspended due to reported content',
                },
              });
              actionResult.userRestricted = true;
            }
            // Update report status to REVIEWED
            await tx.report.update({
              where: { id: reportId },
              data: { status: 'REVIEWED', updatedAt: new Date() },
            });
            break;

          case 'delete_content':
            if (report.postId) {
              await tx.post.delete({ where: { id: report.postId } });
              actionResult.contentDeleted = true;
              actionResult.contentType = 'post';
            } else if (report.commentId) {
              await tx.comment.delete({ where: { id: report.commentId } });
              actionResult.contentDeleted = true;
              actionResult.contentType = 'comment';
            }
            // Update report status to REVIEWED
            await tx.report.update({
              where: { id: reportId },
              data: { status: 'REVIEWED', updatedAt: new Date() },
            });
            break;

          case 'dismiss':
            // Update report status to DISMISSED
            await tx.report.update({
              where: { id: reportId },
              data: { status: 'DISMISSED', updatedAt: new Date() },
            });
            actionResult.dismissed = true;
            break;

          default:
            throw new BadRequestException(`Invalid action: ${action}`);
        }

        this.logger.log(
          `Report ${reportId} action ${action} completed by admin ${adminId}`,
        );

        return actionResult;
      });
    } catch (error) {
      this.logger.error(`Failed to handle report ${reportId} action:`, error);
      throw error;
    }
  }

  async getReportsOverview() {
    try {
      const [totalReports, pendingReports, reviewedReports, dismissedReports] =
        await Promise.all([
          this.prisma.report.count(),
          this.prisma.report.count({ where: { status: 'PENDING' } }),
          this.prisma.report.count({ where: { status: 'REVIEWED' } }),
          this.prisma.report.count({ where: { status: 'DISMISSED' } }),
        ]);

      const recentReports = await this.prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      return {
        total: totalReports,
        pending: pendingReports,
        reviewed: reviewedReports,
        dismissed: dismissedReports,
        recentWeek: recentReports,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve reports overview:', error);
      throw error;
    }
  }
}