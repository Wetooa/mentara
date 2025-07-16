import { z } from 'zod';

// Define enums from Prisma client
const AuditActionSchema = z.enum([
  'USER_LOGIN',
  'USER_LOGOUT',
  'USER_REGISTER',
  'USER_UPDATE_PROFILE',
  'USER_DELETE_ACCOUNT',
  'USER_CHANGE_PASSWORD',
  'USER_RESET_PASSWORD',
  'THERAPIST_APPLICATION_SUBMIT',
  'THERAPIST_APPLICATION_APPROVE',
  'THERAPIST_APPLICATION_REJECT',
  'THERAPIST_PROFILE_UPDATE',
  'THERAPIST_AVAILABILITY_UPDATE',
  'UPDATE_THERAPIST_STATUS',
  'ACCEPT_CLIENT_REQUEST',
  'DECLINE_CLIENT_REQUEST',
  'REVIEW_CLIENT_REQUEST',
  'SEND_THERAPIST_REQUEST',
  'CANCEL_THERAPIST_REQUEST',
  'APPROVE_THERAPIST_APPLICATION',
  'REJECT_THERAPIST_APPLICATION',
  'SUSPEND_USER',
  'UNSUSPEND_USER',
  'MODERATE_POST',
  'MODERATE_COMMENT',
  'COMPLETE_ONBOARDING_STEP',
  'MEETING_CREATE',
  'MEETING_UPDATE',
  'MEETING_CANCEL',
  'MEETING_COMPLETE',
  'MEETING_NO_SHOW',
  'WORKSHEET_CREATE',
  'WORKSHEET_ASSIGN',
  'WORKSHEET_SUBMIT',
  'WORKSHEET_GRADE',
  'REVIEW_CREATE',
  'REVIEW_UPDATE',
  'REVIEW_DELETE',
  'REVIEW_MODERATE',
  'MESSAGE_SEND',
  'MESSAGE_EDIT',
  'MESSAGE_DELETE',
  'MESSAGE_REPORT',
  'ADMIN_USER_SUSPEND',
  'ADMIN_USER_ACTIVATE',
  'ADMIN_CONTENT_MODERATE',
  'ADMIN_SYSTEM_CONFIG',
  'SYSTEM_BACKUP',
  'SYSTEM_MAINTENANCE',
  'SYSTEM_ERROR',
  'DATA_EXPORT',
  'DATA_PURGE'
]);

const SystemEventTypeSchema = z.enum([
  'HIGH_CPU_USAGE',
  'HIGH_MEMORY_USAGE',
  'SLOW_QUERY',
  'HIGH_ERROR_RATE',
  'FAILED_LOGIN_ATTEMPTS',
  'SUSPICIOUS_ACTIVITY',
  'DATA_BREACH_ATTEMPT',
  'UNAUTHORIZED_ACCESS',
  'HIGH_USER_LOAD',
  'PAYMENT_PROCESSING_ERROR',
  'EMAIL_DELIVERY_FAILURE',
  'THIRD_PARTY_API_ERROR',
  'SERVICE_START',
  'SERVICE_STOP',
  'DEPLOYMENT',
  'CONFIGURATION_CHANGE',
  'DATABASE_MIGRATION',
  'UNUSUAL_USER_BEHAVIOR',
  'MASS_USER_ACTIONS',
  'DATA_EXPORT_REQUEST'
]);

const EventSeveritySchema = z.enum([
  'DEBUG',
  'INFO',
  'WARNING',
  'ERROR',
  'CRITICAL'
]);

const DataClassificationSchema = z.enum([
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED'
]);

// Base audit log query schema
export const FindAuditLogsQueryDtoSchema = z.object({
  userId: z.string().optional(),
  action: AuditActionSchema.optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
});

// System events query schema
export const FindSystemEventsQueryDtoSchema = z.object({
  eventType: SystemEventTypeSchema.optional(),
  severity: EventSeveritySchema.optional(),
  component: z.string().optional(),
  isResolved: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
});

// Data change logs query schema
export const FindDataChangeLogsQueryDtoSchema = z.object({
  tableName: z.string().optional(),
  recordId: z.string().optional(),
  operation: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
  changedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
});

