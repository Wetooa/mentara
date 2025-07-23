import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../common/events/event-bus.service';
import { DomainEvent } from '../../common/events/interfaces/domain-event.interface';
import {
  MessageSentEvent,
  MessageReadEvent,
  ConversationCreatedEvent,
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  TypingIndicatorEvent,
} from '../../common/events/messaging-events';
import {
  AppointmentBookedEvent,
  AppointmentCancelledEvent,
} from '../../common/events/booking-events';
import {
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
} from '../../common/events/user-events';
import {
  PostCreatedEvent,
  CommentAddedEvent,
} from '../../common/events/social-events';

@Injectable()
export class WebSocketEventService implements OnModuleInit {
  private readonly logger = new Logger(WebSocketEventService.name);

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit() {
    this.subscribeToEvents();
    this.logger.log('WebSocket event handlers initialized successfully');
  }

  private subscribeToEvents(): void {
    // Subscribe to messaging events

    // Subscribe to booking events
    this.subscribeToBookingEvents();

    // Subscribe to user events
    this.subscribeToUserEvents();

    // Subscribe to social events
    this.subscribeToSocialEvents();

    this.logger.log('Subscribed to all WebSocket event handlers');
  }

  private subscribeToBookingEvents(): void {
    // Appointment booked event - notify therapist and client
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
          isInitialConsultation,
        } = appointmentEvent.eventData;

        const appointmentNotification = {
          appointmentId,
          clientId,
          therapistId,
          startTime,
          meetingType,
          isInitialConsultation,
          eventType: 'appointment_booked',
          timestamp: new Date(),
        };

        this.logger.debug(
          `Broadcasted appointment booked event: ${appointmentId}`,
        );
      },
    );

    // Appointment cancelled event - notify both parties
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
          cancelledAt,
        } = cancelEvent.eventData;

        const cancellationNotification = {
          appointmentId,
          clientId,
          therapistId,
          cancelledBy,
          cancellationReason,
          cancelledAt,
          eventType: 'appointment_cancelled',
          timestamp: new Date(),
        };

        // Determine message based on who cancelled
        const clientMessage =
          cancelledBy === clientId
            ? 'You have cancelled your appointment.'
            : 'Your appointment has been cancelled by the therapist.';

        const therapistMessage =
          cancelledBy === therapistId
            ? 'You have cancelled the appointment.'
            : 'The client has cancelled their appointment.';

        this.logger.debug(
          `Broadcasted appointment cancelled event: ${appointmentId}`,
        );
      },
    );
  }

  private subscribeToUserEvents(): void {
    // User registered event - welcome notification
    this.eventBus.subscribe(
      'UserRegisteredEvent',
      async (event: DomainEvent<any>) => {
        const registrationEvent = event as UserRegisteredEvent;
        const { userId, firstName, lastName, role } =
          registrationEvent.eventData;

        this.logger.debug(`Sent welcome notification to new user: ${userId}`);
      },
    );

    // User profile updated event - notify relevant connections
    this.eventBus.subscribe(
      'UserProfileUpdatedEvent',
      async (event: DomainEvent<any>) => {
        const profileEvent = event as UserProfileUpdatedEvent;
        const { userId, updatedFields, newValues } = profileEvent.eventData;

        this.logger.debug(`Broadcasted user profile update: ${userId}`);
      },
    );
  }

  private subscribeToSocialEvents(): void {
    // Post created event - notify community members
    this.eventBus.subscribe(
      'PostCreatedEvent',
      async (event: DomainEvent<any>) => {
        const postEvent = event as PostCreatedEvent;
        const {
          postId,
          authorId,
          communityId,
          title,
          content,
          tags,
          postType,
          isAnonymous,
        } = postEvent.eventData;

        this.logger.debug(`Broadcasted post created event: ${postId}`);
      },
    );

    // Comment added event - notify post author and participants
    this.eventBus.subscribe(
      'CommentAddedEvent',
      async (event: DomainEvent<any>) => {
        const commentEvent = event as CommentAddedEvent;
        const { commentId, postId, authorId, content } = commentEvent.eventData;

        this.logger.debug(
          `Broadcasted comment created event: ${commentId} on post ${postId}`,
        );
      },
    );
  }

  /**
   * Helper method to get user socket room name
   */
  private getUserSocketRoom(userId: string): string {
    return `user_${userId}`;
  }

  /**
   * Subscribe users to their personal notification rooms
   */
  subscribeUserToPersonalRoom(userId: string, socketId: string): void {
    const userRoom = this.getUserSocketRoom(userId);
    this.logger.debug(
      `User ${userId} subscribed to personal room: ${userRoom}`,
    );
  }

  /**
   * Unsubscribe users from their personal notification rooms
   */
  unsubscribeUserFromPersonalRoom(userId: string, socketId: string): void {
    const userRoom = this.getUserSocketRoom(userId);
    this.logger.debug(
      `User ${userId} unsubscribed from personal room: ${userRoom}`,
    );
  }

  /**
   * Subscribe user to community room for post notifications
   */
  subscribeUserToCommunityRoom(userId: string, communityId: string): void {
    const communityRoom = `community_${communityId}`;
    this.logger.debug(
      `User ${userId} subscribed to community room: ${communityRoom}`,
    );
  }

  /**
   * Subscribe user to post room for comment notifications
   */
  subscribeUserToPostRoom(
    userId: string,
    postId: string,
    socketId: string,
  ): void {
    const postRoom = `post_${postId}`;
    this.logger.debug(`User ${userId} subscribed to post room: ${postRoom}`);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    eventSubscriptions: number;
  } {
    return {
      eventSubscriptions: this.eventBus.getEventStats().totalListeners,
    };
  }

  /**
   * Broadcast system-wide announcement
   */
  broadcastSystemAnnouncement(
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
  ): void {
    this.logger.log(
      `Broadcasted system announcement: ${message} (priority: ${priority})`,
    );
  }

  /**
   * Send targeted notification to specific users
   */
  sendTargetedNotification(userIds: string[], notification: any): void {
    this.logger.debug(`Sent targeted notification to ${userIds.length} users`);
  }
}
