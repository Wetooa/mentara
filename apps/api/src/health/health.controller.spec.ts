/**
 * Comprehensive Test Suite for HealthController
 * Tests health check endpoints for monitoring system status
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;
  let module: TestingModule;

  // Mock HealthService
  const mockHealthService = {
    getBasicHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
    getDatabaseHealth: jest.fn(),
    getServicesHealth: jest.fn(),
    getSystemMetrics: jest.fn(),
    getAdminHealthDashboard: jest.fn(),
  };

  // Test data
  const mockBasicHealth = {
    status: 'ok',
    timestamp: '2024-02-14T10:00:00Z',
    uptime: 86400, // 24 hours in seconds
    version: '1.0.0',
  };

  const mockDetailedHealth = {
    status: 'ok',
    timestamp: '2024-02-14T10:00:00Z',
    uptime: 86400,
    version: '1.0.0',
    database: {
      status: 'connected',
      responseTime: 45,
      connections: 12,
    },
    services: {
      supabase: 'ok',
      stripe: 'ok',
      emailService: 'ok',
    },
    system: {
      memory: {
        used: 2147483648, // 2GB
        total: 8589934592, // 8GB
        percentage: 25,
      },
      cpu: {
        usage: 15.5,
        loadAverage: [0.8, 0.9, 1.1],
      },
    },
  };

  const mockUnhealthyDetailed = {
    status: 'error',
    timestamp: '2024-02-14T10:00:00Z',
    errors: ['Database connection failed', 'Email service unreachable'],
  };

  const mockDatabaseHealth = {
    status: 'connected',
    responseTime: 32,
    connections: {
      active: 8,
      idle: 4,
      total: 12,
    },
    queryStats: {
      totalQueries: 15847,
      averageQueryTime: 23.5,
      slowQueries: 12,
    },
    lastBackup: '2024-02-14T03:00:00Z',
  };

  const mockDatabaseUnhealthy = {
    status: 'disconnected',
    error: 'Connection timeout',
    timestamp: '2024-02-14T10:00:00Z',
  };

  const mockServicesHealth = {
    supabase: {
      status: 'ok',
      responseTime: 156,
      region: 'us-east-1',
    },
    stripe: {
      status: 'ok',
      responseTime: 234,
      webhooksProcessed: 1247,
    },
    emailService: {
      status: 'ok',
      responseTime: 89,
      emailsSent: 5623,
      failureRate: 0.02,
    },
    aiService: {
      status: 'ok',
      responseTime: 456,
      assessmentsProcessed: 234,
    },
  };

  const mockSystemMetrics = {
    memory: {
      used: 2147483648,
      free: 6442450944,
      total: 8589934592,
      percentage: 25,
    },
    cpu: {
      usage: 15.5,
      loadAverage: [0.8, 0.9, 1.1],
      cores: 4,
    },
    disk: {
      used: 107374182400, // 100GB
      free: 429496729600, // 400GB
      total: 536870912000, // 500GB
      percentage: 20,
    },
    network: {
      bytesReceived: 1073741824,
      bytesSent: 536870912,
      packetsReceived: 1000000,
      packetsSent: 750000,
    },
    nodejs: {
      version: 'v18.17.0',
      uptime: 86400,
      pid: 12345,
    },
  };

  const mockAdminHealth = {
    overview: {
      status: 'healthy',
      uptime: 86400,
      lastRestart: '2024-02-13T10:00:00Z',
      errorRate: 0.01,
    },
    alerts: [
      {
        severity: 'medium',
        message: 'High memory usage detected',
        timestamp: '2024-02-14T09:30:00Z',
        resolved: false,
      },
      {
        severity: 'low',
        message: 'Slow query detected',
        timestamp: '2024-02-14T08:15:00Z',
        resolved: true,
      },
    ],
    performance: {
      averageResponseTime: 156,
      requestsPerMinute: 234,
      activeConnections: 89,
      errorCount: 12,
    },
    resources: {
      memory: mockSystemMetrics.memory,
      cpu: mockSystemMetrics.cpu,
      database: mockDatabaseHealth,
      storage: mockSystemMetrics.disk,
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have healthService injected', () => {
      expect(healthService).toBeDefined();
    });
  });

  describe('Security Configuration', () => {
    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', HealthController);
      expect(controllerMetadata).toBe('health');
    });

    it('should have public endpoints for basic health checks', () => {
      const publicMethods = ['getHealth', 'getDetailedHealth', 'getDatabaseHealth', 'getServicesHealth', 'getSystemMetrics'];
      publicMethods.forEach(method => {
        const isPublic = Reflect.getMetadata('isPublic', controller[method]);
        expect(isPublic).toBe(true);
      });
    });

    it('should have protected admin endpoint', () => {
      const isPublic = Reflect.getMetadata('isPublic', controller.getAdminHealth);
      expect(isPublic).toBeFalsy();
    });
  });

  describe('GET /health', () => {
    it('should return basic health status successfully', async () => {
      mockHealthService.getBasicHealth.mockResolvedValue(mockBasicHealth);

      const result = await controller.getHealth();

      expect(result).toEqual(mockBasicHealth);
      expect(healthService.getBasicHealth).toHaveBeenCalled();
    });

    it('should return proper health structure', async () => {
      mockHealthService.getBasicHealth.mockResolvedValue(mockBasicHealth);

      const result = await controller.getHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
    });

    it('should handle service errors gracefully', async () => {
      const serviceError = new Error('Health service unavailable');
      mockHealthService.getBasicHealth.mockRejectedValue(serviceError);

      await expect(controller.getHealth()).rejects.toThrow(serviceError);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status successfully', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockDetailedHealth);

      const result = await controller.getDetailedHealth();

      expect(result).toEqual(mockDetailedHealth);
      expect(healthService.getDetailedHealth).toHaveBeenCalled();
    });

    it('should return comprehensive health structure', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockDetailedHealth);

      const result = await controller.getDetailedHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('system');
      expect(result.database).toHaveProperty('status');
      expect(result.database).toHaveProperty('responseTime');
      expect(result.system).toHaveProperty('memory');
      expect(result.system).toHaveProperty('cpu');
    });

    it('should throw SERVICE_UNAVAILABLE when status is error', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockUnhealthyDetailed);

      await expect(controller.getDetailedHealth()).rejects.toThrow(HttpException);

      try {
        await controller.getDetailedHealth();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toEqual(mockUnhealthyDetailed);
      }
    });

    it('should validate error response structure', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockUnhealthyDetailed);

      try {
        await controller.getDetailedHealth();
      } catch (error) {
        const response = error.getResponse();
        expect(response).toHaveProperty('status');
        expect(response).toHaveProperty('errors');
        expect(response).toHaveProperty('timestamp');
        expect(response.status).toBe('error');
        expect(Array.isArray(response.errors)).toBe(true);
      }
    });
  });

  describe('GET /health/database', () => {
    it('should return database health status successfully', async () => {
      mockHealthService.getDatabaseHealth.mockResolvedValue(mockDatabaseHealth);

      const result = await controller.getDatabaseHealth();

      expect(result).toEqual(mockDatabaseHealth);
      expect(healthService.getDatabaseHealth).toHaveBeenCalled();
    });

    it('should return database metrics structure', async () => {
      mockHealthService.getDatabaseHealth.mockResolvedValue(mockDatabaseHealth);

      const result = await controller.getDatabaseHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('connections');
      expect(result).toHaveProperty('queryStats');
      expect(result.connections).toHaveProperty('active');
      expect(result.connections).toHaveProperty('idle');
      expect(result.connections).toHaveProperty('total');
      expect(result.queryStats).toHaveProperty('totalQueries');
      expect(result.queryStats).toHaveProperty('averageQueryTime');
    });

    it('should throw SERVICE_UNAVAILABLE when database is disconnected', async () => {
      mockHealthService.getDatabaseHealth.mockResolvedValue(mockDatabaseUnhealthy);

      await expect(controller.getDatabaseHealth()).rejects.toThrow(HttpException);

      try {
        await controller.getDatabaseHealth();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toEqual(mockDatabaseUnhealthy);
      }
    });

    it('should handle database connection timeouts', async () => {
      const timeoutResponse = {
        status: 'disconnected',
        error: 'Connection timeout after 5000ms',
        timestamp: '2024-02-14T10:00:00Z',
      };
      mockHealthService.getDatabaseHealth.mockResolvedValue(timeoutResponse);

      try {
        await controller.getDatabaseHealth();
      } catch (error) {
        expect(error.getResponse().error).toContain('timeout');
      }
    });
  });

  describe('GET /health/services', () => {
    it('should return services health status successfully', async () => {
      mockHealthService.getServicesHealth.mockResolvedValue(mockServicesHealth);

      const result = await controller.getServicesHealth();

      expect(result).toEqual(mockServicesHealth);
      expect(healthService.getServicesHealth).toHaveBeenCalled();
    });

    it('should return services metrics structure', async () => {
      mockHealthService.getServicesHealth.mockResolvedValue(mockServicesHealth);

      const result = await controller.getServicesHealth();

      expect(result).toHaveProperty('supabase');
      expect(result).toHaveProperty('stripe');
      expect(result).toHaveProperty('emailService');
      expect(result).toHaveProperty('aiService');

      // Validate supabase metrics
      expect(result.supabase).toHaveProperty('status');
      expect(result.supabase).toHaveProperty('responseTime');
      expect(result.supabase).toHaveProperty('region');

      // Validate stripe metrics
      expect(result.stripe).toHaveProperty('status');
      expect(result.stripe).toHaveProperty('responseTime');
      expect(result.stripe).toHaveProperty('webhooksProcessed');

      // Validate email service metrics
      expect(result.emailService).toHaveProperty('status');
      expect(result.emailService).toHaveProperty('emailsSent');
      expect(result.emailService).toHaveProperty('failureRate');
    });

    it('should handle mixed service status', async () => {
      const mixedServicesHealth = {
        ...mockServicesHealth,
        emailService: {
          status: 'error',
          responseTime: 5000,
          emailsSent: 5623,
          failureRate: 0.15,
          error: 'SMTP server unreachable',
        },
      };
      mockHealthService.getServicesHealth.mockResolvedValue(mixedServicesHealth);

      const result = await controller.getServicesHealth();

      expect(result.supabase.status).toBe('ok');
      expect(result.emailService.status).toBe('error');
      expect(result.emailService.failureRate).toBeGreaterThan(0.1);
    });

    it('should validate response time metrics', async () => {
      mockHealthService.getServicesHealth.mockResolvedValue(mockServicesHealth);

      const result = await controller.getServicesHealth();

      Object.values(result).forEach((service: any) => {
        expect(service).toHaveProperty('responseTime');
        expect(typeof service.responseTime).toBe('number');
        expect(service.responseTime).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /health/system', () => {
    it('should return system metrics successfully', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(result).toEqual(mockSystemMetrics);
      expect(healthService.getSystemMetrics).toHaveBeenCalled();
    });

    it('should return system metrics structure', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('disk');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('nodejs');

      // Validate memory metrics
      expect(result.memory).toHaveProperty('used');
      expect(result.memory).toHaveProperty('free');
      expect(result.memory).toHaveProperty('total');
      expect(result.memory).toHaveProperty('percentage');

      // Validate CPU metrics
      expect(result.cpu).toHaveProperty('usage');
      expect(result.cpu).toHaveProperty('loadAverage');
      expect(result.cpu).toHaveProperty('cores');
      expect(Array.isArray(result.cpu.loadAverage)).toBe(true);

      // Validate Node.js metrics
      expect(result.nodejs).toHaveProperty('version');
      expect(result.nodejs).toHaveProperty('uptime');
      expect(result.nodejs).toHaveProperty('pid');
    });

    it('should validate memory calculations', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(result.memory.used + result.memory.free).toBe(result.memory.total);
      expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should validate disk calculations', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(result.disk.used + result.disk.free).toBe(result.disk.total);
      expect(result.disk.percentage).toBeGreaterThanOrEqual(0);
      expect(result.disk.percentage).toBeLessThanOrEqual(100);
    });

    it('should validate network metrics', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      expect(typeof result.network.bytesReceived).toBe('number');
      expect(typeof result.network.bytesSent).toBe('number');
      expect(typeof result.network.packetsReceived).toBe('number');
      expect(typeof result.network.packetsSent).toBe('number');
      expect(result.network.bytesReceived).toBeGreaterThanOrEqual(0);
      expect(result.network.bytesSent).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/admin', () => {
    it('should return admin health dashboard successfully', async () => {
      mockHealthService.getAdminHealthDashboard.mockResolvedValue(mockAdminHealth);

      const result = await controller.getAdminHealth();

      expect(result).toEqual(mockAdminHealth);
      expect(healthService.getAdminHealthDashboard).toHaveBeenCalled();
    });

    it('should return admin dashboard structure', async () => {
      mockHealthService.getAdminHealthDashboard.mockResolvedValue(mockAdminHealth);

      const result = await controller.getAdminHealth();

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('resources');

      // Validate overview
      expect(result.overview).toHaveProperty('status');
      expect(result.overview).toHaveProperty('uptime');
      expect(result.overview).toHaveProperty('errorRate');

      // Validate alerts
      expect(Array.isArray(result.alerts)).toBe(true);
      if (result.alerts.length > 0) {
        result.alerts.forEach(alert => {
          expect(alert).toHaveProperty('severity');
          expect(alert).toHaveProperty('message');
          expect(alert).toHaveProperty('timestamp');
          expect(alert).toHaveProperty('resolved');
          expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
        });
      }

      // Validate performance
      expect(result.performance).toHaveProperty('averageResponseTime');
      expect(result.performance).toHaveProperty('requestsPerMinute');
      expect(result.performance).toHaveProperty('activeConnections');
    });

    it('should handle critical alerts', async () => {
      const criticalAlertsHealth = {
        ...mockAdminHealth,
        alerts: [
          {
            severity: 'critical',
            message: 'Database connection pool exhausted',
            timestamp: '2024-02-14T10:00:00Z',
            resolved: false,
          },
          {
            severity: 'critical',
            message: 'Memory usage above 90%',
            timestamp: '2024-02-14T09:45:00Z',
            resolved: false,
          },
        ],
      };
      mockHealthService.getAdminHealthDashboard.mockResolvedValue(criticalAlertsHealth);

      const result = await controller.getAdminHealth();

      const criticalAlerts = result.alerts.filter(alert => alert.severity === 'critical');
      expect(criticalAlerts.length).toBe(2);
      expect(criticalAlerts.every(alert => !alert.resolved)).toBe(true);
    });

    it('should validate performance metrics ranges', async () => {
      mockHealthService.getAdminHealthDashboard.mockResolvedValue(mockAdminHealth);

      const result = await controller.getAdminHealth();

      expect(result.performance.averageResponseTime).toBeGreaterThan(0);
      expect(result.performance.requestsPerMinute).toBeGreaterThanOrEqual(0);
      expect(result.performance.activeConnections).toBeGreaterThanOrEqual(0);
      expect(result.performance.errorCount).toBeGreaterThanOrEqual(0);
      expect(result.overview.errorRate).toBeGreaterThanOrEqual(0);
      expect(result.overview.errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted basic health response', async () => {
      mockHealthService.getBasicHealth.mockResolvedValue(mockBasicHealth);

      const result = await controller.getHealth();

      TestAssertions.expectValidEntity(result, ['status', 'timestamp', 'uptime', 'version']);
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.version).toBe('string');
    });

    it('should return properly formatted detailed health response', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockDetailedHealth);

      const result = await controller.getDetailedHealth();

      TestAssertions.expectValidEntity(result, ['status', 'database', 'services', 'system']);
      expect(typeof result.database.responseTime).toBe('number');
      expect(typeof result.system.memory.percentage).toBe('number');
      expect(Array.isArray(result.system.cpu.loadAverage)).toBe(true);
    });

    it('should return properly formatted system metrics', async () => {
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);

      const result = await controller.getSystemMetrics();

      TestAssertions.expectValidEntity(result, ['memory', 'cpu', 'disk', 'network', 'nodejs']);
      expect(typeof result.nodejs.version).toBe('string');
      expect(typeof result.nodejs.pid).toBe('number');
      expect(result.nodejs.version).toMatch(/^v\d+\.\d+\.\d+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Health service temporarily unavailable');
      mockHealthService.getBasicHealth.mockRejectedValue(serviceError);

      await expect(controller.getHealth()).rejects.toThrow(serviceError);
    });

    it('should handle database connection errors gracefully', async () => {
      const dbError = new Error('Database connection timeout');
      mockHealthService.getDatabaseHealth.mockRejectedValue(dbError);

      await expect(controller.getDatabaseHealth()).rejects.toThrow(dbError);
    });

    it('should handle system metrics collection errors', async () => {
      const metricsError = new Error('Failed to collect system metrics');
      mockHealthService.getSystemMetrics.mockRejectedValue(metricsError);

      await expect(controller.getSystemMetrics()).rejects.toThrow(metricsError);
    });

    it('should properly format error responses', async () => {
      mockHealthService.getDetailedHealth.mockResolvedValue(mockUnhealthyDetailed);

      try {
        await controller.getDetailedHealth();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        
        const response = error.getResponse();
        expect(response).toHaveProperty('status');
        expect(response).toHaveProperty('errors');
        expect(response.status).toBe('error');
        expect(Array.isArray(response.errors)).toBe(true);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete health monitoring workflow', async () => {
      // Basic health check
      mockHealthService.getBasicHealth.mockResolvedValue(mockBasicHealth);
      const basicResult = await controller.getHealth();
      expect(basicResult.status).toBe('ok');

      // Detailed health check
      mockHealthService.getDetailedHealth.mockResolvedValue(mockDetailedHealth);
      const detailedResult = await controller.getDetailedHealth();
      expect(detailedResult.database.status).toBe('connected');

      // System metrics
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);
      const metricsResult = await controller.getSystemMetrics();
      expect(metricsResult.memory.percentage).toBeLessThan(100);

      // Services health
      mockHealthService.getServicesHealth.mockResolvedValue(mockServicesHealth);
      const servicesResult = await controller.getServicesHealth();
      expect(servicesResult.supabase.status).toBe('ok');
    });

    it('should handle degraded system performance scenarios', async () => {
      const degradedHealth = {
        ...mockDetailedHealth,
        system: {
          memory: { ...mockDetailedHealth.system.memory, percentage: 85 },
          cpu: { ...mockDetailedHealth.system.cpu, usage: 90 },
        },
      };
      mockHealthService.getDetailedHealth.mockResolvedValue(degradedHealth);

      const result = await controller.getDetailedHealth();

      expect(result.system.memory.percentage).toBeGreaterThan(80);
      expect(result.system.cpu.usage).toBeGreaterThan(80);
    });

    it('should validate cross-service consistency', async () => {
      // Get system metrics
      mockHealthService.getSystemMetrics.mockResolvedValue(mockSystemMetrics);
      const systemResult = await controller.getSystemMetrics();

      // Get admin dashboard
      const adminHealthWithConsistentData = {
        ...mockAdminHealth,
        resources: {
          memory: systemResult.memory,
          cpu: systemResult.cpu,
          database: mockDatabaseHealth,
          storage: systemResult.disk,
        },
      };
      mockHealthService.getAdminHealthDashboard.mockResolvedValue(adminHealthWithConsistentData);
      const adminResult = await controller.getAdminHealth();

      // Verify consistency between system metrics and admin dashboard
      expect(adminResult.resources.memory).toEqual(systemResult.memory);
      expect(adminResult.resources.cpu).toEqual(systemResult.cpu);
    });
  });
});