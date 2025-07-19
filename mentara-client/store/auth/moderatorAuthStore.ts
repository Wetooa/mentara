import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModeratorUser } from "@/lib/api/services/auth";
import type { AuditLog } from "@mentara-commons";

export interface ModeratorAuthState {
  // Auth state
  user: ModeratorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Moderator-specific state
  permissions: string[];
  assignedCommunities: string[];
  moderationLevel: "junior" | "senior" | "lead" | null;
  
  // Dashboard data
  dashboardData: {
    moderationQueue: {
      pendingReports: number;
      flaggedPosts: number;
      flaggedComments: number;
      escalatedIssues: number;
    };
    communityMetrics: {
      totalCommunities: number;
      activeCommunities: number;
      communityMembers: number;
      dailyPosts: number;
    };
    recentActions: AuditLog[];
    performanceMetrics: {
      resolvedReports: number;
      averageResolutionTime: string;
      userSatisfactionScore: number;
    };
  } | null;
  
  // Actions
  setUser: (user: ModeratorUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (profile: Partial<ModeratorUser['profile']>) => void;
  setPermissions: (permissions: string[]) => void;
  setAssignedCommunities: (communities: string[]) => void;
  setModerationLevel: (level: "junior" | "senior" | "lead") => void;
  setDashboardData: (data: ModeratorAuthState['dashboardData']) => void;
  logout: () => void;
}

export const useModeratorAuthStore = create<ModeratorAuthState>()(
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
      assignedCommunities: [],
      moderationLevel: null,
      dashboardData: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          permissions: user?.permissions || [],
          assignedCommunities: user?.assignedCommunities || [],
          moderationLevel: user?.moderationLevel || null,
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

      setAssignedCommunities: (assignedCommunities) => {
        set({ assignedCommunities });
        
        // Update user object if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              assignedCommunities,
            },
          });
        }
      },

      setModerationLevel: (moderationLevel) => {
        set({ moderationLevel });
        
        // Update user object if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              moderationLevel,
            },
          });
        }
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
          assignedCommunities: [],
          moderationLevel: null,
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
      name: "mentara-moderator-auth",
      partialize: (state) => ({
        // Only persist non-sensitive state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        assignedCommunities: state.assignedCommunities,
        moderationLevel: state.moderationLevel,
      }),
    }
  )
);