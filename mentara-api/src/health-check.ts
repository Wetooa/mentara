/**
 * Health Check Service for Docker Container
 * Comprehensive health validation for production deployment
 */

import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import * as http from 'http';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    server: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    dependencies: {
      status: 'healthy' | 'unhealthy';
      details: Record<string, any>;
    };
  };
  metadata: {
    uptime: number;
    version: string;
    environment: string;
    nodeVersion: string;
  };
}

class HealthCheckService {
  private app: INestApplication;
  private prisma: PrismaService;

  async initialize(): Promise<void> {
    try {
      this.app = await NestFactory.create(AppModule, { logger: false });
      this.prisma = this.app.get<PrismaService>(PrismaService);
    } catch (error) {
      console.error('Failed to initialize health check service:', error);
      process.exit(1);
    }
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'unhealthy' },
        server: { status: 'unhealthy' },
        dependencies: { status: 'healthy', details: {} }
      },
      metadata: {
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      }
    };

    // Database health check
    try {
      const dbStartTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      result.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime
      };
    } catch (error) {
      result.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
      result.status = 'unhealthy';
    }

    // Server health check
    try {
      const serverStartTime = Date.now();
      const serverCheck = await this.checkServerHealth();
      result.checks.server = {
        status: serverCheck ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - serverStartTime
      };
      
      if (!serverCheck) {
        result.status = 'unhealthy';
      }
    } catch (error) {
      result.checks.server = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Server health check failed'
      };
      result.status = 'unhealthy';
    }

    // Dependencies health check
    try {
      const dependencyChecks = await this.checkDependencies();
      result.checks.dependencies = {
        status: dependencyChecks.allHealthy ? 'healthy' : 'unhealthy',
        details: dependencyChecks.details
      };
      
      if (!dependencyChecks.allHealthy) {
        // Dependencies are not critical for overall health, but log issues
        console.warn('Some dependencies are unhealthy:', dependencyChecks.details);
      }
    } catch (error) {
      result.checks.dependencies = {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Dependency check failed' }
      };
    }

    return result;
  }

  private async checkServerHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get('http://localhost:3000/health', (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  private async checkDependencies(): Promise<{ allHealthy: boolean; details: Record<string, any> }> {
    const checks: Record<string, any> = {};
    let allHealthy = true;

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memoryHealthy = memUsage.heapUsed < memUsage.heapTotal * 0.9;
    checks.memory = {
      status: memoryHealthy ? 'healthy' : 'unhealthy',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      usage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`
    };
    
    if (!memoryHealthy) {
      allHealthy = false;
    }

    // Event loop lag check
    const eventLoopStart = process.hrtime();
    await new Promise(resolve => setImmediate(resolve));
    const eventLoopLag = process.hrtime(eventLoopStart);
    const lagMs = eventLoopLag[0] * 1000 + eventLoopLag[1] * 1e-6;
    const eventLoopHealthy = lagMs < 10; // Less than 10ms lag
    
    checks.eventLoop = {
      status: eventLoopHealthy ? 'healthy' : 'unhealthy',
      lag: `${lagMs.toFixed(2)}ms`
    };
    
    if (!eventLoopHealthy) {
      allHealthy = false;
    }

    // File system check (basic write test)
    try {
      const fs = await import('fs/promises');
      const testFile = '/tmp/health-check-test';
      await fs.writeFile(testFile, 'health-check');
      await fs.unlink(testFile);
      checks.filesystem = { status: 'healthy' };
    } catch (error) {
      checks.filesystem = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Filesystem check failed'
      };
      allHealthy = false;
    }

    return { allHealthy, details: checks };
  }

  async cleanup(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
    if (this.app) {
      await this.app.close();
    }
  }
}

// Main execution for Docker health check
async function main(): Promise<void> {
  const healthCheck = new HealthCheckService();
  
  try {
    await healthCheck.initialize();
    const result = await healthCheck.performHealthCheck();
    
    // Output result for Docker health check
    if (result.status === 'healthy') {
      console.log('HEALTHY');
      process.exit(0);
    } else {
      console.log('UNHEALTHY');
      console.error('Health check details:', JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  } finally {
    await healthCheck.cleanup();
  }
}

// Run health check if this file is executed directly
if (require.main === module) {
  main();
}

export { HealthCheckService, HealthCheckResult };