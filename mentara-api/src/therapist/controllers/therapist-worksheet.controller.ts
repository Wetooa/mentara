import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/core/guards/role.guard';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { Roles } from '../../auth/core/decorators/roles.decorator';
import { WorksheetsService } from '../../worksheets/worksheets.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';

// import {
//   WorksheetCreateInputDtoSchema,
//   WorksheetUpdateInputDtoSchema,
// } from '../validation';
import type {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
} from '../types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('therapist-worksheets')
@ApiBearerAuth('JWT-auth')
@Controller('therapist')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('therapist')
export class TherapistWorksheetController {
  constructor(
    private readonly worksheetsService: WorksheetsService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get('worksheets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get therapist worksheets',
    description: 'Retrieve all worksheets created by the therapist',
  })
  async getTherapistWorksheets(
    @CurrentUserId() therapistId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.worksheetsService.findAll(clientId, therapistId, status);
  }

  @Get('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get worksheet by ID',
    description: 'Retrieve a specific worksheet by ID',
  })
  async getTherapistWorksheetById(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
  ) {
    return this.worksheetsService.findById(worksheetId);
  }

  @Post('worksheets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create worksheet (legacy)',
    description: 'Create a new worksheet with clientId in body',
  })
  async createTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto & { clientId: string },
  ) {
    // Transform to canonical WorksheetCreateInputDto format
    const canonicalDto: WorksheetCreateInputDto = {
      ...createWorksheetDto,
      category: createWorksheetDto.category || 'therapy-assignment', // Default category
      clientIds: [createWorksheetDto.clientId], // Transform single clientId to array
    };

    return this.worksheetsService.create(
      canonicalDto,
      createWorksheetDto.clientId,
      therapistId,
    );
  }

  @Put('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update worksheet',
    description: 'Update an existing worksheet',
  })
  async updateTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.updateByTherapist(
      worksheetId,
      therapistId,
      updateWorksheetDto,
    );
  }

  @Post('worksheets/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark worksheet as reviewed',
    description:
      'Mark a worksheet as reviewed/completed, optionally adding feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Worksheet marked as reviewed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Worksheet not found or not owned by therapist',
  })
  async markWorksheetAsReviewed(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() reviewDto: { feedback?: string },
  ) {
    return this.worksheetsService.markAsReviewedByTherapist(
      worksheetId,
      therapistId,
      reviewDto.feedback,
    );
  }

  @Post('worksheets/:id/reference-file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload reference file to worksheet',
    description: 'Upload a reference/material file to a worksheet',
  })
  @ApiResponse({
    status: 201,
    description: 'Reference file uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or request',
  })
  @ApiResponse({
    status: 404,
    description: 'Worksheet not found',
  })
  async uploadReferenceFile(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if worksheet exists and belongs to the therapist
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id: worksheetId },
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet with ID ${worksheetId} not found`);
    }

    if (worksheet.therapistId !== therapistId) {
      throw new NotFoundException(`Worksheet with ID ${worksheetId} not found`);
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

    // Return the expected response format
    return {
      success: true,
      message: 'Reference file uploaded successfully',
      data: {
        id: uploadResult.filename, // Use the unique filename as ID
        filename: file.originalname,
        url: uploadResult.url,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    };
  }

  @Delete('worksheets/:id/reference-file')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove reference file from worksheet',
    description: 'Remove a reference/material file from a worksheet',
  })
  @ApiResponse({
    status: 200,
    description: 'Reference file removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Worksheet or file not found',
  })
  async removeReferenceFile(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() removeFileDto: { fileUrl: string },
  ) {
    if (!removeFileDto.fileUrl) {
      throw new BadRequestException('File URL is required');
    }

    return this.worksheetsService.removeMaterialFile(
      worksheetId,
      removeFileDto.fileUrl,
      therapistId,
    );
  }

  // NEW MODULE 2 ENDPOINT
  @Post('clients/:clientId/worksheets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign worksheet to client',
    description: 'Create and assign a new worksheet to a specific client',
  })
  @ApiResponse({
    status: 201,
    description: 'Worksheet created and assigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to assign worksheets to this client',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found or no active relationship',
  })
  async assignWorksheetToClient(
    @CurrentUserId() therapistId: string,
    @Param('clientId') clientId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto,
  ) {
    // Validate that therapist has an active relationship with the client
    const relationship = await this.prisma.clientTherapist.findUnique({
      where: {
        clientId_therapistId: {
          clientId,
          therapistId,
        },
      },
      include: {
        client: {
          include: { user: true },
        },
        therapist: {
          include: { user: true },
        },
      },
    });

    if (!relationship) {
      throw new NotFoundException(
        'No relationship found between therapist and client',
      );
    }

    // Relationship exists, so we can assign worksheets
    // (All relationships are considered active now)

    // Validate worksheet data
    if (!createWorksheetDto.title || createWorksheetDto.title.trim() === '') {
      throw new BadRequestException('Worksheet title is required');
    }

    if (
      !createWorksheetDto.instructions ||
      createWorksheetDto.instructions.trim() === ''
    ) {
      throw new BadRequestException('Worksheet instructions are required');
    }

    // Transform to canonical WorksheetCreateInputDto format
    const canonicalDto: WorksheetCreateInputDto = {
      ...createWorksheetDto,
      category: createWorksheetDto.category || 'therapy-assignment', // Default category
      clientIds: [clientId], // Set clientIds array for assignment
    };

    // Create the worksheet
    const worksheet = await this.worksheetsService.create(
      canonicalDto,
      clientId,
      therapistId,
    );

    // Send notification to client about new worksheet assignment
    try {
      await this.notificationsService.createWorksheetAssignedNotification(
        clientId,
        worksheet.id,
        createWorksheetDto.title,
        `${relationship.therapist.user.firstName} ${relationship.therapist.user.lastName}`,
      );
    } catch (error) {
      // Log notification error but don't fail the worksheet creation
      console.error('Failed to create worksheet notification:', error);
    }

    return {
      success: true,
      message: 'Worksheet assigned successfully',
      data: {
        worksheet,
        assignedTo: {
          id: relationship.client.userId,
          name: `${relationship.client.user.firstName} ${relationship.client.user.lastName}`,
        },
        assignedBy: {
          id: therapistId,
          name: `${relationship.therapist.user.firstName} ${relationship.therapist.user.lastName}`,
        },
      },
    };
  }
}
