import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

export interface ClientInsights {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  progress: {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    averageSessionDuration: number;
    totalSessionTime: number; // in minutes
  };
  moodTrends: {
    date: string;
    averageMood?: number;
    journalEntries: number;
  }[];
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  worksheets: {
    assigned: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  engagement: {
    messagesSent: number;
    messagesReceived: number;
    communityPosts: number;
    communityComments: number;
    averageResponseTime: number; // in hours
  };
}

@Injectable()
export class ClientInsightsService {
  private readonly logger = new Logger(ClientInsightsService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get comprehensive client insights
   */
  async getClientInsights(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ClientInsights> {

    // Fetch all data in parallel
    const [
      meetings,
      worksheets,
      messages,
      posts,
      comments,
      journalEntries,
    ] = await Promise.all([
      // Meetings
      this.prisma.meeting.findMany({
        where: {
          clientId: userId,
          startTime: { gte: startDate, lte: endDate },
        },
        select: {
          status: true,
          duration: true,
          startTime: true,
        },
      }),

      // Worksheets
      this.prisma.worksheet.findMany({
        where: {
          clientId: userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          status: true,
          dueDate: true,
        },
      }),

      // Messages
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            {
              conversation: {
                participants: {
                  some: { userId },
                },
              },
            },
          ],
          createdAt: { gte: startDate, lte: endDate },
          isDeleted: false,
        },
        select: {
          senderId: true,
          createdAt: true,
        },
      }),

      // Posts
      this.prisma.post.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Comments
      this.prisma.comment.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),

      // Journal entries (if journal model exists)
      this.prisma.journalEntry.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Calculate progress metrics
    const completedMeetings = meetings.filter((m) => m.status === 'COMPLETED');
    const totalSessionTime = completedMeetings.reduce(
      (sum, m) => sum + (m.duration || 0),
      0,
    );
    const averageSessionDuration =
      completedMeetings.length > 0
        ? totalSessionTime / completedMeetings.length
        : 0;

    // Calculate worksheet metrics
    const completedWorksheets = worksheets.filter(
      (w) => w.status === 'SUBMITTED' || w.status === 'REVIEWED',
    );
    const overdueWorksheets = worksheets.filter(
      (w) => w.status === 'ASSIGNED' && w.dueDate && w.dueDate < new Date(),
    );

    // Calculate message metrics
    const messagesSent = messages.filter((m) => m.senderId === userId).length;
    const messagesReceived = messages.length - messagesSent;

    // Calculate mood trends (group by date)
    // Note: moodRating field not available in JournalEntry model
    // This would require adding moodRating to the schema or using a different approach
    const moodTrends: Array<{ date: string; averageMood?: number; journalEntries: number }> = [];

    const insights: ClientInsights = {
      userId,
      period: { start: startDate, end: endDate },
      progress: {
        totalSessions: meetings.length,
        completedSessions: completedMeetings.length,
        completionRate:
          meetings.length > 0
            ? (completedMeetings.length / meetings.length) * 100
            : 0,
        averageSessionDuration,
        totalSessionTime,
      },
      moodTrends: moodTrends.sort((a, b) => a.date.localeCompare(b.date)),
      goals: {
        total: 0, // Would need goals model
        completed: 0,
        inProgress: 0,
        completionRate: 0,
      },
      worksheets: {
        assigned: worksheets.length,
        completed: completedWorksheets.length,
        overdue: overdueWorksheets.length,
        completionRate:
          worksheets.length > 0
            ? (completedWorksheets.length / worksheets.length) * 100
            : 0,
      },
      engagement: {
        messagesSent,
        messagesReceived,
        communityPosts: posts,
        communityComments: comments,
        averageResponseTime: 0, // Would need to calculate from message timestamps
      },
    };

    return insights;
  }

  /**
   * Get insights summary for dashboard
   */
  async getInsightsSummary(userId: string): Promise<{
    thisWeek: Partial<ClientInsights>;
    thisMonth: Partial<ClientInsights>;
    trends: {
      sessionsTrend: 'up' | 'down' | 'stable';
      moodTrend: 'up' | 'down' | 'stable';
      engagementTrend: 'up' | 'down' | 'stable';
    };
  }> {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const thisMonthStart = new Date(now);
    thisMonthStart.setMonth(now.getMonth() - 1);

    const [thisWeek, thisMonth] = await Promise.all([
      this.getClientInsights(userId, thisWeekStart, now),
      this.getClientInsights(userId, thisMonthStart, now),
    ]);

    // Calculate trends (simplified)
    const trends = {
      sessionsTrend: 'stable' as const,
      moodTrend: 'stable' as const,
      engagementTrend: 'stable' as const,
    };

    return {
      thisWeek: {
        progress: thisWeek.progress,
        worksheets: thisWeek.worksheets,
        engagement: thisWeek.engagement,
      },
      thisMonth: {
        progress: thisMonth.progress,
        worksheets: thisMonth.worksheets,
        engagement: thisMonth.engagement,
      },
      trends,
    };
  }
}

