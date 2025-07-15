import { z } from 'zod';

// Analytics Query Parameters
export const AnalyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  userRole: z.enum(['client', 'therapist', 'admin', 'moderator']).optional(),
  metric: z.enum(['users', 'sessions', 'bookings', 'revenue', 'engagement']).optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).optional()
});

// Analytics Response Schema
export const AnalyticsResponseDtoSchema = z.object({
  metric: z.string(),
  value: z.number(),
  period: z.string(),
  change: z.number().optional(),
  changePercent: z.number().optional()
});

// Dashboard Analytics Schema
export const DashboardAnalyticsSchema = z.object({
  totalUsers: z.number(),
  totalTherapists: z.number(),
  totalSessions: z.number(),
  totalRevenue: z.number(),
  activeUsers: z.number(),
  newUsers: z.number(),
  sessionsThisMonth: z.number(),
  revenueThisMonth: z.number()
});

// User Analytics Schema
export const UserAnalyticsDtoSchema = z.object({
  userId: z.string().uuid(),
  sessionsCount: z.number(),
  lastActive: z.string().datetime(),
  totalSpent: z.number(),
  joinDate: z.string().datetime()
});

// Export type inference helpers
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;
export type AnalyticsResponseDto = z.infer<typeof AnalyticsResponseDtoSchema>;
export type DashboardAnalytics = z.infer<typeof DashboardAnalyticsSchema>;
export type UserAnalyticsDto = z.infer<typeof UserAnalyticsDtoSchema>;

// Additional DTOs for AnalyticsController endpoints
export const PlatformAnalyticsQueryDtoSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['users', 'sessions', 'revenue', 'engagement', 'retention'])).optional(),
  includeComparisons: z.boolean().default(true),
  includeBreakdown: z.boolean().default(false)
});

export const TherapistAnalyticsQueryDtoSchema = z.object({
  therapistId: z.string().uuid('Invalid therapist ID format').optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['sessions', 'clients', 'revenue', 'ratings', 'utilization'])).optional(),
  includeClientProgress: z.boolean().default(false),
  includeComparisons: z.boolean().default(true)
});

export const ClientAnalyticsQueryDtoSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format').optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['sessions', 'progress', 'engagement', 'wellness'])).optional(),
  includeTherapistFeedback: z.boolean().default(false),
  includeGoalProgress: z.boolean().default(true)
});

// Type exports for new DTOs
export type PlatformAnalyticsQueryDto = z.infer<typeof PlatformAnalyticsQueryDtoSchema>;
export type TherapistAnalyticsQueryDto = z.infer<typeof TherapistAnalyticsQueryDtoSchema>;
export type ClientAnalyticsQueryDto = z.infer<typeof ClientAnalyticsQueryDtoSchema>;