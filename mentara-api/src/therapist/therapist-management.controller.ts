import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { TherapistManagementService } from './therapist-management.service';
import { WorksheetsService } from '../worksheets/worksheets.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  ClientResponse,
  TherapistResponse,
  TherapistUpdateDto,
} from 'schema/auth';
import {
  WorksheetCreateInputDto,
  WorksheetUpdateInputDto,
} from 'schema/worksheet';

@Controller('therapist-management')
@UseGuards(ClerkAuthGuard)
export class TherapistManagementController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
    private readonly worksheetsService: WorksheetsService,
  ) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.getTherapistProfile(therapistId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateTherapistProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: TherapistUpdateDto,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Put('specializations')
  @HttpCode(HttpStatus.OK)
  async updateTherapistSpecializations(
    @CurrentUserId() therapistId: string,
    @Body() data: TherapistUpdateDto,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Get('assigned-patients')
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() therapistId: string,
  ): Promise<ClientResponse[]> {
    return this.therapistManagementService.getAssignedPatients(therapistId);
  }

  @Get('all-clients')
  @HttpCode(HttpStatus.OK)
  async getAllClients(
    @CurrentUserId() therapistId: string,
  ): Promise<ClientResponse[]> {
    return this.therapistManagementService.getAllClients(therapistId);
  }

  @Get('client/:id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<ClientResponse> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }

  // Therapist Worksheet Management Endpoints

  @Get('worksheets')
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheets(
    @CurrentUserId() therapistId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.worksheetsService.findAll(clientId, therapistId, status);
  }

  @Get('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  async getTherapistWorksheetById(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
  ) {
    return this.worksheetsService.findById(worksheetId);
  }

  @Post('worksheets')
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

  @Put('worksheets/:id')
  @HttpCode(HttpStatus.OK)
  async updateTherapistWorksheet(
    @CurrentUserId() therapistId: string,
    @Param('id') worksheetId: string,
    @Body() updateWorksheetDto: WorksheetUpdateInputDto,
  ) {
    return this.worksheetsService.update(worksheetId, updateWorksheetDto);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.getProfile(therapistId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: TherapistUpdateDto,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.updateProfile(therapistId, data);
  }
}
