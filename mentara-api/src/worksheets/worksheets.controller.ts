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
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { WorksheetsService } from './worksheets.service';
import { PaginationQuery, FilterQuery } from 'src/types';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetSubmissionCreateInputDto,
} from 'src/schema/worksheet';

@Controller('worksheets')
@UseGuards(ClerkAuthGuard)
export class WorksheetsController {
  constructor(private readonly worksheetsService: WorksheetsService) {}

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
  create(
    @CurrentUserId() clerkId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto,
  ) {
    return this.worksheetsService.create(createWorksheetDto);
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
    return this.worksheetsService.addSubmission(createSubmissionDto);
  }

  @Post(':id/submit')
  submitWorksheet(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() submitWorksheetDto: WorksheetSubmissionCreateInputDto,
  ) {
    return this.worksheetsService.submitWorksheet(id, submitWorksheetDto);
  }

  @Delete('submissions/:id')
  deleteSubmission(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }
}
