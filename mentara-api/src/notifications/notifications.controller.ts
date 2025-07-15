import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { NotificationType, NotificationPriority } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(
    @Body()
    body: {
      title: string;
      message: string;
      type: NotificationType;
      priority?: NotificationPriority;
      data?: any;
      actionUrl?: string;
      scheduledFor?: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.create({
      ...body,
      userId,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
    });
  }

  @Get()
  findAll(
    @CurrentUserId() userId: string,
    @Query('isRead') isRead?: string,
    @Query('type') type?: NotificationType,
    @Query('priority') priority?: NotificationPriority,
  ) {
    const isReadBool = isRead !== undefined ? isRead === 'true' : undefined;
    return this.notificationsService.findAll(
      userId,
      isReadBool,
      type,
      priority,
    );
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUserId() userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('settings')
  getNotificationSettings(@CurrentUserId() userId: string) {
    return this.notificationsService.getNotificationSettings(userId);
  }

  @Patch('settings')
  updateNotificationSettings(
    @Body()
    body: {
      emailAppointmentReminders?: boolean;
      emailNewMessages?: boolean;
      emailWorksheetUpdates?: boolean;
      emailSystemUpdates?: boolean;
      emailMarketing?: boolean;
      pushAppointmentReminders?: boolean;
      pushNewMessages?: boolean;
      pushWorksheetUpdates?: boolean;
      pushSystemUpdates?: boolean;
      inAppMessages?: boolean;
      inAppUpdates?: boolean;
      quietHoursEnabled?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      quietHoursTimezone?: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.updateNotificationSettings(userId, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@CurrentUserId() userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  // Helper endpoints for creating specific notification types

  @Post('appointment-reminder')
  createAppointmentReminder(
    @Body()
    body: {
      appointmentId: string;
      appointmentTime: string;
      therapistName: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createAppointmentReminder(
      userId,
      body.appointmentId,
      new Date(body.appointmentTime),
      body.therapistName,
    );
  }

  @Post('message-notification')
  createMessageNotification(
    @Body()
    body: {
      senderId: string;
      senderName: string;
      conversationId: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createMessageNotification(
      userId,
      body.senderId,
      body.senderName,
      body.conversationId,
    );
  }

  @Post('worksheet-assigned')
  createWorksheetAssignedNotification(
    @Body()
    body: {
      worksheetId: string;
      worksheetTitle: string;
      therapistName: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createWorksheetAssignedNotification(
      userId,
      body.worksheetId,
      body.worksheetTitle,
      body.therapistName,
    );
  }

  @Post('therapist-application')
  createTherapistApplicationNotification(
    @Body()
    body: {
      status: 'approved' | 'rejected';
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createTherapistApplicationNotification(
      userId,
      body.status,
    );
  }

  @Post('review-request')
  createReviewRequestNotification(
    @Body()
    body: {
      therapistId: string;
      therapistName: string;
      sessionId: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createReviewRequestNotification(
      userId,
      body.therapistId,
      body.therapistName,
      body.sessionId,
    );
  }

  @Post('community-post')
  createCommunityPostNotification(
    @Body()
    body: {
      postId: string;
      communityName: string;
      authorName: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.notificationsService.createCommunityPostNotification(
      userId,
      body.postId,
      body.communityName,
      body.authorName,
    );
  }
}
