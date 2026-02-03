// Files DTOs matching backend exactly

interface FileUploadRequest {
  file: File;
  metadata?: FileMetadata;
}

interface FileMetadata {
  type?: "avatar" | "document" | "worksheet" | "message" | "post";
  description?: string;
  associatedId?: string; // ID of related entity (user, worksheet, etc.)
  isPublic?: boolean;
}

interface UploadedFile {
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

interface FileListParams {
  type?: "avatar" | "document" | "worksheet" | "message" | "post";
  uploadedBy?: string;
  associatedId?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "filename" | "fileSize";
  sortOrder?: "asc" | "desc";
}

interface FileListResponse {
  files: UploadedFile[];
  total: number;
  hasMore: boolean;
}

interface SecureUrlRequest {
  expirationMinutes?: number;
}

interface SecureUrlResponse {
  url: string;
  expiresAt: string;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
  fileTypes: Record<string, number>;
}

// For therapist application documents
interface ApplicationDocument {
  id: string;
  applicationId: string;
  filename: string;
  originalName: string;
  url: string;
  fileType: "resume" | "license" | "certification" | "transcript" | "other";
  fileSize: number;
  uploadedAt: string;
}

interface ApplicationDocumentListResponse {
  documents: ApplicationDocument[];
  total: number;
}
