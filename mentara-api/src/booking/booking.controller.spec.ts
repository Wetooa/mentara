import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { MeetingStatus } from '@prisma/client';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  const mockBookingService = {
    createMeeting: jest.fn(),
    getMeeting: jest.fn(),
    updateMeeting: jest.fn(),
    cancelMeeting: jest.fn(),
    getMeetings: jest.fn(),
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

    // Reset all mocks before each test
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
    const mockMeetingData = {
      therapistId: TEST_USER_IDS.THERAPIST,
      scheduledAt: new Date('2024-12-01T10:00:00Z'),
      duration: 60,
      meetingType: 'INDIVIDUAL',
      notes: 'Initial consultation',
    };

    it('should successfully create a meeting', async () => {
      const expectedResult = {
        id: 'meeting-1',
        clientId: TEST_USER_IDS.CLIENT,
        ...mockMeetingData,
        status: MeetingStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      bookingService.createMeeting.mockResolvedValue(expectedResult as any);

      const result = await controller.createMeeting(
        mockMeetingData as any,
        TEST_USER_IDS.CLIENT,
      );

      expect(bookingService.createMeeting).toHaveBeenCalledWith(
        mockMeetingData,
        TEST_USER_IDS.CLIENT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle scheduling conflict', async () => {
      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Time slot not available'),
      );

      await expect(
        controller.createMeeting(mockMeetingData as any, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(BadRequestException);

      expect(bookingService.createMeeting).toHaveBeenCalledWith(
        mockMeetingData,
        TEST_USER_IDS.CLIENT,
      );
    });

    it('should handle invalid therapist', async () => {
      const invalidMeetingData = {
        ...mockMeetingData,
        therapistId: 'invalid-therapist-id',
      };

      bookingService.createMeeting.mockRejectedValue(
        new NotFoundException('Therapist not found'),
      );

      await expect(
        controller.createMeeting(
          invalidMeetingData as any,
          TEST_USER_IDS.CLIENT,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate meeting duration', async () => {
      const invalidDurationData = {
        ...mockMeetingData,
        duration: 0,
      };

      bookingService.createMeeting.mockRejectedValue(
        new BadRequestException('Invalid meeting duration'),
      );

      await expect(
        controller.createMeeting(
          invalidDurationData as any,
          TEST_USER_IDS.CLIENT,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMeeting', () => {
    const mockMeeting = {
      id: 'meeting-1',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      scheduledAt: new Date('2024-12-01T10:00:00Z'),
      duration: 60,
      status: MeetingStatus.SCHEDULED,
      meetingType: 'INDIVIDUAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return meeting for authorized client', async () => {
      bookingService.getMeeting.mockResolvedValue(mockMeeting as any);

      const result = await controller.getMeeting(
        'meeting-1',
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.getMeeting).toHaveBeenCalledWith(
        'meeting-1',
        TEST_USER_IDS.CLIENT,
        'client',
      );
      expect(result).toEqual(mockMeeting);
    });

    it('should return meeting for authorized therapist', async () => {
      bookingService.getMeeting.mockResolvedValue(mockMeeting as any);

      const result = await controller.getMeeting(
        'meeting-1',
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(bookingService.getMeeting).toHaveBeenCalledWith(
        'meeting-1',
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
        controller.getMeeting('meeting-1', 'unauthorized-user', 'client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMeeting', () => {
    const updateData = {
      scheduledAt: new Date('2024-12-01T14:00:00Z'),
      notes: 'Updated notes',
    };

    it('should successfully update meeting', async () => {
      const updatedMeeting = {
        id: 'meeting-1',
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
        ...updateData,
        duration: 60,
        status: MeetingStatus.SCHEDULED,
        meetingType: 'INDIVIDUAL',
        updatedAt: new Date(),
      };

      bookingService.updateMeeting.mockResolvedValue(updatedMeeting as any);

      const result = await controller.updateMeeting(
        'meeting-1',
        updateData as any,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.updateMeeting).toHaveBeenCalledWith(
        'meeting-1',
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
          'meeting-1',
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
          'meeting-1',
          updateData as any,
          'unauthorized-user',
          'client',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancelMeeting', () => {
    it('should successfully cancel meeting', async () => {
      const cancelledMeeting = {
        id: 'meeting-1',
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
        status: MeetingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'Client request',
        updatedAt: new Date(),
      };

      bookingService.cancelMeeting.mockResolvedValue(cancelledMeeting as any);

      const result = await controller.cancelMeeting(
        'meeting-1',
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(bookingService.cancelMeeting).toHaveBeenCalledWith(
        'meeting-1',
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
        controller.cancelMeeting('meeting-1', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unauthorized cancellation', async () => {
      bookingService.cancelMeeting.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.cancelMeeting('meeting-1', 'unauthorized-user', 'client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMeetings', () => {
    it('should return user meetings', async () => {
      const mockMeetings = [
        {
          id: 'meeting-1',
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          scheduledAt: new Date(),
          status: MeetingStatus.SCHEDULED,
        },
        {
          id: 'meeting-2',
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          scheduledAt: new Date(),
          status: MeetingStatus.COMPLETED,
        },
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
    });

    it('should return therapist meetings', async () => {
      const mockMeetings = [];

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
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      bookingService.createMeeting.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        controller.createMeeting({} as any, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow('Database connection failed');
    });

    it('should pass through HTTP exceptions', async () => {
      const notFoundError = new NotFoundException('Resource not found');
      bookingService.getMeeting.mockRejectedValue(notFoundError);

      await expect(
        controller.getMeeting('meeting-1', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
