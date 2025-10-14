import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UserIdParamSchema, UserReportDtoSchema } from './validation';
import type { UserIdParam, UserReportDto } from './types';
import { ProfileService } from './profile.service';

/**
 * Public profile controller for viewing user/therapist profiles
 */
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get public profile by user ID
   * Anyone can view public profiles
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @CurrentUserId() currentUserId: string,
  ) {
    try {
      this.logger.log(`User ${currentUserId} viewing profile ${params.id}`);
      return await this.profileService.getPublicProfile(
        params.id,
        currentUserId,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch profile ${params.id}:`, error);
      throw new HttpException(
        `Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update own profile
   * Users can only update their own profile
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateOwnProfile(
    @CurrentUserId() currentUserId: string,
    @Body() profileData: any, // TODO: Add proper DTO validation
  ) {
    try {
      this.logger.log(`User ${currentUserId} updating their profile`);
      return await this.profileService.updateProfile(
        currentUserId,
        profileData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${currentUserId}:`,
        error,
      );
      throw new HttpException(
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Report a user profile
   * Any authenticated user can report any profile (including their own)
   */
  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  async reportUser(
    @Param(new ZodValidationPipe(UserIdParamSchema)) params: UserIdParam,
    @CurrentUserId() currentUserId: string,
    @Body(new ZodValidationPipe(UserReportDtoSchema)) reportData: UserReportDto,
  ): Promise<{ success: boolean; reportId: string }> {
    try {
      this.logger.log(`User ${currentUserId} reporting profile ${params.id}`);
      const reportId = await this.profileService.reportUser(
        params.id,
        currentUserId,
        reportData.reason,
        reportData.content,
      );
      return { success: true, reportId };
    } catch (error) {
      this.logger.error(
        `Failed to report user ${params.id}:`,
        error,
      );
      throw new HttpException(
        `Failed to report user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
