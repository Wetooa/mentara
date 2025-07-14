import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { TherapistManagementService } from '../therapist-management.service';
import { ClientResponse } from 'schema/auth';

@Controller('therapist/clients')
@UseGuards(ClerkAuthGuard)
export class TherapistClientController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get('assigned')
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() therapistId: string,
  ): Promise<ClientResponse[]> {
    return this.therapistManagementService.getAssignedPatients(therapistId);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllClients(
    @CurrentUserId() therapistId: string,
  ): Promise<ClientResponse[]> {
    return this.therapistManagementService.getAllClients(therapistId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<ClientResponse> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }
}
