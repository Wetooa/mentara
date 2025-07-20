import { AxiosInstance } from 'axios';
import {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadResponse,
  CreateNotificationRequest,
  NotificationSettings,
  NotificationListParamsSchema,
  CreateNotificationDtoSchema,
  UpdateNotificationPreferencesDtoSchema,
} from 'mentara-commons';

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
    const validatedParams = NotificationListParamsSchema.parse(params);
    return client.get('/notifications', { params: validatedParams });
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

  updateSettings: (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const validatedSettings = UpdateNotificationPreferencesDtoSchema.parse(settings);
    return client.patch('/notifications/settings', validatedSettings);
  },

  // Admin operations
  admin: {
    create: (notification: CreateNotificationRequest): Promise<Notification> => {
      const validatedNotification = CreateNotificationDtoSchema.parse(notification);
      return client.post('/admin/notifications', validatedNotification);
    },

    broadcast: (notification: Omit<CreateNotificationRequest, 'userId'> & { userIds?: string[]; roles?: string[] }): Promise<{ sent: number }> =>
      client.post('/admin/notifications/broadcast', notification),
  },
});