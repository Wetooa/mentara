import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClientUser } from "@/lib/api/services/auth";
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "@/lib/constants/auth";

export interface ClientAuthState {
  // Auth state
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Onboarding state
  onboardingComplete: boolean;
  onboardingStep: string | null;
  selectedGoals: string[];
  preferences: Record<string, any>;
  
  // Actions
  setUser: (user: ClientUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (profile: Partial<ClientUser['profile']>) => void;
  updateOnboardingStep: (step: string) => void;
  setSelectedGoals: (goals: string[]) => void;
  setPreferences: (preferences: Record<string, any>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useClientAuthStore = create<ClientAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      onboardingComplete: false,
      onboardingStep: null,
      selectedGoals: [],
      preferences: {},

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          onboardingComplete: user?.isOnboardingComplete ?? false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Also store in localStorage for middleware access
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
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

      updateOnboardingStep: (onboardingStep) => set({ onboardingStep }),

      setSelectedGoals: (selectedGoals) => {
        set({ selectedGoals });
        // Also update user profile if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                goals: selectedGoals,
              },
            },
          });
        }
      },

      setPreferences: (preferences) => {
        set({ preferences });
        // Also update user profile if available
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile: {
                ...currentUser.profile,
                preferences,
              },
            },
          });
        }
      },

      completeOnboarding: () => {
        set({ 
          onboardingComplete: true, 
          onboardingStep: null 
        });
        
        // Update user object
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              isOnboardingComplete: true,
            },
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          accessToken: null,
          refreshToken: null,
          onboardingComplete: false,
          onboardingStep: null,
          selectedGoals: [],
          preferences: {},
        });
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      },
    }),
    {
      name: "mentara-client-auth",
      partialize: (state) => ({
        // Only persist essential auth state, not sensitive tokens
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete,
        onboardingStep: state.onboardingStep,
        selectedGoals: state.selectedGoals,
        preferences: state.preferences,
      }),
    }
  )
);