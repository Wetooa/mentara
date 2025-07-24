import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';

export interface PublicProfileResponse {
  user: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    role: string;
    createdAt: string;
  };
  therapist?: {
    specializations?: string[];
    yearsOfExperience?: number;
    sessionLength?: string;
    hourlyRate?: number;
    areasOfExpertise?: string[];
    languages?: string[];
  };
  connectionStatus?: 'connected' | 'pending' | null; // Connection status to this user/therapist
  mutualCommunities: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'post' | 'comment';
    title?: string; // for posts
    content: string;
    createdAt: string;
    community: {
      name: string;
      slug: string;
    };
    isFromSharedCommunity: boolean;
  }>;
  stats: {
    postsCount: number;
    commentsCount: number;
    communitiesCount: number;
    sharedCommunitiesCount: number;
  };
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfile(
    profileUserId: string,
    currentUserId: string,
  ): Promise<PublicProfileResponse> {
    // Get the target user with their relationships
    const user = await this.prisma.user.findUnique({
      where: {
        id: profileUserId,
        isActive: true, // Only show active users
      },
      include: {
        therapist: true,
        memberships: {
          include: {
            community: true,
          },
        },
        posts: {
          include: {
            room: {
              include: {
                roomGroup: {
                  include: {
                    community: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Recent posts only
        },
        comments: {
          include: {
            post: {
              include: {
                room: {
                  include: {
                    roomGroup: {
                      include: {
                        community: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Recent comments only
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // Get current user's communities for filtering
    const currentUserCommunities = await this.prisma.membership.findMany({
      where: { userId: currentUserId },
      select: { communityId: true },
    });

    const currentUserCommunityIds = new Set(
      currentUserCommunities.map((m) => m.communityId),
    );

    // Get mutual communities
    const mutualCommunities = user.memberships
      .filter((membership) =>
        currentUserCommunityIds.has(membership.communityId),
      )
      .map((membership) => ({
        id: membership.community.id,
        name: membership.community.name,
        slug: membership.community.slug,
        imageUrl: membership.community.imageUrl,
      }));

    // Filter and transform posts and comments
    const recentActivity: PublicProfileResponse['recentActivity'] = [];

    // Add posts to activity
    user.posts.forEach((post) => {
      if (post.room?.roomGroup?.community) {
        const isFromSharedCommunity = currentUserCommunityIds.has(
          post.room.roomGroup.community.id,
        );

        recentActivity.push({
          id: post.id,
          type: 'post',
          title: post.title,
          content: isFromSharedCommunity
            ? post.content
            : 'Content from different community',
          createdAt: post.createdAt.toISOString(),
          community: {
            name: post.room.roomGroup.community.name,
            slug: post.room.roomGroup.community.slug,
          },
          isFromSharedCommunity,
        });
      }
    });

    // Add comments to activity
    user.comments.forEach((comment) => {
      if (comment.post.room?.roomGroup?.community) {
        const isFromSharedCommunity = currentUserCommunityIds.has(
          comment.post.room.roomGroup.community.id,
        );

        recentActivity.push({
          id: comment.id,
          type: 'comment',
          content: isFromSharedCommunity
            ? comment.content
            : 'Comment from different community',
          createdAt: comment.createdAt.toISOString(),
          community: {
            name: comment.post.room.roomGroup.community.name,
            slug: comment.post.room.roomGroup.community.slug,
          },
          isFromSharedCommunity,
        });
      }
    });

    // Sort activity by date and limit to 20 items
    recentActivity.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const limitedActivity = recentActivity.slice(0, 20);

    // Check connection status if current user is a client and profile user is a therapist
    let connectionStatus: 'connected' | 'pending' | null = null;
    if (user.role === 'therapist' && currentUserId !== profileUserId) {
      // Check if there's a ClientTherapist relationship
      const clientTherapistConnection = await this.prisma.clientTherapist.findUnique({
        where: {
          clientId_therapistId: {
            clientId: currentUserId,
            therapistId: profileUserId,
          },
        },
      });

      if (clientTherapistConnection) {
        connectionStatus = clientTherapistConnection.status === 'active' ? 'connected' : 'pending';
      }
    }

    // Calculate stats
    const stats = {
      postsCount: user.posts.length,
      commentsCount: user.comments.length,
      communitiesCount: user.memberships.length,
      sharedCommunitiesCount: mutualCommunities.length,
    };

    // Build response
    const response: PublicProfileResponse = {
      user: {
        id: user.id,
        firstName: user.firstName,
        middleName: user.middleName ?? undefined,
        lastName: user.lastName,
        bio: user.bio ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        coverImageUrl: user.coverImageUrl ?? undefined,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      connectionStatus,
      mutualCommunities,
      recentActivity: limitedActivity,
      stats,
    };

    // Add therapist info if applicable
    if (user.role === 'therapist' && user.therapist) {
      response.therapist = {
        specializations: user.therapist.areasOfExpertise,
        yearsOfExperience: user.therapist.yearsOfExperience ?? undefined,
        sessionLength: user.therapist.sessionLength,
        hourlyRate: user.therapist.hourlyRate
          ? Number(user.therapist.hourlyRate)
          : undefined,
        areasOfExpertise: user.therapist.areasOfExpertise,
        languages: user.therapist.languagesOffered,
      };
    }

    return response;
  }

  async updateProfile(userId: string, profileData: any) {
    // Only allow updating certain fields for security
    const allowedFields = {
      firstName: profileData.firstName,
      middleName: profileData.middleName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      avatarUrl: profileData.avatarUrl,
      coverImageUrl: profileData.coverImageUrl,
    };

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined),
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        therapist: true,
        memberships: {
          include: {
            community: true,
          },
        },
      },
    });

    return {
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        middleName: updatedUser.middleName ?? undefined,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio ?? undefined,
        avatarUrl: updatedUser.avatarUrl ?? undefined,
        coverImageUrl: updatedUser.coverImageUrl ?? undefined,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    };
  }
}
