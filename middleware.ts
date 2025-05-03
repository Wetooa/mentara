import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/landing",
  "/pre-assessment",
  "/about",
  "/main",
  "/main(.*)",

  "/user-welcome",

  "/admin",
  "/messages",
  "/therapist(.*)",
  "/admin-login",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId) {
    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    if (user.publicMetadata.role == "therapist") {
      const path = req.nextUrl.pathname;

      // Only redirect if they're at the root, sign-in, or sign-up page
      if (
        path === "/" ||
        path === "/sign-in" ||
        path.startsWith("/sign-in/") ||
        path === "/sign-up" ||
        path.startsWith("/sign-up/")
      ) {
        const url = new URL("/therapist/dashboard", req.url);
        return NextResponse.redirect(url);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
