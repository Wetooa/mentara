// Main auth hook
export { useAuth } from "../../contexts/AuthContext";

// Login hook
;

// Registration and verification hooks
;
;

;

// Password reset hook
export { usePasswordReset } from "./usePasswordReset";

// Role-specific auth hooks
;
;

;
;

;
;

;
;

// Enhanced auth utilities (removed useAuthErrorHandler - overcomplicated)

;
;

// Utility hook to get the appropriate auth hook based on role
import { useClientAuth } from "./client";
import { useTherapistAuth } from "./therapist";
import { useAdminAuth } from "./admin";
import { useModeratorAuth } from "./moderator";

type UserRole = "client" | "therapist" | "admin" | "moderator";

function useRoleBasedAuth(role: UserRole) {
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