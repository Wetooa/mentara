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
    userRole?: "client" | "therapist" | "moderator" | "admin" | undefined;
    metric?: "sessions" | "users" | "bookings" | "revenue" | "engagement" | undefined;
    groupBy?: "month" | "week" | "year" | "day" | undefined;
}, {
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    userRole?: "client" | "therapist" | "moderator" | "admin" | undefined;
    metric?: "sessions" | "users" | "bookings" | "revenue" | "engagement" | undefined;
    groupBy?: "month" | "week" | "year" | "day" | undefined;
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
    totalSessions: number;
    totalUsers: number;
    totalTherapists: number;
    totalRevenue: number;
    activeUsers: number;
    newUsers: number;
    sessionsThisMonth: number;
    revenueThisMonth: number;
}, {
    totalSessions: number;
    totalUsers: number;
    totalTherapists: number;
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
    timeframe: "month" | "week" | "quarter" | "year" | "day";
    includeComparisons: boolean;
    includeBreakdown: boolean;
    metrics?: ("sessions" | "users" | "revenue" | "engagement" | "retention")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    timeframe?: "month" | "week" | "quarter" | "year" | "day" | undefined;
    metrics?: ("sessions" | "users" | "revenue" | "engagement" | "retention")[] | undefined;
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
    timeframe: "month" | "week" | "quarter" | "year";
    includeComparisons: boolean;
    includeClientProgress: boolean;
    therapistId?: string | undefined;
    metrics?: ("sessions" | "revenue" | "clients" | "ratings" | "utilization")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    therapistId?: string | undefined;
    timeframe?: "month" | "week" | "quarter" | "year" | undefined;
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
    timeframe: "month" | "week" | "quarter" | "year";
    includeTherapistFeedback: boolean;
    includeGoalProgress: boolean;
    clientId?: string | undefined;
    metrics?: ("sessions" | "engagement" | "progress" | "wellness")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    clientId?: string | undefined;
    timeframe?: "month" | "week" | "quarter" | "year" | undefined;
    metrics?: ("sessions" | "engagement" | "progress" | "wellness")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    includeTherapistFeedback?: boolean | undefined;
    includeGoalProgress?: boolean | undefined;
}>;
export type PlatformAnalyticsQueryDto = z.infer<typeof PlatformAnalyticsQueryDtoSchema>;
export type TherapistAnalyticsQueryDto = z.infer<typeof TherapistAnalyticsQueryDtoSchema>;
export type ClientAnalyticsQueryDto = z.infer<typeof ClientAnalyticsQueryDtoSchema>;
//# sourceMappingURL=analytics.d.ts.map