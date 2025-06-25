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
import {
  CreateWorksheetDto,
  UpdateWorksheetDto,
  CreateSubmissionDto,
  SubmitWorksheetDto,
} from './dto/worksheet.dto';

@Controller('worksheets')
@UseGuards(ClerkAuthGuard)
export class WorksheetsController {
  constructor(private readonly worksheetsService: WorksheetsService) {}

  @Get()
  findAll(
    @CurrentUserId() clerkId: string,
    @Query('userId') userId?: string,
    @Query('therapistId') therapistId?: string,
    @Query('status') status?: string,
  ) {
    return this.worksheetsService.findAll(userId, therapistId, status);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.worksheetsService.findById(id);
  }

  @Post()
  create(
    @CurrentUserId() clerkId: string,
    @Body() createWorksheetDto: CreateWorksheetDto,
  ) {
    return this.worksheetsService.create(createWorksheetDto);
  }

  @Put(':id')
  update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() updateWorksheetDto: UpdateWorksheetDto,
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
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    return this.worksheetsService.addSubmission(createSubmissionDto);
  }

  @Post(':id/submit')
  submitWorksheet(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() submitWorksheetDto: SubmitWorksheetDto,
  ) {
    return this.worksheetsService.submitWorksheet(id, submitWorksheetDto);
  }

  @Delete('submissions/:id')
  deleteSubmission(@CurrentUserId() clerkId: string, @Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }
}
