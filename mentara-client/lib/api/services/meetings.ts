import { AxiosInstance } from "axios";

export interface Meeting {
  id: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  meetingType: string;
  meetingUrl?: string;
  clientId: string;
  therapistId: string;
  client?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
  therapist?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingMeetingsResponse {
  meetings: Meeting[];
  total: number;
}

/**
 * Meetings API service for managing therapy sessions
 */
export function createMeetingsService(axios: AxiosInstance) {
  return {
    /**
     * Get upcoming meetings for the current user
     * @param limit - Maximum number of meetings to fetch
     */
    async getUpcomingMeetings(limit?: number): Promise<UpcomingMeetingsResponse> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/upcoming", { params });
      return data;
    },

    /**
     * Get a specific meeting by ID
     * @param meetingId - The meeting ID
     */
    async getMeeting(meetingId: string): Promise<Meeting> {
      const { data } = await axios.get(`/meetings/${meetingId}`);
      return data;
    },

    /**
     * Update meeting status
     * @param meetingId - The meeting ID
     * @param status - New status for the meeting
     */
    async updateMeetingStatus(
      meetingId: string, 
      status: Meeting["status"]
    ): Promise<Meeting> {
      const { data } = await axios.put(`/meetings/${meetingId}/status`, { status });
      return data;
    },

    /**
     * Get video call status for a meeting
     * @param meetingId - The meeting ID
     */
    async getVideoCallStatus(meetingId: string) {
      const { data } = await axios.get(`/meetings/${meetingId}/video-status`);
      return data;
    },

    /**
     * Create a video room for a meeting
     * @param meetingId - The meeting ID
     * @param roomConfig - Configuration for the video room
     */
    async createVideoRoom(meetingId: string, roomConfig: {
      roomType?: string;
      maxParticipants?: number;
      enableRecording?: boolean;
      enableChat?: boolean;
    }) {
      const { data } = await axios.post(`/meetings/${meetingId}/video-room`, {
        meetingId,
        ...roomConfig,
      });
      return data;
    },

    /**
     * Join a video room for a meeting
     * @param meetingId - The meeting ID
     * @param joinConfig - Configuration for joining
     */
    async joinVideoRoom(meetingId: string, joinConfig: {
      displayName?: string;
      audioEnabled?: boolean;
      videoEnabled?: boolean;
    }) {
      const { data } = await axios.post(`/meetings/${meetingId}/join-video`, {
        meetingId,
        ...joinConfig,
      });
      return data;
    },

    /**
     * End a video call
     * @param meetingId - The meeting ID
     * @param reason - Reason for ending the call
     */
    async endVideoCall(meetingId: string, reason?: string) {
      await axios.delete(`/meetings/${meetingId}/video-room`, {
        data: { reason },
      });
    },
  };
}

export type MeetingsService = ReturnType<typeof createMeetingsService>;