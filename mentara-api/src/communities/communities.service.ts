import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoomGroup, Room } from '@prisma/client';
import type {
  CommunityCreateInputDto,
  CommunityUpdateInputDto,
  CommunityResponse,
  CommunityStatsResponse,
} from './types';

// Extended response interfaces for complex operations
export interface CommunityWithMembersResponse extends CommunityResponse {
  members: any[];
}

export interface CommunityWithRoomGroupsResponse extends CommunityResponse {
  roomGroups: Array<{
    id: string;
    name: string;
    order: number;
    communityId: string;
    rooms: Array<{
      id: string;
      name: string;
      order: number;
      postingRole: string;
      roomGroupId: string;
    }>;
  }>;
}

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithStructure(): Promise<CommunityWithRoomGroupsResponse[]> {
    return await this.prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        roomGroups: {
          include: {
            rooms: true,
          },
        },
      },
    });
  }

  async findOneWithStructure(
    id: string,
  ): Promise<CommunityWithRoomGroupsResponse | null> {
    return await this.prisma.community.findUniqueOrThrow({
      where: { id },
      include: {
        roomGroups: {
          include: {
            rooms: true,
          },
        },
      },
    });
  }

  async createRoomGroup(
    communityId: string,
    name: string,
    order: number,
  ): Promise<RoomGroup> {
    try {
      return await this.prisma.roomGroup.create({
        data: {
          name,
          order,
          community: {
            connect: {
              id: communityId,
            },
          },
        },
      });
    } catch (error) {
      throw new ConflictException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async createRoom(
    roomGroupId: string,
    name: string,
    order: number,
  ): Promise<Room> {
    return await this.prisma.room.create({
      data: {
        name,
        order,
        roomGroupId,
      },
    });
  }

  async findRoomsByGroup(roomGroupId: string): Promise<Room[]> {
    return await this.prisma.room.findMany({
      where: { roomGroupId },
      orderBy: { order: 'asc' },
    });
  }

  async findAll(): Promise<CommunityResponse[]> {
    const communities = await this.prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return communities.map((community) => community);
  }

  async findOne(id: string): Promise<CommunityResponse | null> {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });
    if (!community) return null;
    return community;
  }

  async findBySlug(slug: string): Promise<CommunityResponse | null> {
    const community = await this.prisma.community.findUnique({
      where: { slug },
    });
    if (!community) return null;
    return community;
  }

  async createCommunity(
    data: CommunityCreateInputDto,
  ): Promise<CommunityResponse> {
    const community = await this.prisma.community.create({
      data: {
        name: data.name,
        slug:
          (data as any).slug ||
          data.name?.toLowerCase().replace(/\s+/g, '-') ||
          'untitled',
        description: data.description,
        imageUrl: (data as any).imageUrl || null,
      },
    });
    return community;
  }

  async update(
    id: string,
    data: CommunityUpdateInputDto,
  ): Promise<CommunityResponse> {
    const community = await this.prisma.community.update({
      where: { id },
      data: {
        name: data.name,
        slug:
          (data as any).slug ||
          data.name?.toLowerCase().replace(/\s+/g, '-') ||
          'untitled',
        description: data.description,
        imageUrl: (data as any).imageUrl || null,
      },
    });
    return community;
  }

  async remove(id: string): Promise<CommunityResponse> {
    const community = await this.prisma.community.delete({
      where: { id },
    });
    return community;
  }

  async findByUserId(userId: string): Promise<CommunityResponse[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        community: true,
      },
    });
    return memberships.map((membership) => membership.community);
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    role: string = 'MEMBER',
  ): Promise<void> {
    const existingMembership = await this.prisma.membership.findFirst({
      where: {
        communityId,
        userId,
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this community');
    }

    await this.prisma.membership.create({
      data: {
        userId,
        communityId,
      },
    });
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    const membership = await this.prisma.membership.findFirstOrThrow({
      where: {
        communityId,
        userId,
      },
    });
    await this.prisma.membership.delete({
      where: { id: membership.id },
    });
  }

  async getMembers(
    communityId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<CommunityWithMembersResponse> {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: {
        memberships: {
          skip: offset,
          take: limit,
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
          orderBy: { joinedAt: 'desc' },
        },
      },
    });
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return {
      ...community,
      members: community.memberships
        .filter(
          (membership) =>
            membership.userId !== null && membership.user !== null,
        )
        .map((membership) => ({
          ...membership,
          userId: membership.userId!,
          user: membership.user!,
        })),
    };
  }

  async getStats(): Promise<CommunityStatsResponse> {
    const [totalMembers, totalPosts, activeCommunities] = await Promise.all([
      this.prisma.membership.count(),
      this.prisma.post.count(),
      this.prisma.community.count(),
    ]);

    return {
      totalMembers,
      totalPosts,
      activeCommunities,
      illnessCommunities: [],
    };
  }

  // New methods for community posts and content management

  async getMyMemberships(userId: string) {
    return await this.prisma.membership.findMany({
      where: { userId },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async getPostsByRoom(roomId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { roomId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          hearts: {
            select: {
              id: true,
              userId: true,
              postId: true,
            },
          },
          _count: {
            select: {
              hearts: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { roomId } }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  async createPost(
    title: string, 
    content: string, 
    roomId: string, 
    userId: string,
    attachmentUrls: string[] = [],
    attachmentNames: string[] = [],
    attachmentSizes: number[] = [],
  ) {
    // First verify the room exists and user has access
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id: roomId },
      include: {
        roomGroup: {
          include: {
            community: {
              include: {
                memberships: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    // Check if user is a member of the community
    if (room.roomGroup.community.memberships.length === 0) {
      throw new ConflictException('User is not a member of this community');
    }

    // Check posting permissions based on room posting role
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });

    const canPost = this.checkPostingPermission(room.postingRole, user.role);
    if (!canPost) {
      throw new ConflictException('User does not have permission to post in this room');
    }

    return await this.prisma.post.create({
      data: {
        title,
        content,
        roomId,
        userId,
        attachmentUrls,
        attachmentNames,
        attachmentSizes,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        hearts: {
          select: {
            id: true,
            userId: true,
            postId: true,
          },
        },
        _count: {
          select: {
            hearts: true,
            comments: true,
          },
        },
      },
    });
  }

  private checkPostingPermission(roomPostingRole: string, userRole: string): boolean {
    const roleHierarchy = {
      'client': 0,
      'therapist': 1,
      'moderator': 2,
      'admin': 3,
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;

    switch (roomPostingRole) {
      case 'member':
        return userRoleLevel >= 0;
      case 'therapist':
        return userRoleLevel >= 1;
      case 'moderator':
        return userRoleLevel >= 2;
      case 'admin':
        return userRoleLevel >= 3;
      default:
        return userRoleLevel >= 0;
    }
  }

  async heartPost(postId: string, userId: string) {
    // Check if heart already exists
    const existingHeart = await this.prisma.postHeart.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingHeart) {
      throw new ConflictException('Post already hearted by this user');
    }

    return await this.prisma.postHeart.create({
      data: {
        postId,
        userId,
      },
    });
  }

  async unheartPost(postId: string, userId: string) {
    const heart = await this.prisma.postHeart.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!heart) {
      throw new NotFoundException('Heart not found');
    }

    return await this.prisma.postHeart.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async getJoinedCommunities(userId: string): Promise<CommunityWithRoomGroupsResponse[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        community: {
          include: {
            roomGroups: {
              include: {
                rooms: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map(membership => membership.community);
  }

  async getRecommendedCommunities(userId: string): Promise<CommunityWithRoomGroupsResponse[]> {
    // Get user's current communities to exclude
    const userCommunityIds = await this.prisma.membership.findMany({
      where: { userId },
      select: { communityId: true },
    });
    const excludeIds = userCommunityIds.map(m => m.communityId);

    // Get user's preassessment data if available
    const user = await this.prisma.client.findUnique({
      where: { userId },
      include: {
        preAssessment: {
          select: {
            severityLevels: true,
            aiEstimate: true,
            scores: true,
          },
        },
      },
    });

    // If user has processed preassessment data, use it for personalized recommendations
    if (user?.preAssessment?.severityLevels) {
      try {
        const severityLevels = user.preAssessment.severityLevels as Record<string, string>;
        
        // Map severity levels to community slugs for targeted recommendations
        const recommendedSlugs = this.mapSeverityLevelsToCommunities(severityLevels);
        
        if (recommendedSlugs.length > 0) {
          // Get personalized community recommendations based on assessment
          const personalizedCommunities = await this.prisma.community.findMany({
            where: {
              slug: { in: recommendedSlugs },
              id: { notIn: excludeIds },
            },
            include: {
              roomGroups: {
                include: {
                  rooms: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            take: 5,
          });

          if (personalizedCommunities.length > 0) {
            return personalizedCommunities;
          }
        }
      } catch (error) {
        console.warn(`Failed to process preassessment data for user ${userId}:`, error);
        // Fall through to basic recommendations
      }
    }

    // Fallback to recent communities for users without preassessment or when processing fails
    return await this.prisma.community.findMany({
      where: {
        id: { notIn: excludeIds },
      },
      include: {
        roomGroups: {
          include: {
            rooms: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Map severity levels from stored preassessment to community slugs
   */
  private mapSeverityLevelsToCommunities(severityLevels: Record<string, string>): string[] {
    const communityMap: Record<string, string> = {
      'PHQ-9': 'depression-support',
      'GAD-7': 'anxiety-warriors', 
      'ASRS': 'adhd-support',
      'AUDIT': 'alcohol-recovery-support',
      'BES': 'eating-disorder-recovery',
      'DAST-10': 'substance-recovery-support',
      'ISI': 'insomnia-support',
      'MBI': 'burnout-recovery',
      'MDQ': 'bipolar-support',
      'OCI-R': 'ocd-support',
      'PCL-5': 'ptsd-support',
      'PDSS': 'panic-disorder-support',
      'PSS': 'stress-support',
      'SPIN': 'social-anxiety-support',
      'Phobia': 'phobia-support'
    };

    const recommendedSlugs: string[] = [];

    // Recommend communities for conditions that are mild or above
    Object.entries(severityLevels).forEach(([questionnaire, severity]) => {
      if (severity && severity !== 'subclinical' && severity !== 'minimal') {
        const communitySlug = communityMap[questionnaire];
        if (communitySlug) {
          recommendedSlugs.push(communitySlug);
        }
      }
    });

    return recommendedSlugs;
  }

  async getRecentActivity(userId: string) {
    // Get recent posts from communities the user is a member of
    const userCommunityIds = await this.prisma.membership.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const communityIds = userCommunityIds.map(m => m.communityId);

    const recentPosts = await this.prisma.post.findMany({
      where: {
        room: {
          roomGroup: {
            communityId: {
              in: communityIds,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          include: {
            roomGroup: {
              include: {
                community: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            hearts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return recentPosts
      .filter(post => post.room) // Filter out posts without rooms
      .map(post => ({
        type: 'post',
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        user: post.user,
        community: post.room!.roomGroup.community,
        _count: post._count,
      }));
  }
}
