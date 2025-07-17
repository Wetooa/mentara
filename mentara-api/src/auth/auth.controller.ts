import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  LoginDtoSchema,
  RefreshTokenDtoSchema,
  RegisterUserDtoSchema,
  LogoutDtoSchema,
  RequestPasswordResetDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailDtoSchema,
  ResendVerificationEmailDtoSchema,
  type LoginDto,
  type RefreshTokenDto,
  type RegisterUserDto,
  type LogoutDto,
  type RequestPasswordResetDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
  type ResendVerificationEmailDto,
} from 'mentara-commons';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // Role-specific registration endpoints moved to dedicated controllers:
  // - /auth/client/register
  // - /auth/therapist/register
  // - /auth/admin/create-account
  // - /auth/moderator/create-account

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token' 
  })
  @Get('me')
  async getMe(@CurrentUserId() id: string) {
    return await this.authService.getUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers() {
    return await this.authService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 300000 } }) // 20 logout attempts per 5 minutes
  @Post('force-logout')
  @HttpCode(HttpStatus.OK)
  async forceLogout(@CurrentUserId() id: string) {
    return await this.authService.forceLogout(id);
  }

  // Local Authentication Endpoints
  @Public()
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Register a new user account with email and password. Supports client and therapist roles only.' 
  })
  @ApiBody({ 
    description: 'User registration details',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: { type: 'string', enum: ['client', 'therapist'], example: 'client' }
      },
      required: ['email', 'password', 'firstName', 'lastName', 'role']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
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
            role: { type: 'string' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Email already exists' 
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registration attempts per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterUserDtoSchema))
    registerDto: RegisterUserDto,
  ) {
    // Only allow client and therapist roles for general registration
    const allowedRole =
      registerDto.role === 'therapist' ? 'therapist' : 'client';

    return await this.authService.registerUserWithEmail(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      allowedRole,
    );
  }

  @Public()
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password, returning JWT tokens' 
  })
  @ApiBody({ 
    description: 'Login credentials',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePassword123!' }
      },
      required: ['email', 'password']
    }
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
            emailVerified: { type: 'boolean' }
          }
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many login attempts' 
  })
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 login attempts per 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) loginDto: LoginDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.authService.loginWithEmail(
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

  @Public()
  @Throttle({ default: { limit: 20, ttl: 300000 } }) // 20 refresh attempts per 5 minutes
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body(new ZodValidationPipe(RefreshTokenDtoSchema))
    refreshDto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    if (!refreshDto.refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const tokens = await this.authService.refreshTokens(
      refreshDto.refreshToken,
      ipAddress,
      userAgent,
    );

    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body(new ZodValidationPipe(LogoutDtoSchema)) logoutDto: LogoutDto,
  ) {
    if (logoutDto.refreshToken) {
      await this.authService.logout(logoutDto.refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    const user = await this.authService.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Role-specific profile endpoints moved to dedicated controllers:
  // - /auth/client/profile
  // - /auth/therapist/profile
  // - /auth/admin/profile
  // - /auth/moderator/profile

  // ===== PASSWORD RESET ENDPOINTS =====

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 reset requests per 5 minutes
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body(new ZodValidationPipe(RequestPasswordResetDtoSchema))
    requestResetDto: RequestPasswordResetDto,
  ) {
    await this.passwordResetService.requestPasswordReset(requestResetDto.email);
    return {
      message: 'If an account with that email exists, we will send a password reset link.',
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 reset attempts per 5 minutes
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordDtoSchema))
    resetDto: ResetPasswordDto,
  ) {
    // Validate that passwords match
    if (resetDto.newPassword !== resetDto.confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const result = await this.passwordResetService.resetPassword(
      resetDto.token,
      resetDto.newPassword,
    );
    return result;
  }

  @Public()
  @Get('validate-reset-token')
  async validateResetToken(@Query('token') token: string) {
    const result = await this.passwordResetService.validateResetToken(token);
    return result;
  }

  // ===== EMAIL VERIFICATION ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 verification emails per 5 minutes
  @Post('send-verification-email')
  @HttpCode(HttpStatus.OK)
  async sendVerificationEmail(@CurrentUserId() userId: string) {
    await this.emailVerificationService.sendVerificationEmail(userId);
    return {
      message: 'Verification email sent successfully',
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 resend attempts per 5 minutes
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body(new ZodValidationPipe(ResendVerificationEmailDtoSchema))
    resendDto: ResendVerificationEmailDto,
  ) {
    await this.emailVerificationService.resendVerificationEmail(resendDto.email);
    return {
      message: 'If an account with that email exists, we will send a verification link.',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailDtoSchema))
    verifyDto: VerifyEmailDto,
  ) {
    const result = await this.emailVerificationService.verifyEmail(verifyDto.token);
    return result;
  }

  // Google OAuth Routes
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req) {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // Handle Google OAuth callback
    return this.authService.handleOAuthLogin(req.user, 'google');
  }

  // Microsoft OAuth Routes
  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth(@Req() _req) {
    // Initiates Microsoft OAuth flow
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthRedirect(@Req() req) {
    // Handle Microsoft OAuth callback
    return this.authService.handleOAuthLogin(req.user, 'microsoft');
  }
}
