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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AdminAnalyticsQuerySchema,
  type AdminAnalyticsQuery,
} from '@mentara/commons';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
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
    @Query(new ZodValidationPipe(AdminAnalyticsQuerySchema))
    query: AdminAnalyticsQuery,
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} retrieving matching performance analytics`,
      );
      return await this.adminService.getMatchingPerformance(
        query.startDate,
        query.endDate,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve matching performance:', error);
      throw new HttpException(
        'Failed to retrieve matching performance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
