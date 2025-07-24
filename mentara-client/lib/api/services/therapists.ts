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
 */
export function createTherapistService(axios: AxiosInstance) {
  return {
    /**
     * Get personalized therapist recommendations for welcome page
     */
    async getPersonalizedRecommendations(
      params?: WelcomeRecommendationQuery
    ): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations/welcome");
      return data;
    },

    /**
     * Get standard therapist recommendations with filters
     */
    async getRecommendations(
      params?: TherapistRecommendationQuery
    ): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations", {
        params,
      });
      console.log("Therapist recommendations data:", data);
      return data;
    },

    /**
     * Create automatic matches with selected therapists
     */
    async createMatches(payload: { therapistIds: string[] }): Promise<{
      success: boolean;
      message: string;
      data?: {
        successfulMatches: number;
        failedMatches: number;
        details: Array<{
          therapistId: string;
          status: "success" | "failed";
          reason?: string;
        }>;
      };
    }> {
      const { data } = await axios.post("/therapist/matches", payload);
      return data;
    },

    /**
     * Get compatibility analysis between client and therapist
     */
    async getCompatibilityAnalysis(therapistId: string) {
      const { data } = await axios.get(
        `/therapist-recommendations/compatibility/${therapistId}`
      );
      return data;
    },

    /**
     * Get list of therapists with filters
     */
    async getTherapistList(params?: TherapistSearchParams) {
      const { data } = await axios.get("/therapists", { params });
      console.log("Therapist list data:", data);
      return data;
    },

    /**
     * Get detailed therapist profile
     */
    async getTherapistProfile(therapistId: string) {
      const { data } = await axios.get(`/therapists/${therapistId}`);
      return data;
    },

    /**
     * Get therapist reviews
     */
    async getTherapistReviews(therapistId: string) {
      const { data } = await axios.get(`/therapists/${therapistId}/reviews`);
      return data;
    },

    /**
     * Book session with therapist
     */
    async bookSession(payload: {
      therapistId: string;
      startTime: string;
      duration: number;
      sessionType: "video" | "audio";
      notes?: string;
    }) {
      const { data } = await axios.post("/booking", payload);
      return data;
    },

    /**
     * Get user's therapist matches
     */
    async getMyMatches() {
      const { data } = await axios.get("/therapist/matches/me");
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
        const { data } = await axios.get("/therapist/clients/assigned");
        return data;
      },

      /**
       * Get detailed patient information by ID
       */
      async getById(patientId: string) {
        const { data } = await axios.get(`/therapist/clients/${patientId}`);
        return data;
      },

      /**
       * Get patient's session history - uses general meetings API filtered by client
       */
      async getSessions(patientId: string) {
        const { data } = await axios.get(`/meetings`, {
          params: {
            clientId: patientId,
            limit: 50,
          },
        });
        return data;
      },

      /**
       * Get patient's worksheets - uses therapist worksheets API filtered by client
       */
      async getWorksheets(patientId: string) {
        const { data } = await axios.get(`/therapist/worksheets`, {
          params: {
            clientId: patientId,
          },
        });
        return data;
      },

      /**
       * Update session notes for a patient - uses meetings API
       */
      async updateNotes(patientId: string, sessionId: string, notes: string) {
        const { data } = await axios.post(`/meetings/${sessionId}/session`, {
          notes,
          sessionData: { notes },
        });
        return data;
      },

      /**
       * Assign worksheet to a patient - uses specific client worksheet assignment endpoint
       */
      async assignWorksheet(patientId: string, worksheetData: any) {
        const { data } = await axios.post(
          `/therapist/clients/${patientId}/worksheets`,
          worksheetData
        );
        return data;
      },
    },
  };
}

export type TherapistService = ReturnType<typeof createTherapistService>;
