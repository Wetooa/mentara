import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/interfaces/domain-event.interface';
import {
  MessageSentEvent,
  ConversationCreatedEvent,
} from '../events/messaging-events';
import {
  AppointmentBookedEvent,
  AppointmentCancelledEvent,
} from '../events/booking-events';
import {
  UserRegisteredEvent,
  UserLoginEvent,
  UserLogoutEvent,
  UserProfileUpdatedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
} from '../events/user-events';
import { PostCreatedEvent, CommentAddedEvent } from '../events/social-events';
import { PaymentProcessedEvent } from '../events/billing-events';
import { SystemErrorEvent } from '../events/system-events';
import { AuditAction, SystemEventType, EventSeverity } from '@prisma/client';

interface AuditLogEntry {
  action: AuditAction;
  entity: string;
  entityId: string;
  userId?: string;
  userRole?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

interface SystemEventEntry {
  eventType: SystemEventType;
  severity: EventSeverity;
  title: string;
  description: string;
  component?: string;
  metadata?: Record<string, any>;
  errorCode?: string;
  stackTrace?: string;
}

@Injectable()
export class AuditLoggingService implements OnModuleInit {
  private readonly logger = new Logger(AuditLoggingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit() {
    this.subscribeToEvents();
    this.logger.log('Audit logging event handlers initialized successfully');
  }

  private subscribeToEvents(): void {
    // Subscribe to user lifecycle events
    this.subscribeToUserEvents();

    // Subscribe to messaging events
    this.subscribeToMessagingEvents();

    // Subscribe to booking events
    this.subscribeToBookingEvents();

    // Subscribe to social events
    this.subscribeToSocialEvents();

    // Subscribe to billing events
    this.subscribeToBillingEvents();

    // Subscribe to system events
    this.subscribeToSystemEvents();

    this.logger.log('Subscribed to all audit logging event handlers');
  }

  private subscribeToUserEvents(): void {
    // User registration
    this.eventBus.subscribe(
      'UserRegisteredEvent',
      async (event: DomainEvent<any>) => {
        const userEvent = event as UserRegisteredEvent;
        const { userId, email, firstName, lastName, role, registrationMethod } =
          userEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_REGISTER,
          entity: 'User',
          entityId: userId,
          userId,
          userRole: role,
          newValues: {
            email,
            firstName,
            lastName,
            role,
            registrationMethod,
          },
          description: `User ${firstName} ${lastName} registered with email ${email}`,
          metadata: {
            registrationMethod,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged user registration: ${userId}`);
      },
    );

    // User login
    this.eventBus.subscribe(
      'UserLoginEvent',
      async (event: DomainEvent<any>) => {
        const loginEvent = event as UserLoginEvent;
        const { userId, email, loginMethod, isSuccessful, failureReason } =
          loginEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_LOGIN,
          entity: 'User',
          entityId: userId,
          userId,
          description: isSuccessful
            ? `User ${email} logged in successfully via ${loginMethod}`
            : `Failed login attempt for ${email}: ${failureReason}`,
          metadata: {
            loginMethod,
            isSuccessful,
            failureReason,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        // Create system event for failed login attempts
        if (!isSuccessful) {
          await this.createSystemEvent({
            eventType: SystemEventType.FAILED_LOGIN_ATTEMPTS,
            severity: EventSeverity.WARNING,
            title: 'Failed Login Attempt',
            description: `Failed login attempt for user ${email}: ${failureReason}`,
            component: 'auth',
            metadata: {
              userId,
              email,
              loginMethod,
              failureReason,
              ipAddress: event.metadata.ipAddress,
              userAgent: event.metadata.userAgent,
            },
          });
        }

        this.logger.debug(
          `Logged user login: ${userId} - ${isSuccessful ? 'success' : 'failed'}`,
        );
      },
    );

    // User logout
    this.eventBus.subscribe(
      'UserLogoutEvent',
      async (event: DomainEvent<any>) => {
        const logoutEvent = event as UserLogoutEvent;
        const { userId, sessionDuration, logoutMethod } = logoutEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_LOGOUT,
          entity: 'User',
          entityId: userId,
          userId,
          description: `User logged out via ${logoutMethod} after ${Math.round(sessionDuration / 60)} minutes`,
          metadata: {
            sessionDuration,
            logoutMethod,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged user logout: ${userId}`);
      },
    );

    // User profile update
    this.eventBus.subscribe(
      'UserProfileUpdatedEvent',
      async (event: DomainEvent<any>) => {
        const profileEvent = event as UserProfileUpdatedEvent;
        const { userId, updatedFields, newValues, previousValues } =
          profileEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_UPDATE_PROFILE,
          entity: 'User',
          entityId: userId,
          userId,
          oldValues: previousValues,
          newValues: newValues,
          description: `User updated profile fields: ${updatedFields.join(', ')}`,
          metadata: {
            updatedFields,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged user profile update: ${userId}`);
      },
    );

    // User deactivation
    this.eventBus.subscribe(
      'UserDeactivatedEvent',
      async (event: DomainEvent<any>) => {
        const deactivationEvent = event as UserDeactivatedEvent;
        const { userId, deactivatedBy, reason, isTemporary } =
          deactivationEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_DELETE_ACCOUNT,
          entity: 'User',
          entityId: userId,
          userId: deactivatedBy,
          description: `User account ${isTemporary ? 'suspended' : 'deactivated'}: ${reason}`,
          metadata: {
            deactivatedBy,
            reason,
            isTemporary,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged user deactivation: ${userId}`);
      },
    );

    // User reactivation
    this.eventBus.subscribe(
      'UserReactivatedEvent',
      async (event: DomainEvent<any>) => {
        const reactivationEvent = event as UserReactivatedEvent;
        const { userId, reactivatedBy, inactiveDuration } =
          reactivationEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.USER_UPDATE_PROFILE, // Using existing action, could add USER_REACTIVATE
          entity: 'User',
          entityId: userId,
          userId: reactivatedBy,
          newValues: {
            isActive: true,
            inactiveDuration,
          },
          description: `User account reactivated by ${reactivatedBy} after ${inactiveDuration} days`,
          metadata: {
            reactivatedBy,
            inactiveDuration,
            eventId: event.eventId,
          },
          ipAddress: event.metadata.ipAddress,
          userAgent: event.metadata.userAgent,
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged user reactivation: ${userId}`);
      },
    );
  }

  private subscribeToMessagingEvents(): void {
    // Message sent
    this.eventBus.subscribe(
      'MessageSentEvent',
      async (event: DomainEvent<any>) => {
        const messageEvent = event as MessageSentEvent;
        const {
          messageId,
          conversationId,
          senderId,
          messageType,
          recipientIds,
        } = messageEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MESSAGE_SEND,
          entity: 'Message',
          entityId: messageId,
          userId: senderId,
          newValues: {
            conversationId,
            messageType,
            recipientCount: recipientIds.length,
          },
          description: `Message sent to ${recipientIds.length} recipients in conversation ${conversationId}`,
          metadata: {
            conversationId,
            messageType,
            recipientIds,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged message sent: ${messageId}`);
      },
    );

    // Conversation created
    this.eventBus.subscribe(
      'ConversationCreatedEvent',
      async (event: DomainEvent<any>) => {
        const conversationEvent = event as ConversationCreatedEvent;
        const { conversationId, createdBy, participantIds, conversationType } =
          conversationEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MESSAGE_SEND, // Using existing action, could add CONVERSATION_CREATE
          entity: 'Conversation',
          entityId: conversationId,
          userId: createdBy,
          newValues: {
            conversationType,
            participantCount: participantIds.length,
          },
          description: `${conversationType} conversation created with ${participantIds.length} participants`,
          metadata: {
            conversationType,
            participantIds,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged conversation creation: ${conversationId}`);
      },
    );
  }

  private subscribeToBookingEvents(): void {
    // Appointment booked
    this.eventBus.subscribe(
      'AppointmentBookedEvent',
      async (event: DomainEvent<any>) => {
        const appointmentEvent = event as AppointmentBookedEvent;
        const {
          appointmentId,
          clientId,
          therapistId,
          startTime,
          meetingType,
          duration,
        } = appointmentEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MEETING_CREATE,
          entity: 'Meeting',
          entityId: appointmentId,
          userId: clientId,
          newValues: {
            clientId,
            therapistId,
            startTime,
            meetingType,
            duration,
          },
          description: `${meetingType} appointment booked with therapist for ${duration} minutes`,
          metadata: {
            clientId,
            therapistId,
            startTime,
            meetingType,
            duration,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged appointment booking: ${appointmentId}`);
      },
    );

    // Appointment cancelled
    this.eventBus.subscribe(
      'AppointmentCancelledEvent',
      async (event: DomainEvent<any>) => {
        const cancelEvent = event as AppointmentCancelledEvent;
        const {
          appointmentId,
          clientId,
          therapistId,
          cancelledBy,
          cancellationReason,
        } = cancelEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MEETING_CANCEL,
          entity: 'Meeting',
          entityId: appointmentId,
          userId: cancelledBy,
          oldValues: {
            clientId,
            therapistId,
            status: 'scheduled',
          },
          newValues: {
            status: 'cancelled',
            cancellationReason,
          },
          description: `Appointment cancelled by ${cancelledBy === clientId ? 'client' : 'therapist'}: ${cancellationReason}`,
          metadata: {
            clientId,
            therapistId,
            cancelledBy,
            cancellationReason,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged appointment cancellation: ${appointmentId}`);
      },
    );
  }

  private subscribeToSocialEvents(): void {
    // Post created
    this.eventBus.subscribe(
      'PostCreatedEvent',
      async (event: DomainEvent<any>) => {
        const postEvent = event as PostCreatedEvent;
        const { postId, authorId, communityId, title, postType, isAnonymous } =
          postEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MESSAGE_SEND, // Using existing action, could add POST_CREATE
          entity: 'Post',
          entityId: postId,
          userId: authorId,
          newValues: {
            communityId,
            title,
            postType,
            isAnonymous,
          },
          description: `${postType} post created in community ${communityId}${isAnonymous ? ' (anonymous)' : ''}`,
          metadata: {
            communityId,
            title,
            postType,
            isAnonymous,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged post creation: ${postId}`);
      },
    );

    // Comment added
    this.eventBus.subscribe(
      'CommentAddedEvent',
      async (event: DomainEvent<any>) => {
        const commentEvent = event as CommentAddedEvent;
        const { commentId, postId, authorId, content } = commentEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.MESSAGE_SEND, // Using existing action, could add COMMENT_CREATE
          entity: 'Comment',
          entityId: commentId,
          userId: authorId,
          newValues: {
            postId,
            contentLength: content?.length || 0,
          },
          description: `Comment added to post ${postId}`,
          metadata: {
            postId,
            contentLength: content?.length || 0,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        this.logger.debug(`Logged comment creation: ${commentId}`);
      },
    );
  }

  private subscribeToBillingEvents(): void {
    // Payment processed
    this.eventBus.subscribe(
      'PaymentProcessedEvent',
      async (event: DomainEvent<any>) => {
        const paymentEvent = event as PaymentProcessedEvent;
        const {
          paymentId,
          userId,
          amount,
          currency,
          paymentMethod,
          paymentStatus,
        } = paymentEvent.eventData;

        await this.createAuditLog({
          action: AuditAction.SYSTEM_BACKUP, // Using existing action, could add PAYMENT_PROCESS
          entity: 'Payment',
          entityId: paymentId,
          userId,
          newValues: {
            amount,
            currency,
            paymentMethod,
            paymentStatus,
          },
          description: `Payment ${paymentStatus}: ${amount} ${currency} via ${paymentMethod}`,
          metadata: {
            amount,
            currency,
            paymentMethod,
            paymentStatus,
            eventId: event.eventId,
          },
          requestId: event.metadata.requestId,
        });

        // Create system event for failed payments
        if (paymentStatus === 'failed') {
          await this.createSystemEvent({
            eventType: SystemEventType.PAYMENT_PROCESSING_ERROR,
            severity: EventSeverity.ERROR,
            title: 'Payment Processing Failed',
            description: `Payment ${paymentId} failed for user ${userId}: ${amount} ${currency}`,
            component: 'billing',
            metadata: {
              paymentId,
              userId,
              amount,
              currency,
              paymentMethod,
            },
          });
        }

        this.logger.debug(
          `Logged payment processing: ${paymentId} - ${paymentStatus}`,
        );
      },
    );
  }

  private subscribeToSystemEvents(): void {
    // System errors
    this.eventBus.subscribe(
      'SystemErrorEvent',
      async (event: DomainEvent<any>) => {
        const errorEvent = event as SystemErrorEvent;
        const { errorId, errorType, errorMessage, stackTrace } =
          errorEvent.eventData;

        await this.createSystemEvent({
          eventType: SystemEventType.HIGH_ERROR_RATE,
          severity: EventSeverity.ERROR,
          title: `System Error: ${errorType}`,
          description: errorMessage,
          component: 'unknown',
          errorCode: errorId,
          stackTrace,
          metadata: {
            errorId,
            errorType,
            eventId: event.eventId,
          },
        });

        this.logger.debug(`Logged system error: ${errorId}`);
      },
    );
  }

  // Helper methods for creating audit logs
  private async createAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          userId: entry.userId,
          userRole: entry.userRole,
          oldValues: entry.oldValues
            ? JSON.stringify(entry.oldValues)
            : undefined,
          newValues: entry.newValues
            ? JSON.stringify(entry.newValues)
            : undefined,
          description: entry.description,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          requestId: entry.requestId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log entry:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  private async createSystemEvent(entry: SystemEventEntry): Promise<void> {
    try {
      await this.prisma.systemEvent.create({
        data: {
          eventType: entry.eventType,
          severity: entry.severity,
          title: entry.title,
          description: entry.description,
          component: entry.component,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
          errorCode: entry.errorCode,
          stackTrace: entry.stackTrace,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create system event entry:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  // Administrative methods
  async searchAuditLogs(filters: {
    userId?: string;
    action?: AuditAction;
    entity?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });
  }

  async getAuditLogStats() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalLogs, weeklyLogs, monthlyLogs, actionCounts, entityCounts] =
      await Promise.all([
        this.prisma.auditLog.count(),
        this.prisma.auditLog.count({
          where: { createdAt: { gte: oneWeekAgo } },
        }),
        this.prisma.auditLog.count({
          where: { createdAt: { gte: oneMonthAgo } },
        }),
        this.prisma.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 10,
        }),
        this.prisma.auditLog.groupBy({
          by: ['entity'],
          _count: { entity: true },
          orderBy: { _count: { entity: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalLogs,
      weeklyLogs,
      monthlyLogs,
      topActions: actionCounts,
      topEntities: entityCounts,
    };
  }

  async cleanupOldAuditLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old audit log entries`);
    return result.count;
  }
}
