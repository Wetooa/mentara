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
import { MessagingGateway } from '../messaging.gateway';

@Injectable()
export class WebSocketEventService implements OnModuleInit {
  private readonly logger = new Logger(WebSocketEventService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  onModuleInit() {
    this.subscribeToEvents();
    this.logger.log('WebSocket event handlers initialized successfully');
  }

  private subscribeToEvents(): void {
    // Subscribe to messaging events
    this.subscribeToMessagingEvents();

    // Subscribe to booking events
    this.subscribeToBookingEvents();

    // Subscribe to user events
    this.subscribeToUserEvents();

    // Subscribe to social events
    this.subscribeToSocialEvents();

    this.logger.log('Subscribed to all WebSocket event handlers');
  }

  private subscribeToMessagingEvents(): void {
    // Message sent event - broadcast to conversation participants
    this.eventBus.subscribe(
      'MessageSentEvent',
      async (event: DomainEvent<any>) => {
        const messageEvent = event as MessageSentEvent;
        const {
          conversationId,
          messageId,
          senderId,
          content,
          messageType,
          sentAt,
          recipientIds,
        } = messageEvent.eventData;

        // Broadcast message to conversation participants via WebSocket
        this.messagingGateway.broadcastMessage(conversationId, {
          id: messageId,
          conversationId,
          senderId,
          content,
          messageType,
          sentAt,
          eventType: 'message_sent',
        });

        // Send delivery confirmations
        for (const recipientId of recipientIds) {
          this.messagingGateway.server
            .to(this.getUserSocketRoom(recipientId))
            .emit('message_delivered', {
              messageId,
              conversationId,
              deliveredAt: new Date(),
              eventType: 'message_delivered',
            });
        }

        this.logger.debug(`Broadcasted message sent event: ${messageId}`);
      },
    );

    // Message read event - broadcast read receipt
    this.eventBus.subscribe(
      'MessageReadEvent',
      async (event: DomainEvent<any>) => {
        const readEvent = event as MessageReadEvent;
        const { messageId, conversationId, readBy } = readEvent.eventData;

        this.messagingGateway.broadcastReadReceipt(
          conversationId,
          messageId,
          readBy,
        );

        this.logger.debug(
          `Broadcasted message read event: ${messageId} by ${readBy}`,
        );
      },
    );

    // Conversation created event - notify participants
    this.eventBus.subscribe(
      'ConversationCreatedEvent',
      async (event: DomainEvent<any>) => {
        const conversationEvent = event as ConversationCreatedEvent;
        const {
          conversationId,
          createdBy,
          participantIds,
          conversationType,
          title,
        } = conversationEvent.eventData;

        // Notify all participants about new conversation
        for (const participantId of participantIds) {
          this.messagingGateway.server
            .to(this.getUserSocketRoom(participantId))
            .emit('conversation_created', {
              conversationId,
              createdBy,
              conversationType,
              title,
              participantIds,
              eventType: 'conversation_created',
              timestamp: new Date(),
            });
        }

        this.logger.debug(
          `Broadcasted conversation created event: ${conversationId}`,
        );
      },
    );

    // Participant joined event - notify conversation
    this.eventBus.subscribe(
      'ParticipantJoinedEvent',
      async (event: DomainEvent<any>) => {
        const joinEvent = event as ParticipantJoinedEvent;
        const { conversationId, participantId, addedBy, joinedAt, role } =
          joinEvent.eventData;

        this.messagingGateway.server
          .to(conversationId)
          .emit('participant_joined', {
            conversationId,
            participantId,
            addedBy,
            joinedAt,
            role,
            eventType: 'participant_joined',
          });

        this.logger.debug(
          `Broadcasted participant joined event: ${participantId} to ${conversationId}`,
        );
      },
    );

    // Participant left event - notify conversation
    this.eventBus.subscribe(
      'ParticipantLeftEvent',
      async (event: DomainEvent<any>) => {
        const leftEvent = event as ParticipantLeftEvent;
        const { conversationId, participantId, leftAt, leftReason } =
          leftEvent.eventData;

        this.messagingGateway.server
          .to(conversationId)
          .emit('participant_left', {
            conversationId,
            participantId,
            leftAt,
            leftReason,
            eventType: 'participant_left',
          });

        this.logger.debug(
          `Broadcasted participant left event: ${participantId} from ${conversationId}`,
        );
      },
    );

    // Typing indicator event - relay to conversation
    this.eventBus.subscribe(
      'TypingIndicatorEvent',
      async (event: DomainEvent<any>) => {
        const typingEvent = event as TypingIndicatorEvent;
        const { conversationId, userId, isTyping, timestamp } =
          typingEvent.eventData;

        this.messagingGateway.server
          .to(conversationId)
          .emit('typing_indicator', {
            conversationId,
            userId,
            isTyping,
            timestamp,
            eventType: 'typing_indicator',
          });

        this.logger.debug(
          `Relayed typing indicator: ${userId} in ${conversationId} - ${isTyping}`,
        );
      },
    );
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

        // Notify client
        this.messagingGateway.server
          .to(this.getUserSocketRoom(clientId))
          .emit('appointment_notification', {
            ...appointmentNotification,
            message:
              'Your appointment has been booked and is pending confirmation.',
          });

        // Notify therapist
        this.messagingGateway.server
          .to(this.getUserSocketRoom(therapistId))
          .emit('appointment_notification', {
            ...appointmentNotification,
            message:
              'You have a new appointment request that requires confirmation.',
          });

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

        // Notify client
        this.messagingGateway.server
          .to(this.getUserSocketRoom(clientId))
          .emit('appointment_notification', {
            ...cancellationNotification,
            message: clientMessage,
          });

        // Notify therapist
        this.messagingGateway.server
          .to(this.getUserSocketRoom(therapistId))
          .emit('appointment_notification', {
            ...cancellationNotification,
            message: therapistMessage,
          });

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

        // Send welcome notification to the new user
        this.messagingGateway.server
          .to(this.getUserSocketRoom(userId))
          .emit('welcome_notification', {
            userId,
            firstName,
            lastName,
            role,
            eventType: 'user_registered',
            message: `Welcome to Mentara, ${firstName}! Your account has been successfully created.`,
            timestamp: new Date(),
          });

        this.logger.debug(`Sent welcome notification to new user: ${userId}`);
      },
    );

