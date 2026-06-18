import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { VideoStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? "12"), 48);
  const sort = searchParams.get("sort") ?? "recent";
  const userId = searchParams.get("userId") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const feed = searchParams.get("feed") ?? undefined;

  const where: any = { status: VideoStatus.PUBLIC };
  if (userId) where.userId = userId;
  if (tag) where.tags = { some: { name: tag.toLowerCase() } };

  if (feed === "subscriptions") {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: session.user.id },
      select: { channelId: true },
    });
    const channelIds = subscriptions.map((s) => s.channelId);
    if (channelIds.length === 0) return NextResponse.json({ videos: [], nextCursor: null });
    where.userId = { in: channelIds };
  }

  const orderBy =
    sort === "trending"
      ? [{ views: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const videos = await prisma.video.findMany({
    where, orderBy,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      _count: { select: { likes: { where: { isLike: true } }, comments: true } },
    },
  });

  let nextCursor: string | null = null;
  if (videos.length > limit) {
    const nextItem = videos.pop();
    nextCursor = nextItem?.id ?? null;
  }

  return NextResponse.json({ videos, nextCursor });
}
