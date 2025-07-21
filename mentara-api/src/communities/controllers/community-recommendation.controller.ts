import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
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
import { CommunityRecommendationService } from '../services/community-recommendation.service';
import {
  ValidatedBody,
  ValidatedQuery,
} from '../../common/decorators/validate-body.decorator';
import {
  GenerateRecommendationsDtoSchema,
  RecommendationInteractionDtoSchema,
  RecommendationQueryDtoSchema,
  type GenerateRecommendationsDto,
  type RecommendationInteractionDto,
  type RecommendationQueryDto,
} from 'mentara-commons';

@ApiTags('Community Recommendations')
@ApiTags('community-recommendation')
@ApiBearerAuth('JWT-auth')
@Controller('communities/recommendations')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
@ApiBearerAuth()
export class CommunityRecommendationController {
  constructor(
    private readonly communityRecommendationService: CommunityRecommendationService,
  ) {}

  @Post('generate')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate community recommendations for current user',
    description:
      'Generates personalized community recommendations based on user assessment scores',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
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
              userId: { type: 'string' },
              community: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string' },
                  imageUrl: { type: 'string' },
                  memberCount: { type: 'number' },
                },
              },
              compatibilityScore: { type: 'number' },
              reasoning: { type: 'string' },
              assessmentScores: { type: 'object' },
              isAccepted: { type: 'boolean', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateRecommendations(
    @GetUser() user: any,
    @ValidatedBody(GenerateRecommendationsDtoSchema)
    dto: GenerateRecommendationsDto,
  ) {
    try {
      await this.communityRecommendationService.generateRecommendationsForUser(
        user.id,
        dto.force,
      );

      const recommendations =
        await this.communityRecommendationService.getUserRecommendations(
          user.id,
        );

      return {
        success: true,
        data: recommendations,
        message: `Generated ${recommendations.length} recommendations`,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('me')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get current user recommendations',
    description: 'Retrieves all community recommendations for the current user',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'accepted', 'rejected'],
    description: 'Filter by recommendation status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['compatibility', 'created', 'updated'],
    description: 'Sort recommendations by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'User recommendations retrieved successfully',
  })
  async getUserRecommendations(
    @GetUser() user: any,
    @ValidatedQuery(RecommendationQueryDtoSchema) query: RecommendationQueryDto,
  ) {
    try {
      let recommendations =
        await this.communityRecommendationService.getUserRecommendations(
          user.id,
        );

      // Apply status filter if provided
      if (query.status) {
        recommendations = recommendations.filter((rec) => {
          if (query.status === 'pending') return rec.status === 'pending';
          if (query.status === 'accepted') return rec.status === 'joined';
          if (query.status === 'rejected') return rec.status === 'dismissed';
          return true;
        });
      }

      // Apply sorting if provided
      if (query.sortBy) {
        recommendations.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (query.sortBy) {
            case 'compatibility':
              aValue = a.score;
              bValue = b.score;
              break;
            case 'created':
              aValue = new Date(a.createdAt || 0);
              bValue = new Date(b.createdAt || 0);
              break;
            case 'updated':
              aValue = new Date(a.updatedAt || 0);
              bValue = new Date(b.updatedAt || 0);
              break;
            default:
              aValue = a.score;
              bValue = b.score;
          }

          const order = query.sortOrder === 'asc' ? 1 : -1;
          return aValue > bValue ? order : aValue < bValue ? -order : 0;
        });
      }

      return {
        success: true,
        data: recommendations,
        message: 'Recommendations retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':recommendationId')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get recommendation details',
    description:
      'Retrieves detailed information about a specific recommendation',
  })
  @ApiParam({
    name: 'recommendationId',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the recommendation',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Recommendation not found',
  })
  async getRecommendationDetails(
    @GetUser() user: any,
    @Param('recommendationId', ParseUUIDPipe) recommendationId: string,
  ) {
    try {
      const recommendation =
        await this.communityRecommendationService.getRecommendationById(
          recommendationId,
        );

      return {
        success: true,
        data: recommendation,
        message: 'Recommendation details retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Put(':recommendationId/interact')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Interact with recommendation',
    description: 'Accept or reject a community recommendation',
  })
  @ApiParam({
    name: 'recommendationId',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the recommendation',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation interaction processed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Recommendation not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid interaction action',
  })
  async handleRecommendationInteraction(
    @GetUser() user: any,
    @Param('recommendationId', ParseUUIDPipe) recommendationId: string,
    @ValidatedBody(RecommendationInteractionDtoSchema)
    dto: RecommendationInteractionDto,
  ) {
    try {
      await this.communityRecommendationService.handleRecommendationInteraction(
        {
          recommendationId,
          action: dto.action,
          userId: user.id,
        },
      );

      return {
        success: true,
        message: `Recommendation ${dto.action}ed successfully`,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh user recommendations',
    description: 'Regenerates recommendations based on updated assessment data',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations refreshed successfully',
  })
  async refreshRecommendations(@GetUser() user: any) {
    try {
      await this.communityRecommendationService.generateRecommendationsForUser(
        user.id,
        true, // force refresh
      );

      return {
        success: true,
        message: 'Recommendations refreshed successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('stats/me')
  @Roles('client', 'therapist', 'moderator', 'admin')
  @ApiOperation({
    summary: 'Get user recommendation statistics',
    description: 'Retrieves recommendation statistics for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User recommendation statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalRecommendations: { type: 'number' },
            acceptedRecommendations: { type: 'number' },
            rejectedRecommendations: { type: 'number' },
            pendingRecommendations: { type: 'number' },
            averageCompatibilityScore: { type: 'number' },
            topCommunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  communityId: { type: 'string' },
                  communityName: { type: 'string' },
                  acceptanceRate: { type: 'number' },
                  totalRecommendations: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getUserRecommendationStats(@GetUser() user: any) {
    try {
      const stats =
        await this.communityRecommendationService.getRecommendationStats();

      return {
        success: true,
        data: stats,
        message: 'User recommendation statistics retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('stats/global')
  @Roles('admin', 'moderator')
  @ApiOperation({
    summary: 'Get global recommendation statistics',
    description:
      'Retrieves platform-wide recommendation statistics (admin/moderator only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Global recommendation statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getGlobalRecommendationStats() {
    try {
      const stats =
        await this.communityRecommendationService.getRecommendationStats();

      return {
        success: true,
        data: stats,
        message: 'Global recommendation statistics retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('join')
  @Roles('client', 'therapist', 'moderator', 'admin') 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Join recommended communities immediately',
    description: 'Allows users to join multiple recommended communities at once',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined communities',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid community slugs provided',
  })
  async joinRecommendedCommunities(
    @GetUser() user: any,
    @Body() dto: { communitySlugs: string[] },
  ) {
    try {
      const joinResults = await this.communityRecommendationService.joinRecommendedCommunities(
        user.id,
        dto.communitySlugs,
      );

      return {
        success: true,
        data: joinResults,
        message: `Successfully joined ${joinResults.successfulJoins.length} communities`,
      };
    } catch (error) {
      throw error;
    }
  }
}
