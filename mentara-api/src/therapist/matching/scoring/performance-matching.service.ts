import { Injectable, Logger } from '@nestjs/common';
import { TherapistPerformanceAnalysisService, TherapistPerformanceAnalysis } from '../analysis/therapist-performance-analysis.service';
import { ReviewSentimentAnalysisService, ReviewSentimentAnalysis } from '../analysis/review-sentiment-analysis.service';
import { UserConditionProfile } from '../../services/advanced-matching.service';

export interface PerformanceMatchScore {
  successRateMatch: number; // 0-100
  workloadMatch: number; // 0-100
  availabilityMatch: number; // 0-100
  communicationStyleMatch: number; // 0-100
  overallScore: number; // 0-100
  explanation: {
    successRateMatch: string;
    workloadMatch: string;
    availabilityMatch: string;
    communicationStyleMatch: string;
    recommendations: string[];
  };
}

@Injectable()
export class PerformanceMatchingService {
  private readonly logger = new Logger(PerformanceMatchingService.name);

  constructor(
    private readonly therapistPerformanceAnalysis: TherapistPerformanceAnalysisService,
    private readonly reviewSentimentAnalysis: ReviewSentimentAnalysisService,
  ) {}

  /**
   * Calculate performance-based match score
   */
  async calculatePerformanceMatch(
    therapistId: string,
    clientConditionProfile: UserConditionProfile,
  ): Promise<PerformanceMatchScore> {
    try {
      // Get therapist performance analysis
      const therapistPerformance =
        await this.therapistPerformanceAnalysis.analyzeTherapistPerformance(therapistId);

      // Get review sentiment analysis
      const reviewSentiment = await this.reviewSentimentAnalysis.analyzeReviewSentiment(
        therapistId,
      );

      if (!therapistPerformance) {
        return this.getNeutralScore();
      }

      // Calculate success rate match
      const successRateMatch = this.calculateSuccessRateMatch(
        clientConditionProfile,
        therapistPerformance,
      );

      // Calculate workload match
      const workloadMatch = this.calculateWorkloadMatch(therapistPerformance);

      // Calculate availability match
      const availabilityMatch = this.calculateAvailabilityMatch(therapistPerformance);

      // Calculate communication style match
      const communicationStyleMatch = this.calculateCommunicationStyleMatch(
        clientConditionProfile,
        therapistPerformance,
        reviewSentiment,
      );

      // Calculate overall score
      const overallScore = Math.round(
        successRateMatch * 0.35 +
          workloadMatch * 0.25 +
          availabilityMatch * 0.2 +
          communicationStyleMatch * 0.2,
      );

      // Build explanation
      const explanation = this.buildExplanation(
        therapistPerformance,
        reviewSentiment,
        successRateMatch,
        workloadMatch,
        availabilityMatch,
        communicationStyleMatch,
      );

      return {
        successRateMatch,
        workloadMatch,
        availabilityMatch,
        communicationStyleMatch,
        overallScore,
        explanation,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating performance match: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.getNeutralScore();
    }
  }

  /**
   * Calculate success rate match based on client conditions
   */
  private calculateSuccessRateMatch(
    clientConditionProfile: UserConditionProfile,
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    const allConditions = [
      ...clientConditionProfile.primaryConditions.map((c) => c.condition),
      ...clientConditionProfile.secondaryConditions.map((c) => c.condition),
    ];

    if (allConditions.length === 0) {
      return 50; // Neutral if no conditions
    }

    // Calculate average success rate for client's conditions
    let totalSuccessRate = 0;
    let matchedConditions = 0;

    allConditions.forEach((condition) => {
      const successRate = therapistPerformance.successRatesByCondition[condition];
      if (successRate !== undefined) {
        totalSuccessRate += successRate;
        matchedConditions++;
      }
    });

    if (matchedConditions === 0) {
      return 50; // Neutral if no success rate data
    }

    const avgSuccessRate = totalSuccessRate / matchedConditions;
    return Math.round(avgSuccessRate * 100); // Convert 0-1 to 0-100
  }

  /**
   * Calculate workload match (lower workload = better for new clients)
   */
  private calculateWorkloadMatch(
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    // Lower workload capacity = better (more availability for new clients)
    const workloadScore = (1 - therapistPerformance.workloadCapacity) * 100;
    return Math.round(workloadScore);
  }

  /**
   * Calculate availability match
   */
  private calculateAvailabilityMatch(
    therapistPerformance: TherapistPerformanceAnalysis,
  ): number {
    // Higher utilization = therapist is in demand, but also busy
    // Optimal range is 0.4-0.7 (active but not overloaded)
    const utilization = therapistPerformance.availabilityUtilization;

    if (utilization >= 0.4 && utilization <= 0.7) {
      return 90; // Optimal range
    } else if (utilization < 0.4) {
      return 60; // Lower utilization (available but maybe less experienced)
    } else {
      return 40; // High utilization (busy, less availability)
    }
  }

  /**
   * Calculate communication style match
   */
  private calculateCommunicationStyleMatch(
    clientConditionProfile: UserConditionProfile,
    therapistPerformance: TherapistPerformanceAnalysis,
    reviewSentiment: ReviewSentimentAnalysis | null,
  ): number {
    let score = 50; // Start with neutral

    // Use communication style from performance analysis
    const style = therapistPerformance.communicationStyle;

    // For high-severity conditions, prefer warm and flexible therapists
    const hasHighSeverity = clientConditionProfile.primaryConditions.some(
      (c) => c.weight >= 4,
    );

    if (hasHighSeverity) {
      if (style.warmth > 0.7) {
        score += 20; // High warmth for high-severity cases
      }
      if (style.flexibility > 0.7) {
        score += 15; // Flexibility for complex cases
      }
    } else {
      // For lower severity, structure can be beneficial
      if (style.structure > 0.6) {
        score += 15;
      }
    }

    // Consider review sentiment
    if (reviewSentiment) {
      if (reviewSentiment.overallSentiment === 'positive') {
        score += 10;
      } else if (reviewSentiment.overallSentiment === 'negative') {
        score -= 15;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Build explanation for performance match
   */
  private buildExplanation(
    therapistPerformance: TherapistPerformanceAnalysis,
    reviewSentiment: ReviewSentimentAnalysis | null,
    successRateMatch: number,
    workloadMatch: number,
    availabilityMatch: number,
    communicationStyleMatch: number,
  ): {
    successRateMatch: string;
    workloadMatch: string;
    availabilityMatch: string;
    communicationStyleMatch: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Success rate explanation
    let successRateText = '';
    if (successRateMatch > 70) {
      successRateText = 'Excellent success rate match for your conditions';
    } else if (successRateMatch > 50) {
      successRateText = 'Good success rate match';
    } else {
      successRateText = 'Limited success rate data for your specific conditions';
    }

    // Workload explanation
    let workloadText = '';
    if (therapistPerformance.workloadCapacity < 0.5) {
      workloadText = 'Therapist has good availability for new clients';
    } else if (therapistPerformance.workloadCapacity < 0.8) {
      workloadText = 'Therapist has moderate workload';
    } else {
      workloadText = 'Therapist has high workload - limited availability';
      recommendations.push('Therapist may have limited availability due to high client load');
    }

    // Availability explanation
    let availabilityText = '';
    if (therapistPerformance.availabilityUtilization >= 0.4 && therapistPerformance.availabilityUtilization <= 0.7) {
      availabilityText = 'Therapist has optimal availability utilization';
    } else if (therapistPerformance.availabilityUtilization < 0.4) {
      availabilityText = 'Therapist has good availability';
    } else {
      availabilityText = 'Therapist has high booking rate - may be less available';
    }

    // Communication style explanation
    let communicationText = '';
    const style = therapistPerformance.communicationStyle;
    const traits: string[] = [];
    if (style.warmth > 0.7) traits.push('warm and empathetic');
    if (style.directness > 0.7) traits.push('direct and clear');
    if (style.structure > 0.7) traits.push('structured and organized');
    if (style.flexibility > 0.7) traits.push('flexible and adaptable');

    if (traits.length > 0) {
      communicationText = `Communication style: ${traits.join(', ')}`;
    } else {
      communicationText = 'Balanced communication style';
    }

    // Additional recommendations
    if (therapistPerformance.clientRetentionRate > 0.7) {
      recommendations.push('Therapist has excellent client retention rate');
    }

    if (therapistPerformance.noShowRate > 0.2) {
      recommendations.push('Therapist has higher than average no-show rate');
    }

    if (reviewSentiment && reviewSentiment.strengths.length > 0) {
      recommendations.push(
        `Common strengths: ${reviewSentiment.strengths.slice(0, 2).join(', ')}`,
      );
    }

    return {
      successRateMatch: successRateText,
      workloadMatch: workloadText,
      availabilityMatch: availabilityText,
      communicationStyleMatch: communicationText,
      recommendations,
    };
  }

  /**
   * Get neutral score when data is unavailable
   */
  private getNeutralScore(): PerformanceMatchScore {
    return {
      successRateMatch: 50,
      workloadMatch: 50,
      availabilityMatch: 50,
      communicationStyleMatch: 50,
      overallScore: 50,
      explanation: {
        successRateMatch: 'Performance data unavailable',
        workloadMatch: 'Workload data unavailable',
        availabilityMatch: 'Availability data unavailable',
        communicationStyleMatch: 'Communication style data unavailable',
        recommendations: [],
      },
    };
  }
}

