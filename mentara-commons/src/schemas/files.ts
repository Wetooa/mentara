import { z } from 'zod';

// File Schema
export const FileSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  path: z.string(),
  url: z.string().url(),
  uploadedBy: z.string().uuid(),
  isPublic: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// File Upload Schema
export const FileUploadDtoSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  isPublic: z.boolean().default(false),
  folder: z.string().optional()
});

// File Update Schema
export const UpdateFileDtoSchema = z.object({
  filename: z.string().min(1, 'Filename is required').optional(),
  isPublic: z.boolean().optional()
});

// File Query Parameters
export const FileQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  mimeType: z.string().optional(),
  folder: z.string().optional(),
  isPublic: z.boolean().optional(),
  uploadedBy: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['filename', 'size', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// File Upload Progress Schema
export const FileUploadProgressSchema = z.object({
  uploadId: z.string(),
  filename: z.string(),
  bytesUploaded: z.number(),
  totalBytes: z.number(),
  percentage: z.number().min(0).max(100),
  status: z.enum(['uploading', 'completed', 'failed', 'cancelled'])
});

// Multiple File Upload Schema
export const MultipleFileUploadDtoSchema = z.object({
  files: z.array(FileUploadDtoSchema).min(1, 'At least one file is required'),
  folder: z.string().optional()
});

// File Download Schema
export const FileDownloadDtoSchema = z.object({
  downloadType: z.enum(['direct', 'attachment']).default('attachment'),
  expires: z.number().optional()
});

// Parameter Schemas
export const FileIdParamSchema = z.object({
  id: z.string().uuid('Invalid file ID format')
});

export const FilePathParamSchema = z.object({
  path: z.string().min(1, 'File path is required')
});

// Export type inference helpers
export type File = z.infer<typeof FileSchema>;
export type FileUploadDto = z.infer<typeof FileUploadDtoSchema>;
export type UpdateFileDto = z.infer<typeof UpdateFileDtoSchema>;
export type FileQuery = z.infer<typeof FileQuerySchema>;
export type FileUploadProgress = z.infer<typeof FileUploadProgressSchema>;
export type MultipleFileUploadDto = z.infer<typeof MultipleFileUploadDtoSchema>;
export type FileDownloadDto = z.infer<typeof FileDownloadDtoSchema>;
export type FileIdParam = z.infer<typeof FileIdParamSchema>;
export type FilePathParam = z.infer<typeof FilePathParamSchema>;

// Enhanced File Upload Schema (replaces duplicate)
export const EnhancedFileUploadDtoSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  isPublic: z.boolean().default(false),
  folder: z.string().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional()
});

export const FindFilesQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  mimeType: z.string().optional(),
  folder: z.string().optional(),
  isPublic: z.boolean().optional(),
  uploadedBy: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sizeMin: z.number().min(0).optional(),
  sizeMax: z.number().min(1).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['filename', 'size', 'createdAt', 'downloads']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const FileParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid file ID format')
});

export const UpdateFileStatusDtoSchema = z.object({
  status: z.enum(['active', 'inactive', 'quarantined', 'deleted']),
  reason: z.string().max(500, 'Reason too long').optional(),
  notifyUploader: z.boolean().default(false)
});

export const AttachFileToEntityDtoSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().uuid('Invalid entity ID format'),
  attachmentType: z.enum(['primary', 'secondary', 'thumbnail', 'document', 'media']).default('primary'),
  description: z.string().max(200, 'Description too long').optional()
});

export const GetAttachmentsParamsDtoSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().uuid('Invalid entity ID format')
});

export const CreateFileVersionDtoSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  versionNote: z.string().max(500, 'Version note too long').optional(),
  isMinorUpdate: z.boolean().default(false)
});

export const CreateFileShareDtoSchema = z.object({
  shareType: z.enum(['public', 'password', 'expiring', 'one_time']),
  password: z.string().min(4, 'Password must be at least 4 characters').optional(),
  expiresAt: z.string().datetime().optional(),
  maxDownloads: z.number().min(1).optional(),
  allowPreview: z.boolean().default(true),
  notifyOnAccess: z.boolean().default(false)
}).refine(
  (data) => {
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
  },
  {
    message: 'Required fields missing for share type',
    path: ['shareType']
  }
);

export const ShareTokenParamsDtoSchema = z.object({
  token: z.string().min(1, 'Share token is required')
});

export const DownloadSharedFileDtoSchema = z.object({
  password: z.string().optional(),
  trackDownload: z.boolean().default(true),
  clientInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    referrer: z.string().optional()
  }).optional()
});

// Bulk operations
export const BulkFileOperationDtoSchema = z.object({
  fileIds: z.array(z.string().uuid()).min(1, 'At least one file ID is required').max(100, 'Too many files'),
  operation: z.enum(['delete', 'archive', 'move', 'copy', 'update_permissions']),
  targetFolder: z.string().optional(), // For move/copy operations
  permissions: z.object({
    isPublic: z.boolean().optional(),
    allowDownload: z.boolean().optional(),
    allowPreview: z.boolean().optional()
  }).optional() // For update_permissions operation
});

// File analytics
export const FileAnalyticsQueryDtoSchema = z.object({
  fileId: z.string().uuid('Invalid file ID format').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum(['downloads', 'views', 'shares', 'storage_usage'])).optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day')
});

// Type exports for new DTOs
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