import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { OnboardingService, OnboardingStatus } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('onboarding')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Retrieve get my onboarding status',

    description: 'Retrieve get my onboarding status',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOnboardingStatus(
    @CurrentUserId() userId: string,
  ): Promise<OnboardingStatus> {
    try {
      return await this.onboardingService.getOnboardingStatus(userId);
    } catch (error) {
      this.logger.error(
        `Failed to get onboarding status for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to retrieve onboarding status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:userId')
  @ApiOperation({
    summary: 'Retrieve get user onboarding status',

    description: 'Retrieve get user onboarding status',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async getUserOnboardingStatus(
    @Param('userId') userId: string,
  ): Promise<OnboardingStatus> {
    try {
      return await this.onboardingService.getOnboardingStatus(userId);
    } catch (error) {
      this.logger.error(
        `Failed to get onboarding status for user ${userId}:`,
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve onboarding status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete-step/:stepName')
  @ApiOperation({
    summary: 'Create complete step',

    description: 'Create complete step',
  })
  @ApiResponse({
    status: 201,

    description: 'Created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeStep(
    @CurrentUserId() userId: string,
    @Param('stepName') stepName: string,
  ): Promise<OnboardingStatus> {
    try {
      return await this.onboardingService.markStepCompleted(userId, stepName);
    } catch (error) {
      this.logger.error(
        `Failed to complete step ${stepName} for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to complete onboarding step',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('validate')
  @ApiOperation({
    summary: 'Retrieve validate onboarding',

    description: 'Retrieve validate onboarding',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateOnboarding(@CurrentUserId() userId: string) {
    try {
      return await this.onboardingService.validateOnboardingCompleteness(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to validate onboarding for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to validate onboarding completeness',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Retrieve get onboarding insights',

    description: 'Retrieve get onboarding insights',
  })
  @ApiResponse({
    status: 200,

    description: 'Retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AdminAuthGuard)
  @AdminOnly()
  async getOnboardingInsights() {
    try {
      return await this.onboardingService.getOnboardingInsights();
    } catch (error) {
      this.logger.error('Failed to get onboarding insights:', error);
      throw new HttpException(
        'Failed to retrieve onboarding insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
