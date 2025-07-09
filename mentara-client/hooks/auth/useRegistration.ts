import { useSignUp, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { UserRole } from "@/lib/auth";
import { usePreAssessmentStore } from "@/store/pre-assessment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper functions
function createBackendUserData(
  email: string,
  nickname: string,
  role: UserRole = "client"
) {
  return {
    user: {
      email,
      firstName: nickname || "User",
      middleName: "",
      lastName: "",
      birthDate: new Date().toISOString(),
      address: "",
      avatarUrl: "",
      role,
      bio: "",
      coverImageUrl: "",
      isActive: true,
    },
  };
}

async function submitPreAssessmentData(
  answerMatrix: number[],
  metadata: Record<string, any>,
  getToken: () => Promise<string | null>
) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/pre-assessment/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      answerMatrix,
      metadata,
    }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to submit pre-assessment");
  return res.json();
}

async function registerBackendUser(
  userData: any,
  getToken: () => Promise<string | null>
) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers,
    body: JSON.stringify(userData),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to register with backend");
  return res.json();
}

/**
 * Registration hook - handles sign-up operations and pre-assessment flow
 */
export function useRegistration() {
  const { signUp, isLoaded } = useSignUp();
  const { getToken } = useClerkAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { getAssessmentData, clearAssessmentData } = usePreAssessmentStore();

  // Backend registration mutation
  const backendRegisterMutation = useMutation({
    mutationFn: ({
      userData,
      getToken,
    }: {
      userData: any;
      getToken: () => Promise<string | null>;
    }) => registerBackendUser(userData, getToken),
    onError: (error: any) => {
      console.error("Backend registration failed:", error);
      toast.error("Registration failed. Please try again.");
    },
  });

  // Community assignment mutation
  const communityAssignmentMutation = useMutation({
    mutationFn: async (getToken: () => Promise<string | null>) => {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/communities/assign-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to assign communities");
      return response.json();
    },
  });

  // Email sign-up
  const signUpWithEmail = async (
    email: string,
    password: string,
    nickname: string = "User"
  ) => {
    if (!isLoaded || !signUp) return;

    try {
      setIsLoading(true);

      // Create Clerk account
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: nickname,
      });

      if (result.status === "complete") {
        const userData = createBackendUserData(email, nickname);

        // Register with backend
        await backendRegisterMutation.mutateAsync({ userData, getToken });

        // Submit pre-assessment if available
        const assessmentData = getAssessmentData();
        if (assessmentData?.answers && assessmentData.answers.length > 0) {
          await submitPreAssessmentData(
            assessmentData.answers,
            assessmentData.metadata || {},
            getToken
          );

          // Assign communities based on assessment
          await communityAssignmentMutation.mutateAsync(getToken);
          clearAssessmentData();
        }

        toast.success("Account created successfully!");
        router.push("/user/onboarding/profile");
      } else {
        toast.error("Please verify your email to complete registration.");
      }
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.message || error?.message || "Registration failed";
      toast.error(message);
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth sign-up
  const signUpWithOAuth = async (
    strategy: "oauth_google" | "oauth_microsoft"
  ) => {
    if (!isLoaded || !signUp) return;

    try {
      setIsLoading(true);
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/user/onboarding/profile",
      });
    } catch (error) {
      toast.error("Failed to sign up with OAuth");
      console.error("OAuth sign up error:", error);
      setIsLoading(false);
    }
  };

  return {
    isLoading:
      isLoading ||
      backendRegisterMutation.isPending ||
      communityAssignmentMutation.isPending,
    signUpWithEmail,
    signUpWithOAuth,
  };
}
