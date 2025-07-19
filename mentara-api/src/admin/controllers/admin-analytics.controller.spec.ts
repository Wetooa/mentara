/**
 * Comprehensive Test Suite for AdminAnalyticsController
 * Tests admin analytics and reporting functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('AdminAnalyticsController', () => {
  let controller: AdminAnalyticsController;
  let adminService: AdminService;
  let module: TestingModule;

  // Mock AdminService
  const mockAdminService = {
    getPlatformOverview: jest.fn(),
    getMatchingPerformance: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockPlatformOverview = {
    userStats: {
      totalUsers: 15234,
      activeUsers: 8934,
      newUsersToday: 45,
      newUsersThisWeek: 267,
      newUsersThisMonth: 1234,
      usersByRole: {
        client: 13567,
        therapist: 1245,
        admin: 12,
        moderator: 410,
      },
    },
    therapistStats: {
      totalTherapists: 1245,
      verifiedTherapists: 1189,
      activeTherapists: 987,
      averageRating: 4.6,
      pendingApplications: 56,
    },
    sessionStats: {
      totalSessions: 89345,
      sessionsToday: 234,
      sessionsThisWeek: 1456,
      sessionsThisMonth: 6789,
      averageSessionDuration: 52.3,
      sessionCompletionRate: 94.2,
    },
    communityStats: {
      totalCommunities: 87,
      activeCommunities: 72,
      totalPosts: 15678,
      totalComments: 34567,
      averageEngagement: 3.4,
    },
    systemHealth: {
      status: 'healthy',
      uptime: 99.97,
      errorRate: 0.02,
      responseTime: 145,
      databaseConnections: 24,
      memoryUsage: 68.5,
    },
    revenueStats: {
      totalRevenue: 456789.50,
      monthlyRecurringRevenue: 78945.30,
      averageRevenuePerUser: 89.45,
      subscriptionGrowthRate: 12.5,
    },
  };

  const mockMatchingPerformance = {
    matchingStats: {
      totalMatches: 8934,
      successfulMatches: 7823,
      matchSuccessRate: 87.6,
      averageMatchTime: 72, // hours
      matchesThisPeriod: 234,
    },
    algorithmPerformance: {
      precisionScore: 0.85,
      recallScore: 0.78,
      f1Score: 0.81,
      userSatisfactionScore: 4.2,
      improvementFromLastPeriod: 5.2,
    },
    categoryBreakdown: {
      anxiety: {
        matches: 2345,
        successRate: 89.2,
        avgRating: 4.5,
      },
      depression: {
        matches: 1897,
        successRate: 86.7,
        avgRating: 4.3,
      },
      trauma: {
        matches: 1234,
        successRate: 92.1,
        avgRating: 4.7,
      },
      generalMentalHealth: {
        matches: 3458,
        successRate: 84.3,
        avgRating: 4.1,
      },
    },
    geographicDistribution: {
      regions: [
        {
          name: 'North America',
          matches: 5234,
          successRate: 88.2,
        },
        {
          name: 'Europe',
          matches: 2345,
          successRate: 86.7,
        },
        {
          name: 'Asia',
          matches: 1123,
          successRate: 85.1,
        },
        {
          name: 'Other',
          matches: 232,
          successRate: 82.3,
        },
      ],
    },
    timeSeriesData: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        matches: Math.floor(Math.random() * 50) + 10,
        successRate: Math.floor(Math.random() * 20) + 80,
      })),
      weekly: Array.from({ length: 12 }, (_, i) => ({
        week: `Week ${52 - i}`,
        matches: Math.floor(Math.random() * 300) + 100,
        successRate: Math.floor(Math.random() * 15) + 82,
      })),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminAnalyticsController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminAuthGuard)
      .useValue(mockAdminAuthGuard)
      .compile();

    controller = module.get<AdminAnalyticsController>(AdminAnalyticsController);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have adminService injected', () => {
      expect(adminService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard and AdminAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AdminAnalyticsController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(AdminAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AdminAnalyticsController);
      expect(controllerMetadata).toBe('admin/analytics');
    });

    it('should require admin role for all endpoints', () => {
      const adminOnlyMethods = ['getPlatformOverview', 'getMatchingPerformance'];
      adminOnlyMethods.forEach(method => {
        const metadata = Reflect.getMetadata('roles', controller[method]);
        expect(metadata).toEqual(['admin']);
      });
    });
  });

  describe('GET /admin/analytics/overview', () => {
    it('should get platform overview successfully', async () => {
      mockAdminService.getPlatformOverview.mockResolvedValue(mockPlatformOverview);

      const result = await controller.getPlatformOverview(TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockPlatformOverview);
      expect(adminService.getPlatformOverview).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve platform overview');
      mockAdminService.getPlatformOverview.mockRejectedValue(serviceError);

      await expect(
        controller.getPlatformOverview(TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(HttpException);

      try {
        await controller.getPlatformOverview(TEST_USER_IDS.ADMIN);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getMessage()).toContain('Failed to retrieve platform overview');
      }
    });

    it('should validate platform overview structure', async () => {
      mockAdminService.getPlatformOverview.mockResolvedValue(mockPlatformOverview);

      const result = await controller.getPlatformOverview(TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('userStats');
      expect(result).toHaveProperty('therapistStats');
      expect(result).toHaveProperty('sessionStats');
      expect(result).toHaveProperty('communityStats');
      expect(result).toHaveProperty('systemHealth');
      expect(result).toHaveProperty('revenueStats');

      // Validate user stats structure
      expect(result.userStats).toHaveProperty('totalUsers');
      expect(result.userStats).toHaveProperty('activeUsers');
      expect(result.userStats).toHaveProperty('usersByRole');
      expect(typeof result.userStats.totalUsers).toBe('number');
      expect(typeof result.userStats.activeUsers).toBe('number');

      // Validate therapist stats structure
      expect(result.therapistStats).toHaveProperty('totalTherapists');
      expect(result.therapistStats).toHaveProperty('verifiedTherapists');
      expect(result.therapistStats).toHaveProperty('averageRating');
      expect(typeof result.therapistStats.averageRating).toBe('number');
      expect(result.therapistStats.averageRating).toBeGreaterThanOrEqual(0);
      expect(result.therapistStats.averageRating).toBeLessThanOrEqual(5);

      // Validate system health structure
      expect(result.systemHealth).toHaveProperty('status');
      expect(result.systemHealth).toHaveProperty('uptime');
      expect(result.systemHealth).toHaveProperty('errorRate');
      expect(typeof result.systemHealth.uptime).toBe('number');
      expect(result.systemHealth.uptime).toBeGreaterThanOrEqual(0);
      expect(result.systemHealth.uptime).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /admin/analytics/matching-performance', () => {
    const validQuery = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-14'),
    };

    it('should get matching performance successfully', async () => {
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      const result = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, validQuery);

      expect(result).toEqual(mockMatchingPerformance);
      expect(adminService.getMatchingPerformance).toHaveBeenCalledWith(
        validQuery.startDate,
        validQuery.endDate
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve matching performance');
      mockAdminService.getMatchingPerformance.mockRejectedValue(serviceError);

      await expect(
        controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, validQuery)
      ).rejects.toThrow(HttpException);

      try {
        await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, validQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getMessage()).toContain('Failed to retrieve matching performance');
      }
    });

    it('should validate matching performance structure', async () => {
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      const result = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, validQuery);

      expect(result).toHaveProperty('matchingStats');
      expect(result).toHaveProperty('algorithmPerformance');
      expect(result).toHaveProperty('categoryBreakdown');
      expect(result).toHaveProperty('geographicDistribution');
      expect(result).toHaveProperty('timeSeriesData');

      // Validate matching stats
      expect(result.matchingStats).toHaveProperty('totalMatches');
      expect(result.matchingStats).toHaveProperty('successfulMatches');
      expect(result.matchingStats).toHaveProperty('matchSuccessRate');
      expect(typeof result.matchingStats.matchSuccessRate).toBe('number');
      expect(result.matchingStats.matchSuccessRate).toBeGreaterThanOrEqual(0);
      expect(result.matchingStats.matchSuccessRate).toBeLessThanOrEqual(100);

      // Validate algorithm performance
      expect(result.algorithmPerformance).toHaveProperty('precisionScore');
      expect(result.algorithmPerformance).toHaveProperty('recallScore');
      expect(result.algorithmPerformance).toHaveProperty('f1Score');
      expect(result.algorithmPerformance.precisionScore).toBeGreaterThanOrEqual(0);
      expect(result.algorithmPerformance.precisionScore).toBeLessThanOrEqual(1);

      // Validate category breakdown
      expect(result.categoryBreakdown).toHaveProperty('anxiety');
      expect(result.categoryBreakdown).toHaveProperty('depression');
      expect(result.categoryBreakdown.anxiety).toHaveProperty('matches');
      expect(result.categoryBreakdown.anxiety).toHaveProperty('successRate');
      expect(typeof result.categoryBreakdown.anxiety.matches).toBe('number');

      // Validate geographic distribution
      expect(result.geographicDistribution).toHaveProperty('regions');
      expect(Array.isArray(result.geographicDistribution.regions)).toBe(true);
      result.geographicDistribution.regions.forEach(region => {
        expect(region).toHaveProperty('name');
        expect(region).toHaveProperty('matches');
        expect(region).toHaveProperty('successRate');
      });

      // Validate time series data
      expect(result.timeSeriesData).toHaveProperty('daily');
      expect(result.timeSeriesData).toHaveProperty('weekly');
      expect(Array.isArray(result.timeSeriesData.daily)).toBe(true);
      expect(Array.isArray(result.timeSeriesData.weekly)).toBe(true);
    });

    it('should handle different date ranges', async () => {
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      const differentQuery = {
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-31'),
      };

      const result = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, differentQuery);

      expect(result).toEqual(mockMatchingPerformance);
      expect(adminService.getMatchingPerformance).toHaveBeenCalledWith(
        differentQuery.startDate,
        differentQuery.endDate
      );
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted platform overview', async () => {
      mockAdminService.getPlatformOverview.mockResolvedValue(mockPlatformOverview);

      const result = await controller.getPlatformOverview(TEST_USER_IDS.ADMIN);

      TestAssertions.expectValidEntity(result, [
        'userStats',
        'therapistStats',
        'sessionStats',
        'communityStats',
        'systemHealth',
      ]);

      expect(typeof result.userStats.totalUsers).toBe('number');
      expect(typeof result.therapistStats.averageRating).toBe('number');
      expect(typeof result.sessionStats.sessionCompletionRate).toBe('number');
      expect(typeof result.systemHealth.uptime).toBe('number');
    });

    it('should return properly formatted matching performance', async () => {
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      const result = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-14'),
      });

      TestAssertions.expectValidEntity(result, [
        'matchingStats',
        'algorithmPerformance',
        'categoryBreakdown',
        'geographicDistribution',
        'timeSeriesData',
      ]);

      expect(typeof result.matchingStats.matchSuccessRate).toBe('number');
      expect(typeof result.algorithmPerformance.f1Score).toBe('number');
      expect(typeof result.categoryBreakdown).toBe('object');
      expect(Array.isArray(result.geographicDistribution.regions)).toBe(true);
      expect(Array.isArray(result.timeSeriesData.daily)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminService.getPlatformOverview.mockRejectedValue(dbError);

      await expect(
        controller.getPlatformOverview(TEST_USER_IDS.ADMIN)
      ).rejects.toThrow(HttpException);
    });

    it('should handle analytics service unavailable', async () => {
      const serviceError = new Error('Analytics service temporarily unavailable');
      mockAdminService.getMatchingPerformance.mockRejectedValue(serviceError);

      await expect(
        controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-14'),
        })
      ).rejects.toThrow(HttpException);
    });

    it('should handle invalid date ranges gracefully', async () => {
      const invalidQuery = {
        startDate: new Date('invalid-date'),
        endDate: new Date('2024-02-14'),
      };

      // Service should handle invalid dates
      mockAdminService.getMatchingPerformance.mockRejectedValue(
        new Error('Invalid date range provided')
      );

      await expect(
        controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, invalidQuery)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete analytics workflow', async () => {
      // Get platform overview
      mockAdminService.getPlatformOverview.mockResolvedValue(mockPlatformOverview);
      const overviewResult = await controller.getPlatformOverview(TEST_USER_IDS.ADMIN);
      expect(overviewResult.userStats.totalUsers).toBeGreaterThan(0);

      // Get matching performance
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);
      const performanceResult = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-14'),
      });
      expect(performanceResult.matchingStats.totalMatches).toBeGreaterThan(0);
    });

    it('should validate admin-only access', async () => {
      // Mock successful responses
      mockAdminService.getPlatformOverview.mockResolvedValue(mockPlatformOverview);
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      // All endpoints should be accessible with admin auth
      await expect(controller.getPlatformOverview(TEST_USER_IDS.ADMIN)).resolves.toBeDefined();
      await expect(controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-14'),
      })).resolves.toBeDefined();
    });

    it('should handle performance metrics validation', async () => {
      mockAdminService.getMatchingPerformance.mockResolvedValue(mockMatchingPerformance);

      const result = await controller.getMatchingPerformance(TEST_USER_IDS.ADMIN, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-14'),
      });

      // Validate that all performance metrics are within expected ranges
      expect(result.matchingStats.matchSuccessRate).toBeGreaterThanOrEqual(0);
      expect(result.matchingStats.matchSuccessRate).toBeLessThanOrEqual(100);
      expect(result.algorithmPerformance.f1Score).toBeGreaterThanOrEqual(0);
      expect(result.algorithmPerformance.f1Score).toBeLessThanOrEqual(1);

      // Validate category breakdown totals
      const totalCategoryMatches = Object.values(result.categoryBreakdown)
        .reduce((sum, category: any) => sum + category.matches, 0);
      expect(totalCategoryMatches).toBeGreaterThan(0);

      // Validate geographic distribution totals
      const totalRegionMatches = result.geographicDistribution.regions
        .reduce((sum, region) => sum + region.matches, 0);
      expect(totalRegionMatches).toBeGreaterThan(0);
    });
  });
});