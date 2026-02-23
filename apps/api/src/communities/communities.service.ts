import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Community, Prisma, Membership } from '@prisma/client';
import { CreateCommunityDto, UpdateCommunityDto, CommunityDto } from './types';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 10, offset = 0, category?: string): Promise<Community[]> {
    try {
      const where: Prisma.CommunityWhereInput = {};
      if (category) {
        where.category = category;
      }

      return await this.prisma.community.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch communities: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findOne(idOrSlug: string): Promise<Community> {
    try {
      const community = await this.prisma.community.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          roomGroups: {
            include: {
              rooms: true,
            },
          },
          _count: {
            select: {
              memberships: true,
            },
          },
        },
      });

      if (!community) {
        throw new NotFoundException(`Community with ID or slug ${idOrSlug} not found`);
      }

      return community;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async create(data: CreateCommunityDto): Promise<Community> {
    try {
      const { tags, ...rest } = data;

      // Check for slug/name uniqueness
      const existing = await this.prisma.community.findFirst({
        where: {
          OR: [{ name: rest.name }, { slug: rest.slug }],
        },
      });

      if (existing) {
        throw new ConflictException('Community with this name or slug already exists');
      }

      return await this.prisma.community.create({
        data: {
          ...rest,
          tags: tags ? {
            create: tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                  create: {
                    name: tagName,
                    slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  },
                },
              },
            })),
          } : undefined,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(
        `Failed to create community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async update(id: string, data: UpdateCommunityDto): Promise<Community> {
    try {
      const { tags, ...rest } = data;

      // Check existence
      await this.findOne(id);

      return await this.prisma.community.update({
        where: { id },
        data: {
          ...rest,
          tags: tags ? {
            deleteMany: {},
            create: tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                  create: {
                    name: tagName,
                    slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  },
                },
              },
            })),
          } : undefined,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to update community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.community.delete({
        where: { id },
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Community with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to delete community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async join(communityId: string, userId: string): Promise<Membership> {
    try {
      // Check if community exists
      await this.findOne(communityId);

      // Check if already a member
      const existingMembership = await this.prisma.membership.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (existingMembership) {
        return existingMembership;
      }

      return await this.prisma.membership.create({
        data: {
          communityId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to join community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async leave(communityId: string, userId: string): Promise<{ success: boolean }> {
    try {
      const membership = await this.prisma.membership.findFirst({
        where: {
          communityId,
          userId,
        },
      });

      if (!membership) {
        throw new NotFoundException('Membership not found');
      }

      await this.prisma.membership.delete({
        where: {
          id: membership.id,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to leave community: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getRooms(communityId: string) {
    try {
      const community = await this.prisma.community.findUnique({
        where: { id: communityId },
        include: {
          roomGroups: {
            include: {
              rooms: true,
            },
          },
        },
      });

      if (!community) {
        throw new NotFoundException(`Community with ID ${communityId} not found`);
      }

      return community.roomGroups;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        `Failed to fetch rooms: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
