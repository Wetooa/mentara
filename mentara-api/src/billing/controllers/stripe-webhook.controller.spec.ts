/**
 * Comprehensive Test Suite for StripeWebhookController
 * Tests webhook event processing, idempotency, error handling, and statistics
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from '../services/stripe.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../../test-utils/index';

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;
  let stripeService: StripeService;
  let prismaService: PrismaService;
  let eventEmitter: EventEmitter2;
  let module: TestingModule;

  // Mock services
  const mockStripeService = {
    constructWebhookEvent: jest.fn(),
    handleWebhookEvent: jest.fn(),
  };

  const mockPrismaService = {
    stripeWebhookEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  // Test data
  const mockStripeEvent = {
    id: 'evt_1234567890',
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: 'in_1234567890',
        amount_paid: 2999,
        currency: 'usd',
        customer: 'cus_1234567890',
        subscription: 'sub_1234567890',
      },
    },
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    api_version: '2022-11-15',
  };

  const mockWebhookEventRecord = {
    id: 'webhook_123',
    eventId: 'evt_1234567890',
    eventType: 'invoice.payment_succeeded',
    eventData: mockStripeEvent.data,
    livemode: false,
    apiVersion: '2022-11-15',
    created: new Date(),
    processed: false,
    processedAt: null,
    success: null,
    errorMessage: null,
  };

  const mockRequest = {
    rawBody: Buffer.from(JSON.stringify(mockStripeEvent)),
    body: mockStripeEvent,
    params: {},
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [StripeWebhookController],
      providers: [
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    controller = module.get<StripeWebhookController>(StripeWebhookController);
    stripeService = module.get<StripeService>(StripeService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(stripeService).toBeDefined();
      expect(prismaService).toBeDefined();
      expect(eventEmitter).toBeDefined();
    });
  });

  describe('POST /billing/stripe/webhooks', () => {
    const validSignature = 't=1234567890,v1=abcdef1234567890';

    beforeEach(() => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockStripeEvent);
      mockStripeService.handleWebhookEvent.mockResolvedValue(undefined);
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...mockWebhookEventRecord,
        processed: true,
        success: true,
      });
    });

    it('should process webhook successfully', async () => {
      const result = await controller.handleWebhook(
        mockRequest as any,
        mockStripeEvent,
        validSignature
      );

      expect(result).toEqual({
        received: true,
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
      });

      expect(stripeService.constructWebhookEvent).toHaveBeenCalledWith(
        mockRequest.rawBody,
        validSignature
      );
      expect(stripeService.handleWebhookEvent).toHaveBeenCalledWith(mockStripeEvent);
      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.processed', {
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
        success: true,
      });
    });

    it('should handle missing signature', async () => {
      await expect(
        controller.handleWebhook(mockRequest as any, mockStripeEvent, '')
      ).rejects.toThrow(BadRequestException);

      expect(stripeService.constructWebhookEvent).not.toHaveBeenCalled();
    });

    it('should handle missing raw body', async () => {
      const requestWithoutRawBody = {
        ...mockRequest,
        rawBody: undefined,
      };

      await expect(
        controller.handleWebhook(requestWithoutRawBody as any, mockStripeEvent, validSignature)
      ).rejects.toThrow(BadRequestException);

      expect(stripeService.constructWebhookEvent).not.toHaveBeenCalled();
    });

    it('should handle idempotent events', async () => {
      // Mock existing event found
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(mockWebhookEventRecord);

      const result = await controller.handleWebhook(
        mockRequest as any,
        mockStripeEvent,
        validSignature
      );

      expect(result).toEqual({
        received: true,
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        message: 'Event already processed',
      });

      // Should not process the event again
      expect(stripeService.handleWebhookEvent).not.toHaveBeenCalled();
    });

    it('should handle webhook construction errors', async () => {
      const constructionError = new Error('Invalid signature');
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw constructionError;
      });

      await expect(
        controller.handleWebhook(mockRequest as any, mockStripeEvent, validSignature)
      ).rejects.toThrow(InternalServerErrorException);

      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.error', {
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
        error: constructionError.message,
        success: false,
      });
    });

    it('should handle webhook processing errors', async () => {
      const processingError = new Error('Payment processing failed');
      mockStripeService.handleWebhookEvent.mockRejectedValue(processingError);

      await expect(
        controller.handleWebhook(mockRequest as any, mockStripeEvent, validSignature)
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockPrismaService.stripeWebhookEvent.update).toHaveBeenCalledWith({
        where: { eventId: mockStripeEvent.id },
        data: {
          processed: true,
          processedAt: expect.any(Date),
          success: false,
          errorMessage: processingError.message,
        },
      });
    });

    it('should handle database recording errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.stripeWebhookEvent.create.mockRejectedValue(dbError);

      // Should still process the webhook despite database error
      const result = await controller.handleWebhook(
        mockRequest as any,
        mockStripeEvent,
        validSignature
      );

      expect(result.received).toBe(true);
      expect(stripeService.handleWebhookEvent).toHaveBeenCalled();
    });

    it('should handle malformed request body', async () => {
      const malformedRequest = {
        rawBody: mockRequest.rawBody,
        body: 'invalid json',
      };

      const constructionError = new Error('Invalid webhook payload');
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw constructionError;
      });

      await expect(
        controller.handleWebhook(malformedRequest as any, 'invalid', validSignature)
      ).rejects.toThrow(InternalServerErrorException);

      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.error', {
        eventId: 'unknown',
        eventType: 'unknown',
        processingTime: expect.any(Number),
        error: constructionError.message,
        success: false,
      });
    });

    it('should handle different event types', async () => {
      const customerCreatedEvent = {
        ...mockStripeEvent,
        id: 'evt_customer_created',
        type: 'customer.created',
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(customerCreatedEvent);

      const result = await controller.handleWebhook(
        mockRequest as any,
        customerCreatedEvent,
        validSignature
      );

      expect(result.eventType).toBe('customer.created');
      expect(stripeService.handleWebhookEvent).toHaveBeenCalledWith(customerCreatedEvent);
    });
  });

  describe('POST /billing/stripe/webhooks/test', () => {
    it('should handle test webhook successfully', async () => {
      const testPayload = { test: 'data', timestamp: new Date().toISOString() };

      const result = await controller.testWebhook(testPayload);

      expect(result).toEqual({
        received: true,
        timestamp: expect.any(String),
        message: 'Test webhook processed successfully',
        body: testPayload,
      });
    });

    it('should handle test webhook errors', async () => {
      // Mock logger error to simulate internal error
      const originalLoggerError = controller['logger'].log;
      controller['logger'].log = jest.fn().mockImplementation(() => {
        throw new Error('Logger error');
      });

      await expect(controller.testWebhook({ test: 'data' })).rejects.toThrow(
        InternalServerErrorException
      );

      // Restore original logger
      controller['logger'].log = originalLoggerError;
    });
  });

  describe('POST /billing/stripe/webhooks/stats', () => {
    it('should return webhook statistics successfully', async () => {
      const mockStats = {
        totalEvents: 100,
        processedEvents: 95,
        failedEvents: 5,
        recentEvents: 20,
        eventsByType: [
          { eventType: 'invoice.payment_succeeded', _count: { eventType: 30 } },
          { eventType: 'customer.created', _count: { eventType: 25 } },
          { eventType: 'subscription.created', _count: { eventType: 15 } },
        ],
      };

      mockPrismaService.stripeWebhookEvent.count
        .mockResolvedValueOnce(mockStats.totalEvents)
        .mockResolvedValueOnce(mockStats.processedEvents)
        .mockResolvedValueOnce(mockStats.failedEvents)
        .mockResolvedValueOnce(mockStats.recentEvents);

      mockPrismaService.stripeWebhookEvent.groupBy.mockResolvedValue(mockStats.eventsByType);

      const result = await controller.getWebhookStats();

      expect(result).toEqual({
        totalEvents: 100,
        processedEvents: 95,
        failedEvents: 5,
        recentEvents: 20,
        successRate: 95,
        eventsByType: [
          { eventType: 'invoice.payment_succeeded', count: 30 },
          { eventType: 'customer.created', count: 25 },
          { eventType: 'subscription.created', count: 15 },
        ],
      });
    });

    it('should handle zero events gracefully', async () => {
      mockPrismaService.stripeWebhookEvent.count.mockResolvedValue(0);
      mockPrismaService.stripeWebhookEvent.groupBy.mockResolvedValue([]);

      const result = await controller.getWebhookStats();

      expect(result.successRate).toBe(0);
      expect(result.eventsByType).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.stripeWebhookEvent.count.mockRejectedValue(dbError);

      await expect(controller.getWebhookStats()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('POST /billing/stripe/webhooks/recent', () => {
    it('should return recent webhook events successfully', async () => {
      const mockRecentEvents = [
        {
          eventId: 'evt_recent_1',
          eventType: 'invoice.payment_succeeded',
          created: new Date(),
          processed: true,
          processedAt: new Date(),
          success: true,
          errorMessage: null,
        },
        {
          eventId: 'evt_recent_2',
          eventType: 'customer.created',
          created: new Date(),
          processed: true,
          processedAt: new Date(),
          success: false,
          errorMessage: 'Processing failed',
        },
      ];

      mockPrismaService.stripeWebhookEvent.findMany.mockResolvedValue(mockRecentEvents);

      const result = await controller.getRecentEvents();

      expect(result).toEqual({
        events: mockRecentEvents,
        count: mockRecentEvents.length,
      });

      expect(mockPrismaService.stripeWebhookEvent.findMany).toHaveBeenCalledWith({
        select: {
          eventId: true,
          eventType: true,
          created: true,
          processed: true,
          processedAt: true,
          success: true,
          errorMessage: true,
        },
        orderBy: { created: 'desc' },
        take: 50,
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database query failed');
      mockPrismaService.stripeWebhookEvent.findMany.mockRejectedValue(dbError);

      await expect(controller.getRecentEvents()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('POST /billing/stripe/webhooks/retry/:eventId', () => {
    const failedEventId = 'evt_failed_123';
    const failedWebhookEvent = {
      ...mockWebhookEventRecord,
      eventId: failedEventId,
      processed: true,
      success: false,
      errorMessage: 'Original processing failed',
    };

    beforeEach(() => {
      mockRequest.params = { eventId: failedEventId };
    });

    it('should retry failed webhook event successfully', async () => {
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(failedWebhookEvent);
      mockStripeService.handleWebhookEvent.mockResolvedValue(undefined);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...failedWebhookEvent,
        success: true,
        errorMessage: null,
      });

      const result = await controller.retryFailedEvent(mockRequest as any);

      expect(result).toEqual({
        success: true,
        eventId: failedEventId,
        message: 'Webhook event retried successfully',
      });

      expect(stripeService.handleWebhookEvent).toHaveBeenCalledWith({
        id: failedWebhookEvent.eventId,
        type: failedWebhookEvent.eventType,
        data: failedWebhookEvent.eventData,
        created: expect.any(Number),
        livemode: failedWebhookEvent.livemode,
        api_version: failedWebhookEvent.apiVersion,
      });
    });

    it('should handle event not found', async () => {
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);

      await expect(controller.retryFailedEvent(mockRequest as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle already successful event', async () => {
      const successfulEvent = {
        ...failedWebhookEvent,
        success: true,
      };
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(successfulEvent);

      await expect(controller.retryFailedEvent(mockRequest as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle retry processing errors', async () => {
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(failedWebhookEvent);
      const retryError = new Error('Retry processing failed');
      mockStripeService.handleWebhookEvent.mockRejectedValue(retryError);

      await expect(controller.retryFailedEvent(mockRequest as any)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should handle database errors during retry', async () => {
      const dbError = new Error('Database error during retry');
      mockPrismaService.stripeWebhookEvent.findUnique.mockRejectedValue(dbError);

      await expect(controller.retryFailedEvent(mockRequest as any)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('Private Methods', () => {
    describe('checkEventIdempotency', () => {
      it('should return true for existing event', async () => {
        mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(mockWebhookEventRecord);

        const result = await controller['checkEventIdempotency']('evt_existing');

        expect(result).toBe(true);
      });

      it('should return false for non-existing event', async () => {
        mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);

        const result = await controller['checkEventIdempotency']('evt_new');

        expect(result).toBe(false);
      });

      it('should return false on database error', async () => {
        mockPrismaService.stripeWebhookEvent.findUnique.mockRejectedValue(
          new Error('Database error')
        );

        const result = await controller['checkEventIdempotency']('evt_error');

        expect(result).toBe(false);
      });
    });

    describe('recordWebhookEvent', () => {
      it('should record webhook event successfully', async () => {
        mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);

        await expect(
          controller['recordWebhookEvent'](mockStripeEvent)
        ).resolves.not.toThrow();

        expect(mockPrismaService.stripeWebhookEvent.create).toHaveBeenCalledWith({
          data: {
            eventId: mockStripeEvent.id,
            eventType: mockStripeEvent.type,
            eventData: mockStripeEvent.data,
            livemode: mockStripeEvent.livemode,
            apiVersion: mockStripeEvent.api_version,
            created: new Date(mockStripeEvent.created * 1000),
            processed: false,
          },
        });
      });

      it('should handle database errors gracefully', async () => {
        mockPrismaService.stripeWebhookEvent.create.mockRejectedValue(
          new Error('Database error')
        );

        // Should not throw
        await expect(
          controller['recordWebhookEvent'](mockStripeEvent)
        ).resolves.not.toThrow();
      });
    });

    describe('markEventProcessed', () => {
      it('should mark event as successful', async () => {
        mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
          ...mockWebhookEventRecord,
          processed: true,
          success: true,
        });

        await expect(
          controller['markEventProcessed']('evt_123', true)
        ).resolves.not.toThrow();

        expect(mockPrismaService.stripeWebhookEvent.update).toHaveBeenCalledWith({
          where: { eventId: 'evt_123' },
          data: {
            processed: true,
            processedAt: expect.any(Date),
            success: true,
            errorMessage: null,
          },
        });
      });

      it('should mark event as failed with error message', async () => {
        const errorMessage = 'Processing failed';
        mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
          ...mockWebhookEventRecord,
          processed: true,
          success: false,
          errorMessage,
        });

        await expect(
          controller['markEventProcessed']('evt_123', false, errorMessage)
        ).resolves.not.toThrow();

        expect(mockPrismaService.stripeWebhookEvent.update).toHaveBeenCalledWith({
          where: { eventId: 'evt_123' },
          data: {
            processed: true,
            processedAt: expect.any(Date),
            success: false,
            errorMessage,
          },
        });
      });

      it('should handle database errors gracefully', async () => {
        mockPrismaService.stripeWebhookEvent.update.mockRejectedValue(
          new Error('Database error')
        );

        // Should not throw
        await expect(
          controller['markEventProcessed']('evt_123', true)
        ).resolves.not.toThrow();
      });
    });
  });

  describe('Event Emission', () => {
    it('should emit success events', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockStripeEvent);
      mockStripeService.handleWebhookEvent.mockResolvedValue(undefined);
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...mockWebhookEventRecord,
        processed: true,
        success: true,
      });

      await controller.handleWebhook(
        mockRequest as any,
        mockStripeEvent,
        't=1234567890,v1=abcdef1234567890'
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.processed', {
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
        success: true,
      });
    });

    it('should emit error events', async () => {
      const processingError = new Error('Processing failed');
      mockStripeService.constructWebhookEvent.mockReturnValue(mockStripeEvent);
      mockStripeService.handleWebhookEvent.mockRejectedValue(processingError);
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...mockWebhookEventRecord,
        processed: true,
        success: false,
      });

      await expect(
        controller.handleWebhook(
          mockRequest as any,
          mockStripeEvent,
          't=1234567890,v1=abcdef1234567890'
        )
      ).rejects.toThrow();

      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.error', {
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
        error: processingError.message,
        success: false,
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should track processing time for successful webhooks', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockStripeEvent);
      mockStripeService.handleWebhookEvent.mockResolvedValue(undefined);
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...mockWebhookEventRecord,
        processed: true,
        success: true,
      });

      const result = await controller.handleWebhook(
        mockRequest as any,
        mockStripeEvent,
        't=1234567890,v1=abcdef1234567890'
      );

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.processingTime).toBe('number');
    });

    it('should track processing time for failed webhooks', async () => {
      const processingError = new Error('Processing failed');
      mockStripeService.constructWebhookEvent.mockReturnValue(mockStripeEvent);
      mockStripeService.handleWebhookEvent.mockRejectedValue(processingError);
      mockPrismaService.stripeWebhookEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.stripeWebhookEvent.create.mockResolvedValue(mockWebhookEventRecord);
      mockPrismaService.stripeWebhookEvent.update.mockResolvedValue({
        ...mockWebhookEventRecord,
        processed: true,
        success: false,
      });

      await expect(
        controller.handleWebhook(
          mockRequest as any,
          mockStripeEvent,
          't=1234567890,v1=abcdef1234567890'
        )
      ).rejects.toThrow();

      expect(eventEmitter.emit).toHaveBeenCalledWith('stripe.webhook.error', {
        eventId: mockStripeEvent.id,
        eventType: mockStripeEvent.type,
        processingTime: expect.any(Number),
        error: processingError.message,
        success: false,
      });
    });
  });
});