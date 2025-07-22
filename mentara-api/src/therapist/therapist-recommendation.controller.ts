import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { CommunitiesService } from '../communities/communities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
// import {
//   TherapistRecommendationQuerySchema,
//   WelcomeRecommendationQuerySchema,
// } from './validation';
import type {
  TherapistRecommendationRequest,
  TherapistRecommendationResponseDto,
  TherapistRecommendationQuery,
  WelcomeRecommendationQuery,
} from './types';

@ApiTags('therapist-recommendation')
@ApiBearerAuth('JWT-auth')
@Controller('therapist-recommendations')
@UseGuards(JwtAuthGuard)
export class TherapistRecommendationController {
  constructor(
    private readonly therapistRecommendationService: TherapistRecommendationService,
    private readonly prisma: PrismaService,
    private readonly communitiesService: CommunitiesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve get recommended therapists',

    description: 'Retrieve get recommended therapists',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getRecommendedTherapists(
    @CurrentUserId() clerkId: string,
    @Query()
    query: TherapistRecommendationQuery,
  ): Promise<TherapistRecommendationResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: clerkId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${clerkId} not found`);
      }

      const request: TherapistRecommendationRequest = {
        userId: user.id,
        limit: query.limit,
        includeInactive: query.includeInactive,
        province: query.province,
        maxHourlyRate: query.maxHourlyRate,
      };
      return await this.therapistRecommendationService.getRecommendedTherapists(
        request,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('compatibility/:therapistId')
  @ApiOperation({
    summary: 'Retrieve get compatibility analysis',

    description: 'Retrieve get compatibility analysis',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getCompatibilityAnalysis(
    @CurrentUserId() clerkId: string,
    @Param('therapistId') therapistId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: clerkId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${clerkId} not found`);
      }

      return await this.therapistRecommendationService.getCompatibilityAnalysis(
        user.id,
        therapistId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('welcome')
  @ApiOperation({
    summary: 'Retrieve get welcome recommendations',

    description: 'Retrieve get welcome recommendations',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getWelcomeRecommendations(
    @CurrentUserId() userId: string,
    @Query()
    query: WelcomeRecommendationQuery,
  ) {
    try {
      // Verify user exists and get client status
      const [user, client] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        }),
        this.prisma.client.findUnique({
          where: { userId },
          select: {
            hasSeenTherapistRecommendations: true,
            createdAt: true,
          },
        }),
      ]);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!client) {
        throw new NotFoundException(
          `Client profile not found for user ${userId}`,
        );
      }

      // Check if this is truly a first-time user (unless forcing refresh)
      const isFirstTime = !client.hasSeenTherapistRecommendations;
      const shouldShowWelcome = isFirstTime || query.forceRefresh;

      if (!shouldShowWelcome) {
        // User has already seen recommendations, redirect to regular recommendations
        return {
          isFirstTime: false,
          redirectTo: '/therapist-recommendations',
          message: 'User has already completed welcome flow',
          lastSeenAt: client.createdAt,
        };
      }

      // Get personalized welcome recommendations - both therapists and communities
      const request: TherapistRecommendationRequest = {
        userId: user.id,
        limit: query.limit,
        includeInactive: false, // Only active therapists for welcome
        province: query.province,
        maxHourlyRate: undefined, // No rate filter for initial welcome
      };

      const [therapistRecommendations, communityRecommendations] =
        await Promise.all([
          this.therapistRecommendationService.getRecommendedTherapists(
            request,
          ),
          this.communitiesService.getRecommendedCommunities(user.id),
        ]);

      // Transform therapist data to match frontend expectations - flatten structure
      const recommendations = (therapistRecommendations?.therapists || []).map((therapist, index) => ({
        ...therapist,
        id: therapist.userId, // Use userId as the primary ID
        matchScore: therapist.matchScore || 0, // Add matchScore directly to therapist object
        score: therapist.matchScore || 0, // Keep score for backward compatibility
        rank: index + 1,
      }));

      // Transform community data for frontend
      const communities = (communityRecommendations || []).map((community, index) => ({
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        imageUrl: community.imageUrl,
        rank: index + 1,
      }));

      // Enhance recommendations with welcome-specific data
      const enhancedRecommendations = {
        recommendations, // Frontend expects this field
        communities,     // Add communities data
        totalCount: therapistRecommendations?.totalCount || 0,
        averageMatchScore: recommendations.length > 0 
          ? recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length 
          : 0,
        welcomeMessage: this.generateWelcomeMessage(
          user.firstName,
          isFirstTime,
        ),
        isFirstTime,
        userInfo: {
          firstName: user.firstName,
          memberSince: user.createdAt,
          needsOnboarding: isFirstTime,
        },
        nextSteps: {
          canSendRequests: true,
          recommendedActions: [
            'Browse therapist profiles',
            'Send requests to therapists you find interesting',
            'Complete your profile for better matches',
            'Take the mental health assessment for personalized recommendations',
          ],
        },
        matchingInsights: {
          totalAvailableTherapists: therapistRecommendations?.totalCount || 0,
          totalAvailableCommunities: communities.length,
          recommendationEngine: 'AI-powered compatibility matching',
          lastUpdated: new Date(),
        },
      };

      return enhancedRecommendations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  private generateWelcomeMessage(
    firstName: string,
    isFirstTime: boolean,
  ): string {
    if (isFirstTime) {
      return `Welcome to Mentara, ${firstName}! We've curated a personalized list of therapists who may be a great fit for you. Take your time browsing through their profiles and don't hesitate to reach out to those who resonate with you.`;
    } else {
      return `Welcome back, ${firstName}! Here are some fresh therapist recommendations based on your preferences and our latest matching insights.`;
    }
  }
}
