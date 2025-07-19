"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReactionSchema = exports.SearchMessagesResponseSchema = exports.BlockedUserSchema = exports.MessagesListParamsSchema = exports.MessageNotificationPreferencesSchema = exports.MessageAnalyticsSchema = exports.ConversationListParamsSchema = exports.MessageSearchResultSchema = exports.BackendConversationSchema = exports.ConversationParticipantSchema = exports.WorksheetCompletedEventSchema = exports.WorksheetAssignedEventSchema = exports.MeetingEndedEventSchema = exports.MeetingStartedEventSchema = exports.NotificationDeletedEventSchema = exports.NotificationUpdatedEventSchema = exports.NotificationCreatedEventSchema = exports.MessageReactionEventSchema = exports.MessageDeletedEventSchema = exports.MessageUpdatedEventSchema = exports.MessageSentEventSchema = exports.TypingIndicatorDtoSchema = exports.LeaveConversationDtoSchema = exports.JoinConversationDtoSchema = exports.SearchMessagesDtoSchema = exports.BlockUserDtoSchema = exports.AddReactionDtoSchema = exports.UpdateMessageDtoSchema = exports.SendMessageDtoSchema = exports.CreateConversationDtoSchema = exports.MessagesStateSchema = exports.MessageGroupSchema = exports.ConversationSchema = exports.ContactSchema = exports.BackendMessageSchema = exports.MessageSchema = exports.ReadReceiptSchema = exports.ReactionSchema = exports.AttachmentSchema = exports.ConversationTypeSchema = exports.MessageTypeSchema = exports.MessageStatusSchema = exports.UserStatusSchema = void 0;
const zod_1 = require("zod");
// User Status Schema
exports.UserStatusSchema = zod_1.z.enum([
    'online',
    'offline',
    'away'
]);
// Message Status Schema
exports.MessageStatusSchema = zod_1.z.enum([
    'sent',
    'delivered',
    'read'
]);
// Message Type Schema (from Prisma enum)
exports.MessageTypeSchema = zod_1.z.enum([
    'TEXT',
    'IMAGE',
    'AUDIO',
    'VIDEO',
    'SYSTEM'
]);
// Conversation Type Schema (from Prisma enum)
exports.ConversationTypeSchema = zod_1.z.enum([
    'DIRECT',
    'GROUP',
    'SESSION',
    'SUPPORT'
]);
// Attachment Schema
exports.AttachmentSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Attachment ID is required'),
    type: zod_1.z.enum(['image', 'document', 'audio', 'video']),
    url: zod_1.z.string().url('Invalid attachment URL'),
    name: zod_1.z.string().min(1, 'Attachment name is required'),
    size: zod_1.z.number().min(0, 'File size must be positive').optional(),
    previewUrl: zod_1.z.string().url().optional()
});
// Reaction Schema
exports.ReactionSchema = zod_1.z.object({
    emoji: zod_1.z.string().min(1, 'Emoji is required'),
    count: zod_1.z.number().min(1, 'Reaction count must be at least 1'),
    users: zod_1.z.array(zod_1.z.string().min(1)).min(1, 'At least one user must have reacted')
});
// Read Receipt Schema
exports.ReadReceiptSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    readAt: zod_1.z.string().datetime('Invalid read timestamp')
});
// Message Schema (Frontend format)
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Message ID is required'),
    sender: zod_1.z.enum(['me', 'them']),
    text: zod_1.z.string().min(1, 'Message text is required'),
    time: zod_1.z.string().min(1, 'Message time is required'),
    status: exports.MessageStatusSchema.optional(),
    attachments: zod_1.z.array(exports.AttachmentSchema).optional(),
    isDeleted: zod_1.z.boolean().optional().default(false),
    reactions: zod_1.z.array(exports.ReactionSchema).optional(),
    replyTo: zod_1.z.string().optional() // ID of the message being replied to
});
// Backend Message Schema
exports.BackendMessageSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Message ID is required'),
    senderId: zod_1.z.string().min(1, 'Sender ID is required'),
    content: zod_1.z.string().min(1, 'Message content is required'),
    createdAt: zod_1.z.string().datetime('Invalid creation timestamp'),
    isRead: zod_1.z.boolean().default(false),
    messageType: exports.MessageTypeSchema.default('TEXT'),
    reactions: zod_1.z.array(zod_1.z.object({
        emoji: zod_1.z.string().min(1),
        userId: zod_1.z.string().min(1),
        count: zod_1.z.number().min(1)
    })).optional(),
    attachment: zod_1.z.object({
        url: zod_1.z.string().url(),
        name: zod_1.z.string().min(1),
        size: zod_1.z.number().min(0)
    }).optional(),
    attachmentUrl: zod_1.z.string().url().optional(),
    attachmentName: zod_1.z.string().optional(),
    attachmentSize: zod_1.z.number().min(0).optional(),
    replyToId: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().optional().default(false),
    readReceipts: zod_1.z.array(exports.ReadReceiptSchema).optional()
});
// Contact Schema
exports.ContactSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Contact ID is required'),
    name: zod_1.z.string().min(1, 'Contact name is required'),
    status: exports.UserStatusSchema,
    lastMessage: zod_1.z.string().default(''),
    time: zod_1.z.string().min(1, 'Last message time is required'),
    unread: zod_1.z.number().min(0, 'Unread count cannot be negative').default(0),
    avatar: zod_1.z.string().url().optional(),
    isTyping: zod_1.z.boolean().optional().default(false)
});
// Conversation Schema
exports.ConversationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Conversation ID is required'),
    contactId: zod_1.z.string().min(1, 'Contact ID is required'),
    messages: zod_1.z.array(exports.MessageSchema),
    lastReadMessageId: zod_1.z.string().optional()
});
// Message Group Schema (for grouping messages by date)
exports.MessageGroupSchema = zod_1.z.object({
    date: zod_1.z.string().min(1, 'Date is required'),
    messages: zod_1.z.array(exports.MessageSchema).min(1, 'At least one message is required')
});
// Messages State Schema
exports.MessagesStateSchema = zod_1.z.object({
    contacts: zod_1.z.array(exports.ContactSchema),
    conversations: zod_1.z.array(exports.ConversationSchema),
    selectedContactId: zod_1.z.string().nullable(),
    isLoadingMessages: zod_1.z.boolean().default(false),
    error: zod_1.z.string().nullable()
});
// Messaging DTOs (Backend)
exports.CreateConversationDtoSchema = zod_1.z.object({
    participantIds: zod_1.z.array(zod_1.z.string().uuid('Invalid UUID format')).min(1, 'At least one participant is required'),
    type: exports.ConversationTypeSchema.optional().default('DIRECT'),
    title: zod_1.z.string().min(1, 'Title is required').optional()
});
exports.SendMessageDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
    messageType: exports.MessageTypeSchema.optional().default('TEXT'),
    replyToId: zod_1.z.string().uuid().optional(),
    attachmentUrl: zod_1.z.string().url().optional(),
    attachmentName: zod_1.z.string().optional(),
    attachmentSize: zod_1.z.number().min(0).optional()
}).refine((data) => {
    // If attachmentUrl is provided, attachmentName should also be provided
    if (data.attachmentUrl && !data.attachmentName) {
        return false;
    }
    return true;
}, {
    message: 'Attachment name is required when attachment URL is provided',
    path: ['attachmentName']
});
exports.UpdateMessageDtoSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Message content is required').max(5000, 'Message too long')
});
exports.AddReactionDtoSchema = zod_1.z.object({
    emoji: zod_1.z.string().min(1, 'Emoji is required').max(10, 'Emoji too long')
});
exports.BlockUserDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    reason: zod_1.z.string().max(500, 'Reason too long').optional()
});
exports.SearchMessagesDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required').max(100, 'Query too long'),
    conversationId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: zod_1.z.string().regex(/^\d+$/, 'Limit must be a number').optional()
});
// WebSocket DTOs
exports.JoinConversationDtoSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format')
});
exports.LeaveConversationDtoSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format')
});
exports.TypingIndicatorDtoSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format'),
    isTyping: zod_1.z.boolean().optional().default(true)
});
// Real-time WebSocket Event Schemas
exports.MessageSentEventSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format'),
    message: exports.BackendMessageSchema
});
exports.MessageUpdatedEventSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format'),
    messageId: zod_1.z.string().uuid('Invalid message ID format'),
    message: exports.BackendMessageSchema
});
exports.MessageDeletedEventSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format'),
    messageId: zod_1.z.string().uuid('Invalid message ID format')
});
exports.MessageReactionEventSchema = zod_1.z.object({
    conversationId: zod_1.z.string().uuid('Invalid conversation ID format'),
    messageId: zod_1.z.string().uuid('Invalid message ID format'),
    emoji: zod_1.z.string().min(1, 'Emoji is required'),
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    action: zod_1.z.enum(['add', 'remove'])
});
exports.NotificationCreatedEventSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid('Invalid notification ID format'),
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    title: zod_1.z.string().min(1, 'Notification title is required'),
    message: zod_1.z.string().min(1, 'Notification message is required'),
    type: zod_1.z.string().min(1, 'Notification type is required'),
    data: zod_1.z.record(zod_1.z.unknown()).optional()
});
exports.NotificationUpdatedEventSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid('Invalid notification ID format'),
    isRead: zod_1.z.boolean()
});
exports.NotificationDeletedEventSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid('Invalid notification ID format')
});
exports.MeetingStartedEventSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid('Invalid meeting ID format'),
    participants: zod_1.z.array(zod_1.z.string().uuid()),
    meetingUrl: zod_1.z.string().url('Invalid meeting URL').optional()
});
exports.MeetingEndedEventSchema = zod_1.z.object({
    meetingId: zod_1.z.string().uuid('Invalid meeting ID format'),
    duration: zod_1.z.number().positive('Meeting duration must be positive').optional()
});
exports.WorksheetAssignedEventSchema = zod_1.z.object({
    worksheetId: zod_1.z.string().uuid('Invalid worksheet ID format'),
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format'),
    title: zod_1.z.string().min(1, 'Worksheet title is required'),
    dueDate: zod_1.z.string().datetime('Invalid due date').optional()
});
exports.WorksheetCompletedEventSchema = zod_1.z.object({
    worksheetId: zod_1.z.string().uuid('Invalid worksheet ID format'),
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    completedAt: zod_1.z.string().datetime('Invalid completion timestamp')
});
// Conversation Participant Schema
exports.ConversationParticipantSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    conversationId: zod_1.z.string().min(1),
    joinedAt: zod_1.z.string().datetime(),
    leftAt: zod_1.z.string().datetime().nullable(),
    role: zod_1.z.enum(['ADMIN', 'MODERATOR', 'MEMBER']).default('MEMBER'),
    isActive: zod_1.z.boolean().default(true)
});
// Full Conversation Schema (Backend)
exports.BackendConversationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: exports.ConversationTypeSchema,
    title: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    participants: zod_1.z.array(exports.ConversationParticipantSchema),
    messages: zod_1.z.array(exports.BackendMessageSchema),
    lastMessageAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().default(true)
});
// Message Search Result Schema
exports.MessageSearchResultSchema = zod_1.z.object({
    messages: zod_1.z.array(exports.BackendMessageSchema),
    totalCount: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    pageSize: zod_1.z.number().min(1),
    totalPages: zod_1.z.number().min(0)
});
// Conversation List Parameters Schema
exports.ConversationListParamsSchema = zod_1.z.object({
    type: exports.ConversationTypeSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['lastMessageAt', 'createdAt']).default('lastMessageAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Message Analytics Schema
exports.MessageAnalyticsSchema = zod_1.z.object({
    conversationId: zod_1.z.string().min(1),
    participantId: zod_1.z.string().min(1),
    timeframe: zod_1.z.enum(['day', 'week', 'month']),
    metrics: zod_1.z.object({
        totalMessages: zod_1.z.number().min(0),
        averageResponseTime: zod_1.z.number().min(0), // in minutes
        messageFrequency: zod_1.z.array(zod_1.z.object({
            hour: zod_1.z.number().min(0).max(23),
            count: zod_1.z.number().min(0)
        })),
        attachmentTypes: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
        engagementScore: zod_1.z.number().min(0).max(100)
    })
});
// Notification Preferences Schema
exports.MessageNotificationPreferencesSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    emailNotifications: zod_1.z.boolean().default(true),
    pushNotifications: zod_1.z.boolean().default(true),
    soundEnabled: zod_1.z.boolean().default(true),
    quietHours: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    }).optional()
});
// Messages List Parameters Schema
exports.MessagesListParamsSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    before: zod_1.z.string().optional(), // Message ID to fetch messages before
    after: zod_1.z.string().optional(), // Message ID to fetch messages after
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Blocked User Schema
exports.BlockedUserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    blockedUserId: zod_1.z.string().uuid(),
    blockedBy: zod_1.z.string().uuid(),
    reason: zod_1.z.string().max(500).optional(),
    createdAt: zod_1.z.string().datetime(),
    blockedUser: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        profileImage: zod_1.z.string().url().optional()
    })
});
// Search Messages Response Schema
exports.SearchMessagesResponseSchema = zod_1.z.object({
    messages: zod_1.z.array(exports.BackendMessageSchema),
    conversations: zod_1.z.array(exports.BackendConversationSchema),
    totalResults: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    limit: zod_1.z.number().min(1),
    totalPages: zod_1.z.number().min(0),
    hasMore: zod_1.z.boolean()
});
// Message Reaction Schema
exports.MessageReactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    messageId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    emoji: zod_1.z.string().min(1).max(10),
    createdAt: zod_1.z.string().datetime(),
    user: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        firstName: zod_1.z.string(),
        lastName: zod_1.z.string(),
        profileImage: zod_1.z.string().url().optional()
    }).optional()
});
//# sourceMappingURL=messaging.js.map