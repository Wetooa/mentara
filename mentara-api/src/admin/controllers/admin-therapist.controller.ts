import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  ApproveTherapistDtoSchema,
  RejectTherapistDtoSchema,
  UpdateTherapistStatusDtoSchema,
  PendingTherapistFiltersDtoSchema,
  type ApproveTherapistDto,
  type RejectTherapistDto,
  type UpdateTherapistStatusDto,
  type PendingTherapistFiltersDto,
  type TherapistApplicationDetailsResponse,
  type TherapistActionResponse,
  type TherapistApplicationMetricsResponse,
  type TherapistListResponse,
} from 'mentara-commons';
import { AdminTherapistService } from '../services/admin-therapist.service';

@Controller('admin/therapists')
@UseGuards(JwtAuthGuard)
export class AdminTherapistController {
  private readonly logger = new Logger(AdminTherapistController.name);

  constructor(private readonly adminTherapistService: AdminTherapistService) {}

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPendingApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistListResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} fetching pending therapist applications`);
    return this.adminTherapistService.getPendingApplications(filters);
  }

  @Get('applications')
  @HttpCode(HttpStatus.OK)
  async getAllApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistListResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} fetching all therapist applications`);
    return this.adminTherapistService.getPendingApplications(filters);
  }

  @Get(':id/details')
  @HttpCode(HttpStatus.OK)
  async getApplicationDetails(
    @Param('id') therapistId: string,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistApplicationDetailsResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(
      `Admin ${adminId} viewing therapist application ${therapistId}`,
    );
    return this.adminTherapistService.getApplicationDetails(therapistId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(ApproveTherapistDtoSchema))
    approvalDto: ApproveTherapistDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistActionResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} approving therapist ${therapistId}`);
    return this.adminTherapistService.approveTherapist(
      therapistId,
      adminId,
      approvalDto,
    );
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(RejectTherapistDtoSchema))
    rejectionDto: RejectTherapistDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistActionResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} rejecting therapist ${therapistId}`);
    return this.adminTherapistService.rejectTherapist(
      therapistId,
      adminId,
      rejectionDto,
    );
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateTherapistStatus(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(UpdateTherapistStatusDtoSchema))
    statusDto: UpdateTherapistStatusDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistActionResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(
      `Admin ${adminId} updating therapist ${therapistId} status to ${statusDto.status}`,
    );
    return this.adminTherapistService.updateTherapistStatus(
      therapistId,
      adminId,
      statusDto,
    );
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getTherapistApplicationMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUserId() adminId?: string,
    @CurrentUserRole() role?: string,
  ): Promise<TherapistApplicationMetricsResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} fetching therapist application metrics`);
    return this.adminTherapistService.getTherapistApplicationMetrics(
      startDate,
      endDate,
    );
  }
}
