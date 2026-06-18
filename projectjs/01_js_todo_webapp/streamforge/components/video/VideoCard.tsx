import Image from 'next/image';
import Link from 'next/link';
import { VideoWithUser } from '@/types/video';
import { formatViews, formatDuration, formatRelativeTime } from '@/lib/format';

export function VideoCard({ video }: { video: VideoWithUser }) {
    const channelHref = `/channel/${video.user.channelHandle ?? video.user.id}`;
    return (
        <div className="group flex flex-col gap-2.5">
            <Link
                href={`/video/${video.id}`}
                className="tick relative block overflow-hidden rounded-xl bg-ink-surface aspect-video ring-1 ring-ink-border transition group-hover:ring-flare/60"
            >
                {video.thumbnailUrl ? (
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-ink-surface">
                        <svg
                            className="w-10 h-10 text-ink-borderStrong"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                )}
                {/* Hover play affordance — quiet, appears only on hover, accent used once */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-ink/20">
                    <div className="w-10 h-10 rounded-full bg-flare/90 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-ink ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
                {video.duration > 0 && (
                    <span className="absolute bottom-2 right-2 bg-ink/85 text-paper text-xs font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                    </span>
                )}
            </Link>
            <div className="flex gap-3">
                <Link href={channelHref} className="flex-shrink-0 mt-0.5">
                    {video.user.image ? (
                        <Image
                            src={video.user.image}
                            alt={video.user.name ?? 'Channel'}
                            width={36}
                            height={36}
                            className="rounded-full object-cover ring-1 ring-ink-border"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-ink-raised ring-1 ring-ink-border flex items-center justify-center text-paper text-sm font-medium font-display">
                            {video.user.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <Link href={`/video/${video.id}`}>
                        <h3 className="text-paper text-sm font-medium line-clamp-2 leading-snug group-hover:text-flare transition">
                            {video.title}
                        </h3>
                    </Link>
                    <Link href={channelHref}>
                        <p className="text-paper-faint text-xs mt-1 hover:text-paper-dim transition truncate">
                            {video.user.name ?? video.user.channelHandle}
                        </p>
                    </Link>
                    <p className="text-paper-faint text-xs mt-0.5">
                        {formatViews(video.views)} ·{' '}
                        {formatRelativeTime(video.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
}
