import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { MeetingStatus } from '@prisma/client';
import {
  createMockPrismaService,
  TestDataFactory,
  TEST_USER_IDS,
  delay,
  expectToThrowAsync,
} from '../test-utils';

describe('BookingService', () => {
  let service: BookingService;
  let prismaService: jest.Mocked<PrismaService>;
  let testFactory: TestDataFactory;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prismaService = module.get(PrismaService);
    testFactory = new TestDataFactory(prismaService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMeeting', () => {
    const mockCreateMeetingDto = {
      startTime: new Date('2024-01-15T14:00:00Z'),
      duration: 60,
      therapistId: TEST_USER_IDS.THERAPIST,
      title: 'Therapy Session',
      description: 'Regular therapy session',
      meetingType: 'followup' as const,
    };

    const mockTherapist = {
      id: 'therapist-db-id',
      userId: TEST_USER_IDS.THERAPIST,
    };

    const mockRelationship = {
      id: 'relationship-id',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
    };

    const mockAvailability = {
      id: 'availability-id',
      therapistId: TEST_USER_IDS.THERAPIST,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    };

    it('should successfully create a meeting', async () => {
      const expectedMeeting = {
        id: 'meeting-id',
        ...mockCreateMeetingDto,
        status: 'SCHEDULED',
        clientId: TEST_USER_IDS.CLIENT,
        client: {
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        },
        therapist: {
          user: {
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        },
      };

      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(
        mockRelationship,
      );
      prismaService.meeting.findMany.mockResolvedValue([]); // No conflicts
      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.create.mockResolvedValue(expectedMeeting);

      const result = await service.createMeeting(
        mockCreateMeetingDto,
        TEST_USER_IDS.CLIENT,
      );

      expect(result).toEqual(expectedMeeting);
      expect(prismaService.meeting.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateMeetingDto,
          status: 'SCHEDULED',
          clientId: TEST_USER_IDS.CLIENT,
        },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when therapist not found', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(null);

      await expect(
        service.createMeeting(mockCreateMeetingDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.clientTherapist.findFirst).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when no client-therapist relationship exists', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(null);

      await expect(
        service.createMeeting(mockCreateMeetingDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaService.meeting.findMany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when there are scheduling conflicts', async () => {
      const conflictingMeeting = {
        id: 'conflict-id',
        startTime: new Date('2024-01-15T14:30:00Z'),
        duration: 60,
        status: 'SCHEDULED' as MeetingStatus,
      };

      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(
        mockRelationship,
      );
      prismaService.meeting.findMany.mockResolvedValue([conflictingMeeting]);

      await expect(
        service.createMeeting(mockCreateMeetingDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(BadRequestException);

      expect(
        prismaService.therapistAvailability.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when therapist is not available', async () => {
      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(
        mockRelationship,
      );
      prismaService.meeting.findMany.mockResolvedValue([]);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);

      await expect(
        service.createMeeting(mockCreateMeetingDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.meeting.create).not.toHaveBeenCalled();
    });

    it('should validate time format and throw BadRequestException for invalid format', async () => {
      const invalidTimeDto = {
        ...mockCreateMeetingDto,
        startTime: new Date('invalid-date'),
      };

      prismaService.therapist.findFirst.mockResolvedValue(mockTherapist);
      prismaService.clientTherapist.findFirst.mockResolvedValue(
        mockRelationship,
      );
      prismaService.meeting.findMany.mockResolvedValue([]);
      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        mockAvailability,
      );

      await expect(
        service.createMeeting(invalidTimeDto, TEST_USER_IDS.CLIENT),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMeetings', () => {
    const mockMeetings = [
      {
        id: 'meeting-1',
        startTime: new Date('2024-01-15T14:00:00Z'),
        duration: 60,
        status: 'SCHEDULED' as MeetingStatus,
        client: {
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        },
        therapist: {
          user: {
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        },
      },
    ];

    it('should return meetings for therapist', async () => {
      prismaService.meeting.findMany.mockResolvedValue(mockMeetings);

      const result = await service.getMeetings(
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(result).toEqual(mockMeetings);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: { therapistId: TEST_USER_IDS.THERAPIST },
        include: {
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should return meetings for client', async () => {
      prismaService.meeting.findMany.mockResolvedValue(mockMeetings);

      const result = await service.getMeetings(TEST_USER_IDS.CLIENT, 'client');

      expect(result).toEqual(mockMeetings);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: { clientId: TEST_USER_IDS.CLIENT },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.meeting.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.getMeetings(TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMeeting', () => {
    const mockMeeting = {
      id: 'meeting-id',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      startTime: new Date('2024-01-15T14:00:00Z'),
      status: 'SCHEDULED' as MeetingStatus,
      client: {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      },
      therapist: {
        user: {
          firstName: 'Dr. Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
        },
      },
    };

    it('should return meeting for valid therapist access', async () => {
      prismaService.meeting.findUnique.mockResolvedValue(mockMeeting);

      const result = await service.getMeeting(
        'meeting-id',
        TEST_USER_IDS.THERAPIST,
        'therapist',
      );

      expect(result).toEqual(mockMeeting);
      expect(prismaService.meeting.findUnique).toHaveBeenCalledWith({
        where: { id: 'meeting-id' },
        include: expect.any(Object),
      });
    });

    it('should return meeting for valid client access', async () => {
      prismaService.meeting.findUnique.mockResolvedValue(mockMeeting);

      const result = await service.getMeeting(
        'meeting-id',
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(result).toEqual(mockMeeting);
    });

    it('should throw NotFoundException when meeting does not exist', async () => {
      prismaService.meeting.findUnique.mockResolvedValue(null);

      await expect(
        service.getMeeting('non-existent-id', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when therapist accesses wrong meeting', async () => {
      const wrongMeeting = {
        ...mockMeeting,
        therapistId: 'different-therapist-id',
      };
      prismaService.meeting.findUnique.mockResolvedValue(wrongMeeting);

      await expect(
        service.getMeeting('meeting-id', TEST_USER_IDS.THERAPIST, 'therapist'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when client accesses wrong meeting', async () => {
      const wrongMeeting = {
        ...mockMeeting,
        clientId: 'different-client-id',
      };
      prismaService.meeting.findUnique.mockResolvedValue(wrongMeeting);

      await expect(
        service.getMeeting('meeting-id', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateMeeting', () => {
    const mockUpdateDto = {
      title: 'Updated Session',
      description: 'Updated description',
      status: 'CONFIRMED' as MeetingStatus,
    };

    const mockMeeting = {
      id: 'meeting-id',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      status: 'SCHEDULED' as MeetingStatus,
    };

    it('should successfully update a meeting', async () => {
      const updatedMeeting = {
        ...mockMeeting,
        ...mockUpdateDto,
      };

      jest.spyOn(service, 'getMeeting').mockResolvedValue(mockMeeting as any);
      prismaService.meeting.update.mockResolvedValue(updatedMeeting as any);

      const result = await service.updateMeeting(
        'meeting-id',
        mockUpdateDto,
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(result).toEqual(updatedMeeting);
      expect(prismaService.meeting.update).toHaveBeenCalledWith({
        where: { id: 'meeting-id' },
        data: {
          title: mockUpdateDto.title,
          description: mockUpdateDto.description,
          startTime: undefined,
          duration: undefined,
          meetingType: undefined,
          therapistId: undefined,
          status: mockUpdateDto.status,
        },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException when trying to update completed meeting', async () => {
      const completedMeeting = {
        ...mockMeeting,
        status: 'COMPLETED' as MeetingStatus,
      };

      jest
        .spyOn(service, 'getMeeting')
        .mockResolvedValue(completedMeeting as any);

      await expect(
        service.updateMeeting(
          'meeting-id',
          mockUpdateDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.meeting.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to update cancelled meeting', async () => {
      const cancelledMeeting = {
        ...mockMeeting,
        status: 'CANCELLED' as MeetingStatus,
      };

      jest
        .spyOn(service, 'getMeeting')
        .mockResolvedValue(cancelledMeeting as any);

      await expect(
        service.updateMeeting(
          'meeting-id',
          mockUpdateDto,
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelMeeting', () => {
    const mockMeeting = {
      id: 'meeting-id',
      clientId: TEST_USER_IDS.CLIENT,
      therapistId: TEST_USER_IDS.THERAPIST,
      status: 'SCHEDULED' as MeetingStatus,
    };

    it('should successfully cancel a meeting', async () => {
      const cancelledMeeting = {
        ...mockMeeting,
        status: 'CANCELLED' as MeetingStatus,
      };

      jest.spyOn(service, 'getMeeting').mockResolvedValue(mockMeeting as any);
      prismaService.meeting.update.mockResolvedValue(cancelledMeeting as any);

      const result = await service.cancelMeeting(
        'meeting-id',
        TEST_USER_IDS.CLIENT,
        'client',
      );

      expect(result).toEqual(cancelledMeeting);
      expect(prismaService.meeting.update).toHaveBeenCalledWith({
        where: { id: 'meeting-id' },
        data: { status: 'CANCELLED' },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException when meeting is already cancelled', async () => {
      const cancelledMeeting = {
        ...mockMeeting,
        status: 'CANCELLED' as MeetingStatus,
      };

      jest
        .spyOn(service, 'getMeeting')
        .mockResolvedValue(cancelledMeeting as any);

      await expect(
        service.cancelMeeting('meeting-id', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.meeting.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to cancel completed meeting', async () => {
      const completedMeeting = {
        ...mockMeeting,
        status: 'COMPLETED' as MeetingStatus,
      };

      jest
        .spyOn(service, 'getMeeting')
        .mockResolvedValue(completedMeeting as any);

      await expect(
        service.cancelMeeting('meeting-id', TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAvailability', () => {
    const mockCreateAvailabilityDto = {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      notes: 'Regular availability',
    };

    it('should successfully create availability', async () => {
      const expectedAvailability = {
        id: 'availability-id',
        therapistId: TEST_USER_IDS.THERAPIST,
        ...mockCreateAvailabilityDto,
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(null); // No overlap
      prismaService.therapistAvailability.create.mockResolvedValue(
        expectedAvailability,
      );

      const result = await service.createAvailability(
        mockCreateAvailabilityDto,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual(expectedAvailability);
      expect(prismaService.therapistAvailability.create).toHaveBeenCalledWith({
        data: {
          therapistId: TEST_USER_IDS.THERAPIST,
          ...mockCreateAvailabilityDto,
        },
      });
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const invalidDto = {
        ...mockCreateAvailabilityDto,
        startTime: '25:00', // Invalid hour
      };

      await expect(
        service.createAvailability(invalidDto, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(BadRequestException);

      expect(
        prismaService.therapistAvailability.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when start time is after end time', async () => {
      const invalidDto = {
        ...mockCreateAvailabilityDto,
        startTime: '17:00',
        endTime: '09:00',
      };

      await expect(
        service.createAvailability(invalidDto, TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when availability overlaps', async () => {
      const overlappingAvailability = {
        id: 'existing-id',
        startTime: '10:00',
        endTime: '16:00',
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        overlappingAvailability,
      );

      await expect(
        service.createAvailability(
          mockCreateAvailabilityDto,
          TEST_USER_IDS.THERAPIST,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.therapistAvailability.create).not.toHaveBeenCalled();
    });
  });

  describe('getAvailability', () => {
    const mockAvailabilities = [
      {
        id: 'availability-1',
        therapistId: TEST_USER_IDS.THERAPIST,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
      },
      {
        id: 'availability-2',
        therapistId: TEST_USER_IDS.THERAPIST,
        dayOfWeek: 1,
        startTime: '13:00',
        endTime: '17:00',
      },
    ];

    it('should return therapist availability', async () => {
      prismaService.therapistAvailability.findMany.mockResolvedValue(
        mockAvailabilities,
      );

      const result = await service.getAvailability(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockAvailabilities);
      expect(prismaService.therapistAvailability.findMany).toHaveBeenCalledWith(
        {
          where: { therapistId: TEST_USER_IDS.THERAPIST },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      );
    });

    it('should handle database errors', async () => {
      prismaService.therapistAvailability.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.getAvailability(TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAvailability', () => {
    const mockUpdateDto = {
      startTime: '10:00',
      endTime: '16:00',
      notes: 'Updated hours',
    };

    it('should successfully update availability', async () => {
      const existingAvailability = {
        id: 'availability-id',
        therapistId: TEST_USER_IDS.THERAPIST,
      };
      const updatedAvailability = {
        ...existingAvailability,
        ...mockUpdateDto,
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        existingAvailability,
      );
      prismaService.therapistAvailability.update.mockResolvedValue(
        updatedAvailability,
      );

      const result = await service.updateAvailability(
        'availability-id',
        mockUpdateDto,
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual(updatedAvailability);
      expect(prismaService.therapistAvailability.update).toHaveBeenCalledWith({
        where: { id: 'availability-id' },
        data: mockUpdateDto,
      });
    });

    it('should throw NotFoundException when availability does not exist', async () => {
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);

      await expect(
        service.updateAvailability(
          'non-existent-id',
          mockUpdateDto,
          TEST_USER_IDS.THERAPIST,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.therapistAvailability.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteAvailability', () => {
    it('should successfully delete availability', async () => {
      const existingAvailability = {
        id: 'availability-id',
        therapistId: TEST_USER_IDS.THERAPIST,
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        existingAvailability,
      );
      prismaService.therapistAvailability.delete.mockResolvedValue(
        existingAvailability,
      );

      const result = await service.deleteAvailability(
        'availability-id',
        TEST_USER_IDS.THERAPIST,
      );

      expect(result).toEqual(existingAvailability);
      expect(prismaService.therapistAvailability.delete).toHaveBeenCalledWith({
        where: { id: 'availability-id' },
      });
    });

    it('should throw NotFoundException when availability does not exist', async () => {
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteAvailability('non-existent-id', TEST_USER_IDS.THERAPIST),
      ).rejects.toThrow(NotFoundException);

      expect(prismaService.therapistAvailability.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAvailableSlots', () => {
    const mockDate = '2024-01-15'; // Monday
    const mockAvailability = [
      {
        id: 'availability-1',
        therapistId: TEST_USER_IDS.THERAPIST,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    ];

    it('should return available slots when no conflicts', async () => {
      prismaService.therapistAvailability.findMany.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.findMany.mockResolvedValue([]); // No existing bookings

      const result = await service.getAvailableSlots(
        TEST_USER_IDS.THERAPIST,
        mockDate,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.therapistAvailability.findMany).toHaveBeenCalledWith(
        {
          where: {
            therapistId: TEST_USER_IDS.THERAPIST,
            dayOfWeek: 1,
            isAvailable: true,
          },
          orderBy: { startTime: 'asc' },
        },
      );
    });

    it('should return empty array when therapist has no availability', async () => {
      prismaService.therapistAvailability.findMany.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        TEST_USER_IDS.THERAPIST,
        mockDate,
      );

      expect(result).toEqual([]);
      expect(prismaService.meeting.findMany).not.toHaveBeenCalled();
    });

    it('should exclude conflicting time slots', async () => {
      const existingBooking = {
        id: 'booking-1',
        startTime: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        status: 'SCHEDULED' as MeetingStatus,
      };

      prismaService.therapistAvailability.findMany.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.findMany.mockResolvedValue([existingBooking]);

      const result = await service.getAvailableSlots(
        TEST_USER_IDS.THERAPIST,
        mockDate,
      );

      expect(result).toBeDefined();
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          therapistId: TEST_USER_IDS.THERAPIST,
          startTime: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { startTime: 'asc' },
      });
    });
  });

  describe('validateMeetingTime', () => {
    it('should validate meeting time successfully', async () => {
      const mockAvailability = {
        id: 'availability-id',
        therapistId: TEST_USER_IDS.THERAPIST,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.findMany.mockResolvedValue([]); // No conflicts

      await expect(
        service.validateMeetingTime(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.CLIENT,
          '2024-01-15T14:00:00Z',
          60,
        ),
      ).resolves.not.toThrow();

      expect(prismaService.therapistAvailability.findFirst).toHaveBeenCalled();
      expect(prismaService.meeting.findMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid duration', async () => {
      await expect(
        service.validateMeetingTime(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.CLIENT,
          '2024-01-15T14:00:00Z',
          999, // Invalid duration
        ),
      ).rejects.toThrow(BadRequestException);

      expect(
        prismaService.therapistAvailability.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when therapist not available', async () => {
      prismaService.therapistAvailability.findFirst.mockResolvedValue(null);

      await expect(
        service.validateMeetingTime(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.CLIENT,
          '2024-01-15T14:00:00Z',
          60,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for scheduling conflicts', async () => {
      const mockAvailability = {
        id: 'availability-id',
        therapistId: TEST_USER_IDS.THERAPIST,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      };
      const conflictingMeeting = {
        id: 'conflict-id',
        startTime: new Date('2024-01-15T14:30:00Z'),
        duration: 60,
        status: 'SCHEDULED' as MeetingStatus,
      };

      prismaService.therapistAvailability.findFirst.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.findMany.mockResolvedValue([conflictingMeeting]);

      await expect(
        service.validateMeetingTime(
          TEST_USER_IDS.THERAPIST,
          TEST_USER_IDS.CLIENT,
          '2024-01-15T14:00:00Z',
          60,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors', async () => {
      prismaService.meeting.findMany.mockRejectedValue(
        new Error('Connection timeout'),
      );

      await expect(
        service.getMeetings(TEST_USER_IDS.CLIENT, 'client'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle invalid meeting status transitions', async () => {
      const mockMeeting = {
        id: 'meeting-id',
        status: 'COMPLETED' as MeetingStatus,
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
      };

      jest.spyOn(service, 'getMeeting').mockResolvedValue(mockMeeting as any);

      await expect(
        service.updateMeeting(
          'meeting-id',
          { status: 'SCHEDULED' as MeetingStatus },
          TEST_USER_IDS.CLIENT,
          'client',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle timezone edge cases in slot calculation', async () => {
      const mockAvailability = [
        {
          id: 'availability-1',
          therapistId: TEST_USER_IDS.THERAPIST,
          dayOfWeek: 1,
          startTime: '23:30', // Near midnight
          endTime: '23:59',
          isAvailable: true,
        },
      ];

      prismaService.therapistAvailability.findMany.mockResolvedValue(
        mockAvailability,
      );
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.getAvailableSlots(
        TEST_USER_IDS.THERAPIST,
        '2024-01-15',
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
