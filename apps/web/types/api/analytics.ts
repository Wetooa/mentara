// Analytics DTOs matching backend exactly

export interface AnalyticsTimeRange {
  startDate: string;
  endDate: string;
  period: 'day' | 'week' | 'month' | 'year';
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  usersByRole: {
    clients: number;
    therapists: number;
    moderators: number;
    admins: number;
  };
  userGrowth: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
  }>;
  engagementMetrics: {
    averageSessionDuration: number;
    averageSessionsPerUser: number;
    bounceRate: number;
  };
}

export interface TherapistAnalytics {
  totalTherapists: number;
  activeTherapists: number;
  averageRating: number;
  totalSessions: number;
  totalRevenue: number;
  utilizationRate: number;
  specializationDistribution: Record<string, number>;
  performanceMetrics: Array<{
    therapistId: string;
    name: string;
    sessionsCompleted: number;
    averageRating: number;
    revenue: number;
    clientRetentionRate: number;
  }>;
}

export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  completedAssessments: number;
  assignedTherapists: number;
  progressMetrics: {
    averageProgressScore: number;
    completedWorksheets: number;
    averageSessionAttendance: number;
  };
  conditionDistribution: Record<string, number>;
  outcomeMetrics: {
    improvedClients: number;
    completedTreatments: number;
    averageTreatmentDuration: number;
  };
}

export interface CommunityAnalytics {
  totalCommunities: number;
  activeCommunities: number;
  totalMembers: number;
  totalPosts: number;
  totalComments: number;
  engagementMetrics: {
    averagePostsPerCommunity: number;
    averageCommentsPerPost: number;
    averageMembersPerCommunity: number;
  };
  popularCommunities: Array<{
    id: string;
    name: string;
    memberCount: number;
    postCount: number;
    engagementScore: number;
  }>;
}

export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  averageDuration: number;
  sessionTypes: Record<string, number>;
  sessionTrends: Array<{
    date: string;
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }>;
  therapistPerformance: Array<{
    therapistId: string;
    name: string;
    sessionsCompleted: number;
    completionRate: number;
    averageDuration: number;
  }>;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  recurringRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
    sessionFees: number;
  }>;
  revenueByTherapist: Array<{
    therapistId: string;
    name: string;
    revenue: number;
    sessionCount: number;
    averageRate: number;
  }>;
}

export interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalRevenue: number;
    platformGrowth: number;
  };
  userAnalytics: UserAnalytics;
  therapistAnalytics: TherapistAnalytics;
  clientAnalytics: ClientAnalytics;
  communityAnalytics: CommunityAnalytics;
  sessionAnalytics: SessionAnalytics;
  revenueAnalytics: RevenueAnalytics;
}

export interface AnalyticsQuery {
  timeRange?: AnalyticsTimeRange;
  metrics?: string[];
  filters?: {
    userRole?: 'client' | 'therapist' | 'moderator' | 'admin';
    therapistId?: string;
    clientId?: string;
    communityId?: string;
    sessionType?: string;
    status?: string;
  };
  groupBy?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  offset?: number;
}

export interface CustomAnalyticsReport {
  id: string;
  name: string;
  description: string;
  query: AnalyticsQuery;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}