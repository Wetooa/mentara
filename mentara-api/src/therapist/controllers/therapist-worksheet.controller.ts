import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { WorksheetsService } from '../../worksheets/worksheets.service';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
} from 'schema/worksheet';

@Controller('therapist/worksheets')
@UseGuards(JwtAuthGuard)
export class TherapistWorksheetController {
  constructor(private readonly worksheetsService: WorksheetsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheets(
    @CurrentUserId() therapistId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.worksheetsService.findAll(clientId, therapistId, status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheetById(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
  ) {
    return this.worksheetsService.findById(worksheetId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Body() createWorksheetDto: WorksheetCreateInputDto & { clientId: string },
  ) {
    return this.worksheetsService.create(
      createWorksheetDto,
      createWorksheetDto.clientId,
      therapistId,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(worksheetId, updateWorksheetDto);
  }
}
