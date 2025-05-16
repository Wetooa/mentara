// pages/api/communities/index.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const communities = await prisma.community.findMany();
    return NextResponse.json(communities);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch communities: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const community = await prisma.community.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return NextResponse.json(community);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create community: ${error.message}` },
      { status: 500 }
    );
  }
}
