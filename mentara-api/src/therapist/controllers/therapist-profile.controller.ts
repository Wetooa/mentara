import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { TherapistManagementService } from '../therapist-management.service';
import { TherapistUpdateDto, TherapistResponse } from 'schema/auth';

@Controller('therapist/profile')
@UseGuards(ClerkAuthGuard)
export class TherapistProfileController {
  constructor(
    private readonly therapistManagementService: TherapistManagementService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTherapistProfile(
    @CurrentUserId() therapistId: string,
  ): Promise<TherapistResponse> {
    return this.therapistManagementService.getTherapistProfile(therapistId);
  }

  @Put()
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
}
