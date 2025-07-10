import { AxiosInstance } from 'axios';
import { Meeting, MeetingSessionData } from '@/types/api/meetings';

export interface MeetingAnalytics {
  totalMeetings: number;
  totalDuration: number;
  averageDuration: number;
  meetingsByType: {
    video: number;
    audio: number;
    chat: number;
  };
  completionRate: number;
}

export interface MeetingRoomResponse {
  roomUrl: string;
  roomToken: string;
  meetingId: string;
  expires: string;
}

export interface MeetingStatusUpdate {
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface EmergencyTerminationRequest {
  reason: string;
}

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
    statusUpdate: MeetingStatusUpdate
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
  getUpcomingMeetings: async (limit?: number): Promise<Meeting[]> => {
    const params = limit ? { limit } : {};
    const { data } = await api.get('/meetings/upcoming', { params });
    return data;
  },

  /**
   * Save meeting session data (for analytics and quality tracking)
   */
  saveMeetingSession: async (
    meetingId: string,
    sessionData: Omit<MeetingSessionData, 'meetingId'>
  ): Promise<any> => {
    const { data } = await api.post(`/meetings/${meetingId}/session`, sessionData);
    return data;
  },

  /**
   * Get meeting analytics for therapists
   */
  getTherapistMeetingAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<MeetingAnalytics> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const { data } = await api.get('/meetings/analytics/therapist', { params });
    return data;
  },

  /**
   * Emergency terminate meeting
   */
  emergencyTerminateMeeting: async (
    meetingId: string,
    terminationData: EmergencyTerminationRequest
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
    } catch (error) {
      return false;
    }
  },

  /**
   * Helper methods for meeting status management
   */
  confirmMeeting: async (meetingId: string): Promise<Meeting> => {
    return await api.put(`/meetings/${meetingId}/status`, { 
      status: 'CONFIRMED' 
    }).then(({ data }) => data);
  },

  startMeeting: async (meetingId: string): Promise<Meeting> => {
    return await api.put(`/meetings/${meetingId}/status`, { 
      status: 'IN_PROGRESS' 
    }).then(({ data }) => data);
  },

  completeMeeting: async (meetingId: string): Promise<Meeting> => {
    return await api.put(`/meetings/${meetingId}/status`, { 
      status: 'COMPLETED' 
    }).then(({ data }) => data);
  },

  cancelMeeting: async (meetingId: string): Promise<Meeting> => {
    return await api.put(`/meetings/${meetingId}/status`, { 
      status: 'CANCELLED' 
    }).then(({ data }) => data);
  },
});