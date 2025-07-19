import { AxiosInstance } from "axios";
import { z } from "zod";
import {
  AdminUser,
  AdminActivity,
  AuditLogEntry,
  SecurityEvent,
  AuditLogQueryParams,
  AuthResponse,
} from "@/types/auth";

// Admin-specific DTOs and schemas
export const AdminLoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // Stricter password requirements for admin
});

export const AdminAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.literal("admin"),
    firstName: z.string(),
    lastName: z.string(),
    permissions: z.array(z.string()),
    lastLoginAt: z.string().optional(),
  }),
});

export type AdminLoginDto = z.infer<typeof AdminLoginDtoSchema>;
export type AdminAuthResponse = AuthResponse<AdminUser>;

// AdminUser is now imported from @/types/auth

export const createAdminAuthService = (client: AxiosInstance) => ({
  /**
   * Admin login with email and password
   */
  login: async (credentials: AdminLoginDto): Promise<AdminAuthResponse> => {
    const validatedData = AdminLoginDtoSchema.parse(credentials);
    return client.post("/auth/admin/login", validatedData);
  },

  /**
   * Get current admin user data
   */
  getCurrentUser: (): Promise<AdminUser> => client.get("/auth/admin/me"),

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return client.post("/auth/admin/refresh", { refreshToken });
  },

  /**
   * Logout admin
   */
  logout: (): Promise<{ success: boolean }> => client.post("/auth/admin/logout"),

  /**
   * Get admin dashboard data
   */
  getDashboardData: (): Promise<{
    systemStats: {
      totalUsers: number;
      totalTherapists: number;
      activeClients: number;
      pendingApplications: number;
    };
    recentActivity: AdminActivity[];
    systemHealth: {
      status: "healthy" | "warning" | "critical";
      uptime: string;
      issues: string[];
    };
  }> => client.get("/auth/admin/dashboard"),

  /**
   * Get admin permissions
   */
  getPermissions: (): Promise<{
    permissions: string[];
    roleDescription: string;
  }> => client.get("/auth/admin/permissions"),

  /**
   * Update admin profile
   */
  updateProfile: (profile: {
    firstName?: string;
    lastName?: string;
  }): Promise<AdminUser> => client.put("/auth/admin/profile", profile),

  /**
   * Change password for authenticated admin
   */
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> => client.post("/auth/admin/change-password", data),

  /**
   * Get system audit logs (admin only)
   */
  getAuditLogs: (params?: AuditLogQueryParams): Promise<{
    logs: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> => client.get("/auth/admin/audit-logs", { params }),

  /**
   * Create new admin user (super admin only)
   */
  createAdmin: (data: {
    email: string;
    firstName: string;
    lastName: string;
    permissions: string[];
  }): Promise<{ success: boolean; adminId: string }> => 
    client.post("/auth/admin/create", data),

  /**
   * Update admin permissions (super admin only)
   */
  updatePermissions: (adminId: string, permissions: string[]): Promise<{ success: boolean }> =>
    client.put(`/auth/admin/${adminId}/permissions`, { permissions }),

  /**
   * Deactivate admin account (super admin only)
   */
  deactivateAdmin: (adminId: string): Promise<{ success: boolean }> =>
    client.post(`/auth/admin/${adminId}/deactivate`),

  /**
   * Force logout all sessions (emergency action)
   */
  forceLogoutAllSessions: (): Promise<{ success: boolean }> =>
    client.post("/auth/admin/force-logout-all"),

  /**
   * Get platform security status
   */
  getSecurityStatus: (): Promise<{
    failedLoginAttempts: number;
    suspiciousActivity: SecurityEvent[];
    securityScore: number;
    recommendations: string[];
  }> => client.get("/auth/admin/security-status"),
});

export type AdminAuthService = ReturnType<typeof createAdminAuthService>;