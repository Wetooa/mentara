import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushNotificationService } from './services/push-notification.service';
import { PushNotificationController } from './controllers/push-notification.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController, PushNotificationController],
  providers: [NotificationsService, PushNotificationService, PrismaService],
  exports: [NotificationsService, PushNotificationService],
})
export class NotificationsModule {}
