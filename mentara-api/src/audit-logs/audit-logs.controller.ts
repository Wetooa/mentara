import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLoggingService } from '../common/services/audit-logging.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  FindAuditLogsQueryDtoSchema,
  FindSystemEventsQueryDtoSchema,
  FindDataChangeLogsQueryDtoSchema,
  GetAuditStatisticsQueryDtoSchema,
  SearchAuditLogsQueryDtoSchema,
  CreateAuditLogDtoSchema,
  CreateSystemEventDtoSchema,
  ResolveSystemEventDtoSchema,
  CreateDataChangeLogDtoSchema,
  LogUserLoginDtoSchema,
  LogUserLogoutDtoSchema,
  LogProfileUpdateDtoSchema,
  LogSystemErrorDtoSchema,
  CleanupAuditLogsDtoSchema,
  type FindAuditLogsQueryDto,
  type FindSystemEventsQueryDto,
  type FindDataChangeLogsQueryDto,
  type GetAuditStatisticsQueryDto,
  type SearchAuditLogsQueryDto,
  type CreateAuditLogDto,
  type CreateSystemEventDto,
  type ResolveSystemEventDto,
  type CreateDataChangeLogDto,
  type LogUserLoginDto,
  type LogUserLogoutDto,
  type LogProfileUpdateDto,
  type LogSystemErrorDto,
  type CleanupAuditLogsDto,
} from '@mentara/commons';
import {
  AuditAction,
  EventSeverity,
  SystemEventType,
  DataClassification,
} from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly auditLoggingService: AuditLoggingService,
  ) {}

  @Post()
  createAuditLog(
    @Body(new ZodValidationPipe(CreateAuditLogDtoSchema))
    body: CreateAuditLogDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    return this.auditLogsService.createAuditLog({
      ...body,
      userId,
      userRole,
    });
  }

  @Get()
  findAuditLogs(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(FindAuditLogsQueryDtoSchema))
    query: FindAuditLogsQueryDto,
  ) {
    // Only admins can view all audit logs
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Regular users can only see their own logs
      // userId is already restricted to current user via decorator
    }

    return this.auditLogsService.findAuditLogs(
      query.userId,
      query.action,
      query.entity,
      query.entityId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
    );
  }

  @Post('system-events')
  createSystemEvent(
    @Body(new ZodValidationPipe(CreateSystemEventDtoSchema))
    body: CreateSystemEventDto,
    @CurrentUserRole() userRole: string,
  ) {
    // Only admins can create system events manually
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.createSystemEvent(body);
  }

  @Get('system-events')
  findSystemEvents(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(FindSystemEventsQueryDtoSchema))
    query: FindSystemEventsQueryDto,
  ) {
    // Only admins and moderators can view system events
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.findSystemEvents(
      query.eventType,
      query.severity,
      query.component,
      query.isResolved,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
    );
  }

  @Patch('system-events/:id/resolve')
  resolveSystemEvent(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ResolveSystemEventDtoSchema))
    body: ResolveSystemEventDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    // Only admins can resolve system events
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.resolveSystemEvent(
      id,
      userId,
      body.resolution,
    );
  }

  @Post('data-changes')
  createDataChangeLog(
    @Body(new ZodValidationPipe(CreateDataChangeLogDtoSchema))
    body: CreateDataChangeLogDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    // Only admins can create data change logs manually
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.createDataChangeLog({
      ...body,
      changedBy: userId,
    });
  }

  @Get('data-changes')
  findDataChangeLogs(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(FindDataChangeLogsQueryDtoSchema))
    query: FindDataChangeLogsQueryDto,
  ) {
    // Only admins can view data change logs
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.findDataChangeLogs(
      query.tableName,
      query.recordId,
      query.operation,
      query.changedBy,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
      query.limit,
    );
  }

  @Get('statistics')
  getAuditStatistics(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(GetAuditStatisticsQueryDtoSchema))
    query: GetAuditStatisticsQueryDto,
  ) {
    // Only admins can view audit statistics
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.getAuditStatistics(
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  // Helper endpoints for common audit scenarios

  @Post('user-login')
  logUserLogin(
    @Body(new ZodValidationPipe(LogUserLoginDtoSchema)) body: LogUserLoginDto,
    @CurrentUserId() userId: string,
  ) {
    return this.auditLogsService.logUserLogin(
      userId,
      body.ipAddress,
      body.userAgent,
    );
  }

  @Post('user-logout')
  logUserLogout(
    @Body(new ZodValidationPipe(LogUserLogoutDtoSchema)) body: LogUserLogoutDto,
    @CurrentUserId() userId: string,
  ) {
    return this.auditLogsService.logUserLogout(
      userId,
      body.ipAddress,
      body.userAgent,
    );
  }

  @Post('profile-update')
  logProfileUpdate(
    @Body(new ZodValidationPipe(LogProfileUpdateDtoSchema))
    body: LogProfileUpdateDto,
    @CurrentUserId() userId: string,
  ) {
    return this.auditLogsService.logProfileUpdate(
      userId,
      body.oldValues,
      body.newValues,
      body.ipAddress,
      body.userAgent,
    );
  }

  @Post('system-error')
  logSystemError(
    @Body(new ZodValidationPipe(LogSystemErrorDtoSchema))
    body: LogSystemErrorDto,
    @CurrentUserRole() userRole: string,
  ) {
    // Only system or admins can log system errors
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    const error = new Error(body.error.message);
    error.name = body.error.name;
    error.stack = body.error.stack;

    return this.auditLogsService.logSystemError(
      body.component,
      error,
      body.metadata,
    );
  }

  // Enhanced search using audit logging service
  @Get('enhanced/search')
  searchAuditLogs(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(SearchAuditLogsQueryDtoSchema))
    query: SearchAuditLogsQueryDto,
  ) {
    // Only admins can perform enhanced searches
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLoggingService.searchAuditLogs({
      userId: query.userId,
      action: query.action,
      entity: query.entity,
      entityId: query.entityId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('enhanced/stats')
  getAuditLogStats(@CurrentUserRole() userRole: string) {
    // Only admins can view enhanced statistics
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLoggingService.getAuditLogStats();
  }

  @Post('cleanup')
  cleanupOldAuditLogs(
    @CurrentUserRole() userRole: string,
    @Body(new ZodValidationPipe(CleanupAuditLogsDtoSchema))
    body: CleanupAuditLogsDto,
  ) {
    // Only admins can cleanup audit logs
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLoggingService.cleanupOldAuditLogs(body.retentionDays);
  }
}
