import { UserRole } from "@/lib/auth";

// Session data interface
export interface SessionData {
  userId: string;
  role: UserRole;
  email: string;
  firstName?: string;
  lastName?: string;
  permissions?: string[];
  lastValidated: number;
  expiresAt: number;
}

// Session configuration
const SESSION_CONFIG = {
  storageKey: "mentara-session",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  refreshThreshold: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

/**
 * Simple encoding utility for session data (localStorage compatible)
 */
function encode(data: string): string {
  // Browser-compatible base64 encoding for localStorage
  return btoa(unescape(encodeURIComponent(data)));
}

function decode(encodedData: string): string {
  try {
    return decodeURIComponent(escape(atob(encodedData)));
  } catch {
    throw new Error("Failed to decode session data");
  }
}

/**
 * Create a new session data object
 */
export function createSession(
  userData: Omit<SessionData, "lastValidated" | "expiresAt">
): SessionData {
  const now = Date.now();
  return {
    ...userData,
    lastValidated: now,
    expiresAt: now + SESSION_CONFIG.maxAge,
  };
}

/**
 * Set session in localStorage
 */
export function setSession(sessionData: SessionData): void {
  if (typeof window === "undefined") return; // SSR safe

  try {
    const encodedData = encode(JSON.stringify(sessionData));
    localStorage.setItem(SESSION_CONFIG.storageKey, encodedData);
  } catch (error) {
    console.error("Failed to set session:", error);
  }
}

/**
 * Get session data from localStorage
 */
export function getSession(): SessionData | null {
  if (typeof window === "undefined") return null; // SSR safe

  try {
    const encodedSession = localStorage.getItem(SESSION_CONFIG.storageKey);

    if (!encodedSession) {
      return null;
    }

    const decodedData = decode(encodedSession);
    const sessionData: SessionData = JSON.parse(decodedData);

    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      clearSession();
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error("Failed to get session:", error);
    clearSession();
    return null;
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  if (typeof window === "undefined") return; // SSR safe

  try {
    localStorage.removeItem(SESSION_CONFIG.storageKey);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Check if session needs refresh based on last validation time
 */
export function shouldRefreshSession(sessionData: SessionData): boolean {
  const timeSinceLastValidation = Date.now() - sessionData.lastValidated;
  return timeSinceLastValidation > SESSION_CONFIG.refreshThreshold;
}

/**
 * Update session with new validation time
 */
export function refreshSession(sessionData: SessionData): SessionData {
  return {
    ...sessionData,
    lastValidated: Date.now(),
    expiresAt: Date.now() + SESSION_CONFIG.maxAge,
  };
}

/**
 * Get user role from session (fast access)
 */
export function getRoleFromSession(): UserRole | null {
  const session = getSession();
  return session?.role || null;
}

/**
 * Validate session data structure
 */
export function isValidSessionData(data: any): data is SessionData {
  return (
    data &&
    typeof data === "object" &&
    typeof data.userId === "string" &&
    typeof data.role === "string" &&
    typeof data.email === "string" &&
    typeof data.lastValidated === "number" &&
    typeof data.expiresAt === "number" &&
    ["client", "therapist", "moderator", "admin"].includes(data.role)
  );
}

/**
 * Client-side session utilities (for frontend)
 */
export const clientSession = {
  /**
   * Get session data from client-side (read-only)
   */
  getSessionInfo: (): {
    isValid: boolean;
    role?: UserRole;
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    lastValidated?: number;
    expiresAt?: number;
  } | null => {
    const session = getSession();

    if (!session) {
      return { isValid: false };
    }

    return {
      isValid: true,
      role: session.role,
      userId: session.userId,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      lastValidated: session.lastValidated,
      expiresAt: session.expiresAt,
    };
  },

  /**
   * Refresh session from client-side
   */
  refreshSession: async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionData) {
          setSession(data.sessionData);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Clear session from client-side
   */
  clearSession: (): void => {
    clearSession();
  },

  /**
   * Set session data
   */
  setSession: (sessionData: SessionData): void => {
    setSession(sessionData);
  },

  /**
   * Check if session exists and is valid
   */
  isValid: (): boolean => {
    const session = getSession();
    return !!session;
  },

  /**
   * Get current user role
   */
  getRole: (): UserRole | null => {
    return getRoleFromSession();
  },
};

export { SESSION_CONFIG };
