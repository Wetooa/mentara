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
} from '@/types/api';

export interface AdminService {
  checkAdmin(): Promise<{ isAdmin: boolean }>;
  
  // User management
  users: {
    getList(params?: AdminUserListParams): Promise<{ users: User[]; total: number }>;
    getById(userId: string): Promise<User>;
    create(userData: AdminUserCreateRequest): Promise<User>;
    update(userId: string, userData: AdminUserUpdateRequest): Promise<User>;
    delete(userId: string): Promise<void>;
    updateRole(userId: string, data: UserRoleUpdateRequest): Promise<User>;
    suspend(userId: string, data: UserSuspendRequest): Promise<User>;
    unsuspend(userId: string): Promise<User>;
  };

  // Analytics and reports
  analytics: {
    getSystemStats(): Promise<SystemStats>;
    getUserGrowth(params?: UserGrowthParams): Promise<UserGrowthData[]>;
    getEngagement(params?: EngagementParams): Promise<EngagementData[]>;
  };

  // Content moderation
  moderation: {
    getReports(params?: ModerationReportParams): Promise<{ reports: ModerationReport[]; total: number }>;
    updateReport(reportId: string, data: UpdateModerationReportRequest): Promise<ModerationReport>;
    getFlaggedContent(params?: { type?: string; limit?: number; offset?: number }): Promise<{ content: FlaggedContent[]; total: number }>;
  };

  // System configuration
  config: {
    get(): Promise<SystemConfig>;
    update(config: Partial<SystemConfig>): Promise<SystemConfig>;
    getFeatureFlags(): Promise<FeatureFlag[]>;
    updateFeatureFlag(flagName: string, data: UpdateFeatureFlagRequest): Promise<FeatureFlag>;
  };
}

export const createAdminService = (client: AxiosInstance): AdminService => ({
  checkAdmin: (): Promise<{ isAdmin: boolean }> =>
    client.post('/auth/admin'),

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

    suspend: (userId: string, data: UserSuspendRequest): Promise<User> =>
      client.patch(`/admin/users/${userId}/suspend`, data),

    unsuspend: (userId: string): Promise<User> =>
      client.patch(`/admin/users/${userId}/unsuspend`),
  },

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

    getFlaggedContent: (params: { type?: string; limit?: number; offset?: number } = {}): Promise<{ content: FlaggedContent[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/moderation/flagged-content${queryString}`);
    },
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
});