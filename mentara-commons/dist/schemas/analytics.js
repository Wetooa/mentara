"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAnalyticsReportSchema = exports.PlatformAnalyticsSchema = exports.RevenueAnalyticsSchema = exports.SessionAnalyticsSchema = exports.CommunityAnalyticsSchema = exports.ClientAnalyticsSchema = exports.TherapistAnalyticsSchema = exports.UserAnalyticsSchema = exports.AnalyticsTimeRangeSchema = exports.CustomAnalyticsQueryDtoSchema = exports.ExportAnalyticsQueryDtoSchema = exports.RevenueAnalyticsQueryDtoSchema = exports.SessionAnalyticsQueryDtoSchema = exports.CommunityAnalyticsQueryDtoSchema = exports.ClientAnalyticsQueryDtoSchema = exports.TherapistAnalyticsQueryDtoSchema = exports.PlatformAnalyticsQueryDtoSchema = exports.UserAnalyticsDtoSchema = exports.DashboardAnalyticsSchema = exports.AnalyticsResponseDtoSchema = exports.AnalyticsQuerySchema = void 0;
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
// Additional DTOs for complex analytics queries
exports.CommunityAnalyticsQueryDtoSchema = zod_1.z.object({
    communityId: zod_1.z.string().uuid('Invalid community ID format').optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['posts', 'members', 'engagement', 'activity', 'growth'])).optional(),
    includeRoomBreakdown: zod_1.z.boolean().default(false),
    includeMemberActivity: zod_1.z.boolean().default(true)
});
exports.SessionAnalyticsQueryDtoSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    clientId: zod_1.z.string().uuid().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['count', 'duration', 'completion', 'ratings', 'outcomes'])).optional(),
    sessionType: zod_1.z.enum(['individual', 'group', 'family']).optional(),
    includeComparisons: zod_1.z.boolean().default(true)
});
exports.RevenueAnalyticsQueryDtoSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['revenue', 'subscriptions', 'payments', 'refunds', 'mrr', 'churn'])).optional(),
    breakdown: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
    includeForecasting: zod_1.z.boolean().default(false),
    includeComparisons: zod_1.z.boolean().default(true)
});
exports.ExportAnalyticsQueryDtoSchema = zod_1.z.object({
    dataType: zod_1.z.enum(['users', 'therapists', 'sessions', 'revenue', 'communities', 'platform']),
    format: zod_1.z.enum(['csv', 'json', 'pdf']).default('csv'),
    dateFrom: zod_1.z.string().datetime(),
    dateTo: zod_1.z.string().datetime(),
    includeMetadata: zod_1.z.boolean().default(true),
    fields: zod_1.z.array(zod_1.z.string()).optional()
});
exports.CustomAnalyticsQueryDtoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Report name is required'),
    description: zod_1.z.string().optional(),
    metrics: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        field: zod_1.z.string(),
        aggregation: zod_1.z.enum(['sum', 'avg', 'count', 'min', 'max']),
        filter: zod_1.z.any().optional()
    })),
    dimensions: zod_1.z.array(zod_1.z.string()).optional(),
    filters: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        operator: zod_1.z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'nin']),
        value: zod_1.z.any()
    })).optional(),
    timeframe: zod_1.z.enum(['week', 'month', 'quarter', 'year']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional()
});
// Extended analytics response types moved from frontend services
exports.AnalyticsTimeRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    period: zod_1.z.enum(['day', 'week', 'month', 'quarter', 'year'])
});
exports.UserAnalyticsSchema = zod_1.z.object({
    totalUsers: zod_1.z.number().min(0),
    activeUsers: zod_1.z.number().min(0),
    newUsers: zod_1.z.number().min(0),
    userGrowth: zod_1.z.number(),
    usersByRole: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    usersByStatus: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    engagementMetrics: zod_1.z.object({
        dailyActiveUsers: zod_1.z.number().min(0),
        weeklyActiveUsers: zod_1.z.number().min(0),
        monthlyActiveUsers: zod_1.z.number().min(0),
        averageSessionDuration: zod_1.z.number().min(0)
    }),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        users: zod_1.z.number().min(0),
        activeUsers: zod_1.z.number().min(0),
        newUsers: zod_1.z.number().min(0)
    }))
});
exports.TherapistAnalyticsSchema = zod_1.z.object({
    totalTherapists: zod_1.z.number().min(0),
    activeTherapists: zod_1.z.number().min(0),
    newTherapists: zod_1.z.number().min(0),
    therapistGrowth: zod_1.z.number(),
    sessionsCompleted: zod_1.z.number().min(0),
    averageRating: zod_1.z.number().min(0).max(5),
    revenueGenerated: zod_1.z.number().min(0),
    clientSatisfaction: zod_1.z.number().min(0).max(100),
    utilizationRate: zod_1.z.number().min(0).max(100),
    specialtyDistribution: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        therapists: zod_1.z.number().min(0),
        sessions: zod_1.z.number().min(0),
        revenue: zod_1.z.number().min(0),
        rating: zod_1.z.number().min(0).max(5)
    }))
});
exports.ClientAnalyticsSchema = zod_1.z.object({
    totalClients: zod_1.z.number().min(0),
    activeClients: zod_1.z.number().min(0),
    newClients: zod_1.z.number().min(0),
    clientGrowth: zod_1.z.number(),
    totalSessions: zod_1.z.number().min(0),
    completionRate: zod_1.z.number().min(0).max(100),
    satisfactionScore: zod_1.z.number().min(0).max(100),
    retentionRate: zod_1.z.number().min(0).max(100),
    averageSessionsPerClient: zod_1.z.number().min(0),
    conditionDistribution: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        clients: zod_1.z.number().min(0),
        sessions: zod_1.z.number().min(0),
        satisfaction: zod_1.z.number().min(0).max(100)
    }))
});
exports.CommunityAnalyticsSchema = zod_1.z.object({
    totalCommunities: zod_1.z.number().min(0),
    totalMembers: zod_1.z.number().min(0),
    totalPosts: zod_1.z.number().min(0),
    totalComments: zod_1.z.number().min(0),
    engagementRate: zod_1.z.number().min(0).max(100),
    activeMembers: zod_1.z.number().min(0),
    postsPerDay: zod_1.z.number().min(0),
    mostActiveCommunities: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1),
        memberCount: zod_1.z.number().min(0),
        postCount: zod_1.z.number().min(0),
        engagementRate: zod_1.z.number().min(0).max(100)
    })),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        members: zod_1.z.number().min(0),
        posts: zod_1.z.number().min(0),
        comments: zod_1.z.number().min(0),
        engagement: zod_1.z.number().min(0).max(100)
    }))
});
exports.SessionAnalyticsSchema = zod_1.z.object({
    totalSessions: zod_1.z.number().min(0),
    completedSessions: zod_1.z.number().min(0),
    cancelledSessions: zod_1.z.number().min(0),
    completionRate: zod_1.z.number().min(0).max(100),
    averageDuration: zod_1.z.number().min(0),
    totalRevenue: zod_1.z.number().min(0),
    averageRevenue: zod_1.z.number().min(0),
    sessionsByType: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    sessionsByStatus: zod_1.z.record(zod_1.z.string(), zod_1.z.number().min(0)),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        sessions: zod_1.z.number().min(0),
        completed: zod_1.z.number().min(0),
        cancelled: zod_1.z.number().min(0),
        revenue: zod_1.z.number().min(0)
    }))
});
exports.RevenueAnalyticsSchema = zod_1.z.object({
    totalRevenue: zod_1.z.number().min(0),
    monthlyRevenue: zod_1.z.number().min(0),
    revenueGrowth: zod_1.z.number(),
    averageSessionFee: zod_1.z.number().min(0),
    revenueByTherapist: zod_1.z.array(zod_1.z.object({
        therapistId: zod_1.z.string().uuid(),
        therapistName: zod_1.z.string().min(1),
        revenue: zod_1.z.number().min(0),
        sessions: zod_1.z.number().min(0),
        averageFee: zod_1.z.number().min(0)
    })),
    revenueByPeriod: zod_1.z.array(zod_1.z.object({
        period: zod_1.z.string().min(1),
        revenue: zod_1.z.number().min(0),
        sessions: zod_1.z.number().min(0),
        growth: zod_1.z.number()
    })),
    timeSeriesData: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.string().datetime(),
        revenue: zod_1.z.number().min(0),
        sessions: zod_1.z.number().min(0),
        averageFee: zod_1.z.number().min(0)
    }))
});
exports.PlatformAnalyticsSchema = zod_1.z.object({
    overview: zod_1.z.object({
        totalUsers: zod_1.z.number().min(0),
        totalTherapists: zod_1.z.number().min(0),
        totalClients: zod_1.z.number().min(0),
        totalSessions: zod_1.z.number().min(0),
        totalRevenue: zod_1.z.number().min(0),
        totalCommunities: zod_1.z.number().min(0),
        totalPosts: zod_1.z.number().min(0)
    }),
    growth: zod_1.z.object({
        userGrowth: zod_1.z.number(),
        therapistGrowth: zod_1.z.number(),
        sessionGrowth: zod_1.z.number(),
        revenueGrowth: zod_1.z.number()
    }),
    engagement: zod_1.z.object({
        dailyActiveUsers: zod_1.z.number().min(0),
        weeklyActiveUsers: zod_1.z.number().min(0),
        monthlyActiveUsers: zod_1.z.number().min(0),
        averageSessionDuration: zod_1.z.number().min(0)
    }),
    performance: zod_1.z.object({
        systemUptime: zod_1.z.number().min(0).max(100),
        averageResponseTime: zod_1.z.number().min(0),
        errorRate: zod_1.z.number().min(0).max(100),
        successRate: zod_1.z.number().min(0).max(100)
    })
});
exports.CustomAnalyticsReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    query: exports.AnalyticsQuerySchema,
    schedule: zod_1.z.object({
        frequency: zod_1.z.enum(['daily', 'weekly', 'monthly']),
        recipients: zod_1.z.array(zod_1.z.string().email())
    }).optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    createdBy: zod_1.z.string().uuid(),
    lastRunAt: zod_1.z.string().datetime().optional(),
    nextRunAt: zod_1.z.string().datetime().optional()
});
//# sourceMappingURL=analytics.js.map