import { z } from 'zod';
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
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
    type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
    userId: string;
    title: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    isRead: boolean;
    isArchived: boolean;
    readAt?: string | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
}, {
    id: string;
    createdAt: string;
    message: string;
    type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
    userId: string;
    title: string;
    isRead: boolean;
    isArchived: boolean;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    readAt?: string | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
}>;
export declare const CreateNotificationDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    relatedEntityId: z.ZodOptional<z.ZodString>;
    relatedEntityType: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
    userId: string;
    title: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
    scheduledFor?: string | undefined;
}, {
    message: string;
    userId: string;
    title: string;
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
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
    type: z.ZodOptional<z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "readAt", "type"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "type" | "readAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "type" | "readAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const NotificationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const NotificationFilterSchema: z.ZodObject<{
    isRead: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodOptional<z.ZodEnum<["APPOINTMENT_REMINDER", "SESSION_CONFIRMED", "SESSION_CANCELLED", "MESSAGE_RECEIVED", "PAYMENT_PROCESSED", "SYSTEM_MAINTENANCE", "WELCOME", "PROFILE_UPDATE", "WORKSHEET_ASSIGNED", "GOAL_ACHIEVEMENT", "THERAPIST_MATCH", "COMMUNITY_INVITE", "REVIEW_REQUEST", "EMERGENCY_ALERT", "SUBSCRIPTION_EXPIRY", "SECURITY_ALERT"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "MESSAGE_RECEIVED" | "WORKSHEET_ASSIGNED" | "REVIEW_REQUEST" | "SECURITY_ALERT" | "SESSION_CONFIRMED" | "SESSION_CANCELLED" | "PAYMENT_PROCESSED" | "WELCOME" | "PROFILE_UPDATE" | "GOAL_ACHIEVEMENT" | "THERAPIST_MATCH" | "COMMUNITY_INVITE" | "EMERGENCY_ALERT" | "SUBSCRIPTION_EXPIRY" | undefined;
    priority?: "LOW" | "HIGH" | "URGENT" | "MEDIUM" | undefined;
    isRead?: boolean | undefined;
}, {
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "MESSAGE_RECEIVED" | "WORKSHEET_ASSIGNED" | "REVIEW_REQUEST" | "SECURITY_ALERT" | "SESSION_CONFIRMED" | "SESSION_CANCELLED" | "PAYMENT_PROCESSED" | "WELCOME" | "PROFILE_UPDATE" | "GOAL_ACHIEVEMENT" | "THERAPIST_MATCH" | "COMMUNITY_INVITE" | "EMERGENCY_ALERT" | "SUBSCRIPTION_EXPIRY" | undefined;
    priority?: "LOW" | "HIGH" | "URGENT" | "MEDIUM" | undefined;
    isRead?: boolean | undefined;
}>;
export declare const NotificationListParamsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    isRead: z.ZodOptional<z.ZodBoolean>;
    type: z.ZodOptional<z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "readAt", "type"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "createdAt" | "type" | "readAt";
    sortOrder: "asc" | "desc";
    offset: number;
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    isRead?: boolean | undefined;
}, {
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "type" | "readAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    isRead?: boolean | undefined;
    offset?: number | undefined;
}>;
export declare const NotificationListResponseSchema: z.ZodObject<{
    notifications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        title: z.ZodString;
        message: z.ZodString;
        type: z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>;
        priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
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
        type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
        userId: string;
        title: string;
        priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
        isRead: boolean;
        isArchived: boolean;
        readAt?: string | undefined;
        relatedEntityId?: string | undefined;
        relatedEntityType?: string | undefined;
        actionUrl?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        message: string;
        type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
        userId: string;
        title: string;
        isRead: boolean;
        isArchived: boolean;
        priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
        readAt?: string | undefined;
        relatedEntityId?: string | undefined;
        relatedEntityType?: string | undefined;
        actionUrl?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    notifications: {
        id: string;
        createdAt: string;
        message: string;
        type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
        userId: string;
        title: string;
        priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
        isRead: boolean;
        isArchived: boolean;
        readAt?: string | undefined;
        relatedEntityId?: string | undefined;
        relatedEntityType?: string | undefined;
        actionUrl?: string | undefined;
    }[];
}, {
    page: number;
    limit: number;
    hasMore: boolean;
    total: number;
    notifications: {
        id: string;
        createdAt: string;
        message: string;
        type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
        userId: string;
        title: string;
        isRead: boolean;
        isArchived: boolean;
        priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
        readAt?: string | undefined;
        relatedEntityId?: string | undefined;
        relatedEntityType?: string | undefined;
        actionUrl?: string | undefined;
    }[];
}>;
export declare const UnreadCountResponseSchema: z.ZodObject<{
    unreadCount: z.ZodNumber;
    totalCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalCount: number;
    unreadCount: number;
}, {
    totalCount: number;
    unreadCount: number;
}>;
export declare const MarkReadResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    markedCount: z.ZodNumber;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    markedCount: number;
    message?: string | undefined;
}, {
    success: boolean;
    markedCount: number;
    message?: string | undefined;
}>;
export declare const CreateNotificationRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_RESCHEDULED", "MESSAGE_RECEIVED", "MESSAGE_REACTION", "WORKSHEET_ASSIGNED", "WORKSHEET_DUE", "WORKSHEET_FEEDBACK", "REVIEW_REQUEST", "REVIEW_RECEIVED", "THERAPIST_APPLICATION", "THERAPIST_APPROVED", "THERAPIST_REJECTED", "THERAPIST_STATUS_UPDATED", "THERAPIST_REQUEST_ACCEPTED", "THERAPIST_REQUEST_DECLINED", "ALTERNATIVE_RECOMMENDATIONS", "CLIENT_REQUEST_RECEIVED", "CLIENT_REQUEST_CANCELLED", "PROFILE_COMPLETION", "COMMUNITY_POST", "COMMUNITY_REPLY", "COMMUNITY_RECOMMENDATION", "COMMUNITY_JOINED", "COMMUNITY_WELCOME", "RECOMMENDATIONS_UPDATED", "NEW_RECOMMENDATIONS", "RELATIONSHIP_ESTABLISHED", "REQUEST_REMINDER", "SYSTEM_MAINTENANCE", "SYSTEM_UPDATE", "SECURITY_ALERT", "SCHEDULING_INFO", "PAYMENT_SUCCESS", "PAYMENT_FAILED", "SUBSCRIPTION_EXPIRING"]>>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>>;
    relatedEntityId: z.ZodOptional<z.ZodString>;
    relatedEntityType: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING";
    userId: string;
    title: string;
    priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
    scheduledFor?: string | undefined;
}, {
    message: string;
    userId: string;
    title: string;
    type?: "SYSTEM_MAINTENANCE" | "APPOINTMENT_REMINDER" | "APPOINTMENT_CONFIRMED" | "APPOINTMENT_CANCELLED" | "APPOINTMENT_RESCHEDULED" | "MESSAGE_RECEIVED" | "MESSAGE_REACTION" | "WORKSHEET_ASSIGNED" | "WORKSHEET_DUE" | "WORKSHEET_FEEDBACK" | "REVIEW_REQUEST" | "REVIEW_RECEIVED" | "THERAPIST_APPLICATION" | "THERAPIST_APPROVED" | "THERAPIST_REJECTED" | "THERAPIST_STATUS_UPDATED" | "THERAPIST_REQUEST_ACCEPTED" | "THERAPIST_REQUEST_DECLINED" | "ALTERNATIVE_RECOMMENDATIONS" | "CLIENT_REQUEST_RECEIVED" | "CLIENT_REQUEST_CANCELLED" | "PROFILE_COMPLETION" | "COMMUNITY_POST" | "COMMUNITY_REPLY" | "COMMUNITY_RECOMMENDATION" | "COMMUNITY_JOINED" | "COMMUNITY_WELCOME" | "RECOMMENDATIONS_UPDATED" | "NEW_RECOMMENDATIONS" | "RELATIONSHIP_ESTABLISHED" | "REQUEST_REMINDER" | "SYSTEM_UPDATE" | "SECURITY_ALERT" | "SCHEDULING_INFO" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SUBSCRIPTION_EXPIRING" | undefined;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
    relatedEntityId?: string | undefined;
    relatedEntityType?: string | undefined;
    actionUrl?: string | undefined;
    scheduledFor?: string | undefined;
}>;
export declare const NotificationSettingsSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    emailNotifications: z.ZodBoolean;
    pushNotifications: z.ZodBoolean;
    smsNotifications: z.ZodBoolean;
    sessionReminders: z.ZodBoolean;
    bookingUpdates: z.ZodBoolean;
    messageNotifications: z.ZodBoolean;
    communityUpdates: z.ZodBoolean;
    systemAlerts: z.ZodBoolean;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: string;
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
    id: string;
    updatedAt: string;
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
//# sourceMappingURL=notifications.d.ts.map