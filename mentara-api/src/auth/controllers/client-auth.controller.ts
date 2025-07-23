import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { Public } from '../decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
// Import types from local auth types
import type {
  RegisterClientDto,
  VerifyRegistrationOtpDto,
  ResendRegistrationOtpDto,
  ClientAuthResponse,
  ClientProfileResponse,
  OnboardingStatusResponse,
  EmailResponse,
} from '../types';
import type { SuccessResponse } from '../../types/global';

// Import validation schemas from local validation
import {
  RegisterClientDtoSchema,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDtoSchema,
} from '../validation';
import { ClientAuthService } from '../services/client-auth.service';
import { Request } from 'express';

@Controller('auth/client')
export class ClientAuthController {
  constructor(private readonly clientAuthService: ClientAuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterClientDto,
  ): Promise<ClientAuthResponse> {
    const result = await this.clientAuthService.registerClient(registerDto);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        role: result.user.role as any,
        isEmailVerified: result.user.emailVerified ?? false,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      token: result.tokens.accessToken, // Single JWT token
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUserId() userId: string,
  ): Promise<ClientProfileResponse> {
    return this.clientAuthService.getClientProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('first-sign-in-status')
  @HttpCode(HttpStatus.OK)
  async getFirstSignInStatus(
    @CurrentUserId() userId: string,
  ): Promise<OnboardingStatusResponse> {
    return this.clientAuthService.getFirstSignInStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-recommendations-seen')
  @HttpCode(HttpStatus.OK)
  async markRecommendationsSeen(
    @CurrentUserId() userId: string,
  ): Promise<SuccessResponse> {
    return this.clientAuthService.markRecommendationsSeen(userId);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 attempts per 5 minutes
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body(new ZodValidationPipe(VerifyRegistrationOtpDtoSchema))
    verifyDto: VerifyRegistrationOtpDto,
  ): Promise<EmailResponse> {
    return this.clientAuthService.verifyRegistrationOtp(
      verifyDto.email,
      verifyDto.otpCode,
    );
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 resends per 5 minutes
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body(new ZodValidationPipe(ResendRegistrationOtpDtoSchema))
    resendDto: ResendRegistrationOtpDto,
  ): Promise<EmailResponse> {
    return this.clientAuthService.resendRegistrationOtp(resendDto.email);
  }
}
