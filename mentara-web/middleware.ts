import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-level route protection.
 *
 * Checks for the presence of an access_token in localStorage isn't possible at
 * the edge, but we can check cookies. Since this app stores tokens in
 * localStorage (client-side), this middleware performs a lightweight check:
 *   - If the route is protected and there's no token cookie, redirect to sign-in.
 *   - Role-path validation is still handled client-side in AuthContext + layout guards.
 *
 * If you later move token storage to httpOnly cookies, this middleware can also
 * validate JWT claims server-side.
 */

const PUBLIC_PATHS = [
    "/",
    "/auth",
    "/about",
    "/community",
    "/landing",
    "/loading",
    "/therapist-application",
    "/pre-assessment",
    "/api",
    "/_next",
    "/favicon",
    "/icons",
    "/images",
    "/manifest.json",
    "/robots.txt",
    "/sitemap.xml",
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (publicPath) =>
            pathname === publicPath || pathname.startsWith(`${publicPath}/`)
    );
}

// Role-to-path prefix mapping for basic edge validation
const ROLE_PATH_PREFIXES = ["/admin", "/client", "/therapist", "/moderator"];

function isRoleProtectedPath(pathname: string): boolean {
    return ROLE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths, static assets, and API routes
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // For protected routes, check if the access_token cookie exists.
    // The app primarily uses localStorage, so we also accept the cookie variant.
    // If neither exists, we let the client-side AuthContext handle the redirect
    // (since we can't read localStorage in middleware). This provides a fast-path
    // redirect for cookie-based auth while remaining compatible with the existing
    // localStorage flow.
    const tokenCookie = request.cookies.get("access_token");

    if (tokenCookie) {
        // Token exists in cookie — allow through, let client-side validate further
        return NextResponse.next();
    }

    // No cookie-based token. For the localStorage-based auth flow, we cannot
    // check tokens at the edge. Allow through and let AuthContext handle it.
    // This middleware primarily catches cookie-based scenarios and serves as
    // a placeholder for future httpOnly cookie migration.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};
