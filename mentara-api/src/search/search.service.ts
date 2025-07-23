import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchTherapists(
    query: string,
    filters?: {
      province?: string;
      location?: string;
      expertise?: string[];
      specialties?: string[];
      maxHourlyRate?: number;
      minExperience?: number;
      experienceYears?: number;
      rating?: number;
      gender?: string;
      languages?: string[];
      availability?: any;
      verifiedOnly?: boolean;
      priceRange?: { min?: number; max?: number };
    },
  ) {
    try {
      const where: any = {
        status: 'APPROVED',
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

  async searchPosts(query: string, communityId?: string, userId?: string) {
    try {
      const where: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      };

      // If userId is provided, filter posts to only include those from communities the user is a member of
      if (userId) {
        where.room = {
          roomGroup: {
            community: {
              memberships: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        };
      }

      // If specific communityId is provided, further filter by that community
      if (communityId) {
        if (where.room) {
          where.room.roomGroup.community.id = communityId;
        } else {
          where.room = {
            roomGroup: {
              community: {
                id: communityId,
              },
            },
          };
        }
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

  async searchComments(query: string, communityId?: string, userId?: string) {
    try {
      const where: any = {
        content: { contains: query, mode: 'insensitive' },
      };

      // If userId is provided, filter comments to only include those from posts in communities the user is a member of
      if (userId) {
        where.post = {
          room: {
            roomGroup: {
              community: {
                memberships: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          },
        };
      }

      // If specific communityId is provided, further filter by that community
      if (communityId) {
        if (where.post) {
          where.post.room.roomGroup.community.id = communityId;
        } else {
          where.post = {
            room: {
              roomGroup: {
                community: {
                  id: communityId,
                },
              },
            },
          };
        }
      }

      return this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              userId: true,
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
            },
          },
          _count: {
            select: {
              hearts: true,
              children: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search comments: ${error instanceof Error ? error.message : String(error)}`,
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

  async searchWorksheets(query: string, userId?: string, role?: 'client' | 'therapist') {
    try {
      const where: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { instructions: { contains: query, mode: 'insensitive' } },
        ],
      };

      // Filter by user role (client can only see their own worksheets)
      if (role === 'client' && userId) {
        where.clientId = userId;
      } else if (role === 'therapist' && userId) {
        where.therapistId = userId;
      }

      return this.prisma.worksheet.findMany({
        where,
        include: {
          client: {
            select: {
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            select: {
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          submission: {
            select: {
              id: true,
              submittedAt: true,
              feedback: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search worksheets: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async searchMessages(query: string, userId: string) {
    try {
      const whereClause: any = {
        AND: [
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            isDeleted: false,
          },
          {
            conversation: {
              participants: {
                some: {
                  userId,
                  isActive: true,
                },
              },
            },
          },
        ],
      };

      return this.prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          conversation: {
            select: {
              id: true,
              type: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to search messages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async globalSearch(
    query: string,
    types?:
      | ('therapists' | 'posts' | 'communities' | 'users' | 'worksheets' | 'messages')[],
    userId?: string,
    userRole?: 'client' | 'therapist' | 'moderator' | 'admin',
  ) {
    try {
      const results: any = {};

      // Default to all types if none specified
      const defaultTypes = ['therapists', 'posts', 'communities', 'users', 'worksheets', 'messages'];
      const typesArray = types && types.length > 0 ? types : defaultTypes;

      if (typesArray.includes('therapists')) {
        results.therapists = await this.searchTherapists(query);
      }

      if (typesArray.includes('posts')) {
        results.posts = await this.searchPosts(query, undefined, userId);
      }

      // Add comments search (always filtered by user communities if userId is provided)
      if (userId) {
        results.comments = await this.searchComments(query, undefined, userId);
      }

      if (typesArray.includes('communities')) {
        results.communities = await this.searchCommunities(query);
      }

      if (typesArray.includes('users')) {
        results.users = await this.searchUsers(query);
      }

      if (typesArray.includes('worksheets')) {
        // Only search worksheets if user has appropriate permissions
        if (userRole === 'client' || userRole === 'therapist') {
          results.worksheets = await this.searchWorksheets(query, userId, userRole);
        } else if (userRole === 'moderator' || userRole === 'admin') {
          // Admins and moderators can see all worksheets
          results.worksheets = await this.searchWorksheets(query);
        }
      }

      if (typesArray.includes('messages') && userId) {
        // Messages are always private to the user
        results.messages = await this.searchMessages(query, userId);
      }

      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to perform global search: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
