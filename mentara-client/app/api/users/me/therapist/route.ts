import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with therapist information
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        therapist: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      therapist: user.therapist,
    });
  } catch (error) {
    console.error("Error fetching user's therapist:", error);
    return NextResponse.json(
      { error: "Failed to fetch therapist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { therapistId } = await req.json();

    if (!therapistId) {
      return NextResponse.json(
        { error: "Therapist ID is required" },
        { status: 400 }
      );
    }

    // Verify therapist exists
    const therapist = await db.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!therapist) {
      return NextResponse.json(
        { error: "Therapist not found" },
        { status: 404 }
      );
    }

    // Assign therapist to user
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: { therapistId },
      include: {
        therapist: true,
      },
    });

    return NextResponse.json({
      success: true,
      therapist: updatedUser.therapist,
    });
  } catch (error) {
    console.error("Error assigning therapist:", error);
    return NextResponse.json(
      { error: "Failed to assign therapist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove therapist assignment
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: { therapistId: null },
      include: {
        therapist: true,
      },
    });

    return NextResponse.json({
      success: true,
      therapist: null,
    });
  } catch (error) {
    console.error("Error removing therapist:", error);
    return NextResponse.json(
      { error: "Failed to remove therapist" },
      { status: 500 }
    );
  }
}
