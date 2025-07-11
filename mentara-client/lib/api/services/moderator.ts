import { AxiosInstance } from 'axios';
import {
  Moderator,
  SystemEvent,
  AuditLog,
  User,
  Post,
  Comment,
  ModerationReport,
  ContentModerationAction,
} from '@/types/api';

// Moderator-specific types
export interface ModeratorDashboardStats {
  pendingReports: number;
  pendingContent: number;
  resolvedToday: number;
  flaggedUsers: number;
  systemAlerts: number;
}

export interface ContentModerationParams {
  type?: 'post' | 'comment';
  status?: 'pending' | 'approved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'reportCount' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface UserModerationParams {
  status?: 'active' | 'suspended' | 'flagged';
  role?: 'client' | 'therapist';
  limit?: number;
  offset?: number;
  search?: string;
}

export interface AuditLogParams {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SystemEventParams {
  eventType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  isResolved?: boolean;
  limit?: number;
  offset?: number;
}

export interface ModerateContentRequest {
  action: 'approve' | 'reject' | 'flag' | 'remove';
  reason?: string;
  note?: string;
}

export interface ModerateUserRequest {
  action: 'suspend' | 'warn' | 'flag' | 'clearFlags';
  reason: string;
  duration?: number; // in days for suspension
  note?: string;
}

export interface ModeratorService {
  // Dashboard
  getDashboardStats(): Promise<ModeratorDashboardStats>;
  
  // Content Moderation
  content: {
    getQueue(params?: ContentModerationParams): Promise<{ content: (Post | Comment)[]; total: number }>;
    moderate(contentType: 'post' | 'comment', contentId: string, data: ModerateContentRequest): Promise<{ success: boolean; message: string }>;
    getReports(params?: { type?: string; status?: string; limit?: number; offset?: number }): Promise<{ reports: ModerationReport[]; total: number }>;
    updateReport(reportId: string, data: { status: string; resolution?: string }): Promise<ModerationReport>;
  };
  
  // User Moderation
  users: {
    getFlagged(params?: UserModerationParams): Promise<{ users: User[]; total: number }>;
    moderate(userId: string, data: ModerateUserRequest): Promise<{ success: boolean; message: string }>;
    getHistory(userId: string): Promise<{ actions: any[]; reports: any[] }>;
  };
  
  // Audit Logs
  auditLogs: {
    search(params?: AuditLogParams): Promise<{ logs: AuditLog[]; total: number }>;
    getStats(): Promise<{ totalLogs: number; todayLogs: number; criticalEvents: number }>;
  };
  
  // System Events
  systemEvents: {
    getList(params?: SystemEventParams): Promise<{ events: SystemEvent[]; total: number }>;
    resolve(eventId: string, resolution: string): Promise<SystemEvent>;
  };
  
  // Moderator Profile
  profile: {
    get(): Promise<Moderator>;
    update(data: Partial<Moderator>): Promise<Moderator>;
    getActivity(): Promise<{ actionsToday: number; reportsResolved: number; lastActive: string }>;
  };
}

export const createModeratorService = (client: AxiosInstance): ModeratorService => ({
  // Dashboard
  getDashboardStats: (): Promise<ModeratorDashboardStats> =>
    client.get('/moderator/dashboard/stats'),

  // Content Moderation
  content: {
    getQueue: (params: ContentModerationParams = {}): Promise<{ content: (Post | Comment)[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.status) searchParams.append('status', params.status);
      if (params.priority) searchParams.append('priority', params.priority);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/flagged-content${queryString}`);
    },

    moderate: (contentType: 'post' | 'comment', contentId: string, data: ModerateContentRequest): Promise<{ success: boolean; message: string }> =>
      client.post(`/admin/moderate-content`, {
        contentType,
        contentId,
        ...data,
      }),

    getReports: (params: { type?: string; status?: string; limit?: number; offset?: number } = {}): Promise<{ reports: ModerationReport[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.status) searchParams.append('status', params.status);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/moderation/reports${queryString}`);
    },

    updateReport: (reportId: string, data: { status: string; resolution?: string }): Promise<ModerationReport> =>
      client.patch(`/admin/moderation/reports/${reportId}`, data),
  },

  // User Moderation
  users: {
    getFlagged: (params: UserModerationParams = {}): Promise<{ users: User[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.role) searchParams.append('role', params.role);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.search) searchParams.append('search', params.search);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/admin/users${queryString}`);
    },

    moderate: (userId: string, data: ModerateUserRequest): Promise<{ success: boolean; message: string }> => {
      if (data.action === 'suspend') {
        return client.patch(`/admin/users/${userId}/suspend`, {
          reason: data.reason,
          duration: data.duration,
        });
      } else if (data.action === 'clearFlags') {
        return client.patch(`/admin/users/${userId}/unsuspend`);
      } else {
        return client.post(`/admin/moderate-user`, {
          userId,
          ...data,
        });
      }
    },

    getHistory: (userId: string): Promise<{ actions: any[]; reports: any[] }> =>
      client.get(`/admin/users/${userId}/moderation-history`),
  },

  // Audit Logs
  auditLogs: {
    search: (params: AuditLogParams = {}): Promise<{ logs: AuditLog[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.userId) searchParams.append('userId', params.userId);
      if (params.action) searchParams.append('action', params.action);
      if (params.entityType) searchParams.append('entity', params.entityType);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/audit-logs/enhanced/search${queryString}`);
    },

    getStats: (): Promise<{ totalLogs: number; todayLogs: number; criticalEvents: number }> =>
      client.get('/audit-logs/enhanced/stats'),
  },

  // System Events
  systemEvents: {
    getList: (params: SystemEventParams = {}): Promise<{ events: SystemEvent[]; total: number }> => {
      const searchParams = new URLSearchParams();
      if (params.eventType) searchParams.append('eventType', params.eventType);
      if (params.severity) searchParams.append('severity', params.severity);
      if (params.component) searchParams.append('component', params.component);
      if (params.isResolved !== undefined) searchParams.append('isResolved', params.isResolved.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/audit-logs/system-events${queryString}`);
    },

    resolve: (eventId: string, resolution: string): Promise<SystemEvent> =>
      client.patch(`/audit-logs/system-events/${eventId}/resolve`, { resolution }),
  },

  // Moderator Profile
  profile: {
    get: (): Promise<Moderator> =>
      client.get('/moderator/profile'),

    update: (data: Partial<Moderator>): Promise<Moderator> =>
      client.patch('/moderator/profile', data),

    getActivity: (): Promise<{ actionsToday: number; reportsResolved: number; lastActive: string }> =>
      client.get('/moderator/activity'),
  },
});