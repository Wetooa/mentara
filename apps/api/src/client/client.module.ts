import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  controllers: [ClientController],
  providers: [
    ClientService,
    PrismaService,
    NotificationsService,
  ],
  exports: [ClientService],
})
export class ClientModule {}
