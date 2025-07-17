import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { SupabaseStorageService } from 'src/common/services/supabase-storage.service';
import { WorksheetsService } from './worksheets.service';
import { PaginationQuery, FilterQuery } from 'src/types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetSubmissionCreateInputDto,
} from 'mentara-commons';

@ApiTags('worksheets')
@ApiBearerAuth('JWT-auth')
@Controller('worksheets')
@UseGuards(JwtAuthGuard)
export class WorksheetsController {
  constructor(
    private readonly worksheetsService: WorksheetsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all worksheets',
    description: 'Retrieve worksheets with optional filtering by user, therapist, and status',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'therapistId', required: false, description: 'Filter by therapist ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by worksheet status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({
    status: 200,
    description: 'Worksheets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        worksheets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string' },
              clientId: { type: 'string' },
              therapistId: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalCount: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUserId() clerkId: string,
    @Query() query: PaginationQuery & FilterQuery,
  ) {
    return this.worksheetsService.findAll(
      query.userId,
      query.therapistId,
      query.status,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get worksheet by ID',
    description: 'Retrieve detailed information about a specific worksheet including submissions and materials',
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Worksheet retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        status: { type: 'string' },
        clientId: { type: 'string' },
        therapistId: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time', nullable: true },
        materials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              filename: { type: 'string' },
              url: { type: 'string' },
              fileType: { type: 'string' },
            },
          },
        },
        submissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              submittedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  findById(@Param('id') id: string) {
    return this.worksheetsService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new worksheet',
    description: 'Create a new therapy worksheet with optional file attachments (up to 5 files)',
  })
  @ApiBody({
    description: 'Worksheet creation data with optional files',
    schema: {
      type: 'object',
      required: ['title', 'clientId', 'therapistId'],
      properties: {
        title: { type: 'string', example: 'Anxiety Management Exercises' },
        description: { type: 'string', example: 'Weekly exercises for managing anxiety' },
        content: { type: 'string', example: 'Please complete the following exercises...' },
        clientId: { type: 'string', description: 'ID of the client this worksheet is for' },
        therapistId: { type: 'string', description: 'ID of the therapist creating the worksheet' },
        dueDate: { type: 'string', format: 'date-time', description: 'Optional due date' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional supporting files (max 5)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Worksheet created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        status: { type: 'string' },
        clientId: { type: 'string' },
        therapistId: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        uploadedFiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              filename: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid worksheet data or file upload error' })
  @UseInterceptors(FilesInterceptor('files', 5)) // Support up to 5 files
  create(
    @CurrentUserId() clerkId: string,
    @Body()
    createWorksheetDto: WorksheetCreateInputDto & {
      clientId: string;
      therapistId: string;
    },
    @UploadedFiles() files: Express.Multer.File[] = [], // Optional files
  ) {
    return this.worksheetsService.create(
      createWorksheetDto,
      createWorksheetDto.clientId,
      createWorksheetDto.therapistId,
      files,
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update worksheet',
    description: 'Update an existing worksheet with new information',
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiBody({
    description: 'Updated worksheet data',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        status: { type: 'string', enum: ['assigned', 'in_progress', 'completed', 'overdue'] },
        dueDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Worksheet updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(id, updateWorksheetDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete worksheet',
    description: 'Permanently delete a worksheet and all associated data',
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiResponse({
    status: 200,
    description: 'Worksheet deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        deletedId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  delete(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.delete(id);
  }

  @Post('submissions')
  @ApiOperation({
    summary: 'Add worksheet submission',
    description: 'Add a new submission to an existing worksheet',
  })
  @ApiBody({
    description: 'Submission data',
    schema: {
      type: 'object',
      required: ['worksheetId', 'content'],
      properties: {
        worksheetId: { type: 'string', description: 'ID of the worksheet being submitted' },
        content: { type: 'string', description: 'Submission content or answers' },
        notes: { type: 'string', description: 'Optional notes from the client' },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional file attachment URLs',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Submission added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        worksheetId: { type: 'string' },
        clientId: { type: 'string' },
        content: { type: 'string' },
        notes: { type: 'string', nullable: true },
        submittedAt: { type: 'string', format: 'date-time' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  addSubmission(
    @CurrentUserId() clerkId: string,
    @Body() createSubmissionDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.addSubmission(createSubmissionDto, clerkId);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit worksheet',
    description: 'Submit a completed worksheet with answers and mark it as completed',
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiBody({
    description: 'Worksheet submission data',
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', description: 'Completed worksheet content or answers' },
        notes: { type: 'string', description: 'Optional notes from the client' },
        timeSpent: { type: 'number', description: 'Time spent on worksheet in minutes' },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional file attachment URLs',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Worksheet submitted successfully',
    schema: {
      type: 'object',
      properties: {
        worksheetId: { type: 'string' },
        submissionId: { type: 'string' },
        status: { type: 'string' },
        submittedAt: { type: 'string', format: 'date-time' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Worksheet not found' })
  @ApiResponse({ status: 400, description: 'Worksheet already submitted or invalid data' })
  submitWorksheet(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() submitWorksheetDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.submitWorksheet(
      id,
      submitWorksheetDto,
      clerkId,
    );
  }

  @Delete('submissions/:id')
  @ApiOperation({
    summary: 'Delete worksheet submission',
    description: 'Delete a worksheet submission. Only the client who created it or the assigned therapist can delete it.',
  })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({
    status: 200,
    description: 'Submission deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        deletedSubmissionId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to delete this submission' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  deleteSubmission(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }
}
