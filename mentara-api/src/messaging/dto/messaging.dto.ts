import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, IsUUID, IsNotEmpty } from 'class-validator';
import { ConversationType, MessageType } from '@prisma/client';

export class CreateConversationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;

  @IsString()
  @IsOptional()
  title?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsUUID('4')
  @IsOptional()
  replyToId?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  attachmentSize?: number;
}

export class UpdateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AddReactionDto {
  @IsString()
  @IsNotEmpty()
  emoji: string;
}

export class BlockUserDto {
  @IsUUID('4')
  userId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SearchMessagesDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsUUID('4')
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

// WebSocket DTOs
export class JoinConversationDto {
  @IsUUID('4')
  conversationId: string;
}

export class LeaveConversationDto {
  @IsUUID('4')
  conversationId: string;
}

export class TypingIndicatorDto {
  @IsUUID('4')
  conversationId: string;

  @IsOptional()
  isTyping?: boolean;
}