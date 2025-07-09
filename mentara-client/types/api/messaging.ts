// Messaging DTOs matching backend exactly

export interface CreateConversationDto {
  participantIds: string[];
  type?: 'direct' | 'group';
  title?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  joinedAt: string;
  lastReadAt?: string;
}

export interface SendMessageDto {
  content: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

export interface UpdateMessageDto {
  content?: string;
}

export interface AddReactionDto {
  emoji: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface BlockUserDto {
  blockedUserId: string;
  reason?: string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  blockedUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  reason?: string;
  createdAt: string;
}

export interface SearchMessagesDto {
  query: string;
  conversationId?: string;
  type?: 'text' | 'image' | 'file';
  limit?: number;
  offset?: number;
}

export interface SearchMessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface ConversationListParams {
  limit?: number;
  offset?: number;
  type?: 'direct' | 'group';
}

export interface MessagesListParams {
  limit?: number;
  offset?: number;
  before?: string; // cursor for pagination
}