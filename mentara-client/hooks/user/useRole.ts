import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/auth";

/**
 * Return type for the useRole hook
 */
export interface UseRoleReturn {
  /** Whether the current user has client role */
  isUser: boolean;
  /** Whether the current user has therapist role */
  isTherapist: boolean;
  /** Whether the current user has moderator role */
  isModerator: boolean;
  /** Whether the current user has admin role */
  isAdmin: boolean;
  /** Check if user has a specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if user has any of the provided roles */
  hasAnyRole: (roles: UserRole[]) => boolean;
  /** Check if user can access resources requiring specific role(s) */
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
}

/**
 * Hook for role-based access control and authorization checks
 * 
 * This hook provides utilities for checking user roles and permissions throughout
 * the application. It's commonly used for conditional rendering, route protection,
 * and feature access control based on the authenticated user's role.
 * 
 * @returns Object containing role check utilities and boolean flags
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { isAdmin, canAccess } = useRole();
 * 
 *   if (!isAdmin) {
 *     return <div>Access denied</div>;
 *   }
 * 
 *   return <div>Admin content</div>;
 * }
 * 
 * function StaffArea() {
 *   const { canAccess } = useRole();
 * 
 *   if (!canAccess(['admin', 'moderator'])) {
 *     return <div>Staff only area</div>;
 *   }
 * 
 *   return <div>Staff content</div>;
 * }
 * ```
 * 
 * Features:
 * - Role-specific boolean flags for common use cases
 * - Flexible role checking with single or multiple roles
 * - Safe handling of unauthenticated users
 * - TypeScript support with proper role typing
 * - Used extensively in layout-based route protection
 */
export function useRole(): UseRoleReturn {
  const { user } = useAuth();

  /** Whether the current user has client role */
  const isUser = user?.role === "client";
  /** Whether the current user has therapist role */
  const isTherapist = user?.role === "therapist";
  /** Whether the current user has moderator role */
  const isModerator = user?.role === "moderator";
  /** Whether the current user has admin role */
  const isAdmin = user?.role === "admin";

  /**
   * Check if the current user has a specific role
   * @param role - The role to check against
   * @returns True if user has the specified role
   */
  const hasRole = (role: UserRole): boolean => user?.role === role;
  
  /**
   * Check if the current user has any of the provided roles
   * @param roles - Array of roles to check against
   * @returns True if user has any of the specified roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean =>
    roles.includes(user?.role as UserRole);

  /**
   * Check if the current user can access resources requiring specific role(s)
   * @param requiredRole - Single role or array of roles required for access
   * @returns True if user has required role(s), false if unauthenticated or unauthorized
   */
  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return hasAnyRole(requiredRole);
    }
    return hasRole(requiredRole);
  };

  return {
    isUser,
    isTherapist,
    isModerator,
    isAdmin,
    hasRole,
    hasAnyRole,
    canAccess,
  };
}
