import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EnhancedWorksheetsService } from '../services/enhanced-worksheets.service';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsBoolean,
  IsArray,
  IsEnum,
  MaxLength 
} from 'class-validator';
import { OperationType } from '@prisma/client';

// DTOs
class CreateVersionDto {
  @IsNotEmpty()
  content: any;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  changeLog?: string;
}

class ApplyOperationDto {
  @IsNotEmpty()
  @IsString()
  operationId: string;

  @IsEnum(OperationType)
  type: OperationType;

  @IsNotEmpty()
  position: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  length?: number;
}

class AutoSaveDto {
  @IsNotEmpty()
  content: any;
}

class AddCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  position?: any;

  @IsOptional()
  @IsString()
  parentId?: string;
}

class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty()
  content: any;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

class CreateFromTemplateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  dueDate?: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  therapistId: string;
}

@ApiTags('Enhanced Worksheets')
@ApiBearerAuth()
@Controller('worksheets/enhanced')
@UseGuards(JwtAuthGuard)
export class EnhancedWorksheetsController {
  private readonly logger = new Logger(EnhancedWorksheetsController.name);

  constructor(private readonly enhancedWorksheetsService: EnhancedWorksheetsService) {}

  // ===== VERSION CONTROL =====

  @Post(':id/versions')
  @ApiOperation({ 
    summary: 'Create a new version of a worksheet',
    description: 'Create a snapshot version of the current worksheet state' 
  })
  @ApiResponse({ status: 201, description: 'Version created successfully' })
  async createVersion(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: CreateVersionDto
  ) {
    const version = await this.enhancedWorksheetsService.createVersion(
      worksheetId,
      dto.content,
      userId,
      dto.changeLog
    );

    return {
      success: true,
      data: version,
      message: 'Version created successfully'
    };
  }

