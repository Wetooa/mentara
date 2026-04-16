import { Test, TestingModule } from '@nestjs/testing';
import { ConflictDetectionService, TimeRange, ConflictResult } from './conflict-detection.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { BadRequestException } from '@nestjs/common';

describe('ConflictDetectionService', () => {
  let service: ConflictDetectionService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockMeeting = {
    id: 'meeting-123',
    therapistId: 'therapist-123',
    clientId: 'client-123',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    duration: 60,
    status: 'SCHEDULED',
    client: {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
    therapist: {
      user: {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
      },
    },
  };

  const mockConflictingMeeting = {
    id: 'conflicting-meeting-456',
    therapistId: 'therapist-123',
    clientId: 'client-456',
    startTime: new Date('2024-01-15T10:30:00Z'),
    endTime: new Date('2024-01-15T11:30:00Z'),
    duration: 60,
    status: 'CONFIRMED',
    client: {
      user: {
        firstName: 'Alice',
        lastName: 'Johnson',
      },
    },
    therapist: {
      user: {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
      },
    },
  };

  const mockTimeRange: TimeRange = {
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConflictDetectionService,
        {
          provide: PrismaService,
          useValue: {
            meeting: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConflictDetectionService>(ConflictDetectionService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkSchedulingConflicts', () => {
    it('should return no conflicts when no meetings overlap', async () => {
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-123',
        new Date('2024-01-15T10:00:00Z'),
        60,
      );

      expect(result).toEqual({
        hasConflict: false,
        conflictingMeetings: [],
        conflictType: 'none',
      });
    });

    it('should detect therapist conflicts', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result).toEqual({
        hasConflict: true,
        conflictingMeetings: [mockConflictingMeeting],
        conflictType: 'therapist',
      });
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              therapistId: 'therapist-123',
              startTime: { lt: new Date('2024-01-15T11:30:00Z') },
              OR: [
                { endTime: { gt: new Date('2024-01-15T10:30:00Z') } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: new Date('2024-01-15T10:30:00Z') } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            {
              clientId: 'client-789',
              startTime: { lt: new Date('2024-01-15T11:30:00Z') },
              OR: [
                { endTime: { gt: new Date('2024-01-15T10:30:00Z') } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: new Date('2024-01-15T10:30:00Z') } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          ],
        },
        include: {
          client: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    });

    it('should detect client conflicts', async () => {
      const clientConflictMeeting = {
        ...mockConflictingMeeting,
        therapistId: 'therapist-456',
        clientId: 'client-123',
      };
      prismaService.meeting.findMany.mockResolvedValue([clientConflictMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-456',
        'client-123',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result).toEqual({
        hasConflict: true,
        conflictingMeetings: [clientConflictMeeting],
        conflictType: 'client',
      });
    });

    it('should detect both therapist and client conflicts', async () => {
      const therapistConflict = { ...mockConflictingMeeting, clientId: 'client-other' };
      const clientConflict = { ...mockConflictingMeeting, therapistId: 'therapist-other' };
      prismaService.meeting.findMany.mockResolvedValue([therapistConflict, clientConflict]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-123',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result).toEqual({
        hasConflict: true,
        conflictingMeetings: [therapistConflict, clientConflict],
        conflictType: 'both',
      });
    });

    it('should handle edge case time overlaps', async () => {
      const edgeConflictMeeting = {
        ...mockConflictingMeeting,
        startTime: new Date('2024-01-15T10:59:59Z'),
        endTime: new Date('2024-01-15T11:59:59Z'),
      };
      prismaService.meeting.findMany.mockResolvedValue([edgeConflictMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T10:00:00Z'),
        60,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictingMeetings).toHaveLength(1);
    });
  });

  describe('checkTherapistConflicts', () => {
    it('should find conflicts in therapist schedule', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      const result = await service.checkTherapistConflicts('therapist-123', mockTimeRange);

      expect(result).toEqual([mockConflictingMeeting]);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              therapistId: 'therapist-123',
              startTime: { lt: mockTimeRange.endTime },
              OR: [
                { endTime: { gt: mockTimeRange.startTime } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: mockTimeRange.startTime } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          ],
        },
        include: {
          client: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    });

    it('should return empty array when no conflicts', async () => {
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkTherapistConflicts('therapist-123', mockTimeRange);

      expect(result).toEqual([]);
    });

    it('should handle legacy meetings without endTime', async () => {
      const legacyMeeting = {
        ...mockConflictingMeeting,
        endTime: null,
      };
      prismaService.meeting.findMany.mockResolvedValue([legacyMeeting]);

      const result = await service.checkTherapistConflicts('therapist-123', mockTimeRange);

      expect(result).toEqual([legacyMeeting]);
    });
  });

  describe('checkClientConflicts', () => {
    it('should find conflicts in client schedule', async () => {
      const clientConflictMeeting = {
        ...mockConflictingMeeting,
        clientId: 'client-123',
      };
      prismaService.meeting.findMany.mockResolvedValue([clientConflictMeeting]);

      const result = await service.checkClientConflicts('client-123', mockTimeRange);

      expect(result).toEqual([clientConflictMeeting]);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              clientId: 'client-123',
              startTime: { lt: mockTimeRange.endTime },
              OR: [
                { endTime: { gt: mockTimeRange.startTime } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: mockTimeRange.startTime } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          ],
        },
        include: {
          client: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    });

    it('should return empty array when no conflicts', async () => {
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkClientConflicts('client-123', mockTimeRange);

      expect(result).toEqual([]);
    });
  });

  describe('checkUpdateConflicts', () => {
    it('should detect conflicts when updating meeting time', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      const result = await service.checkUpdateConflicts(
        'meeting-123',
        'therapist-123',
        'client-123',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result).toEqual({
        hasConflict: true,
        conflictingMeetings: [mockConflictingMeeting],
        conflictType: 'therapist',
      });
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              therapistId: 'therapist-123',
              startTime: { lt: new Date('2024-01-15T11:30:00Z') },
              OR: [
                { endTime: { gt: new Date('2024-01-15T10:30:00Z') } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: new Date('2024-01-15T10:30:00Z') } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            {
              clientId: 'client-123',
              startTime: { lt: new Date('2024-01-15T11:30:00Z') },
              OR: [
                { endTime: { gt: new Date('2024-01-15T10:30:00Z') } },
                {
                  AND: [
                    { endTime: null },
                    { startTime: { gte: new Date('2024-01-15T10:30:00Z') } },
                  ],
                },
              ],
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          ],
          id: { not: 'meeting-123' },
        },
        include: {
          client: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          therapist: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    });

    it('should exclude the current meeting from conflict check', async () => {
      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkUpdateConflicts(
        'meeting-123',
        'therapist-123',
        'client-123',
        new Date('2024-01-15T10:00:00Z'),
        60,
      );

      expect(result.hasConflict).toBe(false);
      expect(prismaService.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'meeting-123' },
          }),
        }),
      );
    });

    it('should correctly classify conflict types in updates', async () => {
      const therapistConflict = { ...mockConflictingMeeting, clientId: 'client-other' };
      const clientConflict = { ...mockConflictingMeeting, therapistId: 'therapist-other', clientId: 'client-123' };
      prismaService.meeting.findMany.mockResolvedValue([therapistConflict, clientConflict]);

      const result = await service.checkUpdateConflicts(
        'meeting-123',
        'therapist-123',
        'client-123',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result.conflictType).toBe('both');
      expect(result.conflictingMeetings).toHaveLength(2);
    });
  });

  describe('checkBulkConflicts', () => {
    it('should check conflicts for multiple meetings', async () => {
      const meetings = [
        {
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-123',
          clientId: 'client-456',
          startTime: new Date('2024-01-15T10:30:00Z'),
          duration: 60,
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkBulkConflicts(meetings);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        meetingIndex: 1,
        conflicts: {
          hasConflict: true,
          conflictingMeetings: [
            {
              ...meetings[0],
              conflictType: 'therapist',
              isInternalConflict: true,
              conflictIndex: 0,
            },
          ],
          conflictType: 'none',
        },
      });
    });

    it('should detect internal conflicts between meetings in bulk', async () => {
      const meetings = [
        {
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-123',
          clientId: 'client-456',
          startTime: new Date('2024-01-15T10:30:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-456',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:45:00Z'),
          duration: 60,
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkBulkConflicts(meetings);

      expect(result).toHaveLength(2);
      expect(result[0].meetingIndex).toBe(1);
      expect(result[1].meetingIndex).toBe(2);
    });

    it('should handle both external and internal conflicts', async () => {
      const meetings = [
        {
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      const result = await service.checkBulkConflicts(meetings);

      expect(result).toHaveLength(1);
      expect(result[0].conflicts.hasConflict).toBe(true);
      expect(result[0].conflicts.conflictingMeetings).toContain(mockConflictingMeeting);
    });

    it('should return empty array when no conflicts in bulk', async () => {
      const meetings = [
        {
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-456',
          clientId: 'client-456',
          startTime: new Date('2024-01-15T12:00:00Z'),
          duration: 60,
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkBulkConflicts(meetings);

      expect(result).toEqual([]);
    });
  });

  describe('hasTimeOverlap', () => {
    it('should detect overlapping time ranges', () => {
      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T10:30:00Z');
      const end2 = new Date('2024-01-15T11:30:00Z');

      const result = service.hasTimeOverlap(start1, end1, start2, end2);

      expect(result).toBe(true);
    });

    it('should detect touching time ranges as overlapping', () => {
      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T11:00:00Z');
      const end2 = new Date('2024-01-15T12:00:00Z');

      const result = service.hasTimeOverlap(start1, end1, start2, end2);

      expect(result).toBe(false);
    });

    it('should detect non-overlapping time ranges', () => {
      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T11:00:00Z');
      const start2 = new Date('2024-01-15T12:00:00Z');
      const end2 = new Date('2024-01-15T13:00:00Z');

      const result = service.hasTimeOverlap(start1, end1, start2, end2);

      expect(result).toBe(false);
    });

    it('should handle complete containment', () => {
      const start1 = new Date('2024-01-15T10:00:00Z');
      const end1 = new Date('2024-01-15T12:00:00Z');
      const start2 = new Date('2024-01-15T10:30:00Z');
      const end2 = new Date('2024-01-15T11:30:00Z');

      const result = service.hasTimeOverlap(start1, end1, start2, end2);

      expect(result).toBe(true);
    });

    it('should handle reverse containment', () => {
      const start1 = new Date('2024-01-15T10:30:00Z');
      const end1 = new Date('2024-01-15T11:30:00Z');
      const start2 = new Date('2024-01-15T10:00:00Z');
      const end2 = new Date('2024-01-15T12:00:00Z');

      const result = service.hasTimeOverlap(start1, end1, start2, end2);

      expect(result).toBe(true);
    });
  });

  describe('validateNoConflicts', () => {
    it('should not throw when no conflicts exist', async () => {
      prismaService.meeting.findMany.mockResolvedValue([]);

      await expect(
        service.validateNoConflicts(
          'therapist-123',
          'client-123',
          new Date('2024-01-15T10:00:00Z'),
          60,
        ),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException when conflicts exist', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      await expect(
        service.validateNoConflicts(
          'therapist-123',
          'client-789',
          new Date('2024-01-15T10:30:00Z'),
          60,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should provide detailed conflict information in error message', async () => {
      prismaService.meeting.findMany.mockResolvedValue([mockConflictingMeeting]);

      await expect(
        service.validateNoConflicts(
          'therapist-123',
          'client-789',
          new Date('2024-01-15T10:30:00Z'),
          60,
        ),
      ).rejects.toThrow('Time slot conflicts with existing meetings');
    });

    it('should handle multiple conflicts in error message', async () => {
      const multipleConflicts = [
        mockConflictingMeeting,
        {
          ...mockConflictingMeeting,
          id: 'conflict-2',
          startTime: new Date('2024-01-15T10:45:00Z'),
          endTime: new Date('2024-01-15T11:45:00Z'),
        },
      ];
      prismaService.meeting.findMany.mockResolvedValue(multipleConflicts);

      await expect(
        service.validateNoConflicts(
          'therapist-123',
          'client-789',
          new Date('2024-01-15T10:30:00Z'),
          60,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('integration tests', () => {
    it('should handle complex scheduling scenarios', async () => {
      const complexMeetings = [
        {
          id: 'meeting-1',
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T09:00:00Z'),
          endTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
          status: 'SCHEDULED',
        },
        {
          id: 'meeting-2',
          therapistId: 'therapist-123',
          clientId: 'client-456',
          startTime: new Date('2024-01-15T11:00:00Z'),
          endTime: new Date('2024-01-15T12:00:00Z'),
          duration: 60,
          status: 'CONFIRMED',
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue(complexMeetings);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('therapist');
      expect(result.conflictingMeetings).toHaveLength(2);
    });

    it('should handle edge cases with millisecond precision', async () => {
      const edgeCaseMeeting = {
        ...mockConflictingMeeting,
        startTime: new Date('2024-01-15T10:59:59.999Z'),
        endTime: new Date('2024-01-15T11:59:59.999Z'),
      };
      prismaService.meeting.findMany.mockResolvedValue([edgeCaseMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T10:00:00.000Z'),
        60,
      );

      expect(result.hasConflict).toBe(true);
    });

    it('should handle timezone-aware conflict detection', async () => {
      const timezoneMeeting = {
        ...mockConflictingMeeting,
        startTime: new Date('2024-01-15T15:00:00Z'), // 3 PM UTC
        endTime: new Date('2024-01-15T16:00:00Z'),   // 4 PM UTC
      };
      prismaService.meeting.findMany.mockResolvedValue([timezoneMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T15:30:00Z'), // 3:30 PM UTC
        60,
      );

      expect(result.hasConflict).toBe(true);
    });

    it('should handle legacy data with missing endTime fields', async () => {
      const legacyMeeting = {
        ...mockConflictingMeeting,
        endTime: null,
      };
      prismaService.meeting.findMany.mockResolvedValue([legacyMeeting]);

      const result = await service.checkSchedulingConflicts(
        'therapist-123',
        'client-789',
        new Date('2024-01-15T10:30:00Z'),
        60,
      );

      expect(result.hasConflict).toBe(true);
    });

    it('should handle concurrent booking scenarios', async () => {
      const concurrentMeetings = [
        {
          therapistId: 'therapist-123',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-123',
          clientId: 'client-456',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
        {
          therapistId: 'therapist-456',
          clientId: 'client-123',
          startTime: new Date('2024-01-15T10:00:00Z'),
          duration: 60,
        },
      ];

      prismaService.meeting.findMany.mockResolvedValue([]);

      const result = await service.checkBulkConflicts(concurrentMeetings);

      expect(result).toHaveLength(2);
      expect(result[0].meetingIndex).toBe(1);
      expect(result[1].meetingIndex).toBe(2);
    });
  });
});