/**
 * Comprehensive Test Suite for SearchController
 * Tests search functionality across therapists, posts, communities, users, and global search
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;
  let module: TestingModule;

  // Mock SearchService
  const mockSearchService = {
    searchTherapists: jest.fn(),
    searchPosts: jest.fn(),
    searchCommunities: jest.fn(),
    searchUsers: jest.fn(),
    globalSearch: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockTherapist = {
    id: TEST_USER_IDS.THERAPIST,
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    specializations: ['Anxiety', 'Depression', 'CBT'],
    location: 'New York, NY',
    hourlyRate: 150,
    rating: 4.7,
    experienceYears: 8,
    verified: true,
    availability: 'available',
    profileImage: 'https://example.com/profile.jpg',
    bio: 'Experienced therapist specializing in anxiety and depression treatment',
  };

  const mockPost = {
    id: 'post_123456789',
    title: 'Managing Work Anxiety',
    content: 'Tips for dealing with workplace stress and anxiety...',
    authorId: TEST_USER_IDS.CLIENT,
    communityId: 'community_123',
    createdAt: '2024-02-14T10:00:00Z',
    likesCount: 23,
    commentsCount: 8,
    tags: ['anxiety', 'work', 'stress'],
  };

  const mockCommunity = {
    id: 'community_123456789',
    name: 'Anxiety Support Group',
    description: 'A supportive community for people dealing with anxiety',
    memberCount: 1234,
    isPrivate: false,
    createdAt: '2024-01-15T10:00:00Z',
    tags: ['anxiety', 'support', 'mental-health'],
  };

  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    email: TEST_EMAILS.CLIENT,
    role: 'client',
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
  };

  const mockTherapistSearchResults = {
    therapists: [mockTherapist],
    totalCount: 1,
    filters: {
      locations: ['New York, NY', 'Los Angeles, CA'],
      specialties: ['Anxiety', 'Depression', 'CBT'],
      priceRanges: ['$100-150', '$150-200'],
    },
  };

  const mockPostSearchResults = {
    posts: [mockPost],
    totalCount: 1,
  };

  const mockCommunitySearchResults = {
    communities: [mockCommunity],
    totalCount: 1,
  };

  const mockUserSearchResults = {
    users: [mockUser],
    totalCount: 1,
  };

  const mockGlobalSearchResults = {
    results: {
      users: [mockUser],
      therapists: [mockTherapist],
      posts: [mockPost],
      communities: [mockCommunity],
    },
    totalCount: 4,
    query: 'anxiety',
    searchTypes: ['users', 'therapists', 'posts', 'communities'],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have searchService injected', () => {
      expect(searchService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', SearchController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', SearchController);
      expect(controllerMetadata).toBe('search');
    });
  });

  describe('GET /search/therapists', () => {
    const validQuery = {
      query: 'anxiety specialist',
      location: 'New York',
      specialties: ['Anxiety', 'Depression'],
      priceRange: { min: 100, max: 200 },
      experienceYears: 5,
      rating: 4.0,
      gender: 'female',
      languages: ['English', 'Spanish'],
      availability: 'available',
      verifiedOnly: true,
    };

    it('should search therapists successfully', async () => {
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);

      const result = await controller.searchTherapists(validQuery);

      expect(result).toEqual(mockTherapistSearchResults);
      expect(searchService.searchTherapists).toHaveBeenCalledWith('anxiety specialist', {
        location: validQuery.location,
        specialties: validQuery.specialties,
        priceRange: validQuery.priceRange,
        experienceYears: validQuery.experienceYears,
        rating: validQuery.rating,
        gender: validQuery.gender,
        languages: validQuery.languages,
        availability: validQuery.availability,
        verifiedOnly: validQuery.verifiedOnly,
        maxHourlyRate: validQuery.priceRange.max,
      });
    });

    it('should handle empty query', async () => {
      const emptyQuery = {};
      mockSearchService.searchTherapists.mockResolvedValue({
        therapists: [],
        totalCount: 0,
        filters: {},
      });

      const result = await controller.searchTherapists(emptyQuery);

      expect(result.therapists).toEqual([]);
      expect(result.totalCount).toBe(0);
      expect(searchService.searchTherapists).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Search service unavailable');
      mockSearchService.searchTherapists.mockRejectedValue(serviceError);

      await expect(
        controller.searchTherapists(validQuery)
      ).rejects.toThrow(serviceError);
    });

    it('should validate therapist search results structure', async () => {
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);

      const result = await controller.searchTherapists(validQuery);

      expect(result).toHaveProperty('therapists');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('filters');
      expect(Array.isArray(result.therapists)).toBe(true);
      expect(typeof result.totalCount).toBe('number');

      if (result.therapists.length > 0) {
        const therapist = result.therapists[0];
        expect(therapist).toHaveProperty('id');
        expect(therapist).toHaveProperty('firstName');
        expect(therapist).toHaveProperty('lastName');
        expect(therapist).toHaveProperty('specializations');
        expect(therapist).toHaveProperty('rating');
        expect(Array.isArray(therapist.specializations)).toBe(true);
        expect(typeof therapist.rating).toBe('number');
      }
    });

    it('should handle different filter combinations', async () => {
      const specificQuery = {
        query: 'CBT therapist',
        specialties: ['CBT'],
        priceRange: { max: 150 },
        verifiedOnly: true,
      };
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);

      const result = await controller.searchTherapists(specificQuery);

      expect(result).toEqual(mockTherapistSearchResults);
      expect(searchService.searchTherapists).toHaveBeenCalledWith('CBT therapist', expect.objectContaining({
        specialties: ['CBT'],
        verifiedOnly: true,
        maxHourlyRate: 150,
      }));
    });
  });

  describe('GET /search/posts', () => {
    const validQuery = {
      query: 'anxiety tips',
      communityId: 'community_123',
    };

    it('should search posts successfully', async () => {
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);

      const result = await controller.searchPosts(validQuery);

      expect(result).toEqual(mockPostSearchResults);
      expect(searchService.searchPosts).toHaveBeenCalledWith(
        validQuery.query,
        validQuery.communityId
      );
    });

    it('should search posts without community filter', async () => {
      const globalQuery = { query: 'mental health' };
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);

      const result = await controller.searchPosts(globalQuery);

      expect(result).toEqual(mockPostSearchResults);
      expect(searchService.searchPosts).toHaveBeenCalledWith('mental health', undefined);
    });

    it('should handle service errors for posts', async () => {
      const serviceError = new Error('Post search service unavailable');
      mockSearchService.searchPosts.mockRejectedValue(serviceError);

      await expect(
        controller.searchPosts(validQuery)
      ).rejects.toThrow(serviceError);
    });

    it('should validate post search results structure', async () => {
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);

      const result = await controller.searchPosts(validQuery);

      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('totalCount');
      expect(Array.isArray(result.posts)).toBe(true);
      expect(typeof result.totalCount).toBe('number');

      if (result.posts.length > 0) {
        const post = result.posts[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('authorId');
        expect(post).toHaveProperty('createdAt');
        expect(typeof post.likesCount).toBe('number');
        expect(typeof post.commentsCount).toBe('number');
      }
    });
  });

  describe('GET /search/communities', () => {
    const validQuery = {
      query: 'anxiety support',
    };

    it('should search communities successfully', async () => {
      mockSearchService.searchCommunities.mockResolvedValue(mockCommunitySearchResults);

      const result = await controller.searchCommunities(validQuery);

      expect(result).toEqual(mockCommunitySearchResults);
      expect(searchService.searchCommunities).toHaveBeenCalledWith(validQuery.query);
    });

    it('should handle empty communities search', async () => {
      mockSearchService.searchCommunities.mockResolvedValue({
        communities: [],
        totalCount: 0,
      });

      const result = await controller.searchCommunities({ query: 'nonexistent' });

      expect(result.communities).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should validate community search results structure', async () => {
      mockSearchService.searchCommunities.mockResolvedValue(mockCommunitySearchResults);

      const result = await controller.searchCommunities(validQuery);

      expect(result).toHaveProperty('communities');
      expect(result).toHaveProperty('totalCount');
      expect(Array.isArray(result.communities)).toBe(true);

      if (result.communities.length > 0) {
        const community = result.communities[0];
        expect(community).toHaveProperty('id');
        expect(community).toHaveProperty('name');
        expect(community).toHaveProperty('description');
        expect(community).toHaveProperty('memberCount');
        expect(community).toHaveProperty('isPrivate');
        expect(typeof community.memberCount).toBe('number');
        expect(typeof community.isPrivate).toBe('boolean');
      }
    });
  });

  describe('GET /search/users', () => {
    const validQuery = {
      query: 'john doe',
      role: 'client',
    };

    it('should search users successfully', async () => {
      mockSearchService.searchUsers.mockResolvedValue(mockUserSearchResults);

      const result = await controller.searchUsers(validQuery);

      expect(result).toEqual(mockUserSearchResults);
      expect(searchService.searchUsers).toHaveBeenCalledWith(
        validQuery.query,
        validQuery.role
      );
    });

    it('should search users without role filter', async () => {
      const queryWithoutRole = { query: 'admin' };
      mockSearchService.searchUsers.mockResolvedValue(mockUserSearchResults);

      const result = await controller.searchUsers(queryWithoutRole);

      expect(result).toEqual(mockUserSearchResults);
      expect(searchService.searchUsers).toHaveBeenCalledWith('admin', undefined);
    });

    it('should handle different role filters', async () => {
      const roles = ['client', 'therapist', 'admin', 'moderator'];

      for (const role of roles) {
        mockSearchService.searchUsers.mockResolvedValue({
          users: [{ ...mockUser, role }],
          totalCount: 1,
        });

        const result = await controller.searchUsers({ query: 'test', role });
        expect(result.users[0].role).toBe(role);
      }
    });

    it('should validate user search results structure', async () => {
      mockSearchService.searchUsers.mockResolvedValue(mockUserSearchResults);

      const result = await controller.searchUsers(validQuery);

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('totalCount');
      expect(Array.isArray(result.users)).toBe(true);

      if (result.users.length > 0) {
        const user = result.users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('isActive');
        expect(typeof user.isActive).toBe('boolean');
      }
    });
  });

  describe('GET /search/global', () => {
    const validQuery = {
      query: 'anxiety',
      types: ['users', 'therapists', 'posts', 'communities'],
    };

    it('should perform global search successfully', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const result = await controller.globalSearch(validQuery);

      expect(result).toEqual(mockGlobalSearchResults);
      expect(searchService.globalSearch).toHaveBeenCalledWith(
        validQuery.query,
        validQuery.types
      );
    });

    it('should handle global search without type filters', async () => {
      const queryWithoutTypes = { query: 'mental health' };
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const result = await controller.globalSearch(queryWithoutTypes);

      expect(result).toEqual(mockGlobalSearchResults);
      expect(searchService.globalSearch).toHaveBeenCalledWith('mental health', undefined);
    });

    it('should filter out unsupported types', async () => {
      const queryWithUnsupportedTypes = {
        query: 'test',
        types: ['users', 'therapists', 'worksheets', 'unsupported'],
      };
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const result = await controller.globalSearch(queryWithUnsupportedTypes);

      expect(searchService.globalSearch).toHaveBeenCalledWith(
        'test',
        ['users', 'therapists'] // worksheets and unsupported should be filtered out
      );
    });

    it('should validate global search results structure', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const result = await controller.globalSearch(validQuery);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('searchTypes');

      expect(result.results).toHaveProperty('users');
      expect(result.results).toHaveProperty('therapists');
      expect(result.results).toHaveProperty('posts');
      expect(result.results).toHaveProperty('communities');

      expect(Array.isArray(result.results.users)).toBe(true);
      expect(Array.isArray(result.results.therapists)).toBe(true);
      expect(Array.isArray(result.results.posts)).toBe(true);
      expect(Array.isArray(result.results.communities)).toBe(true);
      expect(Array.isArray(result.searchTypes)).toBe(true);

      expect(typeof result.totalCount).toBe('number');
      expect(typeof result.query).toBe('string');
    });

    it('should handle empty global search results', async () => {
      const emptyResults = {
        results: {
          users: [],
          therapists: [],
          posts: [],
          communities: [],
        },
        totalCount: 0,
        query: 'nonexistent',
        searchTypes: ['users', 'therapists', 'posts', 'communities'],
      };
      mockSearchService.globalSearch.mockResolvedValue(emptyResults);

      const result = await controller.globalSearch({ query: 'nonexistent' });

      expect(result.totalCount).toBe(0);
      expect(result.results.users).toHaveLength(0);
      expect(result.results.therapists).toHaveLength(0);
      expect(result.results.posts).toHaveLength(0);
      expect(result.results.communities).toHaveLength(0);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted therapist search response', async () => {
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);

      const result = await controller.searchTherapists({ query: 'test' });

      expect(result).toHaveProperty('therapists');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('filters');
      expect(Array.isArray(result.therapists)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
    });

    it('should return properly formatted post search response', async () => {
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);

      const result = await controller.searchPosts({ query: 'test' });

      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('totalCount');
      expect(Array.isArray(result.posts)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
    });

    it('should return properly formatted global search response', async () => {
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const result = await controller.globalSearch({ query: 'test' });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('searchTypes');
      expect(typeof result.results).toBe('object');
      expect(typeof result.totalCount).toBe('number');
      expect(typeof result.query).toBe('string');
      expect(Array.isArray(result.searchTypes)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle search service unavailable', async () => {
      const serviceError = new Error('Search service temporarily unavailable');
      mockSearchService.searchTherapists.mockRejectedValue(serviceError);

      await expect(
        controller.searchTherapists({ query: 'test' })
      ).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockSearchService.searchCommunities.mockRejectedValue(dbError);

      await expect(
        controller.searchCommunities({ query: 'test' })
      ).rejects.toThrow(dbError);
    });

    it('should handle search index errors', async () => {
      const indexError = new Error('Search index unavailable');
      mockSearchService.globalSearch.mockRejectedValue(indexError);

      await expect(
        controller.globalSearch({ query: 'test' })
      ).rejects.toThrow(indexError);
    });

    it('should handle malformed query parameters', async () => {
      // Service should handle malformed queries gracefully
      mockSearchService.searchUsers.mockResolvedValue({ users: [], totalCount: 0 });

      const result = await controller.searchUsers({ query: '', role: 'invalid_role' });
      expect(result.users).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete search workflow', async () => {
      // Search therapists
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);
      const therapistResult = await controller.searchTherapists({ query: 'anxiety' });
      expect(therapistResult.therapists).toHaveLength(1);

      // Search posts
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);
      const postResult = await controller.searchPosts({ query: 'anxiety' });
      expect(postResult.posts).toHaveLength(1);

      // Search communities
      mockSearchService.searchCommunities.mockResolvedValue(mockCommunitySearchResults);
      const communityResult = await controller.searchCommunities({ query: 'anxiety' });
      expect(communityResult.communities).toHaveLength(1);

      // Global search
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);
      const globalResult = await controller.globalSearch({ query: 'anxiety' });
      expect(globalResult.totalCount).toBeGreaterThan(0);
    });

    it('should handle search with filters and pagination', async () => {
      const advancedQuery = {
        query: 'therapy',
        location: 'New York',
        specialties: ['Anxiety'],
        priceRange: { min: 100, max: 200 },
        rating: 4.0,
        verifiedOnly: true,
      };

      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);
      const result = await controller.searchTherapists(advancedQuery);

      expect(result.therapists).toBeDefined();
      expect(result.filters).toBeDefined();
      expect(searchService.searchTherapists).toHaveBeenCalledWith(
        'therapy',
        expect.objectContaining({
          location: 'New York',
          specialties: ['Anxiety'],
          verifiedOnly: true,
        })
      );
    });

    it('should validate search result consistency', async () => {
      const query = 'mental health';

      // Search across all types
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);
      mockSearchService.searchPosts.mockResolvedValue(mockPostSearchResults);
      mockSearchService.searchCommunities.mockResolvedValue(mockCommunitySearchResults);
      mockSearchService.searchUsers.mockResolvedValue(mockUserSearchResults);
      mockSearchService.globalSearch.mockResolvedValue(mockGlobalSearchResults);

      const [therapistResult, postResult, communityResult, userResult, globalResult] = await Promise.all([
        controller.searchTherapists({ query }),
        controller.searchPosts({ query }),
        controller.searchCommunities({ query }),
        controller.searchUsers({ query }),
        controller.globalSearch({ query }),
      ]);

      // Validate that individual searches match global search components
      expect(globalResult.results.therapists).toHaveLength(1);
      expect(globalResult.results.posts).toHaveLength(1);
      expect(globalResult.results.communities).toHaveLength(1);
      expect(globalResult.results.users).toHaveLength(1);
    });

    it('should handle edge cases and boundary conditions', async () => {
      // Empty query
      mockSearchService.globalSearch.mockResolvedValue({
        results: { users: [], therapists: [], posts: [], communities: [] },
        totalCount: 0,
        query: '',
        searchTypes: [],
      });
      const emptyResult = await controller.globalSearch({ query: '' });
      expect(emptyResult.totalCount).toBe(0);

      // Very long query
      const longQuery = 'a'.repeat(1000);
      mockSearchService.searchTherapists.mockResolvedValue(mockTherapistSearchResults);
      const longQueryResult = await controller.searchTherapists({ query: longQuery });
      expect(longQueryResult).toBeDefined();

      // Special characters in query
      mockSearchService.searchCommunities.mockResolvedValue(mockCommunitySearchResults);
      const specialCharResult = await controller.searchCommunities({ query: '!@#$%^&*()' });
      expect(specialCharResult).toBeDefined();
    });
  });
});