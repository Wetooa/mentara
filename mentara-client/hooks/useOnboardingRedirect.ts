"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';
import { useSessionManager } from './useSessionManager';

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

    // Skip redirect if already on onboarding pages
    if (pathname.startsWith('/user/onboarding')) return;

    // Only check for client role (other roles don't need onboarding)
    if (user.role !== 'client') return;

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
      const onboardingCompleted = localStorage.getItem('onboarding_completed');
      const hasSeenWelcome = localStorage.getItem('welcome_page_visited');
      const hasBackendProfile = backendUser?.profile?.onboardingCompleted;

      // Redirect conditions:
      // 1. First-time user detection from backend
      // 2. No onboarding completion flag in localStorage  
      // 3. No backend profile indicating completion
      // 4. User role is client (verified above)
      const shouldRedirectToOnboarding = 
        isFirstTimeUser || 
        (!onboardingCompleted && !hasBackendProfile);

      // If onboarding is complete but user hasn't seen welcome page, redirect there
      const shouldRedirectToWelcome = 
        (onboardingCompleted || hasBackendProfile) && 
        !hasSeenWelcome && 
        !pathname.startsWith('/user/welcome');

      if (shouldRedirectToOnboarding) {
        console.log('Redirecting to onboarding - First time user or incomplete onboarding');
        router.push('/user/onboarding/profile');
      } else if (shouldRedirectToWelcome) {
        console.log('Redirecting to welcome page - Onboarding complete but welcome not seen');
        router.push('/user/welcome');
      }
    }
  }, [isLoaded, user, backendUser, isFirstTimeUser, pathname, router, sessionInfo, validateSessionForOperation]);

  return {
    isFirstTimeUser,
    needsOnboarding: isFirstTimeUser || 
      (!localStorage.getItem('onboarding_completed') && 
       !backendUser?.profile?.onboardingCompleted),
    sessionValid: sessionInfo.isValid,
  };
}