import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
  "/user": ["client"],
  "/therapist": ["therapist"],
  "/moderator": ["moderator"],
  "/admin": ["admin"],
};

// Define high-security routes that require additional validation
const highSecurityRoutes = [
  "/admin",
  "/moderator",
];

// Define routes that require specific approval status for therapists
const therapistApprovalRequiredRoutes = [
  "/therapist/dashboard",
  "/therapist/patients",
  "/therapist/schedule",
  "/therapist/messages",
];

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/landing",
  "/about",
  "/community",
  "/for-therapists",
  "/pre-assessment",
  "/therapist-application",
  // Legacy auth routes (will be deprecated)
  "/auth/sign-in",
  "/auth/sign-up",
  "/sign-in",
  "/sign-up",
  // Role-specific auth routes
  "/client/sign-in",
  "/therapist/sign-in",
  "/admin/sign-in",
  "/moderator/sign-in",
  "/client/onboarding",
  // OAuth and verification routes
  "/oauth-callback",
  "/verify-account",
  "/verify",
  "/sso-callback",
  "/reset-password",
];

// Define public API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register", 
  "/api/auth/refresh",
  "/api/auth/request-password-reset",
  "/api/auth/reset-password", 
  "/api/auth/validate-reset-token",
  "/api/auth/send-verification-email",
  "/api/auth/verify-email",
  "/api/auth/resend-verification-email",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/microsoft", 
  "/api/auth/microsoft/callback",
  "/api/auth/therapist/apply-with-documents",
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
  // Try multiple possible cookie names for backwards compatibility
  return req.cookies.get('mentara_access_token')?.value || 
         req.cookies.get('access_token')?.value || 
         req.cookies.get('accessToken')?.value || 
         null;
}

