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
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetSubmissionCreateInputDto,
} from 'mentara-commons';

@Controller('worksheets')
@UseGuards(JwtAuthGuard)
export class WorksheetsController {
  constructor(
    private readonly worksheetsService: WorksheetsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()
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
  findById(@Param('id') id: string) {
    return this.worksheetsService.findById(id);
  }

  @Post()
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
  update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(id, updateWorksheetDto);
  }

  @Delete(':id')
  delete(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.delete(id);
  }

  @Post('submissions')
  addSubmission(
    @CurrentUserId() clerkId: string,
    @Body() createSubmissionDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.addSubmission(createSubmissionDto, clerkId);
  }

  @Post(':id/submit')
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
  deleteSubmission(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }
}
