import { z } from 'zod';
export declare const FileSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    originalName: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    path: z.ZodString;
    url: z.ZodString;
    uploadedBy: z.ZodString;
    isPublic: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    path: string;
    url: string;
    filename: string;
    originalName: string;
    isPublic: boolean;
    size: number;
    mimeType: string;
    uploadedBy: string;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    path: string;
    url: string;
    filename: string;
    originalName: string;
    isPublic: boolean;
    size: number;
    mimeType: string;
    uploadedBy: string;
}>;
export declare const FileUploadDtoSchema: z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    folder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filename: string;
    isPublic: boolean;
    size: number;
    mimeType: string;
    folder?: string | undefined;
}, {
    filename: string;
    size: number;
    mimeType: string;
    isPublic?: boolean | undefined;
    folder?: string | undefined;
}>;
export declare const UpdateFileDtoSchema: z.ZodObject<{
    filename: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    filename?: string | undefined;
    isPublic?: boolean | undefined;
}, {
    filename?: string | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const FileQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    mimeType: z.ZodOptional<z.ZodString>;
    folder: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    uploadedBy: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["filename", "size", "createdAt"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "filename" | "size" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    search?: string | undefined;
    mimeType?: string | undefined;
    uploadedBy?: string | undefined;
    folder?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "filename" | "size" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    search?: string | undefined;
    mimeType?: string | undefined;
    uploadedBy?: string | undefined;
    folder?: string | undefined;
}>;
export declare const FileUploadProgressSchema: z.ZodObject<{
    uploadId: z.ZodString;
    filename: z.ZodString;
    bytesUploaded: z.ZodNumber;
    totalBytes: z.ZodNumber;
    percentage: z.ZodNumber;
    status: z.ZodEnum<["uploading", "completed", "failed", "cancelled"]>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "completed" | "failed" | "uploading";
    percentage: number;
    filename: string;
    uploadId: string;
    bytesUploaded: number;
    totalBytes: number;
}, {
    status: "cancelled" | "completed" | "failed" | "uploading";
    percentage: number;
    filename: string;
    uploadId: string;
    bytesUploaded: number;
    totalBytes: number;
}>;
export declare const MultipleFileUploadDtoSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        folder: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        isPublic: boolean;
        size: number;
        mimeType: string;
        folder?: string | undefined;
    }, {
        filename: string;
        size: number;
        mimeType: string;
        isPublic?: boolean | undefined;
        folder?: string | undefined;
    }>, "many">;
    folder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    files: {
        filename: string;
        isPublic: boolean;
        size: number;
        mimeType: string;
        folder?: string | undefined;
    }[];
    folder?: string | undefined;
}, {
    files: {
        filename: string;
        size: number;
        mimeType: string;
        isPublic?: boolean | undefined;
        folder?: string | undefined;
    }[];
    folder?: string | undefined;
}>;
export declare const FileDownloadDtoSchema: z.ZodObject<{
    downloadType: z.ZodDefault<z.ZodEnum<["direct", "attachment"]>>;
    expires: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    downloadType: "attachment" | "direct";
    expires?: number | undefined;
}, {
    downloadType?: "attachment" | "direct" | undefined;
    expires?: number | undefined;
}>;
export declare const FileIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const FilePathParamSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export type File = z.infer<typeof FileSchema>;
export type FileUploadDto = z.infer<typeof FileUploadDtoSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileDtoSchema>;
export type FileQuery = z.infer<typeof FileQuerySchema>;
export type FileUploadProgress = z.infer<typeof FileUploadProgressSchema>;
export type MultipleFileUploadDto = z.infer<typeof MultipleFileUploadDtoSchema>;
export type FileDownloadDto = z.infer<typeof FileDownloadDtoSchema>;
export type FileIdParam = z.infer<typeof FileIdParamSchema>;
export type FilePathParam = z.infer<typeof FilePathParamSchema>;
export declare const EnhancedFileUploadDtoSchema: z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    folder: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filename: string;
    isPublic: boolean;
    size: number;
    mimeType: string;
    description?: string | undefined;
    expiresAt?: string | undefined;
    tags?: string[] | undefined;
    folder?: string | undefined;
}, {
    filename: string;
    size: number;
    mimeType: string;
    description?: string | undefined;
    isPublic?: boolean | undefined;
    expiresAt?: string | undefined;
    tags?: string[] | undefined;
    folder?: string | undefined;
}>;
export declare const FindFilesQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    mimeType: z.ZodOptional<z.ZodString>;
    folder: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    uploadedBy: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sizeMin: z.ZodOptional<z.ZodNumber>;
    sizeMax: z.ZodOptional<z.ZodNumber>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["filename", "size", "createdAt", "downloads"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "filename" | "size" | "downloads" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    search?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    tags?: string[] | undefined;
    mimeType?: string | undefined;
    uploadedBy?: string | undefined;
    folder?: string | undefined;
    sizeMin?: number | undefined;
    sizeMax?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "filename" | "size" | "downloads" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    search?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    tags?: string[] | undefined;
    mimeType?: string | undefined;
    uploadedBy?: string | undefined;
    folder?: string | undefined;
    sizeMin?: number | undefined;
    sizeMax?: number | undefined;
}>;
export declare const FileParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const UpdateFileStatusDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "inactive", "quarantined", "deleted"]>;
    reason: z.ZodOptional<z.ZodString>;
    notifyUploader: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "quarantined" | "deleted";
    notifyUploader: boolean;
    reason?: string | undefined;
}, {
    status: "active" | "inactive" | "quarantined" | "deleted";
    reason?: string | undefined;
    notifyUploader?: boolean | undefined;
}>;
export declare const AttachFileToEntityDtoSchema: z.ZodObject<{
    entityType: z.ZodString;
    entityId: z.ZodString;
    attachmentType: z.ZodDefault<z.ZodEnum<["primary", "secondary", "thumbnail", "document", "media"]>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entityId: string;
    entityType: string;
    attachmentType: "document" | "primary" | "secondary" | "thumbnail" | "media";
    description?: string | undefined;
}, {
    entityId: string;
    entityType: string;
    description?: string | undefined;
    attachmentType?: "document" | "primary" | "secondary" | "thumbnail" | "media" | undefined;
}>;
export declare const GetAttachmentsParamsDtoSchema: z.ZodObject<{
    entityType: z.ZodString;
    entityId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entityId: string;
    entityType: string;
}, {
    entityId: string;
    entityType: string;
}>;
export declare const CreateFileVersionDtoSchema: z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    versionNote: z.ZodOptional<z.ZodString>;
    isMinorUpdate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    filename: string;
    size: number;
    mimeType: string;
    isMinorUpdate: boolean;
    versionNote?: string | undefined;
}, {
    filename: string;
    size: number;
    mimeType: string;
    versionNote?: string | undefined;
    isMinorUpdate?: boolean | undefined;
}>;
export declare const CreateFileShareDtoSchema: z.ZodEffects<z.ZodObject<{
    shareType: z.ZodEnum<["public", "password", "expiring", "one_time"]>;
    password: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    maxDownloads: z.ZodOptional<z.ZodNumber>;
    allowPreview: z.ZodDefault<z.ZodBoolean>;
    notifyOnAccess: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    shareType: "password" | "public" | "expiring" | "one_time";
    allowPreview: boolean;
    notifyOnAccess: boolean;
    password?: string | undefined;
    expiresAt?: string | undefined;
    maxDownloads?: number | undefined;
}, {
    shareType: "password" | "public" | "expiring" | "one_time";
    password?: string | undefined;
    expiresAt?: string | undefined;
    maxDownloads?: number | undefined;
    allowPreview?: boolean | undefined;
    notifyOnAccess?: boolean | undefined;
}>, {
    shareType: "password" | "public" | "expiring" | "one_time";
    allowPreview: boolean;
    notifyOnAccess: boolean;
    password?: string | undefined;
    expiresAt?: string | undefined;
    maxDownloads?: number | undefined;
}, {
    shareType: "password" | "public" | "expiring" | "one_time";
    password?: string | undefined;
    expiresAt?: string | undefined;
    maxDownloads?: number | undefined;
    allowPreview?: boolean | undefined;
    notifyOnAccess?: boolean | undefined;
}>;
export declare const ShareTokenParamsDtoSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const DownloadSharedFileDtoSchema: z.ZodObject<{
    password: z.ZodOptional<z.ZodString>;
    trackDownload: z.ZodDefault<z.ZodBoolean>;
    clientInfo: z.ZodOptional<z.ZodObject<{
        userAgent: z.ZodOptional<z.ZodString>;
        ipAddress: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    }, {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    trackDownload: boolean;
    password?: string | undefined;
    clientInfo?: {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    } | undefined;
}, {
    password?: string | undefined;
    trackDownload?: boolean | undefined;
    clientInfo?: {
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
    } | undefined;
}>;
export declare const BulkFileOperationDtoSchema: z.ZodObject<{
    fileIds: z.ZodArray<z.ZodString, "many">;
    operation: z.ZodEnum<["delete", "archive", "move", "copy", "update_permissions"]>;
    targetFolder: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodObject<{
        isPublic: z.ZodOptional<z.ZodBoolean>;
        allowDownload: z.ZodOptional<z.ZodBoolean>;
        allowPreview: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPublic?: boolean | undefined;
        allowPreview?: boolean | undefined;
        allowDownload?: boolean | undefined;
    }, {
        isPublic?: boolean | undefined;
        allowPreview?: boolean | undefined;
        allowDownload?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    operation: "delete" | "archive" | "move" | "copy" | "update_permissions";
    fileIds: string[];
    permissions?: {
        isPublic?: boolean | undefined;
        allowPreview?: boolean | undefined;
        allowDownload?: boolean | undefined;
    } | undefined;
    targetFolder?: string | undefined;
}, {
    operation: "delete" | "archive" | "move" | "copy" | "update_permissions";
    fileIds: string[];
    permissions?: {
        isPublic?: boolean | undefined;
        allowPreview?: boolean | undefined;
        allowDownload?: boolean | undefined;
    } | undefined;
    targetFolder?: string | undefined;
}>;
export declare const FileAnalyticsQueryDtoSchema: z.ZodObject<{
    fileId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    metrics: z.ZodOptional<z.ZodArray<z.ZodEnum<["downloads", "views", "shares", "storage_usage"]>, "many">>;
    groupBy: z.ZodDefault<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    groupBy: "month" | "week" | "day";
    metrics?: ("downloads" | "views" | "shares" | "storage_usage")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    fileId?: string | undefined;
}, {
    metrics?: ("downloads" | "views" | "shares" | "storage_usage")[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    groupBy?: "month" | "week" | "day" | undefined;
    fileId?: string | undefined;
}>;
export type EnhancedFileUploadDto = z.infer<typeof EnhancedFileUploadDtoSchema>;
export type FindFilesQueryDto = z.infer<typeof FindFilesQueryDtoSchema>;
export type FileParamsDto = z.infer<typeof FileParamsDtoSchema>;
export type UpdateFileStatusDto = z.infer<typeof UpdateFileStatusDtoSchema>;
export type AttachFileToEntityDto = z.infer<typeof AttachFileToEntityDtoSchema>;
export type GetAttachmentsParamsDto = z.infer<typeof GetAttachmentsParamsDtoSchema>;
export type CreateFileVersionDto = z.infer<typeof CreateFileVersionDtoSchema>;
export type CreateFileShareDto = z.infer<typeof CreateFileShareDtoSchema>;
export type ShareTokenParamsDto = z.infer<typeof ShareTokenParamsDtoSchema>;
export type DownloadSharedFileDto = z.infer<typeof DownloadSharedFileDtoSchema>;
export type BulkFileOperationDto = z.infer<typeof BulkFileOperationDtoSchema>;
export type FileAnalyticsQueryDto = z.infer<typeof FileAnalyticsQueryDtoSchema>;
//# sourceMappingURL=files.d.ts.map