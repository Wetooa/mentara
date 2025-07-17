import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from '../services/stripe.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('Stripe Webhooks')
@ApiTags('stripe-webhook')
@ApiBearerAuth('JWT-auth')
@Controller('billing/stripe/webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from public API docs for security
  @ApiOperation({
    summary: 'Handle Stripe webhook events',
    description: 'Receives and processes webhook events from Stripe',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean' },
        eventId: { type: 'string' },
        eventType: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
  })
  @ApiResponse({
    status: 500,
    description: 'Error processing webhook',
  })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const startTime = Date.now();

    try {
      // Validate required headers
      if (!signature) {
        this.logger.error('Missing Stripe signature header');
        throw new BadRequestException('Missing Stripe signature header');
      }

      // Get raw body for signature validation
      const rawBody = request.rawBody;
      if (!rawBody) {
        this.logger.error('Missing raw body for webhook validation');
        throw new BadRequestException(
          'Missing raw body for webhook validation',
        );
      }

      // Construct and validate webhook event
      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
      );

      this.logger.log(`Received Stripe webhook: ${event.type} (${event.id})`);

      // Check if we've already processed this event (idempotency)
      const existingEvent = await this.checkEventIdempotency(event.id);
      if (existingEvent) {
        this.logger.log(`Event ${event.id} already processed, skipping`);
        return {
          received: true,
          eventId: event.id,
          eventType: event.type,
          message: 'Event already processed',
        };
      }

      // Record the event as being processed
      await this.recordWebhookEvent(event);

      // Process the event
      await this.stripeService.handleWebhookEvent(event);

      // Mark event as successfully processed
      await this.markEventProcessed(event.id, true);

      // Log performance metrics
      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Webhook ${event.type} processed successfully in ${processingTime}ms`,
      );

      // Emit event for monitoring/analytics
      this.eventEmitter.emit('stripe.webhook.processed', {
        eventId: event.id,
        eventType: event.type,
        processingTime,
        success: true,
      });

      return {
        received: true,
        eventId: event.id,
        eventType: event.type,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Log the error with context
      this.logger.error(`Webhook processing failed in ${processingTime}ms:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        signature: signature?.substring(0, 20) + '...',
        bodyType: typeof body,
        rawBodyLength: request.rawBody?.length,
      });

      // Try to extract event info for logging even if processing failed
      let eventId = 'unknown';
      let eventType = 'unknown';

      try {
        if (body && typeof body === 'object') {
          eventId = body.id || 'unknown';
          eventType = body.type || 'unknown';
        }
      } catch (parseError) {
        // Ignore parsing errors for logging
      }

      // Mark event as failed if we have an event ID
      if (eventId !== 'unknown') {
        try {
          await this.markEventProcessed(
            eventId,
            false,
            error instanceof Error ? error.message : String(error),
          );
        } catch (dbError) {
          this.logger.error(
            'Failed to mark event as failed in database:',
            dbError,
          );
        }
      }

      // Emit error event for monitoring
      this.eventEmitter.emit('stripe.webhook.error', {
        eventId,
        eventType,
        processingTime,
        error: error instanceof Error ? error.message : String(error),
        success: false,
      });

      // Return appropriate error response
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to process webhook');
    }
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test webhook endpoint',
    description: 'Test endpoint for webhook connectivity (development only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Test webhook received successfully',
  })
  async testWebhook(@Body() body: any) {
    try {
      this.logger.log('Test webhook received:', body);

      return {
        received: true,
        timestamp: new Date().toISOString(),
        message: 'Test webhook processed successfully',
        body: body,
      };
    } catch (error) {
      this.logger.error('Test webhook processing failed:', error);
      throw new InternalServerErrorException('Failed to process test webhook');
    }
  }

  /**
   * Check if event has already been processed (idempotency)
   */
  private async checkEventIdempotency(eventId: string): Promise<boolean> {
    try {
      const existingEvent = await this.prisma.stripeWebhookEvent.findUnique({
        where: { eventId },
      });

      return !!existingEvent;
    } catch (error) {
      this.logger.error(
        `Error checking event idempotency for ${eventId}:`,
        error,
      );
      return false; // Allow processing if we can't check
    }
  }

  /**
   * Record webhook event in database
   */
  private async recordWebhookEvent(event: any): Promise<void> {
    try {
      await this.prisma.stripeWebhookEvent.create({
        data: {
          eventId: event.id,
          eventType: event.type,
          eventData: event.data,
          livemode: event.livemode,
          apiVersion: event.api_version,
          created: new Date(event.created * 1000),
          processed: false,
        },
      });
    } catch (error) {
      this.logger.error(`Error recording webhook event ${event.id}:`, error);
      // Don't throw here - we still want to process the event
    }
  }

  /**
   * Mark event as processed
   */
  private async markEventProcessed(
    eventId: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.prisma.stripeWebhookEvent.update({
        where: { eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          success,
          errorMessage: errorMessage || null,
        },
      });
    } catch (error) {
      this.logger.error(`Error marking event ${eventId} as processed:`, error);
      // Don't throw here - event processing was the important part
    }
  }

  /**
   * Get webhook processing statistics
   */
  @Post('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get webhook processing statistics',
    description: 'Returns statistics about webhook processing (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook statistics retrieved successfully',
  })
  async getWebhookStats() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalEvents,
        processedEvents,
        failedEvents,
        recentEvents,
        eventsByType,
      ] = await Promise.all([
        this.prisma.stripeWebhookEvent.count(),
        this.prisma.stripeWebhookEvent.count({
          where: { processed: true, success: true },
        }),
        this.prisma.stripeWebhookEvent.count({
          where: { processed: true, success: false },
        }),
        this.prisma.stripeWebhookEvent.count({
          where: { created: { gte: oneDayAgo } },
        }),
        this.prisma.stripeWebhookEvent.groupBy({
          by: ['eventType'],
          where: { created: { gte: oneWeekAgo } },
          _count: { eventType: true },
        }),
      ]);

      const successRate =
        totalEvents > 0 ? (processedEvents / totalEvents) * 100 : 0;

      return {
        totalEvents,
        processedEvents,
        failedEvents,
        recentEvents,
        successRate: Math.round(successRate * 100) / 100,
        eventsByType: eventsByType.map((event) => ({
          eventType: event.eventType,
          count: event._count.eventType,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting webhook statistics:', error);
      throw new InternalServerErrorException(
        'Failed to get webhook statistics',
      );
    }
  }

  /**
   * Get recent webhook events
   */
  @Post('recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get recent webhook events',
    description: 'Returns recent webhook events for debugging (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent webhook events retrieved successfully',
  })
  async getRecentEvents() {
    try {
      const events = await this.prisma.stripeWebhookEvent.findMany({
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

      return {
        events,
        count: events.length,
      };
    } catch (error) {
      this.logger.error('Error getting recent webhook events:', error);
      throw new InternalServerErrorException(
        'Failed to get recent webhook events',
      );
    }
  }

  /**
   * Retry failed webhook event
   */
  @Post('retry/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry failed webhook event',
    description:
      'Manually retry processing a failed webhook event (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook event retried successfully',
  })
  async retryFailedEvent(@Req() request: any) {
    try {
      const eventId = request.params.eventId;

      // Get the failed event
      const webhookEvent = await this.prisma.stripeWebhookEvent.findUnique({
        where: { eventId },
      });

      if (!webhookEvent) {
        throw new BadRequestException(`Webhook event ${eventId} not found`);
      }

      if (webhookEvent.success) {
        throw new BadRequestException(
          `Webhook event ${eventId} already processed successfully`,
        );
      }

      // Reconstruct the Stripe event and retry processing
      const stripeEvent = {
        id: webhookEvent.eventId,
        type: webhookEvent.eventType,
        data: webhookEvent.eventData,
        created: Math.floor(webhookEvent.created.getTime() / 1000),
        livemode: webhookEvent.livemode,
        api_version: webhookEvent.apiVersion,
      };

      // Process the event
      await this.stripeService.handleWebhookEvent(stripeEvent as any);

      // Mark as successfully processed
      await this.markEventProcessed(eventId, true);

      this.logger.log(`Successfully retried webhook event ${eventId}`);

      return {
        success: true,
        eventId,
        message: 'Webhook event retried successfully',
      };
    } catch (error) {
      this.logger.error('Error retrying webhook event:', error);
      throw new InternalServerErrorException('Failed to retry webhook event');
    }
  }
}
