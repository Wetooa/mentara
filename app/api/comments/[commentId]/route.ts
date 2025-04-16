// pages/api/comments/[commentId].ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function GET(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const { commentId } = params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: true,
      },
    });
    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found.`);
    }
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch comment: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const { commentId } = params;

    const data = await req.json();
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
    });
    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update comment: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const { commentId } = params;

    await prisma.comment.delete({
      where: { id: commentId },
    });
    return NextResponse.json({
      message: `Comment with ID ${commentId} deleted successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete comment: ${error.message}` },
      { status: 500 }
    );
  }
}
