import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(req: NextRequest, props: Props) {
  try {
    await auth.protect();
    const params = await props.params;
    const communities = await prisma.community.findMany({
      where: {
        members: {
          some: { userId: params.userId },
        },
      },
    });
    return NextResponse.json(communities);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch communities: ${error.message}` },
      { status: 500 }
    );
  }
}
