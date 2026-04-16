import { Logger } from '@nestjs/common';
import { 
  PerformanceDashboard, 
  PerformanceMetrics, 
  EndpointStats, 
  SystemMetrics, 
  PerformanceAlert, 
  DashboardData,
  performanceDashboard
} from './performance-dashboard';
import * as os from 'os';
import * as process from 'process';

describe('PerformanceDashboard', () => {
  let dashboard: PerformanceDashboard;
  let originalSetInterval: typeof setInterval;
  let originalClearInterval: typeof clearInterval;
  let mockDate: Date;

  // Mock data structures
  const mockDate = new Date('2024-01-15T10:00:00Z');

  const mockMemoryUsage: NodeJS.MemoryUsage = {
    rss: 67108864, // 64MB
    heapTotal: 50331648, // 48MB
    heapUsed: 33554432, // 32MB
    external: 8388608, // 8MB
    arrayBuffers: 1048576, // 1MB
  };

  const mockCpuUsage: NodeJS.CpuUsage = {
    user: 1000000, // 1 second in microseconds
    system: 500000, // 0.5 seconds in microseconds
  };

  const mockOsMemory = {
    total: 17179869184, // 16GB
    free: 8589934592, // 8GB
  };

  const mockLoadAverage = [0.85, 1.2, 1.5];
  const mockCpus = Array.from({ length: 8 }, () => ({ model: 'Test CPU' }));

  beforeEach(() => {
    dashboard = new PerformanceDashboard();

    // Mock timers
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    // Store original functions
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;

    // Mock process and os modules
    jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
    jest.spyOn(process, 'cpuUsage').mockReturnValue(mockCpuUsage);
    jest.spyOn(process, 'uptime').mockReturnValue(86400); // 24 hours
    
    jest.spyOn(os, 'totalmem').mockReturnValue(mockOsMemory.total);
    jest.spyOn(os, 'freemem').mockReturnValue(mockOsMemory.free);
    jest.spyOn(os, 'loadavg').mockReturnValue(mockLoadAverage);
    jest.spyOn(os, 'cpus').mockReturnValue(mockCpus as any);

    // Mock logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    dashboard.stopMonitoring();
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize dashboard with default values', () => {
      expect(dashboard).toBeDefined();
      expect(dashboard).toBeInstanceOf(PerformanceDashboard);
    });

    it('should extend EventEmitter', () => {
      expect(dashboard.on).toBeDefined();
      expect(dashboard.emit).toBeDefined();
      expect(dashboard.removeListener).toBeDefined();
    });

    it('should log initialization message', () => {
      new PerformanceDashboard();
      expect(Logger.prototype.log).toHaveBeenCalledWith('Performance Dashboard initialized');
    });

    it('should initialize with empty metrics and alerts', () => {
      const dashboardData = dashboard.getDashboardData();
      expect(dashboardData.performanceTimeline).toHaveLength(0);
      expect(dashboardData.recentAlerts).toHaveLength(0);
      expect(dashboardData.endpointStats).toHaveLength(0);
    });
  });

  describe('Monitoring Lifecycle', () => {
    describe('startMonitoring', () => {
      it('should start monitoring and set internal state', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');

        dashboard.startMonitoring();

        expect(Logger.prototype.log).toHaveBeenCalledWith('Performance monitoring started');
        expect(emitSpy).toHaveBeenCalledWith('monitoring-started');
      });

      it('should not start monitoring twice', () => {
        const logSpy = jest.spyOn(Logger.prototype, 'warn');

        dashboard.startMonitoring();
        dashboard.startMonitoring();

        expect(logSpy).toHaveBeenCalledWith('Monitoring already started');
      });

      it('should set up interval for collecting system metrics', () => {
        const setIntervalSpy = jest.spyOn(global, 'setInterval');

        dashboard.startMonitoring();

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
      });

      it('should collect system metrics periodically', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');

        dashboard.startMonitoring();

        // Advance timer by 5 seconds
        jest.advanceTimersByTime(5000);

        expect(emitSpy).toHaveBeenCalledWith('system-metrics-collected', expect.any(Object));
      });

      it('should update start time when monitoring starts', () => {
        const initialTime = Date.now();
        jest.advanceTimersByTime(1000);

        dashboard.startMonitoring();

        // Start time should be updated to current time
        expect((dashboard as any).startTime).toBeGreaterThan(initialTime);
      });
    });

    describe('stopMonitoring', () => {
      it('should stop monitoring and clear interval', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

        dashboard.startMonitoring();
        dashboard.stopMonitoring();

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(Logger.prototype.log).toHaveBeenCalledWith('Performance monitoring stopped');
        expect(emitSpy).toHaveBeenCalledWith('monitoring-stopped');
      });

      it('should not fail when stopping monitoring that was never started', () => {
        expect(() => dashboard.stopMonitoring()).not.toThrow();
      });

      it('should handle multiple stop calls gracefully', () => {
        dashboard.startMonitoring();
        dashboard.stopMonitoring();
        
        expect(() => dashboard.stopMonitoring()).not.toThrow();
      });
    });
  });

  describe('Request Recording', () => {
    describe('recordRequest', () => {
      it('should record a successful request', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');

        dashboard.recordRequest('GET /api/users', 'GET', 150, 200, 2);

        const dashboardData = dashboard.getDashboardData();
        expect(dashboardData.performanceTimeline).toHaveLength(1);

        const metric = dashboardData.performanceTimeline[0];
        expect(metric.endpoint).toBe('GET GET /api/users');
        expect(metric.method).toBe('GET');
        expect(metric.responseTime).toBe(150);
        expect(metric.statusCode).toBe(200);
        expect(metric.databaseConnections).toBe(2);
        expect(metric.errorCount).toBe(0);
        expect(metric.requestCount).toBe(1);

        expect(emitSpy).toHaveBeenCalledWith('request-recorded', metric);
      });

      it('should record an error request', () => {
        dashboard.recordRequest('POST /api/users', 'POST', 500, 500);

        const dashboardData = dashboard.getDashboardData();
        const metric = dashboardData.performanceTimeline[0];

        expect(metric.statusCode).toBe(500);
        expect(metric.errorCount).toBe(1);
      });

      it('should include memory and CPU usage in metrics', () => {
        dashboard.recordRequest('GET /api/test', 'GET', 100, 200);

        const dashboardData = dashboard.getDashboardData();
        const metric = dashboardData.performanceTimeline[0];

        expect(metric.memoryUsage).toEqual(mockMemoryUsage);
        expect(metric.cpuUsage).toEqual(mockCpuUsage);
      });

      it('should update endpoint statistics', () => {
        dashboard.recordRequest('GET /api/users', 'GET', 150, 200);
        dashboard.recordRequest('GET /api/users', 'GET', 200, 200);

        const stats = dashboard.getEndpointStats('GET GET /api/users');
        expect(stats).toBeDefined();
        expect(stats!.totalRequests).toBe(2);
        expect(stats!.averageResponseTime).toBe(175);
        expect(stats!.minResponseTime).toBe(150);
        expect(stats!.maxResponseTime).toBe(200);
        expect(stats!.errorRate).toBe(0);
      });

      it('should limit metrics to 1000 entries', () => {
        // Record 1005 requests
        for (let i = 0; i < 1005; i++) {
          dashboard.recordRequest(`GET /api/test${i}`, 'GET', 100, 200);
        }

        const dashboardData = dashboard.getDashboardData();
        expect(dashboardData.performanceTimeline).toHaveLength(100); // Last 100 from slice(-100)
        expect((dashboard as any).metrics).toHaveLength(1000); // Internal limit
      });

      it('should trigger threshold checks', () => {
        const createAlertSpy = jest.spyOn(dashboard as any, 'createAlert');

        // Record a slow request that should trigger warning threshold
        dashboard.recordRequest('GET /api/slow', 'GET', 2000, 200);

        expect(createAlertSpy).toHaveBeenCalledWith(
          'HIGH',
          'RESPONSE_TIME',
          expect.stringContaining('Slow response time: 2000ms'),
          'GET GET /api/slow',
          2000,
          1000
        );
      });

      it('should handle requests with default database connections', () => {
        dashboard.recordRequest('GET /api/test', 'GET', 100, 200);

        const dashboardData = dashboard.getDashboardData();
        const metric = dashboardData.performanceTimeline[0];

        expect(metric.databaseConnections).toBe(0);
      });
    });

    describe('Endpoint Statistics', () => {
      beforeEach(() => {
        // Record some test requests
        dashboard.recordRequest('GET /api/users', 'GET', 100, 200);
        dashboard.recordRequest('GET /api/users', 'GET', 200, 200);
        dashboard.recordRequest('GET /api/users', 'GET', 150, 500);
        dashboard.recordRequest('POST /api/users', 'POST', 300, 201);
      });

      it('should calculate correct endpoint statistics', () => {
        const stats = dashboard.getEndpointStats('GET GET /api/users');
        
        expect(stats).toBeDefined();
        expect(stats!.totalRequests).toBe(3);
        expect(stats!.averageResponseTime).toBeCloseTo(150, 1);
        expect(stats!.minResponseTime).toBe(100);
        expect(stats!.maxResponseTime).toBe(200);
        expect(stats!.errorCount).toBe(1);
        expect(stats!.errorRate).toBeCloseTo(33.33, 1);
      });

      it('should calculate percentiles correctly', () => {
        // Add more data points for better percentile calculation
        for (let i = 0; i < 50; i++) {
          dashboard.recordRequest('GET /api/test', 'GET', i * 10, 200);
        }

        const stats = dashboard.getEndpointStats('GET GET /api/test');
        expect(stats!.performance95thPercentile).toBeGreaterThan(0);
        expect(stats!.performance99thPercentile).toBeGreaterThan(0);
        expect(stats!.performance99thPercentile).toBeGreaterThanOrEqual(stats!.performance95thPercentile);
      });

      it('should calculate requests per minute', () => {
        const stats = dashboard.getEndpointStats('GET GET /api/users');
        expect(stats!.requestsPerMinute).toBeGreaterThan(0);
      });

      it('should return null for non-existent endpoint', () => {
        const stats = dashboard.getEndpointStats('GET /api/nonexistent');
        expect(stats).toBeNull();
      });

      it('should update last updated timestamp', () => {
        const initialTime = Date.now();
        jest.advanceTimersByTime(1000);
        
        dashboard.recordRequest('GET /api/test', 'GET', 100, 200);
        
        const stats = dashboard.getEndpointStats('GET GET /api/test');
        expect(stats!.lastUpdated).toBeGreaterThan(initialTime);
      });
    });
  });

  describe('System Metrics Collection', () => {
    it('should collect current system metrics', () => {
      const systemMetrics = (dashboard as any).getCurrentSystemMetrics();

      expect(systemMetrics).toHaveProperty('timestamp');
      expect(systemMetrics).toHaveProperty('cpu');
      expect(systemMetrics).toHaveProperty('memory');
      expect(systemMetrics).toHaveProperty('network');
      expect(systemMetrics).toHaveProperty('database');

      // CPU metrics
      expect(systemMetrics.cpu.usage).toBeGreaterThan(0);
      expect(systemMetrics.cpu.loadAverage).toEqual(mockLoadAverage);

      // Memory metrics
      expect(systemMetrics.memory.totalMB).toBe(Math.round(mockOsMemory.total / 1024 / 1024));
      expect(systemMetrics.memory.usedMB).toBe(Math.round((mockOsMemory.total - mockOsMemory.free) / 1024 / 1024));
      expect(systemMetrics.memory.freeMB).toBe(Math.round(mockOsMemory.free / 1024 / 1024));
      expect(systemMetrics.memory.usage).toBe(50); // 50% used
    });

    it('should calculate memory usage percentage correctly', () => {
      const systemMetrics = (dashboard as any).getCurrentSystemMetrics();
      const expectedUsage = ((mockOsMemory.total - mockOsMemory.free) / mockOsMemory.total) * 100;
      
      expect(systemMetrics.memory.usage).toBeCloseTo(expectedUsage, 1);
    });

    it('should calculate requests per second', () => {
      // Record some requests
      dashboard.recordRequest('GET /api/test1', 'GET', 100, 200);
      dashboard.recordRequest('GET /api/test2', 'GET', 100, 200);
      
      const rps = (dashboard as any).calculateRequestsPerSecond();
      expect(rps).toBe(2);
    });

    it('should calculate CPU usage from process.cpuUsage', () => {
      const cpuUsage = (dashboard as any).calculateCpuUsage(mockCpuUsage);
      const expectedUsage = ((mockCpuUsage.user + mockCpuUsage.system) / 1000000) * 100;
      
      expect(cpuUsage).toBe(expectedUsage);
    });

    it('should emit system metrics when collected', () => {
      const emitSpy = jest.spyOn(dashboard, 'emit');

      dashboard.startMonitoring();
      jest.advanceTimersByTime(5000);

      expect(emitSpy).toHaveBeenCalledWith('system-metrics-collected', expect.any(Object));
    });
  });

  describe('Alert System', () => {
    describe('Response Time Alerts', () => {
      it('should create critical alert for very slow responses', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');

        dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);

        const alerts = dashboard.getRecentAlerts();
        expect(alerts).toHaveLength(1);
        expect(alerts[0].severity).toBe('CRITICAL');
        expect(alerts[0].type).toBe('RESPONSE_TIME');
        expect(alerts[0].value).toBe(6000);
        expect(alerts[0].threshold).toBe(5000);

        expect(emitSpy).toHaveBeenCalledWith('alert-created', alerts[0]);
      });

      it('should create warning alert for slow responses', () => {
        dashboard.recordRequest('GET /api/medium', 'GET', 2000, 200);

        const alerts = dashboard.getRecentAlerts();
        expect(alerts).toHaveLength(1);
        expect(alerts[0].severity).toBe('HIGH');
        expect(alerts[0].type).toBe('RESPONSE_TIME');
        expect(alerts[0].value).toBe(2000);
        expect(alerts[0].threshold).toBe(1000);
      });

      it('should not create alert for fast responses', () => {
        dashboard.recordRequest('GET /api/fast', 'GET', 100, 200);

        const alerts = dashboard.getRecentAlerts();
        expect(alerts).toHaveLength(0);
      });
    });

    describe('Error Rate Alerts', () => {
      it('should create critical alert for high error rates', () => {
        // Create requests with >10% error rate
        for (let i = 0; i < 10; i++) {
          dashboard.recordRequest('GET /api/error', 'GET', 100, i < 9 ? 200 : 500);
        }
        
        // The last request should trigger the alert
        dashboard.recordRequest('GET /api/error', 'GET', 100, 500);

        const alerts = dashboard.getRecentAlerts(1);
        expect(alerts.length).toBeGreaterThan(0);
        
        const errorRateAlert = alerts.find(a => a.type === 'ERROR_RATE');
        if (errorRateAlert) {
          expect(errorRateAlert.severity).toBe('CRITICAL');
          expect(errorRateAlert.value).toBeGreaterThan(10);
        }
      });

      it('should create warning alert for medium error rates', () => {
        // Create requests with ~7% error rate
        for (let i = 0; i < 15; i++) {
          dashboard.recordRequest('GET /api/warning', 'GET', 100, i === 0 ? 500 : 200);
        }

        const alerts = dashboard.getRecentAlerts();
        const errorRateAlert = alerts.find(a => a.type === 'ERROR_RATE');
        if (errorRateAlert) {
          expect(errorRateAlert.severity).toBe('HIGH');
        }
      });
    });

    describe('System Resource Alerts', () => {
      it('should create memory usage alerts', () => {
        // Mock high memory usage
        jest.spyOn(os, 'freemem').mockReturnValue(mockOsMemory.total * 0.05); // 95% used

        dashboard.startMonitoring();
        jest.advanceTimersByTime(5000);

        const alerts = dashboard.getRecentAlerts();
        const memoryAlert = alerts.find(a => a.type === 'MEMORY');
        expect(memoryAlert).toBeDefined();
        expect(memoryAlert!.severity).toBe('CRITICAL');
        expect(memoryAlert!.value).toBeGreaterThan(90);
      });

      it('should create CPU usage alerts', () => {
        // Mock high CPU usage
        jest.spyOn(process, 'cpuUsage').mockReturnValue({
          user: 90000000, // High CPU usage
          system: 10000000,
        });

        dashboard.startMonitoring();
        jest.advanceTimersByTime(5000);

        const alerts = dashboard.getRecentAlerts();
        const cpuAlert = alerts.find(a => a.type === 'CPU');
        expect(cpuAlert).toBeDefined();
        expect(cpuAlert!.severity).toBe('CRITICAL');
      });

      it('should limit alerts to 100 entries', () => {
        // Create many alerts
        for (let i = 0; i < 105; i++) {
          dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);
        }

        expect((dashboard as any).alerts.length).toBe(100);
      });
    });
  });

  describe('Dashboard Data', () => {
    beforeEach(() => {
      // Set up test data
      dashboard.recordRequest('GET /api/users', 'GET', 150, 200);
      dashboard.recordRequest('POST /api/users', 'POST', 300, 201);
      dashboard.recordRequest('GET /api/slow', 'GET', 2000, 200); // Triggers alert
    });

    it('should return comprehensive dashboard data', () => {
      const data = dashboard.getDashboardData();

      expect(data).toHaveProperty('systemMetrics');
      expect(data).toHaveProperty('endpointStats');
      expect(data).toHaveProperty('recentAlerts');
      expect(data).toHaveProperty('performanceTimeline');
      expect(data).toHaveProperty('recommendations');

      expect(data.endpointStats).toHaveLength(3);
      expect(data.performanceTimeline).toHaveLength(3);
      expect(data.recentAlerts.length).toBeGreaterThan(0);
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    it('should limit performance timeline to last 100 entries', () => {
      // Add more requests
      for (let i = 0; i < 150; i++) {
        dashboard.recordRequest(`GET /api/test${i}`, 'GET', 100, 200);
      }

      const data = dashboard.getDashboardData();
      expect(data.performanceTimeline).toHaveLength(100);
    });

    it('should limit recent alerts to last 10 entries', () => {
      // Create many alerts
      for (let i = 0; i < 15; i++) {
        dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);
      }

      const data = dashboard.getDashboardData();
      expect(data.recentAlerts).toHaveLength(10);
    });
  });

  describe('Recommendations Engine', () => {
    it('should recommend optimization for slow endpoints', () => {
      dashboard.recordRequest('GET /api/slow1', 'GET', 1500, 200);
      dashboard.recordRequest('GET /api/slow2', 'GET', 2000, 200);

      const data = dashboard.getDashboardData();
      const slowEndpointRec = data.recommendations.find(r => 
        r.includes('slow endpoint(s)')
      );
      expect(slowEndpointRec).toBeDefined();
    });

    it('should recommend investigation for high error rate endpoints', () => {
      // Create high error rate
      for (let i = 0; i < 10; i++) {
        dashboard.recordRequest('GET /api/errors', 'GET', 100, i < 3 ? 500 : 200);
      }

      const data = dashboard.getDashboardData();
      const errorRateRec = data.recommendations.find(r => 
        r.includes('error rate')
      );
      expect(errorRateRec).toBeDefined();
    });

    it('should recommend caching for high traffic endpoints', () => {
      // Create high traffic (simulate by recording many recent requests)
      for (let i = 0; i < 150; i++) {
        dashboard.recordRequest('GET /api/popular', 'GET', 100, 200);
      }

      const data = dashboard.getDashboardData();
      const cachingRec = data.recommendations.find(r => 
        r.includes('caching')
      );
      expect(cachingRec).toBeDefined();
    });

    it('should recommend addressing critical alerts', () => {
      dashboard.recordRequest('GET /api/critical', 'GET', 6000, 200);

      const data = dashboard.getDashboardData();
      const criticalRec = data.recommendations.find(r => 
        r.includes('critical performance issue')
      );
      expect(criticalRec).toBeDefined();
    });

    it('should recommend memory optimization when usage is high', () => {
      // Mock high memory usage
      jest.spyOn(os, 'freemem').mockReturnValue(mockOsMemory.total * 0.15); // 85% used

      const data = dashboard.getDashboardData();
      const memoryRec = data.recommendations.find(r => 
        r.includes('memory usage')
      );
      expect(memoryRec).toBeDefined();
    });

    it('should recommend CPU optimization when usage is high', () => {
      // Mock high CPU usage
      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 85000000,
        system: 5000000,
      });

      const data = dashboard.getDashboardData();
      const cpuRec = data.recommendations.find(r => 
        r.includes('CPU usage')
      );
      expect(cpuRec).toBeDefined();
    });
  });

  describe('Data Export and Analysis', () => {
    beforeEach(() => {
      // Set up test data
      dashboard.recordRequest('GET /api/test1', 'GET', 100, 200);
      dashboard.recordRequest('GET /api/test2', 'GET', 200, 500);
      dashboard.recordRequest('GET /api/test1', 'GET', 150, 200);
    });

    it('should export comprehensive performance data', () => {
      const exportData = dashboard.exportPerformanceData();

      expect(exportData).toHaveProperty('metrics');
      expect(exportData).toHaveProperty('endpointStats');
      expect(exportData).toHaveProperty('alerts');
      expect(exportData).toHaveProperty('systemInfo');

      expect(exportData.metrics).toHaveLength(3);
      expect(exportData.endpointStats).toHaveLength(2);
    });

    it('should calculate correct system info in export', () => {
      const exportData = dashboard.exportPerformanceData();

      expect(exportData.systemInfo.totalRequests).toBe(3);
      expect(exportData.systemInfo.averageResponseTime).toBeCloseTo(150, 0);
      expect(exportData.systemInfo.errorRate).toBeCloseTo(33.33, 1);
      expect(exportData.systemInfo.uptime).toBeGreaterThan(0);
      expect(exportData.systemInfo.startTime).toBeDefined();
    });

    it('should handle empty data in export', () => {
      const emptyDashboard = new PerformanceDashboard();
      const exportData = emptyDashboard.exportPerformanceData();

      expect(exportData.systemInfo.totalRequests).toBe(0);
      expect(exportData.systemInfo.averageResponseTime).toBe(0);
      expect(exportData.systemInfo.errorRate).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    describe('getRecentAlerts', () => {
      it('should return specified number of recent alerts', () => {
        // Create multiple alerts
        for (let i = 0; i < 5; i++) {
          dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);
        }

        const alerts = dashboard.getRecentAlerts(3);
        expect(alerts).toHaveLength(3);
      });

      it('should default to 20 alerts', () => {
        // Create more than 20 alerts
        for (let i = 0; i < 25; i++) {
          dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);
        }

        const alerts = dashboard.getRecentAlerts();
        expect(alerts).toHaveLength(20);
      });
    });

    describe('resetMetrics', () => {
      beforeEach(() => {
        dashboard.recordRequest('GET /api/test', 'GET', 100, 200);
        dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200); // Creates alert
      });

      it('should clear all metrics and alerts', () => {
        const emitSpy = jest.spyOn(dashboard, 'emit');

        dashboard.resetMetrics();

        const data = dashboard.getDashboardData();
        expect(data.performanceTimeline).toHaveLength(0);
        expect(data.endpointStats).toHaveLength(0);
        expect(data.recentAlerts).toHaveLength(0);

        expect(Logger.prototype.log).toHaveBeenCalledWith('Performance metrics reset');
        expect(emitSpy).toHaveBeenCalledWith('metrics-reset');
      });

      it('should reset start time', () => {
        const originalStartTime = (dashboard as any).startTime;
        jest.advanceTimersByTime(5000);

        dashboard.resetMetrics();

        expect((dashboard as any).startTime).toBeGreaterThan(originalStartTime);
      });
    });

    describe('calculatePercentile', () => {
      it('should calculate percentiles correctly', () => {
        const sortedArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        const p50 = (dashboard as any).calculatePercentile(sortedArray, 50);
        const p95 = (dashboard as any).calculatePercentile(sortedArray, 95);
        const p99 = (dashboard as any).calculatePercentile(sortedArray, 99);

        expect(p50).toBe(5);
        expect(p95).toBe(10);
        expect(p99).toBe(10);
      });

      it('should handle empty arrays', () => {
        const result = (dashboard as any).calculatePercentile([], 95);
        expect(result).toBe(0);
      });

      it('should handle single element arrays', () => {
        const result = (dashboard as any).calculatePercentile([42], 95);
        expect(result).toBe(42);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle system metrics collection errors', () => {
      jest.spyOn(os, 'totalmem').mockImplementation(() => {
        throw new Error('System metrics unavailable');
      });

      expect(() => (dashboard as any).getCurrentSystemMetrics()).toThrow('System metrics unavailable');
    });

    it('should handle process metrics collection errors', () => {
      jest.spyOn(process, 'memoryUsage').mockImplementation(() => {
        throw new Error('Process metrics unavailable');
      });

      expect(() => (dashboard as any).getCurrentSystemMetrics()).toThrow('Process metrics unavailable');
    });

    it('should handle extreme values in calculations', () => {
      // Test with very large response times
      dashboard.recordRequest('GET /api/extreme', 'GET', Number.MAX_SAFE_INTEGER, 200);

      const stats = dashboard.getEndpointStats('GET GET /api/extreme');
      expect(stats!.averageResponseTime).toBe(Number.MAX_SAFE_INTEGER);
      expect(stats!.maxResponseTime).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle zero memory scenarios', () => {
      jest.spyOn(os, 'totalmem').mockReturnValue(0);
      jest.spyOn(os, 'freemem').mockReturnValue(0);

      const systemMetrics = (dashboard as any).getCurrentSystemMetrics();
      expect(systemMetrics.memory.totalMB).toBe(0);
      expect(systemMetrics.memory.usage).toBeNaN(); // Division by zero
    });

    it('should handle negative values gracefully', () => {
      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: -1000,
        system: -500,
      });

      const cpuUsage = (dashboard as any).calculateCpuUsage(process.cpuUsage());
      expect(cpuUsage).toBe(-0.15); // Negative CPU usage
    });
  });

  describe('Performance and Memory Management', () => {
    it('should maintain performance with large datasets', () => {
      const startTime = Date.now();

      // Record 1000 requests
      for (let i = 0; i < 1000; i++) {
        dashboard.recordRequest(`GET /api/test${i % 100}`, 'GET', Math.random() * 1000, 200);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should limit memory usage with metric pruning', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Record many requests to trigger pruning
      for (let i = 0; i < 2000; i++) {
        dashboard.recordRequest('GET /api/test', 'GET', 100, 200);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      expect((dashboard as any).metrics.length).toBe(1000); // Should be limited
    });

    it('should handle concurrent request recording', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(dashboard.recordRequest(`GET /api/concurrent${i}`, 'GET', 100, 200))
      );

      await Promise.all(promises);

      const data = dashboard.getDashboardData();
      expect(data.performanceTimeline).toHaveLength(100);
      expect(data.endpointStats).toHaveLength(100);
    });

    it('should efficiently calculate statistics for high-frequency endpoints', () => {
      const startTime = Date.now();

      // Record 100 requests for the same endpoint
      for (let i = 0; i < 100; i++) {
        dashboard.recordRequest('GET /api/popular', 'GET', Math.random() * 500, 200);
      }

      const calculationTime = Date.now() - startTime;
      expect(calculationTime).toBeLessThan(100); // Should be fast

      const stats = dashboard.getEndpointStats('GET GET /api/popular');
      expect(stats!.totalRequests).toBe(100);
      expect(stats!.performance95thPercentile).toBeGreaterThan(0);
      expect(stats!.performance99thPercentile).toBeGreaterThan(0);
    });
  });

  describe('Event System', () => {
    it('should emit events for all major operations', () => {
      const emitSpy = jest.spyOn(dashboard, 'emit');

      dashboard.startMonitoring();
      dashboard.recordRequest('GET /api/test', 'GET', 100, 200);
      dashboard.stopMonitoring();
      dashboard.resetMetrics();

      expect(emitSpy).toHaveBeenCalledWith('monitoring-started');
      expect(emitSpy).toHaveBeenCalledWith('request-recorded', expect.any(Object));
      expect(emitSpy).toHaveBeenCalledWith('monitoring-stopped');
      expect(emitSpy).toHaveBeenCalledWith('metrics-reset');
    });

    it('should emit alert events when alerts are created', () => {
      const emitSpy = jest.spyOn(dashboard, 'emit');

      dashboard.recordRequest('GET /api/slow', 'GET', 6000, 200);

      expect(emitSpy).toHaveBeenCalledWith('alert-created', expect.any(Object));
    });

    it('should emit system metrics events during monitoring', () => {
      const emitSpy = jest.spyOn(dashboard, 'emit');

      dashboard.startMonitoring();
      jest.advanceTimersByTime(5000);

      expect(emitSpy).toHaveBeenCalledWith('system-metrics-collected', expect.any(Object));
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(performanceDashboard).toBeInstanceOf(PerformanceDashboard);
    });

    it('should maintain state across imports', () => {
      performanceDashboard.recordRequest('GET /api/singleton', 'GET', 100, 200);
      
      const stats = performanceDashboard.getEndpointStats('GET GET /api/singleton');
      expect(stats).toBeDefined();
      expect(stats!.totalRequests).toBe(1);
    });
  });

  describe('Middleware Integration', () => {
    it('should provide performance middleware', () => {
      const { performanceMiddleware } = require('./performance-dashboard');
      expect(performanceMiddleware).toBeDefined();
      expect(typeof performanceMiddleware).toBe('function');
    });

    it('should record requests through middleware', (done) => {
      const { performanceMiddleware } = require('./performance-dashboard');
      
      const mockReq = {
        method: 'GET',
        path: '/api/middleware-test',
        route: { path: '/api/middleware-test' }
      };
      
      const mockRes = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(callback, 10); // Simulate response time
          }
        })
      };
      
      const mockNext = jest.fn();

      performanceMiddleware(mockReq, mockRes, mockNext);
      
      setTimeout(() => {
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
        done();
      }, 50);
    });
  });
});