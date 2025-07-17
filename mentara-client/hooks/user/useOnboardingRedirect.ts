"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../auth/useAuth";
import { useSessionManager } from "../sessions/useSessionManager";

export function useOnboardingRedirect() {
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

    function checkOnboardingStatus() {
      // Check if user has completed onboarding
      const mentaraOnboardingComplete = localStorage.getItem("mentara_onboarding_complete");
      const mentaraRecommendationsComplete = localStorage.getItem("mentara_recommendations_complete");
      const legacyOnboardingCompleted = localStorage.getItem("onboarding_completed");
      const hasSeenWelcome = localStorage.getItem("welcome_page_visited");
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
        console.log(
          "Redirecting to new onboarding flow - First time user or incomplete onboarding"
        );
        router.push("/onboarding");
      } else if (shouldRedirectToRecommendations) {
        console.log(
          "Redirecting to recommendations - Basic onboarding complete but recommendations not done"
        );
        router.push("/onboarding/recommendations");
      } else if (shouldRedirectToWelcome) {
        console.log(
          "Redirecting to welcome page - Full onboarding complete but welcome not seen"
        );
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
      (!localStorage.getItem("mentara_onboarding_complete") &&
        !localStorage.getItem("onboarding_completed") &&
        !backendUser?.profile?.onboardingCompleted),
    needsRecommendations:
      !localStorage.getItem("mentara_recommendations_complete"),
    sessionValid: sessionInfo.isValid,
  };
}
