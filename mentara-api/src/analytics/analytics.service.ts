import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

      const [
        totalUsers,
        newUsers,
        totalTherapists,
        newTherapists,
        totalMeetings,
        completedMeetings,
        totalPosts,
        newPosts,
        totalCommunities,
        activeCommunities,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: whereDate }),
        this.prisma.therapist.count({ where: { status: 'APPROVED' } }),
        this.prisma.therapist.count({
          where: {
            status: 'APPROVED',
            ...whereDate,
          },
        }),
        this.prisma.meeting.count(),
        this.prisma.meeting.count({ where: { status: 'COMPLETED' } }),
        this.prisma.post.count(),
        this.prisma.post.count({ where: whereDate }),
        this.prisma.community.count(),
        this.prisma.community.count({
          where: {
            roomGroups: {
              some: {
                rooms: {
                  some: {
                    posts: {
                      some: whereDate,
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

      const userGrowth = await this.getUserGrowthStats(startDate, endDate);
      const engagementStats = await this.getEngagementStats(startDate, endDate);
      const sessionStats = await this.getSessionStats(startDate, endDate);

      return {
        overview: {
          totalUsers,
          newUsers,
          totalTherapists,
          newTherapists,
          totalMeetings,
          completedMeetings,
          meetingCompletionRate:
            totalMeetings > 0 ? (completedMeetings / totalMeetings) * 100 : 0,
          totalPosts,
          newPosts,
          totalCommunities,
          activeCommunities,
        },
        userGrowth,
        engagement: engagementStats,
        sessions: sessionStats,
      };
    } catch (error) {
      this.logger.error(`Failed to get platform analytics: ${String(error)}`);
      throw new InternalServerErrorException(
        'Failed to retrieve platform analytics',
      );
    }
  }

  async getUserGrowthStats(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

      const usersByRole = await this.prisma.user.groupBy({
        by: ['role'],
        where: whereDate,
        _count: { role: true },
      });

      const monthlyGrowth = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count,
          role
        FROM "User"
        ${whereDate.createdAt ? 'WHERE "createdAt" >= $1 AND "createdAt" <= $2' : ''}
        GROUP BY month, role
        ORDER BY month DESC
        LIMIT 12
      `;

      return {
        byRole: usersByRole,
        monthlyGrowth,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get user growth stats: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getEngagementStats(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

      const [
        totalPosts,
        totalComments,
        totalHearts,
        activeCommunities,
        activeUsers,
      ] = await Promise.all([
        this.prisma.post.count({ where: whereDate }),
        this.prisma.comment.count({ where: whereDate }),
        this.prisma.postHeart.count({ where: whereDate }),
        this.prisma.community.count({
          where: {
            roomGroups: {
              some: {
                rooms: {
                  some: {
                    posts: {
                      some: whereDate,
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.user.count({
          where: {
            OR: [
              { posts: { some: whereDate } },
              { comments: { some: whereDate } },
              { postHearts: { some: whereDate } },
            ],
          },
        }),
      ]);

      const topCommunities = await this.prisma.community.findMany({
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: {
          memberships: {
            _count: 'desc',
          },
        },
        take: 10,
      });

      return {
        overview: {
          totalPosts,
          totalComments,
          totalHearts,
          activeCommunities,
          activeUsers,
          engagementRate:
            activeUsers > 0
              ? (totalPosts + totalComments + totalHearts) / activeUsers
              : 0,
        },
        topCommunities,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get engagement stats: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getSessionStats(startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { startTime: dateFilter } : {};

      const [
        totalSessions,
        completedSessions,
        averageDuration,
        sessionsByType,
      ] = await Promise.all([
        this.prisma.meeting.count({ where: whereDate }),
        this.prisma.meeting.count({
          where: { ...whereDate, status: 'COMPLETED' },
        }),
        this.prisma.meeting.aggregate({
          where: { ...whereDate, status: 'COMPLETED' },
          _avg: { duration: true },
        }),
        this.prisma.meeting.groupBy({
          by: ['meetingType'],
          where: whereDate,
          _count: { meetingType: true },
        }),
      ]);

      const therapistPerformance = await this.prisma.meeting.groupBy({
        by: ['therapistId'],
        where: { ...whereDate, status: 'COMPLETED' },
        _count: { therapistId: true },
        orderBy: { _count: { therapistId: 'desc' } },
        take: 10,
      });

      return {
        overview: {
          totalSessions,
          completedSessions,
          completionRate:
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
          averageDuration: averageDuration._avg.duration || 0,
        },
        sessionsByType,
        topTherapists: therapistPerformance,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get session stats: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTherapistAnalytics(
    therapistId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { startTime: dateFilter } : {};

      const [
        totalClients,
        activeSessions,
        completedSessions,
        averageRating,
        worksheetsAssigned,
        worksheetsCompleted,
      ] = await Promise.all([
        this.prisma.clientTherapist.count({
          where: { therapistId, status: 'ACTIVE' },
        }),
        this.prisma.meeting.count({
          where: { therapistId, ...whereDate },
        }),
        this.prisma.meeting.count({
          where: { therapistId, status: 'COMPLETED', ...whereDate },
        }),
        this.prisma.review.aggregate({
          where: { 
            therapistId, 
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {})
          },
          _avg: { rating: true },
        }),
        this.prisma.worksheet.count({
          where: {
            therapistId,
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
        this.prisma.worksheet.count({
          where: {
            therapistId,
            status: 'SUBMITTED',
            ...(startDate || endDate
              ? {
                  updatedAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
      ]);

      // Get recent client activities instead of therapy progress
      const recentClientActivities = await this.prisma.clientTherapist.findMany({
        where: {
          therapistId,
          status: 'ACTIVE',
        },
        include: {
          client: {
            include: { 
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
        take: 10,
      });

      return {
        overview: {
          totalClients,
          activeSessions,
          completedSessions,
          sessionCompletionRate:
            activeSessions > 0 ? (completedSessions / activeSessions) * 100 : 0,
          averageRating: averageRating._avg.rating || 0,
          worksheetsAssigned,
          worksheetsCompleted,
          worksheetCompletionRate:
            worksheetsAssigned > 0
              ? (worksheetsCompleted / worksheetsAssigned) * 100
              : 0,
        },
        recentClients: recentClientActivities,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get therapist analytics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getClientAnalytics(clientId: string, startDate?: Date, endDate?: Date) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter['gte'] = startDate;
      if (endDate) dateFilter['lte'] = endDate;

      const whereDate =
        Object.keys(dateFilter).length > 0 ? { startTime: dateFilter } : {};

      const [
        totalSessions,
        completedSessions,
        averageSessionRating,
        worksheetsAssigned,
        worksheetsCompleted,
        communityPosts,
        communityEngagement,
      ] = await Promise.all([
        this.prisma.meeting.count({
          where: { clientId, ...whereDate },
        }),
        this.prisma.meeting.count({
          where: { clientId, status: 'COMPLETED', ...whereDate },
        }),
        this.prisma.review.aggregate({
          where: { 
            clientId, 
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {})
          },
          _avg: { rating: true },
        }),
        this.prisma.worksheet.count({
          where: {
            clientId,
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
        this.prisma.worksheet.count({
          where: {
            clientId,
            status: 'SUBMITTED',
            ...(startDate || endDate
              ? {
                  updatedAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
        this.prisma.post.count({
          where: {
            userId: clientId,
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
        this.prisma.comment.count({
          where: {
            userId: clientId,
            ...(startDate || endDate
              ? {
                  createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
      ]);

      // Get recent activity history instead of therapy progress
      const recentActivityHistory = await this.prisma.worksheet.findMany({
        where: {
          clientId,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {}),
        },
        include: {
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          },
          submission: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return {
        overview: {
          totalSessions,
          completedSessions,
          sessionCompletionRate:
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
          averageSessionRating: averageSessionRating._avg.rating || 0,
          worksheetsAssigned,
          worksheetsCompleted,
          worksheetCompletionRate:
            worksheetsAssigned > 0
              ? (worksheetsCompleted / worksheetsAssigned) * 100
              : 0,
          communityPosts,
          communityEngagement,
        },
        recentActivity: recentActivityHistory,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get client analytics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
