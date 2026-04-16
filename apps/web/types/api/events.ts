// Real-time WebSocket event types

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Message Events
export interface MessageSentEvent extends BaseEvent {
  type: 'message:sent';
  messageId: string;
  conversationId: string;
  senderId: string;
  content: {
    text?: string;
    attachments?: Array<{
      id: string;
      type: 'image' | 'file' | 'video';
      url: string;
      filename: string;
    }>;
    messageType: 'text' | 'image' | 'file' | 'system';
  };
  recipientId: string;
  isGroup?: boolean;
}

export interface MessageUpdatedEvent extends BaseEvent {
  type: 'message:updated';
  messageId: string;
  conversationId: string;
  updatedContent: {
    text?: string;
    editedAt: string;
    editReason?: string;
  };
  senderId: string;
}

export interface MessageDeletedEvent extends BaseEvent {
  type: 'message:deleted';
  messageId: string;
  conversationId: string;
  senderId: string;
  deletedAt: string;
  deletionType: 'user' | 'moderator' | 'system';
  reason?: string;
}

// Notification Events
export interface NotificationCreatedEvent extends BaseEvent {
  type: 'notification:created';
  notificationId: string;
  recipientId: string;
  title: string;
  message: string;
  category: 'session' | 'message' | 'worksheet' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface NotificationUpdatedEvent extends BaseEvent {
  type: 'notification:updated';
  notificationId: string;
  recipientId: string;
  changes: {
    isRead?: boolean;
    isArchived?: boolean;
    readAt?: string;
  };
}

export interface NotificationDeletedEvent extends BaseEvent {
  type: 'notification:deleted';
  notificationId: string;
  recipientId: string;
  deletedAt: string;
}

// Meeting/Session Events
export interface MeetingStartedEvent extends BaseEvent {
  type: 'meeting:started';
  meetingId: string;
  sessionId: string;
  therapistId: string;
  clientId: string;
  scheduledStartTime: string;
  actualStartTime: string;
  meetingType: 'video' | 'phone' | 'in-person';
  roomId?: string;
}

export interface MeetingEndedEvent extends BaseEvent {
  type: 'meeting:ended';
  meetingId: string;
  sessionId: string;
  therapistId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  endReason: 'completed' | 'cancelled' | 'technical-issue' | 'no-show';
  summary?: {
    notesAdded: boolean;
    followUpScheduled: boolean;
    worksheetAssigned: boolean;
  };
}

// Worksheet Events
export interface WorksheetAssignedEvent extends BaseEvent {
  type: 'worksheet:assigned';
  worksheetId: string;
  assignmentId: string;
  therapistId: string;
  clientId: string;
  worksheetTitle: string;
  dueDate: string;
  instructions?: string;
  materials?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
  priority: 'low' | 'medium' | 'high';
}

export interface WorksheetCompletedEvent extends BaseEvent {
  type: 'worksheet:completed';
  worksheetId: string;
  assignmentId: string;
  clientId: string;
  therapistId: string;
  completedAt: string;
  submissionCount: number;
  submissions?: Array<{
    id: string;
    filename: string;
    url: string;
    submittedAt: string;
  }>;
  autoGraded?: boolean;
  requiresReview: boolean;
}

// Union type of all possible events
export type RealTimeEvent =
  | MessageSentEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | NotificationCreatedEvent
  | NotificationUpdatedEvent
  | NotificationDeletedEvent
  | MeetingStartedEvent
  | MeetingEndedEvent
  | WorksheetAssignedEvent
  | WorksheetCompletedEvent;