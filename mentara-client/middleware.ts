import { clerkMiddleware, createClerkClient } from "@clerk/nextjs/server";
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

function getHandleAllowedPath(userRole: UserRole) {
  let redirectPath = "/";
  if (userRole === "client") redirectPath = "/user";
  else if (userRole === "therapist") redirectPath = "/therapist";
  else if (userRole === "moderator") redirectPath = "/moderator";
  else if (userRole === "admin") redirectPath = "/admin";
  return redirectPath;
}

// Utility to extract role from Clerk sessionClaims or publicMetadata
export async function getUserRoleFromPublicMetadata(
  userId: string
): Promise<UserRole | null> {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const user = await clerkClient.users.getUser(userId);
  return user?.publicMetadata.role as UserRole;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const authObj = await auth();

  // If user is authenticated and visits the root page, redirect to their dashboard
  if (authObj.userId && req.nextUrl.pathname === "/") {
    const userRole = await getUserRoleFromPublicMetadata(authObj.userId);

    if (!userRole) {
      return NextResponse.next();
    }

    const redirectPath = getHandleAllowedPath(userRole);
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Allow all public routes (exact match or path prefix for therapist-application)
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname) || 
                       req.nextUrl.pathname.startsWith('/therapist-application/');
  
  // Allow public API routes (exact match)
  const isPublicApiRoute = publicApiRoutes.includes(req.nextUrl.pathname);
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to sign-in
  if (!authObj.userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  const requiredRole = getRequiredRole(req.nextUrl.pathname);
  if (requiredRole) {
    const userRole = await getUserRoleFromPublicMetadata(authObj.userId);

    if (!userRole) {
      return NextResponse.next();
    }

    if (userRole !== requiredRole) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
