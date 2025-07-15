import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { Public } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { 
  RegisterClientDtoSchema, 
  RegisterTherapistDtoSchema,
  LoginDtoSchema,
  RefreshTokenDtoSchema,
  ChangePasswordDtoSchema,
  type RegisterClientDto,
  type RegisterTherapistDto,
  type LoginDto,
  type RefreshTokenDto,
  type ChangePasswordDto
} from 'mentara-commons';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registrations per 5 minutes
  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  async registerClient(
    @Body(new ZodValidationPipe(RegisterClientDtoSchema)) registerDto: RegisterClientDto,
  ) {
    const result = await this.authService.registerClient(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
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
      message: result.message,
    };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 therapist registrations per 10 minutes
  @Post('register/therapist')
  @HttpCode(HttpStatus.CREATED)
  async registerTherapist(
    @Body(new ZodValidationPipe(RegisterTherapistDtoSchema)) registerDto: RegisterTherapistDto,
  ) {
    const result = await this.authService.registerTherapist(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
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
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
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
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 registration attempts per 5 minutes
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      role?: 'client' | 'therapist';
    },
  ) {
    return await this.authService.registerUserWithEmail(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.role || 'client',
    );
  }

  @Public()
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
    @Body(new ZodValidationPipe(RefreshTokenDtoSchema)) refreshDto: RefreshTokenDto,
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
  async logout(@Body() logoutDto: { refreshToken: string }) {
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

  @UseGuards(JwtAuthGuard)
  @Get('first-sign-in-status')
  @HttpCode(HttpStatus.OK)
  async getFirstSignInStatus(@CurrentUserId() userId: string) {
    return this.authService.getFirstSignInStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-recommendations-seen')
  @HttpCode(HttpStatus.OK)
  async markRecommendationsSeen(@CurrentUserId() userId: string) {
    return this.authService.markRecommendationsSeen(userId);
  }

  // Google OAuth Routes
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
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
  async microsoftAuth(@Req() req) {
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
