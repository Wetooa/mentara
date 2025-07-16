"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupAuditLogsDtoSchema = exports.LogSystemErrorDtoSchema = exports.LogProfileUpdateDtoSchema = exports.LogUserLogoutDtoSchema = exports.LogUserLoginDtoSchema = exports.CreateDataChangeLogDtoSchema = exports.ResolveSystemEventDtoSchema = exports.CreateSystemEventDtoSchema = exports.CreateAuditLogDtoSchema = exports.SearchAuditLogsQueryDtoSchema = exports.GetAuditStatisticsQueryDtoSchema = exports.FindDataChangeLogsQueryDtoSchema = exports.FindSystemEventsQueryDtoSchema = exports.FindAuditLogsQueryDtoSchema = void 0;
const zod_1 = require("zod");
// Define enums from Prisma client
const AuditActionSchema = zod_1.z.enum([
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
const SystemEventTypeSchema = zod_1.z.enum([
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
const EventSeveritySchema = zod_1.z.enum([
    'DEBUG',
    'INFO',
    'WARNING',
    'ERROR',
    'CRITICAL'
]);
const DataClassificationSchema = zod_1.z.enum([
    'PUBLIC',
    'INTERNAL',
    'CONFIDENTIAL',
    'RESTRICTED'
]);
// Base audit log query schema
exports.FindAuditLogsQueryDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    action: AuditActionSchema.optional(),
    entity: zod_1.z.string().optional(),
    entityId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(1000).default(100),
});
// System events query schema
exports.FindSystemEventsQueryDtoSchema = zod_1.z.object({
    eventType: SystemEventTypeSchema.optional(),
    severity: EventSeveritySchema.optional(),
    component: zod_1.z.string().optional(),
    isResolved: zod_1.z.boolean().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(1000).default(100),
});
// Data change logs query schema
exports.FindDataChangeLogsQueryDtoSchema = zod_1.z.object({
    tableName: zod_1.z.string().optional(),
    recordId: zod_1.z.string().optional(),
    operation: zod_1.z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
    changedBy: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(1000).default(100),
});
// Audit statistics query schema
exports.GetAuditStatisticsQueryDtoSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Enhanced search query schema
exports.SearchAuditLogsQueryDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    action: AuditActionSchema.optional(),
    entity: zod_1.z.string().optional(),
    entityId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(1000).default(100),
    offset: zod_1.z.number().min(0).default(0),
});
// Create schemas for POST endpoints
exports.CreateAuditLogDtoSchema = zod_1.z.object({
    action: AuditActionSchema,
    entity: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    oldValues: zod_1.z.any().optional(),
    newValues: zod_1.z.any().optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.any().optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    requestId: zod_1.z.string().optional(),
});
exports.CreateSystemEventDtoSchema = zod_1.z.object({
    eventType: SystemEventTypeSchema,
    severity: EventSeveritySchema,
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    component: zod_1.z.string().optional(),
    metadata: zod_1.z.any().optional(),
    errorCode: zod_1.z.string().optional(),
    stackTrace: zod_1.z.string().optional(),
});
exports.ResolveSystemEventDtoSchema = zod_1.z.object({
    resolution: zod_1.z.string().min(1),
});
exports.CreateDataChangeLogDtoSchema = zod_1.z.object({
    tableName: zod_1.z.string().min(1),
    recordId: zod_1.z.string().min(1),
    operation: zod_1.z.enum(['INSERT', 'UPDATE', 'DELETE']),
    changedFields: zod_1.z.array(zod_1.z.string()).optional(),
    oldData: zod_1.z.any().optional(),
    newData: zod_1.z.any().optional(),
    reason: zod_1.z.string().optional(),
    dataClass: DataClassificationSchema.optional(),
});
// Helper endpoint schemas
exports.LogUserLoginDtoSchema = zod_1.z.object({
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
exports.LogUserLogoutDtoSchema = zod_1.z.object({
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
exports.LogProfileUpdateDtoSchema = zod_1.z.object({
    oldValues: zod_1.z.any(),
    newValues: zod_1.z.any(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
exports.LogSystemErrorDtoSchema = zod_1.z.object({
    component: zod_1.z.string().min(1),
    error: zod_1.z.object({
        name: zod_1.z.string().min(1),
        message: zod_1.z.string().min(1),
        stack: zod_1.z.string().optional(),
    }),
    metadata: zod_1.z.any().optional(),
});
exports.CleanupAuditLogsDtoSchema = zod_1.z.object({
    retentionDays: zod_1.z.number().min(1).max(3650).default(365),
});
//# sourceMappingURL=audit-logs.js.map