import { AxiosInstance } from "axios";

export interface Meeting {
  id: string;
  title?: string;
  description?: string;
  startTime: string;
  endTime?: string;
  dateTime: string; // Alias for startTime for consistency
  duration: number;
  status: "SCHEDULED" | "WAITING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  meetingType: string;
  type?: string; // Alias for meetingType for consistency
  meetingUrl?: string;
  clientId: string;
  therapistId: string;
  notes?: string; // Session notes
  feedback?: string; // Session feedback
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
    name?: string; // Computed from firstName + lastName
    specialization?: string;
    experience?: number;
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

export interface MeetingsResponse {
  meetings: Meeting[];
  total: number;
}

export interface MeetingsQueryOptions {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
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
    async getUpcomingMeetings(limit?: number): Promise<MeetingsResponse> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/upcoming", { params });
      return data;
    },

    /**
     * Get a specific meeting by ID
     * @param meetingId - The meeting ID
     */
    async getById(meetingId: string): Promise<Meeting> {
      const { data } = await axios.get(`/meetings/${meetingId}`);
      return data;
    },

    /**
     * Get a specific meeting by ID (alias for compatibility)
     * @param meetingId - The meeting ID
     */
    async getMeeting(meetingId: string): Promise<Meeting> {
      return this.getById(meetingId);
    },

    /**
     * Get a specific meeting by ID (alias for sessions hooks)
     * @param meetingId - The meeting ID
     */
    async getMeetingById(meetingId: string): Promise<Meeting> {
      return this.getById(meetingId);
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
     * End a meeting
     * @param meetingId - The meeting ID
     */
    async end(meetingId: string): Promise<Meeting> {
      const { data } = await axios.post(`/meetings/${meetingId}/end`);
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
    } = {}) {
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
    } = {}) {
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

    /**
     * End video room (alias for endVideoCall)
     * @param meetingId - The meeting ID
     * @param reason - Reason for ending the call
     */
    async endVideoRoom(meetingId: string, reason?: string) {
      return this.endVideoCall(meetingId, reason);
    },

    /**
     * Get completed meetings for the current user
     * @param limit - Maximum number of meetings to fetch
     */
    async getCompletedMeetings(limit?: number): Promise<Meeting[]> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/completed", { params });
      return data;
    },

    /**
     * Get cancelled meetings for the current user
     * @param limit - Maximum number of meetings to fetch
     */
    async getCancelledMeetings(limit?: number): Promise<Meeting[]> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/cancelled", { params });
      return data;
    },

    /**
     * Get in-progress meetings for the current user
     * @param limit - Maximum number of meetings to fetch
     */
    async getInProgressMeetings(limit?: number): Promise<Meeting[]> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/in-progress", { params });
      return data;
    },

    /**
     * Get all meetings with filtering options
     * @param options - Query options for filtering meetings
     */
    async getAllMeetings(options: MeetingsQueryOptions = {}): Promise<Meeting[]> {
      const params = {
        ...(options.status && { status: options.status }),
        ...(options.type && { type: options.type }),
        ...(options.limit && { limit: options.limit }),
        ...(options.offset && { offset: options.offset }),
        ...(options.dateFrom && { dateFrom: options.dateFrom }),
        ...(options.dateTo && { dateTo: options.dateTo }),
      };
      const { data } = await axios.get("/meetings", { params });
      return data;
    },

    /**
     * Get meetings by status (convenience method)
     * @param status - Meeting status to filter by
     * @param limit - Maximum number of meetings to fetch
     */
    async getMeetingsByStatus(status: Meeting["status"], limit?: number): Promise<Meeting[]> {
      return this.getAllMeetings({ status, limit });
    },

    /**
     * Get meetings within date range
     * @param dateFrom - Start date (ISO string)
     * @param dateTo - End date (ISO string)
     * @param limit - Maximum number of meetings to fetch
     */
    async getMeetingsInDateRange(dateFrom: string, dateTo: string, limit?: number): Promise<Meeting[]> {
      return this.getAllMeetings({ dateFrom, dateTo, limit });
    },

    /**
     * Get booking requests for therapist (SCHEDULED meetings awaiting approval)
     * @param limit - Maximum number of booking requests to fetch
     */
    async getBookingRequests(limit?: number): Promise<Meeting[]> {
      const params = limit ? { limit } : {};
      const { data } = await axios.get("/meetings/booking-requests", { params });
      return data;
    },

    /**
     * Accept a booking request
     * @param meetingId - The meeting ID to accept
     */
    async acceptBookingRequest(meetingId: string): Promise<Meeting> {
      const { data } = await axios.put(`/meetings/${meetingId}/accept`);
      return data;
    },

    /**
     * Deny a booking request
     * @param meetingId - The meeting ID to deny
     * @param reason - Optional reason for denial
     */
    async denyBookingRequest(meetingId: string, reason?: string): Promise<Meeting> {
      const { data } = await axios.put(`/meetings/${meetingId}/deny`, { reason });
      return data;
    },

    /**
     * Get therapist analytics data
     * @param startDate - Optional start date for analytics range
     * @param endDate - Optional end date for analytics range
     */
    async getTherapistAnalytics(startDate?: string, endDate?: string) {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const { data } = await axios.get("/dashboard/therapist/analytics", { params });
      return data;
    },

    /**
     * Accept a booking request (therapists only)
     * @param meetingId - The meeting ID to accept
     * @param meetingUrl - The URL or address for the meeting
     */
    async acceptMeetingRequest(meetingId: string, meetingUrl: string): Promise<Meeting> {
      const { data } = await axios.post(`/booking/meetings/${meetingId}/accept`, { meetingUrl });
      return data;
    },

    /**
     * Start a meeting (therapists only)
     * @param meetingId - The meeting ID to start
     */
    async startMeeting(meetingId: string): Promise<Meeting> {
      const { data } = await axios.post(`/booking/meetings/${meetingId}/start`);
      return data;
    },

    /**
     * Complete a meeting (therapists only)
     * @param meetingId - The meeting ID to complete
     * @param notes - Optional session notes
     */
    async completeMeeting(meetingId: string, notes?: string): Promise<Meeting> {
      const { data } = await axios.post(`/booking/meetings/${meetingId}/complete`, { notes });
      return data;
    },

    /**
     * Mark meeting as no-show (therapists only)
     * @param meetingId - The meeting ID to mark as no-show
     */
    async markNoShow(meetingId: string): Promise<Meeting> {
      const { data } = await axios.post(`/booking/meetings/${meetingId}/no-show`);
      return data;
    },

    /**
     * Save meeting notes (therapists only)
     * @param meetingId - The meeting ID
     * @param notes - Session notes content
     */
    async saveMeetingNotes(meetingId: string, notes: string): Promise<any> {
      const { data } = await axios.put(`/booking/meetings/${meetingId}/notes`, { notes });
      return data;
    },

    // Method aliases for MeetingDetailsSheet compatibility
    async start(meetingId: string): Promise<Meeting> {
      return this.startMeeting(meetingId);
    },

    async complete(meetingId: string, notes?: string): Promise<Meeting> {
      return this.completeMeeting(meetingId, notes);
    },

    async cancel(meetingId: string): Promise<Meeting> {
      const { data } = await axios.post(`/booking/meetings/${meetingId}/cancel`);
      return data;
    },

    async saveNotes(meetingId: string, notes: string): Promise<any> {
      return this.saveMeetingNotes(meetingId, notes);
    },
  };
}

export type MeetingsService = ReturnType<typeof createMeetingsService>;