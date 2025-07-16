import { AxiosInstance } from 'axios';
import {
  FindAuditLogsQueryDto,
  CreateAuditLogDto,
  CreateSystemEventDto,
  CreateSecurityEventDto,
  CreateComplianceReportDto,
  GetAuditLogStatsQueryDto,
  GetUserActivityQueryDto,
  GetResourceActivityQueryDto,
  GetSecurityEventsQueryDto,
  GetSystemHealthQueryDto,
  ExportAuditLogsQueryDto,
  UpdateComplianceReportDto,
  ResolveSecurityEventDto,
  AuditLogIdParam,
  SecurityEventIdParam,
  ComplianceReportIdParam,
  AuditAction,
  AuditSeverity,
  SecurityEventType,
  ComplianceReportType,
  // Complex audit log data structures
  AuditLog,
  AuditLogListResponse,
  AuditLogStats,
  SecurityEvent,
  SecurityEventQuery,
  ComplianceReport,
  AuditLogCreateDto,
  AuditLogQuery,
} from 'mentara-commons';

// All audit log types are now imported from mentara-commons

// Re-export commons types for backward compatibility
export type {
  AuditLog,
  AuditLogListResponse,
  AuditLogStats,
  SecurityEvent,
  SecurityEventQuery,
  ComplianceReport,
  AuditLogCreateDto,
  AuditLogQuery,
};

export interface AuditLogService {
  // Audit log management
  create(data: AuditLogCreateDto): Promise<AuditLog>;
  getById(logId: string): Promise<AuditLog>;
  getList(query?: AuditLogQuery): Promise<AuditLogListResponse>;
  getStats(query?: Omit<AuditLogQuery, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>): Promise<AuditLogStats>;
  
  // User activity tracking
  getUserActivity(userId: string, query?: Omit<AuditLogQuery, 'userId'>): Promise<AuditLogListResponse>;
  getResourceActivity(resource: string, resourceId: string): Promise<AuditLogListResponse>;
  
  // Security events
  getSecurityEvents(query?: SecurityEventQuery): Promise<{ events: SecurityEvent[]; total: number }>;
  getSecurityEvent(eventId: string): Promise<SecurityEvent>;
  resolveSecurityEvent(eventId: string, notes?: string): Promise<SecurityEvent>;
  
  // Compliance and reporting
  generateComplianceReport(type: 'gdpr' | 'hipaa' | 'sox' | 'custom', period: { startDate: string; endDate: string }): Promise<ComplianceReport>;
  getComplianceReports(): Promise<ComplianceReport[]>;
  getComplianceReport(reportId: string): Promise<ComplianceReport>;
  downloadComplianceReport(reportId: string): Promise<Blob>;
  
  // Export functionality
  exportLogs(query: AuditLogQuery, format: 'csv' | 'xlsx' | 'json'): Promise<Blob>;
  
  // System monitoring
  getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      recentErrors: number;
      securityAlerts: number;
      performanceIssues: number;
    };
    recommendations: string[];
  }>;
}

export const createAuditLogService = (client: AxiosInstance): AuditLogService => ({
  // Audit log management
  create: (data: CreateAuditLogDto): Promise<AuditLog> =>
    client.post('/audit-logs', data),

  getById: (logId: string): Promise<AuditLog> =>
    client.get(`/audit-logs/${logId}`),

  getList: (query: FindAuditLogsQueryDto = {}): Promise<AuditLogListResponse> => {
    const params = new URLSearchParams();
    
    if (query.userId) params.append('userId', query.userId);
    if (query.action) params.append('action', query.action);
    if (query.resource) params.append('resource', query.resource);
    if (query.resourceId) params.append('resourceId', query.resourceId);
    if (query.category) params.append('category', query.category);
    if (query.severity) params.append('severity', query.severity);
    if (query.success !== undefined) params.append('success', query.success.toString());
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.ipAddress) params.append('ipAddress', query.ipAddress);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/audit-logs${queryString}`);
  },

  getStats: (query: GetAuditLogStatsQueryDto = {}): Promise<AuditLogStats> => {
    const params = new URLSearchParams();
    
    if (query.userId) params.append('userId', query.userId);
    if (query.category) params.append('category', query.category);
    if (query.severity) params.append('severity', query.severity);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/audit-logs/stats${queryString}`);
  },

  // User activity tracking
  getUserActivity: (userId: string, query: GetUserActivityQueryDto = {}): Promise<AuditLogListResponse> => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    
    if (query.action) params.append('action', query.action);
    if (query.resource) params.append('resource', query.resource);
    if (query.category) params.append('category', query.category);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    return client.get(`/audit-logs/user/${userId}?${params.toString()}`);
  },

  getResourceActivity: (resource: string, resourceId: string): Promise<AuditLogListResponse> => {
    const params = new URLSearchParams();
    params.append('resource', resource);
    params.append('resourceId', resourceId);

    return client.get(`/audit-logs/resource?${params.toString()}`);
  },

  // Security events
  getSecurityEvents: (query: GetSecurityEventsQueryDto = {}): Promise<{ events: SecurityEvent[]; total: number }> => {
    const params = new URLSearchParams();
    
    if (query.type) params.append('type', query.type);
    if (query.severity) params.append('severity', query.severity);
    if (query.resolved !== undefined) params.append('resolved', query.resolved.toString());
    if (query.userId) params.append('userId', query.userId);
    if (query.ipAddress) params.append('ipAddress', query.ipAddress);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return client.get(`/audit-logs/security-events${queryString}`);
  },

  getSecurityEvent: (eventId: string): Promise<SecurityEvent> =>
    client.get(`/audit-logs/security-events/${eventId}`),

  resolveSecurityEvent: (eventId: string, data: ResolveSecurityEventDto): Promise<SecurityEvent> =>
    client.patch(`/audit-logs/security-events/${eventId}/resolve`, data),

  // Compliance and reporting
  generateComplianceReport: (
    type: 'gdpr' | 'hipaa' | 'sox' | 'custom',
    period: { startDate: string; endDate: string }
  ): Promise<ComplianceReport> =>
    client.post('/audit-logs/compliance-reports', { type, period }),

  getComplianceReports: (): Promise<ComplianceReport[]> =>
    client.get('/audit-logs/compliance-reports'),

  getComplianceReport: (reportId: string): Promise<ComplianceReport> =>
    client.get(`/audit-logs/compliance-reports/${reportId}`),

  downloadComplianceReport: (reportId: string): Promise<Blob> =>
    client.get(`/audit-logs/compliance-reports/${reportId}/download`, {
      responseType: 'blob'
    }),

  // Export functionality
  exportLogs: (query: AuditLogQuery, format: 'csv' | 'xlsx' | 'json'): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (query.userId) params.append('userId', query.userId);
    if (query.action) params.append('action', query.action);
    if (query.resource) params.append('resource', query.resource);
    if (query.category) params.append('category', query.category);
    if (query.severity) params.append('severity', query.severity);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.limit) params.append('limit', query.limit.toString());

    return client.get(`/audit-logs/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  // System monitoring
  getSystemHealth: (): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      recentErrors: number;
      securityAlerts: number;
      performanceIssues: number;
    };
    recommendations: string[];
  }> =>
    client.get('/audit-logs/system-health'),
});