// Audit statistics query schema
export const GetAuditStatisticsQueryDtoSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Enhanced search query schema
export const SearchAuditLogsQueryDtoSchema = z.object({
  userId: z.string().optional(),
  action: AuditActionSchema.optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

// Create schemas for POST endpoints
export const CreateAuditLogDtoSchema = z.object({
  action: AuditActionSchema,
  entity: z.string().min(1),
  entityId: z.string().min(1),
  oldValues: z.any().optional(),
  newValues: z.any().optional(),
  description: z.string().optional(),
  metadata: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  requestId: z.string().optional(),
});

export const CreateSystemEventDtoSchema = z.object({
  eventType: SystemEventTypeSchema,
  severity: EventSeveritySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  component: z.string().optional(),
  metadata: z.any().optional(),
  errorCode: z.string().optional(),
  stackTrace: z.string().optional(),
});

export const ResolveSystemEventDtoSchema = z.object({
  resolution: z.string().min(1),
});

export const CreateDataChangeLogDtoSchema = z.object({
  tableName: z.string().min(1),
  recordId: z.string().min(1),
  operation: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  changedFields: z.array(z.string()).optional(),
  oldData: z.any().optional(),
  newData: z.any().optional(),
  reason: z.string().optional(),
  dataClass: DataClassificationSchema.optional(),
});

// Helper endpoint schemas
export const LogUserLoginDtoSchema = z.object({
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const LogUserLogoutDtoSchema = z.object({
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const LogProfileUpdateDtoSchema = z.object({
  oldValues: z.any(),
  newValues: z.any(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const LogSystemErrorDtoSchema = z.object({
  component: z.string().min(1),
  error: z.object({
    name: z.string().min(1),
    message: z.string().min(1),
    stack: z.string().optional(),
  }),
  metadata: z.any().optional(),
});

export const CleanupAuditLogsDtoSchema = z.object({
  retentionDays: z.number().min(1).max(3650).default(365),
});

// Type inference helpers
export type FindAuditLogsQueryDto = z.infer<typeof FindAuditLogsQueryDtoSchema>;
export type FindSystemEventsQueryDto = z.infer<typeof FindSystemEventsQueryDtoSchema>;
export type FindDataChangeLogsQueryDto = z.infer<typeof FindDataChangeLogsQueryDtoSchema>;
export type GetAuditStatisticsQueryDto = z.infer<typeof GetAuditStatisticsQueryDtoSchema>;
export type SearchAuditLogsQueryDto = z.infer<typeof SearchAuditLogsQueryDtoSchema>;
export type CreateAuditLogDto = z.infer<typeof CreateAuditLogDtoSchema>;
export type CreateSystemEventDto = z.infer<typeof CreateSystemEventDtoSchema>;
export type ResolveSystemEventDto = z.infer<typeof ResolveSystemEventDtoSchema>;
export type CreateDataChangeLogDto = z.infer<typeof CreateDataChangeLogDtoSchema>;
export type LogUserLoginDto = z.infer<typeof LogUserLoginDtoSchema>;
export type LogUserLogoutDto = z.infer<typeof LogUserLogoutDtoSchema>;
export type LogProfileUpdateDto = z.infer<typeof LogProfileUpdateDtoSchema>;
export type LogSystemErrorDto = z.infer<typeof LogSystemErrorDtoSchema>;
export type CleanupAuditLogsDto = z.infer<typeof CleanupAuditLogsDtoSchema>;

// Additional DTOs for complex audit log data structures moved from frontend services
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.string().min(1),
  category: z.string().min(1),
  severity: z.string().min(1),
  success: z.boolean(),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  metadata: z.record(z.any()),
  timestamp: z.string().datetime(),
  details: z.string().min(1)
});

export const AuditLogListResponseSchema = z.object({
  logs: z.array(AuditLogSchema),
  total: z.number().min(0),
  page: z.number().min(1),
  totalPages: z.number().min(1),
  hasMore: z.boolean()
});

export const AuditLogStatsSchema = z.object({
  totalLogs: z.number().min(0),
  totalUsers: z.number().min(0),
  totalActions: z.number().min(0),
  recentActivity: z.number().min(0),
  byAction: z.record(z.string(), z.number().min(0)),
  byCategory: z.record(z.string(), z.number().min(0)),
  bySeverity: z.record(z.string(), z.number().min(0)),
  byUser: z.array(z.object({
    userId: z.string().uuid(),
    userEmail: z.string().email(),
    count: z.number().min(0)
  })),
  trends: z.array(z.object({
    date: z.string().datetime(),
    count: z.number().min(0),
    errors: z.number().min(0)
  }))
});

export const SecurityEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  severity: z.string().min(1),
  userId: z.string().uuid().optional(),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  description: z.string().min(1),
  resolved: z.boolean(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()),
  timestamp: z.string().datetime()
});

export const SecurityEventQuerySchema = z.object({
  type: z.string().optional(),
  severity: z.string().optional(),
  resolved: z.boolean().optional(),
  userId: z.string().uuid().optional(),
  ipAddress: z.string().ip().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const ComplianceReportSchema = z.object({
  id: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  reportData: z.record(z.any()).optional(),
  fileUrl: z.string().url().optional(),
  error: z.string().optional()
});

export const AuditLogCreateDtoSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().min(1),
  resource: z.string().min(1),
  resourceId: z.string().min(1),
  category: z.string().optional(),
  severity: z.string().optional(),
  success: z.boolean().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  details: z.string().optional()
});

export const AuditLogQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  success: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  ipAddress: z.string().ip().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Export type inference helpers for new schemas
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type AuditLogListResponse = z.infer<typeof AuditLogListResponseSchema>;
export type AuditLogStats = z.infer<typeof AuditLogStatsSchema>;
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;
export type SecurityEventQuery = z.infer<typeof SecurityEventQuerySchema>;
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
export type AuditLogCreateDto = z.infer<typeof AuditLogCreateDtoSchema>;
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;