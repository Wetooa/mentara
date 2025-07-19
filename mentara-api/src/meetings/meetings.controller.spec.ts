/**
 * Comprehensive Test Suite for MeetingsController
 * Tests meeting management, video room functionality, and session handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('MeetingsController', () => {
  let controller: MeetingsController;
  let meetingsService: MeetingsService;
  let module: TestingModule;

  // Mock MeetingsService
  const mockMeetingsService = {
    getMeetingById: jest.fn(),
    updateMeetingStatus: jest.fn(),
    createVideoRoom: jest.fn(),
    joinVideoRoom: jest.fn(),
    getVideoCallStatus: jest.fn(),
    endVideoCall: jest.fn(),
    getUpcomingMeetings: jest.fn(),
    saveMeetingSession: jest.fn(),
    getMeetingAnalytics: jest.fn(),
    emergencyTerminateMeeting: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockMeeting = {
    id: 'meeting_123456789',
    title: 'Therapy Session',
    description: 'Initial consultation session',
    startTime: new Date('2024-02-15T10:00:00Z'),
    endTime: new Date('2024-02-15T11:00:00Z'),
    status: 'scheduled',
    clientId: TEST_USER_IDS.CLIENT,
    therapistId: TEST_USER_IDS.THERAPIST,
    meetingType: 'video',
    duration: 60,
    isEmergency: false,
    notes: '',
    recordingEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVideoRoomResponse = {
    roomId: 'room_abc123456789',
    roomUrl: 'https://video.example.com/room/abc123456789',
    token: 'video_token_xyz987654321',
    meetingId: mockMeeting.id,
    participantId: 'participant_123',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    roomSettings: {
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
      enableScreenShare: true,
    },
  };

  const mockVideoCallStatus = {
    meetingId: mockMeeting.id,
    status: 'active',
    roomId: 'room_abc123456789',
    participants: [
      {
        userId: TEST_USER_IDS.CLIENT,
        name: 'Client User',
        role: 'client',
        joinedAt: new Date(),
        isAudioEnabled: true,
        isVideoEnabled: true,
      },
      {
        userId: TEST_USER_IDS.THERAPIST,
        name: 'Dr. Therapist',
        role: 'therapist',
        joinedAt: new Date(),
        isAudioEnabled: true,
        isVideoEnabled: true,
      },
    ],
    duration: 1800, // 30 minutes
    startedAt: new Date(Date.now() - 1800000),
  };

  const mockUpcomingMeetings = [
    mockMeeting,
    {
      ...mockMeeting,
      id: 'meeting_987654321',
      title: 'Follow-up Session',
      startTime: new Date('2024-02-16T14:00:00Z'),
      endTime: new Date('2024-02-16T15:00:00Z'),
    },
  ];

  const mockMeetingAnalytics = {
    totalMeetings: 25,
    completedMeetings: 23,
    cancelledMeetings: 2,
    averageDuration: 55.8,
    totalDuration: 1395,
    meetingsByType: {
      video: 20,
      audio: 3,
      inPerson: 2,
    },
    monthlyStats: [
      { month: '2024-01', count: 12, duration: 720 },
      { month: '2024-02', count: 13, duration: 675 },
    ],
    clientRetention: 92.5,
    averageRating: 4.8,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [
        {
          provide: MeetingsService,
          useValue: mockMeetingsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<MeetingsController>(MeetingsController);
    meetingsService = module.get<MeetingsService>(MeetingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have meetingsService injected', () => {
      expect(meetingsService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', MeetingsController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', MeetingsController);
      expect(controllerMetadata).toBe('meetings');
    });
  });

  describe('GET /meetings/:id', () => {
    const meetingId = 'meeting_123456789';

    it('should get meeting by id successfully', async () => {
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);

      const result = await controller.getMeeting(meetingId, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockMeeting);
      expect(meetingsService.getMeetingById).toHaveBeenCalledWith(meetingId, TEST_USER_IDS.CLIENT);
    });

    it('should handle meeting not found', async () => {
      const notFoundError = new NotFoundException('Meeting not found');
      mockMeetingsService.getMeetingById.mockRejectedValue(notFoundError);

      await expect(controller.getMeeting('non-existent-id', TEST_USER_IDS.CLIENT)).rejects.toThrow(notFoundError);
    });

    it('should handle access denied', async () => {
      const forbiddenError = new ForbiddenException('Access denied to meeting');
      mockMeetingsService.getMeetingById.mockRejectedValue(forbiddenError);

      await expect(controller.getMeeting(meetingId, 'unauthorized-user')).rejects.toThrow(forbiddenError);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockMeetingsService.getMeetingById.mockRejectedValue(serviceError);

      await expect(controller.getMeeting(meetingId, TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });
  });

  describe('PUT /meetings/:id/status', () => {
    const meetingId = 'meeting_123456789';
    const updateStatusDto = {
      status: 'in-progress' as const,
      notes: 'Meeting started on time',
    };

    it('should update meeting status successfully', async () => {
      const updatedMeeting = { ...mockMeeting, status: 'in-progress', notes: updateStatusDto.notes };
      mockMeetingsService.updateMeetingStatus.mockResolvedValue(updatedMeeting);

      const result = await controller.updateMeetingStatus(meetingId, TEST_USER_IDS.THERAPIST, updateStatusDto);

      expect(result).toEqual(updatedMeeting);
      expect(meetingsService.updateMeetingStatus).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        updateStatusDto,
      );
    });

    it('should handle all valid status transitions', async () => {
      const statusOptions = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
      
      for (const status of statusOptions) {
        const dto = { status, notes: `Status changed to ${status}` };
        const updatedMeeting = { ...mockMeeting, status };
        mockMeetingsService.updateMeetingStatus.mockResolvedValue(updatedMeeting);

        const result = await controller.updateMeetingStatus(meetingId, TEST_USER_IDS.THERAPIST, dto);

        expect(result.status).toBe(status);
      }
    });

    it('should handle meeting not found', async () => {
      const notFoundError = new NotFoundException('Meeting not found');
      mockMeetingsService.updateMeetingStatus.mockRejectedValue(notFoundError);

      await expect(
        controller.updateMeetingStatus(meetingId, TEST_USER_IDS.THERAPIST, updateStatusDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle unauthorized status update', async () => {
      const forbiddenError = new ForbiddenException('Only therapist can update meeting status');
      mockMeetingsService.updateMeetingStatus.mockRejectedValue(forbiddenError);

      await expect(
        controller.updateMeetingStatus(meetingId, TEST_USER_IDS.CLIENT, updateStatusDto)
      ).rejects.toThrow(forbiddenError);
    });

    it('should handle validation errors', async () => {
      const validationError = new BadRequestException('Invalid status value');
      mockMeetingsService.updateMeetingStatus.mockRejectedValue(validationError);

      await expect(
        controller.updateMeetingStatus(meetingId, TEST_USER_IDS.THERAPIST, { status: 'invalid-status' as any })
      ).rejects.toThrow(validationError);
    });
  });

  describe('POST /meetings/:id/video-room', () => {
    const meetingId = 'meeting_123456789';
    const createRoomDto = {
      meetingId,
      roomType: 'video' as const,
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
    };

    it('should create video room successfully', async () => {
      mockMeetingsService.createVideoRoom.mockResolvedValue(mockVideoRoomResponse);

      const result = await controller.createVideoRoom(meetingId, TEST_USER_IDS.THERAPIST, createRoomDto);

      expect(result).toEqual(mockVideoRoomResponse);
      expect(meetingsService.createVideoRoom).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        createRoomDto,
      );
    });

    it('should handle room creation with different settings', async () => {
      const customDto = {
        ...createRoomDto,
        maxParticipants: 4,
        enableRecording: true,
        enableChat: false,
      };
      const customResponse = {
        ...mockVideoRoomResponse,
        roomSettings: {
          maxParticipants: 4,
          enableRecording: true,
          enableChat: false,
          enableScreenShare: true,
        },
      };
      mockMeetingsService.createVideoRoom.mockResolvedValue(customResponse);

      const result = await controller.createVideoRoom(meetingId, TEST_USER_IDS.THERAPIST, customDto);

      expect(result.roomSettings.maxParticipants).toBe(4);
      expect(result.roomSettings.enableRecording).toBe(true);
      expect(result.roomSettings.enableChat).toBe(false);
    });

    it('should handle meeting not found', async () => {
      const notFoundError = new NotFoundException('Meeting not found');
      mockMeetingsService.createVideoRoom.mockRejectedValue(notFoundError);

      await expect(
        controller.createVideoRoom('non-existent-id', TEST_USER_IDS.THERAPIST, createRoomDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle video service unavailable', async () => {
      const serviceError = new Error('Video service temporarily unavailable');
      mockMeetingsService.createVideoRoom.mockRejectedValue(serviceError);

      await expect(
        controller.createVideoRoom(meetingId, TEST_USER_IDS.THERAPIST, createRoomDto)
      ).rejects.toThrow(serviceError);
    });

    it('should handle duplicate room creation', async () => {
      const duplicateError = new BadRequestException('Video room already exists for this meeting');
      mockMeetingsService.createVideoRoom.mockRejectedValue(duplicateError);

      await expect(
        controller.createVideoRoom(meetingId, TEST_USER_IDS.THERAPIST, createRoomDto)
      ).rejects.toThrow(duplicateError);
    });
  });

  describe('POST /meetings/:id/join-video', () => {
    const meetingId = 'meeting_123456789';
    const joinRoomDto = {
      roomId: 'room_abc123456789',
      participantName: 'Client User',
      audioEnabled: true,
      videoEnabled: true,
    };

    it('should join video room successfully', async () => {
      mockMeetingsService.joinVideoRoom.mockResolvedValue(mockVideoRoomResponse);

      const result = await controller.joinVideoRoom(meetingId, TEST_USER_IDS.CLIENT, joinRoomDto);

      expect(result).toEqual(mockVideoRoomResponse);
      expect(meetingsService.joinVideoRoom).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.CLIENT,
        joinRoomDto,
      );
    });

    it('should handle joining with different media settings', async () => {
      const audioOnlyDto = {
        ...joinRoomDto,
        audioEnabled: true,
        videoEnabled: false,
      };
      mockMeetingsService.joinVideoRoom.mockResolvedValue(mockVideoRoomResponse);

      const result = await controller.joinVideoRoom(meetingId, TEST_USER_IDS.CLIENT, audioOnlyDto);

      expect(result).toEqual(mockVideoRoomResponse);
      expect(meetingsService.joinVideoRoom).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.CLIENT,
        audioOnlyDto,
      );
    });

    it('should handle room not found', async () => {
      const notFoundError = new NotFoundException('Video room not found');
      mockMeetingsService.joinVideoRoom.mockRejectedValue(notFoundError);

      await expect(
        controller.joinVideoRoom(meetingId, TEST_USER_IDS.CLIENT, joinRoomDto)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle room capacity exceeded', async () => {
      const capacityError = new BadRequestException('Room capacity exceeded');
      mockMeetingsService.joinVideoRoom.mockRejectedValue(capacityError);

      await expect(
        controller.joinVideoRoom(meetingId, TEST_USER_IDS.CLIENT, joinRoomDto)
      ).rejects.toThrow(capacityError);
    });

    it('should handle participant already in room', async () => {
      const duplicateError = new BadRequestException('Participant already in room');
      mockMeetingsService.joinVideoRoom.mockRejectedValue(duplicateError);

      await expect(
        controller.joinVideoRoom(meetingId, TEST_USER_IDS.CLIENT, joinRoomDto)
      ).rejects.toThrow(duplicateError);
    });
  });

  describe('GET /meetings/:id/video-status', () => {
    const meetingId = 'meeting_123456789';

    it('should get video call status successfully', async () => {
      mockMeetingsService.getVideoCallStatus.mockResolvedValue(mockVideoCallStatus);

      const result = await controller.getVideoCallStatus(meetingId, TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockVideoCallStatus);
      expect(meetingsService.getVideoCallStatus).toHaveBeenCalledWith(meetingId, TEST_USER_IDS.CLIENT);
    });

    it('should handle video call not active', async () => {
      const inactiveStatus = {
        ...mockVideoCallStatus,
        status: 'ended',
        participants: [],
        duration: 3600,
      };
      mockMeetingsService.getVideoCallStatus.mockResolvedValue(inactiveStatus);

      const result = await controller.getVideoCallStatus(meetingId, TEST_USER_IDS.CLIENT);

      expect(result.status).toBe('ended');
      expect(result.participants).toHaveLength(0);
    });

    it('should handle meeting not found', async () => {
      const notFoundError = new NotFoundException('Meeting not found');
      mockMeetingsService.getVideoCallStatus.mockRejectedValue(notFoundError);

      await expect(
        controller.getVideoCallStatus('non-existent-id', TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle no video room for meeting', async () => {
      const noRoomError = new NotFoundException('No video room found for this meeting');
      mockMeetingsService.getVideoCallStatus.mockRejectedValue(noRoomError);

      await expect(
        controller.getVideoCallStatus(meetingId, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(noRoomError);
    });
  });

  describe('DELETE /meetings/:id/video-room', () => {
    const meetingId = 'meeting_123456789';
    const endCallDto = {
      reason: 'session-completed',
      duration: 3600,
      recordingUrl: 'https://recordings.example.com/session_123.mp4',
    };

    it('should end video call successfully', async () => {
      mockMeetingsService.endVideoCall.mockResolvedValue(undefined);

      await controller.endVideoCall(meetingId, TEST_USER_IDS.THERAPIST, endCallDto);

      expect(meetingsService.endVideoCall).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        endCallDto,
      );
    });

    it('should handle ending call with different reasons', async () => {
      const reasons = ['session-completed', 'technical-issues', 'emergency', 'participant-left'];
      mockMeetingsService.endVideoCall.mockResolvedValue(undefined);

      for (const reason of reasons) {
        const dto = { ...endCallDto, reason };
        
        await controller.endVideoCall(meetingId, TEST_USER_IDS.THERAPIST, dto);

        expect(meetingsService.endVideoCall).toHaveBeenCalledWith(
          meetingId,
          TEST_USER_IDS.THERAPIST,
          dto,
        );
      }
    });

    it('should handle video call not active', async () => {
      const notActiveError = new BadRequestException('Video call is not active');
      mockMeetingsService.endVideoCall.mockRejectedValue(notActiveError);

      await expect(
        controller.endVideoCall(meetingId, TEST_USER_IDS.THERAPIST, endCallDto)
      ).rejects.toThrow(notActiveError);
    });

    it('should handle unauthorized end call', async () => {
      const forbiddenError = new ForbiddenException('Only meeting participants can end the call');
      mockMeetingsService.endVideoCall.mockRejectedValue(forbiddenError);

      await expect(
        controller.endVideoCall(meetingId, 'unauthorized-user', endCallDto)
      ).rejects.toThrow(forbiddenError);
    });
  });

  describe('POST /meetings/:id/room (Legacy)', () => {
    const meetingId = 'meeting_123456789';

    it('should generate meeting room using legacy endpoint', async () => {
      mockMeetingsService.createVideoRoom.mockResolvedValue(mockVideoRoomResponse);

      const result = await controller.generateMeetingRoom(meetingId, TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockVideoRoomResponse);
      expect(meetingsService.createVideoRoom).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        {
          meetingId,
          roomType: 'video',
          maxParticipants: 2,
          enableRecording: false,
          enableChat: true,
        },
      );
    });

    it('should handle legacy endpoint errors', async () => {
      const serviceError = new Error('Video service unavailable');
      mockMeetingsService.createVideoRoom.mockRejectedValue(serviceError);

      await expect(
        controller.generateMeetingRoom(meetingId, TEST_USER_IDS.THERAPIST)
      ).rejects.toThrow(serviceError);
    });
  });

  describe('GET /meetings/upcoming', () => {
    it('should get upcoming meetings successfully', async () => {
      mockMeetingsService.getUpcomingMeetings.mockResolvedValue(mockUpcomingMeetings);

      const result = await controller.getUpcomingMeetings(TEST_USER_IDS.CLIENT);

      expect(result).toEqual(mockUpcomingMeetings);
      expect(meetingsService.getUpcomingMeetings).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, undefined);
    });

    it('should get upcoming meetings with limit', async () => {
      const limitedMeetings = [mockUpcomingMeetings[0]];
      mockMeetingsService.getUpcomingMeetings.mockResolvedValue(limitedMeetings);

      const result = await controller.getUpcomingMeetings(TEST_USER_IDS.CLIENT, 1);

      expect(result).toEqual(limitedMeetings);
      expect(result).toHaveLength(1);
      expect(meetingsService.getUpcomingMeetings).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, 1);
    });

    it('should handle no upcoming meetings', async () => {
      mockMeetingsService.getUpcomingMeetings.mockResolvedValue([]);

      const result = await controller.getUpcomingMeetings(TEST_USER_IDS.CLIENT);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database query failed');
      mockMeetingsService.getUpcomingMeetings.mockRejectedValue(serviceError);

      await expect(controller.getUpcomingMeetings(TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });
  });

  describe('POST /meetings/:id/session', () => {
    const meetingId = 'meeting_123456789';
    const sessionData = {
      duration: 3600,
      notes: 'Productive session with good progress',
      outcomes: ['anxiety-reduced', 'coping-strategies-discussed'],
      nextSteps: 'Continue with breathing exercises',
      clientMood: 'improved',
      therapistNotes: 'Client showed significant improvement',
    };

    it('should save meeting session successfully', async () => {
      const savedSession = {
        id: 'session_123456789',
        meetingId,
        ...sessionData,
        createdAt: new Date(),
      };
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);
      mockMeetingsService.saveMeetingSession.mockResolvedValue(savedSession);

      const result = await controller.saveMeetingSession(meetingId, TEST_USER_IDS.THERAPIST, sessionData);

      expect(result).toEqual(savedSession);
      expect(meetingsService.getMeetingById).toHaveBeenCalledWith(meetingId, TEST_USER_IDS.THERAPIST);
      expect(meetingsService.saveMeetingSession).toHaveBeenCalledWith(
        meetingId,
        TEST_USER_IDS.THERAPIST,
        sessionData,
      );
    });

    it('should validate meeting access before saving session', async () => {
      const forbiddenError = new ForbiddenException('Access denied to meeting');
      mockMeetingsService.getMeetingById.mockRejectedValue(forbiddenError);

      await expect(
        controller.saveMeetingSession(meetingId, 'unauthorized-user', sessionData)
      ).rejects.toThrow(forbiddenError);

      expect(meetingsService.saveMeetingSession).not.toHaveBeenCalled();
    });

    it('should handle session data validation errors', async () => {
      const validationError = new BadRequestException('Invalid session data');
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);
      mockMeetingsService.saveMeetingSession.mockRejectedValue(validationError);

      await expect(
        controller.saveMeetingSession(meetingId, TEST_USER_IDS.THERAPIST, { duration: -1 } as any)
      ).rejects.toThrow(validationError);
    });
  });

  describe('GET /meetings/analytics/therapist', () => {
    it('should get therapist meeting analytics successfully', async () => {
      mockMeetingsService.getMeetingAnalytics.mockResolvedValue(mockMeetingAnalytics);

      const result = await controller.getTherapistMeetingAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(mockMeetingAnalytics);
      expect(meetingsService.getMeetingAnalytics).toHaveBeenCalledWith(TEST_USER_IDS.THERAPIST, undefined);
    });

    it('should get analytics with date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const dateRangeAnalytics = {
        ...mockMeetingAnalytics,
        totalMeetings: 12,
        monthlyStats: [{ month: '2024-01', count: 12, duration: 720 }],
      };
      mockMeetingsService.getMeetingAnalytics.mockResolvedValue(dateRangeAnalytics);

      const result = await controller.getTherapistMeetingAnalytics(TEST_USER_IDS.THERAPIST, startDate, endDate);

      expect(result).toEqual(dateRangeAnalytics);
      expect(meetingsService.getMeetingAnalytics).toHaveBeenCalledWith(
        TEST_USER_IDS.THERAPIST,
        {
          start: new Date(startDate),
          end: new Date(endDate),
        },
      );
    });

    it('should handle invalid date format', async () => {
      await expect(
        controller.getTherapistMeetingAnalytics(TEST_USER_IDS.THERAPIST, 'invalid-date', '2024-01-31')
      ).rejects.toThrow();
    });

    it('should handle therapist with no meetings', async () => {
      const emptyAnalytics = {
        totalMeetings: 0,
        completedMeetings: 0,
        cancelledMeetings: 0,
        averageDuration: 0,
        totalDuration: 0,
        meetingsByType: { video: 0, audio: 0, inPerson: 0 },
        monthlyStats: [],
        clientRetention: 0,
        averageRating: 0,
      };
      mockMeetingsService.getMeetingAnalytics.mockResolvedValue(emptyAnalytics);

      const result = await controller.getTherapistMeetingAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result).toEqual(emptyAnalytics);
      expect(result.totalMeetings).toBe(0);
    });
  });

  describe('POST /meetings/:id/emergency-terminate', () => {
    const meetingId = 'meeting_123456789';
    const emergencyData = { reason: 'Medical emergency reported by client' };

    it('should emergency terminate meeting successfully', async () => {
      const terminationResult = {
        meetingId,
        terminatedAt: new Date(),
        reason: emergencyData.reason,
        terminatedBy: TEST_USER_IDS.THERAPIST,
        emergencyProtocolActivated: true,
      };
      mockMeetingsService.emergencyTerminateMeeting.mockResolvedValue(terminationResult);

      const result = await controller.emergencyTerminate(meetingId, TEST_USER_IDS.THERAPIST, emergencyData);

      expect(result).toEqual(terminationResult);
      expect(meetingsService.emergencyTerminateMeeting).toHaveBeenCalledWith(
        meetingId,
        emergencyData.reason,
        TEST_USER_IDS.THERAPIST,
      );
    });

    it('should handle different emergency reasons', async () => {
      const emergencyReasons = [
        'Medical emergency',
        'Safety concern',
        'Technical failure',
        'Inappropriate behavior',
        'System malfunction',
      ];

      for (const reason of emergencyReasons) {
        const data = { reason };
        const terminationResult = {
          meetingId,
          terminatedAt: new Date(),
          reason,
          terminatedBy: TEST_USER_IDS.THERAPIST,
          emergencyProtocolActivated: true,
        };
        mockMeetingsService.emergencyTerminateMeeting.mockResolvedValue(terminationResult);

        const result = await controller.emergencyTerminate(meetingId, TEST_USER_IDS.THERAPIST, data);

        expect(result.reason).toBe(reason);
      }
    });

    it('should handle meeting not found', async () => {
      const notFoundError = new NotFoundException('Meeting not found');
      mockMeetingsService.emergencyTerminateMeeting.mockRejectedValue(notFoundError);

      await expect(
        controller.emergencyTerminate('non-existent-id', TEST_USER_IDS.THERAPIST, emergencyData)
      ).rejects.toThrow(notFoundError);
    });

    it('should handle meeting already terminated', async () => {
      const alreadyTerminatedError = new BadRequestException('Meeting already terminated');
      mockMeetingsService.emergencyTerminateMeeting.mockRejectedValue(alreadyTerminatedError);

      await expect(
        controller.emergencyTerminate(meetingId, TEST_USER_IDS.THERAPIST, emergencyData)
      ).rejects.toThrow(alreadyTerminatedError);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockMeetingsService.getMeetingById.mockRejectedValue(serviceError);

      await expect(controller.getMeeting('meeting_123', TEST_USER_IDS.CLIENT)).rejects.toThrow(serviceError);
    });

    it('should handle video service integration errors', async () => {
      const videoServiceError = new Error('Video service API timeout');
      mockMeetingsService.createVideoRoom.mockRejectedValue(videoServiceError);

      await expect(
        controller.createVideoRoom('meeting_123', TEST_USER_IDS.THERAPIST, {
          meetingId: 'meeting_123',
          roomType: 'video',
          maxParticipants: 2,
          enableRecording: false,
          enableChat: true,
        })
      ).rejects.toThrow(videoServiceError);
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockMeetingsService.getUpcomingMeetings.mockRejectedValue(dbError);

      await expect(controller.getUpcomingMeetings(TEST_USER_IDS.CLIENT)).rejects.toThrow(dbError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted meeting response', async () => {
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);

      const result = await controller.getMeeting('meeting_123', TEST_USER_IDS.CLIENT);

      TestAssertions.expectValidEntity(result, ['id', 'title', 'startTime', 'endTime', 'status']);
      expect(result.id).toBe(mockMeeting.id);
      expect(typeof result.duration).toBe('number');
      expect(typeof result.isEmergency).toBe('boolean');
    });

    it('should return properly formatted video room response', async () => {
      mockMeetingsService.createVideoRoom.mockResolvedValue(mockVideoRoomResponse);

      const result = await controller.createVideoRoom('meeting_123', TEST_USER_IDS.THERAPIST, {
        meetingId: 'meeting_123',
        roomType: 'video',
        maxParticipants: 2,
        enableRecording: false,
        enableChat: true,
      });

      expect(result).toHaveProperty('roomId');
      expect(result).toHaveProperty('roomUrl');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('roomSettings');
      expect(typeof result.roomSettings.maxParticipants).toBe('number');
      expect(typeof result.roomSettings.enableRecording).toBe('boolean');
    });

    it('should return properly formatted analytics response', async () => {
      mockMeetingsService.getMeetingAnalytics.mockResolvedValue(mockMeetingAnalytics);

      const result = await controller.getTherapistMeetingAnalytics(TEST_USER_IDS.THERAPIST);

      expect(result).toHaveProperty('totalMeetings');
      expect(result).toHaveProperty('completedMeetings');
      expect(result).toHaveProperty('averageDuration');
      expect(result).toHaveProperty('meetingsByType');
      expect(Array.isArray(result.monthlyStats)).toBe(true);
      expect(typeof result.clientRetention).toBe('number');
      expect(typeof result.averageRating).toBe('number');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete meeting lifecycle', async () => {
      // Get meeting
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);
      const meeting = await controller.getMeeting('meeting_123', TEST_USER_IDS.THERAPIST);
      expect(meeting).toBeDefined();

      // Create video room
      mockMeetingsService.createVideoRoom.mockResolvedValue(mockVideoRoomResponse);
      const videoRoom = await controller.createVideoRoom('meeting_123', TEST_USER_IDS.THERAPIST, {
        meetingId: 'meeting_123',
        roomType: 'video',
        maxParticipants: 2,
        enableRecording: false,
        enableChat: true,
      });
      expect(videoRoom.roomId).toBeDefined();

      // Update status to in-progress
      mockMeetingsService.updateMeetingStatus.mockResolvedValue({ ...mockMeeting, status: 'in-progress' });
      const updatedMeeting = await controller.updateMeetingStatus('meeting_123', TEST_USER_IDS.THERAPIST, {
        status: 'in-progress',
      });
      expect(updatedMeeting.status).toBe('in-progress');

      // Save session data
      mockMeetingsService.getMeetingById.mockResolvedValue(mockMeeting);
      mockMeetingsService.saveMeetingSession.mockResolvedValue({
        id: 'session_123',
        meetingId: 'meeting_123',
        duration: 3600,
        notes: 'Session completed',
      });
      const session = await controller.saveMeetingSession('meeting_123', TEST_USER_IDS.THERAPIST, {
        duration: 3600,
        notes: 'Session completed',
      });
      expect(session.id).toBeDefined();
    });
  });
});