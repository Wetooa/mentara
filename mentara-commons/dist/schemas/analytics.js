"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAnalyticsQueryDtoSchema = exports.TherapistAnalyticsQueryDtoSchema = exports.PlatformAnalyticsQueryDtoSchema = exports.UserAnalyticsDtoSchema = exports.DashboardAnalyticsSchema = exports.AnalyticsResponseDtoSchema = exports.AnalyticsQuerySchema = void 0;
const zod_1 = require("zod");
// Analytics Query Parameters
exports.AnalyticsQuerySchema = zod_1.z.object({
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    userRole: zod_1.z.enum(['client', 'therapist', 'admin', 'moderator']).optional(),
    metric: zod_1.z.enum(['users', 'sessions', 'bookings', 'revenue', 'engagement']).optional(),
    groupBy: zod_1.z.enum(['day', 'week', 'month', 'year']).optional()
});
// Analytics Response Schema
exports.AnalyticsResponseDtoSchema = zod_1.z.object({
    metric: zod_1.z.string(),
    value: zod_1.z.number(),
    period: zod_1.z.string(),
    change: zod_1.z.number().optional(),
    changePercent: zod_1.z.number().optional()
});
// Dashboard Analytics Schema
exports.DashboardAnalyticsSchema = zod_1.z.object({
    totalUsers: zod_1.z.number(),
    totalTherapists: zod_1.z.number(),
    totalSessions: zod_1.z.number(),
    totalRevenue: zod_1.z.number(),
    activeUsers: zod_1.z.number(),
    newUsers: zod_1.z.number(),
    sessionsThisMonth: zod_1.z.number(),
    revenueThisMonth: zod_1.z.number()
});
// User Analytics Schema
exports.UserAnalyticsDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    sessionsCount: zod_1.z.number(),
    lastActive: zod_1.z.string().datetime(),
    totalSpent: zod_1.z.number(),
    joinDate: zod_1.z.string().datetime()
});
// Additional DTOs for AnalyticsController endpoints
exports.PlatformAnalyticsQueryDtoSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['users', 'sessions', 'revenue', 'engagement', 'retention'])).optional(),
    includeComparisons: zod_1.z.boolean().default(true),
    includeBreakdown: zod_1.z.boolean().default(false)
});
exports.TherapistAnalyticsQueryDtoSchema = zod_1.z.object({
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['sessions', 'clients', 'revenue', 'ratings', 'utilization'])).optional(),
    includeClientProgress: zod_1.z.boolean().default(false),
    includeComparisons: zod_1.z.boolean().default(true)
});
exports.ClientAnalyticsQueryDtoSchema = zod_1.z.object({
    clientId: zod_1.z.string().uuid('Invalid client ID format').optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['sessions', 'progress', 'engagement', 'wellness'])).optional(),
    includeTherapistFeedback: zod_1.z.boolean().default(false),
    includeGoalProgress: zod_1.z.boolean().default(true)
});
//# sourceMappingURL=analytics.js.map