import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface CommunitySearchFilters {
  query?: string;
  tags?: string[];
  minMembers?: number;
  maxMembers?: number;
  sortBy?: 'relevance' | 'members' | 'activity' | 'newest' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  hasDescription?: boolean;
  hasImage?: boolean;
  membershipRequired?: boolean;
}

interface CommunitySearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  recentActivity: {
    postCount: number;
    commentCount: number;
    lastActivityAt: Date | null;
  };
  compatibility?: {
    score: number;
    reasoning: string;
  };
  membershipStatus: 'member' | 'pending' | 'none';
  createdAt: Date;
  tags?: string[];
}

interface EnhancedCommunityDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  stats: {
    totalPosts: number;
    totalComments: number;
    activeMembers: number;
    recentActivity: {
      postsThisWeek: number;
      commentsThisWeek: number;
      newMembersThisWeek: number;
    };
  };
  recentPosts: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    createdAt: Date;
    heartCount: number;
    commentCount: number;
  }[];
  topContributors: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    contributionScore: number;
    postCount: number;
    commentCount: number;
  }[];
  moderators: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    assignedAt: Date;
  }[];
  membershipStatus: 'member' | 'pending' | 'none';
  userPermissions: {
    canPost: boolean;
    canComment: boolean;
    canModerate: boolean;
  };
}

interface CommunityTrendingData {
  growthRate: number; // percentage growth in members
  activityScore: number; // based on posts, comments, hearts
  engagementRate: number; // comments per post ratio
  retentionRate: number; // members active in last 30 days
}

interface CommunityRecommendationContext {
  userId: string;
  includeSimilar?: boolean;
  excludeJoined?: boolean;
  maxResults?: number;
}

