// Legacy exports (some components may have been removed)
export { default as VerifyAccount } from "./VerifyAccount";
export { ContinueWithGoogle } from "./ContinueWithGoogle";
export { ContinueWithMicrosoft } from "./ContinueWithMicrosoft";
export { withRole } from "./WithRole";

// Enhanced error handling
export { AuthErrorBoundary } from "./AuthErrorBoundary";

// Role-specific auth components
export { ClientSignIn } from "./client/ClientSignIn";
export { TherapistSignIn } from "./therapist/TherapistSignIn";
export { AdminSignIn } from "./admin/AdminSignIn";
export { ModeratorSignIn } from "./moderator/ModeratorSignIn";