  @Get(':id/versions')
  @ApiOperation({ 
    summary: 'Get version history for a worksheet',
    description: 'Retrieve all versions of a worksheet with metadata' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Maximum number of versions to return' })
  async getVersionHistory(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @Query('limit') limit?: number
  ) {
    const versions = await this.enhancedWorksheetsService.getVersionHistory(
      worksheetId,
      limit ? Number(limit) : 20
    );

    return {
      success: true,
      data: versions,
      metadata: {
        worksheetId,
        totalVersions: versions.length
      }
    };
  }

  @Post(':id/versions/:versionId/restore')
  @ApiOperation({ 
    summary: 'Restore a specific version',
    description: 'Create a new version with content from a previous version' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiParam({ name: 'versionId', description: 'Version ID to restore' })
  async restoreVersion(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUserId() userId: string
  ) {
    const restoredVersion = await this.enhancedWorksheetsService.restoreVersion(
      worksheetId,
      versionId,
      userId
    );

    return {
      success: true,
      data: restoredVersion,
      message: 'Version restored successfully'
    };
  }

  // ===== COLLABORATION =====

  @Get(':id/collaborators')
  @ApiOperation({ 
    summary: 'Get active collaborators for a worksheet',
    description: 'Retrieve list of users currently collaborating on the worksheet' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  async getActiveCollaborators(
    @Param('id', ParseUUIDPipe) worksheetId: string
  ) {
    const collaborators = await this.enhancedWorksheetsService.getActiveCollaborators(worksheetId);

    return {
      success: true,
      data: collaborators,
      metadata: {
        worksheetId,
        activeCount: collaborators.length
      }
    };
  }

  @Post(':id/versions/:versionId/operations')
  @ApiOperation({ 
    summary: 'Apply an operation to a worksheet version',
    description: 'Apply a collaborative editing operation using operational transformation' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiParam({ name: 'versionId', description: 'Version ID to apply operation to' })
  async applyOperation(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: ApplyOperationDto
  ) {
    const result = await this.enhancedWorksheetsService.applyOperation(
      worksheetId,
      versionId,
      {
        id: dto.operationId,
        type: dto.type,
        position: dto.position,
        content: dto.content,
        length: dto.length,
        userId,
        timestamp: new Date()
      }
    );

    return {
      success: true,
      data: result,
      message: 'Operation applied successfully'
    };
  }

  // ===== AUTO-SAVE & DRAFTS =====

  @Post(':id/auto-save')
  @ApiOperation({ 
    summary: 'Auto-save worksheet content',
    description: 'Automatically save current worksheet state as a draft' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  async autoSave(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: AutoSaveDto
  ) {
    const draft = await this.enhancedWorksheetsService.autoSave({
      worksheetId,
      userId,
      content: dto.content
    });

    return {
      success: true,
      data: draft,
      message: 'Content auto-saved successfully'
    };
  }

  @Get(':id/draft')
  @ApiOperation({ 
    summary: 'Get user\'s draft for a worksheet',
    description: 'Retrieve the latest auto-saved or manually saved draft' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  async getDraft(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @CurrentUserId() userId: string
  ) {
    const draft = await this.enhancedWorksheetsService.getDraft(worksheetId, userId);

    return {
      success: true,
      data: draft
    };
  }

  @Post(':id/save-draft')
  @ApiOperation({ 
    summary: 'Manually save worksheet draft',
    description: 'Save current worksheet state as a manual draft' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  async saveDraft(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: AutoSaveDto
  ) {
    const draft = await this.enhancedWorksheetsService.saveDraft(
      worksheetId,
      userId,
      dto.content
    );

    return {
      success: true,
      data: draft,
      message: 'Draft saved successfully'
    };
  }

  // ===== COMMENTS & ANNOTATIONS =====

  @Post(':id/comments')
  @ApiOperation({ 
    summary: 'Add a comment to a worksheet',
    description: 'Add a comment or annotation at a specific position in the worksheet' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  async addComment(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: AddCommentDto
  ) {
    const comment = await this.enhancedWorksheetsService.addComment({
      worksheetId,
      userId,
      content: dto.content,
      position: dto.position,
      parentId: dto.parentId
    });

    return {
      success: true,
      data: comment,
      message: 'Comment added successfully'
    };
  }

  @Get(':id/comments')
  @ApiOperation({ 
    summary: 'Get comments for a worksheet',
    description: 'Retrieve all comments and annotations for the worksheet' 
  })
  @ApiParam({ name: 'id', description: 'Worksheet ID' })
  @ApiQuery({ name: 'includeResolved', type: 'boolean', required: false, description: 'Include resolved comments' })
  async getComments(
    @Param('id', ParseUUIDPipe) worksheetId: string,
    @Query('includeResolved') includeResolved?: boolean
  ) {
    const comments = await this.enhancedWorksheetsService.getComments(
      worksheetId,
      includeResolved === true
    );

    return {
      success: true,
      data: comments,
      metadata: {
        worksheetId,
        commentCount: comments.length
      }
    };
  }

  @Put('comments/:commentId/resolve')
  @ApiOperation({ 
    summary: 'Resolve a comment',
    description: 'Mark a comment as resolved' 
  })
  @ApiParam({ name: 'commentId', description: 'Comment ID to resolve' })
  async resolveComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUserId() userId: string
  ) {
    const comment = await this.enhancedWorksheetsService.resolveComment(commentId, userId);

    return {
      success: true,
      data: comment,
      message: 'Comment resolved successfully'
    };
  }

  // ===== TEMPLATES =====

  @Post('templates')
  @ApiOperation({ 
    summary: 'Create a worksheet template',
    description: 'Create a reusable template from worksheet content' 
  })
  async createTemplate(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: CreateTemplateDto
  ) {
    const template = await this.enhancedWorksheetsService.createTemplate(
      dto.name,
      dto.description || '',
      dto.content,
      dto.category,
      dto.tags,
      userId,
      dto.isPublic
    );

    return {
      success: true,
      data: template,
      message: 'Template created successfully'
    };
  }

  @Get('templates')
  @ApiOperation({ 
    summary: 'Get available worksheet templates',
    description: 'Retrieve public templates and user\'s private templates' 
  })
  @ApiQuery({ name: 'category', type: 'string', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'public', type: 'boolean', required: false, description: 'Filter by public/private' })
  @ApiQuery({ name: 'search', type: 'string', required: false, description: 'Search query' })
  async getTemplates(
    @CurrentUserId() userId: string,
    @Query('category') category?: string,
    @Query('public') isPublic?: boolean,
    @Query('search') searchQuery?: string
  ) {
    const templates = await this.enhancedWorksheetsService.getTemplates(
      category,
      isPublic,
      userId,
      searchQuery
    );

    return {
      success: true,
      data: templates,
      metadata: {
        totalTemplates: templates.length,
        filters: { category, isPublic, searchQuery }
      }
    };
  }

  @Post('templates/:templateId/create-worksheet')
  @ApiOperation({ 
    summary: 'Create worksheet from template',
    description: 'Create a new worksheet using a template as the starting point' 
  })
  @ApiParam({ name: 'templateId', description: 'Template ID to use' })
  async createFromTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body(ValidationPipe) dto: CreateFromTemplateDto
  ) {
    const worksheet = await this.enhancedWorksheetsService.createFromTemplate(
      templateId,
      {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        clientId: dto.clientId,
        therapistId: dto.therapistId
      }
    );

    return {
      success: true,
      data: worksheet,
      message: 'Worksheet created from template successfully'
    };
  }

  // ===== NOTIFICATIONS =====

  @Get('notifications/unread')
  @ApiOperation({ 
    summary: 'Get unread worksheet notifications',
    description: 'Retrieve all unread notifications for the current user' 
  })
  async getUnreadNotifications(
    @CurrentUserId() userId: string
  ) {
    const notifications = await this.enhancedWorksheetsService.getUnreadNotifications(userId);

    return {
      success: true,
      data: notifications,
      metadata: {
        unreadCount: notifications.length
      }
    };
  }

  @Post('notifications/mark-read')
  @ApiOperation({ 
    summary: 'Mark notifications as read',
    description: 'Mark specified notifications as read' 
  })
  async markNotificationsRead(
    @Body() body: { notificationIds: string[] }
  ) {
    await this.enhancedWorksheetsService.markNotificationsRead(body.notificationIds);

    return {
      success: true,
      message: 'Notifications marked as read'
    };
  }
}