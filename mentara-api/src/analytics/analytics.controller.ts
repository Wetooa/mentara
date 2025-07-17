import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PlatformAnalyticsQueryDtoSchema,
  TherapistAnalyticsQueryDtoSchema,
  ClientAnalyticsQueryDtoSchema,
  type PlatformAnalyticsQueryDto,
  type TherapistAnalyticsQueryDto,
  type ClientAnalyticsQueryDto,
} from 'mentara-commons';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  @ApiOperation({
    summary: 'Get platform analytics',
    description: 'Retrieve comprehensive platform analytics data. Admin access required.',
  })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date for analytics (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date for analytics (ISO string)' })
  @ApiResponse({
    status: 200,
    description: 'Platform analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            newUsers: { type: 'number' },
            activeUsers: { type: 'number' },
            userGrowthRate: { type: 'number' },
          },
        },
        sessionStats: {
          type: 'object',
          properties: {
            totalSessions: { type: 'number' },
            averageSessionDuration: { type: 'number' },
            sessionCompletionRate: { type: 'number' },
          },
        },
        therapistStats: {
          type: 'object',
          properties: {
            totalTherapists: { type: 'number' },
            activeTherapists: { type: 'number' },
            averageRating: { type: 'number' },
          },
        },
        revenue: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number' },
            monthlyRevenue: { type: 'number' },
            revenueGrowth: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied: Admin role required' })
  getPlatformAnalytics(
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(PlatformAnalyticsQueryDtoSchema))
    query: PlatformAnalyticsQueryDto,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Access denied: Admin role required');
    }

    const start = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const end = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.analyticsService.getPlatformAnalytics(start, end);
  }

  @Get('therapist')
  @ApiOperation({
    summary: 'Get therapist analytics',
    description: 'Retrieve analytics for a specific therapist. Therapists can view their own analytics, admins can view any.',
  })
  @ApiQuery({ name: 'therapistId', required: false, description: 'Therapist ID (defaults to current user for therapists)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date for analytics (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date for analytics (ISO string)' })
  @ApiResponse({
    status: 200,
    description: 'Therapist analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        therapistInfo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            specializations: { type: 'array', items: { type: 'string' } },
          },
        },
        clientStats: {
          type: 'object',
          properties: {
            totalClients: { type: 'number' },
            activeClients: { type: 'number' },
            newClients: { type: 'number' },
            clientRetentionRate: { type: 'number' },
          },
        },
        sessionMetrics: {
          type: 'object',
          properties: {
            totalSessions: { type: 'number' },
            averageSessionDuration: { type: 'number' },
            sessionRating: { type: 'number' },
            completionRate: { type: 'number' },
          },
        },
        performanceMetrics: {
          type: 'object',
          properties: {
            responseTime: { type: 'number' },
            clientSatisfaction: { type: 'number' },
            treatmentEffectiveness: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only view your own analytics or admin access required' })
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(TherapistAnalyticsQueryDtoSchema))
    query: TherapistAnalyticsQueryDto,
  ) {
    // Allow therapists to view their own analytics or admins to view any
    const targetTherapistId = query.therapistId || userId;

    if (role === 'therapist' && targetTherapistId !== userId) {
      throw new ForbiddenException(
        'Access denied: Can only view your own analytics',
      );
    }

    if (role !== 'therapist' && role !== 'admin') {
      throw new ForbiddenException(
        'Access denied: Therapist or Admin role required',
      );
    }

    const start = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const end = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.analyticsService.getTherapistAnalytics(
      targetTherapistId,
      start,
      end,
    );
  }

  @Get('client')
  @ApiOperation({
    summary: 'Get client analytics',
    description: 'Retrieve analytics for a specific client. Clients can view their own analytics, therapists/admins can view assigned clients.',
  })
  @ApiQuery({ name: 'clientId', required: false, description: 'Client ID (defaults to current user for clients)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date for analytics (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date for analytics (ISO string)' })
  @ApiResponse({
    status: 200,
    description: 'Client analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        clientInfo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            joinDate: { type: 'string', format: 'date-time' },
          },
        },
        sessionHistory: {
          type: 'object',
          properties: {
            totalSessions: { type: 'number' },
            completedSessions: { type: 'number' },
            cancelledSessions: { type: 'number' },
            averageSessionRating: { type: 'number' },
          },
        },
        progressMetrics: {
          type: 'object',
          properties: {
            moodTrend: { type: 'array', items: { type: 'number' } },
            goalAchievements: { type: 'number' },
            improvementScore: { type: 'number' },
            worksheetsCompleted: { type: 'number' },
          },
        },
        engagementStats: {
          type: 'object',
          properties: {
            loginFrequency: { type: 'number' },
            messagesSent: { type: 'number' },
            averageResponseTime: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied: Can only view your own analytics or authorized access required' })
  getClientAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(ClientAnalyticsQueryDtoSchema))
    query: ClientAnalyticsQueryDto,
  ) {
    // Allow clients to view their own analytics or admins/therapists to view assigned clients
    const targetClientId = query.clientId || userId;

    if (role === 'user' && targetClientId !== userId) {
      throw new ForbiddenException(
        'Access denied: Can only view your own analytics',
      );
    }

    if (role !== 'user' && role !== 'therapist' && role !== 'admin') {
      throw new ForbiddenException('Access denied: Invalid role');
    }

    const start = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const end = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.analyticsService.getClientAnalytics(targetClientId, start, end);
  }
}