@Injectable()
export class EnhancedCommunityService {
  private readonly logger = new Logger(EnhancedCommunityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Advanced community search with filtering and ranking
   */
  async searchCommunities(
    filters: CommunitySearchFilters,
    userId?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    communities: CommunitySearchResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    facets: {
      memberRanges: { range: string; count: number }[];
      commonTags: { tag: string; count: number }[];
    };
  }> {
    try {
      const offset = (page - 1) * limit;

      // Build the search query
      const where: any = {};
      const orderBy: any = [];

      // Text search
      if (filters.query) {
        where.OR = [
          { name: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
        ];
      }

      // Filter by description/image presence
      if (filters.hasDescription !== undefined) {
        where.description = filters.hasDescription ? { not: '' } : '';
      }
      if (filters.hasImage !== undefined) {
        where.imageUrl = filters.hasImage ? { not: '' } : '';
      }

      // Get communities with member counts and recent activity
      const communities = await this.prisma.community.findMany({
        where,
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
          memberships: userId
            ? {
                where: { userId },
                select: { role: true },
              }
            : false,
        },
        skip: offset,
        take: limit,
      });

      // Apply member count filters and calculate activity
      const filteredCommunities = communities.filter((community) => {
        const memberCount = community._count.memberships;

        if (filters.minMembers && memberCount < filters.minMembers)
          return false;
        if (filters.maxMembers && memberCount > filters.maxMembers)
          return false;

        return true;
      });

      // Join requests removed - simplified community system
      let pendingRequests: string[] = [];

      // Transform to search results
      const searchResults: CommunitySearchResult[] = filteredCommunities.map(
        (community) => {
          const memberCount = community._count.memberships;
          const postCount = 0; // Posts are in rooms, not direct community relation
          const commentCount = 0; // Comments are in posts in rooms
          const lastActivityAt = null; // Activity tracking simplified

          // Determine membership status
          let membershipStatus: 'member' | 'pending' | 'none' = 'none';
          if (userId) {
            if (community.memberships && community.memberships.length > 0) {
              membershipStatus = 'member';
            } else if (pendingRequests.includes(community.id)) {
              membershipStatus = 'pending';
            }
          }

          return {
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            imageUrl: community.imageUrl,
            memberCount,
            recentActivity: {
              postCount,
              commentCount,
              lastActivityAt,
            },
            membershipStatus,
            createdAt: community.createdAt,
            tags: [], // Could be implemented with a tags system
          };
        },
      );

      // Apply sorting
      this.applySorting(searchResults, filters.sortBy, filters.sortOrder);

      // Calculate facets for filtering UI
      const facets = await this.calculateSearchFacets(where);

      // Get total count for pagination
      const total = await this.prisma.community.count({ where });

      return {
        communities: searchResults,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        facets,
      };
    } catch (error) {
      this.logger.error(`Error searching communities:`, error);
      throw error;
    }
  }

  /**
   * Get enhanced community details with comprehensive stats
   */
  async getCommunityDetails(
    communityId: string,
    userId?: string,
  ): Promise<EnhancedCommunityDetails> {
    try {
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
          roomGroups: {
            include: {
              rooms: {
                include: {
                  posts: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          avatarUrl: true,
                        },
                      },
                      _count: {
                        select: {
                          comments: true,
                          hearts: true,
                        },
                      },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                  },
                },
              },
            },
          },
          moderatorCommunities: {
            include: {
              moderator: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
          memberships: userId
            ? {
                where: { userId },
                select: { role: true },
              }
            : false,
        },
      });

      if (!community) {
        throw new NotFoundException(`Community ${communityId} not found`);
      }

      // Calculate time ranges
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all posts from this community's rooms for statistics
      const communityRoomIds = community.roomGroups.flatMap(rg => rg.rooms.map(r => r.id));
      
      // Get detailed statistics
      const [
        totalComments,
        weeklyPosts,
        weeklyComments,
        weeklyMembers,
        activeMembers,
        topContributors,
      ] = await Promise.all([
        this.prisma.comment.count({
          where: {
            post: { roomId: { in: communityRoomIds } },
          },
        }),
        this.prisma.post.count({
          where: {
            roomId: { in: communityRoomIds },
            createdAt: { gte: oneWeekAgo },
          },
        }),
        this.prisma.comment.count({
          where: {
            post: { roomId: { in: communityRoomIds } },
            createdAt: { gte: oneWeekAgo },
          },
        }),
        this.prisma.membership.count({
          where: {
            communityId,
            joinedAt: { gte: oneWeekAgo },
          },
        }),
        this.prisma.membership.count({
          where: {
            communityId,
            user: {
              updatedAt: { gte: oneMonthAgo }, // Use updatedAt as proxy for activity
            },
          },
        }),
        this.getTopContributors(communityId, 5),
      ]);

      // Determine membership status and permissions
      let membershipStatus: 'member' | 'pending' | 'none' = 'none';
      let userPermissions = {
        canPost: false,
        canComment: false,
        canModerate: false,
      };

      if (userId) {
        const membership = community.memberships?.[0];
        if (membership) {
          membershipStatus = 'member';
          userPermissions = {
            canPost: true,
            canComment: true,
            canModerate:
              membership.role === 'moderator' || membership.role === 'admin',
          };
        } else {
          // Join requests removed - users are automatically assigned communities
          // No pending status since users get immediate membership
          membershipStatus = 'none';
        }
      }

      return {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        imageUrl: community.imageUrl,
        createdAt: community.createdAt,
        updatedAt: community.updatedAt,
        memberCount: community._count.memberships,
        stats: {
          totalPosts: community.roomGroups.reduce((total, rg) => 
            total + rg.rooms.reduce((roomTotal, room) => roomTotal + room.posts.length, 0), 0),
          totalComments,
          activeMembers,
          recentActivity: {
            postsThisWeek: weeklyPosts,
            commentsThisWeek: weeklyComments,
            newMembersThisWeek: weeklyMembers,
          },
        },
        recentPosts: community.roomGroups
          .flatMap(rg => rg.rooms.flatMap(room => room.posts))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.user ? {
              id: post.user.id,
              firstName: post.user.firstName,
              lastName: post.user.lastName,
              avatarUrl: post.user.avatarUrl || undefined,
            } : { 
              id: 'unknown', 
              firstName: 'Unknown', 
              lastName: 'User',
              avatarUrl: undefined 
            },
            createdAt: post.createdAt,
            heartCount: post._count.hearts,
            commentCount: post._count.comments,
          })),
        topContributors,
        moderators: community.moderatorCommunities.map((mc) => ({
          id: mc.moderator.user.id,
          firstName: mc.moderator.user.firstName,
          lastName: mc.moderator.user.lastName,
          avatarUrl: mc.moderator.user.avatarUrl || undefined,
          assignedAt: mc.assignedAt,
        })),
        membershipStatus,
        userPermissions,
      };
    } catch (error) {
      this.logger.error(
        `Error getting community details for ${communityId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get trending communities based on growth and activity
   */
  async getTrendingCommunities(
    limit = 10,
    timeframe: 'week' | 'month' = 'week',
  ): Promise<
    (CommunitySearchResult & { trendingData: CommunityTrendingData })[]
  > {
    try {
      const now = new Date();
      const timeframeMs =
        timeframe === 'week'
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
      const startDate = new Date(now.getTime() - timeframeMs);
      const previousStartDate = new Date(startDate.getTime() - timeframeMs);

      const communities = await this.prisma.community.findMany({
        include: {
          _count: {
            select: { memberships: true },
          },
          memberships: {
            where: {
              joinedAt: { gte: startDate },
            },
            select: { joinedAt: true },
          },
          roomGroups: {
            include: {
              rooms: {
                include: {
                  posts: {
                    where: {
                      createdAt: { gte: startDate },
                    },
                    include: {
                      _count: {
                        select: { comments: true, hearts: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Calculate trending data for each community
      const trendingCommunities = await Promise.all(
        communities.map(async (community) => {
          const allPosts = community.roomGroups.flatMap(rg => 
            rg.rooms.flatMap(room => room.posts)
          );
          
          const trendingData = await this.calculateTrendingData(
            { ...community, posts: allPosts },
            startDate,
            previousStartDate,
          );

          return {
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            imageUrl: community.imageUrl,
            memberCount: community._count.memberships,
            recentActivity: {
              postCount: allPosts.length,
              commentCount: allPosts.reduce(
                (sum, post) => sum + post._count.comments,
                0,
              ),
              lastActivityAt:
                allPosts.length > 0
                  ? allPosts.reduce(
                      (latest, post) =>
                        post.createdAt > latest ? post.createdAt : latest,
                      allPosts[0].createdAt,
                    )
                  : null,
            },
            membershipStatus: 'none' as const,
            createdAt: community.createdAt,
            trendingData,
          };
        }),
      );

      // Sort by trending score (combination of growth rate and activity)
      trendingCommunities.sort((a, b) => {
        const scoreA =
          a.trendingData.growthRate * 0.4 +
          a.trendingData.activityScore * 0.4 +
          a.trendingData.engagementRate * 0.2;
        const scoreB =
          b.trendingData.growthRate * 0.4 +
          b.trendingData.activityScore * 0.4 +
          b.trendingData.engagementRate * 0.2;
        return scoreB - scoreA;
      });

      return trendingCommunities.slice(0, limit);
    } catch (error) {
      this.logger.error(`Error getting trending communities:`, error);
      throw error;
    }
  }

  /**
   * Get similar communities based on user activity and preferences
   */
  async getSimilarCommunities(
    communityId: string,
    context: CommunityRecommendationContext,
  ): Promise<CommunitySearchResult[]> {
    try {
      const { userId, excludeJoined = true, maxResults = 5 } = context;

      // Get the reference community
      const refCommunity = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          memberships: {
            include: {
              user: {
                include: {
                  memberships: {
                    include: { community: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!refCommunity) {
        throw new NotFoundException(`Community ${communityId} not found`);
      }

      // Find communities that other members of this community have joined
      const memberCommunities = new Map<string, number>();

      refCommunity.memberships.forEach((membership) => {
        if (membership.user) {
          membership.user.memberships.forEach((userMembership) => {
            if (userMembership.communityId !== communityId) {
              const count =
                memberCommunities.get(userMembership.communityId) || 0;
              memberCommunities.set(userMembership.communityId, count + 1);
            }
          });
        }
      });

      // Sort by overlap count and get top communities
      const sortedCommunities = Array.from(memberCommunities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxResults * 2); // Get more to filter out joined ones

      // Get community details
      const communityIds = sortedCommunities.map(([id]) => id);
      const communities = await this.prisma.community.findMany({
        where: { id: { in: communityIds } },
        include: {
          _count: { select: { memberships: true } },
          roomGroups: {
            include: {
              rooms: {
                include: {
                  _count: { select: { posts: true } }
                }
              }
            }
          }
        },
      });

      // Get user's joined communities if excluding them
      let userCommunityIds: string[] = [];
      if (excludeJoined && userId) {
        const userMemberships = await this.prisma.membership.findMany({
          where: { userId },
          select: { communityId: true },
        });
        userCommunityIds = userMemberships.map((m) => m.communityId);
      }

      // Filter and format results
      const similarCommunities = communities
        .filter((community) => !userCommunityIds.includes(community.id))
        .map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          imageUrl: community.imageUrl,
          memberCount: community._count.memberships,
          recentActivity: {
            postCount: community.roomGroups.reduce((total, rg) => 
              total + rg.rooms.reduce((roomTotal, room) => roomTotal + room._count.posts, 0), 0),
            commentCount: 0, // Could be calculated if needed
            lastActivityAt: null,
          },
          membershipStatus: 'none' as const,
          createdAt: community.createdAt,
        }))
        .slice(0, maxResults);

      return similarCommunities;
    } catch (error) {
      this.logger.error(
        `Error getting similar communities for ${communityId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private applySorting(
    communities: CommunitySearchResult[],
    sortBy: string = 'relevance',
    sortOrder: string = 'desc',
  ): void {
    const ascending = sortOrder === 'asc';

    switch (sortBy) {
      case 'members':
        communities.sort((a, b) =>
          ascending
            ? a.memberCount - b.memberCount
            : b.memberCount - a.memberCount,
        );
        break;

      case 'activity':
        communities.sort((a, b) => {
          const activityA =
            a.recentActivity.postCount + a.recentActivity.commentCount;
          const activityB =
            b.recentActivity.postCount + b.recentActivity.commentCount;
          return ascending ? activityA - activityB : activityB - activityA;
        });
        break;

      case 'newest':
        communities.sort((a, b) =>
          ascending
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;

      case 'alphabetical':
        communities.sort((a, b) =>
          ascending
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        );
        break;

      default: // relevance
        // Default sorting by member count for now
        communities.sort((a, b) => b.memberCount - a.memberCount);
        break;
    }
  }

  private async calculateSearchFacets(where: any): Promise<{
    memberRanges: { range: string; count: number }[];
    commonTags: { tag: string; count: number }[];
  }> {
    try {
      // Calculate member range distribution
      const memberRanges = [
        { range: '1-10', min: 1, max: 10 },
        { range: '11-50', min: 11, max: 50 },
        { range: '51-100', min: 51, max: 100 },
        { range: '101-500', min: 101, max: 500 },
        { range: '500+', min: 501, max: 999999 },
      ];

      const memberRangeCounts = await Promise.all(
        memberRanges.map(async (range) => {
          const count = await this.prisma.community.count({
            where: {
              ...where,
              memberships: {
                _count: {
                  gte: range.min,
                  ...(range.max < 999999 ? { lte: range.max } : {}),
                },
              },
            },
          });
          return { range: range.range, count };
        }),
      );

      return {
        memberRanges: memberRangeCounts,
        commonTags: [], // Could be implemented with a tag system
      };
    } catch (error) {
      this.logger.error('Error calculating search facets:', error);
      return {
        memberRanges: [],
        commonTags: [],
      };
    }
  }

  private async calculateTrendingData(
    community: any,
    startDate: Date,
    previousStartDate: Date,
  ): Promise<CommunityTrendingData> {
    try {
      // Calculate growth rate
      const currentMembers = community.memberships.length;
      const previousMembers = await this.prisma.membership.count({
        where: {
          communityId: community.id,
          joinedAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      });

      const growthRate =
        previousMembers > 0
          ? ((currentMembers - previousMembers) / previousMembers) * 100
          : currentMembers > 0
            ? 100
            : 0;

      // Calculate activity score
      const totalInteractions = community.posts.reduce(
        (sum: number, post: any) =>
          sum + post._count.comments + post._count.hearts,
        0,
      );
      const activityScore = Math.min(
        (totalInteractions / Math.max(community._count.memberships, 1)) * 10,
        100,
      );

      // Calculate engagement rate
      const totalPosts = community.posts.length;
      const totalComments = community.posts.reduce(
        (sum: number, post: any) => sum + post._count.comments,
        0,
      );
      const engagementRate =
        totalPosts > 0 ? (totalComments / totalPosts) * 10 : 0;

      // Calculate retention rate (simplified)
      const retentionRate = Math.min(
        (currentMembers / Math.max(community._count.memberships, 1)) * 100,
        100,
      );

      return {
        growthRate: Math.max(0, growthRate),
        activityScore: Math.max(0, activityScore),
        engagementRate: Math.max(0, engagementRate),
        retentionRate: Math.max(0, retentionRate),
      };
    } catch (error) {
      this.logger.error('Error calculating trending data:', error);
      return {
        growthRate: 0,
        activityScore: 0,
        engagementRate: 0,
        retentionRate: 0,
      };
    }
  }

  private async getTopContributors(
    communityId: string,
    limit: number,
  ): Promise<
    {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      contributionScore: number;
      postCount: number;
      commentCount: number;
    }[]
  > {
    try {
      // Get room IDs for this community
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          roomGroups: {
            include: {
              rooms: { select: { id: true } }
            }
          }
        }
      });
      
      if (!community) return [];
      
      const roomIds = community.roomGroups.flatMap(rg => rg.rooms.map(r => r.id));
      
      // Get users with their contribution counts
      const contributors = await this.prisma.user.findMany({
        where: {
          memberships: {
            some: { communityId },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          _count: {
            select: {
              posts: {
                where: { roomId: { in: roomIds } },
              },
              comments: {
                where: {
                  post: { roomId: { in: roomIds } },
                },
              },
            },
          },
        },
        take: limit * 2, // Get more to calculate scores
      });

      // Calculate contribution scores and sort
      const scoredContributors = contributors
        .map((contributor) => {
          const postCount = contributor._count.posts;
          const commentCount = contributor._count.comments;
          const contributionScore = postCount * 3 + commentCount * 1; // Posts worth more than comments

          return {
            id: contributor.id,
            firstName: contributor.firstName,
            lastName: contributor.lastName,
            avatarUrl: contributor.avatarUrl || undefined,
            contributionScore,
            postCount: Number(postCount),
            commentCount: Number(commentCount),
          };
        })
        .filter((contributor) => contributor.contributionScore > 0)
        .sort((a, b) => b.contributionScore - a.contributionScore)
        .slice(0, limit);

      return scoredContributors;
    } catch (error) {
      this.logger.error(
        `Error getting top contributors for community ${communityId}:`,
        error,
      );
      return [];
    }
  }
}
