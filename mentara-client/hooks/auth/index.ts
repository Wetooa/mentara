import { useAuthentication } from "./useAuthentication";
import { useRegistration } from "./useRegistration";
import { useUserSession } from "./useUserSession";

/**
 * Main auth hook that combines authentication, registration, and session management
 * This maintains backward compatibility with the original useAuth hook
 */
export function useAuth() {
  const auth = useAuthentication();
  const registration = useRegistration();
  const session = useUserSession();

  return {
    // User data and state
    user: session.user,
    sessionData: session.sessionData,
    isLoaded: auth.isLoaded && session.isLoaded,
    isLoading: auth.isLoading || registration.isLoading || session.isLoading,
    error: session.error,
    isFirstTimeUser: session.isFirstTimeUser,

    // Authentication methods
    signInWithEmail: auth.signInWithEmail,
    signInWithOAuth: auth.signInWithOAuth,
    handleSignOut: auth.handleSignOut,

    // Registration methods
    signUpWithEmail: registration.signUpWithEmail,
    signUpWithOAuth: registration.signUpWithOAuth,

    // Session management
    validateSession: session.validateSession,
    refreshSession: session.refreshSession,
    refetchBackendUser: session.refetchBackendUser,

    // Utilities
    getToken: auth.getToken,
  };
}

// Export individual hooks for specific use cases
export { useAuthentication } from "./useAuthentication";
export { useRegistration } from "./useRegistration";
export { useUserSession } from "./useUserSession";