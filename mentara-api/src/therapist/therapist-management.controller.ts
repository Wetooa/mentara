import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  TherapistManagementService,
  UpdateTherapistSpecializationsDto,
  TherapistProfileResponse,
} from './therapist-management.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { ApiResponse } from '../types';

@Controller('therapist-management')
@UseGuards(ClerkAuthGuard)
export class TherapistManagementController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(
    @CurrentUserId() id: string,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    return this.therapistManagementService.getTherapistProfile(id);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateTherapistProfile(
    @CurrentUserId() id: string,
    @Body() data: Partial<TherapistProfileResponse>,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    return this.therapistManagementService.updateTherapistProfile(id, data);
  }

  @Put('specializations')
  @HttpCode(HttpStatus.OK)
  async updateTherapistSpecializations(
    @CurrentUserId() id: string,
    @Body() data: UpdateTherapistSpecializationsDto,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    return this.therapistManagementService.updateTherapistSpecializations(
      id,
      data,
    );
  }

  @Get('available-illnesses')
  @HttpCode(HttpStatus.OK)
  async getAvailableIllnesses(): Promise<ApiResponse<string[]>> {
    return this.therapistManagementService.getAvailableIllnesses();
  }

  @Get('assigned-patients')
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() clerkId: string,
  ): Promise<ApiResponse<any[]>> {
    return this.therapistManagementService.getAssignedPatients(clerkId);
  }

  @Get('all-clients')
  @HttpCode(HttpStatus.OK)
  async getAllClients(): Promise<ApiResponse<any[]>> {
    return this.therapistManagementService.getAllClients();
  }

  @Get('client/:id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<ApiResponse<any>> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    return this.therapistManagementService.getProfile(therapistId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: Partial<TherapistProfileResponse>,
  ): Promise<ApiResponse<TherapistProfileResponse>> {
    return this.therapistManagementService.updateProfile(therapistId, data);
  }
}
