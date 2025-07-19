import { z } from 'zod';
export declare const ModeratorSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    assignedCommunities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    moderationLevel: z.ZodEnum<["basic", "advanced", "admin"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lastActiveAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    id: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    moderationLevel: "admin" | "advanced" | "basic";
    assignedCommunities?: string[] | undefined;
    lastActiveAt?: string | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    id: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    moderationLevel: "admin" | "advanced" | "basic";
    assignedCommunities?: string[] | undefined;
    lastActiveAt?: string | undefined;
}>;
export declare const ModeratorDashboardStatsSchema: z.ZodObject<{
    pendingReports: z.ZodNumber;
    pendingContent: z.ZodNumber;
    resolvedToday: z.ZodNumber;
    flaggedUsers: z.ZodNumber;
    systemAlerts: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    systemAlerts: number;
    pendingReports: number;
    pendingContent: number;
    resolvedToday: number;
    flaggedUsers: number;
}, {
    systemAlerts: number;
    pendingReports: number;
    pendingContent: number;
    resolvedToday: number;
    flaggedUsers: number;
}>;
export declare const ContentModerationParamsSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["post", "comment"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "reportCount", "priority"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "createdAt" | "priority" | "reportCount";
    sortOrder: "asc" | "desc";
    offset: number;
    type?: "post" | "comment" | undefined;
    status?: "approved" | "rejected" | "pending" | undefined;
    priority?: "high" | "medium" | "low" | "urgent" | undefined;
}, {
    type?: "post" | "comment" | undefined;
    status?: "approved" | "rejected" | "pending" | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "priority" | "reportCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "high" | "medium" | "low" | "urgent" | undefined;
    offset?: number | undefined;
}>;
export declare const UserModerationParamsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["active", "suspended", "flagged"]>>;
    role: z.ZodOptional<z.ZodEnum<["client", "therapist"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "active" | "suspended" | "flagged" | undefined;
    role?: "client" | "therapist" | undefined;
    search?: string | undefined;
}, {
    status?: "active" | "suspended" | "flagged" | undefined;
    role?: "client" | "therapist" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    search?: string | undefined;
}>;
export declare const AuditLogParamsSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    userId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: string | undefined;
    entityType?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: string | undefined;
    offset?: number | undefined;
    entityType?: string | undefined;
}>;
export declare const SystemEventParamsSchema: z.ZodObject<{
    eventType: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    component: z.ZodOptional<z.ZodString>;
    isResolved: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    eventType?: string | undefined;
    severity?: "critical" | "high" | "medium" | "low" | undefined;
    component?: string | undefined;
    isResolved?: boolean | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    eventType?: string | undefined;
    severity?: "critical" | "high" | "medium" | "low" | undefined;
    component?: string | undefined;
    isResolved?: boolean | undefined;
}>;
export declare const ModerateContentRequestSchema: z.ZodObject<{
    action: z.ZodEnum<["approve", "reject", "flag", "remove"]>;
    reason: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "remove" | "approve" | "reject" | "flag";
    reason?: string | undefined;
    note?: string | undefined;
}, {
    action: "remove" | "approve" | "reject" | "flag";
    reason?: string | undefined;
    note?: string | undefined;
}>;
export declare const ModerateUserRequestSchema: z.ZodObject<{
    action: z.ZodEnum<["suspend", "warn", "flag", "clearFlags"]>;
    reason: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    action: "flag" | "suspend" | "warn" | "clearFlags";
    duration?: number | undefined;
    note?: string | undefined;
}, {
    reason: string;
    action: "flag" | "suspend" | "warn" | "clearFlags";
    duration?: number | undefined;
    note?: string | undefined;
}>;
export declare const SystemEventSchema: z.ZodObject<{
    id: z.ZodString;
    eventType: z.ZodString;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    component: z.ZodString;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodAny>;
    isResolved: z.ZodDefault<z.ZodBoolean>;
    resolvedAt: z.ZodOptional<z.ZodString>;
    resolvedBy: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    eventType: string;
    severity: "critical" | "high" | "medium" | "low";
    component: string;
    isResolved: boolean;
    metadata?: any;
    resolution?: string | undefined;
    resolvedBy?: string | undefined;
    resolvedAt?: string | undefined;
}, {
    message: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    eventType: string;
    severity: "critical" | "high" | "medium" | "low";
    component: string;
    isResolved?: boolean | undefined;
    metadata?: any;
    resolution?: string | undefined;
    resolvedBy?: string | undefined;
    resolvedAt?: string | undefined;
}>;
export declare const ModerationReportSchema: z.ZodObject<{
    id: z.ZodString;
    reporterId: z.ZodString;
    contentType: z.ZodEnum<["post", "comment", "user"]>;
    contentId: z.ZodString;
    reason: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["pending", "under_review", "resolved", "dismissed"]>;
    priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
    assignedModerator: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    resolvedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "dismissed" | "resolved" | "under_review";
    id: string;
    createdAt: string;
    updatedAt: string;
    reason: string;
    reporterId: string;
    priority: "high" | "medium" | "low" | "urgent";
    contentId: string;
    contentType: "user" | "post" | "comment";
    description?: string | undefined;
    resolution?: string | undefined;
    resolvedAt?: string | undefined;
    assignedModerator?: string | undefined;
}, {
    status: "pending" | "dismissed" | "resolved" | "under_review";
    id: string;
    createdAt: string;
    updatedAt: string;
    reason: string;
    reporterId: string;
    priority: "high" | "medium" | "low" | "urgent";
    contentId: string;
    contentType: "user" | "post" | "comment";
    description?: string | undefined;
    resolution?: string | undefined;
    resolvedAt?: string | undefined;
    assignedModerator?: string | undefined;
}>;
export declare const ContentModerationActionSchema: z.ZodObject<{
    id: z.ZodString;
    moderatorId: z.ZodString;
    contentType: z.ZodEnum<["post", "comment"]>;
    contentId: z.ZodString;
    action: z.ZodEnum<["approve", "reject", "flag", "remove"]>;
    reason: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    action: "remove" | "approve" | "reject" | "flag";
    moderatorId: string;
    contentId: string;
    contentType: "post" | "comment";
    reason?: string | undefined;
    note?: string | undefined;
}, {
    id: string;
    createdAt: string;
    action: "remove" | "approve" | "reject" | "flag";
    moderatorId: string;
    contentId: string;
    contentType: "post" | "comment";
    reason?: string | undefined;
    note?: string | undefined;
}>;
export declare const FlaggedContentSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["post", "comment"]>;
    content: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        id: string;
        name: string;
    }, {
        email: string;
        id: string;
        name: string;
    }>;
    flagCount: z.ZodNumber;
    reports: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        reporterId: z.ZodString;
        contentType: z.ZodEnum<["post", "comment", "user"]>;
        contentId: z.ZodString;
        reason: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodEnum<["pending", "under_review", "resolved", "dismissed"]>;
        priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
        assignedModerator: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        resolvedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "dismissed" | "resolved" | "under_review";
        id: string;
        createdAt: string;
        updatedAt: string;
        reason: string;
        reporterId: string;
        priority: "high" | "medium" | "low" | "urgent";
        contentId: string;
        contentType: "user" | "post" | "comment";
        description?: string | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
        assignedModerator?: string | undefined;
    }, {
        status: "pending" | "dismissed" | "resolved" | "under_review";
        id: string;
        createdAt: string;
        updatedAt: string;
        reason: string;
        reporterId: string;
        priority: "high" | "medium" | "low" | "urgent";
        contentId: string;
        contentType: "user" | "post" | "comment";
        description?: string | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
        assignedModerator?: string | undefined;
    }>, "many">;
    createdAt: z.ZodString;
    lastReportedAt: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high", "urgent"]>;
    status: z.ZodEnum<["pending", "approved", "rejected", "removed"]>;
    title: z.ZodOptional<z.ZodString>;
    community: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>>;
    postTitle: z.ZodOptional<z.ZodString>;
    postId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "post" | "comment";
    status: "approved" | "rejected" | "pending" | "removed";
    id: string;
    createdAt: string;
    content: string;
    priority: "high" | "medium" | "low" | "urgent";
    author: {
        email: string;
        id: string;
        name: string;
    };
    flagCount: number;
    reports: {
        status: "pending" | "dismissed" | "resolved" | "under_review";
        id: string;
        createdAt: string;
        updatedAt: string;
        reason: string;
        reporterId: string;
        priority: "high" | "medium" | "low" | "urgent";
        contentId: string;
        contentType: "user" | "post" | "comment";
        description?: string | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
        assignedModerator?: string | undefined;
    }[];
    lastReportedAt: string;
    title?: string | undefined;
    community?: {
        id: string;
        name: string;
    } | undefined;
    postId?: string | undefined;
    postTitle?: string | undefined;
}, {
    type: "post" | "comment";
    status: "approved" | "rejected" | "pending" | "removed";
    id: string;
    createdAt: string;
    content: string;
    priority: "high" | "medium" | "low" | "urgent";
    author: {
        email: string;
        id: string;
        name: string;
    };
    flagCount: number;
    reports: {
        status: "pending" | "dismissed" | "resolved" | "under_review";
        id: string;
        createdAt: string;
        updatedAt: string;
        reason: string;
        reporterId: string;
        priority: "high" | "medium" | "low" | "urgent";
        contentId: string;
        contentType: "user" | "post" | "comment";
        description?: string | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
        assignedModerator?: string | undefined;
    }[];
    lastReportedAt: string;
    title?: string | undefined;
    community?: {
        id: string;
        name: string;
    } | undefined;
    postId?: string | undefined;
    postTitle?: string | undefined;
}>;
export declare const ModerationActionSchema: z.ZodObject<{
    id: z.ZodString;
    contentType: z.ZodEnum<["post", "comment", "user"]>;
    contentId: z.ZodString;
    action: z.ZodEnum<["approve", "reject", "remove", "flag", "warn", "suspend"]>;
    reason: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
    moderatorId: z.ZodString;
    moderatorName: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    reason: string;
    action: "remove" | "approve" | "reject" | "flag" | "suspend" | "warn";
    moderatorId: string;
    contentId: string;
    contentType: "user" | "post" | "comment";
    moderatorName: string;
    note?: string | undefined;
}, {
    id: string;
    createdAt: string;
    reason: string;
    action: "remove" | "approve" | "reject" | "flag" | "suspend" | "warn";
    moderatorId: string;
    contentId: string;
    contentType: "user" | "post" | "comment";
    moderatorName: string;
    note?: string | undefined;
}>;
export declare const ModerationStatsSchema: z.ZodObject<{
    totalReports: z.ZodNumber;
    pendingReports: z.ZodNumber;
    resolvedToday: z.ZodNumber;
    flaggedContent: z.ZodNumber;
    suspendedUsers: z.ZodNumber;
    averageResponseTime: z.ZodNumber;
    topReportReasons: z.ZodArray<z.ZodObject<{
        reason: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        count: number;
    }, {
        reason: string;
        count: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    averageResponseTime: number;
    pendingReports: number;
    resolvedToday: number;
    totalReports: number;
    flaggedContent: number;
    suspendedUsers: number;
    topReportReasons: {
        reason: string;
        count: number;
    }[];
}, {
    averageResponseTime: number;
    pendingReports: number;
    resolvedToday: number;
    totalReports: number;
    flaggedContent: number;
    suspendedUsers: number;
    topReportReasons: {
        reason: string;
        count: number;
    }[];
}>;
export declare const ContentModerationFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["post", "comment"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "removed"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    reportReason: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    communityId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "reportCount", "priority", "lastReportedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "createdAt" | "priority" | "reportCount" | "lastReportedAt";
    sortOrder: "asc" | "desc";
    offset: number;
    type?: "post" | "comment" | undefined;
    status?: "approved" | "rejected" | "pending" | "removed" | undefined;
    priority?: "high" | "medium" | "low" | "urgent" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    authorId?: string | undefined;
    reportReason?: string | undefined;
}, {
    type?: "post" | "comment" | undefined;
    status?: "approved" | "rejected" | "pending" | "removed" | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "priority" | "reportCount" | "lastReportedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "high" | "medium" | "low" | "urgent" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    offset?: number | undefined;
    communityId?: string | undefined;
    authorId?: string | undefined;
    reportReason?: string | undefined;
}>;
export declare const BulkModerationRequestSchema: z.ZodObject<{
    contentIds: z.ZodArray<z.ZodString, "many">;
    action: z.ZodEnum<["approve", "reject", "remove"]>;
    reason: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    action: "remove" | "approve" | "reject";
    contentIds: string[];
    note?: string | undefined;
}, {
    reason: string;
    action: "remove" | "approve" | "reject";
    contentIds: string[];
    note?: string | undefined;
}>;
export declare const ReportSubmissionSchema: z.ZodObject<{
    contentType: z.ZodEnum<["post", "comment", "user"]>;
    contentId: z.ZodString;
    reason: z.ZodString;
    description: z.ZodString;
    evidence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    description: string;
    contentId: string;
    contentType: "user" | "post" | "comment";
    evidence?: string[] | undefined;
}, {
    reason: string;
    description: string;
    contentId: string;
    contentType: "user" | "post" | "comment";
    evidence?: string[] | undefined;
}>;
export type Moderator = z.infer<typeof ModeratorSchema>;
export type ModeratorDashboardStats = z.infer<typeof ModeratorDashboardStatsSchema>;
export type ContentModerationParams = z.infer<typeof ContentModerationParamsSchema>;
export type UserModerationParams = z.infer<typeof UserModerationParamsSchema>;
export type AuditLogParams = z.infer<typeof AuditLogParamsSchema>;
export type SystemEventParams = z.infer<typeof SystemEventParamsSchema>;
export type ModerateContentRequest = z.infer<typeof ModerateContentRequestSchema>;
export type ModerateUserRequest = z.infer<typeof ModerateUserRequestSchema>;
export type SystemEvent = z.infer<typeof SystemEventSchema>;
export type ModerationReport = z.infer<typeof ModerationReportSchema>;
export type ContentModerationAction = z.infer<typeof ContentModerationActionSchema>;
export type FlaggedContent = z.infer<typeof FlaggedContentSchema>;
export type ModerationAction = z.infer<typeof ModerationActionSchema>;
export type ModerationStats = z.infer<typeof ModerationStatsSchema>;
export type ContentModerationFilters = z.infer<typeof ContentModerationFiltersSchema>;
export type BulkModerationRequest = z.infer<typeof BulkModerationRequestSchema>;
export type ReportSubmission = z.infer<typeof ReportSubmissionSchema>;
//# sourceMappingURL=moderator.d.ts.map