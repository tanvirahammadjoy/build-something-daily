import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoWithUser } from "@/types/video";

export default async function SubscriptionsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/subscriptions");

  const subscriptions = await prisma.subscription.findMany({
    where: { subscriberId: session.user.id },
    select: { channelId: true },
    orderBy: { createdAt: "desc" },
  });

  const channelIds = subscriptions.map((s) => s.channelId);

  if (channelIds.length === 0) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-16 h-16 rounded-full bg-ink-surface flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-paper-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-paper text-lg font-semibold mb-2">No subscriptions yet</h2>
          <p className="text-paper-faint text-sm">Subscribe to channels to see their latest videos here.</p>
          <a href="/" className="inline-block mt-6 px-6 py-2.5 bg-flare hover:bg-flare-dim text-paper text-sm font-medium rounded-full transition">
            Discover videos
          </a>
        </div>
      </main>
    );
  }

  const raw = await prisma.video.findMany({
    where: { userId: { in: channelIds }, status: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 13,
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      _count: { select: { likes: { where: { isLike: true } }, comments: true } },
    },
  });

  const hasNextPage = raw.length > 12;
  const videos = hasNextPage ? raw.slice(0, 12) : raw;
  const nextCursor = hasNextPage ? videos[videos.length - 1].id : null;

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-paper mb-6">Latest from subscriptions</h1>
        <VideoGrid initialVideos={videos as VideoWithUser[]} initialCursor={nextCursor} feed="subscriptions" />
      </div>
    </main>
  );
}
