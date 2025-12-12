import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PreAssessment, Therapist, User, Review, Prisma } from '@prisma/client';
import type {
  TherapistRecommendationRequest,
  TherapistRecommendationResponse,
} from './types';
import {
  AdvancedMatchingService,
  TherapistScore,
  ClientForMatching,
  TherapistForMatching,
} from './services/advanced-matching.service';
import { IntelligentMatchingService, IntelligentTherapistScore } from './matching/intelligent-matching.service';
import { MatchingOrchestratorService, OrchestratedMatchResult } from './matching/matching-orchestrator.service';
import { ConversationAnalysisService, ConversationAnalysisResult } from './matching/analysis/conversation-analysis.service';
import { CompatibilityAnalysisService } from './matching/analysis/compatibility-analysis.service';
import { PreAssessmentService } from '../pre-assessment/pre-assessment.service';

// Define the type for therapist with included relations
type TherapistWithRelations = Therapist & {
  user: User;
  reviews: Pick<Review, 'rating'>[];
};

@Injectable()
export class TherapistRecommendationService {
  private readonly logger = new Logger(TherapistRecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly advancedMatching: AdvancedMatchingService,
    private readonly intelligentMatching: IntelligentMatchingService,
    private readonly matchingOrchestrator: MatchingOrchestratorService,
    private readonly conversationAnalysis: ConversationAnalysisService,
    private readonly compatibilityAnalysis: CompatibilityAnalysisService,
    private readonly preAssessmentService: PreAssessmentService,
  ) { }

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
  ): Promise<any> {
    // Input validation
    if (!request?.userId) {
      throw new BadRequestException('User ID is required');
    }

    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    this.logger.log(
      `Getting enhanced recommendations for user ${request.userId} with limit ${request.limit || 10}`,
    );

    try {
      // Get user's comprehensive data including preferences
      const user = await this.prisma.client.findUnique({
        where: { userId: request.userId },
        include: {
          preAssessments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }) as any;

      if (!user) {
        this.logger.warn(`User not found: ${request.userId}`);
        throw new NotFoundException('User not found');
      }

      // Get the latest pre-assessment
      const latestPreAssessment = user.preAssessments?.[0] || null;

      // Handle users without pre-assessment more gracefully
      if (!latestPreAssessment) {
        this.logger.warn(
          `No pre-assessment found for user: ${request.userId}, using basic recommendations`,
        );

        // Provide basic recommendations for users without pre-assessment
        return await this.getBasicTherapistRecommendations(request, user);
      }

      // Get comprehensive clinical analysis for enhanced matching
      let clinicalAnalysis;
      try {
        clinicalAnalysis =
          await this.preAssessmentService.getComprehensiveClinicalAnalysis(
            request.userId,
          );
        this.logger.log(
          `Enhanced clinical insights available: ${clinicalAnalysis.clinicalProfile.primaryConditions.length} primary conditions`,
        );
      } catch (analysisError) {
        this.logger.warn(
          'Advanced clinical analysis unavailable, using basic assessment:',
          analysisError,
        );
        clinicalAnalysis = null;
      }

      // Extract user conditions and AI evaluation data
      const userConditions = this.extractUserConditions(latestPreAssessment);
      const aiEvaluation = this.extractAiEvaluation(latestPreAssessment);

      // Extract severity levels from the database field (not from answers)
      const severityLevels = latestPreAssessment.severityLevels as Record<
        string,
        string
      >;

      // Enhanced therapist filtering based on clinical insights
      const therapistWhere: any = {
        status: 'APPROVED',
        ...(request.province && { province: request.province }),
        ...(request.maxHourlyRate && {
          hourlyRate: { lte: request.maxHourlyRate },
        }),
      };

      // Apply enhanced filtering based on clinical analysis
      if (clinicalAnalysis?.treatmentPlan?.therapistCriteria) {
        const criteria = clinicalAnalysis.treatmentPlan.therapistCriteria;

        // Filter by required specializations
        if (criteria.requiredSpecializations.length > 0) {
          therapistWhere.OR = criteria.requiredSpecializations.map((spec) => ({
            expertise: { has: spec },
          }));
        }

        // Filter by experience level
        if (criteria.experienceLevel !== 'any') {
          const minYears =
            {
              intermediate: 3,
              senior: 7,
              expert: 12,
            }[criteria.experienceLevel] || 0;

          therapistWhere.yearsOfExperience = { gte: minYears };
        }
      }

      // Fetch therapists with comprehensive data
      const therapists: TherapistWithRelations[] =
        await this.prisma.therapist.findMany({
          where: therapistWhere,
          orderBy: { createdAt: 'desc' },
          take: Math.min(request.limit ?? 10, 50), // Increase limit for better filtering
          include: {
            user: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        });

      // Build matching context
      const clientForMatching: ClientForMatching = {
        ...user,
        preAssessment: latestPreAssessment,
        user: user.user,
      };

      const matchingContext = await this.matchingOrchestrator.buildMatchingContext(
        request.userId,
      );
      matchingContext.client = clientForMatching;

      // Use intelligent matching orchestration
      const therapistScores: OrchestratedMatchResult[] = [];
      let matchingFailures = 0;

      for (const therapist of therapists) {
        try {
          const therapistForMatching: TherapistForMatching = {
            ...therapist,
            user: therapist.user,
            reviews: therapist.reviews || [],
          };

          // Use orchestrator for comprehensive matching
          const score = await this.matchingOrchestrator.orchestrateMatch(
            matchingContext,
            therapistForMatching,
          );

          therapistScores.push(score);
        } catch (error) {
          matchingFailures++;

          // Log detailed error information for debugging
          this.logger.error(
            `Advanced matching failed for therapist ${therapist.userId}`,
            {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              therapistId: therapist.userId,
              userId: request.userId,
            },
          );

          // Fallback to basic scoring with clear indication this is a fallback
          try {
            const basicScore = this.calculateMatchScore(
              therapist,
              userConditions,
            );

            const therapistForMatching: TherapistForMatching = {
              ...therapist,
              user: therapist.user,
              reviews: therapist.reviews || [],
            };

            therapistScores.push({
              therapist: therapistForMatching,
              totalScore: basicScore,
              breakdown: {
                conditionScore: Math.round(basicScore * 0.6),
                approachScore: 0,
                experienceScore: Math.round(basicScore * 0.4),
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

            this.logger.warn(
              `Using basic scoring fallback for therapist ${therapist.userId} due to advanced matching failure`,
            );
          } catch (basicScoringError) {
            // If even basic scoring fails, log and skip this therapist
            this.logger.error(
              `Both advanced and basic scoring failed for therapist ${therapist.userId}`,
              {
                advancedError:
                  error instanceof Error ? error.message : String(error),
                basicError:
                  basicScoringError instanceof Error
                    ? basicScoringError.message
                    : String(basicScoringError),
                therapistId: therapist.userId,
                userId: request.userId,
              },
            );
            // Skip this therapist entirely
            continue;
          }
        }
      }

      // Log summary of matching performance
      this.logger.log(
        `Matching completed for user ${request.userId}: ${therapistScores.length} successful matches, ${matchingFailures} failures`,
      );

      // Sort by total score descending
      const sortedTherapistScores = therapistScores.sort(
        (a, b) => b.totalScore - a.totalScore,
      );

      // Take only the requested number of results
      const finalResults = sortedTherapistScores.slice(0, request.limit ?? 10);

      // Track recommendation analytics - removed due to missing MatchingAnalyticsService

      // Transform to expected format with enhanced insights
      const therapistsWithScores = finalResults.map((score) => {
        const therapistData: any = {
          ...score.therapist,
          matchScore: score.totalScore,
          scoreBreakdown: score.breakdown,
          matchExplanation: score.matchExplanation,
        };

        // Add conversation insights if available (from intelligent matching)
        if (score.intelligentFactors) {
          therapistData.conversationMatch = {
            factors: score.intelligentFactors,
            explanation: score.conversationExplanation,
          };
        }

        // Add new matching factors if available
        if (score.engagementMatch) {
          therapistData.engagementMatch = {
            score: score.engagementMatch.overallScore,
            breakdown: {
              engagementCompatibility: score.engagementMatch.engagementCompatibility,
              retentionMatch: score.engagementMatch.retentionMatch,
              sessionTimeMatch: score.engagementMatch.sessionTimeMatch,
            },
            explanation: score.engagementMatch.explanation,
          };
        }

        if (score.performanceMatch) {
          therapistData.performanceMatch = {
            score: score.performanceMatch.overallScore,
            breakdown: {
              successRateMatch: score.performanceMatch.successRateMatch,
              workloadMatch: score.performanceMatch.workloadMatch,
              availabilityMatch: score.performanceMatch.availabilityMatch,
              communicationStyleMatch: score.performanceMatch.communicationStyleMatch,
            },
            explanation: score.performanceMatch.explanation,
          };
        }

        if (score.preferenceMatch) {
          therapistData.preferenceMatch = {
            score: score.preferenceMatch.overallScore,
            breakdown: {
              genderMatch: score.preferenceMatch.genderMatch,
              ageMatch: score.preferenceMatch.ageMatch,
              languageMatch: score.preferenceMatch.languageMatch,
              approachMatch: score.preferenceMatch.approachMatch,
              sessionFormatMatch: score.preferenceMatch.sessionFormatMatch,
              budgetMatch: score.preferenceMatch.budgetMatch,
              locationMatch: score.preferenceMatch.locationMatch,
            },
            explanation: score.preferenceMatch.explanation,
          };
        }

        // Use comprehensive score if available
        if (score.comprehensiveScore !== undefined) {
          therapistData.matchScore = score.comprehensiveScore;
        }

        // Add clinical insights if available
        if (clinicalAnalysis) {
          therapistData.clinicalMatch = {
            urgencyAlignment: this.assessUrgencyAlignment(
              score.therapist,
              clinicalAnalysis,
            ),
            specializationMatch: this.assessSpecializationMatch(
              score.therapist,
              clinicalAnalysis,
            ),
            experienceAdequacy: this.assessExperienceAdequacy(
              score.therapist,
              clinicalAnalysis,
            ),
            approachCompatibility: this.assessApproachCompatibility(
              score.therapist,
              clinicalAnalysis,
            ),
          };
        }

        return therapistData;
      });

      // Get conversation analysis for matching insights
      let conversationAnalysis: ConversationAnalysisResult | null = null;
      try {
        conversationAnalysis = await this.conversationAnalysis.analyzeConversationForMatching(
          request.userId,
        );
      } catch (error) {
        this.logger.warn('Failed to get conversation analysis:', error);
      }

      // Determine primary and secondary conditions (enhanced if clinical analysis available)
      const primaryConditions = clinicalAnalysis
        ? clinicalAnalysis.clinicalProfile.primaryConditions.map(
          (pc) => pc.condition,
        )
        : this.getPrimaryConditions(userConditions);

      const secondaryConditions = clinicalAnalysis
        ? clinicalAnalysis.clinicalProfile.secondaryConditions.map(
          (sc) => sc.condition,
        )
        : this.getSecondaryConditions(userConditions);

      return {
        totalCount: therapistsWithScores.length,
        userConditions: Object.keys(userConditions),
        therapists: therapistsWithScores,
        matchCriteria: {
          primaryConditions,
          secondaryConditions,
          severityLevels,
          ...(clinicalAnalysis && {
            riskLevel: clinicalAnalysis.riskAssessment.overallRisk,
            urgencyLevel:
              clinicalAnalysis.treatmentPlan.therapistCriteria.urgencyLevel,
            requiredSpecializations:
              clinicalAnalysis.treatmentPlan.therapistCriteria
                .requiredSpecializations,
            preferredApproaches:
              clinicalAnalysis.treatmentPlan.therapistCriteria
                .preferredApproaches,
          }),
          ...(conversationAnalysis ? {
            conversationInsights: {
              mentionedConditions: conversationAnalysis.mentionedConditions,
              therapyPreferences: conversationAnalysis.therapyPreferences,
              urgencyLevel: conversationAnalysis.urgencyIndicators.level,
              treatmentGoals: conversationAnalysis.treatmentGoals,
            },
          } : {}),
        },
        clinicalInsights: clinicalAnalysis
          ? {
            overallRiskLevel:
              clinicalAnalysis.clinicalProfile.overallRiskLevel,
            primaryConditionsCount:
              clinicalAnalysis.clinicalProfile.primaryConditions.length,
            therapeuticPriorities:
              clinicalAnalysis.clinicalProfile.therapeuticPriorities.slice(
                0,
                3,
              ),
            recommendedSessionFrequency:
              clinicalAnalysis.treatmentPlan.therapistCriteria
                .sessionFrequency,
          }
          : null,
        page: 1,
        pageSize: request.limit ?? 10,
      };
    } catch (error) {
      // Handle specific error types with appropriate logging and responses
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        // Re-throw validation and not found errors as-is
        throw error;
      }

      // Log unexpected errors with full context
      this.logger.error(
        `Unexpected error in getRecommendedTherapists for user ${request.userId}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId: request.userId,
          requestParams: {
            limit: request.limit,
            province: request.province,
            maxHourlyRate: request.maxHourlyRate,
          },
        },
      );

      // Provide generic error message to client while logging specifics
      throw new InternalServerErrorException(
        'Failed to get therapist recommendations. Please try again later.',
      );
    }
  }

  /**
   * Get basic therapist recommendations for users without pre-assessment
   */
  private async getBasicTherapistRecommendations(
    request: TherapistRecommendationRequest,
    user: any,
  ): Promise<any> {
    this.logger.log(
      `Getting basic recommendations for user ${request.userId} (no pre-assessment)`,
    );

    try {
      // Basic therapist filtering without clinical analysis
      const therapistWhere: any = {
        status: 'APPROVED',
        ...(request.province && { province: request.province }),
        ...(request.maxHourlyRate && {
          hourlyRate: { lte: request.maxHourlyRate },
        }),
      };

      // Fetch therapists with basic data
      const therapists = await this.prisma.therapist.findMany({
        where: therapistWhere,
        orderBy: [{ createdAt: 'desc' }, { yearsOfExperience: 'desc' }],
        take: Math.min(request.limit ?? 10, 20),
        include: {
          user: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${therapists.length} approved therapists for basic recommendations`,
      );

      if (therapists.length === 0) {
        this.logger.warn('No approved therapists found in database');
        return {
          totalCount: 0,
          recommendations: [],
          message:
            'No therapists available at this time. Please try again later.',
          userConditions: [],
          therapists: [],
          matchCriteria: {
            primaryConditions: [],
            secondaryConditions: [],
            severityLevels: {},
          },
          clinicalInsights: null,
          page: 1,
          pageSize: request.limit ?? 10,
        };
      }

      // Calculate basic scores based on experience and ratings
      const therapistsWithScores = therapists.map((therapist, index) => {
        const experienceYears =
          therapist.yearsOfExperience ||
          this.calculateYearsOfExperience(therapist.practiceStartDate);

        const reviews = therapist.reviews || [];
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Basic scoring: experience (60%) + rating (40%)
        const experienceScore = Math.min(experienceYears * 10, 60);
        const ratingScore = averageRating * 8;
        const totalScore = experienceScore + ratingScore;

        return {
          ...therapist,
          userId: therapist.userId, // Ensure userId is available as id
          id: therapist.userId,
          matchScore: Math.round(totalScore),
          score: Math.round(totalScore),
          rank: index + 1,
          experience: experienceYears,
          rating: averageRating,
          totalReviews: reviews.length,
          // Add frontend-expected fields
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          specialties: therapist.expertise || [],
          bio: `${experienceYears} years of experience in mental health therapy`,
          scoreBreakdown: {
            conditionScore: 0,
            approachScore: 0,
            experienceScore: Math.round(experienceScore),
            reviewScore: Math.round(ratingScore),
            logisticsScore: 20, // Base logistics score
          },
          matchExplanation: {
            primaryMatches: [],
            secondaryMatches: [],
            approachMatches: [],
            experienceYears,
            averageRating,
            totalReviews: reviews.length,
            successRates: {},
          },
        };
      });

      // Sort by score descending
      const sortedTherapists = therapistsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, request.limit ?? 10);

      return {
        totalCount: sortedTherapists.length,
        recommendations: sortedTherapists, // Frontend expects this field
        userConditions: [],
        therapists: sortedTherapists,
        matchCriteria: {
          primaryConditions: [],
          secondaryConditions: [],
          severityLevels: {},
          note: 'Basic recommendations - complete your mental health assessment for personalized matches',
        },
        clinicalInsights: null,
        page: 1,
        pageSize: request.limit ?? 10,
        welcomeMessage: `Hello ${user.user.firstName}! We've found some great therapists for you. Complete your mental health assessment to get personalized recommendations.`,
        isFirstTime: true,
        userInfo: {
          firstName: user.user.firstName,
          memberSince: user.user.createdAt,
          needsOnboarding: true,
        },
        nextSteps: {
          canSendRequests: true,
          recommendedActions: [
            'Complete your mental health assessment for better matches',
            'Browse therapist profiles',
            'Send requests to therapists you find interesting',
            'Complete your profile for improved recommendations',
          ],
        },
        matchingInsights: {
          totalAvailableTherapists: sortedTherapists.length,
          totalAvailableCommunities: 0,
          recommendationEngine: 'Basic experience and rating-based matching',
          lastUpdated: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error in getBasicTherapistRecommendations for user ${request.userId}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );

      // Return safe fallback
      return {
        totalCount: 0,
        recommendations: [],
        userConditions: [],
        therapists: [],
        matchCriteria: {
          primaryConditions: [],
          secondaryConditions: [],
          severityLevels: {},
        },
        clinicalInsights: null,
        page: 1,
        pageSize: request.limit ?? 10,
        error: 'Unable to load therapist recommendations at this time',
      };
    }
  }

  /**
   * Get detailed compatibility analysis between a client and therapist
   */
  async getCompatibilityAnalysis(clientId: string, therapistId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientId },
      include: {
        preAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }) as any;

    const therapist: TherapistWithRelations | null =
      await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
        include: {
          user: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      });

    if (!client || !therapist) {
      throw new NotFoundException('Client or therapist not found');
    }

    const latestPreAssessment = client.preAssessments?.[0] || null;
    if (!latestPreAssessment) {
      throw new NotFoundException('No pre-assessment found for client');
    }

    // Create a client object with preAssessment for compatibility analysis
    const clientWithPreAssessment = {
      ...client,
      preAssessment: latestPreAssessment,
    };
    
    const compatibility = await this.compatibilityAnalysis.analyzeCompatibility(
      clientWithPreAssessment as any,
      therapist,
    );

    // Track compatibility analysis - removed due to missing MatchingAnalyticsService

    return compatibility;
  }

  private extractUserConditions(
    preAssessment: PreAssessment,
  ): Record<string, string> {
    const conditions: Record<string, string> = {};

    // Extract data from the separate database fields (corrected approach)
    const severityLevels = preAssessment.severityLevels as Record<
      string,
      string
    >;
    const scores = preAssessment.scores as Record<string, number>;

    if (severityLevels && scores) {
      // Use questionnaire names from the scores object
      Object.keys(scores).forEach((questionnaire) => {
        if (severityLevels[questionnaire]) {
          conditions[questionnaire] = severityLevels[questionnaire];
        }
      });
    }

    return conditions;
  }

  /**
   * Extract AI evaluation data from pre-assessment for enhanced matching
   */
  private extractAiEvaluation(preAssessment: PreAssessment): any {
    const aiEstimate = preAssessment.aiEstimate as any;

    if (!aiEstimate || typeof aiEstimate !== 'object') {
      return null;
    }

    return {
      confidence: aiEstimate.confidence || 0,
      riskFactors: aiEstimate.risk_factors || [],
      recommendations: aiEstimate.recommendations || [],
      estimatedSeverity: aiEstimate.estimated_severity || {},
    };
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

  /**
   * Assess how well therapist's availability aligns with client's urgency needs
   */
  private assessUrgencyAlignment(
    therapist: any,
    clinicalAnalysis: any,
  ): {
    score: number;
    reasoning: string;
  } {
    const urgencyLevel =
      clinicalAnalysis.treatmentPlan.therapistCriteria.urgencyLevel;
    const riskLevel = clinicalAnalysis.riskAssessment.overallRisk;

    let score = 70; // Base score
    let reasoning = 'Standard availability alignment';

    // Check if therapist can handle urgent cases
    if (urgencyLevel === 'immediate' || riskLevel === 'critical') {
      if (
        therapist.acceptsEmergencyAppointments ||
        therapist.hasImmediateAvailability
      ) {
        score = 95;
        reasoning =
          'Excellent for crisis intervention - immediate availability';
      } else {
        score = 30;
        reasoning = 'May not be suitable for immediate intervention needs';
      }
    } else if (urgencyLevel === 'high') {
      if (therapist.weeklyAvailability || therapist.flexibleScheduling) {
        score = 85;
        reasoning = 'Good availability for urgent therapeutic needs';
      }
    }

    return { score, reasoning };
  }

  /**
   * Assess therapist's specialization match with client's conditions
   */
  private assessSpecializationMatch(
    therapist: any,
    clinicalAnalysis: any,
  ): {
    score: number;
    matchedSpecializations: string[];
    reasoning: string;
  } {
    const requiredSpecs =
      clinicalAnalysis.treatmentPlan.therapistCriteria.requiredSpecializations;
    const therapistSpecs = [
      ...(therapist.expertise || []),
      ...(therapist.illnessSpecializations || []),
    ];

    const matchedSpecs = requiredSpecs.filter((req) =>
      therapistSpecs.some(
        (spec) =>
          spec.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(spec.toLowerCase()),
      ),
    );

    const matchRatio =
      requiredSpecs.length > 0 ? matchedSpecs.length / requiredSpecs.length : 1;
    const score = Math.round(matchRatio * 100);

    let reasoning = `Matches ${matchedSpecs.length}/${requiredSpecs.length} required specializations`;
    if (score >= 80) reasoning = 'Excellent specialization match';
    else if (score >= 60) reasoning = 'Good specialization alignment';
    else if (score >= 40) reasoning = 'Partial specialization match';
    else reasoning = 'Limited specialization match';

    return {
      score,
      matchedSpecializations: matchedSpecs,
      reasoning,
    };
  }

  /**
   * Assess if therapist has adequate experience for client's needs
   */
  private assessExperienceAdequacy(
    therapist: any,
    clinicalAnalysis: any,
  ): {
    score: number;
    reasoning: string;
  } {
    const requiredLevel =
      clinicalAnalysis.treatmentPlan.therapistCriteria.experienceLevel;
    const therapistYears =
      therapist.yearsOfExperience ||
      this.calculateYearsOfExperience(therapist.practiceStartDate);

    const requiredYears =
      {
        any: 0,
        intermediate: 3,
        senior: 7,
        expert: 12,
      }[requiredLevel] || 0;

    if (therapistYears >= requiredYears) {
      const score = Math.min(100, 70 + (therapistYears - requiredYears) * 3);
      return {
        score,
        reasoning: `${therapistYears} years experience meets ${requiredLevel} level requirement`,
      };
    } else {
      const score = Math.max(20, (therapistYears / requiredYears) * 60);
      return {
        score,
        reasoning: `${therapistYears} years experience below ${requiredLevel} level (${requiredYears}+ years)`,
      };
    }
  }

  /**
   * Assess therapist's therapeutic approach compatibility
   */
  private assessApproachCompatibility(
    therapist: any,
    clinicalAnalysis: any,
  ): {
    score: number;
    matchedApproaches: string[];
    reasoning: string;
  } {
    const preferredApproaches =
      clinicalAnalysis.treatmentPlan.therapistCriteria.preferredApproaches;
    const therapistApproaches = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ];

    const matchedApproaches = preferredApproaches.filter((pref) =>
      therapistApproaches.some(
        (approach) =>
          approach.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(approach.toLowerCase()),
      ),
    );

    const matchRatio =
      preferredApproaches.length > 0
        ? matchedApproaches.length / preferredApproaches.length
        : 0.7;
    const score = Math.round(matchRatio * 100);

    let reasoning = `Matches ${matchedApproaches.length}/${preferredApproaches.length} preferred approaches`;
    if (score >= 80) reasoning = 'Excellent therapeutic approach match';
    else if (score >= 60) reasoning = 'Good approach compatibility';
    else if (score >= 40) reasoning = 'Some approach alignment';
    else reasoning = 'Limited approach match - may still be effective';

    return {
      score,
      matchedApproaches,
      reasoning,
    };
  }
}
