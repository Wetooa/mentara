import { AxiosInstance } from 'axios';
import {
  AnalyticsTimeRange,
  UserAnalytics,
  TherapistAnalytics,
  ClientAnalytics,
  CommunityAnalytics,
  SessionAnalytics,
  RevenueAnalytics,
  PlatformAnalytics,
  AnalyticsQuery,
  CustomAnalyticsReport,
} from '@/types/api/analytics';

export interface AnalyticsService {
  // Platform overview
  getPlatformAnalytics(timeRange?: AnalyticsTimeRange): Promise<PlatformAnalytics>;
  
  // Specific analytics
  getUserAnalytics(query?: AnalyticsQuery): Promise<UserAnalytics>;
  getTherapistAnalytics(query?: AnalyticsQuery): Promise<TherapistAnalytics>;
  getClientAnalytics(query?: AnalyticsQuery): Promise<ClientAnalytics>;
  getCommunityAnalytics(query?: AnalyticsQuery): Promise<CommunityAnalytics>;
  getSessionAnalytics(query?: AnalyticsQuery): Promise<SessionAnalytics>;
  getRevenueAnalytics(query?: AnalyticsQuery): Promise<RevenueAnalytics>;
  
  // Custom reports
  createReport(report: Omit<CustomAnalyticsReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<CustomAnalyticsReport>;
  getReports(): Promise<CustomAnalyticsReport[]>;
  getReport(reportId: string): Promise<CustomAnalyticsReport>;
  updateReport(reportId: string, report: Partial<CustomAnalyticsReport>): Promise<CustomAnalyticsReport>;
  deleteReport(reportId: string): Promise<{ deleted: boolean }>;
  runReport(reportId: string): Promise<any>;
  
  // Export functionality
  exportData(query: AnalyticsQuery, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob>;
}

export const createAnalyticsService = (client: AxiosInstance): AnalyticsService => ({
  // Platform overview
  getPlatformAnalytics: (timeRange?: AnalyticsTimeRange): Promise<PlatformAnalytics> => {
    const params = new URLSearchParams();
    if (timeRange) {
      params.append('startDate', timeRange.startDate);
      params.append('endDate', timeRange.endDate);
      params.append('period', timeRange.period);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/platform${queryString}`);
  },

  // Specific analytics
  getUserAnalytics: (query?: AnalyticsQuery): Promise<UserAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.userRole) params.append('userRole', query.filters.userRole);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/users${queryString}`);
  },

  getTherapistAnalytics: (query?: AnalyticsQuery): Promise<TherapistAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.therapistId) params.append('therapistId', query.filters.therapistId);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/therapists${queryString}`);
  },

  getClientAnalytics: (query?: AnalyticsQuery): Promise<ClientAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.clientId) params.append('clientId', query.filters.clientId);
    if (query?.filters?.therapistId) params.append('therapistId', query.filters.therapistId);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/clients${queryString}`);
  },

  getCommunityAnalytics: (query?: AnalyticsQuery): Promise<CommunityAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.communityId) params.append('communityId', query.filters.communityId);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/communities${queryString}`);
  },

  getSessionAnalytics: (query?: AnalyticsQuery): Promise<SessionAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.therapistId) params.append('therapistId', query.filters.therapistId);
    if (query?.filters?.clientId) params.append('clientId', query.filters.clientId);
    if (query?.filters?.sessionType) params.append('sessionType', query.filters.sessionType);
    if (query?.filters?.status) params.append('status', query.filters.status);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/sessions${queryString}`);
  },

  getRevenueAnalytics: (query?: AnalyticsQuery): Promise<RevenueAnalytics> => {
    const params = new URLSearchParams();
    
    if (query?.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query?.filters?.therapistId) params.append('therapistId', query.filters.therapistId);
    if (query?.groupBy) params.append('groupBy', query.groupBy);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/analytics/revenue${queryString}`);
  },

  // Custom reports
  createReport: (report: Omit<CustomAnalyticsReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<CustomAnalyticsReport> =>
    client.post('/analytics/reports', report),

  getReports: (): Promise<CustomAnalyticsReport[]> =>
    client.get('/analytics/reports'),

  getReport: (reportId: string): Promise<CustomAnalyticsReport> =>
    client.get(`/analytics/reports/${reportId}`),

  updateReport: (reportId: string, report: Partial<CustomAnalyticsReport>): Promise<CustomAnalyticsReport> =>
    client.put(`/analytics/reports/${reportId}`, report),

  deleteReport: (reportId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/analytics/reports/${reportId}`),

  runReport: (reportId: string): Promise<any> =>
    client.post(`/analytics/reports/${reportId}/run`),

  // Export functionality
  exportData: (query: AnalyticsQuery, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (query.timeRange) {
      params.append('startDate', query.timeRange.startDate);
      params.append('endDate', query.timeRange.endDate);
      params.append('period', query.timeRange.period);
    }
    if (query.metrics?.length) {
      query.metrics.forEach(metric => params.append('metrics', metric));
    }
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    if (query.groupBy) params.append('groupBy', query.groupBy);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    return client.get(`/analytics/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },
});

export type {
  AnalyticsTimeRange,
  UserAnalytics,
  TherapistAnalytics,
  ClientAnalytics,
  CommunityAnalytics,
  SessionAnalytics,
  RevenueAnalytics,
  PlatformAnalytics,
  AnalyticsQuery,
  CustomAnalyticsReport,
};