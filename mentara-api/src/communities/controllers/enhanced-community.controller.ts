import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../../auth/guards/role-based-access.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { EnhancedCommunityService } from '../services/enhanced-community.service';
import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class CommunitySearchDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Transform(({ value }) => value?.split(',') || [])
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minMembers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMembers?: number;

  @IsOptional()
  @IsIn(['relevance', 'members', 'activity', 'newest', 'alphabetical'])
  sortBy?: 'relevance' | 'members' | 'activity' | 'newest' | 'alphabetical';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasDescription?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasImage?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  membershipRequired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

class TrendingCommunitiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['week', 'month'])
  timeframe?: 'week' | 'month' = 'week';
}

class SimilarCommunitiesDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  excludeJoined?: boolean = true;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  maxResults?: number = 5;
}

@ApiTags('Enhanced Communities')
@ApiTags('enhanced-community')
@ApiBearerAuth('JWT-auth')
@Controller('communities/enhanced')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth()
export class EnhancedCommunityController {
  constructor(
    private readonly enhancedCommunityService: EnhancedCommunityService,
  ) {}

  @Get('search')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Advanced community search',
    description:
      'Search communities with advanced filtering, sorting, and faceting capabilities',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    type: 'string',
    description: 'Search text',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: 'string',
    description: 'Comma-separated tags',
  })
  @ApiQuery({
    name: 'minMembers',
    required: false,
    type: 'number',
    description: 'Minimum member count',
  })
  @ApiQuery({
    name: 'maxMembers',
    required: false,
    type: 'number',
    description: 'Maximum member count',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['relevance', 'members', 'activity', 'newest', 'alphabetical'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'hasDescription', required: false, type: 'boolean' })
  @ApiQuery({ name: 'hasImage', required: false, type: 'boolean' })
  @ApiQuery({ name: 'membershipRequired', required: false, type: 'boolean' })
  @ApiQuery({ name: 'page', required: false, type: 'number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Communities search results with facets',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            communities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  memberCount: { type: 'number' },
                  recentActivity: { type: 'object' },
                  membershipStatus: {
                    type: 'string',
                    enum: ['member', 'pending', 'none'],
                  },
                  compatibility: { type: 'object' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            facets: { type: 'object' },
          },
        },
      },
    },
  })
  async searchCommunities(
    @Query() searchDto: CommunitySearchDto,
    @GetUser() user: any,
  ) {
    try {
      const result = await this.enhancedCommunityService.searchCommunities(
        {
          query: searchDto.query,
          tags: searchDto.tags,
          minMembers: searchDto.minMembers,
          maxMembers: searchDto.maxMembers,
          sortBy: searchDto.sortBy,
          sortOrder: searchDto.sortOrder,
          hasDescription: searchDto.hasDescription,
          hasImage: searchDto.hasImage,
          membershipRequired: searchDto.membershipRequired,
        },
        user.id,
        searchDto.page,
        searchDto.limit,
      );

      return {
        success: true,
        data: result,
        message: 'Community search completed successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':communityId/details')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get enhanced community details',
    description:
      'Retrieve comprehensive community information including stats, recent posts, and top contributors',
  })
  @ApiParam({
    name: 'communityId',
    type: 'string',
    format: 'uuid',
    description: 'Community ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Enhanced community details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            memberCount: { type: 'number' },
            stats: {
              type: 'object',
              properties: {
                totalPosts: { type: 'number' },
                totalComments: { type: 'number' },
                activeMembers: { type: 'number' },
                recentActivity: { type: 'object' },
              },
            },
            recentPosts: { type: 'array' },
            topContributors: { type: 'array' },
            moderators: { type: 'array' },
            membershipStatus: { type: 'string' },
            userPermissions: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Community not found',
  })
  async getCommunityDetails(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @GetUser() user: any,
  ) {
    try {
      const details = await this.enhancedCommunityService.getCommunityDetails(
        communityId,
        user.id,
      );

      return {
        success: true,
        data: details,
        message: 'Community details retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('trending')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get trending communities',
    description:
      'Retrieve communities that are trending based on growth rate and activity',
  })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['week', 'month'],
    example: 'week',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending communities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              memberCount: { type: 'number' },
              recentActivity: { type: 'object' },
              trendingData: {
                type: 'object',
                properties: {
                  growthRate: { type: 'number' },
                  activityScore: { type: 'number' },
                  engagementRate: { type: 'number' },
                  retentionRate: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getTrendingCommunities(@Query() dto: TrendingCommunitiesDto) {
    try {
      const trendingCommunities =
        await this.enhancedCommunityService.getTrendingCommunities(
          dto.limit || 10,
          dto.timeframe || 'week',
        );

      return {
        success: true,
        data: trendingCommunities,
        message: 'Trending communities retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':communityId/similar')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get similar communities',
    description:
      'Find communities similar to the specified one based on member overlap and activity patterns',
  })
  @ApiParam({
    name: 'communityId',
    type: 'string',
    format: 'uuid',
    description: 'Reference community ID',
  })
  @ApiQuery({
    name: 'excludeJoined',
    required: false,
    type: 'boolean',
    example: true,
  })
  @ApiQuery({ name: 'maxResults', required: false, type: 'number', example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Similar communities retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reference community not found',
  })
  async getSimilarCommunities(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Query() dto: SimilarCommunitiesDto,
    @GetUser() user: any,
  ) {
    try {
      const similarCommunities =
        await this.enhancedCommunityService.getSimilarCommunities(communityId, {
          userId: user.id,
          excludeJoined: dto.excludeJoined ?? true,
          maxResults: dto.maxResults ?? 5,
        });

      return {
        success: true,
        data: similarCommunities,
        message: 'Similar communities retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('discover')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Discover communities',
    description:
      'Get personalized community recommendations based on user activity and preferences',
  })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Community recommendations retrieved successfully',
  })
  async discoverCommunities(
    @GetUser() user: any,
    @Query('limit') limit?: number,
  ) {
    try {
      // This could integrate with the CommunityRecommendationService
      // For now, return trending communities as a discovery mechanism
      const trendingCommunities =
        await this.enhancedCommunityService.getTrendingCommunities(
          limit || 10,
          'week',
        );

      // Filter out communities the user has already joined
      const userMemberships = await this.enhancedCommunityService[
        'prisma'
      ].membership.findMany({
        where: { userId: user.id },
        select: { communityId: true },
      });

      const userCommunityIds = userMemberships.map((m) => m.communityId);
      const recommendations = trendingCommunities.filter(
        (community) => !userCommunityIds.includes(community.id),
      );

      return {
        success: true,
        data: recommendations,
        message: 'Community recommendations retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('categories')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get community categories',
    description: 'Retrieve available community categories for browsing',
  })
  @ApiResponse({
    status: 200,
    description: 'Community categories retrieved successfully',
  })
  async getCommunityCategories() {
    try {
      // This could be expanded to use actual category data from database
      const categories = [
        {
          id: 'depression',
          name: 'Depression Support',
          description: 'Communities focused on depression and mood disorders',
          icon: '😔',
          communityCount: 0,
        },
        {
          id: 'anxiety',
          name: 'Anxiety Support',
          description: 'Communities for anxiety, panic, and stress management',
          icon: '😰',
          communityCount: 0,
        },
        {
          id: 'trauma',
          name: 'Trauma & PTSD',
          description: 'Support for trauma recovery and PTSD',
          icon: '🛡️',
          communityCount: 0,
        },
        {
          id: 'general',
          name: 'General Support',
          description: 'Broad mental health support communities',
          icon: '🤝',
          communityCount: 0,
        },
        {
          id: 'wellness',
          name: 'Mental Wellness',
          description: 'Focus on mental health maintenance and wellness',
          icon: '🌱',
          communityCount: 0,
        },
      ];

      // Count communities for each category (simplified)
      for (const category of categories) {
        const count = await this.enhancedCommunityService[
          'prisma'
        ].community.count({
          where: {
            OR: [
              {
                name: {
                  contains: category.name.split(' ')[0],
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: category.name.split(' ')[0],
                  mode: 'insensitive',
                },
              },
            ],
          },
        });
        category.communityCount = count;
      }

      return {
        success: true,
        data: categories,
        message: 'Community categories retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('popular')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get popular communities',
    description:
      'Retrieve communities with the highest member counts and activity',
  })
  @ApiQuery({ name: 'limit', required: false, type: 'number', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Popular communities retrieved successfully',
  })
  async getPopularCommunities(
    @GetUser() user: any,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await this.enhancedCommunityService.searchCommunities(
        {
          sortBy: 'members',
          sortOrder: 'desc',
        },
        user.id,
        1,
        limit || 10,
      );

      return {
        success: true,
        data: result.communities,
        message: 'Popular communities retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
