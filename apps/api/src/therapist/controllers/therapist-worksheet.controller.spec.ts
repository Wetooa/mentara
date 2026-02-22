/**
 * Comprehensive Test Suite for TherapistWorksheetController
 * Tests therapist worksheet management functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TherapistWorksheetController } from './therapist-worksheet.controller';
import { WorksheetsService } from '../../worksheets/worksheets.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('TherapistWorksheetController', () => {
  let controller: TherapistWorksheetController;
  let worksheetsService: WorksheetsService;
  let module: TestingModule;

  // Mock WorksheetsService
  const mockWorksheetsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockWorksheet = {
    id: 'worksheet_123456789',
    title: 'Anxiety Management Worksheet',
    description: 'A worksheet to help manage anxiety symptoms',
    instructions: 'Complete the following exercises daily',
    content: {
      sections: [
        {
          type: 'text',
          title: 'Daily Mood Check',
          description: 'Rate your mood from 1-10',
        },
        {
          type: 'questions',
          title: 'Reflection Questions',
          questions: [
            'What triggered your anxiety today?',
            'What coping strategies did you use?',
          ],
        },
      ],
    },
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    status: 'assigned',
    assignedAt: new Date('2024-02-14T10:00:00Z'),
    dueDate: new Date('2024-02-21T23:59:59Z'),
    completedAt: null,
    category: 'anxiety',
    estimatedTime: 30,
    difficulty: 'intermediate',
    tags: ['anxiety', 'mood-tracking', 'coping-skills'],
  };

  const mockCompletedWorksheet = {
    ...mockWorksheet,
    status: 'completed',
    completedAt: new Date('2024-02-18T14:30:00Z'),
    responses: {
      moodRating: 7,
      reflectionAnswers: [
        'Work presentation caused anxiety',
        'Used deep breathing and positive self-talk',
      ],
    },
  };

  const mockWorksheetList = [
    mockWorksheet,
    mockCompletedWorksheet,
    {
      ...mockWorksheet,
      id: 'worksheet_987654321',
      title: 'Depression Assessment',
      status: 'in_progress',
      category: 'depression',
    },
  ];

  const createWorksheetDto = {
    title: 'New CBT Worksheet',
    description: 'Cognitive Behavioral Therapy exercises',
    instructions: 'Complete all sections within one week',
    content: {
      sections: [
        {
          type: 'text',
          title: 'Thought Record',
          description: 'Record your negative thoughts',
        },
      ],
    },
    clientId: TEST_USER_IDS.CLIENT,
    category: 'cbt',
    dueDate: new Date('2024-02-28T23:59:59Z'),
    estimatedTime: 45,
    difficulty: 'advanced',
    tags: ['cbt', 'thought-record'],
  };

  const updateWorksheetDto = {
    title: 'Updated Anxiety Worksheet',
    description: 'Updated description with new exercises',
    instructions: 'Updated instructions for better clarity',
    dueDate: new Date('2024-02-25T23:59:59Z'),
    estimatedTime: 40,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TherapistWorksheetController],
      providers: [
        {
          provide: WorksheetsService,
          useValue: mockWorksheetsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TherapistWorksheetController>(TherapistWorksheetController);
    worksheetsService = module.get<WorksheetsService>(WorksheetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have worksheetsService injected', () => {
      expect(worksheetsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TherapistWorksheetController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', TherapistWorksheetController);
      expect(controllerMetadata).toBe('therapist/worksheets');
    });
  });

  describe('GET /therapist/worksheets', () => {
    it('should get therapist worksheets successfully', async () => {
      mockWorksheetsService.findAll.mockResolvedValue(mockWorksheetList);

      const result = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockWorksheetList);
      expect(worksheetsService.findAll).toHaveBeenCalledWith(
        undefined, // clientId
        TEST_USER_IDS.THERAPIST,
        undefined // status
      );
    });

    it('should filter worksheets by status', async () => {
      const completedWorksheets = [mockCompletedWorksheet];
      mockWorksheetsService.findAll.mockResolvedValue(completedWorksheets);

      const result = await controller.getTherapistWorksheets(
        TEST_USER_IDS.THERAPIST,
        'completed'
      );

      expect(result).toEqual(completedWorksheets);
      expect(worksheetsService.findAll).toHaveBeenCalledWith(
        undefined,
        TEST_USER_IDS.THERAPIST,
        'completed'
      );
    });

    it('should filter worksheets by client', async () => {
      const clientWorksheets = [mockWorksheet];
      mockWorksheetsService.findAll.mockResolvedValue(clientWorksheets);

      const result = await controller.getTherapistWorksheets(
        TEST_USER_IDS.THERAPIST,
        undefined,
        TEST_USER_IDS.CLIENT
      );

      expect(result).toEqual(clientWorksheets);
      expect(worksheetsService.findAll).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        undefined
      );
    });

    it('should filter worksheets by both status and client', async () => {
      const filteredWorksheets = [mockCompletedWorksheet];
      mockWorksheetsService.findAll.mockResolvedValue(filteredWorksheets);

      const result = await controller.getTherapistWorksheets(
        TEST_USER_IDS.THERAPIST,
        'completed',
        TEST_USER_IDS.CLIENT
      );

      expect(result).toEqual(filteredWorksheets);
      expect(worksheetsService.findAll).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        TEST_USER_IDS.THERAPIST,
        'completed'
      );
    });

    it('should handle empty worksheet list', async () => {
      mockWorksheetsService.findAll.mockResolvedValue([]);

      const result = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Failed to retrieve worksheets');
      mockWorksheetsService.findAll.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST)
      ).rejects.toThrow(serviceError);
    });

    it('should validate worksheet list structure', async () => {
      mockWorksheetsService.findAll.mockResolvedValue(mockWorksheetList);

      const result = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(worksheet => {
        expect(worksheet).toHaveProperty('id');
        expect(worksheet).toHaveProperty('title');
        expect(worksheet).toHaveProperty('description');
        expect(worksheet).toHaveProperty('clientId');
        expect(worksheet).toHaveProperty('therapistId');
        expect(worksheet).toHaveProperty('status');
        expect(worksheet).toHaveProperty('assignedAt');
        expect(['assigned', 'in_progress', 'completed', 'overdue']).toContain(worksheet.status);
      });
    });
  });

  describe('GET /therapist/worksheets/:id', () => {
    it('should get therapist worksheet by id successfully', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789'
      );

      expect(result).toEqual(mockWorksheet);
      expect(worksheetsService.findById).toHaveBeenCalledWith('worksheet_123456789');
    });

    it('should handle non-existent worksheet', async () => {
      mockWorksheetsService.findById.mockResolvedValue(null);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'nonexistent_worksheet'
      );

      expect(result).toBeNull();
    });

    it('should handle service errors for worksheet by id', async () => {
      const serviceError = new Error('Database connection failed');
      mockWorksheetsService.findById.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistWorksheetById(TEST_USER_IDS.THERAPIST, 'worksheet_123')
      ).rejects.toThrow(serviceError);
    });

    it('should validate worksheet detail structure', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789'
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('clientId');
      expect(result).toHaveProperty('therapistId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('assignedAt');
      expect(result).toHaveProperty('dueDate');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('estimatedTime');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('tags');

      expect(typeof result.content).toBe('object');
      expect(Array.isArray(result.content.sections)).toBe(true);
      expect(Array.isArray(result.tags)).toBe(true);
      expect(typeof result.estimatedTime).toBe('number');
    });

    it('should handle completed worksheet with responses', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockCompletedWorksheet);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'worksheet_completed'
      );

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();
      expect(result.responses).toBeDefined();
      expect(typeof result.responses).toBe('object');
    });
  });

  describe('POST /therapist/worksheets', () => {
    it('should create therapist worksheet successfully', async () => {
      const createdWorksheet = { ...mockWorksheet, ...createWorksheetDto };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.createTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto
      );

      expect(result).toEqual(createdWorksheet);
      expect(worksheetsService.create).toHaveBeenCalledWith(
        createWorksheetDto,
        createWorksheetDto.clientId,
        TEST_USER_IDS.THERAPIST
      );
    });

    it('should handle service errors during creation', async () => {
      const serviceError = new Error('Failed to create worksheet');
      mockWorksheetsService.create.mockRejectedValue(serviceError);

      await expect(
        controller.createTherapistWorksheet(TEST_USER_IDS.THERAPIST, createWorksheetDto)
      ).rejects.toThrow(serviceError);
    });

    it('should validate created worksheet structure', async () => {
      const createdWorksheet = {
        ...mockWorksheet,
        ...createWorksheetDto,
        id: 'new_worksheet_123',
        assignedAt: new Date(),
      };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.createTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('clientId');
      expect(result).toHaveProperty('therapistId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('assignedAt');
      expect(result.title).toBe(createWorksheetDto.title);
      expect(result.clientId).toBe(createWorksheetDto.clientId);
      expect(result.therapistId).toBe(TEST_USER_IDS.THERAPIST);
      expect(result.status).toBe('assigned');
    });

    it('should handle different worksheet categories', async () => {
      const categories = ['anxiety', 'depression', 'cbt', 'mindfulness', 'trauma'];

      for (const category of categories) {
        const dto = { ...createWorksheetDto, category };
        const createdWorksheet = { ...mockWorksheet, category };
        mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

        const result = await controller.createTherapistWorksheet(
          TEST_USER_IDS.THERAPIST,
          dto
        );

        expect(result.category).toBe(category);
      }
    });

    it('should handle different difficulty levels', async () => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];

      for (const difficulty of difficulties) {
        const dto = { ...createWorksheetDto, difficulty };
        const createdWorksheet = { ...mockWorksheet, difficulty };
        mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

        const result = await controller.createTherapistWorksheet(
          TEST_USER_IDS.THERAPIST,
          dto
        );

        expect(result.difficulty).toBe(difficulty);
      }
    });
  });

  describe('PUT /therapist/worksheets/:id', () => {
    it('should update therapist worksheet successfully', async () => {
      const updatedWorksheet = { ...mockWorksheet, ...updateWorksheetDto };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.updateTherapistWorksheet(
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
      const partialUpdate = { title: 'Partially Updated Title' };
      const updatedWorksheet = { ...mockWorksheet, title: partialUpdate.title };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.updateTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789',
        partialUpdate
      );

      expect(result.title).toBe(partialUpdate.title);
      expect(worksheetsService.update).toHaveBeenCalledWith(
        'worksheet_123456789',
        partialUpdate
      );
    });

    it('should handle service errors during update', async () => {
      const serviceError = new Error('Worksheet not found');
      mockWorksheetsService.update.mockRejectedValue(serviceError);

      await expect(
        controller.updateTherapistWorksheet(
          TEST_USER_IDS.THERAPIST,
          'nonexistent_worksheet',
          updateWorksheetDto
        )
      ).rejects.toThrow(serviceError);
    });

    it('should validate updated worksheet structure', async () => {
      const updatedWorksheet = { ...mockWorksheet, ...updateWorksheetDto };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.updateTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789',
        updateWorksheetDto
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('instructions');
      expect(result.title).toBe(updateWorksheetDto.title);
      expect(result.description).toBe(updateWorksheetDto.description);
      expect(result.instructions).toBe(updateWorksheetDto.instructions);
    });

    it('should handle updating due date', async () => {
      const updatedWorksheet = { ...mockWorksheet, dueDate: updateWorksheetDto.dueDate };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);

      const result = await controller.updateTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789',
        { dueDate: updateWorksheetDto.dueDate }
      );

      expect(result.dueDate).toEqual(updateWorksheetDto.dueDate);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted worksheet list', async () => {
      mockWorksheetsService.findAll.mockResolvedValue(mockWorksheetList);

      const result = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(worksheet => {
        expect(worksheet).toHaveProperty('id');
        expect(worksheet).toHaveProperty('title');
        expect(worksheet).toHaveProperty('clientId');
        expect(worksheet).toHaveProperty('therapistId');
        expect(worksheet).toHaveProperty('status');
        expect(worksheet).toHaveProperty('assignedAt');
        expect(worksheet.assignedAt).toBeInstanceOf(Date);
      });
    });

    it('should return properly formatted worksheet detail', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789'
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('clientId');
      expect(result).toHaveProperty('therapistId');
      expect(result).toHaveProperty('status');
      expect(result.assignedAt).toBeInstanceOf(Date);
      expect(result.dueDate).toBeInstanceOf(Date);
    });

    it('should return properly formatted created worksheet', async () => {
      const createdWorksheet = { ...mockWorksheet, ...createWorksheetDto };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);

      const result = await controller.createTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('clientId');
      expect(result).toHaveProperty('therapistId');
      expect(result).toHaveProperty('status');
      expect(typeof result.estimatedTime).toBe('number');
      expect(Array.isArray(result.tags)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle worksheet service unavailable', async () => {
      const serviceError = new Error('Worksheet service temporarily unavailable');
      mockWorksheetsService.findAll.mockRejectedValue(serviceError);

      await expect(
        controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST)
      ).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockWorksheetsService.create.mockRejectedValue(dbError);

      await expect(
        controller.createTherapistWorksheet(TEST_USER_IDS.THERAPIST, createWorksheetDto)
      ).rejects.toThrow(dbError);
    });

    it('should handle invalid worksheet IDs', async () => {
      const invalidIdError = new Error('Invalid worksheet ID format');
      mockWorksheetsService.findById.mockRejectedValue(invalidIdError);

      await expect(
        controller.getTherapistWorksheetById(TEST_USER_IDS.THERAPIST, 'invalid-id')
      ).rejects.toThrow(invalidIdError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete worksheet management workflow', async () => {
      // Create worksheet
      const createdWorksheet = { ...mockWorksheet, ...createWorksheetDto };
      mockWorksheetsService.create.mockResolvedValue(createdWorksheet);
      const createResult = await controller.createTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        createWorksheetDto
      );
      expect(createResult.id).toBeDefined();

      // Get worksheet by ID
      mockWorksheetsService.findById.mockResolvedValue(createdWorksheet);
      const getResult = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        createResult.id
      );
      expect(getResult.id).toBe(createResult.id);

      // Update worksheet
      const updatedWorksheet = { ...createdWorksheet, ...updateWorksheetDto };
      mockWorksheetsService.update.mockResolvedValue(updatedWorksheet);
      const updateResult = await controller.updateTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        createResult.id,
        updateWorksheetDto
      );
      expect(updateResult.title).toBe(updateWorksheetDto.title);

      // List worksheets
      mockWorksheetsService.findAll.mockResolvedValue([updatedWorksheet]);
      const listResult = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);
      expect(listResult).toHaveLength(1);
      expect(listResult[0].id).toBe(createResult.id);
    });

    it('should handle worksheet filtering and status management', async () => {
      // Get all worksheets
      mockWorksheetsService.findAll.mockResolvedValue(mockWorksheetList);
      const allWorksheets = await controller.getTherapistWorksheets(TEST_USER_IDS.THERAPIST);
      expect(allWorksheets).toHaveLength(3);

      // Filter by status
      const completedWorksheets = mockWorksheetList.filter(w => w.status === 'completed');
      mockWorksheetsService.findAll.mockResolvedValue(completedWorksheets);
      const statusFiltered = await controller.getTherapistWorksheets(
        TEST_USER_IDS.THERAPIST,
        'completed'
      );
      expect(statusFiltered).toHaveLength(1);
      expect(statusFiltered[0].status).toBe('completed');

      // Filter by client
      const clientWorksheets = mockWorksheetList.filter(w => w.clientId === TEST_USER_IDS.CLIENT);
      mockWorksheetsService.findAll.mockResolvedValue(clientWorksheets);
      const clientFiltered = await controller.getTherapistWorksheets(
        TEST_USER_IDS.THERAPIST,
        undefined,
        TEST_USER_IDS.CLIENT
      );
      expect(clientFiltered.every(w => w.clientId === TEST_USER_IDS.CLIENT)).toBe(true);
    });

    it('should validate worksheet content structure', async () => {
      mockWorksheetsService.findById.mockResolvedValue(mockWorksheet);

      const result = await controller.getTherapistWorksheetById(
        TEST_USER_IDS.THERAPIST,
        'worksheet_123456789'
      );

      expect(result.content).toHaveProperty('sections');
      expect(Array.isArray(result.content.sections)).toBe(true);
      result.content.sections.forEach(section => {
        expect(section).toHaveProperty('type');
        expect(section).toHaveProperty('title');
        expect(['text', 'questions', 'scale', 'checkbox']).toContain(section.type);
      });
    });

    it('should handle worksheet assignment workflow', async () => {
      // Therapist creates worksheet for client
      const assignmentDto = {
        ...createWorksheetDto,
        clientId: TEST_USER_IDS.CLIENT,
        instructions: 'Please complete this within one week',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      };

      const assignedWorksheet = {
        ...mockWorksheet,
        ...assignmentDto,
        status: 'assigned',
        assignedAt: new Date(),
      };

      mockWorksheetsService.create.mockResolvedValue(assignedWorksheet);
      const result = await controller.createTherapistWorksheet(
        TEST_USER_IDS.THERAPIST,
        assignmentDto
      );

      expect(result.status).toBe('assigned');
      expect(result.clientId).toBe(TEST_USER_IDS.CLIENT);
      expect(result.therapistId).toBe(TEST_USER_IDS.THERAPIST);
      expect(result.assignedAt).toBeInstanceOf(Date);
      expect(result.dueDate).toBeInstanceOf(Date);
    });
  });
});