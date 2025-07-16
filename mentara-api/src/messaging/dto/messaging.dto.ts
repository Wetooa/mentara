// Using interfaces for DTOs to avoid class initialization errors
export interface SendMessageDto {
  recipientId?: string; // Optional for group messages
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'AUDIO'; // Removed DOCUMENT
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  replyToId?: string;
}

export interface MessageReadDto {
  messageId: string;
  isRead: boolean;
}

export interface GetMessagesDto {
  conversationId?: string;
  userId?: string;
  limit?: string;
  offset?: string;
}

export interface CreateConversationDto {
  participantId?: string; // Optional for group conversations
  participantIds: string[]; // For group conversations
  type: 'DIRECT' | 'GROUP'; // Removed THERAPY_SESSION 
  title?: string;
  conversationType?: string;
}

export interface JoinRoomDto {
  roomId: string;
}

export interface LeaveRoomDto {
  roomId: string;
}

export interface UpdateTypingStatusDto {
  conversationId: string;
  isTyping: boolean;
}

export interface JoinConversationDto {
  conversationId: string;
}

export interface LeaveConversationDto {
  conversationId: string;
}

export interface TypingIndicatorDto {
  conversationId: string;
  isTyping: boolean;
}

export interface UpdateMessageDto {
  content?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'AUDIO';
  isRead?: boolean;
  attachmentUrl?: string;
}

export interface AddReactionDto {
  emoji: string;
}

export interface BlockUserDto {
  userId: string; // Missing property
  reason?: string;
}

export interface SearchMessagesDto {
  query: string;
  conversationId?: string; // Missing property
  page?: number; // Missing property
  limit?: string; // Changed to string to match usage
  offset?: number;
}