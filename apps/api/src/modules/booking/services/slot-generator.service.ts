import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ACTIVE_MEETING_STATUSES_ARRAY } from '../constants/meeting-status.constants';

export interface TimeSlot {
  startTime: string;
  availableDurations: {
    id: string;
    name: string;
    duration: number;
  }[];
}

export interface SlotGenerationConfig {
  slotInterval: number; // minutes
  maxAdvanceBooking: number; // days
  minAdvanceBooking: number; // hours
}

@Injectable()
export class SlotGeneratorService {
  private readonly logger = new Logger(SlotGeneratorService.name);
  private readonly defaultConfig: SlotGenerationConfig = {
    slotInterval: 30,
    maxAdvanceBooking: 90,
    minAdvanceBooking: 0.5,
  };

  constructor(private readonly prisma: PrismaService) {}

  private getDurations() {
    return [
      { id: '30', name: '30 minutes', duration: 30 },
      { id: '60', name: '60 minutes', duration: 60 },
      { id: '90', name: '90 minutes', duration: 90 },
      { id: '120', name: '120 minutes', duration: 120 },
    ];
  }

  /**
   * Generate available time slots for a therapist on a specific date
   */
  /**
   * Generate available time slots for a therapist on a specific date
   */
  async generateAvailableSlots(
    therapistId: string,
    date: string,
    config: Partial<SlotGenerationConfig> = {},
  ): Promise<TimeSlot[]> {
    this.logger.debug(
      `Generating slots for therapist ${therapistId} on ${date}`,
    );

    const finalConfig = { ...this.defaultConfig, ...config };
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    this.logger.debug(
      `Target date: ${targetDate.toISOString()}, dayOfWeek: ${dayOfWeek} (${this.getDayName(dayOfWeek)})`,
    );

    // Validate date is within booking window
    this.validateBookingDate(targetDate, finalConfig);

    // Get therapist availability for this day - convert JS day number to string
    const availability = await this.getTherapistAvailability(
      therapistId,
      dayOfWeek.toString(), // Fixed: ensure consistent string conversion
    );

    this.logger.debug(
      `Found ${availability.length} availability records:`,
      availability,
    );

    if (availability.length === 0) {
      this.logger.debug(
        `No availability found for therapist ${therapistId} on ${this.getDayName(dayOfWeek)}`,
      );
      return [];
    }

    // Get existing bookings for this date
    const existingBookings = await this.getExistingBookings(
      therapistId,
      targetDate,
    );

    this.logger.debug(
      `Found ${existingBookings.length} existing bookings:`,
      existingBookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        duration: b.duration,
        status: b.status,
      })),
    );

    // Generate slots for each availability window
    const allSlots: TimeSlot[] = [];
    for (const avail of availability) {
      this.logger.debug(
        `Processing availability window: ${avail.startTime} - ${avail.endTime}`,
      );
      const slots = this.generateSlotsForAvailabilityWindow(
        targetDate,
        avail,
        existingBookings,
        finalConfig,
      );
      this.logger.debug(`Generated ${slots.length} slots for this window`);
      allSlots.push(...slots);
    }

    const sortedSlots = allSlots.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    this.logger.debug(`Final result: ${sortedSlots.length} total slots`);
    return sortedSlots;
  }

  private validateBookingDate(date: Date, config: SlotGenerationConfig): void {
    const now = new Date();

    // Calculate min and max dates using UTC
    const maxDate = new Date(
      now.getTime() + config.maxAdvanceBooking * 24 * 60 * 60 * 1000,
    );
    const minDate = new Date(
      now.getTime() + config.minAdvanceBooking * 60 * 60 * 1000,
    );

    // Compare target date with UTC times
    if (date < minDate) {
      throw new BadRequestException(
        `Bookings must be made at least ${config.minAdvanceBooking} hours in advance`,
      );
    }

    if (date > maxDate) {
      throw new BadRequestException(
        `Bookings can only be made up to ${config.maxAdvanceBooking} days in advance`,
      );
    }
  }

  private async getTherapistAvailability(
    therapistId: string,
    dayOfWeek: string, // Changed: accept string directly to match database schema
  ) {
    return this.prisma.therapistAvailability.findMany({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek, // Use directly since it's already a string
        isAvailable: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  private async getExistingBookings(therapistId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.meeting.findMany({
      where: {
        therapistId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { in: ACTIVE_MEETING_STATUSES_ARRAY },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  private generateSlotsForAvailabilityWindow(
    date: Date,
    availability: any,
    existingBookings: any[],
    config: SlotGenerationConfig,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const durations = this.getDurations();

    const startTime = this.createDateTime(date, availability.startTime);
    const endTime = this.createDateTime(date, availability.endTime);

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEnd = new Date(
        currentTime.getTime() + config.slotInterval * 60000,
      );

      if (slotEnd <= endTime) {
        // Check if this slot conflicts with existing bookings
        if (
          !this.hasConflictWithBookings(currentTime, slotEnd, existingBookings)
        ) {
          // Find which durations fit in this slot
          const availableDurations = this.getAvailableDurations(
            currentTime,
            endTime,
            existingBookings,
            durations,
          );

          if (availableDurations.length > 0) {
            slots.push({
              startTime: currentTime.toISOString(),
              availableDurations,
            });
          }
        }
      }

      currentTime = new Date(
        currentTime.getTime() + config.slotInterval * 60000,
      );
    }

    return slots;
  }

  private createDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  private hasConflictWithBookings(
    slotStart: Date,
    slotEnd: Date,
    bookings: any[],
  ): boolean {
    return bookings.some((booking) => {
      const bookingEnd = new Date(
        booking.startTime.getTime() + booking.duration * 60000,
      );
      return this.hasTimeOverlap(
        slotStart,
        slotEnd,
        booking.startTime,
        bookingEnd,
      );
    });
  }

  private getAvailableDurations(
    slotStart: Date,
    availabilityEnd: Date,
    existingBookings: any[],
    durations: any[],
  ) {
    return durations.filter((duration) => {
      const durationEnd = new Date(
        slotStart.getTime() + duration.duration * 60000,
      );

      // Check if duration fits within availability window
      if (durationEnd > availabilityEnd) {
        return false;
      }

      // Check if duration conflicts with existing bookings
      return !this.hasConflictWithBookings(
        slotStart,
        durationEnd,
        existingBookings,
      );
    });
  }

  private hasTimeOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Check if a specific time slot is available
   */
  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(
    therapistId: string,
    startTime: Date,
    duration: number,
  ): Promise<boolean> {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const dayOfWeek = startTime.getDay();

    // Check therapist availability - convert JS day number to string
    const availability = await this.prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek.toString(), // Fixed: consistent string conversion
        isAvailable: true,
      },
    });

    if (!availability) {
      return false;
    }

    // Check if time fits within availability window
    const availStart = this.createDateTime(startTime, availability.startTime);
    const availEnd = this.createDateTime(startTime, availability.endTime);

    if (startTime < availStart || endTime > availEnd) {
      return false;
    }

    // Check for conflicts with existing bookings
    const existingBookings = await this.getExistingBookings(
      therapistId,
      startTime,
    );

    return !this.hasConflictWithBookings(startTime, endTime, existingBookings);
  }

  private getDayName(dayOfWeek: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek] || 'Unknown';
  }
}
