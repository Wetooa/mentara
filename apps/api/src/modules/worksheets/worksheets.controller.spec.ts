/**
 * Comprehensive Test Suite for WorksheetsController
 * Tests worksheet management, file uploads, submissions, and analytics
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorksheetsController } from './worksheets.controller';
import { WorksheetsService } from './worksheets.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('WorksheetsController', () => {
  let controller: WorksheetsController;
  let worksheetsService: WorksheetsService;
  let supabaseStorageService: SupabaseStorageService;
  let module: TestingModule;

  // Mock WorksheetsService
  const mockWorksheetsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createSubmission: jest.fn(),
    getSubmissions: jest.fn(),
    updateSubmission: jest.fn(),
    deleteSubmission: jest.fn(),
    getWorksheetStats: jest.fn(),
    getTherapistWorksheets: jest.fn(),
    getClientWorksheets: jest.fn(),
    searchWorksheets: jest.fn(),
    getWorksheetAnalytics: jest.fn(),
  };

  // Mock SupabaseStorageService
  const mockSupabaseStorageService = {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockWorksheet = {
    id: 'worksheet_123456789',
    title: 'Anxiety Management Worksheet',
    description: 'Weekly exercises for managing anxiety symptoms',
    content: 'Please complete the following mindfulness exercises...',
    status: 'assigned',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    dueDate: new Date('2024-02-01T00:00:00Z'),
    estimatedDuration: 45,
    difficulty: 'intermediate',
    tags: ['anxiety', 'mindfulness', 'coping'],
    materials: [
      {
        id: 'material_123',
        filename: 'anxiety-guide.pdf',
        url: 'https://storage.example.com/anxiety-guide.pdf',
        fileType: 'pdf',
        size: 1024000,
      },
    ],
    submissions: [
      {
        id: 'submission_123',
        content: 'I completed the breathing exercises and found them helpful...',
        submittedAt: new Date('2024-01-20T14:30:00Z'),
        score: 8,
        feedback: 'Great progress with the exercises!',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorksheetSubmission = {
    id: 'submission_123456789',
    worksheetId: 'worksheet_123456789',
    clientId: TEST_USER_IDS.CLIENT,
    content: 'I completed all the exercises as instructed. The breathing techniques were particularly helpful.',
    submittedAt: new Date(),
    score: 9,
    feedback: 'Excellent work! Your understanding of the techniques is clear.',
    therapistNotes: 'Client shows good engagement and understanding',
    attachments: [
      {
        id: 'attachment_123',
        filename: 'exercise-notes.pdf',
        url: 'https://storage.example.com/exercise-notes.pdf',
        fileType: 'pdf',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorksheetStats = {
    totalWorksheets: 25,
    assignedWorksheets: 8,
    inProgressWorksheets: 12,
    completedWorksheets: 5,
    overdueWorksheets: 3,
    averageCompletionTime: 48.5,
    completionRate: 76.2,
    averageScore: 7.8,
    popularTags: [
      { tag: 'anxiety', count: 15 },
      { tag: 'depression', count: 12 },
      { tag: 'mindfulness', count: 10 },
    ],
    weeklyProgress: [
      { week: '2024-01-15', completed: 3, assigned: 5 },
      { week: '2024-01-22', completed: 4, assigned: 6 },
      { week: '2024-01-29', completed: 2, assigned: 4 },
    ],
  };

  const mockFiles = [
    {
      fieldname: 'files',
      originalname: 'worksheet-material.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
      size: 1024000,
    },
    {
      fieldname: 'files',
      originalname: 'exercise-template.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('fake docx content'),
      size: 512000,
    },
  ] as Express.Multer.File[];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [WorksheetsController],
      providers: [
        {
          provide: WorksheetsService,
          useValue: mockWorksheetsService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<WorksheetsController>(WorksheetsController);
    worksheetsService = module.get<WorksheetsService>(WorksheetsService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(worksheetsService).toBeDefined();
      expect(supabaseStorageService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', WorksheetsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', WorksheetsController);
      expect(controllerMetadata).toBe('worksheets');
    });
  });

  describe('GET /worksheets', () => {
    const queryParams = {
      userId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      status: 'assigned',
      page: 1,
      limit: 10,
    };

    it('should get all worksheets successfully', async () => {
      const mockResponse = {
        worksheets: [mockWorksheet],
        totalCount: 1,
        page: 1,
        totalPages: 1,
      };
      mockWorksheetsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(TEST_USER_IDS.THERAPIST, queryParams);

      expect(result).toEqual(mockResponse);
      expect(worksheetsService.findAll).toHaveBeenCalledWith(
        queryParams.userId,
        queryParams.therapistId,
        queryParams.status
      );
    });

    it('should handle empty worksheets list', async () => {
      const emptyResponse = {
        worksheets: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      };
      mockWorksheetsService.findAll.mockResolvedValue(emptyResponse);

      const result = await controller.findAll(TEST_USER_IDS.THERAPIST, {});

      expect(result).toEqual(emptyResponse);
      expect(result.worksheets).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockWorksheetsService.findAll.mockRejectedValue(serviceError);

      await expect(
        controller.findAll(TEST_USER_IDS.THERAPIST, queryParams)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /worksheets/:id', () => {
    it('should get worksheet by id successfully', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.findById('worksheet_123456789');

      expect(result).toEqual(mockWorksheet);
      expect(worksheetsService.findById).toHaveBeenCalledWith('worksheet_123456789');
    });

    it('should handle worksheet not found', async () => {
      const notFoundError = new NotFoundException('Worksheet not found');
      mockWorksheetsService.findById.mockRejectedValue(notFoundError);

      await expect(
        controller.findById('nonexistent-worksheet')
      ).rejects.toThrow(notFoundError);
    });

    it('should include materials and submissions in response', async () => {
      const worksheetWithDetails = {
        ...mockWorksheet,
        materials: mockWorksheet.materials,
        submissions: mockWorksheet.submissions,
      };
      mockWorksheetsService.findById.mockResolvedValue(worksheetWithDetails);

      const result = await controller.findById('worksheet_123456789');

      expect(result.materials).toBeDefined();
      expect(result.submissions).toBeDefined();
      expect(result.materials).toHaveLength(1);
      expect(result.submissions).toHaveLength(1);
    });
  });

  describe('POST /worksheets', () => {
    const createWorksheetDto = {
      title: 'New Anxiety Worksheet',
      description: 'Advanced exercises for anxiety management',
      content: 'Complete the following cognitive restructuring exercises...',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      dueDate: '2024-02-15T00:00:00Z',
      estimatedDuration: 60,
      difficulty: 'advanced',
      tags: ['anxiety', 'CBT', 'cognitive'],
    };

    it('should create worksheet without files successfully', async () => {
      const createdWorksheet = {
        ...mockWorksheet,
        ...createWorksheetDto,
        uploadedFiles: [],
      };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.create(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto,
        []
      );

      expect(result).toEqual(createdWorksheet);
      expect(worksheetsService.create).toHaveBeenCalledWith(
        createWorksheetDto,
        createWorksheetDto.clientId,
        createWorksheetDto.therapistId,
        []
      );
    });

    it('should create worksheet with files successfully', async () => {
      const uploadedFiles = [
        {
          id: 'file_123',
          filename: 'worksheet-material.pdf',
          url: 'https://storage.example.com/worksheet-material.pdf',
        },
        {
          id: 'file_124',
          filename: 'exercise-template.docx',
          url: 'https://storage.example.com/exercise-template.docx',
        },
      ];
      const createdWorksheet = {
        ...mockWorksheet,
        ...createWorksheetDto,
        uploadedFiles,
      };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.create(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto,
        mockFiles
      );

      expect(result).toEqual(createdWorksheet);
      expect(worksheetsService.create).toHaveBeenCalledWith(
        createWorksheetDto,
        createWorksheetDto.clientId,
        createWorksheetDto.therapistId,
        mockFiles
      );
    });

    it('should handle file upload errors', async () => {
      const uploadError = new BadRequestException('File upload failed');
      mockWorksheetsService.create.mockRejectedValue(uploadError);

      await expect(
        controller.create(TEST_USER_IDS.THERAPIST, createWorksheetDto, mockFiles)
      ).rejects.toThrow(uploadError);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        title: '', // Empty title
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
      };
      const validationError = new BadRequestException('Title is required');
      mockWorksheetsService.create.mockRejectedValue(validationError);

      await expect(
        controller.create(TEST_USER_IDS.THERAPIST, invalidDto as any, [])
      ).rejects.toThrow(validationError);
    });

    it('should handle maximum file limit', async () => {
      const tooManyFiles = Array(6).fill(mockFiles[0]); // 6 files exceeds limit of 5
      const limitError = new BadRequestException('Maximum 5 files allowed');
      mockWorksheetsService.create.mockRejectedValue(limitError);

      await expect(
        controller.create(TEST_USER_IDS.THERAPIST, createWorksheetDto, tooManyFiles)
      ).rejects.toThrow(limitError);
    });
  });

  describe('PUT /worksheets/:id', () => {
    const updateWorksheetDto = {
      title: 'Updated Worksheet Title',
      description: 'Updated description with new exercises',
      content: 'Updated content with additional instructions...',
      status: 'in_progress' as const,
      dueDate: '2024-02-20T00:00:00Z',
    };

    it('should update worksheet successfully', async () => {
      const updatedWorksheet = { ...mockWorksheet, ...updateWorksheetDto };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.update(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789',
        updateWorksheetDto
      );

      expect(result).toEqual(updatedWorksheet);
      expect(worksheetsService.update).toHaveBeenCalledWith(
        'worksheet_123456789',
        updateWorksheetDto
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { status: 'completed' as const };
      const updatedWorksheet = { ...mockWorksheet, ...partialUpdate };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.update(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789',
        partialUpdate
      );

      expect(result).toEqual(updatedWorksheet);
      expect(worksheetsService.update).toHaveBeenCalledWith(
        'worksheet_123456789',
        partialUpdate
      );
    });

    it('should handle worksheet not found', async () => {
      const notFoundError = new NotFoundException('Worksheet not found');
      mockWorksheetsService.update.mockRejectedValue(notFoundError);

      await expect(
        controller.update(TEST_USER_IDS.THERAPIST, 'nonexistent-worksheet', updateWorksheetDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle invalid status transitions', async () => {
      const invalidStatusError = new BadRequestException('Invalid status transition');
      mockWorksheetsService.update.mockRejectedValue(invalidStatusError);

      await expect(
        controller.update(
          TEST_USER_IDS.THERAPIST,
          'worksheet_123456789',
          { status: 'invalid_status' as any }
        )
      ).rejects.toThrow(invalidStatusError);
    });
  });

  describe('DELETE /worksheets/:id', () => {
    it('should delete worksheet successfully', async () => {
      const deleteResponse = {
        success: true,
        message: 'Worksheet deleted successfully',
        deletedId: 'worksheet_123456789',
      };
      mockWorksheetsService.delete.mockResolvedValue(deleteResponse);

      const result = await controller.delete(TEST_USER_IDS.THERAPIST, 'worksheet_123456789');

      expect(result).toEqual(deleteResponse);
      expect(worksheetsService.delete).toHaveBeenCalledWith('worksheet_123456789');
    });

    it('should handle worksheet not found for deletion', async () => {
      const notFoundError = new NotFoundException('Worksheet not found');
      mockWorksheetsService.delete.mockRejectedValue(notFoundError);

      await expect(
        controller.delete(TEST_USER_IDS.THERAPIST, 'nonexistent-worksheet')
      ).rejects.toThrow(notFoundError);
    });

    it('should handle deletion of worksheet with dependencies', async () => {
      const dependencyError = new BadRequestException(
        'Cannot delete worksheet with existing submissions'
      );
      mockWorksheetsService.delete.mockRejectedValue(dependencyError);

      await expect(
        controller.delete(TEST_USER_IDS.THERAPIST, 'worksheet_123456789')
      ).rejects.toThrow(dependencyError);
    });
  });

  describe('Worksheet Submissions', () => {
    describe('POST /worksheets/submissions', () => {
      const createSubmissionDto = {
        worksheetId: 'worksheet_123456789',
        content: 'I completed all the exercises and found them very helpful.',
        clientNotes: 'The breathing exercises were particularly effective.',
        timeSpent: 45,
      };

      it('should create submission successfully', async () => {
        mockWorksheetsService.createSubmission.mockResolvedValue(mockWorksheetSubmission);

        const result = await controller.createSubmission(
          TEST_USER_IDS.CLIENT,
          createSubmissionDto
        );

        expect(result).toEqual(mockWorksheetSubmission);
        expect(worksheetsService.createSubmission).toHaveBeenCalledWith(createSubmissionDto);
      });

      it('should handle submission with attachments', async () => {
        const submissionWithAttachments = {
          ...mockWorksheetSubmission,
          attachments: mockWorksheetSubmission.attachments,
        };
        mockWorksheetsService.createSubmission.mockResolvedValue(submissionWithAttachments);

        const result = await controller.createSubmission(
          TEST_USER_IDS.CLIENT,
          createSubmissionDto
        );

        expect(result.attachments).toBeDefined();
        expect(result.attachments).toHaveLength(1);
      });

      it('should handle invalid worksheet id', async () => {
        const invalidError = new BadRequestException('Invalid worksheet ID');
        mockWorksheetsService.createSubmission.mockRejectedValue(invalidError);

        await expect(
          controller.createSubmission(TEST_USER_IDS.CLIENT, {
            ...createSubmissionDto,
            worksheetId: 'invalid-id',
          })
        ).rejects.toThrow(invalidError);
      });
    });

    describe('GET /worksheets/:id/submissions', () => {
      it('should get all submissions for worksheet', async () => {
        const mockSubmissions = [mockWorksheetSubmission];
        mockWorksheetsService.getSubmissions.mockResolvedValue(mockSubmissions);

        const result = await controller.getSubmissions('worksheet_123456789');

        expect(result).toEqual(mockSubmissions);
        expect(worksheetsService.getSubmissions).toHaveBeenCalledWith('worksheet_123456789');
      });

      it('should handle empty submissions list', async () => {
        mockWorksheetsService.getSubmissions.mockResolvedValue([]);

        const result = await controller.getSubmissions('worksheet_123456789');

        expect(result).toEqual([]);
      });
    });

    describe('PUT /worksheets/submissions/:id', () => {
      const updateSubmissionDto = {
        content: 'Updated submission content with additional insights',
        score: 9,
        feedback: 'Excellent improvement shown in this submission',
        therapistNotes: 'Client demonstrates clear understanding of concepts',
      };

      it('should update submission successfully', async () => {
        const updatedSubmission = { ...mockWorksheetSubmission, ...updateSubmissionDto };
        mockWorksheetsService.updateSubmission.mockResolvedValue(updatedSubmission);

        const result = await controller.updateSubmission(
          TEST_USER_IDS.THERAPIST,
          'submission_123456789',
          updateSubmissionDto
        );

        expect(result).toEqual(updatedSubmission);
        expect(worksheetsService.updateSubmission).toHaveBeenCalledWith(
          'submission_123456789',
          updateSubmissionDto
        );
      });

      it('should handle submission not found', async () => {
        const notFoundError = new NotFoundException('Submission not found');
        mockWorksheetsService.updateSubmission.mockRejectedValue(notFoundError);

        await expect(
          controller.updateSubmission(
            TEST_USER_IDS.THERAPIST,
            'nonexistent-submission',
            updateSubmissionDto
          )
        ).rejects.toThrow(notFoundError);
      });
    });

    describe('DELETE /worksheets/submissions/:id', () => {
      it('should delete submission successfully', async () => {
        const deleteResponse = {
          success: true,
          message: 'Submission deleted successfully',
          deletedId: 'submission_123456789',
        };
        mockWorksheetsService.deleteSubmission.mockResolvedValue(deleteResponse);

        const result = await controller.deleteSubmission(
          TEST_USER_IDS.CLIENT,
          'submission_123456789'
        );

        expect(result).toEqual(deleteResponse);
        expect(worksheetsService.deleteSubmission).toHaveBeenCalledWith('submission_123456789');
      });
    });
  });

  describe('Analytics and Statistics', () => {
    describe('GET /worksheets/stats', () => {
      it('should get worksheet statistics successfully', async () => {
        mockWorksheetsService.getWorksheetStats.mockResolvedValue(mockWorksheetStats);

        const result = await controller.getWorksheetStats(TEST_USER_IDS.THERAPIST);

        expect(result).toEqual(mockWorksheetStats);
        expect(worksheetsService.getWorksheetStats).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST);
      });

      it('should handle empty statistics', async () => {
        const emptyStats = {
          totalWorksheets: 0,
          assignedWorksheets: 0,
          inProgressWorksheets: 0,
          completedWorksheets: 0,
          overdueWorksheets: 0,
          averageCompletionTime: 0,
          completionRate: 0,
          averageScore: 0,
          popularTags: [],
          weeklyProgress: [],
        };
        mockWorksheetsService.getWorksheetStats.mockResolvedValue(emptyStats);

        const result = await controller.getWorksheetStats(TEST_USER_IDS.THERAPIST);

        expect(result).toEqual(emptyStats);
        expect(result.totalWorksheets).toBe(0);
      });
    });

    describe('GET /worksheets/analytics', () => {
      const analyticsQuery = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        groupBy: 'week',
      };

      it('should get worksheet analytics successfully', async () => {
        const mockAnalytics = {
          periodStats: {
            totalAssigned: 50,
            totalCompleted: 38,
            totalInProgress: 8,
            totalOverdue: 4,
            completionRate: 76.0,
            averageScore: 8.2,
          },
          timeline: [
            { period: '2024-01-01', assigned: 12, completed: 9, inProgress: 2, overdue: 1 },
            { period: '2024-01-08', assigned: 15, completed: 11, inProgress: 3, overdue: 1 },
            { period: '2024-01-15', assigned: 13, completed: 10, inProgress: 2, overdue: 1 },
            { period: '2024-01-22', assigned: 10, completed: 8, inProgress: 1, overdue: 1 },
          ],
          topPerformingClients: [
            { clientId: TEST_USER_IDS.CLIENT, completionRate: 95.0, averageScore: 9.2 },
          ],
          categoryBreakdown: [
            { category: 'anxiety', count: 18, completionRate: 82.0 },
            { category: 'depression', count: 15, completionRate: 73.0 },
            { category: 'mindfulness', count: 12, completionRate: 88.0 },
          ],
        };
        mockWorksheetsService.getWorksheetAnalytics.mockResolvedValue(mockAnalytics);

        const result = await controller.getWorksheetAnalytics(
          TEST_USER_IDS.THERAPIST,
          analyticsQuery
        );

        expect(result).toEqual(mockAnalytics);
        expect(worksheetsService.getWorksheetAnalytics).toHaveBeenCalledWith(
          TEST_USER_IDS.THERAPIST,
          analyticsQuery
        );
      });
    });
  });

  describe('Search and Filtering', () => {
    describe('GET /worksheets/search', () => {
      const searchQuery = {
        query: 'anxiety management',
        tags: ['anxiety', 'CBT'],
        status: 'assigned',
        clientId: TEST_USER_IDS.CLIENT,
        page: 1,
        limit: 10,
      };

      it('should search worksheets successfully', async () => {
        const searchResults = {
          worksheets: [mockWorksheet],
          totalCount: 1,
          page: 1,
          totalPages: 1,
          searchMetadata: {
            query: searchQuery.query,
            tags: searchQuery.tags,
            resultsFound: 1,
            searchTime: 45,
          },
        };
        mockWorksheetsService.searchWorksheets.mockResolvedValue(searchResults);

        const result = await controller.searchWorksheets(TEST_USER_IDS.THERAPIST, searchQuery);

        expect(result).toEqual(searchResults);
        expect(worksheetsService.searchWorksheets).toHaveBeenCalledWith(
          TEST_USER_IDS.THERAPIST,
          searchQuery
        );
      });

      it('should handle empty search results', async () => {
        const emptyResults = {
          worksheets: [],
          totalCount: 0,
          page: 1,
          totalPages: 0,
          searchMetadata: {
            query: 'nonexistent term',
            tags: [],
            resultsFound: 0,
            searchTime: 12,
          },
        };
        mockWorksheetsService.searchWorksheets.mockResolvedValue(emptyResults);

        const result = await controller.searchWorksheets(TEST_USER_IDS.THERAPIST, {
          query: 'nonexistent term',
        });

        expect(result).toEqual(emptyResults);
        expect(result.worksheets).toHaveLength(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockWorksheetsService.findAll.mockRejectedValue(serviceError);

      await expect(
        controller.findAll(TEST_USER_IDS.THERAPIST, {})
      ).rejects.toThrow(serviceError);
    });

    it('should handle file storage errors', async () => {
      const storageError = new Error('Storage service unavailable');
      mockWorksheetsService.create.mockRejectedValue(storageError);

      await expect(
        controller.create(
          TEST_USER_IDS.THERAPIST,
          {
            title: 'Test Worksheet',
            clientId: TEST_USER_IDS.CLIENT,
            therapistId: TEST_USER_IDS.THERAPIST,
          },
          mockFiles
        )
      ).rejects.toThrow(storageError);
    });

    it('should handle concurrent worksheet updates', async () => {
      const concurrencyError = new Error('Worksheet is being updated by another process');
      mockWorksheetsService.update.mockRejectedValue(concurrencyError);

      await expect(
        controller.update(TEST_USER_IDS.THERAPIST, 'worksheet_123456789', { title: 'Updated' })
      ).rejects.toThrow(concurrencyError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockWorksheetsService.getWorksheetStats.mockRejectedValue(dbError);

      await expect(
        controller.getWorksheetStats(TEST_USER_IDS.THERAPIST)
      ).rejects.toThrow(dbError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted worksheet response', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.findById('worksheet_123456789');

      TestAssertions.expectValidEntity(result, ['id', 'title', 'description', 'status']);
      expect(result.id).toBe(mockWorksheet.id);
      expect(result.status).toBe('assigned');
      expect(Array.isArray(result.tags)).toBe(true);
      expect(Array.isArray(result.materials)).toBe(true);
      expect(Array.isArray(result.submissions)).toBe(true);
    });

    it('should return properly formatted submission response', async () => {
      mockWorksheetsService.createSubmission.mockResolvedValue(mockWorksheetSubmission);

      const result = await controller.createSubmission(TEST_USER_IDS.CLIENT, {
        worksheetId: 'worksheet_123456789',
        content: 'Test submission',
      });

      TestAssertions.expectValidEntity(result, ['id', 'worksheetId', 'clientId', 'content']);
      expect(result.worksheetId).toBe('worksheet_123456789');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.attachments)).toBe(true);
    });

    it('should return properly formatted statistics response', async () => {
      mockWorksheetsService.getWorksheetStats.mockResolvedValue(mockWorksheetStats);

      const result = await controller.getWorksheetStats(TEST_USER_IDS.THERAPIST);

      expect(typeof result.totalWorksheets).toBe('number');
      expect(typeof result.completionRate).toBe('number');
      expect(typeof result.averageScore).toBe('number');
      expect(Array.isArray(result.popularTags)).toBe(true);
      expect(Array.isArray(result.weeklyProgress)).toBe(true);
    });

    it('should maintain data integrity for worksheet creation', async () => {
      const createDto = {
        title: 'Test Worksheet',
        description: 'Test description',
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
      };
      const createdWorksheet = { ...mockWorksheet, ...createDto };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.create(TEST_USER_IDS.THERAPIST, createDto, []);

      expect(result.title).toBe(createDto.title);
      expect(result.clientId).toBe(createDto.clientId);
      expect(result.therapistId).toBe(createDto.therapistId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });
});