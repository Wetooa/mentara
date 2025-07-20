import { AxiosInstance } from 'axios';
import {
  UpdateMeetingStatusDto,
  GetUpcomingMeetingsQueryDto,
  SaveMeetingSessionDto,
  GetMeetingAnalyticsQueryDto,
  EmergencyTerminateMeetingDto,
  // Video call DTOs
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  VideoRoomResponse,
  VideoCallStatus,
  // Complex meeting data structures
  Meeting,
  MeetingAnalytics,
  MeetingRoomResponse,
  // Zod schemas for validation
  MeetingListParamsSchema,
} from 'mentara-commons';

// All meeting types are now imported from mentara-commons

// Re-export commons types for backward compatibility
export type {
  Meeting,
  MeetingAnalytics,
  MeetingRoomResponse,
  // Video call types
  CreateVideoRoomDto,
  JoinVideoRoomDto,
  EndVideoCallDto,
  VideoRoomResponse,
  VideoCallStatus,
};

export const createMeetingsService = (api: AxiosInstance) => ({
  /**
   * Get meeting details by ID
   */
  getMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.get(`/meetings/${meetingId}`);
    return data;
  },

  /**
   * Update meeting status
   */
  updateMeetingStatus: async (
    meetingId: string,
    statusUpdate: UpdateMeetingStatusDto
  ): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${meetingId}/status`, statusUpdate);
    return data;
  },

  /**
   * Generate meeting room URL and token
   */
  generateMeetingRoom: async (meetingId: string): Promise<MeetingRoomResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/room`);
    return data;
  },

  /**
   * Get upcoming meetings for current user
   */
  getUpcomingMeetings: async (query?: GetUpcomingMeetingsQueryDto): Promise<Meeting[]> => {
    const params = query || {};
    const validatedParams = MeetingListParamsSchema.parse(params);
    const { data } = await api.get('/meetings/upcoming', { params: validatedParams });
    return data;
  },

  /**
   * Save meeting session data (for analytics and quality tracking)
   */
  saveMeetingSession: async (
    meetingId: string,
    sessionData: SaveMeetingSessionDto
  ): Promise<{ success: boolean; sessionId: string; message?: string }> => {
    const { data } = await api.post(`/meetings/${meetingId}/session`, sessionData);
    return data;
  },

  /**
   * Get meeting analytics for therapists
   */
  getTherapistMeetingAnalytics: async (
    query?: GetMeetingAnalyticsQueryDto
  ): Promise<MeetingAnalytics> => {
    const params = query || {};
    const { data } = await api.get('/meetings/analytics/therapist', { params });
    return data;
  },

  /**
   * Emergency terminate meeting
   */
  emergencyTerminateMeeting: async (
    meetingId: string,
    terminationData: EmergencyTerminateMeetingDto
  ): Promise<Meeting> => {
    const { data } = await api.post(`/meetings/${meetingId}/emergency-terminate`, terminationData);
    return data;
  },

  /**
   * Validate meeting access (used internally by WebSocket)
   */
  validateMeetingAccess: async (meetingId: string): Promise<boolean> => {
    try {
      await api.get(`/meetings/${meetingId}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Helper methods for meeting status management
   */
  confirmMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${meetingId}/status`, { 
      status: 'confirmed' 
    });
    return data;
  },

  startMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${meetingId}/status`, { 
      status: 'in_progress' 
    });
    return data;
  },

  completeMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${meetingId}/status`, { 
      status: 'completed' 
    });
    return data;
  },

  cancelMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data } = await api.put(`/meetings/${meetingId}/status`, { 
      status: 'cancelled' 
    });
    return data;
  },

  // ===== VIDEO CALL METHODS =====

  /**
   * Create a video room for a meeting
   */
  createVideoRoom: async (
    meetingId: string,
    createRoomData: CreateVideoRoomDto
  ): Promise<VideoRoomResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/video-room`, createRoomData);
    return data;
  },

  /**
   * Join an existing video room
   */
  joinVideoRoom: async (
    meetingId: string,
    joinRoomData: JoinVideoRoomDto
  ): Promise<VideoRoomResponse> => {
    const { data } = await api.post(`/meetings/${meetingId}/join-video`, joinRoomData);
    return data;
  },

  /**
   * Get video call status
   */
  getVideoCallStatus: async (meetingId: string): Promise<VideoCallStatus> => {
    const { data } = await api.get(`/meetings/${meetingId}/video-status`);
    return data;
  },

  /**
   * End video call
   */
  endVideoCall: async (
    meetingId: string,
    endCallData: EndVideoCallDto
  ): Promise<void> => {
    await api.delete(`/meetings/${meetingId}/video-room`, { data: endCallData });
  },

  /**
   * Helper method to create a basic video room with default settings
   */
  createBasicVideoRoom: async (meetingId: string): Promise<VideoRoomResponse> => {
    const defaultCreateDto: CreateVideoRoomDto = {
      meetingId,
      roomType: 'video',
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
    };
    return api.post(`/meetings/${meetingId}/video-room`, defaultCreateDto).then(res => res.data);
  },

  /**
   * Helper method to join as a client
   */
  joinAsClient: async (meetingId: string): Promise<VideoRoomResponse> => {
    const joinDto: JoinVideoRoomDto = {
      role: 'client',
      enableVideo: true,
      enableAudio: true,
    };
    return api.post(`/meetings/${meetingId}/join-video`, joinDto).then(res => res.data);
  },

  /**
   * Helper method to join as a therapist
   */
  joinAsTherapist: async (meetingId: string): Promise<VideoRoomResponse> => {
    const joinDto: JoinVideoRoomDto = {
      role: 'therapist',
      enableVideo: true,
      enableAudio: true,
    };
    return api.post(`/meetings/${meetingId}/join-video`, joinDto).then(res => res.data);
  },

  /**
   * Helper method to end call with session summary
   */
  endCallWithSummary: async (
    meetingId: string,
    duration: number,
    nextSteps?: string[]
  ): Promise<void> => {
    const endCallDto: EndVideoCallDto = {
      endReason: 'session_completed',
      sessionSummary: {
        duration,
        connectionQuality: 'good',
        technicalIssues: [],
      },
      nextSteps,
    };
    await api.delete(`/meetings/${meetingId}/video-room`, { data: endCallDto });
  },
});

export type MeetingsService = ReturnType<typeof createMeetingsService>;