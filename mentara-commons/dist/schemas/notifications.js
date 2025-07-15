"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationIdParamSchema = exports.NotificationQuerySchema = exports.UpdateNotificationPreferencesDtoSchema = exports.NotificationPreferencesSchema = exports.BulkUpdateNotificationsDtoSchema = exports.UpdateNotificationDtoSchema = exports.CreateNotificationDtoSchema = exports.NotificationSchema = void 0;
const zod_1 = require("zod");
// Notification Schema
exports.NotificationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    type: zod_1.z.enum(['info', 'warning', 'error', 'success', 'reminder']),
    category: zod_1.z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']),
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
    type: zod_1.z.enum(['info', 'warning', 'error', 'success', 'reminder']).default('info'),
    category: zod_1.z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']),
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
    type: zod_1.z.enum(['info', 'warning', 'error', 'success', 'reminder']).optional(),
    category: zod_1.z.enum(['session', 'booking', 'message', 'system', 'community', 'payment']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'readAt', 'type']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Parameter Schemas
exports.NotificationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid notification ID format')
});
//# sourceMappingURL=notifications.js.map