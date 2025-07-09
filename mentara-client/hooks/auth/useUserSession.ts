import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { clientSession } from "@/lib/session";
import { AuthUser } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchMe(getToken: () => Promise<string | null>) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

async function checkFirstTimeUser(getToken: () => Promise<string | null>) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/auth/is-first-signin`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to check first-time user status");
  return res.json();
}

async function validateAndCreateSession(): Promise<{
  success: boolean;
  user?: any;
  sessionData?: any;
}> {
  const res = await fetch("/api/auth/validate-role", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to validate role and create session");
  }

  return res.json();
}

/**
 * User session management hook - handles user data and session validation
 */
export function useUserSession() {
  const { getToken, isLoaded, userId } = useClerkAuth();
  const queryClient = useQueryClient();

  // Backend user data query
  const {
    data: backendUser,
    isLoading: backendUserLoading,
    error: backendUserError,
    refetch: refetchBackendUser,
  } = useQuery({
    queryKey: queryKeys.users.detail(userId || ""),
    queryFn: () => fetchMe(getToken),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // First-time user check
  const {
    data: firstTimeData,
    isLoading: firstTimeLoading,
  } = useQuery({
    queryKey: queryKeys.users.isFirstSignIn(userId || ""),
    queryFn: () => checkFirstTimeUser(getToken),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Session validation mutation
  const sessionValidationMutation = useMutation({
    mutationFn: validateAndCreateSession,
    onSuccess: (data) => {
      if (data.success && data.sessionData) {
        clientSession.setSession(data.sessionData);
        queryClient.invalidateQueries({ queryKey: ["session-info"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }
    },
    onError: (error: any) => {
      console.error("Session validation error:", error);
    },
  });

  // Session refresh mutation
  const sessionRefreshMutation = useMutation({
    mutationFn: async () => {
      const currentSession = clientSession.getSessionInfo();
      if (!currentSession?.isValid) {
        throw new Error("No valid session to refresh");
      }

      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionData: currentSession }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh session");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.sessionData) {
        clientSession.setSession(data.sessionData);
      }
    },
  });

  // Session data from localStorage
  const sessionData = clientSession.getSessionInfo();

  // Combined user data
  const user: AuthUser | null = backendUser
    ? {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        role: backendUser.role,
        avatarUrl: backendUser.avatarUrl,
        bio: backendUser.bio,
        isActive: backendUser.isActive,
        createdAt: backendUser.createdAt,
        updatedAt: backendUser.updatedAt,
      }
    : null;

  const validateSession = () => sessionValidationMutation.mutateAsync();
  const refreshSession = () => sessionRefreshMutation.mutateAsync();

  return {
    user,
    sessionData: sessionData?.isValid ? sessionData : null,
    isLoaded,
    isLoading: backendUserLoading || firstTimeLoading,
    error: backendUserError,
    isFirstTimeUser: firstTimeData?.isFirstTime ?? false,
    validateSession,
    refreshSession,
    refetchBackendUser,
  };
}