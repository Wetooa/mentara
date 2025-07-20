"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionManager } from "@/hooks/sessions/useSessionManager";

/**
 * LocalStorage keys for onboarding state management
 */
const ONBOARDING_STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "mentara_onboarding_complete",
  RECOMMENDATIONS_COMPLETE: "mentara_recommendations_complete",
  LEGACY_ONBOARDING: "onboarding_completed",
  WELCOME_VISITED: "welcome_page_visited",
} as const;

/**
 * Return type for the useOnboardingRedirect hook
 */
export interface UseOnboardingRedirectReturn {
  /** Whether this is a first-time user */
  isFirstTimeUser: boolean;
  /** Whether the user needs to complete onboarding */
  needsOnboarding: boolean;
  /** Whether the user needs to complete recommendations */
  needsRecommendations: boolean;
  /** Whether the user's session is valid */
  sessionValid: boolean;
}

/**
 * Hook for managing automatic onboarding flow redirects for client users
 * 
 * This hook handles the complex onboarding flow logic for client users, automatically
 * redirecting them through the appropriate onboarding steps based on their completion
 * status. It supports both legacy and new onboarding flows, with proper session
 * validation and role-based redirection.
 * 
 * @returns Object containing onboarding state and validation status
 * 
 * @example
 * ```tsx
 * function ClientDashboard() {
 *   const { needsOnboarding, sessionValid } = useOnboardingRedirect();
 * 
 *   if (!sessionValid) {
 *     return <div>Validating session...</div>;
 *   }
 * 
 *   // Hook automatically redirects if onboarding is needed
 *   return <div>Welcome to your dashboard!</div>;
 * }
 * ```
 * 
 * Features:
 * - Automatic multi-step onboarding flow management
 * - Session validation before onboarding checks
 * - Support for legacy and new onboarding systems
 * - Client-role specific redirects (other roles skip onboarding)
 * - LocalStorage and backend state synchronization
 * - Development-only logging for debugging
 * 
 * Onboarding Flow:
 * 1. Basic onboarding (/onboarding)
 * 2. Recommendations (/onboarding/recommendations)
 * 3. Welcome page (/user/welcome)
 * 4. Regular dashboard access
 */
export function useOnboardingRedirect(): UseOnboardingRedirectReturn {
  const router = useRouter();
  const pathname = usePathname();
  const { user, backendUser, isFirstTimeUser, isLoaded } = useAuth();
  const { sessionInfo, validateSessionForOperation } = useSessionManager({
    enableAutoRefresh: false, // Don't auto-refresh during onboarding check
    enableRoleChangeDetection: false, // Don't detect role changes during onboarding
  });

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Skip redirect if already on onboarding pages (both old and new)
    if (pathname.startsWith("/user/onboarding") || pathname.startsWith("/onboarding")) return;

    // Only check for client role (other roles don't need onboarding)
    if (user.role !== "client") return;

    // Ensure we have a valid session first
    if (!sessionInfo.isValid) {
      validateSessionForOperation().then((valid) => {
        if (!valid) return; // Will redirect to sign-in

        // After session validation, check onboarding again
        checkOnboardingStatus();
      });
      return;
    }

    checkOnboardingStatus();

    /**
     * Check onboarding completion status from multiple sources
     */
    function checkOnboardingStatus() {
      // Check if user has completed onboarding from various sources
      const mentaraOnboardingComplete = localStorage.getItem(ONBOARDING_STORAGE_KEYS.ONBOARDING_COMPLETE);
      const mentaraRecommendationsComplete = localStorage.getItem(ONBOARDING_STORAGE_KEYS.RECOMMENDATIONS_COMPLETE);
      const legacyOnboardingCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEYS.LEGACY_ONBOARDING);
      const hasSeenWelcome = localStorage.getItem(ONBOARDING_STORAGE_KEYS.WELCOME_VISITED);
      const hasBackendProfile = backendUser?.profile?.onboardingCompleted;

      // Redirect conditions for new onboarding flow
      // 1. First-time user detection from backend
      // 2. No new onboarding completion flag in localStorage
      // 3. No backend profile indicating completion
      // 4. User role is client (verified above)
      const shouldRedirectToOnboarding =
        isFirstTimeUser || 
        (!mentaraOnboardingComplete && !legacyOnboardingCompleted && !hasBackendProfile);

      // If basic onboarding is complete but recommendations not done
      const shouldRedirectToRecommendations =
        (mentaraOnboardingComplete || legacyOnboardingCompleted || hasBackendProfile) &&
        !mentaraRecommendationsComplete &&
        !pathname.startsWith("/onboarding/recommendations");

      // If both onboarding and recommendations are complete but user hasn't seen welcome page
      const shouldRedirectToWelcome =
        (mentaraOnboardingComplete || legacyOnboardingCompleted || hasBackendProfile) &&
        mentaraRecommendationsComplete &&
        !hasSeenWelcome &&
        !pathname.startsWith("/user/welcome");

      if (shouldRedirectToOnboarding) {
        // Log redirect for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log("Redirecting to new onboarding flow - First time user or incomplete onboarding");
        }
        router.push("/onboarding");
      } else if (shouldRedirectToRecommendations) {
        // Log redirect for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log("Redirecting to recommendations - Basic onboarding complete but recommendations not done");
        }
        router.push("/onboarding/recommendations");
      } else if (shouldRedirectToWelcome) {
        // Log redirect for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.log("Redirecting to welcome page - Full onboarding complete but welcome not seen");
        }
        router.push("/user/welcome");
      }
    }
  }, [
    isLoaded,
    user,
    backendUser,
    isFirstTimeUser,
    pathname,
    router,
    sessionInfo,
    validateSessionForOperation,
  ]);

  return {
    isFirstTimeUser,
    needsOnboarding:
      isFirstTimeUser ||
      (!localStorage.getItem(ONBOARDING_STORAGE_KEYS.ONBOARDING_COMPLETE) &&
        !localStorage.getItem(ONBOARDING_STORAGE_KEYS.LEGACY_ONBOARDING) &&
        !backendUser?.profile?.onboardingCompleted),
    needsRecommendations:
      !localStorage.getItem(ONBOARDING_STORAGE_KEYS.RECOMMENDATIONS_COMPLETE),
    sessionValid: sessionInfo.isValid,
  };
}
