import {
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/decorators/current-user-role.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user')
  getUserDashboard(
    @CurrentUserId() userId: string,
    @CurrentUserRole() role: string,
  ) {
    console.log(role);
    if (role !== 'client') {
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
