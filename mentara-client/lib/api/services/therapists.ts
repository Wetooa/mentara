import { AxiosInstance } from "axios";
import type {
  TherapistRecommendationQuery,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistRecommendation,
  WelcomeRecommendationQuery,
} from "@/types/api/therapist";

/**
 * Therapist API service for recommendations, matching, and management
 * All endpoints are prefixed with /api/ by the backend
 */
export function createTherapistService(axios: AxiosInstance) {
  return {
    /**
     * Get ALL approved therapists (no personalization, simple listing)
     * Best for: Main therapist page, browse all functionality
     */
    async getAllTherapists(params?: TherapistSearchParams) {
      const { data } = await axios.get("/api/therapists", { params });
      return data;
    },

    /**
     * Get personalized therapist recommendations (algorithmic matching)
     * Best for: Recommendation sections, "For You" listings
     */
    async getRecommendations(params?: TherapistRecommendationQuery): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/api/therapist-recommendations", { params });
      return data;
    },

    /**
     * Get welcome-specific recommendations with communities
     * Best for: Welcome page flow, first-time user experience
     */
    async getWelcomeRecommendations(params?: WelcomeRecommendationQuery): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/api/therapist-recommendations/welcome", { params });
      return data;
    },

    /**
     * Get detailed therapist profile by ID
     */
    async getTherapistProfile(therapistId: string) {
      const { data } = await axios.get(`/api/therapists/${therapistId}`);
      return data;
    },

    /**
     * Get compatibility analysis between client and therapist
     */
    async getCompatibilityAnalysis(therapistId: string) {
      const { data } = await axios.get(`/api/therapist-recommendations/compatibility/${therapistId}`);
      return data;
    },

    /**
     * Get therapist reviews
     */
    async getTherapistReviews(therapistId: string) {
      const { data } = await axios.get(`/api/therapists/${therapistId}/reviews`);
      return data;
    },

    /**
     * Create automatic matches with selected therapists
     */
    async createMatches(payload: { 
      therapistIds: string[] 
    }): Promise<{
      success: boolean;
      message: string;
      data?: {
        successfulMatches: number;
        failedMatches: number;
        details: Array<{
          therapistId: string;
          status: 'success' | 'failed';
          reason?: string;
        }>;
      };
    }> {
      const { data } = await axios.post("/api/therapist/matches", payload);
      return data;
    },

    /**
     * Book session with therapist
     */
    async bookSession(payload: {
      therapistId: string;
      startTime: string;
      duration: number;
      sessionType: 'video' | 'audio';
      notes?: string;
    }) {
      const { data } = await axios.post("/api/booking", payload);
      return data;
    },

    /**
     * Get user's therapist matches
     */
    async getMyMatches() {
      const { data } = await axios.get("/api/therapist/matches/me");
      return data;
    },

    /**
     * Patients sub-service for therapists to manage their assigned patients
     */
    patients: {
      /**
       * Get list of assigned patients for the authenticated therapist
       */
      async getList() {
        const { data } = await axios.get("/api/therapist/clients/assigned");
        return data;
      },

      /**
       * Get detailed patient information by ID
       */
      async getById(patientId: string) {
        const { data } = await axios.get(`/api/therapist/clients/${patientId}`);
        return data;
      },

      /**
       * Get patient's session history - uses general meetings API filtered by client
       */
      async getSessions(patientId: string) {
        const { data } = await axios.get(`/api/meetings`, { 
          params: { 
            clientId: patientId,
            limit: 50 
          } 
        });
        return data;
      },

      /**
       * Get patient's worksheets - uses therapist worksheets API filtered by client
       */
      async getWorksheets(patientId: string) {
        const { data } = await axios.get(`/api/therapist/worksheets`, { 
          params: { 
            clientId: patientId 
          } 
        });
        return data;
      },

      /**
       * Update session notes for a patient - uses meetings API
       */
      async updateNotes(patientId: string, sessionId: string, notes: string) {
        const { data } = await axios.post(`/api/meetings/${sessionId}/session`, { 
          notes,
          sessionData: { notes }
        });
        return data;
      },

      /**
       * Assign worksheet to a patient - uses specific client worksheet assignment endpoint
       */
      async assignWorksheet(patientId: string, worksheetData: any) {
        const { data } = await axios.post(`/api/therapist/clients/${patientId}/worksheets`, worksheetData);
        return data;
      },
    },
  };
}

export type TherapistService = ReturnType<typeof createTherapistService>;