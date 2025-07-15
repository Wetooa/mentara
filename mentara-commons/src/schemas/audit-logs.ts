import { z } from 'zod';

// Audit Log Entry Schema
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime()
});

// Create Audit Log Schema
export const CreateAuditLogDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// Audit Log Query Parameters
export const AuditLogQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['timestamp', 'action', 'resource']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Audit Log ID Parameter Schema
export const AuditLogIdParamSchema = z.object({
  id: z.string().uuid('Invalid audit log ID format')
});

// Export type inference helpers
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type CreateAuditLogDto = z.infer<typeof CreateAuditLogDtoSchema>;
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
export type AuditLogIdParam = z.infer<typeof AuditLogIdParamSchema>;

// Additional DTOs for AuditLogsController endpoints
export const FindAuditLogsQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  sortBy: z.enum(['timestamp', 'action', 'resource', 'severity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const CreateSystemEventDtoSchema = z.object({
  eventType: z.enum(['server_restart', 'database_backup', 'security_alert', 'performance_issue', 'maintenance']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  affectedSystems: z.array(z.string()).optional(),
  estimatedResolution: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

export const FindSystemEventsQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  eventType: z.enum(['server_restart', 'database_backup', 'security_alert', 'performance_issue', 'maintenance']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  affectedSystem: z.string().optional()
});

export const ResolveSystemEventDtoSchema = z.object({
  resolution: z.string().min(1, 'Resolution description is required').max(2000, 'Resolution too long'),
  resolvedBy: z.string().uuid('Invalid user ID format'),
  resolutionTime: z.string().datetime().optional(),
  followUpRequired: z.boolean().default(false),
  preventiveMeasures: z.array(z.string()).optional()
});

export const SystemEventParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid system event ID format')
});

export const CreateDataChangeLogDtoSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  changeType: z.enum(['create', 'update', 'delete', 'restore']),
  changes: z.record(z.object({
    oldValue: z.any().optional(),
    newValue: z.any().optional()
  })),
  userId: z.string().uuid('Invalid user ID format'),
  reason: z.string().max(500, 'Reason too long').optional(),
  metadata: z.record(z.any()).optional()
});

export const FindDataChangeLogsQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  changeType: z.enum(['create', 'update', 'delete', 'restore']).optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

export const GetAuditStatisticsQueryDtoSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month', 'quarter']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['action', 'resource', 'user', 'day']).optional(),
  includeSystemEvents: z.boolean().default(true)
});

export const LogUserLoginDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.string().optional(),
  loginMethod: z.enum(['password', 'oauth', 'sso', 'token']).default('password'),
  success: z.boolean()
});

export const LogUserLogoutDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  sessionDuration: z.number().min(0).optional(), // in minutes
  reason: z.enum(['user_action', 'timeout', 'forced', 'system_restart']).default('user_action')
});

export const LogProfileUpdateDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  changedFields: z.array(z.string()).min(1, 'At least one changed field is required'),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  updateReason: z.string().optional()
});

export const LogSystemErrorDtoSchema = z.object({
  errorCode: z.string().min(1, 'Error code is required'),
  errorMessage: z.string().min(1, 'Error message is required'),
  stackTrace: z.string().optional(),
  userId: z.string().uuid().optional(),
  requestUrl: z.string().optional(),
  requestMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  context: z.record(z.any()).optional()
});

export const SearchAuditLogsQueryDtoSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    actions: z.array(z.string()).optional(),
    resources: z.array(z.string()).optional(),
    userIds: z.array(z.string().uuid()).optional(),
    severity: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional()
  }).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['relevance', 'timestamp', 'severity']).default('relevance')
});

export const CleanupAuditLogsDtoSchema = z.object({
  olderThan: z.string().datetime('Invalid date format'),
  dryRun: z.boolean().default(true),
  batchSize: z.number().min(100).max(10000).default(1000),
  excludeSeverity: z.array(z.enum(['high', 'critical'])).optional()
});

// Type exports for new DTOs
export type FindAuditLogsQueryDto = z.infer<typeof FindAuditLogsQueryDtoSchema>;
export type CreateSystemEventDto = z.infer<typeof CreateSystemEventDtoSchema>;
export type FindSystemEventsQueryDto = z.infer<typeof FindSystemEventsQueryDtoSchema>;
export type ResolveSystemEventDto = z.infer<typeof ResolveSystemEventDtoSchema>;
export type SystemEventParamsDto = z.infer<typeof SystemEventParamsDtoSchema>;
export type CreateDataChangeLogDto = z.infer<typeof CreateDataChangeLogDtoSchema>;
export type FindDataChangeLogsQueryDto = z.infer<typeof FindDataChangeLogsQueryDtoSchema>;
export type GetAuditStatisticsQueryDto = z.infer<typeof GetAuditStatisticsQueryDtoSchema>;
export type LogUserLoginDto = z.infer<typeof LogUserLoginDtoSchema>;
export type LogUserLogoutDto = z.infer<typeof LogUserLogoutDtoSchema>;
export type LogProfileUpdateDto = z.infer<typeof LogProfileUpdateDtoSchema>;
export type LogSystemErrorDto = z.infer<typeof LogSystemErrorDtoSchema>;
export type SearchAuditLogsQueryDto = z.infer<typeof SearchAuditLogsQueryDtoSchema>;
export type CleanupAuditLogsDto = z.infer<typeof CleanupAuditLogsDtoSchema>;