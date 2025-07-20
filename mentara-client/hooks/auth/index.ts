// Main auth hook
export { useAuth } from "../../contexts/AuthContext";

// Registration and verification hooks
export { useClientRegistration } from "./useClientRegistration";
export type { ClientRegistrationData, UseClientRegistrationReturn } from "./useClientRegistration";

export { useEmailVerification } from "./useEmailVerification";

// Role-specific auth hooks
export { useClientAuth } from "./client";
export type { UseClientAuthReturn } from "./client";

export { useTherapistAuth } from "./therapist";
export type { UseTherapistAuthReturn } from "./therapist";

export { useAdminAuth } from "./admin";
export type { UseAdminAuthReturn } from "./admin";

export { useModeratorAuth } from "./moderator";
export type { UseModeratorAuthReturn } from "./moderator";

// Enhanced auth utilities (removed useAuthErrorHandler - overcomplicated)

export { useAuthLoadingStates } from "./useAuthLoadingStates";
export type { AuthOperation, LoadingState } from "./useAuthLoadingStates";

// Utility hook to get the appropriate auth hook based on role
import { useClientAuth } from "./client";
import { useTherapistAuth } from "./therapist";
import { useAdminAuth } from "./admin";
import { useModeratorAuth } from "./moderator";

export type UserRole = "client" | "therapist" | "admin" | "moderator";

export function useRoleBasedAuth(role: UserRole) {
  switch (role) {
    case "client":
      return useClientAuth();
    case "therapist":
      return useTherapistAuth();
    case "admin":
      return useAdminAuth();
    case "moderator":
      return useModeratorAuth();
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}