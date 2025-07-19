import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../providers/prisma-client.provider';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('worksheet-uploads')
@ApiBearerAuth('JWT-auth')
@Controller('worksheets/upload')
export class WorksheetUploadsController {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Upload worksheet file',
    description: 'Upload a file for a worksheet (material or submission)',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        filename: { type: 'string' },
        url: { type: 'string' },
        fileSize: { type: 'number' },
        fileType: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or missing data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
        worksheetId: {
          type: 'string',
          description: 'The ID of the worksheet',
        },
        type: {
          type: 'string',
          enum: ['material', 'submission'],
          description: 'The type of file (material or submission)',
        },
      },
      required: ['file', 'worksheetId', 'type'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('worksheetId') worksheetId: string,
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
            materialSizes: {
              push: file.size,
            },
          },
        });
      } else {
        // For submissions, add to submission arrays
        await this.prisma.worksheet.update({
          where: { id: worksheetId },
          data: {
            submissionUrls: {
              push: uploadResult.url,
            },
            submissionNames: {
              push: file.originalname,
            },
            submissionSizes: {
              push: file.size,
            },
          },
        });
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
}
