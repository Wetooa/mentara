import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { OnboardingService, OnboardingStatus } from './onboarding.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
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
  async getUserOnboardingStatus(
    @Param('userId') userId: string,
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<OnboardingStatus> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
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
  async getOnboardingInsights(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
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
