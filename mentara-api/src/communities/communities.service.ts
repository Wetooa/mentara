import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Community } from '@prisma/client';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityResponse,
  CommunityWithMembers,
  CommunityStats,
} from 'src/types';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CommunityResponse[]> {
    try {
      const communities = await this.prisma.community.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return communities.map((community) =>
        this.mapToCommunityResponse(community),
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findOne(
    id: string,
    userId?: string,
  ): Promise<CommunityResponse | null> {
    try {
      const community = await this.prisma.community.findUnique({
        where: { id },
      });
      if (!community) return null;
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findBySlug(
    slug: string,
    userId?: string,
  ): Promise<CommunityResponse | null> {
    try {
      const community = await this.prisma.community.findUnique({
        where: { name: slug },
      });
      if (!community) return null;
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByIllness(
    illness: string,
    userId?: string,
  ): Promise<CommunityResponse[]> {
    try {
      const communities = await this.prisma.community.findMany({
        where: {
          illness,
          isActive: true,
        },
      });
      return communities.map((community) =>
        this.mapToCommunityResponse(community),
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async create(
    data: CreateCommunityDto,
    createdByUserId: string,
  ): Promise<CommunityResponse> {
    try {
      const community = await this.prisma.community.create({
        data: {
          name: data.name,
          description: data.description,
          slug: data.slug || this.generateSlug(data.name),
          illness: data.illness,
          isPrivate: data.isPrivate || false,
        },
      });
      await this.updateMemberCount(community.id);
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async update(
    id: string,
    data: UpdateCommunityDto,
  ): Promise<CommunityResponse> {
    try {
      const community = await this.prisma.community.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          slug: data.slug || this.generateSlug(data.name),
        },
      });
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async remove(id: string): Promise<CommunityResponse> {
    try {
      const community = await this.prisma.community.delete({
        where: { id },
      });
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByUserId(userId: string): Promise<CommunityResponse[]> {
    try {
      const memberships = await this.prisma.membership.findMany({
        where: { userId },
        include: {
          community: true,
        },
      });
      return memberships.map((membership) =>
        this.mapToCommunityResponse(membership.community),
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async joinCommunity(
    communityId: string,
    userId: string,
    role: string = 'member',
  ): Promise<void> {
    try {
      const existingMembership = await this.prisma.membership.findFirst({
        where: {
          communityId,
          userId,
        },
      });
      if (existingMembership) {
        throw new Error('User is already a member of this community');
      }
      await this.prisma.membership.create({
        data: {
          userId,
          communityId,
          role,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const membership = await this.prisma.membership.findFirst({
        where: {
          communityId,
          userId,
        },
      });
      if (!membership) {
        throw new Error('User is not a member of this community');
      }
      await this.prisma.membership.delete({
        where: { id: membership.id },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async getMembers(
    communityId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<CommunityWithMembers> {
    try {
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
        throw new Error('Community not found');
      }
      const response = this.mapToCommunityResponse(
        community,
      ) as CommunityWithMembers;
      response.members = community.memberships.map((membership) => ({
        id: membership.id,
        userId: membership.userId,
        role: membership.role,
        joinedAt: membership.joinedAt,
        user: membership.user,
      }));
      return response;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async getStats(): Promise<CommunityStats> {
    try {
      const [totalCommunities, totalMembers, totalPosts, activeCommunities] =
        await Promise.all([
          this.prisma.community.count(),
          this.prisma.membership.count(),
          this.prisma.post.count(),
          this.prisma.community.count({ where: { isActive: true } }),
        ]);

      return {
        totalCommunities,
        totalMembers,
        totalPosts,
        activeCommunities,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  private mapToCommunityResponse(community: Community): CommunityResponse {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      imageUrl: community.imageUrl,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
