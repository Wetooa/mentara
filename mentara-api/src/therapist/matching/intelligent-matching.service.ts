import { Injectable, Logger } from '@nestjs/common';
import {
  AdvancedMatchingService,
  TherapistScore,
  ClientForMatching,
  TherapistForMatching,
  MatchingWeights,
} from '../services/advanced-matching.service';
import { ConversationAnalysisService, ConversationAnalysisResult } from './analysis/conversation-analysis.service';
import { Therapist } from '@prisma/client';

export interface IntelligentTherapistScore extends TherapistScore {
  conversationFactors: {
    sentimentAlignment: number;
    mentionedConditionsMatch: number;
    preferenceAlignment: number;
    communicationStyleMatch: number;
    total: number;
  };
  conversationExplanation: {
    sentimentMatch: string;
    conditionMatches: string[];
    preferenceMatches: string[];
    communicationMatch: string;
  };
}

@Injectable()
export class IntelligentMatchingService {
  private readonly logger = new Logger(IntelligentMatchingService.name);

  constructor(
    private readonly baseMatching: AdvancedMatchingService,
    private readonly conversationAnalysis: ConversationAnalysisService,
  ) {}

  /**
   * Calculate intelligent match score including conversation insights
   */
  async calculateIntelligentMatch(
    client: ClientForMatching,
    therapist: TherapistForMatching,
    weights?: MatchingWeights,
  ): Promise<IntelligentTherapistScore> {
    // Use default weights if not provided
    const matchingWeights: MatchingWeights = weights || {
      conditionMatch: 0.4,
      approachCompatibility: 0.25,
      experienceAndSuccess: 0.2,
      reviewsAndRatings: 0.1,
      availabilityAndLogistics: 0.05,
    };

    // Get base match score
    const baseScore = await this.baseMatching.calculateAdvancedMatch(
      client,
      therapist,
      matchingWeights,
    );

    // Get conversation analysis if available
    const conversationAnalysis = await this.conversationAnalysis.analyzeConversationForMatching(
      client.userId,
    );

    if (!conversationAnalysis) {
      // No conversation data, return base score
      return {
        ...baseScore,
        conversationFactors: {
          sentimentAlignment: 0,
          mentionedConditionsMatch: 0,
          preferenceAlignment: 0,
          communicationStyleMatch: 0,
          total: 0,
        },
        conversationExplanation: {
          sentimentMatch: 'No conversation data available',
          conditionMatches: [],
          preferenceMatches: [],
          communicationMatch: '',
        },
      };
    }

    // Calculate conversation-based factors
    const conversationFactors = this.calculateConversationFactors(
      conversationAnalysis,
      therapist,
    );

    // Enhance condition score with conversation-discovered conditions
    const enhancedConditionScore = this.enhanceConditionScore(
      baseScore.breakdown.conditionScore,
      conversationAnalysis,
      therapist,
    );

    // Enhance approach score with conversation preferences
    const enhancedApproachScore = this.enhanceApproachScore(
      baseScore.breakdown.approachScore,
      conversationAnalysis,
      therapist,
    );

    // Enhance logistics score with conversation preferences
    const enhancedLogisticsScore = this.enhanceLogisticsScore(
      baseScore.breakdown.logisticsScore,
      conversationAnalysis,
      therapist,
    );

    // Recalculate total with enhanced scores
    const enhancedTotal = Math.round(
      enhancedConditionScore * matchingWeights.conditionMatch +
        enhancedApproachScore * matchingWeights.approachCompatibility +
        baseScore.breakdown.experienceScore * matchingWeights.experienceAndSuccess +
        baseScore.breakdown.reviewScore * matchingWeights.reviewsAndRatings +
        enhancedLogisticsScore * matchingWeights.availabilityAndLogistics +
        conversationFactors.total * 0.15, // 15% weight for conversation factors
    );

    // Build conversation explanation
    const conversationExplanation = this.buildConversationExplanation(
      conversationAnalysis,
      therapist,
      conversationFactors,
    );

    return {
      ...baseScore,
      totalScore: Math.max(baseScore.totalScore, enhancedTotal), // Use higher score
      breakdown: {
        ...baseScore.breakdown,
        conditionScore: enhancedConditionScore,
        approachScore: enhancedApproachScore,
        logisticsScore: enhancedLogisticsScore,
      },
      conversationFactors,
      conversationExplanation,
    };
  }

