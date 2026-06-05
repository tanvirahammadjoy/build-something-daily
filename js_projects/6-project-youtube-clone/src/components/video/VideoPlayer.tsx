'use client'
// src/components/video/VideoPlayer.tsx
import ReactPlayer from 'react-player/lazy'

interface VideoPlayerProps {
  url: string
  title: string
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        title={title}
        config={{
          youtube: { playerVars: { modestbranding: 1 } },
        }}
      />
    </div>
  )
}
