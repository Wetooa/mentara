import { AxiosInstance } from "axios";

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  bucket: string;
  uploadedAt: string;
  success: boolean;
}

export interface FileUploadError {
  success: false;
  error: string;
  details?: string;
}

/**
 * Files API service for file uploads and management
 */
export function createFilesService(axios: AxiosInstance) {
  return {
    /**
     * Upload a single file or multiple files
     */
    async upload(formData: FormData): Promise<FileUploadResponse> {
      const { data } = await axios.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data || data; // Handle wrapped response format
    },

    /**
     * Upload multiple files
     */
    async uploadMultiple(formData: FormData): Promise<FileUploadResponse[]> {
      const { data } = await axios.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data || data; // Handle wrapped response format
    },

    /**
     * Delete a file by ID
     */
    async delete(fileId: string): Promise<{ success: boolean }> {
      const { data } = await axios.delete(`/files/${fileId}`);
      return data.data || data; // Handle wrapped response format
    },

    /**
     * Get file information by ID
     */
    async getFileInfo(fileId: string): Promise<FileUploadResponse> {
      const { data } = await axios.get(`/files/${fileId}`);
      return data.data || data; // Handle wrapped response format
    },

    /**
     * Get download URL for a file (with temporary access if needed)
     */
    async getDownloadUrl(fileId: string): Promise<{ downloadUrl: string; expiresAt?: string }> {
      const { data } = await axios.get(`/files/${fileId}/download-url`);
      return data.data || data; // Handle wrapped response format
    },

    /**
     * Validate file before upload
     */
    validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { isValid: boolean; error?: string } {
      // Check file size (default 10MB)
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
        };
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `File type "${file.type}" is not supported`
        };
      }

      return { isValid: true };
    }
  };
}

export type FilesService = ReturnType<typeof createFilesService>;