import { z } from 'zod';
export declare const AuditLogEntrySchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    action: z.ZodString;
    resource: z.ZodString;
    resourceId: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    resourceId?: string | undefined;
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    resourceId?: string | undefined;
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const CreateAuditLogDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    action: z.ZodString;
    resource: z.ZodString;
    resourceId: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string | undefined;
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string | undefined;
    details?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const AuditLogQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["timestamp", "action", "resource"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "action" | "resource" | "timestamp" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "action" | "resource" | "timestamp" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
}>;
export declare const AuditLogIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type CreateAuditLogDto = z.infer<typeof CreateAuditLogDtoSchema>;
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
export type AuditLogIdParam = z.infer<typeof AuditLogIdParamSchema>;
export declare const FindAuditLogsQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    sortBy: z.ZodOptional<z.ZodEnum<["timestamp", "action", "resource", "severity"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "action" | "resource" | "timestamp" | "severity" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "action" | "resource" | "timestamp" | "severity" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    action?: string | undefined;
    resource?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
}>;
export declare const CreateSystemEventDtoSchema: z.ZodObject<{
    eventType: z.ZodEnum<["server_restart", "database_backup", "security_alert", "performance_issue", "maintenance"]>;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    description: z.ZodString;
    affectedSystems: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    estimatedResolution: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    eventType: "server_restart" | "database_backup" | "security_alert" | "performance_issue" | "maintenance";
    affectedSystems?: string[] | undefined;
    estimatedResolution?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    eventType: "server_restart" | "database_backup" | "security_alert" | "performance_issue" | "maintenance";
    affectedSystems?: string[] | undefined;
    estimatedResolution?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const FindSystemEventsQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    eventType: z.ZodOptional<z.ZodEnum<["server_restart", "database_backup", "security_alert", "performance_issue", "maintenance"]>>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodOptional<z.ZodEnum<["open", "in_progress", "resolved", "closed"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    affectedSystem: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "in_progress" | "open" | "resolved" | "closed" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    eventType?: "server_restart" | "database_backup" | "security_alert" | "performance_issue" | "maintenance" | undefined;
    affectedSystem?: string | undefined;
}, {
    status?: "in_progress" | "open" | "resolved" | "closed" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    eventType?: "server_restart" | "database_backup" | "security_alert" | "performance_issue" | "maintenance" | undefined;
    affectedSystem?: string | undefined;
}>;
export declare const ResolveSystemEventDtoSchema: z.ZodObject<{
    resolution: z.ZodString;
    resolvedBy: z.ZodString;
    resolutionTime: z.ZodOptional<z.ZodString>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    preventiveMeasures: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    resolution: string;
    resolvedBy: string;
    followUpRequired: boolean;
    resolutionTime?: string | undefined;
    preventiveMeasures?: string[] | undefined;
}, {
    resolution: string;
    resolvedBy: string;
    resolutionTime?: string | undefined;
    followUpRequired?: boolean | undefined;
    preventiveMeasures?: string[] | undefined;
}>;
export declare const SystemEventParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CreateDataChangeLogDtoSchema: z.ZodObject<{
    entityType: z.ZodString;
    entityId: z.ZodString;
    changeType: z.ZodEnum<["create", "update", "delete", "restore"]>;
    changes: z.ZodRecord<z.ZodString, z.ZodObject<{
        oldValue: z.ZodOptional<z.ZodAny>;
        newValue: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        oldValue?: any;
        newValue?: any;
    }, {
        oldValue?: any;
        newValue?: any;
    }>>;
    userId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    entityType: string;
    entityId: string;
    changeType: "create" | "update" | "delete" | "restore";
    changes: Record<string, {
        oldValue?: any;
        newValue?: any;
    }>;
    reason?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    userId: string;
    entityType: string;
    entityId: string;
    changeType: "create" | "update" | "delete" | "restore";
    changes: Record<string, {
        oldValue?: any;
        newValue?: any;
    }>;
    reason?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const FindDataChangeLogsQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    changeType: z.ZodOptional<z.ZodEnum<["create", "update", "delete", "restore"]>>;
    userId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    entityType?: string | undefined;
    entityId?: string | undefined;
    changeType?: "create" | "update" | "delete" | "restore" | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    entityType?: string | undefined;
    entityId?: string | undefined;
    changeType?: "create" | "update" | "delete" | "restore" | undefined;
}>;
export declare const GetAuditStatisticsQueryDtoSchema: z.ZodObject<{
    timeframe: z.ZodDefault<z.ZodEnum<["day", "week", "month", "quarter"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    groupBy: z.ZodOptional<z.ZodEnum<["action", "resource", "user", "day"]>>;
    includeSystemEvents: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timeframe: "month" | "week" | "quarter" | "day";
    includeSystemEvents: boolean;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    groupBy?: "user" | "day" | "action" | "resource" | undefined;
}, {
    timeframe?: "month" | "week" | "quarter" | "day" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    groupBy?: "user" | "day" | "action" | "resource" | undefined;
    includeSystemEvents?: boolean | undefined;
}>;
export declare const LogUserLoginDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    loginMethod: z.ZodDefault<z.ZodEnum<["password", "oauth", "sso", "token"]>>;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    userId: string;
    loginMethod: "password" | "oauth" | "sso" | "token";
    success: boolean;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    location?: string | undefined;
}, {
    userId: string;
    success: boolean;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    location?: string | undefined;
    loginMethod?: "password" | "oauth" | "sso" | "token" | undefined;
}>;
export declare const LogUserLogoutDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    sessionDuration: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodDefault<z.ZodEnum<["user_action", "timeout", "forced", "system_restart"]>>;
}, "strip", z.ZodTypeAny, {
    reason: "user_action" | "timeout" | "forced" | "system_restart";
    userId: string;
    sessionDuration?: number | undefined;
}, {
    userId: string;
    reason?: "user_action" | "timeout" | "forced" | "system_restart" | undefined;
    sessionDuration?: number | undefined;
}>;
export declare const LogProfileUpdateDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    changedFields: z.ZodArray<z.ZodString, "many">;
    oldValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    newValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    updateReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    changedFields: string[];
    oldValues?: Record<string, any> | undefined;
    newValues?: Record<string, any> | undefined;
    updateReason?: string | undefined;
}, {
    userId: string;
    changedFields: string[];
    oldValues?: Record<string, any> | undefined;
    newValues?: Record<string, any> | undefined;
    updateReason?: string | undefined;
}>;
export declare const LogSystemErrorDtoSchema: z.ZodObject<{
    errorCode: z.ZodString;
    errorMessage: z.ZodString;
    stackTrace: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    requestUrl: z.ZodOptional<z.ZodString>;
    requestMethod: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>>;
    severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    severity: "low" | "medium" | "high" | "critical";
    errorCode: string;
    errorMessage: string;
    userId?: string | undefined;
    stackTrace?: string | undefined;
    requestUrl?: string | undefined;
    requestMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
    context?: Record<string, any> | undefined;
}, {
    errorCode: string;
    errorMessage: string;
    userId?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    stackTrace?: string | undefined;
    requestUrl?: string | undefined;
    requestMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
    context?: Record<string, any> | undefined;
}>;
export declare const SearchAuditLogsQueryDtoSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodObject<{
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        userIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        severity: z.ZodOptional<z.ZodArray<z.ZodEnum<["low", "medium", "high", "critical"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        severity?: ("low" | "medium" | "high" | "critical")[] | undefined;
        actions?: string[] | undefined;
        resources?: string[] | undefined;
        userIds?: string[] | undefined;
    }, {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        severity?: ("low" | "medium" | "high" | "critical")[] | undefined;
        actions?: string[] | undefined;
        resources?: string[] | undefined;
        userIds?: string[] | undefined;
    }>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["relevance", "timestamp", "severity"]>>;
}, "strip", z.ZodTypeAny, {
    sortBy: "timestamp" | "severity" | "relevance";
    query: string;
    limit?: number | undefined;
    page?: number | undefined;
    filters?: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        severity?: ("low" | "medium" | "high" | "critical")[] | undefined;
        actions?: string[] | undefined;
        resources?: string[] | undefined;
        userIds?: string[] | undefined;
    } | undefined;
}, {
    query: string;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "timestamp" | "severity" | "relevance" | undefined;
    filters?: {
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        severity?: ("low" | "medium" | "high" | "critical")[] | undefined;
        actions?: string[] | undefined;
        resources?: string[] | undefined;
        userIds?: string[] | undefined;
    } | undefined;
}>;
export declare const CleanupAuditLogsDtoSchema: z.ZodObject<{
    olderThan: z.ZodString;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    batchSize: z.ZodDefault<z.ZodNumber>;
    excludeSeverity: z.ZodOptional<z.ZodArray<z.ZodEnum<["high", "critical"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    olderThan: string;
    dryRun: boolean;
    batchSize: number;
    excludeSeverity?: ("high" | "critical")[] | undefined;
}, {
    olderThan: string;
    dryRun?: boolean | undefined;
    batchSize?: number | undefined;
    excludeSeverity?: ("high" | "critical")[] | undefined;
}>;
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
//# sourceMappingURL=audit-logs.d.ts.map