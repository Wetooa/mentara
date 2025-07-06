import { AxiosInstance } from 'axios';

// Types
export interface Meeting {
  id: string;
  therapistId: string;
  clientId: string;
  startTime: string;
  duration: number;
  title?: string;
  description?: string;
  meetingType: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateMeetingRequest {
  therapistId: string;
  startTime: string;
  duration: number;
  title?: string;
  description?: string;
  meetingType?: 'video' | 'phone' | 'in-person';
}

export interface UpdateMeetingRequest {
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  meetingUrl?: string;
  startTime?: string;
  duration?: number;
  title?: string;
  description?: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
}

export interface Duration {
  id: string;
  name: string;
  minutes: number;
  isActive: boolean;
}

export interface MeetingListParams {
  therapistId?: string;
  clientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  hasMore: boolean;
}

// Booking service factory
export const createBookingService = (client: AxiosInstance) => ({
  // Meeting management
  meetings: {
    // Create new meeting
    create: (data: CreateMeetingRequest): Promise<Meeting> =>
      client.post('/booking/meetings', data),

    // Get meetings list
    getList: (params: MeetingListParams = {}): Promise<MeetingListResponse> => {
      const searchParams = new URLSearchParams();
      
      if (params.therapistId) searchParams.append('therapistId', params.therapistId);
      if (params.clientId) searchParams.append('clientId', params.clientId);
      if (params.status) searchParams.append('status', params.status);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return client.get(`/booking/meetings${queryString}`);
    },

    // Get all meetings for current user
    getMy: (): Promise<Meeting[]> =>
      client.get('/booking/meetings'),

    // Get meeting by ID
    getById: (id: string): Promise<Meeting> =>
      client.get(`/booking/meetings/${id}`),

    // Update meeting
    update: (id: string, data: UpdateMeetingRequest): Promise<Meeting> =>
      client.put(`/booking/meetings/${id}`, data),

    // Cancel meeting
    cancel: (id: string): Promise<void> =>
      client.delete(`/booking/meetings/${id}/cancel`),

    // Complete meeting (add notes, mark as completed)
    complete: (id: string, notes?: string): Promise<Meeting> =>
      client.post(`/booking/meetings/${id}/complete`, { notes }),
  },

  // Availability management
  availability: {
    // Get available slots for a therapist on a specific date
    getSlots: (therapistId: string, date: string): Promise<AvailableSlot[]> => {
      const searchParams = new URLSearchParams();
      searchParams.append('therapistId', therapistId);
      searchParams.append('date', date);
      
      return client.get(`/booking/slots?${searchParams.toString()}`);
    },

    // Get available slots for multiple days
    getSlotsRange: (therapistId: string, startDate: string, endDate: string): Promise<Record<string, AvailableSlot[]>> => {
      const searchParams = new URLSearchParams();
      searchParams.append('therapistId', therapistId);
      searchParams.append('startDate', startDate);
      searchParams.append('endDate', endDate);
      
      return client.get(`/booking/slots/range?${searchParams.toString()}`);
    },
  },

  // Duration options
  durations: {
    // Get all available session durations
    getAll: (): Promise<Duration[]> =>
      client.get('/booking/durations'),

    // Get active durations only
    getActive: (): Promise<Duration[]> =>
      client.get('/booking/durations?active=true'),
  },
});

export type BookingService = ReturnType<typeof createBookingService>;