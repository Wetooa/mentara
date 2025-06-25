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
import { Prisma } from '@prisma/client';
import { ClientWithUser, TherapistWithUser } from 'src/types';

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
  ): Promise<TherapistWithUser> {
    return this.therapistManagementService.getTherapistProfile(therapistId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateTherapistProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: Prisma.TherapistUpdateInput,
  ): Promise<TherapistWithUser> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Put('specializations')
  @HttpCode(HttpStatus.OK)
  async updateTherapistSpecializations(
    @CurrentUserId() therapistId: string,
    @Body() data: Prisma.TherapistUpdateInput,
  ): Promise<TherapistWithUser> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Get('assigned-patients')
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() therapistId: string,
  ): Promise<any[]> {
    return this.therapistManagementService.getAssignedPatients(therapistId);
  }

  @Get('all-clients')
  @HttpCode(HttpStatus.OK)
  async getAllClients(
    @CurrentUserId() therapistId: string,
  ): Promise<ClientWithUser[]> {
    return this.therapistManagementService.getAllClients(therapistId);
  }

  @Get('client/:id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<ClientWithUser> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<TherapistWithUser> {
    return this.therapistManagementService.getProfile(therapistId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: Prisma.TherapistUpdateInput,
  ): Promise<TherapistWithUser> {
    return this.therapistManagementService.updateProfile(therapistId, data);
  }
}
