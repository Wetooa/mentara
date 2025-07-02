import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  PayloadTooLargeException,
  Res,
  StreamableFile,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  FileStatus,
  AttachmentEntityType,
  AttachmentPurpose,
} from '@prisma/client';
import { FileShareCreateDto } from '../../schema/files';

@Controller('files')
@UseGuards(ClerkAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Throttle({ upload: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
    @Body() body: { displayName?: string; purpose?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // File size validation (10MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      throw new PayloadTooLargeException('File size exceeds 10MB limit');
    }

    // File type validation - Allow common safe file types
    const allowedMimeTypes = [
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
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }

    // Filename validation - prevent path traversal
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (safeFilename !== file.originalname) {
      throw new BadRequestException('Filename contains invalid characters');
    }

    // In a real implementation, you would upload to cloud storage here
    // For now, we'll just store the file metadata
    const fileData = await this.filesService.create({
      filename: file.originalname,
      displayName: body.displayName || file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: `/uploads/${Date.now()}-${file.originalname}`,
      uploadedBy: userId,
    });

    // Update status to uploaded
    await this.filesService.updateStatus(fileData.id, FileStatus.UPLOADED);

    return fileData;
  }

  @Get()
  findAll(
    @Query('uploadedBy') uploadedBy?: string,
    @Query('status') status?: FileStatus,
    @Query('mimeType') mimeType?: string,
  ) {
    return this.filesService.findAll(uploadedBy, status, mimeType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: FileStatus }) {
    return this.filesService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.delete(id);
  }

  @Post(':id/attach')
  attachToEntity(
    @Param('id') fileId: string,
    @Body()
    body: {
      entityType: AttachmentEntityType;
      entityId: string;
      purpose?: AttachmentPurpose;
      order?: number;
      caption?: string;
    },
  ) {
    return this.filesService.attachToEntity(
      fileId,
      body.entityType,
      body.entityId,
      body.purpose,
      body.order,
      body.caption,
    );
  }

  @Get('attachments/:entityType/:entityId')
  getAttachments(
    @Param('entityType') entityType: AttachmentEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.filesService.getAttachments(entityType, entityId);
  }

  @Post(':id/versions')
  createVersion(
    @Param('id') fileId: string,
    @CurrentUserId() userId: string,
    @Body()
    body: {
      filename: string;
      size: number;
      mimeType: string;
      storagePath: string;
      hash?: string;
      description?: string;
    },
  ) {
    return this.filesService.createVersion(fileId, {
      ...body,
      createdBy: userId,
    });
  }

  @Get(':id/versions')
  getVersions(@Param('id') fileId: string) {
    return this.filesService.getVersions(fileId);
  }

  @Post(':id/share')
  createShare(
    @Param('id') fileId: string,
    @CurrentUserId() userId: string,
    @Body()
    body: Omit<FileShareCreateDto, 'fileId' | 'sharedBy'> & {
      expiresAt?: string;
    },
  ) {
    return this.filesService.createShare(fileId, {
      ...body,
      sharedBy: userId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  @Get('shared/:token')
  async getSharedFile(@Param('token') token: string) {
    return this.filesService.getFileByShareToken(token);
  }

  @Post('shared/:token/download')
  async downloadSharedFile(
    @Param('token') token: string,
    @Body() body: { ipAddress: string; userAgent?: string },
    @CurrentUserId() userId?: string,
  ) {
    const share = await this.filesService.getFileByShareToken(token);

    await this.filesService.recordDownload(share.file.id, {
      shareId: share.id,
      downloadedBy: userId,
      ipAddress: body.ipAddress,
      userAgent: body.userAgent,
      size: share.file.size,
    });

    return { downloadUrl: share.file.storageUrl || share.file.storagePath };
  }

  @Get('serve/:id')
  async serveFile(
    @Param('id') fileId: string,
    @CurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.filesService.findOne(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check if user has permission to access this file
    const canAccess = await this.filesService.canUserAccessFile(fileId, userId);
    if (!canAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this file',
      );
    }

    // Stream the file
    const fileStream = await this.filesService.getFileStream(fileId);

    // Set appropriate headers
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Length': file.size.toString(),
    });

    return new StreamableFile(fileStream);
  }
}
