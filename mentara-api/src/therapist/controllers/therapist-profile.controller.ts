import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { TherapistManagementService } from '../therapist-management.service';
// Using any type to avoid conflicts with service definitions

@Controller('therapist/profile')
@UseGuards(JwtAuthGuard)
export class TherapistProfileController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<any> {
    return this.therapistManagementService.getTherapistProfile(therapistId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateTherapistProfile(
    @CurrentUserId() therapistId: string,
    @Body() data: any,
  ): Promise<any> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }

  @Put('specializations')
  @HttpCode(HttpStatus.OK)
  async updateTherapistSpecializations(
    @CurrentUserId() therapistId: string,
    @Body() data: any,
  ): Promise<any> {
    return this.therapistManagementService.updateTherapistProfile(
      therapistId,
      data,
    );
  }
}
