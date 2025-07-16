import { AxiosInstance } from "axios";
import {
  LoginDto,
  LoginDtoSchema,
  RegisterClientDto,
  RegisterClientDtoSchema,
  RegisterTherapistDto,
  RegisterTherapistDtoSchema,
  User,
  RefreshTokenDto,
  RefreshTokenDtoSchema,
  FirstSignInResponse,
  z
} from 'mentara-commons';

// Keep local types for features not yet in commons
import {
  AuthUser,
  AuthResponse,
  PreAssessmentSubmission,
  CommunityAssignmentResponse,
} from "@/types/api/auth-extensions";

// JWT Authentication Types (legacy - being migrated to commons)
interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'client' | 'therapist';
}

// AuthResponse is now imported from types/api/auth.ts

// Auth service factory
export const createAuthService = (client: AxiosInstance) => ({
  /**
   * Login with email and password (JWT) - Updated with Zod validation
   */
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const validatedData = LoginDtoSchema.parse(credentials);
    return client.post("/auth/login", validatedData);
  },

  /**
   * Register a new user with JWT (legacy method - being phased out)
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    // Note: This method will be removed once all forms use registerClient/registerTherapist
    return client.post(`/auth/register/${credentials.role || 'client'}`, credentials);
  },

  /**
   * Refresh access token with Zod validation
   */
  refreshToken: async (refreshData: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> => {
    const validatedData = RefreshTokenDtoSchema.parse(refreshData);
    return client.post("/auth/refresh", validatedData);
  },

  /**
   * Logout (invalidate tokens)
   */
  logout: (): Promise<{ success: boolean }> =>
    client.post("/auth/logout"),

  /**
   * Register a new client user - Updated with commons types and Zod validation
   */
  registerClient: async (credentials: RegisterClientDto): Promise<AuthResponse> => {
    const validatedData = RegisterClientDtoSchema.parse(credentials);
    return client.post("/auth/register/client", validatedData);
  },

  /**
   * Register a new therapist user - Updated with commons types and Zod validation
   */
  registerTherapist: async (credentials: RegisterTherapistDto): Promise<AuthResponse> => {
    const validatedData = RegisterTherapistDtoSchema.parse(credentials);
    return client.post("/auth/register/therapist", validatedData);
  },

  /**
   * Get current authenticated user data
   */
  getCurrentUser: (): Promise<AuthUser> => client.get("/auth/me"),

  /**
   * Check if this is user's first sign in
   */
  checkFirstSignIn: (): Promise<FirstSignInResponse> => client.get("/auth/first-signin"),

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
   * Submit pre-assessment data (create new assessment)
   */
  submitPreAssessment: (
    data: PreAssessmentSubmission
  ): Promise<{ success: boolean; message?: string }> =>
    client.post("/pre-assessment", data),

  /**
   * Assign communities to current user based on assessment results
   */
  assignCommunities: (): Promise<CommunityAssignmentResponse> =>
    client.post("/communities/assign/me"),

  /**
   * OAuth Google Authentication
   */
  initiateGoogleOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,

  /**
   * OAuth Microsoft Authentication
   */
  initiateMicrosoftOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`,
});

export type AuthService = ReturnType<typeof createAuthService>;
