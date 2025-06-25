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
import { PostsService } from './posts.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { CreatePostDto, UpdatePostDto } from 'src/types';

@Controller('posts')
@UseGuards(ClerkAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@CurrentUserId() clerkId: string): Promise<PostEntity[]> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      return await this.postsService.findAll(user?.id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUserId() clerkId: string,
  ): Promise<PostEntity> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      const post = await this.postsService.findOne(id, user?.id);
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() postData: CreatePostDto,
  ): Promise<PostEntity> {
    try {
      // First get the user ID from clerkId
      const user = await this.postsService.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const createData: Prisma.PostCreateInput = {
        title: postData.title,
        content: postData.content,
        user: { connect: { id: user.id } },
        community: {
          connect: { id: postData.communityId },
        },
      };
      return await this.postsService.create(createData);
    } catch (error) {
      throw new HttpException(
        `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() postData: UpdatePostDto,
  ): Promise<PostEntity> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.postsService.update(id, postData, user.id);
    } catch (error) {
      throw new HttpException(
        `Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
  ): Promise<PostEntity> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.postsService.remove(id, user.id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<PostEntity[]> {
    try {
      return await this.postsService.findByUserId(userId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch posts for user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('community/:communityId')
  async findByCommunityId(
    @Param('communityId') communityId: string,
    @CurrentUserId() clerkId: string,
  ): Promise<PostEntity[]> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      return await this.postsService.findByCommunityId(communityId, user?.id);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch posts for community: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Heart functionality
  @Post(':id/heart')
  async heartPost(
    @CurrentUserId() clerkId: string,
    @Param('id') postId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return await this.postsService.heartPost(postId, user.id);
    } catch (error) {
      throw new HttpException(
        `Failed to heart post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/hearted')
  async isPostHearted(
    @CurrentUserId() clerkId: string,
    @Param('id') postId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const user = await this.postsService.findUserByClerkId(clerkId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const hearted = await this.postsService.isPostHeartedByUser(
        postId,
        user.id,
      );
      return { hearted };
    } catch (error) {
      throw new HttpException(
        `Failed to check post heart status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
