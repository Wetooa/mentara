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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity, Prisma } from '@prisma/client';

@Controller('posts')
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
  async create(@Body() postData: Prisma.PostCreateInput): Promise<PostEntity> {
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
  async remove(@Param('id') id: string): Promise<PostEntity> {
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
