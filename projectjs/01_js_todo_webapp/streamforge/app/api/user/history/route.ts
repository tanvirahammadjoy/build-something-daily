import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = 20;

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      video: {
        include: {
          user: { select: { id: true, name: true, image: true, channelHandle: true } },
          _count: { select: { likes: { where: { isLike: true } }, comments: true } },
        },
      },
    },
  });

  const hasMore = history.length > limit;
  const data = hasMore ? history.slice(0, limit) : history;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({
    history: data.map((h) => ({ ...h.video, watchedAt: h.watchedAt })),
    nextCursor,
  });
}

export async function DELETE(_req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.watchHistory.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
