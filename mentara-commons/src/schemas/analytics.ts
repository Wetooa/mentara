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

// Additional DTOs for complex analytics queries
export const CommunityAnalyticsQueryDtoSchema = z.object({
  communityId: z.string().uuid('Invalid community ID format').optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['posts', 'members', 'engagement', 'activity', 'growth'])).optional(),
  includeRoomBreakdown: z.boolean().default(false),
  includeMemberActivity: z.boolean().default(true)
});

export const SessionAnalyticsQueryDtoSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  therapistId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  metrics: z.array(z.enum(['count', 'duration', 'completion', 'ratings', 'outcomes'])).optional(),
  sessionType: z.enum(['individual', 'group', 'family']).optional(),
  includeComparisons: z.boolean().default(true)
});

export const RevenueAnalyticsQueryDtoSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['revenue', 'subscriptions', 'payments', 'refunds', 'mrr', 'churn'])).optional(),
  breakdown: z.enum(['daily', 'weekly', 'monthly']).optional(),
  includeForecasting: z.boolean().default(false),
  includeComparisons: z.boolean().default(true)
});

export const ExportAnalyticsQueryDtoSchema = z.object({
  dataType: z.enum(['users', 'therapists', 'sessions', 'revenue', 'communities', 'platform']),
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  includeMetadata: z.boolean().default(true),
  fields: z.array(z.string()).optional()
});

export const CustomAnalyticsQueryDtoSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  metrics: z.array(z.object({
    name: z.string(),
    field: z.string(),
    aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max']),
    filter: z.any().optional()
  })),
  dimensions: z.array(z.string()).optional(),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'nin']),
    value: z.any()
  })).optional(),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

// Type exports for new DTOs
export type PlatformAnalyticsQueryDto = z.infer<typeof PlatformAnalyticsQueryDtoSchema>;
export type TherapistAnalyticsQueryDto = z.infer<typeof TherapistAnalyticsQueryDtoSchema>;
export type ClientAnalyticsQueryDto = z.infer<typeof ClientAnalyticsQueryDtoSchema>;
export type CommunityAnalyticsQueryDto = z.infer<typeof CommunityAnalyticsQueryDtoSchema>;
export type SessionAnalyticsQueryDto = z.infer<typeof SessionAnalyticsQueryDtoSchema>;
export type RevenueAnalyticsQueryDto = z.infer<typeof RevenueAnalyticsQueryDtoSchema>;
export type ExportAnalyticsQueryDto = z.infer<typeof ExportAnalyticsQueryDtoSchema>;
export type CustomAnalyticsQueryDto = z.infer<typeof CustomAnalyticsQueryDtoSchema>;

// Extended analytics response types moved from frontend services
export const AnalyticsTimeRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year'])
});

export const UserAnalyticsSchema = z.object({
  totalUsers: z.number().min(0),
  activeUsers: z.number().min(0),
  newUsers: z.number().min(0),
  userGrowth: z.number(),
  usersByRole: z.record(z.string(), z.number().min(0)),
  usersByStatus: z.record(z.string(), z.number().min(0)),
  engagementMetrics: z.object({
    dailyActiveUsers: z.number().min(0),
    weeklyActiveUsers: z.number().min(0),
    monthlyActiveUsers: z.number().min(0),
    averageSessionDuration: z.number().min(0)
  }),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    users: z.number().min(0),
    activeUsers: z.number().min(0),
    newUsers: z.number().min(0)
  }))
});

export const TherapistAnalyticsSchema = z.object({
  totalTherapists: z.number().min(0),
  activeTherapists: z.number().min(0),
  newTherapists: z.number().min(0),
  therapistGrowth: z.number(),
  sessionsCompleted: z.number().min(0),
  averageRating: z.number().min(0).max(5),
  revenueGenerated: z.number().min(0),
  clientSatisfaction: z.number().min(0).max(100),
  utilizationRate: z.number().min(0).max(100),
  specialtyDistribution: z.record(z.string(), z.number().min(0)),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    therapists: z.number().min(0),
    sessions: z.number().min(0),
    revenue: z.number().min(0),
    rating: z.number().min(0).max(5)
  }))
});

export const ClientAnalyticsSchema = z.object({
  totalClients: z.number().min(0),
  activeClients: z.number().min(0),
  newClients: z.number().min(0),
  clientGrowth: z.number(),
  totalSessions: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  satisfactionScore: z.number().min(0).max(100),
  retentionRate: z.number().min(0).max(100),
  averageSessionsPerClient: z.number().min(0),
  conditionDistribution: z.record(z.string(), z.number().min(0)),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    clients: z.number().min(0),
    sessions: z.number().min(0),
    satisfaction: z.number().min(0).max(100)
  }))
});

