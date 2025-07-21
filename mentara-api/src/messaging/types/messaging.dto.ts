/**
 * Messaging Module DTOs - Data Transfer Objects for messaging operations
 * These are pure TypeScript interfaces without validation logic
 */

// Conversation creation DTO
export interface CreateConversationDto {
  participantIds: string[];
  type: 'direct' | 'group' | 'therapy_session';
  title?: string;
  description?: string;
  isPrivate?: boolean;
  metadata?: {
    sessionId?: string;
    therapistId?: string;
    clientId?: string;
    emergencyContact?: boolean;
  };
}

// Message sending DTO
export interface SendMessageDto {
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  replyToMessageId?: string;
  attachments?: string[];
  metadata?: {
    mentions?: string[];
    links?: string[];
    emotionalTone?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

// Message update DTO
export interface UpdateMessageDto {
  content?: string;
  isEdited?: boolean;
  editReason?: string;
  metadata?: {
    mentions?: string[];
    links?: string[];
    emotionalTone?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

// Message reaction DTO
export interface AddReactionDto {
  emoji: string;
  action: 'add' | 'remove';
}

// Block user DTO
export interface BlockUserDto {
  reason?: 'spam' | 'harassment' | 'inappropriate' | 'other';
  description?: string;
}

// Search messages DTO
export interface SearchMessagesDto {
  query?: string;
  conversationId?: string;
  authorId?: string;
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  sortBy?: 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Conversation list parameters DTO
export interface ConversationListParams {
  type?: 'direct' | 'group' | 'therapy_session';
  status?: 'active' | 'archived' | 'muted';
  hasUnread?: boolean;
  lastActivityFrom?: string;
  lastActivityTo?: string;
  sortBy?: 'last_activity' | 'created' | 'unread_count';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

// Response DTOs
export interface ConversationResponseDto {
  id: string;
  type: 'direct' | 'group' | 'therapy_session';
  title?: string;
  description?: string;
  isPrivate: boolean;
  participants: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
    lastSeenAt?: string;
    status: 'active' | 'left' | 'removed';
  }[];
  lastMessage?: {
    id: string;
    content: string;
    type: string;
    authorId: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  metadata?: {
    sessionId?: string;
    therapistId?: string;
    clientId?: string;
    emergencyContact?: boolean;
  };
}

export interface MessageResponseDto {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  conversationId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  replyToMessageId?: string;
  replyToMessage?: {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
  };
  attachments: string[];
  reactions: {
    emoji: string;
    count: number;
    users: string[];
    hasUserReacted: boolean;
  }[];
  isEdited: boolean;
  editReason?: string;
  readBy: {
    userId: string;
    readAt: string;
  }[];
  deliveredTo: {
    userId: string;
    deliveredAt: string;
  }[];
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    mentions?: string[];
    links?: string[];
    emotionalTone?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

export interface MessagingStatsDto {
  totalConversations: number;
  activeConversations: number;
  unreadMessages: number;
  totalMessages: number;
  averageResponseTime?: number; // in minutes
  lastActivity?: string;
}

// WebSocket DTOs
export interface JoinConversationDto {
  conversationId: string;
  userId?: string;
}

export interface LeaveConversationDto {
  conversationId: string;
  userId?: string;
}

export interface TypingIndicatorDto {
  conversationId: string;
  isTyping: boolean;
  userId?: string;
}