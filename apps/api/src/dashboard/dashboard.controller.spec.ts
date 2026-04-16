/**
 * Comprehensive Test Suite for DashboardController
 * Tests role-based dashboard data retrieval for different user types
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: DashboardService;
  let module: TestingModule;

  // Mock DashboardService
  const mockDashboardService = {
    getUserDashboardData: jest.fn(),
    getTherapistDashboardData: jest.fn(),
    getAdminDashboardData: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUserDashboard = {
    user: {
      id: TEST_USER_IDS.CLIENT,
      firstName: 'John',
      lastName: 'Doe',
      email: TEST_EMAILS.CLIENT,
      profileCompleteness: 85,
    },
    therapist: {
      id: TEST_USER_IDS.THERAPIST,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      specializations: ['Anxiety', 'Depression', 'CBT'],
    },
    sessions: {
      total: 12,
      completed: 10,
      upcoming: 2,
      recentSessions: [
        {
          id: 'session_1',
          date: '2024-02-14T15:00:00Z',
          type: 'Video Call',
          status: 'completed',
        },
        {
          id: 'session_2',
          date: '2024-02-12T14:00:00Z',
          type: 'Video Call',
          status: 'completed',
        },
      ],
    },
    worksheets: {
      assigned: 5,
      completed: 3,
      overdue: 1,
      recent: [
        {
          id: 'worksheet_1',
          title: 'Anxiety Management',
          status: 'completed',
          completedAt: '2024-02-13T16:30:00Z',
        },
      ],
    },
    progress: {
      moodTrend: [6, 7, 6, 8, 7, 8, 9],
      goalProgress: 75,
      streakDays: 14,
    },
    recommendations: [
      {
        type: 'community',
        title: 'Join Anxiety Support Group',
        description: 'Connect with others experiencing similar challenges',
      },
      {
        type: 'worksheet',
        title: 'Daily Mood Journal',
        description: 'Track your mood patterns to identify triggers',
      },
    ],
  };

  const mockTherapistDashboard = {
    therapist: {
      id: TEST_USER_IDS.THERAPIST,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      specializations: ['Anxiety', 'Depression', 'CBT'],
      verified: true,
    },
    clients: {
      total: 24,
      active: 18,
      newThisMonth: 3,
      recentClients: [
        {
          id: 'client_1',
          firstName: 'John',
          lastName: 'D.',
          lastSession: '2024-02-14T15:00:00Z',
          progress: 'improving',
        },
        {
          id: 'client_2',
          firstName: 'Jane',
          lastName: 'S.',
          lastSession: '2024-02-13T10:00:00Z',
          progress: 'stable',
        },
      ],
    },
    sessions: {
      today: 5,
      thisWeek: 23,
      thisMonth: 89,
      upcomingSessions: [
        {
          id: 'session_upcoming_1',
          clientName: 'John D.',
          scheduledTime: '2024-02-15T14:00:00Z',
          type: 'Video Call',
        },
        {
          id: 'session_upcoming_2',
          clientName: 'Jane S.',
          scheduledTime: '2024-02-15T16:00:00Z',
          type: 'In-person',
        },
      ],
    },
    worksheets: {
      assigned: 45,
      completed: 38,
      pendingReview: 7,
    },
    analytics: {
      averageSessionRating: 4.7,
      clientSatisfaction: 92,
      sessionCompletionRate: 96,
      responseTime: 2.3,
    },
  };

  const mockAdminDashboard = {
    platformStats: {
      totalUsers: 15647,
      totalTherapists: 234,
      totalClients: 14823,
      totalModerators: 12,
      activeUsers: 8934,
      newUsersThisMonth: 423,
    },
    therapistApplications: {
      pending: 23,
      approved: 189,
      rejected: 34,
      recentApplications: [
        {
          id: 'app_1',
          name: 'Dr. Michael Brown',
          email: 'mbrown@example.com',
          submittedAt: '2024-02-14T09:30:00Z',
          status: 'pending',
        },
        {
          id: 'app_2',
          name: 'Dr. Lisa Chen',
          email: 'lchen@example.com',
          submittedAt: '2024-02-13T14:15:00Z',
          status: 'approved',
        },
      ],
    },
    sessionStats: {
      totalSessions: 45678,
      sessionsToday: 234,
      sessionsThisWeek: 1847,
      averageSessionDuration: 52.3,
      sessionsByType: {
        video: 28456,
        audio: 8934,
        chat: 4567,
        in_person: 3721,
      },
    },
    systemHealth: {
      status: 'healthy',
      uptime: 99.97,
      responseTime: 145,
      errorRate: 0.02,
      lastBackup: '2024-02-14T03:00:00Z',
    },
    contentModeration: {
      pendingReports: 12,
      flaggedContent: 5,
      moderatorActions: 89,
    },
    recentActivity: [
      {
        type: 'user_registration',
        description: 'New client registered: john.doe@example.com',
        timestamp: '2024-02-14T10:30:00Z',
        severity: 'info',
      },
      {
        type: 'therapist_application',
        description: 'Therapist application submitted: Dr. Michael Brown',
        timestamp: '2024-02-14T09:30:00Z',
        severity: 'info',
      },
      {
        type: 'security_alert',
        description: 'Multiple failed login attempts detected',
        timestamp: '2024-02-14T08:15:00Z',
        severity: 'warning',
      },
    ],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have dashboardService injected', () => {
      expect(dashboardService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', DashboardController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', DashboardController);
      expect(controllerMetadata).toBe('dashboard');
    });
  });

  describe('GET /dashboard/user', () => {
    it('should get user dashboard successfully for client', async () => {
      mockDashboardService.getUserDashboardData.mockResolvedValue(mockUserDashboard);

      const result = await controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client');

      expect(result).toEqual(mockUserDashboard);
      expect(dashboardService.getUserDashboardData).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
    });

    it('should reject non-client users', async () => {
      await expect(
        controller.getUserDashboard(TEST_USER_IDS.THERAPIST, 'therapist')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('should reject admin users', async () => {
      await expect(
        controller.getUserDashboard(TEST_USER_IDS.ADMIN, 'admin')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('should reject moderator users', async () => {
      await expect(
        controller.getUserDashboard(TEST_USER_IDS.MODERATOR, 'moderator')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getUserDashboardData).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to fetch user dashboard data');
      mockDashboardService.getUserDashboardData.mockRejectedValue(serviceError);

      await expect(
        controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client')
      ).rejects.toThrow(serviceError);
    });

    it('should validate dashboard data structure', async () => {
      mockDashboardService.getUserDashboardData.mockResolvedValue(mockUserDashboard);

      const result = await controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('therapist');
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('worksheets');
      expect(result).toHaveProperty('progress');
      expect(result).toHaveProperty('recommendations');

      expect(result.user).toHaveProperty('profileCompleteness');
      expect(typeof result.user.profileCompleteness).toBe('number');
      expect(result.sessions).toHaveProperty('total');
      expect(result.sessions).toHaveProperty('completed');
      expect(result.sessions).toHaveProperty('upcoming');
    });
  });

  describe('GET /dashboard/therapist', () => {
    it('should get therapist dashboard successfully for therapist', async () => {
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(mockTherapistDashboard);

      const result = await controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist');

      expect(result).toEqual(mockTherapistDashboard);
      expect(dashboardService.getTherapistDashboardData).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
    });

    it('should reject non-therapist users', async () => {
      await expect(
        controller.getTherapistDashboard(TEST_USER_IDS.CLIENT, 'client')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getTherapistDashboardData).not.toHaveBeenCalled();
    });

    it('should reject admin users', async () => {
      await expect(
        controller.getTherapistDashboard(TEST_USER_IDS.ADMIN, 'admin')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getTherapistDashboardData).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to fetch therapist dashboard data');
      mockDashboardService.getTherapistDashboardData.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist')
      ).rejects.toThrow(serviceError);
    });

    it('should validate therapist dashboard structure', async () => {
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(mockTherapistDashboard);

      const result = await controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist');

      expect(result).toHaveProperty('therapist');
      expect(result).toHaveProperty('clients');
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('worksheets');
      expect(result).toHaveProperty('analytics');

      expect(result.therapist).toHaveProperty('verified');
      expect(typeof result.therapist.verified).toBe('boolean');
      expect(result.clients).toHaveProperty('total');
      expect(result.clients).toHaveProperty('active');
      expect(result.analytics).toHaveProperty('averageSessionRating');
      expect(typeof result.analytics.averageSessionRating).toBe('number');
    });

    it('should handle therapist with no clients', async () => {
      const emptyTherapistDashboard = {
        ...mockTherapistDashboard,
        clients: {
          total: 0,
          active: 0,
          newThisMonth: 0,
          recentClients: [],
        },
      };
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(emptyTherapistDashboard);

      const result = await controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist');

      expect(result.clients.total).toBe(0);
      expect(result.clients.recentClients).toEqual([]);
    });
  });

  describe('GET /dashboard/admin', () => {
    it('should get admin dashboard successfully for admin', async () => {
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard('admin');

      expect(result).toEqual(mockAdminDashboard);
      expect(dashboardService.getAdminDashboardData).toHaveBeenCalled();
    });

    it('should reject non-admin users', async () => {
      await expect(
        controller.getAdminDashboard('client')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getAdminDashboardData).not.toHaveBeenCalled();
    });

    it('should reject therapist users', async () => {
      await expect(
        controller.getAdminDashboard('therapist')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getAdminDashboardData).not.toHaveBeenCalled();
    });

    it('should reject moderator users', async () => {
      await expect(
        controller.getAdminDashboard('moderator')
      ).rejects.toThrow(UnauthorizedException);

      expect(dashboardService.getAdminDashboardData).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to fetch admin dashboard data');
      mockDashboardService.getAdminDashboardData.mockRejectedValue(serviceError);

      await expect(
        controller.getAdminDashboard('admin')
      ).rejects.toThrow(serviceError);
    });

    it('should validate admin dashboard structure', async () => {
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard('admin');

      expect(result).toHaveProperty('platformStats');
      expect(result).toHaveProperty('therapistApplications');
      expect(result).toHaveProperty('sessionStats');
      expect(result).toHaveProperty('systemHealth');
      expect(result).toHaveProperty('contentModeration');
      expect(result).toHaveProperty('recentActivity');

      expect(result.platformStats).toHaveProperty('totalUsers');
      expect(typeof result.platformStats.totalUsers).toBe('number');
      expect(result.systemHealth).toHaveProperty('status');
      expect(result.systemHealth).toHaveProperty('uptime');
      expect(typeof result.systemHealth.uptime).toBe('number');
      expect(Array.isArray(result.recentActivity)).toBe(true);
    });

    it('should validate recent activity items', async () => {
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard('admin');

      result.recentActivity.forEach(activity => {
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('description');
        expect(activity).toHaveProperty('timestamp');
        expect(activity).toHaveProperty('severity');
        expect(['info', 'warning', 'error', 'critical']).toContain(activity.severity);
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted user dashboard response', async () => {
      mockDashboardService.getUserDashboardData.mockResolvedValue(mockUserDashboard);

      const result = await controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client');

      TestAssertions.expectValidEntity(result, ['user', 'sessions', 'worksheets', 'progress']);
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(typeof result.user.profileCompleteness).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should return properly formatted therapist dashboard response', async () => {
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(mockTherapistDashboard);

      const result = await controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist');

      TestAssertions.expectValidEntity(result, ['therapist', 'clients', 'sessions', 'analytics']);
      expect(result.therapist).toHaveProperty('id');
      expect(Array.isArray(result.therapist.specializations)).toBe(true);
      expect(typeof result.analytics.averageSessionRating).toBe('number');
      expect(Array.isArray(result.sessions.upcomingSessions)).toBe(true);
    });

    it('should return properly formatted admin dashboard response', async () => {
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard('admin');

      TestAssertions.expectValidEntity(result, [
        'platformStats',
        'therapistApplications',
        'sessionStats',
        'systemHealth',
      ]);
      expect(typeof result.platformStats.totalUsers).toBe('number');
      expect(typeof result.systemHealth.uptime).toBe('number');
      expect(Array.isArray(result.recentActivity)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Dashboard service temporarily unavailable');
      mockDashboardService.getUserDashboardData.mockRejectedValue(serviceError);

      await expect(
        controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client')
      ).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockDashboardService.getTherapistDashboardData.mockRejectedValue(dbError);

      await expect(
        controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist')
      ).rejects.toThrow(dbError);
    });

    it('should handle invalid user data', async () => {
      const invalidDataError = new Error('Invalid user data provided');
      mockDashboardService.getAdminDashboardData.mockRejectedValue(invalidDataError);

      await expect(
        controller.getAdminDashboard('admin')
      ).rejects.toThrow(invalidDataError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user dashboard workflow', async () => {
      mockDashboardService.getUserDashboardData.mockResolvedValue(mockUserDashboard);

      const result = await controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client');

      expect(result.user.id).toBe(TEST_USER_IDS.CLIENT);
      expect(result.sessions.total).toBeGreaterThan(0);
      expect(result.worksheets.assigned).toBeGreaterThanOrEqual(result.worksheets.completed);
      expect(result.progress.goalProgress).toBeGreaterThanOrEqual(0);
      expect(result.progress.goalProgress).toBeLessThanOrEqual(100);
    });

    it('should handle complete therapist dashboard workflow', async () => {
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(mockTherapistDashboard);

      const result = await controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist');

      expect(result.therapist.id).toBe(TEST_USER_IDS.THERAPIST);
      expect(result.clients.total).toBeGreaterThanOrEqual(result.clients.active);
      expect(result.analytics.averageSessionRating).toBeGreaterThan(0);
      expect(result.analytics.averageSessionRating).toBeLessThanOrEqual(5);
      expect(result.analytics.sessionCompletionRate).toBeGreaterThanOrEqual(0);
      expect(result.analytics.sessionCompletionRate).toBeLessThanOrEqual(100);
    });

    it('should handle complete admin dashboard workflow', async () => {
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard('admin');

      expect(result.platformStats.totalUsers).toBeGreaterThan(0);
      expect(result.platformStats.totalTherapists).toBeGreaterThan(0);
      expect(result.platformStats.totalClients).toBeGreaterThan(0);
      expect(result.systemHealth.status).toBeDefined();
      expect(result.systemHealth.uptime).toBeGreaterThan(0);
      expect(result.recentActivity.length).toBeGreaterThan(0);
    });

    it('should validate role-based access across all endpoints', async () => {
      // Test client access
      mockDashboardService.getUserDashboardData.mockResolvedValue(mockUserDashboard);
      await expect(controller.getUserDashboard(TEST_USER_IDS.CLIENT, 'client')).resolves.toBeDefined();
      await expect(controller.getTherapistDashboard(TEST_USER_IDS.CLIENT, 'client')).rejects.toThrow();
      await expect(controller.getAdminDashboard('client')).rejects.toThrow();

      // Test therapist access
      mockDashboardService.getTherapistDashboardData.mockResolvedValue(mockTherapistDashboard);
      await expect(controller.getUserDashboard(TEST_USER_IDS.THERAPIST, 'therapist')).rejects.toThrow();
      await expect(controller.getTherapistDashboard(TEST_USER_IDS.THERAPIST, 'therapist')).resolves.toBeDefined();
      await expect(controller.getAdminDashboard('therapist')).rejects.toThrow();

      // Test admin access
      mockDashboardService.getAdminDashboardData.mockResolvedValue(mockAdminDashboard);
      await expect(controller.getUserDashboard(TEST_USER_IDS.ADMIN, 'admin')).rejects.toThrow();
      await expect(controller.getTherapistDashboard(TEST_USER_IDS.ADMIN, 'admin')).rejects.toThrow();
      await expect(controller.getAdminDashboard('admin')).resolves.toBeDefined();
    });
  });
});