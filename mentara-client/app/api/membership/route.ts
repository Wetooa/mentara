import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const membership = await prisma.membership.create({
      data: {
        userId: data.userId,
        communityId: data.communityId,
        role: data.role,
      },
    });
    return NextResponse.json(membership);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to add membership: ${error.message}` },
      { status: 500 }
    );
  }
}
