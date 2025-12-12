import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma-client.provider';

export interface TherapistPerformanceAnalysis {
  averageResponseTime: number | null; // Minutes
  clientRetentionRate: number; // 0-1
  noShowRate: number; // 0-1
  cancellationRate: number; // 0-1
  averageSessionDuration: number; // Minutes
  clientProgressRate: number; // 0-1, average progress across clients
  workloadCapacity: number; // 0-1, current clients/max capacity
  availabilityUtilization: number; // 0-1, booked hours/available hours
  successRatesByCondition: Record<string, number>; // Condition -> success rate (0-1)
  communicationStyle: {
    directness: number; // 0-1
    warmth: number; // 0-1
    structure: number; // 0-1
    flexibility: number; // 0-1
  };
  performanceScore: number; // 0-100 overall score
}

@Injectable()
export class TherapistPerformanceAnalysisService {
  private readonly logger = new Logger(TherapistPerformanceAnalysisService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyze therapist performance comprehensively
   */
  async analyzeTherapistPerformance(
    therapistId: string,
  ): Promise<TherapistPerformanceAnalysis | null> {
    try {
      // Get or create performance record
      let performance = await this.prisma.therapistPerformance.findUnique({
        where: { therapistId },
      });

      // Calculate performance metrics
      const metrics = await this.calculatePerformanceMetrics(therapistId);

      // Update or create performance record
      if (performance) {
        performance = await this.prisma.therapistPerformance.update({
          where: { therapistId },
          data: {
            averageResponseTime: metrics.averageResponseTime,
            clientRetentionRate: metrics.clientRetentionRate,
            noShowRate: metrics.noShowRate,
            cancellationRate: metrics.cancellationRate,
            averageSessionDuration: metrics.averageSessionDuration,
            clientProgressRate: metrics.clientProgressRate,
            workloadCapacity: metrics.workloadCapacity,
            availabilityUtilization: metrics.availabilityUtilization,
            lastCalculatedAt: new Date(),
          },
        });
      } else {
        performance = await this.prisma.therapistPerformance.create({
          data: {
            therapistId,
            averageResponseTime: metrics.averageResponseTime,
            clientRetentionRate: metrics.clientRetentionRate,
            noShowRate: metrics.noShowRate,
            cancellationRate: metrics.cancellationRate,
            averageSessionDuration: metrics.averageSessionDuration,
            clientProgressRate: metrics.clientProgressRate,
            workloadCapacity: metrics.workloadCapacity,
            availabilityUtilization: metrics.availabilityUtilization,
          },
        });
      }

      // Calculate additional insights
      const successRatesByCondition = await this.calculateSuccessRatesByCondition(
        therapistId,
      );
      const communicationStyle = await this.extractCommunicationStyle(therapistId);
      const performanceScore = this.calculatePerformanceScore(metrics);

      return {
        averageResponseTime: performance.averageResponseTime,
        clientRetentionRate: performance.clientRetentionRate,
        noShowRate: performance.noShowRate,
        cancellationRate: performance.cancellationRate,
        averageSessionDuration: performance.averageSessionDuration,
        clientProgressRate: performance.clientProgressRate,
        workloadCapacity: performance.workloadCapacity,
        availabilityUtilization: performance.availabilityUtilization,
        successRatesByCondition,
        communicationStyle,
        performanceScore,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing therapist performance for ${therapistId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Calculate performance metrics from historical data
   */
  private async calculatePerformanceMetrics(therapistId: string): Promise<{
    averageResponseTime: number | null;
    clientRetentionRate: number;
    noShowRate: number;
    cancellationRate: number;
    averageSessionDuration: number;
    clientProgressRate: number;
    workloadCapacity: number;
    availabilityUtilization: number;
  }> {
    // Calculate average response time (from messages)
    const averageResponseTime = await this.calculateAverageResponseTime(therapistId);

    // Calculate client retention rate
    const clientRetentionRate = await this.calculateClientRetentionRate(therapistId);

    // Calculate no-show and cancellation rates
    const { noShowRate, cancellationRate } = await this.calculateAttendanceMetrics(
      therapistId,
    );

    // Calculate average session duration
    const averageSessionDuration = await this.calculateAverageSessionDuration(
      therapistId,
    );

    // Calculate client progress rate (simplified - would need progress tracking)
    const clientProgressRate = await this.calculateClientProgressRate(therapistId);

    // Calculate workload capacity
    const workloadCapacity = await this.calculateWorkloadCapacity(therapistId);

    // Calculate availability utilization
    const availabilityUtilization = await this.calculateAvailabilityUtilization(
      therapistId,
    );

    return {
      averageResponseTime,
      clientRetentionRate,
      noShowRate,
      cancellationRate,
      averageSessionDuration,
      clientProgressRate,
      workloadCapacity,
      availabilityUtilization,
    };
  }

  /**
   * Calculate average response time to client messages (in minutes)
   */
  private async calculateAverageResponseTime(therapistId: string): Promise<number | null> {
    // Get conversations where therapist is a participant
    const conversations = await this.prisma.conversationParticipant.findMany({
      where: {
        userId: therapistId,
      },
      select: {
        conversationId: true,
      },
    });

    if (conversations.length === 0) return null;

    const conversationIds = conversations.map((c) => c.conversationId);

    // Get messages in these conversations
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
      },
      select: {
        senderId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (messages.length < 2) return null;

    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      const prev = messages[i - 1];
      const curr = messages[i];

      // If previous message was from client and current is from therapist
      if (prev.senderId !== therapistId && curr.senderId === therapistId) {
        const diff = curr.createdAt.getTime() - prev.createdAt.getTime();
        responseTimes.push(diff / (1000 * 60)); // Convert to minutes
      }
    }

    if (responseTimes.length === 0) return null;

    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(avg);
  }

  /**
   * Calculate client retention rate (clients who continue after first session)
   */
  private async calculateClientRetentionRate(therapistId: string): Promise<number> {
    // Get all client-therapist relationships
    const relationships = await this.prisma.clientTherapist.findMany({
      where: { therapistId },
      select: {
        clientId: true,
        assignedAt: true,
      },
    });

    if (relationships.length === 0) return 0;

    let retainedClients = 0;

    for (const rel of relationships) {
      // Check if client had more than one meeting
      const meetingCount = await this.prisma.meeting.count({
        where: {
          therapistId,
          clientId: rel.clientId,
          status: 'COMPLETED',
        },
      });

      if (meetingCount > 1) {
        retainedClients++;
      }
    }

    return relationships.length > 0 ? retainedClients / relationships.length : 0;
  }

  /**
   * Calculate attendance metrics
   */
  private async calculateAttendanceMetrics(therapistId: string): Promise<{
    noShowRate: number;
    cancellationRate: number;
  }> {
    const totalMeetings = await this.prisma.meeting.count({
      where: {
        therapistId,
        status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      },
    });

    if (totalMeetings === 0) {
      return { noShowRate: 0, cancellationRate: 0 };
    }

    const noShows = await this.prisma.meeting.count({
      where: {
        therapistId,
        status: 'NO_SHOW',
      },
    });

    const cancellations = await this.prisma.meeting.count({
      where: {
        therapistId,
        status: 'CANCELLED',
      },
    });

    return {
      noShowRate: noShows / totalMeetings,
      cancellationRate: cancellations / totalMeetings,
    };
  }

  /**
   * Calculate average session duration
   */
  private async calculateAverageSessionDuration(therapistId: string): Promise<number> {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        status: 'COMPLETED',
      },
      select: {
        duration: true,
      },
    });

    if (meetings.length === 0) return 60; // Default 60 minutes

    const meetingsWithDuration = meetings.filter((m) => m.duration !== null);
    if (meetingsWithDuration.length === 0) return 60;

    const totalDuration = meetingsWithDuration.reduce(
      (sum, m) => sum + (m.duration || 60),
      0,
    );
    return Math.round(totalDuration / meetingsWithDuration.length);
  }

  /**
   * Calculate client progress rate (simplified - would need progress tracking)
   */
  private async calculateClientProgressRate(therapistId: string): Promise<number> {
    // Get clients with multiple sessions
    const relationships = await this.prisma.clientTherapist.findMany({
      where: { therapistId },
      select: { clientId: true },
    });

    if (relationships.length === 0) return 0;

    let clientsWithProgress = 0;

    for (const rel of relationships) {
      // Check if client has journal entries (proxy for engagement/progress)
      const journalCount = await this.prisma.journalEntry.count({
        where: { userId: rel.clientId },
      });

      // Check if client has completed worksheets
      const completedWorksheets = await this.prisma.worksheet.count({
        where: {
          clientId: rel.clientId,
          therapistId,
          status: { in: ['SUBMITTED', 'REVIEWED'] },
        },
      });

      // If client has journals or completed worksheets, consider them making progress
      if (journalCount > 0 || completedWorksheets > 0) {
        clientsWithProgress++;
      }
    }

    return relationships.length > 0 ? clientsWithProgress / relationships.length : 0;
  }

  /**
   * Calculate workload capacity (current clients / estimated max capacity)
   */
  private async calculateWorkloadCapacity(therapistId: string): Promise<number> {
    const activeClients = await this.prisma.clientTherapist.count({
      where: {
        therapistId,
        status: 'active',
      },
    });

    // Estimate max capacity based on availability
    // Assume therapist can handle ~20-30 clients max (adjustable)
    const estimatedMaxCapacity = 25;
    return Math.min(activeClients / estimatedMaxCapacity, 1);
  }

  /**
   * Calculate availability utilization (booked hours / available hours)
   */
  private async calculateAvailabilityUtilization(therapistId: string): Promise<number> {
    // Get therapist availability
    const availabilities = await this.prisma.therapistAvailability.findMany({
      where: {
        therapistId,
        isAvailable: true,
      },
    });

    if (availabilities.length === 0) return 0;

    // Calculate total available hours per week
    let totalAvailableHours = 0;
    availabilities.forEach((avail) => {
      const start = this.parseTime(avail.startTime);
      const end = this.parseTime(avail.endTime);
      const hours = (end - start) / (1000 * 60 * 60);
      totalAvailableHours += hours;
    });

    // Get booked hours for next 4 weeks
    const fourWeeksFromNow = new Date();
    fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28);

    const bookedMeetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        startTime: { lte: fourWeeksFromNow },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
      },
      select: {
        duration: true,
      },
    });

    const totalBookedHours = bookedMeetings.reduce(
      (sum, m) => sum + (m.duration || 60) / 60,
      0,
    );

    // Calculate utilization for 4 weeks
    const availableHoursForPeriod = totalAvailableHours * 4;
    return availableHoursForPeriod > 0
      ? Math.min(totalBookedHours / availableHoursForPeriod, 1)
      : 0;
  }

  /**
   * Parse time string (HH:MM) to Date
   */
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
  }

  /**
   * Calculate success rates by condition
   */
  private async calculateSuccessRatesByCondition(
    therapistId: string,
  ): Promise<Record<string, number>> {
    // Get all clients with this therapist
    const relationships = await this.prisma.clientTherapist.findMany({
      where: { therapistId },
      select: { clientId: true },
    });

    const successRatesData: Record<string, { total: number; successful: number }> = {};

    // For each client, check their pre-assessment conditions and progress
    for (const rel of relationships) {
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: rel.clientId },
        orderBy: { createdAt: 'desc' },
        select: {
          severityLevels: true,
        },
      });

      if (!preAssessment) continue;

      const severityLevels = preAssessment.severityLevels as Record<string, string> | null;
      if (!severityLevels) continue;

      // Check if client is making progress (has multiple sessions, journals, worksheets)
      const sessionCount = await this.prisma.meeting.count({
        where: {
          clientId: rel.clientId,
          therapistId,
          status: 'COMPLETED',
        },
      });

      const hasProgress = sessionCount >= 3; // Simplified: 3+ sessions = success

      // Update success rates for each condition
      Object.keys(severityLevels).forEach((condition) => {
        if (!successRatesData[condition]) {
          successRatesData[condition] = { total: 0, successful: 0 };
        }
        successRatesData[condition].total++;
        if (hasProgress) {
          successRatesData[condition].successful++;
        }
      });
    }

    // Convert to rates
    const rates: Record<string, number> = {};
    Object.entries(successRatesData).forEach(([condition, data]) => {
      rates[condition] = data.total > 0 ? data.successful / data.total : 0;
    });

    return rates;
  }

  /**
   * Extract communication style from reviews
   */
  private async extractCommunicationStyle(therapistId: string): Promise<{
    directness: number;
    warmth: number;
    structure: number;
    flexibility: number;
  }> {
    const reviews = await this.prisma.review.findMany({
      where: { therapistId },
      select: {
        content: true,
        rating: true,
      },
    });

    if (reviews.length === 0) {
      // Default neutral style
      return {
        directness: 0.5,
        warmth: 0.5,
        structure: 0.5,
        flexibility: 0.5,
      };
    }

    // Simple keyword-based analysis
    const content = reviews.map((r) => r.content?.toLowerCase() || '').join(' ');

    // Directness keywords
    const directKeywords = ['direct', 'straightforward', 'clear', 'honest', 'blunt'];
    const directScore = directKeywords.filter((kw) => content.includes(kw)).length / directKeywords.length;

    // Warmth keywords
    const warmthKeywords = ['warm', 'caring', 'empathetic', 'compassionate', 'supportive', 'kind'];
    const warmthScore = Math.min(warmthKeywords.filter((kw) => content.includes(kw)).length / warmthKeywords.length, 1);

    // Structure keywords
    const structureKeywords = ['structured', 'organized', 'systematic', 'methodical', 'planned'];
    const structureScore = Math.min(structureKeywords.filter((kw) => content.includes(kw)).length / structureKeywords.length, 1);

    // Flexibility keywords
    const flexibilityKeywords = ['flexible', 'adaptable', 'open', 'accommodating', 'adjustable'];
    const flexibilityScore = Math.min(flexibilityKeywords.filter((kw) => content.includes(kw)).length / flexibilityKeywords.length, 1);

    // Average rating also influences scores
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingFactor = (avgRating - 1) / 4; // Normalize 1-5 to 0-1

    return {
      directness: Math.min(directScore * 0.7 + ratingFactor * 0.3, 1),
      warmth: Math.min(warmthScore * 0.7 + ratingFactor * 0.3, 1),
      structure: Math.min(structureScore * 0.7 + ratingFactor * 0.3, 1),
      flexibility: Math.min(flexibilityScore * 0.7 + ratingFactor * 0.3, 1),
    };
  }

  /**
   * Calculate overall performance score (0-100)
   */
  private calculatePerformanceScore(metrics: {
    clientRetentionRate: number;
    noShowRate: number;
    cancellationRate: number;
    clientProgressRate: number;
    workloadCapacity: number;
    availabilityUtilization: number;
  }): number {
    // Weighted combination
    const retentionScore = metrics.clientRetentionRate * 30; // 30 points
    const progressScore = metrics.clientProgressRate * 25; // 25 points
    const utilizationScore = metrics.availabilityUtilization * 20; // 20 points
    const attendanceScore = (1 - (metrics.noShowRate + metrics.cancellationRate) / 2) * 15; // 15 points (inverse)
    const capacityScore = (1 - metrics.workloadCapacity) * 10; // 10 points (less capacity = better for new clients)

    return Math.round(
      retentionScore +
        progressScore +
        utilizationScore +
        attendanceScore +
        capacityScore,
    );
  }
}

