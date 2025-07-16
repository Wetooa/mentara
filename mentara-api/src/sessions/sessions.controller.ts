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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateSessionLogDtoSchema,
  FindSessionsQueryDtoSchema,
  UpdateSessionLogDtoSchema,
  EndSessionDtoSchema,
  AddSessionActivityDtoSchema,
  LogUserActivityDtoSchema,
  GetUserActivitiesQueryDtoSchema,
  CreateTherapyProgressDtoSchema,
  GetTherapyProgressQueryDtoSchema,
  GetSessionStatisticsQueryDtoSchema,
  type CreateSessionLogDto,
  type FindSessionsQueryDto,
  type UpdateSessionLogDto,
  type EndSessionDto,
  type AddSessionActivityDto,
  type LogUserActivityDto,
  type GetUserActivitiesQueryDto,
  type CreateTherapyProgressDto,
  type GetTherapyProgressQueryDto,
  type GetSessionStatisticsQueryDto,
} from '@mentara/commons';
import {
  SessionType,
  SessionStatus,
  ActivityType,
  UserActionType,
} from '@prisma/client';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('logs')
  createSessionLog(
    @Body(new ZodValidationPipe(CreateSessionLogDtoSchema))
    body: CreateSessionLogDto,
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
    @Query(new ZodValidationPipe(FindSessionsQueryDtoSchema))
    query: FindSessionsQueryDto,
  ) {
    // Filter based on user role
    let { clientId, therapistId } = query;
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.findAllSessions(
      clientId,
      therapistId,
      query.status,
      query.sessionType,
    );
  }

  @Get('logs/:id')
  findSession(@Param('id') id: string) {
    return this.sessionsService.findSession(id);
  }

  @Patch('logs/:id')
  updateSession(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSessionLogDtoSchema))
    body: UpdateSessionLogDto,
  ) {
    return this.sessionsService.updateSession(id, body);
  }

  @Post('logs/:id/end')
  endSession(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(EndSessionDtoSchema)) body: EndSessionDto,
  ) {
    return this.sessionsService.endSession(id, body.notes, body.quality);
  }

  @Post('logs/:id/activities')
  addSessionActivity(
    @Param('id') sessionId: string,
    @Body(new ZodValidationPipe(AddSessionActivityDtoSchema))
    body: AddSessionActivityDto,
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
    @Body(new ZodValidationPipe(LogUserActivityDtoSchema))
    body: LogUserActivityDto,
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
    @Query(new ZodValidationPipe(GetUserActivitiesQueryDtoSchema))
    query: GetUserActivitiesQueryDto,
  ) {
    return this.sessionsService.getUserActivities(
      userId,
      query.action,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Post('therapy-progress')
  createTherapyProgress(
    @Body(new ZodValidationPipe(CreateTherapyProgressDtoSchema))
    body: CreateTherapyProgressDto,
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
    @Query(new ZodValidationPipe(GetTherapyProgressQueryDtoSchema))
    query: GetTherapyProgressQueryDto,
  ) {
    // Filter based on user role
    let { clientId, therapistId } = query;
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.getTherapyProgress(
      clientId,
      therapistId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Get('statistics')
  getSessionStatistics(
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(GetSessionStatisticsQueryDtoSchema))
    query: GetSessionStatisticsQueryDto,
  ) {
    // Filter based on user role
    let { clientId, therapistId } = query;
    if (userRole === 'client') {
      clientId = userId;
    } else if (userRole === 'therapist') {
      therapistId = userId;
    }

    return this.sessionsService.getSessionStatistics(clientId, therapistId);
  }
}
