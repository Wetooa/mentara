import { AxiosInstance } from 'axios';
import {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
  AdminQuery,
  AdminUserQuery,
  AdminIdParam,
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  PendingTherapistFiltersDto,
  AdminAnalyticsQuery,
  AdminUserListParamsDto,
  AdminUserGrowthParamsDto,
  AdminEngagementParamsDto,
  AdminModerationReportParamsDto,
  AdminTherapistApplicationParamsDto,
  AdminTherapistApplicationFiltersDto,
  AdminMatchingPerformanceParamsDto,
  AdminFlaggedContentParamsDto,
  AdminUserListParamsDtoSchema,
  TherapistCredentials,
  FlaggedContent,
  AdminUserGrowthParamsDtoSchema,
  AdminEngagementParamsDtoSchema,
  AdminModerationReportParamsDtoSchema,
  AdminTherapistApplicationParamsDtoSchema,
  AdminTherapistApplicationFiltersDtoSchema,
  AdminMatchingPerformanceParamsDtoSchema,
  AdminFlaggedContentParamsDtoSchema,
  User,
  TherapistApplication,
  // Additional admin types
  SystemStats,
  UserGrowthData,
  EngagementData,
  ModerationReport,
  UpdateModerationReportRequest,
  SystemConfig,
  FeatureFlag,
  UpdateFeatureFlagRequest,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  UserRoleUpdateRequest,
  UserSuspendRequest,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  CreateAdminDto,
  UpdateAdminDto,
  AdminResponseDto,
  AdminQuery,
  AdminUserQuery,
  AdminIdParam,
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  PendingTherapistFiltersDto,
  AdminAnalyticsQuery,
  AdminUserListParamsDto,
  AdminUserGrowthParamsDto,
  AdminEngagementParamsDto,
  AdminModerationReportParamsDto,
  AdminTherapistApplicationParamsDto,
  AdminTherapistApplicationFiltersDto,
  AdminMatchingPerformanceParamsDto,
  AdminFlaggedContentParamsDto,
  User,
  TherapistApplication,
  // Additional admin types
  SystemStats,
  UserGrowthData,
  EngagementData,
  ModerationReport,
  UpdateModerationReportRequest,
  SystemConfig,
  FeatureFlag,
  UpdateFeatureFlagRequest,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  UserRoleUpdateRequest,
  UserSuspendRequest,
};

// All admin types are now imported from mentara-commons

// Service interface for type checking (use factory function instead)
export interface AdminServiceInterface {
  checkAdmin(): Promise<{ isAdmin: boolean }>;
  
  // Dashboard
  getDashboard(): Promise<{
    overview: {
      totalUsers: number;
      totalClients: number;
      totalTherapists: number;
      pendingApplications: number;
      totalCommunities: number;
      totalPosts: number;
      totalSessions: number;
    };
    recentActivity: User[];
  }>;
  
  // User management
  users: {
    getList(params?: AdminUserListParamsDto): Promise<{ users: User[]; total: number }>;
    getById(userId: string): Promise<User>;
    create(userData: AdminUserCreateRequest): Promise<User>;
    update(userId: string, userData: AdminUserUpdateRequest): Promise<User>;
    delete(userId: string): Promise<void>;
    updateRole(userId: string, data: UserRoleUpdateRequest): Promise<User>;
    suspend(userId: string, data: UserSuspendRequest): Promise<{ success: boolean; user: User }>;
    unsuspend(userId: string): Promise<{ success: boolean; user: User }>;
  };

  // Therapist Applications Management
  therapistApplications: {
    getList(params?: { status?: string; limit?: number; offset?: number }): Promise<{ applications: TherapistApplication[]; total: number }>;
    getById(applicationId: string): Promise<TherapistApplication>;
    updateStatus(applicationId: string, data: { status: string; reviewedBy?: string; notes?: string }): Promise<{ success: boolean; message: string; credentials?: TherapistCredentials }>;
  };

