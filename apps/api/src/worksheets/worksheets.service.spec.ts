import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorksheetsService } from './worksheets.service';
import { PrismaService } from '../providers/prisma-client.provider';
import type {
  WorksheetCreateInputDto,
  WorksheetSubmissionCreateInputDto,
  WorksheetUpdateInputDto,
} from './types';

describe('WorksheetsService', () => {
  let service: WorksheetsService;
  let prismaService: jest.Mocked<PrismaService>;

  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');
  const mockDueDate = new Date('2024-01-22T10:00:00Z');

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockClient = {
    id: 'client-123',
    userId: 'user-123',
    user: mockUser,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockTherapist = {
    id: 'therapist-456',
    userId: 'therapist-user-456',
    user: {
      id: 'therapist-user-456',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/therapist-avatar.jpg',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockWorksheet = {
    id: 'worksheet-789',
    title: 'Anxiety Management Worksheet',
    instructions: 'Complete the exercises in order',
    description: 'This worksheet helps manage anxiety symptoms',
    dueDate: mockDueDate,
    status: 'assigned',
    isCompleted: false,
    clientId: 'client-123',
    therapistId: 'therapist-456',
    materialUrls: ['https://example.com/material1.pdf', 'https://example.com/material2.pdf'],
    materialNames: ['Exercise Instructions', 'Reference Material'],
    materialSizes: [1024, 2048],
    submissionUrls: [],
    submissionNames: [],
    submissionSizes: [],
    feedback: null,
    submittedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
    client: mockClient,
    therapist: mockTherapist,
  };

  const mockCompletedWorksheet = {
    ...mockWorksheet,
    id: 'worksheet-completed',
    status: 'completed',
    isCompleted: true,
    submissionUrls: ['https://example.com/submission.pdf'],
    submissionNames: ['My Completed Worksheet'],
    submissionSizes: [3072],
    feedback: 'Great progress on anxiety management!',
    submittedAt: new Date('2024-01-20T14:30:00Z'),
  };

  const mockWorksheetList = [
    mockWorksheet,
    mockCompletedWorksheet,
    {
      ...mockWorksheet,
      id: 'worksheet-another',
      title: 'Depression Assessment',
      clientId: 'client-456',
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      worksheet: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorksheetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WorksheetsService>(WorksheetsService);
    prismaService = module.get(PrismaService);

    // Mock Date constructor for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    beforeEach(() => {
      prismaService.worksheet.findMany.mockResolvedValue(mockWorksheetList);
    });

    it('should return all worksheets when no filters provided', async () => {
      const result = await service.findAll();

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toEqual(mockWorksheetList);
      expect(result).toHaveLength(3);
    });

    it('should filter by userId (clientId)', async () => {
      await service.findAll('user-123');

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by therapistId', async () => {
      await service.findAll(undefined, 'therapist-456');

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: { therapistId: 'therapist-456' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status', async () => {
      await service.findAll(undefined, undefined, 'completed');

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: { status: 'completed' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply multiple filters', async () => {
      await service.findAll('user-123', 'therapist-456', 'assigned');

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: {
          clientId: 'user-123',
          therapistId: 'therapist-456',
          status: 'assigned',
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle empty result set', async () => {
      prismaService.worksheet.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.worksheet.findMany.mockRejectedValue(databaseError);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should include correct related data structure', async () => {
      await service.findAll();

      const expectedInclude = {
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      };

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expectedInclude,
        })
      );
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
    });

    it('should return worksheet with transformed materials and submissions', async () => {
      const result = await service.findById('worksheet-789');

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual({
        ...mockWorksheet,
        materials: [
          {
            id: 'material-0',
            filename: 'Exercise Instructions',
            url: 'https://example.com/material1.pdf',
            fileType: 'application/octet-stream',
            fileSize: 1024,
          },
          {
            id: 'material-1',
            filename: 'Reference Material',
            url: 'https://example.com/material2.pdf',
            fileType: 'application/octet-stream',
            fileSize: 2048,
          },
        ],
        submissions: [],
      });
    });

    it('should transform submissions when present', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockCompletedWorksheet);

      const result = await service.findById('worksheet-completed');

      expect(result.submissions).toEqual([
        {
          id: 'submission-0',
          filename: 'My Completed Worksheet',
          url: 'https://example.com/submission.pdf',
          fileType: 'application/octet-stream',
          fileSize: 3072,
          submittedAt: new Date('2024-01-20T14:30:00Z'),
        },
      ]);
    });

    it('should handle materials with missing names gracefully', async () => {
      const worksheetWithMissingNames = {
        ...mockWorksheet,
        materialNames: ['Exercise Instructions'], // Only one name for two URLs
      };
      prismaService.worksheet.findUnique.mockResolvedValue(worksheetWithMissingNames);

      const result = await service.findById('worksheet-789');

      expect(result.materials).toEqual([
        {
          id: 'material-0',
          filename: 'Exercise Instructions',
          url: 'https://example.com/material1.pdf',
          fileType: 'application/octet-stream',
          fileSize: 1024,
        },
        {
          id: 'material-1',
          filename: 'Unknown',
          url: 'https://example.com/material2.pdf',
          fileType: 'application/octet-stream',
          fileSize: 2048,
        },
      ]);
    });

    it('should handle materials with missing sizes gracefully', async () => {
      const worksheetWithMissingSizes = {
        ...mockWorksheet,
        materialSizes: [1024], // Only one size for two URLs
      };
      prismaService.worksheet.findUnique.mockResolvedValue(worksheetWithMissingSizes);

      const result = await service.findById('worksheet-789');

      expect(result.materials[1].fileSize).toBe(0);
    });

    it('should throw NotFoundException when worksheet not found', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        new NotFoundException('Worksheet with ID non-existent not found')
      );
    });

    it('should handle empty materials and submissions arrays', async () => {
      const emptyWorksheet = {
        ...mockWorksheet,
        materialUrls: [],
        materialNames: [],
        materialSizes: [],
        submissionUrls: [],
        submissionNames: [],
        submissionSizes: [],
      };
      prismaService.worksheet.findUnique.mockResolvedValue(emptyWorksheet);

      const result = await service.findById('worksheet-789');

      expect(result.materials).toEqual([]);
      expect(result.submissions).toEqual([]);
    });

    it('should handle database errors', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.worksheet.findUnique.mockRejectedValue(databaseError);

      await expect(service.findById('worksheet-789')).rejects.toThrow('Database connection failed');
    });
  });

  describe('create', () => {
    const mockCreateData: WorksheetCreateInputDto = {
      title: 'New Worksheet',
      instructions: 'Follow these steps',
      description: 'A helpful worksheet',
      dueDate: mockDueDate,
    };

    const mockCreatedWorksheet = {
      id: 'new-worksheet-123',
      ...mockCreateData,
      status: 'assigned',
      isCompleted: false,
      clientId: 'client-123',
      therapistId: 'therapist-456',
      materialUrls: [],
      materialNames: [],
      materialSizes: [],
      submissionUrls: [],
      submissionNames: [],
      submissionSizes: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    };

    beforeEach(() => {
      prismaService.worksheet.create.mockResolvedValue(mockCreatedWorksheet);
      // Mock findById call that happens after creation
      jest.spyOn(service, 'findById').mockResolvedValue({
        ...mockCreatedWorksheet,
        client: mockClient,
        therapist: mockTherapist,
        materials: [],
        submissions: [],
      } as any);
    });

    it('should create worksheet with provided data', async () => {
      const result = await service.create(
        mockCreateData,
        'client-123',
        'therapist-456'
      );

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: {
          title: 'New Worksheet',
          instructions: 'Follow these steps',
          description: 'A helpful worksheet',
          dueDate: mockDueDate,
          status: 'assigned',
          isCompleted: false,
          clientId: 'client-123',
          therapistId: 'therapist-456',
          materialUrls: [],
          materialNames: [],
          materialSizes: [],
          submissionUrls: [],
          submissionNames: [],
          submissionSizes: [],
        },
      });

      expect(service.findById).toHaveBeenCalledWith('new-worksheet-123');
      expect(result).toEqual(expect.objectContaining({
        id: 'new-worksheet-123',
        title: 'New Worksheet',
        clientId: 'client-123',
        therapistId: 'therapist-456',
      }));
    });

    it('should use default due date when not provided', async () => {
      const dataWithoutDueDate = {
        title: 'New Worksheet',
        instructions: 'Follow these steps',
        description: 'A helpful worksheet',
      };

      await service.create(dataWithoutDueDate, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: mockDate, // Should use current date
        }),
      });
    });

    it('should handle custom status in data', async () => {
      const dataWithStatus = {
        ...mockCreateData,
        status: 'draft',
      } as any;

      await service.create(dataWithStatus, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'draft',
        }),
      });
    });

    it('should handle custom isCompleted in data', async () => {
      const dataWithCompletion = {
        ...mockCreateData,
        isCompleted: true,
      } as any;

      await service.create(dataWithCompletion, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isCompleted: true,
        }),
      });
    });

    it('should ignore files parameter (legacy support)', async () => {
      const mockFiles = [
        { filename: 'test.pdf', size: 1024 } as Express.Multer.File,
      ];

      await service.create(mockCreateData, 'client-123', 'therapist-456', mockFiles);

      // Should still create with empty file arrays
      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          materialUrls: [],
          materialNames: [],
          materialSizes: [],
        }),
      });
    });

    it('should handle database errors during creation', async () => {
      const databaseError = new Error('Database constraint violation');
      prismaService.worksheet.create.mockRejectedValue(databaseError);

      await expect(
        service.create(mockCreateData, 'client-123', 'therapist-456')
      ).rejects.toThrow('Database constraint violation');
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteData = {
        title: 'Incomplete Worksheet',
        // Missing instructions and description
      } as WorksheetCreateInputDto;

      await service.create(incompleteData, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Incomplete Worksheet',
          instructions: undefined,
          description: undefined,
        }),
      });
    });
  });

  describe('update', () => {
    const mockUpdateData: WorksheetUpdateInputDto = {
      title: 'Updated Worksheet Title',
      instructions: 'Updated instructions',
      status: 'in_progress',
    };

    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        ...mockUpdateData,
      });
      // Mock findById call that happens after update
      jest.spyOn(service, 'findById').mockResolvedValue({
        ...mockWorksheet,
        ...mockUpdateData,
        client: mockClient,
        therapist: mockTherapist,
        materials: [],
        submissions: [],
      } as any);
    });

    it('should update worksheet successfully', async () => {
      const result = await service.update('worksheet-789', mockUpdateData);

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
      });

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: mockUpdateData,
      });

      expect(service.findById).toHaveBeenCalledWith('worksheet-789');
      expect(result).toEqual(expect.objectContaining({
        title: 'Updated Worksheet Title',
        instructions: 'Updated instructions',
        status: 'in_progress',
      }));
    });

    it('should throw NotFoundException when worksheet does not exist', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', mockUpdateData)
      ).rejects.toThrow(
        new NotFoundException('Worksheet with ID non-existent not found')
      );

      expect(prismaService.worksheet.update).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { title: 'Only Title Updated' };

      await service.update('worksheet-789', partialUpdate);

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: partialUpdate,
      });
    });

    it('should handle empty update data', async () => {
      const emptyUpdate = {};

      await service.update('worksheet-789', emptyUpdate);

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: emptyUpdate,
      });
    });

    it('should handle database errors during update', async () => {
      const databaseError = new Error('Database constraint violation');
      prismaService.worksheet.update.mockRejectedValue(databaseError);

      await expect(
        service.update('worksheet-789', mockUpdateData)
      ).rejects.toThrow('Database constraint violation');
    });

    it('should handle database errors during existence check', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.worksheet.findUnique.mockRejectedValue(databaseError);

      await expect(
        service.update('worksheet-789', mockUpdateData)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
      prismaService.worksheet.delete.mockResolvedValue(mockWorksheet);
    });

    it('should delete worksheet successfully', async () => {
      const result = await service.delete('worksheet-789');

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
      });

      expect(prismaService.worksheet.delete).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
      });

      expect(result).toEqual({
        success: true,
        message: 'Worksheet deleted successfully',
      });
    });

    it('should throw NotFoundException when worksheet does not exist', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        new NotFoundException('Worksheet with ID non-existent not found')
      );

      expect(prismaService.worksheet.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion', async () => {
      const databaseError = new Error('Foreign key constraint violation');
      prismaService.worksheet.delete.mockRejectedValue(databaseError);

      await expect(service.delete('worksheet-789')).rejects.toThrow(
        'Foreign key constraint violation'
      );
    });

    it('should handle database errors during existence check', async () => {
      const databaseError = new Error('Database connection failed');
      prismaService.worksheet.findUnique.mockRejectedValue(databaseError);

      await expect(service.delete('worksheet-789')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('addSubmission', () => {
    const mockSubmissionData: WorksheetSubmissionCreateInputDto = {
      worksheetId: 'worksheet-789',
      isCompleted: false,
      notes: 'Some progress made',
    } as any;

    const mockWorksheetWithClient = {
      ...mockWorksheet,
      client: mockClient,
    };

    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheetWithClient);
      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        feedback: 'Some progress made',
        status: 'assigned',
        isCompleted: false,
      });
    });

    it('should add submission without completing worksheet', async () => {
      const result = await service.addSubmission(mockSubmissionData, 'client-123');

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        include: { client: true },
      });

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: {
          feedback: 'Some progress made',
          isCompleted: false,
          status: 'assigned',
          submittedAt: null,
        },
      });

      expect(result).toEqual({
        id: 'worksheet-789',
        worksheetId: 'worksheet-789',
        clientId: 'client-123',
        status: 'assigned',
        submittedAt: null,
      });
    });

    it('should complete worksheet when isCompleted is true', async () => {
      const completedSubmissionData = {
        ...mockSubmissionData,
        isCompleted: true,
      };

      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        feedback: 'Some progress made',
        status: 'completed',
        isCompleted: true,
        submittedAt: mockDate,
      });

      const result = await service.addSubmission(completedSubmissionData, 'client-123');

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: {
          feedback: 'Some progress made',
          isCompleted: true,
          status: 'completed',
          submittedAt: mockDate,
        },
      });

      expect(result).toEqual({
        id: 'worksheet-789',
        worksheetId: 'worksheet-789',
        clientId: 'client-123',
        status: 'completed',
        submittedAt: mockDate,
      });
    });

    it('should handle submission without notes', async () => {
      const submissionWithoutNotes = {
        worksheetId: 'worksheet-789',
        isCompleted: false,
      } as any;

      await service.addSubmission(submissionWithoutNotes, 'client-123');

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: {
          feedback: null,
          isCompleted: false,
          status: 'assigned',
          submittedAt: null,
        },
      });
    });

    it('should throw NotFoundException when worksheet does not exist', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(
        service.addSubmission(mockSubmissionData, 'client-123')
      ).rejects.toThrow(
        new NotFoundException('Worksheet with ID worksheet-789 not found')
      );

      expect(prismaService.worksheet.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const databaseError = new Error('Database constraint violation');
      prismaService.worksheet.update.mockRejectedValue(databaseError);

      await expect(
        service.addSubmission(mockSubmissionData, 'client-123')
      ).rejects.toThrow('Database constraint violation');
    });

    it('should set correct timestamp when completing', async () => {
      const completedSubmissionData = {
        ...mockSubmissionData,
        isCompleted: true,
      };

      await service.addSubmission(completedSubmissionData, 'client-123');

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: expect.objectContaining({
          submittedAt: mockDate,
        }),
      });
    });
  });

  describe('submitWorksheet', () => {
    const mockSubmissionData: WorksheetSubmissionCreateInputDto = {
      worksheetId: 'worksheet-789',
      notes: 'Completed all exercises',
    } as any;

    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        feedback: 'Completed all exercises',
        status: 'completed',
        isCompleted: true,
        submittedAt: mockDate,
      });
    });

    it('should submit worksheet and mark as completed', async () => {
      const result = await service.submitWorksheet('worksheet-789', mockSubmissionData, 'client-123');

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
      });

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: {
          feedback: 'Completed all exercises',
          isCompleted: true,
          status: 'completed',
          submittedAt: mockDate,
        },
      });

      expect(result).toEqual({
        worksheetId: 'worksheet-789',
        submissionId: 'worksheet-789',
        status: 'completed',
        submittedAt: mockDate,
        message: 'Worksheet submitted successfully',
      });
    });

    it('should handle submission without notes', async () => {
      const submissionWithoutNotes = {
        worksheetId: 'worksheet-789',
      } as any;

      await service.submitWorksheet('worksheet-789', submissionWithoutNotes, 'client-123');

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: {
          feedback: null,
          isCompleted: true,
          status: 'completed',
          submittedAt: mockDate,
        },
      });
    });

    it('should throw NotFoundException when worksheet does not exist', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(
        service.submitWorksheet('non-existent', mockSubmissionData, 'client-123')
      ).rejects.toThrow(
        new NotFoundException('Worksheet with ID non-existent not found')
      );

      expect(prismaService.worksheet.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during submission', async () => {
      const databaseError = new Error('Database constraint violation');
      prismaService.worksheet.update.mockRejectedValue(databaseError);

      await expect(
        service.submitWorksheet('worksheet-789', mockSubmissionData, 'client-123')
      ).rejects.toThrow('Database constraint violation');
    });

    it('should always use current timestamp for submission', async () => {
      const laterDate = new Date('2024-01-16T15:30:00Z');
      jest.setSystemTime(laterDate);

      await service.submitWorksheet('worksheet-789', mockSubmissionData, 'client-123');

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-789' },
        data: expect.objectContaining({
          submittedAt: laterDate,
        }),
      });
    });

    it('should use worksheet ID as submission ID', async () => {
      const result = await service.submitWorksheet('worksheet-789', mockSubmissionData, 'client-123');

      expect(result.worksheetId).toBe('worksheet-789');
      expect(result.submissionId).toBe('worksheet-789');
    });
  });

  describe('deleteSubmission', () => {
    beforeEach(() => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockCompletedWorksheet);
      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        isCompleted: false,
        status: 'assigned',
        submittedAt: null,
        feedback: null,
        submissionUrls: [],
        submissionNames: [],
        submissionSizes: [],
      });
    });

    it('should reset worksheet submission status', async () => {
      const result = await service.deleteSubmission('worksheet-completed');

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: 'worksheet-completed' },
      });

      expect(prismaService.worksheet.update).toHaveBeenCalledWith({
        where: { id: 'worksheet-completed' },
        data: {
          isCompleted: false,
          status: 'assigned',
          submittedAt: null,
          feedback: null,
          submissionUrls: [],
          submissionNames: [],
          submissionSizes: [],
        },
      });

      expect(result).toEqual({
        success: true,
        message: 'Submission reset successfully',
      });
    });

    it('should throw NotFoundException when worksheet does not exist', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(null);

      await expect(service.deleteSubmission('non-existent')).rejects.toThrow(
        new NotFoundException('Worksheet with ID non-existent not found')
      );

      expect(prismaService.worksheet.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during reset', async () => {
      const databaseError = new Error('Database constraint violation');
      prismaService.worksheet.update.mockRejectedValue(databaseError);

      await expect(service.deleteSubmission('worksheet-completed')).rejects.toThrow(
        'Database constraint violation'
      );
    });

    it('should clear submission data but preserve materials', async () => {
      await service.deleteSubmission('worksheet-completed');

      const updateCall = prismaService.worksheet.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({
        isCompleted: false,
        status: 'assigned',
        submittedAt: null,
        feedback: null,
        submissionUrls: [],
        submissionNames: [],
        submissionSizes: [],
      });

      // Should not modify material arrays
      expect(updateCall.data).not.toHaveProperty('materialUrls');
      expect(updateCall.data).not.toHaveProperty('materialNames');
      expect(updateCall.data).not.toHaveProperty('materialSizes');
    });

    it('should handle worksheet that was never submitted', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);

      const result = await service.deleteSubmission('worksheet-789');

      expect(result).toEqual({
        success: true,
        message: 'Submission reset successfully',
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle findAll with null filter values', async () => {
      prismaService.worksheet.findMany.mockResolvedValue([]);

      await service.findAll(null as any, null as any, null as any);

      expect(prismaService.worksheet.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle findById with empty string ID', async () => {
      await expect(service.findById('')).rejects.toThrow(NotFoundException);

      expect(prismaService.worksheet.findUnique).toHaveBeenCalledWith({
        where: { id: '' },
        include: expect.any(Object),
      });
    });

    it('should handle create with very long strings', async () => {
      const longString = 'x'.repeat(10000);
      const dataWithLongStrings = {
        title: longString,
        instructions: longString,
        description: longString,
      };

      prismaService.worksheet.create.mockResolvedValue({
        id: 'new-worksheet',
        ...dataWithLongStrings,
        status: 'assigned',
        isCompleted: false,
      } as any);

      jest.spyOn(service, 'findById').mockResolvedValue({} as any);

      await service.create(dataWithLongStrings, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: longString,
          instructions: longString,
          description: longString,
        }),
      });
    });

    it('should handle materials transformation with mismatched array lengths', async () => {
      const mismatchedWorksheet = {
        ...mockWorksheet,
        materialUrls: ['url1', 'url2', 'url3'],
        materialNames: ['name1'],
        materialSizes: [1024, 2048],
      };
      prismaService.worksheet.findUnique.mockResolvedValue(mismatchedWorksheet);

      const result = await service.findById('worksheet-789');

      expect(result.materials).toEqual([
        {
          id: 'material-0',
          filename: 'name1',
          url: 'url1',
          fileType: 'application/octet-stream',
          fileSize: 1024,
        },
        {
          id: 'material-1',
          filename: 'Unknown',
          url: 'url2',
          fileType: 'application/octet-stream',
          fileSize: 2048,
        },
        {
          id: 'material-2',
          filename: 'Unknown',
          url: 'url3',
          fileType: 'application/octet-stream',
          fileSize: 0,
        },
      ]);
    });

    it('should handle concurrent operations gracefully', async () => {
      prismaService.worksheet.findMany.mockResolvedValue(mockWorksheetList);
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);

      const promises = [
        service.findAll(),
        service.findById('worksheet-789'),
        service.findAll('user-123'),
        service.findById('worksheet-789'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      expect(results[0]).toEqual(mockWorksheetList);
      expect(results[2]).toEqual(mockWorksheetList);
    });

    it('should handle database connection issues', async () => {
      const connectionError = new Error('ECONNREFUSED');
      prismaService.worksheet.findMany.mockRejectedValue(connectionError);

      await expect(service.findAll()).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle invalid date objects in due dates', async () => {
      const invalidDateData = {
        title: 'Test Worksheet',
        instructions: 'Test instructions',
        description: 'Test description',
        dueDate: new Date('invalid-date'),
      };

      prismaService.worksheet.create.mockResolvedValue({
        id: 'new-worksheet',
        ...invalidDateData,
      } as any);

      jest.spyOn(service, 'findById').mockResolvedValue({} as any);

      await service.create(invalidDateData, 'client-123', 'therapist-456');

      // Should pass through the invalid date to Prisma
      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dueDate: expect.any(Date),
        }),
      });
    });

    it('should handle null/undefined submissions in findById', async () => {
      const worksheetWithNullSubmissions = {
        ...mockWorksheet,
        submissionUrls: null,
        submissionNames: null,
        submissionSizes: null,
      };
      prismaService.worksheet.findUnique.mockResolvedValue(worksheetWithNullSubmissions as any);

      const result = await service.findById('worksheet-789');

      expect(result.submissions).toEqual([]);
    });

    it('should handle extremely large file sizes', async () => {
      const largeFileWorksheet = {
        ...mockWorksheet,
        materialSizes: [Number.MAX_SAFE_INTEGER, 0, -1],
      };
      prismaService.worksheet.findUnique.mockResolvedValue(largeFileWorksheet);

      const result = await service.findById('worksheet-789');

      expect(result.materials[0].fileSize).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.materials[1].fileSize).toBe(0);
      expect(result.materials[2].fileSize).toBe(-1);
    });

    it('should handle special characters in worksheet data', async () => {
      const specialCharData = {
        title: '📝 Special Worksheet 📋 with émojis & ünicōde',
        instructions: 'Instructions with <html> tags & "quotes" and \n newlines',
        description: 'Description with SQL\'; DROP TABLE worksheets; --',
      };

      prismaService.worksheet.create.mockResolvedValue({
        id: 'special-worksheet',
        ...specialCharData,
      } as any);

      jest.spyOn(service, 'findById').mockResolvedValue({} as any);

      await service.create(specialCharData, 'client-123', 'therapist-456');

      expect(prismaService.worksheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining(specialCharData),
      });
    });
  });

  describe('performance and scalability', () => {
    it('should handle large number of worksheets efficiently', async () => {
      const largeWorksheetList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockWorksheet,
        id: `worksheet-${i}`,
        title: `Worksheet ${i}`,
      }));

      prismaService.worksheet.findMany.mockResolvedValue(largeWorksheetList);

      const startTime = Date.now();
      const result = await service.findAll();
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle worksheets with many materials efficiently', async () => {
      const manyMaterialsWorksheet = {
        ...mockWorksheet,
        materialUrls: Array.from({ length: 100 }, (_, i) => `https://example.com/material${i}.pdf`),
        materialNames: Array.from({ length: 100 }, (_, i) => `Material ${i}`),
        materialSizes: Array.from({ length: 100 }, (_, i) => i * 1024),
      };

      prismaService.worksheet.findUnique.mockResolvedValue(manyMaterialsWorksheet);

      const startTime = Date.now();
      const result = await service.findById('worksheet-many-materials');
      const endTime = Date.now();

      expect(result.materials).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });

    it('should handle concurrent read operations', async () => {
      prismaService.worksheet.findMany.mockResolvedValue(mockWorksheetList);
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);

      const concurrentReads = Array.from({ length: 50 }, (_, i) => 
        i % 2 === 0 ? service.findAll() : service.findById(`worksheet-${i}`)
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentReads);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle memory usage efficiently with large datasets', async () => {
      const largeBinaryData = Array.from({ length: 1000 }, () => 'x'.repeat(1000)).join('');
      const largeWorksheet = {
        ...mockWorksheet,
        description: largeBinaryData,
        instructions: largeBinaryData,
      };

      prismaService.worksheet.findUnique.mockResolvedValue(largeWorksheet);

      // Should not cause memory issues
      const result = await service.findById('large-worksheet');
      
      expect(result.description).toHaveLength(1000000);
      expect(result.instructions).toHaveLength(1000000);
    });
  });

  describe('data validation and integrity', () => {
    it('should maintain data consistency in transformations', async () => {
      const worksheetWithData = {
        ...mockWorksheet,
        materialUrls: ['url1', 'url2'],
        materialNames: ['name1', 'name2'],
        materialSizes: [1024, 2048],
        submissionUrls: ['sub1'],
        submissionNames: ['subname1'],
        submissionSizes: [512],
        submittedAt: mockDate,
      };

      prismaService.worksheet.findUnique.mockResolvedValue(worksheetWithData);

      const result = await service.findById('worksheet-789');

      // Verify materials transformation integrity
      expect(result.materials).toHaveLength(2);
      result.materials.forEach((material, index) => {
        expect(material.id).toBe(`material-${index}`);
        expect(material.url).toBe(worksheetWithData.materialUrls[index]);
        expect(material.filename).toBe(worksheetWithData.materialNames[index]);
        expect(material.fileSize).toBe(worksheetWithData.materialSizes[index]);
      });

      // Verify submissions transformation integrity
      expect(result.submissions).toHaveLength(1);
      expect(result.submissions[0].id).toBe('submission-0');
      expect(result.submissions[0].url).toBe('sub1');
      expect(result.submissions[0].filename).toBe('subname1');
      expect(result.submissions[0].fileSize).toBe(512);
      expect(result.submissions[0].submittedAt).toEqual(mockDate);
    });

    it('should preserve original worksheet properties', async () => {
      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);

      const result = await service.findById('worksheet-789');

      // Check that original properties are preserved
      expect(result.id).toBe(mockWorksheet.id);
      expect(result.title).toBe(mockWorksheet.title);
      expect(result.instructions).toBe(mockWorksheet.instructions);
      expect(result.description).toBe(mockWorksheet.description);
      expect(result.dueDate).toBe(mockWorksheet.dueDate);
      expect(result.status).toBe(mockWorksheet.status);
      expect(result.isCompleted).toBe(mockWorksheet.isCompleted);
      expect(result.clientId).toBe(mockWorksheet.clientId);
      expect(result.therapistId).toBe(mockWorksheet.therapistId);
      expect(result.createdAt).toBe(mockWorksheet.createdAt);
      expect(result.updatedAt).toBe(mockWorksheet.updatedAt);
    });

    it('should validate submission data consistency', async () => {
      const submissionData = {
        worksheetId: 'worksheet-789',
        isCompleted: true,
        notes: 'Test feedback',
      } as any;

      prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
      prismaService.worksheet.update.mockResolvedValue({
        ...mockWorksheet,
        feedback: 'Test feedback',
        isCompleted: true,
        status: 'completed',
        submittedAt: mockDate,
      });

      const result = await service.addSubmission(submissionData, 'client-123');

      expect(result.worksheetId).toBe(submissionData.worksheetId);
      expect(result.clientId).toBe('client-123');
      expect(result.status).toBe('completed');
      expect(result.submittedAt).toEqual(mockDate);
    });

    it('should ensure proper status transitions', async () => {
      // Test various status transitions
      const testCases = [
        { isCompleted: false, expectedStatus: 'assigned' },
        { isCompleted: true, expectedStatus: 'completed' },
      ];

      for (const testCase of testCases) {
        prismaService.worksheet.findUnique.mockResolvedValue(mockWorksheet);
        prismaService.worksheet.update.mockResolvedValue({
          ...mockWorksheet,
          isCompleted: testCase.isCompleted,
          status: testCase.expectedStatus,
        });

        const submissionData = {
          worksheetId: 'worksheet-789',
          isCompleted: testCase.isCompleted,
        } as any;

        const result = await service.addSubmission(submissionData, 'client-123');

        expect(result.status).toBe(testCase.expectedStatus);
      }
    });
  });
});