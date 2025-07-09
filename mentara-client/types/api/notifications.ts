// Notifications DTOs matching backend exactly

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'meeting' | 'worksheet' | 'review' | 'system' | 'post' | 'comment';
  title: string;
  content: string;
  data?: Record<string, any>; // Additional metadata
  isRead: boolean;
  readAt?: string;
  actionUrl?: string; // URL to navigate when notification is clicked
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  limit?: number;
  offset?: number;
  isRead?: boolean;
  type?: 'message' | 'meeting' | 'worksheet' | 'review' | 'system' | 'post' | 'comment';
  startDate?: string;
  endDate?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  success: boolean;
  markedCount?: number;
}

export interface CreateNotificationRequest {
  userId: string;
  type: 'message' | 'meeting' | 'worksheet' | 'review' | 'system' | 'post' | 'comment';
  title: string;
  content: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  meetingNotifications: boolean;
  worksheetNotifications: boolean;
  reviewNotifications: boolean;
  systemNotifications: boolean;
  postNotifications: boolean;
  commentNotifications: boolean;
}