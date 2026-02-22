import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../auth/core/decorators/current-user-role.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard)
export class AdminReportsController {
  private readonly logger = new Logger(AdminReportsController.name);

  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  async getReports(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Query('type') type?: 'post' | 'comment' | 'user',
    @Query('status') status?: 'pending' | 'reviewed' | 'dismissed',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    try {
      this.logger.log(`Admin ${currentUserId} retrieving reports`);
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      return await this.adminReportsService.getReports({
        type,
        status,
        page: pageNum,
        limit: limitNum,
        search,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve reports:', error);
      throw new HttpException(
        'Failed to retrieve reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getReportById(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') reportId: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    try {
      this.logger.log(`Admin ${currentUserId} retrieving report ${reportId}`);
      const report = await this.adminReportsService.getReportById(reportId);

      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }

      return report;
    } catch (error) {
      this.logger.error(`Failed to retrieve report ${reportId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  async updateReportStatus(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') reportId: string,
    @Body() statusData: { status: 'reviewed' | 'dismissed'; reason?: string },
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    try {
      this.logger.log(
        `Admin ${currentUserId} updating report ${reportId} status to ${statusData.status}`,
      );

      return await this.adminReportsService.updateReportStatus(
        reportId,
        statusData.status,
        currentUserId,
        statusData.reason,
      );
    } catch (error) {
      this.logger.error(`Failed to update report ${reportId} status:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update report status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/action')
  async takeReportAction(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('id') reportId: string,
    @Body()
    actionData: {
      action: 'ban_user' | 'restrict_user' | 'delete_content' | 'dismiss';
      reason?: string;
    },
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    try {
      this.logger.log(
        `Admin ${currentUserId} taking action ${actionData.action} on report ${reportId}`,
      );

      return await this.adminReportsService.handleReportAction(
        reportId,
        actionData.action,
        currentUserId,
        actionData.reason,
      );
    } catch (error) {
      this.logger.error(`Failed to take action on report ${reportId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to take action on report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getReportsOverview(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    try {
      this.logger.log(`Admin ${currentUserId} retrieving reports overview`);
      return await this.adminReportsService.getReportsOverview();
    } catch (error) {
      this.logger.error('Failed to retrieve reports overview:', error);
      throw new HttpException(
        'Failed to retrieve reports overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
