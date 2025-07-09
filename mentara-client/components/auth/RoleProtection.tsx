"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { clientSession } from '@/lib/session';
import { UserRole } from '@/lib/auth';

interface RoleProtectionProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

// Define protected routes and their required roles
const protectedRoutes: Record<string, UserRole[]> = {
  "/user": ["client"],
  "/therapist": ["therapist"],
  "/moderator": ["moderator"],
  "/admin": ["admin"],
};

// Get default dashboard path for each role
function getDefaultPathForRole(role: UserRole): string {
  switch (role) {
    case "client": return "/user";
    case "therapist": return "/therapist";
    case "moderator": return "/moderator";
    case "admin": return "/admin";
    default: return "/";
  }
}

// Get required role for a path
function getRequiredRole(pathname: string): UserRole | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles[0]; // Only one role per route in your config
    }
  }
  return null;
}

export function RoleProtection({ 
  children, 
  allowedRoles, 
  fallbackPath 
}: RoleProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded, validateSession } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // If user is not authenticated, let Clerk middleware handle it
    if (!user) return;

    // Get current session
    const sessionInfo = clientSession.getSessionInfo();
    
    // If no session exists, try to validate and create one
    if (!sessionInfo?.isValid) {
      validateSession().catch(() => {
        // If validation fails, user will be redirected by Clerk
      });
      return;
    }

    const userRole = sessionInfo.role;
    if (!userRole) return;

    // Check role-based access
    let requiredRole: UserRole | null = null;
    
    if (allowedRoles) {
      // Component-level role restriction
      if (!allowedRoles.includes(userRole)) {
        const redirectPath = fallbackPath || getDefaultPathForRole(userRole);
        router.push(redirectPath);
        return;
      }
    } else {
      // Route-level role restriction
      requiredRole = getRequiredRole(pathname);
      if (requiredRole && userRole !== requiredRole) {
        const redirectPath = getDefaultPathForRole(userRole);
        router.push(redirectPath);
        return;
      }
    }

    // Handle root page redirect
    if (pathname === "/") {
      const defaultPath = getDefaultPathForRole(userRole);
      router.push(defaultPath);
      return;
    }

  }, [isLoaded, user, pathname, router, allowedRoles, fallbackPath, validateSession]);

  // Only render children if user is properly authenticated and authorized
  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const sessionInfo = clientSession.getSessionInfo();
  const userRole = sessionInfo?.role;

  // Check access permissions
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleAccess(requiredRoles: UserRole[]): boolean {
  const sessionInfo = clientSession.getSessionInfo();
  const userRole = sessionInfo?.role;
  
  return userRole ? requiredRoles.includes(userRole) : false;
}

/**
 * Component for role-based conditional rendering
 */
export function ShowForRoles({ 
  roles, 
  children 
}: { 
  roles: UserRole[]; 
  children: React.ReactNode;
}) {
  const hasAccess = useRoleAccess(roles);
  
  if (!hasAccess) return null;
  
  return <>{children}</>;
}