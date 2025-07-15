import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseUUIDPipe,
  ParseEnumPipe,
  ValidationPipe,
  UseGuards,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RedditFeaturesService } from '../services/reddit-features.service';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { VoteType, AwardType, ContentType, ReportReason } from '@prisma/client';
import { 
  IsNotEmpty, 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  MaxLength 
} from 'class-validator';

// DTOs
class VoteContentDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsEnum(VoteType)
  voteType: VoteType;
}

class GiveAwardDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsEnum(AwardType)
  awardType: AwardType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;
}

class CreateNestedCommentDto {
  @IsNotEmpty()
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content: string;
}

class ReportContentDto {
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

@ApiTags('Reddit Features')
@ApiBearerAuth()
@Controller('reddit')
@UseGuards(JwtAuthGuard)
export class RedditFeaturesController {
  private readonly logger = new Logger(RedditFeaturesController.name);

  constructor(private readonly redditFeaturesService: RedditFeaturesService) {}

  // ===== VOTING ENDPOINTS =====

  @Post('vote')
  @ApiOperation({ 
    summary: 'Vote on content',
    description: 'Upvote or downvote a post or comment. Updates user karma.' 
  })
  @ApiResponse({ status: 201, description: 'Vote successfully recorded' })
  @ApiResponse({ status: 400, description: 'Invalid vote data' })
  async vote(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: VoteContentDto
  ) {
    const voteCount = await this.redditFeaturesService.vote({
      ...dto,
      userId
    });

    this.logger.log(`User ${userId} voted ${dto.voteType} on ${dto.contentType} ${dto.contentId}`);
    
    return {
      success: true,
      data: voteCount,
      message: 'Vote recorded successfully'
    };
  }

  @Delete('vote/:contentType/:contentId')
  @ApiOperation({ 
    summary: 'Remove vote from content',
    description: 'Remove an existing vote from a post or comment' 
  })
  @ApiParam({ name: 'contentType', enum: ContentType })
  @ApiParam({ name: 'contentId', description: 'ID of the content to remove vote from' })
  async removeVote(
    @CurrentUserId() userId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('contentType', new ParseEnumPipe(ContentType)) contentType: ContentType
  ) {
    const voteCount = await this.redditFeaturesService.removeVote(contentId, contentType, userId);
    
    return {
      success: true,
      data: voteCount,
      message: 'Vote removed successfully'
    };
  }

  @Get('vote/:contentType/:contentId')
  @ApiOperation({ 
    summary: 'Get vote counts for content',
    description: 'Get upvote/downvote counts and score for a post or comment' 
  })
  @ApiParam({ name: 'contentType', enum: ContentType })
  @ApiParam({ name: 'contentId', description: 'ID of the content to get votes for' })
  async getVoteCount(
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('contentType', new ParseEnumPipe(ContentType)) contentType: ContentType
  ) {
    const voteCount = await this.redditFeaturesService.getVoteCount(contentId, contentType);
    
    return {
      success: true,
      data: voteCount
    };
  }

  // ===== AWARDS ENDPOINTS =====

  @Post('award')
  @ApiOperation({ 
    summary: 'Give an award to content',
    description: 'Give an award to a post or comment. Premium awards require sufficient karma.' 
  })
  @ApiResponse({ status: 201, description: 'Award given successfully' })
  @ApiResponse({ status:400, description: 'Insufficient karma for premium award' })
  async giveAward(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: GiveAwardDto
  ) {
    await this.redditFeaturesService.giveAward({
      ...dto,
      userId
    });

    this.logger.log(`User ${userId} gave ${dto.awardType} award to ${dto.contentType} ${dto.contentId}`);
    
    return {
      success: true,
      message: 'Award given successfully'
    };
  }

  // ===== NESTED COMMENTS ENDPOINTS =====

