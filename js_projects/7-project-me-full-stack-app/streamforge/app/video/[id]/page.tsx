import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { LikeDislikeButtons } from "@/components/video/LikeDislikeButtons";
import { CommentSection } from "@/components/video/CommentSection";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { SaveButton } from "@/components/video/SaveButton";
import { formatViews, formatRelativeTime } from "@/lib/format";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();

  const video = await prisma.video.findUnique({
    where: { id, status: "PUBLIC" },
    include: {
      user: {
        select: {
          id: true, name: true, image: true, channelHandle: true,
          _count: { select: { subscribers: true } },
        },
      },
      tags: { select: { name: true } },
      _count: {
        select: {
          likes: { where: { isLike: true } },
          comments: { where: { parentId: null } },
        },
      },
    },
  });

  if (!video) notFound();

  prisma.video
    .update({ where: { id: video.id }, data: { views: { increment: 1 } } })
    .catch(console.error);

  if (session?.user?.id) {
    prisma.watchHistory
      .upsert({
        where: { userId_videoId: { userId: session.user.id, videoId: video.id } },
        update: { watchedAt: new Date() },
        create: { userId: session.user.id, videoId: video.id, watchedSeconds: 0 },
      })
      .catch(console.error);
  }

  const isSubscribed = session?.user?.id
    ? !!(await prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: session.user.id,
            channelId: video.user.id,
          },
        },
      }))
    : false;

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <VideoPlayer
          videoUrl={video.videoUrl}
          thumbnailUrl={video.thumbnailUrl ?? undefined}
          title={video.title}
        />

        <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-semibold text-white flex-1 min-w-0">{video.title}</h1>
          <div className="flex items-center gap-2">
            <LikeDislikeButtons
              videoId={video.id}
              initialLikes={video._count.likes}
              initialDislikes={0}
              isLoggedIn={!!session}
            />
            <SaveButton videoId={video.id} isLoggedIn={!!session} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <Link
            href={`/channel/${video.user.channelHandle ?? video.user.id}`}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {video.user.image ? (
                <Image src={video.user.image} alt={video.user.name ?? ""} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  {video.user.name?.[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{video.user.name}</p>
              <p className="text-gray-500 text-xs">
                {video.user._count.subscribers.toLocaleString()} subscribers
              </p>
            </div>
          </Link>
          {session?.user?.id !== video.user.id && (
            <SubscribeButton
              channelId={video.user.id}
              initialSubscribed={isSubscribed}
              isLoggedIn={!!session}
            />
          )}
        </div>

        <div className="mt-4 bg-gray-900 rounded-xl p-4">
          <p className="text-gray-400 text-sm">
            {formatViews(video.views)} · {formatRelativeTime(video.createdAt)}
          </p>
          {video.description && (
            <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {video.tags.map((t) => (
                <Link key={t.name} href={`/search?tag=${t.name}`} className="text-blue-400 text-xs hover:text-blue-300">
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <CommentSection
          videoId={video.id}
          initialCommentCount={video._count.comments}
          isLoggedIn={!!session}
          currentUserId={session?.user?.id ?? null}
          currentUserImage={session?.user?.image ?? null}
        />
      </div>
    </main>
  );
}
