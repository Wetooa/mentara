"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAnalyticsQueryDtoSchema = exports.BulkFileOperationDtoSchema = exports.DownloadSharedFileDtoSchema = exports.ShareTokenParamsDtoSchema = exports.CreateFileShareDtoSchema = exports.CreateFileVersionDtoSchema = exports.GetAttachmentsParamsDtoSchema = exports.AttachFileToEntityDtoSchema = exports.UpdateFileStatusDtoSchema = exports.FileParamsDtoSchema = exports.FindFilesQueryDtoSchema = exports.EnhancedFileUploadDtoSchema = exports.FilePathParamSchema = exports.FileIdParamSchema = exports.FileDownloadDtoSchema = exports.MultipleFileUploadDtoSchema = exports.FileUploadProgressSchema = exports.FileQuerySchema = exports.UpdateFileDtoSchema = exports.FileUploadDtoSchema = exports.FileSchema = void 0;
const zod_1 = require("zod");
// File Schema
exports.FileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    filename: zod_1.z.string(),
    originalName: zod_1.z.string(),
    mimeType: zod_1.z.string(),
    size: zod_1.z.number(),
    path: zod_1.z.string(),
    url: zod_1.z.string().url(),
    uploadedBy: zod_1.z.string().uuid(),
    isPublic: zod_1.z.boolean(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// File Upload Schema
exports.FileUploadDtoSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required'),
    mimeType: zod_1.z.string().min(1, 'MIME type is required'),
    size: zod_1.z.number().min(1, 'File size must be greater than 0'),
    isPublic: zod_1.z.boolean().default(false),
    folder: zod_1.z.string().optional()
});
// File Update Schema
exports.UpdateFileDtoSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required').optional(),
    isPublic: zod_1.z.boolean().optional()
});
// File Query Parameters
exports.FileQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    mimeType: zod_1.z.string().optional(),
    folder: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional(),
    uploadedBy: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['filename', 'size', 'createdAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// File Upload Progress Schema
exports.FileUploadProgressSchema = zod_1.z.object({
    uploadId: zod_1.z.string(),
    filename: zod_1.z.string(),
    bytesUploaded: zod_1.z.number(),
    totalBytes: zod_1.z.number(),
    percentage: zod_1.z.number().min(0).max(100),
    status: zod_1.z.enum(['uploading', 'completed', 'failed', 'cancelled'])
});
// Multiple File Upload Schema
exports.MultipleFileUploadDtoSchema = zod_1.z.object({
    files: zod_1.z.array(exports.FileUploadDtoSchema).min(1, 'At least one file is required'),
    folder: zod_1.z.string().optional()
});
// File Download Schema
exports.FileDownloadDtoSchema = zod_1.z.object({
    downloadType: zod_1.z.enum(['direct', 'attachment']).default('attachment'),
    expires: zod_1.z.number().optional()
});
// Parameter Schemas
exports.FileIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid file ID format')
});
exports.FilePathParamSchema = zod_1.z.object({
    path: zod_1.z.string().min(1, 'File path is required')
});
// Enhanced File Upload Schema (replaces duplicate)
exports.EnhancedFileUploadDtoSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required'),
    mimeType: zod_1.z.string().min(1, 'MIME type is required'),
    size: zod_1.z.number().min(1, 'File size must be greater than 0'),
    isPublic: zod_1.z.boolean().default(false),
    folder: zod_1.z.string().optional(),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    expiresAt: zod_1.z.string().datetime().optional()
});
exports.FindFilesQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    mimeType: zod_1.z.string().optional(),
    folder: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional(),
    uploadedBy: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    sizeMin: zod_1.z.number().min(0).optional(),
    sizeMax: zod_1.z.number().min(1).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['filename', 'size', 'createdAt', 'downloads']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.FileParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid file ID format')
});
exports.UpdateFileStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'inactive', 'quarantined', 'deleted']),
    reason: zod_1.z.string().max(500, 'Reason too long').optional(),
    notifyUploader: zod_1.z.boolean().default(false)
});
exports.AttachFileToEntityDtoSchema = zod_1.z.object({
    entityType: zod_1.z.string().min(1, 'Entity type is required'),
    entityId: zod_1.z.string().uuid('Invalid entity ID format'),
    attachmentType: zod_1.z.enum(['primary', 'secondary', 'thumbnail', 'document', 'media']).default('primary'),
    description: zod_1.z.string().max(200, 'Description too long').optional()
});
exports.GetAttachmentsParamsDtoSchema = zod_1.z.object({
    entityType: zod_1.z.string().min(1, 'Entity type is required'),
    entityId: zod_1.z.string().uuid('Invalid entity ID format')
});
exports.CreateFileVersionDtoSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1, 'Filename is required'),
    mimeType: zod_1.z.string().min(1, 'MIME type is required'),
    size: zod_1.z.number().min(1, 'File size must be greater than 0'),
    versionNote: zod_1.z.string().max(500, 'Version note too long').optional(),
    isMinorUpdate: zod_1.z.boolean().default(false)
});
exports.CreateFileShareDtoSchema = zod_1.z.object({
    shareType: zod_1.z.enum(['public', 'password', 'expiring', 'one_time']),
    password: zod_1.z.string().min(4, 'Password must be at least 4 characters').optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    maxDownloads: zod_1.z.number().min(1).optional(),
    allowPreview: zod_1.z.boolean().default(true),
    notifyOnAccess: zod_1.z.boolean().default(false)
}).refine((data) => {
    if (data.shareType === 'password' && !data.password) {
        return false;
    }
    if (data.shareType === 'expiring' && !data.expiresAt) {
        return false;
    }
    if (data.shareType === 'one_time' && !data.maxDownloads) {
        return false;
    }
    return true;
}, {
    message: 'Required fields missing for share type',
    path: ['shareType']
});
exports.ShareTokenParamsDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Share token is required')
});
exports.DownloadSharedFileDtoSchema = zod_1.z.object({
    password: zod_1.z.string().optional(),
    trackDownload: zod_1.z.boolean().default(true),
    clientInfo: zod_1.z.object({
        userAgent: zod_1.z.string().optional(),
        ipAddress: zod_1.z.string().optional(),
        referrer: zod_1.z.string().optional()
    }).optional()
});
// Bulk operations
exports.BulkFileOperationDtoSchema = zod_1.z.object({
    fileIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'At least one file ID is required').max(100, 'Too many files'),
    operation: zod_1.z.enum(['delete', 'archive', 'move', 'copy', 'update_permissions']),
    targetFolder: zod_1.z.string().optional(), // For move/copy operations
    permissions: zod_1.z.object({
        isPublic: zod_1.z.boolean().optional(),
        allowDownload: zod_1.z.boolean().optional(),
        allowPreview: zod_1.z.boolean().optional()
    }).optional() // For update_permissions operation
});
// File analytics
exports.FileAnalyticsQueryDtoSchema = zod_1.z.object({
    fileId: zod_1.z.string().uuid('Invalid file ID format').optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    metrics: zod_1.z.array(zod_1.z.enum(['downloads', 'views', 'shares', 'storage_usage'])).optional(),
    groupBy: zod_1.z.enum(['day', 'week', 'month']).default('day')
});
//# sourceMappingURL=files.js.map