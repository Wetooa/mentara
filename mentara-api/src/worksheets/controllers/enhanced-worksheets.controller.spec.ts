/**
 * Comprehensive Test Suite for EnhancedWorksheetsController
 * Tests enhanced worksheet functionality with pagination and advanced features
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EnhancedWorksheetsController } from './enhanced-worksheets.controller';
import { EnhancedWorksheetsService } from '../services/enhanced-worksheets.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('EnhancedWorksheetsController', () => {
  let controller: EnhancedWorksheetsController;
  let enhancedWorksheetsService: EnhancedWorksheetsService;
  let module: TestingModule;

  // Mock EnhancedWorksheetsService
  const mockEnhancedWorksheetsService = {
    getAllWorksheets: jest.fn(),
    getWorksheet: jest.fn(),
    searchWorksheets: jest.fn(),
    getWorksheetAnalytics: jest.fn(),
    getRecommendedWorksheets: jest.fn(),
    getWorksheetsByCategory: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockEnhancedWorksheet = {
    id: 'enhanced_worksheet_123456789',
    title: 'Advanced Anxiety Management',
    description: 'Comprehensive worksheet with interactive elements and progress tracking',
    content: 'Enhanced content with multimedia elements...',
    status: 'assigned',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    category: 'anxiety',
    difficulty: 'advanced',
    estimatedDuration: 60,
    completionRate: 85.5,
    averageRating: 4.7,
    tags: ['anxiety', 'CBT', 'interactive', 'multimedia'],
    dueDate: new Date('2024-02-15T00:00:00Z'),
    interactiveElements: [
      {
        type: 'slider',
        label: 'Rate your anxiety level',
        min: 1,
        max: 10,
        step: 1,
      },
      {
        type: 'checkbox',
        label: 'Select applicable symptoms',
        options: ['Racing thoughts', 'Shortness of breath', 'Sweating', 'Trembling'],
      },
    ],
    multimedia: [
      {
        type: 'video',
        title: 'Breathing Exercise Demo',
        url: 'https://storage.example.com/videos/breathing-demo.mp4',
        duration: 300, // 5 minutes
      },
      {
        type: 'audio',
        title: 'Guided Meditation',
        url: 'https://storage.example.com/audio/meditation.mp3',
        duration: 900, // 15 minutes
      },
    ],
    progressTracking: {
      milestones: [
        { step: 1, title: 'Complete breathing exercises', completed: true },
        { step: 2, title: 'Practice mindfulness', completed: true },
        { step: 3, title: 'Apply techniques daily', completed: false },
      ],
      overallProgress: 66.7,
    },
    analytics: {
      totalViews: 1250,
      completions: 1068,
      averageTimeSpent: 48.5,
      userFeedback: {
        helpful: 923,
        needsImprovement: 87,
        excellent: 634,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorksheetsList = {
    worksheets: [mockEnhancedWorksheet],
    pagination: {
      page: 1,
      limit: 20,
      totalCount: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    metadata: {
      totalWorksheets: 1,
      categoriesCovered: ['anxiety'],
      difficultyLevels: ['advanced'],
      averageCompletionRate: 85.5,
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [EnhancedWorksheetsController],
      providers: [
        {
          provide: EnhancedWorksheetsService,
          useValue: mockEnhancedWorksheetsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<EnhancedWorksheetsController>(EnhancedWorksheetsController);
    enhancedWorksheetsService = module.get<EnhancedWorksheetsService>(EnhancedWorksheetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have enhancedWorksheetsService injected', () => {
      expect(enhancedWorksheetsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', EnhancedWorksheetsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', EnhancedWorksheetsController);
      expect(controllerMetadata).toBe('worksheets/enhanced');
    });
  });

  describe('GET /worksheets/enhanced', () => {
    it('should get enhanced worksheets with default pagination', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      const result = await controller.getEnhancedWorksheets();

      expect(result).toEqual(mockWorksheetsList);
      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(1, 20);
    });

    it('should get enhanced worksheets with custom pagination', async () => {
      const customPagination = {
        ...mockWorksheetsList,
        pagination: {
          page: 2,
          limit: 10,
          totalCount: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(customPagination);

      const result = await controller.getEnhancedWorksheets(2, 10);

      expect(result).toEqual(customPagination);
      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(2, 10);
    });

    it('should handle string parameters and convert to numbers', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets('3' as any, '15' as any);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(3, 15);
    });

    it('should handle large page numbers', async () => {
      const emptyResult = {
        worksheets: [],
        pagination: {
          page: 100,
          limit: 20,
          totalCount: 50,
          totalPages: 3,
          hasNext: false,
          hasPrev: true,
        },
        metadata: {
          totalWorksheets: 50,
          categoriesCovered: [],
          difficultyLevels: [],
          averageCompletionRate: 0,
        },
      };
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(emptyResult);

      const result = await controller.getEnhancedWorksheets(100, 20);

      expect(result).toEqual(emptyResult);
      expect(result.worksheets).toHaveLength(0);
    });

    it('should handle minimum limit values', async () => {
      const smallLimitResult = {
        ...mockWorksheetsList,
        pagination: {
          page: 1,
          limit: 1,
          totalCount: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(smallLimitResult);

      const result = await controller.getEnhancedWorksheets(1, 1);

      expect(result).toEqual(smallLimitResult);
      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(1, 1);
    });

    it('should handle maximum limit values', async () => {
      const largeLimitResult = {
        ...mockWorksheetsList,
        pagination: {
          page: 1,
          limit: 100,
          totalCount: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(largeLimitResult);

      const result = await controller.getEnhancedWorksheets(1, 100);

      expect(result).toEqual(largeLimitResult);
      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(1, 100);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockEnhancedWorksheetsService.getAllWorksheets.mockRejectedValue(serviceError);

      await expect(controller.getEnhancedWorksheets()).rejects.toThrow(serviceError);
    });

    it('should handle empty worksheets list', async () => {
      const emptyResult = {
        worksheets: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        metadata: {
          totalWorksheets: 0,
          categoriesCovered: [],
          difficultyLevels: [],
          averageCompletionRate: 0,
        },
      };
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(emptyResult);

      const result = await controller.getEnhancedWorksheets();

      expect(result).toEqual(emptyResult);
      expect(result.worksheets).toHaveLength(0);
      expect(result.metadata.totalWorksheets).toBe(0);
    });
  });

  describe('GET /worksheets/enhanced/:id', () => {
    const validUUID = 'e7b4c8a0-1234-4567-8901-123456789abc';

    it('should get enhanced worksheet by id successfully', async () => {
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(mockEnhancedWorksheet);

      const result = await controller.getEnhancedWorksheet(validUUID);

      expect(result).toEqual(mockEnhancedWorksheet);
      expect(enhancedWorksheetsService.getWorksheet).toHaveBeenCalledWith(validUUID);
    });

    it('should handle worksheet not found', async () => {
      const notFoundError = new NotFoundException('Enhanced worksheet not found');
      mockEnhancedWorksheetsService.getWorksheet.mockRejectedValue(notFoundError);

      await expect(controller.getEnhancedWorksheet(validUUID)).rejects.toThrow(notFoundError);
    });

    it('should validate UUID format', async () => {
      const invalidUUID = 'invalid-uuid-format';
      
      await expect(
        controller.getEnhancedWorksheet(invalidUUID)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockEnhancedWorksheetsService.getWorksheet.mockRejectedValue(serviceError);

      await expect(controller.getEnhancedWorksheet(validUUID)).rejects.toThrow(serviceError);
    });

    it('should return worksheet with all enhanced features', async () => {
      const fullEnhancedWorksheet = {
        ...mockEnhancedWorksheet,
        interactiveElements: mockEnhancedWorksheet.interactiveElements,
        multimedia: mockEnhancedWorksheet.multimedia,
        progressTracking: mockEnhancedWorksheet.progressTracking,
        analytics: mockEnhancedWorksheet.analytics,
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(fullEnhancedWorksheet);

      const result = await controller.getEnhancedWorksheet(validUUID);

      expect(result.interactiveElements).toBeDefined();
      expect(result.multimedia).toBeDefined();
      expect(result.progressTracking).toBeDefined();
      expect(result.analytics).toBeDefined();
      expect(result.interactiveElements).toHaveLength(2);
      expect(result.multimedia).toHaveLength(2);
    });

    it('should handle worksheet with minimal enhanced features', async () => {
      const minimalEnhancedWorksheet = {
        ...mockEnhancedWorksheet,
        interactiveElements: [],
        multimedia: [],
        progressTracking: null,
        analytics: null,
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(minimalEnhancedWorksheet);

      const result = await controller.getEnhancedWorksheet(validUUID);

      expect(result.interactiveElements).toEqual([]);
      expect(result.multimedia).toEqual([]);
      expect(result.progressTracking).toBeNull();
      expect(result.analytics).toBeNull();
    });

    it('should handle different worksheet categories', async () => {
      const categories = ['anxiety', 'depression', 'mindfulness', 'trauma', 'relationships'];
      
      for (const category of categories) {
        const categorizedWorksheet = {
          ...mockEnhancedWorksheet,
          category,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Management Worksheet`,
        };
        mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(categorizedWorksheet);

        const result = await controller.getEnhancedWorksheet(validUUID);

        expect(result.category).toBe(category);
        expect(result.title).toContain(category.charAt(0).toUpperCase() + category.slice(1));
      }
    });

    it('should handle different difficulty levels', async () => {
      const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
      
      for (const difficulty of difficulties) {
        const difficultyWorksheet = {
          ...mockEnhancedWorksheet,
          difficulty,
        };
        mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(difficultyWorksheet);

        const result = await controller.getEnhancedWorksheet(validUUID);

        expect(result.difficulty).toBe(difficulty);
      }
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle zero page number', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets(0, 20);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(0, 20);
    });

    it('should handle negative page number', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets(-1, 20);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(-1, 20);
    });

    it('should handle zero limit', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets(1, 0);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(1, 0);
    });

    it('should handle negative limit', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets(1, -5);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(1, -5);
    });

    it('should handle very large numbers', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      await controller.getEnhancedWorksheets(999999, 999999);

      expect(enhancedWorksheetsService.getAllWorksheets).toHaveBeenCalledWith(999999, 999999);
    });
  });

  describe('Interactive Elements', () => {
    it('should handle worksheets with various interactive element types', async () => {
      const interactiveWorksheet = {
        ...mockEnhancedWorksheet,
        interactiveElements: [
          { type: 'slider', label: 'Anxiety Level', min: 1, max: 10 },
          { type: 'checkbox', label: 'Symptoms', options: ['Option 1', 'Option 2'] },
          { type: 'radio', label: 'Frequency', options: ['Daily', 'Weekly', 'Monthly'] },
          { type: 'text', label: 'Additional Notes', placeholder: 'Enter your thoughts...' },
          { type: 'scale', label: 'Progress Rating', min: 1, max: 5 },
        ],
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(interactiveWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result.interactiveElements).toHaveLength(5);
      expect(result.interactiveElements.map(el => el.type)).toEqual([
        'slider', 'checkbox', 'radio', 'text', 'scale'
      ]);
    });
  });

  describe('Multimedia Content', () => {
    it('should handle worksheets with various multimedia types', async () => {
      const multimediaWorksheet = {
        ...mockEnhancedWorksheet,
        multimedia: [
          { type: 'video', title: 'Tutorial Video', url: 'video.mp4', duration: 300 },
          { type: 'audio', title: 'Guided Audio', url: 'audio.mp3', duration: 600 },
          { type: 'image', title: 'Diagram', url: 'diagram.png', width: 800, height: 600 },
          { type: 'pdf', title: 'Reference Material', url: 'guide.pdf', pages: 10 },
        ],
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(multimediaWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result.multimedia).toHaveLength(4);
      expect(result.multimedia.map(media => media.type)).toEqual([
        'video', 'audio', 'image', 'pdf'
      ]);
    });
  });

  describe('Progress Tracking', () => {
    it('should handle worksheets with detailed progress tracking', async () => {
      const progressWorksheet = {
        ...mockEnhancedWorksheet,
        progressTracking: {
          milestones: [
            { step: 1, title: 'Introduction', completed: true, completedAt: new Date() },
            { step: 2, title: 'Practice', completed: true, completedAt: new Date() },
            { step: 3, title: 'Application', completed: false, completedAt: null },
            { step: 4, title: 'Review', completed: false, completedAt: null },
          ],
          overallProgress: 50.0,
          timeSpent: 1800, // 30 minutes
          lastAccessed: new Date(),
        },
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(progressWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result.progressTracking.milestones).toHaveLength(4);
      expect(result.progressTracking.overallProgress).toBe(50.0);
      expect(result.progressTracking.timeSpent).toBe(1800);
    });
  });

  describe('Analytics Data', () => {
    it('should handle worksheets with comprehensive analytics', async () => {
      const analyticsWorksheet = {
        ...mockEnhancedWorksheet,
        analytics: {
          totalViews: 5000,
          completions: 4200,
          averageTimeSpent: 65.5,
          userFeedback: {
            helpful: 3800,
            needsImprovement: 250,
            excellent: 2900,
          },
          difficultyRatings: {
            tooEasy: 150,
            justRight: 3500,
            tooHard: 550,
          },
          categoryPerformance: {
            engagementScore: 87.5,
            retentionRate: 82.3,
            recommendationRate: 91.2,
          },
        },
      };
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(analyticsWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result.analytics.totalViews).toBe(5000);
      expect(result.analytics.completions).toBe(4200);
      expect(result.analytics.userFeedback).toBeDefined();
      expect(result.analytics.difficultyRatings).toBeDefined();
      expect(result.analytics.categoryPerformance).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockEnhancedWorksheetsService.getAllWorksheets.mockRejectedValue(serviceError);

      await expect(controller.getEnhancedWorksheets()).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockEnhancedWorksheetsService.getWorksheet.mockRejectedValue(dbError);

      await expect(
        controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc')
      ).rejects.toThrow(dbError);
    });

    it('should handle malformed response data', async () => {
      const malformedData = null;
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(malformedData);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result).toBeNull();
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted enhanced worksheet response', async () => {
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(mockEnhancedWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      TestAssertions.expectValidEntity(result, ['id', 'title', 'description', 'status']);
      expect(result.id).toBe(mockEnhancedWorksheet.id);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(Array.isArray(result.interactiveElements)).toBe(true);
      expect(Array.isArray(result.multimedia)).toBe(true);
      expect(typeof result.completionRate).toBe('number');
      expect(typeof result.averageRating).toBe('number');
    });

    it('should return properly formatted worksheets list response', async () => {
      mockEnhancedWorksheetsService.getAllWorksheets.mockResolvedValue(mockWorksheetsList);

      const result = await controller.getEnhancedWorksheets();

      expect(Array.isArray(result.worksheets)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(typeof result.pagination.page).toBe('number');
      expect(typeof result.pagination.limit).toBe('number');
      expect(typeof result.pagination.totalCount).toBe('number');
      expect(typeof result.pagination.totalPages).toBe('number');
      expect(typeof result.pagination.hasNext).toBe('boolean');
      expect(typeof result.pagination.hasPrev).toBe('boolean');
    });

    it('should maintain data integrity for enhanced features', async () => {
      mockEnhancedWorksheetsService.getWorksheet.mockResolvedValue(mockEnhancedWorksheet);

      const result = await controller.getEnhancedWorksheet('e7b4c8a0-1234-4567-8901-123456789abc');

      expect(result.interactiveElements.every(el => el.type && el.label)).toBe(true);
      expect(result.multimedia.every(media => media.type && media.title && media.url)).toBe(true);
      expect(result.progressTracking.milestones.every(m => m.step && m.title)).toBe(true);
      expect(result.analytics.totalViews).toBeGreaterThanOrEqual(0);
      expect(result.analytics.completions).toBeGreaterThanOrEqual(0);
    });
  });
});