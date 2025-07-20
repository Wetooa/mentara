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
  RegisterAdminDtoSchema,
  LoginDtoSchema,
  type RegisterAdminDto,
  type LoginDto,
  type AdminAuthResponse,
} from 'mentara-commons';
import { AdminAuthService } from '../services/admin-auth.service';
import { Request } from 'express';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('create-account')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 admin creations per 10 minutes
  @HttpCode(HttpStatus.CREATED)
  async createAdminAccount(
    @CurrentUserRole() currentUserRole: string,
    @Body(new ZodValidationPipe(RegisterAdminDtoSchema))
    registerDto: RegisterAdminDto,
  ) {
    // Only super admins can create other admins
    if (currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can create admin accounts');
    }

    const result = await this.adminAuthService.createAdminAccount(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      (registerDto as any).adminLevel || 'admin',
      (registerDto as any).permissions || [],
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
  ): Promise<AdminAuthResponse> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    const result = await this.adminAuthService.loginAdmin(
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
      token: result.token, // Single JWT token
      message: 'Admin login successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string): Promise<any> {
    // TODO: Add AdminProfileResponse schema
    return this.adminAuthService.getAdminProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getPermissions(@CurrentUserId() userId: string) {
    return this.adminAuthService.getAdminPermissions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUserId() userId: string) {
    return this.adminAuthService.getAdminDashboardStats(userId);
  }
}
