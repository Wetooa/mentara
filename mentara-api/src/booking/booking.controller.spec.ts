import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { MeetingStatus } from '@prisma/client';
import {
  createMockPrismaService,
  TEST_USER_IDS,
} from '../test-utils';
import {
  TestDataGenerator,
  TestAssertions,
} from '../test-utils/enhanced-test-helpers';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  const mockBookingService = {
    createMeeting: jest.fn(),
    getMeetings: jest.fn(),
    getMeeting: jest.fn(),
    updateMeeting: jest.fn(),
    cancelMeeting: jest.fn(),
    createAvailability: jest.fn(),
    getAvailability: jest.fn(),
    updateAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
    getDurations: jest.fn(),
    getAvailableSlots: jest.fn(),
    checkMeetingAvailability: jest.fn(),
  };

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have bookingService injected', () => {
      expect(bookingService).toBeDefined();
    });
  });

  describe('createMeeting', () => {
    const createMeetingDto = {
      therapistId: TEST_USER_IDS.THERAPIST,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 60,
      meetingType: 'video',
      title: 'Initial consultation',
    };

    it('should allow clients to create meetings', async () => {
      const mockMeeting = {
        id: 'meeting-123',
        ...createMeetingDto,
        clientId: TEST_USER_IDS.CLIENT,
        status: MeetingStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bookingService.createMeeting.mockResolvedValue(mockMeeting as any);

      const result = await controller.createMeeting(
        createMeetingDto,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.createMeeting).toHaveBeenCalledWith(
        createMeetingDto,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(mockMeeting);
    });

    it('should reject non-client users from creating meetings', async () => {
      await expect(
        controller.createMeeting(
          createMeetingDto,
          TEST_USER_IDS.THERAPIST,
          'therapist',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(bookingService.createMeeting).not.toHaveBeenCalled();
    });

    it('should reject admin users from creating meetings', async () => {
      await expect(
        controller.createMeeting(
          createMeetingDto,
          TEST_USER_IDS.ADMIN,
          'admin',
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(bookingService.createMeeting).not.toHaveBeenCalled();
    });

    it('should handle booking service errors', async () => {
      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Therapist not available at this time'),
      );

      await expect(
        controller.createMeeting(
          createMeetingDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle scheduling conflicts', async () => {
      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Time slot not available'),
      );

      await expect(
        controller.createMeeting(createMeetingDto, TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);

      expect(bookingService.createMeeting).toHaveBeenCalledWith(
        createMeetingDto,
        TEST_USER_IDS.CLIENT,
      );
    });

    it('should handle invalid therapist', async () => {
      const invalidMeetingData = {
        ...createMeetingDto,
        therapistId: 'invalid-therapist-id',
      };

      bookingService.createMeeting.mockRejectedValue(
        new NotFoundException('Therapist not found'),
      );

      await expect(
        controller.createMeeting(
          invalidMeetingData,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate meeting duration', async () => {
      const invalidDurationData = {
        ...createMeetingDto,
        duration: 0,
      };

      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Invalid meeting duration'),
      );

      await expect(
        controller.createMeeting(
          invalidDurationData,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMeetings', () => {
    it('should return meetings for client users', async () => {
      const mockMeetings = [
        TestDataGenerator.createMeeting({
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          status: 'SCHEDULED',
        }),
        TestDataGenerator.createMeeting({
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          status: 'COMPLETED',
        }),
      ];

      bookingService.getMeetings.mockResolvedValue(mockMeetings as any);

      const result = await controller.getMeetings(
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.getMeetings).toHaveBeenCalledWith(
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(result).toEqual(mockMeetings);
      expect(result).toHaveLength(2);
    });

    it('should return meetings for therapist users', async () => {
      const mockMeetings = [
        TestDataGenerator.createMeeting({
          therapistId: TEST_USER_IDS.THERAPIST,
          status: 'SCHEDULED',
        }),
        TestDataGenerator.createMeeting({
          therapistId: TEST_USER_IDS.THERAPIST,
          status: 'IN_PROGRESS',
        }),
      ];

      bookingService.getMeetings.mockResolvedValue(mockMeetings as any);

      const result = await controller.getMeetings(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.getMeetings).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );
      expect(result).toEqual(mockMeetings);
    });

    it('should return empty array when no meetings exist', async () => {
      bookingService.getMeetings.mockResolvedValue([]);

      const result = await controller.getMeetings(
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle admin role appropriately', async () => {
      const mockAdminMeetings = [
        TestDataGenerator.createMeeting({ status: 'SCHEDULED' }),
      ];

      bookingService.getMeetings.mockResolvedValue(mockAdminMeetings as any);

      const result = await controller.getMeetings(
        TEST_USER_IDS.ADMIN,
        'admin',
      );

      expect(bookingService.getMeetings).toHaveBeenCalledWith(
        TEST_USER_IDS.ADMIN,
        'admin',
      );
      expect(result).toEqual(mockAdminMeetings);
    });
  });

  describe('getMeeting', () => {
    const meetingId = 'meeting-123';
    const mockMeeting = {
      id: meetingId,
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      startTime: new Date('2024-12-01T10:00:00Z'),
      duration: 60,
      status: MeetingStatus.SCHEDULED,
      meetingType: 'video',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return meeting for authorized client', async () => {
      bookingService.getMeeting.mockResolvedValue(mockMeeting as any);

      const result = await controller.getMeeting(
        meetingId,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.getMeeting).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(result).toEqual(mockMeeting);
    });

    it('should return meeting for authorized therapist', async () => {
      bookingService.getMeeting.mockResolvedValue(mockMeeting as any);

      const result = await controller.getMeeting(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.getMeeting).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );
      expect(result).toEqual(mockMeeting);
    });

    it('should handle meeting not found', async () => {
      bookingService.getMeeting.mockRejectedValue(
        new NotFoundException('Meeting not found'),
      );

      await expect(
        controller.getMeeting(
          'invalid-meeting-id',
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle unauthorized access', async () => {
      bookingService.getMeeting.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.getMeeting(meetingId, 'unauthorized-user', 'client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMeeting', () => {
    const meetingId = 'meeting-123';
    const updateData = {
      startTime: '2024-12-01T14:00:00Z',
      title: 'Updated meeting',
      therapistId: TEST_USER_IDS.THERAPIST,
      duration: 60,
    };

    it('should successfully update meeting', async () => {
      const updatedMeeting = {
        id: meetingId,
        clientId: TEST_USER_IDS.CLIENT,
        ...updateData,
        duration: 60,
        status: MeetingStatus.SCHEDULED,
        meetingType: 'video',
        updatedAt: new Date(),
      };

      bookingService.updateMeeting.mockResolvedValue(updatedMeeting as any);

      const result = await controller.updateMeeting(
        meetingId,
        updateData as any,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.updateMeeting).toHaveBeenCalledWith(
        meetingId,
        updateData,
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(result).toEqual(updatedMeeting);
    });

    it('should handle invalid meeting update', async () => {
      bookingService.updateMeeting.mockRejectedValue(
        new BadRequestException('Cannot update past meeting'),
      );

      await expect(
        controller.updateMeeting(
          meetingId,
          updateData as any,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unauthorized update', async () => {
      bookingService.updateMeeting.mockRejectedValue(
        new ForbiddenException('Only meeting participants can update'),
      );

      await expect(
        controller.updateMeeting(
          meetingId,
          updateData as any,
          'unauthorized-user',
          'client',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow therapists to update meetings', async () => {
      const therapistUpdate = {
        startTime: '2024-12-01T15:00:00Z',
        therapistId: TEST_USER_IDS.THERAPIST,
        duration: 60,
        title: 'Therapist updated meeting',
      };

      const mockUpdatedMeeting = {
        id: meetingId,
        ...therapistUpdate,
      };

      bookingService.updateMeeting.mockResolvedValue(
        mockUpdatedMeeting as any,
      );

      const result = await controller.updateMeeting(
        meetingId,
        therapistUpdate,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(result).toEqual(mockUpdatedMeeting);
    });
  });

  describe('cancelMeeting', () => {
    const meetingId = 'meeting-123';

    it('should successfully cancel meeting', async () => {
      const cancelledMeeting = {
        id: meetingId,
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
        status: MeetingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'Client request',
        updatedAt: new Date(),
      };

      bookingService.cancelMeeting.mockResolvedValue(cancelledMeeting as any);

      const result = await controller.cancelMeeting(
        meetingId,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.cancelMeeting).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(result).toEqual(cancelledMeeting);
    });

    it('should handle cancellation of already cancelled meeting', async () => {
      bookingService.cancelMeeting.mockRejectedValue(
        new BadRequestException('Meeting already cancelled'),
      );

      await expect(
        controller.cancelMeeting(meetingId, TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unauthorized cancellation', async () => {
      bookingService.cancelMeeting.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.cancelMeeting(meetingId, 'unauthorized-user', 'client'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow therapists to cancel meetings', async () => {
      const mockTherapistCancellation = {
        id: meetingId,
        status: 'CANCELLED',
        cancelledBy: TEST_USER_IDS.THERAPIST,
        cancellationReason: 'Emergency',
      };

      bookingService.cancelMeeting.mockResolvedValue(
        mockTherapistCancellation as any,
      );

      const result = await controller.cancelMeeting(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(result).toEqual(mockTherapistCancellation);
    });
  });

  describe('createAvailability (Therapist Only)', () => {
    const createAvailabilityDto = {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    };

    it('should allow therapists to create availability', async () => {
      const mockAvailability = {
        id: 'availability-123',
        therapistId: TEST_USER_IDS.THERAPIST,
        ...createAvailabilityDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bookingService.createAvailability.mockResolvedValue(
        mockAvailability as any,
      );

      const result = await controller.createAvailability(
        createAvailabilityDto,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.createAvailability).toHaveBeenCalledWith(
        createAvailabilityDto,
        TEST_USER_IDS.THERAPIST,
      );
      expect(result).toEqual(mockAvailability);
    });

    it('should reject non-therapist users from creating availability', async () => {
      await expect(
        controller.createAvailability(
          createAvailabilityDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(bookingService.createAvailability).not.toHaveBeenCalled();
    });

    it('should reject admin users from creating availability', async () => {
      await expect(
        controller.createAvailability(
          createAvailabilityDto,
          TEST_USER_IDS.ADMIN,
          'admin',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(bookingService.createAvailability).not.toHaveBeenCalled();
    });

    it('should handle availability creation errors', async () => {
      bookingService.createAvailability.mockRejectedValue(
        new BadRequestException('Invalid time range'),
      );

      await expect(
        controller.createAvailability(
          createAvailabilityDto,
          TEST_USER_IDS.THERAPIST,
          'therapist',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvailability (Therapist Only)', () => {
    it('should allow therapists to view their availability', async () => {
      const mockAvailabilities = [
        {
          id: 'availability-1',
          therapistId: TEST_USER_IDS.THERAPIST,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '12:00',
          isAvailable: true,
        },
        {
          id: 'availability-2',
          therapistId: TEST_USER_IDS.THERAPIST,
          dayOfWeek: 1,
          startTime: '14:00',
          endTime: '17:00',
          isAvailable: true,
        },
      ];

      bookingService.getAvailability.mockResolvedValue(
        mockAvailabilities as any,
      );

      const result = await controller.getAvailability(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.getAvailability).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
      );
      expect(result).toEqual(mockAvailabilities);
      expect(result).toHaveLength(2);
    });

    it('should reject non-therapist users from viewing availability', async () => {
      await expect(
        controller.getAvailability(TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bookingService.getAvailability).not.toHaveBeenCalled();
    });

    it('should return empty array for therapist with no availability', async () => {
      bookingService.getAvailability.mockResolvedValue([]);

      const result = await controller.getAvailability(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('updateAvailability (Therapist Only)', () => {
    const availabilityId = 'availability-123';
    const updateAvailabilityDto = {
      dayOfWeek: 1,
      startTime: '10:00',
      endTime: '16:00',
    };

    it('should allow therapists to update their availability', async () => {
      const mockUpdatedAvailability = {
        id: availabilityId,
        therapistId: TEST_USER_IDS.THERAPIST,
        ...updateAvailabilityDto,
        updatedAt: new Date(),
      };

      bookingService.updateAvailability.mockResolvedValue(
        mockUpdatedAvailability as any,
      );

      const result = await controller.updateAvailability(
        availabilityId,
        updateAvailabilityDto,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.updateAvailability).toHaveBeenCalledWith(
        availabilityId,
        updateAvailabilityDto,
        TEST_USER_IDS.THERAPIST,
      );
      expect(result).toEqual(mockUpdatedAvailability);
    });

    it('should reject non-therapist users from updating availability', async () => {
      await expect(
        controller.updateAvailability(
          availabilityId,
          updateAvailabilityDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(bookingService.updateAvailability).not.toHaveBeenCalled();
    });

    it('should handle availability not found', async () => {
      bookingService.updateAvailability.mockRejectedValue(
        new NotFoundException('Availability not found'),
      );

      await expect(
        controller.updateAvailability(
          'non-existent-availability',
          updateAvailabilityDto,
          TEST_USER_IDS.THERAPIST,
          'therapist',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAvailability (Therapist Only)', () => {
    const availabilityId = 'availability-123';

    it('should allow therapists to delete their availability', async () => {
      const mockDeletedAvailability = {
        id: availabilityId,
        therapistId: TEST_USER_IDS.THERAPIST,
        deleted: true,
      };

      bookingService.deleteAvailability.mockResolvedValue(
        mockDeletedAvailability as any,
      );

      const result = await controller.deleteAvailability(
        availabilityId,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.deleteAvailability).toHaveBeenCalledWith(
        availabilityId,
        TEST_USER_IDS.THERAPIST,
      );
      expect(result).toEqual(mockDeletedAvailability);
    });

    it('should reject non-therapist users from deleting availability', async () => {
      await expect(
        controller.deleteAvailability(
          availabilityId,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(bookingService.deleteAvailability).not.toHaveBeenCalled();
    });

    it('should handle deletion of non-existent availability', async () => {
      bookingService.deleteAvailability.mockRejectedValue(
        new NotFoundException('Availability not found'),
      );

      await expect(
        controller.deleteAvailability(
          'non-existent-availability',
          TEST_USER_IDS.THERAPIST,
          'therapist',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDurations (Public)', () => {
    it('should return available session durations', async () => {
      const mockDurations = [
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
      ];

      bookingService.getDurations.mockReturnValue(mockDurations as any);

      const result = controller.getDurations();

      expect(bookingService.getDurations).toHaveBeenCalled();
      expect(result).toEqual(mockDurations);
      expect(result).toHaveLength(4);
    });

    it('should handle empty durations', async () => {
      bookingService.getDurations.mockReturnValue([]);

      const result = controller.getDurations();

      expect(result).toEqual([]);
    });
  });

  describe('getAvailableSlots (Public)', () => {
    const therapistId = TEST_USER_IDS.THERAPIST;
    const date = '2024-12-15';

    it('should return available time slots for a therapist on a specific date', async () => {
      const mockSlots = [
        {
          startTime: '09:00',
          endTime: '10:00',
          duration: 60,
          available: true,
        },
        {
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          available: true,
        },
        {
          startTime: '14:00',
          endTime: '15:00',
          duration: 60,
          available: true,
        },
      ];

      bookingService.getAvailableSlots.mockResolvedValue(mockSlots as any);

      const result = await controller.getAvailableSlots(therapistId, date);

      expect(bookingService.getAvailableSlots).toHaveBeenCalledWith(
        therapistId,
        date,
      );
      expect(result).toEqual(mockSlots);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no slots available', async () => {
      bookingService.getAvailableSlots.mockResolvedValue([]);

      const result = await controller.getAvailableSlots(therapistId, date);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle invalid therapist ID', async () => {
      bookingService.getAvailableSlots.mockRejectedValue(
        new NotFoundException('Therapist not found'),
      );

      await expect(
        controller.getAvailableSlots('invalid-therapist-id', date),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid date format', async () => {
      bookingService.getAvailableSlots.mockRejectedValue(
        new BadRequestException('Invalid date format'),
      );

      await expect(
        controller.getAvailableSlots(therapistId, 'invalid-date'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle past dates appropriately', async () => {
      const pastDate = '2020-01-01';

      bookingService.getAvailableSlots.mockRejectedValue(
        new BadRequestException('Cannot get slots for past dates'),
      );

      await expect(
        controller.getAvailableSlots(therapistId, pastDate),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Role-Based Access Control Integration', () => {
    it('should enforce role restrictions across all endpoints', async () => {
      // Test client restrictions
      await expect(
        controller.createAvailability(
          {} as any,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        controller.getAvailability(TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(UnauthorizedException);

      // Test therapist restrictions
      await expect(
        controller.createMeeting({} as any, TEST_USER_IDS.THERAPIST, 'therapist'),
      ).rejects.toThrow(ForbiddenException);

      // Verify no service calls were made
      expect(bookingService.createAvailability).not.toHaveBeenCalled();
      expect(bookingService.getAvailability).not.toHaveBeenCalled();
      expect(bookingService.createMeeting).not.toHaveBeenCalled();
    });

    it('should allow appropriate role access to shared endpoints', async () => {
      const mockMeetings = [TestDataGenerator.createMeeting()];
      bookingService.getMeetings.mockResolvedValue(mockMeetings as any);

      // Both client and therapist should access getMeetings
      await controller.getMeetings(TEST_USER_IDS.CLIENT, 'client');
      await controller.getMeetings(TEST_USER_IDS.THERAPIST, 'therapist');

      expect(bookingService.getMeetings).toHaveBeenCalledTimes(2);
    });

    it('should handle moderator and admin roles appropriately', async () => {
      const mockMeetings = [TestDataGenerator.createMeeting()];
      bookingService.getMeetings.mockResolvedValue(mockMeetings as any);

      // Admin should be able to view meetings
      await controller.getMeetings(TEST_USER_IDS.ADMIN, 'admin');

      // But admin cannot create meetings
      await expect(
        controller.createMeeting({} as any, TEST_USER_IDS.ADMIN, 'admin'),
      ).rejects.toThrow(ForbiddenException);

      expect(bookingService.getMeetings).toHaveBeenCalledWith(
        TEST_USER_IDS.ADMIN,
        'admin',
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle service errors gracefully', async () => {
      bookingService.createMeeting.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.createMeeting({} as any, TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow('Database connection failed');
    });

    it('should pass through HTTP exceptions', async () => {
      const notFoundError = new NotFoundException('Resource not found');
      bookingService.getMeeting.mockRejectedValue(notFoundError);

      await expect(
        controller.getMeeting('meeting-1', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle malformed request data', async () => {
      const malformedMeetingDto = {
        therapistId: null,
        startTime: 'invalid-date',
        duration: -1,
      };

      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Invalid meeting data'),
      );

      await expect(
        controller.createMeeting(
          malformedMeetingDto as any,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle concurrent booking requests', async () => {
      const concurrentBookingDto = {
        therapistId: TEST_USER_IDS.THERAPIST,
        startTime: new Date().toISOString(),
        duration: 60,
        meetingType: 'video',
      };

      // Simulate conflict
      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Time slot no longer available'),
      );

      await expect(
        controller.createMeeting(
          concurrentBookingDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle database connection issues gracefully', async () => {
      bookingService.getMeetings.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.getMeetings(TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('Integration Workflow Tests', () => {
    it('should handle complete booking workflow', async () => {
      // 1. Get available slots
      const mockSlots = [
        { startTime: '10:00', endTime: '11:00', available: true },
      ];
      bookingService.getAvailableSlots.mockResolvedValue(mockSlots as any);

      // 2. Create meeting
      const meetingDto = {
        therapistId: TEST_USER_IDS.THERAPIST,
        startTime: '2024-12-15T10:00:00Z',
        duration: 60,
        meetingType: 'video',
      };
      const mockMeeting = {
        id: 'meeting-workflow',
        ...meetingDto,
        clientId: TEST_USER_IDS.CLIENT,
        status: 'SCHEDULED',
      };
      bookingService.createMeeting.mockResolvedValue(mockMeeting as any);

      // 3. Get meetings to verify
      bookingService.getMeetings.mockResolvedValue([mockMeeting] as any);

      // Execute workflow
      const slotsResult = await controller.getAvailableSlots(
        TEST_USER_IDS.THERAPIST,
        '2024-12-15',
      );
      const meetingResult = await controller.createMeeting(
        meetingDto,
        TEST_USER_IDS.CLIENT,
        'client',
      );
      const meetingsResult = await controller.getMeetings(
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(slotsResult).toHaveLength(1);
      expect(meetingResult.status).toBe('SCHEDULED');
      expect(meetingsResult).toHaveLength(1);
    });

    it('should handle therapist availability management workflow', async () => {
      // 1. Create availability
      const availabilityDto = {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      };
      const mockAvailability = {
        id: 'availability-workflow',
        therapistId: TEST_USER_IDS.THERAPIST,
        ...availabilityDto,
      };
      bookingService.createAvailability.mockResolvedValue(
        mockAvailability as any,
      );

      // 2. Get availability to verify
      bookingService.getAvailability.mockResolvedValue([
        mockAvailability,
      ] as any);

      // 3. Update availability
      const updateDto = { 
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '16:00' 
      };
      const mockUpdatedAvailability = {
        ...mockAvailability,
        ...updateDto,
      };
      bookingService.updateAvailability.mockResolvedValue(
        mockUpdatedAvailability as any,
      );

      // Execute workflow
      const createResult = await controller.createAvailability(
        availabilityDto,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );
      const getResult = await controller.getAvailability(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );
      const updateResult = await controller.updateAvailability(
        mockAvailability.id,
        updateDto,
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(createResult.isAvailable).toBe(true);
      expect(getResult).toHaveLength(1);
      expect(updateResult.endTime).toBe('16:00');
    });
  });
});