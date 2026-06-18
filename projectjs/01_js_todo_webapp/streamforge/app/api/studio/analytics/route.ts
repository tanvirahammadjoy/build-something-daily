import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Range = "7d" | "30d" | "90d";

function getStartDate(range: Range): Date {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const range = (new URL(req.url).searchParams.get("range") ?? "30d") as Range;
  const since = getStartDate(range);
  const userId = session.user.id;

  const [totalViews, totalLikes, totalSubscribers, totalVideos, viewsByDay, likesByDay, topVideos, subscriberGrowth] =
    await Promise.all([
      prisma.video.aggregate({ where: { userId, status: "PUBLIC" }, _sum: { views: true } }),
      prisma.like.count({ where: { video: { userId }, isLike: true } }),
      prisma.subscription.count({ where: { channelId: userId } }),
      prisma.video.count({ where: { userId, status: "PUBLIC" } }),
      prisma.$queryRaw<{ date: string; views: number }[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date::text AS date, SUM(views)::int AS views
        FROM "videos" WHERE "userId" = ${userId} AND status = 'PUBLIC' AND "createdAt" >= ${since}
        GROUP BY DATE_TRUNC('day', "createdAt") ORDER BY date ASC`,
      prisma.$queryRaw<{ date: string; likes: number }[]>`
        SELECT DATE_TRUNC('day', l."createdAt")::date::text AS date, COUNT(*)::int AS likes
        FROM "likes" l JOIN "videos" v ON v.id = l."videoId"
        WHERE v."userId" = ${userId} AND l."isLike" = true AND l."createdAt" >= ${since}
        GROUP BY DATE_TRUNC('day', l."createdAt") ORDER BY date ASC`,
      prisma.video.findMany({
        where: { userId, status: "PUBLIC" },
        orderBy: { views: "desc" },
        take: 10,
        select: { id: true, title: true, thumbnailUrl: true, views: true, createdAt: true, _count: { select: { likes: { where: { isLike: true } } } } },
      }),
      prisma.$queryRaw<{ date: string; new_subs: number }[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date::text AS date, COUNT(*)::int AS new_subs
        FROM "subscriptions" WHERE "channelId" = ${userId} AND "createdAt" >= ${since}
        GROUP BY DATE_TRUNC('day', "createdAt") ORDER BY date ASC`,
    ]);

  const dateSet = new Set([
    ...viewsByDay.map((r) => r.date),
    ...likesByDay.map((r) => r.date),
    ...subscriberGrowth.map((r) => r.date),
  ]);

  const timeline = Array.from(dateSet).sort().map((date) => ({
    date,
    views: viewsByDay.find((r) => r.date === date)?.views ?? 0,
    likes: likesByDay.find((r) => r.date === date)?.likes ?? 0,
    subscribers: subscriberGrowth.find((r) => r.date === date)?.new_subs ?? 0,
  }));

  return NextResponse.json({
    totals: { views: totalViews._sum.views ?? 0, likes: totalLikes, subscribers: totalSubscribers, videos: totalVideos },
    timeline,
    topVideos,
  });
}
