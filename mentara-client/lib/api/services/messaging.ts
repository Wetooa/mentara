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
} from '@/types/api/messaging';

export interface MessagingService {
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

export const createMessagingService = (client: AxiosInstance): MessagingService => ({
  // Conversations
  conversations: {
    create: (data: CreateConversationDto): Promise<Conversation> =>
      client.post('/messaging/conversations', data),

    getList: (params: ConversationListParams = {}): Promise<{ conversations: Conversation[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      // Convert offset to page for backend compatibility
      if (params.offset && params.limit) {
        const page = Math.floor(params.offset / params.limit) + 1;
        searchParams.append('page', page.toString());
      }
      if (params.type) searchParams.append('type', params.type);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/messaging/conversations${queryString}`);
    },

    // BACKEND ENDPOINT MISSING - needs implementation
    // getById: (conversationId: string): Promise<Conversation> =>
    //   client.get(`/messaging/conversations/${conversationId}`),

    // BACKEND ENDPOINT MISSING - needs implementation
    // delete: (conversationId: string): Promise<void> =>
    //   client.delete(`/messaging/conversations/${conversationId}`),
  },

  // Messages
  messages: {
    send: (conversationId: string, data: SendMessageDto): Promise<Message> =>
      client.post(`/messaging/conversations/${conversationId}/messages`, data),

    getList: (conversationId: string, params: MessagesListParams = {}): Promise<{ messages: Message[]; total: number; hasMore: boolean }> => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      // Convert offset to page for backend compatibility
      if (params.offset && params.limit) {
        const page = Math.floor(params.offset / params.limit) + 1;
        searchParams.append('page', page.toString());
      }
      if (params.before) searchParams.append('before', params.before);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/messaging/conversations/${conversationId}/messages${queryString}`);
    },

    // BACKEND ENDPOINT MISSING - needs implementation
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

    // BACKEND ENDPOINT MISSING - needs implementation
    // getBlockedUsers: (): Promise<{ blockedUsers: BlockedUser[]; total: number }> =>
    //   client.get('/messaging/blocked'),
  },

  // Search
  search: (data: SearchMessagesDto): Promise<SearchMessagesResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', data.query);
    if (data.conversationId) searchParams.append('conversationId', data.conversationId);
    if (data.type) searchParams.append('type', data.type);
    if (data.limit) searchParams.append('limit', data.limit.toString());
    // Convert offset to page for backend compatibility
    if (data.offset && data.limit) {
      const page = Math.floor(data.offset / data.limit) + 1;
      searchParams.append('page', page.toString());
    }

    return client.get(`/messaging/search?${searchParams.toString()}`);
  },
});