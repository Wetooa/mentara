import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class AnalyticsService {
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
        this.prisma.therapist.count({ where: { status: 'approved' } }),
        this.prisma.therapist.count({
          where: {
            status: 'approved',
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
      throw new Error(
        `Failed to get platform analytics: ${error instanceof Error ? error.message : String(error)}`,
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
      throw new Error(
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
      throw new Error(
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
        this.prisma.sessionLog.count({ where: whereDate }),
        this.prisma.sessionLog.count({
          where: { ...whereDate, status: 'COMPLETED' },
        }),
        this.prisma.sessionLog.aggregate({
          where: { ...whereDate, status: 'COMPLETED' },
          _avg: { duration: true },
        }),
        this.prisma.sessionLog.groupBy({
          by: ['sessionType'],
          where: whereDate,
          _count: { sessionType: true },
        }),
      ]);

      const therapistPerformance = await this.prisma.sessionLog.groupBy({
        by: ['therapistId'],
        where: { ...whereDate, status: 'COMPLETED' },
        _count: { therapistId: true },
        _avg: { quality: true },
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
      throw new Error(
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
          where: { therapistId, status: 'active' },
        }),
        this.prisma.sessionLog.count({
          where: { therapistId, ...whereDate },
        }),
        this.prisma.sessionLog.count({
          where: { therapistId, status: 'COMPLETED', ...whereDate },
        }),
        this.prisma.sessionLog.aggregate({
          where: { therapistId, status: 'COMPLETED', ...whereDate },
          _avg: { quality: true },
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
            isCompleted: true,
            ...(startDate || endDate
              ? {
                  submittedAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                  },
                }
              : {}),
          },
        }),
      ]);

      const clientProgress = await this.prisma.therapyProgress.findMany({
        where: {
          therapistId,
          ...(startDate || endDate
            ? {
                assessmentDate: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {}),
        },
        include: {
          client: {
            include: { user: true },
          },
        },
        orderBy: { assessmentDate: 'desc' },
        take: 10,
      });

      return {
        overview: {
          totalClients,
          activeSessions,
          completedSessions,
          sessionCompletionRate:
            activeSessions > 0 ? (completedSessions / activeSessions) * 100 : 0,
          averageRating: averageRating._avg.quality || 0,
          worksheetsAssigned,
          worksheetsCompleted,
          worksheetCompletionRate:
            worksheetsAssigned > 0
              ? (worksheetsCompleted / worksheetsAssigned) * 100
              : 0,
        },
        recentProgress: clientProgress,
      };
    } catch (error) {
      throw new Error(
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
        this.prisma.sessionLog.count({
          where: { clientId, ...whereDate },
        }),
        this.prisma.sessionLog.count({
          where: { clientId, status: 'COMPLETED', ...whereDate },
        }),
        this.prisma.sessionLog.aggregate({
          where: { clientId, status: 'COMPLETED', ...whereDate },
          _avg: { quality: true },
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
            isCompleted: true,
            ...(startDate || endDate
              ? {
                  submittedAt: {
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

      const progressHistory = await this.prisma.therapyProgress.findMany({
        where: {
          clientId,
          ...(startDate || endDate
            ? {
                assessmentDate: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {}),
        },
        orderBy: { assessmentDate: 'desc' },
        take: 10,
      });

      return {
        overview: {
          totalSessions,
          completedSessions,
          sessionCompletionRate:
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
          averageSessionRating: averageSessionRating._avg.quality || 0,
          worksheetsAssigned,
          worksheetsCompleted,
          worksheetCompletionRate:
            worksheetsAssigned > 0
              ? (worksheetsCompleted / worksheetsAssigned) * 100
              : 0,
          communityPosts,
          communityEngagement,
        },
        progressHistory,
      };
    } catch (error) {
      throw new Error(
        `Failed to get client analytics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
