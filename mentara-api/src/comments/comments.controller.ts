import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CommentsService } from './comments.service';
import { Comment } from '@prisma/client';
import { CommentCreateInputDto, CommentUpdateInputDto } from 'schema/comment';

@Controller('comments')
@UseGuards(ClerkAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(@CurrentUserId() id: string): Promise<Comment[]> {
    try {
      return await this.commentsService.findAll(id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
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
  async create(
    @CurrentUserId() userId: string,
    @Body() commentData: CommentCreateInputDto,
  ): Promise<Comment> {
    try {
      return await this.commentsService.create(commentData, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
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
}
