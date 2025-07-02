import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { WebSocketEventService } from './services/websocket-event.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingGateway,
    WebSocketAuthService,
    WebSocketEventService,
    PrismaService,
    EventBusService,
  ],
  exports: [
    MessagingService,
    MessagingGateway,
    WebSocketAuthService,
    WebSocketEventService,
  ],
})
export class MessagingModule {}
