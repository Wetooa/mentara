import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { AuditAction, EventSeverity, SystemEventType, DataClassification } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(data: {
    action: AuditAction;
    entity: string;
    entityId: string;
    userId?: string;
    userRole?: string;
    oldValues?: any;
    newValues?: any;
    description?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAuditLogs(
    userId?: string,
    action?: AuditAction,
    entity?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
  ) {
    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createSystemEvent(data: {
    eventType: SystemEventType;
    severity: EventSeverity;
    title: string;
    description: string;
    component?: string;
    metadata?: any;
    errorCode?: string;
    stackTrace?: string;
  }) {
    return this.prisma.systemEvent.create({
      data,
    });
  }

  async findSystemEvents(
    eventType?: SystemEventType,
    severity?: EventSeverity,
    component?: string,
    isResolved?: boolean,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
  ) {
    const where: any = {};

    if (eventType) where.eventType = eventType;
    if (severity) where.severity = severity;
    if (component) where.component = component;
    if (isResolved !== undefined) where.isResolved = isResolved;
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    return this.prisma.systemEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async resolveSystemEvent(
    id: string,
    resolvedBy: string,
    resolution: string,
  ) {
    return this.prisma.systemEvent.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolution,
      },
    });
  }

  async createDataChangeLog(data: {
    tableName: string;
    recordId: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    changedFields?: string[];
    oldData?: any;
    newData?: any;
    changedBy?: string;
    reason?: string;
    dataClass?: DataClassification;
  }) {
    return this.prisma.dataChangeLog.create({
      data: {
        ...data,
        dataClass: data.dataClass || DataClassification.INTERNAL,
      },
    });
  }

  async findDataChangeLogs(
    tableName?: string,
    recordId?: string,
    operation?: string,
    changedBy?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
  ) {
    const where: any = {};

    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (operation) where.operation = operation;
    if (changedBy) where.changedBy = changedBy;
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    return this.prisma.dataChangeLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Helper methods for common audit scenarios

  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.createAuditLog({
      action: AuditAction.USER_LOGIN,
      entity: 'User',
      entityId: userId,
      userId,
      description: 'User logged in',
      ipAddress,
      userAgent,
    });
  }

  async logUserLogout(userId: string, ipAddress?: string, userAgent?: string) {
    return this.createAuditLog({
      action: AuditAction.USER_LOGOUT,
      entity: 'User',
      entityId: userId,
      userId,
      description: 'User logged out',
      ipAddress,
      userAgent,
    });
  }

  async logProfileUpdate(
    userId: string,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.createAuditLog({
      action: AuditAction.USER_UPDATE_PROFILE,
      entity: 'User',
      entityId: userId,
      userId,
      oldValues,
      newValues,
      description: 'User updated profile',
      ipAddress,
      userAgent,
    });
  }

  async logTherapistApplicationSubmit(
    userId: string,
    applicationData: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.createAuditLog({
      action: AuditAction.THERAPIST_APPLICATION_SUBMIT,
      entity: 'Therapist',
      entityId: userId,
      userId,
      newValues: applicationData,
      description: 'Therapist application submitted',
      ipAddress,
      userAgent,
    });
  }

  async logTherapistApplicationReview(
    therapistId: string,
    reviewedBy: string,
    status: 'approved' | 'rejected',
    oldStatus: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const action = status === 'approved' 
      ? AuditAction.THERAPIST_APPLICATION_APPROVE 
      : AuditAction.THERAPIST_APPLICATION_REJECT;

    return this.createAuditLog({
      action,
      entity: 'Therapist',
      entityId: therapistId,
      userId: reviewedBy,
      oldValues: { status: oldStatus },
      newValues: { status },
      description: `Therapist application ${status}`,
      ipAddress,
      userAgent,
    });
  }

  async logMeetingCreate(
    meetingId: string,
    createdBy: string,
    meetingData: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.createAuditLog({
      action: AuditAction.MEETING_CREATE,
      entity: 'Meeting',
      entityId: meetingId,
      userId: createdBy,
      newValues: meetingData,
      description: 'Meeting created',
      ipAddress,
      userAgent,
    });
  }

  async logMeetingUpdate(
    meetingId: string,
    updatedBy: string,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.createAuditLog({
      action: AuditAction.MEETING_UPDATE,
      entity: 'Meeting',
      entityId: meetingId,
      userId: updatedBy,
      oldValues,
      newValues,
      description: 'Meeting updated',
      ipAddress,
      userAgent,
    });
  }

  async logSystemError(
    component: string,
    error: Error,
    metadata?: any,
  ) {
    return this.createSystemEvent({
      eventType: SystemEventType.THIRD_PARTY_API_ERROR,
      severity: EventSeverity.ERROR,
      title: `Error in ${component}`,
      description: error.message,
      component,
      metadata: {
        ...metadata,
        errorName: error.name,
      },
      stackTrace: error.stack,
    });
  }

  async getAuditStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    const [
      totalLogs,
      actionStats,
      entityStats,
      userStats,
    ] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where,
        _count: { entity: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
        _count: { userId: true },
        take: 10,
        orderBy: { _count: { userId: 'desc' } },
      }),
    ]);

    return {
      totalLogs,
      actionStats,
      entityStats,
      topUsers: userStats,
    };
  }
}