import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TherapistUser } from "@/lib/api/services/auth";
import type { Meeting } from "mentara-commons";

export interface TherapistAuthState {
  // Auth state
  user: TherapistUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Application state
  applicationStatus: "pending" | "approved" | "rejected" | "suspended" | null;
  verificationStatus: {
    documentsVerified: boolean;
    licenseVerified: boolean;
    backgroundCheckComplete: boolean;
    overallStatus: "verified" | "pending" | "rejected";
  } | null;
  
  // Profile state
  availability: Record<string, {
    isAvailable: boolean;
    startTime?: string;
    endTime?: string;
  }>;
  isAcceptingNewClients: boolean;
  
  // Dashboard data
  dashboardData: {
    upcomingAppointments: Meeting[];
    pendingRequests: number;
    todaySchedule: Meeting[];
    monthlyStats: Record<string, number>;
  } | null;
  
  // Actions
  setUser: (user: TherapistUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (profile: Partial<TherapistUser['profile']>) => void;
  setApplicationStatus: (status: "pending" | "approved" | "rejected" | "suspended") => void;
  setVerificationStatus: (status: TherapistAuthState['verificationStatus']) => void;
  updateAvailability: (availability: TherapistAuthState['availability']) => void;
  setAcceptingNewClients: (accepting: boolean) => void;
  setDashboardData: (data: TherapistAuthState['dashboardData']) => void;
  logout: () => void;
}

export const useTherapistAuthStore = create<TherapistAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      applicationStatus: null,
      verificationStatus: null,
      availability: {},
      isAcceptingNewClients: false,
      dashboardData: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          applicationStatus: user?.approvalStatus ?? null,
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

      setApplicationStatus: (applicationStatus) => {
        set({ applicationStatus });
        
        // Update user object if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              approvalStatus: applicationStatus,
              isApproved: applicationStatus === "approved",
            },
          });
        }
      },

      setVerificationStatus: (verificationStatus) => {
        set({ verificationStatus });
      },

      updateAvailability: (availability) => {
        set({ availability });
        
        // Update user profile
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                availability,
              },
            },
          });
        }
      },

      setAcceptingNewClients: (isAcceptingNewClients) => {
        set({ isAcceptingNewClients });
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
          applicationStatus: null,
          verificationStatus: null,
          availability: {},
          isAcceptingNewClients: false,
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
      name: "mentara-therapist-auth",
      partialize: (state) => ({
        // Only persist non-sensitive state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        applicationStatus: state.applicationStatus,
        availability: state.availability,
        isAcceptingNewClients: state.isAcceptingNewClients,
      }),
    }
  )
);