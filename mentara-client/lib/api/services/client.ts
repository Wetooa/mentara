import { AxiosInstance } from "axios";
import {
  OnboardingData,
  ClientProfile,
  ClientProgress,
  AssignedTherapist,
  AssessmentSubmission,
  AssessmentResults,
} from "@/types/api/client";

export interface ClientService {
  completeOnboarding: (
    data: OnboardingData
  ) => Promise<{ success: boolean; profile: ClientProfile }>;
  getProfile: () => Promise<ClientProfile>;
  updateProfile: (data: Partial<ClientProfile>) => Promise<ClientProfile>;
  getProgress: () => Promise<ClientProgress>;
  getAssignedTherapist: () => Promise<AssignedTherapist>;
  submitAssessment: (
    assessmentData: AssessmentSubmission
  ) => Promise<{ success: boolean; results: AssessmentResults }>;
  updatePreferences: (
    preferences: Partial<OnboardingData["preferences"]>
  ) => Promise<{ success: boolean }>;
  updateGoals: (
    goals: Partial<OnboardingData["goals"]>
  ) => Promise<{ success: boolean }>;
  markOnboardingComplete: () => Promise<{ success: boolean }>;
  requestTherapistChange: (
    reason: string
  ) => Promise<{ success: boolean; requestId: string }>;
}

export const createClientService = (client: AxiosInstance): ClientService => ({
  completeOnboarding: (data: OnboardingData) =>
    client.post("/client/onboarding/complete", data),

  getProfile: () => client.get("/client/profile"),

  updateProfile: (data: Partial<ClientProfile>) =>
    client.patch("/client/profile", data),

  getProgress: () => client.get("/client/progress"),

  getAssignedTherapist: () => client.get("/client/therapist"),

  submitAssessment: (assessmentData: AssessmentSubmission) =>
    client.post("/client/assessment/submit", assessmentData),

  updatePreferences: (preferences: Partial<OnboardingData["preferences"]>) =>
    client.patch("/client/preferences", { preferences }),

  updateGoals: (goals: Partial<OnboardingData["goals"]>) =>
    client.patch("/client/goals", { goals }),

  markOnboardingComplete: () =>
    client.post("/client/onboarding/complete-status"),

  requestTherapistChange: (reason: string) =>
    client.post("/client/therapist/change-request", { reason }),
});

export type { OnboardingData, ClientProfile, ClientProgress };
