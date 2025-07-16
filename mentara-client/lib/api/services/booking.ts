import { AxiosInstance } from 'axios';
import {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  AvailableSlot,
  Duration,
  MeetingListParams,
  MeetingListResponse,
  MeetingListParamsSchema,
  GetAvailableSlotsQueryDto,
  GetAvailableSlotsQueryDtoSchema,
  CreateMeetingRequestSchema,
  UpdateMeetingRequestSchema,
} from 'mentara-commons';

// Re-export commons types for backward compatibility
export type {
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  AvailableSlot,
  Duration,
  MeetingListParams,
  MeetingListResponse,
  GetAvailableSlotsQueryDto,
};

// Using types from mentara-commons for consistency

// Booking service factory
export const createBookingService = (client: AxiosInstance) => ({
  // Meeting management
  meetings: {
    // Create new meeting
    create: async (data: CreateMeetingRequest): Promise<Meeting> => {
      const validatedData = CreateMeetingRequestSchema.parse(data);
      return client.post('/booking/meetings', validatedData);
    },

    // Get meetings list with optional filters
    getList: async (params: MeetingListParams = {}): Promise<MeetingListResponse> => {
      const validatedParams = MeetingListParamsSchema.parse(params);
      return client.post('/booking/meetings/list', validatedParams);
    },

    // Get all meetings for current user
    getMy: (): Promise<Meeting[]> =>
      client.get('/booking/meetings'),

    // Get meeting by ID
    getById: (id: string): Promise<Meeting> =>
      client.get(`/booking/meetings/${id}`),

    // Update meeting
    update: async (id: string, data: UpdateMeetingRequest): Promise<Meeting> => {
      const validatedData = UpdateMeetingRequestSchema.parse(data);
      return client.put(`/booking/meetings/${id}`, validatedData);
    },

    // Cancel meeting
    cancel: (id: string): Promise<void> =>
      client.delete(`/booking/meetings/${id}/cancel`),
  },

  // Availability management (therapist only)
  availability: {
    // Get available slots for a therapist on a specific date
    getSlots: async (therapistId: string, date: string): Promise<AvailableSlot[]> => {
      const validatedParams = GetAvailableSlotsQueryDtoSchema.parse({ therapistId, date });
      return client.post('/booking/slots', validatedParams);
    },

    // Create availability slot (therapist only)
    create: (data: any): Promise<any> =>
      client.post('/booking/availability', data),

    // Get therapist's availability
    get: (): Promise<any[]> =>
      client.get('/booking/availability'),

    // Update availability slot
    update: (id: string, data: any): Promise<any> =>
      client.put(`/booking/availability/${id}`, data),

    // Delete availability slot
    delete: (id: string): Promise<void> =>
      client.delete(`/booking/availability/${id}`),
  },

  // Duration options
  durations: {
    // Get all available session durations
    getAll: (): Promise<Duration[]> =>
      client.get('/booking/durations'),
  },
});

export type BookingService = ReturnType<typeof createBookingService>;

export type BookingService = ReturnType<typeof createBookingService>;