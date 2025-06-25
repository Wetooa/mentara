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

@Controller('posts')
@UseGuards(ClerkAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostEntity[]> {
    try {
      return await this.postsService.findAll();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch posts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    try {
      const post = await this.postsService.findOne(id);
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch post: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @CurrentUserId() clerkId: string,
    @Body() postData: Prisma.PostCreateInput,
  ): Promise<PostEntity> {
    try {
      return await this.postsService.create(postData);
    } catch (error) {
      throw new HttpException(
        `Failed to create post: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @CurrentUserId() clerkId: string,
    @Param('id') id: string,
    @Body() postData: Prisma.PostUpdateInput,
  ): Promise<PostEntity> {
    try {
      return await this.postsService.update(id, postData);
    } catch (error) {
      throw new HttpException(
        `Failed to update post: ${error.message}`,
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
      return await this.postsService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete post: ${error.message}`,
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
        `Failed to fetch posts for user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('community/:communityId')
  async findByCommunityId(
    @Param('communityId') communityId: string,
  ): Promise<PostEntity[]> {
    try {
      return await this.postsService.findByCommunityId(communityId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch posts for community: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
