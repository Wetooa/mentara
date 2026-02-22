import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketEventService } from './websocket-event.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { MessagingGateway } from '../messaging.gateway';
import { Logger } from '@nestjs/common';
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

describe('WebSocketEventService', () => {
  let service: WebSocketEventService;
  let eventBusService: jest.Mocked<EventBusService>;
  let messagingGateway: jest.Mocked<MessagingGateway>;
  let mockServer: any;
  let mockSocket: any;

  beforeEach(async () => {
    // Mock socket.io server
    mockSocket = {
      socketsJoin: jest.fn(),
      socketsLeave: jest.fn(),
    };

    mockServer = {
      to: jest.fn(() => ({ emit: jest.fn() })),
      in: jest.fn(() => mockSocket),
      emit: jest.fn(),
      sockets: {
        sockets: new Map([
          ['socket1', {}],
          ['socket2', {}],
          ['socket3', {}],
        ]),
      },
    };

    const mockEventBus = {
      subscribe: jest.fn(),
      emit: jest.fn(),
      getEventStats: jest.fn(() => ({ totalListeners: 10 })),
    };

    const mockMessagingGateway = {
      server: mockServer,
      broadcastMessage: jest.fn(),
      broadcastReadReceipt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketEventService,
        {
          provide: EventBusService,
          useValue: mockEventBus,
        },
        {
          provide: MessagingGateway,
          useValue: mockMessagingGateway,
        },
      ],
    }).compile();

    service = module.get<WebSocketEventService>(WebSocketEventService);
    eventBusService = module.get(EventBusService);
    messagingGateway = module.get(MessagingGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize event subscriptions', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      service.onModuleInit();

      expect(eventBusService.subscribe).toHaveBeenCalledTimes(10); // All event types
      expect(loggerSpy).toHaveBeenCalledWith(
        'WebSocket event handlers initialized successfully',
      );
    });

    it('should subscribe to all event types', async () => {
      service.onModuleInit();

      const eventTypes = [
        'MessageSentEvent',
        'MessageReadEvent',
        'ConversationCreatedEvent',
        'ParticipantJoinedEvent',
        'ParticipantLeftEvent',
        'TypingIndicatorEvent',
        'AppointmentBookedEvent',
        'AppointmentCancelledEvent',
        'UserRegisteredEvent',
        'UserProfileUpdatedEvent',
        'PostCreatedEvent',
        'CommentAddedEvent',
      ];

      eventTypes.forEach(eventType => {
        expect(eventBusService.subscribe).toHaveBeenCalledWith(
          eventType,
          expect.any(Function),
        );
      });
    });
  });

  describe('Messaging Events', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    describe('MessageSentEvent', () => {
      it('should broadcast message to conversation participants', async () => {
        const messageEvent = new MessageSentEvent({
          messageId: 'msg-123',
          conversationId: 'conv-123',
          senderId: 'user-123',
          content: 'Hello world',
          messageType: 'text',
          sentAt: new Date(),
          recipientIds: ['user-456', 'user-789'],
        });

        // Get the handler function
        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'MessageSentEvent',
        )[1];

        await handler(messageEvent);

        expect(messagingGateway.broadcastMessage).toHaveBeenCalledWith(
          'conv-123',
          {
            id: 'msg-123',
            conversationId: 'conv-123',
            senderId: 'user-123',
            content: 'Hello world',
            messageType: 'text',
            sentAt: messageEvent.eventData.sentAt,
            eventType: 'message_sent',
          },
        );

        expect(mockServer.to).toHaveBeenCalledWith('user_user-456');
        expect(mockServer.to).toHaveBeenCalledWith('user_user-789');
      });

      it('should send delivery confirmations to recipients', async () => {
        const messageEvent = new MessageSentEvent({
          messageId: 'msg-123',
          conversationId: 'conv-123',
          senderId: 'user-123',
          content: 'Hello world',
          messageType: 'text',
          sentAt: new Date(),
          recipientIds: ['user-456'],
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'MessageSentEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(messageEvent);

        expect(mockEmit).toHaveBeenCalledWith('message_delivered', {
          messageId: 'msg-123',
          conversationId: 'conv-123',
          deliveredAt: expect.any(Date),
          eventType: 'message_delivered',
        });
      });
    });

    describe('MessageReadEvent', () => {
      it('should broadcast read receipt', async () => {
        const readEvent = new MessageReadEvent({
          messageId: 'msg-123',
          conversationId: 'conv-123',
          readBy: 'user-456',
          readAt: new Date(),
          messagesSinceLastRead: 1,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'MessageReadEvent',
        )[1];

        await handler(readEvent);

        expect(messagingGateway.broadcastReadReceipt).toHaveBeenCalledWith(
          'conv-123',
          'msg-123',
          'user-456',
        );
      });
    });

    describe('ConversationCreatedEvent', () => {
      it('should notify all participants about new conversation', async () => {
        const conversationEvent = new ConversationCreatedEvent({
          conversationId: 'conv-123',
          createdBy: 'user-123',
          participantIds: ['user-123', 'user-456'],
          conversationType: 'direct',
          title: 'Test Conversation',
          isPrivate: true,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'ConversationCreatedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(conversationEvent);

        expect(mockServer.to).toHaveBeenCalledWith('user_user-123');
        expect(mockServer.to).toHaveBeenCalledWith('user_user-456');
        expect(mockEmit).toHaveBeenCalledWith('conversation_created', {
          conversationId: 'conv-123',
          createdBy: 'user-123',
          conversationType: 'direct',
          title: 'Test Conversation',
          participantIds: ['user-123', 'user-456'],
          eventType: 'conversation_created',
          timestamp: expect.any(Date),
        });
      });
    });

    describe('ParticipantJoinedEvent', () => {
      it('should notify conversation about new participant', async () => {
        const joinEvent = new ParticipantJoinedEvent({
          conversationId: 'conv-123',
          participantId: 'user-789',
          addedBy: 'user-123',
          joinedAt: new Date(),
          role: 'member',
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'ParticipantJoinedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(joinEvent);

        expect(mockServer.to).toHaveBeenCalledWith('conv-123');
        expect(mockEmit).toHaveBeenCalledWith('participant_joined', {
          conversationId: 'conv-123',
          participantId: 'user-789',
          addedBy: 'user-123',
          joinedAt: joinEvent.eventData.joinedAt,
          role: 'member',
          eventType: 'participant_joined',
        });
      });
    });

    describe('ParticipantLeftEvent', () => {
      it('should notify conversation about participant leaving', async () => {
        const leftEvent = new ParticipantLeftEvent({
          conversationId: 'conv-123',
          participantId: 'user-789',
          leftAt: new Date(),
          leftReason: 'User left voluntarily',
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'ParticipantLeftEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(leftEvent);

        expect(mockServer.to).toHaveBeenCalledWith('conv-123');
        expect(mockEmit).toHaveBeenCalledWith('participant_left', {
          conversationId: 'conv-123',
          participantId: 'user-789',
          leftAt: leftEvent.eventData.leftAt,
          leftReason: 'User left voluntarily',
          eventType: 'participant_left',
        });
      });
    });

    describe('TypingIndicatorEvent', () => {
      it('should relay typing indicator to conversation', async () => {
        const typingEvent = new TypingIndicatorEvent({
          conversationId: 'conv-123',
          userId: 'user-456',
          isTyping: true,
          timestamp: new Date(),
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'TypingIndicatorEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(typingEvent);

        expect(mockServer.to).toHaveBeenCalledWith('conv-123');
        expect(mockEmit).toHaveBeenCalledWith('typing_indicator', {
          conversationId: 'conv-123',
          userId: 'user-456',
          isTyping: true,
          timestamp: typingEvent.eventData.timestamp,
          eventType: 'typing_indicator',
        });
      });
    });
  });

  describe('Booking Events', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    describe('AppointmentBookedEvent', () => {
      it('should notify both client and therapist about appointment booking', async () => {
        const appointmentEvent = new AppointmentBookedEvent({
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          startTime: new Date(),
          meetingType: 'video',
          duration: 60,
          title: 'Therapy Session',
          description: 'Regular therapy session',
          isInitialConsultation: false,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'AppointmentBookedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(appointmentEvent);

        expect(mockServer.to).toHaveBeenCalledWith('user_client-123');
        expect(mockServer.to).toHaveBeenCalledWith('user_therapist-123');
        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', {
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          startTime: appointmentEvent.eventData.startTime,
          meetingType: 'video',
          isInitialConsultation: false,
          eventType: 'appointment_booked',
          timestamp: expect.any(Date),
          message: expect.any(String),
        });
      });

      it('should send different messages to client and therapist', async () => {
        const appointmentEvent = new AppointmentBookedEvent({
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          startTime: new Date(),
          meetingType: 'video',
          duration: 60,
          title: 'Therapy Session',
          description: 'Regular therapy session',
          isInitialConsultation: false,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'AppointmentBookedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(appointmentEvent);

        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', 
          expect.objectContaining({
            message: 'Your appointment has been booked and is pending confirmation.',
          })
        );
        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', 
          expect.objectContaining({
            message: 'You have a new appointment request that requires confirmation.',
          })
        );
      });
    });

    describe('AppointmentCancelledEvent', () => {
      it('should notify both parties about appointment cancellation', async () => {
        const cancelEvent = new AppointmentCancelledEvent({
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          cancelledBy: 'client-123',
          cancellationReason: 'Personal emergency',
          originalStartTime: new Date(),
          cancelledAt: new Date(),
          cancellationNotice: 24,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'AppointmentCancelledEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(cancelEvent);

        expect(mockServer.to).toHaveBeenCalledWith('user_client-123');
        expect(mockServer.to).toHaveBeenCalledWith('user_therapist-123');
        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', {
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          cancelledBy: 'client-123',
          cancellationReason: 'Personal emergency',
          cancelledAt: cancelEvent.eventData.cancelledAt,
          eventType: 'appointment_cancelled',
          timestamp: expect.any(Date),
          message: expect.any(String),
        });
      });

      it('should send different messages based on who cancelled', async () => {
        const cancelEvent = new AppointmentCancelledEvent({
          appointmentId: 'appointment-123',
          clientId: 'client-123',
          therapistId: 'therapist-123',
          cancelledBy: 'therapist-123',
          cancellationReason: 'Schedule conflict',
          originalStartTime: new Date(),
          cancelledAt: new Date(),
          cancellationNotice: 24,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'AppointmentCancelledEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(cancelEvent);

        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', 
          expect.objectContaining({
            message: 'Your appointment has been cancelled by the therapist.',
          })
        );
        expect(mockEmit).toHaveBeenCalledWith('appointment_notification', 
          expect.objectContaining({
            message: 'You have cancelled the appointment.',
          })
        );
      });
    });
  });

  describe('User Events', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    describe('UserRegisteredEvent', () => {
      it('should send welcome notification to new user', async () => {
        const registrationEvent = new UserRegisteredEvent({
          userId: 'user-123',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          registrationMethod: 'email',
          emailVerified: true,
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'UserRegisteredEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(registrationEvent);

        expect(mockServer.to).toHaveBeenCalledWith('user_user-123');
        expect(mockEmit).toHaveBeenCalledWith('welcome_notification', {
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          eventType: 'user_registered',
          message: 'Welcome to Mentara, John! Your account has been successfully created.',
          timestamp: expect.any(Date),
        });
      });
    });

    describe('UserProfileUpdatedEvent', () => {
      it('should broadcast profile update to all connections', async () => {
        const profileEvent = new UserProfileUpdatedEvent({
          userId: 'user-123',
          updatedFields: ['firstName', 'lastName'],
          newValues: { firstName: 'Jane', lastName: 'Smith' },
          previousValues: { firstName: 'John', lastName: 'Doe' },
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'UserProfileUpdatedEvent',
        )[1];

        await handler(profileEvent);

        expect(mockServer.emit).toHaveBeenCalledWith('user_profile_updated', {
          userId: 'user-123',
          updatedFields: ['firstName', 'lastName'],
          profileData: { firstName: 'Jane', lastName: 'Smith' },
          eventType: 'user_profile_updated',
          timestamp: expect.any(Date),
        });
      });
    });
  });

  describe('Social Events', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    describe('PostCreatedEvent', () => {
      it('should broadcast new post to community room', async () => {
        const postEvent = new PostCreatedEvent({
          postId: 'post-123',
          authorId: 'user-123',
          communityId: 'community-123',
          title: 'New Post',
          content: 'This is a new post',
          tags: ['mental-health', 'support'],
          postType: 'discussion',
          isAnonymous: false,
          timestamp: new Date(),
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'PostCreatedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(postEvent);

        expect(mockServer.to).toHaveBeenCalledWith('community_community-123');
        expect(mockEmit).toHaveBeenCalledWith('new_post', {
          postId: 'post-123',
          authorId: 'user-123',
          communityId: 'community-123',
          title: 'New Post',
          content: 'This is a new post',
          tags: ['mental-health', 'support'],
          postType: 'discussion',
          isAnonymous: false,
          eventType: 'post_created',
          timestamp: expect.any(Date),
        });
      });

      it('should hide author ID for anonymous posts', async () => {
        const postEvent = new PostCreatedEvent({
          postId: 'post-123',
          authorId: 'user-123',
          communityId: 'community-123',
          title: 'Anonymous Post',
          content: 'This is an anonymous post',
          tags: ['support'],
          postType: 'discussion',
          isAnonymous: true,
          timestamp: new Date(),
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'PostCreatedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(postEvent);

        expect(mockEmit).toHaveBeenCalledWith('new_post', 
          expect.objectContaining({
            authorId: null,
            isAnonymous: true,
          })
        );
      });

      it('should not broadcast if no communityId', async () => {
        const postEvent = new PostCreatedEvent({
          postId: 'post-123',
          authorId: 'user-123',
          communityId: null,
          title: 'Private Post',
          content: 'This is a private post',
          tags: [],
          postType: 'discussion',
          isAnonymous: false,
          timestamp: new Date(),
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'PostCreatedEvent',
        )[1];

        await handler(postEvent);

        expect(mockServer.to).not.toHaveBeenCalled();
      });
    });

    describe('CommentAddedEvent', () => {
      it('should broadcast comment to post room', async () => {
        const commentEvent = new CommentAddedEvent({
          commentId: 'comment-123',
          postId: 'post-123',
          authorId: 'user-456',
          content: 'Great post!',
          parentCommentId: null,
          isAnonymous: false,
          timestamp: new Date(),
        });

        const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
          call => call[0] === 'CommentAddedEvent',
        )[1];

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        await handler(commentEvent);

        expect(mockServer.to).toHaveBeenCalledWith('post_post-123');
        expect(mockEmit).toHaveBeenCalledWith('post_interaction', {
          commentId: 'comment-123',
          postId: 'post-123',
          authorId: 'user-456',
          content: 'Great post!',
          interactionType: 'comment',
          eventType: 'comment_created',
          message: 'Someone commented on your post',
          timestamp: expect.any(Date),
        });
        expect(mockEmit).toHaveBeenCalledWith('new_comment', {
          commentId: 'comment-123',
          postId: 'post-123',
          authorId: 'user-456',
          content: 'Great post!',
          eventType: 'comment_created',
          timestamp: expect.any(Date),
        });
      });
    });
  });

  describe('Room Management', () => {
    describe('subscribeUserToPersonalRoom', () => {
      it('should subscribe user to personal room', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        
        service.subscribeUserToPersonalRoom('user-123', 'socket-123');

        expect(mockServer.in).toHaveBeenCalledWith('socket-123');
        expect(mockSocket.socketsJoin).toHaveBeenCalledWith('user_user-123');
        expect(loggerSpy).toHaveBeenCalledWith(
          'User user-123 subscribed to personal room: user_user-123',
        );
      });
    });

    describe('unsubscribeUserFromPersonalRoom', () => {
      it('should unsubscribe user from personal room', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        
        service.unsubscribeUserFromPersonalRoom('user-123', 'socket-123');

        expect(mockServer.in).toHaveBeenCalledWith('socket-123');
        expect(mockSocket.socketsLeave).toHaveBeenCalledWith('user_user-123');
        expect(loggerSpy).toHaveBeenCalledWith(
          'User user-123 unsubscribed from personal room: user_user-123',
        );
      });
    });

    describe('subscribeUserToCommunityRoom', () => {
      it('should subscribe user to community room', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        
        service.subscribeUserToCommunityRoom('user-123', 'community-456', 'socket-123');

        expect(mockServer.in).toHaveBeenCalledWith('socket-123');
        expect(mockSocket.socketsJoin).toHaveBeenCalledWith('community_community-456');
        expect(loggerSpy).toHaveBeenCalledWith(
          'User user-123 subscribed to community room: community_community-456',
        );
      });
    });

    describe('subscribeUserToPostRoom', () => {
      it('should subscribe user to post room', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        
        service.subscribeUserToPostRoom('user-123', 'post-456', 'socket-123');

        expect(mockServer.in).toHaveBeenCalledWith('socket-123');
        expect(mockSocket.socketsJoin).toHaveBeenCalledWith('post_post-456');
        expect(loggerSpy).toHaveBeenCalledWith(
          'User user-123 subscribed to post room: post_post-456',
        );
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getConnectionStats', () => {
      it('should return connection statistics', () => {
        const stats = service.getConnectionStats();

        expect(stats).toEqual({
          totalConnections: 3,
          eventSubscriptions: 10,
        });
      });
    });

    describe('broadcastSystemAnnouncement', () => {
      it('should broadcast system announcement with default priority', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'log');
        
        service.broadcastSystemAnnouncement('System maintenance scheduled');

        expect(mockServer.emit).toHaveBeenCalledWith('system_announcement', {
          message: 'System maintenance scheduled',
          priority: 'medium',
          eventType: 'system_announcement',
          timestamp: expect.any(Date),
        });
        expect(loggerSpy).toHaveBeenCalledWith(
          'Broadcasted system announcement: System maintenance scheduled (priority: medium)',
        );
      });

      it('should broadcast system announcement with custom priority', () => {
        service.broadcastSystemAnnouncement('Critical security update', 'high');

        expect(mockServer.emit).toHaveBeenCalledWith('system_announcement', {
          message: 'Critical security update',
          priority: 'high',
          eventType: 'system_announcement',
          timestamp: expect.any(Date),
        });
      });
    });

    describe('sendTargetedNotification', () => {
      it('should send notification to specific users', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        const userIds = ['user-123', 'user-456'];
        const notification = {
          title: 'Important Update',
          message: 'Please check your settings',
          priority: 'high',
        };

        const mockEmit = jest.fn();
        mockServer.to.mockReturnValue({ emit: mockEmit });

        service.sendTargetedNotification(userIds, notification);

        expect(mockServer.to).toHaveBeenCalledWith('user_user-123');
        expect(mockServer.to).toHaveBeenCalledWith('user_user-456');
        expect(mockEmit).toHaveBeenCalledWith('targeted_notification', {
          title: 'Important Update',
          message: 'Please check your settings',
          priority: 'high',
          eventType: 'targeted_notification',
          timestamp: expect.any(Date),
        });
        expect(loggerSpy).toHaveBeenCalledWith(
          'Sent targeted notification to 2 users',
        );
      });

      it('should handle empty user list', () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'debug');
        
        service.sendTargetedNotification([], { message: 'test' });

        expect(mockServer.to).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
          'Sent targeted notification to 0 users',
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle event handler errors gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');
      
      // Mock broadcastMessage to throw an error
      messagingGateway.broadcastMessage.mockImplementation(() => {
        throw new Error('WebSocket connection failed');
      });

      service.onModuleInit();

      const messageEvent = new MessageSentEvent({
        messageId: 'msg-123',
        conversationId: 'conv-123',
        senderId: 'user-123',
        content: 'Hello world',
        messageType: 'text',
        sentAt: new Date(),
        recipientIds: ['user-456'],
      });

      const handler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
        call => call[0] === 'MessageSentEvent',
      )[1];

      // Should not throw error
      await expect(handler(messageEvent)).rejects.toThrow('WebSocket connection failed');
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple events simultaneously', async () => {
      service.onModuleInit();

      const messageEvent = new MessageSentEvent({
        messageId: 'msg-123',
        conversationId: 'conv-123',
        senderId: 'user-123',
        content: 'Hello world',
        messageType: 'text',
        sentAt: new Date(),
        recipientIds: ['user-456'],
      });

      const appointmentEvent = new AppointmentBookedEvent({
        appointmentId: 'appointment-123',
        clientId: 'client-123',
        therapistId: 'therapist-123',
        startTime: new Date(),
        meetingType: 'video',
        duration: 60,
        title: 'Therapy Session',
        description: 'Regular therapy session',
        isInitialConsultation: false,
      });

      const messageHandler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
        call => call[0] === 'MessageSentEvent',
      )[1];

      const appointmentHandler = (eventBusService.subscribe as jest.Mock).mock.calls.find(
        call => call[0] === 'AppointmentBookedEvent',
      )[1];

      const mockEmit = jest.fn();
      mockServer.to.mockReturnValue({ emit: mockEmit });

      await Promise.all([
        messageHandler(messageEvent),
        appointmentHandler(appointmentEvent),
      ]);

      expect(messagingGateway.broadcastMessage).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith('message_delivered', expect.any(Object));
      expect(mockEmit).toHaveBeenCalledWith('appointment_notification', expect.any(Object));
    });

    it('should maintain proper room isolation', () => {
      service.subscribeUserToPersonalRoom('user-123', 'socket-123');
      service.subscribeUserToCommunityRoom('user-123', 'community-456', 'socket-123');
      service.subscribeUserToPostRoom('user-123', 'post-789', 'socket-123');

      expect(mockSocket.socketsJoin).toHaveBeenCalledWith('user_user-123');
      expect(mockSocket.socketsJoin).toHaveBeenCalledWith('community_community-456');
      expect(mockSocket.socketsJoin).toHaveBeenCalledWith('post_post-789');
      expect(mockSocket.socketsJoin).toHaveBeenCalledTimes(3);
    });
  });
});