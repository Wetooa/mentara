"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface OnboardingCheckerProps {
  children: React.ReactNode;
}

export function OnboardingChecker({ children }: OnboardingCheckerProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem("mentara_onboarding_complete");
    const recommendationsComplete = localStorage.getItem("mentara_recommendations_complete");

    if (!onboardingComplete) {
      // First time user - redirect to onboarding
      router.replace("/onboarding");
      return;
    }

    if (!recommendationsComplete) {
      // Onboarding complete but recommendations not done - redirect to recommendations
      router.replace("/onboarding/recommendations");
      return;
    }

    // User has completed full onboarding - continue to intended page
  }, [router]);

  return <>{children}</>;
}