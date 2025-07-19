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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
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
} from 'mentara-commons';
import { AdminTherapistService } from '../services/admin-therapist.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('admin-therapist')
@ApiBearerAuth('JWT-auth')
@Controller('admin/therapists')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@AdminOnly()
export class AdminTherapistController {
  private readonly logger = new Logger(AdminTherapistController.name);

  constructor(private readonly adminTherapistService: AdminTherapistService) {}

  @Get('pending')
  @ApiOperation({
    summary: 'Retrieve get pending applications',

    description: 'Retrieve get pending applications',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getPendingApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} fetching pending therapist applications`);
    return this.adminTherapistService.getPendingApplications(filters);
  }

  @Get('applications')
  @ApiOperation({
    summary: 'Retrieve get all applications',

    description: 'Retrieve get all applications',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getAllApplications(
    @Query(new ZodValidationPipe(PendingTherapistFiltersDtoSchema))
    filters: PendingTherapistFiltersDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} fetching all therapist applications`);
    return this.adminTherapistService.getPendingApplications(filters);
  }

  @Get(':id/details')
  @ApiOperation({
    summary: 'Retrieve get application details',

    description: 'Retrieve get application details',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getApplicationDetails(
    @Param('id') therapistId: string,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(
      `Admin ${adminId} viewing therapist application ${therapistId}`,
    );
    return this.adminTherapistService.getApplicationDetails(therapistId);
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Create approve therapist',

    description: 'Create approve therapist',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async approveTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(ApproveTherapistDtoSchema))
    approvalDto: ApproveTherapistDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} approving therapist ${therapistId}`);
    return this.adminTherapistService.approveTherapist(
      therapistId,
      adminId,
      approvalDto,
    );
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Create reject therapist',

    description: 'Create reject therapist',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async rejectTherapist(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(RejectTherapistDtoSchema))
    rejectionDto: RejectTherapistDto,
    @CurrentUserId() adminId: string,
  ) {
    this.logger.log(`Admin ${adminId} rejecting therapist ${therapistId}`);
    return this.adminTherapistService.rejectTherapist(
      therapistId,
      adminId,
      rejectionDto,
    );
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update update therapist status',

    description: 'Update update therapist status',
  })
  @ApiResponse({
    status: 200,

    description: 'Updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async updateTherapistStatus(
    @Param('id') therapistId: string,
    @Body(new ZodValidationPipe(UpdateTherapistStatusDtoSchema))
    statusDto: UpdateTherapistStatusDto,
    @CurrentUserId() adminId: string,
  ) {
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
  @ApiOperation({
    summary: 'Retrieve get therapist application metrics',

    description: 'Retrieve get therapist application metrics',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getTherapistApplicationMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUserId() adminId?: string,
  ) {
    this.logger.log(`Admin ${adminId} fetching therapist application metrics`);
    return this.adminTherapistService.getTherapistApplicationMetrics(
      startDate,
      endDate,
    );
  }
}
