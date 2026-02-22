import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RevenueAnalyticsService } from './shared/revenue-analytics.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { Public } from '../auth/core/decorators/public.decorator';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  PlatformAnalyticsQueryDtoSchema,
  TherapistAnalyticsQueryDtoSchema,
  ClientAnalyticsQueryDtoSchema,
} from './validation/analytics.schemas';
import type {
  PlatformAnalyticsQueryDto,
  TherapistAnalyticsQueryDto,
  ClientAnalyticsQueryDto,
} from './types';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly revenueAnalyticsService: RevenueAnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    return {
      success: true,
      message: 'Analytics service is healthy',
      timestamp: new Date().toISOString(),
      service: 'analytics',
      endpoints: {
        platform: 'active',
        therapist: 'active',
        client: 'active',
      },
    };
  }

  @Get('platform')
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
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(TherapistAnalyticsQueryDtoSchema))
    query: TherapistAnalyticsQueryDto,
  ) {
    // Allow therapists to view their own analytics or admins to view any
    const targetTherapistId = query.therapistId ?? userId;

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
  getClientAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(ClientAnalyticsQueryDtoSchema))
    query: ClientAnalyticsQueryDto,
  ) {
    // Allow clients to view their own analytics or admins/therapists to view assigned clients
    const targetClientId = query.clientId ?? userId;

    if (role === 'client' && targetClientId !== userId) {
      throw new ForbiddenException(
        'Access denied: Can only view your own analytics',
      );
    }

    if (role !== 'client' && role !== 'therapist' && role !== 'admin') {
      throw new ForbiddenException('Access denied: Invalid role');
    }

    const start = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const end = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.analyticsService.getClientAnalytics(targetClientId, start, end);
  }

  @Get('revenue')
  getRevenueAnalytics(
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(PlatformAnalyticsQueryDtoSchema))
    query: PlatformAnalyticsQueryDto,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Access denied: Admin role required');
    }

    const start = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const end = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.revenueAnalyticsService.getRevenueAnalytics(start, end);
  }

  @Get('user-activity')
  async getUserActivity(
    @CurrentUserRole() role: string,
    @Query(new ZodValidationPipe(PlatformAnalyticsQueryDtoSchema))
    query: PlatformAnalyticsQueryDto,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Access denied: Admin role required');
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dau, mau, totalUsers, activeClients, activeTherapists] =
      await Promise.all([
        this.prisma.user.count({
          where: { lastLoginAt: { gte: dayAgo }, isActive: true },
        }),
        this.prisma.user.count({
          where: { lastLoginAt: { gte: monthAgo }, isActive: true },
        }),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.client.count({
          where: {
            user: { lastLoginAt: { gte: monthAgo }, isActive: true },
          },
        }),
        this.prisma.therapist.count({
          where: {
            status: 'APPROVED',
            user: { lastLoginAt: { gte: monthAgo }, isActive: true },
          },
        }),
      ]);

    return {
      dau,
      mau,
      totalUsers,
      activeClients,
      activeTherapists,
      dauMauRatio: mau > 0 ? Math.round((dau / mau) * 100 * 100) / 100 : 0,
      mauTotalRatio:
        totalUsers > 0 ? Math.round((mau / totalUsers) * 100 * 100) / 100 : 0,
      timestamp: new Date().toISOString(),
    };
  }
}
