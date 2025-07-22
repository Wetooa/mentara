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
// Import types from local auth types
import type {
  RegisterAdminDto,
  LoginDto,
  AdminAuthResponse,
} from '../types';

// Import validation schemas from local validation
import {
  RegisterAdminDtoSchema,
  LoginDtoSchema,
} from '../validation';
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
        role: result.user.role as any,
        isEmailVerified: result.user.emailVerified ?? false,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      message: result.message,
    };
  }

  // REMOVED: Duplicate login route - use universal /auth/login instead
  // This was redundant with AuthController.login() which handles all roles

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
