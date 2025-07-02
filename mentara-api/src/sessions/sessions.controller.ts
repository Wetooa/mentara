import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ClerkAuthGuard } from 'src/guards/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/decorators/current-user-role.decorator';
import {
  SessionType,
  SessionStatus,
  ActivityType,
  UserActionType,
} from '@prisma/client';

@Controller('sessions')
@UseGuards(ClerkAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('logs')
  createSessionLog(
    @Body()
    body: {
      clientId: string;
      therapistId?: string;
      sessionType: SessionType;
      meetingId?: string;
      platform?: string;
    },
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    // Ensure the user can create session logs
    if (userRole === 'client' && body.clientId !== userId) {
      body.clientId = userId; // Override with actual user ID
    }
    if (userRole === 'therapist' && body.therapistId !== userId) {
      body.therapistId = userId; // Override with actual therapist ID
    }

    return this.sessionsService.createSessionLog(body);
  }

  @Get('logs')
  findAllSessions(
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query('clientId') clientId?: string,
    @Query('therapistId') therapistId?: string,
    @Query('status') status?: SessionStatus,
    @Query('sessionType') sessionType?: SessionType,
  ) {
    // Filter based on user role
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.findAllSessions(
      clientId,
      therapistId,
      status,
      sessionType,
    );
  }

  @Get('logs/:id')
  findSession(@Param('id') id: string) {
    return this.sessionsService.findSession(id);
  }

  @Patch('logs/:id')
  updateSession(
    @Param('id') id: string,
    @Body()
    body: {
      status?: SessionStatus;
      notes?: string;
      quality?: number;
      connectionIssues?: boolean;
      recordingUrl?: string;
    },
  ) {
    return this.sessionsService.updateSession(id, body);
  }

  @Post('logs/:id/end')
  endSession(
    @Param('id') id: string,
    @Body() body: { notes?: string; quality?: number },
  ) {
    return this.sessionsService.endSession(id, body.notes, body.quality);
  }

  @Post('logs/:id/activities')
  addSessionActivity(
    @Param('id') sessionId: string,
    @Body()
    body: {
      activityType: ActivityType;
      description?: string;
      duration?: number;
      metadata?: any;
    },
  ) {
    return this.sessionsService.addSessionActivity(
      sessionId,
      body.activityType,
      body.description,
      body.duration,
      body.metadata,
    );
  }

  @Get('logs/:id/activities')
  getSessionActivities(@Param('id') sessionId: string) {
    return this.sessionsService.getSessionActivities(sessionId);
  }

  @Post('user-activities')
  logUserActivity(
    @Body()
    body: {
      action: UserActionType;
      page?: string;
      component?: string;
      metadata?: any;
      sessionId?: string;
      deviceInfo?: any;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.sessionsService.logUserActivity(
      userId,
      body.action,
      body.page,
      body.component,
      body.metadata,
      body.sessionId,
      body.deviceInfo,
    );
  }

  @Get('user-activities')
  getUserActivities(
    @CurrentUserId() userId: string,
    @Query('action') action?: UserActionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.sessionsService.getUserActivities(
      userId,
      action,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('therapy-progress')
  createTherapyProgress(
    @Body()
    body: {
      clientId: string;
      therapistId: string;
      progressScore: number;
      improvementAreas?: string[];
      concernAreas?: string[];
      goalsSet?: any;
      goalsAchieved?: any;
      nextMilestones?: any;
      moodScore?: number;
      anxietyScore?: number;
      depressionScore?: number;
      functionalScore?: number;
      therapistNotes?: string;
      clientFeedback?: string;
      recommendations?: string[];
    },
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
  ) {
    // Ensure therapist can only create progress for their clients
    if (userRole === 'therapist') {
      body.therapistId = userId;
    }

    return this.sessionsService.createTherapyProgress(body);
  }

  @Get('therapy-progress')
  getTherapyProgress(
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query('clientId') clientId?: string,
    @Query('therapistId') therapistId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Filter based on user role
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.getTherapyProgress(
      clientId,
      therapistId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('statistics')
  getSessionStatistics(
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query('clientId') clientId?: string,
    @Query('therapistId') therapistId?: string,
  ) {
    // Filter based on user role
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.getSessionStatistics(clientId, therapistId);
  }
}
