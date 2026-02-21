import { Controller, Get, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../auth/core/guards/role-based-access.guard';
import { TherapistDashboardAccessGuard } from '../auth/core/guards/therapist-dashboard-access.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import {
  ClientOnly,
  TherapistOnly,
  AdminOnly,
  ModeratorOnly,
} from '../auth/core/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('client')
  @ClientOnly()
  @UseInterceptors(CacheInterceptor)
  getClientDashboard(@CurrentUserId() userId: string) {
    return this.dashboardService.getClientDashboardData(userId);
  }

  @Get('therapist')
  @UseGuards(JwtAuthGuard, TherapistDashboardAccessGuard)
  @UseInterceptors(CacheInterceptor)
  getTherapistDashboard(@CurrentUserId() userId: string) {
    return this.dashboardService.getTherapistDashboardData(userId);
  }

  @Get('therapist/analytics')
  @TherapistOnly()
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate),
    } : undefined;

    return this.dashboardService.getTherapistAnalytics(userId, dateRange);
  }

  @Get('admin')
  @AdminOnly()
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboardData();
  }

  @Get('moderator')
  @ModeratorOnly()
  getModeratorDashboard(@CurrentUserId() userId: string) {
    return this.dashboardService.getModeratorDashboardData(userId);
  }
}
