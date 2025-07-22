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
  TherapistFiltersDtoSchema,
} from '../validation/admin.schemas';
import type {
  ApproveTherapistDto,
  RejectTherapistDto,
  UpdateTherapistStatusDto,
  PendingTherapistFiltersDto,
  TherapistApplicationDetailsResponse,
  TherapistActionResponse,
  TherapistApplicationMetricsResponse,
  TherapistListResponse,
} from '../types';
import { AdminTherapistService } from '../services/admin-therapist.service';
import { AdminResponseTransformer } from '../transformers/admin-response.transformer';

@Controller('admin/therapists')
@UseGuards(JwtAuthGuard)
export class AdminTherapistController {
  private readonly logger = new Logger(AdminTherapistController.name);

  constructor(private readonly adminTherapistService: AdminTherapistService) {}

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  async getPendingApplications(
    @Query(new ZodValidationPipe(TherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistListResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} fetching pending therapist applications`);
    const serviceResponse =
      await this.adminTherapistService.getPendingApplications(filters);
    return AdminResponseTransformer.transformTherapistList(serviceResponse);
  }

  @Get('applications')
  @HttpCode(HttpStatus.OK)
  async getAllApplications(
    @Query(new ZodValidationPipe(TherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
    @CurrentUserRole() role: string,
  ): Promise<TherapistListResponse> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    this.logger.log(`Admin ${adminId} fetching all therapist applications`);
    const serviceResponse =
      await this.adminTherapistService.getApplications(filters);
    return AdminResponseTransformer.transformTherapistList(serviceResponse);
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
    const serviceResponse =
      await this.adminTherapistService.getApplicationDetails(therapistId);
    return AdminResponseTransformer.transformApplicationDetails(
      serviceResponse,
    );
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
    const serviceResponse = await this.adminTherapistService.approveTherapist(
      therapistId,
      adminId,
      approvalDto,
    );
    return AdminResponseTransformer.transformActionResponse(
      serviceResponse,
      therapistId,
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
    const serviceResponse = await this.adminTherapistService.rejectTherapist(
      therapistId,
      adminId,
      rejectionDto,
    );
    return AdminResponseTransformer.transformActionResponse(
      serviceResponse,
      therapistId,
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
    const serviceResponse =
      await this.adminTherapistService.updateTherapistStatus(
        therapistId,
        adminId,
        statusDto,
      );
    return AdminResponseTransformer.transformActionResponse(
      serviceResponse,
      therapistId,
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
    const serviceResponse =
      await this.adminTherapistService.getTherapistApplicationMetrics(
        startDate,
        endDate,
      );
    return AdminResponseTransformer.transformApplicationMetrics(
      serviceResponse,
    );
  }
}
