import { Injectable, Logger } from '@nestjs/common';
import { ClientEngagementAnalysisService, ClientEngagementAnalysis } from '../analysis/client-engagement-analysis.service';
import { TherapistPerformanceAnalysisService, TherapistPerformanceAnalysis } from '../analysis/therapist-performance-analysis.service';

export interface EngagementMatchScore {
  engagementCompatibility: number; // 0-100
  retentionMatch: number; // 0-100
  sessionTimeMatch: number; // 0-100
  overallScore: number; // 0-100
  explanation: {
    engagementLevel: string;
    retentionMatch: string;
    sessionTimeMatch: string;
    recommendations: string[];
  };
}

@Injectable()
export class EngagementMatchingService {
  private readonly logger = new Logger(EngagementMatchingService.name);

  constructor(
    private readonly clientEngagementAnalysis: ClientEngagementAnalysisService,
    private readonly therapistPerformanceAnalysis: TherapistPerformanceAnalysisService,
  ) {}

  /**
   * Calculate engagement-based match score
   */
  async calculateEngagementMatch(
    clientId: string,
    therapistId: string,
  ): Promise<EngagementMatchScore> {
    try {
      // Get client engagement analysis
      const clientEngagement = await this.clientEngagementAnalysis.analyzeClientEngagement(
        clientId,
      );

      // Get therapist performance analysis
      const therapistPerformance =
        await this.therapistPerformanceAnalysis.analyzeTherapistPerformance(therapistId);

      if (!clientEngagement || !therapistPerformance) {
        // Return neutral score if data unavailable
        return this.getNeutralScore();
      }

      // Calculate engagement compatibility
      const engagementCompatibility = this.calculateEngagementCompatibility(
        clientEngagement,
        therapistPerformance,
      );

      // Calculate retention match
      const retentionMatch = this.calculateRetentionMatch(
        clientEngagement,
        therapistPerformance,
      );

      // Calculate session time match
      const sessionTimeMatch = this.calculateSessionTimeMatch(
        clientEngagement,
        therapistPerformance,
      );

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        engagementCompatibility * 0.4 + retentionMatch * 0.4 + sessionTimeMatch * 0.2,
      );

      // Build explanation
      const explanation = this.buildExplanation(
        clientEngagement,
        therapistPerformance,
        engagementCompatibility,
        retentionMatch,
        sessionTimeMatch,
      );

      return {
        engagementCompatibility,
        retentionMatch,
        sessionTimeMatch,
        overallScore,
        explanation,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating engagement match: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.getNeutralScore();
    }
  }

