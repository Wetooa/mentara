import { AuthResponse } from "@/types/api/auth-extensions";
import { AxiosInstance } from "axios";
import {
  AdminAuthResponse,
  ClientAuthResponse,
  EmailResponse,
  LoginDto,
  RegisterAdminDto,
  RegisterClientDto,
  RegisterModeratorDto,
  RequestPasswordResetDto,
  ResendOtpDto,
  ResetPasswordDto,
  SuccessMessageResponse,
  TherapistAuthResponse,
  VerifyOtpDto
} from "./types";

/**
 * Unified Authentication Service
 * Single service file with all auth methods for all roles
 * Maps directly to backend controllers
 */
export function createAuthService(client: AxiosInstance) {
  return {
    // ================================
    // UNIVERSAL LOGIN
    // ================================
    /**
     * Universal login that works for all roles
     * POST /auth/login
     */
    async login(data: LoginDto): Promise<AuthResponse> {
      const response = await client.post("/auth/login", data);
      return response.data;
    },

    /**
     * Get current user role (secure)
     * GET /auth/user-role
     */
    async getUserRole(): Promise<{ role: string; userId: string }> {
      const response = await client.get("/auth/user-role");
      return response.data;
    },

    // ================================
    // PASSWORD RESET
    // ================================
    /**
     * Request password reset
     * POST /auth/request-password-reset
     */
    async requestPasswordReset(data: RequestPasswordResetDto): Promise<SuccessMessageResponse> {
      const response = await client.post("/auth/request-password-reset", data);
      return response.data;
    },

    /**
     * Reset password with token
     * POST /auth/reset-password
     */
    async resetPassword(data: ResetPasswordDto): Promise<SuccessMessageResponse> {
      const response = await client.post("/auth/reset-password", data);
      return response.data;
    },

    /**
     * Validate reset token
     * GET /auth/validate-reset-token?token={token}
     */
    async validateResetToken(token: string): Promise<{ valid: boolean; message: string }> {
      const response = await client.get(`/auth/validate-reset-token?token=${token}`);
      return response.data;
    },

    // ================================
    // CLIENT AUTH (/auth/client)
    // ================================
    client: {
      /**
       * Register a new client with optional preassessment data
       * POST /auth/client/register
       */
      async register(data: RegisterClientDto): Promise<ClientAuthResponse> {
        const response = await client.post("/auth/client/register", data);
        return response.data;
      },

      /**
       * Login client
       * POST /auth/client/login
       */
      async login(data: LoginDto): Promise<ClientAuthResponse> {
        const response = await client.post("/auth/client/login", data);
        return response.data;
      },

      /**
       * Get client profile
       * GET /auth/client/profile
       */
      async getProfile(): Promise<any> {
        const response = await client.get("/auth/client/profile");
        return response.data;
      },

      /**
       * Get first sign-in status
       * GET /auth/client/first-sign-in-status
       */
      async getFirstSignInStatus(): Promise<any> {
        const response = await client.get("/auth/client/first-sign-in-status");
        return response.data;
      },

      /**
       * Mark recommendations as seen
       * POST /auth/client/mark-recommendations-seen
       */
      async markRecommendationsSeen(): Promise<SuccessMessageResponse> {
        const response = await client.post(
          "/auth/client/mark-recommendations-seen"
        );
        return response.data;
      },

      /**
       * Verify OTP code
       * POST /auth/client/verify-otp
       */
      async verifyOtp(data: VerifyOtpDto): Promise<EmailResponse> {
        const response = await client.post("/auth/client/verify-otp", data);
        return response.data;
      },

      /**
       * Resend OTP code
       * POST /auth/client/resend-otp
       */
      async resendOtp(data: ResendOtpDto): Promise<EmailResponse> {
        const response = await client.post("/auth/client/resend-otp", data);
        return response.data;
      },
    },

    // ================================
    // ADMIN AUTH (/auth/admin)
    // ================================
    admin: {
      /**
       * Create admin account (admin-only)
       * POST /auth/admin/create-account
       */
      async createAccount(data: RegisterAdminDto): Promise<any> {
        const response = await client.post("/auth/admin/create-account", data);
        return response.data;
      },

      /**
       * Login admin - uses universal login endpoint
       * POST /auth/login
       */
      async login(data: LoginDto): Promise<AdminAuthResponse> {
        const response = await client.post("/auth/login", data);
        return response.data;
      },

      /**
       * Get admin profile
       * GET /auth/admin/profile
       */
      async getProfile(): Promise<any> {
        const response = await client.get("/auth/admin/profile");
        return response.data;
      },

      /**
       * Get admin permissions
       * GET /auth/admin/permissions
       */
      async getPermissions(): Promise<any> {
        const response = await client.get("/auth/admin/permissions");
        return response.data;
      },

      /**
       * Get admin dashboard stats
       * GET /auth/admin/dashboard-stats
       */
      async getDashboardStats(): Promise<any> {
        const response = await client.get("/auth/admin/dashboard-stats");
        return response.data;
      },
    },

    // ================================
    // MODERATOR AUTH (/auth/moderator)
    // ================================
    moderator: {
      /**
       * Create moderator account (admin-only)
       * POST /auth/moderator/create-account
       */
      async createAccount(data: RegisterModeratorDto): Promise<any> {
        const response = await client.post(
          "/auth/moderator/create-account",
          data
        );
        return response.data;
      },

      /**
       * Login moderator - uses universal login endpoint
       * POST /auth/login
       */
      async login(data: LoginDto): Promise<AuthResponse> {
        const response = await client.post("/auth/login", data);
        return response.data;
      },

      /**
       * Get moderator profile
       * GET /auth/moderator/profile
       */
      async getProfile(): Promise<any> {
        const response = await client.get("/auth/moderator/profile");
        return response.data;
      },

      /**
       * Get moderator permissions
       * GET /auth/moderator/permissions
       */
      async getPermissions(): Promise<any> {
        const response = await client.get("/auth/moderator/permissions");
        return response.data;
      },

      /**
       * Get assigned communities
       * GET /auth/moderator/assigned-communities
       */
      async getAssignedCommunities(): Promise<any> {
        const response = await client.get(
          "/auth/moderator/assigned-communities"
        );
        return response.data;
      },

      /**
       * Get moderator dashboard stats
       * GET /auth/moderator/dashboard-stats
       */
      async getDashboardStats(): Promise<any> {
        const response = await client.get("/auth/moderator/dashboard-stats");
        return response.data;
      },
    },

    // ================================
    // THERAPIST AUTH (/auth/therapist)
    // ================================
    therapist: {
      /**
       * Register therapist with documents (unified endpoint)
       * POST /auth/therapist/register
       * Accepts FormData with applicationDataJson, fileTypes, and files
       */
      async register(data: FormData): Promise<TherapistAuthResponse> {
        const response = await client.post("/auth/therapist/register", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response;
      },

      /**
       * Login therapist - uses universal login endpoint
       * POST /auth/login
       */
      async login(data: LoginDto): Promise<TherapistAuthResponse> {
        const response = await client.post("/auth/login", data);
        return response.data;
      },

      /**
       * Get therapist profile
       * GET /auth/therapist/profile
       */
      async getProfile(): Promise<any> {
        const response = await client.get("/auth/therapist/profile");
        return response.data;
      },

      /**
       * Get therapist applications
       * GET /auth/therapist/applications
       */
      async getApplications(): Promise<any> {
        const response = await client.get("/auth/therapist/applications");
        return response.data;
      },

      /**
       * Get specific application
       * GET /auth/therapist/applications/:id
       */
      async getApplication(id: string): Promise<any> {
        const response = await client.get(`/auth/therapist/applications/${id}`);
        return response.data;
      },

      /**
       * Update application status
       * PUT /auth/therapist/applications/:id/status
       */
      async updateApplicationStatus(id: string, data: any): Promise<any> {
        const response = await client.put(
          `/auth/therapist/applications/${id}/status`,
          data
        );
        return response.data;
      },

      /**
       * Get application files
       * GET /auth/therapist/applications/:id/files
       */
      async getApplicationFiles(id: string): Promise<any> {
        const response = await client.get(
          `/auth/therapist/applications/${id}/files`
        );
        return response.data;
      },
    },
  };
}

// Type for the auth service
export type AuthService = ReturnType<typeof createAuthService>;
