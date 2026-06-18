'use client';
import { useEffect, useRef } from 'react';

interface Props {
    videoUrl: string;
    thumbnailUrl?: string;
    title: string;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isHLS = videoUrl.includes('.m3u8');

    useEffect(() => {
        if (!isHLS || !videoRef.current) return;
        import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(videoRef.current!);
                return () => hls.destroy();
            } else if (
                videoRef.current?.canPlayType('application/vnd.apple.mpegurl')
            ) {
                videoRef.current.src = videoUrl;
            }
        });
    }, [videoUrl, isHLS]);

    return (
        <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
            <video
                ref={videoRef}
                src={isHLS ? undefined : videoUrl}
                poster={thumbnailUrl}
                controls
                className="w-full h-full"
                aria-label={title}
                preload="metadata"
            />
        </div>
    );
}
