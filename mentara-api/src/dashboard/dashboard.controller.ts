import {
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { CurrentUserRole } from '../decorators/current-user-role.decorator';

@Controller('dashboard')
@UseGuards(ClerkAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user')
  getUserDashboard(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'user') {
      throw new UnauthorizedException('Access denied');
    }
    return this.dashboardService.getUserDashboardData(userId);
  }

  @Get('therapist')
  getTherapistDashboard(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    if (role !== 'therapist') {
      throw new UnauthorizedException('Access denied');
    }
    return this.dashboardService.getTherapistDashboardData(userId);
  }

  @Get('admin')
  getAdminDashboard(@CurrentUserRole() role: string) {
    if (role !== 'admin') {
      throw new UnauthorizedException('Access denied');
    }
    return this.dashboardService.getAdminDashboardData();
  }
}
