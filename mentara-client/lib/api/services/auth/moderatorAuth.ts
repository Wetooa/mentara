import { AxiosInstance } from "axios";
import { z } from "zod";
import {
  ModeratorUser,
  CommunityInfo,
  ModerationAction,
  ModerationQueueItem,
  CommunityStatistics,
  ModerationGuideline,
  ModerationQueueQueryParams,
  AuthResponse,
} from "@/types/auth";

// Moderator-specific DTOs and schemas
export const ModeratorLoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ModeratorAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.literal("moderator"),
    firstName: z.string(),
    lastName: z.string(),
    moderationLevel: z.enum(["community", "content", "full"]),
    assignedCommunities: z.array(z.string()).optional(),
  }),
});

export type ModeratorLoginDto = z.infer<typeof ModeratorLoginDtoSchema>;
export type ModeratorAuthResponse = AuthResponse<ModeratorUser>;

// ModeratorUser is now imported from @/types/auth

export const createModeratorAuthService = (client: AxiosInstance) => ({
  /**
   * Moderator login with email and password
   */
  login: async (credentials: ModeratorLoginDto): Promise<ModeratorAuthResponse> => {
    const validatedData = ModeratorLoginDtoSchema.parse(credentials);
    return client.post("/auth/moderator/login", validatedData);
  },

  /**
   * Get current moderator user data
   */
  getCurrentUser: (): Promise<ModeratorUser> => client.get("/auth/moderator/me"),

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return client.post("/auth/moderator/refresh", { refreshToken });
  },

  /**
   * Logout moderator
   */
  logout: (): Promise<{ success: boolean }> => client.post("/auth/moderator/logout"),

  /**
   * Get moderator dashboard data
   */
  getDashboardData: (): Promise<{
    pendingReports: {
      total: number;
      highPriority: number;
      posts: number;
      comments: number;
    };
    todayActivity: {
      reviewedItems: number;
      actionseTaken: number;
    };
    assignedCommunities: CommunityInfo[];
    recentActions: ModerationAction[];
  }> => client.get("/auth/moderator/dashboard"),

  /**
   * Get moderation queue
   */
  getModerationQueue: (params?: ModerationQueueQueryParams): Promise<{
    items: ModerationQueueItem[];
    total: number;
    hasMore: boolean;
  }> => client.get("/auth/moderator/queue", { params }),

  /**
   * Take moderation action
   */
  takeModerationAction: (data: {
    itemId: string;
    itemType: "post" | "comment" | "user";
    action: "approve" | "reject" | "warn" | "suspend" | "ban";
    reason?: string;
    notes?: string;
  }): Promise<{ success: boolean }> => 
    client.post("/auth/moderator/action", data),

  /**
   * Get assigned communities
   */
  getAssignedCommunities: (): Promise<{
    communities: CommunityInfo[];
    permissions: Record<string, string[]>;
  }> => client.get("/auth/moderator/communities"),

  /**
   * Update moderator profile
   */
  updateProfile: (profile: {
    firstName?: string;
    lastName?: string;
  }): Promise<ModeratorUser> => client.put("/auth/moderator/profile", profile),

  /**
   * Change password for authenticated moderator
   */
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> => client.post("/auth/moderator/change-password", data),

  /**
   * Get moderation statistics
   */
  getModerationStats: (params?: {
    startDate?: string;
    endDate?: string;
    communityId?: string;
  }): Promise<{
    totalReviewed: number;
    approvalRate: number;
    averageResponseTime: number;
    actionBreakdown: Record<string, number>;
    communityStats: CommunityStatistics[];
  }> => client.get("/auth/moderator/stats", { params }),

  /**
   * Report content for escalation
   */
  escalateContent: (data: {
    itemId: string;
    itemType: "post" | "comment" | "user";
    reason: string;
    urgency: "low" | "medium" | "high" | "critical";
    notes?: string;
  }): Promise<{ success: boolean; escalationId: string }> =>
    client.post("/auth/moderator/escalate", data),

  /**
   * Get community guidelines
   */
  getCommunityGuidelines: (communityId?: string): Promise<{
    guidelines: ModerationGuideline[];
    lastUpdated: string;
    version: string;
  }> => client.get("/auth/moderator/guidelines", { 
    params: communityId ? { communityId } : undefined 
  }),

  /**
   * Add moderation note
   */
  addModerationNote: (data: {
    itemId: string;
    itemType: "post" | "comment" | "user";
    note: string;
    isInternal: boolean;
  }): Promise<{ success: boolean }> => 
    client.post("/auth/moderator/note", data),
});

export type ModeratorAuthService = ReturnType<typeof createModeratorAuthService>;