import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { TherapistManagementService } from './therapist-management.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  ClientResponse,
  TherapistResponse,
  TherapistUpdateDto,
} from 'schema/auth';

@Controller('therapist-management')
@UseGuards(ClerkAuthGuard)
export class TherapistManagementController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
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
