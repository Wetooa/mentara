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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('sessions')
@ApiBearerAuth('JWT-auth')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('logs')
  @ApiOperation({
    summary: 'Create session log',
    description: 'Create a new therapy session log entry',
  })
  @ApiBody({
    description: 'Session log data',
    schema: {
      type: 'object',
      required: ['sessionType', 'status'],
      properties: {
        clientId: {
          type: 'string',
          description: 'Client ID (auto-filled for client users)',
        },
        therapistId: {
          type: 'string',
          description: 'Therapist ID (auto-filled for therapist users)',
        },
        sessionType: {
          type: 'string',
          enum: ['video', 'audio', 'chat', 'in_person'],
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'active', 'completed', 'cancelled'],
        },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        notes: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Session log created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clientId: { type: 'string' },
        therapistId: { type: 'string' },
        sessionType: { type: 'string' },
        status: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid session data' })
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
  @ApiOperation({
    summary: 'Get session logs',
    description:
      'Retrieve session logs with optional filtering. Results are automatically filtered by user role.',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID (admin/therapist only)',
  })
  @ApiQuery({
    name: 'therapistId',
    required: false,
    description: 'Filter by therapist ID (admin/client only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by session status',
  })
  @ApiQuery({
    name: 'sessionType',
    required: false,
    description: 'Filter by session type',
  })
  @ApiResponse({
    status: 200,
    description: 'Session logs retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clientId: { type: 'string' },
          therapistId: { type: 'string' },
          sessionType: { type: 'string' },
          status: { type: 'string' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time', nullable: true },
          duration: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Get session log by ID',
    description: 'Retrieve detailed information about a specific session log',
  })
  @ApiParam({ name: 'id', description: 'Session log ID' })
  @ApiResponse({
    status: 200,
    description: 'Session log retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clientId: { type: 'string' },
        therapistId: { type: 'string' },
        sessionType: { type: 'string' },
        status: { type: 'string' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time', nullable: true },
        duration: { type: 'number', nullable: true },
        notes: { type: 'string', nullable: true },
        rating: { type: 'number', nullable: true },
        activities: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session log not found' })
  findSession(@Param('id') id: string) {
    return this.sessionsService.findSession(id);
  }

  @Patch('logs/:id')
  @ApiOperation({
    summary: 'Update session log',
    description: 'Update an existing session log with new information',
  })
  @ApiParam({ name: 'id', description: 'Session log ID' })
  @ApiBody({
    description: 'Updated session data',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['scheduled', 'active', 'completed', 'cancelled'],
        },
        endTime: { type: 'string', format: 'date-time' },
        notes: { type: 'string' },
        rating: { type: 'number', minimum: 1, maximum: 5 },
        quality: { type: 'number', minimum: 1, maximum: 5 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session log updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session log not found' })
  updateSession(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSessionLogDtoSchema))
    body: UpdateSessionLogDto,
  ) {
    return this.sessionsService.updateSession(id, body);
  }

  @Post('logs/:id/end')
  @ApiOperation({
    summary: 'End session',
    description:
      'Mark a session as completed and add final notes and quality rating',
  })
  @ApiParam({ name: 'id', description: 'Session log ID' })
  @ApiBody({
    description: 'Session completion data',
    schema: {
      type: 'object',
      properties: {
        notes: { type: 'string', description: 'Final session notes' },
        quality: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Session quality rating',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Session ended successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        endTime: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session log not found' })
  endSession(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(EndSessionDtoSchema)) body: EndSessionDto,
  ) {
    return this.sessionsService.endSession(id, body.notes, body.quality);
  }

  @Post('logs/:id/activities')
  @ApiOperation({
    summary: 'Add session activity',
    description:
      'Add an activity or event to a session log for detailed tracking',
  })
  @ApiParam({ name: 'id', description: 'Session log ID' })
  @ApiBody({
    description: 'Activity data',
    schema: {
      type: 'object',
      required: ['activityType'],
      properties: {
        activityType: {
          type: 'string',
          enum: ['discussion', 'exercise', 'assessment', 'break', 'other'],
        },
        description: { type: 'string' },
        duration: { type: 'number', description: 'Duration in minutes' },
        metadata: {
          type: 'object',
          description: 'Additional activity metadata',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Activity added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        sessionId: { type: 'string' },
        activityType: { type: 'string' },
        description: { type: 'string' },
        duration: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session log not found' })
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
  @ApiOperation({
    summary: 'Get session activities',
    description: 'Retrieve all activities and events for a specific session',
  })
  @ApiParam({ name: 'id', description: 'Session log ID' })
  @ApiResponse({
    status: 200,
    description: 'Session activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          activityType: { type: 'string' },
          description: { type: 'string' },
          duration: { type: 'number' },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session log not found' })
  getSessionActivities(@Param('id') sessionId: string) {
    return this.sessionsService.getSessionActivities(sessionId);
  }

  @Post('user-activities')
  @ApiOperation({
    summary: 'Log user activity',
    description:
      'Log user interactions and activities for analytics and session tracking',
  })
  @ApiBody({
    description: 'User activity data',
    schema: {
      type: 'object',
      required: ['action'],
      properties: {
        action: {
          type: 'string',
          enum: [
            'click',
            'view',
            'scroll',
            'form_submit',
            'navigation',
            'other',
          ],
        },
        page: {
          type: 'string',
          description: 'Page or route where action occurred',
        },
        component: { type: 'string', description: 'UI component involved' },
        metadata: { type: 'object', description: 'Additional action metadata' },
        sessionId: { type: 'string', description: 'Associated session ID' },
        deviceInfo: {
          type: 'object',
          description: 'Device and browser information',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User activity logged successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        action: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Get user activities',
    description:
      'Retrieve user activity logs with optional filtering by action type and date range',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action type',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (ISO string)',
  })
  @ApiResponse({
    status: 200,
    description: 'User activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          action: { type: 'string' },
          page: { type: 'string' },
          component: { type: 'string' },
          metadata: { type: 'object' },
          sessionId: { type: 'string', nullable: true },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Create therapy progress entry',
    description:
      'Create a therapy progress entry to track client improvements and milestones',
  })
  @ApiBody({
    description: 'Therapy progress data',
    schema: {
      type: 'object',
      required: ['clientId', 'progressNotes'],
      properties: {
        clientId: { type: 'string' },
        therapistId: {
          type: 'string',
          description: 'Auto-filled for therapist users',
        },
        sessionId: { type: 'string', description: 'Associated session ID' },
        progressNotes: {
          type: 'string',
          description: 'Detailed progress notes',
        },
        goalsAchieved: { type: 'array', items: { type: 'string' } },
        newGoals: { type: 'array', items: { type: 'string' } },
        moodRating: { type: 'number', minimum: 1, maximum: 10 },
        progressRating: { type: 'number', minimum: 1, maximum: 10 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Therapy progress entry created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clientId: { type: 'string' },
        therapistId: { type: 'string' },
        progressNotes: { type: 'string' },
        moodRating: { type: 'number' },
        progressRating: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Get therapy progress',
    description:
      'Retrieve therapy progress entries with optional filtering. Results are automatically filtered by user role.',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID (therapist/admin only)',
  })
  @ApiQuery({
    name: 'therapistId',
    required: false,
    description: 'Filter by therapist ID (client/admin only)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (ISO string)',
  })
  @ApiResponse({
    status: 200,
    description: 'Therapy progress entries retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clientId: { type: 'string' },
          therapistId: { type: 'string' },
          sessionId: { type: 'string', nullable: true },
          progressNotes: { type: 'string' },
          goalsAchieved: { type: 'array', items: { type: 'string' } },
          newGoals: { type: 'array', items: { type: 'string' } },
          moodRating: { type: 'number', nullable: true },
          progressRating: { type: 'number', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Get session statistics',
    description:
      'Retrieve session statistics and analytics. Results are automatically filtered by user role.',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'Filter by client ID (therapist/admin only)',
  })
  @ApiQuery({
    name: 'therapistId',
    required: false,
    description: 'Filter by therapist ID (client/admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSessions: { type: 'number' },
        completedSessions: { type: 'number' },
        cancelledSessions: { type: 'number' },
        averageSessionDuration: { type: 'number' },
        averageSessionRating: { type: 'number' },
        sessionsByType: {
          type: 'object',
          properties: {
            video: { type: 'number' },
            audio: { type: 'number' },
            chat: { type: 'number' },
            in_person: { type: 'number' },
          },
        },
        progressTrend: {
          type: 'object',
          properties: {
            averageMoodRating: { type: 'number' },
            averageProgressRating: { type: 'number' },
            improvementPercentage: { type: 'number' },
          },
        },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
