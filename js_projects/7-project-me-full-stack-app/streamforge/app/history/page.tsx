import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoWithUser } from "@/types/video";
import { formatRelativeTime } from "@/lib/format";

export default async function HistoryPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/history");

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: 40,
    include: {
      video: {
        include: {
          user: {
            select: { id: true, name: true, image: true, channelHandle: true },
          },
          _count: {
            select: { likes: { where: { isLike: true } }, comments: true },
          },
        },
      },
    },
  });

  if (history.length === 0) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-medium mb-2">
            No watch history yet
          </p>
          <p className="text-gray-600 text-sm">
            Videos you watch will appear here.
          </p>
        </div>
      </main>
    );
  }

  const grouped = groupByDate(
    history.map((h) => ({ ...h.video, watchedAt: h.watchedAt })),
  );

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-white mb-6">Watch history</h1>
        {Object.entries(grouped).map(([label, videos]) => (
          <div key={label} className="mb-8">
            <h2 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wide">
              {label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video as unknown as VideoWithUser}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function groupByDate(videos: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const groups: Record<string, typeof videos> = {};
  for (const v of videos) {
    const d = new Date(v.watchedAt);
    const label =
      d >= today
        ? "Today"
        : d >= yesterday
          ? "Yesterday"
          : d >= weekAgo
            ? "This week"
            : "Older";
    if (!groups[label]) groups[label] = [];
    groups[label].push(v);
  }
  return groups;
}
