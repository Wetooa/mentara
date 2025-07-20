/**
 * Comprehensive Test Suite for TherapistRequestController
 * Tests all therapist request management endpoints with security, validation, and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TherapistRequestController } from './therapist-request.controller';
import { TherapistRequestService } from '../services/therapist-request.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('TherapistRequestController', () => {
  let controller: TherapistRequestController;
  let therapistRequestService: TherapistRequestService;
  let module: TestingModule;

  // Mock TherapistRequestService
  const mockTherapistRequestService = {
    getTherapistRequests: jest.fn(),
    acceptClientRequest: jest.fn(),
    declineClientRequest: jest.fn(),
    performBulkAction: jest.fn(),
    getTherapistRequestStatistics: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test IDs
  const validRequestId = '87654321-4321-4321-4321-210987654321'; // 36 chars UUID format
  const validClientId = '12345678-1234-1234-1234-123456789012'; // 36 chars UUID format

  // Test data
  const mockRequest = {
    id: validRequestId,
    clientId: validClientId,
    therapistId: TEST_USER_IDS.THERAPIST,
    status: 'PENDING',
    priority: 'NORMAL',
    message: 'I would like to schedule a session',
    requestedAt: new Date(),
    respondedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
    client: {
      id: validClientId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  };

  const mockPaginatedRequests = {
    requests: [mockRequest],
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    summary: {
      totalRequests: 1,
      pendingRequests: 1,
      acceptedRequests: 0,
      declinedRequests: 0,
      expiredRequests: 0,
    },
  };

  const mockStatistics = {
    totalReceived: 10,
    pending: 3,
    accepted: 5,
    declined: 2,
    expired: 0,
    cancelled: 0,
    withdrawn: 0,
    averageResponseTime: 4.5,
    acceptanceRate: 71.4,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TherapistRequestController],
      providers: [
        {
          provide: TherapistRequestService,
          useValue: mockTherapistRequestService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TherapistRequestController>(TherapistRequestController);
    therapistRequestService = module.get<TherapistRequestService>(TherapistRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have therapistRequestService injected', () => {
      expect(therapistRequestService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', TherapistRequestController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', TherapistRequestController);
      expect(controllerMetadata).toBe('therapist/requests');
    });
  });

  describe('GET /therapist/requests', () => {
    const filters = {
      page: 1,
      limit: 10,
      sortBy: 'requestedAt',
      sortOrder: 'desc',
      status: 'PENDING',
    };

    it('should get client requests with filters', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getClientRequests(filters, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockPaginatedRequests);
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        filters,
      );
    });

    it('should handle empty filters', async () => {
      const emptyFilters = {};
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getClientRequests(emptyFilters, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockPaginatedRequests);
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        emptyFilters,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getClientRequests(filters, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/pending', () => {
    it('should get pending requests successfully', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getPendingRequests(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        pendingRequests: [mockRequest],
        totalPending: 1,
        summary: mockPaginatedRequests.summary,
      });
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        {
          status: 'PENDING',
          page: 1,
          limit: 50,
          sortBy: 'requestedAt',
          sortOrder: 'asc',
          includeExpired: false,
        },
      );
    });

    it('should handle no pending requests', async () => {
      const emptyResult = {
        ...mockPaginatedRequests,
        requests: [],
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 0 },
      };
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(emptyResult);

      const result = await controller.getPendingRequests(TEST_USER_IDS.THERAPIST);

      expect(result.pendingRequests).toEqual([]);
      expect(result.totalPending).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getPendingRequests(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/priority', () => {
    it('should get high priority requests successfully', async () => {
      const highPriorityResult = {
        ...mockPaginatedRequests,
        requests: [{ ...mockRequest, priority: 'HIGH' }],
      };
      const urgentResult = {
        ...mockPaginatedRequests,
        requests: [{ ...mockRequest, priority: 'URGENT' }],
      };
      mockTherapistRequestService.getTherapistRequests
        .mockResolvedValueOnce(highPriorityResult)
        .mockResolvedValueOnce(urgentResult);

      const result = await controller.getHighPriorityRequests(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        highPriorityRequests: [{ ...mockRequest, priority: 'HIGH' }],
        urgentRequests: [{ ...mockRequest, priority: 'URGENT' }],
        totalHighPriority: 1,
        totalUrgent: 1,
      });
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledTimes(2);
    });

    it('should handle no high priority requests', async () => {
      const emptyResult = {
        ...mockPaginatedRequests,
        requests: [],
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 0 },
      };
      mockTherapistRequestService.getTherapistRequests
        .mockResolvedValueOnce(emptyResult)
        .mockResolvedValueOnce(emptyResult);

      const result = await controller.getHighPriorityRequests(TEST_USER_IDS.THERAPIST);

      expect(result.highPriorityRequests).toEqual([]);
      expect(result.urgentRequests).toEqual([]);
      expect(result.totalHighPriority).toBe(0);
      expect(result.totalUrgent).toBe(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getHighPriorityRequests(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/:id', () => {
    it('should get request details successfully', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRequestDetails(validRequestId, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        request: mockRequest,
      });
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        {
          page: 1,
          limit: 1,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
          includeExpired: false,
        },
      );
    });

    it('should validate request ID format', async () => {
      const invalidRequestId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails(invalidRequestId, TEST_USER_IDS.THERAPIST),
        BadRequestException,
        'Invalid request ID format',
      );
    });

    it('should handle request not found', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue({
        requests: [],
        pagination: { page: 1, limit: 1, totalCount: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails(validRequestId, TEST_USER_IDS.THERAPIST),
        NotFoundException,
        'Request with ID 87654321-4321-4321-4321-210987654321 not found or not accessible',
      );
    });

    it('should handle empty request ID', async () => {
      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails('', TEST_USER_IDS.THERAPIST),
        BadRequestException,
        'Invalid request ID format',
      );
    });
  });

  describe('PUT /therapist/requests/:id/accept', () => {
    const responseDto = {
      message: 'I would be happy to work with you',
      availableSlots: ['2024-01-15T10:00:00Z', '2024-01-16T14:00:00Z'],
    };

    it('should accept request successfully', async () => {
      const acceptResult = {
        success: true,
        message: 'Request accepted successfully',
        request: { ...mockRequest, status: 'ACCEPTED' },
      };
      mockTherapistRequestService.acceptClientRequest.mockResolvedValue(acceptResult);

      const result = await controller.acceptRequest(
        validRequestId,
        responseDto,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual(acceptResult);
      expect(therapistRequestService.acceptClientRequest).toHaveBeenCalledWith(
        validRequestId,
        TEST_USER_IDS.THERAPIST,
        responseDto,
      );
    });

    it('should validate request ID format', async () => {
      const invalidRequestId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.acceptRequest(invalidRequestId, responseDto, TEST_USER_IDS.THERAPIST),
        BadRequestException,
        'Invalid request ID format',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Request cannot be accepted');
      mockTherapistRequestService.acceptClientRequest.mockRejectedValue(serviceError);

      await expect(
        controller.acceptRequest(validRequestId, responseDto, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('PUT /therapist/requests/:id/decline', () => {
    const responseDto = {
      message: 'Unfortunately, I am not available at this time',
      reason: 'AVAILABILITY_CONFLICT',
    };

    it('should decline request successfully', async () => {
      const declineResult = {
        success: true,
        message: 'Request declined successfully',
        request: { ...mockRequest, status: 'DECLINED' },
      };
      mockTherapistRequestService.declineClientRequest.mockResolvedValue(declineResult);

      const result = await controller.declineRequest(
        validRequestId,
        responseDto,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual(declineResult);
      expect(therapistRequestService.declineClientRequest).toHaveBeenCalledWith(
        validRequestId,
        TEST_USER_IDS.THERAPIST,
        responseDto,
      );
    });

    it('should validate request ID format', async () => {
      const invalidRequestId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.declineRequest(invalidRequestId, responseDto, TEST_USER_IDS.THERAPIST),
        BadRequestException,
        'Invalid request ID format',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Request cannot be declined');
      mockTherapistRequestService.declineClientRequest.mockRejectedValue(serviceError);

      await expect(
        controller.declineRequest(validRequestId, responseDto, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /therapist/requests/bulk-action', () => {
    const bulkActionDto = {
      action: 'accept',
      requestIds: [validRequestId, '11111111-2222-3333-4444-555555555555'],
      message: 'Bulk acceptance message',
    };

    it('should perform bulk action successfully', async () => {
      const bulkResult = {
        success: true,
        processedCount: 2,
        failedCount: 0,
        results: [
          { requestId: validRequestId, status: 'ACCEPTED' },
          { requestId: '11111111-2222-3333-4444-555555555555', status: 'ACCEPTED' },
        ],
      };
      mockTherapistRequestService.performBulkAction.mockResolvedValue(bulkResult);

      const result = await controller.performBulkAction(bulkActionDto, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(bulkResult);
      expect(therapistRequestService.performBulkAction).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        bulkActionDto,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Bulk action failed');
      mockTherapistRequestService.performBulkAction.mockRejectedValue(serviceError);

      await expect(
        controller.performBulkAction(bulkActionDto, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/statistics', () => {
    it('should get request statistics successfully', async () => {
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getRequestStatistics(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockStatistics);
      expect(therapistRequestService.getTherapistRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Statistics calculation failed');
      mockTherapistRequestService.getTherapistRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getRequestStatistics(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/recent', () => {
    it('should get recent requests successfully', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRecentRequests(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        recentRequests: [mockRequest],
        hasMore: false,
        summary: mockPaginatedRequests.summary,
      });
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        {
          page: 1,
          limit: 10,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
          includeExpired: false,
        },
      );
    });

    it('should indicate when there are more requests', async () => {
      const moreRequestsResult = {
        ...mockPaginatedRequests,
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 20 },
      };
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(moreRequestsResult);

      const result = await controller.getRecentRequests(TEST_USER_IDS.THERAPIST);

      expect(result.hasMore).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getRecentRequests(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/dashboard/summary', () => {
    it('should get dashboard summary successfully', async () => {
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);
      mockTherapistRequestService.getTherapistRequests
        .mockResolvedValueOnce(mockPaginatedRequests) // pending requests
        .mockResolvedValueOnce(mockPaginatedRequests); // high priority requests

      const result = await controller.getDashboardSummary(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        statistics: mockStatistics,
        recentPendingRequests: [mockRequest],
        highPriorityRequests: [mockRequest],
        actionRequired: true,
        hasUrgentRequests: false,
      });
      expect(therapistRequestService.getTherapistRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledTimes(2);
    });

    it('should handle no pending requests', async () => {
      const emptyResult = {
        ...mockPaginatedRequests,
        requests: [],
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 0 },
      };
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);
      mockTherapistRequestService.getTherapistRequests
        .mockResolvedValueOnce(emptyResult)
        .mockResolvedValueOnce(emptyResult);

      const result = await controller.getDashboardSummary(TEST_USER_IDS.THERAPIST);

      expect(result.actionRequired).toBe(false);
      expect(result.hasUrgentRequests).toBe(false);
    });

    it('should detect urgent requests', async () => {
      const urgentRequest = { ...mockRequest, priority: 'URGENT' };
      const urgentResult = {
        ...mockPaginatedRequests,
        requests: [urgentRequest],
      };
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);
      mockTherapistRequestService.getTherapistRequests
        .mockResolvedValueOnce(mockPaginatedRequests)
        .mockResolvedValueOnce(urgentResult);

      const result = await controller.getDashboardSummary(TEST_USER_IDS.THERAPIST);

      expect(result.hasUrgentRequests).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Dashboard query failed');
      mockTherapistRequestService.getTherapistRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getDashboardSummary(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/client/:clientId/history', () => {
    it('should get client request history successfully', async () => {
      const historyResult = {
        ...mockPaginatedRequests,
        requests: [mockRequest, { ...mockRequest, status: 'ACCEPTED' }],
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 2 },
      };
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(historyResult);

      const result = await controller.getClientRequestHistory(
        validClientId,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual({
        success: true,
        clientId: validClientId,
        requestHistory: [mockRequest, { ...mockRequest, status: 'ACCEPTED' }],
        totalRequests: 2,
        hasActiveRelationship: true,
      });
      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        {
          clientId: validClientId,
          page: 1,
          limit: 50,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
          includeExpired: true,
        },
      );
    });

    it('should validate client ID format', async () => {
      const invalidClientId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.getClientRequestHistory(invalidClientId, TEST_USER_IDS.THERAPIST),
        BadRequestException,
        'Invalid client ID format',
      );
    });

    it('should handle no request history', async () => {
      const emptyResult = {
        ...mockPaginatedRequests,
        requests: [],
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 0 },
      };
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(emptyResult);

      const result = await controller.getClientRequestHistory(
        validClientId,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result.requestHistory).toEqual([]);
      expect(result.totalRequests).toBe(0);
      expect(result.hasActiveRelationship).toBe(false);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('History query failed');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getClientRequestHistory(validClientId, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/filters/options', () => {
    it('should get filter options successfully', async () => {
      const result = await controller.getFilterOptions(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        filterOptions: {
          statuses: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED', 'WITHDRAWN'],
          priorities: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          sortOptions: [
            { value: 'requestedAt', label: 'Request Date' },
            { value: 'respondedAt', label: 'Response Date' },
            { value: 'priority', label: 'Priority' },
            { value: 'status', label: 'Status' },
          ],
          sortOrders: [
            { value: 'desc', label: 'Newest First' },
            { value: 'asc', label: 'Oldest First' },
          ],
          bulkActions: [
            { value: 'accept', label: 'Accept Selected' },
            { value: 'decline', label: 'Decline Selected' },
            { value: 'mark_reviewed', label: 'Mark as Reviewed' },
          ],
        },
      });
    });

    it('should return consistent filter options', async () => {
      const result1 = await controller.getFilterOptions(TEST_USER_IDS.THERAPIST);
      const result2 = await controller.getFilterOptions('another-therapist-id');

      expect(result1).toEqual(result2);
    });
  });

  describe('GET /therapist/requests/count/pending', () => {
    it('should get pending count successfully', async () => {
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getPendingCount(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        pendingCount: 3,
        totalReceived: 10,
        needsAttention: true,
      });
      expect(therapistRequestService.getTherapistRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
    });

    it('should handle no pending requests', async () => {
      const noPendingStats = { ...mockStatistics, pending: 0 };
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(noPendingStats);

      const result = await controller.getPendingCount(TEST_USER_IDS.THERAPIST);

      expect(result.pendingCount).toBe(0);
      expect(result.needsAttention).toBe(false);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Statistics calculation failed');
      mockTherapistRequestService.getTherapistRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getPendingCount(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /therapist/requests/analytics/response-time', () => {
    it('should get response time analytics successfully', async () => {
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getResponseTimeAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual({
        success: true,
        responseTimeAnalytics: {
          averageHours: 4.5,
          performance: 'good',
          acceptanceRate: 71.4,
          totalResponded: 7,
        },
        recommendations: [
          "You're doing great with both response time and acceptance rate!",
        ],
      });
      expect(therapistRequestService.getTherapistRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
    });

    it('should categorize response time as excellent', async () => {
      const excellentStats = { ...mockStatistics, averageResponseTime: 1.5 };
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(excellentStats);

      const result = await controller.getResponseTimeAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result.responseTimeAnalytics.performance).toBe('excellent');
    });

    it('should categorize response time as needs improvement', async () => {
      const poorStats = { ...mockStatistics, averageResponseTime: 48, acceptanceRate: 20 };
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(poorStats);

      const result = await controller.getResponseTimeAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result.responseTimeAnalytics.performance).toBe('needs_improvement');
      expect(result.recommendations).toContain(
        'Consider responding to client requests within 24 hours for better client experience',
      );
      expect(result.recommendations).toContain(
        'Your acceptance rate is low. Consider reviewing your availability and client preferences',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Analytics calculation failed');
      mockTherapistRequestService.getTherapistRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getResponseTimeAnalytics(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('Helper Methods', () => {
    it('should categorize response time correctly', () => {
      expect((controller as any).categorizeResponseTime(1)).toBe('excellent');
      expect((controller as any).categorizeResponseTime(4)).toBe('good');
      expect((controller as any).categorizeResponseTime(12)).toBe('fair');
      expect((controller as any).categorizeResponseTime(48)).toBe('needs_improvement');
    });

    it('should generate appropriate recommendations', () => {
      const recommendations1 = (controller as any).getResponseTimeRecommendations(2, 85);
      expect(recommendations1).toContain("Excellent acceptance rate! You're providing great accessibility to clients");
      expect(recommendations1).toContain("You're doing great with both response time and acceptance rate!");

      const recommendations2 = (controller as any).getResponseTimeRecommendations(48, 20);
      expect(recommendations2).toContain('Consider responding to client requests within 24 hours for better client experience');
      expect(recommendations2).toContain('Your acceptance rate is low. Consider reviewing your availability and client preferences');
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete request management workflow', async () => {
      // Step 1: Get pending requests
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);
      const pendingResult = await controller.getPendingRequests(TEST_USER_IDS.THERAPIST);
      expect(pendingResult.totalPending).toBe(1);

      // Step 2: Get request details
      const detailsResult = await controller.getRequestDetails(validRequestId, TEST_USER_IDS.THERAPIST);
      expect(detailsResult.success).toBe(true);

      // Step 3: Accept request
      const acceptResult = {
        success: true,
        message: 'Request accepted successfully',
        request: { ...mockRequest, status: 'ACCEPTED' },
      };
      mockTherapistRequestService.acceptClientRequest.mockResolvedValue(acceptResult);
      const acceptedResult = await controller.acceptRequest(
        validRequestId,
        { message: 'I would be happy to work with you' },
        TEST_USER_IDS.THERAPIST,
      );
      expect(acceptedResult).toEqual(acceptResult);

      // Step 4: Check statistics
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);
      const statsResult = await controller.getRequestStatistics(TEST_USER_IDS.THERAPIST);
      expect(statsResult).toEqual(mockStatistics);
    });

    it('should handle bulk action workflow', async () => {
      // Step 1: Get pending requests
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);
      const pendingResult = await controller.getPendingRequests(TEST_USER_IDS.THERAPIST);
      expect(pendingResult.totalPending).toBe(1);

      // Step 2: Perform bulk action
      const bulkResult = {
        success: true,
        processedCount: 2,
        failedCount: 0,
        results: [
          { requestId: validRequestId, status: 'ACCEPTED' },
          { requestId: '11111111-2222-3333-4444-555555555555', status: 'ACCEPTED' },
        ],
      };
      mockTherapistRequestService.performBulkAction.mockResolvedValue(bulkResult);
      const bulkActionResult = await controller.performBulkAction(
        {
          action: 'accept',
          requestIds: [validRequestId, '11111111-2222-3333-4444-555555555555'],
          message: 'Bulk acceptance',
        },
        TEST_USER_IDS.THERAPIST,
      );
      expect(bulkActionResult).toEqual(bulkResult);

      // Step 3: Check updated statistics
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);
      const statsResult = await controller.getRequestStatistics(TEST_USER_IDS.THERAPIST);
      expect(statsResult).toEqual(mockStatistics);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockTherapistRequestService.getTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getClientRequests({ page: 1, limit: 10 }, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(serviceError);
    });

    it('should handle concurrent access issues', async () => {
      const concurrencyError = new Error('Resource is locked');
      mockTherapistRequestService.acceptClientRequest.mockRejectedValue(concurrencyError);

      await expect(
        controller.acceptRequest(
          validRequestId,
          { message: 'Accept message' },
          TEST_USER_IDS.THERAPIST,
        ),
      ).rejects.toThrow(concurrencyError);
    });

    it('should handle malformed request data', async () => {
      const malformedFilters = { invalid: 'data' };
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getClientRequests(malformedFilters as any, TEST_USER_IDS.THERAPIST);

      expect(therapistRequestService.getTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        malformedFilters,
      );
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted request response', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getClientRequests({ page: 1, limit: 10 }, TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('requests');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.requests)).toBe(true);
      expect(typeof result.pagination.totalCount).toBe('number');
    });

    it('should return properly formatted statistics response', async () => {
      mockTherapistRequestService.getTherapistRequestStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getRequestStatistics(TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('totalReceived');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('accepted');
      expect(result).toHaveProperty('declined');
      expect(result).toHaveProperty('averageResponseTime');
      expect(result).toHaveProperty('acceptanceRate');
      expect(typeof result.totalReceived).toBe('number');
      expect(typeof result.averageResponseTime).toBe('number');
    });

    it('should return properly formatted success responses', async () => {
      mockTherapistRequestService.getTherapistRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRecentRequests(TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('recentRequests');
      expect(result).toHaveProperty('hasMore');
      expect(result.success).toBe(true);
      expect(Array.isArray(result.recentRequests)).toBe(true);
      expect(typeof result.hasMore).toBe('boolean');
    });
  });
});