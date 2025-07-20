import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { Public } from '../decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  RegisterClientDtoSchema,
  LoginDtoSchema,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDtoSchema,
  type RegisterClientDto,
  type LoginDto,
  type VerifyRegistrationOtpDto,
  type ResendRegistrationOtpDto,
  type ClientAuthResponse,
  type ClientProfileResponse,
  type OnboardingStatusResponse,
  type SuccessResponse,
  type EmailResponse,
} from 'mentara-commons';
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
    @Body(new ZodValidationPipe(RegisterClientDtoSchema))
    registerDto: RegisterClientDto,
  ): Promise<ClientAuthResponse> {
    const result = await this.clientAuthService.registerClient(registerDto);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      accessToken: result.tokens.accessToken, // This is now the single token
      refreshToken: result.tokens.accessToken, // Same token for compatibility
      expiresIn: 0, // Non-expiring
      message: result.message,
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 login attempts per 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<ClientAuthResponse> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.clientAuthService.loginClient(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent,
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
      },
      accessToken: result.tokens.accessToken, // This is now the single token
      refreshToken: result.tokens.accessToken, // Same token for compatibility
      expiresIn: 0, // Non-expiring
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