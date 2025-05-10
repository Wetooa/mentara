import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get the current authenticated user from Clerk
    const { userId } = await auth();

    // If no user is authenticated, return unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Query Prisma to check if the user has admin privileges
    const adminUser = await prisma.adminUser.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Not authorized as admin" },
        { status: 403 }
      );
    }

    // User is authenticated and has admin privileges
    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        role: adminUser.role,
        permissions: adminUser.permissions,
      },
    });
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
