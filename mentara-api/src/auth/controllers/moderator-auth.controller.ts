import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';
import { Public } from '../decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  RegisterModeratorDtoSchema,
  LoginDtoSchema,
  type RegisterModeratorDto,
  type LoginDto,
} from 'mentara-commons';
import { ModeratorAuthService } from '../services/moderator-auth.service';
import { Request } from 'express';

@Controller('auth/moderator')
export class ModeratorAuthController {
  constructor(private readonly moderatorAuthService: ModeratorAuthService) {}

  @Post('create-account')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 moderator creations per 10 minutes
  @HttpCode(HttpStatus.CREATED)
  async createModeratorAccount(
    @CurrentUserRole() currentUserRole: string,
    @Body(new ZodValidationPipe(RegisterModeratorDtoSchema))
    registerDto: RegisterModeratorDto,
  ) {
    // Only admins can create moderators
    if (currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can create moderator accounts');
    }

    const result = await this.moderatorAuthService.createModeratorAccount(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      registerDto.permissions || [],
      registerDto.assignedCommunities || [],
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
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.moderatorAuthService.loginModerator(
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
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getPermissions(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorPermissions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('assigned-communities')
  async getAssignedCommunities(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getAssignedCommunities(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorDashboardStats(userId);
  }
}
