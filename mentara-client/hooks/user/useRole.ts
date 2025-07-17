import { useAuth } from "../auth/useAuth";
import { UserRole } from "@/lib/auth";

export function useRole() {
  const { user } = useAuth();

  const isUser = user?.role === "client";
  const isTherapist = user?.role === "therapist";
  const isModerator = user?.role === "moderator";
  const isAdmin = user?.role === "admin";

  const hasRole = (role: UserRole) => user?.role === role;
  const hasAnyRole = (roles: UserRole[]) =>
    roles.includes(user?.role as UserRole);

  const canAccess = (requiredRole: UserRole | UserRole[]) => {
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
