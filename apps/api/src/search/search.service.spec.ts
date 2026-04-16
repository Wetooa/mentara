import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { InternalServerErrorException } from '@nestjs/common';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: any;

  // Mock data
  const mockTherapist = {
    id: 'therapist-123',
    userId: 'user-123',
    bio: 'Experienced therapist specializing in anxiety and depression',
    expertise: ['anxiety', 'depression', 'trauma'],
    hourlyRate: 100,
    yearsOfExperience: 5,
    province: 'Ontario',
    status: 'approved',
    createdAt: new Date('2024-01-15T00:00:00Z'),
    user: {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  } as any;

  const mockPost = {
    id: 'post-123',
    title: 'Mental Health Tips',
    content: 'Here are some tips for managing anxiety',
    tags: ['anxiety', 'tips', 'mental-health'],
    userId: 'user-456',
    roomId: 'room-123',
    communityId: 'community-123',
    createdAt: new Date('2024-01-15T00:00:00Z'),
    user: {
      id: 'user-456',
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/jane.jpg',
    },
    room: {
      id: 'room-123',
      name: 'General Discussion',
      roomGroup: {
        id: 'group-123',
        name: 'Main Group',
        community: {
          id: 'community-123',
          name: 'Mental Health Support',
          slug: 'mental-health-support',
        },
      },
    },
    _count: {
      hearts: 15,
      comments: 8,
    },
  } as any;

  const mockCommunity = {
    id: 'community-123',
    name: 'Mental Health Support',
    description: 'A supportive community for mental health discussions',
    slug: 'mental-health-support',
    imageUrl: 'https://example.com/community.jpg',
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-01-15T00:00:00Z'),
    _count: {
      memberships: 250,
    },
  } as any;

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: 'client',
    createdAt: new Date('2024-01-15T00:00:00Z'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      therapist: {
        findMany: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
      },
      community: {
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchTherapists', () => {
    beforeEach(() => {
      prismaService.therapist.findMany.mockResolvedValue([mockTherapist]);
    });

    it('should search therapists successfully', async () => {
      const result = await service.searchTherapists('anxiety');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: {
          status: 'approved',
          OR: [
            {
              user: {
                firstName: { contains: 'anxiety', mode: 'insensitive' },
              },
            },
            {
              user: {
                lastName: { contains: 'anxiety', mode: 'insensitive' },
              },
            },
            {
              bio: { contains: 'anxiety', mode: 'insensitive' },
            },
            {
              expertise: { hasSome: ['anxiety'] },
            },
          ],
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
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      expect(result).toEqual([mockTherapist]);
    });

    it('should search therapists with province filter', async () => {
      await service.searchTherapists('anxiety', { province: 'Ontario' });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
        where: {
          status: 'approved',
          province: 'Ontario',
          OR: [
            {
              user: {
                firstName: { contains: 'anxiety', mode: 'insensitive' },
              },
            },
            {
              user: {
                lastName: { contains: 'anxiety', mode: 'insensitive' },
              },
            },
            {
              bio: { contains: 'anxiety', mode: 'insensitive' },
            },
            {
              expertise: { hasSome: ['anxiety'] },
            },
          ],
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
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('should search therapists with expertise filter', async () => {
      await service.searchTherapists('therapist', {
        expertise: ['anxiety', 'depression'],
      });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expertise: { hasSome: ['anxiety', 'depression'] },
          }),
        }),
      );
    });

    it('should search therapists with hourly rate filter', async () => {
      await service.searchTherapists('therapist', { maxHourlyRate: 150 });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hourlyRate: { lte: 150 },
          }),
        }),
      );
    });

    it('should search therapists with experience filter', async () => {
      await service.searchTherapists('therapist', { minExperience: 3 });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            yearsOfExperience: { gte: 3 },
          }),
        }),
      );
    });

    it('should search therapists with multiple filters', async () => {
      await service.searchTherapists('anxiety', {
        province: 'Ontario',
        expertise: ['anxiety'],
        maxHourlyRate: 120,
        minExperience: 2,
      });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'approved',
            province: 'Ontario',
            expertise: { hasSome: ['anxiety'] },
            hourlyRate: { lte: 120 },
            yearsOfExperience: { gte: 2 },
          }),
        }),
      );
    });

    it('should handle empty results', async () => {
      prismaService.therapist.findMany.mockResolvedValue([]);

      const result = await service.searchTherapists('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      prismaService.therapist.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.searchTherapists('anxiety')).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle empty expertise filter', async () => {
      await service.searchTherapists('anxiety', { expertise: [] });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            expertise: expect.anything(),
          }),
        }),
      );
    });

    it('should handle case insensitive search', async () => {
      await service.searchTherapists('ANXIETY');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              {
                bio: { contains: 'ANXIETY', mode: 'insensitive' },
              },
            ]),
          }),
        }),
      );
    });

    it('should handle special characters in query', async () => {
      const specialQuery = 'anxiety & depression';

      await service.searchTherapists(specialQuery);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              {
                bio: { contains: specialQuery, mode: 'insensitive' },
              },
            ]),
          }),
        }),
      );
    });
  });

  describe('searchPosts', () => {
    beforeEach(() => {
      prismaService.post.findMany.mockResolvedValue([mockPost]);
    });

    it('should search posts successfully', async () => {
      const result = await service.searchPosts('anxiety');

      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'anxiety', mode: 'insensitive' } },
            { content: { contains: 'anxiety', mode: 'insensitive' } },
          ],
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
      expect(result).toEqual([mockPost]);
    });

    it('should search posts with community filter', async () => {
      await service.searchPosts('mental health', 'community-123');

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            communityId: 'community-123',
          }),
        }),
      );
    });

    it('should handle empty results', async () => {
      prismaService.post.findMany.mockResolvedValue([]);

      const result = await service.searchPosts('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      prismaService.post.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.searchPosts('anxiety')).rejects.toThrow(
        'Database error',
      );
    });

    it('should search in post titles', async () => {
      await service.searchPosts('Mental Health');

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'Mental Health', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should search in post content', async () => {
      await service.searchPosts('tips');

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { content: { contains: 'tips', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });


    it('should handle Unicode characters', async () => {
      const unicodeQuery = 'salúd mental';

      await service.searchPosts(unicodeQuery);

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: unicodeQuery, mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('searchCommunities', () => {
    beforeEach(() => {
      prismaService.community.findMany.mockResolvedValue([mockCommunity]);
    });

    it('should search communities successfully', async () => {
      const result = await service.searchCommunities('mental health');

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'mental health', mode: 'insensitive' } },
            { description: { contains: 'mental health', mode: 'insensitive' } },
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
      expect(result).toEqual([mockCommunity]);
    });

    it('should handle empty results', async () => {
      prismaService.community.findMany.mockResolvedValue([]);

      const result = await service.searchCommunities('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      prismaService.community.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.searchCommunities('support')).rejects.toThrow(
        'Database error',
      );
    });

    it('should search in community names', async () => {
      await service.searchCommunities('Support');

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'Support', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should search in community descriptions', async () => {
      await service.searchCommunities('supportive');

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { description: { contains: 'supportive', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should handle case insensitive search', async () => {
      await service.searchCommunities('MENTAL HEALTH');

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'MENTAL HEALTH', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should handle partial matches', async () => {
      await service.searchCommunities('health');

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'health', mode: 'insensitive' } },
              { description: { contains: 'health', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('searchUsers', () => {
    beforeEach(() => {
      prismaService.user.findMany.mockResolvedValue([mockUser]);
    });

    it('should search users successfully', async () => {
      const result = await service.searchUsers('john');

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
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
      expect(result).toEqual([mockUser]);
    });

    it('should search users with role filter', async () => {
      await service.searchUsers('john', 'therapist');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'therapist',
          }),
        }),
      );
    });

    it('should handle empty results', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      const result = await service.searchUsers('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      prismaService.user.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.searchUsers('john')).rejects.toThrow(
        'Database error',
      );
    });

    it('should search in first names', async () => {
      await service.searchUsers('Jane');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: 'Jane', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should search in last names', async () => {
      await service.searchUsers('Smith');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { lastName: { contains: 'Smith', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should search in email addresses', async () => {
      await service.searchUsers('example.com');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { email: { contains: 'example.com', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should handle different user roles', async () => {
      const roles = ['client', 'therapist', 'moderator', 'admin'];

      for (const role of roles) {
        await service.searchUsers('user', role);

        expect(prismaService.user.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              role: role,
            }),
          }),
        );
      }
    });
  });

  describe('globalSearch', () => {
    beforeEach(() => {
      // Mock all individual search methods
      jest
        .spyOn(service, 'searchTherapists')
        .mockResolvedValue([mockTherapist]);
      jest.spyOn(service, 'searchPosts').mockResolvedValue([mockPost]);
      jest
        .spyOn(service, 'searchCommunities')
        .mockResolvedValue([mockCommunity]);
      jest.spyOn(service, 'searchUsers').mockResolvedValue([mockUser]);
    });

    it('should perform global search across all types', async () => {
      const result = await service.globalSearch('anxiety');

      expect(service.searchTherapists).toHaveBeenCalledWith('anxiety');
      expect(service.searchPosts).toHaveBeenCalledWith('anxiety');
      expect(service.searchCommunities).toHaveBeenCalledWith('anxiety');
      expect(service.searchUsers).toHaveBeenCalledWith('anxiety');

      expect(result).toEqual({
        therapists: [mockTherapist],
        posts: [mockPost],
        communities: [mockCommunity],
        users: [mockUser],
      });
    });

    it('should search only therapists when type is specified', async () => {
      const result = await service.globalSearch('anxiety', 'therapists');

      expect(service.searchTherapists).toHaveBeenCalledWith('anxiety');
      expect(service.searchPosts).not.toHaveBeenCalled();
      expect(service.searchCommunities).not.toHaveBeenCalled();
      expect(service.searchUsers).not.toHaveBeenCalled();

      expect(result).toEqual({
        therapists: [mockTherapist],
      });
    });

    it('should search only posts when type is specified', async () => {
      const result = await service.globalSearch('mental health', 'posts');

      expect(service.searchTherapists).not.toHaveBeenCalled();
      expect(service.searchPosts).toHaveBeenCalledWith('mental health');
      expect(service.searchCommunities).not.toHaveBeenCalled();
      expect(service.searchUsers).not.toHaveBeenCalled();

      expect(result).toEqual({
        posts: [mockPost],
      });
    });

    it('should search only communities when type is specified', async () => {
      const result = await service.globalSearch('support', 'communities');

      expect(service.searchTherapists).not.toHaveBeenCalled();
      expect(service.searchPosts).not.toHaveBeenCalled();
      expect(service.searchCommunities).toHaveBeenCalledWith('support');
      expect(service.searchUsers).not.toHaveBeenCalled();

      expect(result).toEqual({
        communities: [mockCommunity],
      });
    });

    it('should search only users when type is specified', async () => {
      const result = await service.globalSearch('john', 'users');

      expect(service.searchTherapists).not.toHaveBeenCalled();
      expect(service.searchPosts).not.toHaveBeenCalled();
      expect(service.searchCommunities).not.toHaveBeenCalled();
      expect(service.searchUsers).toHaveBeenCalledWith('john');

      expect(result).toEqual({
        users: [mockUser],
      });
    });

    it('should handle errors in individual search methods', async () => {
      jest
        .spyOn(service, 'searchTherapists')
        .mockRejectedValue(new Error('Search failed'));

      await expect(service.globalSearch('anxiety')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle empty query strings', async () => {
      const result = await service.globalSearch('');

      expect(service.searchTherapists).toHaveBeenCalledWith('');
      expect(service.searchPosts).toHaveBeenCalledWith('');
      expect(service.searchCommunities).toHaveBeenCalledWith('');
      expect(service.searchUsers).toHaveBeenCalledWith('');

      expect(result).toEqual({
        therapists: [mockTherapist],
        posts: [mockPost],
        communities: [mockCommunity],
        users: [mockUser],
      });
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null query strings', async () => {
      const nullQuery = null as any;

      prismaService.therapist.findMany.mockResolvedValue([]);

      await service.searchTherapists(nullQuery);

      expect(prismaService.therapist.findMany).toHaveBeenCalled();
    });

    it('should handle undefined query strings', async () => {
      const undefinedQuery = undefined as any;

      prismaService.post.findMany.mockResolvedValue([]);

      await service.searchPosts(undefinedQuery);

      expect(prismaService.post.findMany).toHaveBeenCalled();
    });

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);

      prismaService.community.findMany.mockResolvedValue([]);

      await service.searchCommunities(longQuery);

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: longQuery, mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should handle special characters in filters', async () => {
      await service.searchTherapists('anxiety', {
        province: 'Québec',
        expertise: ['thérapie', 'anxiété'],
      });

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            province: 'Québec',
            expertise: { hasSome: ['thérapie', 'anxiété'] },
          }),
        }),
      );
    });

    it('should handle database connection timeouts', async () => {
      prismaService.user.findMany.mockRejectedValue(
        new Error('Connection timeout'),
      );

      await expect(service.searchUsers('test')).rejects.toThrow(
        'Connection timeout',
      );
    });

    it('should handle concurrent search requests', async () => {
      const searches = [
        service.searchTherapists('anxiety'),
        service.searchPosts('mental health'),
        service.searchCommunities('support'),
        service.searchUsers('john'),
      ];

      const results = await Promise.allSettled(searches);

      expect(results.every((result) => result.status === 'fulfilled')).toBe(
        true,
      );
    });

    it('should handle malformed filter objects', async () => {
      const malformedFilters = {
        province: undefined,
        expertise: 'not-an-array' as any,
        maxHourlyRate: 'invalid' as any,
        minExperience: -1,
      };

      await service.searchTherapists('test', malformedFilters);

      expect(prismaService.therapist.findMany).toHaveBeenCalled();
    });

    it('should handle non-string error objects', async () => {
      const nonStringError = { message: 'Database error' };
      prismaService.therapist.findMany.mockRejectedValue(nonStringError);

      await expect(service.searchTherapists('test')).rejects.toBe(
        nonStringError,
      );
    });
  });

  describe('Performance and scaling', () => {
    it('should handle large result sets efficiently', async () => {
      const manyTherapists = Array(1000)
        .fill(mockTherapist)
        .map((therapist, i) => ({
          ...therapist,
          id: `therapist-${i}`,
        }));

      prismaService.therapist.findMany.mockResolvedValue(manyTherapists);

      const result = await service.searchTherapists('anxiety');

      expect(result).toHaveLength(1000);
      expect(prismaService.therapist.findMany).toHaveBeenCalledTimes(1);
    });

    it('should respect take limit in queries', async () => {
      await service.searchTherapists('anxiety');
      await service.searchPosts('mental health');
      await service.searchCommunities('support');
      await service.searchUsers('john');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });

    it('should handle rapid successive searches', async () => {
      const rapidSearches = Array(10)
        .fill(null)
        .map(() => service.searchTherapists('anxiety'));

      const results = await Promise.all(rapidSearches);

      expect(results).toHaveLength(10);
      expect(prismaService.therapist.findMany).toHaveBeenCalledTimes(10);
    });

    it('should handle complex filter combinations efficiently', async () => {
      const complexFilters = {
        province: 'Ontario',
        expertise: ['anxiety', 'depression', 'trauma', 'PTSD', 'CBT'],
        maxHourlyRate: 200,
        minExperience: 10,
      };

      await service.searchTherapists('expert therapist', complexFilters);

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'approved',
            province: 'Ontario',
            expertise: { hasSome: complexFilters.expertise },
            hourlyRate: { lte: 200 },
            yearsOfExperience: { gte: 10 },
          }),
        }),
      );
    });
  });

  describe('Business logic validation', () => {
    it('should only search approved therapists', async () => {
      await service.searchTherapists('anxiety');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'approved',
          }),
        }),
      );
    });

    it('should include proper user information for therapists', async () => {
      await service.searchTherapists('anxiety');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          }),
        }),
      );
    });

    it('should include engagement metrics for posts', async () => {
      await service.searchPosts('mental health');

      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: {
              select: {
                hearts: true,
                comments: true,
              },
            },
          }),
        }),
      );
    });

    it('should include membership count for communities', async () => {
      await service.searchCommunities('support');

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: {
              select: {
                memberships: true,
              },
            },
          }),
        }),
      );
    });

    it('should select only safe user fields', async () => {
      await service.searchUsers('john');

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        }),
      );
    });

    it('should order results by creation date', async () => {
      await service.searchTherapists('anxiety');
      await service.searchPosts('mental health');
      await service.searchCommunities('support');
      await service.searchUsers('john');

      expect(prismaService.therapist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(prismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });
});
