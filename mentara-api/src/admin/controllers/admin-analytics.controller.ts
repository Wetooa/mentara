import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { AdminOnly } from '../../decorators/admin-only.decorator';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';

@Controller('admin/analytics')
@UseGuards(ClerkAuthGuard, AdminAuthGuard)
export class AdminAnalyticsController {
  private readonly logger = new Logger(AdminAnalyticsController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @AdminOnly()
  async getPlatformOverview(@CurrentUserId() currentUserId: string) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving platform overview`);
      return await this.adminService.getPlatformOverview();
    } catch (error) {
      this.logger.error('Failed to retrieve platform overview:', error);
      throw new HttpException(
        'Failed to retrieve platform overview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('matching-performance')
  @AdminOnly()
  async getMatchingPerformance(
    @CurrentUserId() currentUserId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving matching performance analytics`,
      );
      return await this.adminService.getMatchingPerformance(startDate, endDate);
    } catch (error) {
      this.logger.error('Failed to retrieve matching performance:', error);
      throw new HttpException(
        'Failed to retrieve matching performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
