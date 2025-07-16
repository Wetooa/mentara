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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import {
  SupabaseStorageService,
  FileUploadResult,
} from 'src/common/services/supabase-storage.service';
import { PostsService } from './posts.service';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { PostCreateInputDto, PostUpdateInputDto } from 'mentara-commons';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()
  async findAll(@CurrentUserId() id: string): Promise<PostEntity[]> {
    try {
      const user = await this.postsService.findUserById(id);

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
    @Param('id') postId: string,
    @CurrentUserId() userId: string,
  ): Promise<PostEntity> {
    try {
      const post = await this.postsService.findOne(postId, userId);

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
  @UseInterceptors(FilesInterceptor('files', 10)) // Support up to 10 files
  async create(
    @CurrentUserId() id: string,
    @Body() postData: PostCreateInputDto,
    @UploadedFiles() files: Express.Multer.File[] = [], // Optional files
  ): Promise<PostEntity> {
    try {
      const user = await this.postsService.findUserById(id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

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

      const createData: Prisma.PostCreateInput = {
        title: postData.title,
        content: postData.content,
        user: { connect: { id: user.id } },
        room: { connect: { id: postData.roomId } },
        attachmentUrls: fileResults.map((f) => f.url),
        attachmentNames: fileResults.map((f) => f.filename),
        attachmentSizes: files.map((f) => f.size),
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
    @CurrentUserId() userId: string,
    @Param('id') postId: string,
    @Body() postData: PostUpdateInputDto,
  ): Promise<PostEntity> {
    try {
      return await this.postsService.update(postId, postData, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') postId: string,
  ): Promise<PostEntity> {
    try {
      return await this.postsService.remove(postId, userId);
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

  @Get('room/:roomId')
  async findByRoomId(
    @Param('roomId') roomId: string,
    @CurrentUserId() userId: string,
  ): Promise<PostEntity[]> {
    try {
      return await this.postsService.findByRoomId(roomId, userId);
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
    @CurrentUserId() userId: string,
    @Param('id') postId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      return await this.postsService.heartPost(postId, userId);
    } catch (error) {
      throw new HttpException(
        `Failed to heart post: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/hearted')
  async isPostHearted(
    @CurrentUserId() userId: string,
    @Param('id') postId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const hearted = await this.postsService.isPostHeartedByUser(
        postId,
        userId,
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
