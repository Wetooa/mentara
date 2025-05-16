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
import { WorksheetsService } from './worksheets.service';
import {
  CreateWorksheetDto,
  UpdateWorksheetDto,
  CreateSubmissionDto,
  SubmitWorksheetDto,
} from './dto/worksheet.dto';

@Controller('worksheets')
export class WorksheetsController {
  constructor(private readonly worksheetsService: WorksheetsService) {}

  @Get()
  findAll(
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
  create(@Body() createWorksheetDto: CreateWorksheetDto) {
    return this.worksheetsService.create(createWorksheetDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorksheetDto: UpdateWorksheetDto,
  ) {
    return this.worksheetsService.update(id, updateWorksheetDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.worksheetsService.delete(id);
  }

  @Post('submissions')
  addSubmission(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.worksheetsService.addSubmission(createSubmissionDto);
  }

  @Post(':id/submit')
  submitWorksheet(
    @Param('id') id: string,
    @Body() submitWorksheetDto: SubmitWorksheetDto,
  ) {
    return this.worksheetsService.submitWorksheet(id, submitWorksheetDto);
  }

  @Delete('submissions/:id')
  deleteSubmission(@Param('id') id: string) {
    return this.worksheetsService.deleteSubmission(id);
  }
}
