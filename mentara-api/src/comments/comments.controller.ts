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

@Controller('comments')
@UseGuards(ClerkAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async findAll(): Promise<Comment[]> {
    try {
      return await this.commentsService.findAll();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch comments: ${error.message}`,
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
        `Failed to fetch comment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() commentData: Prisma.CommentCreateInput,
  ): Promise<Comment> {
    try {
      return await this.commentsService.create(commentData);
    } catch (error) {
      throw new HttpException(
        `Failed to create comment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() commentData: Prisma.CommentUpdateInput,
  ): Promise<Comment> {
    try {
      return await this.commentsService.update(id, commentData);
    } catch (error) {
      throw new HttpException(
        `Failed to update comment: ${error.message}`,
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
      return await this.commentsService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete comment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
