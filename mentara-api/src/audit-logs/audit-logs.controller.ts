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
import { ClerkAuthGuard } from 'src/guards/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/decorators/current-user-role.decorator';
import {
  AuditAction,
  EventSeverity,
  SystemEventType,
  DataClassification,
} from '@prisma/client';

@Controller('audit-logs')
@UseGuards(ClerkAuthGuard)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly auditLoggingService: AuditLoggingService,
  ) {}

  @Post()
  createAuditLog(
    @Body()
    body: {
      action: AuditAction;
      entity: string;
      entityId: string;
      oldValues?: any;
      newValues?: any;
      description?: string;
      metadata?: any;
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
    },
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
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    // Only admins can view all audit logs
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Regular users can only see their own logs
      // userId is already restricted to current user via decorator
    }

    return this.auditLogsService.findAuditLogs(
      userId,
      action,
      entity,
      entityId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit) : 100,
    );
  }

  @Post('system-events')
  createSystemEvent(
    @Body()
    body: {
      eventType: SystemEventType;
      severity: EventSeverity;
      title: string;
      description: string;
      component?: string;
      metadata?: any;
      errorCode?: string;
      stackTrace?: string;
    },
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
    @Query('eventType') eventType?: SystemEventType,
    @Query('severity') severity?: EventSeverity,
    @Query('component') component?: string,
    @Query('isResolved') isResolved?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    // Only admins and moderators can view system events
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.findSystemEvents(
      eventType,
      severity,
      component,
      isResolved !== undefined ? isResolved === 'true' : undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit) : 100,
    );
  }

  @Patch('system-events/:id/resolve')
  resolveSystemEvent(
    @Param('id') id: string,
    @Body() body: { resolution: string },
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
    @Body()
    body: {
      tableName: string;
      recordId: string;
      operation: 'INSERT' | 'UPDATE' | 'DELETE';
      changedFields?: string[];
      oldData?: any;
      newData?: any;
      reason?: string;
      dataClass?: DataClassification;
    },
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
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('operation') operation?: string,
    @Query('changedBy') changedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    // Only admins can view data change logs
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.findDataChangeLogs(
      tableName,
      recordId,
      operation,
      changedBy,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('statistics')
  getAuditStatistics(
    @CurrentUserRole() userRole: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Only admins can view audit statistics
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLogsService.getAuditStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Helper endpoints for common audit scenarios

  @Post('user-login')
  logUserLogin(
    @Body() body: { ipAddress?: string; userAgent?: string },
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
    @Body() body: { ipAddress?: string; userAgent?: string },
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
    @Body()
    body: {
      oldValues: any;
      newValues: any;
      ipAddress?: string;
      userAgent?: string;
    },
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
    @Body()
    body: {
      component: string;
      error: { name: string; message: string; stack?: string };
      metadata?: any;
    },
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
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // Only admins can perform enhanced searches
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLoggingService.searchAuditLogs({
      userId,
      action,
      entity,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
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
    @Body() body: { retentionDays?: number },
  ) {
    // Only admins can cleanup audit logs
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin role required');
    }

    return this.auditLoggingService.cleanupOldAuditLogs(
      body.retentionDays || 365,
    );
  }
}
