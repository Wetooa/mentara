import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — lightweight route protection.
 *
 * Checks for the presence of an `access_token` cookie on protected routes.
 * This is NOT a full auth check (tokens are not validated here); it's a
 * fast-fail guard that complements the client-side AuthContext.
 *
 * NOTE: The current auth flow stores tokens in localStorage (client-side only).
 * For this middleware to kick in, the login flow must *also* set the token as a
 * cookie (even a non-httpOnly one).  When migrating to httpOnly cookies in the
 * future, this middleware will naturally become the primary server-side guard.
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
    "/debug",
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths, assets, and Next.js internals
    if (
        isPublicPath(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Protected route — check for token cookie
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
        const signInUrl = request.nextUrl.clone();
        signInUrl.pathname = "/auth/sign-in";
        signInUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
