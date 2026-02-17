import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { WebSocketAuthService, WebSocketAuthMiddleware } from './services/websocket-auth.service';
import { WebSocketEventService } from './services/websocket-event.service';
// MessageEncryptionService removed - encryption functionality not supported by schema
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10), // 1 hour in seconds
      },
    }),
  ],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingGateway,
    WebSocketAuthService, // Keep for backward compatibility if needed
    WebSocketAuthMiddleware, // New simplified middleware
    WebSocketEventService,
    PrismaService,
    EventBusService,
  ],
  exports: [MessagingService, MessagingGateway, WebSocketAuthService, WebSocketAuthMiddleware, WebSocketEventService],
})
export class MessagingModule {}