import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PreAssessment } from '@prisma/client';
import {
  TherapistRecommendationRequest,
  TherapistRecommendationResponse,
} from './dto/therapist-application.dto';
import {
  AdvancedMatchingService,
  TherapistScore,
} from './services/advanced-matching.service';
import { CompatibilityAnalysisService } from './services/compatibility-analysis.service';
import { MatchingAnalyticsService } from './services/matching-analytics.service';

@Injectable()
export class TherapistRecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly advancedMatching: AdvancedMatchingService,
    private readonly compatibilityAnalysis: CompatibilityAnalysisService,
    private readonly matchingAnalytics: MatchingAnalyticsService,
  ) {}

  private calculateYearsOfExperience(startDate: Date): number {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() &&
        now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return years;
  }

  async getRecommendedTherapists(
    request: TherapistRecommendationRequest,
  ): Promise<TherapistRecommendationResponse> {
    try {
      // Get user's comprehensive data including preferences
      const user = await this.prisma.client.findUnique({
        where: { userId: request.userId },
        include: {
          preAssessment: true,
          clientPreferences: true,
          user: true,
        },
      });
      if (!user) throw new NotFoundException('User not found');
      if (!user.preAssessment)
        throw new NotFoundException('No pre-assessment found for user');

      // Extract user conditions and severity levels
      const userConditions = this.extractUserConditions(user.preAssessment);
      const severityLevels = user.preAssessment.severityLevels as Record<
        string,
        string
      >;

      // Fetch therapists with comprehensive data
      const therapists = await this.prisma.therapist.findMany({
        where: {
          status: 'approved',
          ...(request.province && { province: request.province }),
          ...(request.maxHourlyRate && {
            hourlyRate: { lte: request.maxHourlyRate },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(request.limit ?? 10, 50), // Increase limit for better filtering
        include: {
          user: true,
          reviews: {
            where: { status: 'APPROVED' },
            select: {
              rating: true,
              status: true,
            },
          },
        },
      });

      // Use advanced matching algorithm
      const therapistScores: TherapistScore[] = [];

      for (const therapist of therapists) {
        try {
          const score = await this.advancedMatching.calculateAdvancedMatch(
            user,
            therapist,
          );
          therapistScores.push(score);
        } catch (error) {
          // Fallback to basic scoring if advanced matching fails
          console.warn(
            `Advanced matching failed for therapist ${therapist.userId}:`,
            error,
          );
          const basicScore = this.calculateMatchScore(
            therapist,
            userConditions,
          );
          therapistScores.push({
            therapist,
            totalScore: basicScore,
            breakdown: {
              conditionScore: basicScore * 0.6,
              approachScore: 0,
              experienceScore: basicScore * 0.4,
              reviewScore: 0,
              logisticsScore: 0,
            },
            matchExplanation: {
              primaryMatches: this.getPrimaryConditions(userConditions),
              secondaryMatches: this.getSecondaryConditions(userConditions),
              approachMatches: [],
              experienceYears: this.calculateYearsOfExperience(
                therapist.practiceStartDate,
              ),
              averageRating: 0,
              totalReviews: 0,
              successRates: {},
            },
          });
        }
      }

      // Sort by total score descending
      const sortedTherapistScores = therapistScores.sort(
        (a, b) => b.totalScore - a.totalScore,
      );

      // Take only the requested number of results
      const finalResults = sortedTherapistScores.slice(0, request.limit ?? 10);

      // Track recommendation analytics
      await this.matchingAnalytics.trackRecommendation(
        request.userId,
        finalResults,
        'advanced_v1.0',
      );

      // Transform to expected format
      const therapistsWithScores = finalResults.map((score) => ({
        ...score.therapist,
        matchScore: score.totalScore,
        scoreBreakdown: score.breakdown,
        matchExplanation: score.matchExplanation,
      }));

      // Determine primary and secondary conditions
      const primaryConditions = this.getPrimaryConditions(userConditions);
      const secondaryConditions = this.getSecondaryConditions(userConditions);

      return {
        totalCount: therapistsWithScores.length,
        userConditions: Object.keys(userConditions),
        therapists: therapistsWithScores,
        matchCriteria: {
          primaryConditions,
          secondaryConditions,
          severityLevels,
        },
        page: 1,
        pageSize: request.limit ?? 10,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to get therapist recommendations',
      );
    }
  }

  /**
   * Get detailed compatibility analysis between a client and therapist
   */
  async getCompatibilityAnalysis(clientId: string, therapistId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientId },
      include: {
        preAssessment: true,
        clientPreferences: true,
        user: true,
      },
    });

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistId },
      include: {
        user: true,
        reviews: {
          where: { status: 'APPROVED' },
        },
      },
    });

    if (!client || !therapist) {
      throw new NotFoundException('Client or therapist not found');
    }

    const compatibility = await this.compatibilityAnalysis.analyzeCompatibility(
      client,
      therapist,
    );

    // Track compatibility analysis
    await this.matchingAnalytics.trackCompatibilityAnalysis(
      clientId,
      therapistId,
      compatibility,
      '1.0',
    );

    return compatibility;
  }

  private extractUserConditions(
    preAssessment: PreAssessment,
  ): Record<string, string> {
    const conditions: Record<string, string> = {};
    const severityLevels = preAssessment.severityLevels as Record<
      string,
      string
    >;
    const questionnaires = preAssessment.questionnaires as string[];
    questionnaires.forEach((q) => {
      if (severityLevels[q]) {
        conditions[q] = severityLevels[q];
      }
    });
    return conditions;
  }

  private calculateMatchScore(
    therapist: any,
    userConditions: Record<string, string>,
  ): number {
    let score = 0;
    const expertise = (therapist.expertise as string[]) || [];
    Object.keys(userConditions).forEach((condition) => {
      if (expertise.includes(condition)) score += 20;
    });
    score += Math.min(
      this.calculateYearsOfExperience(therapist.practiceStartDate) * 2,
      20,
    );
    // Add base score for experience
    score += therapist.yearsOfExperience ? therapist.yearsOfExperience * 2 : 0;
    return score;
  }

  private getPrimaryConditions(
    userConditions: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([, severity]) => this.getSeverityWeight(severity) >= 4)
      .map(([condition]) => condition);
  }

  private getSecondaryConditions(
    userConditions: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([, severity]) => {
        const weight = this.getSeverityWeight(severity);
        return weight >= 2 && weight < 4;
      })
      .map(([condition]) => condition);
  }

  private getSeverityWeight(severity: string): number {
    const severityWeights: Record<string, number> = {
      Minimal: 1,
      Mild: 2,
      Moderate: 3,
      'Moderately Severe': 4,
      Severe: 5,
      'Very Severe': 5,
      Extreme: 5,
      Low: 1,
      High: 4,
      Substantial: 4,
      Subclinical: 1,
      Clinical: 4,
      None: 0,
      Subthreshold: 2,
      Positive: 4,
      Negative: 0,
    };
    return severityWeights[severity] || 1;
  }
}
