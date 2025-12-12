import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

// Assessment types and their community mappings
interface AssessmentCommunityMapping {
  // PHQ-9 (Depression) mapping
  phq9: {
    score: number;
    communities: string[]; // community slugs
    weight: number;
  };
  // GAD-7 (Anxiety) mapping
  gad7: {
    score: number;
    communities: string[];
    weight: number;
  };
  // PTSD-5 (PTSD) mapping
  ptsd5: {
    score: number;
    communities: string[];
    weight: number;
  };
  // Additional assessment types can be added here
  [key: string]: {
    score: number;
    communities: string[];
    weight: number;
  };
}

interface UserAssessmentProfile {
  userId: string;
  assessments: {
    [assessmentType: string]: {
      score: number;
      severity: string;
      date: Date;
    };
  };
}

interface CommunityCompatibilityResult {
  communityId: string;
  communitySlug: string;
  compatibilityScore: number;
  reasoning: string;
  matchingFactors: string[];
  assessmentContributions: {
    [assessmentType: string]: {
      score: number;
      weight: number;
      contribution: number;
    };
  };
}

@Injectable()
export class CommunityMatchingService {
  private readonly logger = new Logger(CommunityMatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Core assessment-to-community mapping configuration
   * This defines which communities are appropriate for different assessment score ranges
   */
  private getAssessmentCommunityMappings(): AssessmentCommunityMapping {
    return {
      // PHQ-9 Depression Scale (0-27)
      phq9: {
        score: 0,
        communities: [
          'general-support',
          'depression-support',
          'anxiety-depression',
          'mental-wellness',
          'recovery-journey',
          'therapy-discussion',
        ],
        weight: 0.8, // High weight for depression matching
      },

      // GAD-7 Anxiety Scale (0-21)
      gad7: {
        score: 0,
        communities: [
          'anxiety-support',
          'panic-disorder',
          'social-anxiety',
          'anxiety-depression',
          'mindfulness-meditation',
          'coping-strategies',
        ],
        weight: 0.7,
      },

      // PTSD-5 Scale (0-20)
      ptsd5: {
        score: 0,
        communities: [
          'ptsd-support',
          'trauma-recovery',
          'veterans-support',
          'complex-trauma',
          'healing-journey',
          'therapy-discussion',
        ],
        weight: 0.9, // Very high weight for PTSD matching
      },

      // Additional assessments can be added here
      // bipolar: { score: 0, communities: ['bipolar-support', 'mood-disorders'], weight: 0.8 },
      // ocd: { score: 0, communities: ['ocd-support', 'anxiety-disorders'], weight: 0.7 },
    };
  }

  /**
   * Calculate compatibility score between user and community based on assessment scores
   */
  async calculateCompatibilityScore(
    userAssessmentProfile: UserAssessmentProfile,
    communitySlug: string,
  ): Promise<CommunityCompatibilityResult> {
    const mappings = this.getAssessmentCommunityMappings();
    let totalScore = 0;
    let totalWeight = 0;
    const matchingFactors: string[] = [];
    const assessmentContributions: { [key: string]: any } = {};

    // Get community information
    const community = await this.prisma.community.findUnique({
      where: { slug: communitySlug },
      select: { id: true, name: true, slug: true },
    });

    if (!community) {
      throw new Error(`Community not found: ${communitySlug}`);
    }

    // Calculate contribution from each assessment
    for (const [assessmentType, assessmentData] of Object.entries(
      userAssessmentProfile.assessments,
    )) {
      const mapping = mappings[assessmentType];
      if (!mapping) continue;

      const userScore = assessmentData.score;
      const isRelevantCommunity = mapping.communities.includes(communitySlug);

      if (isRelevantCommunity) {
        // Calculate compatibility based on severity and community focus
        const severityMultiplier = this.getSeverityMultiplier(
          assessmentType,
          userScore,
        );
        const communitySpecificityBonus = this.getCommunitySpecificityBonus(
          communitySlug,
          assessmentType,
        );

        const contribution =
          severityMultiplier * communitySpecificityBonus * mapping.weight;

        totalScore += contribution;
        totalWeight += mapping.weight;

        matchingFactors.push(
          `${assessmentType.toUpperCase()} (${assessmentData.severity})`,
        );

        assessmentContributions[assessmentType] = {
          score: userScore,
          weight: mapping.weight,
          contribution: contribution,
        };
      }
    }

    // Normalize score to 0-1 range
    const compatibilityScore =
      totalWeight > 0 ? Math.min(totalScore / totalWeight, 1.0) : 0;

    // Generate reasoning text
    const reasoning = this.generateReasoningText(
      community.name,
      matchingFactors,
      compatibilityScore,
      assessmentContributions,
    );

    return {
      communityId: community.id,
      communitySlug: community.slug,
      compatibilityScore,
      reasoning,
      matchingFactors,
      assessmentContributions,
    };
  }

  /**
   * Get severity multiplier based on assessment type and score
   */
  private getSeverityMultiplier(assessmentType: string, score: number): number {
    switch (assessmentType) {
      case 'phq9':
        // PHQ-9: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe
        if (score <= 4) return 0.3; // Minimal depression - low community need
        if (score <= 9) return 0.6; // Mild depression - moderate community benefit
        if (score <= 14) return 0.9; // Moderate depression - high community benefit
        if (score <= 19) return 1.0; // Moderately severe - maximum community benefit
        return 1.0; // Severe depression - maximum community benefit

      case 'gad7':
        // GAD-7: 0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe
        if (score <= 4) return 0.3;
        if (score <= 9) return 0.6;
        if (score <= 14) return 0.9;
        return 1.0;

      case 'ptsd5':
        // PTSD-5: 0-2 minimal, 3-7 mild, 8-14 moderate, 15-20 severe
        if (score <= 2) return 0.3;
        if (score <= 7) return 0.6;
        if (score <= 14) return 0.9;
        return 1.0;

      default:
        return 0.5; // Default multiplier for unknown assessment types
    }
  }

  /**
   * Get bonus for community-specific focus
   */
  private getCommunitySpecificityBonus(
    communitySlug: string,
    assessmentType: string,
  ): number {
    // Bonus for highly specific communities
    const specificCommunities = {
      'depression-support': ['phq9'],
      'anxiety-support': ['gad7'],
      'ptsd-support': ['ptsd5'],
      'trauma-recovery': ['ptsd5'],
      'panic-disorder': ['gad7'],
      'social-anxiety': ['gad7'],
    };

    const communityAssessments = specificCommunities[communitySlug];
    if (communityAssessments && communityAssessments.includes(assessmentType)) {
      return 1.2; // 20% bonus for highly specific matches
    }

    // General communities get no bonus
    const generalCommunities = [
      'general-support',
      'mental-wellness',
      'therapy-discussion',
    ];
    if (generalCommunities.includes(communitySlug)) {
      return 0.8; // Slight reduction for general communities
    }

    return 1.0; // No bonus/penalty for other communities
  }

  /**
   * Generate human-readable reasoning text
   */
  private generateReasoningText(
    communityName: string,
    matchingFactors: string[],
    compatibilityScore: number,
    assessmentContributions: { [key: string]: any },
  ): string {
    const scorePercentage = Math.round(compatibilityScore * 100);

    let reasoning = `Based on your assessment results, you have a ${scorePercentage}% compatibility with ${communityName}. `;

    if (matchingFactors.length > 0) {
      reasoning += `This recommendation is based on your ${matchingFactors.join(', ')} scores. `;
    }

    if (compatibilityScore >= 0.8) {
      reasoning +=
        'This community appears to be an excellent match for your current needs and may provide valuable support and resources.';
    } else if (compatibilityScore >= 0.6) {
      reasoning +=
        'This community could be a good fit and may offer helpful support for your situation.';
    } else if (compatibilityScore >= 0.4) {
      reasoning +=
        'This community may provide some relevant support, though it might not be the most targeted for your specific needs.';
    } else {
      reasoning +=
        'While this community offers general support, there may be other communities that are more specifically aligned with your assessment results.';
    }

    return reasoning;
  }

  /**
   * Get comprehensive community recommendations for a user
   */
  async getRecommendationsForUser(
    userId: string,
  ): Promise<CommunityCompatibilityResult[]> {
    try {
      // Get user's latest assessment scores
      const userAssessmentProfile = await this.getUserAssessmentProfile(userId);

      if (
        !userAssessmentProfile ||
        Object.keys(userAssessmentProfile.assessments).length === 0
      ) {
        this.logger.warn(`No assessment data found for user ${userId}`);
        return [];
      }

      // Get all available communities
      const communities = await this.prisma.community.findMany({
        select: { slug: true, name: true },
      });

      // Calculate compatibility for each community
      const recommendations: CommunityCompatibilityResult[] = [];

      for (const community of communities) {
        try {
          const compatibility = await this.calculateCompatibilityScore(
            userAssessmentProfile,
            community.slug,
          );

          // Only include communities with meaningful compatibility (>20%)
          if (compatibility.compatibilityScore > 0.2) {
            recommendations.push(compatibility);
          }
        } catch (error) {
          this.logger.error(
            `Error calculating compatibility for ${community.slug}:`,
            error,
          );
        }
      }

      // Sort by compatibility score (highest first)
      recommendations.sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore,
      );

      // Return top 10 recommendations
      return recommendations.slice(0, 10);
    } catch (error) {
      this.logger.error(
        `Error getting recommendations for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get user's assessment profile from database
   */
  private async getUserAssessmentProfile(
    userId: string,
  ): Promise<UserAssessmentProfile | null> {
    try {
      // Get user's latest pre-assessment data
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          answers: true,
          createdAt: true,
        },
      });

      if (!preAssessment) {
        return null;
      }

      // Extract data from answers JSON
      const assessmentData = preAssessment.answers as any;
      if (!assessmentData || typeof assessmentData !== 'object') {
        this.logger.warn(`Invalid assessment data for user ${userId}`);
        return null;
      }

      const scores = assessmentData.scores as any;
      const severityLevels = assessmentData.severityLevels as any;

      if (!scores) {
        this.logger.warn(`No scores found in assessment data for user ${userId}`);
        return null;
      }

      const assessments: { [key: string]: any } = {};

      // Map PHQ-9 score from JSON data
      if (scores?.phq9Score !== null && scores?.phq9Score !== undefined) {
        assessments.phq9 = {
          score: scores.phq9Score,
          severity: this.getDepressionSeverity(scores.phq9Score),
          date: preAssessment.createdAt,
        };
      }

      // Map GAD-7 score from JSON data
      if (scores?.gad7Score !== null && scores?.gad7Score !== undefined) {
        assessments.gad7 = {
          score: scores.gad7Score,
          severity: this.getAnxietySeverity(scores.gad7Score),
          date: preAssessment.createdAt,
        };
      }

      // Map PTSD-5 score from JSON data
      if (scores?.ptsd5Score !== null && scores?.ptsd5Score !== undefined) {
        assessments.ptsd5 = {
          score: scores.ptsd5Score,
          severity: this.getPTSDSeverity(scores.ptsd5Score),
          date: preAssessment.createdAt,
        };
      }

      return {
        userId,
        assessments,
      };
    } catch (error) {
      this.logger.error(
        `Error getting assessment profile for user ${userId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get depression severity label from PHQ-9 score
   */
  private getDepressionSeverity(score: number): string {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately severe';
    return 'severe';
  }

  /**
   * Get anxiety severity label from GAD-7 score
   */
  private getAnxietySeverity(score: number): string {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }

  /**
   * Get PTSD severity label from PTSD-5 score
   */
  private getPTSDSeverity(score: number): string {
    if (score <= 2) return 'minimal';
    if (score <= 7) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }

  /**
   * Detect when user's assessments have changed and trigger recommendation refresh
   */
  async handleAssessmentChange(
    userId: string,
    assessmentType: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Assessment change detected for user ${userId}: ${assessmentType}`,
      );

      // Get new recommendations
      const newRecommendations = await this.getRecommendationsForUser(userId);

      // Store recommendations in database (will be handled by CommunityRecommendationService)
      // For now, just log the change
      this.logger.log(
        `Generated ${newRecommendations.length} new recommendations for user ${userId}`,
      );

      // TODO: Trigger notification to user about new community matches
      // TODO: Update existing recommendations if they exist
    } catch (error) {
      this.logger.error(
        `Error handling assessment change for user ${userId}:`,
        error,
      );
    }
  }
}
