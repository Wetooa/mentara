import {
  Controller,
  Get,
  Post,
  Delete,
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

  @Get('matched')
  @HttpCode(HttpStatus.OK)
  async getMatchedClients(@CurrentUserId() therapistId: string): Promise<any> {
    return this.therapistManagementService.getMatchedClients(therapistId);
  }

  @Get('requests')
  @HttpCode(HttpStatus.OK)
  async getPendingRequests(
    @CurrentUserId() therapistId: string,
  ): Promise<any[]> {
    console.log('Fetching pending requests for therapist:', therapistId);
    return this.therapistManagementService.getPendingRequests(therapistId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getClientById(
    @CurrentUserId() therapistId: string,
    @Param('id') clientId: string,
  ): Promise<any> {
    return this.therapistManagementService.getClientById(therapistId, clientId);
  }

  @Post(':clientId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptPatientRequest(
    @CurrentUserId() therapistId: string,
    @Param('clientId') clientId: string,
  ): Promise<{ success: boolean }> {
    await this.therapistManagementService.acceptPatientRequest(
      therapistId,
      clientId,
    );
    return { success: true };
  }

  @Post(':clientId/deny')
  @HttpCode(HttpStatus.OK)
  async denyPatientRequest(
    @CurrentUserId() therapistId: string,
    @Param('clientId') clientId: string,
  ): Promise<{ success: boolean }> {
    await this.therapistManagementService.denyPatientRequest(
      therapistId,
      clientId,
    );
    return { success: true };
  }

  @Delete(':clientId')
  @HttpCode(HttpStatus.OK)
  async removePatient(
    @CurrentUserId() therapistId: string,
    @Param('clientId') clientId: string,
  ): Promise<{ success: boolean }> {
    await this.therapistManagementService.removePatient(therapistId, clientId);
    return { success: true };
  }
}
