import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingGateway,
    WebSocketAuthService,
    PrismaService,
  ],
  exports: [MessagingService, MessagingGateway, WebSocketAuthService],
})
export class MessagingModule {}
