import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { CommunityMatchingService } from './community-matching.service';
import { 
  getCommunityRecommendationsWithScores,
  getCommunityBySlug,
  ILLNESS_COMMUNITIES 
} from '../../config/community-configs';
import { AiServiceClient } from '../../pre-assessment/services/ai-service.client';

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
              preAssessment: true,
            },
          },
          memberships: {
            select: { communityId: true },
          },
        },
      });

      if (!user || !user.client) {
        throw new NotFoundException(`User ${userId} not found or not a client`);
      }

      // Check if user has completed preassessment
      if (!user.client.preAssessment) {
        this.logger.warn(`No preassessment found for user ${userId}`);
        return this.getFallbackRecommendations(userId);
      }

      // Get AI disorder predictions from preassessment data
      let disorderPredictions: Record<string, boolean> = {};
      try {
        const assessmentAnswers = user.client.preAssessment.answers as any;
        if (assessmentAnswers?.questionnaires && Array.isArray(assessmentAnswers.questionnaires)) {
          const aiResult = await this.aiServiceClient.predict({
            inputs: assessmentAnswers.questionnaires
          });
          disorderPredictions = aiResult;
          this.logger.log(`AI predictions obtained for user ${userId}: ${Object.keys(disorderPredictions).filter(k => disorderPredictions[k]).join(', ')}`);
        } else {
          this.logger.warn(`Invalid preassessment data format for user ${userId}`);
          return this.getFallbackRecommendations(userId);
        }
      } catch (error) {
        this.logger.error(`Failed to get AI predictions for user ${userId}:`, error);
        return this.getFallbackRecommendations(userId);
      }

      // Get user's current communities to exclude from recommendations
      const currentCommunityIds = user.memberships.map((m) => m.communityId);

      // Get community recommendations based on AI predictions
      const aiRecommendations = getCommunityRecommendationsWithScores(disorderPredictions);
      
      if (aiRecommendations.length === 0) {
        this.logger.log(`No AI-based recommendations for user ${userId}, using fallback`);
        return this.getFallbackRecommendations(userId);
      }

      // Get database communities that match recommendations
      const recommendedSlugs = aiRecommendations.map(rec => rec.slug);
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
        const aiRec = aiRecommendations.find(rec => rec.slug === community.slug);
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

      this.logger.log(`Generated ${sortedRecommendations.length} AI-based community recommendations for user ${userId}`);
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
  private generateAIBasedReason(disorderPredictions: Record<string, boolean>, communitySlug: string): string {
    const activeDisorders = Object.keys(disorderPredictions).filter(disorder => disorderPredictions[disorder]);
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
      .filter(disorder => disorderNames[disorder])
      .map(disorder => disorderNames[disorder]);

    if (relevantDisorders.length > 0) {
      const disorderList = relevantDisorders.length === 1 
        ? relevantDisorders[0]
        : relevantDisorders.slice(0, -1).join(', ') + ' and ' + relevantDisorders[relevantDisorders.length - 1];
      
      return `Recommended based on your ${disorderList} assessment results`;
    }

    return 'Recommended based on your mental health assessment';
  }

  /**
   * Get fallback community recommendations when AI predictions are not available
   */
  private async getFallbackRecommendations(userId: string): Promise<CommunityRecommendation[]> {
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

      const currentCommunityIds = user?.memberships.map((m) => m.communityId) || [];

      // Get popular communities (by member count) as fallback
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
        compatibilityScore: 0.6 - (index * 0.05), // Decreasing score based on popularity
        score: 0.6 - (index * 0.05),
        reason: 'Popular community that might interest you',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }));

    } catch (error) {
      this.logger.error(`Error getting fallback recommendations for user ${userId}:`, error);
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
    communitySlugs: string[]
  ): Promise<{
    successfulJoins: Array<{ communityId: string; communityName: string; slug: string }>;
    failedJoins: Array<{ slug: string; reason: string }>;
  }> {
    const successfulJoins: Array<{ communityId: string; communityName: string; slug: string }> = [];
    const failedJoins: Array<{ slug: string; reason: string }> = [];

    for (const slug of communitySlugs) {
      try {
        // Find the community by slug
        const community = await this.prisma.community.findUnique({
          where: { slug },
          select: { id: true, name: true, slug: true }
        });

        if (!community) {
          failedJoins.push({ slug, reason: 'Community not found' });
          continue;
        }

        // Check if user is already a member
        const existingMembership = await this.prisma.membership.findUnique({
          where: {
            userId_communityId: {
              userId,
              communityId: community.id
            }
          }
        });

        if (existingMembership) {
          failedJoins.push({ slug, reason: 'Already a member' });
          continue;
        }

        // Create membership
        await this.prisma.membership.create({
          data: {
            userId,
            communityId: community.id,
            joinedAt: new Date()
          }
        });

        successfulJoins.push({
          communityId: community.id,
          communityName: community.name,
          slug: community.slug
        });

        this.logger.log(`User ${userId} successfully joined community ${community.name} (${slug})`);

      } catch (error) {
        this.logger.error(`Error joining community ${slug} for user ${userId}:`, error);
        failedJoins.push({ 
          slug, 
          reason: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    this.logger.log(
      `Community join results for user ${userId}: ${successfulJoins.length} successful, ${failedJoins.length} failed`
    );

    return { successfulJoins, failedJoins };
  }
}
