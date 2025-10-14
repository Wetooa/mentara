/**
 * Comprehensive Test Suite for TherapistRecommendationController
 * Tests all therapist recommendation endpoints with security, validation, and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { TherapistRecommendationController } from './therapist-recommendation.controller';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS, createMockPrismaService } from '../test-utils/index';

describe('TherapistRecommendationController', () => {
  let controller: TherapistRecommendationController;
  let therapistRecommendationService: TherapistRecommendationService;
  let prismaService: PrismaService;
  let module: TestingModule;

  // Mock TherapistRecommendationService
  const mockTherapistRecommendationService = {
    getRecommendedTherapists: jest.fn(),
    getCompatibilityAnalysis: jest.fn(),
  };

  // Mock PrismaService
  const mockPrismaService = createMockPrismaService();

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUser = TestDataGenerator.createUser({
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
  });

  const mockClient = {
    userId: TEST_USER_IDS.CLIENT,
    hasSeenTherapistRecommendations: false,
    createdAt: new Date(),
  };

  const mockTherapistRecommendation = {
    id: TEST_USER_IDS.THERAPIST,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    bio: 'Experienced therapist specializing in anxiety and depression',
    providerType: 'Licensed Clinical Psychologist',
    areasOfExpertise: ['anxiety', 'depression'],
    therapeuticApproaches: ['CBT', 'DBT'],
    hourlyRate: 150.0,
    rating: 4.8,
    reviewCount: 25,
    isActive: true,
    matchScore: 0.87,
    compatibilityFactors: ['anxiety_specialization', 'cbt_approach'],
  };

  const mockRecommendationResponse = {
    recommendations: [mockTherapistRecommendation],
    totalCount: 1,
    page: 1,
    limit: 10,
    hasMore: false,
    matchingCriteria: {
      userPreferences: ['anxiety', 'depression'],
      locationBased: true,
      ratingFilter: 4.0,
    },
    algorithmVersion: '2.1.0',
  };

  const mockCompatibilityAnalysis = {
    userId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    overallCompatibility: 0.87,
    compatibilityFactors: [
      {
        factor: 'anxiety_specialization',
        score: 0.95,
        importance: 'high',
        explanation: 'Therapist specializes in anxiety treatment',
      },
      {
        factor: 'cbt_approach',
        score: 0.82,
        importance: 'medium',
        explanation: 'CBT approach matches user preferences',
      },
    ],
    recommendations: [
      'This therapist is highly compatible with your anxiety treatment needs',
      'Consider scheduling an initial consultation',
    ],
    riskFactors: [],
    lastUpdated: new Date(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TherapistRecommendationController],
      providers: [
        {
          provide: TherapistRecommendationService,
          useValue: mockTherapistRecommendationService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TherapistRecommendationController>(TherapistRecommendationController);
    therapistRecommendationService = module.get<TherapistRecommendationService>(TherapistRecommendationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have therapistRecommendationService injected', () => {
      expect(therapistRecommendationService).toBeDefined();
    });

    it('should have prismaService injected', () => {
      expect(prismaService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TherapistRecommendationController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', TherapistRecommendationController);
      expect(controllerMetadata).toBe('therapist-recommendations');
    });
  });

  describe('GET /therapist-recommendations', () => {
    const query = {
      limit: 10,
      includeInactive: false,
      province: 'Ontario',
      maxHourlyRate: 200,
    };

    it('should get recommended therapists successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, query);

      expect(result).toEqual(mockRecommendationResponse);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
      expect(therapistRecommendationService.getRecommendedTherapists).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        limit: 10,
        includeInactive: false,
        province: 'Ontario',
        maxHourlyRate: 200,
      });
    });

    it('should handle user not found error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await TestAssertions.expectToThrowNestException(
        () => controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, query),
        NotFoundException,
        `User with ID ${TEST_USER_IDS.CLIENT} not found`,
      );
    });

    it('should handle service errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const serviceError = new Error('Recommendation service failed');
      mockTherapistRecommendationService.getRecommendedTherapists.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, query),
        InternalServerErrorException,
        'Recommendation service failed',
      );
    });

    it('should handle undefined query parameters', async () => {
      const emptyQuery = {};
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, emptyQuery);

      expect(result).toEqual(mockRecommendationResponse);
      expect(therapistRecommendationService.getRecommendedTherapists).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        limit: undefined,
        includeInactive: undefined,
        province: undefined,
        maxHourlyRate: undefined,
      });
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, query),
        InternalServerErrorException,
        'Database connection failed',
      );
    });
  });

  describe('GET /therapist-recommendations/compatibility/:therapistId', () => {
    const therapistId = TEST_USER_IDS.THERAPIST;

    it('should get compatibility analysis successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockResolvedValue(mockCompatibilityAnalysis);

      const result = await controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, therapistId);

      expect(result).toEqual(mockCompatibilityAnalysis);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_IDS.CLIENT },
      });
      expect(therapistRecommendationService.getCompatibilityAnalysis).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        therapistId,
      );
    });

    it('should handle user not found error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await TestAssertions.expectToThrowNestException(
        () => controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, therapistId),
        NotFoundException,
        `User with ID ${TEST_USER_IDS.CLIENT} not found`,
      );
    });

    it('should handle service errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const serviceError = new Error('Compatibility analysis failed');
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, therapistId),
        InternalServerErrorException,
        'Compatibility analysis failed',
      );
    });

    it('should handle therapist not found in service', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const notFoundError = new NotFoundException('Therapist not found');
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockRejectedValue(notFoundError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, therapistId),
        NotFoundException,
        'Therapist not found',
      );
    });

    it('should handle invalid therapist ID', async () => {
      const invalidTherapistId = 'invalid-id';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const serviceError = new Error('Invalid therapist ID');
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, invalidTherapistId),
        InternalServerErrorException,
        'Invalid therapist ID',
      );
    });
  });

  describe('GET /therapist-recommendations/welcome', () => {
    const welcomeQuery = {
      limit: 5,
      province: 'Ontario',
      forceRefresh: false,
    };

    it('should get welcome recommendations for first-time user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery);

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('welcomeMessage');
      expect(result).toHaveProperty('isFirstTime', true);
      expect(result).toHaveProperty('userInfo');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('matchingInsights');
      expect(result.welcomeMessage).toContain('Welcome to Mentara, John!');
      expect(result.nextSteps.canSendRequests).toBe(true);
      expect(result.nextSteps.recommendedActions).toHaveLength(4);
    });

    it('should redirect returning user to regular recommendations', async () => {
      const returningClient = { ...mockClient, hasSeenTherapistRecommendations: true };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(returningClient);

      const result = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery);

      expect(result).toEqual({
        isFirstTime: false,
        redirectTo: '/therapist-recommendations',
        message: 'User has already completed welcome flow',
        lastSeenAt: returningClient.createdAt,
      });
    });

    it('should handle force refresh for returning user', async () => {
      const returningClient = { ...mockClient, hasSeenTherapistRecommendations: true };
      const forceRefreshQuery = { ...welcomeQuery, forceRefresh: true };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(returningClient);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, forceRefreshQuery);

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('welcomeMessage');
      expect(result).toHaveProperty('isFirstTime', false);
      expect(result.welcomeMessage).toContain('Welcome back, John!');
    });

    it('should handle user not found error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);

      await TestAssertions.expectToThrowNestException(
        () => controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery),
        NotFoundException,
        `User with ID ${TEST_USER_IDS.CLIENT} not found`,
      );
    });

    it('should handle client profile not found error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(null);

      await TestAssertions.expectToThrowNestException(
        () => controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery),
        NotFoundException,
        `Client profile not found for user ${TEST_USER_IDS.CLIENT}`,
      );
    });

    it('should handle service errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      const serviceError = new Error('Recommendation service failed');
      mockTherapistRecommendationService.getRecommendedTherapists.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery),
        InternalServerErrorException,
        'Recommendation service failed',
      );
    });

    it('should handle database query errors', async () => {
      const dbError = new Error('Database query failed');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, welcomeQuery),
        InternalServerErrorException,
        'Database query failed',
      );
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete recommendation workflow', async () => {
      // Step 1: Get regular recommendations
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);
      
      const recommendations = await controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, {
        limit: 10,
        includeInactive: false,
      });
      expect(recommendations).toEqual(mockRecommendationResponse);

      // Step 2: Get compatibility analysis for a specific therapist
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockResolvedValue(mockCompatibilityAnalysis);
      
      const compatibility = await controller.getCompatibilityAnalysis(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
      );
      expect(compatibility).toEqual(mockCompatibilityAnalysis);

      // Step 3: Get welcome recommendations
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      
      const welcome = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, {
        limit: 5,
        forceRefresh: false,
      });
      expect(welcome).toHaveProperty('welcomeMessage');
      expect(welcome).toHaveProperty('isFirstTime', true);
    });

    it('should handle user journey from welcome to regular recommendations', async () => {
      // Step 1: First-time user gets welcome recommendations
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);
      
      const welcome = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, {
        limit: 5,
        forceRefresh: false,
      });
      expect(welcome.isFirstTime).toBe(true);

      // Step 2: Later, user gets regular recommendations
      const returningClient = { ...mockClient, hasSeenTherapistRecommendations: true };
      mockPrismaService.client.findUnique.mockResolvedValue(returningClient);
      
      const returningWelcome = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, {
        limit: 5,
        forceRefresh: false,
      });
      expect(returningWelcome.isFirstTime).toBe(false);
      expect(returningWelcome.redirectTo).toBe('/therapist-recommendations');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const serviceError = new Error('Service temporarily unavailable');
      mockTherapistRecommendationService.getRecommendedTherapists.mockRejectedValue(serviceError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, { limit: 10 }),
        InternalServerErrorException,
        'Service temporarily unavailable',
      );
    });

    it('should handle concurrent access issues', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const concurrencyError = new Error('Resource is locked');
      mockTherapistRecommendationService.getRecommendedTherapists.mockRejectedValue(concurrencyError);

      await TestAssertions.expectToThrowNestException(
        () => controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, { limit: 10 }),
        InternalServerErrorException,
        'Resource is locked',
      );
    });

    it('should handle malformed query parameters', async () => {
      const malformedQuery = { invalid: 'data' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, malformedQuery as any);

      expect(therapistRecommendationService.getRecommendedTherapists).toHaveBeenCalledWith({
        userId: TEST_USER_IDS.CLIENT,
        limit: undefined,
        includeInactive: undefined,
        province: undefined,
        maxHourlyRate: undefined,
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted recommendation response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendedTherapists(TEST_USER_IDS.CLIENT, { limit: 10 });

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
    });

    it('should return properly formatted compatibility analysis response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockTherapistRecommendationService.getCompatibilityAnalysis.mockResolvedValue(mockCompatibilityAnalysis);

      const result = await controller.getCompatibilityAnalysis(TEST_USER_IDS.CLIENT, TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('therapistId');
      expect(result).toHaveProperty('overallCompatibility');
      expect(result).toHaveProperty('compatibilityFactors');
      expect(Array.isArray(result.compatibilityFactors)).toBe(true);
      expect(typeof result.overallCompatibility).toBe('number');
    });

    it('should return properly formatted welcome response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockTherapistRecommendationService.getRecommendedTherapists.mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getWelcomeRecommendations(TEST_USER_IDS.CLIENT, { limit: 5 });

      expect(result).toHaveProperty('welcomeMessage');
      expect(result).toHaveProperty('isFirstTime');
      expect(result).toHaveProperty('userInfo');
      expect(result).toHaveProperty('nextSteps');
      expect(result).toHaveProperty('matchingInsights');
      expect(typeof result.welcomeMessage).toBe('string');
      expect(typeof result.isFirstTime).toBe('boolean');
      expect(result.userInfo).toHaveProperty('firstName');
      expect(result.nextSteps).toHaveProperty('canSendRequests');
      expect(Array.isArray(result.nextSteps.recommendedActions)).toBe(true);
    });
  });

  describe('Private Methods', () => {
    it('should generate proper welcome message for first-time user', () => {
      const message = (controller as any).generateWelcomeMessage('John', true);
      expect(message).toContain('Welcome to Mentara, John!');
      expect(message).toContain('curated a personalized list');
    });

    it('should generate proper welcome message for returning user', () => {
      const message = (controller as any).generateWelcomeMessage('John', false);
      expect(message).toContain('Welcome back, John!');
      expect(message).toContain('fresh therapist recommendations');
    });
  });
});