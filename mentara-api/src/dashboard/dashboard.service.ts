import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { MessagingService } from '../messaging/messaging.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  async getClientDashboardData(userId: string) {
    try {
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

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: { clientId: userId, status: 'COMPLETED' },
      });

      const completedWorksheetsCount = await this.prisma.worksheet.count({
        where: { clientId: userId, status: { in: ['SUBMITTED', 'REVIEWED'] } },
      });

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

      // Ensure conversations exist between client and assigned therapists
      for (const assignment of client.assignedTherapists) {
        const therapistId = assignment.therapist.userId;
        try {
          // Check if conversation already exists
          const existingConversations =
            await this.messagingService.getUserConversations(userId, 1, 100);
          const hasConversationWithTherapist = existingConversations.some(
            (conv) => conv.participants?.some((p) => p.userId === therapistId),
          );

          if (!hasConversationWithTherapist) {
            // Auto-create conversation if it doesn't exist
            await this.messagingService.createConversation(userId, {
              participantIds: [therapistId],
              type: 'direct',
              title: `Therapy Session with ${assignment.therapist.user.firstName} ${assignment.therapist.user.lastName}`,
            });
            console.log(
              `✅ Auto-created missing conversation between client ${userId} and therapist ${therapistId}`,
            );
          }
        } catch (error) {
          // Log but don't fail dashboard load if conversation creation fails
          console.warn(
            `⚠️ Failed to ensure conversation exists between client ${userId} and therapist ${therapistId}:`,
            error,
          );
        }
      }

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
            where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
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

      // Validate therapist status
      if (therapist.status !== 'APPROVED') {
        console.warn(
          `⚠️ [DashboardService] Therapist ${therapist.user.email} has status: ${therapist.status}`,
        );
      }

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: { therapistId: userId, status: 'COMPLETED' },
      });

      const totalClientsCount = await this.prisma.clientTherapist.count({
        where: { therapistId: userId, status: 'active' },
      });

      const pendingWorksheetsCount = await this.prisma.worksheet.count({
        where: { therapistId: userId, status: { in: ['ASSIGNED', 'OVERDUE'] } },
      });

      // Calculate additional stats needed by frontend components
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Rescheduled meetings (meetings that were updated today with status changes)
      const rescheduledCount = await this.prisma.meeting.count({
        where: {
          therapistId: userId,
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          // Meetings that were rescheduled would have been updated recently
          NOT: {
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      });

      // Cancelled meetings today
      const cancelledCount = await this.prisma.meeting.count({
        where: {
          therapistId: userId,
          status: 'CANCELLED',
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Today's income from completed meetings
      const todayCompletedMeetings = await this.prisma.meeting.findMany({
        where: {
          therapistId: userId,
          status: 'COMPLETED',
          endTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          payments: {
            where: {
              status: 'COMPLETED',
            },
          },
        },
      });

      // Calculate income from completed meetings today
      let todayIncome = 0;
      for (const meeting of todayCompletedMeetings) {
        const meetingIncome = meeting.payments.reduce((sum, payment) => {
          return (
            sum + (payment.amount ? parseFloat(payment.amount.toString()) : 0)
          );
        }, 0);
        todayIncome += meetingIncome;
      }

      // If no payments recorded, estimate from therapist hourly rate
      if (todayIncome === 0 && todayCompletedMeetings.length > 0) {
        const therapistRate = parseFloat(
          therapist.hourlyRate?.toString() || '0',
        );
        todayIncome = todayCompletedMeetings.length * therapistRate;
      }

      // Get recent completed meetings (replacing session logs)
      const recentSessions = await this.prisma.meeting.findMany({
        where: {
          therapistId: userId,
          status: 'COMPLETED',
        },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: {
          client: {
            include: { user: true },
          },
          meetingNotes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      console.log(
        `📊 [DashboardService] Dashboard stats for ${therapist.user.email}: clients=${totalClientsCount}, completed_meetings=${completedMeetingsCount}, pending_worksheets=${pendingWorksheetsCount}`,
      );

      const dashboardData = {
        therapist: {
          ...therapist,
          // Map database fields to frontend-expected fields
          name: `${therapist.user.firstName} ${therapist.user.lastName}`,
          specialties: therapist.areasOfExpertise || [],
        },
        stats: {
          // Map backend data to frontend-expected field names
          activePatients: totalClientsCount,
          rescheduled: rescheduledCount,
          cancelled: cancelledCount,
          income: Math.round(todayIncome), // Round to nearest peso
          // Keep additional stats for backward compatibility
          totalClients: totalClientsCount,
          completedMeetings: completedMeetingsCount,
          upcomingMeetings: therapist.meetings.length,
          pendingWorksheets: pendingWorksheetsCount,
          patientStats: {
            total: totalClientsCount,
            percentage:
              totalClientsCount > 0
                ? Math.round((completedMeetingsCount / totalClientsCount) * 100)
                : 0,
            months: Math.floor(
              (Date.now() - therapist.createdAt.getTime()) /
                (1000 * 60 * 60 * 24 * 30),
            ),
            chartData: [], // Will be populated with actual chart data if needed
          },
        },
        upcomingAppointments: therapist.meetings.map((meeting) => ({
          id: meeting.id,
          patientName: `${meeting.client.user.firstName} ${meeting.client.user.lastName}`,
          time: meeting.startTime,
          duration: meeting.duration,
          type: meeting.meetingType,
          status: meeting.status,
          clientId: meeting.clientId,
        })),
        assignedClients: therapist.assignedClients.map((ct) => ct.client),
        pendingWorksheets: therapist.worksheets,
        recentSessions,
      };

      console.log(
        `✅ [DashboardService] Successfully retrieved dashboard data for ${therapist.user.email}`,
      );
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
