import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  OperationType, 
  ChangeNotificationType 
} from '@prisma/client';

interface WorksheetOperation {
  id: string;
  type: OperationType;
  position: number;
  content?: string;
  length?: number;
  userId: string;
  timestamp: Date;
}

interface CollaborationSession {
  worksheetId: string;
  userId: string;
  sessionId: string;
  cursorPosition?: any;
}

interface AutoSaveData {
  worksheetId: string;
  userId: string;
  content: any;
}

interface CommentData {
  worksheetId: string;
  userId: string;
  content: string;
  position?: any;
  parentId?: string;
}

@Injectable()
export class EnhancedWorksheetsService {
  private readonly logger = new Logger(EnhancedWorksheetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ===== VERSION CONTROL =====

  /**
   * Create a new version of a worksheet
   */
  async createVersion(
    worksheetId: string,
    content: any,
    userId: string,
    changeLog?: any
  ) {
    const worksheet = await this.prisma.worksheet.findUnique({
      where: { id: worksheetId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    });

    if (!worksheet) {
      throw new NotFoundException(`Worksheet ${worksheetId} not found`);
    }

    const nextVersion = worksheet.versions.length > 0 
      ? worksheet.versions[0].version + 1 
      : 1;

    const version = await this.prisma.worksheetVersion.create({
      data: {
        worksheetId,
        version: nextVersion,
        content,
        changeLog,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Emit version created event
    this.eventEmitter.emit('worksheet.version.created', {
      worksheetId,
      versionId: version.id,
      version: nextVersion,
      userId,
      timestamp: new Date(),
    });

    // Notify collaborators
    await this.notifyCollaborators(
      worksheetId,
      userId,
      ChangeNotificationType.VERSION_CREATED,
      { versionId: version.id, version: nextVersion }
    );

    this.logger.log(`Created version ${nextVersion} for worksheet ${worksheetId} by user ${userId}`);

    return version;
  }

  /**
   * Get version history for a worksheet
   */
  async getVersionHistory(worksheetId: string, limit = 20) {
    return await this.prisma.worksheetVersion.findMany({
      where: { worksheetId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: { version: 'desc' },
      take: limit,
    });
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(
    worksheetId: string,
    versionId: string,
    userId: string
  ) {
    const version = await this.prisma.worksheetVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.worksheetId !== worksheetId) {
      throw new NotFoundException(`Version ${versionId} not found for worksheet ${worksheetId}`);
    }

    // Create a new version with the restored content
    const restoredVersion = await this.createVersion(
      worksheetId,
      version.content,
      userId,
      { type: 'restore', restoredFromVersion: version.version }
    );

    this.logger.log(`Restored version ${version.version} as new version for worksheet ${worksheetId}`);

    return restoredVersion;
  }

  // ===== REAL-TIME COLLABORATION =====

  /**
   * Join a collaboration session
   */
  async joinCollaboration(data: CollaborationSession) {
    const { worksheetId, userId, sessionId, cursorPosition } = data;

    // End any existing sessions for this user on this worksheet
    await this.prisma.worksheetCollab.updateMany({
      where: {
        worksheetId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    // Create new collaboration session
    const collaboration = await this.prisma.worksheetCollab.create({
      data: {
        worksheetId,
        userId,
        sessionId,
        cursorPosition,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Notify other collaborators
    await this.notifyCollaborators(
      worksheetId,
      userId,
      ChangeNotificationType.USER_JOINED,
      { sessionId, cursorPosition }
    );

    // Emit real-time event
    this.eventEmitter.emit('worksheet.collaboration.joined', {
      worksheetId,
      userId,
      sessionId,
      user: collaboration.user,
      timestamp: new Date(),
    });

    this.logger.log(`User ${userId} joined collaboration for worksheet ${worksheetId}`);

    return collaboration;
  }

  /**
   * Leave a collaboration session
   */
  async leaveCollaboration(worksheetId: string, userId: string) {
    await this.prisma.worksheetCollab.updateMany({
      where: {
        worksheetId,
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    // Notify other collaborators
    await this.notifyCollaborators(
      worksheetId,
      userId,
      ChangeNotificationType.USER_LEFT,
      {}
    );

    // Emit real-time event
    this.eventEmitter.emit('worksheet.collaboration.left', {
      worksheetId,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`User ${userId} left collaboration for worksheet ${worksheetId}`);
  }

  /**
   * Update cursor position for real-time awareness
   */
  async updateCursorPosition(
    worksheetId: string,
    userId: string,
    cursorPosition: any
  ) {
    await this.prisma.worksheetCollab.updateMany({
      where: {
        worksheetId,
        userId,
        isActive: true,
      },
      data: {
        cursorPosition,
        lastActivity: new Date(),
      },
    });

    // Emit real-time cursor update
    this.eventEmitter.emit('worksheet.cursor.updated', {
      worksheetId,
      userId,
      cursorPosition,
      timestamp: new Date(),
    });
  }

  /**
   * Get active collaborators for a worksheet
   */
  async getActiveCollaborators(worksheetId: string) {
    return await this.prisma.worksheetCollab.findMany({
      where: {
        worksheetId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  // ===== OPERATIONAL TRANSFORMATION =====

  /**
   * Apply an operation to a worksheet
   */
  async applyOperation(
    worksheetId: string,
    versionId: string,
    operation: Omit<WorksheetOperation, 'id' | 'timestamp'>
  ) {
    // Get current version to apply operation to
    const version = await this.prisma.worksheetVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.worksheetId !== worksheetId) {
      throw new NotFoundException(`Version ${versionId} not found for worksheet ${worksheetId}`);
    }

    // Create operation record
    const opRecord = await this.prisma.worksheetOperation.create({
      data: {
        worksheetId,
        versionId,
        operationId: operation.id,
        type: operation.type,
        position: operation.position,
        content: operation.content,
        length: operation.length,
        userId: operation.userId,
        applied: true,
      },
    });

    // Apply operation to content (simplified - real implementation would need proper OT)
    let newContent = { ...version.content };
    
    switch (operation.type) {
      case OperationType.INSERT:
        // Insert text at position
        if (typeof newContent.text === 'string') {
          newContent.text = 
            newContent.text.slice(0, operation.position) +
            operation.content +
            newContent.text.slice(operation.position);
        }
        break;
      
      case OperationType.DELETE:
        // Delete text from position
        if (typeof newContent.text === 'string' && operation.length) {
          newContent.text = 
            newContent.text.slice(0, operation.position) +
            newContent.text.slice(operation.position + operation.length);
        }
        break;
        
      case OperationType.REPLACE:
        // Replace text at position
        if (typeof newContent.text === 'string' && operation.length) {
          newContent.text = 
            newContent.text.slice(0, operation.position) +
            operation.content +
            newContent.text.slice(operation.position + operation.length);
        }
        break;
    }

    // Update version content
    await this.prisma.worksheetVersion.update({
      where: { id: versionId },
      data: { content: newContent },
    });

    // Notify collaborators about the change
    await this.notifyCollaborators(
      worksheetId,
      operation.userId,
      ChangeNotificationType.CONTENT_CHANGED,
      { operation: opRecord, newContent }
    );

    // Emit real-time operation event
    this.eventEmitter.emit('worksheet.operation.applied', {
      worksheetId,
      versionId,
      operation: opRecord,
      userId: operation.userId,
      timestamp: new Date(),
    });

    return { operation: opRecord, newContent };
  }

  // ===== AUTO-SAVE =====

  /**
   * Auto-save draft content
   */
  async autoSave(data: AutoSaveData) {
    const { worksheetId, userId, content } = data;

    const draft = await this.prisma.worksheetDraft.upsert({
      where: {
        worksheetId_userId: {
          worksheetId,
          userId,
        },
      },
      update: {
        content,
        lastSaved: new Date(),
        autoSaved: true,
      },
      create: {
        worksheetId,
        userId,
        content,
        autoSaved: true,
      },
    });

    // Emit auto-save event
    this.eventEmitter.emit('worksheet.auto.saved', {
      worksheetId,
      userId,
      draftId: draft.id,
      timestamp: new Date(),
    });

    this.logger.log(`Auto-saved draft for worksheet ${worksheetId} by user ${userId}`);

    return draft;
  }

  /**
   * Get latest draft for a user
   */
  async getDraft(worksheetId: string, userId: string) {
    return await this.prisma.worksheetDraft.findUnique({
      where: {
        worksheetId_userId: {
          worksheetId,
          userId,
        },
      },
    });
  }

  /**
   * Save draft manually
   */
  async saveDraft(worksheetId: string, userId: string, content: any) {
    const draft = await this.prisma.worksheetDraft.upsert({
      where: {
        worksheetId_userId: {
          worksheetId,
          userId,
        },
      },
      update: {
        content,
        lastSaved: new Date(),
        autoSaved: false,
      },
      create: {
        worksheetId,
        userId,
        content,
        autoSaved: false,
      },
    });

    this.logger.log(`Manually saved draft for worksheet ${worksheetId} by user ${userId}`);

    return draft;
  }

  // ===== COMMENTS & ANNOTATIONS =====

  /**
   * Add a comment to a worksheet
   */
  async addComment(data: CommentData) {
    const { worksheetId, userId, content, position, parentId } = data;

    const comment = await this.prisma.worksheetComment.create({
      data: {
        worksheetId,
        userId,
        content,
        position,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              }
            }
          }
        }
      }
    });

    // Notify collaborators
    await this.notifyCollaborators(
      worksheetId,
      userId,
      ChangeNotificationType.COMMENT_ADDED,
      { commentId: comment.id, content, position }
    );

    // Emit real-time comment event
    this.eventEmitter.emit('worksheet.comment.added', {
      worksheetId,
      comment,
      userId,
      timestamp: new Date(),
    });

    this.logger.log(`Added comment to worksheet ${worksheetId} by user ${userId}`);

    return comment;
  }

  /**
   * Get comments for a worksheet
   */
  async getComments(worksheetId: string, includeResolved = false) {
    return await this.prisma.worksheetComment.findMany({
      where: {
        worksheetId,
        parentId: null, // Only top-level comments
        ...(includeResolved ? {} : { resolved: false }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' },
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve a comment
   */
  async resolveComment(commentId: string, userId: string) {
    const comment = await this.prisma.worksheetComment.update({
      where: { id: commentId },
      data: { resolved: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      }
    });

    // Emit comment resolved event
    this.eventEmitter.emit('worksheet.comment.resolved', {
      worksheetId: comment.worksheetId,
      commentId,
      resolvedBy: userId,
      timestamp: new Date(),
    });

    return comment;
  }

  // ===== TEMPLATES =====

  /**
   * Create a worksheet template
   */
  async createTemplate(
    name: string,
    description: string,
    content: any,
    category: string,
    tags: string[],
    userId: string,
    isPublic = false
  ) {
    const template = await this.prisma.worksheetTemplate.create({
      data: {
        name,
        description,
        content,
        category,
        tags,
        isPublic,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      }
    });

    this.logger.log(`Created worksheet template ${template.id} by user ${userId}`);

    return template;
  }

  /**
   * Get available templates
   */
  async getTemplates(
    category?: string,
    isPublic?: boolean,
    userId?: string,
    searchQuery?: string
  ) {
    const where: any = {};

    if (category) where.category = category;
    if (isPublic !== undefined) {
      if (isPublic) {
        where.isPublic = true;
      } else if (userId) {
        where.OR = [
          { isPublic: true },
          { createdBy: userId }
        ];
      }
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } }
      ];
    }

    return await this.prisma.worksheetTemplate.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
    });
  }

  /**
   * Use a template to create a new worksheet
   */
  async createFromTemplate(
    templateId: string,
    worksheetData: {
      title: string;
      description?: string;
      dueDate?: Date;
      clientId: string;
      therapistId: string;
    }
  ) {
    const template = await this.prisma.worksheetTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    // Update template usage count
    await this.prisma.worksheetTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    // Create worksheet with template content
    const worksheet = await this.prisma.worksheet.create({
      data: {
        ...worksheetData,
        status: 'assigned',
        isCompleted: false,
      },
    });

    // Create initial version with template content
    await this.createVersion(
      worksheet.id,
      template.content,
      worksheetData.therapistId,
      { type: 'template', templateId: template.id }
    );

    this.logger.log(`Created worksheet ${worksheet.id} from template ${templateId}`);

    return worksheet;
  }

  // ===== PRIVATE HELPER METHODS =====

  private async notifyCollaborators(
    worksheetId: string,
    excludeUserId: string,
    changeType: ChangeNotificationType,
    changeData: any
  ) {
    // Get active collaborators (excluding the user who made the change)
    const collaborators = await this.prisma.worksheetCollab.findMany({
      where: {
        worksheetId,
        isActive: true,
        userId: { not: excludeUserId },
      },
      select: { userId: true },
    });

    // Create notifications for each collaborator
    if (collaborators.length > 0) {
      await this.prisma.worksheetChangeNotification.createMany({
        data: collaborators.map(collab => ({
          worksheetId,
          userId: collab.userId,
          changeType,
          changeData,
        })),
      });
    }
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string) {
    return await this.prisma.worksheetChangeNotification.findMany({
      where: {
        userId,
        read: false,
      },
      include: {
        worksheet: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsRead(notificationIds: string[]) {
    await this.prisma.worksheetChangeNotification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        read: true,
      },
    });
  }
}