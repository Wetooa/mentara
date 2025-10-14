/**
 * Test Suite for AdminModerationController
 * Tests basic admin moderation functionality for content review
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/core/guards/admin-auth.guard';

describe('AdminModerationController', () => {
  let controller: AdminModerationController;
  let adminService: AdminService;
  let module: TestingModule;

  // Mock AdminService
  const mockAdminService = {
    getFlaggedContent: jest.fn(),
    moderateContent: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockAdminAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockFlaggedContent = {
    content: [
      {
        id: 'post_123456789',
        type: 'post',
        content: 'This post contains inappropriate content',
        authorId: 'user_client_123',
        authorName: 'John Doe',
        communityId: 'community_123',
        communityName: 'Anxiety Support',
        flaggedAt: new Date('2024-02-14T10:00:00Z'),
        flaggedBy: 'user_moderator_123',
        flagReason: 'Inappropriate content',
        flagCount: 3,
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 'comment_987654321',
        type: 'comment',
        content: 'This comment violates community guidelines',
        authorId: 'user_client_456',
        authorName: 'Jane Smith',
        parentPostId: 'post_parent_123',
        flaggedAt: new Date('2024-02-14T11:00:00Z'),
        flaggedBy: 'system',
        flagReason: 'Automated detection',
        flagCount: 1,
        status: 'pending',
        priority: 'high',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    },
    summary: {
      totalFlagged: 2,
      pendingReview: 2,
      approved: 0,
      removed: 0,
      highPriority: 1,
      mediumPriority: 1,
      lowPriority: 0,
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdminModerationController],
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

    controller = module.get<AdminModerationController>(AdminModerationController);
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
      const guards = Reflect.getMetadata('__guards__', AdminModerationController);
      expect(guards).toContain(JwtAuthGuard);
      expect(guards).toContain(AdminAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AdminModerationController);
      expect(controllerMetadata).toBe('admin/moderation');
    });

    it('should have AdminOnly decorators on all methods', () => {
      const methods = [
        'getFlaggedContent',
        'moderateContent',
      ];
      
      methods.forEach(method => {
        const metadata = Reflect.getMetadata('admin_only', controller[method as keyof AdminModerationController]);
        expect(metadata).toBeTruthy();
      });
    });
  });

  describe('GET /admin/moderation/flagged', () => {
    it('should get flagged content with default pagination', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      const result = await controller.getFlaggedContent('admin_123');

      expect(result).toEqual(mockFlaggedContent);
      expect(adminService.getFlaggedContent).toHaveBeenCalledWith({
        type: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should get flagged content with custom parameters', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      const result = await controller.getFlaggedContent('admin_123', 'post', '2', '20');

      expect(result).toEqual(mockFlaggedContent);
      expect(adminService.getFlaggedContent).toHaveBeenCalledWith({
        type: 'post',
        page: 2,
        limit: 20,
      });
    });

    it('should filter by content type', async () => {
      const contentTypes = ['post', 'comment', 'message', 'profile'];
      
      for (const type of contentTypes) {
        const filteredContent = {
          ...mockFlaggedContent,
          content: mockFlaggedContent.content.filter(item => item.type === type),
        };
        mockAdminService.getFlaggedContent.mockResolvedValue(filteredContent);

        const result = await controller.getFlaggedContent('admin_123', type);

        expect(adminService.getFlaggedContent).toHaveBeenCalledWith(
          expect.objectContaining({ type })
        );
      }
    });

    it('should handle invalid pagination parameters', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      // Test with invalid string values that should be converted
      const result = await controller.getFlaggedContent('admin_123', undefined, 'invalid', 'invalid');

      expect(adminService.getFlaggedContent).toHaveBeenCalledWith({
        type: undefined,
        page: NaN,
        limit: NaN,
      });
    });

    it('should handle empty flagged content', async () => {
      const emptyContent = {
        content: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        summary: { totalFlagged: 0, pendingReview: 0, approved: 0, removed: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 },
      };
      mockAdminService.getFlaggedContent.mockResolvedValue(emptyContent);

      const result = await controller.getFlaggedContent('admin_123');

      expect(result.content).toHaveLength(0);
      expect(result.summary.totalFlagged).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockAdminService.getFlaggedContent.mockRejectedValue(serviceError);

      await expect(controller.getFlaggedContent('admin_123')).rejects.toThrow(HttpException);
      await expect(controller.getFlaggedContent('admin_123')).rejects.toThrow('Failed to retrieve flagged content');
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      await controller.getFlaggedContent('admin_123');

      expect(logSpy).toHaveBeenCalledWith('Admin admin_123 retrieving flagged content');
    });
  });

  describe('PUT /admin/moderation/:contentType/:contentId/moderate', () => {
    const contentType = 'post';
    const contentId = 'post_123456789';
    const moderationData = {
      action: 'remove' as const,
      reason: 'Violates community guidelines',
    };

    it('should moderate content successfully', async () => {
      const moderatedContent = {
        id: contentId,
        type: contentType,
        status: 'removed',
        moderatedBy: 'admin_123',
        moderatedAt: new Date(),
        action: moderationData.action,
        reason: moderationData.reason,
      };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

      const result = await controller.moderateContent(
        'admin_123',
        contentType,
        contentId,
        moderationData
      );

      expect(result).toEqual(moderatedContent);
      expect(adminService.moderateContent).toHaveBeenCalledWith(
        contentType,
        contentId,
        'admin_123',
        moderationData.action,
        moderationData.reason
      );
    });

    it('should handle all moderation actions', async () => {
      const actions = ['approve', 'remove', 'flag'] as const;
      
      for (const action of actions) {
        const data = { action, reason: `Test ${action} action` };
        const moderatedContent = {
          id: contentId,
          type: contentType,
          status: action === 'approve' ? 'approved' : action === 'remove' ? 'removed' : 'flagged',
          action,
        };
        mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

        const result = await controller.moderateContent(
          'admin_123',
          contentType,
          contentId,
          data
        );

        expect(result.action).toBe(action);
      }
    });

    it('should handle different content types', async () => {
      const contentTypes = ['post', 'comment', 'message', 'profile'];
      
      for (const type of contentTypes) {
        const moderatedContent = {
          id: contentId,
          type,
          status: 'approved',
          action: 'approve',
        };
        mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

        const result = await controller.moderateContent(
          'admin_123',
          type,
          contentId,
          { action: 'approve' }
        );

        expect(result.type).toBe(type);
        expect(adminService.moderateContent).toHaveBeenCalledWith(
          type,
          contentId,
          'admin_123',
          'approve',
          undefined
        );
      }
    });

    it('should handle moderation without reason', async () => {
      const dataWithoutReason = { action: 'approve' as const };
      const moderatedContent = {
        id: contentId,
        type: contentType,
        status: 'approved',
        action: 'approve',
      };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

      const result = await controller.moderateContent(
        'admin_123',
        contentType,
        contentId,
        dataWithoutReason
      );

      expect(result).toEqual(moderatedContent);
      expect(adminService.moderateContent).toHaveBeenCalledWith(
        contentType,
        contentId,
        'admin_123',
        'approve',
        undefined
      );
    });

    it('should handle content not found', async () => {
      const notFoundError = new Error('Content not found');
      mockAdminService.moderateContent.mockRejectedValue(notFoundError);

      await expect(
        controller.moderateContent('admin_123', contentType, 'non-existent-id', moderationData)
      ).rejects.toThrow(HttpException);
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const moderatedContent = { id: contentId, status: 'removed' };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

      await controller.moderateContent('admin_123', contentType, contentId, moderationData);

      expect(logSpy).toHaveBeenCalledWith(`Admin admin_123 moderating ${contentType} ${contentId}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockAdminService.getFlaggedContent.mockRejectedValue(serviceError);

      await expect(controller.getFlaggedContent('admin_123')).rejects.toThrow(HttpException);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminService.moderateContent.mockRejectedValue(dbError);

      await expect(
        controller.moderateContent('admin_123', 'post', 'post_123', { action: 'approve' })
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted flagged content response', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      const result = await controller.getFlaggedContent('admin_123');

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.content)).toBe(true);
      result.content.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('content');
        expect(item).toHaveProperty('authorId');
        expect(item).toHaveProperty('flaggedAt');
        expect(['pending', 'approved', 'removed']).toContain(item.status);
        expect(['low', 'medium', 'high']).toContain(item.priority);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete moderation workflow', async () => {
      // Get flagged content
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);
      const flaggedContent = await controller.getFlaggedContent('admin_123');
      expect(flaggedContent.content).toHaveLength(2);

      // Moderate content
      const moderatedContent = { id: 'post_123', status: 'removed' };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);
      const moderation = await controller.moderateContent(
        'admin_123',
        'post',
        'post_123',
        { action: 'remove', reason: 'Inappropriate content' }
      );
      expect(moderation.status).toBe('removed');
    });
  });
});