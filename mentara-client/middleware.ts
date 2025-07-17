import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  "/auth/sign-in",
  "/auth/sign-up",
  "/sign-in", // Legacy route support
  "/sign-up", // Legacy route support
  "/pre-assessment",
  "/therapist-application",
  "/about",
  "/community",
  "/for-therapists",
];

// Define public API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register/client",
  "/api/auth/register/therapist",
  "/api/auth/refresh",
  "/api/therapist/apply",
  "/api/therapist/upload-public",
];

// JWT utility functions for middleware
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

function getTokenFromCookies(req: NextRequest): string | null {
  return req.cookies.get('mentara_access_token')?.value || null;
}

function getTokenFromAuth(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper to get required role for a path
function getRequiredRole(pathname: string): string | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles[0]; // Only one role per route in your config
    }
  }
  return null;
}

function getDefaultPathForRole(userRole: string): string {
  switch (userRole) {
    case "client": return "/user";
    case "therapist": return "/therapist";
    case "moderator": return "/moderator";
    case "admin": return "/admin";
    default: return "/";
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public routes (exact match or path prefix for therapist-application)
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/therapist-application/');
  
  // Allow public API routes (exact match)
  const isPublicApiRoute = publicApiRoutes.includes(pathname);
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Check for JWT token in cookies or Authorization header
  const accessToken = getTokenFromCookies(req) || getTokenFromAuth(req);
  
  if (!accessToken) {
    // No token found, redirect to sign-in
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify token is not expired
  if (isTokenExpired(accessToken)) {
    // Token expired, redirect to sign-in
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    signInUrl.searchParams.set("error", "Token expired");
    return NextResponse.redirect(signInUrl);
  }

  // Decode token to get user info
  const payload = decodeJWT(accessToken);
  if (!payload || !payload.sub || !payload.role) {
    // Invalid token, redirect to sign-in
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    signInUrl.searchParams.set("error", "Invalid token");
    return NextResponse.redirect(signInUrl);
  }

  // Check role-based access for protected routes
  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && payload.role !== requiredRole) {
    // User doesn't have required role, redirect to their dashboard
    const userDashboard = getDefaultPathForRole(payload.role);
    const unauthorizedUrl = new URL(userDashboard, req.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Handle first-time user onboarding redirection
  if (payload.role === 'client' && (pathname === '/user' || pathname === '/user/dashboard')) {
    // Check if user needs onboarding
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub);
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email || '');
    response.headers.set('x-check-onboarding', 'true');
    return response;
  }

  // Allow onboarding routes for authenticated users
  if (pathname.startsWith('/onboarding') && payload.role === 'client') {
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub);
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email || '');
    return response;
  }

  // Add user info to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email || '');

  return response;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
