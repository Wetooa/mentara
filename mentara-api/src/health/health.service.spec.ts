import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { HealthService } from './health.service';
import { PrismaService } from '../providers/prisma-client.provider';
import * as os from 'os';
import * as process from 'process';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: jest.Mocked<PrismaService>;
  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');

  const mockProcessEnv = {
    npm_package_version: '2.1.5',
    NODE_ENV: 'test',
  };

  const mockMemoryUsage = {
    rss: 67108864, // 64MB
    heapTotal: 50331648, // 48MB
    heapUsed: 33554432, // 32MB
    external: 8388608, // 8MB
    arrayBuffers: 1048576, // 1MB
  };

  const mockCpuUsage = {
    user: 1000000, // 1 second in microseconds
    system: 500000, // 0.5 seconds in microseconds
  };

  const mockOsMemory = {
    total: 17179869184, // 16GB
    free: 8589934592, // 8GB
  };

  const mockLoadAverage = [0.85, 1.2, 1.5];
  const mockCpus = Array.from({ length: 8 }, (_, i) => ({
    model: `Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz`,
    speed: 2600,
    times: {
      user: 123456 + i * 1000,
      nice: 0,
      sys: 45678 + i * 500,
      idle: 9876543 + i * 10000,
      irq: 0,
    },
  }));

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get(PrismaService);

    // Mock Date constructor for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // Mock process and os modules
    jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
    jest.spyOn(process, 'cpuUsage').mockReturnValue(mockCpuUsage);
    jest.spyOn(process, 'uptime').mockReturnValue(86400); // 24 hours
    Object.defineProperty(process, 'version', { value: 'v18.17.0' });
    Object.defineProperty(process, 'pid', { value: 12345 });
    Object.defineProperty(process, 'env', { value: mockProcessEnv });

    jest.spyOn(os, 'totalmem').mockReturnValue(mockOsMemory.total);
    jest.spyOn(os, 'freemem').mockReturnValue(mockOsMemory.free);
    jest.spyOn(os, 'loadavg').mockReturnValue(mockLoadAverage);
    jest.spyOn(os, 'cpus').mockReturnValue(mockCpus);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBasicHealth', () => {
    it('should return basic health information', async () => {
      const result = await service.getBasicHealth();

      expect(result).toEqual({
        status: 'ok',
        timestamp: mockDate.toISOString(),
        uptime: 0, // Service just started
        version: '2.1.5',
      });
    });

    it('should calculate uptime correctly', async () => {
      // Advance time by 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      const result = await service.getBasicHealth();

      expect(result.uptime).toBe(300); // 5 minutes in seconds
    });

    it('should use default version when not available', async () => {
      Object.defineProperty(process, 'env', { 
        value: { ...mockProcessEnv, npm_package_version: undefined }
      });

      const result = await service.getBasicHealth();

      expect(result.version).toBe('1.0.0');
    });

    it('should return consistent status', async () => {
      const result1 = await service.getBasicHealth();
      const result2 = await service.getBasicHealth();

      expect(result1.status).toBe('ok');
      expect(result2.status).toBe('ok');
    });

    it('should include valid timestamp format', async () => {
      const result = await service.getBasicHealth();

      expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should handle multiple concurrent calls', async () => {
      const promises = Array.from({ length: 10 }, () => service.getBasicHealth());
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe('ok');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
        expect(result).toHaveProperty('version');
      });

      // All results should have same timestamp (within same millisecond)
      const timestamps = results.map(r => r.timestamp);
      expect(new Set(timestamps).size).toBeLessThanOrEqual(2); // Allow for small timing differences
    });
  });

  describe('getDatabaseHealth', () => {
    beforeEach(() => {
      prismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
    });

    it('should return connected status when database is healthy', async () => {
      const result = await service.getDatabaseHealth();

      expect(result.status).toBe('connected');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('connections');
      expect(result).toHaveProperty('queryStats');
      expect(result).toHaveProperty('lastBackup');
      expect(typeof result.responseTime).toBe('number');
    });

    it('should measure response time accurately', async () => {
      // Mock a slow database response
      prismaService.$queryRaw.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([{ result: 1 }]), 100))
      );

      const startTime = Date.now();
      const result = await service.getDatabaseHealth();
      const actualDuration = Date.now() - startTime;

      expect(result.responseTime).toBeGreaterThan(90);
      expect(result.responseTime).toBeLessThan(actualDuration + 50); // Allow some overhead
    });

    it('should return proper connections structure', async () => {
      const result = await service.getDatabaseHealth();

      expect(result.connections).toEqual({
        active: 5,
        idle: 3,
        total: 10,
      });
      expect(result.connections.active + result.connections.idle).toBeLessThanOrEqual(result.connections.total);
    });

    it('should return proper query statistics', async () => {
      const result = await service.getDatabaseHealth();

      expect(result.queryStats).toEqual({
        totalQueries: 1543,
        averageQueryTime: 45,
        slowQueries: 2,
      });
      expect(result.queryStats.totalQueries).toBeGreaterThan(0);
      expect(result.queryStats.averageQueryTime).toBeGreaterThan(0);
      expect(result.queryStats.slowQueries).toBeGreaterThanOrEqual(0);
    });

    it('should include valid backup timestamp', async () => {
      const result = await service.getDatabaseHealth();

      expect(result.lastBackup).toBeDefined();
      expect(typeof result.lastBackup).toBe('string');
      const backupDate = new Date(result.lastBackup);
      expect(backupDate).toBeInstanceOf(Date);
      expect(backupDate.getTime()).toBeLessThan(Date.now());
    });

    it('should handle database connection failures', async () => {
      const dbError = new Error('Connection timeout');
      prismaService.$queryRaw.mockRejectedValue(dbError);

      const result = await service.getDatabaseHealth();

      expect(result.status).toBe('disconnected');
      expect(result.error).toBe('Connection timeout');
      expect(result).toHaveProperty('timestamp');
      expect(result).not.toHaveProperty('responseTime');
      expect(result).not.toHaveProperty('connections');
    });

    it('should handle unknown database errors', async () => {
      prismaService.$queryRaw.mockRejectedValue('String error');

      const result = await service.getDatabaseHealth();

      expect(result.status).toBe('disconnected');
      expect(result.error).toBe('Unknown error');
    });

    it('should log database errors', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');
      prismaService.$queryRaw.mockRejectedValue(dbError);

      await service.getDatabaseHealth();

      expect(loggerSpy).toHaveBeenCalledWith('Database health check failed', dbError);
    });

    it('should handle concurrent database health checks', async () => {
      const promises = Array.from({ length: 5 }, () => service.getDatabaseHealth());
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe('connected');
        expect(result).toHaveProperty('responseTime');
      });
      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(5);
    });

    it('should handle partial database errors gracefully', async () => {
      // Simulate intermittent connectivity
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ result: 1 }])
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce([{ result: 1 }]);

      const result1 = await service.getDatabaseHealth();
      expect(result1.status).toBe('connected');

      const result2 = await service.getDatabaseHealth();
      expect(result2.status).toBe('disconnected');

      const result3 = await service.getDatabaseHealth();
      expect(result3.status).toBe('connected');
    });
  });

  describe('getServicesHealth', () => {
    it('should return health status for all external services', async () => {
      const result = await service.getServicesHealth();

      expect(result).toHaveProperty('supabase');
      expect(result).toHaveProperty('stripe');
      expect(result).toHaveProperty('emailService');
      expect(result).toHaveProperty('aiService');

      Object.values(result).forEach(serviceHealth => {
        expect(serviceHealth).toHaveProperty('status');
        expect(serviceHealth).toHaveProperty('responseTime');
      });
    });

    it('should return proper service health structure', async () => {
      const result = await service.getServicesHealth();

      // Supabase health
      expect(result.supabase.status).toBe('ok');
      expect(result.supabase).toHaveProperty('region');
      expect(result.supabase.region).toBe('us-east-1');

      // Stripe health
      expect(result.stripe.status).toBe('ok');
      expect(result.stripe).toHaveProperty('webhooksProcessed');
      expect(typeof result.stripe.webhooksProcessed).toBe('number');

      // Email service health
      expect(result.emailService.status).toBe('ok');
      expect(result.emailService).toHaveProperty('emailsSent');
      expect(result.emailService).toHaveProperty('failureRate');
      expect(typeof result.emailService.failureRate).toBe('number');

      // AI service health
      expect(result.aiService.status).toBe('ok');
      expect(result.aiService).toHaveProperty('assessmentsProcessed');
      expect(typeof result.aiService.assessmentsProcessed).toBe('number');
    });

    it('should measure response times for all services', async () => {
      const result = await service.getServicesHealth();

      expect(result.supabase.responseTime).toBeGreaterThan(40);
      expect(result.supabase.responseTime).toBeLessThan(70);

      expect(result.stripe.responseTime).toBeGreaterThan(20);
      expect(result.stripe.responseTime).toBeLessThan(50);

      expect(result.emailService.responseTime).toBeGreaterThan(15);
      expect(result.emailService.responseTime).toBeLessThan(45);

      expect(result.aiService.responseTime).toBeGreaterThan(65);
      expect(result.aiService.responseTime).toBeLessThan(95);
    });

    it('should handle concurrent service health checks', async () => {
      const promises = Array.from({ length: 3 }, () => service.getServicesHealth());
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(Object.keys(result)).toHaveLength(4);
        Object.values(result).forEach(serviceHealth => {
          expect(serviceHealth.status).toBe('ok');
        });
      });
    });

    it('should validate service metrics ranges', async () => {
      const result = await service.getServicesHealth();

      expect(result.stripe.webhooksProcessed).toBeGreaterThan(0);
      expect(result.emailService.emailsSent).toBeGreaterThan(0);
      expect(result.emailService.failureRate).toBeGreaterThanOrEqual(0);
      expect(result.emailService.failureRate).toBeLessThanOrEqual(1);
      expect(result.aiService.assessmentsProcessed).toBeGreaterThan(0);
    });
  });

  describe('checkSupabaseHealth', () => {
    it('should return proper Supabase health status', async () => {
      const result = await (service as any).checkSupabaseHealth();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('region');
      expect(result.region).toBe('us-east-1');
      expect(typeof result.responseTime).toBe('number');
    });

    it('should handle Supabase service errors', async () => {
      // Mock a failure by rejecting the promise in the timeout
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (typeof callback === 'function') {
          throw new Error('Supabase API unavailable');
        }
        return {} as any;
      });

      const result = await (service as any).checkSupabaseHealth();

      expect(result.status).toBe('error');
      expect(result.error).toBe('Supabase API unavailable');
      expect(result).not.toHaveProperty('responseTime');
    });

    it('should handle unknown Supabase errors', async () => {
      jest.spyOn(global, 'setTimeout').mockImplementation(() => {
        throw 'String error';
      });

      const result = await (service as any).checkSupabaseHealth();

      expect(result.status).toBe('error');
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('checkStripeHealth', () => {
    it('should return proper Stripe health status', async () => {
      const result = await (service as any).checkStripeHealth();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('webhooksProcessed');
      expect(result.webhooksProcessed).toBe(1247);
      expect(typeof result.responseTime).toBe('number');
    });

    it('should handle Stripe service errors', async () => {
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (delay === 30) {
          throw new Error('Stripe API rate limit exceeded');
        }
        return originalSetTimeout(callback, delay);
      });

      const result = await (service as any).checkStripeHealth();

      expect(result.status).toBe('error');
      expect(result.error).toBe('Stripe API rate limit exceeded');
    });
  });

  describe('checkEmailServiceHealth', () => {
    it('should return proper email service health status', async () => {
      const result = await (service as any).checkEmailServiceHealth();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('emailsSent');
      expect(result).toHaveProperty('failureRate');
      expect(result.emailsSent).toBe(892);
      expect(result.failureRate).toBe(0.02);
    });

    it('should handle email service errors', async () => {
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (delay === 25) {
          throw new Error('SMTP server unreachable');
        }
        return originalSetTimeout(callback, delay);
      });

      const result = await (service as any).checkEmailServiceHealth();

      expect(result.status).toBe('error');
      expect(result.error).toBe('SMTP server unreachable');
    });

    it('should validate email metrics', async () => {
      const result = await (service as any).checkEmailServiceHealth();

      expect(result.emailsSent).toBeGreaterThan(0);
      expect(result.failureRate).toBeGreaterThanOrEqual(0);
      expect(result.failureRate).toBeLessThanOrEqual(1);
    });
  });

  describe('checkAiServiceHealth', () => {
    it('should return proper AI service health status', async () => {
      const result = await (service as any).checkAiServiceHealth();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('assessmentsProcessed');
      expect(result.assessmentsProcessed).toBe(234);
    });

    it('should handle AI service errors', async () => {
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (delay === 75) {
          throw new Error('AI model loading failed');
        }
        return originalSetTimeout(callback, delay);
      });

      const result = await (service as any).checkAiServiceHealth();

      expect(result.status).toBe('error');
      expect(result.error).toBe('AI model loading failed');
    });

    it('should validate AI service metrics', async () => {
      const result = await (service as any).checkAiServiceHealth();

      expect(result.assessmentsProcessed).toBeGreaterThan(0);
      expect(result.responseTime).toBeGreaterThan(0);
    });
  });

  describe('getSystemMetrics', () => {
    it('should return comprehensive system metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('disk');
      expect(result).toHaveProperty('network');
      expect(result).toHaveProperty('nodejs');
    });

    it('should return proper memory metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result.memory).toEqual({
        used: mockMemoryUsage.heapUsed,
        free: mockOsMemory.free,
        total: mockOsMemory.total,
        percentage: ((mockOsMemory.total - mockOsMemory.free) / mockOsMemory.total) * 100,
      });

      expect(result.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(result.memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should return proper CPU metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result.cpu).toEqual({
        usage: mockCpuUsage,
        loadAverage: mockLoadAverage,
        cores: mockCpus.length,
      });

      expect(result.cpu.cores).toBe(8);
      expect(Array.isArray(result.cpu.loadAverage)).toBe(true);
      expect(result.cpu.loadAverage).toHaveLength(3);
    });

    it('should return mock disk metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result.disk).toEqual({
        used: 85 * 1024 * 1024 * 1024,
        free: 15 * 1024 * 1024 * 1024,
        total: 100 * 1024 * 1024 * 1024,
        percentage: 85,
      });

      expect(result.disk.used + result.disk.free).toBe(result.disk.total);
      expect(result.disk.percentage).toBe(85);
    });

    it('should return proper network metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result.network).toEqual({
        bytesReceived: 1024 * 1024 * 150,
        bytesSent: 1024 * 1024 * 200,
        packetsReceived: 50000,
        packetsSent: 45000,
      });

      expect(result.network.bytesReceived).toBeGreaterThan(0);
      expect(result.network.bytesSent).toBeGreaterThan(0);
      expect(result.network.packetsReceived).toBeGreaterThan(0);
      expect(result.network.packetsSent).toBeGreaterThan(0);
    });

    it('should return proper Node.js metrics', async () => {
      const result = await service.getSystemMetrics();

      expect(result.nodejs).toEqual({
        version: 'v18.17.0',
        uptime: 86400,
        pid: 12345,
      });

      expect(result.nodejs.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(result.nodejs.uptime).toBe(86400);
      expect(result.nodejs.pid).toBe(12345);
    });

    it('should handle concurrent system metrics requests', async () => {
      const promises = Array.from({ length: 5 }, () => service.getSystemMetrics());
      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toHaveProperty('memory');
        expect(result).toHaveProperty('cpu');
        expect(result).toHaveProperty('disk');
        expect(result).toHaveProperty('network');
        expect(result).toHaveProperty('nodejs');
      });

      // All results should be identical
      const firstResult = results[0];
      results.slice(1).forEach(result => {
        expect(result).toEqual(firstResult);
      });
    });

    it('should calculate memory percentage correctly', async () => {
      const result = await service.getSystemMetrics();
      const expectedPercentage = ((mockOsMemory.total - mockOsMemory.free) / mockOsMemory.total) * 100;

      expect(result.memory.percentage).toBeCloseTo(expectedPercentage, 2);
      expect(result.memory.percentage).toBe(50); // 8GB used of 16GB total
    });
  });

  describe('getDetailedHealth', () => {
    beforeEach(() => {
      prismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
    });

    it('should return comprehensive health status', async () => {
      const result = await service.getDetailedHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('errors');
    });

    it('should return ok status when all services are healthy', async () => {
      const result = await service.getDetailedHealth();

      expect(result.status).toBe('ok');
      expect(result.errors).toEqual([]);
      expect(result.database.status).toBe('connected');
      Object.values(result.services).forEach(service => {
        expect(service.status).toBe('ok');
      });
    });

    it('should return error status when database is unhealthy', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('Database down'));

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('One or more services are unhealthy');
      expect(result.database.status).toBe('disconnected');
    });

    it('should include all service health data', async () => {
      const result = await service.getDetailedHealth();

      expect(result.services).toHaveProperty('supabase');
      expect(result.services).toHaveProperty('stripe');
      expect(result.services).toHaveProperty('emailService');
      expect(result.services).toHaveProperty('aiService');

      Object.values(result.services).forEach(service => {
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('responseTime');
      });
    });

    it('should include system metrics', async () => {
      const result = await service.getDetailedHealth();

      expect(result.system).toHaveProperty('memory');
      expect(result.system).toHaveProperty('cpu');
      expect(result.system).toHaveProperty('disk');
      expect(result.system).toHaveProperty('network');
      expect(result.system).toHaveProperty('nodejs');
    });

    it('should handle partial service failures', async () => {
      // Mock one service failing
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (delay === 30) { // Stripe timeout
          throw new Error('Stripe API unavailable');
        }
        return originalSetTimeout(callback, delay);
      });

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('error');
      expect(result.services.stripe.status).toBe('error');
      expect(result.services.supabase.status).toBe('ok');
      expect(result.services.emailService.status).toBe('ok');
      expect(result.services.aiService.status).toBe('ok');
    });

    it('should handle complete service failure gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      prismaService.$queryRaw.mockRejectedValue(new Error('Critical system failure'));

      // Make all service checks fail
      jest.spyOn(global, 'setTimeout').mockImplementation(() => {
        throw new Error('All services down');
      });

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('error');
      expect(result).toHaveProperty('timestamp');
      expect(result.errors).toContain('One or more services are unhealthy');
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle exception during health check', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      
      // Mock a critical failure
      jest.spyOn(service, 'getDatabaseHealth').mockRejectedValue(new Error('Critical failure'));

      const result = await service.getDetailedHealth();

      expect(result.status).toBe('error');
      expect(result.errors).toContain('Failed to retrieve health information');
      expect(result).toHaveProperty('timestamp');
      expect(loggerSpy).toHaveBeenCalledWith('Failed to get detailed health', expect.any(Error));
    });

    it('should maintain consistent timing across calls', async () => {
      const promises = Array.from({ length: 3 }, () => service.getDetailedHealth());
      const results = await Promise.all(promises);

      // All should complete with similar timing (within same second)
      const timestamps = results.map(r => new Date(r.timestamp).getTime());
      const maxTimeDiff = Math.max(...timestamps) - Math.min(...timestamps);
      expect(maxTimeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('getAdminHealthDashboard', () => {
    beforeEach(() => {
      prismaService.$queryRaw.mockResolvedValue([{ result: 1 }]);
    });

    it('should return comprehensive admin dashboard', async () => {
      const result = await service.getAdminHealthDashboard();

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('resources');
    });

    it('should return proper overview structure', async () => {
      const result = await service.getAdminHealthDashboard();

      expect(result.overview).toHaveProperty('status');
      expect(result.overview).toHaveProperty('uptime');
      expect(result.overview).toHaveProperty('lastRestart');
      expect(result.overview).toHaveProperty('errorRate');

      expect(result.overview.status).toBe('ok');
      expect(typeof result.overview.uptime).toBe('number');
      expect(typeof result.overview.errorRate).toBe('number');
      expect(result.overview.errorRate).toBe(0.12);
    });

    it('should return mock alerts with proper structure', async () => {
      const result = await service.getAdminHealthDashboard();

      expect(Array.isArray(result.alerts)).toBe(true);
      expect(result.alerts).toHaveLength(2);

      result.alerts.forEach(alert => {
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('timestamp');
        expect(alert).toHaveProperty('resolved');
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
        expect(typeof alert.resolved).toBe('boolean');
      });

      // Check specific alerts
      const unresolvedAlerts = result.alerts.filter(a => !a.resolved);
      const resolvedAlerts = result.alerts.filter(a => a.resolved);
      expect(unresolvedAlerts).toHaveLength(1);
      expect(resolvedAlerts).toHaveLength(1);
    });

    it('should return performance metrics', async () => {
      const result = await service.getAdminHealthDashboard();

      expect(result.performance).toEqual({
        averageResponseTime: 245,
        requestsPerMinute: 127,
        activeConnections: 23,
        errorCount: 3,
      });

      expect(result.performance.averageResponseTime).toBeGreaterThan(0);
      expect(result.performance.requestsPerMinute).toBeGreaterThan(0);
      expect(result.performance.activeConnections).toBeGreaterThan(0);
      expect(result.performance.errorCount).toBeGreaterThanOrEqual(0);
    });

    it('should return proper resources structure', async () => {
      const result = await service.getAdminHealthDashboard();

      expect(result.resources).toHaveProperty('memory');
      expect(result.resources).toHaveProperty('cpu');
      expect(result.resources).toHaveProperty('database');
      expect(result.resources).toHaveProperty('storage');

      // Should match system metrics
      expect(result.resources.memory).toHaveProperty('used');
      expect(result.resources.memory).toHaveProperty('free');
      expect(result.resources.memory).toHaveProperty('total');
      expect(result.resources.memory).toHaveProperty('percentage');

      expect(result.resources.database).toHaveProperty('status');
      expect(result.resources.database.status).toBe('connected');
    });

    it('should calculate last restart time correctly', async () => {
      // Advance time by 1 hour
      jest.advanceTimersByTime(60 * 60 * 1000);

      const result = await service.getAdminHealthDashboard();
      const lastRestart = new Date(result.overview.lastRestart);
      const expectedRestart = new Date(mockDate.getTime() - (result.overview.uptime * 1000));

      expect(lastRestart.getTime()).toBeCloseTo(expectedRestart.getTime(), -2);
    });

    it('should handle database errors in admin dashboard', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

      const result = await service.getAdminHealthDashboard();

      expect(result.overview.status).toBe('error');
      expect(result.resources.database.status).toBe('disconnected');
    });

    it('should maintain consistency between detailed health and admin dashboard', async () => {
      const [detailedHealth, adminDashboard] = await Promise.all([
        service.getDetailedHealth(),
        service.getAdminHealthDashboard(),
      ]);

      expect(adminDashboard.overview.status).toBe(detailedHealth.status);
      expect(adminDashboard.overview.uptime).toBe(detailedHealth.uptime);
      expect(adminDashboard.resources.memory).toEqual(detailedHealth.system.memory);
      expect(adminDashboard.resources.cpu).toEqual(detailedHealth.system.cpu);
      expect(adminDashboard.resources.database).toEqual(detailedHealth.database);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle system resource unavailability', async () => {
      jest.spyOn(os, 'totalmem').mockImplementation(() => {
        throw new Error('System metrics unavailable');
      });

      await expect(service.getSystemMetrics()).rejects.toThrow('System metrics unavailable');
    });

    it('should handle process metrics unavailability', async () => {
      jest.spyOn(process, 'memoryUsage').mockImplementation(() => {
        throw new Error('Process metrics unavailable');
      });

      await expect(service.getSystemMetrics()).rejects.toThrow('Process metrics unavailable');
    });

    it('should handle malformed environment variables', async () => {
      Object.defineProperty(process, 'env', {
        value: { npm_package_version: null }
      });

      const result = await service.getBasicHealth();
      expect(result.version).toBe('1.0.0');
    });

    it('should handle extreme memory conditions', async () => {
      jest.spyOn(os, 'freemem').mockReturnValue(0); // No free memory
      jest.spyOn(os, 'totalmem').mockReturnValue(1024 * 1024 * 1024); // 1GB total

      const result = await service.getSystemMetrics();

      expect(result.memory.percentage).toBe(100);
      expect(result.memory.free).toBe(0);
    });

    it('should handle extreme CPU load conditions', async () => {
      jest.spyOn(os, 'loadavg').mockReturnValue([10.5, 15.2, 20.8]); // Very high load

      const result = await service.getSystemMetrics();

      expect(result.cpu.loadAverage).toEqual([10.5, 15.2, 20.8]);
      expect(result.cpu.loadAverage.every(load => load > 1)).toBe(true);
    });

    it('should handle concurrent health checks under load', async () => {
      const concurrencyLevel = 20;
      const promises = Array.from({ length: concurrencyLevel }, () =>
        service.getDetailedHealth()
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // All should complete successfully
      results.forEach(result => {
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('database');
        expect(result).toHaveProperty('services');
        expect(result).toHaveProperty('system');
      });

      // Should complete within reasonable time (5 seconds for 20 concurrent calls)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle memory leaks in long-running health checks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Run many health checks
      for (let i = 0; i < 100; i++) {
        await service.getBasicHealth();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Performance and Optimization', () => {
    it('should complete basic health check quickly', async () => {
      const startTime = Date.now();
      await service.getBasicHealth();
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should handle rapid successive calls efficiently', async () => {
      const calls = 50;
      const startTime = Date.now();

      const promises = Array.from({ length: calls }, () => service.getBasicHealth());
      await Promise.all(promises);

      const duration = Date.now() - startTime;
      const avgDuration = duration / calls;

      expect(avgDuration).toBeLessThan(10); // Each call should average under 10ms
    });

    it('should cache-friendly for identical concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => service.getSystemMetrics());

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toEqual(firstResult);
      });

      // Should complete quickly even with multiple concurrent calls
      expect(duration).toBeLessThan(100);
    });

    it('should optimize service health checks', async () => {
      const startTime = Date.now();
      await service.getServicesHealth();
      const duration = Date.now() - startTime;

      // Should complete all service checks in reasonable time
      expect(duration).toBeLessThan(500); // All service checks under 500ms
    });

    it('should handle service timeout scenarios', async () => {
      // Mock very slow services
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((callback, delay) => {
        if (typeof callback === 'function') {
          return originalSetTimeout(callback, delay * 10); // Make everything 10x slower
        }
        return originalSetTimeout(callback, delay);
      });

      const startTime = Date.now();
      const result = await service.getServicesHealth();
      const duration = Date.now() - startTime;

      // Should still complete, even if slower
      expect(result).toHaveProperty('supabase');
      expect(result).toHaveProperty('stripe');
      expect(duration).toBeGreaterThan(500); // Should be noticeably slower
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain consistent uptime calculations', async () => {
      const result1 = await service.getBasicHealth();
      
      jest.advanceTimersByTime(30000); // 30 seconds
      
      const result2 = await service.getBasicHealth();

      expect(result2.uptime).toBe(result1.uptime + 30);
    });

    it('should validate timestamp formats across all methods', async () => {
      const basicHealth = await service.getBasicHealth();
      const detailedHealth = await service.getDetailedHealth();
      const adminDashboard = await service.getAdminHealthDashboard();

      [basicHealth.timestamp, detailedHealth.timestamp].forEach(timestamp => {
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(new Date(timestamp)).toBeInstanceOf(Date);
        expect(new Date(timestamp).getTime()).not.toBeNaN();
      });

      // Admin dashboard alerts should also have valid timestamps
      adminDashboard.alerts.forEach(alert => {
        expect(alert.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });

    it('should ensure mathematical consistency in metrics', async () => {
      const systemMetrics = await service.getSystemMetrics();

      // Memory calculations
      expect(systemMetrics.memory.used + systemMetrics.memory.free).toBe(systemMetrics.memory.total);
      expect(systemMetrics.memory.percentage).toBe(
        ((systemMetrics.memory.total - systemMetrics.memory.free) / systemMetrics.memory.total) * 100
      );

      // Disk calculations
      expect(systemMetrics.disk.used + systemMetrics.disk.free).toBe(systemMetrics.disk.total);
      expect(systemMetrics.disk.percentage).toBe(
        (systemMetrics.disk.used / systemMetrics.disk.total) * 100
      );

      // Network metrics should be non-negative
      expect(systemMetrics.network.bytesReceived).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.network.bytesSent).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.network.packetsReceived).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.network.packetsSent).toBeGreaterThanOrEqual(0);
    });

    it('should maintain referential integrity between health checks', async () => {
      const detailedHealth = await service.getDetailedHealth();
      const adminDashboard = await service.getAdminHealthDashboard();

      // Overview status should match
      expect(adminDashboard.overview.status).toBe(detailedHealth.status);

      // Uptime should match
      expect(adminDashboard.overview.uptime).toBe(detailedHealth.uptime);

      // Database status should match
      expect(adminDashboard.resources.database.status).toBe(detailedHealth.database.status);

      // System metrics should match
      expect(adminDashboard.resources.memory).toEqual(detailedHealth.system.memory);
      expect(adminDashboard.resources.cpu).toEqual(detailedHealth.system.cpu);
    });

    it('should handle edge cases in percentage calculations', async () => {
      // Test with zero values
      jest.spyOn(os, 'totalmem').mockReturnValue(0);
      jest.spyOn(os, 'freemem').mockReturnValue(0);

      const result = await service.getSystemMetrics();

      expect(result.memory.percentage).toBeNaN(); // Division by zero
      
      // Test with very large values
      jest.spyOn(os, 'totalmem').mockReturnValue(Number.MAX_SAFE_INTEGER);
      jest.spyOn(os, 'freemem').mockReturnValue(Number.MAX_SAFE_INTEGER - 1);

      const result2 = await service.getSystemMetrics();
      expect(result2.memory.percentage).toBeCloseTo(0, 10);
    });
  });
});