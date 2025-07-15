import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { CommunityMatchingService } from './community-matching.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface CreateRecommendationDto {
  userId: string;
  force?: boolean; // Force regeneration of existing recommendations
}

interface UserRecommendationResponse {
  id: string;
  userId: string;
  community: {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    memberCount: number;
  };
  compatibilityScore: number;
  reasoning: string;
  assessmentScores: any;
  isAccepted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationInteractionDto {
  recommendationId: string;
  action: 'accept' | 'reject';
  userId: string;
}

interface RecommendationStats {
  totalRecommendations: number;
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  pendingRecommendations: number;
  averageCompatibilityScore: number;
  topCommunities: {
    communityId: string;
    communityName: string;
    acceptanceRate: number;
    totalRecommendations: number;
  }[];
}

@Injectable()
export class CommunityRecommendationService {
  private readonly logger = new Logger(CommunityRecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly communityMatchingService: CommunityMatchingService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Generate and store community recommendations for a user
   */
  async generateRecommendationsForUser(dto: CreateRecommendationDto): Promise<UserRecommendationResponse[]> {
    const { userId, force = false } = dto;

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Check if recommendations already exist
      const existingRecommendations = await this.prisma.communityRecommendation.findMany({
        where: { userId },
        select: { id: true }
      });

      if (existingRecommendations.length > 0 && !force) {
        this.logger.log(`User ${userId} already has ${existingRecommendations.length} recommendations`);
        return this.getUserRecommendations(userId);
      }

      // Delete existing recommendations if force regeneration
      if (force && existingRecommendations.length > 0) {
        await this.prisma.communityRecommendation.deleteMany({
          where: { userId }
        });
        this.logger.log(`Deleted ${existingRecommendations.length} existing recommendations for user ${userId}`);
      }

      // Generate new recommendations using CommunityMatchingService
      const compatibilityResults = await this.communityMatchingService.getRecommendationsForUser(userId);

      if (compatibilityResults.length === 0) {
        this.logger.warn(`No recommendations generated for user ${userId} - no assessment data or communities found`);
        return [];
      }

      // Store recommendations in database
      const createRecommendations = compatibilityResults.map(result => ({
        userId,
        communityId: result.communityId,
        compatibilityScore: result.compatibilityScore,
        reasoning: result.reasoning,
        assessmentScores: result.assessmentContributions
      }));

      await this.prisma.communityRecommendation.createMany({
        data: createRecommendations
      });

      this.logger.log(`Generated ${createRecommendations.length} recommendations for user ${userId}`);

      // Emit event for real-time notifications
      this.eventEmitter.emit('community.recommendations.generated', {
        userId,
        recommendationCount: createRecommendations.length,
        timestamp: new Date()
      });

      // Return the formatted recommendations
      return this.getUserRecommendations(userId);

    } catch (error) {
      this.logger.error(`Error generating recommendations for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's current recommendations with community details
   */
  async getUserRecommendations(userId: string): Promise<UserRecommendationResponse[]> {
    try {
      const recommendations = await this.prisma.communityRecommendation.findMany({
        where: { userId },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              imageUrl: true,
              _count: {
                select: { memberships: true }
              }
            }
          }
        },
        orderBy: { compatibilityScore: 'desc' }
      });

      return recommendations.map(rec => ({
        id: rec.id,
        userId: rec.userId,
        community: {
          id: rec.community.id,
          name: rec.community.name,
          slug: rec.community.slug,
          description: rec.community.description,
          imageUrl: rec.community.imageUrl,
          memberCount: rec.community._count.memberships
        },
        compatibilityScore: rec.compatibilityScore,
        reasoning: rec.reasoning,
        assessmentScores: rec.assessmentScores,
        isAccepted: rec.isAccepted,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      }));

    } catch (error) {
      this.logger.error(`Error getting recommendations for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Handle user interaction with recommendation (accept/reject)
   */
  async handleRecommendationInteraction(dto: RecommendationInteractionDto): Promise<void> {
    const { recommendationId, action, userId } = dto;

    try {
      // Verify the recommendation exists and belongs to the user
      const recommendation = await this.prisma.communityRecommendation.findFirst({
        where: {
          id: recommendationId,
          userId
        },
        include: {
          community: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      if (!recommendation) {
        throw new NotFoundException(`Recommendation not found: ${recommendationId}`);
      }

      const isAccepted = action === 'accept';

      // Update recommendation status
      await this.prisma.communityRecommendation.update({
        where: { id: recommendationId },
        data: { isAccepted }
      });

      // If accepted, create community membership
      if (isAccepted) {
        await this.createCommunityMembership(userId, recommendation.communityId);
      }

      // Emit event for analytics and real-time updates
      this.eventEmitter.emit('community.recommendation.interaction', {
        userId,
        communityId: recommendation.communityId,
        communityName: recommendation.community.name,
        action,
        compatibilityScore: recommendation.compatibilityScore,
        timestamp: new Date()
      });

      this.logger.log(`User ${userId} ${action}ed recommendation for community ${recommendation.community.name}`);

    } catch (error) {
      this.logger.error(`Error handling recommendation interaction:`, error);
      throw error;
    }
  }

  /**
   * Create community membership when user accepts recommendation
   */
  private async createCommunityMembership(userId: string, communityId: string): Promise<void> {
    try {
      // Check if membership already exists
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId
          }
        }
      });

      if (existingMembership) {
        this.logger.log(`User ${userId} already has membership in community ${communityId}`);
        return;
      }

      // Create new membership
      await this.prisma.membership.create({
        data: {
          userId,
          communityId,
          role: 'member'
        }
      });

      // Emit event for real-time notifications
      this.eventEmitter.emit('community.member.joined', {
        userId,
        communityId,
        joinMethod: 'recommendation_accepted',
        timestamp: new Date()
      });

      this.logger.log(`Created membership for user ${userId} in community ${communityId}`);

    } catch (error) {
      this.logger.error(`Error creating community membership:`, error);
      throw error;
    }
  }

  /**
   * Refresh recommendations when user's assessment data changes
   */
  async refreshRecommendationsForUser(userId: string): Promise<void> {
    try {
      this.logger.log(`Refreshing recommendations for user ${userId} due to assessment change`);

      // Generate new recommendations (force regeneration)
      await this.generateRecommendationsForUser({ userId, force: true });

      // Emit event for real-time notifications
      this.eventEmitter.emit('community.recommendations.refreshed', {
        userId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error(`Error refreshing recommendations for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get recommendation statistics for analytics
   */
  async getRecommendationStats(userId?: string): Promise<RecommendationStats> {
    try {
      const whereClause = userId ? { userId } : {};

      const [
        totalRecommendations,
        acceptedRecommendations,
        rejectedRecommendations,
        pendingRecommendations,
        avgCompatibilityResult,
        topCommunitiesResult
      ] = await Promise.all([
        // Total recommendations
        this.prisma.communityRecommendation.count({
          where: whereClause
        }),

        // Accepted recommendations
        this.prisma.communityRecommendation.count({
          where: { ...whereClause, isAccepted: true }
        }),

        // Rejected recommendations
        this.prisma.communityRecommendation.count({
          where: { ...whereClause, isAccepted: false }
        }),

        // Pending recommendations
        this.prisma.communityRecommendation.count({
          where: { ...whereClause, isAccepted: null }
        }),

        // Average compatibility score
        this.prisma.communityRecommendation.aggregate({
          where: whereClause,
          _avg: { compatibilityScore: true }
        }),

        // Top communities by acceptance rate
        this.prisma.communityRecommendation.groupBy({
          by: ['communityId'],
          where: whereClause,
          _count: { _all: true },
          _sum: { isAccepted: true }
        })
      ]);

      // Process top communities data
      const topCommunities = await Promise.all(
        topCommunitiesResult.slice(0, 10).map(async (result) => {
          const community = await this.prisma.community.findUnique({
            where: { id: result.communityId },
            select: { name: true }
          });

          const acceptedCount = result._sum.isAccepted || 0;
          const totalCount = result._count._all;
          const acceptanceRate = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

          return {
            communityId: result.communityId,
            communityName: community?.name || 'Unknown',
            acceptanceRate,
            totalRecommendations: totalCount
          };
        })
      );

      return {
        totalRecommendations,
        acceptedRecommendations,
        rejectedRecommendations,
        pendingRecommendations,
        averageCompatibilityScore: avgCompatibilityResult._avg.compatibilityScore || 0,
        topCommunities: topCommunities.sort((a, b) => b.acceptanceRate - a.acceptanceRate)
      };

    } catch (error) {
      this.logger.error(`Error getting recommendation stats:`, error);
      throw error;
    }
  }

  /**
   * Clean up old recommendations (older than 30 days and processed)
   */
  async cleanupOldRecommendations(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await this.prisma.communityRecommendation.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          isAccepted: { not: null } // Only delete processed recommendations
        }
      });

      this.logger.log(`Cleaned up ${deleted.count} old recommendations`);

    } catch (error) {
      this.logger.error(`Error cleaning up old recommendations:`, error);
      throw error;
    }
  }

  /**
   * Get recommendation by ID with full details
   */
  async getRecommendationById(recommendationId: string, userId: string): Promise<UserRecommendationResponse> {
    try {
      const recommendation = await this.prisma.communityRecommendation.findFirst({
        where: {
          id: recommendationId,
          userId
        },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              imageUrl: true,
              _count: {
                select: { memberships: true }
              }
            }
          }
        }
      });

      if (!recommendation) {
        throw new NotFoundException(`Recommendation not found: ${recommendationId}`);
      }

      return {
        id: recommendation.id,
        userId: recommendation.userId,
        community: {
          id: recommendation.community.id,
          name: recommendation.community.name,
          slug: recommendation.community.slug,
          description: recommendation.community.description,
          imageUrl: recommendation.community.imageUrl,
          memberCount: recommendation.community._count.memberships
        },
        compatibilityScore: recommendation.compatibilityScore,
        reasoning: recommendation.reasoning,
        assessmentScores: recommendation.assessmentScores,
        isAccepted: recommendation.isAccepted,
        createdAt: recommendation.createdAt,
        updatedAt: recommendation.updatedAt
      };

    } catch (error) {
      this.logger.error(`Error getting recommendation ${recommendationId}:`, error);
      throw error;
    }
  }
}