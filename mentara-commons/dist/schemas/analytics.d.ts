import { z } from 'zod';
export declare const AnalyticsQuerySchema: z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    userRole: z.ZodOptional<z.ZodEnum<["client", "therapist", "admin", "moderator"]>>;
    metric: z.ZodOptional<z.ZodEnum<["users", "sessions", "bookings", "revenue", "engagement"]>>;
    groupBy: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
}, "strip", z.ZodTypeAny, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
    metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
    groupBy?: "day" | "week" | "month" | "year" | undefined;
}, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
    metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
    groupBy?: "day" | "week" | "month" | "year" | undefined;
}>;
export declare const AnalyticsResponseDtoSchema: z.ZodObject<{
    metric: z.ZodString;
    value: z.ZodNumber;
    period: z.ZodString;
    change: z.ZodOptional<z.ZodNumber>;
    changePercent: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    value: number;
    metric: string;
    period: string;
    change?: number | undefined;
    changePercent?: number | undefined;
}, {
    value: number;
    metric: string;
    period: string;
    change?: number | undefined;
    changePercent?: number | undefined;
}>;
export declare const DashboardAnalyticsSchema: z.ZodObject<{
    totalUsers: z.ZodNumber;
    totalTherapists: z.ZodNumber;
    totalSessions: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    activeUsers: z.ZodNumber;
    newUsers: z.ZodNumber;
    sessionsThisMonth: z.ZodNumber;
    revenueThisMonth: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    totalUsers: number;
    totalTherapists: number;
    totalSessions: number;
    totalRevenue: number;
    activeUsers: number;
    newUsers: number;
    sessionsThisMonth: number;
    revenueThisMonth: number;
}, {
    totalUsers: number;
    totalTherapists: number;
    totalSessions: number;
    totalRevenue: number;
    activeUsers: number;
    newUsers: number;
    sessionsThisMonth: number;
    revenueThisMonth: number;
}>;
export declare const UserAnalyticsDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    sessionsCount: z.ZodNumber;
    lastActive: z.ZodString;
    totalSpent: z.ZodNumber;
    joinDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    sessionsCount: number;
    lastActive: string;
    totalSpent: number;
    joinDate: string;
}, {
    userId: string;
    sessionsCount: number;
    lastActive: string;
    totalSpent: number;
    joinDate: string;
}>;
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type AnalyticsResponseDto = z.infer<typeof AnalyticsResponseDtoSchema>;
export type DashboardAnalytics = z.infer<typeof DashboardAnalyticsSchema>;
export type UserAnalyticsDto = z.infer<typeof UserAnalyticsDtoSchema>;
export declare const PlatformAnalyticsQueryDtoSchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["day", "week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["users", "sessions", "revenue", "engagement", "retention"]>, "many">>;
    includeComparisons: z.ZodDefault<z.ZodBoolean>;
    includeBreakdown: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "day" | "week" | "month" | "year" | "quarter";
    includeComparisons: boolean;
    includeBreakdown: boolean;
    metrics?: ("users" | "sessions" | "revenue" | "engagement" | "retention")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    timeframe?: "day" | "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("users" | "sessions" | "revenue" | "engagement" | "retention")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeComparisons?: boolean | undefined;
    includeBreakdown?: boolean | undefined;
}>;
export declare const TherapistAnalyticsQueryDtoSchema: z.ZodObject<{
    therapistId: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["sessions", "clients", "revenue", "ratings", "utilization"]>, "many">>;
    includeClientProgress: z.ZodDefault<z.ZodBoolean>;
    includeComparisons: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "week" | "month" | "year" | "quarter";
    includeComparisons: boolean;
    includeClientProgress: boolean;
    therapistId?: string | undefined;
    metrics?: ("sessions" | "revenue" | "clients" | "ratings" | "utilization")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    therapistId?: string | undefined;
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("sessions" | "revenue" | "clients" | "ratings" | "utilization")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeComparisons?: boolean | undefined;
    includeClientProgress?: boolean | undefined;
}>;
export declare const ClientAnalyticsQueryDtoSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["sessions", "progress", "engagement", "wellness"]>, "many">>;
    includeTherapistFeedback: z.ZodDefault<z.ZodBoolean>;
    includeGoalProgress: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "week" | "month" | "year" | "quarter";
    includeTherapistFeedback: boolean;
    includeGoalProgress: boolean;
    metrics?: ("sessions" | "engagement" | "progress" | "wellness")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    clientId?: string | undefined;
}, {
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("sessions" | "engagement" | "progress" | "wellness")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    clientId?: string | undefined;
    includeTherapistFeedback?: boolean | undefined;
    includeGoalProgress?: boolean | undefined;
}>;
export declare const CommunityAnalyticsQueryDtoSchema: z.ZodObject<{
    communityId: z.ZodOptional<z.ZodString>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["posts", "members", "engagement", "activity", "growth"]>, "many">>;
    includeRoomBreakdown: z.ZodDefault<z.ZodBoolean>;
    includeMemberActivity: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "week" | "month" | "year" | "quarter";
    includeRoomBreakdown: boolean;
    includeMemberActivity: boolean;
    metrics?: ("engagement" | "posts" | "members" | "activity" | "growth")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
}, {
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("engagement" | "posts" | "members" | "activity" | "growth")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    communityId?: string | undefined;
    includeRoomBreakdown?: boolean | undefined;
    includeMemberActivity?: boolean | undefined;
}>;
export declare const SessionAnalyticsQueryDtoSchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["count", "duration", "completion", "ratings", "outcomes"]>, "many">>;
    sessionType: z.ZodOptional<z.ZodEnum<["individual", "group", "family"]>>;
    includeComparisons: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "week" | "month" | "year" | "quarter";
    includeComparisons: boolean;
    therapistId?: string | undefined;
    metrics?: ("count" | "duration" | "ratings" | "completion" | "outcomes")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    clientId?: string | undefined;
    sessionType?: "individual" | "group" | "family" | undefined;
}, {
    therapistId?: string | undefined;
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("count" | "duration" | "ratings" | "completion" | "outcomes")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeComparisons?: boolean | undefined;
    clientId?: string | undefined;
    sessionType?: "individual" | "group" | "family" | undefined;
}>;
export declare const RevenueAnalyticsQueryDtoSchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["revenue", "subscriptions", "payments", "refunds", "mrr", "churn"]>, "many">>;
    breakdown: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly"]>>;
    includeForecasting: z.ZodDefault<z.ZodBoolean>;
    includeComparisons: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "week" | "month" | "year" | "quarter";
    includeComparisons: boolean;
    includeForecasting: boolean;
    metrics?: ("revenue" | "subscriptions" | "payments" | "refunds" | "mrr" | "churn")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    breakdown?: "daily" | "weekly" | "monthly" | undefined;
}, {
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    metrics?: ("revenue" | "subscriptions" | "payments" | "refunds" | "mrr" | "churn")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeComparisons?: boolean | undefined;
    breakdown?: "daily" | "weekly" | "monthly" | undefined;
    includeForecasting?: boolean | undefined;
}>;
export declare const ExportAnalyticsQueryDtoSchema: z.ZodObject<{
    dataType: z.ZodEnum<["users", "therapists", "sessions", "revenue", "communities", "platform"]>;
    format: z.ZodDefault<z.ZodEnum<["csv", "json", "pdf"]>>;
    dateFrom: z.ZodString;
    dateTo: z.ZodString;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    dateFrom: string;
    dateTo: string;
    dataType: "users" | "sessions" | "revenue" | "therapists" | "communities" | "platform";
    format: "csv" | "json" | "pdf";
    includeMetadata: boolean;
    fields?: string[] | undefined;
}, {
    dateFrom: string;
    dateTo: string;
    dataType: "users" | "sessions" | "revenue" | "therapists" | "communities" | "platform";
    format?: "csv" | "json" | "pdf" | undefined;
    includeMetadata?: boolean | undefined;
    fields?: string[] | undefined;
}>;
export declare const CustomAnalyticsQueryDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metrics: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        field: z.ZodString;
        aggregation: z.ZodEnum<["sum", "avg", "count", "min", "max"]>;
        filter: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        field: string;
        aggregation: "count" | "min" | "max" | "sum" | "avg";
        filter?: any;
    }, {
        name: string;
        field: string;
        aggregation: "count" | "min" | "max" | "sum" | "avg";
        filter?: any;
    }>, "many">;
    dimensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["eq", "ne", "gt", "lt", "gte", "lte", "in", "nin"]>;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "gte" | "gt" | "lte" | "lt" | "eq" | "ne" | "in" | "nin";
        value?: any;
    }, {
        field: string;
        operator: "gte" | "gt" | "lte" | "lt" | "eq" | "ne" | "in" | "nin";
        value?: any;
    }>, "many">>;
    timeframe: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    timeframe: "week" | "month" | "year" | "quarter";
    metrics: {
        name: string;
        field: string;
        aggregation: "count" | "min" | "max" | "sum" | "avg";
        filter?: any;
    }[];
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    description?: string | undefined;
    dimensions?: string[] | undefined;
    filters?: {
        field: string;
        operator: "gte" | "gt" | "lte" | "lt" | "eq" | "ne" | "in" | "nin";
        value?: any;
    }[] | undefined;
}, {
    name: string;
    metrics: {
        name: string;
        field: string;
        aggregation: "count" | "min" | "max" | "sum" | "avg";
        filter?: any;
    }[];
    timeframe?: "week" | "month" | "year" | "quarter" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    description?: string | undefined;
    dimensions?: string[] | undefined;
    filters?: {
        field: string;
        operator: "gte" | "gt" | "lte" | "lt" | "eq" | "ne" | "in" | "nin";
        value?: any;
    }[] | undefined;
}>;
export type PlatformAnalyticsQueryDto = z.infer<typeof PlatformAnalyticsQueryDtoSchema>;
export type TherapistAnalyticsQueryDto = z.infer<typeof TherapistAnalyticsQueryDtoSchema>;
export type ClientAnalyticsQueryDto = z.infer<typeof ClientAnalyticsQueryDtoSchema>;
export type CommunityAnalyticsQueryDto = z.infer<typeof CommunityAnalyticsQueryDtoSchema>;
export type SessionAnalyticsQueryDto = z.infer<typeof SessionAnalyticsQueryDtoSchema>;
export type RevenueAnalyticsQueryDto = z.infer<typeof RevenueAnalyticsQueryDtoSchema>;
export type ExportAnalyticsQueryDto = z.infer<typeof ExportAnalyticsQueryDtoSchema>;
export type CustomAnalyticsQueryDto = z.infer<typeof CustomAnalyticsQueryDtoSchema>;
export declare const AnalyticsTimeRangeSchema: z.ZodObject<{
    startDate: z.ZodString;
    endDate: z.ZodString;
    period: z.ZodEnum<["day", "week", "month", "quarter", "year"]>;
}, "strip", z.ZodTypeAny, {
    period: "day" | "week" | "month" | "year" | "quarter";
    startDate: string;
    endDate: string;
}, {
    period: "day" | "week" | "month" | "year" | "quarter";
    startDate: string;
    endDate: string;
}>;
export declare const UserAnalyticsSchema: z.ZodObject<{
    totalUsers: z.ZodNumber;
    activeUsers: z.ZodNumber;
    newUsers: z.ZodNumber;
    userGrowth: z.ZodNumber;
    usersByRole: z.ZodRecord<z.ZodString, z.ZodNumber>;
    usersByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    engagementMetrics: z.ZodObject<{
        dailyActiveUsers: z.ZodNumber;
        weeklyActiveUsers: z.ZodNumber;
        monthlyActiveUsers: z.ZodNumber;
        averageSessionDuration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    }, {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    }>;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        users: z.ZodNumber;
        activeUsers: z.ZodNumber;
        newUsers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        users: number;
        activeUsers: number;
        newUsers: number;
    }, {
        date: string;
        users: number;
        activeUsers: number;
        newUsers: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
    engagementMetrics: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    };
    timeSeriesData: {
        date: string;
        users: number;
        activeUsers: number;
        newUsers: number;
    }[];
}, {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    usersByRole: Record<string, number>;
    usersByStatus: Record<string, number>;
    engagementMetrics: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    };
    timeSeriesData: {
        date: string;
        users: number;
        activeUsers: number;
        newUsers: number;
    }[];
}>;
export declare const TherapistAnalyticsSchema: z.ZodObject<{
    totalTherapists: z.ZodNumber;
    activeTherapists: z.ZodNumber;
    newTherapists: z.ZodNumber;
    therapistGrowth: z.ZodNumber;
    sessionsCompleted: z.ZodNumber;
    averageRating: z.ZodNumber;
    revenueGenerated: z.ZodNumber;
    clientSatisfaction: z.ZodNumber;
    utilizationRate: z.ZodNumber;
    specialtyDistribution: z.ZodRecord<z.ZodString, z.ZodNumber>;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        therapists: z.ZodNumber;
        sessions: z.ZodNumber;
        revenue: z.ZodNumber;
        rating: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        sessions: number;
        revenue: number;
        therapists: number;
        rating: number;
    }, {
        date: string;
        sessions: number;
        revenue: number;
        therapists: number;
        rating: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalTherapists: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        therapists: number;
        rating: number;
    }[];
    activeTherapists: number;
    newTherapists: number;
    therapistGrowth: number;
    sessionsCompleted: number;
    averageRating: number;
    revenueGenerated: number;
    clientSatisfaction: number;
    utilizationRate: number;
    specialtyDistribution: Record<string, number>;
}, {
    totalTherapists: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        therapists: number;
        rating: number;
    }[];
    activeTherapists: number;
    newTherapists: number;
    therapistGrowth: number;
    sessionsCompleted: number;
    averageRating: number;
    revenueGenerated: number;
    clientSatisfaction: number;
    utilizationRate: number;
    specialtyDistribution: Record<string, number>;
}>;
export declare const ClientAnalyticsSchema: z.ZodObject<{
    totalClients: z.ZodNumber;
    activeClients: z.ZodNumber;
    newClients: z.ZodNumber;
    clientGrowth: z.ZodNumber;
    totalSessions: z.ZodNumber;
    completionRate: z.ZodNumber;
    satisfactionScore: z.ZodNumber;
    retentionRate: z.ZodNumber;
    averageSessionsPerClient: z.ZodNumber;
    conditionDistribution: z.ZodRecord<z.ZodString, z.ZodNumber>;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        clients: z.ZodNumber;
        sessions: z.ZodNumber;
        satisfaction: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        sessions: number;
        clients: number;
        satisfaction: number;
    }, {
        date: string;
        sessions: number;
        clients: number;
        satisfaction: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalSessions: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        clients: number;
        satisfaction: number;
    }[];
    totalClients: number;
    activeClients: number;
    newClients: number;
    clientGrowth: number;
    completionRate: number;
    satisfactionScore: number;
    retentionRate: number;
    averageSessionsPerClient: number;
    conditionDistribution: Record<string, number>;
}, {
    totalSessions: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        clients: number;
        satisfaction: number;
    }[];
    totalClients: number;
    activeClients: number;
    newClients: number;
    clientGrowth: number;
    completionRate: number;
    satisfactionScore: number;
    retentionRate: number;
    averageSessionsPerClient: number;
    conditionDistribution: Record<string, number>;
}>;
export declare const CommunityAnalyticsSchema: z.ZodObject<{
    totalCommunities: z.ZodNumber;
    totalMembers: z.ZodNumber;
    totalPosts: z.ZodNumber;
    totalComments: z.ZodNumber;
    engagementRate: z.ZodNumber;
    activeMembers: z.ZodNumber;
    postsPerDay: z.ZodNumber;
    mostActiveCommunities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        memberCount: z.ZodNumber;
        postCount: z.ZodNumber;
        engagementRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        engagementRate: number;
        memberCount: number;
        postCount: number;
    }, {
        id: string;
        name: string;
        engagementRate: number;
        memberCount: number;
        postCount: number;
    }>, "many">;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        members: z.ZodNumber;
        posts: z.ZodNumber;
        comments: z.ZodNumber;
        engagement: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        engagement: number;
        posts: number;
        members: number;
        comments: number;
    }, {
        date: string;
        engagement: number;
        posts: number;
        members: number;
        comments: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    timeSeriesData: {
        date: string;
        engagement: number;
        posts: number;
        members: number;
        comments: number;
    }[];
    totalCommunities: number;
    totalMembers: number;
    totalPosts: number;
    totalComments: number;
    engagementRate: number;
    activeMembers: number;
    postsPerDay: number;
    mostActiveCommunities: {
        id: string;
        name: string;
        engagementRate: number;
        memberCount: number;
        postCount: number;
    }[];
}, {
    timeSeriesData: {
        date: string;
        engagement: number;
        posts: number;
        members: number;
        comments: number;
    }[];
    totalCommunities: number;
    totalMembers: number;
    totalPosts: number;
    totalComments: number;
    engagementRate: number;
    activeMembers: number;
    postsPerDay: number;
    mostActiveCommunities: {
        id: string;
        name: string;
        engagementRate: number;
        memberCount: number;
        postCount: number;
    }[];
}>;
export declare const SessionAnalyticsSchema: z.ZodObject<{
    totalSessions: z.ZodNumber;
    completedSessions: z.ZodNumber;
    cancelledSessions: z.ZodNumber;
    completionRate: z.ZodNumber;
    averageDuration: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    averageRevenue: z.ZodNumber;
    sessionsByType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    sessionsByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        sessions: z.ZodNumber;
        completed: z.ZodNumber;
        cancelled: z.ZodNumber;
        revenue: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        sessions: number;
        revenue: number;
        completed: number;
        cancelled: number;
    }, {
        date: string;
        sessions: number;
        revenue: number;
        completed: number;
        cancelled: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalSessions: number;
    totalRevenue: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        completed: number;
        cancelled: number;
    }[];
    completionRate: number;
    completedSessions: number;
    cancelledSessions: number;
    averageDuration: number;
    averageRevenue: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
}, {
    totalSessions: number;
    totalRevenue: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        completed: number;
        cancelled: number;
    }[];
    completionRate: number;
    completedSessions: number;
    cancelledSessions: number;
    averageDuration: number;
    averageRevenue: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
}>;
export declare const RevenueAnalyticsSchema: z.ZodObject<{
    totalRevenue: z.ZodNumber;
    monthlyRevenue: z.ZodNumber;
    revenueGrowth: z.ZodNumber;
    averageSessionFee: z.ZodNumber;
    revenueByTherapist: z.ZodArray<z.ZodObject<{
        therapistId: z.ZodString;
        therapistName: z.ZodString;
        revenue: z.ZodNumber;
        sessions: z.ZodNumber;
        averageFee: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        therapistId: string;
        sessions: number;
        revenue: number;
        therapistName: string;
        averageFee: number;
    }, {
        therapistId: string;
        sessions: number;
        revenue: number;
        therapistName: string;
        averageFee: number;
    }>, "many">;
    revenueByPeriod: z.ZodArray<z.ZodObject<{
        period: z.ZodString;
        revenue: z.ZodNumber;
        sessions: z.ZodNumber;
        growth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sessions: number;
        revenue: number;
        period: string;
        growth: number;
    }, {
        sessions: number;
        revenue: number;
        period: string;
        growth: number;
    }>, "many">;
    timeSeriesData: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        revenue: z.ZodNumber;
        sessions: z.ZodNumber;
        averageFee: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        sessions: number;
        revenue: number;
        averageFee: number;
    }, {
        date: string;
        sessions: number;
        revenue: number;
        averageFee: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalRevenue: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        averageFee: number;
    }[];
    monthlyRevenue: number;
    revenueGrowth: number;
    averageSessionFee: number;
    revenueByTherapist: {
        therapistId: string;
        sessions: number;
        revenue: number;
        therapistName: string;
        averageFee: number;
    }[];
    revenueByPeriod: {
        sessions: number;
        revenue: number;
        period: string;
        growth: number;
    }[];
}, {
    totalRevenue: number;
    timeSeriesData: {
        date: string;
        sessions: number;
        revenue: number;
        averageFee: number;
    }[];
    monthlyRevenue: number;
    revenueGrowth: number;
    averageSessionFee: number;
    revenueByTherapist: {
        therapistId: string;
        sessions: number;
        revenue: number;
        therapistName: string;
        averageFee: number;
    }[];
    revenueByPeriod: {
        sessions: number;
        revenue: number;
        period: string;
        growth: number;
    }[];
}>;
export declare const PlatformAnalyticsSchema: z.ZodObject<{
    overview: z.ZodObject<{
        totalUsers: z.ZodNumber;
        totalTherapists: z.ZodNumber;
        totalClients: z.ZodNumber;
        totalSessions: z.ZodNumber;
        totalRevenue: z.ZodNumber;
        totalCommunities: z.ZodNumber;
        totalPosts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalUsers: number;
        totalTherapists: number;
        totalSessions: number;
        totalRevenue: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
    }, {
        totalUsers: number;
        totalTherapists: number;
        totalSessions: number;
        totalRevenue: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
    }>;
    growth: z.ZodObject<{
        userGrowth: z.ZodNumber;
        therapistGrowth: z.ZodNumber;
        sessionGrowth: z.ZodNumber;
        revenueGrowth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userGrowth: number;
        therapistGrowth: number;
        revenueGrowth: number;
        sessionGrowth: number;
    }, {
        userGrowth: number;
        therapistGrowth: number;
        revenueGrowth: number;
        sessionGrowth: number;
    }>;
    engagement: z.ZodObject<{
        dailyActiveUsers: z.ZodNumber;
        weeklyActiveUsers: z.ZodNumber;
        monthlyActiveUsers: z.ZodNumber;
        averageSessionDuration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    }, {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    }>;
    performance: z.ZodObject<{
        systemUptime: z.ZodNumber;
        averageResponseTime: z.ZodNumber;
        errorRate: z.ZodNumber;
        successRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
        successRate: number;
    }, {
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
        successRate: number;
    }>;
}, "strip", z.ZodTypeAny, {
    engagement: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    };
    growth: {
        userGrowth: number;
        therapistGrowth: number;
        revenueGrowth: number;
        sessionGrowth: number;
    };
    overview: {
        totalUsers: number;
        totalTherapists: number;
        totalSessions: number;
        totalRevenue: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
    };
    performance: {
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
        successRate: number;
    };
}, {
    engagement: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionDuration: number;
    };
    growth: {
        userGrowth: number;
        therapistGrowth: number;
        revenueGrowth: number;
        sessionGrowth: number;
    };
    overview: {
        totalUsers: number;
        totalTherapists: number;
        totalSessions: number;
        totalRevenue: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
    };
    performance: {
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
        successRate: number;
    };
}>;
export declare const CustomAnalyticsReportSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    query: z.ZodObject<{
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        userRole: z.ZodOptional<z.ZodEnum<["client", "therapist", "admin", "moderator"]>>;
        metric: z.ZodOptional<z.ZodEnum<["users", "sessions", "bookings", "revenue", "engagement"]>>;
        groupBy: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
    }, "strip", z.ZodTypeAny, {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
        metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
        groupBy?: "day" | "week" | "month" | "year" | undefined;
    }, {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
        metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
        groupBy?: "day" | "week" | "month" | "year" | undefined;
    }>;
    schedule: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["daily", "weekly", "monthly"]>;
        recipients: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
    }, {
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodString;
    lastRunAt: z.ZodOptional<z.ZodString>;
    nextRunAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    query: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
        metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
        groupBy?: "day" | "week" | "month" | "year" | undefined;
    };
    updatedAt: string;
    description: string;
    createdBy: string;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
    } | undefined;
    lastRunAt?: string | undefined;
    nextRunAt?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: string;
    query: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        userRole?: "client" | "therapist" | "admin" | "moderator" | undefined;
        metric?: "users" | "sessions" | "bookings" | "revenue" | "engagement" | undefined;
        groupBy?: "day" | "week" | "month" | "year" | undefined;
    };
    updatedAt: string;
    description: string;
    createdBy: string;
    schedule?: {
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
    } | undefined;
    lastRunAt?: string | undefined;
    nextRunAt?: string | undefined;
}>;
export type AnalyticsTimeRange = z.infer<typeof AnalyticsTimeRangeSchema>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export type TherapistAnalytics = z.infer<typeof TherapistAnalyticsSchema>;
export type ClientAnalytics = z.infer<typeof ClientAnalyticsSchema>;
export type CommunityAnalytics = z.infer<typeof CommunityAnalyticsSchema>;
export type SessionAnalytics = z.infer<typeof SessionAnalyticsSchema>;
export type RevenueAnalytics = z.infer<typeof RevenueAnalyticsSchema>;
export type PlatformAnalytics = z.infer<typeof PlatformAnalyticsSchema>;
export type CustomAnalyticsReport = z.infer<typeof CustomAnalyticsReportSchema>;
//# sourceMappingURL=analytics.d.ts.map