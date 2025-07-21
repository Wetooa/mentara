import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

export interface ValidationConfig {
  allowedDurations: number[]; // minutes
  timeFormat: 'HH:MM' | 'HH:mm';
  timezone: string;
  businessHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  advanceBooking: {
    minHours: number;
    maxDays: number;
  };
  weekendBooking: boolean;
}

@Injectable()
export class AvailabilityValidatorService {
  private readonly defaultConfig: ValidationConfig = {
    allowedDurations: [30, 60, 90, 120],
    timeFormat: 'HH:MM',
    timezone: 'UTC',
    businessHours: {
      start: '08:00',
      end: '20:00',
    },
    advanceBooking: {
      minHours: 2,
      maxDays: 90,
    },
    weekendBooking: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate time format (HH:MM or HH:mm)
   */
  validateTimeFormat(
    timeString: string,
    format: 'HH:MM' | 'HH:mm' = 'HH:MM',
  ): boolean {
    const regex =
      format === 'HH:MM'
        ? /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        : /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!regex.test(timeString)) {
      throw new BadRequestException(
        `Invalid time format. Expected ${format} format (e.g., 09:30)`,
      );
    }
    return true;
  }

  /**
   * Validate meeting duration
   */
  validateDuration(duration: number, allowedDurations?: number[]): boolean {
    const allowed = allowedDurations || this.defaultConfig.allowedDurations;

    if (!allowed.includes(duration)) {
      throw new BadRequestException(
        `Invalid duration. Allowed durations are: ${allowed.join(', ')} minutes`,
      );
    }
    return true;
  }

  /**
   * Validate booking date and time constraints
   */
  validateBookingDateTime(
    startTime: Date,
    duration: number,
    config: Partial<ValidationConfig> = {},
  ): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };

    this.validateAdvanceBooking(startTime, finalConfig);
    this.validateBusinessHours(startTime, duration, finalConfig);
    this.validateWeekendBooking(startTime, finalConfig);
    this.validateDuration(duration, finalConfig.allowedDurations);

    return true;
  }

  /**
   * Validate advance booking constraints
   */
  private validateAdvanceBooking(
    startTime: Date,
    config: ValidationConfig,
  ): void {
    const now = new Date();
    const timeDiff = startTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (hoursDiff < config.advanceBooking.minHours) {
      throw new BadRequestException(
        `Bookings must be made at least ${config.advanceBooking.minHours} hours in advance`,
      );
    }

    if (daysDiff > config.advanceBooking.maxDays) {
      throw new BadRequestException(
        `Bookings can only be made up to ${config.advanceBooking.maxDays} days in advance`,
      );
    }
  }

  /**
   * Validate business hours constraints
   */
  private validateBusinessHours(
    startTime: Date,
    duration: number,
    config: ValidationConfig,
  ): void {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const startTimeStr = this.formatTime(startTime);
    const endTimeStr = this.formatTime(endTime);

    if (
      startTimeStr < config.businessHours.start ||
      endTimeStr > config.businessHours.end
    ) {
      throw new BadRequestException(
        `Meeting must be within business hours (${config.businessHours.start} - ${config.businessHours.end})`,
      );
    }
  }

  /**
   * Validate weekend booking if not allowed
   */
  private validateWeekendBooking(
    startTime: Date,
    config: ValidationConfig,
  ): void {
    if (!config.weekendBooking) {
      const dayOfWeek = startTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Sunday = 0, Saturday = 6
        throw new BadRequestException('Weekend bookings are not allowed');
      }
    }
  }

  /**
   * Check if therapist is available at the specified time
   */
  async validateTherapistAvailability(
    therapistId: string,
    startTime: Date,
    duration: number,
  ): Promise<boolean> {
    const dayOfWeek = startTime.getDay();
    const startTimeStr = this.formatTime(startTime);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const endTimeStr = this.formatTime(endTime);

    const availability = await this.prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek.toString(),
        startTime: { lte: startTimeStr },
        endTime: { gte: endTimeStr },
        isAvailable: true,
      },
    });

    if (!availability) {
      throw new BadRequestException(
        'Therapist is not available at the requested time',
      );
    }

    return true;
  }

  /**
   * Validate client-therapist relationship exists
   */
  async validateClientTherapistRelationship(
    clientId: string,
    therapistId: string,
  ): Promise<boolean> {
    const relationship = await this.prisma.clientTherapist.findFirst({
      where: {
        clientId,
        therapistId,
      },
    });

    if (!relationship) {
      throw new BadRequestException(
        'You can only book sessions with your assigned therapists',
      );
    }

    return true;
  }

  /**
   * Validate therapist exists and is active
   */
  async validateTherapistExists(therapistId: string): Promise<boolean> {
    const therapist = await this.prisma.therapist.findFirst({
      where: {
        userId: therapistId,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });

    if (!therapist || !therapist.user.isActive) {
      throw new BadRequestException('Therapist not found or inactive');
    }

    return true;
  }

  /**
   * Validate availability slot overlap
   */
  validateAvailabilityOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string,
  ): boolean {
    if (startTime1 >= endTime1) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime2 >= endTime2) {
      throw new BadRequestException('Start time must be before end time');
    }

    const hasOverlap = startTime1 < endTime2 && endTime1 > startTime2;

    if (hasOverlap) {
      throw new BadRequestException(
        'Availability slot overlaps with existing availability',
      );
    }

    return true;
  }

  /**
   * Validate timezone (if timezone support is needed)
   */
  validateTimezone(timezone: string): boolean {
    try {
      // Check if timezone is valid
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      throw new BadRequestException(`Invalid timezone: ${timezone}`);
    }
  }

  /**
   * Comprehensive validation for meeting creation
   */
  async validateMeetingCreation({
    therapistId,
    clientId,
    startTime,
    duration,
    config = {},
  }: {
    therapistId: string;
    clientId: string;
    startTime: Date;
    duration: number;
    config?: Partial<ValidationConfig>;
  }): Promise<boolean> {
    // Run all validations
    await Promise.all([
      this.validateTherapistExists(therapistId),
      this.validateClientTherapistRelationship(clientId, therapistId),
      this.validateTherapistAvailability(therapistId, startTime, duration),
    ]);

    this.validateBookingDateTime(startTime, duration, config);

    return true;
  }

  /**
   * Comprehensive validation for availability creation
   */
  async validateAvailabilityCreation({
    therapistId,
    dayOfWeek,
    startTime,
    endTime,
  }: {
    therapistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }): Promise<boolean> {
    // Validate therapist exists
    await this.validateTherapistExists(therapistId);

    // Validate time formats
    this.validateTimeFormat(startTime);
    this.validateTimeFormat(endTime);

    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Validate day of week
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new BadRequestException(
        'Day of week must be between 0 (Sunday) and 6 (Saturday)',
      );
    }

    // Check for overlapping availability
    const overlapping = await this.prisma.therapistAvailability.findFirst({
      where: {
        therapistId,
        dayOfWeek: dayOfWeek.toString(),
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Availability slot overlaps with existing availability',
      );
    }

    return true;
  }

  /**
   * Format Date to HH:MM string
   */
  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  /**
   * Parse time string to minutes since midnight
   */
  private parseTimeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to HH:MM string
   */
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
