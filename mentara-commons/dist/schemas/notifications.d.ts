import { z } from 'zod';
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<["info", "warning", "error", "success", "reminder"]>;
    category: z.ZodEnum<["session", "booking", "message", "system", "community", "payment"]>;
    isRead: z.ZodBoolean;
    isArchived: z.ZodBoolean;
    relatedEntityId: z.ZodOptional<z.ZodString>;
    relatedEntityType: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    readAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    message: string;
    type: "error" | "success" | "info" | "warning" | "reminder";
    userId: string;
    title: string;
    isRead: boolean;
    category: "message" | "session" | "booking" | "system" | "community" | "payment";
    isArchived: boolean;
    readAt?: string | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
}, {
    id: string;
    createdAt: string;
    message: string;
    type: "error" | "success" | "info" | "warning" | "reminder";
    userId: string;
    title: string;
    isRead: boolean;
    category: "message" | "session" | "booking" | "system" | "community" | "payment";
    isArchived: boolean;
    readAt?: string | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
}>;
export declare const CreateNotificationDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "success", "reminder"]>>;
    category: z.ZodEnum<["session", "booking", "message", "system", "community", "payment"]>;
    relatedEntityId: z.ZodOptional<z.ZodString>;
    relatedEntityType: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "error" | "success" | "info" | "warning" | "reminder";
    userId: string;
    title: string;
    category: "message" | "session" | "booking" | "system" | "community" | "payment";
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
    scheduledFor?: string | undefined;
}, {
    message: string;
    userId: string;
    title: string;
    category: "message" | "session" | "booking" | "system" | "community" | "payment";
    type?: "error" | "success" | "info" | "warning" | "reminder" | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
    scheduledFor?: string | undefined;
}>;
export declare const UpdateNotificationDtoSchema: z.ZodObject<{
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const BulkUpdateNotificationsDtoSchema: z.ZodObject<{
    notificationIds: z.ZodArray<z.ZodString, "many">;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    notificationIds: string[];
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    notificationIds: string[];
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    userId: z.ZodString;
    emailNotifications: z.ZodBoolean;
    pushNotifications: z.ZodBoolean;
    smsNotifications: z.ZodBoolean;
    sessionReminders: z.ZodBoolean;
    bookingUpdates: z.ZodBoolean;
    messageNotifications: z.ZodBoolean;
    communityUpdates: z.ZodBoolean;
    systemAlerts: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    sessionReminders: boolean;
    bookingUpdates: boolean;
    messageNotifications: boolean;
    communityUpdates: boolean;
    systemAlerts: boolean;
}, {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    sessionReminders: boolean;
    bookingUpdates: boolean;
    messageNotifications: boolean;
    communityUpdates: boolean;
    systemAlerts: boolean;
}>;
export declare const UpdateNotificationPreferencesDtoSchema: z.ZodObject<{
    emailNotifications: z.ZodOptional<z.ZodBoolean>;
    pushNotifications: z.ZodOptional<z.ZodBoolean>;
    smsNotifications: z.ZodOptional<z.ZodBoolean>;
    sessionReminders: z.ZodOptional<z.ZodBoolean>;
    bookingUpdates: z.ZodOptional<z.ZodBoolean>;
    messageNotifications: z.ZodOptional<z.ZodBoolean>;
    communityUpdates: z.ZodOptional<z.ZodBoolean>;
    systemAlerts: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    emailNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    smsNotifications?: boolean | undefined;
    sessionReminders?: boolean | undefined;
    bookingUpdates?: boolean | undefined;
    messageNotifications?: boolean | undefined;
    communityUpdates?: boolean | undefined;
    systemAlerts?: boolean | undefined;
}, {
    emailNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    smsNotifications?: boolean | undefined;
    sessionReminders?: boolean | undefined;
    bookingUpdates?: boolean | undefined;
    messageNotifications?: boolean | undefined;
    communityUpdates?: boolean | undefined;
    systemAlerts?: boolean | undefined;
}>;
export declare const NotificationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "success", "reminder"]>>;
    category: z.ZodOptional<z.ZodEnum<["session", "booking", "message", "system", "community", "payment"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "readAt", "type"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "error" | "success" | "info" | "warning" | "reminder" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "type" | "readAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isRead?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: "message" | "session" | "booking" | "system" | "community" | "payment" | undefined;
    isArchived?: boolean | undefined;
}, {
    type?: "error" | "success" | "info" | "warning" | "reminder" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "type" | "readAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isRead?: boolean | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    category?: "message" | "session" | "booking" | "system" | "community" | "payment" | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const NotificationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotificationDto = z.infer<typeof CreateNotificationDtoSchema>;
export type UpdateNotificationDto = z.infer<typeof UpdateNotificationDtoSchema>;
export type BulkUpdateNotificationsDto = z.infer<typeof BulkUpdateNotificationsDtoSchema>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export type UpdateNotificationPreferencesDto = z.infer<typeof UpdateNotificationPreferencesDtoSchema>;
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;
export type NotificationIdParam = z.infer<typeof NotificationIdParamSchema>;
//# sourceMappingURL=notifications.d.ts.map