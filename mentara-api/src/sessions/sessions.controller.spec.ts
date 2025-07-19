/**
 * Comprehensive Test Suite for SessionsController
 * Tests session management, activity tracking, therapy progress, and statistics
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('SessionsController', () => {
  let controller: SessionsController;
  let sessionsService: SessionsService;
  let module: TestingModule;

  // Mock SessionsService
  const mockSessionsService = {
    createSessionLog: jest.fn(),
    findAllSessions: jest.fn(),
    findSession: jest.fn(),
    updateSession: jest.fn(),
    endSession: jest.fn(),
    addSessionActivity: jest.fn(),
    getSessionActivities: jest.fn(),
    logUserActivity: jest.fn(),
    getUserActivities: jest.fn(),
    createTherapyProgress: jest.fn(),
    getTherapyProgress: jest.fn(),
    getSessionStatistics: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockSessionLog = {
    id: 'session_123456789',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    sessionType: 'video',
    status: 'completed',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T10:50:00Z'),
    duration: 50,
    notes: 'Great progress on anxiety management techniques',
    rating: 4,
    quality: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSessionActivity = {
    id: 'activity_123456789',
    sessionId: 'session_123456789',
    activityType: 'discussion',
    description: 'Discussed coping strategies for work stress',
    duration: 20,
    metadata: { topics: ['work stress', 'coping strategies'] },
    createdAt: new Date(),
  };

  const mockUserActivity = {
    id: 'user_activity_123456789',
    userId: TEST_USER_IDS.CLIENT,
    action: 'click',
    page: '/dashboard',
    component: 'session-card',
    metadata: { sessionId: 'session_123456789' },
    sessionId: 'session_123456789',
    deviceInfo: { browser: 'Chrome', os: 'Windows' },
    timestamp: new Date(),
  };

  const mockTherapyProgress = {
    id: 'progress_123456789',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    sessionId: 'session_123456789',
    progressNotes: 'Client showed significant improvement in managing anxiety',
    goalsAchieved: ['Practice mindfulness daily', 'Identify triggers'],
    newGoals: ['Apply techniques in work situations', 'Build social connections'],
    moodRating: 7,
    progressRating: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSessionStatistics = {
    totalSessions: 25,
    completedSessions: 22,
    cancelledSessions: 3,
    averageSessionDuration: 48.5,
    averageSessionRating: 4.2,
    sessionsByType: {
      video: 18,
      audio: 4,
      chat: 2,
      in_person: 1,
    },
    progressTrend: {
      averageMoodRating: 6.8,
      averageProgressRating: 7.2,
      improvementPercentage: 15.5,
    },
    dateRange: {
      startDate: new Date('2023-12-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have sessionsService injected', () => {
      expect(sessionsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', SessionsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', SessionsController);
      expect(controllerMetadata).toBe('sessions');
    });
  });

  describe('Session Log Management', () => {
    describe('POST /sessions/logs', () => {
      const createSessionDto = {
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
        sessionType: 'video' as const,
        status: 'scheduled' as const,
        startTime: '2024-01-15T10:00:00Z',
        notes: 'Initial session for anxiety management',
      };

      it('should create session log successfully', async () => {
        mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

        const result = await controller.createSessionLog(
          createSessionDto,
          TEST_USER_IDS.THERAPIST,
          'therapist'
        );

        expect(result).toEqual(mockSessionLog);
        expect(sessionsService.createSessionLog).toHaveBeenCalledWith({
          ...createSessionDto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });

      it('should override clientId for client users', async () => {
        const clientDto = {
          ...createSessionDto,
          clientId: 'different-client-id',
        };
        mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

        await controller.createSessionLog(
          clientDto,
          TEST_USER_IDS.CLIENT,
          'client'
        );

        expect(sessionsService.createSessionLog).toHaveBeenCalledWith({
          ...clientDto,
          clientId: TEST_USER_IDS.CLIENT,
        });
      });

      it('should override therapistId for therapist users', async () => {
        const therapistDto = {
          ...createSessionDto,
          therapistId: 'different-therapist-id',
        };
        mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

        await controller.createSessionLog(
          therapistDto,
          TEST_USER_IDS.THERAPIST,
          'therapist'
        );

        expect(sessionsService.createSessionLog).toHaveBeenCalledWith({
          ...therapistDto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });

      it('should handle service errors', async () => {
        const serviceError = new Error('Session creation failed');
        mockSessionsService.createSessionLog.mockRejectedValue(serviceError);

        await expect(
          controller.createSessionLog(createSessionDto, TEST_USER_IDS.THERAPIST, 'therapist')
        ).rejects.toThrow(serviceError);
      });
    });

    describe('GET /sessions/logs', () => {
      const queryDto = {
        status: 'completed' as const,
        sessionType: 'video' as const,
      };

      it('should get sessions for therapist', async () => {
        const mockSessions = [mockSessionLog];
        mockSessionsService.findAllSessions.mockResolvedValue(mockSessions);

        const result = await controller.findAllSessions(
          'therapist',
          TEST_USER_IDS.THERAPIST,
          queryDto
        );

        expect(result).toEqual(mockSessions);
        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          undefined,
          TEST_USER_IDS.THERAPIST,
          queryDto.status,
          queryDto.sessionType
        );
      });

      it('should get sessions for client', async () => {
        const mockSessions = [mockSessionLog];
        mockSessionsService.findAllSessions.mockResolvedValue(mockSessions);

        const result = await controller.findAllSessions(
          'client',
          TEST_USER_IDS.CLIENT,
          queryDto
        );

        expect(result).toEqual(mockSessions);
        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined,
          queryDto.status,
          queryDto.sessionType
        );
      });

      it('should allow admin to filter by specific client and therapist', async () => {
        const adminQuery = {
          ...queryDto,
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
        };
        const mockSessions = [mockSessionLog];
        mockSessionsService.findAllSessions.mockResolvedValue(mockSessions);

        const result = await controller.findAllSessions(
          'admin',
          'admin-user-id',
          adminQuery
        );

        expect(result).toEqual(mockSessions);
        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
          queryDto.status,
          queryDto.sessionType
        );
      });
    });

    describe('GET /sessions/logs/:id', () => {
      it('should get session by id successfully', async () => {
        mockSessionsService.findSession.mockResolvedValue(mockSessionLog);

        const result = await controller.findSession('session_123456789');

        expect(result).toEqual(mockSessionLog);
        expect(sessionsService.findSession).toHaveBeenCalledWith('session_123456789');
      });

      it('should handle session not found', async () => {
        const notFoundError = new NotFoundException('Session not found');
        mockSessionsService.findSession.mockRejectedValue(notFoundError);

        await expect(
          controller.findSession('nonexistent-session')
        ).rejects.toThrow(notFoundError);
      });
    });

    describe('PATCH /sessions/logs/:id', () => {
      const updateDto = {
        status: 'completed' as const,
        endTime: '2024-01-15T10:50:00Z',
        notes: 'Session completed successfully',
        rating: 5,
        quality: 4,
      };

      it('should update session successfully', async () => {
        const updatedSession = { ...mockSessionLog, ...updateDto };
        mockSessionsService.updateSession.mockResolvedValue(updatedSession);

        const result = await controller.updateSession('session_123456789', updateDto);

        expect(result).toEqual(updatedSession);
        expect(sessionsService.updateSession).toHaveBeenCalledWith(
          'session_123456789',
          updateDto
        );
      });

      it('should handle partial updates', async () => {
        const partialUpdate = { status: 'completed' as const };
        const updatedSession = { ...mockSessionLog, ...partialUpdate };
        mockSessionsService.updateSession.mockResolvedValue(updatedSession);

        const result = await controller.updateSession('session_123456789', partialUpdate);

        expect(result).toEqual(updatedSession);
        expect(sessionsService.updateSession).toHaveBeenCalledWith(
          'session_123456789',
          partialUpdate
        );
      });
    });

    describe('POST /sessions/logs/:id/end', () => {
      const endSessionDto = {
        notes: 'Session ended with positive outcomes',
        quality: 5,
      };

      it('should end session successfully', async () => {
        const endedSession = {
          ...mockSessionLog,
          status: 'completed',
          endTime: new Date(),
          duration: 50,
        };
        mockSessionsService.endSession.mockResolvedValue(endedSession);

        const result = await controller.endSession('session_123456789', endSessionDto);

        expect(result).toEqual(endedSession);
        expect(sessionsService.endSession).toHaveBeenCalledWith(
          'session_123456789',
          endSessionDto.notes,
          endSessionDto.quality
        );
      });

      it('should handle service errors', async () => {
        const serviceError = new Error('Failed to end session');
        mockSessionsService.endSession.mockRejectedValue(serviceError);

        await expect(
          controller.endSession('session_123456789', endSessionDto)
        ).rejects.toThrow(serviceError);
      });
    });
  });

  describe('Session Activity Management', () => {
    describe('POST /sessions/logs/:id/activities', () => {
      const activityDto = {
        activityType: 'discussion' as const,
        description: 'Discussed anxiety management techniques',
        duration: 25,
        metadata: { topics: ['anxiety', 'coping strategies'] },
      };

      it('should add session activity successfully', async () => {
        mockSessionsService.addSessionActivity.mockResolvedValue(mockSessionActivity);

        const result = await controller.addSessionActivity('session_123456789', activityDto);

        expect(result).toEqual(mockSessionActivity);
        expect(sessionsService.addSessionActivity).toHaveBeenCalledWith(
          'session_123456789',
          activityDto.activityType,
          activityDto.description,
          activityDto.duration,
          activityDto.metadata
        );
      });

      it('should handle activity creation without optional fields', async () => {
        const basicActivityDto = {
          activityType: 'exercise' as const,
          description: 'Breathing exercise',
        };
        mockSessionsService.addSessionActivity.mockResolvedValue(mockSessionActivity);

        const result = await controller.addSessionActivity(
          'session_123456789',
          basicActivityDto
        );

        expect(result).toEqual(mockSessionActivity);
        expect(sessionsService.addSessionActivity).toHaveBeenCalledWith(
          'session_123456789',
          basicActivityDto.activityType,
          basicActivityDto.description,
          undefined,
          undefined
        );
      });
    });

    describe('GET /sessions/logs/:id/activities', () => {
      it('should get session activities successfully', async () => {
        const mockActivities = [mockSessionActivity];
        mockSessionsService.getSessionActivities.mockResolvedValue(mockActivities);

        const result = await controller.getSessionActivities('session_123456789');

        expect(result).toEqual(mockActivities);
        expect(sessionsService.getSessionActivities).toHaveBeenCalledWith('session_123456789');
      });

      it('should handle empty activities list', async () => {
        mockSessionsService.getSessionActivities.mockResolvedValue([]);

        const result = await controller.getSessionActivities('session_123456789');

        expect(result).toEqual([]);
      });
    });
  });

  describe('User Activity Tracking', () => {
    describe('POST /sessions/user-activities', () => {
      const userActivityDto = {
        action: 'click' as const,
        page: '/dashboard',
        component: 'session-card',
        metadata: { sessionId: 'session_123456789' },
        sessionId: 'session_123456789',
        deviceInfo: { browser: 'Chrome', os: 'Windows' },
      };

      it('should log user activity successfully', async () => {
        mockSessionsService.logUserActivity.mockResolvedValue(mockUserActivity);

        const result = await controller.logUserActivity(
          userActivityDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(mockUserActivity);
        expect(sessionsService.logUserActivity).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          userActivityDto.action,
          userActivityDto.page,
          userActivityDto.component,
          userActivityDto.metadata,
          userActivityDto.sessionId,
          userActivityDto.deviceInfo
        );
      });

      it('should handle minimal user activity data', async () => {
        const minimalActivityDto = {
          action: 'view' as const,
        };
        mockSessionsService.logUserActivity.mockResolvedValue(mockUserActivity);

        const result = await controller.logUserActivity(
          minimalActivityDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(mockUserActivity);
        expect(sessionsService.logUserActivity).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          minimalActivityDto.action,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
      });
    });

    describe('GET /sessions/user-activities', () => {
      const queryDto = {
        action: 'click' as const,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      it('should get user activities successfully', async () => {
        const mockActivities = [mockUserActivity];
        mockSessionsService.getUserActivities.mockResolvedValue(mockActivities);

        const result = await controller.getUserActivities(TEST_USER_IDS.CLIENT, queryDto);

        expect(result).toEqual(mockActivities);
        expect(sessionsService.getUserActivities).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          queryDto.action,
          new Date(queryDto.startDate),
          new Date(queryDto.endDate)
        );
      });

      it('should handle queries without filters', async () => {
        const mockActivities = [mockUserActivity];
        mockSessionsService.getUserActivities.mockResolvedValue(mockActivities);

        const result = await controller.getUserActivities(TEST_USER_IDS.CLIENT, {});

        expect(result).toEqual(mockActivities);
        expect(sessionsService.getUserActivities).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined,
          undefined,
          undefined
        );
      });
    });
  });

  describe('Therapy Progress Management', () => {
    describe('POST /sessions/therapy-progress', () => {
      const progressDto = {
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
        sessionId: 'session_123456789',
        progressNotes: 'Client showed significant improvement',
        goalsAchieved: ['Practice mindfulness daily'],
        newGoals: ['Apply techniques in work situations'],
        moodRating: 7,
        progressRating: 8,
      };

      it('should create therapy progress for therapist', async () => {
        mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

        const result = await controller.createTherapyProgress(
          progressDto,
          'therapist',
          TEST_USER_IDS.THERAPIST
        );

        expect(result).toEqual(mockTherapyProgress);
        expect(sessionsService.createTherapyProgress).toHaveBeenCalledWith({
          ...progressDto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });

      it('should allow admin to create progress for any therapist', async () => {
        mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

        const result = await controller.createTherapyProgress(
          progressDto,
          'admin',
          'admin-user-id'
        );

        expect(result).toEqual(mockTherapyProgress);
        expect(sessionsService.createTherapyProgress).toHaveBeenCalledWith(progressDto);
      });

      it('should handle minimal progress data', async () => {
        const minimalProgressDto = {
          clientId: TEST_USER_IDS.CLIENT,
          progressNotes: 'Session completed',
        };
        mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

        const result = await controller.createTherapyProgress(
          minimalProgressDto,
          'therapist',
          TEST_USER_IDS.THERAPIST
        );

        expect(result).toEqual(mockTherapyProgress);
        expect(sessionsService.createTherapyProgress).toHaveBeenCalledWith({
          ...minimalProgressDto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });
    });

    describe('GET /sessions/therapy-progress', () => {
      const queryDto = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      it('should get therapy progress for client', async () => {
        const mockProgress = [mockTherapyProgress];
        mockSessionsService.getTherapyProgress.mockResolvedValue(mockProgress);

        const result = await controller.getTherapyProgress(
          'client',
          TEST_USER_IDS.CLIENT,
          queryDto
        );

        expect(result).toEqual(mockProgress);
        expect(sessionsService.getTherapyProgress).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined,
          new Date(queryDto.startDate),
          new Date(queryDto.endDate)
        );
      });

      it('should get therapy progress for therapist', async () => {
        const mockProgress = [mockTherapyProgress];
        mockSessionsService.getTherapyProgress.mockResolvedValue(mockProgress);

        const result = await controller.getTherapyProgress(
          'therapist',
          TEST_USER_IDS.THERAPIST,
          queryDto
        );

        expect(result).toEqual(mockProgress);
        expect(sessionsService.getTherapyProgress).toHaveBeenCalledWith(
          undefined,
          TEST_USER_IDS.THERAPIST,
          new Date(queryDto.startDate),
          new Date(queryDto.endDate)
        );
      });

      it('should allow admin to filter by specific client and therapist', async () => {
        const adminQuery = {
          ...queryDto,
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
        };
        const mockProgress = [mockTherapyProgress];
        mockSessionsService.getTherapyProgress.mockResolvedValue(mockProgress);

        const result = await controller.getTherapyProgress(
          'admin',
          'admin-user-id',
          adminQuery
        );

        expect(result).toEqual(mockProgress);
        expect(sessionsService.getTherapyProgress).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
          new Date(queryDto.startDate),
          new Date(queryDto.endDate)
        );
      });
    });
  });

  describe('Session Statistics', () => {
    describe('GET /sessions/statistics', () => {
      const queryDto = {
        clientId: TEST_USER_IDS.CLIENT,
        therapistId: TEST_USER_IDS.THERAPIST,
      };

      it('should get session statistics for client', async () => {
        mockSessionsService.getSessionStatistics.mockResolvedValue(mockSessionStatistics);

        const result = await controller.getSessionStatistics(
          'client',
          TEST_USER_IDS.CLIENT,
          {}
        );

        expect(result).toEqual(mockSessionStatistics);
        expect(sessionsService.getSessionStatistics).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined
        );
      });

      it('should get session statistics for therapist', async () => {
        mockSessionsService.getSessionStatistics.mockResolvedValue(mockSessionStatistics);

        const result = await controller.getSessionStatistics(
          'therapist',
          TEST_USER_IDS.THERAPIST,
          {}
        );

        expect(result).toEqual(mockSessionStatistics);
        expect(sessionsService.getSessionStatistics).toHaveBeenCalledWith(
          undefined,
          TEST_USER_IDS.THERAPIST
        );
      });

      it('should allow admin to get statistics for specific client and therapist', async () => {
        mockSessionsService.getSessionStatistics.mockResolvedValue(mockSessionStatistics);

        const result = await controller.getSessionStatistics(
          'admin',
          'admin-user-id',
          queryDto
        );

        expect(result).toEqual(mockSessionStatistics);
        expect(sessionsService.getSessionStatistics).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST
        );
      });

      it('should handle empty statistics', async () => {
        const emptyStats = {
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          averageSessionDuration: 0,
          averageSessionRating: 0,
          sessionsByType: { video: 0, audio: 0, chat: 0, in_person: 0 },
          progressTrend: {
            averageMoodRating: 0,
            averageProgressRating: 0,
            improvementPercentage: 0,
          },
          dateRange: {
            startDate: new Date(),
            endDate: new Date(),
          },
        };
        mockSessionsService.getSessionStatistics.mockResolvedValue(emptyStats);

        const result = await controller.getSessionStatistics(
          'client',
          TEST_USER_IDS.CLIENT,
          {}
        );

        expect(result).toEqual(emptyStats);
        expect(result.totalSessions).toBe(0);
      });
    });
  });

  describe('Role-Based Access Control', () => {
    describe('Client Role Restrictions', () => {
      it('should automatically set clientId for client users in session creation', async () => {
        const dto = {
          clientId: 'different-client-id',
          therapistId: TEST_USER_IDS.THERAPIST,
          sessionType: 'video' as const,
          status: 'scheduled' as const,
        };
        mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

        await controller.createSessionLog(dto, TEST_USER_IDS.CLIENT, 'client');

        expect(sessionsService.createSessionLog).toHaveBeenCalledWith({
          ...dto,
          clientId: TEST_USER_IDS.CLIENT,
        });
      });

      it('should filter sessions by clientId for client users', async () => {
        const queryDto = { status: 'completed' as const };
        mockSessionsService.findAllSessions.mockResolvedValue([mockSessionLog]);

        await controller.findAllSessions('client', TEST_USER_IDS.CLIENT, queryDto);

        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined,
          queryDto.status,
          undefined
        );
      });

      it('should filter therapy progress by clientId for client users', async () => {
        const queryDto = { startDate: '2024-01-01T00:00:00Z' };
        mockSessionsService.getTherapyProgress.mockResolvedValue([mockTherapyProgress]);

        await controller.getTherapyProgress('client', TEST_USER_IDS.CLIENT, queryDto);

        expect(sessionsService.getTherapyProgress).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          undefined,
          new Date(queryDto.startDate),
          undefined
        );
      });
    });

    describe('Therapist Role Restrictions', () => {
      it('should automatically set therapistId for therapist users in session creation', async () => {
        const dto = {
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: 'different-therapist-id',
          sessionType: 'video' as const,
          status: 'scheduled' as const,
        };
        mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

        await controller.createSessionLog(dto, TEST_USER_IDS.THERAPIST, 'therapist');

        expect(sessionsService.createSessionLog).toHaveBeenCalledWith({
          ...dto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });

      it('should filter sessions by therapistId for therapist users', async () => {
        const queryDto = { status: 'completed' as const };
        mockSessionsService.findAllSessions.mockResolvedValue([mockSessionLog]);

        await controller.findAllSessions('therapist', TEST_USER_IDS.THERAPIST, queryDto);

        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          undefined,
          TEST_USER_IDS.THERAPIST,
          queryDto.status,
          undefined
        );
      });

      it('should automatically set therapistId for therapy progress creation', async () => {
        const dto = {
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: 'different-therapist-id',
          progressNotes: 'Progress notes',
        };
        mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

        await controller.createTherapyProgress(dto, 'therapist', TEST_USER_IDS.THERAPIST);

        expect(sessionsService.createTherapyProgress).toHaveBeenCalledWith({
          ...dto,
          therapistId: TEST_USER_IDS.THERAPIST,
        });
      });
    });

    describe('Admin Role Privileges', () => {
      it('should allow admin to access all sessions without filtering', async () => {
        const queryDto = {
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          status: 'completed' as const,
        };
        mockSessionsService.findAllSessions.mockResolvedValue([mockSessionLog]);

        await controller.findAllSessions('admin', 'admin-user-id', queryDto);

        expect(sessionsService.findAllSessions).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          TEST_USER_IDS.THERAPIST,
          queryDto.status,
          undefined
        );
      });

      it('should allow admin to create therapy progress for any therapist', async () => {
        const dto = {
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          progressNotes: 'Admin-created progress notes',
        };
        mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

        await controller.createTherapyProgress(dto, 'admin', 'admin-user-id');

        expect(sessionsService.createTherapyProgress).toHaveBeenCalledWith(dto);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockSessionsService.findAllSessions.mockRejectedValue(serviceError);

      await expect(
        controller.findAllSessions('client', TEST_USER_IDS.CLIENT, {})
      ).rejects.toThrow(serviceError);
    });

    it('should handle invalid session data', async () => {
      const validationError = new BadRequestException('Invalid session type');
      mockSessionsService.createSessionLog.mockRejectedValue(validationError);

      await expect(
        controller.createSessionLog(
          {
            clientId: TEST_USER_IDS.CLIENT,
            therapistId: TEST_USER_IDS.THERAPIST,
            sessionType: 'invalid' as any,
            status: 'scheduled' as const,
          },
          TEST_USER_IDS.THERAPIST,
          'therapist'
        )
      ).rejects.toThrow(validationError);
    });

    it('should handle concurrent session updates', async () => {
      const concurrencyError = new Error('Session is being updated by another process');
      mockSessionsService.updateSession.mockRejectedValue(concurrencyError);

      await expect(
        controller.updateSession('session_123456789', { status: 'completed' })
      ).rejects.toThrow(concurrencyError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockSessionsService.getSessionStatistics.mockRejectedValue(dbError);

      await expect(
        controller.getSessionStatistics('client', TEST_USER_IDS.CLIENT, {})
      ).rejects.toThrow(dbError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted session log', async () => {
      mockSessionsService.createSessionLog.mockResolvedValue(mockSessionLog);

      const result = await controller.createSessionLog(
        {
          clientId: TEST_USER_IDS.CLIENT,
          therapistId: TEST_USER_IDS.THERAPIST,
          sessionType: 'video',
          status: 'scheduled',
        },
        TEST_USER_IDS.THERAPIST,
        'therapist'
      );

      TestAssertions.expectValidEntity(result, ['id', 'clientId', 'therapistId', 'sessionType']);
      expect(result.id).toBe(mockSessionLog.id);
      expect(result.sessionType).toBe('video');
    });

    it('should return properly formatted session statistics', async () => {
      mockSessionsService.getSessionStatistics.mockResolvedValue(mockSessionStatistics);

      const result = await controller.getSessionStatistics(
        'client',
        TEST_USER_IDS.CLIENT,
        {}
      );

      expect(typeof result.totalSessions).toBe('number');
      expect(typeof result.averageSessionDuration).toBe('number');
      expect(typeof result.averageSessionRating).toBe('number');
      expect(typeof result.sessionsByType).toBe('object');
      expect(typeof result.progressTrend).toBe('object');
    });

    it('should return properly formatted therapy progress', async () => {
      mockSessionsService.createTherapyProgress.mockResolvedValue(mockTherapyProgress);

      const result = await controller.createTherapyProgress(
        {
          clientId: TEST_USER_IDS.CLIENT,
          progressNotes: 'Test progress notes',
        },
        'therapist',
        TEST_USER_IDS.THERAPIST
      );

      TestAssertions.expectValidEntity(result, ['id', 'clientId', 'therapistId', 'progressNotes']);
      expect(Array.isArray(result.goalsAchieved)).toBe(true);
      expect(Array.isArray(result.newGoals)).toBe(true);
      expect(typeof result.moodRating).toBe('number');
      expect(typeof result.progressRating).toBe('number');
    });

    it('should return properly formatted user activities', async () => {
      const mockActivities = [mockUserActivity];
      mockSessionsService.getUserActivities.mockResolvedValue(mockActivities);

      const result = await controller.getUserActivities(TEST_USER_IDS.CLIENT, {});

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        TestAssertions.expectValidEntity(result[0], ['id', 'userId', 'action', 'timestamp']);
        expect(['click', 'view', 'scroll', 'form_submit', 'navigation', 'other']).toContain(
          result[0].action
        );
      }
    });
  });
});