'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRoleCheck } from '@/hooks/auth/useRoleCheck';
import { useToast } from '@/components/ui/use-toast';

// Types
export type UserRole = 'client' | 'therapist' | 'moderator' | 'admin';

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
  '/',
  '/auth/sign-in',
  '/auth/verify',
  '/auth/verify-account',
  '/about',
  '/community',
  '/landing',
  '/therapist-application',
];

const roleBasePaths: Record<UserRole, string> = {
  admin: '/admin',
  therapist: '/therapist',
  moderator: '/moderator',
  client: '/client',
};

// Utility functions
const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
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
  return Object.values(roleBasePaths).some(basePath => 
    pathname.startsWith(basePath)
  );
};

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Determine if we should check authentication based on route
  const shouldCheckAuth = !isPublicRoute(pathname);
  
  // Only use useRoleCheck for protected routes to avoid unnecessary API calls
  const { 
    isLoading, 
    isAuthorized, 
    userRole, 
    userId 
  } = useRoleCheck(shouldCheckAuth ? 'client' : null as any);

  // Create user object
  const user: User | null = userRole && userId ? {
    id: userId,
    role: userRole,
  } : null;

  const isAuthenticated = !!user;

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    router.push('/auth/sign-in');
  };

  // Handle route protection and redirection
  useEffect(() => {
    // Skip redirections during loading
    if (isLoading) return;

    const isPublic = isPublicRoute(pathname);
    
    if (isPublic) {
      // Public route handling
      if (isAuthenticated) {
        // Authenticated user trying to access public auth routes
        if (pathname.startsWith('/auth/')) {
          const dashboardPath = getUserDashboardPath(userRole!);
          router.push(dashboardPath);
          return;
        }
        // Allow access to other public routes (landing, about, etc.)
      }
      // Unauthenticated users can access all public routes
    } else {
      // Protected route handling
      if (!isAuthenticated) {
        // Unauthenticated user trying to access protected route
        router.push('/auth/sign-in');
        return;
      }

      // Authenticated user on protected route
      if (isAnyRoleRoute(pathname)) {
        // Check if user has correct role for this route
        if (!isCorrectRoleRoute(pathname, userRole!)) {
          // Wrong role - redirect to their dashboard with notification
          toast({
            title: 'Access Denied',
            description: `You don't have permission to access this area. Redirecting to your dashboard...`,
            variant: 'destructive',
          });
          
          const dashboardPath = getUserDashboardPath(userRole!);
          router.push(dashboardPath);
          return;
        }
      }
      // Authenticated user with correct role or on general protected route - allow access
    }
  }, [isLoading, isAuthenticated, userRole, pathname, router, toast]);

  // Show loading state during authentication check
  if (isLoading && shouldCheckAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Loading...</p>
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}