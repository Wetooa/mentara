import { AxiosInstance } from 'axios';
import {
  Post,
  Comment,
  User,
  ModerationReport,
  FlaggedContent,
  ModerationAction,
  ModerationStats,
  ContentModerationFilters,
  BulkModerationRequest,
  ReportSubmission,
} from '@mentara/commons';

export interface ContentModerationService {
  // Content Management
  getFlaggedContent(filters?: ContentModerationFilters): Promise<{ content: FlaggedContent[]; total: number; stats: ModerationStats }>;
  moderateContent(contentType: 'post' | 'comment', contentId: string, action: 'approve' | 'reject' | 'remove', reason: string, note?: string): Promise<{ success: boolean; message: string }>;
  bulkModerate(request: BulkModerationRequest): Promise<{ success: boolean; processed: number; failed: number; errors: string[] }>;
  
  // Reports Management
  getReports(filters?: { status?: string; type?: string; priority?: string; limit?: number; offset?: number }): Promise<{ reports: ModerationReport[]; total: number }>;
  updateReport(reportId: string, status: 'pending' | 'resolved' | 'dismissed', resolution?: string): Promise<ModerationReport>;
  submitReport(report: ReportSubmission): Promise<{ success: boolean; reportId: string }>;
  
  // User Moderation
  getUserViolations(userId: string): Promise<{ violations: ModerationAction[]; totalReports: number; status: string }>;
  moderateUser(userId: string, action: 'warn' | 'suspend' | 'unsuspend', reason: string, duration?: number): Promise<{ success: boolean; message: string }>;
  
  // Analytics
  getModerationStats(dateFrom?: string, dateTo?: string): Promise<ModerationStats>;
  getModerationHistory(filters?: { moderatorId?: string; limit?: number; offset?: number }): Promise<{ actions: ModerationAction[]; total: number }>;
  
  // Automated Moderation
  getAutoModerationRules(): Promise<{ rules: any[]; enabled: boolean }>;
  updateAutoModerationRules(rules: any[]): Promise<{ success: boolean }>;
  
  // Content Preview
  getContentPreview(contentType: 'post' | 'comment', contentId: string): Promise<{ content: FlaggedContent; context: any }>;
}

export const createContentModerationService = (client: AxiosInstance): ContentModerationService => ({
  // Content Management
  getFlaggedContent: (filters: ContentModerationFilters = {}): Promise<{ content: FlaggedContent[]; total: number; stats: ModerationStats }> => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/admin/flagged-content${queryString}`);
  },

  moderateContent: (
    contentType: 'post' | 'comment',
    contentId: string,
    action: 'approve' | 'reject' | 'remove',
    reason: string,
    note?: string
  ): Promise<{ success: boolean; message: string }> =>
    client.post('/admin/moderate-content', {
      contentType,
      contentId,
      action,
      reason,
      note,
    }),

  bulkModerate: (request: BulkModerationRequest): Promise<{ success: boolean; processed: number; failed: number; errors: string[] }> =>
    client.post('/admin/bulk-moderate', request),

  // Reports Management
  getReports: (filters: { status?: string; type?: string; priority?: string; limit?: number; offset?: number } = {}): Promise<{ reports: ModerationReport[]; total: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/admin/moderation/reports${queryString}`);
  },

  updateReport: (reportId: string, status: 'pending' | 'resolved' | 'dismissed', resolution?: string): Promise<ModerationReport> =>
    client.patch(`/admin/moderation/reports/${reportId}`, { status, resolution }),

  submitReport: (report: ReportSubmission): Promise<{ success: boolean; reportId: string }> =>
    client.post('/moderation/report', report),

  // User Moderation
  getUserViolations: (userId: string): Promise<{ violations: ModerationAction[]; totalReports: number; status: string }> =>
    client.get(`/admin/users/${userId}/violations`),

  moderateUser: (userId: string, action: 'warn' | 'suspend' | 'unsuspend', reason: string, duration?: number): Promise<{ success: boolean; message: string }> => {
    if (action === 'suspend') {
      return client.patch(`/admin/users/${userId}/suspend`, { reason, duration });
    } else if (action === 'unsuspend') {
      return client.patch(`/admin/users/${userId}/unsuspend`);
    } else {
      return client.post(`/admin/users/${userId}/warn`, { reason });
    }
  },

  // Analytics
  getModerationStats: (dateFrom?: string, dateTo?: string): Promise<ModerationStats> => {
    const searchParams = new URLSearchParams();
    if (dateFrom) searchParams.append('dateFrom', dateFrom);
    if (dateTo) searchParams.append('dateTo', dateTo);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/admin/moderation/stats${queryString}`);
  },

  getModerationHistory: (filters: { moderatorId?: string; limit?: number; offset?: number } = {}): Promise<{ actions: ModerationAction[]; total: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/admin/moderation/history${queryString}`);
  },

  // Automated Moderation
  getAutoModerationRules: (): Promise<{ rules: any[]; enabled: boolean }> =>
    client.get('/admin/moderation/auto-rules'),

  updateAutoModerationRules: (rules: any[]): Promise<{ success: boolean }> =>
    client.put('/admin/moderation/auto-rules', { rules }),

  // Content Preview
  getContentPreview: (contentType: 'post' | 'comment', contentId: string): Promise<{ content: FlaggedContent; context: any }> =>
    client.get(`/admin/moderation/preview/${contentType}/${contentId}`),
});