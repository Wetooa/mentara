import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

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
  private readonly defaultConfig: SlotGenerationConfig = {
    slotInterval: 30,
    maxAdvanceBooking: 90,
    minAdvanceBooking: 2,
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
  async generateAvailableSlots(
    therapistId: string,
    date: string,
    config: Partial<SlotGenerationConfig> = {},
  ): Promise<TimeSlot[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Validate date is within booking window
    this.validateBookingDate(targetDate, finalConfig);

    // Get therapist availability for this day
    const availability = await this.getTherapistAvailability(
      therapistId,
      dayOfWeek,
    );
    if (availability.length === 0) {
      return [];
    }

    // Get existing bookings for this date
    const existingBookings = await this.getExistingBookings(
      therapistId,
      targetDate,
    );

    // Generate slots for each availability window
    const allSlots: TimeSlot[] = [];
    for (const avail of availability) {
      const slots = this.generateSlotsForAvailabilityWindow(
        targetDate,
        avail,
        existingBookings,
        finalConfig,
      );
      allSlots.push(...slots);
    }

    return allSlots.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }

  private validateBookingDate(date: Date, config: SlotGenerationConfig): void {
    const now = new Date();
    const maxDate = new Date(
      now.getTime() + config.maxAdvanceBooking * 24 * 60 * 60 * 1000,
    );
    const minDate = new Date(
      now.getTime() + config.minAdvanceBooking * 60 * 60 * 1000,
    );

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
    dayOfWeek: number,
  ) {
    return this.prisma.therapistAvailability.findMany({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek.toString(),
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
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
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
  async isSlotAvailable(
    therapistId: string,
    startTime: Date,
    duration: number,
  ): Promise<boolean> {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const dayOfWeek = startTime.getDay();

    // Check therapist availability
    const availability = await this.prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek.toString(),
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
}
