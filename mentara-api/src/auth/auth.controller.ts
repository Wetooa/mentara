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
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUserId } from './decorators/current-user-id.decorator';
import { Public } from './decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  LoginDtoSchema,
  RegisterUserDtoSchema,
  RequestPasswordResetDtoSchema,
  ResetPasswordDtoSchema,
  VerifyEmailDtoSchema,
  ResendVerificationEmailDtoSchema,
  type LoginDto,
  type RegisterUserDto,
  type RequestPasswordResetDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
  type ResendVerificationEmailDto,
  type AuthResponse,
  type UserResponse,
  type SuccessMessageResponse,
} from 'mentara-commons';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { Request } from 'express';
import {
  AuthResponseDto,
  UserResponseDto,
  SuccessMessageDto,
} from '../common/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // Universal login works for all roles - role-specific registration endpoints:
  // - /auth/client/register
  // - /auth/therapist/register
  // - /auth/admin/create-account
  // - /auth/moderator/create-account

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUserId() id: string): Promise<UserResponse> {
    const user = await this.authService.getUser(id);
    return UserResponseDto.fromPrismaUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.authService.getUsers();
    return UserResponseDto.fromPrismaUsers(users);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 300000 } }) // 20 logout attempts per 5 minutes
  @Post('force-logout')
  @HttpCode(HttpStatus.OK)
  async forceLogout(
    @CurrentUserId() id: string,
  ): Promise<SuccessMessageResponse> {
    await this.authService.forceLogout(id);
    return new SuccessMessageDto('Successfully logged out from all devices');
  }

  // Local Authentication Endpoints
  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registration attempts per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterUserDtoSchema))
    registerDto: RegisterUserDto,
  ): Promise<SuccessMessageResponse> {
    // Only allow client and therapist roles for general registration
    const allowedRole =
      registerDto.role === 'therapist' ? 'therapist' : 'client';

    const result = await this.authService.registerUserWithEmail(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      allowedRole,
    );

    return new SuccessMessageDto(result.message);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 login attempts per 5 minutes
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.authService.loginWithEmail(
      loginDto.email,
      loginDto.password,
      ipAddress,
      userAgent,
    );

    return new AuthResponseDto(result.user, result.token, 'Login successful');
  }

  // Removed refresh token endpoint - no longer needed with non-expiring tokens

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUserId() userId: string,
  ): Promise<SuccessMessageResponse> {
    await this.authService.logout(userId);
    return new SuccessMessageDto('Logged out successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string): Promise<UserResponse> {
    const user = await this.authService.validateUser(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return UserResponseDto.fromPrismaUser(user);
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
  ): Promise<SuccessMessageResponse> {
    await this.passwordResetService.requestPasswordReset(requestResetDto.email);
    return new SuccessMessageDto(
      'If an account with that email exists, we will send a password reset link.',
    );
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
    };
  }

  // ===== USER EXISTENCE CHECK ENDPOINT =====

  @Public()
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

      // Extract token from result
      const { token } = result;

      // Determine frontend redirect URL based on environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/sso-callback?token=${token}&role=${role}`;

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

      // Extract token from result
      const { token } = result;

      // Determine frontend redirect URL based on environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/sso-callback?token=${token}&role=${role}`;

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

  // Removed session management endpoints - using single tokens now
}
