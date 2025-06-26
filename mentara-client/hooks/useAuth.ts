import { useUser, useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthUser, UserRole } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchMe() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

type RegisterArgs = { userId?: string | null; data: Record<string, unknown> };

async function registerClient({ data }: RegisterArgs) {
  const res = await fetch("/api/auth/register/client", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to register client");
  return res.json();
}

async function registerTherapist({ data }: RegisterArgs) {
  const res = await fetch("/api/auth/register/therapist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to register therapist");
  return res.json();
}

export function useAuth() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isLoaded = isUserLoaded && isSignInLoaded && isSignUpLoaded;

  // Fetch backend user info
  const {
    data: backendUser,
    isLoading: isBackendUserLoading,
    refetch: refetchBackendUser,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: isLoaded && !!user,
  });

  const getAuthUser = (): AuthUser | null => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      role: (user.publicMetadata?.role as UserRole) ?? "client",
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      metadata: user.publicMetadata as Record<string, unknown>,
    };
  };

  // Mutations for backend registration
  const clientRegisterMutation = useMutation({
    mutationFn: registerClient,
    onSuccess: () => {
      toast.success("Client registered with backend!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as Error).message || "Failed to register client with backend"
      );
    },
  });

  const therapistRegisterMutation = useMutation({
    mutationFn: registerTherapist,
    onSuccess: () => {
      toast.success("Therapist registered with backend!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as Error).message || "Failed to register therapist with backend"
      );
    },
  });

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
        await refetchBackendUser();
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

  // Register with Clerk, then backend
  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    role: UserRole = "client",
    backendData?: Record<string, unknown>
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
        // Register with backend
        if (role === "client") {
          clientRegisterMutation.mutate({
            userId: result.createdUserId ?? undefined,
            data: backendData ?? {},
          });
        } else if (role === "therapist") {
          therapistRegisterMutation.mutate({
            userId: result.createdUserId ?? undefined,
            data: backendData ?? {},
          });
        }
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
      queryClient.clear();
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: getAuthUser(),
    backendUser,
    isLoaded,
    isLoading: isLoading || isBackendUserLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    handleSignOut,
    clientRegisterMutation,
    therapistRegisterMutation,
    refetchBackendUser,
  };
}
