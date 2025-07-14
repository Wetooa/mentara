import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  Put,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { AdminOnly } from '../../decorators/admin-only.decorator';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';

@Controller('admin/therapists')
@UseGuards(ClerkAuthGuard, AdminAuthGuard)
export class AdminTherapistController {
  private readonly logger = new Logger(AdminTherapistController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('applications')
  @AdminOnly()
  async getAllTherapistApplications(
    @CurrentUserId() currentUserId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving therapist applications`,
      );
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getAllTherapistApplications({
        status,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve therapist applications:', error);
      throw new HttpException(
        'Failed to retrieve therapist applications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('applications/:id')
  @AdminOnly()
  async getTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving therapist application ${applicationId}`,
      );
      const application =
        await this.adminService.getTherapistApplication(applicationId);

      if (!application) {
        throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
      }

      return application;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to retrieve therapist application:', error);
      throw new HttpException(
        'Failed to retrieve therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('applications/:id/approve')
  @AdminOnly()
  async approveTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
    @Body() approvalData: { notes?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} approving therapist application ${applicationId}`,
      );
      return await this.adminService.approveTherapistApplication(
        applicationId,
        currentUserId,
        approvalData.notes,
      );
    } catch (error) {
      this.logger.error('Failed to approve therapist application:', error);
      throw new HttpException(
        'Failed to approve therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('applications/:id/reject')
  @AdminOnly()
  async rejectTherapistApplication(
    @CurrentUserId() currentUserId: string,
    @Param('id') applicationId: string,
    @Body() rejectionData: { reason: string; notes?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} rejecting therapist application ${applicationId}`,
      );
      return await this.adminService.rejectTherapistApplication(
        applicationId,
        currentUserId,
        rejectionData.reason,
        rejectionData.notes,
      );
    } catch (error) {
      this.logger.error('Failed to reject therapist application:', error);
      throw new HttpException(
        'Failed to reject therapist application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
