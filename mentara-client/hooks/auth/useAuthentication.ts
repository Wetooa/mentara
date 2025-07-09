import { useUser, useClerk, useSignIn, useSignUp, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

/**
 * Core authentication hook - handles sign-in/out operations
 */
export function useAuthentication() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { getToken } = useClerkAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Email sign-in
  const signInWithEmail = async (email: string, password: string) => {
    if (!isLoaded || !signIn) return;
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // OAuth sign-in
  const signInWithOAuth = async (strategy: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded || !signIn) return;
    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/user/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with OAuth");
      console.error("OAuth sign in error:", error);
      setIsLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Clear local session data
      if (typeof window !== "undefined") {
        localStorage.removeItem("mentara-session");
      }
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoaded,
    isLoading,
    getToken,
    signInWithEmail,
    signInWithOAuth,
    handleSignOut,
  };
}