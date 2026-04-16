/**
 * Messaging Module Types - Central exports for messaging types and DTOs
 */

// Export all messaging DTOs
export * from './messaging.dto';

// Re-export commonly used types for convenience
export type {
  CreateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  BlockUserDto,
  SearchMessagesDto,
  ConversationListParams,
  ConversationResponseDto,
  MessageResponseDto,
  MessagingStatsDto,
} from './messaging.dto';