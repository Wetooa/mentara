/**
 * Breadcrumb generation utilities
 */

import { getRoleFromPath, getDashboardRoute, getParentRoute } from "./routes";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Route segment to label mapping
 */
const ROUTE_LABELS: Record<string, string> = {
  // Client routes
  client: "Client",
  sessions: "Sessions",
  therapist: "Therapist",
  community: "Community",
  messages: "Messages",
  worksheets: "Worksheets",
  journal: "Journal",
  booking: "Booking",
  profile: "Profile",
  meeting: "Meeting",
  "video-call": "Video Call",
  welcome: "Welcome",
  upcoming: "Upcoming",
  completed: "Completed",
  posts: "Posts",
  
  // Therapist routes
  therapist: "Therapist",
  patients: "Patients",
  schedule: "Schedule",
  
  // Admin routes
  admin: "Admin",
  users: "Users",
  applications: "Applications",
  analytics: "Analytics",
  reports: "Reports",
  content: "Content",
  
  // Moderator routes
  moderator: "Moderator",
  "audit-logs": "Audit Logs",
  
  // Common
  dashboard: "Dashboard",
};

/**
 * Generate breadcrumbs from a pathname
 */
export function generateBreadcrumbs(
  pathname: string,
  context?: {
    sessionTitle?: string;
    worksheetTitle?: string;
    patientName?: string;
    postTitle?: string;
    userName?: string;
  }
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Remove trailing slash and query params
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");
  
  // If at root, return empty
  if (cleanPath === "" || cleanPath === "/") {
    return breadcrumbs;
  }

  // Get role and add dashboard
  const role = getRoleFromPath(cleanPath);
  if (role) {
    breadcrumbs.push({
      label: "Dashboard",
      href: getDashboardRoute(role),
    });
  }

  // Split path into segments
  const segments = cleanPath.split("/").filter(Boolean);
  
  // Skip the first segment (role) as we already added dashboard
  if (segments.length > 0 && ["client", "therapist", "admin", "moderator"].includes(segments[0])) {
    segments.shift();
  }

  // Build breadcrumbs from segments
  let currentPath = role ? `/${role}` : "";
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Check if this is a dynamic segment (UUID-like)
    const isDynamicSegment = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
                             /^[0-9a-f]{24}$/i.test(segment) || // MongoDB ObjectId
                             /^\d+$/.test(segment); // Numeric ID
    
    let label: string;
    
    if (isDynamicSegment) {
      // Use context for dynamic segments
      if (i === segments.length - 1) {
        // Last segment - use context if available
        if (context?.sessionTitle) {
          label = context.sessionTitle;
        } else if (context?.worksheetTitle) {
          label = context.worksheetTitle;
        } else if (context?.patientName) {
          label = context.patientName;
        } else if (context?.postTitle) {
          label = context.postTitle;
        } else if (context?.userName) {
          label = context.userName;
        } else {
          // Fallback based on parent segment
          const parentSegment = segments[i - 1];
          if (parentSegment === "sessions") {
            label = "Session Details";
          } else if (parentSegment === "worksheets" || parentSegment === "taskId") {
            label = "Worksheet Details";
          } else if (parentSegment === "patients") {
            label = "Patient Details";
          } else if (parentSegment === "posts") {
            label = "Post Details";
          } else if (parentSegment === "profile") {
            label = "Profile";
          } else if (parentSegment === "meeting") {
            label = "Meeting";
          } else {
            label = "Details";
          }
        }
      } else {
        // Not last segment - use parent segment context
        label = "Details";
      }
    } else {
      // Use route label mapping
      label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    }
    
    // Don't add breadcrumb if it's the same as the previous one (avoid duplicates)
    if (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].href !== currentPath) {
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Get breadcrumb label for a specific route segment
 */
export function getBreadcrumbLabel(segment: string): string {
  return ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}
