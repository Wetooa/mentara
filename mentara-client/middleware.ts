import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserRoleFromPublicMetadata } from "@/lib/auth";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  "/user": ["user"],
  "/therapist": ["therapist"],
  "/admin": ["admin"],
};

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/landing",
  "/sign-in",
  "/sign-up",
  "/pre-assessment",
  "/therapist_signup",
  "/about",
  "/community",
  "/for-therapists",
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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const authObj = await auth();

  // If user is authenticated and visits the root page, redirect to their dashboard
  if (authObj.userId && req.nextUrl.pathname === "/") {
    const userRole = getUserRoleFromPublicMetadata(authObj.sessionClaims);

    let redirectPath = "/";
    if (userRole === "user") redirectPath = "/user";
    else if (userRole === "therapist") redirectPath = "/therapist";
    else if (userRole === "admin") redirectPath = "/admin";
    if (redirectPath !== "/") {
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // Allow all public routes
  if (publicRoutes.includes(req.nextUrl.pathname)) {
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
    const userRole = getUserRoleFromPublicMetadata(authObj.sessionClaims);
    if (userRole !== requiredRole) {
      // Redirect to the correct dashboard for their role, or home
      let redirectPath = "/";
      if (userRole === "user") redirectPath = "/user";
      else if (userRole === "therapist") redirectPath = "/therapist";
      else if (userRole === "admin") redirectPath = "/admin";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
