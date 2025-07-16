import { z } from 'zod';

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
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
  type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).default('SYSTEM_UPDATE'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
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
  type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'readAt', 'type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Parameter Schemas
export const NotificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format')
});

// Alternative Notification Query Schema (more specific)
export const NotificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.enum(['APPOINTMENT_REMINDER', 'SESSION_CONFIRMED', 'SESSION_CANCELLED', 'MESSAGE_RECEIVED', 'PAYMENT_PROCESSED', 'SYSTEM_MAINTENANCE', 'WELCOME', 'PROFILE_UPDATE', 'WORKSHEET_ASSIGNED', 'GOAL_ACHIEVEMENT', 'THERAPIST_MATCH', 'COMMUNITY_INVITE', 'REVIEW_REQUEST', 'EMERGENCY_ALERT', 'SUBSCRIPTION_EXPIRY', 'SECURITY_ALERT']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// Notification List Parameters Schema
export const NotificationListParamsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  isRead: z.boolean().optional(),
  type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'readAt', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Notification List Response Schema
export const NotificationListResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  total: z.number().min(0),
  page: z.number().min(1),
  limit: z.number().min(1),
  hasMore: z.boolean()
});

// Unread Count Response Schema
export const UnreadCountResponseSchema = z.object({
  unreadCount: z.number().min(0),
  totalCount: z.number().min(0)
});

// Mark Read Response Schema
export const MarkReadResponseSchema = z.object({
  success: z.boolean(),
  markedCount: z.number().min(0),
  message: z.string().optional()
});

// Create Notification Request Schema (for admin)
export const CreateNotificationRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  type: z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).default('SYSTEM_UPDATE'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.string().optional(),
  actionUrl: z.string().url().optional(),
  scheduledFor: z.string().datetime().optional()
});

// Notification Settings Schema
export const NotificationSettingsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  sessionReminders: z.boolean(),
  bookingUpdates: z.boolean(),
  messageNotifications: z.boolean(),
  communityUpdates: z.boolean(),
  systemAlerts: z.boolean(),
  updatedAt: z.string().datetime()
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
export type NotificationListParams = z.infer<typeof NotificationListParamsSchema>;
export type NotificationListResponse = z.infer<typeof NotificationListResponseSchema>;
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;
export type MarkReadResponse = z.infer<typeof MarkReadResponseSchema>;
export type CreateNotificationRequest = z.infer<typeof CreateNotificationRequestSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;