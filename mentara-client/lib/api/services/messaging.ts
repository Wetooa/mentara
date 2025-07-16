import { AxiosInstance } from 'axios';
import {
  CreateConversationDto,
  Conversation,
  SendMessageDto,
  Message,
  UpdateMessageDto,
  AddReactionDto,
  MessageReaction,
  BlockUserDto,
  BlockedUser,
  SearchMessagesDto,
  SearchMessagesResponse,
  ConversationListParams,
  MessagesListParams,
  ConversationListParamsSchema,
  MessagesListParamsSchema,
  SearchMessagesDtoSchema,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  CreateConversationDto,
  Conversation,
  SendMessageDto,
  Message,
  UpdateMessageDto,
  AddReactionDto,
  MessageReaction,
  BlockUserDto,
  BlockedUser,
  SearchMessagesDto,
  SearchMessagesResponse,
  ConversationListParams,
  MessagesListParams,
};

// Service interface for type checking (use factory function instead)
interface MessagingService {
  // Conversations
  conversations: {
    create(data: CreateConversationDto): Promise<Conversation>;
    getList(params?: ConversationListParams): Promise<{ conversations: Conversation[]; total: number }>;
    // getById(conversationId: string): Promise<Conversation>; // BACKEND MISSING
    // delete(conversationId: string): Promise<void>; // BACKEND MISSING
  };

  // Messages
  messages: {
    send(conversationId: string, data: SendMessageDto): Promise<Message>;
    getList(conversationId: string, params?: MessagesListParams): Promise<{ messages: Message[]; total: number; hasMore: boolean }>;
    // getById(messageId: string): Promise<Message>; // BACKEND MISSING
    update(messageId: string, data: UpdateMessageDto): Promise<Message>;
    delete(messageId: string): Promise<void>;
    markAsRead(messageId: string): Promise<void>;
  };

  // Reactions
  reactions: {
    add(messageId: string, data: AddReactionDto): Promise<MessageReaction>;
    remove(messageId: string, emoji: string): Promise<void>;
  };

  // Blocking
  blocking: {
    blockUser(data: BlockUserDto): Promise<BlockedUser>;
    unblockUser(blockedUserId: string): Promise<void>;
    // getBlockedUsers(): Promise<{ blockedUsers: BlockedUser[]; total: number }>; // BACKEND MISSING
  };

  // Search
  search(data: SearchMessagesDto): Promise<SearchMessagesResponse>;
}

// Messaging service factory
export const createMessagingService = (client: AxiosInstance) => ({
  // Conversations
  conversations: {
    create: (data: CreateConversationDto): Promise<Conversation> =>
      client.post('/messaging/conversations', data),

    getList: async (params: ConversationListParams = {}): Promise<{ conversations: Conversation[]; total: number }> => {
      const validatedParams = ConversationListParamsSchema.parse(params);
      return client.get('/messaging/conversations', { params: validatedParams });
    },

    // ===== MISSING BACKEND ENDPOINTS =====
    // 
    // MISSING: GET /messaging/conversations/:conversationId - Get conversation by ID
    // Purpose: Retrieve conversation details including participants and metadata
    // Expected response: Conversation object with participant details
    // Backend service: Missing - would need to be implemented
    // Priority: MEDIUM - needed for conversation details pages
    // getById: (conversationId: string): Promise<Conversation> =>
    //   client.get(`/messaging/conversations/${conversationId}`),

    // MISSING: DELETE /messaging/conversations/:conversationId - Delete conversation
    // Purpose: Allow users to delete entire conversation history
    // Expected response: void (204 No Content)
    // Backend service: Missing - would need to be implemented
    // Priority: LOW - nice to have for conversation cleanup
    // delete: (conversationId: string): Promise<void> =>
    //   client.delete(`/messaging/conversations/${conversationId}`),
  },

  // Messages
  messages: {
    send: (conversationId: string, data: SendMessageDto): Promise<Message> =>
      client.post(`/messaging/conversations/${conversationId}/messages`, data),

    getList: async (conversationId: string, params: MessagesListParams = {}): Promise<{ messages: Message[]; total: number; hasMore: boolean }> => {
      const validatedParams = MessagesListParamsSchema.parse(params);
      return client.get(`/messaging/conversations/${conversationId}/messages`, { params: validatedParams });
    },

    // ===== MISSING BACKEND ENDPOINTS =====
    // 
    // MISSING: GET /messaging/messages/:messageId - Get message by ID
    // Purpose: Retrieve individual message details for display or editing
    // Expected response: Message object with full details
    // Backend service: Missing - would need to be implemented
    // Priority: LOW - not commonly needed as messages are fetched in conversation context
    // getById: (messageId: string): Promise<Message> =>
    //   client.get(`/messaging/messages/${messageId}`),

    update: (messageId: string, data: UpdateMessageDto): Promise<Message> =>
      client.put(`/messaging/messages/${messageId}`, data),

    delete: (messageId: string): Promise<void> =>
      client.delete(`/messaging/messages/${messageId}`),

    markAsRead: (messageId: string): Promise<void> =>
      client.post(`/messaging/messages/${messageId}/read`),
  },

  // Reactions
  reactions: {
    add: (messageId: string, data: AddReactionDto): Promise<MessageReaction> =>
      client.post(`/messaging/messages/${messageId}/reactions`, data),

    remove: (messageId: string, emoji: string): Promise<void> =>
      client.delete(`/messaging/messages/${messageId}/reactions/${emoji}`),
  },

  // Blocking
  blocking: {
    blockUser: (data: BlockUserDto): Promise<BlockedUser> =>
      client.post('/messaging/block', data),

    unblockUser: (blockedUserId: string): Promise<void> =>
      client.delete(`/messaging/block/${blockedUserId}`),

    // ===== MISSING BACKEND ENDPOINTS =====
    // 
    // MISSING: GET /messaging/blocked - Get list of blocked users
    // Purpose: Retrieve list of users that current user has blocked
    // Expected response: { blockedUsers: BlockedUser[]; total: number }
    // Backend service: Missing - would need to be implemented
    // Priority: MEDIUM - needed for user settings/blocked users management
    // getBlockedUsers: (): Promise<{ blockedUsers: BlockedUser[]; total: number }> =>
    //   client.get('/messaging/blocked'),
  },

  // Search
  search: async (data: SearchMessagesDto): Promise<SearchMessagesResponse> => {
    const validatedData = SearchMessagesDtoSchema.parse(data);
    return client.get('/messaging/search', { params: validatedData });
  },
});

export type MessagingService = ReturnType<typeof createMessagingService>;