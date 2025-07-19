/**
 * Comprehensive Test Suite for AdminModerationController
 * Tests admin moderation functionality including content review and AI moderation service integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminService } from '../admin.service';
import { ModerationService, ModerationContext } from '../../common/services/moderation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('AdminModerationController', () => {
  let controller: AdminModerationController;
  let adminService: AdminService;
  let moderationService: ModerationService;
  let module: TestingModule;

  // Mock AdminService
  const mockAdminService = {
    getFlaggedContent: jest.fn(),
    moderateContent: jest.fn(),
  };

  // Mock ModerationService
  const mockModerationService = {
    healthCheck: jest.fn(),
    getStats: jest.fn(),
    classifyContent: jest.fn(),
    checkCrisisContent: jest.fn(),
    batchClassify: jest.fn(),
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
        authorId: TEST_USER_IDS.CLIENT,
        authorName: 'John Doe',
        communityId: 'community_123',
        communityName: 'Anxiety Support',
        flaggedAt: new Date('2024-02-14T10:00:00Z'),
        flaggedBy: TEST_USER_IDS.MODERATOR,
        flagReason: 'Inappropriate content',
        flagCount: 3,
        status: 'pending',
        priority: 'medium',
        aiConfidence: 0.85,
        aiTags: ['inappropriate', 'offensive'],
      },
      {
        id: 'comment_987654321',
        type: 'comment',
        content: 'This comment violates community guidelines',
        authorId: TEST_USER_IDS.CLIENT,
        authorName: 'Jane Smith',
        parentPostId: 'post_parent_123',
        flaggedAt: new Date('2024-02-14T11:00:00Z'),
        flaggedBy: 'system',
        flagReason: 'Automated detection',
        flagCount: 1,
        status: 'pending',
        priority: 'high',
        aiConfidence: 0.92,
        aiTags: ['harassment', 'toxic'],
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

  const mockModerationServiceHealth = {
    status: 'healthy',
    uptime: 3600000, // 1 hour
    lastCheck: new Date(),
    services: {
      ai_classifier: { status: 'healthy', responseTime: 120 },
      crisis_detector: { status: 'healthy', responseTime: 95 },
      toxicity_filter: { status: 'healthy', responseTime: 80 },
    },
    version: '1.2.3',
    capabilities: [
      'text_classification',
      'crisis_detection',
      'toxicity_filtering',
      'batch_processing',
    ],
  };

  const mockModerationStats = {
    totalProcessed: 15420,
    today: {
      processed: 234,
      flagged: 23,
      crisis: 3,
      approved: 186,
      removed: 25,
    },
    thisWeek: {
      processed: 1654,
      flagged: 156,
      crisis: 18,
      approved: 1245,
      removed: 235,
    },
    accuracy: {
      overall: 94.7,
      crisis_detection: 98.2,
      toxicity_detection: 92.1,
      false_positives: 3.8,
      false_negatives: 1.5,
    },
    performance: {
      averageResponseTime: 85, // ms
      throughput: 150, // requests per minute
      errorRate: 0.2, // percentage
    },
  };

  const mockClassificationResult = {
    confidence: 0.87,
    categories: ['inappropriate', 'offensive'],
    severity: 'medium',
    shouldFlag: true,
    crisisLevel: 'none',
    immediateEscalation: false,
    explanation: 'Content contains inappropriate language and offensive remarks',
    suggestedAction: 'flag_for_review',
    metadata: {
      processingTime: 120,
      modelVersion: '2.1.0',
      confidence_breakdown: {
        inappropriate: 0.89,
        offensive: 0.85,
        harassment: 0.12,
        toxic: 0.34,
      },
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
        {
          provide: ModerationService,
          useValue: mockModerationService,
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
    moderationService = module.get<ModerationService>(ModerationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have adminService and moderationService injected', () => {
      expect(adminService).toBeDefined();
      expect(moderationService).toBeDefined();
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
        'getServiceHealthStatus',
        'getServiceStats',
        'testClassification',
        'testCrisisDetection',
        'testBatchClassification',
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

      const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN);

      expect(result).toEqual(mockFlaggedContent);
      expect(adminService.getFlaggedContent).toHaveBeenCalledWith({
        type: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('should get flagged content with custom parameters', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN, 'post', '2', '20');

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

        const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN, type);

        expect(adminService.getFlaggedContent).toHaveBeenCalledWith(
          expect.objectContaining({ type })
        );
      }
    });

    it('should handle invalid pagination parameters', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      // Test with invalid string values that should be converted
      const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN, undefined, 'invalid', 'invalid');

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

      const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN);

      expect(result.content).toHaveLength(0);
      expect(result.summary.totalFlagged).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockAdminService.getFlaggedContent.mockRejectedValue(serviceError);

      await expect(controller.getFlaggedContent(TEST_USER_IDS.ADMIN)).rejects.toThrow(HttpException);
      await expect(controller.getFlaggedContent(TEST_USER_IDS.ADMIN)).rejects.toThrow('Failed to retrieve flagged content');
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      await controller.getFlaggedContent(TEST_USER_IDS.ADMIN);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} retrieving flagged content`);
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
        moderatedBy: TEST_USER_IDS.ADMIN,
        moderatedAt: new Date(),
        action: moderationData.action,
        reason: moderationData.reason,
      };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

      const result = await controller.moderateContent(
        TEST_USER_IDS.ADMIN,
        contentType,
        contentId,
        moderationData
      );

      expect(result).toEqual(moderatedContent);
      expect(adminService.moderateContent).toHaveBeenCalledWith(
        contentType,
        contentId,
        TEST_USER_IDS.ADMIN,
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
          TEST_USER_IDS.ADMIN,
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
          TEST_USER_IDS.ADMIN,
          type,
          contentId,
          { action: 'approve' }
        );

        expect(result.type).toBe(type);
        expect(adminService.moderateContent).toHaveBeenCalledWith(
          type,
          contentId,
          TEST_USER_IDS.ADMIN,
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
        TEST_USER_IDS.ADMIN,
        contentType,
        contentId,
        dataWithoutReason
      );

      expect(result).toEqual(moderatedContent);
      expect(adminService.moderateContent).toHaveBeenCalledWith(
        contentType,
        contentId,
        TEST_USER_IDS.ADMIN,
        'approve',
        undefined
      );
    });

    it('should handle content not found', async () => {
      const notFoundError = new Error('Content not found');
      mockAdminService.moderateContent.mockRejectedValue(notFoundError);

      await expect(
        controller.moderateContent(TEST_USER_IDS.ADMIN, contentType, 'non-existent-id', moderationData)
      ).rejects.toThrow(HttpException);
    });

    it('should log admin actions', async () => {
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const moderatedContent = { id: contentId, status: 'removed' };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);

      await controller.moderateContent(TEST_USER_IDS.ADMIN, contentType, contentId, moderationData);

      expect(logSpy).toHaveBeenCalledWith(`Admin ${TEST_USER_IDS.ADMIN} moderating ${contentType} ${contentId}`);
    });
  });

  describe('GET /admin/moderation/service/health', () => {
    it('should get service health status successfully', async () => {
      mockModerationService.healthCheck.mockResolvedValue(mockModerationServiceHealth);

      const result = await controller.getServiceHealthStatus();

      expect(result).toEqual(mockModerationServiceHealth);
      expect(moderationService.healthCheck).toHaveBeenCalledWith();
    });

    it('should validate health response structure', async () => {
      mockModerationService.healthCheck.mockResolvedValue(mockModerationServiceHealth);

      const result = await controller.getServiceHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('capabilities');
      expect(Array.isArray(result.capabilities)).toBe(true);
      expect(typeof result.uptime).toBe('number');
    });

    it('should handle unhealthy service status', async () => {
      const unhealthyStatus = {
        ...mockModerationServiceHealth,
        status: 'unhealthy',
        services: {
          ai_classifier: { status: 'unhealthy', responseTime: 5000, error: 'Timeout' },
          crisis_detector: { status: 'healthy', responseTime: 95 },
          toxicity_filter: { status: 'degraded', responseTime: 800 },
        },
      };
      mockModerationService.healthCheck.mockResolvedValue(unhealthyStatus);

      const result = await controller.getServiceHealthStatus();

      expect(result.status).toBe('unhealthy');
      expect(result.services.ai_classifier.status).toBe('unhealthy');
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Health check failed');
      mockModerationService.healthCheck.mockRejectedValue(serviceError);

      await expect(controller.getServiceHealthStatus()).rejects.toThrow(HttpException);
      await expect(controller.getServiceHealthStatus()).rejects.toThrow('Failed to get moderation service health');
    });
  });

  describe('GET /admin/moderation/service/stats', () => {
    it('should get service statistics successfully', async () => {
      mockModerationService.getStats.mockResolvedValue(mockModerationStats);

      const result = await controller.getServiceStats();

      expect(result).toEqual(mockModerationStats);
      expect(moderationService.getStats).toHaveBeenCalledWith();
    });

    it('should validate stats response structure', async () => {
      mockModerationService.getStats.mockResolvedValue(mockModerationStats);

      const result = await controller.getServiceStats();

      expect(result).toHaveProperty('totalProcessed');
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('thisWeek');
      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('performance');
      expect(typeof result.totalProcessed).toBe('number');
      expect(typeof result.accuracy.overall).toBe('number');
      expect(typeof result.performance.averageResponseTime).toBe('number');
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        totalProcessed: 0,
        today: { processed: 0, flagged: 0, crisis: 0, approved: 0, removed: 0 },
        thisWeek: { processed: 0, flagged: 0, crisis: 0, approved: 0, removed: 0 },
        accuracy: { overall: 0, crisis_detection: 0, toxicity_detection: 0, false_positives: 0, false_negatives: 0 },
        performance: { averageResponseTime: 0, throughput: 0, errorRate: 0 },
      };
      mockModerationService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getServiceStats();

      expect(result.totalProcessed).toBe(0);
      expect(result.today.processed).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Stats service unavailable');
      mockModerationService.getStats.mockRejectedValue(serviceError);

      await expect(controller.getServiceStats()).rejects.toThrow(HttpException);
    });
  });

  describe('POST /admin/moderation/service/test-classify', () => {
    const testData = {
      text: 'This is test content that might be inappropriate',
      context: 'community_post',
    };

    it('should test content classification successfully', async () => {
      mockModerationService.classifyContent.mockResolvedValue(mockClassificationResult);

      const result = await controller.testClassification(TEST_USER_IDS.ADMIN, testData);

      expect(result.result).toEqual(mockClassificationResult);
      expect(result.testInfo.testedBy).toBe(TEST_USER_IDS.ADMIN);
      expect(result.testInfo.inputText).toBe(testData.text);
      expect(result.testInfo.inputContext).toBe(testData.context);
    });

    it('should handle different content types for classification', async () => {
      const contentTypes = ['community_post', 'private_message', 'profile_text', 'comment'];
      
      for (const context of contentTypes) {
        const data = { ...testData, context };
        mockModerationService.classifyContent.mockResolvedValue(mockClassificationResult);

        const result = await controller.testClassification(TEST_USER_IDS.ADMIN, data);

        expect(moderationService.classifyContent).toHaveBeenCalledWith(
          data.text,
          expect.objectContaining({
            context: data.context,
            userId: TEST_USER_IDS.ADMIN,
            userRole: 'admin',
          })
        );
      }
    });

    it('should handle various text content', async () => {
      const testTexts = [
        'This is appropriate content',
        'This content contains mild profanity',
        'This content is extremely inappropriate and offensive',
        'Help me, I am in crisis',
        'Normal therapeutic discussion about anxiety',
      ];

      for (const text of testTexts) {
        const data = { text, context: 'community_post' };
        const classificationResult = {
          ...mockClassificationResult,
          severity: text.includes('crisis') ? 'high' : text.includes('inappropriate') ? 'medium' : 'low',
          crisisLevel: text.includes('crisis') ? 'high' : 'none',
        };
        mockModerationService.classifyContent.mockResolvedValue(classificationResult);

        const result = await controller.testClassification(TEST_USER_IDS.ADMIN, data);

        expect(result.result.severity).toBeDefined();
        expect(result.testInfo.inputText).toBe(text);
      }
    });

    it('should handle classification errors', async () => {
      const classificationError = new Error('AI service unavailable');
      mockModerationService.classifyContent.mockRejectedValue(classificationError);

      await expect(
        controller.testClassification(TEST_USER_IDS.ADMIN, testData)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('POST /admin/moderation/service/test-crisis', () => {
    const crisisTestData = {
      text: 'I am having thoughts of self-harm and need help',
      context: 'private_message',
    };

    it('should test crisis detection successfully', async () => {
      const crisisResult = {
        ...mockClassificationResult,
        crisisLevel: 'high',
        immediateEscalation: true,
      };
      mockModerationService.checkCrisisContent.mockResolvedValue(true);
      mockModerationService.classifyContent.mockResolvedValue(crisisResult);

      const result = await controller.testCrisisDetection(TEST_USER_IDS.ADMIN, crisisTestData);

      expect(result.isCrisis).toBe(true);
      expect(result.crisisLevel).toBe('high');
      expect(result.immediateEscalation).toBe(true);
      expect(result.fullResult).toEqual(crisisResult);
      expect(result.testInfo.testedBy).toBe(TEST_USER_IDS.ADMIN);
    });

    it('should handle non-crisis content', async () => {
      const normalTestData = {
        text: 'I am feeling better after our session',
        context: 'community_post',
      };
      const normalResult = {
        ...mockClassificationResult,
        crisisLevel: 'none',
        immediateEscalation: false,
      };
      mockModerationService.checkCrisisContent.mockResolvedValue(false);
      mockModerationService.classifyContent.mockResolvedValue(normalResult);

      const result = await controller.testCrisisDetection(TEST_USER_IDS.ADMIN, normalTestData);

      expect(result.isCrisis).toBe(false);
      expect(result.crisisLevel).toBe('none');
      expect(result.immediateEscalation).toBe(false);
    });

    it('should handle different crisis levels', async () => {
      const crisisLevels = ['none', 'low', 'medium', 'high', 'critical'];
      
      for (const level of crisisLevels) {
        const testData = { text: `Crisis level ${level} content`, context: 'private_message' };
        const isCrisis = level !== 'none';
        const result = {
          ...mockClassificationResult,
          crisisLevel: level,
          immediateEscalation: ['high', 'critical'].includes(level),
        };
        
        mockModerationService.checkCrisisContent.mockResolvedValue(isCrisis);
        mockModerationService.classifyContent.mockResolvedValue(result);

        const testResult = await controller.testCrisisDetection(TEST_USER_IDS.ADMIN, testData);

        expect(testResult.crisisLevel).toBe(level);
        expect(testResult.isCrisis).toBe(isCrisis);
      }
    });

    it('should handle crisis detection errors', async () => {
      const crisisError = new Error('Crisis detection service failed');
      mockModerationService.checkCrisisContent.mockRejectedValue(crisisError);

      await expect(
        controller.testCrisisDetection(TEST_USER_IDS.ADMIN, crisisTestData)
      ).rejects.toThrow(HttpException);
    });
  });

  describe('POST /admin/moderation/service/test-batch', () => {
    const batchTestData = {
      items: [
        { text: 'This is appropriate content', context: 'community_post' },
        { text: 'This contains inappropriate language', context: 'comment' },
        { text: 'Crisis content requiring immediate attention', context: 'private_message' },
      ],
    };

    it('should test batch classification successfully', async () => {
      const batchResults = [
        { ...mockClassificationResult, severity: 'low', shouldFlag: false },
        { ...mockClassificationResult, severity: 'medium', shouldFlag: true },
        { ...mockClassificationResult, severity: 'high', shouldFlag: true, crisisLevel: 'high' },
      ];
      mockModerationService.batchClassify.mockResolvedValue(batchResults);

      const result = await controller.testBatchClassification(TEST_USER_IDS.ADMIN, batchTestData);

      expect(result.results).toEqual(batchResults);
      expect(result.testInfo.testedBy).toBe(TEST_USER_IDS.ADMIN);
      expect(result.testInfo.itemCount).toBe(3);
      expect(moderationService.batchClassify).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            text: batchTestData.items[0].text,
            context: expect.objectContaining({
              context: batchTestData.items[0].context,
              userId: TEST_USER_IDS.ADMIN,
              userRole: 'admin',
            }),
          }),
        ])
      );
    });

    it('should handle empty batch', async () => {
      const emptyBatch = { items: [] };
      mockModerationService.batchClassify.mockResolvedValue([]);

      const result = await controller.testBatchClassification(TEST_USER_IDS.ADMIN, emptyBatch);

      expect(result.results).toEqual([]);
      expect(result.testInfo.itemCount).toBe(0);
    });

    it('should handle large batches', async () => {
      const largeBatch = {
        items: Array.from({ length: 50 }, (_, i) => ({
          text: `Test content item ${i + 1}`,
          context: 'community_post',
        })),
      };
      const largeBatchResults = Array.from({ length: 50 }, () => mockClassificationResult);
      mockModerationService.batchClassify.mockResolvedValue(largeBatchResults);

      const result = await controller.testBatchClassification(TEST_USER_IDS.ADMIN, largeBatch);

      expect(result.results).toHaveLength(50);
      expect(result.testInfo.itemCount).toBe(50);
    });

    it('should handle batch processing errors', async () => {
      const batchError = new Error('Batch processing failed');
      mockModerationService.batchClassify.mockRejectedValue(batchError);

      await expect(
        controller.testBatchClassification(TEST_USER_IDS.ADMIN, batchTestData)
      ).rejects.toThrow(HttpException);
    });

    it('should handle mixed content types in batch', async () => {
      const mixedBatch = {
        items: [
          { text: 'Community post content', context: 'community_post' },
          { text: 'Private message content', context: 'private_message' },
          { text: 'Comment content', context: 'comment' },
          { text: 'Profile description', context: 'profile_text' },
        ],
      };
      const mixedResults = mixedBatch.items.map(() => mockClassificationResult);
      mockModerationService.batchClassify.mockResolvedValue(mixedResults);

      const result = await controller.testBatchClassification(TEST_USER_IDS.ADMIN, mixedBatch);

      expect(result.results).toHaveLength(4);
      expect(moderationService.batchClassify).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            context: expect.objectContaining({ context: 'community_post' }),
          }),
          expect.objectContaining({
            context: expect.objectContaining({ context: 'private_message' }),
          }),
          expect.objectContaining({
            context: expect.objectContaining({ context: 'comment' }),
          }),
          expect.objectContaining({
            context: expect.objectContaining({ context: 'profile_text' }),
          }),
        ])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockAdminService.getFlaggedContent.mockRejectedValue(serviceError);

      await expect(controller.getFlaggedContent(TEST_USER_IDS.ADMIN)).rejects.toThrow(HttpException);
    });

    it('should handle AI service integration errors', async () => {
      const aiServiceError = new Error('AI service timeout');
      mockModerationService.classifyContent.mockRejectedValue(aiServiceError);

      await expect(
        controller.testClassification(TEST_USER_IDS.ADMIN, { text: 'test', context: 'test' })
      ).rejects.toThrow(HttpException);
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockAdminService.moderateContent.mockRejectedValue(dbError);

      await expect(
        controller.moderateContent(TEST_USER_IDS.ADMIN, 'post', 'post_123', { action: 'approve' })
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted flagged content response', async () => {
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);

      const result = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.content)).toBe(true);
      result.content.forEach((item) => {
        TestAssertions.expectValidEntity(item, ['id', 'type', 'content', 'authorId', 'flaggedAt']);
        expect(['pending', 'approved', 'removed']).toContain(item.status);
        expect(['low', 'medium', 'high']).toContain(item.priority);
      });
    });

    it('should return properly formatted health check response', async () => {
      mockModerationService.healthCheck.mockResolvedValue(mockModerationServiceHealth);

      const result = await controller.getServiceHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('services');
      expect(typeof result.uptime).toBe('number');
      Object.values(result.services).forEach((service: any) => {
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('responseTime');
      });
    });

    it('should return properly formatted classification test response', async () => {
      mockModerationService.classifyContent.mockResolvedValue(mockClassificationResult);

      const result = await controller.testClassification(TEST_USER_IDS.ADMIN, {
        text: 'test',
        context: 'test',
      });

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('testInfo');
      expect(result.result).toHaveProperty('confidence');
      expect(result.result).toHaveProperty('categories');
      expect(result.result).toHaveProperty('severity');
      expect(typeof result.result.confidence).toBe('number');
      expect(Array.isArray(result.result.categories)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete moderation workflow', async () => {
      // Get flagged content
      mockAdminService.getFlaggedContent.mockResolvedValue(mockFlaggedContent);
      const flaggedContent = await controller.getFlaggedContent(TEST_USER_IDS.ADMIN);
      expect(flaggedContent.content).toHaveLength(2);

      // Test classify content
      mockModerationService.classifyContent.mockResolvedValue(mockClassificationResult);
      const classification = await controller.testClassification(TEST_USER_IDS.ADMIN, {
        text: flaggedContent.content[0].content,
        context: 'community_post',
      });
      expect(classification.result.shouldFlag).toBeDefined();

      // Moderate content
      const moderatedContent = { id: 'post_123', status: 'removed' };
      mockAdminService.moderateContent.mockResolvedValue(moderatedContent);
      const moderation = await controller.moderateContent(
        TEST_USER_IDS.ADMIN,
        'post',
        'post_123',
        { action: 'remove', reason: 'Inappropriate content' }
      );
      expect(moderation.status).toBe('removed');
    });

    it('should handle service health monitoring workflow', async () => {
      // Check service health
      mockModerationService.healthCheck.mockResolvedValue(mockModerationServiceHealth);
      const health = await controller.getServiceHealthStatus();
      expect(health.status).toBe('healthy');

      // Get service statistics
      mockModerationService.getStats.mockResolvedValue(mockModerationStats);
      const stats = await controller.getServiceStats();
      expect(stats.totalProcessed).toBeGreaterThan(0);

      // Test crisis detection
      mockModerationService.checkCrisisContent.mockResolvedValue(true);
      mockModerationService.classifyContent.mockResolvedValue({
        ...mockClassificationResult,
        crisisLevel: 'high',
      });
      const crisisTest = await controller.testCrisisDetection(TEST_USER_IDS.ADMIN, {
        text: 'I need help urgently',
        context: 'private_message',
      });
      expect(crisisTest.isCrisis).toBe(true);
    });
  });
});