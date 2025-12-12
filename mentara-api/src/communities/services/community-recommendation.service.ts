import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { CommunityMatchingService } from './community-matching.service';
import {
  getCommunityRecommendationsWithScores,
  getCommunityBySlug,
} from '../../config/community-configs';
import { AiServiceClient } from '../../pre-assessment/services/ai-service.client';
import {
  processPreAssessmentAnswers,
  QuestionnaireScores,
} from '../../pre-assessment/pre-assessment.utils';

export interface CommunityRecommendation {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  compatibilityScore: number;
  score: number; // alias for compatibility
  reason: string;
  status: string; // calculated on-demand
  createdAt: Date; // dummy values for compatibility
  updatedAt: Date; // dummy values for compatibility
}

@Injectable()
export class CommunityRecommendationService {
  private readonly logger = new Logger(CommunityRecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly communityMatching: CommunityMatchingService,
    private readonly aiServiceClient: AiServiceClient,
  ) {}

  /**
   * Calculate community recommendations based on AI disorder predictions from user's assessment
   */
  async getUserRecommendations(
    userId: string,
  ): Promise<CommunityRecommendation[]> {
    try {
      // Get user's data including preassessment and current memberships
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          client: {
            include: {
              preAssessments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          memberships: {
            select: { communityId: true },
          },
        },
      }) as any; // Type assertion needed due to Prisma type generation timing

      if (!user || !user.client) {
        throw new NotFoundException(`User ${userId} not found or not a client`);
      }

      // Get the latest pre-assessment
      const latestPreAssessment = user.client.preAssessments?.[0] || null;

      // Check if user has completed preassessment
      if (!latestPreAssessment) {
        this.logger.warn(`No preassessment found for user ${userId}`);
        return this.getFallbackRecommendations(userId);
      }

      // Get AI disorder predictions from preassessment data
      let disorderPredictions: Record<string, boolean> = {};
      try {
        const assessmentAnswers = latestPreAssessment.answers as any;
        if (
          assessmentAnswers &&
          Array.isArray(assessmentAnswers) &&
          assessmentAnswers.length === 201
        ) {
          const aiResult =
            await this.aiServiceClient.predict(assessmentAnswers);
          disorderPredictions = aiResult.predictions || {};
          this.logger.log(
            `AI predictions obtained for user ${userId}: ${Object.keys(
              disorderPredictions,
            )
              .filter((k) => disorderPredictions[k])
              .join(', ')}`,
          );
        } else {
          this.logger.warn(
            `Invalid preassessment data format for user ${userId}`,
          );
          return this.getFallbackRecommendations(userId, assessmentAnswers);
        }
      } catch (error) {
        this.logger.error(
          `Failed to get AI predictions for user ${userId}:`,
          error,
        );
        const assessmentAnswers = latestPreAssessment.answers as any;
        return this.getFallbackRecommendations(userId, assessmentAnswers);
      }

      // Get user's current communities to exclude from recommendations
      const currentCommunityIds = user.memberships.map((m) => m.communityId);

      // Get community recommendations based on AI predictions
      const aiRecommendations =
        getCommunityRecommendationsWithScores(disorderPredictions);

      if (aiRecommendations.length === 0) {
        this.logger.log(
          `No AI-based recommendations for user ${userId}, using fallback`,
        );
        const assessmentAnswers = latestPreAssessment.answers as any;
        return this.getFallbackRecommendations(userId, assessmentAnswers);
      }

      // Get database communities that match recommendations
      const recommendedSlugs = aiRecommendations.map((rec) => rec.slug);
      const communities = await this.prisma.community.findMany({
        where: {
          slug: { in: recommendedSlugs },
          id: { notIn: currentCommunityIds },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      });

      // Create final recommendations with real data
      const recommendations: CommunityRecommendation[] = [];
      const now = new Date();

      for (const community of communities) {
        const aiRec = aiRecommendations.find(
          (rec) => rec.slug === community.slug,
        );
        if (aiRec) {
          recommendations.push({
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            imageUrl: community.imageUrl || '/images/communities/default.jpg',
            memberCount: community._count.memberships,
            compatibilityScore: aiRec.score,
            score: aiRec.score,
            reason: this.generateAIBasedReason(disorderPredictions, aiRec.slug),
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Sort by AI compatibility score and return
      const sortedRecommendations = recommendations
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 8); // Limit to top 8 recommendations

      this.logger.log(
        `Generated ${sortedRecommendations.length} AI-based community recommendations for user ${userId}`,
      );
      return sortedRecommendations;
    } catch (error) {
      this.logger.error(
        `Error getting recommendations for user ${userId}:`,
        error,
      );
      return this.getFallbackRecommendations(userId);
    }
  }

  private async calculateCompatibilityScore(
    assessmentResponses: any[],
    community: any,
  ): Promise<number> {
    // Simplified compatibility calculation
    // In a real system, this would use the assessment responses to match with community characteristics
    const baseScore = Math.random() * 0.8 + 0.2; // 0.2-1.0 for demo

    // Factor in community size (smaller communities might be better matches)
    const sizeBonus = community._count.memberships < 50 ? 0.1 : 0;

    return Math.min(baseScore + sizeBonus, 1.0);
  }

  private generateRecommendationReason(score: number): string {
    if (score > 0.8)
      return 'Excellent match based on your assessment responses';
    if (score > 0.6) return 'Good compatibility with your interests';
    if (score > 0.4) return 'Potential good fit for your needs';
    return 'Moderate compatibility';
  }

  /**
   * Generate AI-based recommendation reason
   */
  private generateAIBasedReason(
    disorderPredictions: Record<string, boolean>,
    communitySlug: string,
  ): string {
    const activeDisorders = Object.keys(disorderPredictions).filter(
      (disorder) => disorderPredictions[disorder],
    );
    const community = getCommunityBySlug(communitySlug);

    if (!community) {
      return 'Recommended based on your assessment responses';
    }

    // Map common disorders to user-friendly terms
    const disorderNames: Record<string, string> = {
      Has_Depression: 'depression',
      Has_Anxiety: 'anxiety',
      Has_Social_Anxiety: 'social anxiety',
      Has_PTSD: 'PTSD',
      Has_Panic_Disorder: 'panic disorder',
      Has_Bipolar: 'bipolar disorder',
      Has_OCD: 'OCD',
      Has_Insomnia: 'sleep issues',
      Has_High_Stress: 'stress',
      Has_Burnout: 'burnout',
      Has_Binge_Eating: 'eating concerns',
      Has_ADHD: 'ADHD',
      Has_Alcohol_Problem: 'alcohol concerns',
      Has_Drug_Problem: 'substance concerns',
      Has_Phobia: 'phobias',
      Has_Agoraphobia: 'agoraphobia',
      Has_BloodPhobia: 'blood phobia',
      Has_SocialPhobia: 'social phobia',
      Has_Hoarding: 'hoarding tendencies',
    };

    const relevantDisorders = activeDisorders
      .filter((disorder) => disorderNames[disorder])
      .map((disorder) => disorderNames[disorder]);

    if (relevantDisorders.length > 0) {
      const disorderList =
        relevantDisorders.length === 1
          ? relevantDisorders[0]
          : relevantDisorders.slice(0, -1).join(', ') +
            ' and ' +
            relevantDisorders[relevantDisorders.length - 1];

      return `Recommended based on your ${disorderList} assessment results`;
    }

    return 'Recommended based on your mental health assessment';
  }

  /**
   * Get community recommendations using manual questionnaire scoring when AI is unavailable
   */
  private async getFallbackRecommendations(
    userId: string,
    questionnaireAnswers?: number[],
  ): Promise<CommunityRecommendation[]> {
    try {
      // Get user's current communities to exclude
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            select: { communityId: true },
          },
        },
      });

      const currentCommunityIds =
        user?.memberships.map((m) => m.communityId) || [];

      // If we have questionnaire data, use manual scoring for personalized recommendations
      if (
        questionnaireAnswers &&
        Array.isArray(questionnaireAnswers) &&
        questionnaireAnswers.length === 201
      ) {
        this.logger.log(
          `Using manual questionnaire scoring for fallback recommendations for user ${userId}`,
        );
        return this.getQuestionnaireBasedRecommendations(
          userId,
          questionnaireAnswers,
          currentCommunityIds,
        );
      }

      // Otherwise, fall back to popular communities
      this.logger.log(
        `Using popular communities fallback for user ${userId} (no questionnaire data)`,
      );
      return this.getPopularCommunitiesFallback(userId, currentCommunityIds);
    } catch (error) {
      this.logger.error(
        `Error getting fallback recommendations for user ${userId}:`,
        error,
      );
      return this.getPopularCommunitiesFallback(userId, []);
    }
  }

  /**
   * Get recommendations based on manual questionnaire scoring
   */
  private async getQuestionnaireBasedRecommendations(
    userId: string,
    questionnaireAnswers: number[],
    currentCommunityIds: string[],
  ): Promise<CommunityRecommendation[]> {
    try {
      // Process questionnaire answers using manual scoring system
      const assessmentResult =
        processPreAssessmentAnswers(questionnaireAnswers);
      const scores = assessmentResult.scores;
      const severityLevels = assessmentResult.severityLevels;

      this.logger.debug(`Manual scoring results for user ${userId}:`, {
        scores: Object.keys(scores).reduce(
          (acc, key) => ({ ...acc, [key]: scores[key] }),
          {},
        ),
        severityLevels: Object.keys(severityLevels).reduce(
          (acc, key) => ({ ...acc, [key]: severityLevels[key] }),
          {},
        ),
      });

      // Create disorder predictions based on severity levels
      const manualPredictions =
        this.createDisorderPredictionsFromSeverity(severityLevels);

      // Get community recommendations using the same logic as AI predictions
      const communityRecommendations =
        getCommunityRecommendationsWithScores(manualPredictions);

      if (communityRecommendations.length === 0) {
        this.logger.warn(
          `No communities found for manual predictions for user ${userId}`,
        );
        return this.getPopularCommunitiesFallback(userId, currentCommunityIds);
      }

      // Get database communities that match manual recommendations
      const recommendedSlugs = communityRecommendations.map((rec) => rec.slug);
      const communities = await this.prisma.community.findMany({
        where: {
          slug: { in: recommendedSlugs },
          id: { notIn: currentCommunityIds },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      });

      // Create final recommendations with manual scoring data
      const recommendations: CommunityRecommendation[] = [];
      const now = new Date();

      for (const community of communities) {
        const recommendation = communityRecommendations.find(
          (rec) => rec.slug === community.slug,
        );
        if (recommendation) {
          recommendations.push({
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            imageUrl: community.imageUrl || '/images/communities/default.jpg',
            memberCount: community._count.memberships,
            compatibilityScore: recommendation.score,
            score: recommendation.score,
            reason: this.generateManualScoringReason(
              severityLevels,
              community.slug,
            ),
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Sort by compatibility score
      const sortedRecommendations = recommendations
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 8);

      this.logger.log(
        `Generated ${sortedRecommendations.length} manual scoring-based recommendations for user ${userId}`,
      );
      return sortedRecommendations;
    } catch (error) {
      this.logger.error(
        `Error in questionnaire-based recommendations for user ${userId}:`,
        error,
      );
      return this.getPopularCommunitiesFallback(userId, currentCommunityIds);
    }
  }

  /**
   * Convert severity levels to disorder predictions (similar to AI format)
   */
  private createDisorderPredictionsFromSeverity(
    severityLevels: Record<string, string>,
  ): Record<string, boolean> {
    const predictions: Record<string, boolean> = {};

    // Map questionnaire names to canonical disorder IDs
    const severityToDisorderMapping: Record<string, string> = {
      'PHQ-9': 'depression',
      'GAD-7': 'anxiety',
      ASRS: 'adhd',
      AUDIT: 'alcohol',
      BES: 'binge-eating',
      'DAST-10': 'drug-abuse',
      ISI: 'insomnia',
      MBI: 'burnout',
      MDQ: 'mood-disorder',
      'OCI-R': 'obsessional-compulsive',
      'PCL-5': 'ptsd',
      PDSS: 'panic-disorder',
      PSS: 'stress',
      SPIN: 'social-phobia',
      Phobia: 'phobia',
    };

    // Convert severity levels to boolean predictions
    // Consider 'mild' and above as positive predictions
    Object.entries(severityLevels).forEach(([questionnaire, severity]) => {
      const disorderId = severityToDisorderMapping[questionnaire];
      if (disorderId) {
        predictions[disorderId] =
          severity !== 'subclinical' && severity !== 'minimal';
      }
    });

    this.logger.debug('Manual predictions from severity levels:', predictions);
    return predictions;
  }

  /**
   * Generate recommendation reason based on manual scoring
   */
  private generateManualScoringReason(
    severityLevels: Record<string, string>,
    communitySlug: string,
  ): string {
    // Find which assessments led to this community recommendation
    const relevantAssessments: string[] = [];

    // Map community slugs back to assessment types
    const communityToAssessmentMapping: Record<string, string[]> = {
      'depression-support': ['PHQ-9'],
      'anxiety-warriors': ['GAD-7'],
      'social-anxiety-support': ['SPIN'],
      'ptsd-support': ['PCL-5'],
      'panic-disorder-support': ['PDSS'],
      'bipolar-support': ['MDQ'],
      'ocd-support': ['OCI-R'],
      'insomnia-support': ['ISI'],
      'stress-support': ['PSS'],
      'burnout-recovery': ['MBI'],
      'eating-disorder-recovery': ['BES'],
      'adhd-support': ['ASRS'],
      'alcohol-recovery-support': ['AUDIT'],
      'substance-recovery-support': ['DAST-10'],
      'phobia-support': ['Phobia'],
    };

    const assessments = communityToAssessmentMapping[communitySlug] || [];

    for (const assessment of assessments) {
      const severity = severityLevels[assessment];
      if (severity && severity !== 'subclinical' && severity !== 'minimal') {
        relevantAssessments.push(
          `${severity} ${assessment.toLowerCase().replace('-', ' ')}`,
        );
      }
    }

    if (relevantAssessments.length > 0) {
      return `Recommended based on your ${relevantAssessments.join(' and ')} assessment results`;
    }

    return 'Recommended based on your mental health assessment responses';
  }

  /**
   * Fallback to popular communities when no other options available
   */
  private async getPopularCommunitiesFallback(
    userId: string,
    currentCommunityIds: string[],
  ): Promise<CommunityRecommendation[]> {
    try {
      const communities = await this.prisma.community.findMany({
        where: {
          id: { notIn: currentCommunityIds },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
        orderBy: {
          memberships: {
            _count: 'desc',
          },
        },
        take: 6,
      });

      const now = new Date();
      return communities.map((community, index) => ({
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        imageUrl: community.imageUrl || '/images/communities/default.jpg',
        memberCount: community._count.memberships,
        compatibilityScore: 0.6 - index * 0.05,
        score: 0.6 - index * 0.05,
        reason: 'Popular community that might interest you',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting popular communities fallback for user ${userId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Generate recommendations for a user (just returns the calculated ones)
   */
  async generateRecommendationsForUser(
    userId: string,
    force = false,
  ): Promise<void> {
    // No-op since we calculate on-demand
    this.logger.log(
      `Generated recommendations for user ${userId} (calculated on-demand)`,
    );
  }

  /**
   * Get a specific recommendation by ID (simplified)
   */
  async getRecommendationById(
    recommendationId: string,
  ): Promise<CommunityRecommendation | null> {
    // Since we don't store recommendations, we can't fetch by ID
    // In a real scenario, you'd need to recalculate or return null
    return null;
  }

  /**
   * Handle recommendation interaction (simplified)
   */
  async handleRecommendationInteraction(data: {
    recommendationId: string;
    action: string;
    userId: string;
  }): Promise<void> {
    // No-op since we don't store interactions
    this.logger.log(
      `User ${data.userId} ${data.action}ed recommendation ${data.recommendationId}`,
    );
  }

  /**
   * Stub method for stats - simplified since no table to query
   */
  async getRecommendationStats(): Promise<any> {
    return {
      totalRecommendations: 0,
      acceptedRecommendations: 0,
      rejectedRecommendations: 0,
      pendingRecommendations: 0,
      averageCompatibilityScore: 0,
      topCommunities: [],
    };
  }

  /**
   * Join multiple recommended communities immediately
   */
  async joinRecommendedCommunities(
    userId: string,
    communitySlugs: string[],
  ): Promise<{
    successfulJoins: Array<{
      communityId: string;
      communityName: string;
      slug: string;
    }>;
    failedJoins: Array<{ slug: string; reason: string }>;
  }> {
    const successfulJoins: Array<{
      communityId: string;
      communityName: string;
      slug: string;
    }> = [];
    const failedJoins: Array<{ slug: string; reason: string }> = [];

    this.logger.log(
      `Starting community join process for user ${userId} with ${communitySlugs.length} communities: [${communitySlugs.join(', ')}]`,
    );

    for (const slug of communitySlugs) {
      try {
        // Use transaction to ensure data consistency
        const result = await this.prisma.$transaction(async (tx) => {
          // Find and validate the community exists with enhanced logging
          const community = await tx.community.findUnique({
            where: { slug },
            select: { id: true, name: true, slug: true },
          });

          if (!community) {
            this.logger.warn(`Community not found for slug: ${slug}`);
            throw new Error('Community not found');
          }

          this.logger.debug(
            `Found community: ${community.name} (${community.id}) for slug: ${slug}`,
          );

          // Verify community ID exists (additional safety check)
          const communityExists = await tx.community.findUnique({
            where: { id: community.id },
            select: { id: true },
          });

          if (!communityExists) {
            this.logger.error(
              `Critical: Community ID ${community.id} found by slug but doesn't exist by ID - data integrity issue`,
            );
            throw new Error('Community data integrity issue');
          }

          // Check if user is already a member
          const existingMembership = await tx.membership.findUnique({
            where: {
              userId_communityId: {
                userId,
                communityId: community.id,
              },
            },
          });

          console.log(
            `Checking existing membership for user ${userId} in community ${community.id} (${slug}): `,
            existingMembership,
          );

          if (existingMembership) {
            this.logger.debug(
              `User ${userId} is already a member of community ${community.name} (${slug})`,
            );
            throw new Error('Already a member');
          }

          // Verify user exists before creating membership
          const userExists = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true },
          });

          if (!userExists) {
            this.logger.error(
              `User ${userId} not found when trying to join community ${slug}`,
            );
            throw new Error('User not found');
          }

          // Create membership with enhanced validation
          this.logger.debug(
            `Creating membership for user ${userId} in community ${community.id} (${slug})`,
          );

          const membership = await tx.membership.create({
            data: {
              userId,
              communityId: community.id,
              joinedAt: new Date(),
            },
            select: {
              id: true,
              userId: true,
              communityId: true,
              joinedAt: true,
            },
          });

          this.logger.debug(
            `Successfully created membership: ${membership.id} for user ${userId} in community ${community.id}`,
          );

          return {
            communityId: community.id,
            communityName: community.name,
            slug: community.slug,
          };
        });

        successfulJoins.push(result);
        this.logger.log(
          `✅ User ${userId} successfully joined community ${result.communityName} (${slug})`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `❌ Error joining community ${slug} for user ${userId}:`,
          {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            userId,
            slug,
          },
        );

        // Provide more specific error reasons
        let reason = errorMessage;
        if (errorMessage.includes('Community not found')) {
          reason = 'Community not found';
        } else if (errorMessage.includes('Already a member')) {
          reason = 'Already a member';
        } else if (errorMessage.includes('User not found')) {
          reason = 'User account not found';
        } else if (errorMessage.includes('data integrity')) {
          reason = 'Community data issue - please contact support';
        } else if (errorMessage.includes('foreign key constraint')) {
          reason = 'Database consistency error - please try again';
        } else {
          reason = 'Failed to join community - please try again';
        }

        failedJoins.push({ slug, reason });
      }
    }

    const summary = `Community join results for user ${userId}: ${successfulJoins.length} successful, ${failedJoins.length} failed`;
    this.logger.log(summary);

    if (failedJoins.length > 0) {
      this.logger.warn(`Failed joins details:`, failedJoins);
    }

    return { successfulJoins, failedJoins };
  }
}
