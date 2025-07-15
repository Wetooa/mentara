import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { usePreAssessmentStore } from "@/store/pre-assessment";
import { useAuth as useJWTAuth } from "@/contexts/AuthContext";
import { LoginDto, RegisterClientDto, User } from "mentara-commons";
// Keep local types for features not yet migrated to commons
import type {
  AuthUser,
  PreAssessmentSubmission,
} from "@/types/api";
import { MentaraApiError } from "@/lib/api/errorHandler";

/**
 * Simplified authentication hook following proper data flow:
 * UI → Hook → API Service → Backend
 * Now uses JWT authentication instead of Clerk
 */
export function useAuth() {
  const auth = useJWTAuth();
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getAssessmentData, clearAssessmentData } = usePreAssessmentStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
  });

  // Check if user is signing in for the first time
  const { data: firstSignInData, isLoading: firstSignInLoading } = useQuery({
    queryKey: queryKeys.auth.isFirstSignIn(),
    queryFn: () => api.auth.checkFirstSignIn(),
    enabled: !!auth.accessToken && auth.isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Registration mutation (Updated with commons types and Zod validation)
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterClientDto) => api.auth.registerClient(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Registration successful!");
    },
    onError: (error: MentaraApiError) => {
      toast.error("Registration failed. Please try again.");
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

  // Sign up with email (FIXED - uses flat structure)
  const signUpWithEmail = async (
    email: string,
    password: string,
    nickname: string = "User"
  ) => {
    try {
      setIsAuthenticating(true);

      // Register with JWT backend using flat structure
      await auth.register({ 
        email, 
        password, 
        firstName: nickname || "User",
        lastName: "",
        role: "client"
      });

      toast.success("Account created successfully!");

      // Submit pre-assessment if available
      const assessmentData = getAssessmentData();
      if (assessmentData?.answers && assessmentData.answers.length > 0) {
        await submitPreAssessmentMutation.mutateAsync({
          answerMatrix: assessmentData.answers,
          metadata: assessmentData.metadata || {},
        });

        // Assign communities based on assessment
        await assignCommunitiesMutation.mutateAsync();
        clearAssessmentData();
      }

      router.push("/user/onboarding/profile");
    } catch (error: any) {
      const errorMessage = error instanceof MentaraApiError
        ? error.message
        : error?.message || "Registration failed";
      toast.error(errorMessage);
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

  // Register user with backend (for OAuth flows) - Updated with commons types
  const registerUser = async (userData: RegisterClientDto) => {
    return registerMutation.mutateAsync(userData);
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
    signUpWithEmail,
    signUpWithOAuth,
    handleSignOut,
    handleOAuthCallback,

    // Registration helpers
    registerUser,
    submitPreAssessment,

    // Utilities
    getToken: () => Promise.resolve(auth.accessToken),
    refetchUser,

    // Mutation states
    isRegistering: registerMutation.isPending,
    isSubmittingAssessment: submitPreAssessmentMutation.isPending,
    isAssigningCommunities: assignCommunitiesMutation.isPending,
  };
}

// Type export for external use
export type UseAuthReturn = ReturnType<typeof useAuth>;
