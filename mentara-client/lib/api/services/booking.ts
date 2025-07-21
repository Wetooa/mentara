import { AxiosInstance } from "axios";

/**
 * Booking API service for meeting management and therapist availability
 */
export function createBookingService(axios: AxiosInstance) {
  return {
    // Meeting Management
    meetings: {
      /**
       * Create a new meeting
       */
      async create(payload: {
        therapistId: string;
        startTime: string;
        duration: number;
        title?: string;
        description?: string;
        meetingType?: string;
      }) {
        const { data } = await axios.post("/booking/meetings", payload);
        return data;
      },

      /**
       * Get user's meetings
       */
      async getAll(params?: {
        limit?: number;
        offset?: number;
        status?: string;
      }) {
        const { data } = await axios.get("/booking/meetings", { params });
        return data;
      },

      /**
       * Get specific meeting by ID
       */
      async getById(meetingId: string) {
        const { data } = await axios.get(`/booking/meetings/${meetingId}`);
        return data;
      },

      /**
       * Update meeting
       */
      async update(meetingId: string, payload: {
        title?: string;
        description?: string;
        startTime?: string;
        duration?: number;
        meetingType?: string;
        status?: string;
      }) {
        const { data } = await axios.put(`/booking/meetings/${meetingId}`, payload);
        return data;
      },

      /**
       * Cancel meeting
       */
      async cancel(meetingId: string) {
        const { data } = await axios.delete(`/booking/meetings/${meetingId}/cancel`);
        return data;
      },

      /**
       * Get upcoming meetings
       */
      async getUpcoming(limit?: number) {
        const { data } = await axios.get("/meetings/upcoming", { 
          params: { limit } 
        });
        return data;
      },
    },

    // Availability Management
    availability: {
      /**
       * Get therapist availability (therapists only)
       */
      async getMyAvailability() {
        const { data } = await axios.get("/booking/availability");
        return data;
      },

      /**
       * Create availability slot (therapists only)
       */
      async create(payload: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        timezone?: string;
        notes?: string;
      }) {
        const { data } = await axios.post("/booking/availability", payload);
        return data;
      },

      /**
       * Update availability slot (therapists only)
       */
      async update(availabilityId: string, payload: {
        dayOfWeek?: string;
        startTime?: string;
        endTime?: string;
        timezone?: string;
        isAvailable?: boolean;
        notes?: string;
      }) {
        const { data } = await axios.put(`/booking/availability/${availabilityId}`, payload);
        return data;
      },

      /**
       * Delete availability slot (therapists only)
       */
      async delete(availabilityId: string) {
        const { data } = await axios.delete(`/booking/availability/${availabilityId}`);
        return data;
      },

      /**
       * Get available time slots for a therapist on a specific date
       */
      async getSlots(therapistId: string, date: string) {
        const { data } = await axios.get("/booking/slots", {
          params: { therapistId, date }
        });
        return data;
      },
    },

    // Duration Management
    durations: {
      /**
       * Get available meeting durations
       */
      async getAll() {
        const { data } = await axios.get("/booking/durations");
        return data;
      },
    },

    // Payment Integration
    payment: {
      /**
       * Process payment for a meeting
       */
      async processSessionPayment(payload: {
        meetingId: string;
        paymentMethodId: string;
        amount: number;
        currency?: string;
      }) {
        const { data } = await axios.post("/billing/session-payment", payload);
        return data;
      },

      /**
       * Get payment methods
       */
      async getPaymentMethods() {
        const { data } = await axios.get("/billing/payment-methods");
        return data;
      },

      /**
       * Add payment method
       */
      async addPaymentMethod(payload: {
        type: string;
        cardLast4?: string;
        cardBrand?: string;
        isDefault?: boolean;
      }) {
        const { data } = await axios.post("/billing/payment-methods", payload);
        return data;
      },
    },
  };
}

export type BookingService = ReturnType<typeof createBookingService>;