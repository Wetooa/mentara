import { AxiosInstance } from "axios";
import type {
  TherapistRecommendationQuery,
  TherapistRecommendationResponse,
  TherapistSearchParams,
  TherapistRecommendation,
  WelcomeRecommendationQuery,
} from "mentara-commons";

/**
 * Therapist API service for recommendations, matching, and management
 */
export function createTherapistService(axios: AxiosInstance) {
  return {
    /**
     * Get personalized therapist recommendations for welcome page
     */
    async getPersonalizedRecommendations(params?: WelcomeRecommendationQuery): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations/welcome");
      return data;
    },

    /**
     * Get standard therapist recommendations with filters
     */
    async getRecommendations(params?: TherapistRecommendationQuery): Promise<TherapistRecommendationResponse> {
      const { data } = await axios.get("/therapist-recommendations", { params });
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
      const { data } = await axios.post("/therapist/matches", payload);
      return data;
    },

    /**
     * Get compatibility analysis between client and therapist
     */
    async getCompatibilityAnalysis(therapistId: string) {
      const { data } = await axios.get(`/therapist-recommendations/compatibility/${therapistId}`);
      return data;
    },

    /**
     * Get list of therapists with filters
     */
    async getTherapistList(params?: TherapistSearchParams) {
      const { data } = await axios.get("/therapists", { params });
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
      sessionType: 'video' | 'audio';
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
  };
}

export type TherapistService = ReturnType<typeof createTherapistService>;