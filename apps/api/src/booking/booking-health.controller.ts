import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/core/decorators/public.decorator';

@Controller('booking')
export class BookingHealthController {
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    return {
      success: true,
      message: 'Booking service is healthy',
      timestamp: new Date().toISOString(),
      service: 'booking',
      features: {
        meetings: 'active',
        availability: 'active',
        slotGeneration: 'active',
        conflictDetection: 'active',
        dynamicPricing: 'active',
      },
    };
  }
}
