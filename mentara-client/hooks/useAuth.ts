import { useUser, useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthUser, UserRole } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);

  const isLoaded = isUserLoaded && isSignInLoaded && isSignUpLoaded;

  const getAuthUser = (): AuthUser | null => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      role: (user.publicMetadata?.role as UserRole) || "user",
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      metadata: user.publicMetadata as Record<string, unknown>,
    };
  };

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
        router.push("/");
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

  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    if (!isLoaded || !signUp) return;

    try {
      setIsLoading(true);
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        toast.success("Account created successfully!");
        router.push("/");
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (
    provider: "oauth_google" | "oauth_microsoft"
  ) => {
    if (!isLoaded || !signIn) return;

    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      console.error("OAuth sign in error:", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push("/sign-in");
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: getAuthUser(),
    isLoaded,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    handleSignOut,
  };
}
