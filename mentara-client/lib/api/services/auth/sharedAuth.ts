import { AxiosInstance } from "axios";
import { z } from "zod";
import { RoleSpecificUser, TokenPair } from "@/types/auth";

// Shared authentication types and schemas
export const SharedRefreshTokenDtoSchema = z.object({
  refreshToken: z.string(),
});

export const PasswordResetDtoSchema = z.object({
  email: z.string().email(),
});

export const PasswordResetConfirmDtoSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export const EmailVerificationDtoSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6),
});

export type SharedRefreshTokenDto = z.infer<typeof SharedRefreshTokenDtoSchema>;
export type PasswordResetDto = z.infer<typeof PasswordResetDtoSchema>;
export type PasswordResetConfirmDto = z.infer<typeof PasswordResetConfirmDtoSchema>;
export type EmailVerificationDto = z.infer<typeof EmailVerificationDtoSchema>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  isVerified: boolean;
}

export const createSharedAuthService = (client: AxiosInstance) => ({
  /**
   * Send password reset email (works for all roles)
   */
  sendPasswordReset: async (data: PasswordResetDto): Promise<PasswordResetResponse> => {
    const validatedData = PasswordResetDtoSchema.parse(data);
    return client.post("/auth/request-password-reset", validatedData);
  },

  /**
   * Confirm password reset with token (works for all roles)
   */
  confirmPasswordReset: async (data: PasswordResetConfirmDto): Promise<{ success: boolean }> => {
    const validatedData = PasswordResetConfirmDtoSchema.parse(data);
    return client.post("/auth/reset-password", validatedData);
  },

  /**
   * Send email verification code
   */
  sendEmailVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    return client.post("/auth/send-verification-email", { email });
  },

  /**
   * Verify email with code
   */
  verifyEmail: async (data: EmailVerificationDto): Promise<EmailVerificationResponse> => {
    const validatedData = EmailVerificationDtoSchema.parse(data);
    return client.post("/auth/verify-email", validatedData);
  },

  /**
   * Resend email verification code
   */
  resendEmailVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    return client.post("/auth/resend-verification-email", { email });
  },

  /**
   * OAuth Google Authentication (initiate)
   */
  initiateGoogleOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,

  /**
   * OAuth Microsoft Authentication (initiate)
   */
  initiateMicrosoftOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`,

  /**
   * Handle OAuth callback (returns tokens)
   * NOTE: OAuth callback is handled by redirect flow. The backend OAuth endpoints
   * redirect to frontend with tokens in URL parameters.
   */
  handleOAuthCallback: async (params: {
    provider: "google" | "microsoft";
    code: string;
    state?: string;
    role?: "client" | "therapist" | "admin" | "moderator";
  }): Promise<TokenPair & { user: RoleSpecificUser }> => {
    // OAuth is handled by redirect flow, not direct API call
    // The backend processes OAuth and redirects to frontend with tokens
    return client.post("/auth/oauth/token-exchange", params);
  },

  /**
   * Validate token and get user info (works for all roles)
   */
  validateToken: async (token: string): Promise<{
    valid: boolean;
    user?: RoleSpecificUser;
    expires?: string;
  }> => {
    try {
      const response = await client.post("/auth/validate-token", {
        token,
      });
      
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        valid: false,
      };
    }
  },

  /**
   * Check if user exists by email (for registration checks)
   */
  checkUserExists: async (email: string): Promise<{
    exists: boolean;
    role?: string;
    isVerified?: boolean;
  }> => {
    const response = await client.get(`/auth/check-user?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  /**
   * Universal logout (clears all sessions for user)
   */
  universalLogout: async (userId: string): Promise<{ success: boolean }> => {
    const response = await client.post("/auth/universal-logout", { userId });
    return response.data;
  },

  /**
   * Get session info
   */
  getSessionInfo: async (): Promise<{
    sessionId: string;
    createdAt: string;
    lastActivity: string;
    device: string;
    location: string;
  }> => {
    const response = await client.get("/auth/session-info");
    return response.data;
  },

  /**
   * Terminate specific session
   */
  terminateSession: async (sessionId: string): Promise<{ success: boolean }> => {
    const response = await client.delete("/auth/terminate-session", {
      data: { sessionId }
    });
    return response.data;
  },

  /**
   * Get all active sessions for user
   */
  getActiveSessions: async (): Promise<{
    sessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActivity: string;
      isCurrent: boolean;
    }>;
  }> => {
    const response = await client.get("/auth/active-sessions");
    return response.data;
  },

  /**
   * Terminate all other sessions (keep current)
   */
  terminateOtherSessions: async (): Promise<{ success: boolean; terminatedCount: number }> => {
    const response = await client.post("/auth/terminate-other-sessions");
    return response.data;
  },
});

export type SharedAuthService = ReturnType<typeof createSharedAuthService>;