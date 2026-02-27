import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

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
    availability?: Array<{
      id: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      timezone: string;
      isAvailable: boolean;
      notes?: string;
      bookedSlots?: Array<{
        id: string;
        startTime: string;
        endTime: string;
        status: string;
      }>;
    }>;
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
    // Flatten the query: Get user first with minimal includes
    const [user, currentUserCommunities] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: profileUserId,
          isActive: true, // Only show active users
        },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          coverImageUrl: true,
          bio: true,
          role: true,
          createdAt: true,
          therapist: {
            select: {
              userId: true,
              areasOfExpertise: true,
              hourlyRate: true,
              status: true,
              yearsOfExperience: true,
              sessionLength: true,
              languagesOffered: true,
            },
          },
        },
      }),
      this.prisma.membership.findMany({
        where: { userId: currentUserId },
        select: { communityId: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // Get memberships separately
    const memberships = await this.prisma.membership.findMany({
      where: { userId: profileUserId },
      select: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
    });

    // Get recent posts separately with minimal includes
    const recentPosts = await this.prisma.post.findMany({
      where: { userId: profileUserId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            roomGroup: {
              select: {
                community: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get recent comments separately
    const recentComments = await this.prisma.comment.findMany({
      where: { userId: profileUserId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            room: {
              select: {
                id: true,
                name: true,
                roomGroup: {
                  select: {
                    community: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const currentUserCommunityIds = new Set(
      currentUserCommunities.map((m) => m.communityId),
    );

    // Get mutual communities
    const mutualCommunities = memberships
      .filter((membership) =>
        currentUserCommunityIds.has(membership.community.id),
      )
      .map((membership) => ({
        id: membership.community.id,
        name: membership.community.name,
        slug: membership.community.slug,
        imageUrl: membership.community.imageUrl || undefined,
      }));

    // Filter and transform posts and comments
    const recentActivity: PublicProfileResponse['recentActivity'] = [];

    // Add posts to activity
    recentPosts.forEach((post) => {
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
    recentComments.forEach((comment) => {
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
      // Get current user to check their role
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { role: true },
      });

      if (currentUser?.role === 'client') {
        // Get the therapist record to find the therapistId
        const therapist = await this.prisma.therapist.findUnique({
          where: { userId: profileUserId },
          select: { userId: true },
        });

        if (therapist) {
          // Check if there's a ClientTherapist relationship
          const client = await this.prisma.client.findUnique({
            where: { userId: currentUserId },
            select: { userId: true },
          });

          if (client) {
            const clientTherapistConnection = await this.prisma.clientTherapist.findUnique({
              where: {
                clientId_therapistId: {
                  clientId: client.userId,
                  therapistId: therapist.userId,
                },
              },
            });

            if (clientTherapistConnection) {
              connectionStatus = clientTherapistConnection.status === 'active' ? 'connected' : 'pending';
            }
          }
        }
      }
    }

    // Get accurate counts
    const [postsCount, commentsCount] = await Promise.all([
      this.prisma.post.count({ where: { userId: profileUserId } }),
      this.prisma.comment.count({ where: { userId: profileUserId } }),
    ]);

    // Calculate stats
    const stats = {
      postsCount,
      commentsCount,
      communitiesCount: memberships.length,
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
      // Fetch therapist availability
      const availability = await this.prisma.therapistAvailability.findMany({
        where: { therapistId: user.id },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });

      // For each availability slot, get booked meetings
      const availabilityWithBookings = await Promise.all(
        availability.map(async (slot) => {
          // Get meetings that overlap with this availability slot
          const bookedSlots = await this.prisma.meeting.findMany({
            where: {
              therapistId: user.id,
              status: {
                in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
              },
              startTime: {
                gte: new Date(),
              },
            },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: true,
            },
            orderBy: {
              startTime: 'asc',
            },
          });

          return {
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone,
            isAvailable: slot.isAvailable,
            notes: slot.notes ?? undefined,
            bookedSlots: bookedSlots.map((meeting) => ({
              id: meeting.id,
              startTime: meeting.startTime.toISOString(),
              endTime: meeting.endTime ? meeting.endTime.toISOString() : meeting.startTime.toISOString(),
              status: meeting.status,
            })),
          };
        })
      );

      response.therapist = {
        specializations: user.therapist.areasOfExpertise,
        yearsOfExperience: user.therapist.yearsOfExperience ?? undefined,
        sessionLength: user.therapist.sessionLength,
        hourlyRate: user.therapist.hourlyRate
          ? Number(user.therapist.hourlyRate)
          : undefined,
        areasOfExpertise: user.therapist.areasOfExpertise,
        languages: user.therapist.languagesOffered,
        availability: availabilityWithBookings,
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

  async reportUser(
    reportedUserId: string,
    reporterId: string,
    reason: string,
    content?: string,
  ): Promise<string> {
    try {
      // Verify the reported user exists
      const reportedUser = await this.prisma.user.findUnique({
        where: { id: reportedUserId },
      });

      if (!reportedUser) {
        throw new NotFoundException('User not found');
      }

      // Check if user already reported this user
      const existingReport = await this.prisma.report.findFirst({
        where: {
          reportedUserId,
          reporterId,
        },
      });

      if (existingReport) {
        throw new ForbiddenException('You have already reported this user');
      }

      // Create the report
      const report = await this.prisma.report.create({
        data: {
          reportedUserId,
          reporterId,
          reason,
          content,
          status: 'PENDING',
        },
      });

      return report.id;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
