// src/components/video/VideoCard.tsx

import Link from "next/link";
import Image from "next/image";
import { VideoWithUser } from "@/types";
import { formatViews, formatDuration, formatRelativeTime } from "@/lib/utils";

interface VideoCardProps {
  video: VideoWithUser;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="group flex flex-col gap-3">
      {/* Thumbnail */}
      <Link href={`/watch/${video.id}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-800">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-600">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {video.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </Link>

      {/* Metadata */}
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${video.user.id}`} className="shrink-0">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-neutral-700">
            {video.user.image ? (
              <Image
                src={video.user.image}
                alt={video.user.name ?? ""}
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {video.user.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          {/* Title */}
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white hover:text-neutral-200">
              {video.title}
            </h3>
          </Link>

          {/* Channel */}
          <Link
            href={`/profile/${video.user.id}`}
            className="mt-1 block text-xs text-neutral-400 transition-colors hover:text-neutral-200"
          >
            {video.user.name}
          </Link>

          {/* Stats */}
          <p className="text-xs text-neutral-500">
            {formatViews(video.views)} · {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
