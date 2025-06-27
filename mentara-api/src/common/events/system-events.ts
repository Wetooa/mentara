import { BaseDomainEvent, EventMetadata } from './interfaces/domain-event.interface';

// System & Admin Events

export interface SystemErrorData {
  errorId: string;
  errorType: 'database' | 'external_api' | 'validation' | 'authentication' | 'authorization' | 'network' | 'internal';
  errorMessage: string;
  stackTrace: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  httpMethod?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SystemErrorEvent extends BaseDomainEvent<SystemErrorData> {
  constructor(data: SystemErrorData, metadata?: EventMetadata) {
    super(data.errorId, 'SystemError', data, metadata);
  }
}

export interface AuditLogData {
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  changesMade?: Record<string, any>;
  previousValues?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogEvent extends BaseDomainEvent<AuditLogData> {
  constructor(data: AuditLogData, metadata?: EventMetadata) {
    super(`${data.resource}_${data.resourceId}`, 'AuditLog', data, metadata);
  }
}

export interface SecurityIncidentData {
  incidentId: string;
  incidentType: 'brute_force' | 'suspicious_login' | 'data_breach' | 'unauthorized_access' | 'malicious_request';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  detectionMethod: 'automatic' | 'manual' | 'report';
  actionTaken: string;
}

export class SecurityIncidentEvent extends BaseDomainEvent<SecurityIncidentData> {
  constructor(data: SecurityIncidentData, metadata?: EventMetadata) {
    super(data.incidentId, 'SecurityIncident', data, metadata);
  }
}

export interface BackupCompletedData {
  backupId: string;
  backupType: 'full' | 'incremental' | 'differential';
  dataSize: number; // in bytes
  duration: number; // in seconds
  backupLocation: string;
  isSuccessful: boolean;
  errorMessage?: string;
  tablesIncluded: string[];
}

export class BackupCompletedEvent extends BaseDomainEvent<BackupCompletedData> {
  constructor(data: BackupCompletedData, metadata?: EventMetadata) {
    super(data.backupId, 'Backup', data, metadata);
  }
}

export interface SystemMaintenanceData {
  maintenanceId: string;
  maintenanceType: 'scheduled' | 'emergency' | 'security_patch';
  startTime: Date;
  endTime?: Date;
  estimatedDuration?: number; // in minutes
  affectedServices: string[];
  maintenanceReason: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export class SystemMaintenanceEvent extends BaseDomainEvent<SystemMaintenanceData> {
  constructor(data: SystemMaintenanceData, metadata?: EventMetadata) {
    super(data.maintenanceId, 'Maintenance', data, metadata);
  }
}

export interface ConfigurationChangedData {
  configKey: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changeReason: string;
  environment: 'development' | 'staging' | 'production';
  requiresRestart: boolean;
}

export class ConfigurationChangedEvent extends BaseDomainEvent<ConfigurationChangedData> {
  constructor(data: ConfigurationChangedData, metadata?: EventMetadata) {
    super(data.configKey, 'Configuration', data, metadata);
  }
}

export interface AdminActionData {
  adminId: string;
  action: 'user_suspend' | 'user_unsuspend' | 'user_delete' | 'role_change' | 'data_export' | 'system_config';
  targetUserId?: string;
  targetResource?: string;
  resourceId?: string;
  previousState?: any;
  newState?: any;
  justification: string;
  requiresApproval: boolean;
  approvedBy?: string;
}

export class AdminActionEvent extends BaseDomainEvent<AdminActionData> {
  constructor(data: AdminActionData, metadata?: EventMetadata) {
    super(`${data.action}_${data.targetUserId || data.resourceId}`, 'AdminAction', data, metadata);
  }
}

export interface DataExportRequestData {
  requestId: string;
  requestedBy: string;
  userRole: string;
  dataType: 'user_data' | 'analytics' | 'audit_logs' | 'financial_reports';
  filters: Record<string, any>;
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  estimatedRecords: number;
  requestReason: string;
}

export class DataExportRequestEvent extends BaseDomainEvent<DataExportRequestData> {
  constructor(data: DataExportRequestData, metadata?: EventMetadata) {
    super(data.requestId, 'DataExport', data, metadata);
  }
}

export interface PerformanceAlertData {
  alertId: string;
  metricType: 'response_time' | 'cpu_usage' | 'memory_usage' | 'disk_usage' | 'database_connections' | 'error_rate';
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  service: string;
  endpoint?: string;
  duration: number; // how long the issue has persisted in seconds
}

export class PerformanceAlertEvent extends BaseDomainEvent<PerformanceAlertData> {
  constructor(data: PerformanceAlertData, metadata?: EventMetadata) {
    super(data.alertId, 'PerformanceAlert', data, metadata);
  }
}

export interface NotificationDeliveredData {
  notificationId: string;
  userId: string;
  notificationType: 'email' | 'sms' | 'push' | 'in_app';
  deliveryStatus: 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  deliveryProvider?: string;
  failureReason?: string;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export class NotificationDeliveredEvent extends BaseDomainEvent<NotificationDeliveredData> {
  constructor(data: NotificationDeliveredData, metadata?: EventMetadata) {
    super(data.notificationId, 'Notification', data, metadata);
  }
}