/**
 * Comprehensive Test Suite for AdminUserController
 * Tests admin functionality for managing users, suspensions, and user queries
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/core/guards/admin-auth.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let adminService: AdminService;
  let module: TestingModule;

  // Mock AdminService
  const mockAdminService = {
    getAllUsers: jest.fn(),
    getUser: jest.fn(),
    suspendUser: jest.fn(),
    unsuspendUser: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockUser = {
    id: TEST_USER_IDS.CLIENT,
    email: TEST_EMAILS.CLIENT,
    firstName: 'John',
    lastName: 'Doe',
    role: 'client',
    status: 'active',
    isEmailVerified: true,
    lastLoginAt: new Date('2024-02-14T10:00:00Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
    profile: {
      dateOfBirth: new Date('1990-05-15'),
      phoneNumber: '+1234567890',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567891',
        relationship: 'spouse',
      },
    },
    preferences: {
      therapistGender: 'no-preference',
      sessionType: 'video',
      language: 'english',
    },
    suspensionHistory: [],
  };

  const mockTherapist = {
    id: TEST_USER_IDS.THERAPIST,
    email: TEST_EMAILS.THERAPIST,
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    role: 'therapist',
    status: 'active',
    isEmailVerified: true,
    lastLoginAt: new Date('2024-02-14T08:00:00Z'),
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-02-14T08:00:00Z'),
    profile: {
      licenseNumber: 'PSY123456',
      specializations: ['anxiety', 'depression'],
      yearsOfExperience: 8,
      hourlyRate: 150,
    },
    suspensionHistory: [],
  };

  const mockUsersList = {
    users: [mockUser, mockTherapist],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    summary: {
      totalUsers: 2,
      activeUsers: 2,
      suspendedUsers: 0,
      roleBreakdown: {
        client: 1,
        therapist: 1,
        admin: 0,
        admin: 0,
      },
    },
  };

  const mockSuspendedUser = {
    ...mockUser,
    status: 'suspended',
    suspension: {
      reason: 'Policy violation',
      suspendedAt: new Date(),
      suspendedBy: TEST_USER_IDS.ADMIN,
      duration: 30, // days
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminUserController],
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

    controller = module.get<AdminUserController>(AdminUserController);
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
      const guards = Reflect.getMetadata('__guards__', AdminUserController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(AdminAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AdminUserController);
      expect(controllerMetadata).toBe('admin/users');
    });

    it('should have AdminOnly decorators on all methods', () => {
      const methods = ['getAllUsers', 'getUser', 'suspendUser', 'unsuspendUser'];
      
      methods.forEach(method => {
        const metadata = Reflect.getMetadata('admin_only', controller[method as keyof AdminUserController]);
        expect(metadata).toBeTruthy();
      });
    });
  });

  describe('GET /admin/users', () => {
    const mockQuery = {
      page: 1,
      limit: 20,
      role: 'client' as const,
      search: 'john',
      status: 'active' as const,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    it('should get all users successfully', async () => {
      mockAdminService.getAllUsers.mockResolvedValue(mockUsersList);

      const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, mockQuery);

      expect(result).toEqual(mockUsersList);
      expect(adminService.getAllUsers).toHaveBeenCalledWith({
        role: mockQuery.role,
        page: mockQuery.page,
        limit: mockQuery.limit,
        search: mockQuery.search,
        status: mockQuery.status,
        sortBy: mockQuery.sortBy,
        sortOrder: mockQuery.sortOrder,
      });
    });

    it('should get users without filters', async () => {
      const emptyQuery = {};
      mockAdminService.getAllUsers.mockResolvedValue(mockUsersList);

      const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, emptyQuery);

      expect(result).toEqual(mockUsersList);
      expect(adminService.getAllUsers).toHaveBeenCalledWith({
        role: undefined,
        page: undefined,
        limit: undefined,
        search: undefined,
        status: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
    });

    it('should filter by role correctly', async () => {
      const roleQueries = ['client', 'therapist', 'admin'] as const;
      
      for (const role of roleQueries) {
        const query = { role };
        const filteredUsers = {
          ...mockUsersList,
          users: mockUsersList.users.filter(user => user.role === role),
        };
        mockAdminService.getAllUsers.mockResolvedValue(filteredUsers);

        const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, query);

        expect(result.users.every(user => user.role === role)).toBe(true);
        expect(adminService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ role }));
      }
    });

    it('should filter by status correctly', async () => {
      const statusQueries = ['active', 'suspended', 'inactive'] as const;
      
      for (const status of statusQueries) {
        const query = { status };
        const filteredUsers = {
          ...mockUsersList,
          users: mockUsersList.users.filter(user => user.status === status),
        };
        mockAdminService.getAllUsers.mockResolvedValue(filteredUsers);

        const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, query);

        expect(adminService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ status }));
      }
    });

    it('should handle search functionality', async () => {
      const searchQueries = ['john', 'doe', 'sarah', 'smith', 'test@example.com'];
      
      for (const search of searchQueries) {
        const query = { search };
        const searchResults = {
          ...mockUsersList,
          users: mockUsersList.users.filter(user => 
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
          ),
        };
        mockAdminService.getAllUsers.mockResolvedValue(searchResults);

        const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, query);

        expect(adminService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining({ search }));
      }
    });

    it('should handle pagination correctly', async () => {
      const paginatedQuery = { page: 2, limit: 10 };
      const paginatedResult = {
        ...mockUsersList,
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
          hasNext: true,
          hasPrev: true,
        },
      };
      mockAdminService.getAllUsers.mockResolvedValue(paginatedResult);

      const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, paginatedQuery);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle sorting options', async () => {
      const sortOptions = [
        { sortBy: 'createdAt', sortOrder: 'desc' },
        { sortBy: 'lastLoginAt', sortOrder: 'asc' },
        { sortBy: 'email', sortOrder: 'asc' },
        { sortBy: 'status', sortOrder: 'desc' },
      ] as const;

      for (const sortOption of sortOptions) {
        const query = sortOption;
        mockAdminService.getAllUsers.mockResolvedValue(mockUsersList);

        const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, query);

        expect(adminService.getAllUsers).toHaveBeenCalledWith(expect.objectContaining(sortOption));
      }
    });

    it('should handle empty results', async () => {
      const emptyResult = {
        users: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        summary: { totalUsers: 0, activeUsers: 0, suspendedUsers: 0, roleBreakdown: { client: 0, therapist: 0, admin: 0, admin: 0 } },
      };
      mockAdminService.getAllUsers.mockResolvedValue(emptyResult);

      const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, {});

      expect(result.users).toEqual([]);
      expect(result.summary.totalUsers).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockAdminService.getAllUsers.mockRejectedValue(serviceError);

      await expect(controller.getAllUsers(TEST_USER_IDS.ADMIN, {})).rejects.toThrow(HttpException);
      await expect(controller.getAllUsers(TEST_USER_IDS.ADMIN, {})).rejects.toThrow('Failed to retrieve users');
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAdminService.getAllUsers.mockResolvedValue(mockUsersList);

      await controller.getAllUsers(TEST_USER_IDS.ADMIN, {});

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} retrieving users`);
    });
  });

  describe('GET /admin/users/:id', () => {
    const userId = TEST_USER_IDS.CLIENT;

    it('should get user by id successfully', async () => {
      mockAdminService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser(TEST_USER_IDS.ADMIN, userId);

      expect(result).toEqual(mockUser);
      expect(adminService.getUser).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found', async () => {
      mockAdminService.getUser.mockResolvedValue(null);

      await expect(controller.getUser(TEST_USER_IDS.ADMIN, 'non-existent-id')).rejects.toThrow(HttpException);
      await expect(controller.getUser(TEST_USER_IDS.ADMIN, 'non-existent-id')).rejects.toThrow('User not found');
    });

    it('should return complete user details', async () => {
      const detailedUser = {
        ...mockUser,
        sessions: [
          { id: 'session_1', date: new Date(), status: 'completed' },
          { id: 'session_2', date: new Date(), status: 'scheduled' },
        ],
        tickets: [
          { id: 'ticket_1', subject: 'Login issue', status: 'resolved' },
        ],
        activityLog: [
          { action: 'login', timestamp: new Date(), ip: '192.168.1.1' },
          { action: 'profile_update', timestamp: new Date(), ip: '192.168.1.1' },
        ],
      };
      mockAdminService.getUser.mockResolvedValue(detailedUser);

      const result = await controller.getUser(TEST_USER_IDS.ADMIN, userId);

      expect(result.sessions).toBeDefined();
      expect(result.tickets).toBeDefined();
      expect(result.activityLog).toBeDefined();
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(Array.isArray(result.tickets)).toBe(true);
      expect(Array.isArray(result.activityLog)).toBe(true);
    });

    it('should handle service errors gracefully', async () => {
      const serviceError = new Error('Database error');
      mockAdminService.getUser.mockRejectedValue(serviceError);

      await expect(controller.getUser(TEST_USER_IDS.ADMIN, userId)).rejects.toThrow(HttpException);
      await expect(controller.getUser(TEST_USER_IDS.ADMIN, userId)).rejects.toThrow('Failed to retrieve user');
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAdminService.getUser.mockResolvedValue(mockUser);

      await controller.getUser(TEST_USER_IDS.ADMIN, userId);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} retrieving user ${userId}`);
    });

    it('should handle different user roles', async () => {
      const userRoles = ['client', 'therapist', 'admin'];
      
      for (const role of userRoles) {
        const roleUser = { ...mockUser, role };
        mockAdminService.getUser.mockResolvedValue(roleUser);

        const result = await controller.getUser(TEST_USER_IDS.ADMIN, userId);

        expect(result.role).toBe(role);
      }
    });
  });

  describe('PUT /admin/users/:id/suspend', () => {
    const userId = TEST_USER_IDS.CLIENT;
    const suspensionData = {
      reason: 'Policy violation - inappropriate behavior',
      duration: 30, // 30 days
    };

    it('should suspend user successfully', async () => {
      mockAdminService.suspendUser.mockResolvedValue(mockSuspendedUser);

      const result = await controller.suspendUser(TEST_USER_IDS.ADMIN, userId, suspensionData);

      expect(result).toEqual(mockSuspendedUser);
      expect(result.status).toBe('suspended');
      expect(adminService.suspendUser).toHaveBeenCalledWith(
        userId,
        TEST_USER_IDS.ADMIN,
        suspensionData.reason,
        suspensionData.duration,
      );
    });

    it('should suspend user without duration (permanent)', async () => {
      const permanentSuspension = { reason: 'Severe policy violation' };
      const permanentlySuspendedUser = {
        ...mockSuspendedUser,
        suspension: {
          ...mockSuspendedUser.suspension,
          duration: null,
          expiresAt: null,
        },
      };
      mockAdminService.suspendUser.mockResolvedValue(permanentlySuspendedUser);

      const result = await controller.suspendUser(TEST_USER_IDS.ADMIN, userId, permanentSuspension);

      expect(result.suspension.duration).toBeNull();
      expect(result.suspension.expiresAt).toBeNull();
      expect(adminService.suspendUser).toHaveBeenCalledWith(
        userId,
        TEST_USER_IDS.ADMIN,
        permanentSuspension.reason,
        undefined,
      );
    });

    it('should handle different suspension reasons', async () => {
      const suspensionReasons = [
        'Policy violation',
        'Inappropriate behavior',
        'Terms of service violation',
        'Security concerns',
        'Payment issues',
        'Abuse of platform',
      ];

      for (const reason of suspensionReasons) {
        const data = { reason, duration: 15 };
        const suspendedUser = {
          ...mockSuspendedUser,
          suspension: { ...mockSuspendedUser.suspension, reason },
        };
        mockAdminService.suspendUser.mockResolvedValue(suspendedUser);

        const result = await controller.suspendUser(TEST_USER_IDS.ADMIN, userId, data);

        expect(result.suspension.reason).toBe(reason);
      }
    });

    it('should handle different suspension durations', async () => {
      const durations = [1, 7, 14, 30, 90, 365]; // days
      
      for (const duration of durations) {
        const data = { reason: 'Policy violation', duration };
        const suspendedUser = {
          ...mockSuspendedUser,
          suspension: { ...mockSuspendedUser.suspension, duration },
        };
        mockAdminService.suspendUser.mockResolvedValue(suspendedUser);

        const result = await controller.suspendUser(TEST_USER_IDS.ADMIN, userId, data);

        expect(result.suspension.duration).toBe(duration);
      }
    });

    it('should handle user not found', async () => {
      const notFoundError = new Error('User not found');
      mockAdminService.suspendUser.mockRejectedValue(notFoundError);

      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, 'non-existent-id', suspensionData)
      ).rejects.toThrow(HttpException);
      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, 'non-existent-id', suspensionData)
      ).rejects.toThrow('Failed to suspend user');
    });

    it('should handle already suspended user', async () => {
      const alreadySuspendedError = new Error('User is already suspended');
      mockAdminService.suspendUser.mockRejectedValue(alreadySuspendedError);

      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, userId, suspensionData)
      ).rejects.toThrow(HttpException);
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAdminService.suspendUser.mockResolvedValue(mockSuspendedUser);

      await controller.suspendUser(TEST_USER_IDS.ADMIN, userId, suspensionData);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} suspending user ${userId}`);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database transaction failed');
      mockAdminService.suspendUser.mockRejectedValue(serviceError);

      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, userId, suspensionData)
      ).rejects.toThrow(HttpException);
      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, userId, suspensionData)
      ).rejects.toThrow('Failed to suspend user');
    });
  });

  describe('PUT /admin/users/:id/unsuspend', () => {
    const userId = TEST_USER_IDS.CLIENT;

    it('should unsuspend user successfully', async () => {
      const unsuspendedUser = {
        ...mockUser,
        status: 'active',
        suspensionHistory: [{
          reason: 'Policy violation',
          suspendedAt: new Date(Date.now() - 86400000), // 1 day ago
          suspendedBy: TEST_USER_IDS.ADMIN,
          unsuspendedAt: new Date(),
          unsuspendedBy: TEST_USER_IDS.ADMIN,
        }],
      };
      mockAdminService.unsuspendUser.mockResolvedValue(unsuspendedUser);

      const result = await controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId);

      expect(result).toEqual(unsuspendedUser);
      expect(result.status).toBe('active');
      expect(adminService.unsuspendUser).toHaveBeenCalledWith(userId, TEST_USER_IDS.ADMIN);
    });

    it('should handle user not found', async () => {
      const notFoundError = new Error('User not found');
      mockAdminService.unsuspendUser.mockRejectedValue(notFoundError);

      await expect(
        controller.unsuspendUser(TEST_USER_IDS.ADMIN, 'non-existent-id')
      ).rejects.toThrow(HttpException);
      await expect(
        controller.unsuspendUser(TEST_USER_IDS.ADMIN, 'non-existent-id')
      ).rejects.toThrow('Failed to unsuspend user');
    });

    it('should handle user not suspended', async () => {
      const notSuspendedError = new Error('User is not suspended');
      mockAdminService.unsuspendUser.mockRejectedValue(notSuspendedError);

      await expect(
        controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId)
      ).rejects.toThrow(HttpException);
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const unsuspendedUser = { ...mockUser, status: 'active' };
      mockAdminService.unsuspendUser.mockResolvedValue(unsuspendedUser);

      await controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} unsuspending user ${userId}`);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database update failed');
      mockAdminService.unsuspendUser.mockRejectedValue(serviceError);

      await expect(
        controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId)
      ).rejects.toThrow(HttpException);
      await expect(
        controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId)
      ).rejects.toThrow('Failed to unsuspend user');
    });

    it('should restore user privileges after unsuspension', async () => {
      const unsuspendedUser = {
        ...mockUser,
        status: 'active',
        privileges: {
          canLogin: true,
          canBookSessions: true,
          canAccessCommunity: true,
          canSendMessages: true,
        },
        suspensionHistory: [{
          reason: 'Policy violation',
          suspendedAt: new Date(Date.now() - 86400000),
          suspendedBy: TEST_USER_IDS.ADMIN,
          unsuspendedAt: new Date(),
          unsuspendedBy: TEST_USER_IDS.ADMIN,
        }],
      };
      mockAdminService.unsuspendUser.mockResolvedValue(unsuspendedUser);

      const result = await controller.unsuspendUser(TEST_USER_IDS.ADMIN, userId);

      expect(result.privileges.canLogin).toBe(true);
      expect(result.privileges.canBookSessions).toBe(true);
      expect(result.privileges.canAccessCommunity).toBe(true);
      expect(result.privileges.canSendMessages).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockAdminService.getAllUsers.mockRejectedValue(serviceError);

      await expect(controller.getAllUsers(TEST_USER_IDS.ADMIN, {})).rejects.toThrow(HttpException);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminService.getUser.mockRejectedValue(dbError);

      await expect(controller.getUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT)).rejects.toThrow(HttpException);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid user data');
      mockAdminService.suspendUser.mockRejectedValue(validationError);

      await expect(
        controller.suspendUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT, { reason: '' })
      ).rejects.toThrow(HttpException);
    });

    it('should preserve HttpExceptions from service layer', async () => {
      const httpException = new HttpException('User not found', HttpStatus.NOT_FOUND);
      mockAdminService.getUser.mockRejectedValue(httpException);

      await expect(controller.getUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT)).rejects.toThrow(httpException);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted users list response', async () => {
      mockAdminService.getAllUsers.mockResolvedValue(mockUsersList);

      const result = await controller.getAllUsers(TEST_USER_IDS.ADMIN, {});

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.users)).toBe(true);
      result.users.forEach((user) => {
        TestAssertions.expectValidEntity(user, ['id', 'email', 'firstName', 'lastName', 'role', 'status']);
        expect(['client', 'therapist', 'admin']).toContain(user.role);
        expect(['active', 'suspended', 'inactive']).toContain(user.status);
      });
    });

    it('should return properly formatted user details response', async () => {
      mockAdminService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT);

      TestAssertions.expectValidEntity(result, ['id', 'email', 'firstName', 'lastName', 'role', 'status']);
      expect(result.isEmailVerified).toBeDefined();
      expect(typeof result.isEmailVerified).toBe('boolean');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return properly formatted suspension response', async () => {
      mockAdminService.suspendUser.mockResolvedValue(mockSuspendedUser);

      const result = await controller.suspendUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT, {
        reason: 'Policy violation',
        duration: 30,
      });

      expect(result.status).toBe('suspended');
      expect(result.suspension).toBeDefined();
      expect(result.suspension.reason).toBeDefined();
      expect(result.suspension.suspendedAt).toBeInstanceOf(Date);
      expect(result.suspension.suspendedBy).toBe(TEST_USER_IDS.ADMIN);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user management workflow', async () => {
      // Get user details
      mockAdminService.getUser.mockResolvedValue(mockUser);
      const user = await controller.getUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT);
      expect(user).toBeDefined();
      expect(user.status).toBe('active');

      // Suspend user
      mockAdminService.suspendUser.mockResolvedValue(mockSuspendedUser);
      const suspendedUser = await controller.suspendUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT, {
        reason: 'Policy violation',
        duration: 30,
      });
      expect(suspendedUser.status).toBe('suspended');

      // Unsuspend user
      const unsuspendedUser = { ...mockUser, status: 'active' };
      mockAdminService.unsuspendUser.mockResolvedValue(unsuspendedUser);
      const restoredUser = await controller.unsuspendUser(TEST_USER_IDS.ADMIN, TEST_USER_IDS.CLIENT);
      expect(restoredUser.status).toBe('active');
    });

    it('should handle user search and filtering workflow', async () => {
      // Search for users by name
      const searchResults = {
        ...mockUsersList,
        users: [mockUser],
      };
      mockAdminService.getAllUsers.mockResolvedValue(searchResults);
      const searchResult = await controller.getAllUsers(TEST_USER_IDS.ADMIN, { search: 'john' });
      expect(searchResult.users).toHaveLength(1);

      // Filter by role
      const roleResults = {
        ...mockUsersList,
        users: [mockTherapist],
      };
      mockAdminService.getAllUsers.mockResolvedValue(roleResults);
      const roleResult = await controller.getAllUsers(TEST_USER_IDS.ADMIN, { role: 'therapist' });
      expect(roleResult.users.every(user => user.role === 'therapist')).toBe(true);

      // Filter by status
      const statusResults = {
        ...mockUsersList,
        users: mockUsersList.users.filter(user => user.status === 'active'),
      };
      mockAdminService.getAllUsers.mockResolvedValue(statusResults);
      const statusResult = await controller.getAllUsers(TEST_USER_IDS.ADMIN, { status: 'active' });
      expect(statusResult.users.every(user => user.status === 'active')).toBe(true);
    });
  });
});