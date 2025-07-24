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
        try {
          console.log('📡 [WEBSOCKET EVENT SERVICE] MessageSentEvent received from event bus');
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

          console.log('📨 [MESSAGE EVENT DATA]', {
            conversationId,
            messageId,
            senderId,
            content: content?.substring(0, 50) + (content?.length > 50 ? '...' : ''),
            messageType,
            recipientCount: recipientIds?.length || 0,
            recipientIds,
            recipientIdsType: typeof recipientIds,
            isArray: Array.isArray(recipientIds),
          });

          this.logger.debug('MessageSentEvent received:', {
            conversationId,
            messageId,
            recipientIds,
            recipientIdsType: typeof recipientIds,
            isArray: Array.isArray(recipientIds),
          });

          // Broadcast message to conversation participants via WebSocket
          // Frontend expects MessageEventData format with 'message' property
          console.log('🚨 [DEBUG] About to call broadcastMessage');
          console.log('🚨 [DEBUG] Gateway exists:', !!this.messagingGateway);
          
          this.messagingGateway.broadcastMessage(conversationId, {
            message: {
              id: messageId,
              conversationId,
              senderId,
              content,
              messageType,
              sentAt,
              createdAt: sentAt,
              updatedAt: sentAt,
              isRead: false,
              isEdited: false,
              isDeleted: false,
              replyToId: messageEvent.eventData.replyToMessageId || null,
              attachmentUrls: messageEvent.eventData.fileAttachments || [],
              attachmentNames: [],
              attachmentSizes: [],
              editedAt: null,
              sender: null, // Will be populated by client
              replyTo: null,
              reactions: [],
              readReceipts: [],
            },
            eventType: 'message_sent',
          });
          
          console.log('🚨 [DEBUG] broadcastMessage call completed');

          // Send delivery confirmations with safe iteration
          const safeRecipientIds = this.ensureArray(recipientIds, 'recipientIds');
          for (const recipientId of safeRecipientIds) {
            if (recipientId && typeof recipientId === 'string') {
              this.messagingGateway.server
                .to(this.getUserSocketRoom(recipientId))
                .emit('message_delivered', {
                  messageId,
                  conversationId,
                  deliveredAt: new Date(),
                  eventType: 'message_delivered',
                });
            } else {
              this.logger.warn(`Invalid recipientId in MessageSentEvent: ${recipientId}`, {
                messageId,
                conversationId,
                recipientId,
                type: typeof recipientId,
              });
            }
          }

          this.logger.debug(`Broadcasted message sent event: ${messageId} to ${safeRecipientIds.length} recipients`);
        } catch (error) {
          this.logger.error('Error handling MessageSentEvent:', {
            error: error.message,
            stack: error.stack,
            eventData: event.eventData,
          });
        }
      },
    );

    // Message read event - broadcast read receipt
    this.eventBus.subscribe(
      'MessageReadEvent',
      async (event: DomainEvent<any>) => {
        try {
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
        } catch (error) {
          this.logger.error('Error handling MessageReadEvent:', {
            error: error.message,
            eventData: event.eventData,
          });
        }
      },
    );

    // Conversation created event - notify participants
    this.eventBus.subscribe(
      'ConversationCreatedEvent',
      async (event: DomainEvent<any>) => {
        try {
          const conversationEvent = event as ConversationCreatedEvent;
          const {
            conversationId,
            createdBy,
            participantIds,
            conversationType,
            title,
          } = conversationEvent.eventData;

          // Enhanced debugging for the problematic participantIds
          this.logger.debug('ConversationCreatedEvent received:', {
            conversationId,
            createdBy,
            participantIds,
            participantIdsType: typeof participantIds,
            isArray: Array.isArray(participantIds),
            participantIdsLength: participantIds?.length,
            fullEventData: event.eventData,
          });

          // Ensure participantIds is always an array with safe iteration
          const safeParticipantIds = this.ensureArray(participantIds, 'participantIds');

          if (safeParticipantIds.length === 0) {
            this.logger.warn('ConversationCreatedEvent has no valid participants:', {
              conversationId,
              originalParticipantIds: participantIds,
              eventData: event.eventData,
            });
            return;
          }

          // Notify all participants about new conversation
          for (const participantId of safeParticipantIds) {
            if (participantId && typeof participantId === 'string') {
              this.messagingGateway.server
                .to(this.getUserSocketRoom(participantId))
                .emit('conversation_created', {
                  conversationId,
                  createdBy,
                  conversationType,
                  title,
                  participantIds: safeParticipantIds, // Send normalized array
                  eventType: 'conversation_created',
                  timestamp: new Date(),
                });
            } else {
              this.logger.warn(`Invalid participantId in ConversationCreatedEvent: ${participantId}`, {
                conversationId,
                participantId,
                type: typeof participantId,
                originalParticipantIds: participantIds,
              });
            }
          }

          this.logger.debug(
            `Broadcasted conversation created event: ${conversationId} to ${safeParticipantIds.length} participants`,
          );
        } catch (error) {
          this.logger.error('Error handling ConversationCreatedEvent:', {
            error: error.message,
            stack: error.stack,
            eventData: event.eventData,
          });
        }
      },
    );

    // Participant joined event - notify conversation
    this.eventBus.subscribe(
      'ParticipantJoinedEvent',
      async (event: DomainEvent<any>) => {
        try {
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
        } catch (error) {
          this.logger.error('Error handling ParticipantJoinedEvent:', {
            error: error.message,
            eventData: event.eventData,
          });
        }
      },
    );

    // Participant left event - notify conversation
    this.eventBus.subscribe(
      'ParticipantLeftEvent',
      async (event: DomainEvent<any>) => {
        try {
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
        } catch (error) {
          this.logger.error('Error handling ParticipantLeftEvent:', {
            error: error.message,
            eventData: event.eventData,
          });
        }
      },
    );

    // Typing indicator event - relay to conversation
    this.eventBus.subscribe(
      'TypingIndicatorEvent',
      async (event: DomainEvent<any>) => {
        try {
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
        } catch (error) {
          this.logger.error('Error handling TypingIndicatorEvent:', {
            error: error.message,
            eventData: event.eventData,
          });
        }
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
   * Safely ensure a value is an array for iteration
   * Prevents "not iterable" errors by normalizing input to array format
   */
  private ensureArray(value: any, fieldName: string = 'value'): string[] {
    try {
      // Handle null or undefined
      if (value == null) {
        this.logger.warn(`${fieldName} is null/undefined, returning empty array`);
        return [];
      }

      // Already an array - validate it's an array of strings
      if (Array.isArray(value)) {
        const validItems = value.filter(item => 
          item != null && typeof item === 'string' && item.trim().length > 0
        );
        
        if (validItems.length !== value.length) {
          this.logger.warn(`${fieldName} array contains invalid items:`, {
            original: value,
            filtered: validItems,
            removed: value.length - validItems.length,
          });
        }
        
        return validItems;
      }

      // Single string value - convert to array
      if (typeof value === 'string' && value.trim().length > 0) {
        this.logger.warn(`${fieldName} is a single string, converting to array:`, value);
        return [value.trim()];
      }

      // Object - try to extract meaningful values
      if (typeof value === 'object') {
        this.logger.warn(`${fieldName} is an object, attempting to extract values:`, value);
        
        // Try common object patterns
        if (value.participantIds && Array.isArray(value.participantIds)) {
          return this.ensureArray(value.participantIds, `${fieldName}.participantIds`);
        }
        
        if (value.ids && Array.isArray(value.ids)) {
          return this.ensureArray(value.ids, `${fieldName}.ids`);
        }
        
        // Try Object.values if it looks like a map
        const objectValues = Object.values(value);
        if (objectValues.length > 0 && objectValues.every(v => typeof v === 'string')) {
          this.logger.warn(`${fieldName} object converted using Object.values:`, objectValues);
          return objectValues as string[];
        }
      }

      // Fallback for unexpected types
      this.logger.error(`${fieldName} has unexpected type, returning empty array:`, {
        value,
        type: typeof value,
        constructor: value?.constructor?.name,
      });
      
      return [];
    } catch (error) {
      this.logger.error(`Error in ensureArray for ${fieldName}:`, {
        error: error.message,
        value,
        type: typeof value,
      });
      return [];
    }
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
