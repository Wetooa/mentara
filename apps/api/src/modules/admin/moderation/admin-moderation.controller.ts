import {
  Controller,
  Put,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../../../common/decorators/current-user-role.decorator';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard)
export class AdminModerationController {
  private readonly logger = new Logger(AdminModerationController.name);

  constructor(private readonly adminService: AdminService) {}

  // Note: getFlaggedContent endpoint temporarily removed
  // This functionality should be implemented in AdminReportsService
  // with proper flagging/reporting mechanism instead of incomplete placeholder

  @Put(':contentType/:contentId/moderate')
  async moderateContent(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @Body()
    moderationData: { action: 'approve' | 'remove' | 'flag'; reason?: string },
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
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
