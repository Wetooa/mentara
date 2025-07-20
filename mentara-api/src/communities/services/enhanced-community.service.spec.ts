import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnhancedCommunityService } from './enhanced-community.service';
import { PrismaService } from '../../providers/prisma-client.provider';

describe('EnhancedCommunityService', () => {
  let service: EnhancedCommunityService;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let loggerSpy: jest.SpyInstance;

  // Mock data
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'avatar.jpg',
    updatedAt: new Date('2024-01-15'),
  };

  const mockModerator = {
    user: mockUser,
  };

  const mockRoom = {
    id: 'room-123',
    name: 'General Discussion',
    order: 1,
    postingRole: 'member',
    roomGroupId: 'roomgroup-123',
    posts: [
      {
        id: 'post-123',
        title: 'Test Post',
        content: 'This is a test post',
        createdAt: new Date('2024-01-10'),
        user: mockUser,
        _count: { comments: 5, hearts: 10 },
      },
      {
        id: 'post-456',
        title: 'Another Post',
        content: 'Another test post',
        createdAt: new Date('2024-01-12'),
        user: mockUser,
        _count: { comments: 3, hearts: 7 },
      },
    ],
    _count: { posts: 2 },
  };

  const mockRoomGroup = {
    id: 'roomgroup-123',
    name: 'General',
    order: 1,
    communityId: 'community-123',
    rooms: [mockRoom],
  };

  const mockCommunityWithDetails = {
    id: 'community-123',
    name: 'Depression Support Network',
    slug: 'depression-support',
    description: 'A supportive community for depression',
    imageUrl: 'depression.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { memberships: 45 },
    roomGroups: [mockRoomGroup],
    moderatorCommunities: [
      {
        moderator: mockModerator,
        assignedAt: new Date('2024-01-01'),
      },
    ],
    memberships: [{ role: 'member' }],
  };

  const mockCommunities = [
    {
      id: 'community-123',
      name: 'Depression Support Network',
      slug: 'depression-support',
      description: 'A supportive community for depression',
      imageUrl: 'depression.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { memberships: 45 },
      memberships: [{ role: 'member' }],
    },
    {
      id: 'community-456',
      name: 'Anxiety Warriors',
      slug: 'anxiety-warriors',
      description: 'A supportive community for anxiety',
      imageUrl: 'anxiety.jpg',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      _count: { memberships: 30 },
      memberships: [],
    },
    {
      id: 'community-789',
      name: 'Small Support Group',
      slug: 'small-support',
      description: 'A small intimate support group',
      imageUrl: 'small.jpg',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      _count: { memberships: 8 },
      memberships: [],
    },
  ];

  const mockTrendingCommunity = {
    id: 'community-trending',
    name: 'Trending Community',
    slug: 'trending-community',
    description: 'A trending community',
    imageUrl: 'trending.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { memberships: 100 },
    memberships: [
      { joinedAt: new Date('2024-01-15') }, // Recent member
      { joinedAt: new Date('2024-01-14') }, // Recent member
    ],
    roomGroups: [
      {
        rooms: [
          {
            posts: [
              {
                createdAt: new Date('2024-01-15'),
                _count: { comments: 10, hearts: 20 },
              },
              {
                createdAt: new Date('2024-01-14'),
                _count: { comments: 5, hearts: 15 },
              },
            ],
          },
        ],
      },
    ],
  };

  const mockTopContributor = {
    id: 'user-contributor',
    firstName: 'Jane',
    lastName: 'Smith',
    avatarUrl: 'jane.jpg',
    _count: { posts: 15, comments: 25 },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      community: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      comment: {
        count: jest.fn(),
      },
      post: {
        count: jest.fn(),
      },
      membership: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedCommunityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EnhancedCommunityService>(EnhancedCommunityService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchCommunities', () => {
    beforeEach(() => {
      prismaService.community.findMany.mockResolvedValue(mockCommunities);
      prismaService.community.count.mockResolvedValue(3);
    });

    it('should search communities with text query', async () => {
      const filters = { query: 'depression' };
      
      const result = await service.searchCommunities(filters, 'user-123', 1, 10);

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'depression', mode: 'insensitive' } },
            { description: { contains: 'depression', mode: 'insensitive' } },
          ],
        },
        include: {
          _count: { select: { memberships: true } },
          memberships: {
            where: { userId: 'user-123' },
            select: { role: true },
          },
        },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        communities: expect.arrayContaining([
          expect.objectContaining({
            id: 'community-123',
            name: 'Depression Support Network',
            membershipStatus: 'member',
          }),
        ]),
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        facets: expect.objectContaining({
          memberRanges: expect.any(Array),
          commonTags: expect.any(Array),
        }),
      });
    });

    it('should search communities without user context', async () => {
      const filters = { query: 'support' };
      
      const result = await service.searchCommunities(filters, undefined, 1, 10);

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'support', mode: 'insensitive' } },
            { description: { contains: 'support', mode: 'insensitive' } },
          ],
        },
        include: {
          _count: { select: { memberships: true } },
          memberships: false,
        },
        skip: 0,
        take: 10,
      });

      expect(result.communities).toHaveLength(3);
      result.communities.forEach(community => {
        expect(community.membershipStatus).toBe('none');
      });
    });

    it('should filter by description presence', async () => {
      const filters = { hasDescription: true };
      
      await service.searchCommunities(filters, 'user-123', 1, 10);

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            description: { not: '' },
          }),
        })
      );
    });

    it('should filter by image presence', async () => {
      const filters = { hasImage: false };
      
      await service.searchCommunities(filters, 'user-123', 1, 10);

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            imageUrl: '',
          }),
        })
      );
    });

    it('should filter by member count range', async () => {
      const filters = { minMembers: 20, maxMembers: 50 };
      
      const result = await service.searchCommunities(filters, 'user-123', 1, 10);

      // Should filter out communities outside range
      result.communities.forEach(community => {
        expect(community.memberCount).toBeGreaterThanOrEqual(20);
        expect(community.memberCount).toBeLessThanOrEqual(50);
      });
    });

    it('should handle pagination correctly', async () => {
      const filters = {};
      
      await service.searchCommunities(filters, 'user-123', 2, 5);

      expect(prismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          take: 5,
        })
      );
    });

    it('should sort communities by members count', async () => {
      const filters = { sortBy: 'members', sortOrder: 'desc' };
      
      const result = await service.searchCommunities(filters, 'user-123', 1, 10);

      // Should be sorted by member count descending
      for (let i = 1; i < result.communities.length; i++) {
        expect(result.communities[i-1].memberCount).toBeGreaterThanOrEqual(
          result.communities[i].memberCount
        );
      }
    });

    it('should sort communities by newest first', async () => {
      const filters = { sortBy: 'newest', sortOrder: 'desc' };
      
      const result = await service.searchCommunities(filters, 'user-123', 1, 10);

      // Should be sorted by creation date descending
      for (let i = 1; i < result.communities.length; i++) {
        expect(result.communities[i-1].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.communities[i].createdAt.getTime()
        );
      }
    });

    it('should sort communities alphabetically', async () => {
      const filters = { sortBy: 'alphabetical', sortOrder: 'asc' };
      
      const result = await service.searchCommunities(filters, 'user-123', 1, 10);

      // Should be sorted alphabetically
      for (let i = 1; i < result.communities.length; i++) {
        expect(result.communities[i-1].name.localeCompare(result.communities[i].name))
          .toBeLessThanOrEqual(0);
      }
    });

    it('should calculate total pages correctly', async () => {
      prismaService.community.count.mockResolvedValue(25);
      
      const result = await service.searchCommunities({}, 'user-123', 1, 10);

      expect(result.totalPages).toBe(3); // Math.ceil(25/10) = 3
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.findMany.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(service.searchCommunities({}, 'user-123')).rejects.toThrow('Database error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error searching communities'),
        expect.any(Error)
      );
    });

    it('should set correct membership status based on user memberships', async () => {
      const communitiesWithMemberships = [
        { ...mockCommunities[0], memberships: [{ role: 'member' }] },
        { ...mockCommunities[1], memberships: [] },
      ];
      
      prismaService.community.findMany.mockResolvedValue(communitiesWithMemberships);

      const result = await service.searchCommunities({}, 'user-123', 1, 10);

      expect(result.communities[0].membershipStatus).toBe('member');
      expect(result.communities[1].membershipStatus).toBe('none');
    });
  });

  describe('getCommunityDetails', () => {
    beforeEach(() => {
      prismaService.community.findUnique.mockResolvedValue(mockCommunityWithDetails);
      prismaService.comment.count.mockResolvedValue(50);
      prismaService.post.count.mockResolvedValue(10);
      prismaService.membership.count
        .mockResolvedValueOnce(5) // weekly posts
        .mockResolvedValueOnce(15) // weekly comments
        .mockResolvedValueOnce(3) // weekly members
        .mockResolvedValueOnce(25); // active members
      prismaService.user.findMany.mockResolvedValue([mockTopContributor]);
    });

    it('should get detailed community information', async () => {
      const result = await service.getCommunityDetails('community-123', 'user-123');

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-123' },
        include: expect.objectContaining({
          _count: { select: { memberships: true } },
          roomGroups: expect.any(Object),
          moderatorCommunities: expect.any(Object),
          memberships: expect.any(Object),
        }),
      });

      expect(result).toEqual({
        id: 'community-123',
        name: 'Depression Support Network',
        slug: 'depression-support',
        description: 'A supportive community for depression',
        imageUrl: 'depression.jpg',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        memberCount: 45,
        stats: expect.objectContaining({
          totalPosts: 2,
          totalComments: 50,
          activeMembers: 25,
          recentActivity: expect.objectContaining({
            postsThisWeek: 10,
            commentsThisWeek: 15,
            newMembersThisWeek: 3,
          }),
        }),
        recentPosts: expect.arrayContaining([
          expect.objectContaining({
            id: 'post-456',
            title: 'Another Post',
            author: expect.objectContaining({
              firstName: 'John',
              lastName: 'Doe',
            }),
          }),
        ]),
        topContributors: expect.any(Array),
        moderators: expect.arrayContaining([
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
          }),
        ]),
        membershipStatus: 'member',
        userPermissions: expect.objectContaining({
          canPost: true,
          canComment: true,
          canModerate: false,
        }),
      });
    });

    it('should handle community not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      await expect(service.getCommunityDetails('non-existent')).rejects.toThrow(
        new NotFoundException('Community non-existent not found')
      );
    });

    it('should calculate user permissions for moderator', async () => {
      const moderatorCommunity = {
        ...mockCommunityWithDetails,
        memberships: [{ role: 'moderator' }],
      };
      
      prismaService.community.findUnique.mockResolvedValue(moderatorCommunity);

      const result = await service.getCommunityDetails('community-123', 'user-123');

      expect(result.userPermissions).toEqual({
        canPost: true,
        canComment: true,
        canModerate: true,
      });
    });

    it('should handle user without membership', async () => {
      const communityWithoutUserMembership = {
        ...mockCommunityWithDetails,
        memberships: [],
      };
      
      prismaService.community.findUnique.mockResolvedValue(communityWithoutUserMembership);

      const result = await service.getCommunityDetails('community-123', 'user-123');

      expect(result.membershipStatus).toBe('none');
      expect(result.userPermissions).toEqual({
        canPost: false,
        canComment: false,
        canModerate: false,
      });
    });

    it('should handle missing user context', async () => {
      const result = await service.getCommunityDetails('community-123');

      expect(result.membershipStatus).toBe('none');
      expect(result.userPermissions).toEqual({
        canPost: false,
        canComment: false,
        canModerate: false,
      });
    });

    it('should sort recent posts by creation date', async () => {
      const result = await service.getCommunityDetails('community-123', 'user-123');

      // Should be sorted newest first
      for (let i = 1; i < result.recentPosts.length; i++) {
        expect(result.recentPosts[i-1].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.recentPosts[i].createdAt.getTime()
        );
      }
    });

    it('should handle posts with missing user data', async () => {
      const communityWithAnonymousPost = {
        ...mockCommunityWithDetails,
        roomGroups: [{
          ...mockRoomGroup,
          rooms: [{
            ...mockRoom,
            posts: [{
              id: 'post-anonymous',
              title: 'Anonymous Post',
              content: 'Post without user',
              createdAt: new Date('2024-01-10'),
              user: null,
              _count: { comments: 0, hearts: 0 },
            }],
          }],
        }],
      };
      
      prismaService.community.findUnique.mockResolvedValue(communityWithAnonymousPost);

      const result = await service.getCommunityDetails('community-123', 'user-123');

      const anonymousPost = result.recentPosts.find(p => p.id === 'post-anonymous');
      expect(anonymousPost?.author).toEqual({
        id: 'unknown',
        firstName: 'Unknown',
        lastName: 'User',
        avatarUrl: undefined,
      });
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(service.getCommunityDetails('community-123')).rejects.toThrow('Database error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting community details for community-123'),
        expect.any(Error)
      );
    });
  });

  describe('getTrendingCommunities', () => {
    beforeEach(() => {
      prismaService.community.findMany.mockResolvedValue([mockTrendingCommunity]);
      prismaService.membership.count.mockResolvedValue(5); // Previous period members
    });

    it('should get trending communities with default parameters', async () => {
      const result = await service.getTrendingCommunities();

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          _count: { select: { memberships: true } },
          memberships: expect.objectContaining({
            where: expect.objectContaining({
              joinedAt: { gte: expect.any(Date) },
            }),
          }),
          roomGroups: expect.any(Object),
        }),
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeLessThanOrEqual(10);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('trendingData');
        expect(result[0].trendingData).toHaveProperty('growthRate');
        expect(result[0].trendingData).toHaveProperty('activityScore');
        expect(result[0].trendingData).toHaveProperty('engagementRate');
        expect(result[0].trendingData).toHaveProperty('retentionRate');
      }
    });

    it('should get trending communities for month timeframe', async () => {
      await service.getTrendingCommunities(5, 'month');

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        include: expect.objectContaining({
          memberships: expect.objectContaining({
            where: expect.objectContaining({
              joinedAt: { gte: expect.any(Date) },
            }),
          }),
        }),
      });
    });

    it('should limit results to specified limit', async () => {
      const result = await service.getTrendingCommunities(3);

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should sort by trending score', async () => {
      // Mock multiple communities with different trending metrics
      const multipleTrendingCommunities = [
        { ...mockTrendingCommunity, id: 'trending-1' },
        { ...mockTrendingCommunity, id: 'trending-2' },
        { ...mockTrendingCommunity, id: 'trending-3' },
      ];
      
      prismaService.community.findMany.mockResolvedValue(multipleTrendingCommunities);

      const result = await service.getTrendingCommunities();

      // Should be sorted by trending score (combination of metrics)
      for (let i = 1; i < result.length; i++) {
        const scoreA = result[i-1].trendingData.growthRate * 0.4 + 
                     result[i-1].trendingData.activityScore * 0.4 + 
                     result[i-1].trendingData.engagementRate * 0.2;
        const scoreB = result[i].trendingData.growthRate * 0.4 + 
                     result[i].trendingData.activityScore * 0.4 + 
                     result[i].trendingData.engagementRate * 0.2;
        expect(scoreA).toBeGreaterThanOrEqual(scoreB);
      }
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.findMany.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(service.getTrendingCommunities()).rejects.toThrow('Database error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting trending communities'),
        expect.any(Error)
      );
    });

    it('should calculate growth rate correctly', async () => {
      const calculateTrendingData = (service as any).calculateTrendingData.bind(service);
      
      const community = {
        id: 'test-community',
        memberships: [{ joinedAt: new Date() }], // 1 new member
        _count: { memberships: 10 }, // Total 10 members
        posts: [],
      };
      
      const startDate = new Date('2024-01-15');
      const previousStartDate = new Date('2024-01-08');
      
      // Mock 5 previous members
      prismaService.membership.count.mockResolvedValue(5);

      const result = await calculateTrendingData(community, startDate, previousStartDate);

      // Growth rate = ((1 - 5) / 5) * 100 = -80% (but should be >= 0)
      expect(result.growthRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero previous members', async () => {
      const calculateTrendingData = (service as any).calculateTrendingData.bind(service);
      
      const community = {
        id: 'test-community',
        memberships: [{ joinedAt: new Date() }], // 1 new member
        _count: { memberships: 1 },
        posts: [],
      };
      
      // Mock 0 previous members
      prismaService.membership.count.mockResolvedValue(0);

      const result = await calculateTrendingData(
        community, 
        new Date('2024-01-15'), 
        new Date('2024-01-08')
      );

      expect(result.growthRate).toBe(100); // 100% growth when starting from 0
    });
  });

  describe('getSimilarCommunities', () => {
    const mockRefCommunity = {
      id: 'ref-community',
      memberships: [
        {
          user: {
            memberships: [
              { communityId: 'similar-1', community: { id: 'similar-1' } },
              { communityId: 'similar-2', community: { id: 'similar-2' } },
            ],
          },
        },
        {
          user: {
            memberships: [
              { communityId: 'similar-1', community: { id: 'similar-1' } },
              { communityId: 'similar-3', community: { id: 'similar-3' } },
            ],
          },
        },
      ],
    };

    const mockSimilarCommunities = [
      {
        id: 'similar-1',
        name: 'Similar Community 1',
        slug: 'similar-1',
        description: 'Similar community',
        imageUrl: 'similar1.jpg',
        createdAt: new Date('2024-01-01'),
        _count: { memberships: 20 },
        roomGroups: [{ rooms: [{ _count: { posts: 5 } }] }],
      },
      {
        id: 'similar-2',
        name: 'Similar Community 2',
        slug: 'similar-2',
        description: 'Another similar community',
        imageUrl: 'similar2.jpg',
        createdAt: new Date('2024-01-02'),
        _count: { memberships: 15 },
        roomGroups: [{ rooms: [{ _count: { posts: 3 } }] }],
      },
    ];

    beforeEach(() => {
      prismaService.community.findUnique
        .mockResolvedValueOnce(mockRefCommunity)
        .mockResolvedValue(null);
      prismaService.community.findMany.mockResolvedValue(mockSimilarCommunities);
      prismaService.membership.findMany.mockResolvedValue([]);
    });

    it('should find similar communities based on member overlap', async () => {
      const context = { userId: 'user-123', maxResults: 5 };
      
      const result = await service.getSimilarCommunities('ref-community', context);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'ref-community' },
        include: expect.objectContaining({
          memberships: expect.any(Object),
        }),
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeLessThanOrEqual(5);
      
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('membershipStatus');
        expect(result[0].membershipStatus).toBe('none');
      }
    });

    it('should exclude user joined communities when excludeJoined is true', async () => {
      const userMemberships = [{ communityId: 'similar-1' }];
      prismaService.membership.findMany.mockResolvedValue(userMemberships);

      const context = { userId: 'user-123', excludeJoined: true, maxResults: 5 };
      
      const result = await service.getSimilarCommunities('ref-community', context);

      expect(prismaService.membership.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: { communityId: true },
      });

      // Should exclude similar-1 since user is already a member
      const excludedCommunity = result.find(c => c.id === 'similar-1');
      expect(excludedCommunity).toBeUndefined();
    });

    it('should include user joined communities when excludeJoined is false', async () => {
      const context = { userId: 'user-123', excludeJoined: false, maxResults: 5 };
      
      await service.getSimilarCommunities('ref-community', context);

      expect(prismaService.membership.findMany).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent reference community', async () => {
      prismaService.community.findUnique.mockResolvedValueOnce(null);

      const context = { userId: 'user-123' };

      await expect(
        service.getSimilarCommunities('non-existent', context)
      ).rejects.toThrow(new NotFoundException('Community non-existent not found'));
    });

    it('should handle communities without members', async () => {
      const emptyRefCommunity = { id: 'ref-community', memberships: [] };
      prismaService.community.findUnique.mockResolvedValueOnce(emptyRefCommunity);

      const context = { userId: 'user-123' };
      
      const result = await service.getSimilarCommunities('ref-community', context);

      expect(result).toEqual([]);
    });

    it('should limit results to maxResults', async () => {
      const context = { userId: 'user-123', maxResults: 1 };
      
      const result = await service.getSimilarCommunities('ref-community', context);

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.findUnique.mockRejectedValue(new Error('Database error'));

      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const context = { userId: 'user-123' };

      await expect(
        service.getSimilarCommunities('ref-community', context)
      ).rejects.toThrow('Database error');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting similar communities for ref-community'),
        expect.any(Error)
      );
    });
  });

  describe('applySorting', () => {
    const sampleCommunities = [
      {
        id: '1',
        name: 'Beta Community',
        memberCount: 10,
        recentActivity: { postCount: 5, commentCount: 10, lastActivityAt: null },
        createdAt: new Date('2024-01-02'),
      },
      {
        id: '2',
        name: 'Alpha Community',
        memberCount: 20,
        recentActivity: { postCount: 3, commentCount: 7, lastActivityAt: null },
        createdAt: new Date('2024-01-01'),
      },
    ] as any[];

    it('should sort by members descending', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'members', 'desc');

      expect(communities[0].memberCount).toBe(20);
      expect(communities[1].memberCount).toBe(10);
    });

    it('should sort by members ascending', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'members', 'asc');

      expect(communities[0].memberCount).toBe(10);
      expect(communities[1].memberCount).toBe(20);
    });

    it('should sort by activity', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'activity', 'desc');

      // Community 1: 5 + 10 = 15, Community 2: 3 + 7 = 10
      expect(communities[0].id).toBe('1');
      expect(communities[1].id).toBe('2');
    });

    it('should sort by newest', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'newest', 'desc');

      expect(communities[0].createdAt.getTime()).toBe(new Date('2024-01-02').getTime());
      expect(communities[1].createdAt.getTime()).toBe(new Date('2024-01-01').getTime());
    });

    it('should sort alphabetically', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'alphabetical', 'asc');

      expect(communities[0].name).toBe('Alpha Community');
      expect(communities[1].name).toBe('Beta Community');
    });

    it('should default to relevance sorting (member count)', () => {
      const applySorting = (service as any).applySorting.bind(service);
      const communities = [...sampleCommunities];
      
      applySorting(communities, 'relevance', 'desc');

      expect(communities[0].memberCount).toBe(20);
      expect(communities[1].memberCount).toBe(10);
    });
  });

  describe('calculateSearchFacets', () => {
    beforeEach(() => {
      prismaService.community.count
        .mockResolvedValueOnce(5)  // 1-10 range
        .mockResolvedValueOnce(3)  // 11-50 range
        .mockResolvedValueOnce(2)  // 51-100 range
        .mockResolvedValueOnce(1)  // 101-500 range
        .mockResolvedValueOnce(0); // 500+ range
    });

    it('should calculate member range facets', async () => {
      const calculateSearchFacets = (service as any).calculateSearchFacets.bind(service);
      
      const result = await calculateSearchFacets({});

      expect(result).toEqual({
        memberRanges: [
          { range: '1-10', count: 5 },
          { range: '11-50', count: 3 },
          { range: '51-100', count: 2 },
          { range: '101-500', count: 1 },
          { range: '500+', count: 0 },
        ],
        commonTags: [],
      });
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.count.mockRejectedValue(new Error('Database error'));

      const calculateSearchFacets = (service as any).calculateSearchFacets.bind(service);
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      
      const result = await calculateSearchFacets({});

      expect(result).toEqual({
        memberRanges: [],
        commonTags: [],
      });

      expect(errorSpy).toHaveBeenCalledWith(
        'Error calculating search facets:',
        expect.any(Error)
      );
    });
  });

  describe('getTopContributors', () => {
    beforeEach(() => {
      const mockCommunityForContributors = {
        id: 'community-123',
        roomGroups: [
          { rooms: [{ id: 'room-1' }, { id: 'room-2' }] },
        ],
      };
      
      prismaService.community.findUnique.mockResolvedValue(mockCommunityForContributors);
      prismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          firstName: 'Top',
          lastName: 'Contributor',
          avatarUrl: 'top.jpg',
          _count: { posts: 10, comments: 20 },
        },
        {
          id: 'user-2',
          firstName: 'Second',
          lastName: 'Contributor',
          avatarUrl: 'second.jpg',
          _count: { posts: 5, comments: 15 },
        },
      ]);
    });

    it('should get top contributors for community', async () => {
      const getTopContributors = (service as any).getTopContributors.bind(service);
      
      const result = await getTopContributors('community-123', 5);

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-123' },
        include: {
          roomGroups: {
            include: {
              rooms: { select: { id: true } },
            },
          },
        },
      });

      expect(result).toEqual([
        {
          id: 'user-1',
          firstName: 'Top',
          lastName: 'Contributor',
          avatarUrl: 'top.jpg',
          contributionScore: 50, // 10 * 3 + 20 * 1
          postCount: 10,
          commentCount: 20,
        },
        {
          id: 'user-2',
          firstName: 'Second',
          lastName: 'Contributor',
          avatarUrl: 'second.jpg',
          contributionScore: 30, // 5 * 3 + 15 * 1
          postCount: 5,
          commentCount: 15,
        },
      ]);
    });

    it('should return empty array for non-existent community', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      const getTopContributors = (service as any).getTopContributors.bind(service);
      
      const result = await getTopContributors('non-existent', 5);

      expect(result).toEqual([]);
    });

    it('should filter out contributors with zero contributions', async () => {
      prismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-active',
          firstName: 'Active',
          lastName: 'User',
          avatarUrl: 'active.jpg',
          _count: { posts: 5, comments: 10 },
        },
        {
          id: 'user-inactive',
          firstName: 'Inactive',
          lastName: 'User',
          avatarUrl: 'inactive.jpg',
          _count: { posts: 0, comments: 0 },
        },
      ]);

      const getTopContributors = (service as any).getTopContributors.bind(service);
      
      const result = await getTopContributors('community-123', 5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-active');
    });

    it('should handle errors gracefully', async () => {
      prismaService.community.findUnique.mockRejectedValue(new Error('Database error'));

      const getTopContributors = (service as any).getTopContributors.bind(service);
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      
      const result = await getTopContributors('community-123', 5);

      expect(result).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error getting top contributors for community community-123'),
        expect.any(Error)
      );
    });

    it('should limit results to specified limit', async () => {
      const getTopContributors = (service as any).getTopContributors.bind(service);
      
      const result = await getTopContributors('community-123', 1);

      expect(result).toHaveLength(1);
    });

    it('should handle missing avatarUrl', async () => {
      prismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-no-avatar',
          firstName: 'No',
          lastName: 'Avatar',
          avatarUrl: null,
          _count: { posts: 5, comments: 10 },
        },
      ]);

      const getTopContributors = (service as any).getTopContributors.bind(service);
      
      const result = await getTopContributors('community-123', 5);

      expect(result[0].avatarUrl).toBeUndefined();
    });
  });

  describe('edge cases and performance', () => {
    it('should handle very large search results efficiently', async () => {
      const largeCommunityList = Array.from({ length: 1000 }, (_, i) => ({
        id: `community-${i}`,
        name: `Community ${i}`,
        slug: `community-${i}`,
        description: `Description ${i}`,
        imageUrl: `image-${i}.jpg`,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { memberships: i % 100 },
        memberships: [],
      }));

      prismaService.community.findMany.mockResolvedValue(largeCommunityList);
      prismaService.community.count.mockResolvedValue(1000);

      const startTime = Date.now();
      const result = await service.searchCommunities({}, 'user-123', 1, 20);
      const endTime = Date.now();

      expect(result.communities).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle missing data gracefully', async () => {
      const communityWithMissingData = {
        id: 'community-missing',
        name: null,
        slug: 'missing-data',
        description: '',
        imageUrl: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: { memberships: 0 },
        memberships: [],
      };

      prismaService.community.findMany.mockResolvedValue([communityWithMissingData]);
      prismaService.community.count.mockResolvedValue(1);

      const result = await service.searchCommunities({}, 'user-123', 1, 10);

      expect(result.communities).toHaveLength(1);
      expect(result.communities[0].name).toBeNull();
      expect(result.communities[0].imageUrl).toBeNull();
    });

    it('should handle concurrent requests', async () => {
      prismaService.community.findMany.mockResolvedValue(mockCommunities);
      prismaService.community.count.mockResolvedValue(3);

      const promises = [
        service.searchCommunities({}, 'user-1'),
        service.searchCommunities({}, 'user-2'),
        service.searchCommunities({}, 'user-3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.communities).toBeInstanceOf(Array);
      });
    });

    it('should handle malformed filter objects', async () => {
      const malformedFilters = {
        query: null,
        minMembers: 'invalid',
        maxMembers: {},
        sortBy: [],
      } as any;

      prismaService.community.findMany.mockResolvedValue(mockCommunities);
      prismaService.community.count.mockResolvedValue(3);

      // Should not throw error
      const result = await service.searchCommunities(malformedFilters, 'user-123');

      expect(result).toBeDefined();
      expect(result.communities).toBeInstanceOf(Array);
    });
  });
});