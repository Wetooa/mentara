// Notifications DTOs matching backend exactly

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string; // Changed from 'content' to match backend
  priority?: NotificationPriority;
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
  type?: NotificationType;
  priority?: NotificationPriority;
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
  type: NotificationType;
  title: string;
  message: string; // Changed from 'content' to match backend
  priority?: NotificationPriority;
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

// Notification Types - matching backend exactly
export type NotificationType = 
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'MESSAGE_RECEIVED'
  | 'MESSAGE_REACTION'
  | 'WORKSHEET_ASSIGNED'
  | 'WORKSHEET_DUE'
  | 'WORKSHEET_FEEDBACK'
  | 'REVIEW_REQUEST'
  | 'REVIEW_RECEIVED'
  | 'THERAPIST_APPLICATION'
  | 'THERAPIST_APPROVED'
  | 'THERAPIST_REJECTED'
  | 'THERAPIST_STATUS_UPDATED'
  | 'THERAPIST_REQUEST_ACCEPTED'
  | 'THERAPIST_REQUEST_DECLINED'
  | 'ALTERNATIVE_RECOMMENDATIONS'
  | 'CLIENT_REQUEST_RECEIVED'
  | 'CLIENT_REQUEST_CANCELLED'
  | 'PROFILE_COMPLETION'
  | 'COMMUNITY_POST'
  | 'COMMUNITY_REPLY'
  | 'COMMUNITY_RECOMMENDATION'
  | 'COMMUNITY_JOINED'
  | 'COMMUNITY_WELCOME'
  | 'RECOMMENDATIONS_UPDATED'
  | 'NEW_RECOMMENDATIONS'
  | 'RELATIONSHIP_ESTABLISHED'
  | 'REQUEST_REMINDER'
  | 'SYSTEM_MAINTENANCE'
  | 'SYSTEM_UPDATE'
  | 'SECURITY_ALERT'
  | 'SCHEDULING_INFO'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_EXPIRING';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';