  // Enhanced Therapist Management for Module 2
  getTherapistApplications(filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    province?: string;
    submittedAfter?: string;
    processedBy?: string;
    providerType?: string;
    limit?: number;
  }): Promise<{ therapists: TherapistApplication[]; total: number; }>;

  getTherapistStatistics(): Promise<{
    overview: {
      totalApplications: number;
      pendingReview: number;
      approvedToday: number;
      rejectedToday: number;
      averageProcessingTime: number;
      approvalRate: number;
    };
    trends: {
      weeklyApplications: number;
      weeklyApprovals: number;
      weeklyRejections: number;
      weeklyChange: number;
    };
    demographics: {
      provinces: Array<{ name: string; count: number }>;
      providerTypes: Array<{ name: string; count: number }>;
      experienceLevels: Array<{ range: string; count: number }>;
    };
    performance: {
      averageRating: number;
      ratedTherapists: number;
      totalTherapists: number;
      activeTherapists: number;
    };
  }>;

  approveTherapist(therapistId: string, data: {
    approvalMessage?: string;
    notifyTherapist?: boolean;
  }): Promise<{ success: boolean; message: string; }>;

  rejectTherapist(therapistId: string, data: {
    rejectionReason: string;
    customMessage?: string;
    notifyTherapist?: boolean;
    allowReapplication?: boolean;
  }): Promise<{ success: boolean; message: string; }>;

  // Analytics and reports
  analytics: {
    getSystemStats(): Promise<SystemStats>;
    getUserGrowth(params?: AdminUserGrowthParamsDto): Promise<UserGrowthData[]>;
    getEngagement(params?: AdminEngagementParamsDto): Promise<EngagementData[]>;
    getPlatformOverview(): Promise<{
      overview: {
        totalUsers: number;
        totalClients: number;
        totalTherapists: number;
        pendingApplications: number;
        totalCommunities: number;
        totalPosts: number;
        totalSessions: number;
      };
      recentActivity: User[];
    }>;
    getMatchingPerformance(startDate?: string, endDate?: string): Promise<{
      period: { start: Date; end: Date };
      metrics: {
        totalRecommendations: number;
        successfulMatches: number;
        viewedRecommendations: number;
        contactedTherapists: number;
        averageMatchScore: number;
        conversionRate: number;
        clickThroughRate: number;
      };
    }>;
  };

  // Content moderation
  moderation: {
    getReports(params?: AdminModerationReportParamsDto): Promise<{ reports: ModerationReport[]; total: number }>;
    updateReport(reportId: string, data: UpdateModerationReportRequest): Promise<ModerationReport>;
    getFlaggedContent(params?: AdminFlaggedContentParamsDto): Promise<{ posts: FlaggedContent[]; comments: FlaggedContent[]; page: number; totalItems: number }>;
    moderateContent(contentType: string, contentId: string, action: 'approve' | 'remove' | 'flag', reason?: string): Promise<{ success: boolean }>;
  };

  // System configuration
  config: {
    get(): Promise<SystemConfig>;
    update(config: Partial<SystemConfig>): Promise<SystemConfig>;
    getFeatureFlags(): Promise<FeatureFlag[]>;
    updateFeatureFlag(flagName: string, data: UpdateFeatureFlagRequest): Promise<FeatureFlag>;
  };

  // Profile Management
  profile: {
    get(): Promise<User>;
    update(data: Partial<User>): Promise<User>;
  };
}

