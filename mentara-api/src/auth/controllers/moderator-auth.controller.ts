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
  RegisterModeratorDtoSchema,
  LoginDtoSchema,
  type RegisterModeratorDto,
  type LoginDto,
} from 'mentara-commons';
import { ModeratorAuthService } from '../services/moderator-auth.service';
import { Request } from 'express';

@ApiTags('moderator-auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth/moderator')
export class ModeratorAuthController {
  constructor(private readonly moderatorAuthService: ModeratorAuthService) {}

  @Post('create-account')
  @ApiOperation({
    summary: 'Create new moderator account',
    description:
      'Create a new moderator account. Only admins can create moderator accounts.',
  })
  @ApiBody({
    type: 'object',
    description: 'Moderator registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'moderator@mentara.com',
        },
        password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
        firstName: { type: 'string', example: 'Jane' },
        lastName: { type: 'string', example: 'Smith' },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['moderate_posts', 'ban_users'],
        },
        assignedCommunities: {
          type: 'array',
          items: { type: 'string' },
          example: ['community1', 'community2'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Moderator account created successfully',
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
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @ApiForbiddenResponse({
    description: 'Only admins can create moderator accounts',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many moderator creation attempts',
  })
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
      (registerDto as any).permissions || [],
      (registerDto as any).assignedCommunities || [],
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
    summary: 'Moderator login',
    description: 'Authenticate moderator user and return access tokens',
  })
  @ApiBody({
    type: 'object',
    description: 'Moderator login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'moderator@mentara.com',
        },
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
  @ApiOperation({
    summary: 'Get moderator profile',
    description:
      'Retrieve the authenticated moderator user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Moderator profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        role: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        assignedCommunities: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string', format: 'date-time' },
        lastLoginAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get moderator permissions',
    description:
      'Retrieve the permissions for the authenticated moderator user',
  })
  @ApiResponse({
    status: 200,
    description: 'Moderator permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        permissions: { type: 'array', items: { type: 'string' } },
        canModeratePosts: { type: 'boolean' },
        canBanUsers: { type: 'boolean' },
        canDeleteComments: { type: 'boolean' },
        canAccessReports: { type: 'boolean' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @Get('permissions')
  async getPermissions(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorPermissions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get assigned communities',
    description:
      'Retrieve the communities assigned to the authenticated moderator',
  })
  @ApiResponse({
    status: 200,
    description: 'Assigned communities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        assignedCommunities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              memberCount: { type: 'number' },
              pendingPosts: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @Get('assigned-communities')
  async getAssignedCommunities(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getAssignedCommunities(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get moderator dashboard statistics',
    description:
      'Retrieve dashboard statistics and metrics for the moderator panel',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPostsModerated: { type: 'number' },
        pendingReports: { type: 'number' },
        communitiesManaged: { type: 'number' },
        usersModerated: { type: 'number' },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              communityId: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication token',
  })
  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUserId() userId: string) {
    return this.moderatorAuthService.getModeratorDashboardStats(userId);
  }
}
