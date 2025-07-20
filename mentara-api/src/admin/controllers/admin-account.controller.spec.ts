/**
 * Comprehensive Test Suite for AdminAccountController
 * Tests admin account management operations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AdminAccountController } from './admin-account.controller';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import {
  SecurityGuardTestUtils,
  RoleBasedTestUtils,
} from '../../test-utils/auth-testing-helpers';
import {
  MockBuilder,
  TestDataGenerator,
  TestAssertions,
} from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('AdminAccountController', () => {
  let controller: AdminAccountController;
  let adminService: AdminService;
  let module: TestingModule;

  // Mock AdminService
  const mockAdminService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockAdmin = {
    id: TEST_USER_IDS.ADMIN,
    userId: TEST_USER_IDS.ADMIN,
    email: TEST_EMAILS.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-02-14T10:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
  };

  const createAdminDto = {
    userId: 'user_123456789',
    email: 'newadmin@example.com',
    firstName: 'New',
    lastName: 'Admin',
  };

  const updateAdminDto = {
    firstName: 'Updated',
    lastName: 'Admin',
    isActive: false,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminAccountController],
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

    controller = module.get<AdminAccountController>(AdminAccountController);
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
      const guards = Reflect.getMetadata('__guards__', AdminAccountController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(AdminAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata(
        'path',
        AdminAccountController,
      );
      expect(controllerMetadata).toBe('admin/accounts');
    });

    it('should require admin role for all endpoints', () => {
      const adminOnlyMethods = [
        'create',
        'findAll',
        'findOne',
        'update',
        'remove',
      ];
      adminOnlyMethods.forEach((method) => {
        const metadata = Reflect.getMetadata('roles', controller[method]);
        expect(metadata).toEqual(['admin']);
      });
    });
  });

  describe('POST /admin/accounts', () => {
    it('should create admin successfully', async () => {
      mockAdminService.create.mockResolvedValue(mockAdmin);

      const result = await controller.create(
        createAdminDto,
        TEST_USER_IDS.ADMIN,
      );

      expect(result).toEqual(mockAdmin);
      expect(adminService.create).toHaveBeenCalledWith(createAdminDto);
    });

    it('should handle service errors during creation', async () => {
      const serviceError = new Error('User already exists');
      mockAdminService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create(createAdminDto, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should validate admin creation with proper DTO', async () => {
      mockAdminService.create.mockResolvedValue(mockAdmin);

      const validDto = {
        userId: 'user_123456789',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'Admin',
      };

      const result = await controller.create(validDto, TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockAdmin);
      expect(adminService.create).toHaveBeenCalledWith(validDto);
    });
  });

  describe('GET /admin/accounts', () => {
    it('should find all admins successfully', async () => {
      const admins = [mockAdmin];
      mockAdminService.findAll.mockResolvedValue(admins);

      const result = await controller.findAll(TEST_USER_IDS.ADMIN);

      expect(result).toEqual(admins);
      expect(adminService.findAll).toHaveBeenCalled();
    });

    it('should handle empty admin list', async () => {
      mockAdminService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(TEST_USER_IDS.ADMIN);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockAdminService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('GET /admin/accounts/:id', () => {
    it('should find one admin successfully', async () => {
      mockAdminService.findOne.mockResolvedValue(mockAdmin);

      const result = await controller.findOne('admin_123', TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockAdmin);
      expect(adminService.findOne).toHaveBeenCalledWith('admin_123');
    });

    it('should throw NOT_FOUND when admin does not exist', async () => {
      mockAdminService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('nonexistent_admin', TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(
        new HttpException('Admin not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database error');
      mockAdminService.findOne.mockRejectedValue(serviceError);

      await expect(
        controller.findOne('admin_123', TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should pass through HTTP exceptions from service', async () => {
      const httpError = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      mockAdminService.findOne.mockRejectedValue(httpError);

      await expect(
        controller.findOne('admin_123', TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(httpError);
    });
  });

  describe('PATCH /admin/accounts/:id', () => {
    it('should update admin successfully', async () => {
      const updatedAdmin = { ...mockAdmin, ...updateAdminDto };
      mockAdminService.update.mockResolvedValue(updatedAdmin);

      const result = await controller.update(
        'admin_123',
        updateAdminDto,
        TEST_USER_IDS.ADMIN,
      );

      expect(result).toEqual(updatedAdmin);
      expect(adminService.update).toHaveBeenCalledWith(
        'admin_123',
        updateAdminDto,
      );
    });

    it('should handle service errors during update', async () => {
      const serviceError = new Error('Admin not found');
      mockAdminService.update.mockRejectedValue(serviceError);

      await expect(
        controller.update('admin_123', updateAdminDto, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { firstName: 'UpdatedFirst' };
      const updatedAdmin = { ...mockAdmin, firstName: 'UpdatedFirst' };
      mockAdminService.update.mockResolvedValue(updatedAdmin);

      const result = await controller.update(
        'admin_123',
        partialUpdate,
        TEST_USER_IDS.ADMIN,
      );

      expect(result).toEqual(updatedAdmin);
      expect(adminService.update).toHaveBeenCalledWith(
        'admin_123',
        partialUpdate,
      );
    });
  });

  describe('DELETE /admin/accounts/:id', () => {
    it('should remove admin successfully', async () => {
      mockAdminService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('admin_123', TEST_USER_IDS.ADMIN);

      expect(result).toEqual({ message: 'Admin user deleted successfully' });
      expect(adminService.remove).toHaveBeenCalledWith('admin_123');
    });

    it('should prevent self-deletion', async () => {
      await expect(
        controller.remove(TEST_USER_IDS.ADMIN, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(
        new HttpException(
          'Cannot delete your own admin account',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(adminService.remove).not.toHaveBeenCalled();
    });

    it('should handle service errors during removal', async () => {
      const serviceError = new Error('Admin not found');
      mockAdminService.remove.mockRejectedValue(serviceError);

      await expect(
        controller.remove('admin_123', TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should pass through HTTP exceptions from service', async () => {
      const httpError = new HttpException(
        'Cannot delete admin',
        HttpStatus.CONFLICT,
      );
      mockAdminService.remove.mockRejectedValue(httpError);

      await expect(
        controller.remove('admin_123', TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(httpError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted admin response', async () => {
      mockAdminService.create.mockResolvedValue(mockAdmin);

      const result = await controller.create(
        createAdminDto,
        TEST_USER_IDS.ADMIN,
      );

      TestAssertions.expectValidEntity(result, [
        'id',
        'userId',
        'email',
        'firstName',
        'lastName',
      ]);
      expect(result.role).toBe('admin');
      expect(typeof result.isActive).toBe('boolean');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should return properly formatted admin list', async () => {
      const admins = [mockAdmin];
      mockAdminService.findAll.mockResolvedValue(admins);

      const result = await controller.findAll(TEST_USER_IDS.ADMIN);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((admin) => {
        TestAssertions.expectValidEntity(admin, ['id', 'userId', 'email']);
        expect(admin.role).toBe('admin');
      });
    });

    it('should return properly formatted deletion response', async () => {
      mockAdminService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('admin_123', TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toContain('deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockAdminService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(createAdminDto, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should handle duplicate admin creation', async () => {
      const duplicateError = new Error('Admin already exists');
      mockAdminService.create.mockRejectedValue(duplicateError);

      await expect(
        controller.create(createAdminDto, TEST_USER_IDS.ADMIN),
      ).rejects.toThrow(HttpException);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminService.findAll.mockRejectedValue(dbError);

      await expect(controller.findAll(TEST_USER_IDS.ADMIN)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete admin lifecycle', async () => {
      // Create admin
      mockAdminService.create.mockResolvedValue(mockAdmin);
      const createResult = await controller.create(
        createAdminDto,
        TEST_USER_IDS.ADMIN,
      );
      expect(createResult.id).toBeDefined();

      // Find created admin
      mockAdminService.findOne.mockResolvedValue(mockAdmin);
      const findResult = await controller.findOne(
        mockAdmin.id,
        TEST_USER_IDS.ADMIN,
      );
      expect(findResult.id).toBe(mockAdmin.id);

      // Update admin
      const updatedAdmin = { ...mockAdmin, firstName: 'Updated' };
      mockAdminService.update.mockResolvedValue(updatedAdmin);
      const updateResult = await controller.update(
        mockAdmin.id,
        { firstName: 'Updated' },
        TEST_USER_IDS.ADMIN,
      );
      expect(updateResult.firstName).toBe('Updated');

      // List all admins
      mockAdminService.findAll.mockResolvedValue([updatedAdmin]);
      const listResult = await controller.findAll(TEST_USER_IDS.ADMIN);
      expect(listResult).toHaveLength(1);

      // Remove admin
      mockAdminService.remove.mockResolvedValue(undefined);
      const removeResult = await controller.remove(
        mockAdmin.id,
        TEST_USER_IDS.ADMIN,
      );
      expect(removeResult.message).toContain('deleted successfully');
    });

    it('should validate admin management permissions', async () => {
      // All operations should require admin authentication
      const operations = [
        () => controller.create(createAdminDto, TEST_USER_IDS.ADMIN),
        () => controller.findAll(TEST_USER_IDS.ADMIN),
        () => controller.findOne('admin_123', TEST_USER_IDS.ADMIN),
        () =>
          controller.update('admin_123', updateAdminDto, TEST_USER_IDS.ADMIN),
        () => controller.remove('admin_123', TEST_USER_IDS.ADMIN),
      ];

      // Mock successful responses for permission validation
      mockAdminService.create.mockResolvedValue(mockAdmin);
      mockAdminService.findAll.mockResolvedValue([mockAdmin]);
      mockAdminService.findOne.mockResolvedValue(mockAdmin);
      mockAdminService.update.mockResolvedValue(mockAdmin);
      mockAdminService.remove.mockResolvedValue(undefined);

      // All operations should be accessible with admin auth
      for (const operation of operations) {
        await expect(operation()).resolves.toBeDefined();
      }
    });
  });
});
