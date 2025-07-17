import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('worksheet-uploads')
@ApiBearerAuth('JWT-auth')
@Controller('worksheets/upload')
export class WorksheetUploadsController {
  constructor(private prisma: PrismaService) {}

  @Post()


  @ApiOperation({ 


    summary: 'Create upload file',


    description: 'Create upload file' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Get the type from the request (material or submission)
          const type = req.body.type || 'submission';
          const dest = path.join(process.cwd(), 'uploads', 'worksheets', type);
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          // Generate a unique filename with original extension
          const originalName = file.originalname;
          const extension = path.extname(originalName);
          const filename = `${uuidv4()}${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Only allow certain file types
        const allowedMimeTypes = [
          'application/pdf', // PDF files
          'application/msword', // DOC files
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
          'text/plain', // Text files
          'image/jpeg', // JPEG images
          'image/png', // PNG images
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File type not allowed. Only PDF, DOC, DOCX, TXT, JPG, and PNG files are allowed.`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
      },
    }),
  )
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

    // Check if the worksheet exists
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id: worksheetId },
    });

    if (!worksheet) {
      throw new BadRequestException(
        `Worksheet with ID ${worksheetId} not found`,
      );
    }

    // Create a URL for the file
    const fileUrl = `/uploads/worksheets/${type}/${file.filename}`;

    // Store the file in the database based on the type
    if (type === 'material') {
      const material = await this.prisma.worksheetMaterial.create({
        data: {
          filename: file.originalname,
          url: fileUrl,
          fileSize: file.size,
          fileType: file.mimetype,
          worksheetId,
        },
      });

      return {
        id: material.id,
        filename: material.filename,
        url: material.url,
        fileSize: material.fileSize,
        fileType: material.fileType,
      };
    } else {
      // Default to submission - need to get the worksheet's clientId
      const worksheetData = await this.prisma.worksheet.findUnique({
        where: { id: worksheetId },
        select: { clientId: true },
      });

      if (!worksheetData) {
        throw new BadRequestException(
          `Worksheet with ID ${worksheetId} not found`,
        );
      }

      const submission = await this.prisma.worksheetSubmission.create({
        data: {
          filename: file.originalname,
          url: fileUrl,
          fileSize: file.size,
          fileType: file.mimetype,
          worksheetId,
          clientId: worksheetData.clientId,
        },
      });

      return {
        id: submission.id,
        filename: submission.filename,
        url: submission.url,
        fileSize: submission.fileSize,
        fileType: submission.fileType,
      };
    }
  }
}
