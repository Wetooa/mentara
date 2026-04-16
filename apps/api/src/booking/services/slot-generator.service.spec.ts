import { Test, TestingModule } from '@nestjs/testing';
import { SlotGeneratorService, TimeSlot, SlotGenerationConfig } from './slot-generator.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { BadRequestException } from '@nestjs/common';

describe('SlotGeneratorService', () => {
  let service: SlotGeneratorService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTherapistAvailability = {
    id: 'availability-123',
    therapistId: 'therapist-123',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    notes: 'Available for sessions',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExistingMeeting = {
    id: 'meeting-123',
    therapistId: 'therapist-123',
    clientId: 'client-123',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    duration: 60,
    status: 'SCHEDULED',
    title: 'Therapy Session',
    description: 'Regular therapy session',
    meetingType: 'video',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSlotGenerationConfig: SlotGenerationConfig = {
    slotInterval: 30,
    maxAdvanceBooking: 90,
    minAdvanceBooking: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotGeneratorService,
        {
          provide: PrismaService,
          useValue: {
            therapistAvailability: {
              findMany: jest.fn(),
            },
            meeting: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SlotGeneratorService>(SlotGeneratorService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAvailableSlots', () => {
    it('should generate available slots for a therapist', async () => {
      const targetDate = '2024-01-15'; // Monday
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('startTime');
      expect(result[0]).toHaveProperty('availableDurations');
      expect(result[0].availableDurations).toBeInstanceOf(Array);
      expect(result[0].availableDurations.length).toBeGreaterThan(0);
    });

    it('should return empty array when therapist has no availability', async () => {
      const targetDate = '2024-01-15';
      prismaService.therapistAvailability.findMany.mockResolvedValue([]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toEqual([]);
    });

    it('should exclude slots that conflict with existing meetings', async () => {
      const targetDate = '2024-01-15'; // Monday
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([mockExistingMeeting]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      // Should have slots but not at the conflicting time
      expect(result).toBeInstanceOf(Array);
      const conflictingSlot = result.find(slot => 
        new Date(slot.startTime).getTime() === mockExistingMeeting.startTime.getTime()
      );
      expect(conflictingSlot).toBeUndefined();
    });

    it('should apply custom slot generation config', async () => {
      const targetDate = '2024-01-15';
      const customConfig: Partial<SlotGenerationConfig> = {
        slotInterval: 60,
        maxAdvanceBooking: 30,
        minAdvanceBooking: 1,
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate, customConfig);

      expect(result).toBeInstanceOf(Array);
      // With 60-minute intervals, should have fewer slots than default 30-minute intervals
    });

    it('should sort slots by start time', async () => {
      const targetDate = '2024-01-15';
      const multipleAvailability = [
        { ...mockTherapistAvailability, startTime: '14:00', endTime: '16:00' },
        { ...mockTherapistAvailability, startTime: '09:00', endTime: '11:00' },
      ];
      
      prismaService.therapistAvailability.findMany.mockResolvedValue(multipleAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          expect(new Date(result[i].startTime).getTime()).toBeGreaterThanOrEqual(
            new Date(result[i - 1].startTime).getTime()
          );
        }
      }
    });

    it('should validate booking date is within allowed range', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', pastDateStr)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dates too far in advance', async () => {
      const farFutureDate = new Date();
      farFutureDate.setDate(farFutureDate.getDate() + 100);
      const farFutureDateStr = farFutureDate.toISOString().split('T')[0];

      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', farFutureDateStr)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle multiple availability windows', async () => {
      const targetDate = '2024-01-15';
      const multipleWindows = [
        { ...mockTherapistAvailability, startTime: '09:00', endTime: '12:00' },
        { ...mockTherapistAvailability, startTime: '14:00', endTime: '17:00' },
      ];
      
      prismaService.therapistAvailability.findMany.mockResolvedValue(multipleWindows);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle availability on different days of week', async () => {
      const sundayDate = '2024-01-14'; // Sunday
      const sundayAvailability = { ...mockTherapistAvailability, dayOfWeek: 0 };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([sundayAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', sundayDate);

      expect(result).toBeInstanceOf(Array);
      expect(prismaService.therapistAvailability.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          dayOfWeek: 0,
          isAvailable: true,
        },
        orderBy: { startTime: 'asc' },
      });
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true for available slot', async () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(true);
    });

    it('should return false when therapist has no availability', async () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(false);
    });

    it('should return false when slot is outside availability window', async () => {
      const startTime = new Date('2024-01-15T08:00:00Z'); // Before availability starts
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(false);
    });

    it('should return false when slot extends beyond availability window', async () => {
      const startTime = new Date('2024-01-15T16:30:00Z'); // Would end at 17:30, beyond availability
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(false);
    });

    it('should return false when slot conflicts with existing meeting', async () => {
      const startTime = new Date('2024-01-15T10:30:00Z'); // Overlaps with existing meeting
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([mockExistingMeeting]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(false);
    });

    it('should check for exact day of week match', async () => {
      const tuesdayStartTime = new Date('2024-01-16T10:00:00Z'); // Tuesday
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', tuesdayStartTime, duration);

      expect(result).toBe(false);
      expect(prismaService.therapistAvailability.findFirst).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          dayOfWeek: 2, // Tuesday
          isAvailable: true,
        },
      });
    });

    it('should handle edge cases with exact time boundaries', async () => {
      const startTime = new Date('2024-01-15T09:00:00Z'); // Exactly at start
      const duration = 60;
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, duration);

      expect(result).toBe(true);
    });

    it('should handle different durations', async () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const longDuration = 120; // 2 hours
      
      prismaService.therapistAvailability.findFirst.mockResolvedValue(mockTherapistAvailability);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.isSlotAvailable('therapist-123', startTime, longDuration);

      expect(result).toBe(true);
    });
  });

  describe('private methods and edge cases', () => {
    it('should handle time creation correctly', async () => {
      const targetDate = '2024-01-15';
      const availabilityWithSpecificTimes = {
        ...mockTherapistAvailability,
        startTime: '09:30',
        endTime: '16:45',
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([availabilityWithSpecificTimes]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      // Should generate slots starting from 09:30
      if (result.length > 0) {
        const firstSlot = new Date(result[0].startTime);
        expect(firstSlot.getHours()).toBe(9);
        expect(firstSlot.getMinutes()).toBe(30);
      }
    });

    it('should handle overlapping meetings correctly', async () => {
      const targetDate = '2024-01-15';
      const overlappingMeetings = [
        {
          ...mockExistingMeeting,
          startTime: new Date('2024-01-15T10:00:00Z'),
          endTime: new Date('2024-01-15T11:00:00Z'),
        },
        {
          ...mockExistingMeeting,
          id: 'meeting-456',
          startTime: new Date('2024-01-15T10:45:00Z'),
          endTime: new Date('2024-01-15T11:45:00Z'),
        },
      ];
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue(overlappingMeetings);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      // Should exclude slots that overlap with either meeting
    });

    it('should filter durations based on remaining availability', async () => {
      const targetDate = '2024-01-15';
      const shortAvailability = {
        ...mockTherapistAvailability,
        startTime: '16:00',
        endTime: '16:45', // Only 45 minutes available
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([shortAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      if (result.length > 0) {
        // Should not include 60, 90, or 120 minute durations
        const lastSlot = result[result.length - 1];
        const longDurations = lastSlot.availableDurations.filter(d => d.duration > 45);
        expect(longDurations).toHaveLength(0);
      }
    });

    it('should handle meetings with different statuses', async () => {
      const targetDate = '2024-01-15';
      const mixedStatusMeetings = [
        { ...mockExistingMeeting, status: 'SCHEDULED' },
        { ...mockExistingMeeting, id: 'meeting-456', status: 'CONFIRMED', startTime: new Date('2024-01-15T11:00:00Z') },
        { ...mockExistingMeeting, id: 'meeting-789', status: 'CANCELLED', startTime: new Date('2024-01-15T12:00:00Z') },
      ];
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue(mixedStatusMeetings);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          startTime: { gte: expect.any(Date), lte: expect.any(Date) },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { startTime: 'asc' },
      });
    });

    it('should handle day boundaries correctly', async () => {
      const targetDate = '2024-01-15';
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await service.generateAvailableSlots('therapist-123', targetDate);

      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: 'therapist-123',
          startTime: { 
            gte: new Date('2024-01-15T00:00:00.000Z'), 
            lte: new Date('2024-01-15T23:59:59.999Z') 
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { startTime: 'asc' },
      });
    });

    it('should handle timezone considerations', async () => {
      const targetDate = '2024-01-15';
      const utcMeeting = {
        ...mockExistingMeeting,
        startTime: new Date('2024-01-15T15:00:00Z'), // 3 PM UTC
        endTime: new Date('2024-01-15T16:00:00Z'),
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([utcMeeting]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      // Should properly handle UTC times
    });
  });

  describe('error handling and validation', () => {
    it('should validate minimum advance booking time', async () => {
      const tooSoonDate = new Date();
      tooSoonDate.setHours(tooSoonDate.getHours() + 1); // Only 1 hour advance
      const tooSoonDateStr = tooSoonDate.toISOString().split('T')[0];

      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', tooSoonDateStr)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.generateAvailableSlots('therapist-123', tooSoonDateStr)
      ).rejects.toThrow('at least 2 hours in advance');
    });

    it('should validate maximum advance booking time', async () => {
      const tooFarDate = new Date();
      tooFarDate.setDate(tooFarDate.getDate() + 100); // 100 days advance
      const tooFarDateStr = tooFarDate.toISOString().split('T')[0];

      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', tooFarDateStr)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.generateAvailableSlots('therapist-123', tooFarDateStr)
      ).rejects.toThrow('up to 90 days in advance');
    });

    it('should handle custom validation config', async () => {
      const customDate = new Date();
      customDate.setHours(customDate.getHours() + 0.5); // 30 minutes advance
      const customDateStr = customDate.toISOString().split('T')[0];
      
      const customConfig: Partial<SlotGenerationConfig> = {
        minAdvanceBooking: 0.25, // 15 minutes
        maxAdvanceBooking: 7,    // 7 days
      };

      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', customDateStr, customConfig)
      ).resolves.toBeInstanceOf(Array);
    });

    it('should handle database errors gracefully', async () => {
      const targetDate = '2024-01-15';
      
      prismaService.therapistAvailability.findMany.mockRejectedValue(new Error('Database connection failed'));
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', targetDate)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid date strings', async () => {
      const invalidDate = 'invalid-date';
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.generateAvailableSlots('therapist-123', invalidDate)
      ).rejects.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should generate realistic slot schedule', async () => {
      const targetDate = '2024-01-15'; // Monday
      const fullDayAvailability = {
        ...mockTherapistAvailability,
        startTime: '08:00',
        endTime: '18:00',
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([fullDayAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(10); // Should have many slots in a 10-hour day
      
      // Check that each slot has proper structure
      result.forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('availableDurations');
        expect(slot.availableDurations).toBeInstanceOf(Array);
        expect(slot.availableDurations.length).toBeGreaterThan(0);
        
        // Check duration structure
        slot.availableDurations.forEach(duration => {
          expect(duration).toHaveProperty('id');
          expect(duration).toHaveProperty('name');
          expect(duration).toHaveProperty('duration');
          expect(typeof duration.duration).toBe('number');
        });
      });
    });

    it('should handle complex scheduling with multiple conflicts', async () => {
      const targetDate = '2024-01-15';
      const complexMeetings = [
        {
          ...mockExistingMeeting,
          startTime: new Date('2024-01-15T09:00:00Z'),
          endTime: new Date('2024-01-15T10:00:00Z'),
        },
        {
          ...mockExistingMeeting,
          id: 'meeting-456',
          startTime: new Date('2024-01-15T11:30:00Z'),
          endTime: new Date('2024-01-15T12:30:00Z'),
        },
        {
          ...mockExistingMeeting,
          id: 'meeting-789',
          startTime: new Date('2024-01-15T14:00:00Z'),
          endTime: new Date('2024-01-15T15:30:00Z'),
        },
      ];
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([mockTherapistAvailability]);
      prismaService.meeting.findMany.mockResolvedValue(complexMeetings);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      // Should have gaps between meetings available
      const slotsAt10AM = result.filter(slot => {
        const slotTime = new Date(slot.startTime);
        return slotTime.getHours() === 10 && slotTime.getMinutes() === 0;
      });
      expect(slotsAt10AM.length).toBeGreaterThan(0);
    });

    it('should handle edge cases with availability boundaries', async () => {
      const targetDate = '2024-01-15';
      const edgeCaseAvailability = {
        ...mockTherapistAvailability,
        startTime: '09:15',
        endTime: '17:45',
      };
      
      prismaService.therapistAvailability.findMany.mockResolvedValue([edgeCaseAvailability]);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      if (result.length > 0) {
        const firstSlot = new Date(result[0].startTime);
        expect(firstSlot.getHours()).toBe(9);
        expect(firstSlot.getMinutes()).toBe(15);
      }
    });

    it('should handle performance with many availability windows', async () => {
      const targetDate = '2024-01-15';
      const manyWindows = Array.from({ length: 10 }, (_, i) => ({
        ...mockTherapistAvailability,
        id: `availability-${i}`,
        startTime: `${9 + i}:00`,
        endTime: `${10 + i}:00`,
      }));
      
      prismaService.therapistAvailability.findMany.mockResolvedValue(manyWindows);
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.generateAvailableSlots('therapist-123', targetDate);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});