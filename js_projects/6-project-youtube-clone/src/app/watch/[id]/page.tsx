// src/app/watch/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { LikeButtons } from "@/components/video/LikeButtons";
import { SubscribeButton } from "@/components/video/SubscribeButton";
import { CommentSection } from "@/components/comments/CommentSection";
import { VideoCard } from "@/components/video/VideoCard";
import {
  formatViews,
  formatRelativeTime,
  formatSubscribers,
} from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface WatchPageProps {
  params: { id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const session = await getServerSession(authOptions);

  // Fetch video with owner info
  const video = await prisma.video.findUnique({
    where: { id: params.id, published: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          handle: true,
          _count: { select: { followers: true } },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!video) notFound();

  // Increment view count (fire-and-forget)
  prisma.video
    .update({ where: { id: video.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  // Sidebar recommendations — exclude current video
  const related = await prisma.video.findMany({
    where: { published: true, id: { not: params.id } },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { views: "desc" },
    take: 8,
  });

  // Check if current user has liked this video
  const userLike = session?.user?.id
    ? await prisma.like.findUnique({
        where: {
          userId_videoId: { userId: session.user.id, videoId: video.id },
        },
      })
    : null;

  // Check if current user is subscribed
  const isSubscribed = session?.user?.id
    ? !!(await prisma.subscription.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: video.user.id,
          },
        },
      }))
    : false;

  return (
    <div className="flex gap-6 p-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <VideoPlayer url={video.videoUrl} title={video.title} />

        {/* Title + actions */}
        <div className="mt-4">
          <h1 className="text-xl font-semibold text-white">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-400">
              {formatViews(video.views)} · {formatRelativeTime(video.createdAt)}
            </p>
            <LikeButtons
              videoId={video.id}
              initialLikeCount={video._count.likes}
              initialUserLike={userLike?.type ?? null}
            />
          </div>
        </div>

        {/* Channel info + subscribe */}
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-neutral-900 p-4">
          <Link href={`/profile/${video.user.id}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-700">
              {video.user.image && (
                <Image
                  src={video.user.image}
                  alt={video.user.name ?? ""}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </Link>
          <div className="flex-1">
            <Link
              href={`/profile/${video.user.id}`}
              className="font-medium text-white hover:underline"
            >
              {video.user.name}
            </Link>
            <p className="text-xs text-neutral-400">
              {formatSubscribers(video.user._count.followers)}
            </p>
          </div>
          {session?.user?.id !== video.user.id && (
            <SubscribeButton
              channelId={video.user.id}
              initialSubscribed={isSubscribed}
            />
          )}
        </div>

        {/* Description */}
        {video.description && (
          <details className="mt-4 rounded-xl bg-neutral-900 p-4">
            <summary className="cursor-pointer text-sm font-medium text-white">
              Description
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-300 leading-relaxed">
              {video.description}
            </p>
          </details>
        )}

        {/* Comments */}
        <CommentSection
          videoId={video.id}
          commentCount={video._count.comments}
          session={session}
        />
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-96 shrink-0 flex-col gap-4">
        {related.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </aside>
    </div>
  );
}
