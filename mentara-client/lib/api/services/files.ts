import { AxiosInstance } from 'axios';
import {
  File,
  FileUploadDto,
  UpdateFileDto,
  FileQuery,
  FileIdParam,
  FileParamsDto,
  FindFilesQueryDto,
  EnhancedFileUploadDto,
  UpdateFileStatusDto,
  AttachFileToEntityDto,
  GetAttachmentsParamsDto,
  CreateFileVersionDto,
  CreateFileShareDto,
  ShareTokenParamsDto,
  DownloadSharedFileDto,
  BulkFileOperationDto,
  FileAnalyticsQueryDto,
  FileDownloadDto,
  MultipleFileUploadDto,
  FileUploadProgress,
} from '@mentara/commons';

// Extended interfaces for complex file data structures
export interface FileMetadata {
  folder?: string;
  description?: string;
  tags?: string[];
  expiresAt?: string;
  attachmentType?: 'primary' | 'secondary' | 'thumbnail' | 'document' | 'media';
  entityType?: string;
  entityId?: string;
}

export interface UploadedFile extends File {
  downloadUrl?: string;
  thumbnailUrl?: string;
  shareUrl?: string;
  attachments?: Array<{
    entityType: string;
    entityId: string;
    attachmentType: string;
    description?: string;
  }>;
}

export interface FileListParams {
  type?: string;
  uploadedBy?: string;
  associatedId?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FileListResponse {
  files: UploadedFile[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SecureUrlRequest {
  downloadType?: 'direct' | 'attachment';
  expires?: number;
}

export interface SecureUrlResponse {
  url: string;
  expires: string;
  downloadType: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  storageUsed: number;
  storageLimit: number;
  filesByType: Record<string, number>;
  uploadsByPeriod: Array<{
    date: string;
    count: number;
    size: number;
  }>;
}

export interface ApplicationDocument {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  documentType: string;
  applicationId: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ApplicationDocumentListResponse {
  documents: ApplicationDocument[];
  total: number;
  applicationId: string;
}

// Legacy compatibility types
export interface FileUploadRequest {
  file: File;
  metadata?: FileMetadata;
}

export interface FilesService {
  upload(file: File, metadata?: FileMetadata): Promise<UploadedFile>;
  getById(fileId: string): Promise<UploadedFile>;
  download(fileId: string): Promise<Blob>;
  getSecureUrl(fileId: string, params?: SecureUrlRequest): Promise<SecureUrlResponse>;
  delete(fileId: string): Promise<void>;
  getMy(params?: FileListParams): Promise<FileListResponse>;
  getApplicationDocuments(applicationId: string): Promise<ApplicationDocumentListResponse>;
  
  // Admin-only operations
  admin: {
    getFile(fileId: string): Promise<UploadedFile>;
    downloadFile(fileId: string): Promise<Blob>;
    getFilesByApplication(applicationId: string): Promise<ApplicationDocument[]>;
    getStats(): Promise<FileStats>;
  };
}

export const createFilesService = (client: AxiosInstance): FilesService => ({
  upload: (file: File, metadata?: FileMetadata): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getById: (fileId: string): Promise<UploadedFile> =>
    client.get(`/files/${fileId}`),

  download: (fileId: string): Promise<Blob> =>
    client.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    }),

  getSecureUrl: (fileId: string, params: SecureUrlRequest = {}): Promise<SecureUrlResponse> =>
    client.post(`/files/${fileId}/secure-url`, params),

  delete: (fileId: string): Promise<void> =>
    client.delete(`/files/${fileId}`),

  getMy: (params: FileListParams = {}): Promise<FileListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.type) searchParams.append('type', params.type);
    if (params.uploadedBy) searchParams.append('uploadedBy', params.uploadedBy);
    if (params.associatedId) searchParams.append('associatedId', params.associatedId);
    if (params.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/files${queryString}`);
  },

  getApplicationDocuments: (applicationId: string): Promise<ApplicationDocumentListResponse> =>
    client.get(`/files/application/${applicationId}/documents`),

  // Admin-only operations
  admin: {
    getFile: (fileId: string): Promise<UploadedFile> =>
      client.get(`/admin/files/${fileId}`),

    downloadFile: (fileId: string): Promise<Blob> =>
      client.get(`/admin/files/${fileId}/download`, {
        responseType: 'blob',
      }),

    getFilesByApplication: (applicationId: string): Promise<ApplicationDocument[]> =>
      client.get(`/admin/files/application/${applicationId}`),

    getStats: (): Promise<FileStats> =>
      client.get('/admin/files/stats'),
  },
});

// For consistency with other services, also export the service type using ReturnType pattern
export type FilesServiceType = ReturnType<typeof createFilesService>;