import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminTherapistService } from './services/admin-therapist.service';
import { AdminAccountController } from './controllers/admin-account.controller';
import { AdminTherapistController } from './controllers/admin-therapist.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { RoleUtils } from '../utils/role-utils';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Module({
  imports: [],
  controllers: [
    AdminController,
    AdminAccountController,
    AdminTherapistController,
    AdminUserController,
    AdminModerationController,
  ],
  providers: [
    AdminService,
    AdminTherapistService,
    PrismaService,
    NotificationsService,
    RoleUtils,
    AdminAuthGuard,
  ],
  exports: [AdminService],
})
export class AdminModule {}
