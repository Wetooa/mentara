import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { TherapistManagementService } from '../therapist-management.service';
// Using any type to avoid conflicts with service definitions

@Controller('therapist/clients')
@UseGuards(JwtAuthGuard)
export class TherapistClientController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get('assigned')
  @HttpCode(HttpStatus.OK)
  async getAssignedPatients(
    @CurrentUserId() therapistId: string,
  ): Promise<any[]> {
    return this.therapistManagementService.getAssignedPatients(therapistId);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllClients(@CurrentUserId() therapistId: string): Promise<any[]> {
    return this.therapistManagementService.getAllClients(therapistId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<any> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }
}