  /**
   * Calculate engagement compatibility score
   */
  private calculateEngagementCompatibility(
    clientEngagement: ClientEngagementAnalysis,
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    let score = 50; // Start with neutral

    // High-engagement clients should match with high-response-rate therapists
    if (clientEngagement.engagementLevel === 'high') {
      if (therapistPerformance.averageResponseTime !== null) {
        // Faster response = better match for high-engagement clients
        if (therapistPerformance.averageResponseTime < 60) {
          // Response within 1 hour
          score += 30;
        } else if (therapistPerformance.averageResponseTime < 240) {
          // Response within 4 hours
          score += 15;
        }
      }
    }

    // Low-engagement clients should match with high-retention therapists
    if (clientEngagement.engagementLevel === 'low') {
      if (therapistPerformance.clientRetentionRate > 0.7) {
        score += 30; // High retention therapist
      } else if (therapistPerformance.clientRetentionRate > 0.5) {
        score += 15;
      }
    }

    // Medium-engagement clients work with most therapists
    if (clientEngagement.engagementLevel === 'medium') {
      score += 10; // Slight bonus for medium engagement
    }

    // Match based on platform usage patterns
    if (clientEngagement.platformUsageScore > 0.7 && therapistPerformance.availabilityUtilization > 0.6) {
      score += 10; // Both highly active
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate retention match score
   */
  private calculateRetentionMatch(
    clientEngagement: ClientEngagementAnalysis,
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    let score = 50; // Start with neutral

    // Clients with low attendance need high-retention therapists
    if (clientEngagement.meetingAttendanceRate < 0.7) {
      if (therapistPerformance.clientRetentionRate > 0.7) {
        score += 40; // High retention therapist for low-attendance client
      } else if (therapistPerformance.clientRetentionRate > 0.5) {
        score += 20;
      } else {
        score -= 20; // Penalty for low retention
      }
    } else {
      // High-attendance clients work well with most therapists
      score += 20;
    }

    // Consider no-show and cancellation rates
    const attendanceIssues = therapistPerformance.noShowRate + therapistPerformance.cancellationRate;
    if (attendanceIssues > 0.3) {
      score -= 15; // Penalty for high no-show/cancellation rates
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate session time match score
   */
  private calculateSessionTimeMatch(
    clientEngagement: ClientEngagementAnalysis,
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    // If client has preferred session times, check if therapist is available
    if (clientEngagement.preferredSessionTimes.length === 0) {
      return 50; // Neutral if no preference
    }

    // This is simplified - in production, you'd check actual therapist availability
    // For now, we'll give a bonus if client has clear preferences (shows engagement)
    return 60; // Slight bonus for having preferences
  }

  /**
   * Build explanation for engagement match
   */
  private buildExplanation(
    clientEngagement: ClientEngagementAnalysis,
    therapistPerformance: TherapistPerformanceAnalysis,
    engagementCompatibility: number,
    retentionMatch: number,
    sessionTimeMatch: number,
  ): {
    engagementLevel: string;
    retentionMatch: string;
    sessionTimeMatch: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Engagement level explanation
    let engagementLevel = `Client has ${clientEngagement.engagementLevel} engagement level`;
    if (clientEngagement.engagementLevel === 'high') {
      engagementLevel += ' and is highly active on the platform';
    } else if (clientEngagement.engagementLevel === 'low') {
      engagementLevel += ' and may need additional support';
    }

    // Retention match explanation
    let retentionMatchText = '';
    if (retentionMatch > 70) {
      retentionMatchText = 'Excellent retention match - therapist has strong client retention';
    } else if (retentionMatch > 50) {
      retentionMatchText = 'Good retention match';
    } else {
      retentionMatchText = 'Retention match could be improved';
    }

    // Session time match explanation
    let sessionTimeMatchText = '';
    if (clientEngagement.preferredSessionTimes.length > 0) {
      sessionTimeMatchText = `Client prefers ${clientEngagement.preferredSessionTimes.join(' and ')} sessions`;
    } else {
      sessionTimeMatchText = 'No specific session time preferences';
    }

    // Recommendations
    if (clientEngagement.engagementLevel === 'low' && therapistPerformance.clientRetentionRate < 0.6) {
      recommendations.push('Consider a therapist with higher client retention for better engagement');
    }

    if (clientEngagement.meetingAttendanceRate < 0.7) {
      recommendations.push('Client may benefit from a therapist experienced with attendance challenges');
    }

    if (therapistPerformance.workloadCapacity > 0.8) {
      recommendations.push('Therapist has high workload - may have limited availability');
    }

    return {
      engagementLevel,
      retentionMatch: retentionMatchText,
      sessionTimeMatch: sessionTimeMatchText,
      recommendations,
    };
  }

  /**
   * Get neutral score when data is unavailable
   */
  private getNeutralScore(): EngagementMatchScore {
    return {
      engagementCompatibility: 50,
      retentionMatch: 50,
      sessionTimeMatch: 50,
      overallScore: 50,
      explanation: {
        engagementLevel: 'Engagement data unavailable',
        retentionMatch: 'Retention data unavailable',
        sessionTimeMatch: 'Session time data unavailable',
        recommendations: [],
      },
    };
  }
}

