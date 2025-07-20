import { AxiosInstance } from "axios";
import {
  LoginDto,
  LoginDtoSchema,
  RegisterUserDtoSchema,
  VerifyRegistrationOtpDto,
  VerifyRegistrationOtpDtoSchema,
  ResendRegistrationOtpDto,
  ResendRegistrationOtpDtoSchema,
  EmailResponse,
} from "mentara-commons";
import { ClientUser, ClientPreferences, AuthResponse } from "@/types/auth";
import { z } from "zod";

// Client-specific registration schema (extends base with client-specific fields)
export const ClientRegisterDtoSchema = RegisterUserDtoSchema.extend({
  dateOfBirth: z.string(),
  preAssessmentData: z.object({}).optional(), // Pre-assessment results
}).omit({ role: true }); // Remove role since it's always 'client' for this service

export const ClientAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.literal("client"),
    firstName: z.string(),
    lastName: z.string(),
    isOnboardingComplete: z.boolean(),
    profile: z.object({}).optional(),
  }),
});

export type ClientLoginDto = LoginDto;
export type ClientRegisterDto = z.infer<typeof ClientRegisterDtoSchema>;
export type ClientAuthResponse = AuthResponse<ClientUser>;

// ClientUser is now imported from @/types/auth

export const createClientAuthService = (client: AxiosInstance) => ({
  /**
   * Client login with email and password
   */
  login: async (credentials: ClientLoginDto): Promise<ClientAuthResponse> => {
    const validatedData = LoginDtoSchema.parse(credentials);
    return client.post("/auth/client/login", validatedData);
  },

  /**
   * Register a new client user (called from pre-assessment flow)
   */
  register: async (
    credentials: ClientRegisterDto
  ): Promise<ClientAuthResponse> => {
    const validatedData = ClientRegisterDtoSchema.parse(credentials);
    return client.post("/auth/client/register", validatedData);
  },

  /**
   * Get current client user data
   */
  getCurrentUser: (): Promise<ClientUser> => client.get("/auth/client/me"),

  /**
   * Refresh access token
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    return client.post("/auth/client/refresh", { refreshToken });
  },

  /**
   * Logout client
   */
  logout: (): Promise<{ success: boolean }> =>
    client.post("/auth/client/logout"),

  /**
   * Update client onboarding status
   */
  completeOnboarding: (): Promise<{ success: boolean }> =>
    client.post("/auth/client/complete-onboarding"),

  /**
   * Update client goals and preferences
   */
  updateProfile: (profile: {
    goals?: string[];
    preferences?: ClientPreferences;
  }): Promise<ClientUser> => client.put("/auth/client/profile", profile),

  /**
   * Get client onboarding status
   */
  getOnboardingStatus: (): Promise<{
    isComplete: boolean;
    completedSteps: string[];
    nextStep?: string;
  }> => client.get("/auth/client/onboarding-status"),

  /**
   * Reset password for client
   */
  resetPassword: (
    email: string
  ): Promise<{ success: boolean; message: string }> =>
    client.post("/auth/client/reset-password", { email }),

  /**
   * Change password for authenticated client
   */
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> =>
    client.post("/auth/client/change-password", data),

  /**
   * Verify registration OTP code
   */
  verifyOtp: async (data: VerifyRegistrationOtpDto): Promise<EmailResponse> => {
    const validatedData = VerifyRegistrationOtpDtoSchema.parse(data);
    return client.post("/auth/client/verify-otp", validatedData);
  },

  /**
   * Resend registration OTP code
   */
  resendOtp: async (data: ResendRegistrationOtpDto): Promise<EmailResponse> => {
    const validatedData = ResendRegistrationOtpDtoSchema.parse(data);
    return client.post("/auth/client/resend-otp", validatedData);
  },
});

export type ClientAuthService = ReturnType<typeof createClientAuthService>;
