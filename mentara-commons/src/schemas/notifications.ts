import { z } from 'zod';

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success', 'reminder']),
  category: z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']),
  isRead: z.boolean(),
  isArchived: z.boolean(),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.string().optional(),
  actionUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional()
});

// Create Notification Schema
export const CreateNotificationDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  type: z.enum(['info', 'warning', 'error', 'success', 'reminder']).default('info'),
  category: z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.string().optional(),
  actionUrl: z.string().url().optional(),
  scheduledFor: z.string().datetime().optional()
});

// Update Notification Schema
export const UpdateNotificationDtoSchema = z.object({
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional()
});

// Bulk Update Notifications Schema
export const BulkUpdateNotificationsDtoSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional()
});

// Push Notification Preferences Schema
export const NotificationPreferencesSchema = z.object({
  userId: z.string().uuid(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  sessionReminders: z.boolean(),
  bookingUpdates: z.boolean(),
  messageNotifications: z.boolean(),
  communityUpdates: z.boolean(),
  systemAlerts: z.boolean()
});

// Update Notification Preferences Schema
export const UpdateNotificationPreferencesDtoSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  sessionReminders: z.boolean().optional(),
  bookingUpdates: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  communityUpdates: z.boolean().optional(),
  systemAlerts: z.boolean().optional()
});

// Notification Query Parameters
export const NotificationQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  type: z.enum(['info', 'warning', 'error', 'success', 'reminder']).optional(),
  category: z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'readAt', 'type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Parameter Schemas
export const NotificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format')
});

// Export type inference helpers
export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotificationDto = z.infer<typeof CreateNotificationDtoSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationDtoSchema>;
export type BulkUpdateNotificationsDto = z.infer<typeof BulkUpdateNotificationsDtoSchema>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export type UpdateNotificationPreferencesDto = z.infer<typeof UpdateNotificationPreferencesDtoSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;
export type NotificationIdParam = z.infer<typeof NotificationIdParamSchema>;