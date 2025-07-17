import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async getBasicHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getDetailedHealth() {
    try {
      const [dbHealth, servicesHealth, systemMetrics] = await Promise.all([
        this.getDatabaseHealth(),
        this.getServicesHealth(),
        this.getSystemMetrics(),
      ]);

      const hasErrors = 
        dbHealth.status === 'disconnected' ||
        Object.values(servicesHealth).some((service: any) => service.status === 'error');

      return {
        status: hasErrors ? 'error' : 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        version: process.env.npm_package_version || '1.0.0',
        database: dbHealth,
        services: servicesHealth,
        system: systemMetrics,
        errors: hasErrors ? ['One or more services are unhealthy'] : [],
      };
    } catch (error) {
      this.logger.error('Failed to get detailed health', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        errors: ['Failed to retrieve health information'],
      };
    }
  }

  async getDatabaseHealth() {
    try {
      const start = Date.now();
      
      // Test database connectivity with a simple query
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - start;

      // Get database stats (mock data for demonstration)
      const connections = {
        active: 5,
        idle: 3,
        total: 10,
      };

      const queryStats = {
        totalQueries: 1543,
        averageQueryTime: 45,
        slowQueries: 2,
      };

      return {
        status: 'connected',
        responseTime,
        connections,
        queryStats,
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Mock: 24 hours ago
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getServicesHealth() {
    const services = {
      supabase: await this.checkSupabaseHealth(),
      stripe: await this.checkStripeHealth(),
      emailService: await this.checkEmailServiceHealth(),
      aiService: await this.checkAiServiceHealth(),
    };

    return services;
  }

  private async checkSupabaseHealth() {
    try {
      const start = Date.now();
      // Mock Supabase health check
      // In a real implementation, you'd ping Supabase API
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API call
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        responseTime,
        region: 'us-east-1',
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkStripeHealth() {
    try {
      const start = Date.now();
      // Mock Stripe health check
      await new Promise(resolve => setTimeout(resolve, 30));
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        responseTime,
        webhooksProcessed: 1247,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkEmailServiceHealth() {
    try {
      const start = Date.now();
      // Mock email service health check
      await new Promise(resolve => setTimeout(resolve, 25));
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        responseTime,
        emailsSent: 892,
        failureRate: 0.02,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkAiServiceHealth() {
    try {
      const start = Date.now();
      // Mock AI service health check
      await new Promise(resolve => setTimeout(resolve, 75));
      const responseTime = Date.now() - start;

      return {
        status: 'ok',
        responseTime,
        assessmentsProcessed: 234,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const systemMemory = {
      used: memoryUsage.heapUsed,
      free: os.freemem(),
      total: os.totalmem(),
      percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
    };

    const cpu = {
      usage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      cores: os.cpus().length,
    };

    // Mock disk usage (in a real implementation, you'd use a library like 'diskusage')
    const disk = {
      used: 85 * 1024 * 1024 * 1024, // 85GB
      free: 15 * 1024 * 1024 * 1024, // 15GB
      total: 100 * 1024 * 1024 * 1024, // 100GB
      percentage: 85,
    };

    // Mock network stats
    const network = {
      bytesReceived: 1024 * 1024 * 150, // 150MB
      bytesSent: 1024 * 1024 * 200, // 200MB
      packetsReceived: 50000,
      packetsSent: 45000,
    };

    const nodejs = {
      version: process.version,
      uptime: process.uptime(),
      pid: process.pid,
    };

    return {
      memory: systemMemory,
      cpu,
      disk,
      network,
      nodejs,
    };
  }

  async getAdminHealthDashboard() {
    const [detailedHealth, systemMetrics] = await Promise.all([
      this.getDetailedHealth(),
      this.getSystemMetrics(),
    ]);

    // Mock alerts for admin dashboard
    const alerts = [
      {
        severity: 'medium',
        message: 'High memory usage detected (>80%)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        resolved: false,
      },
      {
        severity: 'low',
        message: 'Database query time slightly elevated',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        resolved: true,
      },
    ];

    const performance = {
      averageResponseTime: 245, // ms
      requestsPerMinute: 127,
      activeConnections: 23,
      errorCount: 3,
    };

    return {
      overview: {
        status: detailedHealth.status,
        uptime: detailedHealth.uptime,
        lastRestart: new Date(Date.now() - (detailedHealth.uptime || 0) * 1000).toISOString(),
        errorRate: 0.12, // 0.12%
      },
      alerts,
      performance,
      resources: {
        memory: systemMetrics.memory,
        cpu: systemMetrics.cpu,
        database: detailedHealth.database,
        storage: systemMetrics.disk,
      },
    };
  }
}