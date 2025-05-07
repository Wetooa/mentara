import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";
const isPublicRoute = createRouteMatcher(["/(public)(.*)"]);

const isUserRoute = createRouteMatcher(["/user(.*)"]);
const isTherapistRoute = createRouteMatcher(["/therapist(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isModerator = createRouteMatcher(["/moderator(.*)"]);

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
