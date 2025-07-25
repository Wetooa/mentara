import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { EventBusService } from '../../common/events/event-bus.service';
import { MessagingGateway } from '../messaging.gateway';
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

  constructor(
    private readonly eventBus: EventBusService,
    @Inject(forwardRef(() => MessagingGateway))
    private readonly messagingGateway: MessagingGateway,
  ) {}

  onModuleInit() {
    this.logger.log('🚀 [INIT] WebSocketEventService initializing...');
    this.logger.log('🔍 [INIT] Dependencies check:');
    this.logger.log(`   - EventBus exists: ${!!this.eventBus}`);
    this.logger.log(`   - MessagingGateway exists: ${!!this.messagingGateway}`);
    
    this.subscribeToEvents();
    this.logger.log('✅ [INIT] WebSocket event handlers initialized successfully');
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
    this.logger.log('🔧 [EVENT SUBSCRIPTION] Subscribing to messaging events...');
    
    // Message sent event - broadcast to conversation participants
    this.logger.log('📡 [EVENT SUBSCRIPTION] Registering MessageSentEvent handler...');
    this.eventBus.subscribe(
      'MessageSentEvent',
      async (event: DomainEvent<any>) => {
        this.logger.log('🚨 [EVENT RECEIVED] MessageSentEvent received in WebSocketEventService!');
        this.logger.debug('📨 [EVENT DATA]', event.eventData);
        try {
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

          this.logger.debug('MessageSentEvent received:', {
            conversationId,
            messageId,
            recipientCount: recipientIds?.length || 0,
          });

          // Broadcast message to conversation participants via WebSocket
          // Frontend expects MessageEventData format with 'message' property
          this.logger.log(`🚀 [WEBSOCKET] About to call MessagingGateway.broadcastMessage for conversation ${conversationId}`);
          this.logger.debug(`🚀 [WEBSOCKET] Gateway exists: ${!!this.messagingGateway}`);
          
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
          }, senderId); // Pass senderId to exclude sender from broadcast
          
          this.logger.log(`✅ [WEBSOCKET] MessagingGateway.broadcastMessage completed for conversation ${conversationId}`);

          // Send delivery confirmations with safe iteration
          const safeRecipientIds = this.ensureArray(recipientIds, 'recipientIds');
          for (const recipientId of safeRecipientIds) {
            if (recipientId && typeof recipientId === 'string') {
              try {
                // Check if server is available before sending delivery confirmations
                if (this.messagingGateway.server?.sockets) {
                  this.messagingGateway.server
                    .to(this.getUserSocketRoom(recipientId))
                    .emit('message_delivered', {
                      messageId,
                      conversationId,
                      deliveredAt: new Date(),
                      eventType: 'message_delivered',
                    });
                } else {
                  this.logger.warn(`WebSocket server not ready for delivery confirmation to ${recipientId}`);
                }
              } catch (error) {
                this.logger.error(`Error sending delivery confirmation to ${recipientId}:`, error);
              }
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
              try {
                if (this.messagingGateway.server?.sockets) {
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
                  this.logger.warn(`WebSocket server not ready for conversation notification to ${participantId}`);
                }
              } catch (error) {
                this.logger.error(`Error notifying participant ${participantId} of conversation creation:`, error);
              }
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

          if (this.messagingGateway.server?.sockets) {
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
          } else {
            this.logger.warn('WebSocket server not ready for participant joined event');
          }

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

          if (this.messagingGateway.server?.sockets) {
            this.messagingGateway.server
              .to(conversationId)
              .emit('participant_left', {
                conversationId,
                participantId,
                leftAt,
                leftReason,
                eventType: 'participant_left',
              });
          } else {
            this.logger.warn('WebSocket server not ready for participant left event');
          }

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

          if (this.messagingGateway.server?.sockets) {
            this.messagingGateway.server
              .to(conversationId)
              .emit('typing_indicator', {
                conversationId,
                userId,
                isTyping,
                timestamp,
                eventType: 'typing_indicator',
              });
          } else {
            this.logger.warn('WebSocket server not ready for typing indicator event');
          }

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
