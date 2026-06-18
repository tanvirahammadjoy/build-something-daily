'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoCard } from './VideoCard';
import { VideoWithUser } from '@/types/video';

interface Props {
    initialVideos: VideoWithUser[];
    initialCursor: string | null;
    sort?: string;
    userId?: string;
    tag?: string;
    feed?: string;
}

export function VideoGrid({
    initialVideos,
    initialCursor,
    sort,
    userId,
    tag,
    feed,
}: Props) {
    const [videos, setVideos] = useState<VideoWithUser[]>(initialVideos);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(!!initialCursor);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || !cursor) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ cursor, limit: '12' });
            if (sort) params.set('sort', sort);
            if (userId) params.set('userId', userId);
            if (tag) params.set('tag', tag);
            if (feed) params.set('feed', feed);
            const res = await fetch(`/api/videos?${params}`);
            const data = await res.json();
            setVideos((prev) => [...prev, ...data.videos]);
            setCursor(data.nextCursor);
            setHasMore(!!data.nextCursor);
        } catch (err) {
            console.error('Failed to load more videos:', err);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, cursor, sort, userId, tag, feed]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    if (videos.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-paper-faint">
                <div className="tick w-14 h-14 rounded-xl bg-ink-surface ring-1 ring-ink-border flex items-center justify-center mb-4">
                    <svg
                        className="w-7 h-7 text-ink-borderStrong"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                        />
                    </svg>
                </div>
                <p className="text-lg font-medium font-display text-paper-dim">
                    No videos yet
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                ))}
            </div>
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-2.5 animate-pulse"
                        >
                            <div className="aspect-video rounded-xl bg-ink-surface ring-1 ring-ink-border" />
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-full bg-ink-surface flex-shrink-0" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="h-3 bg-ink-surface rounded w-full" />
                                    <div className="h-3 bg-ink-surface rounded w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {hasMore && <div ref={sentinelRef} className="h-4" />}
            {!hasMore && videos.length > 0 && (
                <p className="text-center text-paper-faint text-sm py-8">
                    You&apos;ve reached the end
                </p>
            )}
        </div>
    );
}
