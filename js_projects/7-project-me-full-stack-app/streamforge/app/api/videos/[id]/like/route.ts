import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const LikeSchema = z.object({ isLike: z.boolean() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = LikeSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { isLike } = result.data;
  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
  });

  if (existing && existing.isLike === isLike) {
    await prisma.like.delete({ where: { userId_videoId: { userId: session.user.id, videoId: params.id } } });
    return NextResponse.json({ action: "removed", isLike: null });
  }

  const like = await prisma.like.upsert({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
    create: { userId: session.user.id, videoId: params.id, isLike },
    update: { isLike },
  });

  return NextResponse.json({ action: "upserted", isLike: like.isLike });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();

  const [likes, dislikes, userReaction] = await Promise.all([
    prisma.like.count({ where: { videoId: params.id, isLike: true } }),
    prisma.like.count({ where: { videoId: params.id, isLike: false } }),
    session
      ? prisma.like.findUnique({
          where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
          select: { isLike: true },
        })
      : null,
  ]);

  return NextResponse.json({ likes, dislikes, userReaction: userReaction?.isLike ?? null });
}
