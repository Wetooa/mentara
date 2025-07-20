import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientRequestController } from './controllers/client-request.controller';
import { ClientService } from './client.service';
import { ClientRequestService } from './services/client-request.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [ClientController, ClientRequestController],
  providers: [
    ClientService,
    ClientRequestService,
    PrismaService,
    NotificationsService,
  ],
  exports: [ClientService, ClientRequestService],
})
export class ClientModule {}
