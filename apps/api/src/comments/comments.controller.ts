import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/core/guards/jwt-auth.guard';
import {
  CommunityAccessGuard,
  RequireRoomAccess,
} from 'src/auth/core/guards/community-access.guard';
import { CurrentUserId } from 'src/auth/core/decorators/current-user-id.decorator';
import {
  SupabaseStorageService,
  FileUploadResult,
} from 'src/common/services/supabase-storage.service';
import { CommentsService } from './comments.service';
import { Comment } from '@prisma/client';
import type { CommentCreateInputDto, CommentUpdateInputDto } from './types';

@Controller('comments')
@UseGuards(JwtAuthGuard, CommunityAccessGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()
  async findAll(
    @CurrentUserId() id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Comment[]> {
    try {
      return await this.commentsService.findAll(id, limit, offset);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @RequireRoomAccess()
  async findOne(@Param('id') id: string): Promise<Comment> {
    try {
      const comment = await this.commentsService.findOne(id);
      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
      return comment;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('post/:postId')
  @RequireRoomAccess()
  async findByPostId(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
  ): Promise<Comment[]> {
    try {
      return await this.commentsService.findByPostId(postId, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments for post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @RequireRoomAccess()
  @UseInterceptors(FilesInterceptor('files', 5)) // Support up to 5 files
  async create(
    @CurrentUserId() userId: string,
    @Body() commentData: CommentCreateInputDto,
    @UploadedFiles() files: Express.Multer.File[] = [], // Optional files
  ): Promise<Comment> {
    try {
      // Validate and upload files if provided
      const fileResults: FileUploadResult[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const validation = this.supabaseStorageService.validateFile(file);
          if (!validation.isValid) {
            throw new HttpException(
              `File validation failed: ${validation.error}`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        // Upload files to Supabase
        const uploadResults = await this.supabaseStorageService.uploadFiles(
          files,
          SupabaseStorageService.getSupportedBuckets().POST_ATTACHMENTS,
        );
        fileResults.push(...uploadResults);
      }

      return await this.commentsService.create(
        commentData,
        userId,
        fileResults.map((f) => f.url),
        fileResults.map((f) => f.filename),
        files.map((f) => f.size),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @RequireRoomAccess()
  async update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() commentData: CommentUpdateInputDto,
  ): Promise<Comment> {
    try {
      return await this.commentsService.update(id, commentData, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to update comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @RequireRoomAccess()
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<Comment> {
    try {
      return await this.commentsService.remove(id, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Heart functionality
  @Post(':id/heart')
  @RequireRoomAccess()
  async heartComment(
    @CurrentUserId() userId: string,
    @Param('id') commentId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      return await this.commentsService.heartComment(commentId, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to heart comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/hearted')
  async isCommentHearted(
    @CurrentUserId() userId: string,
    @Param('id') commentId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const hearted = await this.commentsService.isCommentHeartedByUser(
        commentId,
        userId,
      );
      return { hearted };
    } catch (error) {
      throw new HttpException(
        `Failed to check comment heart status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/report')
  @RequireRoomAccess()
  async reportComment(
    @CurrentUserId() userId: string,
    @Param('id') commentId: string,
    @Body() reportData: { reason: string; content?: string },
  ): Promise<{ success: boolean; reportId: string }> {
    try {
      const reportId = await this.commentsService.reportComment(
        commentId,
        userId,
        reportData.reason,
        reportData.content,
      );
      return { success: true, reportId };
    } catch (error) {
      throw new HttpException(
        `Failed to report comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
