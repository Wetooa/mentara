import { Controller, Get, UseGuards, InternalServerErrorException, Logger } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RecommendationResponseDto } from './types/recommendations.dto';
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

  @Get()
  @ApiOperation({ summary: 'Get therapist and community recommendations based on user assessment' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecommendations(@CurrentUserId() userId: string): Promise<RecommendationResponseDto> {
    try {
      this.logger.log(`User ${userId} requested recommendations`);
      return await this.recommendationsService.getRecommendations(userId);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Failed to get recommendations for user ${userId}: ${error.message}`);
      throw new InternalServerErrorException('An error occurred while processing your recommendations');
    }
  }
}
