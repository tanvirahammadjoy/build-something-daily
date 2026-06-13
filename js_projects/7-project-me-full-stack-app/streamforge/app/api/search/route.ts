import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tag = searchParams.get("tag") ?? undefined;
  const sort = searchParams.get("sort") ?? "relevance";
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = 12;

  if (!q && !tag) return NextResponse.json({ videos: [], nextCursor: null });

  const where: any = { status: "PUBLIC" };
  if (tag) where.tags = { some: { name: tag.toLowerCase() } };

  if (q) {
    const sanitised = q.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const tsQuery = sanitised.split(/\s+/).filter(Boolean).join(" & ");

    if (tsQuery) {
      const matchingIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "videos"
        WHERE status = 'PUBLIC'
          AND "searchVector" @@ to_tsquery('english', ${tsQuery})
        ORDER BY ts_rank("searchVector", to_tsquery('english', ${tsQuery})) DESC
        LIMIT 200
      `;

      if (matchingIds.length === 0) return NextResponse.json({ videos: [], nextCursor: null });
      where.id = { in: matchingIds.map((r) => r.id) };
    }
  }

  const orderBy =
    sort === "views" ? [{ views: "desc" as const }] : [{ createdAt: "desc" as const }];

  const videos = await prisma.video.findMany({
    where, orderBy,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      _count: { select: { likes: { where: { isLike: true } }, comments: true } },
    },
  });

  const hasMore = videos.length > limit;
  const data = hasMore ? videos.slice(0, limit) : videos;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ videos: data, nextCursor, query: q });
}
