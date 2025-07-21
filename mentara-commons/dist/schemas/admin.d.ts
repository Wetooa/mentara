import { z } from "zod";
export declare const CreateAdminDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}, {
    userId: string;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}>;
export declare const UpdateAdminDtoSchema: z.ZodObject<{
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}, {
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}>;
export declare const AdminResponseDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    adminLevel: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}, {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    permissions?: string[] | undefined;
    adminLevel?: string | undefined;
}>;
export declare const AdminQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    adminLevel: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "adminLevel"]>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "adminLevel" | undefined;
    adminLevel?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "adminLevel" | undefined;
    adminLevel?: string | undefined;
}>;
export declare const AdminUserQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "firstName", "lastName", "email", "role"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "createdAt" | "role" | "firstName" | "lastName" | "email";
    sortOrder: "asc" | "desc";
    status?: "active" | "inactive" | "suspended" | undefined;
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    search?: string | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    sortBy?: "createdAt" | "role" | "firstName" | "lastName" | "email" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    search?: string | undefined;
}>;
export declare const AdminIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ApproveTherapistDtoSchema: z.ZodObject<{
    approvalMessage: z.ZodOptional<z.ZodString>;
    verifyLicense: z.ZodDefault<z.ZodBoolean>;
    grantSpecialPermissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    verifyLicense: boolean;
    approvalMessage?: string | undefined;
    grantSpecialPermissions?: string[] | undefined;
}, {
    approvalMessage?: string | undefined;
    verifyLicense?: boolean | undefined;
    grantSpecialPermissions?: string[] | undefined;
}>;
export declare const RejectTherapistDtoSchema: z.ZodObject<{
    rejectionReason: z.ZodEnum<["incomplete_documentation", "invalid_license", "failed_verification", "policy_violation", "other"]>;
    rejectionMessage: z.ZodString;
    allowReapplication: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rejectionReason: "other" | "incomplete_documentation" | "invalid_license" | "failed_verification" | "policy_violation";
    rejectionMessage: string;
    allowReapplication: boolean;
}, {
    rejectionReason: "other" | "incomplete_documentation" | "invalid_license" | "failed_verification" | "policy_violation";
    rejectionMessage: string;
    allowReapplication?: boolean | undefined;
}>;
export declare const UpdateTherapistStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "approved", "rejected", "suspended", "under_review"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "rejected" | "suspended" | "approved" | "under_review";
    reason?: string | undefined;
}, {
    status: "pending" | "rejected" | "suspended" | "approved" | "under_review";
    reason?: string | undefined;
}>;
export declare const PendingTherapistFiltersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "suspended"]>>;
    province: z.ZodOptional<z.ZodString>;
    submittedAfter: z.ZodOptional<z.ZodString>;
    processedBy: z.ZodOptional<z.ZodString>;
    providerType: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
    province?: string | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
    providerType?: string | undefined;
}, {
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
    limit?: number | undefined;
    province?: string | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
    providerType?: string | undefined;
}>;
export type CreateAdminDto = z.infer<typeof CreateAdminDtoSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminDtoSchema>;
export type AdminResponseDto = z.infer<typeof AdminResponseDtoSchema>;
export type AdminQuery = z.infer<typeof AdminQuerySchema>;
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
export type AdminIdParam = z.infer<typeof AdminIdParamSchema>;
export declare const AdminAnalyticsQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const AdminUserListParamsDtoSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "firstName", "lastName", "email", "role"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "createdAt" | "role" | "firstName" | "lastName" | "email";
    sortOrder: "asc" | "desc";
    offset: number;
    status?: "active" | "inactive" | "suspended" | undefined;
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    search?: string | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    limit?: number | undefined;
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    sortBy?: "createdAt" | "role" | "firstName" | "lastName" | "email" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    offset?: number | undefined;
    search?: string | undefined;
}>;
export declare const AdminUserGrowthParamsDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "day" | "week" | "month";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    granularity?: "day" | "week" | "month" | undefined;
}>;
export declare const AdminEngagementParamsDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "day" | "week" | "month";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    granularity?: "day" | "week" | "month" | undefined;
}>;
export declare const AdminModerationReportParamsDtoSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "resolved", "dismissed"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    type?: string | undefined;
    status?: "pending" | "resolved" | "dismissed" | undefined;
    assignedTo?: string | undefined;
}, {
    type?: string | undefined;
    status?: "pending" | "resolved" | "dismissed" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    assignedTo?: string | undefined;
}>;
export declare const AdminTherapistApplicationParamsDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "suspended"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
}, {
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const AdminTherapistApplicationFiltersDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "suspended"]>>;
    province: z.ZodOptional<z.ZodString>;
    submittedAfter: z.ZodOptional<z.ZodString>;
    processedBy: z.ZodOptional<z.ZodString>;
    providerType: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
    province?: string | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
    providerType?: string | undefined;
}, {
    status?: "pending" | "rejected" | "suspended" | "approved" | undefined;
    limit?: number | undefined;
    province?: string | undefined;
    submittedAfter?: string | undefined;
    processedBy?: string | undefined;
    providerType?: string | undefined;
}>;
export declare const AdminMatchingPerformanceParamsDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const AdminFlaggedContentParamsDtoSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: string | undefined;
}, {
    type?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ApproveTherapistDto = z.infer<typeof ApproveTherapistDtoSchema>;
export type RejectTherapistDto = z.infer<typeof RejectTherapistDtoSchema>;
export type UpdateTherapistStatusDto = z.infer<typeof UpdateTherapistStatusDtoSchema>;
export type PendingTherapistFiltersDto = z.infer<typeof PendingTherapistFiltersDtoSchema>;
export type AdminAnalyticsQuery = z.infer<typeof AdminAnalyticsQuerySchema>;
export type AdminUserListParamsDto = z.infer<typeof AdminUserListParamsDtoSchema>;
export type AdminUserGrowthParamsDto = z.infer<typeof AdminUserGrowthParamsDtoSchema>;
export type AdminEngagementParamsDto = z.infer<typeof AdminEngagementParamsDtoSchema>;
export type AdminModerationReportParamsDto = z.infer<typeof AdminModerationReportParamsDtoSchema>;
export type AdminTherapistApplicationParamsDto = z.infer<typeof AdminTherapistApplicationParamsDtoSchema>;
export type AdminTherapistApplicationFiltersDto = z.infer<typeof AdminTherapistApplicationFiltersDtoSchema>;
export type AdminMatchingPerformanceParamsDto = z.infer<typeof AdminMatchingPerformanceParamsDtoSchema>;
export type AdminFlaggedContentParamsDto = z.infer<typeof AdminFlaggedContentParamsDtoSchema>;
export declare const UserGrowthDataSchema: z.ZodObject<{
    date: z.ZodString;
    totalUsers: z.ZodNumber;
    newUsers: z.ZodNumber;
    activeUsers: z.ZodNumber;
    userType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userType: string;
}, {
    date: string;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userType: string;
}>;
export declare const EngagementDataSchema: z.ZodObject<{
    date: z.ZodString;
    pageViews: z.ZodNumber;
    uniqueVisitors: z.ZodNumber;
    sessionDuration: z.ZodNumber;
    bounceRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessionDuration: number;
    bounceRate: number;
}, {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessionDuration: number;
    bounceRate: number;
}>;
export declare const AdminModerationReportSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    status: z.ZodEnum<["pending", "resolved", "dismissed"]>;
    reportedBy: z.ZodString;
    contentId: z.ZodString;
    contentType: z.ZodEnum<["post", "comment", "user", "message"]>;
    reason: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: string;
    reason: string;
    updatedAt: string;
    contentId: string;
    contentType: "message" | "user" | "post" | "comment";
    reportedBy: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
}, {
    id: string;
    type: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: string;
    reason: string;
    updatedAt: string;
    contentId: string;
    contentType: "message" | "user" | "post" | "comment";
    reportedBy: string;
    description?: string | undefined;
    assignedTo?: string | undefined;
}>;
export declare const UpdateModerationReportRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "resolved", "dismissed"]>>;
    assignedTo: z.ZodOptional<z.ZodString>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "resolved" | "dismissed" | undefined;
    assignedTo?: string | undefined;
    moderatorNotes?: string | undefined;
}, {
    status?: "pending" | "resolved" | "dismissed" | undefined;
    assignedTo?: string | undefined;
    moderatorNotes?: string | undefined;
}>;
export declare const SystemConfigSchema: z.ZodObject<{
    siteName: z.ZodString;
    siteUrl: z.ZodString;
    maintenanceMode: z.ZodBoolean;
    allowRegistration: z.ZodBoolean;
    emailVerificationRequired: z.ZodBoolean;
    maxFileSize: z.ZodNumber;
    allowedFileTypes: z.ZodArray<z.ZodString, "many">;
    rateLimit: z.ZodObject<{
        enabled: z.ZodBoolean;
        requests: z.ZodNumber;
        windowMs: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        requests: number;
        windowMs: number;
    }, {
        enabled: boolean;
        requests: number;
        windowMs: number;
    }>;
}, "strip", z.ZodTypeAny, {
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    emailVerificationRequired: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
    rateLimit: {
        enabled: boolean;
        requests: number;
        windowMs: number;
    };
}, {
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    emailVerificationRequired: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
    rateLimit: {
        enabled: boolean;
        requests: number;
        windowMs: number;
    };
}>;
export declare const FeatureFlagSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    enabled: z.ZodBoolean;
    rolloutPercentage: z.ZodNumber;
    conditions: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    enabled: boolean;
    description: string;
    rolloutPercentage: number;
    conditions: Record<string, any>;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    enabled: boolean;
    description: string;
    rolloutPercentage: number;
    conditions: Record<string, any>;
}>;
export declare const UpdateFeatureFlagRequestSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    rolloutPercentage: z.ZodOptional<z.ZodNumber>;
    conditions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    rolloutPercentage?: number | undefined;
    conditions?: Record<string, any> | undefined;
}, {
    enabled?: boolean | undefined;
    rolloutPercentage?: number | undefined;
    conditions?: Record<string, any> | undefined;
}>;
export declare const AdminUserCreateRequestSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["client", "therapist", "moderator", "admin"]>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "client" | "therapist" | "admin" | "moderator";
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}, {
    role: "client" | "therapist" | "admin" | "moderator";
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}>;
export declare const AdminUserUpdateRequestSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["client", "therapist", "moderator", "admin"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
}, {
    role?: "client" | "therapist" | "admin" | "moderator" | undefined;
    isActive?: boolean | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
}>;
export declare const UserRoleUpdateRequestSchema: z.ZodObject<{
    role: z.ZodEnum<["client", "therapist", "moderator", "admin"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: "client" | "therapist" | "admin" | "moderator";
    reason?: string | undefined;
}, {
    role: "client" | "therapist" | "admin" | "moderator";
    reason?: string | undefined;
}>;
export declare const UserSuspendRequestSchema: z.ZodObject<{
    reason: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    sendNotification: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    duration?: number | undefined;
    sendNotification?: boolean | undefined;
}, {
    reason: string;
    duration?: number | undefined;
    sendNotification?: boolean | undefined;
}>;
export type UserGrowthData = z.infer<typeof UserGrowthDataSchema>;
export type EngagementData = z.infer<typeof EngagementDataSchema>;
export type AdminModerationReport = z.infer<typeof AdminModerationReportSchema>;
export type UpdateModerationReportRequest = z.infer<typeof UpdateModerationReportRequestSchema>;
export type SystemConfig = z.infer<typeof SystemConfigSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type UpdateFeatureFlagRequest = z.infer<typeof UpdateFeatureFlagRequestSchema>;
export type AdminUserCreateRequest = z.infer<typeof AdminUserCreateRequestSchema>;
export type AdminUserUpdateRequest = z.infer<typeof AdminUserUpdateRequestSchema>;
export type UserRoleUpdateRequest = z.infer<typeof UserRoleUpdateRequestSchema>;
export type UserSuspendRequest = z.infer<typeof UserSuspendRequestSchema>;
export declare const TherapistApplicationDetailsResponseSchema: z.ZodObject<{
    application: z.ZodObject<{
        userId: z.ZodString;
        status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
        submissionDate: z.ZodDate;
        processingDate: z.ZodNullable<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        submissionDate: Date;
        processingDate: Date | null;
    }, {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        submissionDate: Date;
        processingDate: Date | null;
    }>;
    statistics: z.ZodObject<{
        totalClients: z.ZodNumber;
        averageRating: z.ZodNumber;
        totalReviews: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        averageRating: number;
        totalClients: number;
        totalReviews: number;
    }, {
        averageRating: number;
        totalClients: number;
        totalReviews: number;
    }>;
}, "strip", z.ZodTypeAny, {
    application: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        submissionDate: Date;
        processingDate: Date | null;
    };
    statistics: {
        averageRating: number;
        totalClients: number;
        totalReviews: number;
    };
}, {
    application: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        submissionDate: Date;
        processingDate: Date | null;
    };
    statistics: {
        averageRating: number;
        totalClients: number;
        totalReviews: number;
    };
}>;
export declare const TherapistActionResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
    therapist: z.ZodObject<{
        userId: z.ZodString;
        status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>;
        processingDate: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        processingDate: Date;
    }, {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        processingDate: Date;
    }>;
}, "strip", z.ZodTypeAny, {
    message: string;
    therapist: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        processingDate: Date;
    };
    success: boolean;
}, {
    message: string;
    therapist: {
        status: "PENDING" | "APPROVED" | "REJECTED";
        userId: string;
        processingDate: Date;
    };
    success: boolean;
}>;
export declare const TherapistApplicationMetricsResponseSchema: z.ZodObject<{
    period: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start: Date;
        end: Date;
    }, {
        start: Date;
        end: Date;
    }>;
    summary: z.ZodObject<{
        totalApplications: z.ZodNumber;
        pendingApplications: z.ZodNumber;
        approvedApplications: z.ZodNumber;
        rejectedApplications: z.ZodNumber;
        processedApplications: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalApplications: number;
        pendingApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        processedApplications: number;
    }, {
        totalApplications: number;
        pendingApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        processedApplications: number;
    }>;
    metrics: z.ZodObject<{
        approvalRate: z.ZodNumber;
        averageProcessingTimeDays: z.ZodNumber;
        applicationTrend: z.ZodEnum<["increasing", "decreasing", "stable"]>;
    }, "strip", z.ZodTypeAny, {
        approvalRate: number;
        averageProcessingTimeDays: number;
        applicationTrend: "increasing" | "decreasing" | "stable";
    }, {
        approvalRate: number;
        averageProcessingTimeDays: number;
        applicationTrend: "increasing" | "decreasing" | "stable";
    }>;
    recentActivity: z.ZodArray<z.ZodObject<{
        submissionDate: z.ZodDate;
        status: z.ZodString;
        processingDate: z.ZodNullable<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        submissionDate: Date;
        processingDate: Date | null;
    }, {
        status: string;
        submissionDate: Date;
        processingDate: Date | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    metrics: {
        approvalRate: number;
        averageProcessingTimeDays: number;
        applicationTrend: "increasing" | "decreasing" | "stable";
    };
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalApplications: number;
        pendingApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        processedApplications: number;
    };
    recentActivity: {
        status: string;
        submissionDate: Date;
        processingDate: Date | null;
    }[];
}, {
    metrics: {
        approvalRate: number;
        averageProcessingTimeDays: number;
        applicationTrend: "increasing" | "decreasing" | "stable";
    };
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalApplications: number;
        pendingApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
        processedApplications: number;
    };
    recentActivity: {
        status: string;
        submissionDate: Date;
        processingDate: Date | null;
    }[];
}>;
export declare const TherapistListResponseSchema: z.ZodObject<{
    applications: z.ZodArray<z.ZodAny, "many">;
    summary: z.ZodObject<{
        totalPending: z.ZodNumber;
        totalApproved: z.ZodNumber;
        totalRejected: z.ZodNumber;
        filtered: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        filtered: number;
    }, {
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        filtered: number;
    }>;
    filters: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    summary: {
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        filtered: number;
    };
    applications: any[];
    filters?: any;
}, {
    summary: {
        totalPending: number;
        totalApproved: number;
        totalRejected: number;
        filtered: number;
    };
    applications: any[];
    filters?: any;
}>;
export type TherapistApplicationDetailsResponse = z.infer<typeof TherapistApplicationDetailsResponseSchema>;
export type TherapistActionResponse = z.infer<typeof TherapistActionResponseSchema>;
export type TherapistApplicationMetricsResponse = z.infer<typeof TherapistApplicationMetricsResponseSchema>;
export type TherapistListResponse = z.infer<typeof TherapistListResponseSchema>;
//# sourceMappingURL=admin.d.ts.map