// Admin service factory
export const createAdminService = (client: AxiosInstance) => ({
  checkAdmin: (): Promise<{ isAdmin: boolean }> =>
    client.post('/auth/admin'),

  // Dashboard
  getDashboard: (): Promise<{
    overview: {
      totalUsers: number;
      totalClients: number;
      totalTherapists: number;
      pendingApplications: number;
      totalCommunities: number;
      totalPosts: number;
      totalSessions: number;
    };
    recentActivity: User[];
  }> =>
    client.get('/admin/platform-overview'),

  // Admin user management
  users: {
    getList: async (params: AdminUserListParamsDto = {}): Promise<{ users: User[]; total: number }> => {
      const validatedParams = AdminUserListParamsDtoSchema.parse(params);
      return client.post('/admin/users/list', validatedParams);
    },

    getById: (userId: string): Promise<User> =>
      client.get(`/admin/users/${userId}`),

    create: (userData: AdminUserCreateRequest): Promise<User> =>
      client.post('/admin/users', userData),

    update: (userId: string, userData: AdminUserUpdateRequest): Promise<User> =>
      client.put(`/admin/users/${userId}`, userData),

    delete: (userId: string): Promise<void> =>
      client.delete(`/admin/users/${userId}`),

    updateRole: (userId: string, data: UserRoleUpdateRequest): Promise<User> =>
      client.patch(`/admin/users/${userId}/role`, data),

    suspend: (userId: string, data: UserSuspendRequest): Promise<{ success: boolean; user: User }> =>
      client.patch(`/admin/users/${userId}/suspend`, data),

    unsuspend: (userId: string): Promise<{ success: boolean; user: User }> =>
      client.patch(`/admin/users/${userId}/unsuspend`),
  },

  // Therapist Applications Management
  therapistApplications: {
    getList: async (params: AdminTherapistApplicationParamsDto = {}): Promise<{ applications: TherapistApplication[]; total: number }> => {
      const validatedParams = AdminTherapistApplicationParamsDtoSchema.parse(params);
      return client.post('/admin/therapist-applications/list', validatedParams);
    },

    getById: (applicationId: string): Promise<TherapistApplication> =>
      client.get(`/admin/therapist-applications/${applicationId}`),

    updateStatus: (applicationId: string, data: { status: string; reviewedBy?: string; notes?: string }): Promise<{ success: boolean; message: string; credentials?: TherapistCredentials }> =>
      client.put(`/admin/therapist-applications/${applicationId}/status`, data),
  },

  // Enhanced Therapist Management for Module 2
  getTherapistApplications: async (filters: AdminTherapistApplicationFiltersDto = {}): Promise<{ therapists: TherapistApplication[]; total: number; }> => {
    const validatedFilters = AdminTherapistApplicationFiltersDtoSchema.parse(filters);
    return client.post('/admin/therapists/applications/list', validatedFilters);
  },

  getTherapistStatistics: (): Promise<{
    overview: {
      totalApplications: number;
      pendingReview: number;
      approvedToday: number;
      rejectedToday: number;
      averageProcessingTime: number;
      approvalRate: number;
    };
    trends: {
      weeklyApplications: number;
      weeklyApprovals: number;
      weeklyRejections: number;
      weeklyChange: number;
    };
    demographics: {
      provinces: Array<{ name: string; count: number }>;
      providerTypes: Array<{ name: string; count: number }>;
      experienceLevels: Array<{ range: string; count: number }>;
    };
    performance: {
      averageRating: number;
      ratedTherapists: number;
      totalTherapists: number;
      activeTherapists: number;
    };
  }> => client.get('/admin/therapists/statistics'),

  approveTherapist: (therapistId: string, data: {
    approvalMessage?: string;
    notifyTherapist?: boolean;
  }): Promise<{ success: boolean; message: string; }> =>
    client.post(`/admin/therapists/${therapistId}/approve`, data),

  rejectTherapist: (therapistId: string, data: {
    rejectionReason: string;
    customMessage?: string;
    notifyTherapist?: boolean;
    allowReapplication?: boolean;
  }): Promise<{ success: boolean; message: string; }> =>
    client.post(`/admin/therapists/${therapistId}/reject`, data),

  // Analytics and reports
  analytics: {
    getSystemStats: (): Promise<SystemStats> =>
      client.get('/admin/analytics/system-stats'),

    getUserGrowth: async (params: AdminUserGrowthParamsDto = {}): Promise<UserGrowthData[]> => {
      const validatedParams = AdminUserGrowthParamsDtoSchema.parse(params);
      return client.post('/admin/analytics/user-growth', validatedParams);
    },

    getEngagement: async (params: AdminEngagementParamsDto = {}): Promise<EngagementData[]> => {
      const validatedParams = AdminEngagementParamsDtoSchema.parse(params);
      return client.post('/admin/analytics/engagement', validatedParams);
    },

    getPlatformOverview: (): Promise<{
      overview: {
        totalUsers: number;
        totalClients: number;
        totalTherapists: number;
        pendingApplications: number;
        totalCommunities: number;
        totalPosts: number;
        totalSessions: number;
      };
      recentActivity: User[];
    }> =>
      client.get('/admin/platform-overview'),

    getMatchingPerformance: async (params: AdminMatchingPerformanceParamsDto = {}): Promise<{
      period: { start: Date; end: Date };
      metrics: {
        totalRecommendations: number;
        successfulMatches: number;
        viewedRecommendations: number;
        contactedTherapists: number;
        averageMatchScore: number;
        conversionRate: number;
        clickThroughRate: number;
      };
    }> => {
      const validatedParams = AdminMatchingPerformanceParamsDtoSchema.parse(params);
      return client.post('/admin/matching-performance', validatedParams);
    },
  },

  // Content moderation
  moderation: {
    getReports: async (params: AdminModerationReportParamsDto = {}): Promise<{ reports: ModerationReport[]; total: number }> => {
      const validatedParams = AdminModerationReportParamsDtoSchema.parse(params);
      return client.post('/admin/moderation/reports', validatedParams);
    },

    updateReport: (reportId: string, data: UpdateModerationReportRequest): Promise<ModerationReport> =>
      client.patch(`/admin/moderation/reports/${reportId}`, data),

    getFlaggedContent: async (params: AdminFlaggedContentParamsDto = {}): Promise<{ posts: FlaggedContent[]; comments: FlaggedContent[]; page: number; totalItems: number }> => {
      const validatedParams = AdminFlaggedContentParamsDtoSchema.parse(params);
      return client.post('/admin/flagged-content', validatedParams);
    },

    moderateContent: (contentType: string, contentId: string, action: 'approve' | 'remove' | 'flag', reason?: string): Promise<{ success: boolean }> =>
      client.post('/admin/moderate-content', {
        contentType,
        contentId,
        action,
        reason,
      }),
  },

  // System configuration
  config: {
    get: (): Promise<SystemConfig> =>
      client.get('/admin/config'),

    update: (config: Partial<SystemConfig>): Promise<SystemConfig> =>
      client.put('/admin/config', config),

    getFeatureFlags: (): Promise<FeatureFlag[]> =>
      client.get('/admin/config/feature-flags'),

    updateFeatureFlag: (flagName: string, data: UpdateFeatureFlagRequest): Promise<FeatureFlag> =>
      client.patch(`/admin/config/feature-flags/${flagName}`, data),
  },

  // Profile Management
  profile: {
    get: (): Promise<User> =>
      client.get('/admin/profile'),

    update: (data: Partial<User>): Promise<User> =>
      client.patch('/admin/profile', data),
  },
});

export type AdminService = ReturnType<typeof createAdminService>;