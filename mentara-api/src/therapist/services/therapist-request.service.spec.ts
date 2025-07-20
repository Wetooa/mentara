import { Test, TestingModule } from '@nestjs/testing';
import { TherapistRequestService } from './therapist-request.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  TherapistRequestFiltersDto,
  TherapistRequestResponseDto,
  BulkTherapistActionDto,
} from 'mentara-commons';

describe('TherapistRequestService', () => {
  let service: TherapistRequestService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let logger: jest.Mocked<Logger>;

  const mockClientTherapistRequest = {
    id: 'request-123',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    status: 'PENDING',
    priority: 'NORMAL',
    requestedAt: new Date(),
    respondedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    therapistResponse: null,
    client: {
      id: 'client-123',
      userId: 'client-user-123',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
      },
    },
    therapist: {
      id: 'therapist-123',
      userId: 'therapist-user-123',
      user: {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    status: 'approved',
    user: {
      isActive: true,
      firstName: 'Dr. Jane',
      lastName: 'Smith',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientTherapistRelationship = {
    id: 'relationship-123',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    status: 'active',
    assignedAt: new Date(),
    notes: 'Relationship started from accepted request.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponseDto: TherapistRequestResponseDto = {
    response: 'I would be happy to work with you.',
    acceptNewClients: true,
    preferredContactMethod: 'platform',
    schedulingMessage: 'Please schedule your first session through the platform.',
  };

  const mockFilters: TherapistRequestFiltersDto = {
    status: 'PENDING',
    priority: 'NORMAL',
    page: 1,
    limit: 20,
    sortBy: 'requestedAt',
    sortOrder: 'desc',
    includeExpired: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistRequestService,
        {
          provide: PrismaService,
          useValue: {
            clientTherapistRequest: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              findFirst: jest.fn(),
            },
            therapist: {
              findUnique: jest.fn(),
            },
            clientTherapist: {
              findFirst: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TherapistRequestService>(TherapistRequestService);
    prismaService = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
    logger = service['logger'] as jest.Mocked<Logger>;

    // Mock logger methods
    jest.spyOn(logger, 'log').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTherapistRequests', () => {
    it('should retrieve therapist requests with filters and pagination', async () => {
      const mockRequests = [mockClientTherapistRequest];
      const mockCounts = { total: 1, pending: 1, highPriority: 0 };

      prismaService.clientTherapistRequest.findMany.mockResolvedValue(mockRequests);
      prismaService.clientTherapistRequest.count.mockResolvedValueOnce(mockCounts.total);
      prismaService.clientTherapistRequest.count.mockResolvedValueOnce(mockCounts.pending);
      prismaService.clientTherapistRequest.count.mockResolvedValueOnce(mockCounts.highPriority);

      const result = await service.getTherapistRequests('therapist-123', mockFilters);

      expect(result).toEqual({
        requests: mockRequests,
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 1,
          totalPages: 1,
        },
        summary: {
          pendingCount: 1,
          highPriorityCount: 0,
          filteredCount: 1,
        },
        filters: mockFilters,
      });

      expect(prismaService.clientTherapistRequest.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          status: 'PENDING',
          priority: 'NORMAL',
        },
        skip: 0,
        take: 20,
        orderBy: { requestedAt: 'desc' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
    });

    it('should handle date range filters correctly', async () => {
      const filtersWithDates = {
        ...mockFilters,
        requestedAfter: '2023-01-01',
        requestedBefore: '2023-12-31',
        respondedAfter: '2023-01-01',
        respondedBefore: '2023-12-31',
      };

      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);

      await service.getTherapistRequests('therapist-123', filtersWithDates);

      expect(prismaService.clientTherapistRequest.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          status: 'PENDING',
          priority: 'NORMAL',
          requestedAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
          respondedAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31'),
          },
        },
        skip: 0,
        take: 20,
        orderBy: { requestedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should include expired requests when includeExpired is true', async () => {
      const filtersWithExpired = {
        ...mockFilters,
        includeExpired: true,
      };

      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);

      await service.getTherapistRequests('therapist-123', filtersWithExpired);

      expect(prismaService.clientTherapistRequest.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          status: 'PENDING',
          priority: 'NORMAL',
        },
        skip: 0,
        take: 20,
        orderBy: { requestedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should exclude expired requests by default', async () => {
      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);

      await service.getTherapistRequests('therapist-123', { ...mockFilters, includeExpired: false });

      expect(prismaService.clientTherapistRequest.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          status: { not: 'EXPIRED' },
          priority: 'NORMAL',
        },
        skip: 0,
        take: 20,
        orderBy: { requestedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle pagination correctly', async () => {
      const filtersWithPagination = {
        ...mockFilters,
        page: 2,
        limit: 10,
      };

      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);

      await service.getTherapistRequests('therapist-123', filtersWithPagination);

      expect(prismaService.clientTherapistRequest.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        skip: 10, // (page - 1) * limit
        take: 10,
        orderBy: { requestedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle database errors', async () => {
      prismaService.clientTherapistRequest.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.getTherapistRequests('therapist-123', mockFilters)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('acceptClientRequest', () => {
    it('should accept client request successfully', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
          update: jest.fn().mockResolvedValue({ ...mockClientTherapistRequest, status: 'ACCEPTED' }),
        },
        therapist: {
          findUnique: jest.fn().mockResolvedValue(mockTherapist),
        },
        clientTherapist: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockClientTherapistRelationship),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      notificationsService.create.mockResolvedValue({});

      const result = await service.acceptClientRequest(
        'request-123',
        'therapist-123',
        mockResponseDto,
      );

      expect(result).toEqual({
        success: true,
        request: { ...mockClientTherapistRequest, status: 'ACCEPTED' },
        relationship: mockClientTherapistRelationship,
        message: 'Client request accepted successfully',
        nextSteps: {
          scheduleSession: 'Contact information provided',
          clientNotified: true,
          relationshipEstablished: true,
        },
      });

      expect(mockTransaction.clientTherapistRequest.update).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        data: {
          status: 'ACCEPTED',
          respondedAt: expect.any(Date),
          therapistResponse: mockResponseDto.response,
        },
      });

      expect(mockTransaction.clientTherapist.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-123',
          therapistId: 'therapist-123',
          status: 'active',
          assignedAt: expect.any(Date),
          notes: expect.stringContaining('Relationship started from accepted request'),
        },
      });

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException for non-existent request', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for request not belonging to therapist', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockClientTherapistRequest,
            therapistId: 'different-therapist',
          }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-pending request', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockClientTherapistRequest,
            status: 'ACCEPTED',
          }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired request', async () => {
      const expiredRequest = {
        ...mockClientTherapistRequest,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };

      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(expiredRequest),
          update: jest.fn().mockResolvedValue({ ...expiredRequest, status: 'EXPIRED' }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockTransaction.clientTherapistRequest.update).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        data: { status: 'EXPIRED', respondedAt: expect.any(Date) },
      });
    });

    it('should throw BadRequestException for inactive therapist', async () => {
      const inactiveTherapist = {
        ...mockTherapist,
        status: 'pending',
      };

      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
        },
        therapist: {
          findUnique: jest.fn().mockResolvedValue(inactiveTherapist),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for existing active relationship', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
        },
        therapist: {
          findUnique: jest.fn().mockResolvedValue(mockTherapist),
        },
        clientTherapist: {
          findFirst: jest.fn().mockResolvedValue(mockClientTherapistRelationship),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should send scheduling notification when provided', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
          update: jest.fn().mockResolvedValue({ ...mockClientTherapistRequest, status: 'ACCEPTED' }),
        },
        therapist: {
          findUnique: jest.fn().mockResolvedValue(mockTherapist),
        },
        clientTherapist: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockClientTherapistRelationship),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      notificationsService.create.mockResolvedValue({});

      await service.acceptClientRequest('request-123', 'therapist-123', mockResponseDto);

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: 'client-123',
        title: 'Scheduling Information',
        message: mockResponseDto.schedulingMessage,
        type: 'SCHEDULING_INFO',
        priority: 'NORMAL',
        actionUrl: '/client/therapists/therapist-123/schedule',
      });
    });
  });

  describe('declineClientRequest', () => {
    it('should decline client request successfully', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
          update: jest.fn().mockResolvedValue({ ...mockClientTherapistRequest, status: 'DECLINED' }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      notificationsService.create.mockResolvedValue({});

      const result = await service.declineClientRequest(
        'request-123',
        'therapist-123',
        mockResponseDto,
      );

      expect(result).toEqual({
        success: true,
        request: { ...mockClientTherapistRequest, status: 'DECLINED' },
        message: 'Client request declined',
        providedAlternatives: false,
      });

      expect(mockTransaction.clientTherapistRequest.update).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        data: {
          status: 'DECLINED',
          respondedAt: expect.any(Date),
          therapistResponse: mockResponseDto.response,
        },
      });

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: 'client-123',
        title: 'Therapist Request Update',
        message: expect.stringContaining('has responded to your therapy request'),
        type: 'THERAPIST_REQUEST_DECLINED',
        priority: 'NORMAL',
        actionUrl: '/client/therapists/browse',
        data: {
          requestId: 'request-123',
          therapistId: 'therapist-123',
          response: mockResponseDto.response,
        },
      });
    });

    it('should send alternative recommendations when therapist not accepting new clients', async () => {
      const responseDto = {
        ...mockResponseDto,
        acceptNewClients: false,
      };

      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
          update: jest.fn().mockResolvedValue({ ...mockClientTherapistRequest, status: 'DECLINED' }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      notificationsService.create.mockResolvedValue({});

      const result = await service.declineClientRequest('request-123', 'therapist-123', responseDto);

      expect(result.providedAlternatives).toBe(true);
      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: 'client-123',
        title: 'Alternative Therapist Recommendations',
        message: 'We can help you find other qualified therapists who may be a good fit.',
        type: 'ALTERNATIVE_RECOMMENDATIONS',
        priority: 'NORMAL',
        actionUrl: '/client/therapists/recommendations',
      });
    });

    it('should throw NotFoundException for non-existent request', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.declineClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for request not belonging to therapist', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockClientTherapistRequest,
            therapistId: 'different-therapist',
          }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.declineClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-pending request', async () => {
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockClientTherapistRequest,
            status: 'ACCEPTED',
          }),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      await expect(
        service.declineClientRequest('request-123', 'therapist-123', mockResponseDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('performBulkAction', () => {
    const mockBulkActionDto: BulkTherapistActionDto = {
      requestIds: ['request-1', 'request-2'],
      action: 'accept',
      response: 'I am happy to work with you all.',
    };

    it('should perform bulk accept action successfully', async () => {
      jest.spyOn(service, 'acceptClientRequest').mockResolvedValue({
        success: true,
        request: mockClientTherapistRequest,
        relationship: mockClientTherapistRelationship,
        message: 'Request accepted',
        nextSteps: { scheduleSession: 'Schedule first session', clientNotified: true, relationshipEstablished: true },
      });

      const result = await service.performBulkAction('therapist-123', mockBulkActionDto);

      expect(result).toEqual({
        success: true,
        results: {
          successful: [
            { requestId: 'request-1', action: 'accept', status: 'completed' },
            { requestId: 'request-2', action: 'accept', status: 'completed' },
          ],
          failed: [],
          totalProcessed: 2,
        },
        summary: {
          totalRequested: 2,
          totalProcessed: 2,
          totalFailed: 0,
          action: 'accept',
        },
      });

      expect(service.acceptClientRequest).toHaveBeenCalledTimes(2);
    });

    it('should perform bulk decline action successfully', async () => {
      const declineDto = {
        ...mockBulkActionDto,
        action: 'decline' as const,
      };

      jest.spyOn(service, 'declineClientRequest').mockResolvedValue({
        success: true,
        request: mockClientTherapistRequest,
        message: 'Request declined',
        providedAlternatives: false,
      });

      const result = await service.performBulkAction('therapist-123', declineDto);

      expect(result.results.successful).toHaveLength(2);
      expect(result.results.failed).toHaveLength(0);
      expect(service.declineClientRequest).toHaveBeenCalledTimes(2);
    });

    it('should perform bulk mark_reviewed action successfully', async () => {
      const markReviewedDto = {
        ...mockBulkActionDto,
        action: 'mark_reviewed' as const,
      };

      jest.spyOn(service as any, 'markRequestAsReviewed').mockResolvedValue({
        success: true,
        requestId: 'request-1',
        message: 'Request marked as reviewed',
      });

      const result = await service.performBulkAction('therapist-123', markReviewedDto);

      expect(result.results.successful).toHaveLength(2);
      expect(result.results.failed).toHaveLength(0);
      expect(service['markRequestAsReviewed']).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in bulk actions', async () => {
      jest.spyOn(service, 'acceptClientRequest')
        .mockResolvedValueOnce({
          success: true,
          request: mockClientTherapistRequest,
          relationship: mockClientTherapistRelationship,
          message: 'Request accepted',
          nextSteps: { scheduleSession: 'Schedule first session', clientNotified: true, relationshipEstablished: true },
        })
        .mockRejectedValueOnce(new Error('Request not found'));

      const result = await service.performBulkAction('therapist-123', mockBulkActionDto);

      expect(result.results.successful).toHaveLength(1);
      expect(result.results.failed).toHaveLength(1);
      expect(result.results.failed[0]).toEqual({
        requestId: 'request-2',
        action: 'accept',
        error: 'Request not found',
      });
    });

    it('should throw BadRequestException for invalid action', async () => {
      const invalidActionDto = {
        ...mockBulkActionDto,
        action: 'invalid_action' as any,
      };

      const result = await service.performBulkAction('therapist-123', invalidActionDto);

      expect(result.results.successful).toHaveLength(0);
      expect(result.results.failed).toHaveLength(2);
      expect(result.results.failed[0].error).toBe('Invalid action: invalid_action');
    });

    it('should throw BadRequestException for missing response in accept action', async () => {
      const actionWithoutResponse = {
        ...mockBulkActionDto,
        response: undefined,
      };

      const result = await service.performBulkAction('therapist-123', actionWithoutResponse);

      expect(result.results.successful).toHaveLength(0);
      expect(result.results.failed).toHaveLength(2);
      expect(result.results.failed[0].error).toBe('Response message required for accept action');
    });
  });

  describe('getTherapistRequestStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const mockRecentRequests = [
        {
          requestedAt: new Date('2023-01-01T10:00:00Z'),
          respondedAt: new Date('2023-01-01T12:00:00Z'),
        },
        {
          requestedAt: new Date('2023-01-02T10:00:00Z'),
          respondedAt: new Date('2023-01-02T14:00:00Z'),
        },
      ];

      const mockLastRequest = { requestedAt: new Date('2023-01-03T10:00:00Z') };
      const mockLastResponse = { respondedAt: new Date('2023-01-03T14:00:00Z') };

      prismaService.clientTherapistRequest.count
        .mockResolvedValueOnce(10) // totalReceived
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(5) // accepted
        .mockResolvedValueOnce(2) // declined
        .mockResolvedValueOnce(0); // expired

      prismaService.clientTherapistRequest.findMany
        .mockResolvedValueOnce(mockRecentRequests)
        .mockResolvedValueOnce([mockLastRequest])
        .mockResolvedValueOnce([mockLastResponse]);

      prismaService.clientTherapist.count.mockResolvedValue(4); // activeRelationships

      const result = await service.getTherapistRequestStatistics('therapist-123');

      expect(result).toEqual({
        totalReceived: 10,
        pending: 3,
        accepted: 5,
        declined: 2,
        expired: 0,
        activeRelationships: 4,
        acceptanceRate: 71.43, // 5 / (5 + 2) * 100
        averageResponseTime: 3, // Average of 2 hours and 4 hours
        lastRequestAt: mockLastRequest.requestedAt,
        lastResponseAt: mockLastResponse.respondedAt,
      });
    });

    it('should handle empty statistics', async () => {
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);
      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapist.count.mockResolvedValue(0);

      const result = await service.getTherapistRequestStatistics('therapist-123');

      expect(result).toEqual({
        totalReceived: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
        activeRelationships: 0,
        acceptanceRate: 0,
        averageResponseTime: 0,
        lastRequestAt: null,
        lastResponseAt: null,
      });
    });

    it('should handle database errors', async () => {
      prismaService.clientTherapistRequest.count.mockRejectedValue(new Error('Database error'));

      await expect(service.getTherapistRequestStatistics('therapist-123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('markRequestAsReviewed', () => {
    it('should mark request as reviewed successfully', async () => {
      prismaService.clientTherapistRequest.findUnique.mockResolvedValue(mockClientTherapistRequest);
      prismaService.auditLog.create.mockResolvedValue({});

      const result = await service['markRequestAsReviewed']('request-123', 'therapist-123');

      expect(result).toEqual({
        success: true,
        requestId: 'request-123',
        message: 'Request marked as reviewed',
      });

      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'therapist-123',
          action: 'REVIEW_CLIENT_REQUEST',
          entity: 'client_therapist_request',
          entityId: 'request-123',
          metadata: {
            requestId: 'request-123',
            reviewedAt: expect.any(String),
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent request', async () => {
      prismaService.clientTherapistRequest.findUnique.mockResolvedValue(null);

      await expect(
        service['markRequestAsReviewed']('request-123', 'therapist-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for request not belonging to therapist', async () => {
      prismaService.clientTherapistRequest.findUnique.mockResolvedValue({
        ...mockClientTherapistRequest,
        therapistId: 'different-therapist',
      });

      await expect(
        service['markRequestAsReviewed']('request-123', 'therapist-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('integration tests', () => {
    it('should handle complete request acceptance workflow', async () => {
      // Mock all transaction operations
      const mockTransaction = {
        clientTherapistRequest: {
          findUnique: jest.fn().mockResolvedValue(mockClientTherapistRequest),
          update: jest.fn().mockResolvedValue({ ...mockClientTherapistRequest, status: 'ACCEPTED' }),
        },
        therapist: {
          findUnique: jest.fn().mockResolvedValue(mockTherapist),
        },
        clientTherapist: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(mockClientTherapistRelationship),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      notificationsService.create.mockResolvedValue({});

      const result = await service.acceptClientRequest(
        'request-123',
        'therapist-123',
        mockResponseDto,
      );

      // Verify all transaction operations were called
      expect(mockTransaction.clientTherapistRequest.findUnique).toHaveBeenCalled();
      expect(mockTransaction.therapist.findUnique).toHaveBeenCalled();
      expect(mockTransaction.clientTherapist.findFirst).toHaveBeenCalled();
      expect(mockTransaction.clientTherapist.create).toHaveBeenCalled();
      expect(mockTransaction.auditLog.create).toHaveBeenCalled();

      // Verify notifications were sent
      expect(notificationsService.create).toHaveBeenCalledTimes(2);

      // Verify result structure
      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.relationship).toBeDefined();
      expect(result.nextSteps).toBeDefined();
    });

    it('should handle complex filtering scenarios', async () => {
      const complexFilters = {
        status: 'PENDING',
        priority: 'HIGH',
        clientId: 'client-123',
        requestedAfter: '2023-01-01',
        requestedBefore: '2023-12-31',
        page: 2,
        limit: 5,
        sortBy: 'priority',
        sortOrder: 'asc',
        includeExpired: true,
      };

      prismaService.clientTherapistRequest.findMany.mockResolvedValue([]);
      prismaService.clientTherapistRequest.count.mockResolvedValue(0);

      const result = await service.getTherapistRequests('therapist-123', complexFilters);

      expect(result.filters).toEqual(complexFilters);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });
});