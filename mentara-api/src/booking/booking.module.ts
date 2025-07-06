import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { EventBusService } from '../common/events/event-bus.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, PrismaService, EventBusService],
  exports: [BookingService],
})
export class BookingModule {}
