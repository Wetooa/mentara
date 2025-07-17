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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('user')
  @ApiOperation({
    summary: 'Get user dashboard data',
    description: 'Retrieve dashboard data for client users including session history, progress, and upcoming appointments',
  })
  @ApiResponse({
    status: 200,
    description: 'User dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            profileCompleteness: { type: 'number' },
          },
        },
        therapist: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            specializations: { type: 'array', items: { type: 'string' } },
          },
        },
        sessions: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            completed: { type: 'number' },
            upcoming: { type: 'number' },
            recentSessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        worksheets: {
          type: 'object',
          properties: {
            assigned: { type: 'number' },
            completed: { type: 'number' },
            overdue: { type: 'number' },
            recent: { type: 'array', items: { type: 'object' } },
          },
        },
        progress: {
          type: 'object',
          properties: {
            moodTrend: { type: 'array', items: { type: 'number' } },
            goalProgress: { type: 'number' },
            streakDays: { type: 'number' },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or access denied' })
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
  @ApiOperation({
    summary: 'Get therapist dashboard data',
    description: 'Retrieve dashboard data for therapist users including client overview, session schedule, and practice analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapist dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        therapist: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            specializations: { type: 'array', items: { type: 'string' } },
            verified: { type: 'boolean' },
          },
        },
        clients: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            newThisMonth: { type: 'number' },
            recentClients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  lastSession: { type: 'string', format: 'date-time', nullable: true },
                  progress: { type: 'string' },
                },
              },
            },
          },
        },
        sessions: {
          type: 'object',
          properties: {
            today: { type: 'number' },
            thisWeek: { type: 'number' },
            thisMonth: { type: 'number' },
            upcomingSessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  clientName: { type: 'string' },
                  scheduledTime: { type: 'string', format: 'date-time' },
                  type: { type: 'string' },
                },
              },
            },
          },
        },
        worksheets: {
          type: 'object',
          properties: {
            assigned: { type: 'number' },
            completed: { type: 'number' },
            pendingReview: { type: 'number' },
          },
        },
        analytics: {
          type: 'object',
          properties: {
            averageSessionRating: { type: 'number' },
            clientSatisfaction: { type: 'number' },
            sessionCompletionRate: { type: 'number' },
            responseTime: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or access denied' })
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
  @ApiOperation({
    summary: 'Get admin dashboard data',
    description: 'Retrieve comprehensive dashboard data for admin users including platform statistics, user management, and system health',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        platformStats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalTherapists: { type: 'number' },
            totalClients: { type: 'number' },
            totalModerators: { type: 'number' },
            activeUsers: { type: 'number' },
            newUsersThisMonth: { type: 'number' },
          },
        },
        therapistApplications: {
          type: 'object',
          properties: {
            pending: { type: 'number' },
            approved: { type: 'number' },
            rejected: { type: 'number' },
            recentApplications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        sessionStats: {
          type: 'object',
          properties: {
            totalSessions: { type: 'number' },
            sessionsToday: { type: 'number' },
            sessionsThisWeek: { type: 'number' },
            averageSessionDuration: { type: 'number' },
            sessionsByType: {
              type: 'object',
              properties: {
                video: { type: 'number' },
                audio: { type: 'number' },
                chat: { type: 'number' },
                in_person: { type: 'number' },
              },
            },
          },
        },
        systemHealth: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
            responseTime: { type: 'number' },
            errorRate: { type: 'number' },
            lastBackup: { type: 'string', format: 'date-time' },
          },
        },
        contentModeration: {
          type: 'object',
          properties: {
            pendingReports: { type: 'number' },
            flaggedContent: { type: 'number' },
            moderatorActions: { type: 'number' },
          },
        },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              severity: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or access denied' })
  getAdminDashboard(@CurrentUserRole() role: string) {
    if (role !== 'admin') {
      throw new UnauthorizedException('Access denied');
    }
    return this.dashboardService.getAdminDashboardData();
  }
}
