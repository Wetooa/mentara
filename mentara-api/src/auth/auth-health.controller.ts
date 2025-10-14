import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from './core/decorators/public.decorator';

@Controller('auth')
export class AuthHealthController {
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    return {
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
      service: 'auth',
      modules: {
        client: 'active',
        therapist: 'active',
        admin: 'active',
        moderator: 'active',
      },
      features: {
        emailVerification: 'active',
        passwordReset: 'active',
        oauth: 'active',
        jwt: 'active',
      },
    };
  }
}
