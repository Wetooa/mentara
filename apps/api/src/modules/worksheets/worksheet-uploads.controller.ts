import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Body,
  BadRequestException,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { WorksheetsService } from './worksheets.service';

@Controller('worksheets')
@UseGuards(JwtAuthGuard)
export class WorksheetUploadsController {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly worksheetsService: WorksheetsService,
  ) {}

  @Post(':worksheetId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('worksheetId') worksheetId: string,
    @Body('type') type: 'material' | 'submission',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!worksheetId) {
      throw new BadRequestException('Worksheet ID is required');
    }

    if (!type || !['material', 'submission'].includes(type)) {
      throw new BadRequestException(
        'Type must be either "material" or "submission"',
      );
    }

    try {
      // Check if the worksheet exists
      const worksheet = await this.prisma.worksheet.findUnique({
        where: { id: worksheetId },
      });

      if (!worksheet) {
        throw new BadRequestException(
          `Worksheet with ID ${worksheetId} not found`,
        );
      }

      // Validate file
      const allowedMimeTypes = [
        'application/pdf', // PDF files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
        'text/plain', // Text files
        'image/jpeg', // JPEG images
        'image/png', // PNG images
      ];

      const validation = this.supabaseStorageService.validateFile(
        file,
        5 * 1024 * 1024, // 5MB limit
        allowedMimeTypes,
      );

      if (!validation.isValid) {
        throw new BadRequestException(
          `File validation failed: ${validation.error}`,
        );
      }

      // Upload file to Supabase Storage
      const uploadResult = await this.supabaseStorageService.uploadFile(
        file,
        SupabaseStorageService.getSupportedBuckets().WORKSHEETS,
      );

      // Update the worksheet with the new file information
      if (type === 'material') {
        // Add to material arrays
        await this.prisma.worksheet.update({
          where: { id: worksheetId },
          data: {
            materialUrls: {
              push: uploadResult.url,
            },
            materialNames: {
              push: file.originalname,
            },
          },
        });
      } else {
        // For submissions, create or update WorksheetSubmission
        const existingSubmission =
          await this.prisma.worksheetSubmission.findUnique({
            where: { worksheetId },
          });

        if (existingSubmission) {
          // Update existing submission
          await this.prisma.worksheetSubmission.update({
            where: { worksheetId },
            data: {
              fileUrls: {
                push: uploadResult.url,
              },
              fileNames: {
                push: file.originalname,
              },
              fileSizes: {
                push: file.size,
              },
            },
          });
        } else {
          // Create new submission
          await this.prisma.worksheetSubmission.create({
            data: {
              worksheetId,
              fileUrls: [uploadResult.url],
              fileNames: [file.originalname],
              fileSizes: [file.size],
            },
          });
        }
      }

      // Return the expected response format
      return {
        id: uploadResult.filename, // Use the unique filename as ID
        filename: file.originalname,
        url: uploadResult.url,
        fileSize: file.size,
        fileType: file.mimetype,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':worksheetId/files/:filename')
  async deleteFile(
    @Param('worksheetId') worksheetId: string,
    @Param('filename') filename: string,
    @CurrentUserId() userId: string,
  ) {
    if (!worksheetId) {
      throw new BadRequestException('Worksheet ID is required');
    }

    if (!filename) {
      throw new BadRequestException('Filename is required');
    }

    try {
      // Use the worksheets service to remove the file
      const result = await this.worksheetsService.removeSubmissionFile(
        worksheetId,
        filename,
        userId,
      );

      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error.name === 'NotFoundException'
      ) {
        throw error;
      }

      throw new HttpException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
