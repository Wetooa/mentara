import { AxiosInstance } from "axios";
import {
  AuthUser,
  RegisterUserRequest,
  PreAssessmentSubmission,
  FirstSignInResponse,
  CommunityAssignmentResponse,
} from "@/types/api/auth";

// Auth service factory
export const createAuthService = (client: AxiosInstance) => ({
  /**
   * Register a new client user with the backend
   */
  registerClient: (userData: RegisterUserRequest): Promise<AuthUser> =>
    client.post("/auth/register/client", userData),

  /**
   * Register a new therapist user with the backend
   */
  registerTherapist: (userData: RegisterUserRequest): Promise<AuthUser> =>
    client.post("/auth/register/therapist", userData),

  /**
   * Get current authenticated user data
   */
  getCurrentUser: (): Promise<AuthUser> => client.get("/auth/me"),

  /**
   * Get all users (admin only)
   */
  getAllUsers: (): Promise<AuthUser[]> => client.get("/auth/users"),

  /**
   * Force logout current user
   */
  forceLogout: (): Promise<{ success: boolean }> => 
    client.post("/auth/force-logout"),

  /**
   * Submit pre-assessment data
   */
  submitPreAssessment: (
    data: PreAssessmentSubmission
  ): Promise<{ success: boolean; message?: string }> =>
    client.post("/pre-assessment/submit", data),

  /**
   * Assign user to communities based on assessment results
   */
  assignCommunities: (): Promise<CommunityAssignmentResponse> =>
    client.post("/communities/assign-user"),
});;

export type AuthService = ReturnType<typeof createAuthService>;
