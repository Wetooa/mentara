/**
 * Comprehensive Test Suite for AnalyticsController
 * Tests analytics reporting functionality with role-based access control
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: AnalyticsService;
  let module: TestingModule;

  // Mock AnalyticsService
  const mockAnalyticsService = {
    getPlatformAnalytics: jest.fn(),
    getTherapistAnalytics: jest.fn(),
    getClientAnalytics: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockPlatformAnalytics = {
    userStats: {
      totalUsers: 15420,
      newUsers: 234,
      activeUsers: 8760,
      userGrowthRate: 12.5,
      userRetentionRate: 87.3,
      averageSessionsPerUser: 4.7,
    },
    sessionStats: {
      totalSessions: 72840,
      averageSessionDuration: 52.3, // minutes
      sessionCompletionRate: 91.7,
      missedSessionRate: 8.3,
      rescheduledSessionRate: 15.2,
    },
    therapistStats: {
      totalTherapists: 890,
      activeTherapists: 756,
      averageRating: 4.7,
      therapistUtilization: 78.4,
      averageResponseTime: 18.5, // minutes
    },
    revenue: {
      totalRevenue: 2847360.50,
      monthlyRevenue: 186420.75,
      revenueGrowth: 15.8,
      averageRevenuePerUser: 184.65,
      revenueByService: {
        individual_therapy: 2103845.20,
        group_therapy: 485726.30,
        workshops: 257789.00,
      },
    },
    communityStats: {
      totalPosts: 12450,
      totalComments: 48720,
      activeMembers: 5680,
      engagementRate: 73.2,
    },
    timeRangeMetrics: {
      period: 'last_30_days',
      startDate: new Date('2024-01-15T00:00:00Z'),
      endDate: new Date('2024-02-14T23:59:59Z'),
    },
  };

  const mockTherapistAnalytics = {
    therapistInfo: {
      id: TEST_USER_IDS.THERAPIST,
      name: 'Dr. Sarah Smith',
      specializations: ['anxiety', 'depression', 'trauma'],
      yearsOfExperience: 8,
      licenseNumber: 'PSY123456',
    },
    clientStats: {
      totalClients: 47,
      activeClients: 34,
      newClients: 8,
      clientRetentionRate: 89.4,
      averageClientsPerWeek: 25,
    },
    sessionMetrics: {
      totalSessions: 468,
      averageSessionDuration: 55.7,
      sessionRating: 4.8,
      completionRate: 94.2,
      noShowRate: 5.8,
      cancellationRate: 12.1,
    },
    performanceMetrics: {
      responseTime: 12.3, // minutes
      clientSatisfaction: 4.7,
      treatmentEffectiveness: 86.5,
      goalAchievementRate: 78.9,
      clientProgress: {
        improved: 73.4,
        stable: 21.3,
        declined: 5.3,
      },
    },
    revenueMetrics: {
      totalEarnings: 70200.00,
      monthlyEarnings: 5850.00,
      hourlyRate: 150.00,
      utilizationRate: 82.5,
    },
    timeRangeMetrics: {
      period: 'last_30_days',
      startDate: new Date('2024-01-15T00:00:00Z'),
      endDate: new Date('2024-02-14T23:59:59Z'),
    },
  };

  const mockClientAnalytics = {
    clientInfo: {
      id: TEST_USER_IDS.CLIENT,
      name: 'John Doe',
      joinDate: new Date('2023-10-15T00:00:00Z'),
      currentTherapist: 'Dr. Sarah Smith',
      primaryConcerns: ['anxiety', 'stress'],
    },
    sessionHistory: {
      totalSessions: 24,
      completedSessions: 22,
      cancelledSessions: 2,
      averageSessionRating: 4.6,
      sessionFrequency: 'weekly',
      lastSessionDate: new Date('2024-02-12T14:00:00Z'),
    },
    progressMetrics: {
      moodTrend: [3.2, 3.8, 4.1, 4.3, 4.6, 4.5, 4.7, 4.8], // last 8 weeks
      goalAchievements: 7,
      totalGoals: 10,
      improvementScore: 78.5,
      worksheetsCompleted: 15,
      assignedWorksheets: 18,
    },
    engagementStats: {
      loginFrequency: 4.2, // times per week
      messagesSent: 167,
      messagesReceived: 203,
      averageResponseTime: 45.2, // minutes
      communityParticipation: {
        postsCreated: 8,
        commentsLeft: 23,
        likesGiven: 156,
      },
    },
    assessmentScores: {
      initial: {
        anxiety: 7.2,
        depression: 6.8,
        stress: 8.1,
      },
      current: {
        anxiety: 4.3,
        depression: 3.9,
        stress: 4.8,
      },
      improvement: {
        anxiety: -2.9,
        depression: -2.9,
        stress: -3.3,
      },
    },
    timeRangeMetrics: {
      period: 'last_30_days',
      startDate: new Date('2024-01-15T00:00:00Z'),
      endDate: new Date('2024-02-14T23:59:59Z'),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have analyticsService injected', () => {
      expect(analyticsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AnalyticsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AnalyticsController);
      expect(controllerMetadata).toBe('analytics');
    });
  });

  describe('GET /analytics/platform', () => {
    const mockQuery = {
      dateFrom: '2024-01-15T00:00:00Z',
      dateTo: '2024-02-14T23:59:59Z',
    };

    it('should get platform analytics for admin successfully', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const result = await controller.getPlatformAnalytics('admin', mockQuery);

      expect(result).toEqual(mockPlatformAnalytics);
      expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should get platform analytics without date filters', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const result = await controller.getPlatformAnalytics('admin', {});

      expect(result).toEqual(mockPlatformAnalytics);
      expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should deny access to non-admin users', async () => {
      const nonAdminRoles = ['client', 'therapist', 'moderator'];

      for (const role of nonAdminRoles) {
        await expect(controller.getPlatformAnalytics(role, mockQuery)).rejects.toThrow(ForbiddenException);
        await expect(controller.getPlatformAnalytics(role, mockQuery)).rejects.toThrow('Access denied: Admin role required');
      }
    });

    it('should handle different date range formats', async () => {
      const dateRanges = [
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        { dateFrom: '2024-02-01T00:00:00.000Z', dateTo: '2024-02-29T23:59:59.999Z' },
        { dateFrom: '2024-01-15T10:30:00Z' }, // only start date
        { dateTo: '2024-02-14T18:45:00Z' }, // only end date
      ];

      for (const range of dateRanges) {
        mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

        const result = await controller.getPlatformAnalytics('admin', range);

        expect(result).toEqual(mockPlatformAnalytics);
        expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(
          range.dateFrom ? new Date(range.dateFrom) : undefined,
          range.dateTo ? new Date(range.dateTo) : undefined,
        );
      }
    });

    it('should validate platform analytics response structure', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const result = await controller.getPlatformAnalytics('admin', {});

      expect(result).toHaveProperty('userStats');
      expect(result).toHaveProperty('sessionStats');
      expect(result).toHaveProperty('therapistStats');
      expect(result).toHaveProperty('revenue');
      expect(result.userStats).toHaveProperty('totalUsers');
      expect(result.userStats).toHaveProperty('newUsers');
      expect(result.sessionStats).toHaveProperty('totalSessions');
      expect(result.revenue).toHaveProperty('totalRevenue');
      expect(typeof result.userStats.totalUsers).toBe('number');
      expect(typeof result.revenue.totalRevenue).toBe('number');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Analytics service unavailable');
      mockAnalyticsService.getPlatformAnalytics.mockRejectedValue(serviceError);

      await expect(controller.getPlatformAnalytics('admin', {})).rejects.toThrow(serviceError);
    });
  });

  describe('GET /analytics/therapist', () => {
    const mockQuery = {
      therapistId: TEST_USER_IDS.THERAPIST,
      dateFrom: '2024-01-15T00:00:00Z',
      dateTo: '2024-02-14T23:59:59Z',
    };

    it('should get therapist analytics for therapist (own data)', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);

      const result = await controller.getTherapistAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        { dateFrom: mockQuery.dateFrom, dateTo: mockQuery.dateTo },
      );

      expect(result).toEqual(mockTherapistAnalytics);
      expect(analyticsService.getTherapistAnalytics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should get therapist analytics for admin (any therapist)', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);

      const result = await controller.getTherapistAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        mockQuery,
      );

      expect(result).toEqual(mockTherapistAnalytics);
      expect(analyticsService.getTherapistAnalytics).toHaveBeenCalledWith(
        mockQuery.therapistId,
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should deny therapist access to other therapist data', async () => {
      await expect(
        controller.getTherapistAnalytics(
          TEST_USER_IDS.THERAPIST,
          'therapist',
          { therapistId: 'other_therapist_id' },
        )
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getTherapistAnalytics(
          TEST_USER_IDS.THERAPIST,
          'therapist',
          { therapistId: 'other_therapist_id' },
        )
      ).rejects.toThrow('Access denied: Can only view your own analytics');
    });

    it('should deny access to non-therapist/non-admin users', async () => {
      const unauthorizedRoles = ['client', 'moderator'];

      for (const role of unauthorizedRoles) {
        await expect(
          controller.getTherapistAnalytics(TEST_USER_IDS.CLIENT, role, {})
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.getTherapistAnalytics(TEST_USER_IDS.CLIENT, role, {})
        ).rejects.toThrow('Access denied: Therapist or Admin role required');
      }
    });

    it('should default to current user ID when therapistId not provided', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);

      const result = await controller.getTherapistAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        {},
      );

      expect(analyticsService.getTherapistAnalytics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        undefined,
        undefined,
      );
    });

    it('should validate therapist analytics response structure', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);

      const result = await controller.getTherapistAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        {},
      );

      expect(result).toHaveProperty('therapistInfo');
      expect(result).toHaveProperty('clientStats');
      expect(result).toHaveProperty('sessionMetrics');
      expect(result).toHaveProperty('performanceMetrics');
      expect(result.therapistInfo).toHaveProperty('id');
      expect(result.therapistInfo).toHaveProperty('name');
      expect(result.clientStats).toHaveProperty('totalClients');
      expect(result.sessionMetrics).toHaveProperty('totalSessions');
      expect(typeof result.clientStats.totalClients).toBe('number');
      expect(typeof result.performanceMetrics.clientSatisfaction).toBe('number');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Therapist analytics service failed');
      mockAnalyticsService.getTherapistAnalytics.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistAnalytics(TEST_USER_IDS.THERAPIST, 'therapist', {})
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /analytics/client', () => {
    const mockQuery = {
      clientId: TEST_USER_IDS.CLIENT,
      dateFrom: '2024-01-15T00:00:00Z',
      dateTo: '2024-02-14T23:59:59Z',
    };

    it('should get client analytics for client (own data)', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(
        TEST_USER_IDS.CLIENT,
        'user',
        { dateFrom: mockQuery.dateFrom, dateTo: mockQuery.dateTo },
      );

      expect(result).toEqual(mockClientAnalytics);
      expect(analyticsService.getClientAnalytics).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should get client analytics for therapist (assigned client)', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        mockQuery,
      );

      expect(result).toEqual(mockClientAnalytics);
      expect(analyticsService.getClientAnalytics).toHaveBeenCalledWith(
        mockQuery.clientId,
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should get client analytics for admin (any client)', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        mockQuery,
      );

      expect(result).toEqual(mockClientAnalytics);
      expect(analyticsService.getClientAnalytics).toHaveBeenCalledWith(
        mockQuery.clientId,
        new Date(mockQuery.dateFrom),
        new Date(mockQuery.dateTo),
      );
    });

    it('should deny client access to other client data', async () => {
      await expect(
        controller.getClientAnalytics(
          TEST_USER_IDS.CLIENT,
          'user',
          { clientId: 'other_client_id' },
        )
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getClientAnalytics(
          TEST_USER_IDS.CLIENT,
          'user',
          { clientId: 'other_client_id' },
        )
      ).rejects.toThrow('Access denied: Can only view your own analytics');
    });

    it('should deny access to unauthorized roles', async () => {
      const unauthorizedRoles = ['moderator'];

      for (const role of unauthorizedRoles) {
        await expect(
          controller.getClientAnalytics(TEST_USER_IDS.MODERATOR, role, {})
        ).rejects.toThrow(ForbiddenException);
        await expect(
          controller.getClientAnalytics(TEST_USER_IDS.MODERATOR, role, {})
        ).rejects.toThrow('Access denied: Invalid role');
      }
    });

    it('should default to current user ID when clientId not provided', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(
        TEST_USER_IDS.CLIENT,
        'user',
        {},
      );

      expect(analyticsService.getClientAnalytics).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        undefined,
        undefined,
      );
    });

    it('should validate client analytics response structure', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(
        TEST_USER_IDS.CLIENT,
        'user',
        {},
      );

      expect(result).toHaveProperty('clientInfo');
      expect(result).toHaveProperty('sessionHistory');
      expect(result).toHaveProperty('progressMetrics');
      expect(result).toHaveProperty('engagementStats');
      expect(result.clientInfo).toHaveProperty('id');
      expect(result.clientInfo).toHaveProperty('name');
      expect(result.sessionHistory).toHaveProperty('totalSessions');
      expect(result.progressMetrics).toHaveProperty('moodTrend');
      expect(Array.isArray(result.progressMetrics.moodTrend)).toBe(true);
      expect(typeof result.sessionHistory.totalSessions).toBe('number');
      expect(typeof result.engagementStats.loginFrequency).toBe('number');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Client analytics service failed');
      mockAnalyticsService.getClientAnalytics.mockRejectedValue(serviceError);

      await expect(
        controller.getClientAnalytics(TEST_USER_IDS.CLIENT, 'user', {})
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin access to all analytics endpoints', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Platform analytics
      const platformResult = await controller.getPlatformAnalytics('admin', {});
      expect(platformResult).toEqual(mockPlatformAnalytics);

      // Therapist analytics
      const therapistResult = await controller.getTherapistAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        { therapistId: TEST_USER_IDS.THERAPIST },
      );
      expect(therapistResult).toEqual(mockTherapistAnalytics);

      // Client analytics
      const clientResult = await controller.getClientAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        { clientId: TEST_USER_IDS.CLIENT },
      );
      expect(clientResult).toEqual(mockClientAnalytics);
    });

    it('should restrict therapist access appropriately', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Can access own therapist analytics
      const ownResult = await controller.getTherapistAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        {},
      );
      expect(ownResult).toEqual(mockTherapistAnalytics);

      // Can access client analytics (for assigned clients)
      const clientResult = await controller.getClientAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        { clientId: TEST_USER_IDS.CLIENT },
      );
      expect(clientResult).toEqual(mockClientAnalytics);

      // Cannot access platform analytics
      await expect(
        controller.getPlatformAnalytics('therapist', {})
      ).rejects.toThrow(ForbiddenException);

      // Cannot access other therapist analytics
      await expect(
        controller.getTherapistAnalytics(
          TEST_USER_IDS.THERAPIST,
          'therapist',
          { therapistId: 'other_therapist' },
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should restrict client access appropriately', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Can access own client analytics
      const ownResult = await controller.getClientAnalytics(
        TEST_USER_IDS.CLIENT,
        'user',
        {},
      );
      expect(ownResult).toEqual(mockClientAnalytics);

      // Cannot access platform analytics
      await expect(
        controller.getPlatformAnalytics('user', {})
      ).rejects.toThrow(ForbiddenException);

      // Cannot access therapist analytics
      await expect(
        controller.getTherapistAnalytics(TEST_USER_IDS.CLIENT, 'user', {})
      ).rejects.toThrow(ForbiddenException);

      // Cannot access other client analytics
      await expect(
        controller.getClientAnalytics(
          TEST_USER_IDS.CLIENT,
          'user',
          { clientId: 'other_client' },
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Date Range Handling', () => {
    it('should handle various date formats correctly', async () => {
      const dateFormats = [
        '2024-01-15',
        '2024-01-15T00:00:00Z',
        '2024-01-15T10:30:45.123Z',
        '2024-01-15T15:45:30+05:30',
      ];

      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      for (const dateFrom of dateFormats) {
        const result = await controller.getPlatformAnalytics('admin', { dateFrom });
        expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(
          new Date(dateFrom),
          undefined,
        );
      }
    });

    it('should handle date range validation', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      // Valid date range
      const validRange = {
        dateFrom: '2024-01-01T00:00:00Z',
        dateTo: '2024-01-31T23:59:59Z',
      };

      const result = await controller.getPlatformAnalytics('admin', validRange);
      expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(
        new Date(validRange.dateFrom),
        new Date(validRange.dateTo),
      );
    });

    it('should handle missing date parameters gracefully', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const queries = [
        {},
        { dateFrom: '2024-01-15' },
        { dateTo: '2024-01-31' },
      ];

      for (const query of queries) {
        const result = await controller.getPlatformAnalytics('admin', query);
        expect(analyticsService.getPlatformAnalytics).toHaveBeenCalledWith(
          query.dateFrom ? new Date(query.dateFrom) : undefined,
          query.dateTo ? new Date(query.dateTo) : undefined,
        );
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted platform analytics', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const result = await controller.getPlatformAnalytics('admin', {});

      TestAssertions.expectValidEntity(result, ['userStats', 'sessionStats', 'therapistStats', 'revenue']);
      expect(typeof result.userStats.totalUsers).toBe('number');
      expect(typeof result.sessionStats.averageSessionDuration).toBe('number');
      expect(typeof result.revenue.totalRevenue).toBe('number');
      expect(result.userStats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.revenue.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should return properly formatted therapist analytics', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);

      const result = await controller.getTherapistAnalytics(TEST_USER_IDS.THERAPIST, 'therapist', {});

      TestAssertions.expectValidEntity(result, ['therapistInfo', 'clientStats', 'sessionMetrics', 'performanceMetrics']);
      expect(result.therapistInfo.id).toBe(TEST_USER_IDS.THERAPIST);
      expect(Array.isArray(result.therapistInfo.specializations)).toBe(true);
      expect(typeof result.clientStats.totalClients).toBe('number');
      expect(typeof result.performanceMetrics.clientSatisfaction).toBe('number');
    });

    it('should return properly formatted client analytics', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      const result = await controller.getClientAnalytics(TEST_USER_IDS.CLIENT, 'user', {});

      TestAssertions.expectValidEntity(result, ['clientInfo', 'sessionHistory', 'progressMetrics', 'engagementStats']);
      expect(result.clientInfo.id).toBe(TEST_USER_IDS.CLIENT);
      expect(result.clientInfo.joinDate).toBeInstanceOf(Date);
      expect(Array.isArray(result.progressMetrics.moodTrend)).toBe(true);
      expect(typeof result.sessionHistory.totalSessions).toBe('number');
      expect(typeof result.engagementStats.loginFrequency).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Analytics service temporarily unavailable');
      mockAnalyticsService.getPlatformAnalytics.mockRejectedValue(serviceError);

      await expect(controller.getPlatformAnalytics('admin', {})).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAnalyticsService.getTherapistAnalytics.mockRejectedValue(dbError);

      await expect(
        controller.getTherapistAnalytics(TEST_USER_IDS.THERAPIST, 'therapist', {})
      ).rejects.toThrow(dbError);
    });

    it('should handle invalid date formats gracefully', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);

      const invalidDates = [
        { dateFrom: 'invalid-date' },
        { dateTo: 'not-a-date' },
        { dateFrom: '2024-13-45' }, // invalid month/day
      ];

      for (const invalidQuery of invalidDates) {
        // The controller should still call the service with potentially invalid dates
        // The service layer should handle date validation
        await controller.getPlatformAnalytics('admin', invalidQuery);
        expect(analyticsService.getPlatformAnalytics).toHaveBeenCalled();
      }
    });

    it('should handle data not found scenarios', async () => {
      const notFoundError = new Error('Analytics data not found');
      mockAnalyticsService.getClientAnalytics.mockRejectedValue(notFoundError);

      await expect(
        controller.getClientAnalytics(TEST_USER_IDS.CLIENT, 'user', {})
      ).rejects.toThrow(notFoundError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete admin analytics workflow', async () => {
      mockAnalyticsService.getPlatformAnalytics.mockResolvedValue(mockPlatformAnalytics);
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Platform overview
      const platformResult = await controller.getPlatformAnalytics('admin', {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      });
      expect(platformResult.userStats.totalUsers).toBeGreaterThan(0);

      // Specific therapist details
      const therapistResult = await controller.getTherapistAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        { therapistId: TEST_USER_IDS.THERAPIST },
      );
      expect(therapistResult.therapistInfo.id).toBe(TEST_USER_IDS.THERAPIST);

      // Specific client details
      const clientResult = await controller.getClientAnalytics(
        TEST_USER_IDS.ADMIN,
        'admin',
        { clientId: TEST_USER_IDS.CLIENT },
      );
      expect(clientResult.clientInfo.id).toBe(TEST_USER_IDS.CLIENT);
    });

    it('should handle therapist self-service analytics workflow', async () => {
      mockAnalyticsService.getTherapistAnalytics.mockResolvedValue(mockTherapistAnalytics);
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Get own performance metrics
      const ownMetrics = await controller.getTherapistAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        {},
      );
      expect(ownMetrics.performanceMetrics.clientSatisfaction).toBeDefined();

      // Get assigned client progress
      const clientProgress = await controller.getClientAnalytics(
        TEST_USER_IDS.THERAPIST,
        'therapist',
        { clientId: TEST_USER_IDS.CLIENT },
      );
      expect(clientProgress.progressMetrics.improvementScore).toBeDefined();
    });

    it('should handle client self-monitoring workflow', async () => {
      mockAnalyticsService.getClientAnalytics.mockResolvedValue(mockClientAnalytics);

      // Get personal progress metrics
      const progressResult = await controller.getClientAnalytics(
        TEST_USER_IDS.CLIENT,
        'user',
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
      );

      expect(progressResult.progressMetrics.moodTrend).toBeDefined();
      expect(progressResult.sessionHistory.totalSessions).toBeGreaterThanOrEqual(0);
      expect(progressResult.engagementStats.loginFrequency).toBeGreaterThanOrEqual(0);
    });
  });
});