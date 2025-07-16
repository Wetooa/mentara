import { z } from 'zod';
export declare const FindAuditLogsQueryDtoSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodEnum<["USER_LOGIN", "USER_LOGOUT", "USER_REGISTER", "USER_UPDATE_PROFILE", "USER_DELETE_ACCOUNT", "USER_CHANGE_PASSWORD", "USER_RESET_PASSWORD", "THERAPIST_APPLICATION_SUBMIT", "THERAPIST_APPLICATION_APPROVE", "THERAPIST_APPLICATION_REJECT", "THERAPIST_PROFILE_UPDATE", "THERAPIST_AVAILABILITY_UPDATE", "UPDATE_THERAPIST_STATUS", "ACCEPT_CLIENT_REQUEST", "DECLINE_CLIENT_REQUEST", "REVIEW_CLIENT_REQUEST", "SEND_THERAPIST_REQUEST", "CANCEL_THERAPIST_REQUEST", "APPROVE_THERAPIST_APPLICATION", "REJECT_THERAPIST_APPLICATION", "SUSPEND_USER", "UNSUSPEND_USER", "MODERATE_POST", "MODERATE_COMMENT", "COMPLETE_ONBOARDING_STEP", "MEETING_CREATE", "MEETING_UPDATE", "MEETING_CANCEL", "MEETING_COMPLETE", "MEETING_NO_SHOW", "WORKSHEET_CREATE", "WORKSHEET_ASSIGN", "WORKSHEET_SUBMIT", "WORKSHEET_GRADE", "REVIEW_CREATE", "REVIEW_UPDATE", "REVIEW_DELETE", "REVIEW_MODERATE", "MESSAGE_SEND", "MESSAGE_EDIT", "MESSAGE_DELETE", "MESSAGE_REPORT", "ADMIN_USER_SUSPEND", "ADMIN_USER_ACTIVATE", "ADMIN_CONTENT_MODERATE", "ADMIN_SYSTEM_CONFIG", "SYSTEM_BACKUP", "SYSTEM_MAINTENANCE", "SYSTEM_ERROR", "DATA_EXPORT", "DATA_PURGE"]>>;
    entity: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    userId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE" | undefined;
    entity?: string | undefined;
    entityId?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE" | undefined;
    entity?: string | undefined;
    entityId?: string | undefined;
}>;
export declare const FindSystemEventsQueryDtoSchema: z.ZodObject<{
    eventType: z.ZodOptional<z.ZodEnum<["HIGH_CPU_USAGE", "HIGH_MEMORY_USAGE", "SLOW_QUERY", "HIGH_ERROR_RATE", "FAILED_LOGIN_ATTEMPTS", "SUSPICIOUS_ACTIVITY", "DATA_BREACH_ATTEMPT", "UNAUTHORIZED_ACCESS", "HIGH_USER_LOAD", "PAYMENT_PROCESSING_ERROR", "EMAIL_DELIVERY_FAILURE", "THIRD_PARTY_API_ERROR", "SERVICE_START", "SERVICE_STOP", "DEPLOYMENT", "CONFIGURATION_CHANGE", "DATABASE_MIGRATION", "UNUSUAL_USER_BEHAVIOR", "MASS_USER_ACTIONS", "DATA_EXPORT_REQUEST"]>>;
    severity: z.ZodOptional<z.ZodEnum<["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]>>;
    component: z.ZodOptional<z.ZodString>;
    isResolved: z.ZodOptional<z.ZodBoolean>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    startDate?: string | undefined;
    endDate?: string | undefined;
    eventType?: "HIGH_CPU_USAGE" | "HIGH_MEMORY_USAGE" | "SLOW_QUERY" | "HIGH_ERROR_RATE" | "FAILED_LOGIN_ATTEMPTS" | "SUSPICIOUS_ACTIVITY" | "DATA_BREACH_ATTEMPT" | "UNAUTHORIZED_ACCESS" | "HIGH_USER_LOAD" | "PAYMENT_PROCESSING_ERROR" | "EMAIL_DELIVERY_FAILURE" | "THIRD_PARTY_API_ERROR" | "SERVICE_START" | "SERVICE_STOP" | "DEPLOYMENT" | "CONFIGURATION_CHANGE" | "DATABASE_MIGRATION" | "UNUSUAL_USER_BEHAVIOR" | "MASS_USER_ACTIONS" | "DATA_EXPORT_REQUEST" | undefined;
    severity?: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL" | undefined;
    component?: string | undefined;
    isResolved?: boolean | undefined;
}, {
    limit?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    eventType?: "HIGH_CPU_USAGE" | "HIGH_MEMORY_USAGE" | "SLOW_QUERY" | "HIGH_ERROR_RATE" | "FAILED_LOGIN_ATTEMPTS" | "SUSPICIOUS_ACTIVITY" | "DATA_BREACH_ATTEMPT" | "UNAUTHORIZED_ACCESS" | "HIGH_USER_LOAD" | "PAYMENT_PROCESSING_ERROR" | "EMAIL_DELIVERY_FAILURE" | "THIRD_PARTY_API_ERROR" | "SERVICE_START" | "SERVICE_STOP" | "DEPLOYMENT" | "CONFIGURATION_CHANGE" | "DATABASE_MIGRATION" | "UNUSUAL_USER_BEHAVIOR" | "MASS_USER_ACTIONS" | "DATA_EXPORT_REQUEST" | undefined;
    severity?: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL" | undefined;
    component?: string | undefined;
    isResolved?: boolean | undefined;
}>;
export declare const FindDataChangeLogsQueryDtoSchema: z.ZodObject<{
    tableName: z.ZodOptional<z.ZodString>;
    recordId: z.ZodOptional<z.ZodString>;
    operation: z.ZodOptional<z.ZodEnum<["INSERT", "UPDATE", "DELETE"]>>;
    changedBy: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    startDate?: string | undefined;
    endDate?: string | undefined;
    tableName?: string | undefined;
    recordId?: string | undefined;
    operation?: "INSERT" | "UPDATE" | "DELETE" | undefined;
    changedBy?: string | undefined;
}, {
    limit?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    tableName?: string | undefined;
    recordId?: string | undefined;
    operation?: "INSERT" | "UPDATE" | "DELETE" | undefined;
    changedBy?: string | undefined;
}>;
export declare const GetAuditStatisticsQueryDtoSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const SearchAuditLogsQueryDtoSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodEnum<["USER_LOGIN", "USER_LOGOUT", "USER_REGISTER", "USER_UPDATE_PROFILE", "USER_DELETE_ACCOUNT", "USER_CHANGE_PASSWORD", "USER_RESET_PASSWORD", "THERAPIST_APPLICATION_SUBMIT", "THERAPIST_APPLICATION_APPROVE", "THERAPIST_APPLICATION_REJECT", "THERAPIST_PROFILE_UPDATE", "THERAPIST_AVAILABILITY_UPDATE", "UPDATE_THERAPIST_STATUS", "ACCEPT_CLIENT_REQUEST", "DECLINE_CLIENT_REQUEST", "REVIEW_CLIENT_REQUEST", "SEND_THERAPIST_REQUEST", "CANCEL_THERAPIST_REQUEST", "APPROVE_THERAPIST_APPLICATION", "REJECT_THERAPIST_APPLICATION", "SUSPEND_USER", "UNSUSPEND_USER", "MODERATE_POST", "MODERATE_COMMENT", "COMPLETE_ONBOARDING_STEP", "MEETING_CREATE", "MEETING_UPDATE", "MEETING_CANCEL", "MEETING_COMPLETE", "MEETING_NO_SHOW", "WORKSHEET_CREATE", "WORKSHEET_ASSIGN", "WORKSHEET_SUBMIT", "WORKSHEET_GRADE", "REVIEW_CREATE", "REVIEW_UPDATE", "REVIEW_DELETE", "REVIEW_MODERATE", "MESSAGE_SEND", "MESSAGE_EDIT", "MESSAGE_DELETE", "MESSAGE_REPORT", "ADMIN_USER_SUSPEND", "ADMIN_USER_ACTIVATE", "ADMIN_CONTENT_MODERATE", "ADMIN_SYSTEM_CONFIG", "SYSTEM_BACKUP", "SYSTEM_MAINTENANCE", "SYSTEM_ERROR", "DATA_EXPORT", "DATA_PURGE"]>>;
    entity: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    userId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE" | undefined;
    entity?: string | undefined;
    entityId?: string | undefined;
}, {
    userId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    action?: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE" | undefined;
    entity?: string | undefined;
    entityId?: string | undefined;
}>;
export declare const CreateAuditLogDtoSchema: z.ZodObject<{
    action: z.ZodEnum<["USER_LOGIN", "USER_LOGOUT", "USER_REGISTER", "USER_UPDATE_PROFILE", "USER_DELETE_ACCOUNT", "USER_CHANGE_PASSWORD", "USER_RESET_PASSWORD", "THERAPIST_APPLICATION_SUBMIT", "THERAPIST_APPLICATION_APPROVE", "THERAPIST_APPLICATION_REJECT", "THERAPIST_PROFILE_UPDATE", "THERAPIST_AVAILABILITY_UPDATE", "UPDATE_THERAPIST_STATUS", "ACCEPT_CLIENT_REQUEST", "DECLINE_CLIENT_REQUEST", "REVIEW_CLIENT_REQUEST", "SEND_THERAPIST_REQUEST", "CANCEL_THERAPIST_REQUEST", "APPROVE_THERAPIST_APPLICATION", "REJECT_THERAPIST_APPLICATION", "SUSPEND_USER", "UNSUSPEND_USER", "MODERATE_POST", "MODERATE_COMMENT", "COMPLETE_ONBOARDING_STEP", "MEETING_CREATE", "MEETING_UPDATE", "MEETING_CANCEL", "MEETING_COMPLETE", "MEETING_NO_SHOW", "WORKSHEET_CREATE", "WORKSHEET_ASSIGN", "WORKSHEET_SUBMIT", "WORKSHEET_GRADE", "REVIEW_CREATE", "REVIEW_UPDATE", "REVIEW_DELETE", "REVIEW_MODERATE", "MESSAGE_SEND", "MESSAGE_EDIT", "MESSAGE_DELETE", "MESSAGE_REPORT", "ADMIN_USER_SUSPEND", "ADMIN_USER_ACTIVATE", "ADMIN_CONTENT_MODERATE", "ADMIN_SYSTEM_CONFIG", "SYSTEM_BACKUP", "SYSTEM_MAINTENANCE", "SYSTEM_ERROR", "DATA_EXPORT", "DATA_PURGE"]>;
    entity: z.ZodString;
    entityId: z.ZodString;
    oldValues: z.ZodOptional<z.ZodAny>;
    newValues: z.ZodOptional<z.ZodAny>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE";
    entity: string;
    entityId: string;
    description?: string | undefined;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    requestId?: string | undefined;
}, {
    action: "USER_LOGIN" | "USER_LOGOUT" | "USER_REGISTER" | "USER_UPDATE_PROFILE" | "USER_DELETE_ACCOUNT" | "USER_CHANGE_PASSWORD" | "USER_RESET_PASSWORD" | "THERAPIST_APPLICATION_SUBMIT" | "THERAPIST_APPLICATION_APPROVE" | "THERAPIST_APPLICATION_REJECT" | "THERAPIST_PROFILE_UPDATE" | "THERAPIST_AVAILABILITY_UPDATE" | "UPDATE_THERAPIST_STATUS" | "ACCEPT_CLIENT_REQUEST" | "DECLINE_CLIENT_REQUEST" | "REVIEW_CLIENT_REQUEST" | "SEND_THERAPIST_REQUEST" | "CANCEL_THERAPIST_REQUEST" | "APPROVE_THERAPIST_APPLICATION" | "REJECT_THERAPIST_APPLICATION" | "SUSPEND_USER" | "UNSUSPEND_USER" | "MODERATE_POST" | "MODERATE_COMMENT" | "COMPLETE_ONBOARDING_STEP" | "MEETING_CREATE" | "MEETING_UPDATE" | "MEETING_CANCEL" | "MEETING_COMPLETE" | "MEETING_NO_SHOW" | "WORKSHEET_CREATE" | "WORKSHEET_ASSIGN" | "WORKSHEET_SUBMIT" | "WORKSHEET_GRADE" | "REVIEW_CREATE" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_MODERATE" | "MESSAGE_SEND" | "MESSAGE_EDIT" | "MESSAGE_DELETE" | "MESSAGE_REPORT" | "ADMIN_USER_SUSPEND" | "ADMIN_USER_ACTIVATE" | "ADMIN_CONTENT_MODERATE" | "ADMIN_SYSTEM_CONFIG" | "SYSTEM_BACKUP" | "SYSTEM_MAINTENANCE" | "SYSTEM_ERROR" | "DATA_EXPORT" | "DATA_PURGE";
    entity: string;
    entityId: string;
    description?: string | undefined;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    requestId?: string | undefined;
}>;
export declare const CreateSystemEventDtoSchema: z.ZodObject<{
    eventType: z.ZodEnum<["HIGH_CPU_USAGE", "HIGH_MEMORY_USAGE", "SLOW_QUERY", "HIGH_ERROR_RATE", "FAILED_LOGIN_ATTEMPTS", "SUSPICIOUS_ACTIVITY", "DATA_BREACH_ATTEMPT", "UNAUTHORIZED_ACCESS", "HIGH_USER_LOAD", "PAYMENT_PROCESSING_ERROR", "EMAIL_DELIVERY_FAILURE", "THIRD_PARTY_API_ERROR", "SERVICE_START", "SERVICE_STOP", "DEPLOYMENT", "CONFIGURATION_CHANGE", "DATABASE_MIGRATION", "UNUSUAL_USER_BEHAVIOR", "MASS_USER_ACTIONS", "DATA_EXPORT_REQUEST"]>;
    severity: z.ZodEnum<["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]>;
    title: z.ZodString;
    description: z.ZodString;
    component: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodAny>;
    errorCode: z.ZodOptional<z.ZodString>;
    stackTrace: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    eventType: "HIGH_CPU_USAGE" | "HIGH_MEMORY_USAGE" | "SLOW_QUERY" | "HIGH_ERROR_RATE" | "FAILED_LOGIN_ATTEMPTS" | "SUSPICIOUS_ACTIVITY" | "DATA_BREACH_ATTEMPT" | "UNAUTHORIZED_ACCESS" | "HIGH_USER_LOAD" | "PAYMENT_PROCESSING_ERROR" | "EMAIL_DELIVERY_FAILURE" | "THIRD_PARTY_API_ERROR" | "SERVICE_START" | "SERVICE_STOP" | "DEPLOYMENT" | "CONFIGURATION_CHANGE" | "DATABASE_MIGRATION" | "UNUSUAL_USER_BEHAVIOR" | "MASS_USER_ACTIONS" | "DATA_EXPORT_REQUEST";
    severity: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    component?: string | undefined;
    metadata?: any;
    errorCode?: string | undefined;
    stackTrace?: string | undefined;
}, {
    title: string;
    description: string;
    eventType: "HIGH_CPU_USAGE" | "HIGH_MEMORY_USAGE" | "SLOW_QUERY" | "HIGH_ERROR_RATE" | "FAILED_LOGIN_ATTEMPTS" | "SUSPICIOUS_ACTIVITY" | "DATA_BREACH_ATTEMPT" | "UNAUTHORIZED_ACCESS" | "HIGH_USER_LOAD" | "PAYMENT_PROCESSING_ERROR" | "EMAIL_DELIVERY_FAILURE" | "THIRD_PARTY_API_ERROR" | "SERVICE_START" | "SERVICE_STOP" | "DEPLOYMENT" | "CONFIGURATION_CHANGE" | "DATABASE_MIGRATION" | "UNUSUAL_USER_BEHAVIOR" | "MASS_USER_ACTIONS" | "DATA_EXPORT_REQUEST";
    severity: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    component?: string | undefined;
    metadata?: any;
    errorCode?: string | undefined;
    stackTrace?: string | undefined;
}>;
export declare const ResolveSystemEventDtoSchema: z.ZodObject<{
    resolution: z.ZodString;
}, "strip", z.ZodTypeAny, {
    resolution: string;
}, {
    resolution: string;
}>;
export declare const CreateDataChangeLogDtoSchema: z.ZodObject<{
    tableName: z.ZodString;
    recordId: z.ZodString;
    operation: z.ZodEnum<["INSERT", "UPDATE", "DELETE"]>;
    changedFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    oldData: z.ZodOptional<z.ZodAny>;
    newData: z.ZodOptional<z.ZodAny>;
    reason: z.ZodOptional<z.ZodString>;
    dataClass: z.ZodOptional<z.ZodEnum<["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]>>;
}, "strip", z.ZodTypeAny, {
    tableName: string;
    recordId: string;
    operation: "INSERT" | "UPDATE" | "DELETE";
    reason?: string | undefined;
    changedFields?: string[] | undefined;
    oldData?: any;
    newData?: any;
    dataClass?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
}, {
    tableName: string;
    recordId: string;
    operation: "INSERT" | "UPDATE" | "DELETE";
    reason?: string | undefined;
    changedFields?: string[] | undefined;
    oldData?: any;
    newData?: any;
    dataClass?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED" | undefined;
}>;
export declare const LogUserLoginDtoSchema: z.ZodObject<{
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const LogUserLogoutDtoSchema: z.ZodObject<{
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const LogProfileUpdateDtoSchema: z.ZodObject<{
    oldValues: z.ZodAny;
    newValues: z.ZodAny;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const LogSystemErrorDtoSchema: z.ZodObject<{
    component: z.ZodString;
    error: z.ZodObject<{
        name: z.ZodString;
        message: z.ZodString;
        stack: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        name: string;
        stack?: string | undefined;
    }, {
        message: string;
        name: string;
        stack?: string | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    error: {
        message: string;
        name: string;
        stack?: string | undefined;
    };
    component: string;
    metadata?: any;
}, {
    error: {
        message: string;
        name: string;
        stack?: string | undefined;
    };
    component: string;
    metadata?: any;
}>;
export declare const CleanupAuditLogsDtoSchema: z.ZodObject<{
    retentionDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    retentionDays: number;
}, {
    retentionDays?: number | undefined;
}>;
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
//# sourceMappingURL=audit-logs.d.ts.map