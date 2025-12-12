import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import {
  AdvancedMatchingService,
  ClientForMatching,
  TherapistForMatching,
  TherapistScore,
  MatchingWeights,
  UserConditionProfile,
} from '../services/advanced-matching.service';
import { IntelligentMatchingService, IntelligentTherapistScore } from './intelligent-matching.service';
import { ConversationAnalysisService, ConversationAnalysisResult } from './analysis/conversation-analysis.service';
import { CompatibilityAnalysisService } from './analysis/compatibility-analysis.service';
import { ClientEngagementAnalysisService, ClientEngagementAnalysis } from './analysis/client-engagement-analysis.service';
import { TherapistPerformanceAnalysisService } from './analysis/therapist-performance-analysis.service';
import { EngagementMatchingService, EngagementMatchScore } from './scoring/engagement-matching.service';
import { PerformanceMatchingService, PerformanceMatchScore } from './scoring/performance-matching.service';
import { PreferenceMatchingService, PreferenceMatchScore } from './scoring/preference-matching.service';
import { ComprehensiveMatchingWeights, getMatchingWeights } from './matching-weights.config';

export interface MatchingContext {
  client: ClientForMatching;
  conversationAnalysis: ConversationAnalysisResult | null;
  clinicalAnalysis: any | null;
  clientEngagement?: ClientEngagementAnalysis | null;
  weights?: ComprehensiveMatchingWeights;
}

export interface OrchestratedMatchResult extends TherapistScore {
  intelligentFactors?: IntelligentTherapistScore['conversationFactors'];
  conversationExplanation?: IntelligentTherapistScore['conversationExplanation'];
  compatibilityAnalysis?: any;
  engagementMatch?: EngagementMatchScore;
  performanceMatch?: PerformanceMatchScore;
  preferenceMatch?: PreferenceMatchScore;
  comprehensiveScore?: number; // Final score including all factors
}

@Injectable()
export class MatchingOrchestratorService {
  private readonly logger = new Logger(MatchingOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly baseMatching: AdvancedMatchingService,
    private readonly intelligentMatching: IntelligentMatchingService,
    private readonly conversationAnalysis: ConversationAnalysisService,
    private readonly compatibilityAnalysis: CompatibilityAnalysisService,
    private readonly clientEngagementAnalysis: ClientEngagementAnalysisService,
    private readonly therapistPerformanceAnalysis: TherapistPerformanceAnalysisService,
    private readonly engagementMatching: EngagementMatchingService,
    private readonly performanceMatching: PerformanceMatchingService,
    private readonly preferenceMatching: PreferenceMatchingService,
  ) {}

