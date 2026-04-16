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
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
// Import types from local auth types
import type {
  RegisterTherapistDto,
  TherapistAuthResponse,
  EmailResponse,
  VerifyRegistrationOtpDto,
  ResendRegistrationOtpDto,
} from '../types';

// Import validation schemas from local validation
import {
  RegisterTherapistDtoSchema,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDtoSchema,
} from '../validation';
import { TherapistAuthService } from './therapist-auth.service';

@Controller('auth/therapist')
export class TherapistAuthController {
  constructor(private readonly therapistAuthService: TherapistAuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterTherapistDtoSchema)) registerDto: RegisterTherapistDto,
  ): Promise<TherapistAuthResponse> {
    const result = await this.therapistAuthService.registerTherapist(registerDto);

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
        therapist: {
          isApproved: false,
          approvalStatus: 'PENDING',
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
    return this.therapistAuthService.getTherapistProfile(userId);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 attempts per 5 minutes
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body(new ZodValidationPipe(VerifyRegistrationOtpDtoSchema))
    verifyDto: VerifyRegistrationOtpDto,
  ): Promise<EmailResponse> {
    return this.therapistAuthService.verifyRegistrationOtp(
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
    return this.therapistAuthService.resendRegistrationOtp(resendDto.email);
  }
}
