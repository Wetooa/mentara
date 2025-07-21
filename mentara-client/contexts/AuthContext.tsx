"use client";

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { TOKEN_STORAGE_KEY } from "@/lib/constants/auth";
import { useGlobalLoading } from "@/hooks/loading/useGlobalLoading";

// Types
export type UserRole = "client" | "therapist" | "moderator" | "admin";

export interface User {
  id: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  logout: () => void;
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
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const api = useApi();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

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

  // Check for token on mount and route changes
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    setHasToken(!!token);
  }, [pathname]);

  // Fetch user role using React Query (only when we have a token and need auth)
  const {
    data: authData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auth", "user-role"],
    queryFn: () => api.auth.getUserRole(),
    enabled: shouldCheckAuth && hasToken === true,
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

  // Create user object
  const user: User | null =
    userRole && userId
      ? {
          id: userId,
          role: userRole,
        }
      : null;

  const isAuthenticated = !!user && !!hasToken;

  // Track progress interval for cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync global loading with React Query loading state
  useEffect(() => {
    if (shouldCheckAuth && hasToken === true) {
      if (isLoading) {
        // Prevent starting multiple loading operations
        if (!authLoadingRef.current) {
          authLoadingRef.current = true;
          startAuthLoading();

          if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Auth loading started - checking user role');
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
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Auth loading failed:', error);
            }
          } else {
            updateAuthProgress(100);
            setTimeout(() => {
              completeAuthLoading();
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Auth loading completed - user role verified');
              }
            }, 100);
          }
        }
      }
    } else if (!shouldCheckAuth && authLoadingRef.current) {
      // Complete any auth loading for public routes
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
  }, [isLoading, error, shouldCheckAuth, hasToken, startAuthLoading, updateAuthProgress, completeAuthLoading, errorAuthLoading]);

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setHasToken(false);
    router.push("/auth/sign-in");
  };

  // Handle route protection and redirection
  useEffect(() => {
    // Skip redirections during loading or if we don't know token status yet
    if (isLoading || hasToken === null) return;

    const isPublic = isPublicRoute(pathname);

    // Handle authentication errors
    if (error && shouldCheckAuth) {
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
      if (!hasToken) {
        // No token - redirect to sign in
        router.push("/auth/sign-in");
        return;
      }

      if (!isAuthenticated && !isLoading) {
        // Has token but auth failed - redirect to sign in
        router.push("/auth/sign-in");
        return;
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
    isLoading,
    isAuthenticated,
    userRole,
    pathname,
    router,
    toast,
    hasToken,
    error,
    shouldCheckAuth,
  ]);

  // Show minimal loading state during authentication check
  // The global loading bar will handle the visual feedback
  if ((isLoading || hasToken === null) && shouldCheckAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground animate-pulse">
            Verifying authentication...
          </div>
        </div>
      </div>
    );
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    logout,
  };

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
