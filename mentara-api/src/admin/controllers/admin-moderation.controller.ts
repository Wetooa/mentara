import {
  Controller,
  Get,
  Put,
  Body,
  Param,
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

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminModerationController {
  private readonly logger = new Logger(AdminModerationController.name);

  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('flagged')
  @AdminOnly()
  async getFlaggedContent(
    @CurrentUserId() currentUserId: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      this.logger.log(`Admin ${currentUserId} retrieving flagged content`);
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;

      return await this.adminService.getFlaggedContent({
        type,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      this.logger.error('Failed to retrieve flagged content:', error);
      throw new HttpException(
        'Failed to retrieve flagged content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':contentType/:contentId/moderate')
  @AdminOnly()
  async moderateContent(
    @CurrentUserId() currentUserId: string,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Body()
    moderationData: { action: 'approve' | 'remove' | 'flag'; reason?: string },
  ) {
    try {
      this.logger.log(
        `Admin ${currentUserId} moderating ${contentType} ${contentId}`,
      );
      return await this.adminService.moderateContent(
        contentType,
        contentId,
        currentUserId,
        moderationData.action,
        moderationData.reason,
      );
    } catch (error) {
      this.logger.error('Failed to moderate content:', error);
      throw new HttpException(
        'Failed to moderate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
