import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  slowQueries: number;
  errorCount: number;
  timestamp: Date;
}

interface QueryPerformance {
  query: string;
  duration: number;
  timestamp: Date;
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private requestMetrics: Map<string, PerformanceMetrics> = new Map();
  private slowQueries: QueryPerformance[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly MAX_SLOW_QUERIES = 100;

  constructor(private readonly prisma: PrismaService) {
    this.setupPrismaQueryLogging();
  }

  /**
   * Setup Prisma query logging to track slow queries
   */
  private setupPrismaQueryLogging() {
    // Intercept Prisma queries to log slow ones
    const originalQuery = this.prisma.$queryRaw;
    const originalExecute = this.prisma.$executeRaw;

    // Note: Prisma doesn't expose query duration directly
    // This is a placeholder - in production, use Prisma middleware or query extensions
    this.logger.log('Performance monitoring initialized');
  }

  /**
   * Record request performance metrics
   */
  recordRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
  ): void {
    const key = `${method}:${endpoint}`;
    const metrics = this.requestMetrics.get(key) || {
      requestCount: 0,
      averageResponseTime: 0,
      slowQueries: 0,
      errorCount: 0,
      timestamp: new Date(),
    };

    metrics.requestCount++;
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.requestCount - 1) + duration) /
      metrics.requestCount;

    if (statusCode >= 400) {
      metrics.errorCount++;
    }

    if (duration > this.SLOW_QUERY_THRESHOLD) {
      metrics.slowQueries++;
      this.logger.warn(
        `Slow request detected: ${key} took ${duration}ms (status: ${statusCode})`,
      );
    }

    this.requestMetrics.set(key, metrics);
  }

  /**
   * Record slow database query
   */
  recordSlowQuery(query: string, duration: number): void {
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.slowQueries.push({
        query: query.substring(0, 200), // Truncate long queries
        duration,
        timestamp: new Date(),
      });

      // Keep only the most recent slow queries
      if (this.slowQueries.length > this.MAX_SLOW_QUERIES) {
        this.slowQueries.shift();
      }

      this.logger.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}...`);
    }
  }

  /**
   * Get performance metrics for an endpoint
   */
  getMetrics(endpoint: string, method: string): PerformanceMetrics | null {
    const key = `${method}:${endpoint}`;
    return this.requestMetrics.get(key) || null;
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.requestMetrics);
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit = 20): QueryPerformance[] {
    return this.slowQueries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get database connection pool metrics
   */
  async getConnectionPoolMetrics(): Promise<{
    active: number;
    idle: number;
    total: number;
  }> {
    try {
      // Prisma doesn't expose connection pool metrics directly
      // This would require using the underlying database connection
      // For now, return mock data - in production, use database-specific queries
      return {
        active: 0,
        idle: 0,
        total: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get connection pool metrics:', error);
      return {
        active: 0,
        idle: 0,
        total: 0,
      };
    }
  }

  /**
   * Reset metrics (useful for testing or periodic cleanup)
   */
  resetMetrics(): void {
    this.requestMetrics.clear();
    this.slowQueries = [];
    this.logger.log('Performance metrics reset');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalEndpoints: number;
    averageResponseTime: number;
    slowEndpoints: Array<{ endpoint: string; avgTime: number }>;
    totalSlowQueries: number;
  } {
    const endpoints = Array.from(this.requestMetrics.values());
    const totalAvgTime =
      endpoints.reduce((sum, m) => sum + m.averageResponseTime, 0) /
      endpoints.length;

    const slowEndpoints = Array.from(this.requestMetrics.entries())
      .filter(([_, metrics]) => metrics.averageResponseTime > 500)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgTime: metrics.averageResponseTime,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      totalEndpoints: this.requestMetrics.size,
      averageResponseTime: totalAvgTime || 0,
      slowEndpoints,
      totalSlowQueries: this.slowQueries.length,
    };
  }
}

