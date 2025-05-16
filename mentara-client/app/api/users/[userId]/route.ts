import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
    });
    if (!user) throw new Error("User not found");
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch user: ${error.message}` },
      { status: 500 }
    );
  }
}
