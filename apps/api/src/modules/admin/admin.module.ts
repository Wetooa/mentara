import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
// import { AdminTherapistService } from './therapist/admin-therapist.service';
import { AdminAnalyticsService } from './analytics/admin-analytics.service';
import { AdminReportsService } from './reports/admin-reports.service';
import { AdminHealthController } from './admin-health.controller';
import { AdminAccountController } from './account/admin-account.controller';
// import { AdminTherapistController } from './therapist/admin-therapist.controller';
import { AdminUserController } from './users/admin-user.controller';
import { AdminModerationController } from './moderation/admin-moderation.controller';
import { AdminAnalyticsController } from './analytics/admin-analytics.controller';
import { AdminReportsController } from './reports/admin-reports.controller';
import { PrismaService } from '../../core/prisma/prisma.service';
// import { NotificationsService } from '../notifications/notifications.service';
import { RoleUtils } from '../../utils/role-utils';
// import { MessagingModule } from '../messaging/messaging.module';
import { EmailModule } from '../../core/providers/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [
    AdminHealthController,
    AdminAccountController,
    // AdminTherapistController,
    AdminUserController,
    AdminModerationController,
    AdminAnalyticsController,
    AdminReportsController,
  ],
  providers: [
    AdminService,
    // AdminTherapistService,
    AdminAnalyticsService,
    AdminReportsService,
    PrismaService,
    // NotificationsService,
    RoleUtils,
  ],
  exports: [AdminService],
})
export class AdminModule {}
