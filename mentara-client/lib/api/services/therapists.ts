import { AxiosInstance } from "axios";
import type {
  TherapistRecommendationQuery,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistRecommendation,
  WelcomeRecommendationQuery,
} from "@/types/api/therapist";
import { WorksheetDetailDTO } from "@/types";

/**
 * Therapist API service for recommendations, matching, and management
 * Backend has global /api prefix, so endpoints here should not include /api
 */
export function createTherapistService(axios: AxiosInstance) {
  return {
    /**
     * Get ALL approved therapists (no personalization, simple listing)
     * Best for: Main therapist page, browse all functionality
     */
    async getAllTherapists(params?: TherapistSearchParams) {
      const { data } = await axios.get("/therapists", { params });
      return data;
    },

    /**
     * Get personalized recommendations for welcome page
     */
    async getPersonalizedRecommendations(
      params?: WelcomeRecommendationQuery
    ): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations/welcome");
      return data;
    },

    /**
     * Get personalized therapist recommendations (algorithmic matching)
     * Best for: Recommendation sections, "For You" listings
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
     * Get welcome-specific recommendations with communities
     * Best for: Welcome page flow, first-time user experience
     */
    async getWelcomeRecommendations(
      params?: WelcomeRecommendationQuery
    ): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations/welcome", {
        params,
      });
      return data;
    },

    /**
     * Get detailed therapist profile by ID
     */
    async getTherapistProfile(therapistId: string) {
      const { data } = await axios.get(`/therapists/${therapistId}`);
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
     * Get therapist reviews
     */
    async getTherapistReviews(therapistId: string) {
      const { data } = await axios.get(`/therapists/${therapistId}/reviews`);
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
    async getProfile(therapistId: string) {
      const { data } = await axios.get(`/therapists/${therapistId}`);
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

    /**
     * Worksheets sub-service for therapists to manage worksheets
     */
    worksheets: {
      /**
       * Get list of worksheets for the authenticated therapist
       */
      async getList(params?: { status?: string; clientId?: string }) {
        const { data } = await axios.get("/therapist/worksheets", { params });
        return data;
      },

      /**
       * Get worksheet details by ID
       */
      async getById(worksheetId: string): Promise<WorksheetDetailDTO> {
        const { data } = await axios.get(
          `/therapist/worksheets/${worksheetId}`
        );
        return data;
      },

      /**
       * Edit/update worksheet content
       */
      async edit(
        worksheetId: string,
        updateData: {
          title?: string;
          instructions?: string;
          dueDate?: string;
          status?: string;
        }
      ) {
        const { data } = await axios.put(
          `/therapist/worksheets/${worksheetId}`,
          updateData
        );
        return data;
      },

      /**
       * Mark worksheet as reviewed/completed
       */
      async markAsReviewed(worksheetId: string, feedback?: string) {
        const { data } = await axios.post(
          `/therapist/worksheets/${worksheetId}/review`,
          {
            feedback,
          }
        );
        return data;
      },

      /**
       * Upload reference file for worksheet
       */
      async uploadReferenceFile(worksheetId: string, file: File) {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post(
          `/therapist/worksheets/${worksheetId}/reference-file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return data;
      },
    },
  };
}

export type TherapistService = ReturnType<typeof createTherapistService>;
