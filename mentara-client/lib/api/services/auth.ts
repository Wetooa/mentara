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
   * Register a new user with the backend
   */
  register: (userData: RegisterUserRequest): Promise<AuthUser> =>
    client.post("/auth/register", userData),

  /**
   * Get current authenticated user data
   */
  getCurrentUser: (): Promise<AuthUser> => client.get("/auth/me"),

  /**
   * Check if current user is signing in for the first time
   */
  checkFirstSignIn: (): Promise<FirstSignInResponse> =>
    client.get("/auth/is-first-signin"),

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

  /**
   * Check if user has admin privileges
   */
  checkAdmin: (): Promise<{ isAdmin: boolean }> => client.post("/auth/admin"),
});

export type AuthService = ReturnType<typeof createAuthService>;
