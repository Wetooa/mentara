import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleBasedAccessGuard } from '../auth/guards/role-based-access.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import {
  ClientOnly,
  TherapistOnly,
  AdminOnly,
  ModeratorOnly,
} from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleBasedAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('client')
  @ClientOnly()
  getClientDashboard(@CurrentUserId() userId: string) {
    return this.dashboardService.getClientDashboardData(userId);
  }

  @Get('therapist')
  @TherapistOnly()
  getTherapistDashboard(@CurrentUserId() userId: string) {
    return this.dashboardService.getTherapistDashboardData(userId);
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