  @Post('comments')
  @ApiOperation({ 
    summary: 'Create a nested comment',
    description: 'Create a comment with optional parent for nesting. Max depth is 10 levels.' 
  })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status:400, description: 'Maximum nesting depth exceeded' })
  async createNestedComment(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: CreateNestedCommentDto
  ) {
    const comment = await this.redditFeaturesService.createNestedComment({
      ...dto,
      userId
    });

    this.logger.log(`User ${userId} created nested comment on post ${dto.postId}`);
    
    return {
      success: true,
      data: comment,
      message: 'Comment created successfully'
    };
  }

  @Get('comments/post/:postId')
  @ApiOperation({ 
    summary: 'Get nested comments for a post',
    description: 'Get all comments for a post with nested structure and sorting options' 
  })
  @ApiParam({ name: 'postId', description: 'ID of the post to get comments for' })
  @ApiQuery({ name: 'sortBy', enum: ['hot', 'top', 'new', 'controversial'], required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async getNestedComments(
    @CurrentUserId() userId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('sortBy') sortBy: 'hot' | 'top' | 'new' | 'controversial' = 'hot',
    @Query('limit') limit: number = 50
  ) {
    const comments = await this.redditFeaturesService.getNestedComments(
      postId,
      userId,
      sortBy,
      Number(limit)
    );
    
    return {
      success: true,
      data: comments,
      metadata: {
        postId,
        sortBy,
        limit: Number(limit),
        count: comments.length
      }
    };
  }

  // ===== CONTENT REPORTING ENDPOINTS =====

  @Post('report')
  @ApiOperation({ 
    summary: 'Report content for moderation',
    description: 'Report a post or comment for violating community guidelines' 
  })
  @ApiResponse({ status: 201, description: 'Content reported successfully' })
  @ApiResponse({ status: 400, description: 'Content already reported by this user' })
  async reportContent(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) dto: ReportContentDto
  ) {
    await this.redditFeaturesService.reportContent({
      ...dto,
      reporterId: userId
    });

    this.logger.log(`User ${userId} reported ${dto.contentType} ${dto.contentId} for ${dto.reason}`);
    
    return {
      success: true,
      message: 'Content reported successfully. Moderators will review it shortly.'
    };
  }

  // ===== SAVED CONTENT ENDPOINTS =====

  @Post('save/:contentType/:contentId')
  @ApiOperation({ 
    summary: 'Save/bookmark content',
    description: 'Save a post or comment to your bookmarks' 
  })
  @ApiParam({ name: 'contentType', enum: ContentType })
  @ApiParam({ name: 'contentId', description: 'ID of the content to save' })
  async saveContent(
    @CurrentUserId() userId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('contentType', new ParseEnumPipe(ContentType)) contentType: ContentType
  ) {
    await this.redditFeaturesService.saveContent(contentId, contentType, userId);
    
    return {
      success: true,
      message: 'Content saved successfully'
    };
  }

  @Delete('save/:contentType/:contentId')
  @ApiOperation({ 
    summary: 'Unsave/unbookmark content',
    description: 'Remove a post or comment from your bookmarks' 
  })
  @ApiParam({ name: 'contentType', enum: ContentType })
  @ApiParam({ name: 'contentId', description: 'ID of the content to unsave' })
  async unsaveContent(
    @CurrentUserId() userId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('contentType', new ParseEnumPipe(ContentType)) contentType: ContentType
  ) {
    await this.redditFeaturesService.unsaveContent(contentId, contentType, userId);
    
    return {
      success: true,
      message: 'Content unsaved successfully'
    };
  }

  // ===== ENHANCED POST DATA ENDPOINTS =====

  @Get('posts/:postId/enhanced')
  @ApiOperation({ 
    summary: 'Get enhanced post data',
    description: 'Get post with vote counts, awards, user interactions, and permissions' 
  })
  @ApiParam({ name: 'postId', description: 'ID of the post to get enhanced data for' })
  async getEnhancedPost(
    @CurrentUserId() userId: string,
    @Param('postId', ParseUUIDPipe) postId: string
  ) {
    const enhancedPost = await this.redditFeaturesService.getEnhancedPost(postId, userId);
    
    return {
      success: true,
      data: enhancedPost
    };
  }
}