function getTokenFromAuth(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper to check if user is accessing wrong role sign-in page
function isWrongRoleSignIn(pathname: string, userRole?: string): boolean {
  if (!userRole) return false;
  
  const roleSignInMap = {
    client: '/client/sign-in',
    therapist: '/therapist/sign-in', 
    admin: '/admin/sign-in',
    moderator: '/moderator/sign-in'
  };
  
  const correctSignIn = roleSignInMap[userRole as keyof typeof roleSignInMap];
  const isSignInPage = pathname.endsWith('/sign-in');
  
  return isSignInPage && pathname !== correctSignIn;
}

// Helper to check if route requires high security validation
function isHighSecurityRoute(pathname: string): boolean {
  return highSecurityRoutes.some(route => pathname.startsWith(route));
}

// Helper to check if therapist route requires approval
function requiresTherapistApproval(pathname: string): boolean {
  return therapistApprovalRequiredRoutes.some(route => pathname.startsWith(route));
}

// Helper to validate token more strictly for high-security routes
function validateTokenSecurity(token: string, isHighSecurity: boolean): boolean {
  const decoded = decodeJWT(token);
  if (!decoded) return false;
  
  // For high-security routes, check additional token properties
  if (isHighSecurity) {
    // Check if token was issued recently (within last 24 hours for admin/moderator)
    const issuedAt = decoded.iat;
    const twentyFourHoursAgo = (Date.now() / 1000) - (24 * 60 * 60);
    
    if (!issuedAt || issuedAt < twentyFourHoursAgo) {
      return false;
    }
    
    // Check for admin/moderator specific claims
    if ((decoded.role === 'admin' || decoded.role === 'moderator') && !decoded.permissions) {
      return false;
    }
  }
  
  return true;
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

// Helper to get role-specific sign-in URL
function getRoleSpecificSignInUrl(role?: string, fallbackPath?: string): string {
  if (role) {
    switch (role) {
      case "client": return "/client/sign-in";
      case "therapist": return "/therapist/sign-in";
      case "admin": return "/admin/sign-in";
      case "moderator": return "/moderator/sign-in";
    }
  }
  
  // Determine role from path if not provided
  if (fallbackPath) {
    if (fallbackPath.startsWith("/user") || fallbackPath.startsWith("/client")) {
      return "/client/sign-in";
    }
    if (fallbackPath.startsWith("/therapist")) {
      return "/therapist/sign-in";
    }
    if (fallbackPath.startsWith("/admin")) {
      return "/admin/sign-in";
    }
    if (fallbackPath.startsWith("/moderator")) {
      return "/moderator/sign-in";
    }
  }
  
  // Default fallback - redirect to client sign-in
  return "/client/sign-in";
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
    // No token found, redirect to role-specific sign-in
    const roleSpecificSignIn = getRoleSpecificSignInUrl(undefined, pathname);
    const signInUrl = new URL(roleSpecificSignIn, req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify token is not expired
  if (isTokenExpired(accessToken)) {
    // Token expired, redirect to role-specific sign-in
    const roleSpecificSignIn = getRoleSpecificSignInUrl(undefined, pathname);
    const signInUrl = new URL(roleSpecificSignIn, req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    signInUrl.searchParams.set("error", "Token expired");
    return NextResponse.redirect(signInUrl);
  }

  // Decode token to get user info
  const payload = decodeJWT(accessToken);
  if (!payload || !payload.sub || !payload.role) {
    // Invalid token, redirect to role-specific sign-in
    const roleSpecificSignIn = getRoleSpecificSignInUrl(undefined, pathname);
    const signInUrl = new URL(roleSpecificSignIn, req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    signInUrl.searchParams.set("error", "Invalid token");
    return NextResponse.redirect(signInUrl);
  }

  // Check if user is trying to access wrong role's sign-in page while authenticated
  if (isWrongRoleSignIn(pathname, payload.role)) {
    // Redirect authenticated user to their correct dashboard
    const userDashboard = getDefaultPathForRole(payload.role);
    const dashboardUrl = new URL(userDashboard, req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Enhanced security validation for high-security routes
  if (isHighSecurityRoute(pathname)) {
    if (!validateTokenSecurity(accessToken, true)) {
      // Security validation failed, force re-authentication
      const roleSpecificSignIn = getRoleSpecificSignInUrl(payload.role, pathname);
      const signInUrl = new URL(roleSpecificSignIn, req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      signInUrl.searchParams.set("error", "Security validation required");
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Check role-based access for protected routes
  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && payload.role !== requiredRole) {
    // User doesn't have required role, redirect to their dashboard
    const userDashboard = getDefaultPathForRole(payload.role);
    const unauthorizedUrl = new URL(userDashboard, req.url);
    return NextResponse.redirect(unauthorizedUrl);
  }
  
  // Special handling for therapist approval-required routes
  if (payload.role === 'therapist' && requiresTherapistApproval(pathname)) {
    // Check if therapist is approved (this will be handled by the component)
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub);
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email || '');
    response.headers.set('x-require-approval-check', 'true');
    return response;
  }

  // Handle role-specific onboarding and special cases
  
  // Client onboarding handling
  if (payload.role === 'client') {
    if (pathname === '/user' || pathname === '/user/dashboard') {
      // Check if user needs onboarding
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub);
      response.headers.set('x-user-role', payload.role);
      response.headers.set('x-user-email', payload.email || '');
      response.headers.set('x-check-onboarding', 'true');
      return response;
    }
    
    // Allow client onboarding routes
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/client/onboarding')) {
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub);
      response.headers.set('x-user-role', payload.role);
      response.headers.set('x-user-email', payload.email || '');
      return response;
    }
  }
  
  // Therapist application status handling
  if (payload.role === 'therapist') {
    // Check if therapist is accessing dashboard but not approved
    if (pathname.startsWith('/therapist') && !pathname.includes('pending') && !pathname.includes('rejected') && !pathname.includes('suspended')) {
      // Add approval status check header
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub);
      response.headers.set('x-user-role', payload.role);
      response.headers.set('x-user-email', payload.email || '');
      response.headers.set('x-check-approval-status', 'true');
      return response;
    }
  }
  
  // Admin and Moderator permission handling
  if (payload.role === 'admin' || payload.role === 'moderator') {
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub);
    response.headers.set('x-user-role', payload.role);
    response.headers.set('x-user-email', payload.email || '');
    response.headers.set('x-check-permissions', 'true');
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
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/",
    // Include API routes and TRPC
    "/(api|trpc)(.*)",
    // Explicitly include role-based auth routes
    "/client/:path*",
    "/therapist/:path*", 
    "/admin/:path*",
    "/moderator/:path*",
    // Include protected user routes
    "/user/:path*",
    "/onboarding/:path*"
  ],
};
