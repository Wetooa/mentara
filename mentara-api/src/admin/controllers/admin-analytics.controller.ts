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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AdminAnalyticsQuerySchema,
  type AdminAnalyticsQuery,
} from '@mentara/commons';

@ApiTags('admin-analytics')
@ApiBearerAuth('JWT-auth')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminAnalyticsController {
  private readonly logger = new Logger(AdminAnalyticsController.name);

  constructor(private readonly adminService: AdminService) {}

  @Get('overview')


  @ApiOperation({ 


    summary: 'Retrieve get platform overview',


    description: 'Retrieve get platform overview' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve get matching performance',


    description: 'Retrieve get matching performance' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
