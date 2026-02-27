import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalTherapists,
        activeTherapists,
        totalSessions,
        completedSessions,
        totalCommunities,
        totalPosts,
        totalComments,
        pendingReports,
      ] = await Promise.all([
        // Total users
        this.prisma.user.count(),
        
        // Active users in last 30 days
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        // Total approved therapists
        this.prisma.therapist.count({
          where: { status: 'APPROVED' },
        }),
        
        // Active therapists (have had sessions in last 30 days)
        this.prisma.therapist.count({
          where: {
            status: 'APPROVED',
            meetings: {
              some: {
                startTime: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        }),
        
        // Total sessions
        this.prisma.meeting.count(),
        
        // Completed sessions
        this.prisma.meeting.count({
          where: { status: 'COMPLETED' },
        }),
        
        // Total communities
        this.prisma.community.count(),
        
        // Total posts
        this.prisma.post.count(),
        
        // Total comments
        this.prisma.comment.count(),
        
        // Pending reports
        this.prisma.report.count({
          where: { status: 'PENDING' },
        }),
      ]);

      // Calculate average session duration (in minutes)
      const avgSessionDuration = await this.prisma.meeting.aggregate({
        where: {
          status: 'COMPLETED',
          endTime: { not: null },
        },
        _avg: {
          duration: true,
        },
      });

      // Calculate therapist utilization rate
      const therapistUtilizationRate = totalTherapists > 0 
        ? Math.round((activeTherapists / totalTherapists) * 100 * 100) / 100
        : 0;

      // Calculate user retention rate (users who logged in again after first login)
      const usersWithMultipleLogins = await this.prisma.user.count({
        where: {
          lastLoginAt: { not: null },
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Created more than 1 day ago
          },
        },
      });

      const eligibleUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      const userRetentionRate = eligibleUsers > 0 
        ? Math.round((usersWithMultipleLogins / eligibleUsers) * 100 * 100) / 100
        : 0;

      return {
        totalUsers,
        activeUsers,
        totalTherapists,
        activeTherapists,
        totalSessions,
        completedSessions,
        totalCommunities,
        totalPosts,
        totalComments,
        pendingReports,
        averageSessionDuration: avgSessionDuration._avg.duration || 0,
        therapistUtilizationRate,
        userRetentionRate,
      };
    } catch (error) {
      this.logger.error('Failed to get system stats:', error);
      throw error;
    }
  }

  async getUserGrowth(startDate?: string, endDate?: string) {
    try {
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // Get daily user registrations
      const userGrowthData = await this.prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt")
      `;

      // Calculate growth rate
      const totalNewUsers = userGrowthData.reduce((sum, day) => sum + Number(day.count), 0);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const dailyAverage = totalNewUsers / daysDiff;

      // Get previous period for comparison
      const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
      const previousPeriodUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: previousStart,
            lt: start,
          },
        },
      });

      const growthRate = previousPeriodUsers > 0 
        ? Math.round(((totalNewUsers - previousPeriodUsers) / previousPeriodUsers) * 100 * 100) / 100
        : 0;

      return {
        newUsers: userGrowthData.map(item => ({
          date: item.date,
          count: Number(item.count),
        })),
        totalGrowth: totalNewUsers,
        growthRate,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Failed to get user growth:', error);
      throw error;
    }
  }

  async getEngagement(startDate?: string, endDate?: string) {
    try {
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const [
        totalMessages,
        avgSessionsPerUser,
        worksheetCompletionRate,
        avgCommunityPostsPerDay,
        avgRating,
        avgResponseTime,
      ] = await Promise.all([
        // Total messages in period
        this.prisma.message.count({
          where: {
            createdAt: { gte: start, lte: end },
          },
        }),
        
        // Average sessions per user
        this.getAverageSessionsPerUser(start, end),
        
        // Worksheet completion rate
        this.getWorksheetCompletionRate(),
        
        // Average community posts per day
        this.getAverageCommunityPostsPerDay(start, end),
        
        // Average therapist rating
        this.getAverageTherapistRating(),
        
        // Average response time (mock for now)
        Promise.resolve(8.2),
      ]);

      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const averageMessagesPerDay = Math.round((totalMessages / daysDiff) * 100) / 100;

      return {
        averageSessionsPerUser: avgSessionsPerUser,
        averageMessagesPerDay,
        worksheetCompletionRate,
        communityPostsPerDay: avgCommunityPostsPerDay,
        averageRating: avgRating,
        responseTime: avgResponseTime,
      };
    } catch (error) {
      this.logger.error('Failed to get engagement data:', error);
      throw error;
    }
  }

  private async getAverageSessionsPerUser(start: Date, end: Date): Promise<number> {
    const totalSessions = await this.prisma.meeting.count({
      where: {
        startTime: { gte: start, lte: end },
        status: 'COMPLETED',
      },
    });

    const uniqueUsers = await this.prisma.meeting.findMany({
      where: {
        startTime: { gte: start, lte: end },
        status: 'COMPLETED',
      },
      select: { clientId: true },
      distinct: ['clientId'],
    });

    return uniqueUsers.length > 0 
      ? Math.round((totalSessions / uniqueUsers.length) * 100) / 100
      : 0;
  }

  private async getWorksheetCompletionRate(): Promise<number> {
    const [completedWorksheets, totalWorksheets] = await Promise.all([
      this.prisma.worksheet.count({
        where: { status: { in: ['SUBMITTED', 'REVIEWED'] } },
      }),
      this.prisma.worksheet.count(),
    ]);

    return totalWorksheets > 0 
      ? Math.round((completedWorksheets / totalWorksheets) * 100 * 100) / 100
      : 0;
  }

  private async getAverageCommunityPostsPerDay(start: Date, end: Date): Promise<number> {
    const totalPosts = await this.prisma.post.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.round((totalPosts / daysDiff) * 100) / 100;
  }

  private async getAverageTherapistRating(): Promise<number> {
    const avgRating = await this.prisma.review.aggregate({
      _avg: { rating: true },
    });

    return avgRating._avg.rating 
      ? Math.round(avgRating._avg.rating * 100) / 100
      : 0;
  }

  async getPlatformOverview() {
    try {
      const [
        totalUsers,
        totalTherapists,
        totalSessions,
        totalCommunities,
        totalPosts,
        pendingApplications,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.therapist.count({ where: { status: 'APPROVED' } }),
        this.prisma.meeting.count(),
        this.prisma.community.count(),
        this.prisma.post.count(),
        this.prisma.therapist.count({ where: { status: 'PENDING' } }),
      ]);

      // Get recent activity
      const recentUsers = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      const recentSessions = await this.prisma.meeting.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { startTime: 'desc' },
        take: 5,
        select: {
          id: true,
          startTime: true,
          duration: true,
          client: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });

      return {
        overview: {
          totalUsers,
          totalTherapists,
          totalSessions,
          totalCommunities,
          totalPosts,
          pendingApplications,
        },
        recentActivity: {
          recentUsers,
          recentSessions,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get platform overview:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole,
      ] = await Promise.all([
        this.prisma.user.count(),
        
        this.prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),

        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
      ]);

      const roleBreakdown = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        therapists: roleBreakdown.therapist || 0,
        clients: roleBreakdown.client || 0,
        admins: roleBreakdown.admin || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get user stats:', error);
      throw error;
    }
  }
}