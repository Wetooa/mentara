import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  ForbiddenException,
  BadRequestException,
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

  @Post('additional-info')
  async saveAdditionalInfo(
    @CurrentUserId() userId: string,
    @Body() body: { 
      birthdate: string; 
      city: string; 
      country: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validate required fields
      if (!body.birthdate || !body.city || !body.country) {
        throw new BadRequestException(
          'Birthdate, city, and country are required fields',
        );
      }

      // Validate birthdate format (ISO 8601)
      const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!birthdateRegex.test(body.birthdate)) {
        throw new BadRequestException(
          'Invalid birthdate format. Use YYYY-MM-DD',
        );
      }

      // Parse and validate birthdate is not in the future
      const birthdate = new Date(body.birthdate);
      if (birthdate > new Date()) {
        throw new BadRequestException('Birthdate cannot be in the future');
      }

      // Validate age (must be at least 13 years old)
      const age = new Date().getFullYear() - birthdate.getFullYear();
      if (age < 13) {
        throw new BadRequestException('User must be at least 13 years old');
      }

      // Save additional info
      await this.onboardingService.saveAdditionalInfo(userId, {
        birthdate,
        city: body.city.trim(),
        country: body.country.trim(),
      });

      this.logger.log(`Additional info saved for user ${userId}`);

      return {
        success: true,
        message: 'Additional information saved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to save additional info for user ${userId}:`,
        error,
      );
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to save additional information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
