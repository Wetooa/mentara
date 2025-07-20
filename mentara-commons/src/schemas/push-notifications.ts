import { z } from 'zod';

// Push Notification Subscription Schema
export const SubscribeRequestDtoSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh key is required'),
    auth: z.string().min(1, 'auth key is required')
  }),
  userId: z.string().uuid('Invalid user ID format').optional(),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    device: z.string().optional()
  }).optional(),
  preferences: z.object({
    sessionReminders: z.boolean().default(true),
    messageNotifications: z.boolean().default(true),
    appointmentUpdates: z.boolean().default(true),
    communityActivity: z.boolean().default(false),
    systemAlerts: z.boolean().default(true)
  }).optional()
});

export const UnsubscribeRequestDtoSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  userId: z.string().uuid('Invalid user ID format').optional(),
  reason: z.enum(['user_request', 'device_change', 'app_uninstall', 'expired_subscription']).optional()
});

export const TestNotificationRequestDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(300, 'Body too long'),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  actions: z.array(z.object({
    action: z.string().min(1, 'Action is required'),
    title: z.string().min(1, 'Action title is required'),
    icon: z.string().url().optional()
  })).optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false)
});

// Bulk notification schemas
export const BulkNotificationRequestDtoSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required').max(1000, 'Too many users'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(300, 'Body too long'),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional()
});

// Notification template schemas
export const NotificationTemplateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z.string().min(1, 'Template name is required'),
  title: z.string().min(1, 'Title template is required'),
  body: z.string().min(1, 'Body template is required'),
  variables: z.array(z.string()).optional(), // Variables that can be replaced in template
  category: z.enum(['appointment', 'message', 'community', 'system', 'emergency']),
  isActive: z.boolean().default(true)
});

export const SendTemplateNotificationDtoSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  userIds: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
  variables: z.record(z.string()).optional(), // Key-value pairs for template variables
  scheduledFor: z.string().datetime().optional()
});

// Notification analytics schemas
export const NotificationAnalyticsQueryDtoSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  category: z.enum(['appointment', 'message', 'community', 'system', 'emergency']).optional(),
  userId: z.string().uuid().optional(),
  includeClickThrough: z.boolean().default(true),
  includeDeliveryRate: z.boolean().default(true)
});

// Subscription management schemas
export const UpdateSubscriptionPreferencesDtoSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  preferences: z.object({
    sessionReminders: z.boolean().optional(),
    messageNotifications: z.boolean().optional(),
    appointmentUpdates: z.boolean().optional(),
    communityActivity: z.boolean().optional(),
    systemAlerts: z.boolean().optional()
  }),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: z.string().optional()
  }).optional()
});

// Type exports
export type SubscribeRequestDto = z.infer<typeof SubscribeRequestDtoSchema>;
export type UnsubscribeRequestDto = z.infer<typeof UnsubscribeRequestDtoSchema>;
export type TestNotificationRequestDto = z.infer<typeof TestNotificationRequestDtoSchema>;
export type BulkNotificationRequestDto = z.infer<typeof BulkNotificationRequestDtoSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type SendTemplateNotificationDto = z.infer<typeof SendTemplateNotificationDtoSchema>;
export type NotificationAnalyticsQueryDto = z.infer<typeof NotificationAnalyticsQueryDtoSchema>;
export type UpdateSubscriptionPreferencesDto = z.infer<typeof UpdateSubscriptionPreferencesDtoSchema>;