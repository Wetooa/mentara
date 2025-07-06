import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  AuditAction,
  EventSeverity,
  SystemEventType,
  DataClassification,
} from '@prisma/client';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAuditLog', () => {
    const mockAuditData = {
      action: AuditAction.USER_LOGIN,
      entity: 'User',
      entityId: TEST_USER_IDS.CLIENT,
      userId: TEST_USER_IDS.CLIENT,
      description: 'User logged in',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    const mockUser = {
      id: TEST_USER_IDS.CLIENT,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'client',
    };

    it('should successfully create an audit log', async () => {
      const expectedResult = {
        id: 'audit-log-id',
        ...mockAuditData,
        createdAt: new Date(),
        user: mockUser,
      };

      (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createAuditLog(mockAuditData);

      expect(result).toEqual(expectedResult);
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: mockAuditData,
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
    });

    it('should create audit log without optional fields', async () => {
      const minimalData = {
        action: AuditAction.USER_LOGOUT,
        entity: 'User',
        entityId: TEST_USER_IDS.CLIENT,
      };

      const expectedResult = {
        id: 'audit-log-id',
        ...minimalData,
        createdAt: new Date(),
        user: null,
      };

      (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createAuditLog(minimalData);

      expect(result).toEqual(expectedResult);
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: minimalData,
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
    });

    it('should handle audit log with old and new values', async () => {
      const auditDataWithChanges = {
        ...mockAuditData,
        action: AuditAction.USER_UPDATE_PROFILE,
        oldValues: { name: 'Old Name' },
        newValues: { name: 'New Name' },
        metadata: { sessionId: 'session-123' },
      };

      const expectedResult = {
        id: 'audit-log-id',
        ...auditDataWithChanges,
        createdAt: new Date(),
        user: mockUser,
      };

      (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createAuditLog(auditDataWithChanges);

      expect(result).toEqual(expectedResult);
      expect(prismaService.auditLog.create).toHaveBeenCalledWith({
        data: auditDataWithChanges,
        include: expect.any(Object),
      });
    });
  });

  describe('findAuditLogs', () => {
    const mockAuditLogs = [
      {
        id: 'audit-1',
        action: AuditAction.USER_LOGIN,
        entity: 'User',
        entityId: TEST_USER_IDS.CLIENT,
        createdAt: new Date(),
        user: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'client',
        },
      },
      {
        id: 'audit-2',
        action: AuditAction.USER_LOGOUT,
        entity: 'User',
        entityId: TEST_USER_IDS.CLIENT,
        createdAt: new Date(),
        user: {
          id: TEST_USER_IDS.CLIENT,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'client',
        },
      },
    ];

    it('should return all audit logs when no filters provided', async () => {
      (prismaService.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      const result = await service.findAuditLogs();

      expect(result).toEqual(mockAuditLogs);
      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
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
        take: 100,
      });
    });

    it('should filter audit logs by user ID', async () => {
      (prismaService.auditLog.findMany as jest.Mock).mockResolvedValue([mockAuditLogs[0]]);

      const result = await service.findAuditLogs(TEST_USER_IDS.CLIENT);

      expect(result).toEqual([mockAuditLogs[0]]);
      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_IDS.CLIENT },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter audit logs by multiple criteria', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prismaService.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      await service.findAuditLogs(
        TEST_USER_IDS.CLIENT,
        AuditAction.USER_LOGIN,
        'User',
        TEST_USER_IDS.CLIENT,
        startDate,
        endDate,
        50,
      );

      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_IDS.CLIENT,
          action: AuditAction.USER_LOGIN,
          entity: 'User',
          entityId: TEST_USER_IDS.CLIENT,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should handle date range filters correctly', async () => {
      const startDate = new Date('2024-01-01');

      (prismaService.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      await service.findAuditLogs(
        undefined,
        undefined,
        undefined,
        undefined,
        startDate,
      );

      expect(prismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: { gte: startDate },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('createSystemEvent', () => {
    const mockSystemEventData = {
      eventType: SystemEventType.THIRD_PARTY_API_ERROR,
      severity: EventSeverity.ERROR,
      title: 'API Error',
      description: 'Third party API failed',
      component: 'PaymentService',
      metadata: { errorCode: 500 },
      errorCode: 'PAY_001',
      stackTrace: 'Error stack trace',
    };

    it('should successfully create a system event', async () => {
      const expectedResult = {
        id: 'system-event-id',
        ...mockSystemEventData,
        createdAt: new Date(),
        isResolved: false,
      };

      (prismaService.systemEvent.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createSystemEvent(mockSystemEventData);

      expect(result).toEqual(expectedResult);
      expect(prismaService.systemEvent.create).toHaveBeenCalledWith({
        data: mockSystemEventData,
      });
    });

    it('should create system event with minimal required fields', async () => {
      const minimalData = {
        eventType: SystemEventType.SERVICE_START,
        severity: EventSeverity.INFO,
        title: 'App Started',
        description: 'Application started successfully',
      };

      const expectedResult = {
        id: 'system-event-id',
        ...minimalData,
        createdAt: new Date(),
        isResolved: false,
      };

      (prismaService.systemEvent.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createSystemEvent(minimalData);

      expect(result).toEqual(expectedResult);
      expect(prismaService.systemEvent.create).toHaveBeenCalledWith({
        data: minimalData,
      });
    });
  });

  describe('findSystemEvents', () => {
    const mockSystemEvents = [
      {
        id: 'event-1',
        eventType: SystemEventType.THIRD_PARTY_API_ERROR,
        severity: EventSeverity.ERROR,
        title: 'API Error',
        description: 'Payment API failed',
        createdAt: new Date(),
        isResolved: false,
      },
      {
        id: 'event-2',
        eventType: SystemEventType.SERVICE_START,
        severity: EventSeverity.INFO,
        title: 'App Started',
        description: 'Application started',
        createdAt: new Date(),
        isResolved: true,
      },
    ];

    it('should return all system events when no filters provided', async () => {
      (prismaService.systemEvent.findMany as jest.Mock).mockResolvedValue(mockSystemEvents);

      const result = await service.findSystemEvents();

      expect(result).toEqual(mockSystemEvents);
      expect(prismaService.systemEvent.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter system events by multiple criteria', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prismaService.systemEvent.findMany as jest.Mock).mockResolvedValue([
        mockSystemEvents[0],
      ]);

      await service.findSystemEvents(
        SystemEventType.THIRD_PARTY_API_ERROR,
        EventSeverity.ERROR,
        'PaymentService',
        false,
        startDate,
        endDate,
        50,
      );

      expect(prismaService.systemEvent.findMany).toHaveBeenCalledWith({
        where: {
          eventType: SystemEventType.THIRD_PARTY_API_ERROR,
          severity: EventSeverity.ERROR,
          component: 'PaymentService',
          isResolved: false,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should handle boolean filter for isResolved', async () => {
      (prismaService.systemEvent.findMany as jest.Mock).mockResolvedValue([
        mockSystemEvents[1],
      ]);

      await service.findSystemEvents(undefined, undefined, undefined, true);

      expect(prismaService.systemEvent.findMany).toHaveBeenCalledWith({
        where: { isResolved: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('resolveSystemEvent', () => {
    it('should successfully resolve a system event', async () => {
      const resolvedEvent = {
        id: 'event-id',
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: TEST_USER_IDS.ADMIN,
        resolution: 'Fixed API endpoint',
      };

      (prismaService.systemEvent.update as jest.Mock).mockResolvedValue(resolvedEvent);

      const result = await service.resolveSystemEvent(
        'event-id',
        TEST_USER_IDS.ADMIN,
        'Fixed API endpoint',
      );

      expect(result).toEqual(resolvedEvent);
      expect(prismaService.systemEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-id' },
        data: {
          isResolved: true,
          resolvedAt: expect.any(Date),
          resolvedBy: TEST_USER_IDS.ADMIN,
          resolution: 'Fixed API endpoint',
        },
      });
    });
  });

  describe('createDataChangeLog', () => {
    const mockDataChangeData = {
      tableName: 'users',
      recordId: TEST_USER_IDS.CLIENT,
      operation: 'UPDATE' as const,
      changedFields: ['firstName', 'lastName'],
      oldData: { firstName: 'Old', lastName: 'Name' },
      newData: { firstName: 'New', lastName: 'Name' },
      changedBy: TEST_USER_IDS.ADMIN,
      reason: 'Profile update',
      dataClass: DataClassification.CONFIDENTIAL,
    };

    it('should successfully create a data change log', async () => {
      const expectedResult = {
        id: 'data-change-id',
        ...mockDataChangeData,
        createdAt: new Date(),
      };

      (prismaService.dataChangeLog.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createDataChangeLog(mockDataChangeData);

      expect(result).toEqual(expectedResult);
      expect(prismaService.dataChangeLog.create).toHaveBeenCalledWith({
        data: mockDataChangeData,
      });
    });

    it('should default to INTERNAL data classification when not provided', async () => {
      const dataWithoutClass = {
        tableName: 'users',
        recordId: TEST_USER_IDS.CLIENT,
        operation: 'INSERT' as const,
      };

      const expectedResult = {
        id: 'data-change-id',
        ...dataWithoutClass,
        dataClass: DataClassification.INTERNAL,
        createdAt: new Date(),
      };

      (prismaService.dataChangeLog.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.createDataChangeLog(dataWithoutClass);

      expect(result).toEqual(expectedResult);
      expect(prismaService.dataChangeLog.create).toHaveBeenCalledWith({
        data: {
          ...dataWithoutClass,
          dataClass: DataClassification.INTERNAL,
        },
      });
    });
  });

  describe('findDataChangeLogs', () => {
    const mockDataChangeLogs = [
      {
        id: 'change-1',
        tableName: 'users',
        recordId: TEST_USER_IDS.CLIENT,
        operation: 'UPDATE',
        createdAt: new Date(),
      },
      {
        id: 'change-2',
        tableName: 'meetings',
        recordId: 'meeting-id',
        operation: 'INSERT',
        createdAt: new Date(),
      },
    ];

    it('should return all data change logs when no filters provided', async () => {
      (prismaService.dataChangeLog.findMany as jest.Mock).mockResolvedValue(
        mockDataChangeLogs,
      );

      const result = await service.findDataChangeLogs();

      expect(result).toEqual(mockDataChangeLogs);
      expect(prismaService.dataChangeLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });

    it('should filter data change logs by table name and operation', async () => {
      (prismaService.dataChangeLog.findMany as jest.Mock).mockResolvedValue([
        mockDataChangeLogs[0],
      ]);

      await service.findDataChangeLogs('users', undefined, 'UPDATE');

      expect(prismaService.dataChangeLog.findMany).toHaveBeenCalledWith({
        where: {
          tableName: 'users',
          operation: 'UPDATE',
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('Helper Methods', () => {
    describe('logUserLogin', () => {
      it('should create user login audit log', async () => {
        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.USER_LOGIN,
          entity: 'User',
          entityId: TEST_USER_IDS.CLIENT,
          userId: TEST_USER_IDS.CLIENT,
          description: 'User logged in',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logUserLogin(
          TEST_USER_IDS.CLIENT,
          '192.168.1.1',
          'Mozilla/5.0',
        );

        expect(result).toEqual(expectedResult);
        expect(prismaService.auditLog.create).toHaveBeenCalledWith({
          data: {
            action: AuditAction.USER_LOGIN,
            entity: 'User',
            entityId: TEST_USER_IDS.CLIENT,
            userId: TEST_USER_IDS.CLIENT,
            description: 'User logged in',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          },
          include: expect.any(Object),
        });
      });
    });

    describe('logUserLogout', () => {
      it('should create user logout audit log', async () => {
        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.USER_LOGOUT,
          entity: 'User',
          entityId: TEST_USER_IDS.CLIENT,
          userId: TEST_USER_IDS.CLIENT,
          description: 'User logged out',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logUserLogout(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logProfileUpdate', () => {
      it('should create profile update audit log', async () => {
        const oldValues = { firstName: 'Old' };
        const newValues = { firstName: 'New' };

        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.USER_UPDATE_PROFILE,
          entity: 'User',
          entityId: TEST_USER_IDS.CLIENT,
          userId: TEST_USER_IDS.CLIENT,
          oldValues,
          newValues,
          description: 'User updated profile',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logProfileUpdate(
          TEST_USER_IDS.CLIENT,
          oldValues,
          newValues,
        );

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logTherapistApplicationSubmit', () => {
      it('should create therapist application submit audit log', async () => {
        const applicationData = { specializations: ['anxiety', 'depression'] };

        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.THERAPIST_APPLICATION_SUBMIT,
          entity: 'Therapist',
          entityId: TEST_USER_IDS.THERAPIST,
          userId: TEST_USER_IDS.THERAPIST,
          newValues: applicationData,
          description: 'Therapist application submitted',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logTherapistApplicationSubmit(
          TEST_USER_IDS.THERAPIST,
          applicationData,
        );

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logTherapistApplicationReview', () => {
      it('should create therapist application approval audit log', async () => {
        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.THERAPIST_APPLICATION_APPROVE,
          entity: 'Therapist',
          entityId: TEST_USER_IDS.THERAPIST,
          userId: TEST_USER_IDS.ADMIN,
          oldValues: { status: 'pending' },
          newValues: { status: 'approved' },
          description: 'Therapist application approved',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logTherapistApplicationReview(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.ADMIN,
          'approved',
          'pending',
        );

        expect(result).toEqual(expectedResult);
      });

      it('should create therapist application rejection audit log', async () => {
        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.THERAPIST_APPLICATION_REJECT,
          entity: 'Therapist',
          entityId: TEST_USER_IDS.THERAPIST,
          userId: TEST_USER_IDS.ADMIN,
          oldValues: { status: 'pending' },
          newValues: { status: 'rejected' },
          description: 'Therapist application rejected',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logTherapistApplicationReview(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.ADMIN,
          'rejected',
          'pending',
        );

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logMeetingCreate', () => {
      it('should create meeting creation audit log', async () => {
        const meetingData = { title: 'Therapy Session', duration: 60 };

        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.MEETING_CREATE,
          entity: 'Meeting',
          entityId: 'meeting-id',
          userId: TEST_USER_IDS.CLIENT,
          newValues: meetingData,
          description: 'Meeting created',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logMeetingCreate(
          'meeting-id',
          TEST_USER_IDS.CLIENT,
          meetingData,
        );

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logMeetingUpdate', () => {
      it('should create meeting update audit log', async () => {
        const oldValues = { title: 'Old Title' };
        const newValues = { title: 'New Title' };

        const expectedResult = {
          id: 'audit-id',
          action: AuditAction.MEETING_UPDATE,
          entity: 'Meeting',
          entityId: 'meeting-id',
          userId: TEST_USER_IDS.THERAPIST,
          oldValues,
          newValues,
          description: 'Meeting updated',
        };

        (prismaService.auditLog.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logMeetingUpdate(
          'meeting-id',
          TEST_USER_IDS.THERAPIST,
          oldValues,
          newValues,
        );

        expect(result).toEqual(expectedResult);
      });
    });

    describe('logSystemError', () => {
      it('should create system error event', async () => {
        const error = new Error('Payment failed');
        error.name = 'PaymentError';
        error.stack = 'Error stack trace';

        const expectedResult = {
          id: 'system-event-id',
          eventType: SystemEventType.THIRD_PARTY_API_ERROR,
          severity: EventSeverity.ERROR,
          title: 'Error in PaymentService',
          description: 'Payment failed',
          component: 'PaymentService',
          metadata: {
            sessionId: 'session-123',
            errorName: 'PaymentError',
          },
          stackTrace: 'Error stack trace',
        };

        (prismaService.systemEvent.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.logSystemError('PaymentService', error, {
          sessionId: 'session-123',
        });

        expect(result).toEqual(expectedResult);
        expect(prismaService.systemEvent.create).toHaveBeenCalledWith({
          data: {
            eventType: SystemEventType.THIRD_PARTY_API_ERROR,
            severity: EventSeverity.ERROR,
            title: 'Error in PaymentService',
            description: 'Payment failed',
            component: 'PaymentService',
            metadata: {
              sessionId: 'session-123',
              errorName: 'PaymentError',
            },
            stackTrace: 'Error stack trace',
          },
        });
      });
    });
  });

  describe('getAuditStatistics', () => {
    const mockStats = {
      totalLogs: 150,
      actionStats: [
        { action: AuditAction.USER_LOGIN, _count: { action: 50 } },
        { action: AuditAction.USER_LOGOUT, _count: { action: 45 } },
      ],
      entityStats: [
        { entity: 'User', _count: { entity: 80 } },
        { entity: 'Meeting', _count: { entity: 70 } },
      ],
      topUsers: [
        { userId: TEST_USER_IDS.CLIENT, _count: { userId: 25 } },
        { userId: TEST_USER_IDS.THERAPIST, _count: { userId: 20 } },
      ],
    };

    it('should return audit statistics without date filters', async () => {
      (prismaService.auditLog.count as jest.Mock).mockResolvedValue(150);
      (prismaService.auditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce(mockStats.actionStats)
        .mockResolvedValueOnce(mockStats.entityStats)
        .mockResolvedValueOnce(mockStats.topUsers);

      const result = await service.getAuditStatistics();

      expect(result).toEqual({
        totalLogs: 150,
        actionStats: mockStats.actionStats,
        entityStats: mockStats.entityStats,
        topUsers: mockStats.topUsers,
      });

      expect(prismaService.auditLog.count).toHaveBeenCalledWith({ where: {} });
      expect((prismaService.auditLog.groupBy as jest.Mock)).toHaveBeenCalledTimes(3);
    });

    it('should return audit statistics with date filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (prismaService.auditLog.count as jest.Mock).mockResolvedValue(75);
      (prismaService.auditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce(mockStats.actionStats)
        .mockResolvedValueOnce(mockStats.entityStats)
        .mockResolvedValueOnce(mockStats.topUsers);

      const result = await service.getAuditStatistics(startDate, endDate);

      expect(result.totalLogs).toBe(75);

      const expectedWhere = {
        createdAt: { gte: startDate, lte: endDate },
      };

      expect(prismaService.auditLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect((prismaService.auditLog.groupBy as jest.Mock)).toHaveBeenCalledWith({
        by: ['action'],
        where: expectedWhere,
        _count: { action: true },
      });
    });

    it('should handle errors in statistics calculation', async () => {
      (prismaService.auditLog.count as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getAuditStatistics()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in createAuditLog', async () => {
      const mockAuditData = {
        action: AuditAction.USER_LOGIN,
        entity: 'User',
        entityId: TEST_USER_IDS.CLIENT,
      };

      (prismaService.auditLog.create as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.createAuditLog(mockAuditData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle database errors in findAuditLogs', async () => {
      (prismaService.auditLog.findMany as jest.Mock).mockRejectedValue(
        new Error('Query timeout'),
      );

      await expect(service.findAuditLogs()).rejects.toThrow('Query timeout');
    });

    it('should handle database errors in system events', async () => {
      const systemEventData = {
        eventType: SystemEventType.SERVICE_START,
        severity: EventSeverity.INFO,
        title: 'Test Event',
        description: 'Test Description',
      };

      (prismaService.systemEvent.create as jest.Mock).mockRejectedValue(
        new Error('Constraint violation'),
      );

      await expect(service.createSystemEvent(systemEventData)).rejects.toThrow(
        'Constraint violation',
      );
    });
  });
});
