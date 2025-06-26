import { Controller, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ClerkAuthGuard } from '../clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';

@Controller('analytics')
@UseGuards(ClerkAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  getPlatformAnalytics(
    @CurrentUserRole() role: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (role !== 'admin') {
      throw new ForbiddenException('Access denied: Admin role required');
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getPlatformAnalytics(start, end);
  }

  @Get('therapist')
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query('therapistId') therapistId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Allow therapists to view their own analytics or admins to view any
    const targetTherapistId = therapistId || userId;
    
    if (role === 'therapist' && targetTherapistId !== userId) {
      throw new ForbiddenException('Access denied: Can only view your own analytics');
    }
    
    if (role !== 'therapist' && role !== 'admin') {
      throw new ForbiddenException('Access denied: Therapist or Admin role required');
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getTherapistAnalytics(targetTherapistId, start, end);
  }

  @Get('client')
  getClientAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
    @Query('clientId') clientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Allow clients to view their own analytics or admins/therapists to view assigned clients
    const targetClientId = clientId || userId;
    
    if (role === 'user' && targetClientId !== userId) {
      throw new ForbiddenException('Access denied: Can only view your own analytics');
    }
    
    if (role !== 'user' && role !== 'therapist' && role !== 'admin') {
      throw new ForbiddenException('Access denied: Invalid role');
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getClientAnalytics(targetClientId, start, end);
  }
}