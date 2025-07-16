import { z } from 'zod';

// User Status Schema
export const UserStatusSchema = z.enum([
  'online',
  'offline',
  'away'
]);

// Message Status Schema
export const MessageStatusSchema = z.enum([
  'sent',
  'delivered',
  'read'
]);

// Message Type Schema (from Prisma enum)
export const MessageTypeSchema = z.enum([
  'TEXT',
  'IMAGE',
  'AUDIO',
  'VIDEO',
  'SYSTEM'
]);

// Conversation Type Schema (from Prisma enum)
export const ConversationTypeSchema = z.enum([
  'DIRECT',
  'GROUP',
  'SESSION',
  'SUPPORT'
]);

// Attachment Schema
export const AttachmentSchema = z.object({
  id: z.string().min(1, 'Attachment ID is required'),
  type: z.enum(['image', 'document', 'audio', 'video']),
  url: z.string().url('Invalid attachment URL'),
  name: z.string().min(1, 'Attachment name is required'),
  size: z.number().min(0, 'File size must be positive').optional(),
  previewUrl: z.string().url().optional()
});

// Reaction Schema
export const ReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required'),
  count: z.number().min(1, 'Reaction count must be at least 1'),
  users: z.array(z.string().min(1)).min(1, 'At least one user must have reacted')
});

// Read Receipt Schema
export const ReadReceiptSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  readAt: z.string().datetime('Invalid read timestamp')
});

// Message Schema (Frontend format)
export const MessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  sender: z.enum(['me', 'them']),
  text: z.string().min(1, 'Message text is required'),
  time: z.string().min(1, 'Message time is required'),
  status: MessageStatusSchema.optional(),
  attachments: z.array(AttachmentSchema).optional(),
  isDeleted: z.boolean().optional().default(false),
  reactions: z.array(ReactionSchema).optional(),
  replyTo: z.string().optional() // ID of the message being replied to
});

// Backend Message Schema
export const BackendMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
  content: z.string().min(1, 'Message content is required'),
  createdAt: z.string().datetime('Invalid creation timestamp'),
  isRead: z.boolean().default(false),
  messageType: MessageTypeSchema.default('TEXT'),
  reactions: z.array(z.object({
    emoji: z.string().min(1),
    userId: z.string().min(1),
    count: z.number().min(1)
  })).optional(),
  attachment: z.object({
    url: z.string().url(),
    name: z.string().min(1),
    size: z.number().min(0)
  }).optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
  attachmentSize: z.number().min(0).optional(),
  replyToId: z.string().optional(),
  isDeleted: z.boolean().optional().default(false),
  readReceipts: z.array(ReadReceiptSchema).optional()
});

// Contact Schema
export const ContactSchema = z.object({
  id: z.string().min(1, 'Contact ID is required'),
  name: z.string().min(1, 'Contact name is required'),
  status: UserStatusSchema,
  lastMessage: z.string().default(''),
  time: z.string().min(1, 'Last message time is required'),
  unread: z.number().min(0, 'Unread count cannot be negative').default(0),
  avatar: z.string().url().optional(),
  isTyping: z.boolean().optional().default(false)
});

// Conversation Schema
export const ConversationSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
  contactId: z.string().min(1, 'Contact ID is required'),
  messages: z.array(MessageSchema),
  lastReadMessageId: z.string().optional()
});

// Message Group Schema (for grouping messages by date)
export const MessageGroupSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  messages: z.array(MessageSchema).min(1, 'At least one message is required')
});

// Messages State Schema
export const MessagesStateSchema = z.object({
  contacts: z.array(ContactSchema),
  conversations: z.array(ConversationSchema),
  selectedContactId: z.string().nullable(),
  isLoadingMessages: z.boolean().default(false),
  error: z.string().nullable()
});

// Messaging DTOs (Backend)
export const CreateConversationDtoSchema = z.object({
  participantIds: z.array(z.string().uuid('Invalid UUID format')).min(1, 'At least one participant is required'),
  type: ConversationTypeSchema.optional().default('DIRECT'),
  title: z.string().min(1, 'Title is required').optional()
});

export const SendMessageDtoSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
  messageType: MessageTypeSchema.optional().default('TEXT'),
  replyToId: z.string().uuid().optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
  attachmentSize: z.number().min(0).optional()
}).refine(
  (data) => {
    // If attachmentUrl is provided, attachmentName should also be provided
    if (data.attachmentUrl && !data.attachmentName) {
      return false;
    }
    return true;
  },
  {
    message: 'Attachment name is required when attachment URL is provided',
    path: ['attachmentName']
  }
);

export const UpdateMessageDtoSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long')
});

export const AddReactionDtoSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10, 'Emoji too long')
});

export const BlockUserDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  reason: z.string().max(500, 'Reason too long').optional()
});

