// Files DTOs matching backend exactly

export interface FileUploadRequest {
  file: File;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  type?: 'avatar' | 'document' | 'worksheet' | 'message' | 'post';
  description?: string;
  associatedId?: string; // ID of related entity (user, worksheet, etc.)
  isPublic?: boolean;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  secureUrl?: string;
  mimeType: string;
  fileSize: number;
  metadata: FileMetadata;
  uploadedBy: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FileListParams {
  type?: 'avatar' | 'document' | 'worksheet' | 'message' | 'post';
  uploadedBy?: string;
  associatedId?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'filename' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

export interface FileListResponse {
  files: UploadedFile[];
  total: number;
  hasMore: boolean;
}

export interface SecureUrlRequest {
  expirationMinutes?: number;
}

export interface SecureUrlResponse {
  url: string;
  expiresAt: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  fileTypes: Record<string, number>;
}

// For therapist application documents
export interface ApplicationDocument {
  id: string;
  applicationId: string;
  filename: string;
  originalName: string;
  url: string;
  fileType: 'resume' | 'license' | 'certification' | 'transcript' | 'other';
  fileSize: number;
  uploadedAt: string;
}

export interface ApplicationDocumentListResponse {
  documents: ApplicationDocument[];
  total: number;
}