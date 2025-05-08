import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

const isPublicRoute = createRouteMatcher(["/(auth)(.*)"]);

const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isTherapistRoute = createRouteMatcher(["/therapist(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export function middleware(req) {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "http://localhost:5000", // Backend origin
        "Access-Control-Allow-Methods": "GET,DELETE,PATCH,POST,PUT",
        "Access-Control-Allow-Headers":
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      },
    });
  }

  // For non-OPTIONS requests
  const res = NextResponse.next();

  // Add the CORS headers to the response
  res.headers.append("Access-Control-Allow-Credentials", "true");
  res.headers.append("Access-Control-Allow-Origin", "http://localhost:5000"); // Backend origin
  res.headers.append(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT"
  );
  res.headers.append(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  return res;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // if (!isProd) {
  //   return NextResponse.next();
  // }

  const role = (await auth()).sessionClaims?.metadata?.role;

  // if (isUserRoute(req) && ) {

  // }

  // Protect non-public routes
  // if (!isPublicRoute(req)) {
  //   await auth.protect();
  // }

  // FIX: adjusting this for faster load times
  // if (userId) {
  //   const client = await clerkClient();
  //
  //   const user = await client.users.getUser(userId);
  //
  //   if (user.publicMetadata.role == "therapist") {
  //     const path = req.nextUrl.pathname;
  //
  //     // Only redirect if they're at the root, sign-in, or sign-up page
  //     if (
  //       path === "/" ||
  //       path === "/sign-in" ||
  //       path.startsWith("/sign-in/") ||
  //       path === "/sign-up" ||
  //       path.startsWith("/sign-up/")
  //     ) {
  //       const url = new URL("/therapist/dashboard", req.url);
  //       return NextResponse.redirect(url);
  //     }
  //   }
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