export const SearchMessagesDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  conversationId: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
});

// WebSocket DTOs
export const JoinConversationDtoSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format')
});

export const LeaveConversationDtoSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format')
});

export const TypingIndicatorDtoSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
  isTyping: z.boolean().optional().default(true)
});

// Conversation Participant Schema
export const ConversationParticipantSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  conversationId: z.string().min(1),
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  role: z.enum(['ADMIN', 'MODERATOR', 'MEMBER']).default('MEMBER'),
  isActive: z.boolean().default(true)
});

// Full Conversation Schema (Backend)
export const BackendConversationSchema = z.object({
  id: z.string().min(1),
  type: ConversationTypeSchema,
  title: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  participants: z.array(ConversationParticipantSchema),
  messages: z.array(BackendMessageSchema),
  lastMessageAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true)
});

// Message Search Result Schema
export const MessageSearchResultSchema = z.object({
  messages: z.array(BackendMessageSchema),
  totalCount: z.number().min(0),
  page: z.number().min(1),
  pageSize: z.number().min(1),
  totalPages: z.number().min(0)
});

// Conversation List Parameters Schema
export const ConversationListParamsSchema = z.object({
  type: ConversationTypeSchema.optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['lastMessageAt', 'createdAt']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Message Analytics Schema
export const MessageAnalyticsSchema = z.object({
  conversationId: z.string().min(1),
  participantId: z.string().min(1),
  timeframe: z.enum(['day', 'week', 'month']),
  metrics: z.object({
    totalMessages: z.number().min(0),
    averageResponseTime: z.number().min(0), // in minutes
    messageFrequency: z.array(z.object({
      hour: z.number().min(0).max(23),
      count: z.number().min(0)
    })),
    attachmentTypes: z.record(z.string(), z.number().min(0)),
    engagementScore: z.number().min(0).max(100)
  })
});

// Notification Preferences Schema
export const MessageNotificationPreferencesSchema = z.object({
  userId: z.string().min(1),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }).optional()
});

// Messages List Parameters Schema
export const MessagesListParamsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  before: z.string().optional(), // Message ID to fetch messages before
  after: z.string().optional(), // Message ID to fetch messages after
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Blocked User Schema
export const BlockedUserSchema = z.object({
  id: z.string().uuid(),
  blockedUserId: z.string().uuid(),
  blockedBy: z.string().uuid(),
  reason: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  blockedUser: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    profileImage: z.string().url().optional()
  })
});

// Search Messages Response Schema
export const SearchMessagesResponseSchema = z.object({
  messages: z.array(BackendMessageSchema),
  conversations: z.array(BackendConversationSchema),
  totalResults: z.number().min(0),
  page: z.number().min(1),
  limit: z.number().min(1),
  totalPages: z.number().min(0),
  hasMore: z.boolean()
});

// Message Reaction Schema
export const MessageReactionSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  emoji: z.string().min(1).max(10),
  createdAt: z.string().datetime(),
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    profileImage: z.string().url().optional()
  }).optional()
});

// Type inference exports
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type MessageStatus = z.infer<typeof MessageStatusSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export type ConversationType = z.infer<typeof ConversationTypeSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type ReadReceipt = z.infer<typeof ReadReceiptSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type BackendMessage = z.infer<typeof BackendMessageSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type MessageGroup = z.infer<typeof MessageGroupSchema>;
export type MessagesState = z.infer<typeof MessagesStateSchema>;
export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;
export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;
export type UpdateMessageDto = z.infer<typeof UpdateMessageDtoSchema>;
export type AddReactionDto = z.infer<typeof AddReactionDtoSchema>;
export type BlockUserDto = z.infer<typeof BlockUserDtoSchema>;
export type SearchMessagesDto = z.infer<typeof SearchMessagesDtoSchema>;
export type JoinConversationDto = z.infer<typeof JoinConversationDtoSchema>;
export type LeaveConversationDto = z.infer<typeof LeaveConversationDtoSchema>;
export type TypingIndicatorDto = z.infer<typeof TypingIndicatorDtoSchema>;
export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>;
export type BackendConversation = z.infer<typeof BackendConversationSchema>;
export type MessageSearchResult = z.infer<typeof MessageSearchResultSchema>;
export type ConversationListParams = z.infer<typeof ConversationListParamsSchema>;
export type MessageAnalytics = z.infer<typeof MessageAnalyticsSchema>;
export type MessageNotificationPreferences = z.infer<typeof MessageNotificationPreferencesSchema>;
export type MessagesListParams = z.infer<typeof MessagesListParamsSchema>;
export type BlockedUser = z.infer<typeof BlockedUserSchema>;
export type SearchMessagesResponse = z.infer<typeof SearchMessagesResponseSchema>;
export type MessageReaction = z.infer<typeof MessageReactionSchema>;