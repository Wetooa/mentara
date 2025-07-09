import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/lib/auth";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  "/user": ["client"],
  "/therapist": ["therapist"],
  "/moderator": ["moderator"],
  "/admin": ["admin"],
};

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/landing",
  "/sign-in",
  "/sign-up",
  "/pre-assessment",
  "/therapist-application",
  "/about",
  "/community",
  "/for-therapists",
];

// Define public API routes that don't require authentication
const publicApiRoutes = [
  "/api/therapist/apply",
  "/api/therapist/upload-public",
  "/api/auth/validate-role",
  "/api/auth/session-info",
  "/api/auth/refresh-session",
  "/api/auth/clear-session",
];

// Helper to get required role for a path
function getRequiredRole(pathname: string): string | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles[0]; // Only one role per route in your config
    }
  }
  return null;
}

function getDefaultPathForRole(userRole: UserRole): string {
  switch (userRole) {
    case "client": return "/user";
    case "therapist": return "/therapist";
    case "moderator": return "/moderator";
    case "admin": return "/admin";
    default: return "/";
  }
}

// Since we're using localStorage, role checking will happen on client-side
// Middleware will only handle Clerk authentication

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const authObj = await auth();
  const { pathname } = req.nextUrl;

  // Allow all public routes (exact match or path prefix for therapist-application)
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/therapist-application/');
  
  // Allow public API routes (exact match)
  const isPublicApiRoute = publicApiRoutes.includes(pathname);
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // If not authenticated with Clerk, redirect to sign-in
  if (!authObj.userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // For authenticated users, allow access to protected routes
  // Role-based access control will be handled on the client-side using localStorage session
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
