/**
 * Comprehensive Test Suite for AuditLogsController
 * Tests audit logging functionality and system event management
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditLoggingService } from '../common/services/audit-logging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let auditLogsService: AuditLogsService;
  let auditLoggingService: AuditLoggingService;
  let module: TestingModule;

  // Mock AuditLogsService
  const mockAuditLogsService = {
    createAuditLog: jest.fn(),
    findAuditLogs: jest.fn(),
    createSystemEvent: jest.fn(),
    findSystemEvents: jest.fn(),
    resolveSystemEvent: jest.fn(),
    createDataChangeLog: jest.fn(),
    findDataChangeLogs: jest.fn(),
    getAuditStatistics: jest.fn(),
    logUserLogin: jest.fn(),
    logUserLogout: jest.fn(),
    logProfileUpdate: jest.fn(),
    logSystemError: jest.fn(),
  };

  // Mock AuditLoggingService
  const mockAuditLoggingService = {
    searchAuditLogs: jest.fn(),
    getAuditLogStats: jest.fn(),
    cleanupOldAuditLogs: jest.fn(),
  };

  // Mock Guards
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockAuditLog = {
    id: 'audit_123456789',
    userId: TEST_USER_IDS.CLIENT,
    userRole: 'client',
    action: 'LOGIN',
    entity: 'User',
    entityId: TEST_USER_IDS.CLIENT,
    details: { loginMethod: 'email', ipAddress: '192.168.1.1' },
    timestamp: new Date('2024-02-14T10:00:00Z'),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Test Browser',
  };

  const mockSystemEvent = {
    id: 'event_123456789',
    eventType: 'SECURITY_ALERT',
    severity: 'HIGH',
    component: 'Authentication',
    message: 'Multiple failed login attempts detected',
    metadata: { attempts: 5, userId: TEST_USER_IDS.CLIENT },
    isResolved: false,
    createdAt: new Date('2024-02-14T10:00:00Z'),
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
  };

  const mockDataChangeLog = {
    id: 'change_123456789',
    tableName: 'User',
    recordId: TEST_USER_IDS.CLIENT,
    operation: 'UPDATE',
    oldValues: { firstName: 'John' },
    newValues: { firstName: 'Jonathan' },
    changedBy: TEST_USER_IDS.ADMIN,
    changedAt: new Date('2024-02-14T10:00:00Z'),
    dataClassification: 'SENSITIVE',
  };

  const mockAuditStatistics = {
    totalLogs: 15847,
    logsByAction: {
      LOGIN: 5623,
      LOGOUT: 5421,
      CREATE: 2156,
      UPDATE: 1847,
      DELETE: 156,
      VIEW: 644,
    },
    logsByEntity: {
      User: 8934,
      Session: 3241,
      Booking: 1847,
      Worksheet: 987,
      Community: 838,
    },
    recentActivity: {
      last24Hours: 234,
      last7Days: 1847,
      last30Days: 7643,
    },
    systemEvents: {
      total: 156,
      unresolved: 23,
      critical: 8,
      warnings: 89,
    },
    dataChanges: {
      total: 2847,
      lastWeek: 156,
      byOperation: {
        INSERT: 1234,
        UPDATE: 1456,
        DELETE: 157,
      },
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
        {
          provide: AuditLoggingService,
          useValue: mockAuditLoggingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
    auditLoggingService = module.get<AuditLoggingService>(AuditLoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all services injected', () => {
      expect(auditLogsService).toBeDefined();
      expect(auditLoggingService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuditLogsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', AuditLogsController);
      expect(controllerMetadata).toBe('audit-logs');
    });
  });

  describe('POST /audit-logs', () => {
    const createAuditLogDto = {
      action: 'CREATE',
      entity: 'User',
      entityId: 'user_123',
      details: { field: 'email', oldValue: '', newValue: 'test@example.com' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Test Browser',
    };

    it('should create audit log successfully', async () => {
      mockAuditLogsService.createAuditLog.mockResolvedValue(mockAuditLog);

      const result = await controller.createAuditLog(
        createAuditLogDto,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(result).toEqual(mockAuditLog);
      expect(auditLogsService.createAuditLog).toHaveBeenCalledWith({
        ...createAuditLogDto,
        userId: TEST_USER_IDS.CLIENT,
        userRole: 'client',
      });
    });

    it('should handle service errors during creation', async () => {
      const serviceError = new Error('Failed to create audit log');
      mockAuditLogsService.createAuditLog.mockRejectedValue(serviceError);

      await expect(
        controller.createAuditLog(createAuditLogDto, TEST_USER_IDS.CLIENT, 'client')
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /audit-logs', () => {
    const queryDto = {
      userId: TEST_USER_IDS.CLIENT,
      action: 'LOGIN',
      entity: 'User',
      entityId: TEST_USER_IDS.CLIENT,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-14T23:59:59Z',
      limit: 50,
    };

    it('should find audit logs successfully for admin', async () => {
      const auditLogs = [mockAuditLog];
      mockAuditLogsService.findAuditLogs.mockResolvedValue(auditLogs);

      const result = await controller.findAuditLogs('admin', queryDto);

      expect(result).toEqual(auditLogs);
      expect(auditLogsService.findAuditLogs).toHaveBeenCalledWith(
        queryDto.userId,
        queryDto.action,
        queryDto.entity,
        queryDto.entityId,
        new Date(queryDto.startDate),
        new Date(queryDto.endDate),
        queryDto.limit,
      );
    });

    it('should find audit logs successfully for moderator', async () => {
      const auditLogs = [mockAuditLog];
      mockAuditLogsService.findAuditLogs.mockResolvedValue(auditLogs);

      const result = await controller.findAuditLogs('moderator', queryDto);

      expect(result).toEqual(auditLogs);
    });

    it('should find audit logs for regular users (restricted)', async () => {
      const auditLogs = [mockAuditLog];
      mockAuditLogsService.findAuditLogs.mockResolvedValue(auditLogs);

      const result = await controller.findAuditLogs('client', queryDto);

      expect(result).toEqual(auditLogs);
    });

    it('should handle empty results', async () => {
      mockAuditLogsService.findAuditLogs.mockResolvedValue([]);

      const result = await controller.findAuditLogs('admin', queryDto);

      expect(result).toEqual([]);
    });
  });

  describe('POST /audit-logs/system-events', () => {
    const systemEventDto = {
      eventType: 'SECURITY_ALERT',
      severity: 'HIGH',
      component: 'Authentication',
      message: 'Suspicious login activity detected',
      metadata: { attempts: 5, source: 'multiple_ips' },
    };

    it('should create system event successfully for admin', async () => {
      mockAuditLogsService.createSystemEvent.mockResolvedValue(mockSystemEvent);

      const result = await controller.createSystemEvent(systemEventDto, 'admin');

      expect(result).toEqual(mockSystemEvent);
      expect(auditLogsService.createSystemEvent).toHaveBeenCalledWith(systemEventDto);
    });

    it('should reject non-admin users', async () => {
      await expect(controller.createSystemEvent(systemEventDto, 'client'))
        .rejects.toThrow(UnauthorizedException);

      expect(auditLogsService.createSystemEvent).not.toHaveBeenCalled();
    });
  });

  describe('GET /audit-logs/system-events', () => {
    const systemEventsQuery = {
      eventType: 'SECURITY_ALERT',
      severity: 'HIGH',
      component: 'Authentication',
      isResolved: false,
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-14T23:59:59Z',
      limit: 50,
    };

    it('should find system events successfully for admin', async () => {
      const systemEvents = [mockSystemEvent];
      mockAuditLogsService.findSystemEvents.mockResolvedValue(systemEvents);

      const result = await controller.findSystemEvents('admin', systemEventsQuery);

      expect(result).toEqual(systemEvents);
      expect(auditLogsService.findSystemEvents).toHaveBeenCalledWith(
        systemEventsQuery.eventType,
        systemEventsQuery.severity,
        systemEventsQuery.component,
        systemEventsQuery.isResolved,
        new Date(systemEventsQuery.startDate),
        new Date(systemEventsQuery.endDate),
        systemEventsQuery.limit,
      );
    });

    it('should find system events successfully for moderator', async () => {
      const systemEvents = [mockSystemEvent];
      mockAuditLogsService.findSystemEvents.mockResolvedValue(systemEvents);

      const result = await controller.findSystemEvents('moderator', systemEventsQuery);

      expect(result).toEqual(systemEvents);
    });

    it('should reject non-admin/moderator users', async () => {
      await expect(controller.findSystemEvents('client', systemEventsQuery))
        .rejects.toThrow(UnauthorizedException);

      expect(auditLogsService.findSystemEvents).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /audit-logs/system-events/:id/resolve', () => {
    const resolveDto = {
      resolution: 'Issue resolved by implementing additional security measures',
    };

    it('should resolve system event successfully for admin', async () => {
      const resolvedEvent = { ...mockSystemEvent, isResolved: true };
      mockAuditLogsService.resolveSystemEvent.mockResolvedValue(resolvedEvent);

      const result = await controller.resolveSystemEvent(
        'event_123456789',
        resolveDto,
        TEST_USER_IDS.ADMIN,
        'admin',
      );

      expect(result).toEqual(resolvedEvent);
      expect(auditLogsService.resolveSystemEvent).toHaveBeenCalledWith(
        'event_123456789',
        TEST_USER_IDS.ADMIN,
        resolveDto.resolution,
      );
    });

    it('should reject non-admin users', async () => {
      await expect(controller.resolveSystemEvent(
        'event_123456789',
        resolveDto,
        TEST_USER_IDS.CLIENT,
        'client',
      )).rejects.toThrow(UnauthorizedException);

      expect(auditLogsService.resolveSystemEvent).not.toHaveBeenCalled();
    });
  });

  describe('Data Change Logs', () => {
    describe('POST /audit-logs/data-changes', () => {
      const dataChangeDto = {
        tableName: 'User',
        recordId: 'user_123',
        operation: 'UPDATE',
        oldValues: { firstName: 'John' },
        newValues: { firstName: 'Jonathan' },
        dataClassification: 'SENSITIVE',
      };

      it('should create data change log successfully for admin', async () => {
        mockAuditLogsService.createDataChangeLog.mockResolvedValue(mockDataChangeLog);

        const result = await controller.createDataChangeLog(
          dataChangeDto,
          TEST_USER_IDS.ADMIN,
          'admin',
        );

        expect(result).toEqual(mockDataChangeLog);
        expect(auditLogsService.createDataChangeLog).toHaveBeenCalledWith({
          ...dataChangeDto,
          changedBy: TEST_USER_IDS.ADMIN,
        });
      });

      it('should reject non-admin users', async () => {
        await expect(controller.createDataChangeLog(
          dataChangeDto,
          TEST_USER_IDS.CLIENT,
          'client',
        )).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /audit-logs/data-changes', () => {
      const dataChangesQuery = {
        tableName: 'User',
        recordId: 'user_123',
        operation: 'UPDATE',
        changedBy: TEST_USER_IDS.ADMIN,
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-14T23:59:59Z',
        limit: 50,
      };

      it('should find data change logs successfully for admin', async () => {
        const dataChanges = [mockDataChangeLog];
        mockAuditLogsService.findDataChangeLogs.mockResolvedValue(dataChanges);

        const result = await controller.findDataChangeLogs('admin', dataChangesQuery);

        expect(result).toEqual(dataChanges);
        expect(auditLogsService.findDataChangeLogs).toHaveBeenCalledWith(
          dataChangesQuery.tableName,
          dataChangesQuery.recordId,
          dataChangesQuery.operation,
          dataChangesQuery.changedBy,
          new Date(dataChangesQuery.startDate),
          new Date(dataChangesQuery.endDate),
          dataChangesQuery.limit,
        );
      });

      it('should reject non-admin users', async () => {
        await expect(controller.findDataChangeLogs('client', dataChangesQuery))
          .rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('GET /audit-logs/statistics', () => {
    const statisticsQuery = {
      startDate: '2024-02-01T00:00:00Z',
      endDate: '2024-02-14T23:59:59Z',
    };

    it('should get audit statistics successfully for admin', async () => {
      mockAuditLogsService.getAuditStatistics.mockResolvedValue(mockAuditStatistics);

      const result = await controller.getAuditStatistics('admin', statisticsQuery);

      expect(result).toEqual(mockAuditStatistics);
      expect(auditLogsService.getAuditStatistics).toHaveBeenCalledWith(
        new Date(statisticsQuery.startDate),
        new Date(statisticsQuery.endDate),
      );
    });

    it('should reject non-admin users', async () => {
      await expect(controller.getAuditStatistics('client', statisticsQuery))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Helper Endpoints', () => {
    describe('POST /audit-logs/user-login', () => {
      const loginDto = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      };

      it('should log user login successfully', async () => {
        mockAuditLogsService.logUserLogin.mockResolvedValue(mockAuditLog);

        const result = await controller.logUserLogin(loginDto, TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockAuditLog);
        expect(auditLogsService.logUserLogin).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          loginDto.ipAddress,
          loginDto.userAgent,
        );
      });
    });

    describe('POST /audit-logs/user-logout', () => {
      const logoutDto = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      };

      it('should log user logout successfully', async () => {
        mockAuditLogsService.logUserLogout.mockResolvedValue(mockAuditLog);

        const result = await controller.logUserLogout(logoutDto, TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockAuditLog);
        expect(auditLogsService.logUserLogout).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          logoutDto.ipAddress,
          logoutDto.userAgent,
        );
      });
    });

    describe('POST /audit-logs/profile-update', () => {
      const profileUpdateDto = {
        oldValues: { firstName: 'John' },
        newValues: { firstName: 'Jonathan' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      };

      it('should log profile update successfully', async () => {
        mockAuditLogsService.logProfileUpdate.mockResolvedValue(mockAuditLog);

        const result = await controller.logProfileUpdate(profileUpdateDto, TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockAuditLog);
        expect(auditLogsService.logProfileUpdate).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          profileUpdateDto.oldValues,
          profileUpdateDto.newValues,
          profileUpdateDto.ipAddress,
          profileUpdateDto.userAgent,
        );
      });
    });

    describe('POST /audit-logs/system-error', () => {
      const systemErrorDto = {
        component: 'DatabaseConnection',
        error: {
          name: 'ConnectionError',
          message: 'Failed to connect to database',
          stack: 'Error: Failed to connect\n  at Database.connect',
        },
        metadata: { host: 'db.example.com', port: 5432 },
      };

      it('should log system error successfully for admin', async () => {
        mockAuditLogsService.logSystemError.mockResolvedValue(mockSystemEvent);

        const result = await controller.logSystemError(systemErrorDto, 'admin');

        expect(result).toEqual(mockSystemEvent);
        expect(auditLogsService.logSystemError).toHaveBeenCalledWith(
          systemErrorDto.component,
          expect.any(Error),
          systemErrorDto.metadata,
        );
      });

      it('should reject non-admin users', async () => {
        await expect(controller.logSystemError(systemErrorDto, 'client'))
          .rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Enhanced Search and Statistics', () => {
    describe('GET /audit-logs/enhanced/search', () => {
      const searchQuery = {
        userId: TEST_USER_IDS.CLIENT,
        action: 'LOGIN',
        entity: 'User',
        entityId: TEST_USER_IDS.CLIENT,
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-14T23:59:59Z',
        limit: 50,
        offset: 0,
      };

      it('should search audit logs successfully for admin', async () => {
        const searchResults = { logs: [mockAuditLog], total: 1 };
        mockAuditLoggingService.searchAuditLogs.mockResolvedValue(searchResults);

        const result = await controller.searchAuditLogs('admin', searchQuery);

        expect(result).toEqual(searchResults);
        expect(auditLoggingService.searchAuditLogs).toHaveBeenCalledWith({
          userId: searchQuery.userId,
          action: searchQuery.action,
          entity: searchQuery.entity,
          entityId: searchQuery.entityId,
          startDate: new Date(searchQuery.startDate),
          endDate: new Date(searchQuery.endDate),
          limit: searchQuery.limit,
          offset: searchQuery.offset,
        });
      });

      it('should allow moderator access', async () => {
        const searchResults = { logs: [mockAuditLog], total: 1 };
        mockAuditLoggingService.searchAuditLogs.mockResolvedValue(searchResults);

        const result = await controller.searchAuditLogs('moderator', searchQuery);

        expect(result).toEqual(searchResults);
      });

      it('should reject regular users', async () => {
        await expect(controller.searchAuditLogs('client', searchQuery))
          .rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /audit-logs/enhanced/stats', () => {
      it('should get audit log stats successfully for admin', async () => {
        mockAuditLoggingService.getAuditLogStats.mockResolvedValue(mockAuditStatistics);

        const result = await controller.getAuditLogStats('admin');

        expect(result).toEqual(mockAuditStatistics);
        expect(auditLoggingService.getAuditLogStats).toHaveBeenCalled();
      });

      it('should reject non-admin users', async () => {
        await expect(controller.getAuditLogStats('client'))
          .rejects.toThrow(UnauthorizedException);
      });
    });

    describe('POST /audit-logs/cleanup', () => {
      const cleanupDto = { retentionDays: 90 };

      it('should cleanup old audit logs successfully for admin', async () => {
        const cleanupResult = { deletedCount: 1000, message: 'Cleanup completed' };
        mockAuditLoggingService.cleanupOldAuditLogs.mockResolvedValue(cleanupResult);

        const result = await controller.cleanupOldAuditLogs('admin', cleanupDto);

        expect(result).toEqual(cleanupResult);
        expect(auditLoggingService.cleanupOldAuditLogs).toHaveBeenCalledWith(
          cleanupDto.retentionDays,
        );
      });

      it('should reject non-admin users', async () => {
        await expect(controller.cleanupOldAuditLogs('client', cleanupDto))
          .rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted audit log', async () => {
      mockAuditLogsService.createAuditLog.mockResolvedValue(mockAuditLog);

      const result = await controller.createAuditLog(
        { action: 'CREATE', entity: 'User', entityId: 'user_123' },
        TEST_USER_IDS.CLIENT,
        'client',
      );

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'action', 'timestamp']);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW']).toContain(result.action);
    });

    it('should return properly formatted system event', async () => {
      mockAuditLogsService.createSystemEvent.mockResolvedValue(mockSystemEvent);

      const result = await controller.createSystemEvent(
        {
          eventType: 'SECURITY_ALERT',
          severity: 'HIGH',
          component: 'Auth',
          message: 'Test event',
        },
        'admin',
      );

      TestAssertions.expectValidEntity(result, ['id', 'eventType', 'severity', 'component']);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.severity);
    });

    it('should return properly formatted statistics', async () => {
      mockAuditLogsService.getAuditStatistics.mockResolvedValue(mockAuditStatistics);

      const result = await controller.getAuditStatistics('admin', {});

      expect(result).toHaveProperty('totalLogs');
      expect(result).toHaveProperty('logsByAction');
      expect(result).toHaveProperty('systemEvents');
      expect(typeof result.totalLogs).toBe('number');
      expect(typeof result.logsByAction).toBe('object');
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Audit service temporarily unavailable');
      mockAuditLogsService.findAuditLogs.mockRejectedValue(serviceError);

      await expect(controller.findAuditLogs('admin', {})).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockAuditLogsService.createAuditLog.mockRejectedValue(dbError);

      await expect(controller.createAuditLog(
        { action: 'CREATE', entity: 'User' },
        TEST_USER_IDS.CLIENT,
        'client',
      )).rejects.toThrow(dbError);
    });

    it('should handle validation errors consistently', async () => {
      const validationError = new Error('Invalid audit log data');
      mockAuditLogsService.createSystemEvent.mockRejectedValue(validationError);

      await expect(controller.createSystemEvent(
        {
          eventType: 'SECURITY_ALERT',
          severity: 'HIGH',
          component: 'Auth',
          message: 'Test',
        },
        'admin',
      )).rejects.toThrow(validationError);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete audit lifecycle', async () => {
      // Create audit log
      mockAuditLogsService.createAuditLog.mockResolvedValue(mockAuditLog);
      const createResult = await controller.createAuditLog(
        { action: 'CREATE', entity: 'User', entityId: 'user_123' },
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(createResult.id).toBeDefined();

      // Search audit logs
      mockAuditLogsService.findAuditLogs.mockResolvedValue([mockAuditLog]);
      const searchResult = await controller.findAuditLogs('admin', { userId: TEST_USER_IDS.CLIENT });
      expect(searchResult).toHaveLength(1);

      // Get statistics
      mockAuditLogsService.getAuditStatistics.mockResolvedValue(mockAuditStatistics);
      const statsResult = await controller.getAuditStatistics('admin', {});
      expect(statsResult.totalLogs).toBeGreaterThan(0);
    });

    it('should handle system event lifecycle', async () => {
      // Create system event
      mockAuditLogsService.createSystemEvent.mockResolvedValue(mockSystemEvent);
      const createResult = await controller.createSystemEvent(
        {
          eventType: 'SECURITY_ALERT',
          severity: 'HIGH',
          component: 'Auth',
          message: 'Test event',
        },
        'admin',
      );
      expect(createResult.id).toBeDefined();

      // Find system events
      mockAuditLogsService.findSystemEvents.mockResolvedValue([mockSystemEvent]);
      const findResult = await controller.findSystemEvents('admin', {});
      expect(findResult).toHaveLength(1);

      // Resolve system event
      const resolvedEvent = { ...mockSystemEvent, isResolved: true };
      mockAuditLogsService.resolveSystemEvent.mockResolvedValue(resolvedEvent);
      const resolveResult = await controller.resolveSystemEvent(
        mockSystemEvent.id,
        { resolution: 'Fixed' },
        TEST_USER_IDS.ADMIN,
        'admin',
      );
      expect(resolveResult.isResolved).toBe(true);
    });
  });
});