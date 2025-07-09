import {
  useUser,
  useClerk,
  useSignIn,
  useSignUp,
  useAuth as useClerkAuth,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { usePreAssessmentStore } from "@/store/pre-assessment";
import type {
  AuthUser,
  RegisterUserRequest,
  PreAssessmentSubmission,
} from "@/types/api/auth";

/**
 * Simplified authentication hook following proper data flow:
 * UI → Hook → API Service → Backend
 */
export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
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
    enabled: !!clerkUser && clerkLoaded,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check if user is signing in for the first time
  const { data: firstSignInData, isLoading: firstSignInLoading } = useQuery({
    queryKey: queryKeys.auth.isFirstSignIn(),
    queryFn: () => api.auth.checkFirstSignIn(),
    enabled: !!clerkUser && clerkLoaded,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterUserRequest) => api.auth.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("Registration successful!");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    },
  });

  // Pre-assessment submission mutation
  const submitPreAssessmentMutation = useMutation({
    mutationFn: (data: PreAssessmentSubmission) =>
      api.auth.submitPreAssessment(data),
    onError: (error: any) => {
      console.error("Pre-assessment submission failed:", error);
      toast.error("Failed to submit assessment. Please try again.");
    },
  });

  // Community assignment mutation
  const assignCommunitiesMutation = useMutation({
    mutationFn: () => api.auth.assignCommunities(),
    onError: (error: any) => {
      console.error("Community assignment failed:", error);
      toast.error("Failed to assign communities. Please try again.");
    },
  });

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    if (!clerkLoaded || !signIn) return;

    try {
      setIsAuthenticating(true);
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        toast.success("Signed in successfully!");
        router.push("/user/dashboard");
      } else {
        toast.error("Sign in failed. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to sign in. Please check your credentials.");
      console.error("Sign in error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign in with OAuth
  const signInWithOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft"
  ) => {
    if (!clerkLoaded || !signIn) return;

    try {
      setIsAuthenticating(true);
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/user/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with OAuth");
      console.error("OAuth sign in error:", error);
      setIsAuthenticating(false);
    }
  };

  // Sign up with email
  const signUpWithEmail = async (
    email: string,
    password: string,
    nickname: string = "User"
  ) => {
    if (!clerkLoaded || !signUp) return;

    try {
      setIsAuthenticating(true);

      // Create Clerk account
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        // Account created and verified immediately - proceed with backend registration
        const userData: RegisterUserRequest = {
          user: {
            email,
            firstName: nickname || "User",
            middleName: "",
            lastName: "",
            birthDate: new Date().toISOString(),
            address: "",
            avatarUrl: "",
            role: "client",
            bio: "",
            coverImageUrl: "",
            isActive: true,
          },
        };

        // Register with backend
        await registerMutation.mutateAsync(userData);

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
      } else if (result.status === "missing_requirements") {
        // Email verification required - do backend registration and pre-assessment BEFORE redirect
        const userData: RegisterUserRequest = {
          user: {
            email,
            firstName: nickname || "User",
            middleName: "",
            lastName: "",
            birthDate: new Date().toISOString(),
            address: "",
            avatarUrl: "",
            role: "client",
            bio: "",
            coverImageUrl: "",
            isActive: true,
          },
        };

        // Register with backend first
        await registerMutation.mutateAsync(userData);

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

        // Now redirect to verification page
        router.push("/verify-account");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.message || error?.message || "Registration failed";
      toast.error(message);
      console.error("Sign up error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign up with OAuth
  const signUpWithOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft"
  ) => {
    if (!clerkLoaded || !signUp) return;

    try {
      setIsAuthenticating(true);
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/user/onboarding/profile",
      });
    } catch (error) {
      toast.error("Failed to sign up with OAuth");
      console.error("OAuth sign up error:", error);
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setIsAuthenticating(true);
      await signOut();
      // Clear React Query cache
      queryClient.clear();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Register user with backend (for OAuth flows)
  const registerUser = async (userData: RegisterUserRequest) => {
    return registerMutation.mutateAsync(userData);
  };

  // Submit pre-assessment data
  const submitPreAssessment = async (data: PreAssessmentSubmission) => {
    return submitPreAssessmentMutation.mutateAsync(data);
  };

  // Computed values
  const isSignedIn = !!clerkUser;
  const isLoaded = clerkLoaded;
  const isLoading = userLoading || firstSignInLoading || isAuthenticating;
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

    // Registration helpers
    registerUser,
    submitPreAssessment,

    // Utilities
    getToken,
    refetchUser,

    // Mutation states
    isRegistering: registerMutation.isPending,
    isSubmittingAssessment: submitPreAssessmentMutation.isPending,
    isAssigningCommunities: assignCommunitiesMutation.isPending,
  };
}

// Type export for external use
export type UseAuthReturn = ReturnType<typeof useAuth>;
