import { BaseDomainEvent, EventMetadata } from './interfaces/domain-event.interface';

// Messaging & Communication Events

export interface MessageSentData {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  fileAttachments?: string[]; // file IDs
  replyToMessageId?: string;
  recipientIds: string[];
  sentAt: Date;
}

export class MessageSentEvent extends BaseDomainEvent<MessageSentData> {
  constructor(data: MessageSentData, metadata?: EventMetadata) {
    super(data.messageId, 'Message', data, metadata);
  }
}

export interface ConversationCreatedData {
  conversationId: string;
  createdBy: string;
  participantIds: string[];
  conversationType: 'direct' | 'group' | 'support' | 'therapy';
  title?: string;
  description?: string;
  isPrivate: boolean;
}

export class ConversationCreatedEvent extends BaseDomainEvent<ConversationCreatedData> {
  constructor(data: ConversationCreatedData, metadata?: EventMetadata) {
    super(data.conversationId, 'Conversation', data, metadata);
  }
}

export interface ConversationArchivedData {
  conversationId: string;
  archivedBy: string;
  participantIds: string[];
  archivedAt: Date;
  archiveReason: 'completed' | 'inactive' | 'manual' | 'policy_violation';
  messageCount: number;
  conversationDuration: number; // in days
}

export class ConversationArchivedEvent extends BaseDomainEvent<ConversationArchivedData> {
  constructor(data: ConversationArchivedData, metadata?: EventMetadata) {
    super(data.conversationId, 'Conversation', data, metadata);
  }
}

export interface TypingIndicatorData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export class TypingIndicatorEvent extends BaseDomainEvent<TypingIndicatorData> {
  constructor(data: TypingIndicatorData, metadata?: EventMetadata) {
    super(data.conversationId, 'Conversation', data, metadata);
  }
}

export interface MessageReadData {
  messageId: string;
  conversationId: string;
  readBy: string;
  readAt: Date;
  messagesSinceLastRead: number;
}

export class MessageReadEvent extends BaseDomainEvent<MessageReadData> {
  constructor(data: MessageReadData, metadata?: EventMetadata) {
    super(data.messageId, 'Message', data, metadata);
  }
}

export interface MessageDeliveredData {
  messageId: string;
  conversationId: string;
  deliveredTo: string;
  deliveredAt: Date;
  deliveryMethod: 'websocket' | 'push' | 'email' | 'sms';
  deliveryStatus: 'delivered' | 'failed' | 'pending';
}

export class MessageDeliveredEvent extends BaseDomainEvent<MessageDeliveredData> {
  constructor(data: MessageDeliveredData, metadata?: EventMetadata) {
    super(data.messageId, 'Message', data, metadata);
  }
}

export interface ParticipantJoinedData {
  conversationId: string;
  participantId: string;
  addedBy: string;
  joinedAt: Date;
  role: 'member' | 'admin' | 'moderator';
}

export class ParticipantJoinedEvent extends BaseDomainEvent<ParticipantJoinedData> {
  constructor(data: ParticipantJoinedData, metadata?: EventMetadata) {
    super(data.conversationId, 'Conversation', data, metadata);
  }
}

export interface ParticipantLeftData {
  conversationId: string;
  participantId: string;
  leftAt: Date;
  leftReason: 'manual' | 'removed' | 'archived' | 'blocked';
  removedBy?: string;
}

export class ParticipantLeftEvent extends BaseDomainEvent<ParticipantLeftData> {
  constructor(data: ParticipantLeftData, metadata?: EventMetadata) {
    super(data.conversationId, 'Conversation', data, metadata);
  }
}