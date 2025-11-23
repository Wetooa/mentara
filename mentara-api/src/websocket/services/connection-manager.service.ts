import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
  rooms: Set<string>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  lastActivity: Date;
}

@Injectable()
export class ConnectionManagerService {
  private readonly logger = new Logger(ConnectionManagerService.name);
  private connectedUsers = new Map<string, ConnectedUser>();
  private userToSocket = new Map<string, string>();
  private socketToUser = new Map<string, string>();
  private server: Server | null = null;

  /**
   * Initialize connection manager with Socket.IO server instance
   */
  initialize(server: Server): void {
    this.server = server;
    this.logger.log('Connection manager initialized');
  }

  /**
   * Register a new user connection
   */
  registerConnection(
    socket: Socket,
    userId: string,
    user: ConnectedUser['user'],
  ): void {
    // Handle existing connections for the same user
    const existingSocketId = this.userToSocket.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      this.logger.warn(
        `User ${userId} already connected on socket ${existingSocketId}, disconnecting old connection`,
      );
      this.disconnectSocket(existingSocketId);
    }

    const connectedUser: ConnectedUser = {
      userId,
      socketId: socket.id,
      connectedAt: new Date(),
      rooms: new Set(),
      user,
      lastActivity: new Date(),
    };

    this.connectedUsers.set(socket.id, connectedUser);
    this.userToSocket.set(userId, socket.id);
    this.socketToUser.set(socket.id, userId);

    // Join user's personal room
    const userRoom = this.getUserRoom(userId);
    socket.join(userRoom);
    connectedUser.rooms.add(userRoom);

    this.logger.log(
      `User ${userId} connected on socket ${socket.id} (room: ${userRoom})`,
    );
  }

  /**
   * Unregister a user connection
   */
  unregisterConnection(socketId: string): void {
    const connectedUser = this.connectedUsers.get(socketId);
    if (!connectedUser) {
      return;
    }

    const { userId } = connectedUser;

    this.connectedUsers.delete(socketId);
    this.userToSocket.delete(userId);
    this.socketToUser.delete(socketId);

    this.logger.log(`User ${userId} disconnected from socket ${socketId}`);
  }

  /**
   * Get user room name (standardized format)
   */
  getUserRoom(userId: string): string {
    return `user_${userId}`;
  }

  /**
   * Get conversation room name
   */
  getConversationRoom(conversationId: string): string {
    return `conversation_${conversationId}`;
  }

  /**
   * Subscribe user to a room
   */
  subscribeToRoom(socketId: string, room: string): boolean {
    const connectedUser = this.connectedUsers.get(socketId);
    if (!connectedUser) {
      return false;
    }

    if (this.server) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(room);
        connectedUser.rooms.add(room);
        connectedUser.lastActivity = new Date();
        return true;
      }
    }

    return false;
  }

  /**
   * Unsubscribe user from a room
   */
  unsubscribeFromRoom(socketId: string, room: string): boolean {
    const connectedUser = this.connectedUsers.get(socketId);
    if (!connectedUser) {
      return false;
    }

    if (this.server) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(room);
        connectedUser.rooms.delete(room);
        connectedUser.lastActivity = new Date();
        return true;
      }
    }

    return false;
  }

  /**
   * Get socket ID for a user
   */
  getSocketId(userId: string): string | undefined {
    return this.userToSocket.get(userId);
  }

  /**
   * Get user ID for a socket
   */
  getUserId(socketId: string): string | undefined {
    return this.socketToUser.get(socketId);
  }

  /**
   * Get connected user info
   */
  getConnectedUser(socketId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userToSocket.has(userId);
  }

  /**
   * Get all connected users
   */
  getAllConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Get connection count for a user
   */
  getUserConnectionCount(userId: string): number {
    return Array.from(this.userToSocket.values()).filter(
      (socketId) => this.socketToUser.get(socketId) === userId,
    ).length;
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(socketId: string): void {
    const connectedUser = this.connectedUsers.get(socketId);
    if (connectedUser) {
      connectedUser.lastActivity = new Date();
    }
  }

  /**
   * Disconnect a socket (cleanup)
   */
  private disconnectSocket(socketId: string): void {
    if (this.server) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }
    this.unregisterConnection(socketId);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    uniqueUsers: number;
    averageConnectionsPerUser: number;
  } {
    const uniqueUsers = new Set(
      Array.from(this.connectedUsers.values()).map((u) => u.userId),
    ).size;

    return {
      totalConnections: this.connectedUsers.size,
      uniqueUsers,
      averageConnectionsPerUser:
        uniqueUsers > 0 ? this.connectedUsers.size / uniqueUsers : 0,
    };
  }

  /**
   * Cleanup inactive connections (heartbeat mechanism)
   */
  cleanupInactiveConnections(maxInactivityMinutes = 30): number {
    const now = new Date();
    const maxInactivity = maxInactivityMinutes * 60 * 1000;
    let cleaned = 0;

    for (const [socketId, user] of this.connectedUsers.entries()) {
      const inactivityTime = now.getTime() - user.lastActivity.getTime();
      if (inactivityTime > maxInactivity) {
        this.logger.warn(
          `Cleaning up inactive connection: socket ${socketId}, user ${user.userId}, inactive for ${Math.round(inactivityTime / 60000)} minutes`,
        );
        this.disconnectSocket(socketId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} inactive connections`);
    }

    return cleaned;
  }
}

