/**
 * Comprehensive Test Suite for ClientRequestController
 * Tests all client request management endpoints with security, validation, and error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ClientRequestController } from './client-request.controller';
import { ClientRequestService } from '../services/client-request.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('ClientRequestController', () => {
  let controller: ClientRequestController;
  let clientRequestService: ClientRequestService;
  let module: TestingModule;

  // Mock ClientRequestService
  const mockClientRequestService = {
    sendTherapistRequest: jest.fn(),
    sendMultipleTherapistRequests: jest.fn(),
    getClientRequests: jest.fn(),
    cancelRequest: jest.fn(),
    getClientRequestStatistics: jest.fn(),
    expireStaleRequests: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test IDs
  const validTherapistId = '12345678-1234-1234-1234-123456789012'; // 36 chars UUID format
  const validRequestId = '87654321-4321-4321-4321-210987654321'; // 36 chars UUID format

  // Test data
  const mockTherapistRequest = {
    id: validRequestId,
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    status: 'PENDING',
    priority: 'NORMAL',
    message: 'I would like to schedule a session',
    requestedAt: new Date(),
    respondedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequestStatistics = {
    totalSent: 5,
    pending: 2,
    accepted: 1,
    declined: 1,
    expired: 1,
    cancelled: 0,
    withdrawn: 0,
  };

  const mockPaginatedRequests = {
    requests: [mockTherapistRequest],
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ClientRequestController],
      providers: [
        {
          provide: ClientRequestService,
          useValue: mockClientRequestService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ClientRequestController>(ClientRequestController);
    clientRequestService = module.get<ClientRequestService>(ClientRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have clientRequestService injected', () => {
      expect(clientRequestService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', ClientRequestController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', ClientRequestController);
      expect(controllerMetadata).toBe('client/requests');
    });
  });

  describe('POST /client/requests/therapist/:therapistId', () => {
    const requestDto = {
      message: 'I would like to schedule a session',
      priority: 'NORMAL' as const,
      preferredTimes: ['morning', 'afternoon'],
    };

    it('should send therapist request successfully', async () => {
      mockClientRequestService.sendTherapistRequest.mockResolvedValue(mockTherapistRequest);

      const result = await controller.sendTherapistRequest(
        validTherapistId,
        requestDto,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual(mockTherapistRequest);
      expect(clientRequestService.sendTherapistRequest).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        validTherapistId,
        requestDto,
      );
    });

    it('should validate therapist ID format', async () => {
      const invalidTherapistId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.sendTherapistRequest(invalidTherapistId, requestDto, TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid therapist ID format',
      );
    });

    it('should handle empty therapist ID', async () => {
      await TestAssertions.expectToThrowNestException(
        () => controller.sendTherapistRequest('', requestDto, TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid therapist ID format',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Therapist not found');
      mockClientRequestService.sendTherapistRequest.mockRejectedValue(serviceError);

      await expect(
        controller.sendTherapistRequest(validTherapistId, requestDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('POST /client/requests/therapists/bulk', () => {
    const bulkRequestDto = {
      therapistIds: [validTherapistId, '11111111-2222-3333-4444-555555555555'],
      message: 'I would like to schedule sessions',
      priority: 'NORMAL' as const,
      preferredTimes: ['morning'],
    };

    it('should send multiple therapist requests successfully', async () => {
      const bulkResult = {
        success: true,
        sentRequests: 2,
        failedRequests: 0,
        results: [mockTherapistRequest],
      };
      mockClientRequestService.sendMultipleTherapistRequests.mockResolvedValue(bulkResult);

      const result = await controller.sendMultipleTherapistRequests(
        bulkRequestDto,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual(bulkResult);
      expect(clientRequestService.sendMultipleTherapistRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        bulkRequestDto,
      );
    });

    it('should handle service errors for bulk requests', async () => {
      const serviceError = new Error('Some requests failed');
      mockClientRequestService.sendMultipleTherapistRequests.mockRejectedValue(serviceError);

      await expect(
        controller.sendMultipleTherapistRequests(bulkRequestDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests', () => {
    const filters = {
      page: 1,
      limit: 10,
      sortBy: 'requestedAt',
      sortOrder: 'desc',
    };

    it('should get client requests with filters', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getMyRequests(filters, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockPaginatedRequests);
      expect(clientRequestService.getClientRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        filters,
      );
    });

    it('should handle empty filters', async () => {
      const emptyFilters = {};
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getMyRequests(emptyFilters, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockPaginatedRequests);
      expect(clientRequestService.getClientRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        emptyFilters,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockClientRequestService.getClientRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getMyRequests(filters, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/:id', () => {
    it('should get request details successfully', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRequestDetails(validRequestId, TEST_USER_IDS.CLIENT);

      expect(result).toEqual({
        success: true,
        request: mockTherapistRequest,
      });
      expect(clientRequestService.getClientRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          page: 1,
          limit: 1,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
        },
      );
    });

    it('should validate request ID format', async () => {
      const invalidRequestId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails(invalidRequestId, TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid request ID format',
      );
    });

    it('should handle request not found', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue({
        requests: [],
        pagination: { page: 1, limit: 1, totalCount: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails(validRequestId, TEST_USER_IDS.CLIENT),
        NotFoundException,
        'Request with ID 87654321-4321-4321-4321-210987654321 not found or not accessible',
      );
    });

    it('should handle empty request ID', async () => {
      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestDetails('', TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid request ID format',
      );
    });
  });

  describe('PUT /client/requests/:id/cancel', () => {
    const cancelDto = {
      reason: 'Changed my mind',
    };

    it('should cancel request successfully', async () => {
      const cancelResult = {
        success: true,
        message: 'Request cancelled successfully',
        request: { ...mockTherapistRequest, status: 'CANCELLED' },
      };
      mockClientRequestService.cancelRequest.mockResolvedValue(cancelResult);

      const result = await controller.cancelRequest(
        validRequestId,
        cancelDto,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual(cancelResult);
      expect(clientRequestService.cancelRequest).toHaveBeenCalledWith(
        validRequestId,
        TEST_USER_IDS.CLIENT,
        cancelDto.reason,
      );
    });

    it('should validate request ID format', async () => {
      const invalidRequestId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.cancelRequest(invalidRequestId, cancelDto, TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid request ID format',
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Request cannot be cancelled');
      mockClientRequestService.cancelRequest.mockRejectedValue(serviceError);

      await expect(
        controller.cancelRequest(validRequestId, cancelDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/statistics', () => {
    it('should get request statistics successfully', async () => {
      mockClientRequestService.getClientRequestStatistics.mockResolvedValue(mockRequestStatistics);

      const result = await controller.getRequestStatistics(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockRequestStatistics);
      expect(clientRequestService.getClientRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Statistics calculation failed');
      mockClientRequestService.getClientRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getRequestStatistics(TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/pending/count', () => {
    it('should get pending requests count successfully', async () => {
      mockClientRequestService.getClientRequestStatistics.mockResolvedValue(mockRequestStatistics);

      const result = await controller.getPendingRequestsCount(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({
        success: true,
        pendingCount: 2,
        totalSent: 5,
      });
      expect(clientRequestService.getClientRequestStatistics).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
      );
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Statistics calculation failed');
      mockClientRequestService.getClientRequestStatistics.mockRejectedValue(serviceError);

      await expect(
        controller.getPendingRequestsCount(TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/recent', () => {
    it('should get recent requests successfully', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRecentRequests(TEST_USER_IDS.CLIENT);

      expect(result).toEqual({
        success: true,
        recentRequests: [mockTherapistRequest],
        hasMore: false,
      });
      expect(clientRequestService.getClientRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          page: 1,
          limit: 5,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
        },
      );
    });

    it('should indicate when there are more requests', async () => {
      const mockPaginatedWithMore = {
        ...mockPaginatedRequests,
        pagination: { ...mockPaginatedRequests.pagination, totalCount: 10 },
      };
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedWithMore);

      const result = await controller.getRecentRequests(TEST_USER_IDS.CLIENT);

      expect(result.hasMore).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockClientRequestService.getClientRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getRecentRequests(TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('PUT /client/requests/expire-stale', () => {
    it('should expire stale requests successfully', async () => {
      const expireResult = {
        success: true,
        expiredCount: 3,
        message: '3 stale requests expired',
      };
      mockClientRequestService.expireStaleRequests.mockResolvedValue(expireResult);

      const result = await controller.expireStaleRequests(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(expireResult);
      expect(clientRequestService.expireStaleRequests).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Expiration process failed');
      mockClientRequestService.expireStaleRequests.mockRejectedValue(serviceError);

      await expect(
        controller.expireStaleRequests(TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/therapist/:therapistId/status', () => {
    it('should get request status with therapist when active request exists', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRequestStatusWithTherapist(
        validTherapistId,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual({
        success: true,
        hasActiveRequest: true,
        latestRequest: {
          id: mockTherapistRequest.id,
          status: mockTherapistRequest.status,
          requestedAt: mockTherapistRequest.requestedAt,
          respondedAt: mockTherapistRequest.respondedAt,
          expiresAt: mockTherapistRequest.expiresAt,
        },
        canSendNewRequest: false,
      });
      expect(clientRequestService.getClientRequests).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        {
          therapistId: validTherapistId,
          page: 1,
          limit: 1,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
        },
      );
    });

    it('should handle no active request with therapist', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue({
        requests: [],
        pagination: { page: 1, limit: 1, totalCount: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const result = await controller.getRequestStatusWithTherapist(
        validTherapistId,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual({
        success: true,
        hasActiveRequest: false,
        latestRequest: null,
        canSendNewRequest: true,
      });
    });

    it('should validate therapist ID format', async () => {
      const invalidTherapistId = 'invalid-id';

      await TestAssertions.expectToThrowNestException(
        () => controller.getRequestStatusWithTherapist(invalidTherapistId, TEST_USER_IDS.CLIENT),
        BadRequestException,
        'Invalid therapist ID format',
      );
    });

    it('should handle declined request allowing new request', async () => {
      const declinedRequest = { ...mockTherapistRequest, status: 'DECLINED' };
      mockClientRequestService.getClientRequests.mockResolvedValue({
        requests: [declinedRequest],
        pagination: { page: 1, limit: 1, totalCount: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      const result = await controller.getRequestStatusWithTherapist(
        validTherapistId,
        TEST_USER_IDS.CLIENT,
      );

      expect(result.canSendNewRequest).toBe(true);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockClientRequestService.getClientRequests.mockRejectedValue(serviceError);

      await expect(
        controller.getRequestStatusWithTherapist(validTherapistId, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /client/requests/filters/options', () => {
    it('should get filter options successfully', async () => {
      const result = await controller.getFilterOptions(TEST_USER_IDS.CLIENT);

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
        },
      });
    });

    it('should return consistent filter options', async () => {
      const result1 = await controller.getFilterOptions(TEST_USER_IDS.CLIENT);
      const result2 = await controller.getFilterOptions('another-client-id');

      expect(result1).toEqual(result2);
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete request workflow', async () => {
      // Step 1: Send therapist request
      mockClientRequestService.sendTherapistRequest.mockResolvedValue(mockTherapistRequest);
      const requestResult = await controller.sendTherapistRequest(
        validTherapistId,
        { message: 'Test message', priority: 'NORMAL', preferredTimes: ['morning'] },
        TEST_USER_IDS.CLIENT,
      );
      expect(requestResult).toEqual(mockTherapistRequest);

      // Step 2: Get request details
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);
      const detailsResult = await controller.getRequestDetails(validRequestId, TEST_USER_IDS.CLIENT);
      expect(detailsResult.success).toBe(true);

      // Step 3: Check statistics
      mockClientRequestService.getClientRequestStatistics.mockResolvedValue(mockRequestStatistics);
      const statsResult = await controller.getRequestStatistics(TEST_USER_IDS.CLIENT);
      expect(statsResult).toEqual(mockRequestStatistics);

      // Step 4: Check status with therapist
      const statusResult = await controller.getRequestStatusWithTherapist(
        validTherapistId,
        TEST_USER_IDS.CLIENT,
      );
      expect(statusResult.hasActiveRequest).toBe(true);

      // Step 5: Cancel request
      const cancelResult = {
        success: true,
        message: 'Request cancelled successfully',
        request: { ...mockTherapistRequest, status: 'CANCELLED' },
      };
      mockClientRequestService.cancelRequest.mockResolvedValue(cancelResult);
      const canceledResult = await controller.cancelRequest(
        validRequestId,
        { reason: 'Changed my mind' },
        TEST_USER_IDS.CLIENT,
      );
      expect(canceledResult).toEqual(cancelResult);
    });

    it('should handle bulk request workflow', async () => {
      // Step 1: Send multiple requests
      const bulkResult = {
        success: true,
        sentRequests: 2,
        failedRequests: 0,
        results: [mockTherapistRequest],
      };
      mockClientRequestService.sendMultipleTherapistRequests.mockResolvedValue(bulkResult);
      const bulkRequestResult = await controller.sendMultipleTherapistRequests(
        {
          therapistIds: [validTherapistId, '99999999-8888-7777-6666-555555555555'],
          message: 'Bulk message',
          priority: 'HIGH',
          preferredTimes: ['morning', 'afternoon'],
        },
        TEST_USER_IDS.CLIENT,
      );
      expect(bulkRequestResult).toEqual(bulkResult);

      // Step 2: Get all requests
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);
      const allRequestsResult = await controller.getMyRequests(
        { page: 1, limit: 10, sortBy: 'requestedAt', sortOrder: 'desc' },
        TEST_USER_IDS.CLIENT,
      );
      expect(allRequestsResult).toEqual(mockPaginatedRequests);

      // Step 3: Get recent requests
      const recentResult = await controller.getRecentRequests(TEST_USER_IDS.CLIENT);
      expect(recentResult.success).toBe(true);
      expect(recentResult.recentRequests).toEqual([mockTherapistRequest]);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockClientRequestService.sendTherapistRequest.mockRejectedValue(serviceError);

      await expect(
        controller.sendTherapistRequest(
          validTherapistId,
          { message: 'Test', priority: 'NORMAL', preferredTimes: [] },
          TEST_USER_IDS.CLIENT,
        ),
      ).rejects.toThrow(serviceError);
    });

    it('should handle concurrent access issues', async () => {
      const concurrencyError = new Error('Request already exists');
      mockClientRequestService.sendTherapistRequest.mockRejectedValue(concurrencyError);

      await expect(
        controller.sendTherapistRequest(
          validTherapistId,
          { message: 'Test', priority: 'NORMAL', preferredTimes: [] },
          TEST_USER_IDS.CLIENT,
        ),
      ).rejects.toThrow(concurrencyError);
    });

    it('should handle malformed request data', async () => {
      const malformedDto = { invalid: 'data' };
      mockClientRequestService.sendTherapistRequest.mockResolvedValue(mockTherapistRequest);

      const result = await controller.sendTherapistRequest(
        validTherapistId,
        malformedDto as any,
        TEST_USER_IDS.CLIENT,
      );

      expect(clientRequestService.sendTherapistRequest).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        validTherapistId,
        malformedDto,
      );
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted request response', async () => {
      mockClientRequestService.sendTherapistRequest.mockResolvedValue(mockTherapistRequest);

      const result = await controller.sendTherapistRequest(
        validTherapistId,
        { message: 'Test', priority: 'NORMAL', preferredTimes: [] },
        TEST_USER_IDS.CLIENT,
      );

      TestAssertions.expectValidEntity(result, ['id', 'clientId', 'therapistId', 'status']);
    });

    it('should return properly formatted statistics response', async () => {
      mockClientRequestService.getClientRequestStatistics.mockResolvedValue(mockRequestStatistics);

      const result = await controller.getRequestStatistics(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('totalSent');
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('accepted');
      expect(result).toHaveProperty('declined');
      expect(typeof result.totalSent).toBe('number');
      expect(typeof result.pending).toBe('number');
    });

    it('should return properly formatted success responses', async () => {
      mockClientRequestService.getClientRequests.mockResolvedValue(mockPaginatedRequests);

      const result = await controller.getRequestDetails(validRequestId, TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('request');
      expect(result.success).toBe(true);
    });

    it('should return properly formatted filter options response', async () => {
      const result = await controller.getFilterOptions(TEST_USER_IDS.CLIENT);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('filterOptions');
      expect(result.success).toBe(true);
      expect(result.filterOptions).toHaveProperty('statuses');
      expect(result.filterOptions).toHaveProperty('priorities');
      expect(result.filterOptions).toHaveProperty('sortOptions');
      expect(result.filterOptions).toHaveProperty('sortOrders');
      expect(Array.isArray(result.filterOptions.statuses)).toBe(true);
      expect(Array.isArray(result.filterOptions.priorities)).toBe(true);
    });
  });
});