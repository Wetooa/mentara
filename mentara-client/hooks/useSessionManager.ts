"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

interface SessionManagerOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRoleChangeDetection?: boolean;
  enableVisibilityRefresh?: boolean;
}

/**
 * Hook for managing user sessions, role changes, and automatic refresh
 */
export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    enableAutoRefresh = true,
    refreshInterval = 30 * 60 * 1000, // 30 minutes
    enableRoleChangeDetection = true,
    enableVisibilityRefresh = true,
  } = options;

  const { user, sessionData, validateSession, refreshSession, isLoaded } =
    useAuth();

  const router = useRouter();
  const lastKnownRole = useRef<UserRole | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Force refresh session and redirect if role changed
   */
  const handleRoleChange = useCallback(
    async (newRole: UserRole, oldRole: UserRole | null) => {
      try {
        await validateSession();

        toast.info(`Your role has been updated to ${newRole}. Redirecting...`);

        // Redirect to appropriate dashboard based on new role
        const redirectPaths: Record<UserRole, string> = {
          client: "/user",
          therapist: "/therapist",
          moderator: "/moderator",
          admin: "/admin",
        };

        const newPath = redirectPaths[newRole];
        if (newPath) {
          router.push(newPath);
        }
      } catch (error) {
        toast.error("Session update failed. Please sign in again.");
        router.push("/sign-in");
      }
    },
    [validateSession, router]
  );

  /**
   * Refresh session if needed
   */
  const checkAndRefreshSession = useCallback(async () => {
    if (!isLoaded || !user || !sessionData) return;

    try {
      const needsRefresh =
        sessionData.lastValidated &&
        Date.now() - sessionData.lastValidated > 24 * 60 * 60 * 1000; // 24 hours

      if (needsRefresh) {
        await refreshSession();
      }
    } catch (error) {
      // Don't show error toast for automatic refresh failures
    }
  }, [isLoaded, user, sessionData, refreshSession]);

  /**
   * Handle page visibility change (refresh session when page becomes visible)
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      checkAndRefreshSession();
    }
  }, [checkAndRefreshSession]);

  /**
   * Manual session validation (for role-sensitive operations)
   */
  const validateSessionForOperation =
    useCallback(async (): Promise<boolean> => {
      try {
        await validateSession();
        return true;
      } catch (error) {
        toast.error("Session expired. Please sign in again.");
        router.push("/sign-in");
        return false;
      }
    }, [validateSession, router]);

  /**
   * Check if current session allows access to a specific role
   */
  const hasRoleAccess = useCallback(
    (requiredRole: UserRole): boolean => {
      return sessionData?.role === requiredRole;
    },
    [sessionData]
  );

  /**
   * Get current session info
   */
  const getSessionInfo = useCallback(() => {
    // Return safe structure even when sessionData is null/undefined
    if (!sessionData) {
      return {
        isValid: false,
        role: undefined,
        userId: undefined,
        email: undefined,
        lastValidated: undefined,
        expiresAt: undefined,
      };
    }
    
    return {
      isValid: true,
      role: sessionData.role,
      userId: sessionData.userId,
      email: sessionData.email,
      lastValidated: sessionData.lastValidated,
      expiresAt: sessionData.expiresAt,
    };
  }, [sessionData]);

  // Role change detection
  useEffect(() => {
    if (!enableRoleChangeDetection || !sessionData || !isLoaded) return;

    const currentRole = sessionData.role;

    if (lastKnownRole.current && lastKnownRole.current !== currentRole) {
      handleRoleChange(currentRole, lastKnownRole.current);
    }

    lastKnownRole.current = currentRole;
  }, [
    sessionData?.role,
    isLoaded,
    enableRoleChangeDetection,
    handleRoleChange,
  ]);

  // Auto refresh setup
  useEffect(() => {
    if (!enableAutoRefresh || !isLoaded) return;

    const setupAutoRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        checkAndRefreshSession();
        setupAutoRefresh(); // Schedule next refresh
      }, refreshInterval);
    };

    setupAutoRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [enableAutoRefresh, isLoaded, refreshInterval, checkAndRefreshSession]);

  // Page visibility refresh
  useEffect(() => {
    if (!enableVisibilityRefresh) return;

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enableVisibilityRefresh, handleVisibilityChange]);

  // Initial session validation on mount
  useEffect(() => {
    if (isLoaded && user && !sessionData) {
      validateSession().catch(() => {
        // Silent fail for initial validation - user can still sign in
      });
    }
  }, [isLoaded, user, sessionData, validateSession]);

  return {
    sessionInfo: getSessionInfo(),
    validateSessionForOperation,
    hasRoleAccess,
    refreshSession: checkAndRefreshSession,
    forceValidateSession: validateSession,
  };
}

/**
 * Higher-order component to wrap components that need session management
 */
export function withSessionManager<T extends object>(
  Component: React.ComponentType<T>,
  options?: SessionManagerOptions
) {
  return function SessionManagedComponent(props: T) {
    useSessionManager(options);
    return React.createElement(Component, props);
  };
}

/**
 * Hook for role-sensitive operations
 */
export function useRoleProtectedOperation() {
  const { validateSessionForOperation, hasRoleAccess } = useSessionManager();

  const executeWithRoleCheck = useCallback(
    async (requiredRole: UserRole, operation: () => Promise<void> | void) => {
      // First validate session
      const sessionValid = await validateSessionForOperation();
      if (!sessionValid) return false;

      // Then check role access
      if (!hasRoleAccess(requiredRole)) {
        toast.error(`This operation requires ${requiredRole} role.`);
        return false;
      }

      // Execute operation
      try {
        await operation();
        return true;
      } catch (error) {
        return false;
      }
    },
    [validateSessionForOperation, hasRoleAccess]
  );

  return { executeWithRoleCheck, hasRoleAccess };
}