  /**
   * Calculate conversation-based matching factors
   */
  private calculateConversationFactors(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): {
    sentimentAlignment: number;
    mentionedConditionsMatch: number;
    preferenceAlignment: number;
    communicationStyleMatch: number;
    total: number;
  } {
    // Sentiment alignment (15 points max)
    // Therapists with experience in high-urgency cases are better for negative sentiment
    const sentimentAlignment = this.calculateSentimentAlignment(analysis, therapist);

    // Mentioned conditions match (20 points max)
    const mentionedConditionsMatch = this.calculateMentionedConditionsMatch(
      analysis,
      therapist,
    );

    // Preference alignment (15 points max)
    const preferenceAlignment = this.calculatePreferenceAlignment(analysis, therapist);

    // Communication style match (10 points max)
    const communicationStyleMatch = this.calculateCommunicationStyleMatch(
      analysis,
      therapist,
    );

    const total = Math.min(
      60,
      sentimentAlignment +
        mentionedConditionsMatch +
        preferenceAlignment +
        communicationStyleMatch,
    );

    return {
      sentimentAlignment,
      mentionedConditionsMatch,
      preferenceAlignment,
      communicationStyleMatch,
      total,
    };
  }

  /**
   * Calculate sentiment alignment score
   */
  private calculateSentimentAlignment(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    // If high urgency/negative sentiment, prioritize experienced therapists
    if (analysis.urgencyIndicators.level === 'critical' || analysis.urgencyIndicators.level === 'high') {
      const yearsExperience = therapist.yearsOfExperience || 0;
      if (yearsExperience >= 10) {
        return 15; // Full points for experienced therapists with critical cases
      }
      if (yearsExperience >= 5) {
        return 10;
      }
      return 5;
    }

    // For lower urgency, all therapists are suitable
    return 10;
  }

  /**
   * Calculate mentioned conditions match score
   */
  private calculateMentionedConditionsMatch(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    if (analysis.mentionedConditions.length === 0) {
      return 0;
    }

    const therapistConditions = [
      ...(therapist.expertise || []),
      ...(therapist.illnessSpecializations || []),
    ];

    const matchedConditions = analysis.mentionedConditions.filter((condition) =>
      therapistConditions.some(
        (tc) =>
          tc.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(tc.toLowerCase()),
      ),
    );

    // 20 points max, scaled by match ratio
    const matchRatio = matchedConditions.length / analysis.mentionedConditions.length;
    return Math.round(20 * matchRatio);
  }

  /**
   * Calculate preference alignment score
   */
  private calculatePreferenceAlignment(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    let score = 0;

    // Approach preferences
    const therapistApproaches = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ];
    const matchedApproaches = analysis.therapyPreferences.approaches.filter((pref) =>
      therapistApproaches.some(
        (ta) =>
          ta.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(ta.toLowerCase()),
      ),
    );
    score += (matchedApproaches.length / Math.max(1, analysis.therapyPreferences.approaches.length)) * 8;

    // Session format preferences
    if (analysis.therapyPreferences.format.length > 0) {
      const therapistAccepts = therapist.acceptTypes || [];
      const hasFormatMatch = analysis.therapyPreferences.format.some((format) =>
        therapistAccepts.some(
          (ta) =>
            ta.toLowerCase().includes(format.toLowerCase()) ||
            format.toLowerCase().includes(ta.toLowerCase()),
        ),
      );
      if (hasFormatMatch) {
        score += 7;
      }
    }

