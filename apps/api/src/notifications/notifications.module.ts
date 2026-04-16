import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SmartNotificationsService } from './services/smart-notifications.service';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SmartNotificationsService, PrismaService],
  exports: [NotificationsService, SmartNotificationsService],
})
export class NotificationsModule {}
