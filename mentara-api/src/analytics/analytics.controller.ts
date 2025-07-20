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
  PlatformAnalyticsQueryDtoSchema,
  TherapistAnalyticsQueryDtoSchema,
  ClientAnalyticsQueryDtoSchema,
  type PlatformAnalyticsQueryDto,
  type TherapistAnalyticsQueryDto,
  type ClientAnalyticsQueryDto,
} from 'mentara-commons';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
