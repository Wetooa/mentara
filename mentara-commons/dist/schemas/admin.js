"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TherapistListResponseSchema = exports.TherapistApplicationMetricsResponseSchema = exports.TherapistActionResponseSchema = exports.TherapistApplicationDetailsResponseSchema = exports.UserSuspendRequestSchema = exports.UserRoleUpdateRequestSchema = exports.AdminUserUpdateRequestSchema = exports.AdminUserCreateRequestSchema = exports.UpdateFeatureFlagRequestSchema = exports.FeatureFlagSchema = exports.SystemConfigSchema = exports.UpdateModerationReportRequestSchema = exports.AdminModerationReportSchema = exports.EngagementDataSchema = exports.UserGrowthDataSchema = exports.SystemStatsSchema = exports.AdminFlaggedContentParamsDtoSchema = exports.AdminMatchingPerformanceParamsDtoSchema = exports.AdminTherapistApplicationFiltersDtoSchema = exports.AdminTherapistApplicationParamsDtoSchema = exports.AdminModerationReportParamsDtoSchema = exports.AdminEngagementParamsDtoSchema = exports.AdminUserGrowthParamsDtoSchema = exports.AdminUserListParamsDtoSchema = exports.AdminAnalyticsQuerySchema = exports.PendingTherapistFiltersDtoSchema = exports.UpdateTherapistStatusDtoSchema = exports.RejectTherapistDtoSchema = exports.ApproveTherapistDtoSchema = exports.AdminIdParamSchema = exports.AdminUserQuerySchema = exports.AdminQuerySchema = exports.AdminResponseDtoSchema = exports.UpdateAdminDtoSchema = exports.CreateAdminDtoSchema = void 0;
const zod_1 = require("zod");
// Admin Creation and Update Schemas
exports.CreateAdminDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional(),
});
exports.UpdateAdminDtoSchema = zod_1.z.object({
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional(),
});
// Admin Response Schema (updated from class-validator interface)
exports.AdminResponseDtoSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    adminLevel: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Admin Query Parameters
exports.AdminQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    adminLevel: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["createdAt", "updatedAt", "adminLevel"]).optional(),
});
// Admin User Management Query Parameters
exports.AdminUserQuerySchema = zod_1.z.object({
    role: zod_1.z.enum(["client", "therapist", "moderator", "admin"]).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive", "suspended"]).optional(),
    sortBy: zod_1.z
        .enum(["createdAt", "firstName", "lastName", "email", "role"])
        .default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Admin ID Parameter Schema
exports.AdminIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid admin ID format"),
});
// Admin Therapist Management Schemas
exports.ApproveTherapistDtoSchema = zod_1.z.object({
    approvalMessage: zod_1.z
        .string()
        .min(10, "Approval message must be at least 10 characters")
        .optional(),
    verifyLicense: zod_1.z.boolean().default(false),
    grantSpecialPermissions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RejectTherapistDtoSchema = zod_1.z.object({
    rejectionReason: zod_1.z.enum([
        "incomplete_documentation",
        "invalid_license",
        "failed_verification",
        "policy_violation",
        "other",
    ]),
    rejectionMessage: zod_1.z
        .string()
        .min(20, "Rejection message must be at least 20 characters"),
    allowReapplication: zod_1.z.boolean().default(true),
});
exports.UpdateTherapistStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "pending",
        "approved",
        "rejected",
        "suspended",
        "under_review",
    ]),
    reason: zod_1.z.string().min(10, "Status change reason required").optional(),
});
exports.PendingTherapistFiltersDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
    province: zod_1.z.string().optional(),
    submittedAfter: zod_1.z.string().datetime().optional(),
    processedBy: zod_1.z.string().optional(),
    providerType: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
});
// Admin Analytics Query Schema
exports.AdminAnalyticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Admin User Management DTOs
exports.AdminUserListParamsDtoSchema = zod_1.z.object({
    role: zod_1.z.enum(["client", "therapist", "moderator", "admin"]).optional(),
    status: zod_1.z.enum(["active", "inactive", "suspended"]).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z
        .enum(["createdAt", "firstName", "lastName", "email", "role"])
        .default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.AdminUserGrowthParamsDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    granularity: zod_1.z.enum(["day", "week", "month"]).default("day"),
});
exports.AdminEngagementParamsDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    granularity: zod_1.z.enum(["day", "week", "month"]).default("day"),
});
exports.AdminModerationReportParamsDtoSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    status: zod_1.z.enum(["pending", "resolved", "dismissed"]).optional(),
    assignedTo: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
});
exports.AdminTherapistApplicationParamsDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
});
exports.AdminTherapistApplicationFiltersDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
    province: zod_1.z.string().optional(),
    submittedAfter: zod_1.z.string().datetime().optional(),
    processedBy: zod_1.z.string().optional(),
    providerType: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
});
exports.AdminMatchingPerformanceParamsDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.AdminFlaggedContentParamsDtoSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(50),
});
// Additional admin types moved from frontend services
exports.SystemStatsSchema = zod_1.z.object({
    totalUsers: zod_1.z.number().min(0),
    totalClients: zod_1.z.number().min(0),
    totalTherapists: zod_1.z.number().min(0),
    pendingApplications: zod_1.z.number().min(0),
    totalCommunities: zod_1.z.number().min(0),
    totalPosts: zod_1.z.number().min(0),
    totalSessions: zod_1.z.number().min(0),
    growth: zod_1.z.object({
        usersGrowth: zod_1.z.number(),
        clientsGrowth: zod_1.z.number(),
        therapistsGrowth: zod_1.z.number(),
        sessionsGrowth: zod_1.z.number(),
    }),
});
exports.UserGrowthDataSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    totalUsers: zod_1.z.number().min(0),
    newUsers: zod_1.z.number().min(0),
    activeUsers: zod_1.z.number().min(0),
    userType: zod_1.z.string().min(1),
});
exports.EngagementDataSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    pageViews: zod_1.z.number().min(0),
    uniqueVisitors: zod_1.z.number().min(0),
    sessionDuration: zod_1.z.number().min(0),
    bounceRate: zod_1.z.number().min(0).max(100),
});
exports.AdminModerationReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.string().min(1),
    status: zod_1.z.enum(["pending", "resolved", "dismissed"]),
    reportedBy: zod_1.z.string().min(1),
    contentId: zod_1.z.string().min(1),
    contentType: zod_1.z.enum(["post", "comment", "user", "message"]),
    reason: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UpdateModerationReportRequestSchema = zod_1.z.object({
    status: zod_1.z.enum(["pending", "resolved", "dismissed"]).optional(),
    assignedTo: zod_1.z.string().optional(),
    moderatorNotes: zod_1.z.string().optional(),
});
exports.SystemConfigSchema = zod_1.z.object({
    siteName: zod_1.z.string().min(1),
    siteUrl: zod_1.z.string().url(),
    maintenanceMode: zod_1.z.boolean(),
    allowRegistration: zod_1.z.boolean(),
    emailVerificationRequired: zod_1.z.boolean(),
    maxFileSize: zod_1.z.number().min(0),
    allowedFileTypes: zod_1.z.array(zod_1.z.string().min(1)),
    rateLimit: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        requests: zod_1.z.number().min(1),
        windowMs: zod_1.z.number().min(1),
    }),
});
exports.FeatureFlagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    enabled: zod_1.z.boolean(),
    rolloutPercentage: zod_1.z.number().min(0).max(100),
    conditions: zod_1.z.record(zod_1.z.any()),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UpdateFeatureFlagRequestSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    rolloutPercentage: zod_1.z.number().min(0).max(100).optional(),
    conditions: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.AdminUserCreateRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.enum(["client", "therapist", "moderator", "admin"]),
    password: zod_1.z.string().min(8),
});
exports.AdminUserUpdateRequestSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(["client", "therapist", "moderator", "admin"]).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.UserRoleUpdateRequestSchema = zod_1.z.object({
    role: zod_1.z.enum(["client", "therapist", "moderator", "admin"]),
    reason: zod_1.z.string().optional(),
});
exports.UserSuspendRequestSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1),
    duration: zod_1.z.number().min(0).optional(),
    sendNotification: zod_1.z.boolean().optional(),
});
// Admin Therapist Response Schemas
exports.TherapistApplicationDetailsResponseSchema = zod_1.z.object({
    application: zod_1.z.object({
        userId: zod_1.z.string(),
        status: zod_1.z.enum(["PENDING", "APPROVED", "REJECTED"]),
        submissionDate: zod_1.z.date(),
        processingDate: zod_1.z.date().nullable(),
        // Add other therapist fields as needed
    }),
    statistics: zod_1.z.object({
        totalClients: zod_1.z.number(),
        averageRating: zod_1.z.number(),
        totalReviews: zod_1.z.number(),
    }),
});
exports.TherapistActionResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
    therapist: zod_1.z.object({
        userId: zod_1.z.string(),
        status: zod_1.z.enum(["PENDING", "APPROVED", "REJECTED"]),
        processingDate: zod_1.z.date(),
    }),
});
exports.TherapistApplicationMetricsResponseSchema = zod_1.z.object({
    period: zod_1.z.object({
        start: zod_1.z.date(),
        end: zod_1.z.date(),
    }),
    summary: zod_1.z.object({
        totalApplications: zod_1.z.number(),
        pendingApplications: zod_1.z.number(),
        approvedApplications: zod_1.z.number(),
        rejectedApplications: zod_1.z.number(),
        processedApplications: zod_1.z.number(),
    }),
    metrics: zod_1.z.object({
        approvalRate: zod_1.z.number(),
        averageProcessingTimeDays: zod_1.z.number(),
        applicationTrend: zod_1.z.enum(['increasing', 'decreasing', 'stable']),
    }),
    recentActivity: zod_1.z.array(zod_1.z.object({
        submissionDate: zod_1.z.date(),
        status: zod_1.z.string(),
        processingDate: zod_1.z.date().nullable(),
    })),
});
exports.TherapistListResponseSchema = zod_1.z.object({
    applications: zod_1.z.array(zod_1.z.any()), // Complex nested structure with therapist + user data
    summary: zod_1.z.object({
        totalPending: zod_1.z.number(),
        totalApproved: zod_1.z.number(),
        totalRejected: zod_1.z.number(),
        filtered: zod_1.z.number(),
    }),
    filters: zod_1.z.any(), // The filters object passed in
});
//# sourceMappingURL=admin.js.map