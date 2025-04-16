import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    communityId: string;
  }>;
};

export async function GET(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(req.url);

    const afterId = searchParams.get("afterId");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const posts = await prisma.post.findMany({
      where: {
        communityId: params.communityId,
      },
      take: pageSize,
      ...(afterId && {
        skip: 1,
        cursor: { id: afterId },
      }),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        files: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Failed to fetch community posts: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
