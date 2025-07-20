/**
 * Comprehensive Test Suite for CommunityRecommendationController
 * Tests community recommendation functionality with role-based access control
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { CommunityRecommendationController } from './community-recommendation.controller';
import { CommunityRecommendationService } from '../services/community-recommendation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('CommunityRecommendationController', () => {
  let controller: CommunityRecommendationController;
  let communityRecommendationService: CommunityRecommendationService;
  let module: TestingModule;

  // Mock CommunityRecommendationService
  const mockCommunityRecommendationService = {
    generateRecommendationsForUser: jest.fn(),
    getUserRecommendations: jest.fn(),
    getRecommendationById: jest.fn(),
    handleRecommendationInteraction: jest.fn(),
    getRecommendationStats: jest.fn(),
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
    slug: 'anxiety-support',
    description: 'A supportive community for those dealing with anxiety disorders',
    imageUrl: 'https://example.com/images/anxiety-community.jpg',
    memberCount: 1247,
    isPublic: true,
    moderatorId: TEST_USER_IDS.MODERATOR,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
  };

  const mockRecommendation = {
    id: 'recommendation_123456789',
    userId: TEST_USER_IDS.CLIENT,
    communityId: 'community_123456789',
    community: mockCommunity,
    score: 0.87,
    reasoning: 'Based on your anxiety assessment scores and preference for group support, this community would be highly beneficial for your mental health journey.',
    assessmentScores: {
      anxiety: 6.8,
      depression: 3.2,
      stress: 7.1,
      socialAnxiety: 5.9,
    },
    status: 'pending',
    createdAt: new Date('2024-02-14T10:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
    interactionDate: null,
  };

  const mockRecommendationsList = [
    mockRecommendation,
    {
      ...mockRecommendation,
      id: 'recommendation_987654321',
      communityId: 'community_987654321',
      community: {
        ...mockCommunity,
        id: 'community_987654321',
        name: 'Depression Recovery',
        slug: 'depression-recovery',
        description: 'Support for depression recovery and mental wellness',
        memberCount: 892,
      },
      score: 0.74,
      reasoning: 'Your depression scores indicate this community could provide valuable peer support.',
      assessmentScores: {
        anxiety: 4.1,
        depression: 7.3,
        stress: 5.8,
        socialAnxiety: 3.2,
      },
      status: 'joined',
      interactionDate: new Date('2024-02-10T14:30:00Z'),
    },
    {
      ...mockRecommendation,
      id: 'recommendation_456789123',
      communityId: 'community_456789123',
      community: {
        ...mockCommunity,
        id: 'community_456789123',
        name: 'Mindfulness & Meditation',
        slug: 'mindfulness-meditation',
        description: 'Practice mindfulness and meditation techniques together',
        memberCount: 2156,
      },
      score: 0.65,
      reasoning: 'Mindfulness practices can help with stress management based on your assessment.',
      status: 'dismissed',
      interactionDate: new Date('2024-02-08T09:15:00Z'),
    },
  ];

  const mockRecommendationStats = {
    totalRecommendations: 156,
    acceptedRecommendations: 89,
    rejectedRecommendations: 23,
    pendingRecommendations: 44,
    averageCompatibilityScore: 0.76,
    topCommunities: [
      {
        communityId: 'community_123456789',
        communityName: 'Anxiety Support Group',
        acceptanceRate: 0.83,
        totalRecommendations: 67,
      },
      {
        communityId: 'community_987654321',
        communityName: 'Depression Recovery',
        acceptanceRate: 0.78,
        totalRecommendations: 54,
      },
    ],
    weeklyTrends: {
      generated: 23,
      accepted: 18,
      rejected: 3,
      pending: 2,
    },
    categoryPerformance: {
      anxiety: { averageScore: 0.82, acceptanceRate: 0.85 },
      depression: { averageScore: 0.79, acceptanceRate: 0.81 },
      stress: { averageScore: 0.74, acceptanceRate: 0.76 },
      addiction: { averageScore: 0.71, acceptanceRate: 0.73 },
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [CommunityRecommendationController],
      providers: [
        {
          provide: CommunityRecommendationService,
          useValue: mockCommunityRecommendationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RoleBasedAccessGuard)
      .useValue(mockRoleBasedAccessGuard)
      .compile();

    controller = module.get<CommunityRecommendationController>(CommunityRecommendationController);
    communityRecommendationService = module.get<CommunityRecommendationService>(CommunityRecommendationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have communityRecommendationService injected', () => {
      expect(communityRecommendationService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard and RoleBasedAccessGuard', () => {
      const guards = Reflect.getMetadata('__guards__', CommunityRecommendationController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(RoleBasedAccessGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', CommunityRecommendationController);
      expect(controllerMetadata).toBe('communities/recommendations');
    });
  });

  describe('POST /communities/recommendations/generate', () => {
    const generateDto = { force: false };

    beforeEach(() => {
      mockCommunityRecommendationService.generateRecommendationsForUser.mockResolvedValue(undefined);
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);
    });

    it('should generate recommendations successfully', async () => {
      const result = await controller.generateRecommendations(mockUser, generateDto);

      expect(result).toEqual({
        success: true,
        data: mockRecommendationsList,
        message: `Generated ${mockRecommendationsList.length} recommendations`,
      });

      expect(communityRecommendationService.generateRecommendationsForUser).toHaveBeenCalledWith(
        mockUser.id,
        generateDto.force,
      );
      expect(communityRecommendationService.getUserRecommendations).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle forced regeneration', async () => {
      const forcedDto = { force: true };

      const result = await controller.generateRecommendations(mockUser, forcedDto);

      expect(result.success).toBe(true);
      expect(communityRecommendationService.generateRecommendationsForUser).toHaveBeenCalledWith(
        mockUser.id,
        true,
      );
    });

    it('should handle empty recommendations', async () => {
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue([]);

      const result = await controller.generateRecommendations(mockUser, generateDto);

      expect(result).toEqual({
        success: true,
        data: [],
        message: 'Generated 0 recommendations',
      });
    });

    it('should handle service errors during generation', async () => {
      const serviceError = new Error('Failed to generate recommendations');
      mockCommunityRecommendationService.generateRecommendationsForUser.mockRejectedValue(serviceError);

      await expect(
        controller.generateRecommendations(mockUser, generateDto)
      ).rejects.toThrow(serviceError);
    });

    it('should handle service errors during retrieval', async () => {
      const retrievalError = new Error('Failed to retrieve recommendations');
      mockCommunityRecommendationService.getUserRecommendations.mockRejectedValue(retrievalError);

      await expect(
        controller.generateRecommendations(mockUser, generateDto)
      ).rejects.toThrow(retrievalError);
    });
  });

  describe('GET /communities/recommendations/me', () => {
    beforeEach(() => {
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);
    });

    it('should get user recommendations successfully', async () => {
      const query = {};

      const result = await controller.getUserRecommendations(mockUser, query);

      expect(result).toEqual({
        success: true,
        data: mockRecommendationsList,
        message: 'Recommendations retrieved successfully',
      });
      expect(communityRecommendationService.getUserRecommendations).toHaveBeenCalledWith(mockUser.id);
    });

    it('should filter by status - pending', async () => {
      const query = { status: 'pending' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      const expectedFiltered = mockRecommendationsList.filter(rec => rec.status === 'pending');
      expect(result.data).toEqual(expectedFiltered);
    });

    it('should filter by status - accepted', async () => {
      const query = { status: 'accepted' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      const expectedFiltered = mockRecommendationsList.filter(rec => rec.status === 'joined');
      expect(result.data).toEqual(expectedFiltered);
    });

    it('should filter by status - rejected', async () => {
      const query = { status: 'rejected' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      const expectedFiltered = mockRecommendationsList.filter(rec => rec.status === 'dismissed');
      expect(result.data).toEqual(expectedFiltered);
    });

    it('should sort by compatibility score - descending', async () => {
      const query = { sortBy: 'compatibility' as const, sortOrder: 'desc' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      const sortedData = result.data as typeof mockRecommendationsList;
      expect(sortedData[0].score).toBeGreaterThanOrEqual(sortedData[1].score);
    });

    it('should sort by compatibility score - ascending', async () => {
      const query = { sortBy: 'compatibility' as const, sortOrder: 'asc' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      const sortedData = result.data as typeof mockRecommendationsList;
      expect(sortedData[0].score).toBeLessThanOrEqual(sortedData[sortedData.length - 1].score);
    });

    it('should sort by created date', async () => {
      const query = { sortBy: 'created' as const, sortOrder: 'desc' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should sort by updated date', async () => {
      const query = { sortBy: 'updated' as const, sortOrder: 'desc' as const };

      const result = await controller.getUserRecommendations(mockUser, query);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle combined filtering and sorting', async () => {
      const query = {
        status: 'pending' as const,
        sortBy: 'compatibility' as const,
        sortOrder: 'desc' as const,
      };

      const result = await controller.getUserRecommendations(mockUser, query);

      const resultData = result.data as typeof mockRecommendationsList;
      expect(resultData.every(rec => rec.status === 'pending')).toBe(true);
    });

    it('should handle empty recommendations', async () => {
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue([]);

      const result = await controller.getUserRecommendations(mockUser, {});

      expect(result.data).toEqual([]);
      expect(result.success).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve user recommendations');
      mockCommunityRecommendationService.getUserRecommendations.mockRejectedValue(serviceError);

      await expect(
        controller.getUserRecommendations(mockUser, {})
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /communities/recommendations/:recommendationId', () => {
    const recommendationId = 'recommendation_123456789';

    it('should get recommendation details successfully', async () => {
      mockCommunityRecommendationService.getRecommendationById.mockResolvedValue(mockRecommendation);

      const result = await controller.getRecommendationDetails(mockUser, recommendationId);

      expect(result).toEqual({
        success: true,
        data: mockRecommendation,
        message: 'Recommendation details retrieved successfully',
      });
      expect(communityRecommendationService.getRecommendationById).toHaveBeenCalledWith(recommendationId);
    });

    it('should handle recommendation not found', async () => {
      const notFoundError = new Error('Recommendation not found');
      mockCommunityRecommendationService.getRecommendationById.mockRejectedValue(notFoundError);

      await expect(
        controller.getRecommendationDetails(mockUser, 'non-existent-id')
      ).rejects.toThrow(notFoundError);
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';

      await expect(
        controller.getRecommendationDetails(mockUser, invalidId)
      ).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockCommunityRecommendationService.getRecommendationById.mockRejectedValue(serviceError);

      await expect(
        controller.getRecommendationDetails(mockUser, recommendationId)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('PUT /communities/recommendations/:recommendationId/interact', () => {
    const recommendationId = 'recommendation_123456789';

    it('should handle accept interaction successfully', async () => {
      const interactionDto = { action: 'accept' as const };
      mockCommunityRecommendationService.handleRecommendationInteraction.mockResolvedValue(undefined);

      const result = await controller.handleRecommendationInteraction(
        mockUser,
        recommendationId,
        interactionDto,
      );

      expect(result).toEqual({
        success: true,
        message: 'Recommendation accepted successfully',
      });
      expect(communityRecommendationService.handleRecommendationInteraction).toHaveBeenCalledWith({
        recommendationId,
        action: 'accept',
        userId: mockUser.id,
      });
    });

    it('should handle reject interaction successfully', async () => {
      const interactionDto = { action: 'reject' as const };
      mockCommunityRecommendationService.handleRecommendationInteraction.mockResolvedValue(undefined);

      const result = await controller.handleRecommendationInteraction(
        mockUser,
        recommendationId,
        interactionDto,
      );

      expect(result).toEqual({
        success: true,
        message: 'Recommendation rejected successfully',
      });
      expect(communityRecommendationService.handleRecommendationInteraction).toHaveBeenCalledWith({
        recommendationId,
        action: 'reject',
        userId: mockUser.id,
      });
    });

    it('should handle dismiss interaction successfully', async () => {
      const interactionDto = { action: 'dismiss' as const };
      mockCommunityRecommendationService.handleRecommendationInteraction.mockResolvedValue(undefined);

      const result = await controller.handleRecommendationInteraction(
        mockUser,
        recommendationId,
        interactionDto,
      );

      expect(result).toEqual({
        success: true,
        message: 'Recommendation dismissed successfully',
      });
    });

    it('should handle recommendation not found', async () => {
      const interactionDto = { action: 'accept' as const };
      const notFoundError = new Error('Recommendation not found');
      mockCommunityRecommendationService.handleRecommendationInteraction.mockRejectedValue(notFoundError);

      await expect(
        controller.handleRecommendationInteraction(mockUser, 'non-existent-id', interactionDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle already interacted recommendation', async () => {
      const interactionDto = { action: 'accept' as const };
      const alreadyInteractedError = new Error('Recommendation already interacted with');
      mockCommunityRecommendationService.handleRecommendationInteraction.mockRejectedValue(alreadyInteractedError);

      await expect(
        controller.handleRecommendationInteraction(mockUser, recommendationId, interactionDto)
      ).rejects.toThrow(alreadyInteractedError);
    });

    it('should handle service errors', async () => {
      const interactionDto = { action: 'accept' as const };
      const serviceError = new Error('Database update failed');
      mockCommunityRecommendationService.handleRecommendationInteraction.mockRejectedValue(serviceError);

      await expect(
        controller.handleRecommendationInteraction(mockUser, recommendationId, interactionDto)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /communities/recommendations/refresh', () => {
    beforeEach(() => {
      mockCommunityRecommendationService.generateRecommendationsForUser.mockResolvedValue(undefined);
    });

    it('should refresh recommendations successfully', async () => {
      const result = await controller.refreshRecommendations(mockUser);

      expect(result).toEqual({
        success: true,
        message: 'Recommendations refreshed successfully',
      });
      expect(communityRecommendationService.generateRecommendationsForUser).toHaveBeenCalledWith(
        mockUser.id,
        true, // force refresh
      );
    });

    it('should handle service errors during refresh', async () => {
      const serviceError = new Error('Failed to refresh recommendations');
      mockCommunityRecommendationService.generateRecommendationsForUser.mockRejectedValue(serviceError);

      await expect(
        controller.refreshRecommendations(mockUser)
      ).rejects.toThrow(serviceError);
    });

    it('should always force refresh', async () => {
      await controller.refreshRecommendations(mockUser);

      expect(communityRecommendationService.generateRecommendationsForUser).toHaveBeenCalledWith(
        mockUser.id,
        true, // should always be true for refresh
      );
    });
  });

  describe('GET /communities/recommendations/stats/me', () => {
    beforeEach(() => {
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(mockRecommendationStats);
    });

    it('should get user recommendation stats successfully', async () => {
      const result = await controller.getUserRecommendationStats(mockUser);

      expect(result).toEqual({
        success: true,
        data: mockRecommendationStats,
        message: 'User recommendation statistics retrieved successfully',
      });
      expect(communityRecommendationService.getRecommendationStats).toHaveBeenCalledWith();
    });

    it('should validate stats response structure', async () => {
      const result = await controller.getUserRecommendationStats(mockUser);

      expect(result.data).toHaveProperty('totalRecommendations');
      expect(result.data).toHaveProperty('acceptedRecommendations');
      expect(result.data).toHaveProperty('rejectedRecommendations');
      expect(result.data).toHaveProperty('pendingRecommendations');
      expect(result.data).toHaveProperty('averageCompatibilityScore');
      expect(result.data).toHaveProperty('topCommunities');
      expect(Array.isArray(result.data.topCommunities)).toBe(true);
    });

    it('should handle empty stats', async () => {
      const emptyStats = {
        totalRecommendations: 0,
        acceptedRecommendations: 0,
        rejectedRecommendations: 0,
        pendingRecommendations: 0,
        averageCompatibilityScore: 0,
        topCommunities: [],
        weeklyTrends: { generated: 0, accepted: 0, rejected: 0, pending: 0 },
        categoryPerformance: {},
      };
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(emptyStats);

      const result = await controller.getUserRecommendationStats(mockUser);

      expect(result.data.totalRecommendations).toBe(0);
      expect(result.data.topCommunities).toEqual([]);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve recommendation stats');
      mockCommunityRecommendationService.getRecommendationStats.mockRejectedValue(serviceError);

      await expect(
        controller.getUserRecommendationStats(mockUser)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /communities/recommendations/stats/global', () => {
    beforeEach(() => {
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(mockRecommendationStats);
    });

    it('should get global recommendation stats successfully', async () => {
      const result = await controller.getGlobalRecommendationStats();

      expect(result).toEqual({
        success: true,
        data: mockRecommendationStats,
        message: 'Global recommendation statistics retrieved successfully',
      });
      expect(communityRecommendationService.getRecommendationStats).toHaveBeenCalledWith();
    });

    it('should validate global stats response structure', async () => {
      const result = await controller.getGlobalRecommendationStats();

      expect(result.data).toHaveProperty('totalRecommendations');
      expect(result.data).toHaveProperty('weeklyTrends');
      expect(result.data).toHaveProperty('categoryPerformance');
      expect(typeof result.data.totalRecommendations).toBe('number');
      expect(typeof result.data.averageCompatibilityScore).toBe('number');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve global recommendation stats');
      mockCommunityRecommendationService.getRecommendationStats.mockRejectedValue(serviceError);

      await expect(
        controller.getGlobalRecommendationStats()
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow all authenticated users to access user endpoints', () => {
      const userEndpoints = [
        'generateRecommendations',
        'getUserRecommendations',
        'getRecommendationDetails',
        'handleRecommendationInteraction',
        'refreshRecommendations',
        'getUserRecommendationStats',
      ];

      userEndpoints.forEach(endpoint => {
        const metadata = Reflect.getMetadata('roles', controller[endpoint as keyof CommunityRecommendationController]);
        expect(metadata).toContain('client');
        expect(metadata).toContain('therapist');
        expect(metadata).toContain('moderator');
        expect(metadata).toContain('admin');
      });
    });

    it('should restrict global stats to admin and moderator only', () => {
      const metadata = Reflect.getMetadata('roles', controller.getGlobalRecommendationStats);
      expect(metadata).toContain('admin');
      expect(metadata).toContain('moderator');
      expect(metadata).not.toContain('client');
      expect(metadata).not.toContain('therapist');
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted generate response', async () => {
      mockCommunityRecommendationService.generateRecommendationsForUser.mockResolvedValue(undefined);
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);

      const result = await controller.generateRecommendations(mockUser, { force: false });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.message).toBe('string');
    });

    it('should return properly formatted recommendations list', async () => {
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);

      const result = await controller.getUserRecommendations(mockUser, {});

      expect(result.data).toBeInstanceOf(Array);
      result.data.forEach((recommendation: any) => {
        TestAssertions.expectValidEntity(recommendation, ['id', 'userId', 'communityId', 'score']);
        expect(recommendation.score).toBeGreaterThanOrEqual(0);
        expect(recommendation.score).toBeLessThanOrEqual(1);
        expect(recommendation.community).toHaveProperty('id');
        expect(recommendation.community).toHaveProperty('name');
      });
    });

    it('should return properly formatted recommendation details', async () => {
      mockCommunityRecommendationService.getRecommendationById.mockResolvedValue(mockRecommendation);

      const result = await controller.getRecommendationDetails(mockUser, 'recommendation_123456789');

      TestAssertions.expectValidEntity(result.data, ['id', 'userId', 'communityId', 'score', 'reasoning']);
      expect(result.data.community).toBeDefined();
      expect(result.data.assessmentScores).toBeDefined();
      expect(typeof result.data.score).toBe('number');
      expect(typeof result.data.reasoning).toBe('string');
    });

    it('should return properly formatted stats response', async () => {
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(mockRecommendationStats);

      const result = await controller.getUserRecommendationStats(mockUser);

      TestAssertions.expectValidEntity(result.data, [
        'totalRecommendations',
        'acceptedRecommendations',
        'rejectedRecommendations',
        'pendingRecommendations',
        'averageCompatibilityScore',
        'topCommunities',
      ]);
      expect(Array.isArray(result.data.topCommunities)).toBe(true);
      expect(typeof result.data.totalRecommendations).toBe('number');
      expect(typeof result.data.averageCompatibilityScore).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Recommendation service temporarily unavailable');
      mockCommunityRecommendationService.getUserRecommendations.mockRejectedValue(serviceError);

      await expect(
        controller.getUserRecommendations(mockUser, {})
      ).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCommunityRecommendationService.generateRecommendationsForUser.mockRejectedValue(dbError);

      await expect(
        controller.generateRecommendations(mockUser, { force: false })
      ).rejects.toThrow(dbError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid recommendation data');
      mockCommunityRecommendationService.handleRecommendationInteraction.mockRejectedValue(validationError);

      await expect(
        controller.handleRecommendationInteraction(
          mockUser,
          'recommendation_123',
          { action: 'accept' },
        )
      ).rejects.toThrow(validationError);
    });

    it('should handle concurrent interaction attempts', async () => {
      const concurrencyError = new Error('Recommendation interaction already in progress');
      mockCommunityRecommendationService.handleRecommendationInteraction.mockRejectedValue(concurrencyError);

      await expect(
        controller.handleRecommendationInteraction(
          mockUser,
          'recommendation_123',
          { action: 'accept' },
        )
      ).rejects.toThrow(concurrencyError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete recommendation workflow', async () => {
      // Generate recommendations
      mockCommunityRecommendationService.generateRecommendationsForUser.mockResolvedValue(undefined);
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);
      const generateResult = await controller.generateRecommendations(mockUser, { force: false });
      expect(generateResult.success).toBe(true);

      // Get user recommendations
      const userRecommendations = await controller.getUserRecommendations(mockUser, {});
      expect(userRecommendations.data).toHaveLength(3);

      // Get recommendation details
      mockCommunityRecommendationService.getRecommendationById.mockResolvedValue(mockRecommendation);
      const details = await controller.getRecommendationDetails(mockUser, mockRecommendation.id);
      expect(details.data.id).toBe(mockRecommendation.id);

      // Interact with recommendation
      mockCommunityRecommendationService.handleRecommendationInteraction.mockResolvedValue(undefined);
      const interaction = await controller.handleRecommendationInteraction(
        mockUser,
        mockRecommendation.id,
        { action: 'accept' },
      );
      expect(interaction.success).toBe(true);

      // Get updated stats
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(mockRecommendationStats);
      const stats = await controller.getUserRecommendationStats(mockUser);
      expect(stats.data.totalRecommendations).toBeGreaterThan(0);
    });

    it('should handle filtering and sorting workflow', async () => {
      mockCommunityRecommendationService.getUserRecommendations.mockResolvedValue(mockRecommendationsList);

      // Get pending recommendations
      const pendingResult = await controller.getUserRecommendations(mockUser, { status: 'pending' });
      expect(pendingResult.data.every((rec: any) => rec.status === 'pending')).toBe(true);

      // Get recommendations sorted by compatibility
      const sortedResult = await controller.getUserRecommendations(mockUser, {
        sortBy: 'compatibility',
        sortOrder: 'desc',
      });
      expect(sortedResult.success).toBe(true);

      // Get accepted recommendations
      const acceptedResult = await controller.getUserRecommendations(mockUser, { status: 'accepted' });
      expect(acceptedResult.data.every((rec: any) => rec.status === 'joined')).toBe(true);
    });

    it('should handle admin analytics workflow', async () => {
      mockCommunityRecommendationService.getRecommendationStats.mockResolvedValue(mockRecommendationStats);

      // Get global stats
      const globalStats = await controller.getGlobalRecommendationStats();
      expect(globalStats.data.totalRecommendations).toBeGreaterThan(0);
      expect(globalStats.data.categoryPerformance).toBeDefined();

      // Verify detailed metrics
      expect(globalStats.data.weeklyTrends).toBeDefined();
      expect(globalStats.data.topCommunities).toBeInstanceOf(Array);
      expect(globalStats.data.averageCompatibilityScore).toBeGreaterThan(0);
    });
  });
});