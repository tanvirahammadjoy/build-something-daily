import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = 10;

  const replies = await prisma.comment.findMany({
    where: { parentId: commentId, videoId: id },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      _count: { select: { replies: true } },
      replies: {
        take: 3,
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true, channelHandle: true } },
          _count: { select: { replies: true } },
        },
      },
    },
  });

  const hasMore = replies.length > limit;
  const data = hasMore ? replies.slice(0, limit) : replies;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ replies: data, nextCursor });
}
