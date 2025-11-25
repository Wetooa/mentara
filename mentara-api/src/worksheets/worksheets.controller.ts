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
import { JwtAuthGuard } from 'src/auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/core/decorators/current-user-id.decorator';
import { SupabaseStorageService } from 'src/common/services/supabase-storage.service';
import { WorksheetsService } from './worksheets.service';
import { PaginationQuery, FilterQuery } from 'src/types';
import type {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetSubmissionCreateInputDto,
} from './types';

@Controller('worksheets')
@UseGuards(JwtAuthGuard)
export class WorksheetsController {
  constructor(
    private readonly worksheetsService: WorksheetsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()
  findAll(
    @CurrentUserId() userId: string,
    @Query()
    query: PaginationQuery &
      FilterQuery & { isCompleted?: boolean; limit?: number },
  ) {
    // Convert isCompleted boolean to status string for service compatibility
    let status: string | undefined = query.status;
    if (query.isCompleted !== undefined) {
      status = query.isCompleted ? 'SUBMITTED' : 'ASSIGNED';
    }

    return this.worksheetsService.findAll(
      query.userId,
      query.therapistId,
      status,
      query.limit,
      query.offset,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.worksheetsService.findById(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5)) // Support up to 5 files
  create(
    @CurrentUserId() userId: string,
    @Body()
    createWorksheetDto: WorksheetCreateInputDto & {
      userId: string;
      therapistId: string;
    },
    @UploadedFiles() files: Express.Multer.File[] = [], // Optional files
  ) {
    console.log(createWorksheetDto);
    return this.worksheetsService.create(
      createWorksheetDto,
      createWorksheetDto.userId,
      createWorksheetDto.therapistId,
      files,
    );
  }

  @Put(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(id, updateWorksheetDto);
  }

  @Delete(':id')
  delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.worksheetsService.delete(id);
  }

  @Post('submissions')
  addSubmission(
    @CurrentUserId() userId: string,
    @Body() createSubmissionDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.addSubmission(createSubmissionDto, userId);
  }

  @Post(':id/submit')
  submitWorksheet(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() submitWorksheetDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.submitWorksheet(
      id,
      submitWorksheetDto,
      userId,
    );
  }

  @Delete('submissions/:id')
  deleteSubmission(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }

  @Post(':id/turn-in')
  turnInWorksheet(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.worksheetsService.turnInWorksheet(id, userId);
  }

  @Post(':id/unturn-in')
  unturnInWorksheet(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.worksheetsService.unturnInWorksheet(id, userId);
  }
}
