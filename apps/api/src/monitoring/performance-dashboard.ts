/**
 * Real-time Performance Monitoring Dashboard
 *
 * Advanced performance monitoring system to support Backend Agent's
 * controller performance analysis and optimization efforts.
 *
 * Features:
 * - Real-time API endpoint monitoring
 * - Database query performance tracking
 * - Response time analytics
 * - Error rate monitoring
 * - Resource utilization tracking
 * - Performance alerts and notifications
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as process from 'process';

export interface PerformanceMetrics {
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  databaseConnections: number;
  errorCount: number;
  requestCount: number;
}

export interface EndpointStats {
  endpoint: string;
  totalRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  errorCount: number;
  requestsPerMinute: number;
  lastUpdated: number;
  performance95thPercentile: number;
  performance99thPercentile: number;
}

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    heapUsedMB: number;
    heapTotalMB: number;
    usage: number;
  };
  network: {
    activeConnections: number;
    requestsPerSecond: number;
  };
  database: {
    activeConnections: number;
    queryExecutionTime: number;
    slowQueries: number;
  };
}

export interface PerformanceAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'RESPONSE_TIME' | 'ERROR_RATE' | 'MEMORY' | 'CPU' | 'DATABASE';
  message: string;
  endpoint?: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface DashboardData {
  systemMetrics: SystemMetrics;
  endpointStats: EndpointStats[];
  recentAlerts: PerformanceAlert[];
  performanceTimeline: PerformanceMetrics[];
  recommendations: string[];
}

@Injectable()
export class PerformanceDashboard extends EventEmitter {
  private readonly logger = new Logger(PerformanceDashboard.name);
  private metrics: PerformanceMetrics[] = [];
  private endpointStatsMap = new Map<string, EndpointStats>();
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  // Performance thresholds
  private readonly thresholds = {
    responseTime: {
      warning: 1000, // 1 second
      critical: 5000, // 5 seconds
    },
    errorRate: {
      warning: 5, // 5%
      critical: 10, // 10%
    },
    memoryUsage: {
      warning: 80, // 80%
      critical: 90, // 90%
    },
    cpuUsage: {
      warning: 80, // 80%
      critical: 90, // 90%
    },
    databaseResponseTime: {
      warning: 500, // 500ms
      critical: 2000, // 2 seconds
    },
  };

  constructor() {
    super();
    this.logger.log('Performance Dashboard initialized');
  }

  /**
   * Start monitoring system performance
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      this.logger.warn('Monitoring already started');
      return;
    }

    this.isMonitoring = true;
    this.startTime = Date.now();

    // Collect system metrics every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 5000);

    this.logger.log('Performance monitoring started');
    this.emit('monitoring-started');
  }

  /**
   * Stop monitoring system performance
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.logger.log('Performance monitoring stopped');
    this.emit('monitoring-stopped');
  }

  /**
   * Record performance metrics for an API request
   */
  recordRequest(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    databaseConnections: number = 0,
  ): void {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      endpoint: `${method} ${endpoint}`,
      method,
      responseTime,
      statusCode,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      activeConnections: 0, // Would be populated by actual connection monitoring
      databaseConnections,
      errorCount: statusCode >= 400 ? 1 : 0,
      requestCount: 1,
    };

    this.metrics.push(metric);
    this.updateEndpointStats(metric);
    this.checkThresholds(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    this.emit('request-recorded', metric);
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): DashboardData {
    const systemMetrics = this.getCurrentSystemMetrics();
    const endpointStats = Array.from(this.endpointStatsMap.values());
    const recentAlerts = this.alerts.slice(-10);
    const performanceTimeline = this.metrics.slice(-100);
    const recommendations = this.generateRecommendations();

    return {
      systemMetrics,
      endpointStats,
      recentAlerts,
      performanceTimeline,
      recommendations,
    };
  }

  /**
   * Get performance statistics for a specific endpoint
   */
  getEndpointStats(endpoint: string): EndpointStats | null {
    return this.endpointStatsMap.get(endpoint) || null;
  }

  /**
   * Get recent performance alerts
   */
  getRecentAlerts(limit: number = 20): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Clear all metrics and start fresh
   */
  resetMetrics(): void {
    this.metrics = [];
    this.endpointStatsMap.clear();
    this.alerts = [];
    this.startTime = Date.now();

    this.logger.log('Performance metrics reset');
    this.emit('metrics-reset');
  }

  /**
   * Collect current system metrics
   */
  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const loadAverage = os.loadavg();

    const systemMetrics: SystemMetrics = {
      timestamp: Date.now(),
      cpu: {
        usage: this.calculateCpuUsage(cpuUsage),
        loadAverage,
      },
      memory: {
        totalMB: Math.round(totalMemory / 1024 / 1024),
        usedMB: Math.round((totalMemory - freeMemory) / 1024 / 1024),
        freeMB: Math.round(freeMemory / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        usage: ((totalMemory - freeMemory) / totalMemory) * 100,
      },
      network: {
        activeConnections: 0, // Would be populated by actual connection monitoring
        requestsPerSecond: this.calculateRequestsPerSecond(),
      },
      database: {
        activeConnections: 0, // Would be populated by database monitoring
        queryExecutionTime: 0, // Would be populated by database monitoring
        slowQueries: 0, // Would be populated by database monitoring
      },
    };

    this.checkSystemThresholds(systemMetrics);
    this.emit('system-metrics-collected', systemMetrics);
  }

  /**
   * Update endpoint statistics
   */
  private updateEndpointStats(metric: PerformanceMetrics): void {
    const existing = this.endpointStatsMap.get(metric.endpoint);

    if (existing) {
      existing.totalRequests++;
      existing.averageResponseTime =
        (existing.averageResponseTime * (existing.totalRequests - 1) +
          metric.responseTime) /
        existing.totalRequests;
      existing.minResponseTime = Math.min(
        existing.minResponseTime,
        metric.responseTime,
      );
      existing.maxResponseTime = Math.max(
        existing.maxResponseTime,
        metric.responseTime,
      );
      existing.errorCount = (existing.errorCount || 0) + metric.errorCount;
      existing.errorRate = (existing.errorCount / existing.totalRequests) * 100;
      existing.lastUpdated = metric.timestamp;

      // Calculate percentiles
      const recentMetrics = this.metrics
        .filter(
          (m) =>
            m.endpoint === metric.endpoint && m.timestamp > Date.now() - 300000,
        ) // Last 5 minutes
        .map((m) => m.responseTime)
        .sort((a, b) => a - b);

      if (recentMetrics.length > 0) {
        existing.performance95thPercentile = this.calculatePercentile(
          recentMetrics,
          95,
        );
        existing.performance99thPercentile = this.calculatePercentile(
          recentMetrics,
          99,
        );
      }

      // Calculate requests per minute
      const recentCount = this.metrics.filter(
        (m) =>
          m.endpoint === metric.endpoint && m.timestamp > Date.now() - 60000,
      ).length;
      existing.requestsPerMinute = recentCount;
    } else {
      this.endpointStatsMap.set(metric.endpoint, {
        endpoint: metric.endpoint,
        totalRequests: 1,
        averageResponseTime: metric.responseTime,
        minResponseTime: metric.responseTime,
        maxResponseTime: metric.responseTime,
        errorRate: metric.errorCount * 100,
        requestsPerMinute: 1,
        lastUpdated: metric.timestamp,
        performance95thPercentile: metric.responseTime,
        performance99thPercentile: metric.responseTime,
        errorCount: metric.errorCount,
      });
    }
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetrics): void {
    // Response time alerts
    if (metric.responseTime > this.thresholds.responseTime.critical) {
      this.createAlert(
        'CRITICAL',
        'RESPONSE_TIME',
        `Critical response time: ${metric.responseTime}ms for ${metric.endpoint}`,
        metric.endpoint,
        metric.responseTime,
        this.thresholds.responseTime.critical,
      );
    } else if (metric.responseTime > this.thresholds.responseTime.warning) {
      this.createAlert(
        'HIGH',
        'RESPONSE_TIME',
        `Slow response time: ${metric.responseTime}ms for ${metric.endpoint}`,
        metric.endpoint,
        metric.responseTime,
        this.thresholds.responseTime.warning,
      );
    }

    // Error rate alerts
    const endpointStats = this.endpointStatsMap.get(metric.endpoint);
    if (
      endpointStats &&
      endpointStats.errorRate > this.thresholds.errorRate.critical
    ) {
      this.createAlert(
        'CRITICAL',
        'ERROR_RATE',
        `Critical error rate: ${endpointStats.errorRate.toFixed(1)}% for ${metric.endpoint}`,
        metric.endpoint,
        endpointStats.errorRate,
        this.thresholds.errorRate.critical,
      );
    } else if (
      endpointStats &&
      endpointStats.errorRate > this.thresholds.errorRate.warning
    ) {
      this.createAlert(
        'HIGH',
        'ERROR_RATE',
        `High error rate: ${endpointStats.errorRate.toFixed(1)}% for ${metric.endpoint}`,
        metric.endpoint,
        endpointStats.errorRate,
        this.thresholds.errorRate.warning,
      );
    }
  }

  /**
   * Check system-level thresholds
   */
  private checkSystemThresholds(systemMetrics: SystemMetrics): void {
    // Memory usage alerts
    if (systemMetrics.memory.usage > this.thresholds.memoryUsage.critical) {
      this.createAlert(
        'CRITICAL',
        'MEMORY',
        `Critical memory usage: ${systemMetrics.memory.usage.toFixed(1)}%`,
        undefined,
        systemMetrics.memory.usage,
        this.thresholds.memoryUsage.critical,
      );
    } else if (
      systemMetrics.memory.usage > this.thresholds.memoryUsage.warning
    ) {
      this.createAlert(
        'MEDIUM',
        'MEMORY',
        `High memory usage: ${systemMetrics.memory.usage.toFixed(1)}%`,
        undefined,
        systemMetrics.memory.usage,
        this.thresholds.memoryUsage.warning,
      );
    }

    // CPU usage alerts
    if (systemMetrics.cpu.usage > this.thresholds.cpuUsage.critical) {
      this.createAlert(
        'CRITICAL',
        'CPU',
        `Critical CPU usage: ${systemMetrics.cpu.usage.toFixed(1)}%`,
        undefined,
        systemMetrics.cpu.usage,
        this.thresholds.cpuUsage.critical,
      );
    } else if (systemMetrics.cpu.usage > this.thresholds.cpuUsage.warning) {
      this.createAlert(
        'MEDIUM',
        'CPU',
        `High CPU usage: ${systemMetrics.cpu.usage.toFixed(1)}%`,
        undefined,
        systemMetrics.cpu.usage,
        this.thresholds.cpuUsage.warning,
      );
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(
    severity: PerformanceAlert['severity'],
    type: PerformanceAlert['type'],
    message: string,
    endpoint?: string,
    value: number = 0,
    threshold: number = 0,
  ): void {
    const alert: PerformanceAlert = {
      severity,
      type,
      message,
      endpoint,
      value,
      threshold,
      timestamp: Date.now(),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    this.logger.warn(`Performance Alert [${severity}]: ${message}`);
    this.emit('alert-created', alert);
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified calculation - actual implementation would track deltas
    return ((cpuUsage.user + cpuUsage.system) / 1000000) * 100;
  }

  /**
   * Calculate requests per second
   */
  private calculateRequestsPerSecond(): number {
    const oneSecondAgo = Date.now() - 1000;
    const recentRequests = this.metrics.filter(
      (m) => m.timestamp > oneSecondAgo,
    );
    return recentRequests.length;
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(
    sortedArray: number[],
    percentile: number,
  ): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)] || 0;
  }

  /**
   * Get current system metrics
   */
  private getCurrentSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const loadAverage = os.loadavg();

    return {
      timestamp: Date.now(),
      cpu: {
        usage: this.calculateCpuUsage(process.cpuUsage()),
        loadAverage,
      },
      memory: {
        totalMB: Math.round(totalMemory / 1024 / 1024),
        usedMB: Math.round((totalMemory - freeMemory) / 1024 / 1024),
        freeMB: Math.round(freeMemory / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        usage: ((totalMemory - freeMemory) / totalMemory) * 100,
      },
      network: {
        activeConnections: 0,
        requestsPerSecond: this.calculateRequestsPerSecond(),
      },
      database: {
        activeConnections: 0,
        queryExecutionTime: 0,
        slowQueries: 0,
      },
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const endpointStats = Array.from(this.endpointStatsMap.values());

    // Slow endpoints
    const slowEndpoints = endpointStats.filter(
      (stats) => stats.averageResponseTime > 1000,
    );
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `Optimize ${slowEndpoints.length} slow endpoint(s) with >1s average response time`,
      );
    }

    // High error rate endpoints
    const errorProneEndpoints = endpointStats.filter(
      (stats) => stats.errorRate > 5,
    );
    if (errorProneEndpoints.length > 0) {
      recommendations.push(
        `Investigate ${errorProneEndpoints.length} endpoint(s) with >5% error rate`,
      );
    }

    // High traffic endpoints
    const highTrafficEndpoints = endpointStats.filter(
      (stats) => stats.requestsPerMinute > 100,
    );
    if (highTrafficEndpoints.length > 0) {
      recommendations.push(
        `Consider caching for ${highTrafficEndpoints.length} high-traffic endpoint(s)`,
      );
    }

    // Recent critical alerts
    const recentCriticalAlerts = this.alerts.filter(
      (alert) =>
        alert.severity === 'CRITICAL' && alert.timestamp > Date.now() - 300000,
    );
    if (recentCriticalAlerts.length > 0) {
      recommendations.push(
        `Address ${recentCriticalAlerts.length} critical performance issue(s) from the last 5 minutes`,
      );
    }

    // System resource recommendations
    const systemMetrics = this.getCurrentSystemMetrics();
    if (systemMetrics.memory.usage > 80) {
      recommendations.push(
        'High memory usage detected - consider optimizing memory allocation or scaling',
      );
    }

    if (systemMetrics.cpu.usage > 80) {
      recommendations.push(
        'High CPU usage detected - consider optimizing algorithms or scaling',
      );
    }

    return recommendations;
  }

  /**
   * Export performance data for Backend Agent analysis
   */
  exportPerformanceData(): {
    metrics: PerformanceMetrics[];
    endpointStats: EndpointStats[];
    alerts: PerformanceAlert[];
    systemInfo: {
      uptime: number;
      startTime: number;
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
    };
  } {
    const totalRequests = this.metrics.length;
    const averageResponseTime =
      totalRequests > 0
        ? this.metrics.reduce((sum, m) => sum + m.responseTime, 0) /
          totalRequests
        : 0;
    const errorCount = this.metrics.filter((m) => m.errorCount > 0).length;
    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      metrics: this.metrics,
      endpointStats: Array.from(this.endpointStatsMap.values()),
      alerts: this.alerts,
      systemInfo: {
        uptime: Date.now() - this.startTime,
        startTime: this.startTime,
        totalRequests,
        averageResponseTime,
        errorRate,
      },
    };
  }
}

// Export singleton instance
export const performanceDashboard = new PerformanceDashboard();

// Express middleware for automatic request monitoring
export const performanceMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    performanceDashboard.recordRequest(
      req.route?.path || req.path,
      req.method,
      responseTime,
      res.statusCode,
    );
  });

  next();
};
