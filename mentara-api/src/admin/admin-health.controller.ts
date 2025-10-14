import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/core/decorators/public.decorator';

@Controller('admin')
export class AdminHealthController {
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    return {
      success: true,
      message: 'Admin service is healthy',
      timestamp: new Date().toISOString(),
      service: 'admin',
      modules: {
        accounts: 'active',
        analytics: 'active',
        therapists: 'active',
        users: 'active',
        moderation: 'active',
        reports: 'active',
      },
    };
  }
}
