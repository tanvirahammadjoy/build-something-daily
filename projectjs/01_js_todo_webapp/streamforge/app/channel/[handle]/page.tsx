import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { VideoGrid } from "@/components/video/VideoGrid";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { VideoWithUser } from "@/types/video";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const session = await getServerSession();
  const cleanHandle = decodeURIComponent(handle);
  const isHandle = cleanHandle.startsWith("@");

  const channel = await prisma.user.findFirst({
    where: isHandle ? { channelHandle: cleanHandle } : { id: cleanHandle },
    include: {
      _count: {
        select: {
          subscribers: true,
          videos: { where: { status: "PUBLIC" } },
        },
      },
    },
  });

  if (!channel) notFound();

  const isSubscribed = session?.user?.id
    ? !!(await prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: session.user.id,
            channelId: channel.id,
          },
        },
      }))
    : false;

  const raw = await prisma.video.findMany({
    where: { userId: channel.id, status: "PUBLIC" },
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
  const isOwner = session?.user?.id === channel.id;

  return (
    <main className="min-h-screen bg-ink">
      <div className="relative w-full h-40 md:h-56 bg-ink-surface overflow-hidden">
        {channel.bannerImage ? (
          <Image src={channel.bannerImage} alt="Channel banner" fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
      </div>

      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 mb-8">
          <div className="relative w-20 h-20 rounded-full border-4 border-ink overflow-hidden flex-shrink-0 bg-ink-raised">
            {channel.image ? (
              <Image src={channel.image} alt={channel.name ?? "Channel"} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-paper text-2xl font-bold">
                {channel.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-10 sm:pt-0">
            <h1 className="text-xl font-bold text-paper truncate">{channel.name}</h1>
            <p className="text-paper-faint text-sm mt-0.5">
              {channel.channelHandle} · {channel._count.subscribers.toLocaleString()} subscribers ·{" "}
              {channel._count.videos.toLocaleString()} videos
            </p>
            {channel.bio && (
              <p className="text-paper-faint text-sm mt-2 line-clamp-2">{channel.bio}</p>
            )}
          </div>

          <div className="flex gap-3 sm:ml-auto flex-shrink-0">
            {isOwner ? (
              <a href="/settings/profile" className="px-5 py-2 rounded-full bg-ink-raised hover:bg-ink-border text-paper text-sm font-medium transition">
                Edit channel
              </a>
            ) : (
              <SubscribeButton channelId={channel.id} initialSubscribed={isSubscribed} isLoggedIn={!!session} />
            )}
          </div>
        </div>

        <VideoGrid
          initialVideos={videos as VideoWithUser[]}
          initialCursor={nextCursor}
          userId={channel.id}
        />
      </div>
    </main>
  );
}
