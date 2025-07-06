import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchTherapists(
    query: string,
    filters?: {
      province?: string;
      expertise?: string[];
      maxHourlyRate?: number;
      minExperience?: number;
    },
  ) {
    try {
      const where: any = {
        status: 'approved',
        OR: [
          {
            user: {
              firstName: { contains: query, mode: 'insensitive' },
            },
          },
          {
            user: {
              lastName: { contains: query, mode: 'insensitive' },
            },
          },
          {
            bio: { contains: query, mode: 'insensitive' },
          },
          {
            expertise: { hasSome: [query] },
          },
        ],
      };

      if (filters) {
        if (filters.province) {
          where.province = filters.province;
        }
        if (filters.expertise && filters.expertise.length > 0) {
          where.expertise = { hasSome: filters.expertise };
        }
        if (filters.maxHourlyRate) {
          where.hourlyRate = { lte: filters.maxHourlyRate };
        }
        if (filters.minExperience) {
          where.yearsOfExperience = { gte: filters.minExperience };
        }
      }

      return this.prisma.therapist.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search therapists: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async searchPosts(query: string, communityId?: string) {
    try {
      const where: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      };

      if (communityId) {
        where.communityId = communityId;
      }

      return this.prisma.post.findMany({
        where,
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
                      slug: true,
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
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search posts: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async searchCommunities(query: string) {
    try {
      return this.prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search communities: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async searchUsers(query: string, role?: string) {
    try {
      const where: any = {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (role) {
        where.role = role;
      }

      return this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search users: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async globalSearch(
    query: string,
    type?: 'therapists' | 'posts' | 'communities' | 'users',
  ) {
    try {
      const results: any = {};

      if (!type || type === 'therapists') {
        results.therapists = await this.searchTherapists(query);
      }

      if (!type || type === 'posts') {
        results.posts = await this.searchPosts(query);
      }

      if (!type || type === 'communities') {
        results.communities = await this.searchCommunities(query);
      }

      if (!type || type === 'users') {
        results.users = await this.searchUsers(query);
      }

      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to perform global search: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
