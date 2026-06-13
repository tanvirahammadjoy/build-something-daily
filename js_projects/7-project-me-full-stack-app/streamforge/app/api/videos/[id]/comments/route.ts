import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = CommentSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

  if (result.data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: result.data.parentId },
      select: { videoId: true, parentId: true },
    });
    if (!parent || parent.videoId !== params.id)
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    if (parent.parentId) {
      const grandparent = await prisma.comment.findUnique({
        where: { id: parent.parentId },
        select: { parentId: true },
      });
      if (grandparent?.parentId)
        return NextResponse.json({ error: "Maximum comment depth reached" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      body: result.data.body,
      userId: session.user.id,
      videoId: params.id,
      parentId: result.data.parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      _count: { select: { replies: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = 10;

  const comments = await prisma.comment.findMany({
    where: { videoId: params.id, parentId: null },
    orderBy: { createdAt: "desc" },
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
          replies: {
            take: 3,
            orderBy: { createdAt: "asc" },
            include: {
              user: { select: { id: true, name: true, image: true, channelHandle: true } },
              _count: { select: { replies: true } },
            },
          },
        },
      },
    },
  });

  const hasMore = comments.length > limit;
  const data = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ comments: data, nextCursor });
}
