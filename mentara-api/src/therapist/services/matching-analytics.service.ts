import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { TherapistScore } from './advanced-matching.service';
import { CompatibilityAnalysis } from './compatibility-analysis.service';

export interface MatchingMetrics {
  totalRecommendations: number;
  successfulMatches: number;
  averageMatchScore: number;
  averageSatisfactionScore: number;
  clickThroughRate: number;
  conversionRate: number;
  retentionRate: number;
}

export interface RecommendationPerformance {
  algorithmName: string;
  version: string;
  metrics: MatchingMetrics;
  periodStart: Date;
  periodEnd: Date;
}

@Injectable()
export class MatchingAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a recommendation being made
   */
  async trackRecommendation(
    clientId: string,
    therapistScores: TherapistScore[],
    algorithmVersion: string = 'advanced_v1.0',
  ): Promise<void> {
    try {
      const matchHistoryRecords = therapistScores.map((score, index) => ({
        clientId,
        therapistId: score.therapist.userId,
        totalScore: score.totalScore,
        conditionScore: Math.round(score.breakdown.conditionScore),
        approachScore: Math.round(score.breakdown.approachScore),
        experienceScore: Math.round(score.breakdown.experienceScore),
        reviewScore: Math.round(score.breakdown.reviewScore),
        logisticsScore: Math.round(score.breakdown.logisticsScore),
        primaryMatches: score.matchExplanation.primaryMatches,
        secondaryMatches: score.matchExplanation.secondaryMatches,
        approachMatches: score.matchExplanation.approachMatches,
        recommendationRank: index + 1,
        totalRecommendations: therapistScores.length,
        recommendationAlgorithm: algorithmVersion,
      }));

      await this.prisma.matchHistory.createMany({
        data: matchHistoryRecords,
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Failed to track recommendation:', error);
      // Don't throw - analytics shouldn't break the recommendation flow
    }
  }

  /**
   * Track compatibility analysis
   */
  async trackCompatibilityAnalysis(
    clientId: string,
    therapistId: string,
    compatibility: CompatibilityAnalysis,
    analysisVersion: string = '1.0',
  ): Promise<void> {
    try {
      await this.prisma.clientCompatibility.upsert({
        where: {
          clientId_therapistId: {
            clientId,
            therapistId,
          },
        },
        update: {
          personalityCompatibility:
            compatibility.personalityCompatibility.overallCompatibility,
          sessionCompatibility:
            compatibility.sessionCompatibility.overallCompatibility,
          demographicCompatibility:
            compatibility.demographicCompatibility.overallCompatibility,
          overallCompatibility: compatibility.overallCompatibilityScore,
          communicationStyleScore:
            compatibility.personalityCompatibility.communicationStyle,
          personalityMatchScore:
            compatibility.personalityCompatibility.personalityMatch,
          culturalCompatibilityScore:
            compatibility.personalityCompatibility.culturalCompatibility,
          formatMatchScore: compatibility.sessionCompatibility.formatMatch,
          durationMatchScore: compatibility.sessionCompatibility.durationMatch,
          frequencyMatchScore:
            compatibility.sessionCompatibility.frequencyMatch,
          schedulingCompatibilityScore:
            compatibility.sessionCompatibility.schedulingCompatibility,
          ageCompatibilityScore:
            compatibility.demographicCompatibility.ageCompatibility,
          genderCompatibilityScore:
            compatibility.demographicCompatibility.genderCompatibility,
          languageCompatibilityScore:
            compatibility.demographicCompatibility.languageCompatibility,
          strengths: compatibility.compatibilityFactors.strengths,
          concerns: compatibility.compatibilityFactors.concerns,
          recommendations: compatibility.compatibilityFactors.recommendations,
          analysisVersion,
          updatedAt: new Date(),
        },
        create: {
          clientId,
          therapistId,
          personalityCompatibility:
            compatibility.personalityCompatibility.overallCompatibility,
          sessionCompatibility:
            compatibility.sessionCompatibility.overallCompatibility,
          demographicCompatibility:
            compatibility.demographicCompatibility.overallCompatibility,
          overallCompatibility: compatibility.overallCompatibilityScore,
          communicationStyleScore:
            compatibility.personalityCompatibility.communicationStyle,
          personalityMatchScore:
            compatibility.personalityCompatibility.personalityMatch,
          culturalCompatibilityScore:
            compatibility.personalityCompatibility.culturalCompatibility,
          formatMatchScore: compatibility.sessionCompatibility.formatMatch,
          durationMatchScore: compatibility.sessionCompatibility.durationMatch,
          frequencyMatchScore:
            compatibility.sessionCompatibility.frequencyMatch,
          schedulingCompatibilityScore:
            compatibility.sessionCompatibility.schedulingCompatibility,
          ageCompatibilityScore:
            compatibility.demographicCompatibility.ageCompatibility,
          genderCompatibilityScore:
            compatibility.demographicCompatibility.genderCompatibility,
          languageCompatibilityScore:
            compatibility.demographicCompatibility.languageCompatibility,
          strengths: compatibility.compatibilityFactors.strengths,
          concerns: compatibility.compatibilityFactors.concerns,
          recommendations: compatibility.compatibilityFactors.recommendations,
          analysisVersion,
        },
      });
    } catch (error) {
      console.error('Failed to track compatibility analysis:', error);
    }
  }

  /**
   * Track when a user views a therapist recommendation
   */
  async trackRecommendationView(
    clientId: string,
    therapistId: string,
  ): Promise<void> {
    try {
      await this.prisma.matchHistory.updateMany({
        where: {
          clientId,
          therapistId,
          wasViewed: false,
        },
        data: {
          wasViewed: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to track recommendation view:', error);
    }
  }

  /**
   * Track when a user contacts a therapist
   */
  async trackTherapistContact(
    clientId: string,
    therapistId: string,
  ): Promise<void> {
    try {
      await this.prisma.matchHistory.updateMany({
        where: {
          clientId,
          therapistId,
          wasContacted: false,
        },
        data: {
          wasContacted: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to track therapist contact:', error);
    }
  }

  /**
   * Track when a recommendation becomes an actual client-therapist relationship
   */
  async trackSuccessfulMatch(
    clientId: string,
    therapistId: string,
  ): Promise<void> {
    try {
      await this.prisma.matchHistory.updateMany({
        where: {
          clientId,
          therapistId,
          becameClient: false,
        },
        data: {
          becameClient: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to track successful match:', error);
    }
  }

  /**
   * Track recommendation feedback from users
   */
  async recordRecommendationFeedback(
    clientId: string,
    therapistId: string,
    feedback: {
      relevanceScore: number;
      accuracyScore: number;
      helpfulnessScore: number;
      feedbackText?: string;
      selectedTherapist?: boolean;
      reasonNotSelected?: string;
    },
  ): Promise<void> {
    try {
      const matchHistory = await this.prisma.matchHistory.findFirst({
        where: { clientId, therapistId },
        orderBy: { createdAt: 'desc' },
      });

      await this.prisma.recommendationFeedback.create({
        data: {
          clientId,
          therapistId,
          matchHistoryId: matchHistory?.id,
          relevanceScore: feedback.relevanceScore,
          accuracyScore: feedback.accuracyScore,
          helpfulnessScore: feedback.helpfulnessScore,
          feedbackText: feedback.feedbackText,
          selectedTherapist: feedback.selectedTherapist || false,
          reasonNotSelected: feedback.reasonNotSelected,
        },
      });
    } catch (error) {
      console.error('Failed to record recommendation feedback:', error);
    }
  }

  /**
   * Get algorithm performance metrics for a time period
   */
  async getAlgorithmPerformance(
    algorithmName: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MatchingMetrics> {
    try {
      const matchHistory = await this.prisma.matchHistory.findMany({
        where: {
          recommendationAlgorithm: algorithmName,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalRecommendations = matchHistory.length;
      const successfulMatches = matchHistory.filter(
        (m) => m.becameClient,
      ).length;
      const viewedRecommendations = matchHistory.filter(
        (m) => m.wasViewed,
      ).length;
      const contactedTherapists = matchHistory.filter(
        (m) => m.wasContacted,
      ).length;

      const averageMatchScore =
        totalRecommendations > 0
          ? matchHistory.reduce((sum, m) => sum + m.totalScore, 0) /
            totalRecommendations
          : 0;

      // Get satisfaction scores from feedback
      const feedbackData = await this.prisma.recommendationFeedback.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          overallSatisfaction: {
            not: null,
          },
        },
      });

      const averageSatisfactionScore =
        feedbackData.length > 0
          ? feedbackData.reduce(
              (sum, f) => sum + (f.overallSatisfaction || 0),
              0,
            ) / feedbackData.length
          : 0;

      const clickThroughRate =
        totalRecommendations > 0
          ? (viewedRecommendations / totalRecommendations) * 100
          : 0;

      const conversionRate =
        totalRecommendations > 0
          ? (successfulMatches / totalRecommendations) * 100
          : 0;

      // Retention rate calculation would require session data
      const retentionRate = 0; // Placeholder - implement based on session tracking

      return {
        totalRecommendations,
        successfulMatches,
        averageMatchScore,
        averageSatisfactionScore,
        clickThroughRate,
        conversionRate,
        retentionRate,
      };
    } catch (error) {
      console.error('Failed to get algorithm performance:', error);
      throw error;
    }
  }

  /**
   * Store algorithm performance snapshot
   */
  async storePerformanceSnapshot(
    algorithmName: string,
    version: string,
    metrics: MatchingMetrics,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    try {
      await this.prisma.algorithmPerformance.create({
        data: {
          algorithmName,
          version,
          totalRecommendations: metrics.totalRecommendations,
          successfulMatches: metrics.successfulMatches,
          averageMatchScore: metrics.averageMatchScore,
          averageSatisfactionScore: metrics.averageSatisfactionScore,
          clickThroughRate: metrics.clickThroughRate,
          conversionRate: metrics.conversionRate,
          retentionRate: metrics.retentionRate,
          periodStart,
          periodEnd,
        },
      });
    } catch (error) {
      console.error('Failed to store performance snapshot:', error);
    }
  }

  /**
   * Get top performing therapists by recommendation success
   */
  async getTopPerformingTherapists(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const whereClause: any = {
        becameClient: true,
      };

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const topTherapists = await this.prisma.matchHistory.groupBy({
        by: ['therapistId'],
        where: whereClause,
        _count: {
          id: true,
        },
        _avg: {
          totalScore: true,
          clientSatisfactionScore: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: limit,
      });

      // Enrich with therapist data
      const enrichedData = await Promise.all(
        topTherapists.map(async (therapist) => {
          const therapistData = await this.prisma.therapist.findUnique({
            where: { userId: therapist.therapistId },
            include: { user: true },
          });

          return {
            therapist: therapistData,
            successfulMatches: therapist._count.id,
            averageMatchScore: therapist._avg.totalScore || 0,
            averageSatisfactionScore:
              therapist._avg.clientSatisfactionScore || 0,
          };
        }),
      );

      return enrichedData;
    } catch (error) {
      console.error('Failed to get top performing therapists:', error);
      throw error;
    }
  }

  /**
   * Get matching insights for improving the algorithm
   */
  async getMatchingInsights(startDate: Date, endDate: Date) {
    try {
      // Most successful condition matches
      const conditionMatches = await this.prisma.matchHistory.findMany({
        where: {
          becameClient: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          primaryMatches: true,
          secondaryMatches: true,
          totalScore: true,
        },
      });

      // Most successful approach matches
      const approachMatches = await this.prisma.matchHistory.findMany({
        where: {
          becameClient: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          approachMatches: true,
          totalScore: true,
        },
      });

      // Score distribution analysis
      const scoreDistribution = await this.prisma.matchHistory.groupBy({
        by: ['totalScore'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          totalScore: 'asc',
        },
      });

      return {
        conditionMatches,
        approachMatches,
        scoreDistribution,
      };
    } catch (error) {
      console.error('Failed to get matching insights:', error);
      throw error;
    }
  }
}
