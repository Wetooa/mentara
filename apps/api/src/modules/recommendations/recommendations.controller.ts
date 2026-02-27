import { Controller, Get, UseGuards, InternalServerErrorException, Logger } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { TherapistRecommendationResponseDto, CommunityRecommendationResponseDto } from './types/recommendations.dto';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('recommendations')
@ApiBearerAuth('JWT-auth')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  private readonly logger = new Logger(RecommendationsController.name);

  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('therapists')
  @ApiOperation({ summary: 'Get therapist recommendations based on user assessment' })
  @ApiResponse({ status: 200, description: 'Therapist recommendations retrieved successfully', type: TherapistRecommendationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTherapistRecommendations(@CurrentUserId() userId: string): Promise<TherapistRecommendationResponseDto> {
    try {
      this.logger.log(`User ${userId} requested therapist recommendations`);
      return await this.recommendationsService.getTherapistRecommendations(userId);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Failed to get therapist recommendations for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('An error occurred while processing your therapist recommendations');
    }
  }

  @Get('communities')
  @ApiOperation({ summary: 'Get community recommendations based on user assessment' })
  @ApiResponse({ status: 200, description: 'Community recommendations retrieved successfully', type: CommunityRecommendationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCommunityRecommendations(@CurrentUserId() userId: string): Promise<CommunityRecommendationResponseDto> {
    try {
      this.logger.log(`User ${userId} requested community recommendations`);
      return await this.recommendationsService.getCommunityRecommendations(userId);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Failed to get community recommendations for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('An error occurred while processing your community recommendations');
    }
  }
}