    return Math.min(15, Math.round(score));
  }

  /**
   * Calculate communication style match score
   */
  private calculateCommunicationStyleMatch(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    // This is a simplified match - in production, you'd have therapist communication style in profile
    // For now, we'll use experience and approach diversity as proxies
    const yearsExperience = therapist.yearsOfExperience || 0;
    const approachCount = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ].length;

    // More experienced therapists with diverse approaches are better at adapting communication
    if (yearsExperience >= 7 && approachCount >= 3) {
      return 10;
    }
    if (yearsExperience >= 5 && approachCount >= 2) {
      return 7;
    }
    return 5;
  }

  /**
   * Enhance condition score with conversation-discovered conditions
   */
  private enhanceConditionScore(
    baseScore: number,
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    // Add bonus for conversation-discovered conditions (user-initiated, so higher weight)
    const mentionedConditionsBonus = this.calculateMentionedConditionsMatch(
      analysis,
      therapist,
    );

    // Conversation-discovered conditions get 1.5x weight
    return Math.min(100, baseScore + Math.round(mentionedConditionsBonus * 1.5));
  }

  /**
   * Enhance approach score with conversation preferences
   */
  private enhanceApproachScore(
    baseScore: number,
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    const preferenceBonus = this.calculatePreferenceAlignment(analysis, therapist);
    return Math.min(100, baseScore + preferenceBonus);
  }

  /**
   * Enhance logistics score with conversation preferences
   */
  private enhanceLogisticsScore(
    baseScore: number,
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
  ): number {
    let enhanced = baseScore;

    // Budget preferences
    if (analysis.logisticsPreferences.budget) {
      const therapistRate = Number(therapist.hourlyRate);
      if (therapistRate <= analysis.logisticsPreferences.budget) {
        enhanced += 10; // Bonus for budget match
      } else if (therapistRate > analysis.logisticsPreferences.budget * 1.2) {
        enhanced -= 15; // Penalty for significantly over budget
      }
    }

    // Location preferences
    if (analysis.logisticsPreferences.location && therapist.province) {
      if (
        therapist.province.toLowerCase().includes(
          analysis.logisticsPreferences.location.toLowerCase(),
        ) ||
        analysis.logisticsPreferences.location
          .toLowerCase()
          .includes(therapist.province.toLowerCase())
      ) {
        enhanced += 10; // Bonus for location match
      }
    }

    // Language preferences
    const therapistLanguages = therapist.languagesOffered || [];
    const hasLanguageMatch = analysis.culturalNeeds.languages.some((lang) =>
      therapistLanguages.some(
        (tl) =>
          tl.toLowerCase().includes(lang.toLowerCase()) ||
          lang.toLowerCase().includes(tl.toLowerCase()),
      ),
    );
    if (hasLanguageMatch) {
      enhanced += 10; // Bonus for language match
    } else if (analysis.culturalNeeds.languages.length > 0) {
      enhanced -= 10; // Penalty for language mismatch
    }

    return Math.max(0, Math.min(100, enhanced));
  }

  /**
   * Build conversation-based explanation
   */
  private buildConversationExplanation(
    analysis: ConversationAnalysisResult,
    therapist: Therapist,
    factors: {
      sentimentAlignment: number;
      mentionedConditionsMatch: number;
      preferenceAlignment: number;
      communicationStyleMatch: number;
      total: number;
    },
  ): {
    sentimentMatch: string;
    conditionMatches: string[];
    preferenceMatches: string[];
    communicationMatch: string;
  } {
    const therapistConditions = [
      ...(therapist.expertise || []),
      ...(therapist.illnessSpecializations || []),
    ];

    const matchedConditions = analysis.mentionedConditions.filter((condition) =>
      therapistConditions.some(
        (tc) =>
          tc.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(tc.toLowerCase()),
      ),
    );

    const therapistApproaches = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ];
    const matchedApproaches = analysis.therapyPreferences.approaches.filter((pref) =>
      therapistApproaches.some(
        (ta) =>
          ta.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(ta.toLowerCase()),
      ),
    );

    return {
      sentimentMatch:
        factors.sentimentAlignment > 10
          ? 'Therapist experience aligns well with your current needs'
          : 'Standard therapist match',
      conditionMatches: matchedConditions,
      preferenceMatches: matchedApproaches,
      communicationMatch:
        factors.communicationStyleMatch > 7
          ? 'Therapist has diverse approaches and can adapt communication style'
          : 'Standard communication match',
    };
  }
}

