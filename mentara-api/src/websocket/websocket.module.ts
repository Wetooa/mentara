import { Module, Global } from '@nestjs/common';
import { MessagingGateway } from '../messaging/messaging.gateway';
import { NotificationGateway } from './gateways/notification.gateway';
import { VideoCallGateway } from './gateways/video-call.gateway';
import { ConnectionManagerService } from './services/connection-manager.service';
import { WebSocketEventService } from '../messaging/services/websocket-event.service';
import { WebSocketAuthMiddleware } from '../messaging/services/websocket-auth.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { MessagingModule } from '../messaging/messaging.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [MessagingModule, NotificationsModule],
  providers: [
    MessagingGateway,
    NotificationGateway,
    VideoCallGateway,
    ConnectionManagerService,
    WebSocketEventService,
              WebSocketAuthMiddleware,
    PrismaService,
    EventBusService,
  ],
  exports: [
    MessagingGateway,
    NotificationGateway,
    VideoCallGateway,
    ConnectionManagerService,
    WebSocketEventService,
  ],
})
export class WebSocketModule {}

