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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { Public } from '../decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  RegisterClientDtoSchema,
  LoginDtoSchema,
  type RegisterClientDto,
  type LoginDto,
} from 'mentara-commons';
import { ClientAuthService } from '../services/client-auth.service';
import { Request } from 'express';

@ApiTags('client-auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth/client')
export class ClientAuthController {
  constructor(private readonly clientAuthService: ClientAuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Register new client account',
    description: 'Create a new client account for users seeking therapy services',
  })
  @ApiBody({
    type: 'object',
    description: 'Client registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', format: 'email', example: 'client@example.com' },
        password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
        phoneNumber: { type: 'string', example: '+1234567890' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Client account created successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid registration data or email already exists' })
  @ApiTooManyRequestsResponse({ description: 'Too many registration attempts' })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterClientDtoSchema))
    registerDto: RegisterClientDto,
  ) {
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
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
      message: result.message,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Client login',
    description: 'Authenticate client user and return access tokens',
  })
  @ApiBody({
    type: 'object',
    description: 'Client login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'client@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 login attempts per 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) loginDto: LoginDto,
    @Req() req: Request,
  ) {
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
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get client profile',
    description: 'Retrieve the authenticated client user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Client profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        dateOfBirth: { type: 'string', format: 'date' },
        phoneNumber: { type: 'string' },
        profileComplete: { type: 'boolean' },
        therapistId: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.clientAuthService.getClientProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get first sign-in status',
    description: 'Check if this is the client first time signing in and return onboarding status',
  })
  @ApiResponse({
    status: 200,
    description: 'First sign-in status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isFirstSignIn: { type: 'boolean' },
        hasSeenRecommendations: { type: 'boolean' },
        profileCompleted: { type: 'boolean' },
        assessmentCompleted: { type: 'boolean' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Get('first-sign-in-status')
  @HttpCode(HttpStatus.OK)
  async getFirstSignInStatus(@CurrentUserId() userId: string) {
    return this.clientAuthService.getFirstSignInStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark recommendations as seen',
    description: 'Mark therapist recommendations as seen by the client',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations marked as seen successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Post('mark-recommendations-seen')
  @HttpCode(HttpStatus.OK)
  async markRecommendationsSeen(@CurrentUserId() userId: string) {
    return this.clientAuthService.markRecommendationsSeen(userId);
  }
}
