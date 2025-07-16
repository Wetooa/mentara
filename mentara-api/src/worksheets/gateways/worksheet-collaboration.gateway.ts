import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EnhancedWorksheetsService } from '../services/enhanced-worksheets.service';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  worksheetId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/worksheets',
})
export class WorksheetCollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WorksheetCollaborationGateway.name);

  constructor(
    private readonly worksheetsService: EnhancedWorksheetsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub || payload.userId;

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.userId})`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Connection failed: ${errorMessage}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId && client.worksheetId) {
      try {
        // Leave collaboration session
        await this.worksheetsService.leaveCollaboration(
          client.worksheetId,
          client.userId,
        );

        // Notify other collaborators
        client.to(`worksheet:${client.worksheetId}`).emit('user-left', {
          userId: client.userId,
          timestamp: new Date(),
        });

        this.logger.log(
          `Client disconnected: ${client.id} (User: ${client.userId}, Worksheet: ${client.worksheetId})`,
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error handling disconnect: ${errorMessage}`);
      }
    }
  }

  // ===== COLLABORATION EVENTS =====

  @SubscribeMessage('join-worksheet')
  async handleJoinWorksheet(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { worksheetId: string; cursorPosition?: any },
  ) {
    try {
      const { worksheetId, cursorPosition } = data;

      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Leave previous worksheet if any
      if (client.worksheetId) {
        await this.handleLeaveWorksheet(client, {
          worksheetId: client.worksheetId,
        });
      }

      // Join new worksheet room
      client.join(`worksheet:${worksheetId}`);
      client.worksheetId = worksheetId;

      // Register collaboration session
      const collaboration = await this.worksheetsService.joinCollaboration({
        worksheetId,
        userId: client.userId,
        sessionId: client.id,
        cursorPosition,
      });

      // Get current active collaborators
      const collaborators =
        await this.worksheetsService.getActiveCollaborators(worksheetId);

      // Notify client of successful join
      client.emit('joined-worksheet', {
        worksheetId,
        collaborators,
        timestamp: new Date(),
      });

      // Notify other collaborators
      client.to(`worksheet:${worksheetId}`).emit('user-joined', {
        user: { id: client.userId },
        userId: client.userId,
        sessionId: client.id,
        cursorPosition,
        timestamp: new Date(),
      });

      this.logger.log(`User ${client.userId} joined worksheet ${worksheetId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error joining worksheet: ${errorMessage}`);
      client.emit('error', { message: 'Failed to join worksheet' });
    }
  }

  @SubscribeMessage('leave-worksheet')
  async handleLeaveWorksheet(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { worksheetId: string },
  ) {
    try {
      const { worksheetId } = data;

      if (!client.userId) {
        return;
      }

      // Leave collaboration session
      await this.worksheetsService.leaveCollaboration(
        worksheetId,
        client.userId,
      );

      // Leave room
      client.leave(`worksheet:${worksheetId}`);

      // Notify other collaborators
      client.to(`worksheet:${worksheetId}`).emit('user-left', {
        userId: client.userId,
        timestamp: new Date(),
      });

      // Clear worksheet ID
      if (client.worksheetId === worksheetId) {
        client.worksheetId = undefined;
      }

      client.emit('left-worksheet', { worksheetId });

      this.logger.log(`User ${client.userId} left worksheet ${worksheetId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error leaving worksheet: ${errorMessage}`);
    }
  }

  // ===== REAL-TIME EDITING =====

  @SubscribeMessage('cursor-update')
  async handleCursorUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { worksheetId: string; cursorPosition: any },
  ) {
    try {
      const { worksheetId, cursorPosition } = data;

      if (!client.userId || client.worksheetId !== worksheetId) {
        return;
      }

      // Update cursor position in database
      await this.worksheetsService.updateCursorPosition(
        worksheetId,
        client.userId,
        cursorPosition,
      );

      // Broadcast to other collaborators
      client.to(`worksheet:${worksheetId}`).emit('cursor-updated', {
        userId: client.userId,
        cursorPosition,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating cursor: ${errorMessage}`);
    }
  }

  @SubscribeMessage('content-operation')
  async handleContentOperation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      worksheetId: string;
      versionId: string;
      operation: any;
    },
  ) {
    try {
      const { worksheetId, versionId, operation } = data;

      if (!client.userId || client.worksheetId !== worksheetId) {
        client.emit('error', { message: 'Not authorized for this worksheet' });
        return;
      }

      // Apply operation
      const result = await this.worksheetsService.applyOperation(
        worksheetId,
        versionId,
        {
          ...operation,
          userId: client.userId,
        },
      );

      // Broadcast operation to other collaborators
      client.to(`worksheet:${worksheetId}`).emit('operation-applied', {
        operation: { id: result.operationId },
        newContent: 'Updated content placeholder',
        userId: client.userId,
        timestamp: new Date(),
      });

      // Confirm operation to sender
      client.emit('operation-confirmed', {
        operationId: data.operation.id || 'confirmed-op',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error applying operation: ${errorMessage}`);
      client.emit('operation-failed', {
        operationId: data.operation.id || 'failed-op',
        error: errorMessage,
      });
    }
  }

  @SubscribeMessage('auto-save')
  async handleAutoSave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { worksheetId: string; content: any },
  ) {
    try {
      const { worksheetId, content } = data;

      if (!client.userId || client.worksheetId !== worksheetId) {
        return;
      }

      // Auto-save content
      const draft = await this.worksheetsService.autoSave({
        worksheetId,
        userId: client.userId,
        content,
      });

      // Confirm auto-save to client
      client.emit('auto-save-confirmed', {
        draftId: draft.id,
        timestamp: draft.lastSaved,
      });

      // Notify other collaborators about auto-save
      client.to(`worksheet:${worksheetId}`).emit('user-auto-saved', {
        userId: client.userId,
        timestamp: draft.lastSaved,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error auto-saving: ${errorMessage}`);
      client.emit('auto-save-failed', { error: errorMessage });
    }
  }

  // ===== COMMENTS =====

  @SubscribeMessage('add-comment')
  async handleAddComment(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      worksheetId: string;
      content: string;
      position?: any;
      parentId?: string;
    },
  ) {
    try {
      const { worksheetId, content, position, parentId } = data;

      if (!client.userId || client.worksheetId !== worksheetId) {
        client.emit('error', { message: 'Not authorized for this worksheet' });
        return;
      }

      // Add comment
      const comment = await this.worksheetsService.addComment({
        worksheetId,
        userId: client.userId,
        content,
        position,
        parentId,
      });

      // Broadcast comment to all collaborators (including sender)
      this.server.to(`worksheet:${worksheetId}`).emit('comment-added', {
        comment,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error adding comment: ${errorMessage}`);
      client.emit('error', { message: 'Failed to add comment' });
    }
  }

  @SubscribeMessage('resolve-comment')
  async handleResolveComment(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { commentId: string; worksheetId: string },
  ) {
    try {
      const { commentId, worksheetId } = data;

      if (!client.userId || client.worksheetId !== worksheetId) {
        client.emit('error', { message: 'Not authorized for this worksheet' });
        return;
      }

      // Resolve comment
      const comment = await this.worksheetsService.resolveComment(
        commentId,
        client.userId,
      );

      // Broadcast resolution to all collaborators
      this.server.to(`worksheet:${worksheetId}`).emit('comment-resolved', {
        commentId,
        resolvedBy: client.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error resolving comment: ${errorMessage}`);
      client.emit('error', { message: 'Failed to resolve comment' });
    }
  }

  // ===== EVENT LISTENERS (from EventEmitter) =====

  @OnEvent('worksheet.version.created')
  handleVersionCreated(data: any) {
    this.server.to(`worksheet:${data.worksheetId}`).emit('version-created', {
      versionId: data.versionId,
      version: data.version,
      userId: data.userId,
      timestamp: data.timestamp,
    });
  }

  @OnEvent('worksheet.collaboration.joined')
  handleCollaborationJoined(data: any) {
    // This is already handled in the join-worksheet message handler
    // But we could add additional logic here if needed
  }

  @OnEvent('worksheet.collaboration.left')
  handleCollaborationLeft(data: any) {
    // This is already handled in the leave-worksheet message handler
    // But we could add additional logic here if needed
  }

  @OnEvent('worksheet.auto.saved')
  handleAutoSaved(data: any) {
    // Auto-save events are already handled in the auto-save message handler
    // This could be used for additional server-side processing
  }

  @OnEvent('worksheet.comment.added')
  handleCommentAdded(data: any) {
    // Comments are already handled in the add-comment message handler
    // This could be used for additional notifications or processing
  }

  // ===== UTILITY METHODS =====

  /**
   * Send a message to all users in a specific worksheet
   */
  sendToWorksheet(worksheetId: string, event: string, data: any) {
    this.server.to(`worksheet:${worksheetId}`).emit(event, data);
  }

  /**
   * Send a message to a specific user if they're online
   */
  async sendToUser(userId: string, event: string, data: any) {
    // Find all sockets for this user
    const sockets = await this.server.fetchSockets();
    const userSockets = sockets.filter(
      (socket) => (socket as unknown as AuthenticatedSocket).userId === userId,
    );

    userSockets.forEach((socket) => {
      socket.emit(event, data);
    });
  }

  /**
   * Get online status for users in a worksheet
   */
  async getOnlineUsers(worksheetId: string): Promise<string[]> {
    const sockets = await this.server
      .in(`worksheet:${worksheetId}`)
      .fetchSockets();
    return sockets
      .map((socket) => (socket as unknown as AuthenticatedSocket).userId)
      .filter((userId) => userId !== undefined);
  }
}