    // User profile updated event - notify relevant connections
    this.eventBus.subscribe(
      'UserProfileUpdatedEvent',
      async (event: DomainEvent<any>) => {
        const profileEvent = event as UserProfileUpdatedEvent;
        const { userId, updatedFields, newValues } = profileEvent.eventData;

        // Notify conversations where profile info might be displayed
        this.messagingGateway.server.emit('user_profile_updated', {
          userId,
          updatedFields,
          profileData: newValues,
          eventType: 'user_profile_updated',
          timestamp: new Date(),
        });

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

        // Broadcast to community room
        if (communityId) {
          this.messagingGateway.server
            .to(`community_${communityId}`)
            .emit('new_post', {
              postId,
              authorId: isAnonymous ? null : authorId, // Hide author if anonymous
              communityId,
              title,
              content,
              tags,
              postType,
              isAnonymous,
              eventType: 'post_created',
              timestamp: new Date(),
            });
        }

        this.logger.debug(`Broadcasted post created event: ${postId}`);
      },
    );

    // Comment added event - notify post author and participants
    this.eventBus.subscribe(
      'CommentAddedEvent',
      async (event: DomainEvent<any>) => {
        const commentEvent = event as CommentAddedEvent;
        const { commentId, postId, authorId, content } = commentEvent.eventData;

        // Broadcast to post room
        this.messagingGateway.server
          .to(`post_${postId}`)
          .emit('post_interaction', {
            commentId,
            postId,
            authorId,
            content,
            interactionType: 'comment',
            eventType: 'comment_created',
            message: 'Someone commented on your post',
            timestamp: new Date(),
          });

        // Broadcast to post viewers
        this.messagingGateway.server.to(`post_${postId}`).emit('new_comment', {
          commentId,
          postId,
          authorId,
          content,
          eventType: 'comment_created',
          timestamp: new Date(),
        });

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
    this.messagingGateway.server.in(socketId).socketsJoin(userRoom);
    this.logger.debug(
      `User ${userId} subscribed to personal room: ${userRoom}`,
    );
  }

  /**
   * Unsubscribe users from their personal notification rooms
   */
  unsubscribeUserFromPersonalRoom(userId: string, socketId: string): void {
    const userRoom = this.getUserSocketRoom(userId);
    this.messagingGateway.server.in(socketId).socketsLeave(userRoom);
    this.logger.debug(
      `User ${userId} unsubscribed from personal room: ${userRoom}`,
    );
  }

  /**
   * Subscribe user to community room for post notifications
   */
  subscribeUserToCommunityRoom(
    userId: string,
    communityId: string,
    socketId: string,
  ): void {
    const communityRoom = `community_${communityId}`;
    this.messagingGateway.server.in(socketId).socketsJoin(communityRoom);
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
    this.messagingGateway.server.in(socketId).socketsJoin(postRoom);
    this.logger.debug(`User ${userId} subscribed to post room: ${postRoom}`);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    eventSubscriptions: number;
  } {
    return {
      totalConnections: this.messagingGateway.server.sockets.sockets.size,
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
    this.messagingGateway.server.emit('system_announcement', {
      message,
      priority,
      eventType: 'system_announcement',
      timestamp: new Date(),
    });

    this.logger.log(
      `Broadcasted system announcement: ${message} (priority: ${priority})`,
    );
  }

  /**
   * Send targeted notification to specific users
   */
  sendTargetedNotification(userIds: string[], notification: any): void {
    for (const userId of userIds) {
      this.messagingGateway.server
        .to(this.getUserSocketRoom(userId))
        .emit('targeted_notification', {
          ...notification,
          eventType: 'targeted_notification',
          timestamp: new Date(),
        });
    }

    this.logger.debug(`Sent targeted notification to ${userIds.length} users`);
  }
}
