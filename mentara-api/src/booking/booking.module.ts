import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';
import { SlotGeneratorService } from './services/slot-generator.service';
import { ConflictDetectionService } from './services/conflict-detection.service';
import { AvailabilityValidatorService } from './services/availability-validator.service';
import { BillingService } from '../billing/billing.service';

@Module({
  controllers: [BookingController],
  providers: [
    BookingService,
    SlotGeneratorService,
    ConflictDetectionService,
    AvailabilityValidatorService,
    BillingService,
    PrismaService,
    EventBusService,
  ],
  exports: [BookingService],
})
export class BookingModule {}
