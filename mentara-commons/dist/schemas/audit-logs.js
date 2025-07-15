"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupAuditLogsDtoSchema = exports.SearchAuditLogsQueryDtoSchema = exports.LogSystemErrorDtoSchema = exports.LogProfileUpdateDtoSchema = exports.LogUserLogoutDtoSchema = exports.LogUserLoginDtoSchema = exports.GetAuditStatisticsQueryDtoSchema = exports.FindDataChangeLogsQueryDtoSchema = exports.CreateDataChangeLogDtoSchema = exports.SystemEventParamsDtoSchema = exports.ResolveSystemEventDtoSchema = exports.FindSystemEventsQueryDtoSchema = exports.CreateSystemEventDtoSchema = exports.FindAuditLogsQueryDtoSchema = exports.AuditLogIdParamSchema = exports.AuditLogQuerySchema = exports.CreateAuditLogDtoSchema = exports.AuditLogEntrySchema = void 0;
const zod_1 = require("zod");
// Audit Log Entry Schema
exports.AuditLogEntrySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    action: zod_1.z.string(),
    resource: zod_1.z.string(),
    resourceId: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime()
});
// Create Audit Log Schema
exports.CreateAuditLogDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    action: zod_1.z.string().min(1, 'Action is required'),
    resource: zod_1.z.string().min(1, 'Resource is required'),
    resourceId: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional()
});
// Audit Log Query Parameters
exports.AuditLogQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    userId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['timestamp', 'action', 'resource']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Audit Log ID Parameter Schema
exports.AuditLogIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid audit log ID format')
});
// Additional DTOs for AuditLogsController endpoints
exports.FindAuditLogsQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    userId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    sortBy: zod_1.z.enum(['timestamp', 'action', 'resource', 'severity']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.CreateSystemEventDtoSchema = zod_1.z.object({
    eventType: zod_1.z.enum(['server_restart', 'database_backup', 'security_alert', 'performance_issue', 'maintenance']),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    affectedSystems: zod_1.z.array(zod_1.z.string()).optional(),
    estimatedResolution: zod_1.z.string().datetime().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.FindSystemEventsQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    eventType: zod_1.z.enum(['server_restart', 'database_backup', 'security_alert', 'performance_issue', 'maintenance']).optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    status: zod_1.z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    affectedSystem: zod_1.z.string().optional()
});
exports.ResolveSystemEventDtoSchema = zod_1.z.object({
    resolution: zod_1.z.string().min(1, 'Resolution description is required').max(2000, 'Resolution too long'),
    resolvedBy: zod_1.z.string().uuid('Invalid user ID format'),
    resolutionTime: zod_1.z.string().datetime().optional(),
    followUpRequired: zod_1.z.boolean().default(false),
    preventiveMeasures: zod_1.z.array(zod_1.z.string()).optional()
});
exports.SystemEventParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid system event ID format')
});
exports.CreateDataChangeLogDtoSchema = zod_1.z.object({
    entityType: zod_1.z.string().min(1, 'Entity type is required'),
    entityId: zod_1.z.string().min(1, 'Entity ID is required'),
    changeType: zod_1.z.enum(['create', 'update', 'delete', 'restore']),
    changes: zod_1.z.record(zod_1.z.object({
        oldValue: zod_1.z.any().optional(),
        newValue: zod_1.z.any().optional()
    })),
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    reason: zod_1.z.string().max(500, 'Reason too long').optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.FindDataChangeLogsQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    entityType: zod_1.z.string().optional(),
    entityId: zod_1.z.string().optional(),
    changeType: zod_1.z.enum(['create', 'update', 'delete', 'restore']).optional(),
    userId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional()
});
exports.GetAuditStatisticsQueryDtoSchema = zod_1.z.object({
    timeframe: zod_1.z.enum(['day', 'week', 'month', 'quarter']).default('month'),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    groupBy: zod_1.z.enum(['action', 'resource', 'user', 'day']).optional(),
    includeSystemEvents: zod_1.z.boolean().default(true)
});
exports.LogUserLoginDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    loginMethod: zod_1.z.enum(['password', 'oauth', 'sso', 'token']).default('password'),
    success: zod_1.z.boolean()
});
exports.LogUserLogoutDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    sessionDuration: zod_1.z.number().min(0).optional(), // in minutes
    reason: zod_1.z.enum(['user_action', 'timeout', 'forced', 'system_restart']).default('user_action')
});
exports.LogProfileUpdateDtoSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID format'),
    changedFields: zod_1.z.array(zod_1.z.string()).min(1, 'At least one changed field is required'),
    oldValues: zod_1.z.record(zod_1.z.any()).optional(),
    newValues: zod_1.z.record(zod_1.z.any()).optional(),
    updateReason: zod_1.z.string().optional()
});
exports.LogSystemErrorDtoSchema = zod_1.z.object({
    errorCode: zod_1.z.string().min(1, 'Error code is required'),
    errorMessage: zod_1.z.string().min(1, 'Error message is required'),
    stackTrace: zod_1.z.string().optional(),
    userId: zod_1.z.string().uuid().optional(),
    requestUrl: zod_1.z.string().optional(),
    requestMethod: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    context: zod_1.z.record(zod_1.z.any()).optional()
});
exports.SearchAuditLogsQueryDtoSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required'),
    filters: zod_1.z.object({
        dateFrom: zod_1.z.string().datetime().optional(),
        dateTo: zod_1.z.string().datetime().optional(),
        actions: zod_1.z.array(zod_1.z.string()).optional(),
        resources: zod_1.z.array(zod_1.z.string()).optional(),
        userIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
        severity: zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'critical'])).optional()
    }).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['relevance', 'timestamp', 'severity']).default('relevance')
});
exports.CleanupAuditLogsDtoSchema = zod_1.z.object({
    olderThan: zod_1.z.string().datetime('Invalid date format'),
    dryRun: zod_1.z.boolean().default(true),
    batchSize: zod_1.z.number().min(100).max(10000).default(1000),
    excludeSeverity: zod_1.z.array(zod_1.z.enum(['high', 'critical'])).optional()
});
//# sourceMappingURL=audit-logs.js.map