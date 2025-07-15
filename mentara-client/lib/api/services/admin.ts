import { AxiosInstance } from 'axios';
import {
  AdminUserListParams,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  UserRoleUpdateRequest,
  UserSuspendRequest,
  SystemStats,
  UserGrowthParams,
  UserGrowthData,
  EngagementParams,
  EngagementData,
  ModerationReport,
  ModerationReportParams,
  UpdateModerationReportRequest,
  FlaggedContent,
  SystemConfig,
  FeatureFlag,
  UpdateFeatureFlagRequest,
  User,
  TherapistApplication,
} from '@/types/api';

export interface AdminService {
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
    getList(params?: AdminUserListParams): Promise<{ users: User[]; total: number }>;
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
    updateStatus(applicationId: string, data: { status: string; reviewedBy?: string; notes?: string }): Promise<{ success: boolean; message: string; credentials?: any }>;
  };

  // Enhanced Therapist Management for Module 2
  getTherapistApplications(filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    province?: string;
    submittedAfter?: string;
    processedBy?: string;
    providerType?: string;
    limit?: number;
  }): Promise<{ therapists: any[]; total: number; }>;

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
    getUserGrowth(params?: UserGrowthParams): Promise<UserGrowthData[]>;
    getEngagement(params?: EngagementParams): Promise<EngagementData[]>;
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
    getReports(params?: ModerationReportParams): Promise<{ reports: ModerationReport[]; total: number }>;
    updateReport(reportId: string, data: UpdateModerationReportRequest): Promise<ModerationReport>;
    getFlaggedContent(params?: { type?: string; page?: number; limit?: number }): Promise<{ posts: any[]; comments: any[]; page: number; totalItems: number }>;
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

export const createAdminService = (client: AxiosInstance): AdminService => ({
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
    getList: (params: AdminUserListParams = {}): Promise<{ users: User[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.role) searchParams.append('role', params.role);
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/users${queryString}`);
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
    getList: (params: { status?: string; limit?: number; offset?: number } = {}): Promise<{ applications: TherapistApplication[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/therapist-applications${queryString}`);
    },

    getById: (applicationId: string): Promise<TherapistApplication> =>
      client.get(`/admin/therapist-applications/${applicationId}`),

    updateStatus: (applicationId: string, data: { status: string; reviewedBy?: string; notes?: string }): Promise<{ success: boolean; message: string; credentials?: any }> =>
      client.put(`/admin/therapist-applications/${applicationId}/status`, data),
  },

  // Enhanced Therapist Management for Module 2
  getTherapistApplications: (filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    province?: string;
    submittedAfter?: string;
    processedBy?: string;
    providerType?: string;
    limit?: number;
  } = {}): Promise<{ therapists: any[]; total: number; }> => {
    const searchParams = new URLSearchParams();
    if (filters.status) searchParams.append('status', filters.status);
    if (filters.province) searchParams.append('province', filters.province);
    if (filters.submittedAfter) searchParams.append('submittedAfter', filters.submittedAfter);
    if (filters.processedBy) searchParams.append('processedBy', filters.processedBy);
    if (filters.providerType) searchParams.append('providerType', filters.providerType);
    if (filters.limit) searchParams.append('limit', filters.limit.toString());

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/admin/therapists/applications${queryString}`);
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

    getUserGrowth: (params: UserGrowthParams = {}): Promise<UserGrowthData[]> => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.granularity) searchParams.append('granularity', params.granularity);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/analytics/user-growth${queryString}`);
    },

    getEngagement: (params: EngagementParams = {}): Promise<EngagementData[]> => {
      const searchParams = new URLSearchParams();
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.granularity) searchParams.append('granularity', params.granularity);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/analytics/engagement${queryString}`);
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

    getMatchingPerformance: (startDate?: string, endDate?: string): Promise<{
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
      const searchParams = new URLSearchParams();
      if (startDate) searchParams.append('startDate', startDate);
      if (endDate) searchParams.append('endDate', endDate);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/matching-performance${queryString}`);
    },
  },

  // Content moderation
  moderation: {
    getReports: (params: ModerationReportParams = {}): Promise<{ reports: ModerationReport[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.status) searchParams.append('status', params.status);
      if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/moderation/reports${queryString}`);
    },

    updateReport: (reportId: string, data: UpdateModerationReportRequest): Promise<ModerationReport> =>
      client.patch(`/admin/moderation/reports/${reportId}`, data),

    getFlaggedContent: (params: { type?: string; page?: number; limit?: number } = {}): Promise<{ posts: any[]; comments: any[]; page: number; totalItems: number }> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/flagged-content${queryString}`);
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

// For consistency with other services, also export the service type using ReturnType pattern
export type AdminServiceType = ReturnType<typeof createAdminService>;