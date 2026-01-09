import { AxiosInstance } from "axios";
import { ClientProfile } from "@/types/api/client";
import { TherapistRecommendation } from "@/types/api/therapist";

/**
 * Client Service
 * Handles all client-specific operations
 * Maps directly to backend ClientController (/client endpoints)
 */
export function createClientService(client: AxiosInstance) {
  return {
    // ================================
    // PROFILE OPERATIONS
    // ================================
    /**
     * Get client profile
     * GET /client/profile
     */
    async getProfile(): Promise<ClientProfile> {
      const response = await client.get("/client/profile");
      return response.data;
    },

    /**
     * Update client profile
     * PUT /client/profile
     */
    async updateProfile(data: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      avatarUrl?: string;
      phoneNumber?: string;
      dateOfBirth?: Date | string;
      gender?: string;
      location?: string;
      emergencyContact?: string;
    }): Promise<ClientProfile> {
      const response = await client.put("/client/profile", data);
      return response.data;
    },

    // ================================
    // THERAPIST RECOMMENDATION OPERATIONS
    // ================================
    /**
     * Check if client needs therapist recommendations
     * GET /client/needs-therapist-recommendations
     */
    async needsTherapistRecommendations(): Promise<{
      needsTherapistRecommendations: boolean;
    }> {
      const response = await client.get(
        "/client/needs-therapist-recommendations"
      );
      return response.data;
    },

    /**
     * Mark therapist recommendations as seen
     * PUT /client/mark-therapist-recommendations-seen
     */
    async markTherapistRecommendationsSeen(): Promise<{ success: boolean }> {
      const response = await client.put(
        "/client/mark-therapist-recommendations-seen"
      );
      return response.data;
    },

    // ================================
    // THERAPIST ASSIGNMENT OPERATIONS
    // ================================
    /**
     * Get assigned therapist
     * GET /client/therapist
     */
    async getAssignedTherapist(): Promise<{
      therapist: TherapistRecommendation | null;
    }> {
      const response = await client.get("/client/therapist");
      return response.data;
    },

    /**
     * Assign a therapist to the client
     * POST /client/therapist
     */
    async assignTherapist(
      therapistId: string
    ): Promise<{ therapist: TherapistRecommendation }> {
      const response = await client.post("/client/therapist", { therapistId });
      return response.data;
    },

    /**
     * Remove assigned therapist
     * DELETE /client/therapist
     */
    async removeTherapist(): Promise<{ success: boolean }> {
      const response = await client.delete("/client/therapist");
      return response.data;
    },

    /**
     * Get all assigned therapists
     * GET /client/therapists
     */
    async getAssignedTherapists(): Promise<{
      therapists: TherapistRecommendation[];
    }> {
      const response = await client.get("/client/therapists");
      console.log("Assigned therapists response:", response.data);
      return response.data;
    },

    /**
     * Get pending therapist requests
     * GET /client/therapist/requests
     */
    async getPendingTherapistRequests(): Promise<{
      requests: TherapistRecommendation[];
    }> {
      const response = await client.get("/client/therapist/requests");
      console.log("Pending therapist requests response:", response.data);
      return response.data;
    },

    /**
     * Send a therapist connection request
     * POST /client/therapist/request
     */
    async requestTherapist(
      therapistId: string
    ): Promise<{ therapist: TherapistRecommendation }> {
      const response = await client.post("/client/therapist/request", {
        therapistId,
      });
      console.log("Therapist request response:", response.data);
      return response.data;
    },

    /**
     * Cancel a pending therapist connection request
     * DELETE /client/therapist/request/:therapistId
     */
    async cancelTherapistRequest(
      therapistId: string
    ): Promise<{ success: boolean }> {
      const response = await client.delete(`/client/therapist/request/${therapistId}`);
      console.log("Cancel therapist request response:", response.data);
      return response.data;
    },

    /**
     * Disconnect from a specific therapist
     * DELETE /client/therapist/:therapistId
     */
    async disconnectTherapist(
      therapistId: string
    ): Promise<{ success: boolean }> {
      const response = await client.delete(`/client/therapist/${therapistId}`);
      return response.data;
    },

    // ================================
    // PREFERENCES OPERATIONS
    // ================================
    /**
     * Create client preferences
     * POST /client/preferences
     */
    async createPreferences(data: {
      genderPreference?: string;
      agePreference?: string;
      languagePreferences?: string[];
      treatmentApproaches?: string[];
      sessionFormat?: string;
      sessionFrequency?: string;
      budgetRange?: string;
      locationPreference?: string;
      availabilityPreference?: string[];
      specialConsiderations?: string;
    }): Promise<{ preferences: any }> {
      const response = await client.post("/client/preferences", data);
      return response.data;
    },

    /**
     * Update client preferences
     * PUT /client/preferences
     */
    async updatePreferences(data: {
      genderPreference?: string;
      agePreference?: string;
      languagePreferences?: string[];
      treatmentApproaches?: string[];
      sessionFormat?: string;
      sessionFrequency?: string;
      budgetRange?: string;
      locationPreference?: string;
      availabilityPreference?: string[];
      specialConsiderations?: string;
    }): Promise<{ preferences: any }> {
      const response = await client.put("/client/preferences", data);
      return response.data;
    },

    /**
     * Get client preferences
     * GET /client/preferences
     */
    async getPreferences(): Promise<{ preferences: any | null }> {
      const response = await client.get("/client/preferences");
      return response.data;
    },

    /**
     * Complete onboarding (creates/updates preferences)
     * This is a convenience method that saves preferences from onboarding
     */
    async completeOnboarding(data: {
      profile?: any;
      goals?: any;
      preferences?: {
        genderPreference?: string;
        agePreference?: string;
        languagePreferences?: string[];
        treatmentApproaches?: string[];
        sessionFormat?: string;
        sessionFrequency?: string;
        budgetRange?: string;
        locationPreference?: string;
        availabilityPreference?: string[];
        specialConsiderations?: string;
      };
    }): Promise<{ success: boolean }> {
      // Save preferences if provided
      if (data.preferences) {
        try {
          await client.put("/client/preferences", data.preferences);
        } catch (error) {
          // If preferences don't exist, create them
          try {
            await client.post("/client/preferences", data.preferences);
          } catch (createError) {
            console.error("Failed to save preferences:", createError);
            throw createError;
          }
        }
      }
      return { success: true };
    },
  };
}

export type ClientService = ReturnType<typeof createClientService>;
