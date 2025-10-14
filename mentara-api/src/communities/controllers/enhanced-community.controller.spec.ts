/**
 * Comprehensive Test Suite for EnhancedCommunityController
 * Tests advanced community search, discovery, and management features
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { EnhancedCommunityController } from './enhanced-community.controller';
import { EnhancedCommunityService } from '../services/enhanced-community.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/core/guards/role-based-access.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('EnhancedCommunityController', () => {
  let controller: EnhancedCommunityController;
  let enhancedCommunityService: EnhancedCommunityService;
  let module: TestingModule;

  // Mock EnhancedCommunityService
  const mockEnhancedCommunityService = {
    searchCommunities: jest.fn(),
    getCommunityDetails: jest.fn(),
    getTrendingCommunities: jest.fn(),
    getSimilarCommunities: jest.fn(),
    // Prisma mock for direct database access
    prisma: {
      membership: {
        findMany: jest.fn(),
      },
      community: {
        count: jest.fn(),
      },
    },
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockRoleBasedAccessGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    role: 'client',
  };

  const mockCommunity = {
    id: 'community_123456789',
    name: 'Anxiety Support Group',
    slug: 'anxiety-support-group',
    description: 'A supportive community for people dealing with anxiety',
    memberCount: 1234,
    isPrivate: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    recentActivity: {
      lastPostAt: '2024-02-14T09:30:00Z',
      postsThisWeek: 23,
      activeMembers: 456,
    },
    membershipStatus: 'none',
    compatibility: {
      score: 0.85,
      reasons: ['Interest in anxiety management', 'Similar community preferences'],
    },
  };

  const mockSearchResults = {
    communities: [mockCommunity],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
    facets: {
      tags: [
        { tag: 'anxiety', count: 15 },
        { tag: 'support', count: 23 },
        { tag: 'therapy', count: 8 },
      ],
      memberCountRanges: [
        { range: '0-100', count: 5 },
        { range: '100-500', count: 12 },
        { range: '500+', count: 8 },
      ],
    },
  };

  const mockCommunityDetails = {
    ...mockCommunity,
    stats: {
      totalPosts: 456,
      totalComments: 1234,
      activeMembers: 234,
      recentActivity: {
        postsToday: 5,
        postsThisWeek: 23,
        postsThisMonth: 89,
      },
    },
    recentPosts: [
      {
        id: 'post_123',
        title: 'Managing Work Anxiety',
        author: 'Anonymous',
        createdAt: '2024-02-14T08:30:00Z',
        likesCount: 15,
        commentsCount: 8,
      },
    ],
    topContributors: [
      {
        id: 'user_456',
        name: 'Sarah M.',
        postsCount: 45,
        helpfulVotes: 123,
      },
    ],
    moderators: [
      {
        id: 'mod_789',
        name: 'Dr. Johnson',
        role: 'moderator',
      },
    ],
    membershipStatus: 'none',
    userPermissions: {
      canPost: false,
      canComment: false,
      canModerate: false,
    },
  };

  const mockTrendingCommunities = [
    {
      ...mockCommunity,
      trendingData: {
        growthRate: 15.2,
        activityScore: 89.5,
        engagementRate: 72.3,
        retentionRate: 85.7,
      },
    },
  ];

  const mockSimilarCommunities = [
    {
      id: 'community_similar_1',
      name: 'Depression Support',
      description: 'Support for those dealing with depression',
      memberCount: 987,
      similarityScore: 0.78,
      commonTags: ['support', 'mental-health'],
    },
  ];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [EnhancedCommunityController],
      providers: [
        {
          provide: EnhancedCommunityService,
          useValue: mockEnhancedCommunityService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RoleBasedAccessGuard)
      .useValue(mockRoleBasedAccessGuard)
      .compile();

    controller = module.get<EnhancedCommunityController>(EnhancedCommunityController);
    enhancedCommunityService = module.get<EnhancedCommunityService>(EnhancedCommunityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have enhancedCommunityService injected', () => {
      expect(enhancedCommunityService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard and RoleBasedAccessGuard', () => {
      const guards = Reflect.getMetadata('__guards__', EnhancedCommunityController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RoleBasedAccessGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', EnhancedCommunityController);
      expect(controllerMetadata).toBe('communities/enhanced');
    });

    it('should allow multiple roles for all endpoints', () => {
      const allowedRoles = ['client', 'therapist', 'moderator', 'admin'];
      const methods = ['searchCommunities', 'getCommunityDetails', 'getTrendingCommunities', 'getSimilarCommunities'];
      
      methods.forEach(method => {
        const metadata = Reflect.getMetadata('roles', controller[method]);
        expect(metadata).toEqual(allowedRoles);
      });
    });
  });

  describe('GET /communities/enhanced/search', () => {
    const validSearchQuery = {
      query: 'anxiety',
      tags: ['support', 'therapy'],
      minMembers: 100,
      maxMembers: 2000,
      sortBy: 'relevance' as const,
      sortOrder: 'desc' as const,
      hasDescription: true,
      hasImage: false,
      membershipRequired: false,
      page: 1,
      limit: 20,
    };

    it('should search communities successfully', async () => {
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.searchCommunities(validSearchQuery, mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults);
      expect(result.message).toContain('successfully');
      expect(enhancedCommunityService.searchCommunities).toHaveBeenCalledWith(
        {
          query: validSearchQuery.query,
          tags: validSearchQuery.tags,
          minMembers: validSearchQuery.minMembers,
          maxMembers: validSearchQuery.maxMembers,
          sortBy: validSearchQuery.sortBy,
          sortOrder: validSearchQuery.sortOrder,
          hasDescription: validSearchQuery.hasDescription,
          hasImage: validSearchQuery.hasImage,
          membershipRequired: validSearchQuery.membershipRequired,
        },
        mockUser.id,
        validSearchQuery.page,
        validSearchQuery.limit
      );
    });

    it('should handle empty search query', async () => {
      const emptyQuery = { page: 1, limit: 20 };
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue({
        ...mockSearchResults,
        communities: [],
        total: 0,
      });

      const result = await controller.searchCommunities(emptyQuery, mockUser);

      expect(result.success).toBe(true);
      expect(result.data.communities).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Search service unavailable');
      mockEnhancedCommunityService.searchCommunities.mockRejectedValue(serviceError);

      await expect(
        controller.searchCommunities(validSearchQuery, mockUser)
      ).rejects.toThrow(serviceError);
    });

    it('should validate search facets', async () => {
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.searchCommunities(validSearchQuery, mockUser);

      expect(result.data.facets).toBeDefined();
      expect(result.data.facets.tags).toBeDefined();
      expect(Array.isArray(result.data.facets.tags)).toBe(true);
      expect(result.data.facets.memberCountRanges).toBeDefined();
      expect(Array.isArray(result.data.facets.memberCountRanges)).toBe(true);
    });

    it('should handle different sorting options', async () => {
      const sortByMembers = { ...validSearchQuery, sortBy: 'members' as const };
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.searchCommunities(sortByMembers, mockUser);

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.searchCommunities).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'members' }),
        mockUser.id,
        1,
        20
      );
    });
  });

  describe('GET /communities/enhanced/:communityId/details', () => {
    it('should get community details successfully', async () => {
      mockEnhancedCommunityService.getCommunityDetails.mockResolvedValue(mockCommunityDetails);

      const result = await controller.getCommunityDetails('community_123456789', mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCommunityDetails);
      expect(result.message).toContain('successfully');
      expect(enhancedCommunityService.getCommunityDetails).toHaveBeenCalledWith(
        'community_123456789',
        mockUser.id
      );
    });

    it('should handle non-existent community', async () => {
      const notFoundError = new Error('Community not found');
      mockEnhancedCommunityService.getCommunityDetails.mockRejectedValue(notFoundError);

      await expect(
        controller.getCommunityDetails('nonexistent_community', mockUser)
      ).rejects.toThrow(notFoundError);
    });

    it('should validate community details structure', async () => {
      mockEnhancedCommunityService.getCommunityDetails.mockResolvedValue(mockCommunityDetails);

      const result = await controller.getCommunityDetails('community_123456789', mockUser);

      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('recentPosts');
      expect(result.data).toHaveProperty('topContributors');
      expect(result.data).toHaveProperty('moderators');
      expect(result.data).toHaveProperty('membershipStatus');
      expect(result.data).toHaveProperty('userPermissions');

      expect(Array.isArray(result.data.recentPosts)).toBe(true);
      expect(Array.isArray(result.data.topContributors)).toBe(true);
      expect(Array.isArray(result.data.moderators)).toBe(true);
    });
  });

  describe('GET /communities/enhanced/trending', () => {
    it('should get trending communities successfully', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);

      const query = { limit: 10, timeframe: 'week' as const };
      const result = await controller.getTrendingCommunities(query);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrendingCommunities);
      expect(result.message).toContain('successfully');
      expect(enhancedCommunityService.getTrendingCommunities).toHaveBeenCalledWith(10, 'week');
    });

    it('should handle default parameters', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);

      const result = await controller.getTrendingCommunities({});

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.getTrendingCommunities).toHaveBeenCalledWith(10, 'week');
    });

    it('should handle different timeframes', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);

      const monthQuery = { limit: 15, timeframe: 'month' as const };
      const result = await controller.getTrendingCommunities(monthQuery);

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.getTrendingCommunities).toHaveBeenCalledWith(15, 'month');
    });

    it('should validate trending data structure', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);

      const result = await controller.getTrendingCommunities({ limit: 5 });

      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(community => {
        expect(community).toHaveProperty('id');
        expect(community).toHaveProperty('name');
        expect(community).toHaveProperty('memberCount');
        expect(community).toHaveProperty('trendingData');
        expect(community.trendingData).toHaveProperty('growthRate');
        expect(community.trendingData).toHaveProperty('activityScore');
        expect(community.trendingData).toHaveProperty('engagementRate');
        expect(typeof community.trendingData.growthRate).toBe('number');
      });
    });
  });

  describe('GET /communities/enhanced/:communityId/similar', () => {
    it('should get similar communities successfully', async () => {
      mockEnhancedCommunityService.getSimilarCommunities.mockResolvedValue(mockSimilarCommunities);

      const query = { excludeJoined: true, maxResults: 5 };
      const result = await controller.getSimilarCommunities('community_123456789', query, mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSimilarCommunities);
      expect(result.message).toContain('successfully');
      expect(enhancedCommunityService.getSimilarCommunities).toHaveBeenCalledWith(
        'community_123456789',
        {
          userId: mockUser.id,
          excludeJoined: true,
          maxResults: 5,
        }
      );
    });

    it('should handle default parameters', async () => {
      mockEnhancedCommunityService.getSimilarCommunities.mockResolvedValue(mockSimilarCommunities);

      const result = await controller.getSimilarCommunities('community_123456789', {}, mockUser);

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.getSimilarCommunities).toHaveBeenCalledWith(
        'community_123456789',
        {
          userId: mockUser.id,
          excludeJoined: true,
          maxResults: 5,
        }
      );
    });

    it('should validate similar communities structure', async () => {
      mockEnhancedCommunityService.getSimilarCommunities.mockResolvedValue(mockSimilarCommunities);

      const result = await controller.getSimilarCommunities('community_123456789', {}, mockUser);

      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(community => {
        expect(community).toHaveProperty('id');
        expect(community).toHaveProperty('name');
        expect(community).toHaveProperty('memberCount');
        expect(community).toHaveProperty('similarityScore');
        expect(typeof community.similarityScore).toBe('number');
        expect(community.similarityScore).toBeGreaterThanOrEqual(0);
        expect(community.similarityScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('GET /communities/enhanced/discover', () => {
    it('should discover communities successfully', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);
      mockEnhancedCommunityService.prisma.membership.findMany.mockResolvedValue([]);

      const result = await controller.discoverCommunities(mockUser, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrendingCommunities);
      expect(result.message).toContain('successfully');
    });

    it('should filter out user joined communities', async () => {
      const userMemberships = [{ communityId: mockCommunity.id }];
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);
      mockEnhancedCommunityService.prisma.membership.findMany.mockResolvedValue(userMemberships);

      const result = await controller.discoverCommunities(mockUser, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]); // Should be filtered out
    });

    it('should handle default limit', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);
      mockEnhancedCommunityService.prisma.membership.findMany.mockResolvedValue([]);

      const result = await controller.discoverCommunities(mockUser);

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.getTrendingCommunities).toHaveBeenCalledWith(10, 'week');
    });
  });

  describe('GET /communities/enhanced/categories', () => {
    it('should get community categories successfully', async () => {
      mockEnhancedCommunityService.prisma.community.count.mockResolvedValue(5);

      const result = await controller.getCommunityCategories();

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should validate categories structure', async () => {
      mockEnhancedCommunityService.prisma.community.count.mockResolvedValue(3);

      const result = await controller.getCommunityCategories();

      result.data.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('communityCount');
        expect(typeof category.communityCount).toBe('number');
      });
    });

    it('should include predefined categories', async () => {
      mockEnhancedCommunityService.prisma.community.count.mockResolvedValue(2);

      const result = await controller.getCommunityCategories();

      const categoryIds = result.data.map(cat => cat.id);
      expect(categoryIds).toContain('depression');
      expect(categoryIds).toContain('anxiety');
      expect(categoryIds).toContain('trauma');
      expect(categoryIds).toContain('general');
      expect(categoryIds).toContain('wellness');
    });
  });

  describe('GET /communities/enhanced/popular', () => {
    it('should get popular communities successfully', async () => {
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.getPopularCommunities(mockUser, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults.communities);
      expect(result.message).toContain('successfully');
      expect(enhancedCommunityService.searchCommunities).toHaveBeenCalledWith(
        {
          sortBy: 'members',
          sortOrder: 'desc',
        },
        mockUser.id,
        1,
        10
      );
    });

    it('should handle default limit', async () => {
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.getPopularCommunities(mockUser);

      expect(result.success).toBe(true);
      expect(enhancedCommunityService.searchCommunities).toHaveBeenCalledWith(
        expect.any(Object),
        mockUser.id,
        1,
        10
      );
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted search response', async () => {
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);

      const result = await controller.searchCommunities({ query: 'test' }, mockUser);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('communities');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('facets');
      expect(Array.isArray(result.data.communities)).toBe(true);
    });

    it('should return properly formatted community details', async () => {
      mockEnhancedCommunityService.getCommunityDetails.mockResolvedValue(mockCommunityDetails);

      const result = await controller.getCommunityDetails('community_123', mockUser);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result.data).toHaveProperty('stats');
      expect(result.data).toHaveProperty('recentPosts');
      expect(result.data).toHaveProperty('userPermissions');
    });

    it('should return properly formatted trending communities', async () => {
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);

      const result = await controller.getTrendingCommunities({});

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach(community => {
        expect(community).toHaveProperty('trendingData');
        expect(typeof community.trendingData.growthRate).toBe('number');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Enhanced community service unavailable');
      mockEnhancedCommunityService.searchCommunities.mockRejectedValue(serviceError);

      await expect(
        controller.searchCommunities({ query: 'test' }, mockUser)
      ).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockEnhancedCommunityService.getCommunityDetails.mockRejectedValue(dbError);

      await expect(
        controller.getCommunityDetails('community_123', mockUser)
      ).rejects.toThrow(dbError);
    });

    it('should handle invalid community IDs', async () => {
      const invalidIdError = new Error('Invalid community ID format');
      mockEnhancedCommunityService.getCommunityDetails.mockRejectedValue(invalidIdError);

      await expect(
        controller.getCommunityDetails('invalid-id', mockUser)
      ).rejects.toThrow(invalidIdError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete community discovery workflow', async () => {
      // Search communities
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);
      const searchResult = await controller.searchCommunities({ query: 'anxiety' }, mockUser);
      expect(searchResult.data.communities).toHaveLength(1);

      // Get community details
      mockEnhancedCommunityService.getCommunityDetails.mockResolvedValue(mockCommunityDetails);
      const detailsResult = await controller.getCommunityDetails(searchResult.data.communities[0].id, mockUser);
      expect(detailsResult.data.id).toBe(searchResult.data.communities[0].id);

      // Get similar communities
      mockEnhancedCommunityService.getSimilarCommunities.mockResolvedValue(mockSimilarCommunities);
      const similarResult = await controller.getSimilarCommunities(searchResult.data.communities[0].id, {}, mockUser);
      expect(Array.isArray(similarResult.data)).toBe(true);

      // Get trending communities
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);
      const trendingResult = await controller.getTrendingCommunities({});
      expect(Array.isArray(trendingResult.data)).toBe(true);
    });

    it('should validate role-based access across all endpoints', async () => {
      // Mock successful responses
      mockEnhancedCommunityService.searchCommunities.mockResolvedValue(mockSearchResults);
      mockEnhancedCommunityService.getCommunityDetails.mockResolvedValue(mockCommunityDetails);
      mockEnhancedCommunityService.getTrendingCommunities.mockResolvedValue(mockTrendingCommunities);
      mockEnhancedCommunityService.getSimilarCommunities.mockResolvedValue(mockSimilarCommunities);
      mockEnhancedCommunityService.prisma.membership.findMany.mockResolvedValue([]);
      mockEnhancedCommunityService.prisma.community.count.mockResolvedValue(5);

      // All endpoints should be accessible for all allowed roles
      const endpoints = [
        () => controller.searchCommunities({}, mockUser),
        () => controller.getCommunityDetails('community_123', mockUser),
        () => controller.getTrendingCommunities({}),
        () => controller.getSimilarCommunities('community_123', {}, mockUser),
        () => controller.discoverCommunities(mockUser),
        () => controller.getCommunityCategories(),
        () => controller.getPopularCommunities(mockUser),
      ];

      for (const endpoint of endpoints) {
        await expect(endpoint()).resolves.toBeDefined();
      }
    });
  });
});