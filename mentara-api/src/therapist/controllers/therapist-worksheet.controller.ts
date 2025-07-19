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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { WorksheetsService } from '../../worksheets/worksheets.service';
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
} from 'mentara-commons';

@ApiTags('therapist-worksheet')
@ApiBearerAuth('JWT-auth')
@Controller('therapist/worksheets')
@UseGuards(JwtAuthGuard)
export class TherapistWorksheetController {
  constructor(private readonly worksheetsService: WorksheetsService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve get therapist worksheets',

    description: 'Retrieve get therapist worksheets',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheets(
    @CurrentUserId() therapistId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.worksheetsService.findAll(clientId, therapistId, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve get therapist worksheet by id',

    description: 'Retrieve get therapist worksheet by id',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheetById(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
  ) {
    return this.worksheetsService.findById(worksheetId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create create therapist worksheet',

    description: 'Create create therapist worksheet',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Update update therapist worksheet',

    description: 'Update update therapist worksheet',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updateTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(worksheetId, updateWorksheetDto);
  }
}
