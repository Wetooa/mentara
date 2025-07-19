import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description:
      'Basic health check endpoint that returns the API status and timestamp',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Uptime in seconds' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async getHealth() {
    return this.healthService.getBasicHealth();
  }

  @Public()
  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Comprehensive health check including database, external services, and system metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            responseTime: { type: 'number' },
            connections: { type: 'number' },
          },
        },
        services: {
          type: 'object',
          properties: {
            supabase: { type: 'string', example: 'ok' },
            stripe: { type: 'string', example: 'ok' },
            emailService: { type: 'string', example: 'ok' },
          },
        },
        system: {
          type: 'object',
          properties: {
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                total: { type: 'number' },
                percentage: { type: 'number' },
              },
            },
            cpu: {
              type: 'object',
              properties: {
                usage: { type: 'number' },
                loadAverage: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - one or more components are unhealthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        errors: { type: 'array', items: { type: 'string' } },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getDetailedHealth() {
    const health = await this.healthService.getDetailedHealth();

    if (health.status === 'error') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }

  @Public()
  @Get('database')
  @ApiOperation({
    summary: 'Database health check',
    description: 'Check database connectivity and performance metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Database health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'connected' },
        responseTime: {
          type: 'number',
          description: 'Response time in milliseconds',
        },
        connections: {
          type: 'object',
          properties: {
            active: { type: 'number' },
            idle: { type: 'number' },
            total: { type: 'number' },
          },
        },
        queryStats: {
          type: 'object',
          properties: {
            totalQueries: { type: 'number' },
            averageQueryTime: { type: 'number' },
            slowQueries: { type: 'number' },
          },
        },
        lastBackup: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Database is unavailable',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'disconnected' },
        error: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getDatabaseHealth() {
    const dbHealth = await this.healthService.getDatabaseHealth();

    if (dbHealth.status === 'disconnected') {
      throw new HttpException(dbHealth, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return dbHealth;
  }

  @Public()
  @Get('services')
  @ApiOperation({
    summary: 'External services health check',
    description:
      'Check the status of external services (Supabase, Stripe, Email, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'External services health status',
    schema: {
      type: 'object',
      properties: {
        supabase: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            responseTime: { type: 'number' },
            region: { type: 'string' },
          },
        },
        stripe: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            responseTime: { type: 'number' },
            webhooksProcessed: { type: 'number' },
          },
        },
        emailService: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            responseTime: { type: 'number' },
            emailsSent: { type: 'number' },
            failureRate: { type: 'number' },
          },
        },
        aiService: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            responseTime: { type: 'number' },
            assessmentsProcessed: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 207,
    description: 'Multi-status - some services may be unavailable',
  })
  async getServicesHealth() {
    return this.healthService.getServicesHealth();
  }

  @Public()
  @Get('system')
  @ApiOperation({
    summary: 'System metrics',
    description:
      'Get system performance metrics including memory, CPU, and disk usage',
  })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', description: 'Used memory in bytes' },
            free: { type: 'number', description: 'Free memory in bytes' },
            total: { type: 'number', description: 'Total memory in bytes' },
            percentage: {
              type: 'number',
              description: 'Memory usage percentage',
            },
          },
        },
        cpu: {
          type: 'object',
          properties: {
            usage: { type: 'number', description: 'CPU usage percentage' },
            loadAverage: { type: 'array', items: { type: 'number' } },
            cores: { type: 'number' },
          },
        },
        disk: {
          type: 'object',
          properties: {
            used: { type: 'number' },
            free: { type: 'number' },
            total: { type: 'number' },
            percentage: { type: 'number' },
          },
        },
        network: {
          type: 'object',
          properties: {
            bytesReceived: { type: 'number' },
            bytesSent: { type: 'number' },
            packetsReceived: { type: 'number' },
            packetsSent: { type: 'number' },
          },
        },
        nodejs: {
          type: 'object',
          properties: {
            version: { type: 'string' },
            uptime: { type: 'number' },
            pid: { type: 'number' },
          },
        },
      },
    },
  })
  async getSystemMetrics() {
    return this.healthService.getSystemMetrics();
  }

  @Get('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin health dashboard',
    description:
      'Comprehensive health information for admin users including sensitive metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin health dashboard data',
    schema: {
      type: 'object',
      properties: {
        overview: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
            lastRestart: { type: 'string', format: 'date-time' },
            errorRate: { type: 'number' },
          },
        },
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
              },
              message: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              resolved: { type: 'boolean' },
            },
          },
        },
        performance: {
          type: 'object',
          properties: {
            averageResponseTime: { type: 'number' },
            requestsPerMinute: { type: 'number' },
            activeConnections: { type: 'number' },
            errorCount: { type: 'number' },
          },
        },
        resources: {
          type: 'object',
          properties: {
            memory: { type: 'object' },
            cpu: { type: 'object' },
            database: { type: 'object' },
            storage: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getAdminHealth() {
    return this.healthService.getAdminHealthDashboard();
  }
}
