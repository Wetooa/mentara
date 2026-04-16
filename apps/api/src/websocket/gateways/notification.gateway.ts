/**
 * @deprecated Notification gateway is no longer used. Notifications are delivered via HTTP polling.
 * This gateway is kept for potential future use but is not currently active.
 */
import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectionManagerService } from '../services/connection-manager.service';
import { WebSocketAuthMiddleware } from '../../messaging/services/websocket-auth.service';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization', 'content-type'],
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly authMiddleware: WebSocketAuthMiddleware,
  ) {}

  afterInit(server: Server) {
    this.server.use(this.authMiddleware.createAuthMiddleware());
    this.connectionManager.initialize(server);
    this.logger.log('Notification WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const userId = (client as any).userId;
      const user = (client as any).user;
      
      if (!userId || !user) {
        this.logger.warn(`Unauthenticated notification connection attempt: ${client.id}`);
        client.disconnect();
        return;
      }

      this.connectionManager.registerConnection(client, userId, {
        id: userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'client',
      });

      // Join user's notification room
      const userRoom = this.connectionManager.getUserRoom(userId);
      client.join(userRoom);

      this.logger.log(`User ${userId} connected to notification gateway`);
    } catch (error) {
      this.logger.error(`Error handling notification connection: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectionManager.getUserId(client.id);
    if (userId) {
      this.connectionManager.unregisterConnection(client.id);
      this.logger.log(`User ${userId} disconnected from notification gateway`);
    }
  }

  /**
   * Send notification to a user (called by NotificationsService)
   */
  sendNotification(userId: string, notification: any): void {
    const userRoom = this.connectionManager.getUserRoom(userId);
    this.server.to(userRoom).emit('notification', notification);
    this.logger.debug(`Notification sent to user ${userId}`);
  }

  /**
   * Send unread count update
   */
  sendUnreadCount(userId: string, count: number): void {
    const userRoom = this.connectionManager.getUserRoom(userId);
    this.server.to(userRoom).emit('unreadCount', { count });
    this.logger.debug(`Unread count update sent to user ${userId}: ${count}`);
  }

  /**
   * Get server instance for NotificationsService
   */
  getServer(): Server {
    return this.server;
  }
}

