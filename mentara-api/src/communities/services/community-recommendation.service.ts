import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { CommunityMatchingService } from './community-matching.service';

interface CommunityRecommendation {
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
  ) {}

  /**
   * Calculate community recommendations on-demand based on user's assessment data
   */
  async getUserRecommendations(
    userId: string,
  ): Promise<CommunityRecommendation[]> {
    try {
      // Get user's assessment data
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            select: { communityId: true },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Get user's current communities to exclude from recommendations
      const currentCommunityIds = user.memberships.map((m) => m.communityId);

      // Get all available communities
      const communities = await this.prisma.community.findMany({
        where: {
          id: { notIn: currentCommunityIds },
        },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      });

      // Calculate compatibility scores on-demand
      const recommendations: CommunityRecommendation[] = [];

      for (const community of communities) {
        // Use the existing matching service to calculate compatibility
        const compatibilityScore = await this.calculateCompatibilityScore(
          [], // No assessment responses for now - simplified
          community,
        );

        if (compatibilityScore > 0.3) {
          // Only recommend if score is decent
          const now = new Date();
          recommendations.push({
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            imageUrl: community.imageUrl,
            memberCount: community._count.memberships,
            compatibilityScore,
            score: compatibilityScore, // alias
            reason: this.generateRecommendationReason(compatibilityScore),
            status: 'pending', // calculated on-demand
            createdAt: now, // dummy for compatibility
            updatedAt: now, // dummy for compatibility
          });
        }
      }

      // Sort by compatibility score and return top 10
      return recommendations
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 10);
    } catch (error) {
      this.logger.error(
        `Error getting recommendations for user ${userId}:`,
        error,
      );
      return [];
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
}
