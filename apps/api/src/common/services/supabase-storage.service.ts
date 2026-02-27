import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  filename: string;
  url: string;
  bucket: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly supabaseUrl: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseApiKey =
      this.configService.get<string>('SUPABASE_API_KEY') || '';

    if (!this.supabaseUrl || !supabaseApiKey) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_API_KEY environment variables.',
      );
    }

    this.supabase = createClient(this.supabaseUrl, supabaseApiKey);
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

      // Upload to Supabase using the official SDK
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(uniqueFilename, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Generate public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(bucket).getPublicUrl(uniqueFilename);

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
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .remove([filename]);

      if (error) {
        throw error;
      }

      this.logger.log(`File deleted successfully from Supabase: ${filename}`);
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

    // Filename validation - prevent path traversal and ensure safe filename
    // We already generate a unique UUID filename for upload, so original filename safety
    // is secondary for storage pathing but good for metadata if we stored it.
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.originalname)) {
      return {
        isValid: false,
        error: 'Filename contains invalid characters',
      };
    }

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
