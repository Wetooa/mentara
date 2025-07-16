import { z } from 'zod';
export declare const SubscribeRequestDtoSchema: z.ZodObject<{
    endpoint: z.ZodString;
    keys: z.ZodObject<{
        p256dh: z.ZodString;
        auth: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        p256dh: string;
        auth: string;
    }, {
        p256dh: string;
        auth: string;
    }>;
    userId: z.ZodOptional<z.ZodString>;
    deviceInfo: z.ZodOptional<z.ZodObject<{
        userAgent: z.ZodOptional<z.ZodString>;
        platform: z.ZodOptional<z.ZodString>;
        device: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userAgent?: string | undefined;
        platform?: string | undefined;
        device?: string | undefined;
    }, {
        userAgent?: string | undefined;
        platform?: string | undefined;
        device?: string | undefined;
    }>>;
    preferences: z.ZodOptional<z.ZodObject<{
        sessionReminders: z.ZodDefault<z.ZodBoolean>;
        messageNotifications: z.ZodDefault<z.ZodBoolean>;
        appointmentUpdates: z.ZodDefault<z.ZodBoolean>;
        communityActivity: z.ZodDefault<z.ZodBoolean>;
        systemAlerts: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sessionReminders: boolean;
        messageNotifications: boolean;
        systemAlerts: boolean;
        appointmentUpdates: boolean;
        communityActivity: boolean;
    }, {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    keys: {
        p256dh: string;
        auth: string;
    };
    endpoint: string;
    userId?: string | undefined;
    preferences?: {
        sessionReminders: boolean;
        messageNotifications: boolean;
        systemAlerts: boolean;
        appointmentUpdates: boolean;
        communityActivity: boolean;
    } | undefined;
    deviceInfo?: {
        userAgent?: string | undefined;
        platform?: string | undefined;
        device?: string | undefined;
    } | undefined;
}, {
    keys: {
        p256dh: string;
        auth: string;
    };
    endpoint: string;
    userId?: string | undefined;
    preferences?: {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    } | undefined;
    deviceInfo?: {
        userAgent?: string | undefined;
        platform?: string | undefined;
        device?: string | undefined;
    } | undefined;
}>;
export declare const UnsubscribeRequestDtoSchema: z.ZodObject<{
    endpoint: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodEnum<["user_request", "device_change", "app_uninstall", "expired_subscription"]>>;
}, "strip", z.ZodTypeAny, {
    endpoint: string;
    reason?: "user_request" | "device_change" | "app_uninstall" | "expired_subscription" | undefined;
    userId?: string | undefined;
}, {
    endpoint: string;
    reason?: "user_request" | "device_change" | "app_uninstall" | "expired_subscription" | undefined;
    userId?: string | undefined;
}>;
export declare const TestNotificationRequestDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    badge: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        title: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        action: string;
        icon?: string | undefined;
    }, {
        title: string;
        action: string;
        icon?: string | undefined;
    }>, "many">>;
    requireInteraction: z.ZodDefault<z.ZodBoolean>;
    silent: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    title: string;
    body: string;
    requireInteraction: boolean;
    silent: boolean;
    data?: Record<string, any> | undefined;
    icon?: string | undefined;
    badge?: string | undefined;
    actions?: {
        title: string;
        action: string;
        icon?: string | undefined;
    }[] | undefined;
}, {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any> | undefined;
    icon?: string | undefined;
    badge?: string | undefined;
    actions?: {
        title: string;
        action: string;
        icon?: string | undefined;
    }[] | undefined;
    requireInteraction?: boolean | undefined;
    silent?: boolean | undefined;
}>;
export declare const BulkNotificationRequestDtoSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    body: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    badge: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    userIds: string[];
    body: string;
    expiresAt?: string | undefined;
    scheduledFor?: string | undefined;
    data?: Record<string, any> | undefined;
    icon?: string | undefined;
    badge?: string | undefined;
}, {
    title: string;
    userIds: string[];
    body: string;
    expiresAt?: string | undefined;
    scheduledFor?: string | undefined;
    data?: Record<string, any> | undefined;
    icon?: string | undefined;
    badge?: string | undefined;
}>;
export declare const NotificationTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodEnum<["appointment", "message", "community", "system", "emergency"]>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    isActive: boolean;
    title: string;
    name: string;
    category: "message" | "community" | "emergency" | "appointment" | "system";
    body: string;
    variables?: string[] | undefined;
}, {
    id: string;
    title: string;
    name: string;
    category: "message" | "community" | "emergency" | "appointment" | "system";
    body: string;
    isActive?: boolean | undefined;
    variables?: string[] | undefined;
}>;
export declare const SendTemplateNotificationDtoSchema: z.ZodObject<{
    templateId: z.ZodString;
    userIds: z.ZodArray<z.ZodString, "many">;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userIds: string[];
    templateId: string;
    scheduledFor?: string | undefined;
    variables?: Record<string, string> | undefined;
}, {
    userIds: string[];
    templateId: string;
    scheduledFor?: string | undefined;
    variables?: Record<string, string> | undefined;
}>;
export declare const NotificationAnalyticsQueryDtoSchema: z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["appointment", "message", "community", "system", "emergency"]>>;
    userId: z.ZodOptional<z.ZodString>;
    includeClickThrough: z.ZodDefault<z.ZodBoolean>;
    includeDeliveryRate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    includeClickThrough: boolean;
    includeDeliveryRate: boolean;
    userId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: "message" | "community" | "emergency" | "appointment" | "system" | undefined;
}, {
    userId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: "message" | "community" | "emergency" | "appointment" | "system" | undefined;
    includeClickThrough?: boolean | undefined;
    includeDeliveryRate?: boolean | undefined;
}>;
export declare const UpdateSubscriptionPreferencesDtoSchema: z.ZodObject<{
    subscriptionId: z.ZodString;
    preferences: z.ZodObject<{
        sessionReminders: z.ZodOptional<z.ZodBoolean>;
        messageNotifications: z.ZodOptional<z.ZodBoolean>;
        appointmentUpdates: z.ZodOptional<z.ZodBoolean>;
        communityActivity: z.ZodOptional<z.ZodBoolean>;
        systemAlerts: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    }, {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    }>;
    quietHours: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        startTime: z.ZodOptional<z.ZodString>;
        endTime: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        timezone?: string | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
    }, {
        timezone?: string | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
        enabled?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    subscriptionId: string;
    preferences: {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    };
    quietHours?: {
        enabled: boolean;
        timezone?: string | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
    } | undefined;
}, {
    subscriptionId: string;
    preferences: {
        sessionReminders?: boolean | undefined;
        messageNotifications?: boolean | undefined;
        systemAlerts?: boolean | undefined;
        appointmentUpdates?: boolean | undefined;
        communityActivity?: boolean | undefined;
    };
    quietHours?: {
        timezone?: string | undefined;
        startTime?: string | undefined;
        endTime?: string | undefined;
        enabled?: boolean | undefined;
    } | undefined;
}>;
export type SubscribeRequestDto = z.infer<typeof SubscribeRequestDtoSchema>;
export type UnsubscribeRequestDto = z.infer<typeof UnsubscribeRequestDtoSchema>;
export type TestNotificationRequestDto = z.infer<typeof TestNotificationRequestDtoSchema>;
export type BulkNotificationRequestDto = z.infer<typeof BulkNotificationRequestDtoSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type SendTemplateNotificationDto = z.infer<typeof SendTemplateNotificationDtoSchema>;
export type NotificationAnalyticsQueryDto = z.infer<typeof NotificationAnalyticsQueryDtoSchema>;
export type UpdateSubscriptionPreferencesDto = z.infer<typeof UpdateSubscriptionPreferencesDtoSchema>;
//# sourceMappingURL=push-notifications.d.ts.map