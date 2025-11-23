"use client";

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
  useRef,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { TOKEN_STORAGE_KEY, hasAuthToken } from "@/lib/constants/auth";
import { useGlobalLoading } from "@/hooks/loading/useGlobalLoading";

// Types
export type UserRole = "client" | "therapist" | "moderator" | "admin";

export interface User {
  id: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  hasSeenTherapistRecommendations?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  logout: () => void;
  refreshProfile: () => void;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Route classification
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/verify",
  "/auth/verify-account",

  "/about",
  "/community",
  "/landing",

  "/therapist-application",
  "/pre-assessment",
];

const roleBasePaths: Record<UserRole, string> = {
  admin: "/admin",
  therapist: "/therapist",
  moderator: "/moderator",
  client: "/client",
};

// Utility functions
const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

const getUserDashboardPath = (role: UserRole): string => {
  return roleBasePaths[role];
};

const isCorrectRoleRoute = (pathname: string, userRole: UserRole): boolean => {
  const userBasePath = roleBasePaths[userRole];
  return pathname.startsWith(userBasePath);
};

const isAnyRoleRoute = (pathname: string): boolean => {
  return Object.values(roleBasePaths).some((basePath) =>
    pathname.startsWith(basePath)
  );
};

// Auth Provider Component
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const api = useApi();
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ref to track if auth loading is already in progress to prevent infinite loops
  const authLoadingRef = useRef<boolean>(false);

  // Initialize global loading for authentication
  const {
    startLoading: startAuthLoading,
    updateProgress: updateAuthProgress,
    completeLoading: completeAuthLoading,
    errorLoading: errorAuthLoading,
  } = useGlobalLoading("auth", {
    message: "Verifying authentication...",
    expectedDuration: 2000,
  });

  // Determine if we should check authentication based on route
  const shouldCheckAuth = !isPublicRoute(pathname);

  // Set client state on mount to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for token on mount and route changes (client-side only)
  // Set token state immediately for synchronous checks
  useEffect(() => {
    if (isClient) {
      const tokenExists = hasAuthToken();
      setHasToken(tokenExists);
      
      // For protected routes without token, allow optimistic navigation
      // but mark as needing auth redirect
      if (!tokenExists && shouldCheckAuth) {
        // Token will be set to false, triggering redirect in the route protection effect
        // But page can still render to show loading state
      }
    }
  }, [pathname, isClient, shouldCheckAuth]);

  // Preload auth check in background if token exists (non-blocking, for faster navigation)
  // This prefetch happens on all routes but doesn't block UI on public routes
  useEffect(() => {
    if (isClient && hasToken === true) {
      // Prefetch auth data in background (non-blocking) for faster navigation
      // This won't block public routes but will have data ready if user navigates to protected route
      queryClient.prefetchQuery({
        queryKey: ["auth", "user-role"],
        queryFn: () => api.auth.getUserRole(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }).catch(() => {
        // Silently fail prefetch - it's just for optimization
      });
    }
  }, [isClient, hasToken, queryClient]);

  // Fetch user role using React Query - optimized for performance
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user-role"],
    queryFn: () => api.auth.getUserRole(),
    // Only enable on protected routes to avoid unnecessary checks on public pages
    enabled: isClient && shouldCheckAuth && hasToken === true,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent lag
    refetchOnMount: false, // Use cached data if available
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (auth failures)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const userRole = (authData as any)?.role as UserRole | null;
  const userId = (authData as any)?.userId || null;

  // Prefetch profile data when auth data is available (only on protected routes)
  useEffect(() => {
    if (isClient && userId && userRole && hasToken === true && shouldCheckAuth && !isLoading) {
      const prefetchProfile = async () => {
        try {
          let profileResponse: any;
          switch (userRole) {
            case "client":
              profileResponse = await api.auth.client.getProfile();
              break;
            case "therapist":
              profileResponse = await api.auth.therapist.getProfile();
              break;
            case "admin":
              profileResponse = await api.auth.admin.getProfile();
              break;
            case "moderator":
              profileResponse = await api.auth.moderator.getProfile();
              break;
            default:
              return;
          }

          const normalizedData = {
            firstName:
              profileResponse.user?.firstName || profileResponse.firstName || "",
            lastName:
              profileResponse.user?.lastName || profileResponse.lastName || "",
            avatarUrl: profileResponse.user?.avatarUrl || profileResponse.avatarUrl,
            hasSeenTherapistRecommendations:
              profileResponse.hasSeenTherapistRecommendations,
          };

          // Prefetch into cache
          queryClient.setQueryData(["auth", "current-user-profile"], normalizedData);
        } catch (error) {
          // Silently fail prefetch - query will handle it
        }
      };
      prefetchProfile();
    }
  }, [isClient, userId, userRole, hasToken, shouldCheckAuth, isLoading, queryClient]);

  // Fetch profile data if user is authenticated
  // Only fetch after auth query completes successfully to prevent race conditions
  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ["auth", "current-user-profile"],
    queryFn: async () => {
      if (!userRole) {
        throw new Error("User role not available");
      }

      let profileResponse: any;

      // Call the appropriate role-specific profile endpoint
      switch (userRole) {
        case "client":
          profileResponse = await api.auth.client.getProfile();
          break;
        case "therapist":
          profileResponse = await api.auth.therapist.getProfile();
          break;
        case "admin":
          profileResponse = await api.auth.admin.getProfile();
          break;
        case "moderator":
          profileResponse = await api.auth.moderator.getProfile();
          break;
        default:
          throw new Error(`Unsupported user role: ${userRole}`);
      }

      // Normalize the profile data structure
      return {
        firstName:
          profileResponse.user?.firstName || profileResponse.firstName || "",
        lastName:
          profileResponse.user?.lastName || profileResponse.lastName || "",
        avatarUrl: profileResponse.user?.avatarUrl || profileResponse.avatarUrl,
        hasSeenTherapistRecommendations:
          profileResponse.hasSeenTherapistRecommendations,
      };
    },
    // Wait for auth query to complete to prevent race conditions (only on protected routes)
    enabled:
      isClient && shouldCheckAuth && !!userId && !!userRole && hasToken === true && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (auth failures)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Create user object with profile data when available
  // Memoized to prevent unnecessary re-renders
  const user: User | null = useMemo(() => {
    if (!userRole || !userId) return null;

    return {
      id: userId,
      role: userRole,
      firstName: profileData?.firstName,
      lastName: profileData?.lastName,
      avatarUrl: profileData?.avatarUrl,
      hasSeenTherapistRecommendations:
        profileData?.hasSeenTherapistRecommendations,
    };
  }, [
    userId,
    userRole,
    profileData?.firstName,
    profileData?.lastName,
    profileData?.avatarUrl,
    profileData?.hasSeenTherapistRecommendations,
  ]);

  const isAuthenticated = !!user && !!hasToken;

  // Track progress interval for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync global loading with React Query loading state
  useEffect(() => {
    if (isClient && shouldCheckAuth && hasToken === true) {
      if (isLoading) {
        // Prevent starting multiple loading operations
        if (!authLoadingRef.current) {
          authLoadingRef.current = true;
          startAuthLoading();

          if (process.env.NODE_ENV === "development") {
            console.log("🔐 Auth loading started - checking user role");
          }

          // Simulate realistic progress during auth check
          let progress = 0;
          progressIntervalRef.current = setInterval(() => {
            progress += Math.random() * 10 + 5; // Random progress between 5-15%
            if (progress < 85) {
              updateAuthProgress(Math.min(progress, 85));
            }
          }, 150);
        }
      } else {
        // Complete global loading when auth check finishes
        if (authLoadingRef.current) {
          authLoadingRef.current = false;

          // Clear progress interval
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }

          if (error) {
            errorAuthLoading("Authentication failed");
            if (process.env.NODE_ENV === "development") {
              console.error("❌ Auth loading failed:", error);
            }
          } else {
            updateAuthProgress(100);
            setTimeout(() => {
              completeAuthLoading();
              if (process.env.NODE_ENV === "development") {
                console.log("✅ Auth loading completed - user role verified");
              }
            }, 100);
          }
        }
      }
    } else if ((!shouldCheckAuth || !isClient) && authLoadingRef.current) {
      // Complete any auth loading for public routes or during SSR
      authLoadingRef.current = false;

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      completeAuthLoading();
    }

    // Cleanup function for the useEffect
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [
    isClient,
    isLoading,
    error,
    shouldCheckAuth,
    hasToken,
    startAuthLoading,
    updateAuthProgress,
    completeAuthLoading,
    errorAuthLoading,
  ]);

  // Logout function
  const logout = () => {
    // Clear React Query cache to prevent stale authentication data
    queryClient.clear();

    if (isClient) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setHasToken(false);
    router.push("/auth/sign-in");
  };

  // Function to refresh profile data
  const refreshProfile = () => {
    refetchProfile();
  };

  // Handle route protection and redirection
  // Optimized: Allow navigation first, verify auth in background
  useEffect(() => {
    // Skip redirections during SSR
    if (!isClient) return;

    // Quick synchronous check: if no token and accessing protected route, redirect immediately
    const isPublic = isPublicRoute(pathname);
    if (!isPublic && !hasAuthToken()) {
      // No token - redirect immediately without waiting for auth check
      router.push("/auth/sign-in");
      return;
    }

    // Skip other redirections during initial loading to allow optimistic navigation
    if (hasToken === null) return;

    // Handle authentication errors (after async check completes)
    if (error && shouldCheckAuth && !isLoading) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setHasToken(false);
      router.push("/auth/sign-in");
      return;
    }

    if (isPublic) {
      // Public route handling
      if (isAuthenticated) {
        // Authenticated user trying to access public auth routes
        if (pathname.startsWith("/auth/")) {
          const dashboardPath = getUserDashboardPath(userRole!);
          router.push(dashboardPath);
          return;
        }
        // Allow access to other public routes (landing, about, etc.)
      }
      // Unauthenticated users can access all public routes
    } else {
      // Protected route handling
      // Note: Token check already happened synchronously above, so we just verify auth result
      if (!isAuthenticated && !isLoading && hasToken === false) {
        // Auth failed - redirect to sign in (but navigation already happened)
        router.push("/auth/sign-in");
        return;
      }

      // Client welcome redirect logic - ensure clients see welcome page if they haven't seen recommendations
      if (
        isAuthenticated &&
        userRole === "client" &&
        user?.hasSeenTherapistRecommendations === false
      ) {
        if (!pathname.startsWith("/client/welcome")) {
          router.push("/client/welcome");
          return;
        }
      } else if (
        isAuthenticated &&
        userRole === "client" &&
        user?.hasSeenTherapistRecommendations === true
      ) {
        if (pathname.startsWith("/client/welcome")) {
          router.back();
          return;
        }
      }

      // Authenticated user on protected route
      if (isAuthenticated && isAnyRoleRoute(pathname)) {
        // Check if user has correct role for this route
        if (!isCorrectRoleRoute(pathname, userRole!)) {
          // Wrong role - redirect to their dashboard with notification
          toast({
            title: "Access Denied",
            description: `You don't have permission to access this area. Redirecting to your dashboard...`,
            variant: "destructive",
          });

          const dashboardPath = getUserDashboardPath(userRole!);
          router.push(dashboardPath);
          return;
        }
      }
      // Authenticated user with correct role or on general protected route - allow access
    }
  }, [
    isClient,
    isLoading,
    isAuthenticated,
    userRole,
    user,
    pathname,
    router,
    toast,
    hasToken,
    error,
    shouldCheckAuth,
  ]);

  // Memoize context value to prevent unnecessary re-renders
  // MUST be called before any conditional returns to maintain hook order
  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      userRole,
      logout,
      refreshProfile,
    }),
    [user, isLoading, isAuthenticated, userRole, logout, refreshProfile]
  );

  // Optimistic navigation: Don't block children rendering
  // Allow page to render immediately with loading states, verify auth in background
  // Only show blocking screen if we're absolutely sure there's no token on a protected route
  const shouldBlock = shouldCheckAuth && !isClient;
  
  if (shouldBlock) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-sm text-muted-foreground animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
