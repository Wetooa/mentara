// Legacy exports (some components may have been removed)
export { default as VerifyAccount } from "./VerifyAccount";
export { ContinueWithGoogle } from "./ContinueWithGoogle";
export { ContinueWithMicrosoft } from "./ContinueWithMicrosoft";
export { withRole } from "./WithRole";

// Role-specific auth components
export { ClientSignIn } from "./client/ClientSignIn";
export { TherapistSignIn } from "./therapist/TherapistSignIn";
export { AdminSignIn } from "./admin/AdminSignIn";
export { ModeratorSignIn } from "./moderator/ModeratorSignIn";

// Note: AuthErrorBoundary has been moved to @/lib/errors for standardized error handling
