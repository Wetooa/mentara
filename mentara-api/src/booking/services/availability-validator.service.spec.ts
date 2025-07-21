import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityValidatorService, ValidationConfig } from './availability-validator.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { BadRequestException } from '@nestjs/common';

describe('AvailabilityValidatorService', () => {
  let service: AvailabilityValidatorService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTherapistAvailability = {
    id: 'availability-123',
    therapistId: 'therapist-123',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    status: 'approved',
    user: {
      isActive: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientTherapistRelationship = {
    id: 'relationship-123',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    assignedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockValidationConfig: ValidationConfig = {
    allowedDurations: [30, 60, 90],
    timeFormat: 'HH:MM',
    timezone: 'UTC',
    businessHours: {
      start: '08:00',
      end: '18:00',
    },
    advanceBooking: {
      minHours: 2,
      maxDays: 30,
    },
    weekendBooking: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityValidatorService,
        {
          provide: PrismaService,
          useValue: {
            therapistAvailability: {
              findFirst: jest.fn(),
            },
            clientTherapist: {
              findFirst: jest.fn(),
            },
            therapist: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AvailabilityValidatorService>(AvailabilityValidatorService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTimeFormat', () => {
    it('should validate correct time format HH:MM', () => {
      const validTimes = ['09:30', '14:45', '23:59', '00:00'];
      
      validTimes.forEach(time => {
        expect(service.validateTimeFormat(time, 'HH:MM')).toBe(true);
      });
    });

    it('should validate correct time format HH:mm', () => {
      const validTimes = ['09:30', '14:45', '23:59', '00:00'];
      
      validTimes.forEach(time => {
        expect(service.validateTimeFormat(time, 'HH:mm')).toBe(true);
      });
    });

    it('should throw BadRequestException for invalid time format', () => {
      const invalidTimes = ['9:30', '24:00', '12:60', '12:ab', 'invalid', ''];
      
      invalidTimes.forEach(time => {
        expect(() => service.validateTimeFormat(time)).toThrow(BadRequestException);
        expect(() => service.validateTimeFormat(time)).toThrow('Invalid time format');
      });
    });

    it('should use default format HH:MM when format not specified', () => {
      expect(service.validateTimeFormat('09:30')).toBe(true);
      expect(() => service.validateTimeFormat('9:30')).toThrow(BadRequestException);
    });
  });

  describe('validateDuration', () => {
    it('should validate allowed durations', () => {
      const defaultAllowed = [30, 60, 90, 120];
      
      defaultAllowed.forEach(duration => {
        expect(service.validateDuration(duration)).toBe(true);
      });
    });

    it('should validate custom allowed durations', () => {
      const customAllowed = [45, 75, 105];
      
      customAllowed.forEach(duration => {
        expect(service.validateDuration(duration, customAllowed)).toBe(true);
      });
    });

    it('should throw BadRequestException for invalid duration', () => {
      expect(() => service.validateDuration(15)).toThrow(BadRequestException);
      expect(() => service.validateDuration(15)).toThrow('Invalid duration. Allowed durations are: 30, 60, 90, 120 minutes');
    });

    it('should throw BadRequestException for invalid custom duration', () => {
      const customAllowed = [45, 75];
      
      expect(() => service.validateDuration(60, customAllowed)).toThrow(BadRequestException);
      expect(() => service.validateDuration(60, customAllowed)).toThrow('Invalid duration. Allowed durations are: 45, 75 minutes');
    });
  });

  describe('validateBookingDateTime', () => {
    it('should validate valid booking date and time', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      expect(service.validateBookingDateTime(futureDate, 60)).toBe(true);
    });

    it('should validate booking with custom config', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      const customConfig = {
        allowedDurations: [60, 90],
        businessHours: { start: '09:00', end: '18:00' },
        advanceBooking: { minHours: 1, maxDays: 60 },
        weekendBooking: true,
      };
      
      expect(service.validateBookingDateTime(futureDate, 60, customConfig)).toBe(true);
    });

    it('should throw error for past booking time', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      
      expect(() => service.validateBookingDateTime(pastDate, 60)).toThrow(BadRequestException);
      expect(() => service.validateBookingDateTime(pastDate, 60)).toThrow('at least 2 hours in advance');
    });

    it('should throw error for booking too far in advance', () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 100);
      
      expect(() => service.validateBookingDateTime(farFutureDate, 60)).toThrow(BadRequestException);
      expect(() => service.validateBookingDateTime(farFutureDate, 60)).toThrow('up to 90 days in advance');
    });

    it('should throw error for booking outside business hours', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(7, 0, 0, 0); // Before business hours
      
      expect(() => service.validateBookingDateTime(futureDate, 60)).toThrow(BadRequestException);
      expect(() => service.validateBookingDateTime(futureDate, 60)).toThrow('within business hours');
    });

    it('should throw error for weekend booking when not allowed', () => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay())); // Next Saturday
      saturday.setHours(10, 0, 0, 0);
      
      const config = { weekendBooking: false };
      
      expect(() => service.validateBookingDateTime(saturday, 60, config)).toThrow(BadRequestException);
      expect(() => service.validateBookingDateTime(saturday, 60, config)).toThrow('Weekend bookings are not allowed');
    });
  });

  describe('validateAdvanceBooking', () => {
    it('should validate advance booking within allowed range', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      // Should not throw for valid advance booking
      expect(() => (service as any).validateAdvanceBooking(futureDate, mockValidationConfig)).not.toThrow();
    });

    it('should throw error for booking too soon', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1); // Only 1 hour in advance
      
      expect(() => (service as any).validateAdvanceBooking(soonDate, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateAdvanceBooking(soonDate, mockValidationConfig)).toThrow('at least 2 hours in advance');
    });

    it('should throw error for booking too far in advance', () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 40); // 40 days in advance (max is 30)
      
      expect(() => (service as any).validateAdvanceBooking(farDate, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateAdvanceBooking(farDate, mockValidationConfig)).toThrow('up to 30 days in advance');
    });
  });

  describe('validateBusinessHours', () => {
    it('should validate booking within business hours', () => {
      const validDate = new Date();
      validDate.setHours(10, 0, 0, 0);
      
      expect(() => (service as any).validateBusinessHours(validDate, 60, mockValidationConfig)).not.toThrow();
    });

    it('should throw error for booking starting before business hours', () => {
      const earlyDate = new Date();
      earlyDate.setHours(7, 0, 0, 0);
      
      expect(() => (service as any).validateBusinessHours(earlyDate, 60, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateBusinessHours(earlyDate, 60, mockValidationConfig)).toThrow('within business hours');
    });

    it('should throw error for booking ending after business hours', () => {
      const lateDate = new Date();
      lateDate.setHours(17, 30, 0, 0); // 5:30 PM with 60 min duration ends at 6:30 PM
      
      expect(() => (service as any).validateBusinessHours(lateDate, 60, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateBusinessHours(lateDate, 60, mockValidationConfig)).toThrow('within business hours');
    });
  });

  describe('validateWeekendBooking', () => {
    it('should allow weekend booking when enabled', () => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
      
      const config = { ...mockValidationConfig, weekendBooking: true };
      
      expect(() => (service as any).validateWeekendBooking(saturday, config)).not.toThrow();
    });

    it('should throw error for weekend booking when disabled', () => {
      const saturday = new Date();
      saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
      
      expect(() => (service as any).validateWeekendBooking(saturday, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateWeekendBooking(saturday, mockValidationConfig)).toThrow('Weekend bookings are not allowed');
    });

    it('should throw error for Sunday booking when disabled', () => {
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
      
      expect(() => (service as any).validateWeekendBooking(sunday, mockValidationConfig)).toThrow(BadRequestException);
      expect(() => (service as any).validateWeekendBooking(sunday, mockValidationConfig)).toThrow('Weekend bookings are not allowed');
    });
  });

  describe('validateTherapistAvailability', () => {
    it('should validate therapist availability successfully', async () => {
      const monday = new Date();
      monday.setDate(monday.getDate() + (1 - monday.getDay())); // Next Monday
      monday.setHours(10, 0, 0, 0);
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      
      const result = await service.validateTherapistAvailability('therapist-123', monday, 60);
      
      expect(result).toBe(true);
      expect(prismaService.therapistAvailability.findFirst).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          dayOfWeek: 1,
          startTime: { lte: '10:00' },
          endTime: { gte: '11:00' },
          isAvailable: true,
        },
      });
    });

    it('should throw error when therapist is not available', async () => {
      const monday = new Date();
      monday.setDate(monday.getDate() + (1 - monday.getDay()));
      monday.setHours(10, 0, 0, 0);
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);
      
      await expect(service.validateTherapistAvailability('therapist-123', monday, 60))
        .rejects.toThrow(BadRequestException);
      await expect(service.validateTherapistAvailability('therapist-123', monday, 60))
        .rejects.toThrow('Therapist is not available at the requested time');
    });
  });

  describe('validateClientTherapistRelationship', () => {
    it('should validate active client-therapist relationship', async () => {
      prismaService.clientTherapist.findFirst.mockResolvedValue(mockClientTherapistRelationship);
      
      const result = await service.validateClientTherapistRelationship('client-123', 'therapist-123');
      
      expect(result).toBe(true);
      expect(prismaService.clientTherapist.findFirst).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-123',
        },
      });
    });

    it('should throw error when relationship does not exist', async () => {
      prismaService.clientTherapist.findFirst.mockResolvedValue(null);
      
      await expect(service.validateClientTherapistRelationship('client-123', 'therapist-123'))
        .rejects.toThrow(BadRequestException);
      await expect(service.validateClientTherapistRelationship('client-123', 'therapist-123'))
        .rejects.toThrow('You can only book sessions with your assigned therapists');
    });
  });

  describe('validateTherapistExists', () => {
    it('should validate active approved therapist', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      
      const result = await service.validateTherapistExists('therapist-123');
      
      expect(result).toBe(true);
      expect(prismaService.therapist.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'therapist-123',
          status: 'approved',
        },
        include: {
          user: {
            select: {
              isActive: true,
            },
          },
        },
      });
    });

    it('should throw error when therapist does not exist', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(null);
      
      await expect(service.validateTherapistExists('therapist-123'))
        .rejects.toThrow(BadRequestException);
      await expect(service.validateTherapistExists('therapist-123'))
        .rejects.toThrow('Therapist not found or inactive');
    });

    it('should throw error when therapist is inactive', async () => {
      const inactiveTherapist = {
        ...mockTherapist,
        user: { isActive: false },
      };
      
      prismaService.therapist.findFirst.mockResolvedValue(inactiveTherapist);
      
      await expect(service.validateTherapistExists('therapist-123'))
        .rejects.toThrow(BadRequestException);
      await expect(service.validateTherapistExists('therapist-123'))
        .rejects.toThrow('Therapist not found or inactive');
    });
  });

  describe('validateAvailabilityOverlap', () => {
    it('should validate non-overlapping availability slots', () => {
      const result = service.validateAvailabilityOverlap('09:00', '12:00', '13:00', '17:00');
      expect(result).toBe(true);
    });

    it('should throw error for overlapping slots', () => {
      expect(() => service.validateAvailabilityOverlap('09:00', '13:00', '11:00', '15:00'))
        .toThrow(BadRequestException);
      expect(() => service.validateAvailabilityOverlap('09:00', '13:00', '11:00', '15:00'))
        .toThrow('Availability slot overlaps with existing availability');
    });

    it('should throw error for adjacent overlapping slots', () => {
      expect(() => service.validateAvailabilityOverlap('09:00', '12:00', '11:00', '14:00'))
        .toThrow(BadRequestException);
    });

    it('should throw error when start time is after end time', () => {
      expect(() => service.validateAvailabilityOverlap('13:00', '09:00', '14:00', '17:00'))
        .toThrow(BadRequestException);
      expect(() => service.validateAvailabilityOverlap('13:00', '09:00', '14:00', '17:00'))
        .toThrow('Start time must be before end time');
    });

    it('should allow touching time slots', () => {
      const result = service.validateAvailabilityOverlap('09:00', '12:00', '12:00', '15:00');
      expect(result).toBe(true);
    });
  });

  describe('validateTimezone', () => {
    it('should validate valid timezones', () => {
      const validTimezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
      
      validTimezones.forEach(timezone => {
        expect(service.validateTimezone(timezone)).toBe(true);
      });
    });

    it('should throw error for invalid timezone', () => {
      expect(() => service.validateTimezone('Invalid/Timezone')).toThrow(BadRequestException);
      expect(() => service.validateTimezone('Invalid/Timezone')).toThrow('Invalid timezone: Invalid/Timezone');
    });
  });

  describe('validateMeetingCreation', () => {
    it('should validate meeting creation successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(mockClientTherapistRelationship);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      
      const result = await service.validateMeetingCreation({
        therapistId: 'therapist-123',
        clientId: 'client-123',
        startTime: futureDate,
        duration: 60,
      });
      
      expect(result).toBe(true);
      expect(prismaService.therapist.findFirst).toHaveBeenCalled();
      expect(prismaService.clientTherapist.findFirst).toHaveBeenCalled();
      expect(prismaService.therapistAvailability.findFirst).toHaveBeenCalled();
    });

    it('should throw error when therapist validation fails', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      prismaService.therapist.findFirst.mockResolvedValue(null);
      
      await expect(service.validateMeetingCreation({
        therapistId: 'therapist-123',
        clientId: 'client-123',
        startTime: futureDate,
        duration: 60,
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw error when relationship validation fails', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(null);
      
      await expect(service.validateMeetingCreation({
        therapistId: 'therapist-123',
        clientId: 'client-123',
        startTime: futureDate,
        duration: 60,
      })).rejects.toThrow(BadRequestException);
    });

    it('should throw error when availability validation fails', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
      
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(mockClientTherapistRelationship);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);
      
      await expect(service.validateMeetingCreation({
        therapistId: 'therapist-123',
        clientId: 'client-123',
        startTime: futureDate,
        duration: 60,
      })).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateAvailabilityCreation', () => {
    it('should validate availability creation successfully', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null); // No overlapping
      
      const result = await service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      });
      
      expect(result).toBe(true);
      expect(prismaService.therapist.findFirst).toHaveBeenCalled();
      expect(prismaService.therapistAvailability.findFirst).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          dayOfWeek: 1,
          OR: [
            {
              startTime: { lt: '17:00' },
              endTime: { gt: '09:00' },
            },
          ],
        },
      });
    });

    it('should throw error for invalid day of week', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 7, // Invalid day
        startTime: '09:00',
        endTime: '17:00',
      })).rejects.toThrow(BadRequestException);
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 7,
        startTime: '09:00',
        endTime: '17:00',
      })).rejects.toThrow('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should throw error when start time is after end time', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 1,
        startTime: '17:00',
        endTime: '09:00',
      })).rejects.toThrow(BadRequestException);
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 1,
        startTime: '17:00',
        endTime: '09:00',
      })).rejects.toThrow('Start time must be before end time');
    });

    it('should throw error for overlapping availability', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '16:00',
      })).rejects.toThrow(BadRequestException);
      await expect(service.validateAvailabilityCreation({
        therapistId: 'therapist-123',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '16:00',
      })).rejects.toThrow('Availability slot overlaps with existing availability');
    });
  });

  describe('formatTime', () => {
    it('should format date to HH:MM string', () => {
      const date = new Date();
      date.setHours(10, 30, 45, 123);
      
      const result = (service as any).formatTime(date);
      expect(result).toBe('10:30');
    });

    it('should format date with single digit hours and minutes', () => {
      const date = new Date();
      date.setHours(9, 5, 0, 0);
      
      const result = (service as any).formatTime(date);
      expect(result).toBe('09:05');
    });
  });

  describe('parseTimeToMinutes', () => {
    it('should parse time string to minutes since midnight', () => {
      expect((service as any).parseTimeToMinutes('00:00')).toBe(0);
      expect((service as any).parseTimeToMinutes('01:00')).toBe(60);
      expect((service as any).parseTimeToMinutes('12:30')).toBe(750);
      expect((service as any).parseTimeToMinutes('23:59')).toBe(1439);
    });

    it('should handle single digit hours and minutes', () => {
      expect((service as any).parseTimeToMinutes('9:5')).toBe(545);
      expect((service as any).parseTimeToMinutes('09:05')).toBe(545);
    });
  });

  describe('minutesToTimeString', () => {
    it('should convert minutes to HH:MM string', () => {
      expect((service as any).minutesToTimeString(0)).toBe('00:00');
      expect((service as any).minutesToTimeString(60)).toBe('01:00');
      expect((service as any).minutesToTimeString(750)).toBe('12:30');
      expect((service as any).minutesToTimeString(1439)).toBe('23:59');
    });

    it('should handle single digit hours and minutes', () => {
      expect((service as any).minutesToTimeString(545)).toBe('09:05');
      expect((service as any).minutesToTimeString(125)).toBe('02:05');
    });
  });

  describe('integration tests', () => {
    it('should handle complex validation scenarios', async () => {
      const futureMonday = new Date();
      futureMonday.setDate(futureMonday.getDate() + (1 - futureMonday.getDay() + 7)); // Next Monday
      futureMonday.setHours(10, 0, 0, 0);
      
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(mockClientTherapistRelationship);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      
      const result = await service.validateMeetingCreation({
        therapistId: 'therapist-123',
        clientId: 'client-123',
        startTime: futureMonday,
        duration: 60,
        config: {
          allowedDurations: [60, 90],
          businessHours: { start: '09:00', end: '18:00' },
          advanceBooking: { minHours: 1, maxDays: 30 },
          weekendBooking: false,
        },
      });
      
      expect(result).toBe(true);
    });

    it('should handle edge case time calculations', () => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      
      const timeStr = (service as any).formatTime(date);
      expect(timeStr).toBe('23:59');
      
      const minutes = (service as any).parseTimeToMinutes(timeStr);
      expect(minutes).toBe(1439);
      
      const backToTime = (service as any).minutesToTimeString(minutes);
      expect(backToTime).toBe('23:59');
    });
  });
});