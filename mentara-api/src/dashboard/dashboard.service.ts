import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { MessagingService } from '../messaging/messaging.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly cache: CacheService,
  ) {}

  async getClientDashboardData(userId: string) {
    try {
      // Check cache first
      const cacheKey = this.cache.generateKey('dashboard', 'client', userId);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const client = await this.prisma.client.findUnique({
        where: { userId },
        include: {
          user: true,
          assignedTherapists: {
            include: {
              therapist: {
                include: { user: true },
              },
            },
          },
          meetings: {
            where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
            orderBy: { startTime: 'asc' },
            take: 5,
            include: {
              therapist: {
                include: { user: true },
              },
            },
          },
          worksheets: {
            where: { status: { in: ['ASSIGNED', 'OVERDUE'] } },
            orderBy: { dueDate: 'asc' },
            take: 5,
            include: {
              therapist: {
                include: { user: true },
              },
            },
          },
          preAssessment: true,
        },
      });

      if (!client) {
        throw new NotFoundException(`Client not found for userId: ${userId}`);
      }

      // Validate that client has user relationship
      if (!client.user) {
        throw new InternalServerErrorException(
          `Client found but user relationship is missing for userId: ${userId}`,
        );
      }

      // PERFORMANCE FIX: Run count queries in parallel instead of sequentially
      const [completedMeetingsCount, completedWorksheetsCount] =
        await Promise.all([
          this.prisma.meeting.count({
            where: { clientId: userId, status: 'COMPLETED' },
          }),
          this.prisma.worksheet.count({
            where: {
              clientId: userId,
              status: { in: ['SUBMITTED', 'REVIEWED'] },
            },
          }),
        ]);

      const recentPosts = await this.prisma.post.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          room: {
            include: {
              roomGroup: {
                include: {
                  community: true,
                },
              },
            },
          },
          _count: {
            select: { hearts: true, comments: true },
          },
        },
      });

      // PERFORMANCE FIX: Removed conversation creation loop from dashboard
      // This was causing N+1 queries (2-5 second delay)
      // TODO: Move to background job or separate endpoint if needed
      // for (const assignment of client.assignedTherapists) {
      //   const therapistId = assignment.therapist.userId;
      //   try {
      //     const existingConversations =
      //       await this.messagingService.getUserConversations(userId, 1, 100);
      //     const hasConversationWithTherapist = existingConversations.some(
      //       (conv) => conv.participants?.some((p) => p.userId === therapistId),
      //     );
      //     if (!hasConversationWithTherapist) {
      //       await this.messagingService.createConversation(userId, {
      //         participantIds: [therapistId],
      //         type: 'direct',
      //         title: `Therapy Session with ${assignment.therapist.user.firstName} ${assignment.therapist.user.lastName}`,
      //       });
      //     }
      //   } catch (error) {
      //     console.warn(`⚠️ Failed to ensure conversation exists:`, error);
      //   }
      // }

      const responseData = {
        client,
        stats: {
          completedMeetings: completedMeetingsCount,
          completedWorksheets: completedWorksheetsCount,
          upcomingMeetings: client.meetings.length,
          pendingWorksheets: client.worksheets.length,
        },
        upcomingMeetings: client.meetings,
        pendingWorksheets: client.worksheets,
        assignedTherapists: client.assignedTherapists.map((ct) => ct.therapist),
        recentActivity: recentPosts,
        hasPreAssessment: !!client.preAssessment,
      };

      // Cache the result for 5 minutes
      await this.cache.set(cacheKey, responseData, 300);

      return responseData;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get user dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTherapistDashboardData(userId: string) {
    console.log(
      `🔍 [DashboardService] Getting therapist dashboard data for userId: ${userId}`,
    );

    try {
      // Check cache first
      const cacheKey = this.cache.generateKey('dashboard', 'therapist', userId);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      // First, verify the user exists and check their role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        console.error(`❌ [DashboardService] User not found: ${userId}`);
        throw new NotFoundException(`User not found: ${userId}`);
      }

      console.log(
        `📋 [DashboardService] User found: ${user.email} (${user.firstName} ${user.lastName}), role: ${user.role}, active: ${user.isActive}`,
      );

      if (user.role !== 'therapist') {
        console.error(
          `❌ [DashboardService] User ${user.email} has role '${user.role}', expected 'therapist'`,
        );
        throw new NotFoundException(
          `User ${user.email} does not have therapist role. Current role: ${user.role}`,
        );
      }

      if (!user.isActive) {
        console.error(`❌ [DashboardService] User ${user.email} is not active`);
        throw new NotFoundException(`User ${user.email} is not active`);
      }

      // Now attempt to find the therapist record
      console.log(
        `🔍 [DashboardService] Looking for Therapist record for userId: ${userId}`,
      );

      const therapist = await this.prisma.therapist.findUnique({
        where: { userId },
        include: {
          user: true,
          assignedClients: {
            include: {
              client: {
                include: { user: true },
              },
            },
          },
          meetings: {
            where: {
              status: { in: ['SCHEDULED', 'CONFIRMED'] },
              startTime: { gte: new Date() },
            },
            orderBy: { startTime: 'asc' },
            take: 10,
            include: {
              client: {
                include: { user: true },
              },
            },
          },
          worksheets: {
            where: { status: { in: ['ASSIGNED', 'OVERDUE'] } },
            orderBy: { dueDate: 'asc' },
            take: 10,
            include: {
              client: {
                include: { user: true },
              },
            },
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!therapist) {
        console.error(
          `❌ [DashboardService] Therapist record not found for user: ${user.email} (${userId})`,
        );
        console.error(
          `❌ [DashboardService] User has role 'therapist' but missing Therapist table record`,
        );

        // Additional diagnostic information
        const allTherapistRecords = await this.prisma.therapist.count();
        console.log(
          `📊 [DashboardService] Total Therapist records in database: ${allTherapistRecords}`,
        );

        throw new NotFoundException(
          `Therapist record not found for user ${user.email} (${userId}). ` +
            `User has role 'therapist' but is missing corresponding Therapist table record. ` +
            `This indicates a data consistency issue that needs to be resolved.`,
        );
      }

      console.log(
        `✅ [DashboardService] Therapist record found: ${therapist.user.email}, status: ${therapist.status}`,
      );

      // PERFORMANCE FIX: Run count queries in parallel instead of sequentially
      const [
        totalClientsCount,
        completedMeetingsCount,
        newClientRequestsCount,
      ] = await Promise.all([
        this.prisma.clientTherapist.count({
          where: { therapistId: userId, status: 'active' },
        }),
        this.prisma.meeting.count({
          where: { therapistId: userId, status: 'COMPLETED' },
        }),
        this.prisma.clientTherapist.count({
          where: {
            therapistId: userId,
            assignedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
            },
          },
        }),
      ]);

      // Get today's and this week's schedule
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

      // PERFORMANCE FIX: Run meeting queries in parallel
      const [todayMeetings, thisWeekMeetings] = await Promise.all([
        this.prisma.meeting.findMany({
          where: {
            therapistId: userId,
            startTime: { gte: startOfDay, lte: endOfDay },
            status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          },
          select: {
            // PERFORMANCE FIX: Use select instead of include
            id: true,
            startTime: true,
            endTime: true,
            meetingType: true,
            status: true,
            client: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { startTime: 'asc' },
        }),
        this.prisma.meeting.findMany({
          where: {
            therapistId: userId,
            startTime: { gte: startOfWeek, lte: endOfWeek },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          select: {
            // PERFORMANCE FIX: Use select instead of include
            id: true,
            startTime: true,
            meetingType: true,
            client: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { startTime: 'asc' },
        }),
      ]);

      // Calculate earnings
      const thisMonth = new Date();
      const startOfMonth = new Date(
        thisMonth.getFullYear(),
        thisMonth.getMonth(),
        1,
      );
      const lastMonth = new Date(
        thisMonth.getFullYear(),
        thisMonth.getMonth() - 1,
        1,
      );
      const startOfLastMonth = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth(),
        1,
      );
      const endOfLastMonth = new Date(
        thisMonth.getFullYear(),
        thisMonth.getMonth(),
        0,
      );

      // PERFORMANCE FIX: Use SQL aggregation instead of loading all payments
      // Old code was loading 1000s of payment records and reducing in JavaScript (1-4 second delay)
      const [
        thisMonthPaymentsSum,
        lastMonthPaymentsSum,
        allPaymentsSum,
        pendingPaymentsSum,
      ] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            meeting: { therapistId: userId },
            status: 'COMPLETED',
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            meeting: { therapistId: userId },
            status: 'COMPLETED',
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            meeting: { therapistId: userId },
            status: 'COMPLETED',
          },
          _sum: { amount: true },
        }),
        this.prisma.payment.aggregate({
          where: {
            meeting: { therapistId: userId },
            status: 'PENDING',
          },
          _sum: { amount: true },
        }),
      ]);

      const thisMonthEarnings = parseFloat(
        thisMonthPaymentsSum._sum.amount?.toString() || '0',
      );
      const lastMonthEarnings = parseFloat(
        lastMonthPaymentsSum._sum.amount?.toString() || '0',
      );
      const totalEarnings = parseFloat(
        allPaymentsSum._sum.amount?.toString() || '0',
      );
      const pendingPayouts = parseFloat(
        pendingPaymentsSum._sum.amount?.toString() || '0',
      );

      const earningsPercentageChange =
        lastMonthEarnings > 0
          ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
          : 0;

      // Calculate performance metrics
      const averageRating =
        therapist.reviews.length > 0
          ? therapist.reviews.reduce((sum, review) => sum + review.rating, 0) /
            therapist.reviews.length
          : 0;

      const totalSessions = await this.prisma.meeting.count({
        where: { therapistId: userId },
      });

      const completedSessions = await this.prisma.meeting.count({
        where: { therapistId: userId, status: 'COMPLETED' },
      });

      const sessionCompletionRate =
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // PERFORMANCE FIX: Removed expensive response time calculation
      // Old code loaded ALL conversations with 50 messages each, then nested loops (3-8 second delay!)
      // TODO: Calculate this periodically in background job and cache, or use SQL window functions
      const averageResponseTime = 0; // Placeholder - implement in analytics service

      // REMOVED for performance:
      // const conversations = await this.prisma.conversation.findMany({
      //   where: { participants: { some: { userId: userId } } },
      //   include: { messages: { orderBy: { createdAt: 'desc' }, take: 50 } },
      // });
      // ... nested loop calculation ...

      // Get recent client data
      const recentClients = await this.prisma.clientTherapist.findMany({
        where: { therapistId: userId, status: 'active' },
        include: {
          client: {
            include: {
              user: true,
              meetings: {
                where: { therapistId: userId },
                orderBy: { startTime: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
        take: 5,
      });

      console.log(
        `📊 [DashboardService] Dashboard stats for ${therapist.user.email}: clients=${totalClientsCount}, completed_meetings=${completedMeetingsCount}`,
      );

      const dashboardData = {
        therapist: {
          id: therapist.user.id,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          avatarUrl: therapist.user.avatarUrl || '',
          approvalStatus: therapist.status,
          joinDate: therapist.createdAt.toISOString(),
          specializations: therapist.areasOfExpertise || [],
        },
        patients: {
          active: totalClientsCount,
          total: totalClientsCount,
          newRequests: newClientRequestsCount,
          recent: recentClients.map((ct) => ({
            id: ct.client.user.id,
            firstName: ct.client.user.firstName,
            lastName: ct.client.user.lastName,
            avatarUrl: ct.client.user.avatarUrl || '',
            lastSessionDate:
              ct.client.meetings[0]?.startTime?.toISOString() || null,
            nextSessionDate:
              therapist.meetings
                .find((m) => m.clientId === ct.client.userId)
                ?.startTime?.toISOString() || null,
            status: ct.status,
          })),
        },
        schedule: {
          today: todayMeetings.map((meeting) => ({
            id: meeting.id,
            patientName: `${meeting.client.user.firstName} ${meeting.client.user.lastName}`,
            startTime: meeting.startTime.toISOString(),
            endTime: meeting.endTime?.toISOString() || '',
            type: meeting.meetingType,
            status: meeting.status,
          })),
          thisWeek: thisWeekMeetings.map((meeting) => ({
            id: meeting.id,
            patientName: `${meeting.client.user.firstName} ${meeting.client.user.lastName}`,
            date: meeting.startTime.toISOString().split('T')[0],
            startTime: meeting.startTime.toISOString(),
            type: meeting.meetingType,
          })),
          upcomingCount: therapist.meetings.length,
        },
        earnings: {
          thisMonth: Math.round(thisMonthEarnings),
          lastMonth: Math.round(lastMonthEarnings),
          percentageChange: Math.round(earningsPercentageChange * 100) / 100,
          totalEarnings: Math.round(totalEarnings),
          pendingPayouts: Math.round(pendingPayouts),
        },
        performance: {
          averageRating: Math.round(averageRating * 100) / 100,
          totalRatings: therapist.reviews.length,
          sessionCompletionRate: Math.round(sessionCompletionRate * 100) / 100,
          responseTime: Math.round(averageResponseTime * 100) / 100,
        },
      };

      console.log(
        `✅ [DashboardService] Successfully retrieved dashboard data for ${therapist.user.email}`,
      );

      // Cache the result for 5 minutes
      const cacheKey = this.cache.generateKey('dashboard', 'therapist', userId);
      await this.cache.set(cacheKey, dashboardData, 300);

      return dashboardData;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Re-throw NotFoundException with our enhanced error messages
        throw error;
      }

      console.error(
        `❌ [DashboardService] Unexpected error getting therapist dashboard data for userId ${userId}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to get therapist dashboard data for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAdminDashboardData() {
    try {
      const totalUsers = await this.prisma.user.count();
      const totalClients = await this.prisma.client.count();
      const totalTherapists = await this.prisma.therapist.count();
      const pendingTherapists = await this.prisma.therapist.count({
        where: { status: 'PENDING' },
      });
      const totalMeetings = await this.prisma.meeting.count();
      const completedMeetings = await this.prisma.meeting.count({
        where: { status: 'COMPLETED' },
      });
      const totalCommunities = await this.prisma.community.count();
      const totalPosts = await this.prisma.post.count();

      // Recent activity
      const recentUsers = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          client: true,
          therapist: true,
        },
      });

      const recentTherapistApplications = await this.prisma.therapist.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true },
      });

      return {
        stats: {
          totalUsers,
          totalClients,
          totalTherapists,
          pendingTherapists,
          totalMeetings,
          completedMeetings,
          totalCommunities,
          totalPosts,
        },
        recentUsers,
        pendingApplications: recentTherapistApplications,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get admin dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getModeratorDashboardData(userId: string) {
    try {
      // Get moderator record
      const moderator = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      if (!moderator || moderator.role !== 'moderator') {
        throw new NotFoundException('Moderator not found');
      }

      // Get pending reports/content for moderation
      const pendingReports = await this.prisma.post.count({
        where: {
          reports: { some: { status: 'PENDING' } },
        },
      });

      const pendingContent = await this.prisma.comment.count({
        where: {
          reports: { some: { status: 'PENDING' } },
        },
      });

      const resolvedToday = await this.prisma.report.count({
        where: {
          status: { in: ['REVIEWED', 'DISMISSED'] },
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const flaggedUsers = await this.prisma.user.count({
        where: {
          OR: [
            { isActive: false },
            {
              // Add any user flagging criteria here
              client: {
                meetings: {
                  some: { status: 'CANCELLED' },
                },
              },
            },
          ],
        },
      });

      // Get recent flagged content for review
      const recentFlaggedPosts = await this.prisma.post.findMany({
        where: {
          reports: { some: { status: 'PENDING' } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          room: {
            include: {
              roomGroup: {
                include: { community: true },
              },
            },
          },
          _count: { select: { hearts: true, comments: true } },
        },
      });

      const recentFlaggedComments = await this.prisma.comment.findMany({
        where: {
          reports: { some: { status: 'PENDING' } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          post: {
            select: { title: true, id: true },
          },
        },
      });

      // Community stats
      const totalCommunities = await this.prisma.community.count();

      return {
        moderator,
        stats: {
          pendingReports,
          pendingContent,
          resolvedToday,
          flaggedUsers,
          systemAlerts: 0, // Placeholder for system alerts
        },
        communityStats: {
          totalCommunities,
        },
        flaggedContent: {
          posts: recentFlaggedPosts,
          comments: recentFlaggedComments,
        },
        recentActivity: {
          moderationActions: [], // Placeholder for moderation action history
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get moderator dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTherapistAnalytics(
    therapistId: string,
    dateRange?: { start: Date; end: Date },
  ) {
    try {
      // Validate therapist exists
      const therapist = await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
        include: { user: true },
      });

      if (!therapist) {
        throw new NotFoundException('Therapist not found');
      }

      // Define date range for queries
      const startDate =
        dateRange?.start || new Date(new Date().getFullYear(), 0, 1); // Start of current year
      const endDate = dateRange?.end || new Date(); // Today

      // Get meetings within date range
      const meetings = await this.prisma.meeting.findMany({
        where: {
          therapistId,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          payments: {
            where: { status: 'COMPLETED' },
            include: { paymentMethod: true },
          },
          client: {
            include: { user: true },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      // Calculate revenue statistics
      const totalRevenue = meetings.reduce((sum, meeting) => {
        const meetingRevenue = meeting.payments.reduce((paySum, payment) => {
          return (
            paySum +
            (payment.amount ? parseFloat(payment.amount.toString()) : 0)
          );
        }, 0);
        return sum + meetingRevenue;
      }, 0);

      // If no payment data, estimate from hourly rate
      const estimatedRevenue =
        meetings.length * parseFloat(therapist.hourlyRate?.toString() || '120');
      const finalRevenue = totalRevenue > 0 ? totalRevenue : estimatedRevenue;

      // Sessions by status
      const sessionsByStatus = {
        completed: meetings.filter((m) => m.status === 'COMPLETED').length,
        scheduled: meetings.filter((m) => m.status === 'SCHEDULED').length,
        confirmed: meetings.filter((m) => m.status === 'CONFIRMED').length,
        cancelled: meetings.filter((m) => m.status === 'CANCELLED').length,
        no_show: meetings.filter((m) => m.status === 'NO_SHOW').length,
      };

      // Monthly revenue breakdown
      const monthlyRevenue = {};
      meetings.forEach((meeting) => {
        const month = meeting.startTime.toISOString().slice(0, 7); // YYYY-MM format
        const meetingRevenue = meeting.payments.reduce((sum, payment) => {
          return (
            sum + (payment.amount ? parseFloat(payment.amount.toString()) : 0)
          );
        }, 0);

        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] +=
          meetingRevenue ||
          parseFloat(therapist.hourlyRate?.toString() || '120');
      });

      // Top clients by session count
      const clientSessions = {};
      meetings.forEach((meeting) => {
        const clientId = meeting.clientId;
        const clientName = `${meeting.client.user.firstName} ${meeting.client.user.lastName}`;

        if (!clientSessions[clientId]) {
          clientSessions[clientId] = {
            name: clientName,
            sessions: 0,
            revenue: 0,
          };
        }

        clientSessions[clientId].sessions++;
        const sessionRevenue =
          meeting.payments.reduce((sum, payment) => {
            return (
              sum + (payment.amount ? parseFloat(payment.amount.toString()) : 0)
            );
          }, 0) || parseFloat(therapist.hourlyRate?.toString() || '120');

        clientSessions[clientId].revenue += sessionRevenue;
      });

      const topClients = Object.values(clientSessions)
        .sort((a: any, b: any) => b.sessions - a.sessions)
        .slice(0, 10);

      // Session completion rate
      const totalSessions = meetings.length;
      const completedSessions = sessionsByStatus.completed;
      const completionRate =
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Average session duration
      const completedMeetings = meetings.filter(
        (m) => m.status === 'COMPLETED',
      );
      const averageDuration =
        completedMeetings.length > 0
          ? completedMeetings.reduce((sum, m) => sum + m.duration, 0) /
            completedMeetings.length
          : 0;

      // Today's stats
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayMeetings = meetings.filter(
        (m) => m.startTime >= startOfDay && m.startTime <= endOfDay,
      );

      const todayRevenue = todayMeetings.reduce((sum, meeting) => {
        const meetingRevenue =
          meeting.payments.reduce((paySum, payment) => {
            return (
              paySum +
              (payment.amount ? parseFloat(payment.amount.toString()) : 0)
            );
          }, 0) || parseFloat(therapist.hourlyRate?.toString() || '120');
        return sum + meetingRevenue;
      }, 0);

      // This week's stats
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const weekMeetings = meetings.filter((m) => m.startTime >= startOfWeek);
      const weekRevenue = weekMeetings.reduce((sum, meeting) => {
        const meetingRevenue =
          meeting.payments.reduce((paySum, payment) => {
            return (
              paySum +
              (payment.amount ? parseFloat(payment.amount.toString()) : 0)
            );
          }, 0) || parseFloat(therapist.hourlyRate?.toString() || '120');
        return sum + meetingRevenue;
      }, 0);

      // This month's stats
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthMeetings = meetings.filter((m) => m.startTime >= startOfMonth);
      const monthRevenue = monthMeetings.reduce((sum, meeting) => {
        const meetingRevenue =
          meeting.payments.reduce((paySum, payment) => {
            return (
              paySum +
              (payment.amount ? parseFloat(payment.amount.toString()) : 0)
            );
          }, 0) || parseFloat(therapist.hourlyRate?.toString() || '120');
        return sum + meetingRevenue;
      }, 0);

      return {
        therapist: {
          id: therapist.userId,
          name: `${therapist.user.firstName} ${therapist.user.lastName}`,
          email: therapist.user.email,
          specialization: therapist.specialCertifications,
          hourlyRate: parseFloat(therapist.hourlyRate?.toString() || '120'),
        },
        dateRange: {
          start: startDate,
          end: endDate,
        },
        overview: {
          totalRevenue: Math.round(finalRevenue),
          totalSessions: totalSessions,
          completedSessions: completedSessions,
          completionRate: Math.round(completionRate * 100) / 100,
          averageDuration: Math.round(averageDuration),
          activeClients: Object.keys(clientSessions).length,
        },
        timeBasedStats: {
          today: {
            sessions: todayMeetings.length,
            revenue: Math.round(todayRevenue),
          },
          thisWeek: {
            sessions: weekMeetings.length,
            revenue: Math.round(weekRevenue),
          },
          thisMonth: {
            sessions: monthMeetings.length,
            revenue: Math.round(monthRevenue),
          },
        },
        sessionsByStatus,
        monthlyRevenue: Object.entries(monthlyRevenue).map(
          ([month, revenue]) => ({
            month,
            revenue: Math.round(revenue as number),
          }),
        ),
        topClients: topClients.map((client: any) => ({
          ...client,
          revenue: Math.round(client.revenue),
        })),
        recentSessions: meetings.slice(0, 10).map((meeting) => ({
          id: meeting.id,
          startTime: meeting.startTime,
          duration: meeting.duration,
          status: meeting.status,
          clientName: `${meeting.client.user.firstName} ${meeting.client.user.lastName}`,
          revenue:
            meeting.payments.reduce((sum, payment) => {
              return (
                sum +
                (payment.amount ? parseFloat(payment.amount.toString()) : 0)
              );
            }, 0) || parseFloat(therapist.hourlyRate?.toString() || '120'),
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get therapist analytics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
