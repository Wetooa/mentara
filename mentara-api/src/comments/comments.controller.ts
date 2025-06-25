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
import { Comment, Prisma } from '@prisma/client';
import { CreateCommentDto, UpdateCommentDto } from 'src/types';

@Controller('comments')
@UseGuards(ClerkAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  async findUserByClerkId(clerkId: string) {
    return this.commentsService.findUserByClerkId(clerkId);
  }

  @Get()
  async findAll(@CurrentUserId() clerkId: string): Promise<Comment[]> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      return await this.commentsService.findAll(user?.id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() clerkId: string,
  ): Promise<Comment> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      const comment = await this.commentsService.findOne(id, user?.id);
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
    @CurrentUserId() clerkId: string,
  ): Promise<Comment[]> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      return await this.commentsService.findByPostId(postId, user?.id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments for post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() commentData: CreateCommentDto,
  ): Promise<Comment> {
    try {
      // First get the user ID from clerkId
      const user = await this.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const createData: Prisma.CommentCreateInput = {
        content: commentData.content,
        user: { connect: { id: user.id } },
        post: { connect: { id: commentData.postId } },
        ...(commentData.parentId && {
          parent: { connect: { id: commentData.parentId } },
        }),
      };
      return await this.commentsService.create(createData);
    } catch (error) {
      throw new HttpException(
        `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() commentData: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.commentsService.update(id, commentData, user.id);
    } catch (error) {
      throw new HttpException(
        `Failed to update comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<Comment> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.commentsService.remove(id, user.id);
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
    @CurrentUserId() clerkId: string,
    @Param('id') commentId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.commentsService.heartComment(commentId, user.id);
    } catch (error) {
      throw new HttpException(
        `Failed to heart comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/hearted')
  async isCommentHearted(
    @CurrentUserId() clerkId: string,
    @Param('id') commentId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const user = await this.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const hearted = await this.commentsService.isCommentHeartedByUser(
        commentId,
        user.id,
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
