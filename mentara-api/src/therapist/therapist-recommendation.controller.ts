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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  TherapistRecommendationRequest,
  TherapistRecommendationResponse,
} from './dto/therapist-application.dto';

@Controller('therapist-recommendations')
@UseGuards(JwtAuthGuard)
export class TherapistRecommendationController {
  constructor(
    private readonly therapistRecommendationService: TherapistRecommendationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getRecommendedTherapists(
    @CurrentUserId() clerkId: string,
    @Query('limit') limit?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('province') province?: string,
    @Query('maxHourlyRate') maxHourlyRate?: string,
  ): Promise<TherapistRecommendationResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: clerkId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${clerkId} not found`);
      }

      const request: TherapistRecommendationRequest = {
        userId: user.id,
        limit: limit ? parseInt(limit) : 10,
        includeInactive: includeInactive === 'true',
        province,
        maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate) : undefined,
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
  @HttpCode(HttpStatus.OK)
  async getWelcomeRecommendations(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
    @Query('province') province?: string,
    @Query('forceRefresh') forceRefresh?: string,
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
        throw new NotFoundException(`Client profile not found for user ${userId}`);
      }

      // Check if this is truly a first-time user (unless forcing refresh)
      const isFirstTime = !client.hasSeenTherapistRecommendations;
      const shouldShowWelcome = isFirstTime || forceRefresh === 'true';

      if (!shouldShowWelcome) {
        // User has already seen recommendations, redirect to regular recommendations
        return {
          isFirstTime: false,
          redirectTo: '/therapist-recommendations',
          message: 'User has already completed welcome flow',
          lastSeenAt: client.createdAt,
        };
      }

      // Get personalized welcome recommendations
      const request: TherapistRecommendationRequest = {
        userId: user.id,
        limit: limit ? parseInt(limit) : 8, // Slightly more for welcome experience
        includeInactive: false, // Only active therapists for welcome
        province,
        maxHourlyRate: undefined, // No rate filter for initial welcome
      };

      const recommendations = await this.therapistRecommendationService.getRecommendedTherapists(request);

      // Enhance recommendations with welcome-specific data
      const enhancedRecommendations = {
        ...recommendations,
        welcomeMessage: this.generateWelcomeMessage(user.firstName, isFirstTime),
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
          totalAvailableTherapists: recommendations.totalCount,
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

  private generateWelcomeMessage(firstName: string, isFirstTime: boolean): string {
    if (isFirstTime) {
      return `Welcome to Mentara, ${firstName}! We've curated a personalized list of therapists who may be a great fit for you. Take your time browsing through their profiles and don't hesitate to reach out to those who resonate with you.`;
    } else {
      return `Welcome back, ${firstName}! Here are some fresh therapist recommendations based on your preferences and our latest matching insights.`;
    }
  }
}
