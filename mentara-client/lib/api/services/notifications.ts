import { AxiosInstance } from 'axios';
import {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadResponse,
  CreateNotificationRequest,
  NotificationSettings,
} from '../../types/api/notifications';

export interface NotificationsService {
  getMy(params?: NotificationListParams): Promise<NotificationListResponse>;
  markAsRead(notificationId: string): Promise<MarkReadResponse>;
  markAllAsRead(): Promise<MarkReadResponse>;
  delete(notificationId: string): Promise<void>;
  getUnreadCount(): Promise<UnreadCountResponse>;
  getSettings(): Promise<NotificationSettings>;
  updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings>;
  
  // Admin operations
  admin: {
    create(notification: CreateNotificationRequest): Promise<Notification>;
    broadcast(notification: Omit<CreateNotificationRequest, 'userId'> & { userIds?: string[]; roles?: string[] }): Promise<{ sent: number }>;
  };
}

export const createNotificationsService = (client: AxiosInstance): NotificationsService => ({
  getMy: (params: NotificationListParams = {}): Promise<NotificationListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params.type) searchParams.append('type', params.type);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/notifications${queryString}`);
  },

  markAsRead: (notificationId: string): Promise<MarkReadResponse> =>
    client.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: (): Promise<MarkReadResponse> =>
    client.patch('/notifications/read-all'),

  delete: (notificationId: string): Promise<void> =>
    client.delete(`/notifications/${notificationId}`),

  getUnreadCount: (): Promise<UnreadCountResponse> =>
    client.get('/notifications/unread-count'),

  getSettings: (): Promise<NotificationSettings> =>
    client.get('/notifications/settings'),

  updateSettings: (settings: Partial<NotificationSettings>): Promise<NotificationSettings> =>
    client.patch('/notifications/settings', settings),

  // Admin operations
  admin: {
    create: (notification: CreateNotificationRequest): Promise<Notification> =>
      client.post('/admin/notifications', notification),

    broadcast: (notification: Omit<CreateNotificationRequest, 'userId'> & { userIds?: string[]; roles?: string[] }): Promise<{ sent: number }> =>
      client.post('/admin/notifications/broadcast', notification),
  },
});