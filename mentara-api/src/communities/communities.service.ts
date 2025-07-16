import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { RoomGroup, Room } from '@prisma/client';
import {
  CommunityCreateInputDto,
  CommunityUpdateInputDto,
} from 'mentara-commons';

// Local response interfaces
interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  isPrivate?: boolean;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityStatsResponse {
  memberCount?: number;
  postCount?: number;
  activeMembers?: number;
  totalMembers?: number;
  totalPosts?: number;
  activeCommunities?: number;
  illnessCommunities?: any[];
}

interface CommunityWithMembersResponse extends CommunityResponse {
  members: any[];
}

interface CommunityWithRoomGroupsResponse extends CommunityResponse {
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
        slug: (data as any).slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
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
        slug: (data as any).slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
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
    role: string = 'member',
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
        role,
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
}
