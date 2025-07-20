"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSettingsSchema = exports.CreateNotificationRequestSchema = exports.MarkReadResponseSchema = exports.UnreadCountResponseSchema = exports.NotificationListResponseSchema = exports.NotificationListParamsSchema = exports.NotificationFilterSchema = exports.NotificationIdParamSchema = exports.NotificationQuerySchema = exports.UpdateNotificationPreferencesDtoSchema = exports.NotificationPreferencesSchema = exports.BulkUpdateNotificationsDtoSchema = exports.UpdateNotificationDtoSchema = exports.CreateNotificationDtoSchema = exports.NotificationSchema = void 0;
const zod_1 = require("zod");
// Notification Schema
exports.NotificationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    isRead: zod_1.z.boolean(),
    isArchived: zod_1.z.boolean(),
    relatedEntityId: zod_1.z.string().uuid().optional(),
    relatedEntityType: zod_1.z.string().optional(),
    actionUrl: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.string().datetime(),
    readAt: zod_1.z.string().datetime().optional()
});
// Create Notification Schema
exports.CreateNotificationDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title too long'),
    message: zod_1.z.string().min(1, 'Message is required').max(500, 'Message too long'),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).default('SYSTEM_UPDATE'),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    relatedEntityId: zod_1.z.string().uuid().optional(),
    relatedEntityType: zod_1.z.string().optional(),
    actionUrl: zod_1.z.string().url().optional(),
    scheduledFor: zod_1.z.string().datetime().optional()
});
// Update Notification Schema
exports.UpdateNotificationDtoSchema = zod_1.z.object({
    isRead: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional()
});
// Bulk Update Notifications Schema
exports.BulkUpdateNotificationsDtoSchema = zod_1.z.object({
    notificationIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one notification ID is required'),
    isRead: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional()
});
// Push Notification Preferences Schema
exports.NotificationPreferencesSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    emailNotifications: zod_1.z.boolean(),
    pushNotifications: zod_1.z.boolean(),
    smsNotifications: zod_1.z.boolean(),
    sessionReminders: zod_1.z.boolean(),
    bookingUpdates: zod_1.z.boolean(),
    messageNotifications: zod_1.z.boolean(),
    communityUpdates: zod_1.z.boolean(),
    systemAlerts: zod_1.z.boolean()
});
// Update Notification Preferences Schema
exports.UpdateNotificationPreferencesDtoSchema = zod_1.z.object({
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
    sessionReminders: zod_1.z.boolean().optional(),
    bookingUpdates: zod_1.z.boolean().optional(),
    messageNotifications: zod_1.z.boolean().optional(),
    communityUpdates: zod_1.z.boolean().optional(),
    systemAlerts: zod_1.z.boolean().optional()
});
// Notification Query Parameters
exports.NotificationQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    isRead: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).optional(),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'readAt', 'type']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Parameter Schemas
exports.NotificationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid notification ID format')
});
// Alternative Notification Query Schema (more specific)
exports.NotificationFilterSchema = zod_1.z.object({
    isRead: zod_1.z.boolean().optional(),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'SESSION_CONFIRMED', 'SESSION_CANCELLED', 'MESSAGE_RECEIVED', 'PAYMENT_PROCESSED', 'SYSTEM_MAINTENANCE', 'WELCOME', 'PROFILE_UPDATE', 'WORKSHEET_ASSIGNED', 'GOAL_ACHIEVEMENT', 'THERAPIST_MATCH', 'COMMUNITY_INVITE', 'REVIEW_REQUEST', 'EMERGENCY_ALERT', 'SUBSCRIPTION_EXPIRY', 'SECURITY_ALERT']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});
// Notification List Parameters Schema
exports.NotificationListParamsSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    isRead: zod_1.z.boolean().optional(),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).optional(),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'readAt', 'type']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Notification List Response Schema
exports.NotificationListResponseSchema = zod_1.z.object({
    notifications: zod_1.z.array(exports.NotificationSchema),
    total: zod_1.z.number().min(0),
    page: zod_1.z.number().min(1),
    limit: zod_1.z.number().min(1),
    hasMore: zod_1.z.boolean()
});
// Unread Count Response Schema
exports.UnreadCountResponseSchema = zod_1.z.object({
    unreadCount: zod_1.z.number().min(0),
    totalCount: zod_1.z.number().min(0)
});
// Mark Read Response Schema
exports.MarkReadResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    markedCount: zod_1.z.number().min(0),
    message: zod_1.z.string().optional()
});
// Create Notification Request Schema (for admin)
exports.CreateNotificationRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title too long'),
    message: zod_1.z.string().min(1, 'Message is required').max(500, 'Message too long'),
    type: zod_1.z.enum(['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'MESSAGE_RECEIVED', 'MESSAGE_REACTION', 'WORKSHEET_ASSIGNED', 'WORKSHEET_DUE', 'WORKSHEET_FEEDBACK', 'REVIEW_REQUEST', 'REVIEW_RECEIVED', 'THERAPIST_APPLICATION', 'THERAPIST_APPROVED', 'THERAPIST_REJECTED', 'THERAPIST_STATUS_UPDATED', 'THERAPIST_REQUEST_ACCEPTED', 'THERAPIST_REQUEST_DECLINED', 'ALTERNATIVE_RECOMMENDATIONS', 'CLIENT_REQUEST_RECEIVED', 'CLIENT_REQUEST_CANCELLED', 'PROFILE_COMPLETION', 'COMMUNITY_POST', 'COMMUNITY_REPLY', 'COMMUNITY_RECOMMENDATION', 'COMMUNITY_JOINED', 'COMMUNITY_WELCOME', 'RECOMMENDATIONS_UPDATED', 'NEW_RECOMMENDATIONS', 'RELATIONSHIP_ESTABLISHED', 'REQUEST_REMINDER', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SECURITY_ALERT', 'SCHEDULING_INFO', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING']).default('SYSTEM_UPDATE'),
    priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
    relatedEntityId: zod_1.z.string().uuid().optional(),
    relatedEntityType: zod_1.z.string().optional(),
    actionUrl: zod_1.z.string().url().optional(),
    scheduledFor: zod_1.z.string().datetime().optional()
});
// Notification Settings Schema
exports.NotificationSettingsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    emailNotifications: zod_1.z.boolean(),
    pushNotifications: zod_1.z.boolean(),
    smsNotifications: zod_1.z.boolean(),
    sessionReminders: zod_1.z.boolean(),
    bookingUpdates: zod_1.z.boolean(),
    messageNotifications: zod_1.z.boolean(),
    communityUpdates: zod_1.z.boolean(),
    systemAlerts: zod_1.z.boolean(),
    updatedAt: zod_1.z.string().datetime()
});
//# sourceMappingURL=notifications.js.map