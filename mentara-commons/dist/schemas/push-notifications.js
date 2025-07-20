"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSubscriptionPreferencesDtoSchema = exports.NotificationAnalyticsQueryDtoSchema = exports.SendTemplateNotificationDtoSchema = exports.NotificationTemplateSchema = exports.BulkNotificationRequestDtoSchema = exports.TestNotificationRequestDtoSchema = exports.UnsubscribeRequestDtoSchema = exports.SubscribeRequestDtoSchema = void 0;
const zod_1 = require("zod");
// Push Notification Subscription Schema
exports.SubscribeRequestDtoSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url('Invalid endpoint URL'),
    keys: zod_1.z.object({
        p256dh: zod_1.z.string().min(1, 'p256dh key is required'),
        auth: zod_1.z.string().min(1, 'auth key is required')
    }),
    userId: zod_1.z.string().uuid('Invalid user ID format').optional(),
    deviceInfo: zod_1.z.object({
        userAgent: zod_1.z.string().optional(),
        platform: zod_1.z.string().optional(),
        device: zod_1.z.string().optional()
    }).optional(),
    preferences: zod_1.z.object({
        sessionReminders: zod_1.z.boolean().default(true),
        messageNotifications: zod_1.z.boolean().default(true),
        appointmentUpdates: zod_1.z.boolean().default(true),
        communityActivity: zod_1.z.boolean().default(false),
        systemAlerts: zod_1.z.boolean().default(true)
    }).optional()
});
exports.UnsubscribeRequestDtoSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url('Invalid endpoint URL'),
    userId: zod_1.z.string().uuid('Invalid user ID format').optional(),
    reason: zod_1.z.enum(['user_request', 'device_change', 'app_uninstall', 'expired_subscription']).optional()
});
exports.TestNotificationRequestDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title too long'),
    body: zod_1.z.string().min(1, 'Body is required').max(300, 'Body too long'),
    icon: zod_1.z.string().url().optional(),
    badge: zod_1.z.string().url().optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    actions: zod_1.z.array(zod_1.z.object({
        action: zod_1.z.string().min(1, 'Action is required'),
        title: zod_1.z.string().min(1, 'Action title is required'),
        icon: zod_1.z.string().url().optional()
    })).optional(),
    requireInteraction: zod_1.z.boolean().default(false),
    silent: zod_1.z.boolean().default(false)
});
// Bulk notification schemas
exports.BulkNotificationRequestDtoSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one user ID is required').max(1000, 'Too many users'),
    title: zod_1.z.string().min(1, 'Title is required').max(100, 'Title too long'),
    body: zod_1.z.string().min(1, 'Body is required').max(300, 'Body too long'),
    icon: zod_1.z.string().url().optional(),
    badge: zod_1.z.string().url().optional(),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    scheduledFor: zod_1.z.string().datetime().optional(),
    expiresAt: zod_1.z.string().datetime().optional()
});
// Notification template schemas
exports.NotificationTemplateSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Template ID is required'),
    name: zod_1.z.string().min(1, 'Template name is required'),
    title: zod_1.z.string().min(1, 'Title template is required'),
    body: zod_1.z.string().min(1, 'Body template is required'),
    variables: zod_1.z.array(zod_1.z.string()).optional(), // Variables that can be replaced in template
    category: zod_1.z.enum(['appointment', 'message', 'community', 'system', 'emergency']),
    isActive: zod_1.z.boolean().default(true)
});
exports.SendTemplateNotificationDtoSchema = zod_1.z.object({
    templateId: zod_1.z.string().min(1, 'Template ID is required'),
    userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one user ID is required'),
    variables: zod_1.z.record(zod_1.z.string()).optional(), // Key-value pairs for template variables
    scheduledFor: zod_1.z.string().datetime().optional()
});
// Notification analytics schemas
exports.NotificationAnalyticsQueryDtoSchema = zod_1.z.object({
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    category: zod_1.z.enum(['appointment', 'message', 'community', 'system', 'emergency']).optional(),
    userId: zod_1.z.string().uuid().optional(),
    includeClickThrough: zod_1.z.boolean().default(true),
    includeDeliveryRate: zod_1.z.boolean().default(true)
});
// Subscription management schemas
exports.UpdateSubscriptionPreferencesDtoSchema = zod_1.z.object({
    subscriptionId: zod_1.z.string().min(1, 'Subscription ID is required'),
    preferences: zod_1.z.object({
        sessionReminders: zod_1.z.boolean().optional(),
        messageNotifications: zod_1.z.boolean().optional(),
        appointmentUpdates: zod_1.z.boolean().optional(),
        communityActivity: zod_1.z.boolean().optional(),
        systemAlerts: zod_1.z.boolean().optional()
    }),
    quietHours: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        startTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        endTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        timezone: zod_1.z.string().optional()
    }).optional()
});
//# sourceMappingURL=push-notifications.js.map