import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/video/VideoCard";
import { VideoWithUser } from "@/types/video";

export default async function WatchLaterPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/watch-later");

  const entries = await prisma.watchLater.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      video: {
        include: {
          user: { select: { id: true, name: true, image: true, channelHandle: true } },
          _count: { select: { likes: { where: { isLike: true } }, comments: true } },
        },
      },
    },
  });

  const videos = entries.map((e) => e.video).filter((v) => v.status === "PUBLIC");

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Watch later</h1>
            <p className="text-gray-500 text-sm mt-1">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-400 mb-2">Nothing saved yet</p>
            <p className="text-sm">Tap the bookmark icon on any video to save it for later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video as unknown as VideoWithUser} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
