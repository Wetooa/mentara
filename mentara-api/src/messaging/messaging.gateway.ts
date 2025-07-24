import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, Inject, forwardRef } from '@nestjs/common';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { WebSocketEventService } from './services/websocket-event.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
  rooms: Set<string>;
}

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
}

@Injectable()
@WebSocketGateway({
  namespace: '/messaging',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',  // Explicit fallback
      'http://127.0.0.1:3000',  // Alternative localhost
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['authorization', 'content-type'],
  },
  // Enable connection state recovery for better reliability
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly websocketAuth: WebSocketAuthService,
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    @Inject(forwardRef(() => WebSocketEventService))
    private readonly webSocketEventService: WebSocketEventService,
  ) {}

  afterInit() {
    this.logger.log('Messaging WebSocket Gateway initialized with connection state recovery');
  }

  async handleConnection(client: Socket) {
    try {
      // Log connection recovery status
      if ((client as any).recovered) {
        this.logger.log(`User ${(client as any).handshake?.auth?.userId || 'unknown'} connected with state recovery`);
      }

      const user = await this.websocketAuth.authenticateSocket(client);
      if (!user) {
        this.logger.warn(`Authentication failed for socket ${client.id}`);
        client.disconnect();
        return;
      }

      // Remove any existing connection for this user
      const existingSocketId = this.userToSocket.get(user.userId);
      if (existingSocketId) {
        const existingSocket = this.server.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          this.logger.log(`Disconnecting existing socket for user ${user.userId}`);
          existingSocket.disconnect();
        }
        this.cleanupUserConnection(user.userId);
      }

      // Set up new connection
      const connectedUser: ConnectedUser = {
        userId: user.userId,
        socketId: client.id,
        connectedAt: new Date(),
        rooms: new Set(),
      };

      this.connectedUsers.set(user.userId, connectedUser);
      this.userToSocket.set(user.userId, client.id);
      this.socketToUser.set(client.id, user.userId);

      // Subscribe user to their personal notification room
      const personalRoom = this.getUserRoom(user.userId);
      await client.join(personalRoom);
      connectedUser.rooms.add(personalRoom);

      this.logger.log(`User ${user.userId} connected to messaging gateway`);
      
      // Send connection confirmation
      client.emit('connected', {
        userId: user.userId,
        timestamp: new Date(),
        message: 'Connected to messaging service',
        recovered: (client as any).recovered || false,
      });

    } catch (error) {
      this.logger.error('Connection failed:', error);
      client.disconnect();
    }
  }