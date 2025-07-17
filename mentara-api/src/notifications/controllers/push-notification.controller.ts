import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { PushNotificationService } from '../services/push-notification.service';
// Using interfaces for DTOs to avoid class initialization errors
interface RegisterDeviceTokenDto {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo?: {
    model?: string;
    os?: string;
    appVersion?: string;
    pushEnabled?: boolean;
  };
}

interface UnregisterDeviceTokenDto {
  token: string;
}

interface TestNotificationDto {
  message: string;
  targetUserId?: string;
}

@ApiTags('Push Notifications')
@ApiTags('push-notification')
@ApiBearerAuth('JWT-auth')
@Controller('notifications/push')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('register')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register device token for push notifications',
    description:
      'Registers a device token to receive push notifications for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Device token registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid device token or platform',
  })
  async registerDeviceToken(
    @GetUser() user: any,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    try {
      await this.pushNotificationService.registerDeviceToken(
        user.id,
        dto.token,
        dto.platform,
        dto.deviceInfo,
      );

      return {
        success: true,
        message: 'Device token registered successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('unregister')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unregister device token',
    description:
      'Unregisters a device token to stop receiving push notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Device token unregistered successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Device token not found',
  })
  async unregisterDeviceToken(
    @GetUser() user: any,
    @Body() dto: UnregisterDeviceTokenDto,
  ) {
    try {
      await this.pushNotificationService.unregisterDeviceToken(dto.token);

      return {
        success: true,
        message: 'Device token unregistered successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('statistics')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get push notification statistics',
    description: 'Retrieves push notification statistics for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalTokens: { type: 'number' },
            activeTokens: { type: 'number' },
            platformBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            recentActivity: { type: 'number' },
          },
        },
      },
    },
  })
  async getStatistics(@GetUser() user: any) {
    try {
      const statistics = await this.pushNotificationService.getStatistics(
        user.id,
      );

      return {
        success: true,
        data: statistics,
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('statistics/global')
  @Roles('admin', 'moderator')
  @ApiOperation({
    summary: 'Get global push notification statistics',
    description:
      'Retrieves platform-wide push notification statistics (admin/moderator only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Global statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getGlobalStatistics() {
    try {
      const statistics = await this.pushNotificationService.getStatistics();

      return {
        success: true,
        data: statistics,
        message: 'Global statistics retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('test')
  @Roles('admin', 'moderator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send test push notification',
    description: 'Sends a test push notification (admin/moderator only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Test notification sent successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 400,
    description: 'Push notification service not configured',
  })
  async sendTestNotification(
    @GetUser() user: any,
    @Body() dto: TestNotificationDto,
  ) {
    try {
      const targetUserId = dto.targetUserId || user.id;

      await this.pushNotificationService.sendTestNotification(
        targetUserId,
        dto.message,
      );

      return {
        success: true,
        message: 'Test notification sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('process-scheduled')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process scheduled push notifications',
    description:
      'Manually triggers processing of scheduled push notifications (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled notifications processed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async processScheduledNotifications() {
    try {
      await this.pushNotificationService.processScheduledNotifications();

      return {
        success: true,
        message: 'Scheduled notifications processed successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
