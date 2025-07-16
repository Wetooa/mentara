import { AxiosInstance } from 'axios';
import {
  AnalyticsQuery,
  AnalyticsResponseDto,
  DashboardAnalytics,
  UserAnalyticsDto,
  PlatformAnalyticsQueryDto,
  TherapistAnalyticsQueryDto,
  ClientAnalyticsQueryDto,
  CommunityAnalyticsQueryDto,
  SessionAnalyticsQueryDto,
  RevenueAnalyticsQueryDto,
  ExportAnalyticsQueryDto,
  CustomAnalyticsQueryDto,
  AnalyticsQuerySchema,
  PlatformAnalyticsQueryDtoSchema,
  TherapistAnalyticsQueryDtoSchema,
  ClientAnalyticsQueryDtoSchema,
  CommunityAnalyticsQueryDtoSchema,
  SessionAnalyticsQueryDtoSchema,
  RevenueAnalyticsQueryDtoSchema,
  ExportAnalyticsQueryDtoSchema,
  CustomAnalyticsQueryDtoSchema,
  // Extended analytics response types
  AnalyticsTimeRange,
  UserAnalytics,
  TherapistAnalytics,
  ClientAnalytics,
  CommunityAnalytics,
  SessionAnalytics,
  RevenueAnalytics,
  PlatformAnalytics,
  CustomAnalyticsReport,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  AnalyticsQuery,
  AnalyticsResponseDto,
  DashboardAnalytics,
  UserAnalyticsDto,
  PlatformAnalyticsQueryDto,
  TherapistAnalyticsQueryDto,
  ClientAnalyticsQueryDto,
  CommunityAnalyticsQueryDto,
  SessionAnalyticsQueryDto,
  RevenueAnalyticsQueryDto,
  ExportAnalyticsQueryDto,
  CustomAnalyticsQueryDto,
  // Extended analytics response types
  AnalyticsTimeRange,
  UserAnalytics,
  TherapistAnalytics,
  ClientAnalytics,
  CommunityAnalytics,
  SessionAnalytics,
  RevenueAnalytics,
  PlatformAnalytics,
  CustomAnalyticsReport,
};

// All analytics types are now imported from mentara-commons

// Service interface for type checking (use factory function instead)
interface AnalyticsService {
  // Platform overview
  getPlatformAnalytics(query?: PlatformAnalyticsQueryDto): Promise<PlatformAnalytics>;
  
  // Specific analytics
  getUserAnalytics(query?: AnalyticsQuery): Promise<UserAnalytics>;
  getTherapistAnalytics(query?: TherapistAnalyticsQueryDto): Promise<TherapistAnalytics>;
  getClientAnalytics(query?: ClientAnalyticsQueryDto): Promise<ClientAnalytics>;
  getCommunityAnalytics(query?: CommunityAnalyticsQueryDto): Promise<CommunityAnalytics>;
  getSessionAnalytics(query?: SessionAnalyticsQueryDto): Promise<SessionAnalytics>;
  getRevenueAnalytics(query?: RevenueAnalyticsQueryDto): Promise<RevenueAnalytics>;
  
  // Custom reports
  createReport(report: CustomAnalyticsQueryDto): Promise<CustomAnalyticsReport>;
  getReports(): Promise<CustomAnalyticsReport[]>;
  getReport(reportId: string): Promise<CustomAnalyticsReport>;
  updateReport(reportId: string, report: Partial<CustomAnalyticsReport>): Promise<CustomAnalyticsReport>;
  deleteReport(reportId: string): Promise<{ deleted: boolean }>;
  runReport(reportId: string): Promise<any>;
  
  // Export functionality
  exportData(query: ExportAnalyticsQueryDto): Promise<Blob>;
}

// Analytics service factory
export const createAnalyticsService = (client: AxiosInstance) => ({
  // Platform overview
  getPlatformAnalytics: async (query?: PlatformAnalyticsQueryDto): Promise<PlatformAnalytics> => {
    const validatedQuery = query ? PlatformAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/platform', validatedQuery);
  },

  // Specific analytics
  getUserAnalytics: async (query?: AnalyticsQuery): Promise<UserAnalytics> => {
    const validatedQuery = query ? AnalyticsQuerySchema.parse(query) : {};
    return client.post('/analytics/users', validatedQuery);
  },

  getTherapistAnalytics: async (query?: TherapistAnalyticsQueryDto): Promise<TherapistAnalytics> => {
    const validatedQuery = query ? TherapistAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/therapists', validatedQuery);
  },

  getClientAnalytics: async (query?: ClientAnalyticsQueryDto): Promise<ClientAnalytics> => {
    const validatedQuery = query ? ClientAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/clients', validatedQuery);
  },

  getCommunityAnalytics: async (query?: CommunityAnalyticsQueryDto): Promise<CommunityAnalytics> => {
    const validatedQuery = query ? CommunityAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/communities', validatedQuery);
  },

  getSessionAnalytics: async (query?: SessionAnalyticsQueryDto): Promise<SessionAnalytics> => {
    const validatedQuery = query ? SessionAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/sessions', validatedQuery);
  },

  getRevenueAnalytics: async (query?: RevenueAnalyticsQueryDto): Promise<RevenueAnalytics> => {
    const validatedQuery = query ? RevenueAnalyticsQueryDtoSchema.parse(query) : {};
    return client.post('/analytics/revenue', validatedQuery);
  },

  // Custom reports
  createReport: async (report: CustomAnalyticsQueryDto): Promise<CustomAnalyticsReport> => {
    const validatedReport = CustomAnalyticsQueryDtoSchema.parse(report);
    return client.post('/analytics/reports', validatedReport);
  },

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
  exportData: async (query: ExportAnalyticsQueryDto): Promise<Blob> => {
    const validatedQuery = ExportAnalyticsQueryDtoSchema.parse(query);
    return client.post('/analytics/export', validatedQuery, { responseType: 'blob' });
  },
});

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;