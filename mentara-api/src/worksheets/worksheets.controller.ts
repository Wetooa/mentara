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
import { ClerkAuthGuard } from 'src/guards/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { WorksheetsService } from './worksheets.service';
import { PaginationQuery, FilterQuery } from 'src/types';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
  WorksheetSubmissionCreateInputDto,
} from 'schema/worksheet';

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
    @Body()
    createWorksheetDto: WorksheetCreateInputDto & {
      clientId: string;
      therapistId: string;
    },
  ) {
    return this.worksheetsService.create(
      createWorksheetDto,
      createWorksheetDto.clientId,
      createWorksheetDto.therapistId,
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
