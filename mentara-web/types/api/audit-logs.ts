// Audit Log DTOs matching backend exactly

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'session' | 'community' | 'admin' | 'security' | 'payment' | 'system';
}

export interface AuditLogCreateDto {
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'session' | 'community' | 'admin' | 'security' | 'payment' | 'system';
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  category?: 'auth' | 'user' | 'session' | 'community' | 'admin' | 'security' | 'payment' | 'system';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'action' | 'user' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  hasMore: boolean;
  summary: {
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    uniqueUsers: number;
    criticalEvents: number;
  };
}

export interface AuditLogStats {
  totalLogs: number;
  logsByCategory: Record<string, number>;
  logsBySeverity: Record<string, number>;
  logsByUser: Array<{
    userId: string;
    userName: string;
    logCount: number;
    lastActivity: string;
  }>;
  recentCriticalEvents: AuditLog[];
  activityTrends: Array<{
    date: string;
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    criticalEvents: number;
  }>;
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach' | 'account_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface SecurityEventQuery {
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
  userId?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'gdpr' | 'hipaa' | 'sox' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
  generatedBy: string;
  summary: {
    totalEvents: number;
    complianceScore: number;
    violations: number;
    recommendations: string[];
  };
  details: {
    accessLogs: number;
    dataModifications: number;
    securityEvents: number;
    userActivities: number;
  };
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}