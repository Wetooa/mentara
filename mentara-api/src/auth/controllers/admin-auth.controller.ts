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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
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
} from 'mentara-commons';
import { AdminAuthService } from '../services/admin-auth.service';
import { Request } from 'express';

@ApiTags('admin-auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('create-account')
  @ApiOperation({
    summary: 'Create new admin account',
    description: 'Create a new admin account. Only existing admins can create new admin accounts.',
  })
  @ApiBody({
    type: 'object',
    description: 'Admin registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@mentara.com' },
        password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        adminLevel: { type: 'string', enum: ['admin', 'super_admin'], example: 'admin' },
        permissions: { type: 'array', items: { type: 'string' }, example: ['read', 'write'] },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
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
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @ApiForbiddenResponse({ description: 'Only admins can create admin accounts' })
  @ApiTooManyRequestsResponse({ description: 'Too many admin creation attempts' })
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
      registerDto.adminLevel || 'admin',
      registerDto.permissions || [],
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
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticate admin user and return access tokens',
  })
  @ApiBody({
    type: 'object',
    description: 'Admin login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@mentara.com' },
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
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get admin profile',
    description: 'Retrieve the authenticated admin user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        adminLevel: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.adminAuthService.getAdminProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get admin permissions',
    description: 'Retrieve the permissions for the authenticated admin user',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        permissions: { type: 'array', items: { type: 'string' } },
        adminLevel: { type: 'string' },
        canCreateAdmins: { type: 'boolean' },
        canModifyUsers: { type: 'boolean' },
        canAccessAnalytics: { type: 'boolean' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Get('permissions')
  async getPermissions(@CurrentUserId() userId: string) {
    return this.adminAuthService.getAdminPermissions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Retrieve dashboard statistics and metrics for the admin panel',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number' },
        totalTherapists: { type: 'number' },
        totalAdmins: { type: 'number' },
        activeUsers: { type: 'number' },
        pendingApplications: { type: 'number' },
        systemHealth: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing authentication token' })
  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUserId() userId: string) {
    return this.adminAuthService.getAdminDashboardStats(userId);
  }
}
