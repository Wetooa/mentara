"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSubmissionSchema = exports.BulkModerationRequestSchema = exports.ContentModerationFiltersSchema = exports.ModerationStatsSchema = exports.ModerationActionSchema = exports.FlaggedContentSchema = exports.ContentModerationActionSchema = exports.ModerationReportSchema = exports.SystemEventSchema = exports.ModerateUserRequestSchema = exports.ModerateContentRequestSchema = exports.SystemEventParamsSchema = exports.AuditLogParamsSchema = exports.UserModerationParamsSchema = exports.ContentModerationParamsSchema = exports.ModeratorDashboardStatsSchema = exports.ModeratorSchema = void 0;
const zod_1 = require("zod");
// Moderator Schema
exports.ModeratorSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    permissions: zod_1.z.array(zod_1.z.string()),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']),
    assignedCommunities: zod_1.z.array(zod_1.z.string()).optional(),
    moderationLevel: zod_1.z.enum(['basic', 'advanced', 'admin']),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    lastActiveAt: zod_1.z.string().datetime().optional()
});
// Moderator Dashboard Stats Schema
exports.ModeratorDashboardStatsSchema = zod_1.z.object({
    pendingReports: zod_1.z.number().min(0),
    pendingContent: zod_1.z.number().min(0),
    resolvedToday: zod_1.z.number().min(0),
    flaggedUsers: zod_1.z.number().min(0),
    systemAlerts: zod_1.z.number().min(0)
});
// Content Moderation Parameters Schema
exports.ContentModerationParamsSchema = zod_1.z.object({
    type: zod_1.z.enum(['post', 'comment']).optional(),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    sortBy: zod_1.z.enum(['createdAt', 'reportCount', 'priority']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// User Moderation Parameters Schema
exports.UserModerationParamsSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'suspended', 'flagged']).optional(),
    role: zod_1.z.enum(['client', 'therapist']).optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    search: zod_1.z.string().optional()
});
// Audit Log Parameters Schema
exports.AuditLogParamsSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.string().optional(),
    entityType: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
// System Event Parameters Schema
exports.SystemEventParamsSchema = zod_1.z.object({
    eventType: zod_1.z.string().optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    component: zod_1.z.string().optional(),
    isResolved: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0)
});
// Moderate Content Request Schema
exports.ModerateContentRequestSchema = zod_1.z.object({
    action: zod_1.z.enum(['approve', 'reject', 'flag', 'remove']),
    reason: zod_1.z.string().max(500, 'Reason too long').optional(),
    note: zod_1.z.string().max(1000, 'Note too long').optional()
});
// Moderate User Request Schema
exports.ModerateUserRequestSchema = zod_1.z.object({
    action: zod_1.z.enum(['suspend', 'warn', 'flag', 'clearFlags']),
    reason: zod_1.z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
    duration: zod_1.z.number().min(1).optional(), // in days for suspension
    note: zod_1.z.string().max(1000, 'Note too long').optional()
});
// System Event Schema
exports.SystemEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    eventType: zod_1.z.string().min(1),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    component: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    metadata: zod_1.z.any().optional(),
    isResolved: zod_1.z.boolean().default(false),
    resolvedAt: zod_1.z.string().datetime().optional(),
    resolvedBy: zod_1.z.string().uuid().optional(),
    resolution: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Moderation Report Schema
exports.ModerationReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    reporterId: zod_1.z.string().uuid(),
    contentType: zod_1.z.enum(['post', 'comment', 'user']),
    contentId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(1),
    description: zod_1.z.string().max(1000).optional(),
    status: zod_1.z.enum(['pending', 'under_review', 'resolved', 'dismissed']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    assignedModerator: zod_1.z.string().uuid().optional(),
    resolution: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    resolvedAt: zod_1.z.string().datetime().optional()
});
// Content Moderation Action Schema
exports.ContentModerationActionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    moderatorId: zod_1.z.string().uuid(),
    contentType: zod_1.z.enum(['post', 'comment']),
    contentId: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['approve', 'reject', 'flag', 'remove']),
    reason: zod_1.z.string().max(500).optional(),
    note: zod_1.z.string().max(1000).optional(),
    createdAt: zod_1.z.string().datetime()
});
// Flagged Content Schema
exports.FlaggedContentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['post', 'comment']),
    content: zod_1.z.string().min(1),
    author: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email()
    }),
    flagCount: zod_1.z.number().min(0),
    reports: zod_1.z.array(exports.ModerationReportSchema),
    createdAt: zod_1.z.string().datetime(),
    lastReportedAt: zod_1.z.string().datetime(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'removed']),
    // For posts
    title: zod_1.z.string().optional(),
    community: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1)
    }).optional(),
    // For comments
    postTitle: zod_1.z.string().optional(),
    postId: zod_1.z.string().uuid().optional()
});
// Moderation Action Schema
exports.ModerationActionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    contentType: zod_1.z.enum(['post', 'comment', 'user']),
    contentId: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['approve', 'reject', 'remove', 'flag', 'warn', 'suspend']),
    reason: zod_1.z.string().min(1),
    note: zod_1.z.string().optional(),
    moderatorId: zod_1.z.string().uuid(),
    moderatorName: zod_1.z.string().min(1),
    createdAt: zod_1.z.string().datetime()
});
// Moderation Stats Schema
exports.ModerationStatsSchema = zod_1.z.object({
    totalReports: zod_1.z.number().min(0),
    pendingReports: zod_1.z.number().min(0),
    resolvedToday: zod_1.z.number().min(0),
    flaggedContent: zod_1.z.number().min(0),
    suspendedUsers: zod_1.z.number().min(0),
    averageResponseTime: zod_1.z.number().min(0), // in hours
    topReportReasons: zod_1.z.array(zod_1.z.object({
        reason: zod_1.z.string().min(1),
        count: zod_1.z.number().min(0)
    }))
});
// Content Moderation Filters Schema
exports.ContentModerationFiltersSchema = zod_1.z.object({
    type: zod_1.z.enum(['post', 'comment']).optional(),
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'removed']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    reportReason: zod_1.z.string().optional(),
    authorId: zod_1.z.string().uuid().optional(),
    communityId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).default(50),
    offset: zod_1.z.number().min(0).default(0),
    sortBy: zod_1.z.enum(['createdAt', 'reportCount', 'priority', 'lastReportedAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// Bulk Moderation Request Schema
exports.BulkModerationRequestSchema = zod_1.z.object({
    contentIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one content ID is required'),
    action: zod_1.z.enum(['approve', 'reject', 'remove']),
    reason: zod_1.z.string().min(1, 'Reason is required'),
    note: zod_1.z.string().optional()
});
// Report Submission Schema
exports.ReportSubmissionSchema = zod_1.z.object({
    contentType: zod_1.z.enum(['post', 'comment', 'user']),
    contentId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(1, 'Reason is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    evidence: zod_1.z.array(zod_1.z.string()).optional()
});
//# sourceMappingURL=moderator.js.map