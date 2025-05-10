import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";
const isPublicRoute = createRouteMatcher(["/(public)(.*)"]);

const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isTherapistRoute = createRouteMatcher(["/therapist(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isModerator = createRouteMatcher(["/moderator(.*)"]);

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
  const { sessionClaims } = await auth();

  // if (!isProd) {
  //   return NextResponse.next();
  // }

  const role = sessionClaims?.metadata?.role;

  if (isUserRoute(req) && role === "user") {
    return NextResponse.next();
  }
  if (isTherapistRoute(req) && role === "therapist") {
    return NextResponse.next();
  }
  if (isAdminRoute(req) && role === "admin") {
    return NextResponse.next();
  }
  if (isModerator(req) && role === "moderator") {
    return NextResponse.next();
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
