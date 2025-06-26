import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsUrl,
  IsDateString,
  Min,
} from 'class-validator';

export enum StorageProvider {
  LOCAL = 'LOCAL',
  AWS_S3 = 'AWS_S3',
  SUPABASE = 'SUPABASE',
  CLOUDINARY = 'CLOUDINARY',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
}

export enum AccessLevel {
  PRIVATE = 'PRIVATE',
  INTERNAL = 'INTERNAL',
  PUBLIC = 'PUBLIC',
}

export enum FileStatus {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  QUARANTINED = 'QUARANTINED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export enum ScanStatus {
  PENDING = 'PENDING',
  SCANNING = 'SCANNING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum AttachmentEntityType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  MESSAGE = 'MESSAGE',
  WORKSHEET = 'WORKSHEET',
  SUBMISSION = 'SUBMISSION',
  REVIEW = 'REVIEW',
  PROFILE = 'PROFILE',
  THERAPIST_APPLICATION = 'THERAPIST_APPLICATION',
  MEETING_NOTES = 'MEETING_NOTES',
  PROGRESS_REPORT = 'PROGRESS_REPORT',
}

export enum AttachmentPurpose {
  GENERAL = 'GENERAL',
  AVATAR = 'AVATAR',
  COVER = 'COVER',
  DOCUMENT = 'DOCUMENT',
  MEDIA = 'MEDIA',
  AUDIO = 'AUDIO',
  BACKUP = 'BACKUP',
  CERTIFICATE = 'CERTIFICATE',
  LICENSE = 'LICENSE',
  TRANSCRIPT = 'TRANSCRIPT',
}

export enum FileShareType {
  LINK = 'LINK',
  EMAIL = 'EMAIL',
  INTERNAL = 'INTERNAL',
  TEMPORARY = 'TEMPORARY',
}

export class FileCreateDto {
  @IsString()
  filename!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsString()
  mimeType!: string;

  @IsNumber()
  @Min(0)
  size!: number;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsEnum(StorageProvider)
  storageProvider!: StorageProvider;

  @IsString()
  storagePath!: string;

  @IsOptional()
  @IsUrl()
  storageUrl?: string;

  @IsOptional()
  @IsString()
  bucketName?: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  encoding?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @IsString()
  uploadedBy!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class FileUpdateDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;

  @IsOptional()
  @IsEnum(ScanStatus)
  scanStatus?: ScanStatus;

  @IsOptional()
  @IsString()
  scanResult?: string;

  @IsOptional()
  @IsDateString()
  scannedAt?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;
}

export class FileAttachmentCreateDto {
  @IsString()
  fileId!: string;

  @IsEnum(AttachmentEntityType)
  entityType!: AttachmentEntityType;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsEnum(AttachmentPurpose)
  purpose?: AttachmentPurpose;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  caption?: string;
}

export class FileShareCreateDto {
  @IsString()
  fileId!: string;

  @IsEnum(FileShareType)
  shareType!: FileShareType;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  maxDownloads?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsString()
  sharedBy!: string;

  @IsOptional()
  @IsString({ each: true })
  sharedWith?: string[];

  @IsOptional()
  @IsString()
  message?: string;
}

export type FileResponse = {
  id: string;
  filename: string;
  displayName?: string;
  mimeType: string;
  size: number;
  hash?: string;
  storageProvider: StorageProvider;
  storagePath: string;
  storageUrl?: string;
  bucketName?: string;
  width?: number;
  height?: number;
  duration?: number;
  encoding?: string;
  compression?: string;
  isPublic: boolean;
  isEncrypted: boolean;
  accessLevel: AccessLevel;
  status: FileStatus;
  uploadedBy: string;
  scanStatus: ScanStatus;
  scanResult?: string;
  scannedAt?: Date;
  expiresAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type FileAttachmentResponse = {
  id: string;
  fileId: string;
  entityType: AttachmentEntityType;
  entityId: string;
  purpose: AttachmentPurpose;
  order?: number;
  caption?: string;
  createdAt: Date;
  file: FileResponse;
};

export type FileShareResponse = {
  id: string;
  fileId: string;
  shareToken: string;
  shareType: FileShareType;
  password?: string;
  maxDownloads?: number;
  currentDownloads: number;
  expiresAt?: Date;
  isActive: boolean;
  sharedBy: string;
  sharedWith: string[];
  message?: string;
  createdAt: Date;
  updatedAt: Date;
};