import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  filename: string;
  url: string;
  bucket: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseApiKey: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseApiKey =
      this.configService.get<string>('SUPABASE_API_KEY') || '';

    if (!this.supabaseUrl || !this.supabaseApiKey) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    }
  }

  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param bucket - The storage bucket name
   * @returns Promise<FileUploadResult> - Upload result with filename and URL
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
  ): Promise<FileUploadResult> {
    this.logger.log(
      `Uploading file to Supabase: ${file.originalname} (bucket: ${bucket})`,
    );

    try {
      // Generate unique filename to avoid conflicts
      const originalFilename = file.originalname;
      const fileExtension = this.getFileExtension(originalFilename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;

      // Upload to Supabase
      await this.uploadToSupabase(
        bucket,
        uniqueFilename,
        file.buffer,
        file.mimetype,
      );

      // Generate public URL
      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueFilename}`;

      this.logger.log(
        `File uploaded successfully to Supabase: ${uniqueFilename}`,
      );

      return {
        filename: uniqueFilename,
        url: publicUrl,
        bucket,
      };
    } catch (error: any) {
      this.logger.error(
        `Error uploading file to Supabase: ${file.originalname}`,
        error,
      );
      throw new Error(
        `Failed to upload file to Supabase: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload multiple files to Supabase Storage
   * @param files - Array of files to upload
   * @param bucket - The storage bucket name
   * @returns Promise<FileUploadResult[]> - Array of upload results
   */
  async uploadFiles(
    files: Express.Multer.File[],
    bucket: string,
  ): Promise<FileUploadResult[]> {
    if (!files || files.length === 0) {
      return [];
    }

    this.logger.log(
      `Uploading ${files.length} files to Supabase bucket: ${bucket}`,
    );

    try {
      const uploadPromises = files.map((file) => this.uploadFile(file, bucket));
      const results = await Promise.all(uploadPromises);

      this.logger.log(
        `Successfully uploaded ${results.length} files to Supabase`,
      );
      return results;
    } catch (error: any) {
      this.logger.error(`Error uploading multiple files to Supabase`, error);
      throw new Error(
        `Failed to upload files to Supabase: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param bucket - The storage bucket name
   * @param filename - The filename to delete
   */
  async deleteFile(bucket: string, filename: string): Promise<void> {
    this.logger.log(
      `Deleting file from Supabase: ${filename} (bucket: ${bucket})`,
    );

    try {
      const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${filename}`;

      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${this.supabaseApiKey}`,
        },
      });

      if (response.status === 200) {
        this.logger.log(`File deleted successfully from Supabase: ${filename}`);
      } else {
        this.logger.error(
          `Failed to delete file from Supabase. Status: ${response.status}, Response: ${response.data}`,
        );
        throw new Error(
          `Supabase delete failed with status: ${response.status}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Error deleting file from Supabase: ${filename}`,
        error,
      );
      throw new Error(
        `Failed to delete file from Supabase: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get file extension from filename
   * @param filename - The original filename
   * @returns string - The file extension including the dot
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
  }

  /**
   * Upload file content to Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path/name in the bucket
   * @param fileBuffer - The file content as buffer
   * @param mimeType - The MIME type of the file
   */
  private async uploadToSupabase(
    bucket: string,
    path: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<void> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`;

    try {
      const response = await axios.post(url, fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          Authorization: `Bearer ${this.supabaseApiKey}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        this.logger.debug(`File uploaded successfully to Supabase: ${path}`);
      } else {
        this.logger.error(
          `Failed to upload file to Supabase. Status: ${response.status}, Response: ${response.data}`,
        );
        throw new Error(
          `Supabase upload failed with status: ${response.status}`,
        );
      }
    } catch (error: any) {
      if (error?.response) {
        this.logger.error(
          `Supabase API error: ${error.response.status} - ${error.response.data}`,
        );
        throw new Error(
          `Supabase upload failed: ${error.response.data?.message || error.response.statusText}`,
        );
      } else {
        this.logger.error(
          `Network error during Supabase upload: ${error.message}`,
        );
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
      }
    }
  }

  /**
   * Validate file for upload
   * @param file - The file to validate
   * @param maxSizeInBytes - Maximum file size allowed
   * @param allowedMimeTypes - Array of allowed MIME types
   */
  validateFile(
    file: Express.Multer.File,
    maxSizeInBytes: number = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/msword', // .doc
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-powerpoint', // .ppt
    ],
  ): { isValid: boolean; error?: string } {
    // File size validation
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.floor(maxSizeInBytes / (1024 * 1024))}MB limit`,
      };
    }

    // MIME type validation
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`,
      };
    }

    // Filename validation - prevent path traversal
    // const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    // if (safeFilename !== file.originalname) {
    //   return {
    //     isValid: false,
    //     error: 'Filename contains invalid characters',
    //   };
    // }

    return { isValid: true };
  }

  /**
   * Get supported storage buckets
   */
  static getSupportedBuckets() {
    return {
      USER_PROFILES: 'user-profiles',
      POST_ATTACHMENTS: 'post-attachments',
      MESSAGES: 'messages',
      DOCUMENTS: 'documents',
      WORKSHEETS: 'worksheets',
    } as const;
  }
}
