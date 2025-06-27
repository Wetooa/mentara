import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDashboardData(userId: string) {
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
            where: { isCompleted: false },
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
        throw new Error('Client not found');
      }

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: { clientId: userId, status: 'COMPLETED' },
      });

      const completedWorksheetsCount = await this.prisma.worksheet.count({
        where: { clientId: userId, isCompleted: true },
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

      return {
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
    } catch (error) {
      throw new Error(
        `Failed to get user dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getTherapistDashboardData(userId: string) {
    try {
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
            where: { isCompleted: false },
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
        throw new Error('Therapist not found');
      }

      const completedMeetingsCount = await this.prisma.meeting.count({
        where: { therapistId: userId, status: 'COMPLETED' },
      });

      const totalClientsCount = await this.prisma.clientTherapist.count({
        where: { therapistId: userId, status: 'active' },
      });

      const pendingWorksheetsCount = await this.prisma.worksheet.count({
        where: { therapistId: userId, isCompleted: false },
      });

      // Get recent session logs
      const recentSessions = await this.prisma.sessionLog.findMany({
        where: { therapistId: userId },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: {
          client: {
            include: { user: true },
          },
        },
      });

      return {
        therapist,
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
    } catch (error) {
      throw new Error(
        `Failed to get therapist dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAdminDashboardData() {
    try {
      const totalUsers = await this.prisma.user.count();
      const totalClients = await this.prisma.client.count();
      const totalTherapists = await this.prisma.therapist.count();
      const pendingTherapists = await this.prisma.therapist.count({
        where: { status: 'pending' },
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
        where: { status: 'pending' },
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
      throw new Error(
        `Failed to get admin dashboard data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
