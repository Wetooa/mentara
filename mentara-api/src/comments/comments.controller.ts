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
import { CommentsService } from './comments.service';
import { Comment } from '@prisma/client';
import { CommentCreateInputDto, CommentUpdateInputDto } from 'mentara-commons';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth('JWT-auth')
@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get()


  @ApiOperation({ 


    summary: 'Retrieve find all',


    description: 'Retrieve find all' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find one',


    description: 'Retrieve find one' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Retrieve find by post id',


    description: 'Retrieve find by post id' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Create create',


    description: 'Create create' 


  })


  @ApiResponse({ 


    status: 201, 


    description: 'Created successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Update update',


    description: 'Update update' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Updated successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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


  @ApiOperation({ 


    summary: 'Delete remove',


    description: 'Delete remove' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Deleted successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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

  @ApiOperation({ 

    summary: 'Create heart comment',

    description: 'Create heart comment' 

  })

  @ApiResponse({ 

    status: 201, 

    description: 'Created successfully' 

  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })

  
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


  @ApiOperation({ 


    summary: 'Retrieve is comment hearted',


    description: 'Retrieve is comment hearted' 


  })


  @ApiResponse({ 


    status: 200, 


    description: 'Retrieved successfully' 


  })


  @ApiResponse({ status: 401, description: 'Unauthorized' })


  
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
