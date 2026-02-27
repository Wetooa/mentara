import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('AdminService - Comprehensive Testing', () => {
  let service: AdminService;
  let prismaService: jest.Mocked<PrismaService>;

  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');
  const mockProcessingDate = new Date('2024-01-16T14:30:00Z');
  const mockSuspensionDate = new Date('2024-01-14T09:00:00Z');

  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'client',
    isActive: true,
    isVerified: true,
    createdAt: mockDate,
    lastLoginAt: mockDate,
    suspendedAt: null,
    suspensionReason: null,
  };

  const mockAdmin = {
    id: 'admin-123',
    userId: 'admin-user-123',
    user: {
      firstName: 'Admin',
      lastName: 'User',
    },
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    status: 'pending',
    submissionDate: mockDate,
    processedByAdminId: null,
    processingDate: null,
    user: {
      id: 'therapist-user-123',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      createdAt: mockDate,
    },
    processedByAdmin: null,
  };

  const mockApprovedTherapist = {
    ...mockTherapist,
    status: 'approved',
    processedByAdminId: 'admin-123',
    processingDate: mockProcessingDate,
    processedByAdmin: mockAdmin,
  };

  const mockSuspendedUser = {
    ...mockUser,
    id: 'suspended-user-123',
    isActive: false,
    suspendedAt: mockSuspensionDate,
    suspendedBy: 'admin-123',
    suspensionReason: 'Inappropriate behavior',
  };

  const mockPost = {
    id: 'post-123',
    title: 'Sample Post',
    content: 'Post content here',
    userId: 'user-123',
    createdAt: mockDate,
    user: {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
    },
    room: {
      name: 'General Discussion',
      roomGroup: {
        community: {
          name: 'Mental Health Support',
        },
      },
    },
  };

  const mockComment = {
    id: 'comment-123',
    content: 'Comment content here',
    userId: 'user-123',
    postId: 'post-123',
    createdAt: mockDate,
    user: {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
    },
    post: {
      title: 'Sample Post',
    },
  };

  const mockMatchHistory = {
    id: 'match-123',
    userId: 'user-123',
    therapistId: 'therapist-123',
    totalScore: 85.5,
    becameClient: true,
    wasViewed: true,
    wasContacted: true,
    createdAt: mockDate,
  };

  const mockMeeting = {
    id: 'meeting-123',
    title: 'Therapy Session',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    createdAt: mockDate,
  };

  const mockCommunity = {
    id: 'community-123',
    name: 'Depression Support',
    createdAt: mockDate,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      therapist: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      client: {
        count: jest.fn(),
      },
      community: {
        count: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      comment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      meeting: {
        count: jest.fn(),
      },
      matchHistory: {
        findMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
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

  describe('Therapist Application Management', () => {
    describe('getAllTherapistApplications', () => {
      beforeEach(() => {
        prismaService.therapist.findMany.mockResolvedValue([mockTherapist]);
        prismaService.therapist.count.mockResolvedValue(1);
      });

      it('should retrieve all therapist applications with pagination', async () => {
        const params = { page: 1, limit: 10 };
        const result = await service.getAllTherapistApplications(params);

        expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { submissionDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
            processedByAdmin: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        expect(prismaService.therapist.count).toHaveBeenCalledWith({ where: {} });

        expect(result).toEqual({
          applications: [mockTherapist],
          totalCount: 1,
          page: 1,
          totalPages: 1,
        });
      });

      it('should filter by status when provided', async () => {
        const params = { status: 'pending', page: 1, limit: 10 };
        await service.getAllTherapistApplications(params);

        expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
          where: { status: 'pending' },
          skip: 0,
          take: 10,
          orderBy: { submissionDate: 'desc' },
          include: expect.any(Object),
        });

        expect(prismaService.therapist.count).toHaveBeenCalledWith({
          where: { status: 'pending' },
        });
      });

      it('should handle pagination correctly', async () => {
        const params = { page: 3, limit: 5 };
        await service.getAllTherapistApplications(params);

        expect(prismaService.therapist.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 10, // (3-1) * 5
          take: 5,
          orderBy: { submissionDate: 'desc' },
          include: expect.any(Object),
        });
      });

      it('should calculate total pages correctly', async () => {
        prismaService.therapist.count.mockResolvedValue(23);
        const params = { page: 1, limit: 10 };
        const result = await service.getAllTherapistApplications(params);

        expect(result.totalPages).toBe(3); // Math.ceil(23/10)
      });

      it('should handle empty results', async () => {
        prismaService.therapist.findMany.mockResolvedValue([]);
        prismaService.therapist.count.mockResolvedValue(0);

        const params = { page: 1, limit: 10 };
        const result = await service.getAllTherapistApplications(params);

        expect(result).toEqual({
          applications: [],
          totalCount: 0,
          page: 1,
          totalPages: 0,
        });
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.therapist.findMany.mockRejectedValue(databaseError);

        const params = { page: 1, limit: 10 };
        await expect(service.getAllTherapistApplications(params)).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('getTherapistApplication', () => {
      beforeEach(() => {
        prismaService.therapist.findUnique.mockResolvedValue(mockTherapist);
      });

      it('should retrieve specific therapist application', async () => {
        const result = await service.getTherapistApplication('therapist-user-123');

        expect(prismaService.therapist.findUnique).toHaveBeenCalledWith({
          where: { userId: 'therapist-user-123' },
          include: {
            user: true,
            processedByAdmin: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        expect(result).toEqual(mockTherapist);
      });

      it('should return null for non-existent application', async () => {
        prismaService.therapist.findUnique.mockResolvedValue(null);

        const result = await service.getTherapistApplication('non-existent');

        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.therapist.findUnique.mockRejectedValue(databaseError);

        await expect(
          service.getTherapistApplication('therapist-user-123')
        ).rejects.toThrow('Database connection failed');
      });
    });

    describe('approveTherapistApplication', () => {
      beforeEach(() => {
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue(mockApprovedTherapist),
            },
            user: {
              update: jest.fn().mockResolvedValue({
                ...mockUser,
                role: 'therapist',
              }),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(mockTx);
        });
      });

      it('should approve therapist application successfully', async () => {
        const result = await service.approveTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Good qualifications'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          therapist: mockApprovedTherapist,
        });
      });

      it('should update therapist status in transaction', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue(mockApprovedTherapist),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.approveTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Good qualifications'
        );

        expect(capturedTx.therapist.update).toHaveBeenCalledWith({
          where: { userId: 'therapist-user-123' },
          data: {
            status: 'approved',
            processedByAdminId: 'admin-123',
            processingDate: mockDate,
          },
        });
      });

      it('should update user role to therapist', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue(mockApprovedTherapist),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.approveTherapistApplication(
          'therapist-user-123',
          'admin-123'
        );

        expect(capturedTx.user.update).toHaveBeenCalledWith({
          where: { id: 'therapist-user-123' },
          data: { role: 'therapist' },
        });
      });

      it('should create audit log for approval', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue(mockApprovedTherapist),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.approveTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Excellent credentials'
        );

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'APPROVE_THERAPIST_APPLICATION',
            entity: 'therapist',
            entityId: 'therapist-user-123',
            metadata: {
              applicationId: 'therapist-user-123',
              notes: 'Excellent credentials',
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should handle approval without notes', async () => {
        await service.approveTherapistApplication(
          'therapist-user-123',
          'admin-123'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
      });

      it('should handle transaction errors', async () => {
        const transactionError = new Error('Transaction failed');
        prismaService.$transaction.mockRejectedValue(transactionError);

        await expect(
          service.approveTherapistApplication(
            'therapist-user-123',
            'admin-123'
          )
        ).rejects.toThrow('Transaction failed');
      });
    });

    describe('rejectTherapistApplication', () => {
      beforeEach(() => {
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue({
                ...mockTherapist,
                status: 'rejected',
                processedByAdminId: 'admin-123',
                processingDate: mockDate,
              }),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(mockTx);
        });
      });

      it('should reject therapist application successfully', async () => {
        const result = await service.rejectTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Insufficient experience',
          'Needs more clinical hours'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          therapist: expect.objectContaining({
            status: 'rejected',
            processedByAdminId: 'admin-123',
          }),
          reason: 'Insufficient experience',
        });
      });

      it('should update therapist status to rejected', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.rejectTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Insufficient experience'
        );

        expect(capturedTx.therapist.update).toHaveBeenCalledWith({
          where: { userId: 'therapist-user-123' },
          data: {
            status: 'rejected',
            processedByAdminId: 'admin-123',
            processingDate: mockDate,
          },
        });
      });

      it('should create audit log for rejection', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            therapist: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.rejectTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Insufficient experience',
          'Needs more training'
        );

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'REJECT_THERAPIST_APPLICATION',
            entity: 'therapist',
            entityId: 'therapist-user-123',
            metadata: {
              applicationId: 'therapist-user-123',
              reason: 'Insufficient experience',
              notes: 'Needs more training',
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should handle rejection without notes', async () => {
        await service.rejectTherapistApplication(
          'therapist-user-123',
          'admin-123',
          'Insufficient experience'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
      });

      it('should handle transaction errors', async () => {
        const transactionError = new Error('Transaction failed');
        prismaService.$transaction.mockRejectedValue(transactionError);

        await expect(
          service.rejectTherapistApplication(
            'therapist-user-123',
            'admin-123',
            'Insufficient experience'
          )
        ).rejects.toThrow('Transaction failed');
      });
    });
  });

  describe('User Management', () => {
    describe('getAllUsers', () => {
      beforeEach(() => {
        prismaService.user.findMany.mockResolvedValue([mockUser]);
        prismaService.user.count.mockResolvedValue(1);
      });

      it('should retrieve all users with pagination', async () => {
        const params = { page: 1, limit: 10 };
        const result = await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            lastLoginAt: true,
            suspendedAt: true,
            suspensionReason: true,
          },
        });

        expect(result).toEqual({
          users: [mockUser],
          totalCount: 1,
          page: 1,
          totalPages: 1,
        });
      });

      it('should filter by role when provided', async () => {
        const params = { role: 'therapist', page: 1, limit: 10 };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: { role: 'therapist' },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should filter by search term', async () => {
        const params = { search: 'john', page: 1, limit: 10 };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: {
            OR: [
              { firstName: { contains: 'john', mode: 'insensitive' } },
              { lastName: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ],
          },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should filter by active status', async () => {
        const params = { status: 'active', page: 1, limit: 10 };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should filter by inactive status', async () => {
        const params = { status: 'inactive', page: 1, limit: 10 };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: { isActive: false },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should filter by suspended status', async () => {
        const params = { status: 'suspended', page: 1, limit: 10 };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: { suspendedAt: { not: null } },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should sort by specified field and order', async () => {
        const params = {
          page: 1,
          limit: 10,
          sortBy: 'firstName',
          sortOrder: 'asc',
        };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { firstName: 'asc' },
          select: expect.any(Object),
        });
      });

      it('should use default sort when invalid sortBy provided', async () => {
        const params = {
          page: 1,
          limit: 10,
          sortBy: 'invalidField',
          sortOrder: 'asc',
        };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should combine multiple filters', async () => {
        const params = {
          role: 'client',
          search: 'john',
          status: 'active',
          page: 1,
          limit: 10,
        };
        await service.getAllUsers(params);

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          where: {
            role: 'client',
            isActive: true,
            OR: [
              { firstName: { contains: 'john', mode: 'insensitive' } },
              { lastName: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ],
          },
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: expect.any(Object),
        });
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.user.findMany.mockRejectedValue(databaseError);

        const params = { page: 1, limit: 10 };
        await expect(service.getAllUsers(params)).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('getUser', () => {
      beforeEach(() => {
        prismaService.user.findUnique.mockResolvedValue({
          ...mockUser,
          client: { id: 'client-123' },
          therapist: null,
          admin: null,
          admin: null,
        });
      });

      it('should retrieve specific user with relations', async () => {
        const result = await service.getUser('user-123');

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user-123' },
          include: {
            client: true,
            therapist: true,
            admin: true,
            admin: true,
          },
        });

        expect(result).toEqual(
          expect.objectContaining({
            id: 'user-123',
            client: { id: 'client-123' },
          })
        );
      });

      it('should return null for non-existent user', async () => {
        prismaService.user.findUnique.mockResolvedValue(null);

        const result = await service.getUser('non-existent');

        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.user.findUnique.mockRejectedValue(databaseError);

        await expect(service.getUser('user-123')).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('suspendUser', () => {
      beforeEach(() => {
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue(mockSuspendedUser),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(mockTx);
        });
      });

      it('should suspend user successfully', async () => {
        const result = await service.suspendUser(
          'user-123',
          'admin-123',
          'Inappropriate behavior',
          7
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          user: mockSuspendedUser,
        });
      });

      it('should suspend user with duration', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue(mockSuspendedUser),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.suspendUser(
          'user-123',
          'admin-123',
          'Inappropriate behavior',
          7
        );

        expect(capturedTx.user.update).toHaveBeenCalledWith({
          where: { id: 'user-123' },
          data: {
            suspendedAt: mockDate,
            suspendedBy: 'admin-123',
            suspensionReason: 'Inappropriate behavior',
            isActive: false,
          },
        });
      });

      it('should suspend user without duration (permanent)', async () => {
        await service.suspendUser(
          'user-123',
          'admin-123',
          'Serious violation'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
      });

      it('should create audit log for suspension', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue(mockSuspendedUser),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.suspendUser(
          'user-123',
          'admin-123',
          'Inappropriate behavior',
          7
        );

        const expectedSuspensionEnd = new Date(
          mockDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'SUSPEND_USER',
            entity: 'user',
            entityId: 'user-123',
            metadata: {
              userId: 'user-123',
              reason: 'Inappropriate behavior',
              duration: 7,
              suspensionEnd: expectedSuspensionEnd.toISOString(),
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should handle transaction errors', async () => {
        const transactionError = new Error('Transaction failed');
        prismaService.$transaction.mockRejectedValue(transactionError);

        await expect(
          service.suspendUser('user-123', 'admin-123', 'reason')
        ).rejects.toThrow('Transaction failed');
      });
    });

    describe('unsuspendUser', () => {
      beforeEach(() => {
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue({
                ...mockUser,
                suspendedAt: null,
                suspendedBy: null,
                suspensionReason: null,
                isActive: true,
              }),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(mockTx);
        });
      });

      it('should unsuspend user successfully', async () => {
        const result = await service.unsuspendUser('user-123', 'admin-123');

        expect(prismaService.$transaction).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          user: expect.objectContaining({
            suspendedAt: null,
            suspendedBy: null,
            suspensionReason: null,
            isActive: true,
          }),
        });
      });

      it('should clear suspension data', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.unsuspendUser('user-123', 'admin-123');

        expect(capturedTx.user.update).toHaveBeenCalledWith({
          where: { id: 'user-123' },
          data: {
            suspendedAt: null,
            suspendedBy: null,
            suspensionReason: null,
            isActive: true,
          },
        });
      });

      it('should create audit log for unsuspension', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.unsuspendUser('user-123', 'admin-123');

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'UNSUSPEND_USER',
            entity: 'user',
            entityId: 'user-123',
            metadata: {
              userId: 'user-123',
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should handle transaction errors', async () => {
        const transactionError = new Error('Transaction failed');
        prismaService.$transaction.mockRejectedValue(transactionError);

        await expect(
          service.unsuspendUser('user-123', 'admin-123')
        ).rejects.toThrow('Transaction failed');
      });
    });
  });

  describe('Platform Analytics', () => {
    describe('getPlatformOverview', () => {
      beforeEach(() => {
        prismaService.user.count.mockResolvedValue(100);
        prismaService.client.count.mockResolvedValue(80);
        prismaService.therapist.count
          .mockResolvedValueOnce(15) // approved therapists
          .mockResolvedValueOnce(5); // pending applications
        prismaService.community.count.mockResolvedValue(12);
        prismaService.post.count.mockResolvedValue(500);
        prismaService.meeting.count.mockResolvedValue(200);
        prismaService.user.findMany.mockResolvedValue([
          { ...mockUser, role: 'client' },
          { ...mockUser, id: 'user-124', role: 'therapist' },
        ]);
      });

      it('should retrieve platform overview successfully', async () => {
        const result = await service.getPlatformOverview();

        expect(result).toEqual({
          overview: {
            totalUsers: 100,
            totalClients: 80,
            totalTherapists: 15,
            pendingApplications: 5,
            totalCommunities: 12,
            totalPosts: 500,
            totalSessions: 200,
          },
          recentActivity: [
            { ...mockUser, role: 'client' },
            { ...mockUser, id: 'user-124', role: 'therapist' },
          ],
        });
      });

      it('should make correct database queries', async () => {
        await service.getPlatformOverview();

        expect(prismaService.user.count).toHaveBeenCalledWith();
        expect(prismaService.client.count).toHaveBeenCalledWith();
        expect(prismaService.therapist.count).toHaveBeenCalledWith({
          where: { status: 'approved' },
        });
        expect(prismaService.therapist.count).toHaveBeenCalledWith({
          where: { status: 'pending' },
        });
        expect(prismaService.community.count).toHaveBeenCalledWith();
        expect(prismaService.post.count).toHaveBeenCalledWith();
        expect(prismaService.meeting.count).toHaveBeenCalledWith();

        expect(prismaService.user.findMany).toHaveBeenCalledWith({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        });
      });

      it('should handle empty platform data', async () => {
        prismaService.user.count.mockResolvedValue(0);
        prismaService.client.count.mockResolvedValue(0);
        prismaService.therapist.count.mockResolvedValue(0);
        prismaService.community.count.mockResolvedValue(0);
        prismaService.post.count.mockResolvedValue(0);
        prismaService.meeting.count.mockResolvedValue(0);
        prismaService.user.findMany.mockResolvedValue([]);

        const result = await service.getPlatformOverview();

        expect(result.overview.totalUsers).toBe(0);
        expect(result.recentActivity).toEqual([]);
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.user.count.mockRejectedValue(databaseError);

        await expect(service.getPlatformOverview()).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('getMatchingPerformance', () => {
      beforeEach(() => {
        prismaService.matchHistory.findMany.mockResolvedValue([
          mockMatchHistory,
          {
            ...mockMatchHistory,
            id: 'match-124',
            totalScore: 75.0,
            becameClient: false,
            wasViewed: true,
            wasContacted: false,
          },
        ]);
      });

      it('should retrieve matching performance with default date range', async () => {
        const result = await service.getMatchingPerformance();

        const expectedStart = new Date(mockDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const expectedEnd = mockDate;

        expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
          where: {
            createdAt: {
              gte: expectedStart,
              lte: expectedEnd,
            },
          },
        });

        expect(result).toEqual({
          period: { start: expectedStart, end: expectedEnd },
          metrics: {
            totalRecommendations: 2,
            successfulMatches: 1,
            viewedRecommendations: 2,
            contactedTherapists: 1,
            averageMatchScore: 80.25, // (85.5 + 75.0) / 2
            conversionRate: 50.0, // 1/2 * 100
            clickThroughRate: 100.0, // 2/2 * 100
          },
        });
      });

      it('should retrieve matching performance with custom date range', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';

        await service.getMatchingPerformance(startDate, endDate);

        expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
        });
      });

      it('should handle empty matching data', async () => {
        prismaService.matchHistory.findMany.mockResolvedValue([]);

        const result = await service.getMatchingPerformance();

        expect(result.metrics).toEqual({
          totalRecommendations: 0,
          successfulMatches: 0,
          viewedRecommendations: 0,
          contactedTherapists: 0,
          averageMatchScore: 0,
          conversionRate: 0,
          clickThroughRate: 0,
        });
      });

      it('should calculate metrics correctly for various scenarios', async () => {
        const testMatchData = [
          { totalScore: 90, becameClient: true, wasViewed: true, wasContacted: true },
          { totalScore: 80, becameClient: false, wasViewed: true, wasContacted: false },
          { totalScore: 70, becameClient: false, wasViewed: false, wasContacted: false },
          { totalScore: 85, becameClient: true, wasViewed: true, wasContacted: true },
        ];

        prismaService.matchHistory.findMany.mockResolvedValue(testMatchData);

        const result = await service.getMatchingPerformance();

        expect(result.metrics).toEqual({
          totalRecommendations: 4,
          successfulMatches: 2, // 2 became clients
          viewedRecommendations: 3, // 3 were viewed
          contactedTherapists: 2, // 2 were contacted
          averageMatchScore: 81.25, // (90+80+70+85)/4
          conversionRate: 50.0, // 2/4 * 100
          clickThroughRate: 75.0, // 3/4 * 100
        });
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.matchHistory.findMany.mockRejectedValue(databaseError);

        await expect(service.getMatchingPerformance()).rejects.toThrow(
          'Database connection failed'
        );
      });
    });
  });

  describe('Content Moderation', () => {
    describe('getFlaggedContent', () => {
      beforeEach(() => {
        prismaService.post.findMany.mockResolvedValue([mockPost]);
        prismaService.comment.findMany.mockResolvedValue([mockComment]);
      });

      it('should retrieve flagged content with pagination', async () => {
        const params = { page: 1, limit: 10 };
        const result = await service.getFlaggedContent(params);

        expect(prismaService.post.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            room: {
              select: {
                name: true,
                roomGroup: {
                  select: {
                    community: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        expect(prismaService.comment.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            post: {
              select: {
                title: true,
              },
            },
          },
        });

        expect(result).toEqual({
          posts: [mockPost],
          comments: [mockComment],
          page: 1,
          totalItems: 2,
        });
      });

      it('should filter by content type - posts only', async () => {
        const params = { type: 'post', page: 1, limit: 10 };
        await service.getFlaggedContent(params);

        expect(prismaService.post.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });

        expect(prismaService.comment.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 0, // Should be 0 for posts only
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });
      });

      it('should filter by content type - comments only', async () => {
        const params = { type: 'comment', page: 1, limit: 10 };
        await service.getFlaggedContent(params);

        expect(prismaService.post.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 0, // Should be 0 for comments only
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });

        expect(prismaService.comment.findMany).toHaveBeenCalledWith({
          where: {},
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        });
      });

      it('should handle pagination correctly', async () => {
        const params = { page: 3, limit: 5 };
        await service.getFlaggedContent(params);

        expect(prismaService.post.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 10, // (3-1) * 5
            take: 5,
          })
        );
      });

      it('should handle empty results', async () => {
        prismaService.post.findMany.mockResolvedValue([]);
        prismaService.comment.findMany.mockResolvedValue([]);

        const params = { page: 1, limit: 10 };
        const result = await service.getFlaggedContent(params);

        expect(result).toEqual({
          posts: [],
          comments: [],
          page: 1,
          totalItems: 0,
        });
      });

      it('should handle database errors', async () => {
        const databaseError = new Error('Database connection failed');
        prismaService.post.findMany.mockRejectedValue(databaseError);

        const params = { page: 1, limit: 10 };
        await expect(service.getFlaggedContent(params)).rejects.toThrow(
          'Database connection failed'
        );
      });
    });

    describe('moderateContent', () => {
      beforeEach(() => {
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            post: {
              delete: jest.fn().mockResolvedValue(mockPost),
              findUnique: jest.fn().mockResolvedValue(mockPost),
            },
            comment: {
              delete: jest.fn().mockResolvedValue(mockComment),
              findUnique: jest.fn().mockResolvedValue(mockComment),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          return callback(mockTx);
        });
      });

      it('should remove post successfully', async () => {
        const result = await service.moderateContent(
          'post',
          'post-123',
          'admin-123',
          'remove',
          'Inappropriate content'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          action: 'remove',
          moderatedContent: mockPost,
        });
      });

      it('should approve post successfully', async () => {
        const result = await service.moderateContent(
          'post',
          'post-123',
          'admin-123',
          'approve',
          'Content is acceptable'
        );

        expect(result).toEqual({
          success: true,
          action: 'approve',
          moderatedContent: mockPost,
        });
      });

      it('should flag post successfully', async () => {
        const result = await service.moderateContent(
          'post',
          'post-123',
          'admin-123',
          'flag',
          'Needs review'
        );

        expect(result).toEqual({
          success: true,
          action: 'flag',
          moderatedContent: mockPost,
        });
      });

      it('should remove comment successfully', async () => {
        const result = await service.moderateContent(
          'comment',
          'comment-123',
          'admin-123',
          'remove',
          'Spam content'
        );

        expect(result).toEqual({
          success: true,
          action: 'remove',
          moderatedContent: mockComment,
        });
      });

      it('should create audit log for post moderation', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            post: {
              delete: jest.fn().mockResolvedValue(mockPost),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.moderateContent(
          'post',
          'post-123',
          'admin-123',
          'remove',
          'Inappropriate content'
        );

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'MODERATE_POST',
            entity: 'post',
            entityId: 'post-123',
            metadata: {
              contentId: 'post-123',
              contentType: 'post',
              moderationAction: 'remove',
              reason: 'Inappropriate content',
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should create audit log for comment moderation', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            comment: {
              delete: jest.fn().mockResolvedValue(mockComment),
            },
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        await service.moderateContent(
          'comment',
          'comment-123',
          'admin-123',
          'remove',
          'Spam content'
        );

        expect(capturedTx.auditLog.create).toHaveBeenCalledWith({
          data: {
            userId: 'admin-123',
            action: 'MODERATE_COMMENT',
            entity: 'comment',
            entityId: 'comment-123',
            metadata: {
              contentId: 'comment-123',
              contentType: 'comment',
              moderationAction: 'remove',
              reason: 'Spam content',
              timestamp: mockDate.toISOString(),
            },
          },
        });
      });

      it('should handle moderation without reason', async () => {
        await service.moderateContent(
          'post',
          'post-123',
          'admin-123',
          'approve'
        );

        expect(prismaService.$transaction).toHaveBeenCalled();
      });

      it('should handle transaction errors', async () => {
        const transactionError = new Error('Transaction failed');
        prismaService.$transaction.mockRejectedValue(transactionError);

        await expect(
          service.moderateContent(
            'post',
            'post-123',
            'admin-123',
            'remove',
            'Inappropriate content'
          )
        ).rejects.toThrow('Transaction failed');
      });

      it('should handle unknown content types gracefully', async () => {
        let capturedTx: any;
        prismaService.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          capturedTx = mockTx;
          return callback(mockTx);
        });

        const result = await service.moderateContent(
          'unknown',
          'content-123',
          'admin-123',
          'remove',
          'Unknown content type'
        );

        expect(result).toEqual({
          success: true,
          action: 'remove',
          moderatedContent: undefined,
        });
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent therapist application processing', async () => {
      const approvePromise = service.approveTherapistApplication(
        'therapist-123',
        'admin-123'
      );
      const rejectPromise = service.rejectTherapistApplication(
        'therapist-123',
        'admin-124',
        'Insufficient experience'
      );

      // Mock different transaction outcomes
      prismaService.$transaction
        .mockResolvedValueOnce({ success: true, therapist: mockApprovedTherapist })
        .mockRejectedValueOnce(new Error('Record already processed'));

      const results = await Promise.allSettled([approvePromise, rejectPromise]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });

    it('should handle very large user datasets efficiently', async () => {
      const largeUserList = Array.from({ length: 10000 }, (_, i) => ({
        ...mockUser,
        id: `user-${i}`,
        email: `user${i}@example.com`,
      }));

      prismaService.user.findMany.mockResolvedValue(largeUserList.slice(0, 100));
      prismaService.user.count.mockResolvedValue(10000);

      const params = { page: 1, limit: 100 };
      const startTime = Date.now();
      const result = await service.getAllUsers(params);
      const endTime = Date.now();

      expect(result.users).toHaveLength(100);
      expect(result.totalCount).toBe(10000);
      expect(result.totalPages).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle special characters in search queries', async () => {
      const specialCharSearch = "John O'Connor & Co. <script>";
      const params = { search: specialCharSearch, page: 1, limit: 10 };

      await service.getAllUsers(params);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { firstName: { contains: specialCharSearch, mode: 'insensitive' } },
            { lastName: { contains: specialCharSearch, mode: 'insensitive' } },
            { email: { contains: specialCharSearch, mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle invalid date ranges in matching performance', async () => {
      const invalidStartDate = 'invalid-date';
      const invalidEndDate = 'another-invalid-date';

      await service.getMatchingPerformance(invalidStartDate, invalidEndDate);

      // Should handle gracefully and create Date objects
      expect(prismaService.matchHistory.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date(invalidStartDate), // Will be Invalid Date
            lte: new Date(invalidEndDate), // Will be Invalid Date
          },
        },
      });
    });

    it('should handle null/undefined values in platform overview', async () => {
      prismaService.user.count.mockResolvedValue(null);
      prismaService.client.count.mockResolvedValue(undefined);
      prismaService.therapist.count.mockResolvedValue(0);
      prismaService.user.findMany.mockResolvedValue(null);

      const result = await service.getPlatformOverview();

      expect(result.overview.totalUsers).toBeNull();
      expect(result.overview.totalClients).toBeUndefined();
      expect(result.recentActivity).toBeNull();
    });

    it('should handle database timeouts gracefully', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'TimeoutError';

      prismaService.user.findMany.mockRejectedValue(timeoutError);

      const params = { page: 1, limit: 10 };
      await expect(service.getAllUsers(params)).rejects.toThrow('Connection timeout');
    });

    it('should handle malformed therapy application data', async () => {
      const malformedTherapist = {
        id: null,
        userId: undefined,
        status: 'invalid_status',
        submissionDate: 'invalid_date',
        user: null,
      };

      prismaService.therapist.findMany.mockResolvedValue([malformedTherapist]);
      prismaService.therapist.count.mockResolvedValue(1);

      const params = { page: 1, limit: 10 };
      const result = await service.getAllTherapistApplications(params);

      expect(result.applications).toEqual([malformedTherapist]);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk user operations efficiently', async () => {
      const bulkUserIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
      
      // Mock parallel processing
      const promises = bulkUserIds.map((userId) => {
        prismaService.user.findUnique.mockResolvedValueOnce({
          ...mockUser,
          id: userId,
        });
        return service.getUser(userId);
      });

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle high-volume content moderation efficiently', async () => {
      const bulkModerationPromises = Array.from({ length: 50 }, (_, i) => {
        prismaService.$transaction.mockResolvedValueOnce({
          success: true,
          action: 'remove',
          moderatedContent: { id: `content-${i}` },
        });
        return service.moderateContent(
          'post',
          `post-${i}`,
          'admin-123',
          'remove',
          'Bulk moderation'
        );
      });

      const startTime = Date.now();
      const results = await Promise.all(bulkModerationPromises);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      expect(results.every(r => r.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should maintain performance with complex filtering', async () => {
      const complexParams = {
        role: 'client',
        search: 'john smith depression anxiety',
        status: 'active',
        sortBy: 'lastName',
        sortOrder: 'asc',
        page: 50,
        limit: 100,
      };

      const largeFilteredResult = Array.from({ length: 100 }, (_, i) => ({
        ...mockUser,
        id: `user-${i}`,
        lastName: `Smith${i}`,
      }));

      prismaService.user.findMany.mockResolvedValue(largeFilteredResult);
      prismaService.user.count.mockResolvedValue(5000);

      const startTime = Date.now();
      const result = await service.getAllUsers(complexParams);
      const endTime = Date.now();

      expect(result.users).toHaveLength(100);
      expect(result.totalCount).toBe(5000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Integrity and Audit', () => {
    it('should ensure audit logs are created for all administrative actions', async () => {
      const auditActions = [
        () => service.approveTherapistApplication('therapist-123', 'admin-123'),
        () => service.rejectTherapistApplication('therapist-123', 'admin-123', 'reason'),
        () => service.suspendUser('user-123', 'admin-123', 'reason'),
        () => service.unsuspendUser('user-123', 'admin-123'),
        () => service.moderateContent('post', 'post-123', 'admin-123', 'remove'),
      ];

      let auditLogCallCount = 0;
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          therapist: { update: jest.fn().mockResolvedValue({}) },
          user: { update: jest.fn().mockResolvedValue({}) },
          post: { delete: jest.fn().mockResolvedValue({}) },
          auditLog: {
            create: jest.fn().mockImplementation(() => {
              auditLogCallCount++;
              return Promise.resolve({});
            }),
          },
        };
        return callback(mockTx);
      });

      await Promise.all(auditActions.map(action => action()));

      expect(auditLogCallCount).toBe(5); // One audit log per action
    });

    it('should ensure proper transaction rollback on failures', async () => {
      let transactionCallCount = 0;
      prismaService.$transaction.mockImplementation(async (callback) => {
        transactionCallCount++;
        const mockTx = {
          therapist: {
            update: jest.fn().mockRejectedValue(new Error('Update failed')),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      await expect(
        service.approveTherapistApplication('therapist-123', 'admin-123')
      ).rejects.toThrow('Update failed');

      expect(transactionCallCount).toBe(1);
    });

    it('should maintain data consistency across related entities', async () => {
      let capturedTx: any;
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          therapist: {
            update: jest.fn().mockResolvedValue(mockApprovedTherapist),
          },
          user: {
            update: jest.fn().mockResolvedValue({
              ...mockUser,
              role: 'therapist',
            }),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        capturedTx = mockTx;
        return callback(mockTx);
      });

      await service.approveTherapistApplication('therapist-123', 'admin-123');

      // Verify both therapist and user entities are updated consistently
      expect(capturedTx.therapist.update).toHaveBeenCalledWith({
        where: { userId: 'therapist-123' },
        data: expect.objectContaining({
          status: 'approved',
          processedByAdminId: 'admin-123',
        }),
      });

      expect(capturedTx.user.update).toHaveBeenCalledWith({
        where: { id: 'therapist-123' },
        data: { role: 'therapist' },
      });
    });

    it('should validate admin permissions through audit trails', async () => {
      const adminActions = [
        { action: 'APPROVE_THERAPIST_APPLICATION', entity: 'therapist' },
        { action: 'REJECT_THERAPIST_APPLICATION', entity: 'therapist' },
        { action: 'SUSPEND_USER', entity: 'user' },
        { action: 'UNSUSPEND_USER', entity: 'user' },
        { action: 'MODERATE_POST', entity: 'post' },
        { action: 'MODERATE_COMMENT', entity: 'comment' },
      ];

      const capturedAuditLogs: any[] = [];
      prismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          therapist: { update: jest.fn().mockResolvedValue({}) },
          user: { update: jest.fn().mockResolvedValue({}) },
          post: { delete: jest.fn().mockResolvedValue({}) },
          comment: { delete: jest.fn().mockResolvedValue({}) },
          auditLog: {
            create: jest.fn().mockImplementation((data) => {
              capturedAuditLogs.push(data);
              return Promise.resolve({});
            }),
          },
        };
        return callback(mockTx);
      });

      await service.approveTherapistApplication('therapist-123', 'admin-123');
      await service.rejectTherapistApplication('therapist-124', 'admin-123', 'reason');
      await service.suspendUser('user-123', 'admin-123', 'reason');
      await service.unsuspendUser('user-124', 'admin-123');
      await service.moderateContent('post', 'post-123', 'admin-123', 'remove');
      await service.moderateContent('comment', 'comment-123', 'admin-123', 'remove');

      expect(capturedAuditLogs).toHaveLength(6);
      
      capturedAuditLogs.forEach((log, index) => {
        expect(log.data.userId).toBe('admin-123');
        expect(log.data.action).toBe(adminActions[index].action);
        expect(log.data.entity).toBe(adminActions[index].entity);
        expect(log.data.metadata.timestamp).toBeDefined();
      });
    });
  });
});