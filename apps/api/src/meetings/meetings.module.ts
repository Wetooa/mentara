import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MeetingsGateway } from './meetings.gateway';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { WebSocketAuthService } from '../messaging/services/websocket-auth.service';
import { WebRTCConfigService } from '../config/webrtc.config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [MeetingsController],
  providers: [
    MeetingsGateway,
    MeetingsService,
    PrismaService,
    EventBusService,
    WebSocketAuthService,
    WebRTCConfigService,
  ],
  exports: [MeetingsGateway, MeetingsService],
})
export class MeetingsModule {}
