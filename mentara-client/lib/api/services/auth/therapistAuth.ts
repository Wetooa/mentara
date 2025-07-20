import { AxiosInstance } from "axios";
import { z } from "zod";
import { LoginDto, LoginDtoSchema } from "mentara-commons";
import {
  TherapistUser,
  AvailabilitySchedule,
  Appointment,
  AuthResponse,
} from "@/types/auth";

export const TherapistAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.literal("therapist"),
    firstName: z.string(),
    lastName: z.string(),
    isApproved: z.boolean(),
    approvalStatus: z.enum(["pending", "approved", "rejected", "suspended"]),
    profile: z.object({}).optional(),
  }),
});

export type TherapistLoginDto = LoginDto;
export type TherapistAuthResponse = AuthResponse<TherapistUser>;

// TherapistUser is now imported from @/types/auth

export const createTherapistAuthService = (client: AxiosInstance) => ({
  /**
   * Therapist login with email and password
   */
  login: async (credentials: TherapistLoginDto): Promise<TherapistAuthResponse> => {
    const validatedData = LoginDtoSchema.parse(credentials);
    return client.post("/auth/therapist/login", validatedData);
  },

  /**
   * Get current therapist user data
   */
  getCurrentUser: (): Promise<TherapistUser> => client.get("/auth/therapist/me"),

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return client.post("/auth/therapist/refresh", { refreshToken });
  },

  /**
   * Logout therapist
   */
  logout: (): Promise<{ success: boolean }> => client.post("/auth/therapist/logout"),

  /**
   * Get therapist application status
   */
  getApplicationStatus: (): Promise<{
    status: "pending" | "approved" | "rejected" | "suspended";
    submittedAt?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    nextSteps?: string[];
  }> => client.get("/auth/therapist/application-status"),

  /**
   * Update therapist profile
   */
  updateProfile: (profile: {
    bio?: string;
    specializations?: string[];
    availability?: AvailabilitySchedule;
    hourlyRate?: number;
  }): Promise<TherapistUser> => client.put("/auth/therapist/profile", profile),

  /**
   * Get therapist dashboard data
   */
  getDashboardData: (): Promise<{
    upcomingAppointments: Appointment[];
    pendingRequests: number;
    todaySchedule: Appointment[];
    monthlyStats: Record<string, number>;
  }> => client.get("/auth/therapist/dashboard"),

  /**
   * Update therapist availability
   */
  updateAvailability: (availability: {
    schedule: AvailabilitySchedule;
    timeZone: string;
    isAcceptingNewClients: boolean;
  }): Promise<{ success: boolean }> => 
    client.put("/auth/therapist/availability", availability),

  /**
   * Reset password for therapist
   */
  resetPassword: (email: string): Promise<{ success: boolean; message: string }> =>
    client.post("/auth/therapist/reset-password", { email }),

  /**
   * Change password for authenticated therapist
   */
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> => client.post("/auth/therapist/change-password", data),

  /**
   * Upload professional documents
   */
  uploadDocuments: (files: FormData): Promise<{
    success: boolean;
    uploadedFiles: string[];
  }> => client.post("/auth/therapist/upload-documents", files, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  /**
   * Get therapist verification status
   */
  getVerificationStatus: (): Promise<{
    documentsVerified: boolean;
    licenseVerified: boolean;
    backgroundCheckComplete: boolean;
    overallStatus: "verified" | "pending" | "rejected";
  }> => client.get("/auth/therapist/verification-status"),
});

export type TherapistAuthService = ReturnType<typeof createTherapistAuthService>;