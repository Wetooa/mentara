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
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { CurrentUserId } from '../core/decorators/current-user-id.decorator';
import { Public } from '../core/decorators/public.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type {
  RegisterClientDto,
  ClientAuthResponse,
  EmailResponse,
  VerifyRegistrationOtpDto,
  ResendRegistrationOtpDto,
} from '../types';

import {
  RegisterClientDtoSchema,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDtoSchema,
} from '../validation';
import { ClientAuthService } from './client-auth.service';

@Controller('auth/client')
export class ClientAuthController {
  constructor(private readonly clientAuthService: ClientAuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterClientDtoSchema)) registerDto: RegisterClientDto,
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
        client: {
          hasSeenTherapistRecommendations: false,
        },
      },
      token: result.tokens.accessToken,
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @CurrentUserId() userId: string,
  ): Promise<any> {
    return this.clientAuthService.getClientProfile(userId);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 attempts per 5 minutes
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body(new ZodValidationPipe(VerifyRegistrationOtpDtoSchema))
    verifyDto: VerifyRegistrationOtpDto,
  ): Promise<ClientAuthResponse> {
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
