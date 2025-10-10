import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "@/lib/api/services/auth";
import type { AuditLog } from "@/types/api/audit-logs";

export interface AdminAuthState {
  // Auth state
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Admin-specific state
  permissions: string[];
  isSuperAdmin: boolean;
  lastActivityAt: Date | null;
  
  // Dashboard data
  dashboardData: {
    userMetrics: {
      totalUsers: number;
      activeUsers: number;
      newSignups: number;
      userGrowth: number;
    };
    therapistMetrics: {
      totalTherapists: number;
      pendingApplications: number;
      approvedTherapists: number;
      rejectedApplications: number;
    };
    systemMetrics: {
      totalSessions: number;
      activeSessions: number;
      systemHealth: "healthy" | "warning" | "critical";
      uptime: string;
    };
    recentActivity: AuditLog[];
  } | null;
  
  // Actions
  setUser: (user: AdminUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (profile: Partial<AdminUser['profile']>) => void;
  setPermissions: (permissions: string[]) => void;
  setSuperAdmin: (isSuperAdmin: boolean) => void;
  updateLastActivity: () => void;
  setDashboardData: (data: AdminAuthState['dashboardData']) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isSuperAdmin: false,
      lastActivityAt: null,
      dashboardData: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          permissions: user?.permissions || [],
          isSuperAdmin: user?.isSuperAdmin || false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Store in localStorage for middleware access
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                ...profile,
              },
            },
          });
        }
      },

      setPermissions: (permissions) => {
        set({ permissions });
        
        // Update user object if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              permissions,
            },
          });
        }
      },

      setSuperAdmin: (isSuperAdmin) => {
        set({ isSuperAdmin });
        
        // Update user object if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              isSuperAdmin,
            },
          });
        }
      },

      updateLastActivity: () => {
        const now = new Date();
        set({ lastActivityAt: now });
      },

      setDashboardData: (dashboardData) => {
        set({ dashboardData });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
          isSuperAdmin: false,
          lastActivityAt: null,
          dashboardData: null,
        });
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      },
    }),
    {
      name: "mentara-admin-auth",
      partialize: (state) => ({
        // Only persist non-sensitive state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        isSuperAdmin: state.isSuperAdmin,
        lastActivityAt: state.lastActivityAt,
      }),
    }
  )
);