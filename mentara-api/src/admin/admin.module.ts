import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAccountController } from './controllers/admin-account.controller';
import { AdminTherapistController } from './controllers/admin-therapist.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { RoleUtils } from '../utils/role-utils';
import { AdminAuthGuard } from '../guards/admin-auth.guard';

@Module({
  controllers: [
    AdminController,
    AdminAccountController,
    AdminTherapistController,
    AdminUserController,
    AdminAnalyticsController,
    AdminModerationController,
  ],
  providers: [AdminService, PrismaService, RoleUtils, AdminAuthGuard],
  exports: [AdminService],
})
export class AdminModule {}
