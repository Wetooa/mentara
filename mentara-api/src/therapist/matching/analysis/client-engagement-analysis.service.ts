import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma-client.provider';

export interface ClientEngagementAnalysis {
  engagementLevel: 'high' | 'medium' | 'low';
  loginFrequency: number; // Logins per week
  platformUsageScore: number; // 0-1
  journalEntryCount: number;
  worksheetCompletionRate: number; // 0-1
  meetingAttendanceRate: number; // 0-1
  averageSessionRating: number | null;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  preferredSessionTimes: string[]; // Extracted from booking history
  therapyGoals: string[]; // Extracted from journal entries
  engagementScore: number; // 0-100 overall score
}

@Injectable()
export class ClientEngagementAnalysisService {
  private readonly logger = new Logger(ClientEngagementAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze client engagement comprehensively
   */
  async analyzeClientEngagement(clientId: string): Promise<ClientEngagementAnalysis | null> {
    try {
      // Get or create engagement record
      let engagement = await this.prisma.clientEngagement.findUnique({
        where: { clientId },
      });

      // Calculate engagement metrics
      const metrics = await this.calculateEngagementMetrics(clientId);

      // Update or create engagement record
      if (engagement) {
        engagement = await this.prisma.clientEngagement.update({
          where: { clientId },
          data: {
            loginFrequency: metrics.loginFrequency,
            platformUsageScore: metrics.platformUsageScore,
            journalEntryCount: metrics.journalEntryCount,
            worksheetCompletionRate: metrics.worksheetCompletionRate,
            meetingAttendanceRate: metrics.meetingAttendanceRate,
            averageSessionRating: metrics.averageSessionRating,
            engagementTrend: metrics.engagementTrend,
            lastCalculatedAt: new Date(),
          },
        });
      } else {
        engagement = await this.prisma.clientEngagement.create({
          data: {
            clientId,
            loginFrequency: metrics.loginFrequency,
            platformUsageScore: metrics.platformUsageScore,
            journalEntryCount: metrics.journalEntryCount,
            worksheetCompletionRate: metrics.worksheetCompletionRate,
            meetingAttendanceRate: metrics.meetingAttendanceRate,
            averageSessionRating: metrics.averageSessionRating,
            engagementTrend: metrics.engagementTrend,
          },
        });
      }

      // Extract additional insights
      const preferredSessionTimes = await this.extractPreferredSessionTimes(clientId);
      const therapyGoals = await this.extractTherapyGoals(clientId);

      // Determine engagement level
      const engagementLevel = this.determineEngagementLevel(metrics);
      const engagementScore = this.calculateEngagementScore(metrics);

      return {
        engagementLevel,
        loginFrequency: engagement.loginFrequency,
        platformUsageScore: engagement.platformUsageScore,
        journalEntryCount: engagement.journalEntryCount,
        worksheetCompletionRate: engagement.worksheetCompletionRate,
        meetingAttendanceRate: engagement.meetingAttendanceRate,
        averageSessionRating: engagement.averageSessionRating,
        engagementTrend: engagement.engagementTrend as 'increasing' | 'stable' | 'decreasing',
        preferredSessionTimes,
        therapyGoals,
        engagementScore,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing client engagement for ${clientId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Calculate engagement metrics from historical data
   */
  private async calculateEngagementMetrics(clientId: string): Promise<{
    loginFrequency: number;
    platformUsageScore: number;
    journalEntryCount: number;
    worksheetCompletionRate: number;
    meetingAttendanceRate: number;
    averageSessionRating: number | null;
    engagementTrend: string;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Calculate login frequency (logins per week)
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: { lastLoginAt: true },
    });
    const loginFrequency = user?.lastLoginAt
      ? this.calculateLoginFrequency(clientId, thirtyDaysAgo)
      : 0;

    // Count journal entries
    const journalEntryCount = await this.prisma.journalEntry.count({
      where: {
        userId: clientId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Calculate worksheet completion rate
    const totalWorksheets = await this.prisma.worksheet.count({
      where: { clientId },
    });
    const completedWorksheets = await this.prisma.worksheet.count({
      where: {
        clientId,
        status: { in: ['SUBMITTED', 'REVIEWED'] },
      },
    });
    const worksheetCompletionRate =
      totalWorksheets > 0 ? completedWorksheets / totalWorksheets : 0;

    // Calculate meeting attendance rate
    const totalMeetings = await this.prisma.meeting.count({
      where: {
        clientId,
        status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      },
    });
    const attendedMeetings = await this.prisma.meeting.count({
      where: {
        clientId,
        status: 'COMPLETED',
      },
    });
    const meetingAttendanceRate =
      totalMeetings > 0 ? attendedMeetings / totalMeetings : 0;

    // Calculate average session rating
    const reviews = await this.prisma.review.findMany({
      where: { clientId },
      select: { rating: true },
    });
    const averageSessionRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    // Calculate platform usage score (0-1)
    // Factors: journal entries, worksheets, meetings, reviews
    const platformUsageScore = this.calculatePlatformUsageScore(
      journalEntryCount,
      worksheetCompletionRate,
      meetingAttendanceRate,
      reviews.length,
    );

    // Determine engagement trend
    const previousMetrics = await this.getPreviousMetrics(clientId, sixtyDaysAgo, thirtyDaysAgo);
    const engagementTrend = this.determineTrend(previousMetrics, {
      platformUsageScore,
      meetingAttendanceRate,
      worksheetCompletionRate,
    });

    return {
      loginFrequency,
      platformUsageScore,
      journalEntryCount,
      worksheetCompletionRate,
      meetingAttendanceRate,
      averageSessionRating,
      engagementTrend,
    };
  }

  /**
   * Calculate login frequency (logins per week)
   */
  private calculateLoginFrequency(clientId: string, since: Date): number {
    // This is a simplified calculation
    // In production, you'd track login events in a separate table
    // For now, we'll estimate based on lastLoginAt
    return 3; // Default estimate - would need login tracking table
  }

  /**
   * Calculate platform usage score (0-1)
   */
  private calculatePlatformUsageScore(
    journalCount: number,
    worksheetRate: number,
    attendanceRate: number,
    reviewCount: number,
  ): number {
    // Weighted combination of different engagement factors
    const journalScore = Math.min(journalCount / 10, 1) * 0.3; // Max 10 entries = full score
    const worksheetScore = worksheetRate * 0.3;
    const attendanceScore = attendanceRate * 0.3;
    const reviewScore = Math.min(reviewCount / 5, 1) * 0.1; // Max 5 reviews = full score

    return Math.min(journalScore + worksheetScore + attendanceScore + reviewScore, 1);
  }

  /**
   * Get previous metrics for trend calculation
   */
  private async getPreviousMetrics(
    clientId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    platformUsageScore: number;
    meetingAttendanceRate: number;
    worksheetCompletionRate: number;
  }> {
    // Calculate metrics for previous period
    const previousJournalCount = await this.prisma.journalEntry.count({
      where: {
        userId: clientId,
        createdAt: { gte: startDate, lt: endDate },
      },
    });

    const previousTotalWorksheets = await this.prisma.worksheet.count({
      where: {
        clientId,
        createdAt: { gte: startDate, lt: endDate },
      },
    });
    const previousCompletedWorksheets = await this.prisma.worksheet.count({
      where: {
        clientId,
        status: { in: ['SUBMITTED', 'REVIEWED'] },
        createdAt: { gte: startDate, lt: endDate },
      },
    });
    const previousWorksheetRate =
      previousTotalWorksheets > 0
        ? previousCompletedWorksheets / previousTotalWorksheets
        : 0;

    const previousTotalMeetings = await this.prisma.meeting.count({
      where: {
        clientId,
        status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
        startTime: { gte: startDate, lt: endDate },
      },
    });
    const previousAttendedMeetings = await this.prisma.meeting.count({
      where: {
        clientId,
        status: 'COMPLETED',
        startTime: { gte: startDate, lt: endDate },
      },
    });
    const previousAttendanceRate =
      previousTotalMeetings > 0 ? previousAttendedMeetings / previousTotalMeetings : 0;

    const previousReviews = await this.prisma.review.count({
      where: {
        clientId,
        createdAt: { gte: startDate, lt: endDate },
      },
    });

    return {
      platformUsageScore: this.calculatePlatformUsageScore(
        previousJournalCount,
        previousWorksheetRate,
        previousAttendanceRate,
        previousReviews,
      ),
      meetingAttendanceRate: previousAttendanceRate,
      worksheetCompletionRate: previousWorksheetRate,
    };
  }

  /**
   * Determine engagement trend
   */
  private determineTrend(
    previous: {
      platformUsageScore: number;
      meetingAttendanceRate: number;
      worksheetCompletionRate: number;
    },
    current: {
      platformUsageScore: number;
      meetingAttendanceRate: number;
      worksheetCompletionRate: number;
    },
  ): string {
    const previousAvg =
      (previous.platformUsageScore +
        previous.meetingAttendanceRate +
        previous.worksheetCompletionRate) /
      3;
    const currentAvg =
      (current.platformUsageScore +
        current.meetingAttendanceRate +
        current.worksheetCompletionRate) /
      3;

    const change = currentAvg - previousAvg;
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Determine engagement level
   */
  private determineEngagementLevel(metrics: {
    platformUsageScore: number;
    meetingAttendanceRate: number;
    worksheetCompletionRate: number;
  }): 'high' | 'medium' | 'low' {
    const avgScore =
      (metrics.platformUsageScore +
        metrics.meetingAttendanceRate +
        metrics.worksheetCompletionRate) /
      3;

    if (avgScore >= 0.7) return 'high';
    if (avgScore >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall engagement score (0-100)
   */
  private calculateEngagementScore(metrics: {
    platformUsageScore: number;
    meetingAttendanceRate: number;
    worksheetCompletionRate: number;
    loginFrequency: number;
  }): number {
    const avgScore =
      (metrics.platformUsageScore +
        metrics.meetingAttendanceRate +
        metrics.worksheetCompletionRate) /
      3;
    const loginBonus = Math.min(metrics.loginFrequency / 7, 1) * 0.2; // Max 7 logins/week = full bonus
    return Math.round((avgScore * 0.8 + loginBonus) * 100);
  }

  /**
   * Extract preferred session times from booking history
   */
  private async extractPreferredSessionTimes(clientId: string): Promise<string[]> {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        clientId,
        status: 'COMPLETED',
      },
      select: {
        startTime: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 20, // Analyze last 20 meetings
    });

    const timeSlots: Record<string, number> = {};
    meetings.forEach((meeting) => {
      const hour = meeting.startTime.getHours();
      let slot: string;
      if (hour < 12) slot = 'morning';
      else if (hour < 17) slot = 'afternoon';
      else slot = 'evening';

      const day = meeting.startTime.getDay();
      if (day === 0 || day === 6) {
        slot = 'weekend';
      }

      timeSlots[slot] = (timeSlots[slot] || 0) + 1;
    });

    // Return top 2 most common time slots
    return Object.entries(timeSlots)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([slot]) => slot);
  }

  /**
   * Extract therapy goals from journal entries using simple keyword matching
   * In production, this would use AI/NLP
   */
  private async extractTherapyGoals(clientId: string): Promise<string[]> {
    const journalEntries = await this.prisma.journalEntry.findMany({
      where: {
        userId: clientId,
      },
      select: {
        content: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const goalKeywords: Record<string, string[]> = {
      anxiety: ['anxiety', 'worried', 'nervous', 'panic'],
      depression: ['depressed', 'sad', 'hopeless', 'down'],
      relationships: ['relationship', 'partner', 'friend', 'family'],
      stress: ['stress', 'stressed', 'overwhelmed', 'pressure'],
      self_esteem: ['confidence', 'self-esteem', 'worth', 'value'],
      trauma: ['trauma', 'traumatic', 'ptsd', 'trigger'],
    };

    const goalCounts: Record<string, number> = {};
    const content = journalEntries.map((e) => e.content.toLowerCase()).join(' ');

    Object.entries(goalKeywords).forEach(([goal, keywords]) => {
      const count = keywords.filter((keyword) => content.includes(keyword)).length;
      if (count > 0) {
        goalCounts[goal] = count;
      }
    });

    // Return top 3 goals
    return Object.entries(goalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([goal]) => goal);
  }
}

