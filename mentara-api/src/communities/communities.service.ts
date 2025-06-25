import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Community } from '@prisma/client';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  CommunityResponse,
} from './dto/community.dto';
import { CommunityWithMembers, CommunityStats } from 'src/types';

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: string): Promise<CommunityResponse | null> {
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

  async findBySlug(slug: string): Promise<CommunityResponse | null> {
    try {
      const community = await this.prisma.community.findUnique({
        where: { slug },
      });
      if (!community) return null;
      return this.mapToCommunityResponse(community);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByIllness(): Promise<CommunityResponse[]> {
    // This method is now a stub, as illness is not a field. Return all communities for now.
    return this.findAll();
  }

  async create(data: CreateCommunityDto): Promise<CommunityResponse> {
    try {
      const community = await this.prisma.community.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
        },
      });
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
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
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
      // You may want to map memberships to a DTO if needed
      return community as unknown as CommunityWithMembers;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async getStats(): Promise<CommunityStats> {
    try {
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
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  private mapToCommunityResponse(community: Community): CommunityResponse {
    return {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description ?? undefined,
      imageUrl: community.imageUrl ?? undefined,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    };
  }
}