  /**
   * Orchestrate the complete matching pipeline for a client-therapist pair
   */
  async orchestrateMatch(
    context: MatchingContext,
    therapist: TherapistForMatching,
  ): Promise<OrchestratedMatchResult> {
    try {
      // Use comprehensive weights if not provided
      const weights = context.weights || getMatchingWeights();

      // Step 1: Try intelligent matching first (includes conversation insights)
      let matchResult: TherapistScore | IntelligentTherapistScore;
      
      try {
        matchResult = await this.intelligentMatching.calculateIntelligentMatch(
          context.client,
          therapist,
          weights,
        );
      } catch (intelligentError) {
        this.logger.warn(
          `Intelligent matching failed for therapist ${therapist.userId}, falling back to base matching: ${intelligentError}`,
        );
        // Fallback to base matching
        matchResult = await this.baseMatching.calculateAdvancedMatch(
          context.client,
          therapist,
          weights,
        );
      }

      // Step 2: Calculate new matching factors
      const [engagementMatch, performanceMatch, preferenceMatch] = await Promise.all([
        this.engagementMatching.calculateEngagementMatch(
          context.client.userId,
          therapist.userId,
        ).catch((err) => {
          this.logger.debug('Engagement matching failed:', err);
          return null;
        }),
        this.performanceMatching.calculatePerformanceMatch(
          therapist.userId,
          this.buildUserConditionProfile(context.client),
        ).catch((err) => {
          this.logger.debug('Performance matching failed:', err);
          return null;
        }),
        this.preferenceMatching.calculatePreferenceMatch(
          context.client.userId,
          therapist,
        ).catch((err) => {
          this.logger.debug('Preference matching failed:', err);
          return null;
        }),
      ]);

      // Step 3: Add compatibility analysis if available
      let compatibilityData: any = null;
      try {
        compatibilityData = await this.compatibilityAnalysis.analyzeCompatibility(
          context.client as any,
          therapist as any,
        );
      } catch (compatibilityError) {
        this.logger.debug('Compatibility analysis unavailable:', compatibilityError);
      }

      // Step 4: Calculate comprehensive score
      const comprehensiveScore = this.calculateComprehensiveScore(
        matchResult,
        engagementMatch,
        performanceMatch,
        preferenceMatch,
        weights,
      );

      // Step 5: Combine results
      const result: OrchestratedMatchResult = {
        ...matchResult,
        totalScore: comprehensiveScore, // Use comprehensive score
        ...(compatibilityData ? { compatibilityAnalysis: compatibilityData } : {}),
        ...(engagementMatch ? { engagementMatch } : {}),
        ...(performanceMatch ? { performanceMatch } : {}),
        ...(preferenceMatch ? { preferenceMatch } : {}),
        comprehensiveScore,
      };

      // Add intelligent matching factors if available
      if ('conversationFactors' in matchResult) {
        result.intelligentFactors = matchResult.conversationFactors;
        result.conversationExplanation = matchResult.conversationExplanation;
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Matching orchestration failed for therapist ${therapist.userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate comprehensive score using all matching factors
   */
  private calculateComprehensiveScore(
    baseMatch: TherapistScore,
    engagementMatch: EngagementMatchScore | null,
    performanceMatch: PerformanceMatchScore | null,
    preferenceMatch: PreferenceMatchScore | null,
    weights: ComprehensiveMatchingWeights,
  ): number {
    // Base score components (from intelligent/advanced matching)
    const baseScore =
      baseMatch.breakdown.conditionScore * weights.conditionMatch +
      baseMatch.breakdown.approachScore * weights.approachCompatibility +
      baseMatch.breakdown.experienceScore * weights.experienceAndSuccess +
      baseMatch.breakdown.reviewScore * weights.reviewsAndRatings +
      baseMatch.breakdown.logisticsScore * weights.availabilityAndLogistics;

    // New matching factors
    const engagementScore = engagementMatch
      ? engagementMatch.overallScore * weights.engagementCompatibility
      : 0;

    const performanceScore = performanceMatch
      ? performanceMatch.overallScore * weights.performanceMatch
      : 0;

    const preferenceScore = preferenceMatch
      ? preferenceMatch.overallScore * weights.preferenceMatch
      : 0;

    // Calculate total
    const total = baseScore + engagementScore + performanceScore + preferenceScore;

    return Math.round(Math.min(100, Math.max(0, total)));
  }

  /**
   * Build user condition profile from client data
   */
  private buildUserConditionProfile(client: ClientForMatching): UserConditionProfile {
    // This is a simplified version - the actual implementation is in AdvancedMatchingService
    // We'll extract basic info here
    if (!client.preAssessment) {
      throw new Error('Pre-assessment not found for client');
    }
    const answers = client.preAssessment.answers as any;
    const severityLevels = answers?.severityLevels as Record<string, string> | null;
    const questionnaires = answers?.questionnaires as string[] || [];

    const primaryConditions: Array<{ condition: string; severity: string; weight: number }> = [];
    const secondaryConditions: Array<{ condition: string; severity: string; weight: number }> = [];

    if (questionnaires && severityLevels) {
      questionnaires.forEach((condition) => {
        const severity = severityLevels[condition] || 'Minimal';
        const weight = this.getSeverityWeight(severity);
        if (weight >= 4) {
          primaryConditions.push({ condition, severity, weight });
        } else if (weight >= 2) {
          secondaryConditions.push({ condition, severity, weight });
        }
      });
    }

    return {
      primaryConditions,
      secondaryConditions,
      preferredApproaches: [],
      sessionPreferences: {
        format: ['online', 'in-person'],
        duration: [],
        frequency: 'weekly',
      },
      demographics: {
        ageRange: 'any',
        genderPreference: undefined,
        languagePreference: ['English'],
      },
      logistics: {
        maxHourlyRate: undefined,
        province: undefined,
        insuranceTypes: [],
      },
    };
  }

  /**
   * Get severity weight (simplified - matches AdvancedMatchingService)
   */
  private getSeverityWeight(severity: string): number {
    const weights: Record<string, number> = {
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
      Subthreshold: 2,
      Positive: 4,
      Negative: 0,
      None: 0,
    };
    return weights[severity] || 1;
  }

  /**
   * Build matching context for a client
   */
  async buildMatchingContext(
    clientId: string,
    weights?: ComprehensiveMatchingWeights,
  ): Promise<MatchingContext> {
    // Get client with pre-assessment
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
    });

    const latestPreAssessment = client?.preAssessments?.[0] || null;
    if (!client || !latestPreAssessment) {
      throw new Error('Client or pre-assessment not found');
    }

    const clientForMatching: ClientForMatching = {
      ...client,
      preAssessment: latestPreAssessment,
      user: client.user,
    } as any;

    // Get conversation analysis
    let conversationAnalysis: ConversationAnalysisResult | null = null;
    try {
      conversationAnalysis = await this.conversationAnalysis.analyzeConversationForMatching(
        clientId,
      );
    } catch (error) {
      this.logger.debug('Conversation analysis unavailable:', error);
    }

    // Get client engagement analysis
    let clientEngagement: ClientEngagementAnalysis | null = null;
    try {
      clientEngagement = await this.clientEngagementAnalysis.analyzeClientEngagement(
        clientId,
      );
    } catch (error) {
      this.logger.debug('Client engagement analysis unavailable:', error);
    }

    // Get clinical analysis (if available from pre-assessment service)
    let clinicalAnalysis = null;
    // Note: This would require importing PreAssessmentService or making it available
    // For now, we'll leave it as null and let the caller provide it if needed

    // Determine appropriate weights if not provided
    let matchingWeights = weights;
    if (!matchingWeights) {
      const urgencyLevel = conversationAnalysis?.urgencyIndicators?.level;
      const engagementLevel = clientEngagement?.engagementLevel;
      const isNewClient = !clientEngagement || clientEngagement.meetingAttendanceRate === 0;
      matchingWeights = getMatchingWeights(urgencyLevel, engagementLevel, isNewClient);
    }

    return {
      client: clientForMatching,
      conversationAnalysis,
      clinicalAnalysis,
      clientEngagement,
      weights: matchingWeights,
    };
  }

  /**
   * Orchestrate matching for multiple therapists (batch processing)
   */
  async orchestrateBatchMatching(
    context: MatchingContext,
    therapists: TherapistForMatching[],
  ): Promise<OrchestratedMatchResult[]> {
    const results: OrchestratedMatchResult[] = [];
    const errors: Array<{ therapistId: string; error: string }> = [];

    for (const therapist of therapists) {
      try {
        const result = await this.orchestrateMatch(context, therapist);
        results.push(result);
      } catch (error) {
        errors.push({
          therapistId: therapist.userId,
          error: error instanceof Error ? error.message : String(error),
        });
        this.logger.warn(
          `Failed to match therapist ${therapist.userId}: ${error}`,
        );
      }
    }

    if (errors.length > 0) {
      this.logger.warn(
        `Batch matching completed with ${errors.length} failures out of ${therapists.length} therapists`,
      );
    }

    return results;
  }
}

