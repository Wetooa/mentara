import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { usePreAssessmentStore } from "@/store/pre-assessment";
import { useAuth as useJWTAuth } from "@/contexts/AuthContext";
import { LoginDto, RegisterClientDto, RegisterTherapistDto } from "mentara-commons";
import type {
  AuthUser,
  PreAssessmentSubmission,
} from "@/types/api";
import { MentaraApiError } from "@/lib/api/errorHandler";

/**
 * Central authentication hook following clean architecture:
 * UI → Hook → API Service → Backend
 * 
 * Responsibilities:
 * - Handle localStorage token management
 * - Manage authentication state
 * - Provide authentication methods
 * - Handle user data fetching
 * - Manage redirects based on user role
 * - Integration with React Query for server state
 */
export function useAuth() {
  const auth = useJWTAuth();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getAssessmentData, clearAssessmentData } = usePreAssessmentStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // This should be handled by AuthContext initialization
      // but we can add additional logic here if needed
    };
    initializeAuth();
  }, []);

  // Get current user data from backend using API service
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => api.auth.getCurrentUser(),
    enabled: !!auth.accessToken && auth.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error instanceof MentaraApiError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Check if user is signing in for the first time
  const { data: firstSignInData, isLoading: firstSignInLoading } = useQuery({
    queryKey: queryKeys.auth.isFirstSignIn(),
    queryFn: () => api.auth.checkFirstSignIn(),
    enabled: !!auth.accessToken && auth.isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Registration mutation for clients
  const registerClientMutation = useMutation({
    mutationFn: (userData: RegisterClientDto) => api.auth.registerClient(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Registration successful!");
      
      // Set tokens if returned
      if (data.accessToken && data.refreshToken) {
        auth.setTokens(data.accessToken, data.refreshToken);
      }
    },
    onError: (error: MentaraApiError) => {
      const errorMessage = error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Registration mutation for therapists
  const registerTherapistMutation = useMutation({
    mutationFn: (userData: RegisterTherapistDto) => api.auth.registerTherapist(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Therapist registration successful!");
      
      // Set tokens if returned
      if (data.accessToken && data.refreshToken) {
        auth.setTokens(data.accessToken, data.refreshToken);
      }
    },
    onError: (error: MentaraApiError) => {
      const errorMessage = error.message || "Therapist registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Pre-assessment submission mutation
  const submitPreAssessmentMutation = useMutation({
    mutationFn: (data: PreAssessmentSubmission) =>
      api.auth.submitPreAssessment(data),
    onError: (error: MentaraApiError) => {
      toast.error("Failed to submit assessment. Please try again.");
    },
  });

  // Community assignment mutation
  const assignCommunitiesMutation = useMutation({
    mutationFn: () => api.auth.assignCommunities(),
    onError: (error: MentaraApiError) => {
      toast.error("Failed to assign communities. Please try again.");
    },
  });

  // Sign in with email (Updated to use commons LoginDto)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      
      // Create LoginDto object
      const loginData: LoginDto = { email, password };
      await auth.login(loginData);
      toast.success("Signed in successfully!");
      
      // Get the user's role and redirect appropriately
      const userData = await api.auth.getCurrentUser();
      const userRole = userData?.role || 'client';
      
      switch (userRole) {
        case 'client':
          router.push("/user/dashboard");
          break;
        case 'therapist':
          router.push("/therapist/dashboard");
          break;
        case 'moderator':
          router.push("/moderator/dashboard");
          break;
        case 'admin':
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/user/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error instanceof MentaraApiError 
        ? error.message 
        : "Failed to sign in. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign in with OAuth (FIXED - functional implementation)
  const signInWithOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft"
  ) => {
    try {
      setIsAuthenticating(true);
      const oauthUrl = strategy === "oauth_google" 
        ? api.auth.initiateGoogleOAuth()
        : api.auth.initiateMicrosoftOAuth();
      window.location.href = oauthUrl;
    } catch (error) {
      toast.error("Failed to start OAuth sign-in");
      setIsAuthenticating(false);
    }
  };

  /**
   * Sign up with email for clients
   */
  const signUpClientWithEmail = async (
    registrationData: RegisterClientDto,
    options?: {
      preAssessmentAnswers?: any[];
      source?: string;
      sendEmailVerification?: boolean;
    }
  ) => {
    try {
      setIsAuthenticating(true);

      const result = await registerClientMutation.mutateAsync(registrationData);
      
      // Handle pre-assessment if available
      await handlePostRegistrationFlow(options);

      router.push("/user/onboarding/profile");
    } catch (error: any) {
      // Error handling is done in the mutation
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Sign up with email for therapists
   */
  const signUpTherapistWithEmail = async (
    registrationData: RegisterTherapistDto,
    options?: {
      redirectPath?: string;
    }
  ) => {
    try {
      setIsAuthenticating(true);

      const result = await registerTherapistMutation.mutateAsync(registrationData);
      
      const redirectPath = options?.redirectPath || "/therapist/onboarding/profile";
      router.push(redirectPath);
    } catch (error: any) {
      // Error handling is done in the mutation
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign up with OAuth (FIXED - functional implementation)
  const signUpWithOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft",
    options?: { hasPreAssessmentData?: boolean; redirectPath?: string }
  ) => {
    try {
      setIsAuthenticating(true);
      
      // Store pre-assessment data if provided
      if (options?.hasPreAssessmentData) {
        const assessmentData = getAssessmentData();
        if (assessmentData?.answers) {
          localStorage.setItem("pendingAssessmentData", JSON.stringify(assessmentData));
        }
      }
      
      const oauthUrl = strategy === "oauth_google" 
        ? api.auth.initiateGoogleOAuth()
        : api.auth.initiateMicrosoftOAuth();
      window.location.href = oauthUrl;
    } catch (error) {
      toast.error("Failed to start OAuth sign-up");
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setIsAuthenticating(true);
      await auth.logout();
      // Clear React Query cache
      queryClient.clear();
      toast.success("Signed out successfully");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error("Failed to sign out");
    } finally {
      setIsAuthenticating(false);
    }
  };

  /**
   * Get authentication token
   */
  const getToken = async (): Promise<string | null> => {
    return auth.accessToken;
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return auth.isAuthenticated && !!auth.accessToken;
  };

  // Private helper methods
  
  /**
   * Redirect user based on their role
   */
  const redirectUserByRole = (userRole: string) => {
    switch (userRole) {
      case 'client':
        router.push("/user/dashboard");
        break;
      case 'therapist':
        router.push("/therapist/dashboard");
        break;
      case 'moderator':
        router.push("/moderator/dashboard");
        break;
      case 'admin':
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/user/dashboard");
    }
  };

  /**
   * Handle post-registration flow (assessment, communities, etc.)
   */
  const handlePostRegistrationFlow = async (options?: {
    preAssessmentAnswers?: any[];
    source?: string;
  }) => {
    const preAssessmentAnswers = options?.preAssessmentAnswers || getAssessmentData()?.answers;
    if (preAssessmentAnswers && preAssessmentAnswers.length > 0) {
      await submitPreAssessmentMutation.mutateAsync({
        answerMatrix: preAssessmentAnswers,
        metadata: { source: options?.source || "registration" },
      });

      await assignCommunitiesMutation.mutateAsync();
      
      if (!options?.preAssessmentAnswers) {
        clearAssessmentData();
      }
    }
  };

  // Submit pre-assessment data
  const submitPreAssessment = async (data: PreAssessmentSubmission) => {
    return submitPreAssessmentMutation.mutateAsync(data);
  };

  // OAuth callback handler (NEW)
  const handleOAuthCallback = async (token: string) => {
    try {
      // Store the token using the auth context
      auth.setTokens(token, ''); // Assuming single token for simplicity
      
      // Fetch user data
      await refetchUser();
      
      // Process any pending assessment data
      const pendingAssessmentData = localStorage.getItem("pendingAssessmentData");
      if (pendingAssessmentData) {
        try {
          const assessmentData = JSON.parse(pendingAssessmentData);
          await submitPreAssessmentMutation.mutateAsync({
            answerMatrix: assessmentData.answers,
            metadata: assessmentData.metadata || {},
          });
          await assignCommunitiesMutation.mutateAsync();
          localStorage.removeItem("pendingAssessmentData");
        } catch (error) {
        }
      }
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Computed values
  const isSignedIn = auth.isAuthenticated;
  const isLoaded = !auth.isLoading;
  const isLoading = userLoading || firstSignInLoading || isAuthenticating || auth.isLoading;
  const isFirstTimeUser = firstSignInData?.isFirstTime ?? false;

  return {
    // Authentication state
    isSignedIn,
    isLoaded,
    isLoading,
    error: userError,

    // User data
    user: user as AuthUser | undefined,
    isFirstTimeUser,

    // Authentication methods
    signInWithEmail,
    signInWithOAuth,
    signUpClientWithEmail,
    signUpTherapistWithEmail,
    signUpWithOAuth,
    handleSignOut,
    handleOAuthCallback,

    // Registration helpers (legacy support)
    registerUser: registerClientMutation.mutateAsync,
    submitPreAssessment,

    // Utilities
    getToken,
    hasRole,
    isAuthenticated: isAuthenticated(),
    refetchUser,
    redirectUserByRole,

    // Mutation states
    isRegistering: registerClientMutation.isPending || registerTherapistMutation.isPending,
    isSubmittingAssessment: submitPreAssessmentMutation.isPending,
    isAssigningCommunities: assignCommunitiesMutation.isPending,
  };
}

// Type export for external use
export type UseAuthReturn = ReturnType<typeof useAuth>;
