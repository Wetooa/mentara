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
} from '../../types/api/messaging';

export interface MessagingService {
  // Conversations
  conversations: {
    create(data: CreateConversationDto): Promise<Conversation>;
    getList(params?: ConversationListParams): Promise<{ conversations: Conversation[]; total: number }>;
    getById(conversationId: string): Promise<Conversation>;
    delete(conversationId: string): Promise<void>;
  };

  // Messages
  messages: {
    send(conversationId: string, data: SendMessageDto): Promise<Message>;
    getList(conversationId: string, params?: MessagesListParams): Promise<{ messages: Message[]; total: number; hasMore: boolean }>;
    getById(messageId: string): Promise<Message>;
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
    getBlockedUsers(): Promise<{ blockedUsers: BlockedUser[]; total: number }>;
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
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.type) searchParams.append('type', params.type);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/messaging/conversations${queryString}`);
    },

    getById: (conversationId: string): Promise<Conversation> =>
      client.get(`/messaging/conversations/${conversationId}`),

    delete: (conversationId: string): Promise<void> =>
      client.delete(`/messaging/conversations/${conversationId}`),
  },

  // Messages
  messages: {
    send: (conversationId: string, data: SendMessageDto): Promise<Message> =>
      client.post(`/messaging/conversations/${conversationId}/messages`, data),

    getList: (conversationId: string, params: MessagesListParams = {}): Promise<{ messages: Message[]; total: number; hasMore: boolean }> => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.before) searchParams.append('before', params.before);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/messaging/conversations/${conversationId}/messages${queryString}`);
    },

    getById: (messageId: string): Promise<Message> =>
      client.get(`/messaging/messages/${messageId}`),

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

    getBlockedUsers: (): Promise<{ blockedUsers: BlockedUser[]; total: number }> =>
      client.get('/messaging/blocked'),
  },

  // Search
  search: (data: SearchMessagesDto): Promise<SearchMessagesResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('query', data.query);
    if (data.conversationId) searchParams.append('conversationId', data.conversationId);
    if (data.type) searchParams.append('type', data.type);
    if (data.limit) searchParams.append('limit', data.limit.toString());
    if (data.offset) searchParams.append('offset', data.offset.toString());

    return client.get(`/messaging/search?${searchParams.toString()}`);
  },
});