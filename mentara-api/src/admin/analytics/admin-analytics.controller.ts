import {
  Controller,
  Get,
  UseGuards,
  Query,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AdminAnalyticsService } from './admin-analytics.service';
import { JwtAuthGuard } from '../../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../auth/core/decorators/current-user-role.decorator';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AdminAnalyticsController {
  private readonly logger = new Logger(AdminAnalyticsController.name);

  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('system-stats')
  async getSystemStats(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    this.logger.log(`Admin ${currentUserId} retrieving system stats`);
    return await this.adminAnalyticsService.getSystemStats();
  }

  @Get('user-growth')
  async getUserGrowth(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    this.logger.log(`Admin ${currentUserId} retrieving user growth data`);
    return await this.adminAnalyticsService.getUserGrowth(startDate, endDate);
  }

  @Get('engagement')
  async getEngagement(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    this.logger.log(`Admin ${currentUserId} retrieving engagement data`);
    return await this.adminAnalyticsService.getEngagement(startDate, endDate);
  }

  @Get('platform-overview')
  async getPlatformOverview(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    this.logger.log(`Admin ${currentUserId} retrieving platform overview`);
    return await this.adminAnalyticsService.getPlatformOverview();
  }

  @Get('user-stats')
  async getUserStats(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    this.logger.log(`Admin ${currentUserId} retrieving user stats`);
    return await this.adminAnalyticsService.getUserStats();
  }
}
