import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TherapistRecommendationService } from './therapist-recommendation.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import {
  TherapistRecommendationRequest,
  TherapistRecommendationResponse,
  ApiResponse,
} from '../types';

@Controller('therapist-recommendations')
@UseGuards(ClerkAuthGuard)
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
  ): Promise<ApiResponse<TherapistRecommendationResponse>> {
    // Find user by clerkId
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const request: TherapistRecommendationRequest = {
      userId: user.id,
      limit: limit ? parseInt(limit) : 10,
      includeInactive: includeInactive === 'true',
      province,
      maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate) : undefined,
    };

    return this.therapistRecommendationService.getRecommendedTherapists(
      request,
    );
  }
}
