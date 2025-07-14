import { Module } from '@nestjs/common';
import { MeetingsGateway } from './meetings.gateway';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { WebSocketAuthService } from '../messaging/services/websocket-auth.service';

@Module({
  controllers: [MeetingsController],
  providers: [
    MeetingsGateway,
    MeetingsService,
    PrismaService,
    EventBusService,
    WebSocketAuthService,
  ],
  exports: [MeetingsGateway, MeetingsService],
})
export class MeetingsModule {}