export const CommunityAnalyticsSchema = z.object({
  totalCommunities: z.number().min(0),
  totalMembers: z.number().min(0),
  totalPosts: z.number().min(0),
  totalComments: z.number().min(0),
  engagementRate: z.number().min(0).max(100),
  activeMembers: z.number().min(0),
  postsPerDay: z.number().min(0),
  mostActiveCommunities: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    memberCount: z.number().min(0),
    postCount: z.number().min(0),
    engagementRate: z.number().min(0).max(100)
  })),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    members: z.number().min(0),
    posts: z.number().min(0),
    comments: z.number().min(0),
    engagement: z.number().min(0).max(100)
  }))
});

export const SessionAnalyticsSchema = z.object({
  totalSessions: z.number().min(0),
  completedSessions: z.number().min(0),
  cancelledSessions: z.number().min(0),
  completionRate: z.number().min(0).max(100),
  averageDuration: z.number().min(0),
  totalRevenue: z.number().min(0),
  averageRevenue: z.number().min(0),
  sessionsByType: z.record(z.string(), z.number().min(0)),
  sessionsByStatus: z.record(z.string(), z.number().min(0)),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    sessions: z.number().min(0),
    completed: z.number().min(0),
    cancelled: z.number().min(0),
    revenue: z.number().min(0)
  }))
});

export const RevenueAnalyticsSchema = z.object({
  totalRevenue: z.number().min(0),
  monthlyRevenue: z.number().min(0),
  revenueGrowth: z.number(),
  averageSessionFee: z.number().min(0),
  revenueByTherapist: z.array(z.object({
    therapistId: z.string().uuid(),
    therapistName: z.string().min(1),
    revenue: z.number().min(0),
    sessions: z.number().min(0),
    averageFee: z.number().min(0)
  })),
  revenueByPeriod: z.array(z.object({
    period: z.string().min(1),
    revenue: z.number().min(0),
    sessions: z.number().min(0),
    growth: z.number()
  })),
  timeSeriesData: z.array(z.object({
    date: z.string().datetime(),
    revenue: z.number().min(0),
    sessions: z.number().min(0),
    averageFee: z.number().min(0)
  }))
});

export const PlatformAnalyticsSchema = z.object({
  overview: z.object({
    totalUsers: z.number().min(0),
    totalTherapists: z.number().min(0),
    totalClients: z.number().min(0),
    totalSessions: z.number().min(0),
    totalRevenue: z.number().min(0),
    totalCommunities: z.number().min(0),
    totalPosts: z.number().min(0)
  }),
  growth: z.object({
    userGrowth: z.number(),
    therapistGrowth: z.number(),
    sessionGrowth: z.number(),
    revenueGrowth: z.number()
  }),
  engagement: z.object({
    dailyActiveUsers: z.number().min(0),
    weeklyActiveUsers: z.number().min(0),
    monthlyActiveUsers: z.number().min(0),
    averageSessionDuration: z.number().min(0)
  }),
  performance: z.object({
    systemUptime: z.number().min(0).max(100),
    averageResponseTime: z.number().min(0),
    errorRate: z.number().min(0).max(100),
    successRate: z.number().min(0).max(100)
  })
});

export const CustomAnalyticsReportSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  query: AnalyticsQuerySchema,
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    recipients: z.array(z.string().email())
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  lastRunAt: z.string().datetime().optional(),
  nextRunAt: z.string().datetime().optional()
});

// Export type inference helpers for new schemas
export type AnalyticsTimeRange = z.infer<typeof AnalyticsTimeRangeSchema>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export type TherapistAnalytics = z.infer<typeof TherapistAnalyticsSchema>;
export type ClientAnalytics = z.infer<typeof ClientAnalyticsSchema>;
export type CommunityAnalytics = z.infer<typeof CommunityAnalyticsSchema>;
export type SessionAnalytics = z.infer<typeof SessionAnalyticsSchema>;
export type RevenueAnalytics = z.infer<typeof RevenueAnalyticsSchema>;
export type PlatformAnalytics = z.infer<typeof PlatformAnalyticsSchema>;
export type CustomAnalyticsReport = z.infer<typeof CustomAnalyticsReportSchema>;