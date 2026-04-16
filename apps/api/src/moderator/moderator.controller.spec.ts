/**
 * Comprehensive Test Suite for ModeratorController
 * Tests moderator CRUD operations and management functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ModeratorController } from './moderator.controller';
import { ModeratorService } from './moderator.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { Moderator, Prisma } from '@prisma/client';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('ModeratorController', () => {
  let controller: ModeratorController;
  let moderatorService: ModeratorService;
  let module: TestingModule;

  // Mock ModeratorService
  const mockModeratorService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockModerator: Moderator = {
    id: 'moderator_123456789',
    userId: TEST_USER_IDS.MODERATOR,
    role: 'content_moderator',
    permissions: ['view_posts', 'moderate_posts', 'delete_posts', 'ban_users'],
    assignedCommunities: ['community_1', 'community_2'],
    moderationLevel: 2,
    isActive: true,
    specializations: ['mental-health', 'crisis-intervention'],
    languages: ['english', 'spanish'],
    timezone: 'America/New_York',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
    },
    metrics: {
      totalActions: 245,
      postsModerated: 189,
      usersWarned: 32,
      usersBanned: 8,
      communitiesManaged: 2,
      averageResponseTime: 18.5, // minutes
    },
    createdAt: new Date('2024-01-15T00:00:00Z'),
    updatedAt: new Date('2024-02-14T10:00:00Z'),
  };

  const mockModeratorsList: Moderator[] = [
    mockModerator,
    {
      ...mockModerator,
      id: 'moderator_987654321',
      userId: 'user_moderator_2',
      role: 'senior_moderator',
      moderationLevel: 3,
      assignedCommunities: ['community_3', 'community_4', 'community_5'],
      specializations: ['eating-disorders', 'addiction'],
      metrics: {
        totalActions: 456,
        postsModerated: 334,
        usersWarned: 78,
        usersBanned: 23,
        communitiesManaged: 3,
        averageResponseTime: 12.3,
      },
    },
  ];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ModeratorController],
      providers: [
        {
          provide: ModeratorService,
          useValue: mockModeratorService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ModeratorController>(ModeratorController);
    moderatorService = module.get<ModeratorService>(ModeratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have moderatorService injected', () => {
      expect(moderatorService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ModeratorController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', ModeratorController);
      expect(controllerMetadata).toBe('moderator');
    });
  });

  describe('GET /moderator', () => {
    it('should get all moderators successfully', async () => {
      mockModeratorService.findAll.mockResolvedValue(mockModeratorsList);

      const result = await controller.findAll();

      expect(result).toEqual(mockModeratorsList);
      expect(result).toHaveLength(2);
      expect(moderatorService.findAll).toHaveBeenCalledWith();
    });

    it('should handle empty moderators list', async () => {
      mockModeratorService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockModeratorService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll()).rejects.toThrow(HttpException);
      await expect(controller.findAll()).rejects.toThrow('Failed to fetch moderators');
    });

    it('should return moderators with all required fields', async () => {
      mockModeratorService.findAll.mockResolvedValue(mockModeratorsList);

      const result = await controller.findAll();

      result.forEach((moderator) => {
        expect(moderator).toHaveProperty('id');
        expect(moderator).toHaveProperty('userId');
        expect(moderator).toHaveProperty('role');
        expect(moderator).toHaveProperty('permissions');
        expect(moderator).toHaveProperty('assignedCommunities');
        expect(moderator).toHaveProperty('moderationLevel');
        expect(moderator).toHaveProperty('isActive');
        expect(moderator).toHaveProperty('metrics');
        expect(Array.isArray(moderator.permissions)).toBe(true);
        expect(Array.isArray(moderator.assignedCommunities)).toBe(true);
        expect(typeof moderator.moderationLevel).toBe('number');
        expect(typeof moderator.isActive).toBe('boolean');
      });
    });

    it('should handle different moderator roles', async () => {
      const diverseModeratorsList = [
        { ...mockModerator, role: 'content_moderator' },
        { ...mockModerator, id: 'mod_2', role: 'senior_moderator' },
        { ...mockModerator, id: 'mod_3', role: 'community_manager' },
        { ...mockModerator, id: 'mod_4', role: 'crisis_moderator' },
      ];
      mockModeratorService.findAll.mockResolvedValue(diverseModeratorsList);

      const result = await controller.findAll();

      const roles = result.map(mod => mod.role);
      expect(roles).toContain('content_moderator');
      expect(roles).toContain('senior_moderator');
      expect(roles).toContain('community_manager');
      expect(roles).toContain('crisis_moderator');
    });
  });

  describe('GET /moderator/:id', () => {
    const moderatorId = 'moderator_123456789';

    it('should get moderator by id successfully', async () => {
      mockModeratorService.findOne.mockResolvedValue(mockModerator);

      const result = await controller.findOne(moderatorId);

      expect(result).toEqual(mockModerator);
      expect(moderatorService.findOne).toHaveBeenCalledWith(moderatorId);
    });

    it('should handle moderator not found', async () => {
      mockModeratorService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(HttpException);
      await expect(controller.findOne('non-existent-id')).rejects.toThrow('Moderator not found');
    });

    it('should return complete moderator details', async () => {
      const detailedModerator = {
        ...mockModerator,
        recentActions: [
          {
            id: 'action_1',
            type: 'post_moderation',
            target: 'post_123',
            action: 'approved',
            timestamp: new Date(),
            reason: 'Content appropriate',
          },
          {
            id: 'action_2',
            type: 'user_warning',
            target: 'user_456',
            action: 'warned',
            timestamp: new Date(),
            reason: 'Inappropriate language',
          },
        ],
        managedCommunities: [
          {
            id: 'community_1',
            name: 'Anxiety Support',
            memberCount: 1250,
            activeIssues: 3,
          },
          {
            id: 'community_2',
            name: 'Depression Recovery',
            memberCount: 890,
            activeIssues: 1,
          },
        ],
      };
      mockModeratorService.findOne.mockResolvedValue(detailedModerator);

      const result = await controller.findOne(moderatorId);

      expect(result.recentActions).toBeDefined();
      expect(result.managedCommunities).toBeDefined();
      expect(Array.isArray(result.recentActions)).toBe(true);
      expect(Array.isArray(result.managedCommunities)).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockModeratorService.findOne.mockRejectedValue(serviceError);

      await expect(controller.findOne(moderatorId)).rejects.toThrow(HttpException);
      await expect(controller.findOne(moderatorId)).rejects.toThrow('Failed to fetch moderator');
    });

    it('should preserve HttpExceptions from service layer', async () => {
      const httpException = new HttpException('Access denied', HttpStatus.FORBIDDEN);
      mockModeratorService.findOne.mockRejectedValue(httpException);

      await expect(controller.findOne(moderatorId)).rejects.toThrow(httpException);
    });
  });

  describe('POST /moderator', () => {
    const createModeratorDto: Prisma.ModeratorCreateInput = {
      userId: 'new_moderator_user_id',
      role: 'content_moderator',
      permissions: ['view_posts', 'moderate_posts'],
      assignedCommunities: ['community_1'],
      moderationLevel: 1,
      isActive: true,
      specializations: ['anxiety'],
      languages: ['english'],
      timezone: 'America/New_York',
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
      },
    };

    it('should create moderator successfully', async () => {
      const createdModerator = {
        ...mockModerator,
        ...createModeratorDto,
        id: 'new_moderator_123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockModeratorService.create.mockResolvedValue(createdModerator);

      const result = await controller.create(createModeratorDto);

      expect(result).toEqual(createdModerator);
      expect(result.userId).toBe(createModeratorDto.userId);
      expect(result.role).toBe(createModeratorDto.role);
      expect(moderatorService.create).toHaveBeenCalledWith(createModeratorDto);
    });

    it('should handle different moderator roles creation', async () => {
      const roles = ['content_moderator', 'senior_moderator', 'community_manager', 'crisis_moderator'];
      
      for (const role of roles) {
        const dto = { ...createModeratorDto, role };
        const createdModerator = {
          ...mockModerator,
          ...dto,
          id: `moderator_${role}_123`,
        };
        mockModeratorService.create.mockResolvedValue(createdModerator);

        const result = await controller.create(dto);

        expect(result.role).toBe(role);
      }
    });

    it('should handle different moderation levels', async () => {
      const levels = [1, 2, 3, 4, 5];
      
      for (const level of levels) {
        const dto = { ...createModeratorDto, moderationLevel: level };
        const createdModerator = {
          ...mockModerator,
          ...dto,
          id: `moderator_level_${level}`,
        };
        mockModeratorService.create.mockResolvedValue(createdModerator);

        const result = await controller.create(dto);

        expect(result.moderationLevel).toBe(level);
      }
    });

    it('should handle various permission combinations', async () => {
      const permissionSets = [
        ['view_posts'],
        ['view_posts', 'moderate_posts'],
        ['view_posts', 'moderate_posts', 'delete_posts'],
        ['view_posts', 'moderate_posts', 'delete_posts', 'ban_users'],
        ['view_posts', 'moderate_posts', 'manage_communities'],
      ];

      for (const permissions of permissionSets) {
        const dto = { ...createModeratorDto, permissions };
        const createdModerator = {
          ...mockModerator,
          ...dto,
          id: `moderator_perm_${permissions.length}`,
        };
        mockModeratorService.create.mockResolvedValue(createdModerator);

        const result = await controller.create(dto);

        expect(result.permissions).toEqual(permissions);
      }
    });

    it('should handle creation with multiple specializations', async () => {
      const specializations = [
        ['anxiety'],
        ['anxiety', 'depression'],
        ['anxiety', 'depression', 'trauma'],
        ['mental-health', 'crisis-intervention', 'eating-disorders'],
      ];

      for (const specs of specializations) {
        const dto = { ...createModeratorDto, specializations: specs };
        const createdModerator = {
          ...mockModerator,
          ...dto,
          id: `moderator_spec_${specs.length}`,
        };
        mockModeratorService.create.mockResolvedValue(createdModerator);

        const result = await controller.create(dto);

        expect(result.specializations).toEqual(specs);
      }
    });

    it('should handle creation errors', async () => {
      const creationError = new Error('User already has moderator role');
      mockModeratorService.create.mockRejectedValue(creationError);

      await expect(controller.create(createModeratorDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createModeratorDto)).rejects.toThrow('Failed to create moderator');
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid permission level');
      mockModeratorService.create.mockRejectedValue(validationError);

      await expect(controller.create(createModeratorDto)).rejects.toThrow(HttpException);
    });
  });

  describe('PUT /moderator/:id', () => {
    const moderatorId = 'moderator_123456789';
    const updateModeratorDto: Prisma.ModeratorUpdateInput = {
      role: 'senior_moderator',
      permissions: ['view_posts', 'moderate_posts', 'delete_posts', 'ban_users'],
      moderationLevel: 3,
      assignedCommunities: ['community_1', 'community_2', 'community_3'],
      specializations: ['anxiety', 'depression', 'trauma'],
    };

    it('should update moderator successfully', async () => {
      const updatedModerator = {
        ...mockModerator,
        ...updateModeratorDto,
        updatedAt: new Date(),
      };
      mockModeratorService.update.mockResolvedValue(updatedModerator);

      const result = await controller.update(moderatorId, updateModeratorDto);

      expect(result).toEqual(updatedModerator);
      expect(result.role).toBe(updateModeratorDto.role);
      expect(result.moderationLevel).toBe(updateModeratorDto.moderationLevel);
      expect(moderatorService.update).toHaveBeenCalledWith(moderatorId, updateModeratorDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { moderationLevel: 4 };
      const partiallyUpdatedModerator = {
        ...mockModerator,
        moderationLevel: 4,
        updatedAt: new Date(),
      };
      mockModeratorService.update.mockResolvedValue(partiallyUpdatedModerator);

      const result = await controller.update(moderatorId, partialUpdate);

      expect(result.moderationLevel).toBe(4);
      expect(result.role).toBe(mockModerator.role); // unchanged
    });

    it('should handle role promotion updates', async () => {
      const promotionUpdates = [
        { role: 'senior_moderator', moderationLevel: 3 },
        { role: 'community_manager', moderationLevel: 4 },
        { role: 'crisis_moderator', moderationLevel: 5 },
      ];

      for (const promotion of promotionUpdates) {
        const promotedModerator = {
          ...mockModerator,
          ...promotion,
          updatedAt: new Date(),
        };
        mockModeratorService.update.mockResolvedValue(promotedModerator);

        const result = await controller.update(moderatorId, promotion);

        expect(result.role).toBe(promotion.role);
        expect(result.moderationLevel).toBe(promotion.moderationLevel);
      }
    });

    it('should handle permission updates', async () => {
      const permissionUpdates = [
        { permissions: ['view_posts'] },
        { permissions: ['view_posts', 'moderate_posts'] },
        { permissions: ['view_posts', 'moderate_posts', 'delete_posts'] },
        { permissions: ['view_posts', 'moderate_posts', 'delete_posts', 'ban_users', 'manage_communities'] },
      ];

      for (const permUpdate of permissionUpdates) {
        const updatedModerator = {
          ...mockModerator,
          ...permUpdate,
          updatedAt: new Date(),
        };
        mockModeratorService.update.mockResolvedValue(updatedModerator);

        const result = await controller.update(moderatorId, permUpdate);

        expect(result.permissions).toEqual(permUpdate.permissions);
      }
    });

    it('should handle moderator not found', async () => {
      const notFoundError = new Error('Moderator not found');
      mockModeratorService.update.mockRejectedValue(notFoundError);

      await expect(controller.update('non-existent-id', updateModeratorDto)).rejects.toThrow(HttpException);
      await expect(controller.update('non-existent-id', updateModeratorDto)).rejects.toThrow('Failed to update moderator');
    });

    it('should handle active status changes', async () => {
      const statusChanges = [
        { isActive: false }, // deactivate
        { isActive: true },  // reactivate
      ];

      for (const statusChange of statusChanges) {
        const statusUpdatedModerator = {
          ...mockModerator,
          ...statusChange,
          updatedAt: new Date(),
        };
        mockModeratorService.update.mockResolvedValue(statusUpdatedModerator);

        const result = await controller.update(moderatorId, statusChange);

        expect(result.isActive).toBe(statusChange.isActive);
      }
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database update failed');
      mockModeratorService.update.mockRejectedValue(serviceError);

      await expect(controller.update(moderatorId, updateModeratorDto)).rejects.toThrow(HttpException);
    });
  });

  describe('DELETE /moderator/:id', () => {
    const moderatorId = 'moderator_123456789';

    it('should delete moderator successfully', async () => {
      mockModeratorService.remove.mockResolvedValue(mockModerator);

      const result = await controller.remove(moderatorId);

      expect(result).toEqual(mockModerator);
      expect(moderatorService.remove).toHaveBeenCalledWith(moderatorId);
    });

    it('should handle moderator not found', async () => {
      const notFoundError = new Error('Moderator not found');
      mockModeratorService.remove.mockRejectedValue(notFoundError);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(HttpException);
      await expect(controller.remove('non-existent-id')).rejects.toThrow('Failed to delete moderator');
    });

    it('should handle deletion with active assignments', async () => {
      const activeAssignmentError = new Error('Cannot delete moderator with active assignments');
      mockModeratorService.remove.mockRejectedValue(activeAssignmentError);

      await expect(controller.remove(moderatorId)).rejects.toThrow(HttpException);
    });

    it('should return deleted moderator data', async () => {
      const deletedModerator = {
        ...mockModerator,
        isActive: false,
        deletedAt: new Date(),
      };
      mockModeratorService.remove.mockResolvedValue(deletedModerator);

      const result = await controller.remove(moderatorId);

      expect(result).toEqual(deletedModerator);
      expect(result.id).toBe(moderatorId);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database transaction failed');
      mockModeratorService.remove.mockRejectedValue(serviceError);

      await expect(controller.remove(moderatorId)).rejects.toThrow(HttpException);
      await expect(controller.remove(moderatorId)).rejects.toThrow('Failed to delete moderator');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockModeratorService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockModeratorService.findOne.mockRejectedValue(dbError);

      await expect(controller.findOne('moderator_123')).rejects.toThrow(HttpException);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Invalid moderator data');
      mockModeratorService.create.mockRejectedValue(validationError);

      await expect(controller.create({} as any)).rejects.toThrow(HttpException);
    });

    it('should provide meaningful error messages', async () => {
      const specificError = new Error('User is already a moderator');
      mockModeratorService.create.mockRejectedValue(specificError);

      try {
        await controller.create({} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toContain('Failed to create moderator');
        expect(error.message).toContain('User is already a moderator');
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted moderator list response', async () => {
      mockModeratorService.findAll.mockResolvedValue(mockModeratorsList);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((moderator) => {
        TestAssertions.expectValidEntity(moderator, ['id', 'userId', 'role', 'permissions']);
        expect(typeof moderator.moderationLevel).toBe('number');
        expect(typeof moderator.isActive).toBe('boolean');
        expect(Array.isArray(moderator.permissions)).toBe(true);
        expect(Array.isArray(moderator.assignedCommunities)).toBe(true);
      });
    });

    it('should return properly formatted single moderator response', async () => {
      mockModeratorService.findOne.mockResolvedValue(mockModerator);

      const result = await controller.findOne('moderator_123');

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'role', 'permissions']);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.metrics).toBeDefined();
      expect(typeof result.metrics.totalActions).toBe('number');
      expect(typeof result.metrics.averageResponseTime).toBe('number');
    });

    it('should validate moderator permissions format', async () => {
      mockModeratorService.findOne.mockResolvedValue(mockModerator);

      const result = await controller.findOne('moderator_123');

      expect(Array.isArray(result.permissions)).toBe(true);
      result.permissions.forEach((permission) => {
        expect(typeof permission).toBe('string');
        expect(permission.length).toBeGreaterThan(0);
      });
    });

    it('should validate moderator metrics format', async () => {
      mockModeratorService.findOne.mockResolvedValue(mockModerator);

      const result = await controller.findOne('moderator_123');

      expect(result.metrics).toBeDefined();
      expect(typeof result.metrics.totalActions).toBe('number');
      expect(typeof result.metrics.postsModerated).toBe('number');
      expect(typeof result.metrics.usersWarned).toBe('number');
      expect(typeof result.metrics.usersBanned).toBe('number');
      expect(typeof result.metrics.averageResponseTime).toBe('number');
      expect(result.metrics.totalActions).toBeGreaterThanOrEqual(0);
      expect(result.metrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete moderator lifecycle', async () => {
      // Create moderator
      const createDto: Prisma.ModeratorCreateInput = {
        userId: 'new_user_123',
        role: 'content_moderator',
        permissions: ['view_posts', 'moderate_posts'],
        assignedCommunities: ['community_1'],
        moderationLevel: 1,
        isActive: true,
        specializations: ['anxiety'],
        languages: ['english'],
        timezone: 'America/New_York',
      };
      const createdModerator = { ...mockModerator, ...createDto, id: 'new_moderator_123' };
      mockModeratorService.create.mockResolvedValue(createdModerator);
      const createResult = await controller.create(createDto);
      expect(createResult.role).toBe('content_moderator');

      // Update moderator (promotion)
      const updateDto = { role: 'senior_moderator', moderationLevel: 3 };
      const updatedModerator = { ...createdModerator, ...updateDto };
      mockModeratorService.update.mockResolvedValue(updatedModerator);
      const updateResult = await controller.update(createdModerator.id, updateDto);
      expect(updateResult.role).toBe('senior_moderator');
      expect(updateResult.moderationLevel).toBe(3);

      // Get moderator details
      mockModeratorService.findOne.mockResolvedValue(updatedModerator);
      const getResult = await controller.findOne(createdModerator.id);
      expect(getResult).toEqual(updatedModerator);

      // Remove moderator
      mockModeratorService.remove.mockResolvedValue(updatedModerator);
      const removeResult = await controller.remove(createdModerator.id);
      expect(removeResult).toEqual(updatedModerator);
    });

    it('should handle moderator permission progression', async () => {
      // Start with basic permissions
      const basicModerator = {
        ...mockModerator,
        permissions: ['view_posts'],
        moderationLevel: 1,
      };
      mockModeratorService.findOne.mockResolvedValue(basicModerator);
      const basic = await controller.findOne('moderator_123');
      expect(basic.permissions).toEqual(['view_posts']);

      // Upgrade to moderate permissions
      const moderateUpdate = { permissions: ['view_posts', 'moderate_posts'] };
      const moderateModerator = { ...basicModerator, ...moderateUpdate };
      mockModeratorService.update.mockResolvedValue(moderateModerator);
      const moderate = await controller.update('moderator_123', moderateUpdate);
      expect(moderate.permissions).toContain('moderate_posts');

      // Upgrade to full permissions
      const fullUpdate = { permissions: ['view_posts', 'moderate_posts', 'delete_posts', 'ban_users'] };
      const fullModerator = { ...moderateModerator, ...fullUpdate };
      mockModeratorService.update.mockResolvedValue(fullModerator);
      const full = await controller.update('moderator_123', fullUpdate);
      expect(full.permissions).toContain('ban_users');
    });
  });
});