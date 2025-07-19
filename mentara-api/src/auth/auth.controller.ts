import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUserId } from './decorators/current-user-id.decorator';
import { Public } from './decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  LoginDtoSchema,
  RefreshTokenDtoSchema,
  RegisterUserDtoSchema,
  LogoutDtoSchema,
  RequestPasswordResetDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailDtoSchema,
  ResendVerificationEmailDtoSchema,
  TerminateSessionDtoSchema,
  type LoginDto,
  type RefreshTokenDto,
  type RegisterUserDto,
  type LogoutDto,
  type RequestPasswordResetDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
  type ResendVerificationEmailDto,
  type TerminateSessionDto,
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
    description: "Retrieve the authenticated user's profile information",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
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
    description:
      'Register a new user account with email and password. Supports client and therapist roles only.',
  })
  @ApiBody({
    description: 'User registration details',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: {
          type: 'string',
          minLength: 8,
          example: 'SecurePassword123!',
        },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['client', 'therapist'],
          example: 'client',
        },
      },
      required: ['email', 'password', 'firstName', 'lastName', 'role'],
    },
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
            role: { type: 'string' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
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
    description:
      'Authenticate user with email and password, returning JWT tokens',
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePassword123!' },
      },
      required: ['email', 'password'],
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts',
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
      message:
        'If an account with that email exists, we will send a password reset link.',
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

  // ===== JWT TOKEN VALIDATION ENDPOINT =====

  @Public()
  @ApiOperation({
    summary: 'Validate JWT token',
    description: 'Validate a JWT token and return user information if valid',
  })
  @ApiBody({
    description: 'JWT token to validate',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
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
        expires: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Token is required',
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 validation requests per minute
  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() body: { token: string }) {
    if (!body.token) {
      throw new UnauthorizedException('Token is required');
    }

    const result = await this.authService.validateToken(body.token);

    if (!result.valid) {
      return {
        valid: false,
        error: result.error,
      };
    }

    return {
      valid: true,
      user: result.user,
      expires: result.expires,
    };
  }

  // ===== USER EXISTENCE CHECK ENDPOINT =====

  @Public()
  @ApiOperation({
    summary: 'Check user existence by email',
    description:
      'Check if a user exists by email address and return their role and verification status',
  })
  @ApiQuery({
    name: 'email',
    description: 'Email address to check',
    example: 'user@example.com',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User existence check result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean' },
        role: {
          type: 'string',
          enum: ['client', 'therapist', 'moderator', 'admin'],
        },
        isVerified: { type: 'boolean' },
      },
      required: ['exists'],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid email format',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  @Get('check-user')
  async checkUserExists(@Query('email') email: string) {
    if (!email) {
      throw new UnauthorizedException('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UnauthorizedException('Invalid email format');
    }

    const result = await this.authService.checkUserExists(email);
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
    await this.emailVerificationService.resendVerificationEmail(
      resendDto.email,
    );
    return {
      message:
        'If an account with that email exists, we will send a verification link.',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailDtoSchema))
    verifyDto: VerifyEmailDto,
  ) {
    const result = await this.emailVerificationService.verifyEmail(
      verifyDto.token,
    );
    return result;
  }

  // Google OAuth Routes
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res, @Query() query) {
    try {
      // Get role from state parameter if provided (for role-specific OAuth flows)
      const role = query.state || 'client'; // Default to client if no role specified

      // Handle Google OAuth callback and get tokens
      const result = await this.authService.handleOAuthLogin(
        req.user,
        'google',
        role,
      );

      // Extract tokens from result
      const { accessToken, refreshToken } = result;

      // Determine frontend redirect URL based on environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/sso-callback?token=${accessToken}&refresh_token=${refreshToken}&role=${role}`;

      // Redirect to frontend with tokens in URL parameters
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);

      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/auth/sign-in?error=oauth_failed&provider=google`;
      return res.redirect(errorUrl);
    }
  }

  // Microsoft OAuth Routes
  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Initiates Microsoft OAuth flow
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthRedirect(@Req() req, @Res() res, @Query() query) {
    try {
      // Get role from state parameter if provided (for role-specific OAuth flows)
      const role = query.state || 'client'; // Default to client if no role specified

      // Handle Microsoft OAuth callback and get tokens
      const result = await this.authService.handleOAuthLogin(
        req.user,
        'microsoft',
        role,
      );

      // Extract tokens from result
      const { accessToken, refreshToken } = result;

      // Determine frontend redirect URL based on environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/sso-callback?token=${accessToken}&refresh_token=${refreshToken}&role=${role}`;

      // Redirect to frontend with tokens in URL parameters
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);

      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = `${frontendUrl}/auth/sign-in?error=oauth_failed&provider=microsoft`;
      return res.redirect(errorUrl);
    }
  }

  // OAuth Token Exchange API Endpoint (for frontend to call)
  @Public()
  @ApiOperation({
    summary: 'Exchange OAuth authorization code for tokens',
    description:
      'Exchange OAuth authorization code from Google/Microsoft for JWT tokens',
  })
  @ApiBody({
    description: 'OAuth authorization code and provider information',
    schema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['google', 'microsoft'],
          example: 'google',
        },
        code: {
          type: 'string',
          example: 'authorization_code_from_oauth_provider',
        },
        state: {
          type: 'string',
          example: 'client',
          description: 'Optional role for new user creation',
        },
      },
      required: ['provider', 'code'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth login successful',
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
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OAuth code or provider',
  })
  @Post('oauth/token-exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeOAuthToken(
    @Body()
    body: {
      provider: 'google' | 'microsoft';
      code: string;
      state?: string;
    },
  ) {
    const { provider, code } = body;

    if (!code) {
      throw new UnauthorizedException('Authorization code is required');
    }

    if (!['google', 'microsoft'].includes(provider)) {
      throw new UnauthorizedException('Invalid OAuth provider');
    }

    try {
      // TODO: Implement proper OAuth token exchange with provider APIs
      // This would involve exchanging the authorization code for an access token
      // and then fetching user profile information from the OAuth provider

      // For now, this is a placeholder that expects the full OAuth flow
      // to be handled by the existing Passport strategies
      throw new UnauthorizedException(
        'Direct token exchange not yet implemented. Use OAuth redirect flow.',
      );
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      throw new UnauthorizedException('OAuth token exchange failed');
    }
  }

  // ===== SESSION MANAGEMENT ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current session information',
    description: 'Retrieve information about the current user session',
  })
  @ApiResponse({
    status: 200,
    description: 'Session information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        lastActivity: { type: 'string', format: 'date-time' },
        device: { type: 'string' },
        location: { type: 'string' },
        ipAddress: { type: 'string' },
        userAgent: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get('session-info')
  async getSessionInfo(@Req() req: Request) {
    // Extract refresh token from Authorization header or cookies
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token required for session info',
      );
    }

    return await this.authService.getSessionInfo(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all active sessions',
    description: 'Retrieve all active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              device: { type: 'string' },
              location: { type: 'string' },
              lastActivity: { type: 'string', format: 'date-time' },
              isCurrent: { type: 'boolean' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Get('active-sessions')
  async getActiveSessions(
    @CurrentUserId() userId: string,
    @Req() req: Request,
  ) {
    const refreshToken = req.headers['x-refresh-token'] as string;
    return await this.authService.getActiveSessions(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Terminate a specific session',
    description: 'Terminate a specific session by session ID',
  })
  @ApiBody({
    description: 'Session ID to terminate',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'session-uuid-here' },
      },
      required: ['sessionId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session terminated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 terminations per minute
  @Delete('terminate-session')
  @HttpCode(HttpStatus.OK)
  async terminateSession(
    @Body(new ZodValidationPipe(TerminateSessionDtoSchema))
    terminateDto: TerminateSessionDto,
    @CurrentUserId() userId: string,
  ) {
    return await this.authService.terminateSession(
      terminateDto.sessionId,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Terminate all other sessions',
    description: 'Terminate all other sessions except the current one',
  })
  @ApiResponse({
    status: 200,
    description: 'Other sessions terminated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        terminatedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 terminations per minute
  @Post('terminate-other-sessions')
  @HttpCode(HttpStatus.OK)
  async terminateOtherSessions(
    @CurrentUserId() userId: string,
    @Req() req: Request,
  ) {
    const refreshToken = req.headers['x-refresh-token'] as string;
    return await this.authService.terminateOtherSessions(userId, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Universal logout',
    description:
      'Clear all sessions for the current user (logout from all devices)',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions terminated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 universal logouts per minute
  @Post('universal-logout')
  @HttpCode(HttpStatus.OK)
  async universalLogout(@CurrentUserId() userId: string) {
    return await this.authService.universalLogout(userId);
  }
}
