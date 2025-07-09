import { AxiosInstance } from 'axios';
import {
  FileUploadRequest,
  FileMetadata,
  UploadedFile,
  FileListParams,
  FileListResponse,
  SecureUrlRequest,
  SecureUrlResponse,
  FileStats,
  ApplicationDocument,
  ApplicationDocumentListResponse,
} from '../../types/api/files';

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