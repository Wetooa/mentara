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
          const existingConversations = await this.messagingService.getUserConversations(userId, 1, 100);
          const hasConversationWithTherapist = existingConversations.some(conv => 
            conv.participants?.some(p => p.userId === therapistId)
          );

          if (!hasConversationWithTherapist) {
            // Auto-create conversation if it doesn't exist
            await this.messagingService.createConversation(userId, {
              participantIds: [therapistId],
              type: 'direct',
              title: `Therapy Session with ${assignment.therapist.user.firstName} ${assignment.therapist.user.lastName}`,
            });
            console.log(`✅ Auto-created missing conversation between client ${userId} and therapist ${therapistId}`);
          }
        } catch (error) {
          // Log but don't fail dashboard load if conversation creation fails
          console.warn(`⚠️ Failed to ensure conversation exists between client ${userId} and therapist ${therapistId}:`, error);
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
    console.log(`🔍 [DashboardService] Getting therapist dashboard data for userId: ${userId}`);
    
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

      console.log(`📋 [DashboardService] User found: ${user.email} (${user.firstName} ${user.lastName}), role: ${user.role}, active: ${user.isActive}`);

      if (user.role !== 'therapist') {
        console.error(`❌ [DashboardService] User ${user.email} has role '${user.role}', expected 'therapist'`);
        throw new NotFoundException(`User ${user.email} does not have therapist role. Current role: ${user.role}`);
      }

      if (!user.isActive) {
        console.error(`❌ [DashboardService] User ${user.email} is not active`);
        throw new NotFoundException(`User ${user.email} is not active`);
      }

      // Now attempt to find the therapist record
      console.log(`🔍 [DashboardService] Looking for Therapist record for userId: ${userId}`);
      
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
        console.error(`❌ [DashboardService] Therapist record not found for user: ${user.email} (${userId})`);
        console.error(`❌ [DashboardService] User has role 'therapist' but missing Therapist table record`);
        
        // Additional diagnostic information
        const allTherapistRecords = await this.prisma.therapist.count();
        console.log(`📊 [DashboardService] Total Therapist records in database: ${allTherapistRecords}`);
        
        throw new NotFoundException(
          `Therapist record not found for user ${user.email} (${userId}). ` +
          `User has role 'therapist' but is missing corresponding Therapist table record. ` +
          `This indicates a data consistency issue that needs to be resolved.`
        );
      }

      console.log(`✅ [DashboardService] Therapist record found: ${therapist.user.email}, status: ${therapist.status}`);

      // Validate therapist status
      if (therapist.status !== 'APPROVED') {
        console.warn(`⚠️ [DashboardService] Therapist ${therapist.user.email} has status: ${therapist.status}`);
      }

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: { therapistId: userId, status: 'COMPLETED' },
      });

      const totalClientsCount = await this.prisma.clientTherapist.count({
        where: { therapistId: userId },
      });

      const pendingWorksheetsCount = await this.prisma.worksheet.count({
        where: { therapistId: userId, status: { in: ['ASSIGNED', 'OVERDUE'] } },
      });

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

      console.log(`📊 [DashboardService] Dashboard stats for ${therapist.user.email}: clients=${totalClientsCount}, completed_meetings=${completedMeetingsCount}, pending_worksheets=${pendingWorksheetsCount}`);

      const dashboardData = {
        therapist: {
          ...therapist,
          // Map database fields to frontend-expected fields
          specialties: therapist.areasOfExpertise || [],
        },
        stats: {
          totalClients: totalClientsCount,
          completedMeetings: completedMeetingsCount,
          upcomingMeetings: therapist.meetings.length,
          pendingWorksheets: pendingWorksheetsCount,
        },
        upcomingMeetings: therapist.meetings,
        assignedClients: therapist.assignedClients.map((ct) => ct.client),
        pendingWorksheets: therapist.worksheets,
        recentSessions,
      };

      console.log(`✅ [DashboardService] Successfully retrieved dashboard data for ${therapist.user.email}`);
      return dashboardData;

    } catch (error) {
      if (error instanceof NotFoundException) {
        // Re-throw NotFoundException with our enhanced error messages
        throw error;
      }
      
      console.error(`❌ [DashboardService] Unexpected error getting therapist dashboard data for userId ${userId}:`, error);
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
}
