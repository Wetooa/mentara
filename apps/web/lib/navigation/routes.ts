/**
 * Route constants and helpers for navigation
 */

export const ROUTES = {
  // Client routes
  CLIENT: {
    DASHBOARD: "/client",
    SESSIONS: "/client/sessions",
    SESSION_DETAIL: (id: string) => `/client/sessions/${id}`,
    SESSIONS_UPCOMING: "/client/sessions/upcoming",
    SESSIONS_COMPLETED: "/client/sessions/completed",
    THERAPIST: "/client/therapist",
    COMMUNITY: "/client/community",
    COMMUNITY_POST: (id: string) => `/client/community/posts/${id}`,
    MESSAGES: "/client/messages",
    WORKSHEETS: "/client/worksheets",
    WORKSHEET_DETAIL: (taskId: string) => `/client/worksheets/${taskId}`,
    JOURNAL: "/client/journal",
    BOOKING: "/client/booking",
    PROFILE: "/client/profile",
    PROFILE_DETAIL: (id: string) => `/client/profile/${id}`,
    MEETING: (id: string) => `/client/meeting/${id}`,
    VIDEO_CALL: "/client/video-call",
    WELCOME: "/client/welcome",
  },
  // Therapist routes
  THERAPIST: {
    DASHBOARD: "/therapist",
    PATIENTS: "/therapist/patients",
    PATIENT_DETAIL: (patientId: string) => `/therapist/patients/${patientId}`,
    SCHEDULE: "/therapist/schedule",
    COMMUNITY: "/therapist/community",
    COMMUNITY_POST: (id: string) => `/therapist/community/posts/${id}`,
    MESSAGES: "/therapist/messages",
    WORKSHEETS: "/therapist/worksheets",
    WORKSHEET_DETAIL: (id: string) => `/therapist/worksheets/${id}`,
    PROFILE: "/therapist/profile",
    PROFILE_DETAIL: (id: string) => `/therapist/profile/${id}`,
    MEETING: (id: string) => `/therapist/meeting/${id}`,
    VIDEO_CALL: "/therapist/video-call",
    WELCOME: "/therapist/welcome",
  },
  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    APPLICATIONS: "/admin/therapist-applications",
    ANALYTICS: "/admin/analytics",
    REPORTS: "/admin/reports",
    CONTENT: "/admin/content",
    VIDEO_CALL: "/admin/video-call",
  },
  // Moderator routes
  MODERATOR: {
    DASHBOARD: "/moderator",
    CONTENT: "/moderator/content",
    REPORTS: "/moderator/reports",
    USERS: "/moderator/users",
    AUDIT_LOGS: "/moderator/audit-logs",
    PROFILE: "/moderator/profile",
    PROFILE_DETAIL: (id: string) => `/moderator/profile/${id}`,
    VIDEO_CALL: "/moderator/video-call",
  },
  // Public routes
  PUBLIC: {
    HOME: "/",
    SIGN_IN: "/auth/sign-in",
    ABOUT: "/about",
    COMMUNITY: "/community",
    LANDING: "/landing",
    THERAPIST_APPLICATION: "/therapist-application",
    PRE_ASSESSMENT: "/pre-assessment",
  },
} as const;

/**
 * Get the parent route for a given path
 */
export function getParentRoute(pathname: string): string | null {
  // Remove trailing slash
  const cleanPath = pathname.replace(/\/$/, "");
  
  // If already at root level, return null
  if (cleanPath === "" || cleanPath === "/") {
    return null;
  }

  // Get parent by removing last segment
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "/";
  }

  segments.pop();
  return "/" + segments.join("/");
}

/**
 * Get the role from a pathname
 */
export function getRoleFromPath(pathname: string): "client" | "therapist" | "admin" | "moderator" | null {
  if (pathname.startsWith("/client")) return "client";
  if (pathname.startsWith("/therapist")) return "therapist";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/moderator")) return "moderator";
  return null;
}

/**
 * Get dashboard route for a role
 */
export function getDashboardRoute(role: string): string {
  switch (role) {
    case "client":
      return ROUTES.CLIENT.DASHBOARD;
    case "therapist":
      return ROUTES.THERAPIST.DASHBOARD;
    case "admin":
      return ROUTES.ADMIN.DASHBOARD;
    case "moderator":
      return ROUTES.MODERATOR.DASHBOARD;
    default:
      return "/";
  }
}
