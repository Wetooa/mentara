import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  SessionStatus,
  SessionType,
  ActivityType,
  UserActionType,
} from '@prisma/client';

describe('SessionsService', () => {
  let service: SessionsService;
  let prismaService: any;

  // Mock data
  const mockUser = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockClient = {
    id: 'client-123',
    userId: 'user-123',
    user: mockUser,
  };

  const mockTherapist = {
    id: 'therapist-123',
    userId: 'therapist-user-123',
    user: {
      id: 'therapist-user-123',
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      avatarUrl: 'https://example.com/therapist-avatar.jpg',
    },
  };

  const mockMeeting = {
    id: 'meeting-123',
    title: 'Therapy Session',
    scheduledStart: new Date('2024-01-15T10:00:00Z'),
    scheduledEnd: new Date('2024-01-15T11:00:00Z'),
  };

  const mockSessionLog = {
    id: 'session-123',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    sessionType: SessionType.REGULAR_THERAPY,
    status: SessionStatus.IN_PROGRESS,
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: null,
    duration: null,
    platform: 'ZOOM',
    meetingId: 'meeting-123',
    notes: null,
    quality: null,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    client: mockClient,
    therapist: mockTherapist,
    meeting: mockMeeting,
    activities: [],
  };

  const mockCompletedSession = {
    ...mockSessionLog,
    id: 'completed-session-123',
    status: SessionStatus.COMPLETED,
    endTime: new Date('2024-01-15T11:00:00Z'),
    duration: 60,
    quality: 8,
    notes: 'Good progress made today',
  };

  const mockSessionActivity = {
    id: 'activity-123',
    sessionId: 'session-123',
    activityType: ActivityType.MOOD_CHECK_IN,
    description: 'Daily mood check-in',
    duration: 10,
    timestamp: new Date('2024-01-15T10:15:00Z'),
    metadata: { difficulty: 'beginner' },
  };

  const mockUserActivity = {
    id: 'user-activity-123',
    userId: 'user-123',
    action: UserActionType.PAGE_VIEW,
    page: '/dashboard',
    component: 'LoginForm',
    timestamp: new Date('2024-01-15T09:00:00Z'),
    sessionId: 'session-123',
    metadata: { loginMethod: 'email' },
    deviceInfo: { browser: 'Chrome', os: 'Windows' },
  };

  const mockTherapyProgress = {
    id: 'progress-123',
    clientId: 'client-123',
    therapistId: 'therapist-123',
    progressScore: 7.5,
    improvementAreas: ['anxiety management', 'social skills'],
    concernAreas: ['stress levels'],
    goalsSet: { primary: 'reduce anxiety', secondary: 'improve sleep' },
    goalsAchieved: { completed: ['initial assessment'] },
    nextMilestones: { upcoming: ['weekly check-ins'] },
    moodScore: 6,
    anxietyScore: 4,
    depressionScore: 3,
    functionalScore: 7,
    therapistNotes: 'Client showing improvement',
    clientFeedback: 'Feeling more confident',
    recommendations: ['Continue current approach', 'Add mindfulness'],
    assessmentDate: new Date('2024-01-15T00:00:00Z'),
    client: mockClient,
    therapist: mockTherapist,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      sessionLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      sessionActivity: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      userActivity: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      therapyProgress: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSessionLog', () => {
    const createSessionData = {
      clientId: 'client-123',
      therapistId: 'therapist-123',
      sessionType: SessionType.REGULAR_THERAPY,
      meetingId: 'meeting-123',
      platform: 'ZOOM',
    };

    beforeEach(() => {
      prismaService.sessionLog.create.mockResolvedValue(mockSessionLog);
    });

    it('should create a session log successfully', async () => {
      const result = await service.createSessionLog(createSessionData);

      expect(prismaService.sessionLog.create).toHaveBeenCalledWith({
        data: {
          ...createSessionData,
          startTime: expect.any(Date),
          status: SessionStatus.IN_PROGRESS,
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockSessionLog);
    });

    it('should create session with provided start time', async () => {
      const customStartTime = new Date('2024-01-15T09:30:00Z');
      const dataWithStartTime = {
        ...createSessionData,
        startTime: customStartTime,
      };

      await service.createSessionLog(dataWithStartTime);

      expect(prismaService.sessionLog.create).toHaveBeenCalledWith({
        data: {
          ...dataWithStartTime,
          status: SessionStatus.IN_PROGRESS,
        },
        include: expect.any(Object),
      });
    });

    it('should create session without therapist ID', async () => {
      const dataWithoutTherapist = {
        clientId: 'client-123',
        sessionType: SessionType.SELF_GUIDED,
        platform: 'WEB',
      };

      await service.createSessionLog(dataWithoutTherapist);

      expect(prismaService.sessionLog.create).toHaveBeenCalledWith({
        data: {
          ...dataWithoutTherapist,
          startTime: expect.any(Date),
          status: SessionStatus.IN_PROGRESS,
        },
        include: expect.any(Object),
      });
    });

    it('should handle database errors gracefully', async () => {
      prismaService.sessionLog.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createSessionLog(createSessionData),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAllSessions', () => {
    beforeEach(() => {
      prismaService.sessionLog.findMany.mockResolvedValue([mockSessionLog, mockCompletedSession]);
    });

    it('should find all sessions without filters', async () => {
      const result = await service.findAllSessions();

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          activities: true,
        },
        orderBy: { startTime: 'desc' },
      });
      expect(result).toEqual([mockSessionLog, mockCompletedSession]);
    });

    it('should find sessions with client filter', async () => {
      await service.findAllSessions('client-123');

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-123' },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should find sessions with therapist filter', async () => {
      await service.findAllSessions(undefined, 'therapist-123');

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: { therapistId: 'therapist-123' },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should find sessions with status filter', async () => {
      await service.findAllSessions(undefined, undefined, SessionStatus.COMPLETED);

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: { status: SessionStatus.COMPLETED },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should find sessions with session type filter', async () => {
      await service.findAllSessions(undefined, undefined, undefined, SessionType.GROUP_THERAPY);

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: { sessionType: SessionType.GROUP_THERAPY },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should find sessions with multiple filters', async () => {
      await service.findAllSessions(
        'client-123',
        'therapist-123',
        SessionStatus.COMPLETED,
        SessionType.REGULAR_THERAPY,
      );

      expect(prismaService.sessionLog.findMany).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-123',
          status: SessionStatus.COMPLETED,
          sessionType: SessionType.REGULAR_THERAPY,
        },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });
  });

  describe('findSession', () => {
    beforeEach(() => {
      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
    });

    it('should find a session by ID', async () => {
      const result = await service.findSession('session-123');

      expect(prismaService.sessionLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          activities: {
            orderBy: { timestamp: 'asc' },
          },
          meeting: true,
        },
      });
      expect(result).toEqual(mockSessionLog);
    });

    it('should return null when session not found', async () => {
      prismaService.sessionLog.findUnique.mockResolvedValue(null);

      const result = await service.findSession('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    const updateData = {
      status: SessionStatus.COMPLETED,
      notes: 'Updated notes',
      quality: 9,
    };

    beforeEach(() => {
      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
      prismaService.sessionLog.update.mockResolvedValue({
        ...mockSessionLog,
        ...updateData,
      });
    });

    it('should update session successfully', async () => {
      const result = await service.updateSession('session-123', updateData);

      expect(prismaService.sessionLog.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: updateData,
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual({
        ...mockSessionLog,
        ...updateData,
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      prismaService.sessionLog.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSession('nonexistent', updateData),
      ).rejects.toThrow(new NotFoundException('Session with ID nonexistent not found'));
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { notes: 'Partial update' };

      await service.updateSession('session-123', partialUpdate);

      expect(prismaService.sessionLog.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: partialUpdate,
        include: expect.any(Object),
      });
    });
  });

  describe('endSession', () => {
    beforeEach(() => {
      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
      prismaService.sessionLog.update.mockResolvedValue(mockCompletedSession);
    });

    it('should end session successfully', async () => {
      const notes = 'Session completed successfully';
      const quality = 8;
      const result = await service.endSession('session-123', notes, quality);

      expect(prismaService.sessionLog.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: {
          endTime: expect.any(Date),
          duration: expect.any(Number),
          status: SessionStatus.COMPLETED,
          notes,
          quality,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCompletedSession);
    });

    it('should calculate duration correctly', async () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const sessionWithStartTime = { ...mockSessionLog, startTime };
      prismaService.sessionLog.findUnique.mockResolvedValue(sessionWithStartTime);

      // Mock Date to ensure consistent timing
      const mockEndTime = new Date('2024-01-15T11:30:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockEndTime as any);

      await service.endSession('session-123');

      const expectedDuration = Math.floor(
        (mockEndTime.getTime() - startTime.getTime()) / 60000,
      );

      expect(prismaService.sessionLog.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: {
          endTime: mockEndTime,
          duration: expectedDuration,
          status: SessionStatus.COMPLETED,
          notes: undefined,
          quality: undefined,
        },
        include: expect.any(Object),
      });

      (global.Date as any).mockRestore();
    });

    it('should throw NotFoundException when session not found', async () => {
      prismaService.sessionLog.findUnique.mockResolvedValue(null);

      await expect(
        service.endSession('nonexistent'),
      ).rejects.toThrow(new NotFoundException('Session with ID nonexistent not found'));
    });

    it('should throw BadRequestException when session not in progress', async () => {
      const completedSession = { ...mockSessionLog, status: SessionStatus.COMPLETED };
      prismaService.sessionLog.findUnique.mockResolvedValue(completedSession);

      await expect(
        service.endSession('session-123'),
      ).rejects.toThrow(new BadRequestException('Session is not in progress'));
    });

    it('should end session without optional parameters', async () => {
      await service.endSession('session-123');

      expect(prismaService.sessionLog.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: {
          endTime: expect.any(Date),
          duration: expect.any(Number),
          status: SessionStatus.COMPLETED,
          notes: undefined,
          quality: undefined,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('addSessionActivity', () => {
    beforeEach(() => {
      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
      prismaService.sessionActivity.create.mockResolvedValue(mockSessionActivity);
    });

    it('should add session activity successfully', async () => {
      const result = await service.addSessionActivity(
        'session-123',
        ActivityType.MOOD_CHECK_IN,
        'Daily mood check-in',
        10,
        { difficulty: 'beginner' },
      );

      expect(prismaService.sessionActivity.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-123',
          activityType: ActivityType.MOOD_CHECK_IN,
          description: 'Daily mood check-in',
          duration: 10,
          metadata: { difficulty: 'beginner' },
        },
      });
      expect(result).toEqual(mockSessionActivity);
    });

    it('should add activity with minimal data', async () => {
      await service.addSessionActivity('session-123', ActivityType.PROGRESS_REVIEW);

      expect(prismaService.sessionActivity.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-123',
          activityType: ActivityType.PROGRESS_REVIEW,
          description: undefined,
          duration: undefined,
          metadata: undefined,
        },
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      prismaService.sessionLog.findUnique.mockResolvedValue(null);

      await expect(
        service.addSessionActivity('nonexistent', ActivityType.MOOD_CHECK_IN),
      ).rejects.toThrow(new NotFoundException('Session with ID nonexistent not found'));
    });
  });

  describe('getSessionActivities', () => {
    beforeEach(() => {
      prismaService.sessionActivity.findMany.mockResolvedValue([mockSessionActivity]);
    });

    it('should get session activities', async () => {
      const result = await service.getSessionActivities('session-123');

      expect(prismaService.sessionActivity.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-123' },
        orderBy: { timestamp: 'asc' },
      });
      expect(result).toEqual([mockSessionActivity]);
    });

    it('should return empty array when no activities found', async () => {
      prismaService.sessionActivity.findMany.mockResolvedValue([]);

      const result = await service.getSessionActivities('session-123');

      expect(result).toEqual([]);
    });
  });

  describe('logUserActivity', () => {
    beforeEach(() => {
      prismaService.userActivity.create.mockResolvedValue(mockUserActivity);
    });

    it('should log user activity with all parameters', async () => {
      const result = await service.logUserActivity(
        'user-123',
        UserActionType.PAGE_VIEW,
        '/dashboard',
        'LoginForm',
        { loginMethod: 'email' },
        'session-123',
        { browser: 'Chrome', os: 'Windows' },
      );

      expect(prismaService.userActivity.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          action: UserActionType.PAGE_VIEW,
          page: '/dashboard',
          component: 'LoginForm',
          metadata: { loginMethod: 'email' },
          sessionId: 'session-123',
          deviceInfo: { browser: 'Chrome', os: 'Windows' },
        },
      });
      expect(result).toEqual(mockUserActivity);
    });

    it('should log user activity with minimal parameters', async () => {
      await service.logUserActivity('user-123', UserActionType.LOGOUT);

      expect(prismaService.userActivity.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          action: UserActionType.LOGOUT,
          page: undefined,
          component: undefined,
          metadata: undefined,
          sessionId: undefined,
          deviceInfo: undefined,
        },
      });
    });
  });

  describe('getUserActivities', () => {
    beforeEach(() => {
      prismaService.userActivity.findMany.mockResolvedValue([mockUserActivity]);
    });

    it('should get user activities without filters', async () => {
      const result = await service.getUserActivities('user-123');

      expect(prismaService.userActivity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      expect(result).toEqual([mockUserActivity]);
    });

    it('should get user activities with action filter', async () => {
      await service.getUserActivities('user-123', UserActionType.PAGE_VIEW);

      expect(prismaService.userActivity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', action: UserActionType.PAGE_VIEW },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should get user activities with date filters', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      await service.getUserActivities('user-123', undefined, startDate, endDate);

      expect(prismaService.userActivity.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          timestamp: { gte: startDate, lte: endDate },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should get user activities with all filters', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      await service.getUserActivities('user-123', UserActionType.PAGE_VIEW, startDate, endDate);

      expect(prismaService.userActivity.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          action: UserActionType.PAGE_VIEW,
          timestamp: { gte: startDate, lte: endDate },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });
  });

  describe('createTherapyProgress', () => {
    const progressData = {
      clientId: 'client-123',
      therapistId: 'therapist-123',
      progressScore: 7.5,
      improvementAreas: ['anxiety management', 'social skills'],
      concernAreas: ['stress levels'],
      goalsSet: { primary: 'reduce anxiety', secondary: 'improve sleep' },
      goalsAchieved: { completed: ['initial assessment'] },
      nextMilestones: { upcoming: ['weekly check-ins'] },
      moodScore: 6,
      anxietyScore: 4,
      depressionScore: 3,
      functionalScore: 7,
      therapistNotes: 'Client showing improvement',
      clientFeedback: 'Feeling more confident',
      recommendations: ['Continue current approach', 'Add mindfulness'],
    };

    beforeEach(() => {
      prismaService.therapyProgress.create.mockResolvedValue(mockTherapyProgress);
    });

    it('should create therapy progress successfully', async () => {
      const result = await service.createTherapyProgress(progressData);

      expect(prismaService.therapyProgress.create).toHaveBeenCalledWith({
        data: progressData,
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockTherapyProgress);
    });

    it('should create therapy progress with minimal data', async () => {
      const minimalData = {
        clientId: 'client-123',
        therapistId: 'therapist-123',
        progressScore: 5.0,
      };

      await service.createTherapyProgress(minimalData);

      expect(prismaService.therapyProgress.create).toHaveBeenCalledWith({
        data: minimalData,
        include: expect.any(Object),
      });
    });
  });

  describe('getTherapyProgress', () => {
    beforeEach(() => {
      prismaService.therapyProgress.findMany.mockResolvedValue([mockTherapyProgress]);
    });

    it('should get therapy progress without filters', async () => {
      const result = await service.getTherapyProgress();

      expect(prismaService.therapyProgress.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { assessmentDate: 'desc' },
      });
      expect(result).toEqual([mockTherapyProgress]);
    });

    it('should get therapy progress with client filter', async () => {
      await service.getTherapyProgress('client-123');

      expect(prismaService.therapyProgress.findMany).toHaveBeenCalledWith({
        where: { clientId: 'client-123' },
        include: expect.any(Object),
        orderBy: { assessmentDate: 'desc' },
      });
    });

    it('should get therapy progress with therapist filter', async () => {
      await service.getTherapyProgress(undefined, 'therapist-123');

      expect(prismaService.therapyProgress.findMany).toHaveBeenCalledWith({
        where: { therapistId: 'therapist-123' },
        include: expect.any(Object),
        orderBy: { assessmentDate: 'desc' },
      });
    });

    it('should get therapy progress with date filters', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      await service.getTherapyProgress(undefined, undefined, startDate, endDate);

      expect(prismaService.therapyProgress.findMany).toHaveBeenCalledWith({
        where: {
          assessmentDate: { gte: startDate, lte: endDate },
        },
        include: expect.any(Object),
        orderBy: { assessmentDate: 'desc' },
      });
    });

    it('should get therapy progress with all filters', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      await service.getTherapyProgress('client-123', 'therapist-123', startDate, endDate);

      expect(prismaService.therapyProgress.findMany).toHaveBeenCalledWith({
        where: {
          clientId: 'client-123',
          therapistId: 'therapist-123',
          assessmentDate: { gte: startDate, lte: endDate },
        },
        include: expect.any(Object),
        orderBy: { assessmentDate: 'desc' },
      });
    });
  });

  describe('getSessionStatistics', () => {
    const mockStatistics = {
      totalSessions: 10,
      completedSessions: 8,
      averageDuration: 55.5,
      sessionsByType: [
        { sessionType: SessionType.REGULAR_THERAPY, _count: { sessionType: 6 } },
        { sessionType: SessionType.GROUP_THERAPY, _count: { sessionType: 2 } },
        { sessionType: SessionType.SELF_GUIDED, _count: { sessionType: 2 } },
      ],
      completionRate: 80,
    };

    beforeEach(() => {
      prismaService.sessionLog.count.mockResolvedValueOnce(10).mockResolvedValueOnce(8);
      prismaService.sessionLog.aggregate.mockResolvedValue({
        _avg: { duration: 55.5 },
      });
      prismaService.sessionLog.groupBy.mockResolvedValue([
        { sessionType: SessionType.REGULAR_THERAPY, _count: { sessionType: 6 } },
        { sessionType: SessionType.GROUP_THERAPY, _count: { sessionType: 2 } },
        { sessionType: SessionType.SELF_GUIDED, _count: { sessionType: 2 } },
      ]);
    });

    it('should get session statistics without filters', async () => {
      const result = await service.getSessionStatistics();

      expect(prismaService.sessionLog.count).toHaveBeenCalledWith({ where: {} });
      expect(prismaService.sessionLog.count).toHaveBeenCalledWith({
        where: { status: SessionStatus.COMPLETED },
      });
      expect(prismaService.sessionLog.aggregate).toHaveBeenCalledWith({
        where: { status: SessionStatus.COMPLETED },
        _avg: { duration: true },
      });
      expect(prismaService.sessionLog.groupBy).toHaveBeenCalledWith({
        by: ['sessionType'],
        where: {},
        _count: { sessionType: true },
      });

      expect(result).toEqual({
        totalSessions: 10,
        completedSessions: 8,
        averageDuration: 55.5,
        sessionsByType: [
          { sessionType: SessionType.REGULAR_THERAPY, _count: { sessionType: 6 } },
          { sessionType: SessionType.GROUP_THERAPY, _count: { sessionType: 2 } },
          { sessionType: SessionType.SELF_GUIDED, _count: { sessionType: 2 } },
        ],
        completionRate: 80,
      });
    });

    it('should get session statistics with client filter', async () => {
      await service.getSessionStatistics('client-123');

      expect(prismaService.sessionLog.count).toHaveBeenCalledWith({
        where: { clientId: 'client-123' },
      });
      expect(prismaService.sessionLog.count).toHaveBeenCalledWith({
        where: { clientId: 'client-123', status: SessionStatus.COMPLETED },
      });
      expect(prismaService.sessionLog.aggregate).toHaveBeenCalledWith({
        where: { clientId: 'client-123', status: SessionStatus.COMPLETED },
        _avg: { duration: true },
      });
      expect(prismaService.sessionLog.groupBy).toHaveBeenCalledWith({
        by: ['sessionType'],
        where: { clientId: 'client-123' },
        _count: { sessionType: true },
      });
    });

    it('should get session statistics with therapist filter', async () => {
      await service.getSessionStatistics(undefined, 'therapist-123');

      expect(prismaService.sessionLog.count).toHaveBeenCalledWith({
        where: { therapistId: 'therapist-123' },
      });
    });

    it('should handle zero sessions gracefully', async () => {
      // Reset the mocks for this test
      prismaService.sessionLog.count.mockReset();
      prismaService.sessionLog.aggregate.mockReset();
      prismaService.sessionLog.groupBy.mockReset();
      
      prismaService.sessionLog.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prismaService.sessionLog.aggregate.mockResolvedValue({
        _avg: { duration: null },
      });
      prismaService.sessionLog.groupBy.mockResolvedValue([]);

      const result = await service.getSessionStatistics();

      expect(result).toEqual({
        totalSessions: 0,
        completedSessions: 0,
        averageDuration: 0,
        sessionsByType: [],
        completionRate: 0,
      });
    });

    it('should handle null average duration', async () => {
      prismaService.sessionLog.aggregate.mockResolvedValue({
        _avg: { duration: null },
      });

      const result = await service.getSessionStatistics();

      expect(result.averageDuration).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors', async () => {
      prismaService.sessionLog.create.mockRejectedValue(new Error('Connection timeout'));

      await expect(
        service.createSessionLog({
          clientId: 'client-123',
          sessionType: SessionType.REGULAR_THERAPY,
        }),
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle invalid session type in statistics', async () => {
      prismaService.sessionLog.count.mockRejectedValue(new Error('Invalid session type'));

      await expect(service.getSessionStatistics()).rejects.toThrow('Invalid session type');
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent session updates', async () => {
      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
      prismaService.sessionLog.update.mockResolvedValue(mockCompletedSession);

      const updatePromises = [
        service.updateSession('session-123', { notes: 'Update 1' }),
        service.updateSession('session-123', { notes: 'Update 2' }),
      ];

      const results = await Promise.all(updatePromises);

      expect(results).toHaveLength(2);
      expect(prismaService.sessionLog.update).toHaveBeenCalledTimes(2);
    });

    it('should handle large activity metadata', async () => {
      const largeMetadata = {
        complexData: new Array(1000).fill('data'),
        nestedObject: { level1: { level2: { level3: 'deep' } } },
      };

      prismaService.sessionLog.findUnique.mockResolvedValue(mockSessionLog);
      prismaService.sessionActivity.create.mockResolvedValue(mockSessionActivity);

      await service.addSessionActivity(
        'session-123',
        ActivityType.ASSESSMENT_COMPLETION,
        'Large data activity',
        undefined,
        largeMetadata,
      );

      expect(prismaService.sessionActivity.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-123',
          activityType: ActivityType.ASSESSMENT_COMPLETION,
          description: 'Large data activity',
          duration: undefined,
          metadata: largeMetadata,
        },
      });
    });

    it('should handle therapy progress with empty arrays', async () => {
      const dataWithEmptyArrays = {
        clientId: 'client-123',
        therapistId: 'therapist-123',
        progressScore: 5.0,
        improvementAreas: [],
        concernAreas: [],
        recommendations: [],
      };

      prismaService.therapyProgress.create.mockResolvedValue(mockTherapyProgress);

      await service.createTherapyProgress(dataWithEmptyArrays);

      expect(prismaService.therapyProgress.create).toHaveBeenCalledWith({
        data: dataWithEmptyArrays,
        include: expect.any(Object),
      });
    });
  });
});