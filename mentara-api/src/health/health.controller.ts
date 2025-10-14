import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/core/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth() {
    return this.healthService.getBasicHealth();
  }

  @Public()
  async getDetailedHealth() {
    const health = await this.healthService.getDetailedHealth();

    if (health.status === 'error') {
      throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return health;
  }

  @Public()
  @Get('database')
  async getDatabaseHealth() {
    const dbHealth = await this.healthService.getDatabaseHealth();

    if (dbHealth.status === 'disconnected') {
      throw new HttpException(dbHealth, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return dbHealth;
  }

  @Public()
  @Get('services')
  async getServicesHealth() {
    return this.healthService.getServicesHealth();
  }

  @Public()
  @Get('system')
  async getSystemMetrics() {
    return this.healthService.getSystemMetrics();
  }

  @Public()
  @Get('websocket')
  async getWebSocketHealth() {
    const wsHealth = await this.healthService.getWebSocketHealth();
    
    if (wsHealth.status === 'unhealthy') {
      throw new HttpException(wsHealth, HttpStatus.SERVICE_UNAVAILABLE);
    }
    
    return wsHealth;
  }

  @Get('admin')
  async getAdminHealth() {
    return this.healthService.getAdminHealthDashboard();
  }
}
