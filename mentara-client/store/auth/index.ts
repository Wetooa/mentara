// Role-specific auth stores
export { useClientAuthStore } from "./clientAuthStore";
export { useTherapistAuthStore } from "./therapistAuthStore";
export { useAdminAuthStore } from "./adminAuthStore";
export { useModeratorAuthStore } from "./moderatorAuthStore";

// Utility function to get the appropriate store based on role
import { useClientAuthStore } from "./clientAuthStore";
import { useTherapistAuthStore } from "./therapistAuthStore";
import { useAdminAuthStore } from "./adminAuthStore";
import { useModeratorAuthStore } from "./moderatorAuthStore";

export type UserRole = "client" | "therapist" | "admin" | "moderator";

export function useRoleBasedAuthStore(role: UserRole) {
  switch (role) {
    case "client":
      return useClientAuthStore();
    case "therapist":
      return useTherapistAuthStore();
    case "admin":
      return useAdminAuthStore();
    case "moderator":
      return useModeratorAuthStore();
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

// Type exports for convenience
export type { ClientAuthState } from "./clientAuthStore";
export type { TherapistAuthState } from "./therapistAuthStore";
export type { AdminAuthState } from "./adminAuthStore";
export type { ModeratorAuthState } from "./moderatorAuthStore";