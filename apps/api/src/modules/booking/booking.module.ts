import { Module } from '@nestjs/common';
import { BookingHealthController } from './booking-health.controller';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { SmartSchedulingService } from './services/smart-scheduling.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EventBusService } from '../../common/events/event-bus.service';
import { SlotGeneratorService } from './services/slot-generator.service';
import { ConflictDetectionService } from './services/conflict-detection.service';
import { AvailabilityValidatorService } from './services/availability-validator.service';
import { PricingService } from './services/pricing.service';
import { BillingService } from '../billing/billing.service';

@Module({
  controllers: [BookingController, BookingHealthController],
  providers: [
    BookingService,
    SmartSchedulingService,
    SlotGeneratorService,
    ConflictDetectionService,
    AvailabilityValidatorService,
    PricingService,
    BillingService,
    PrismaService,
    EventBusService,
  ],
  exports: [BookingService, SmartSchedulingService],
})
export class BookingModule {}
