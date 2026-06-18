import Image from "next/image";
import Link from "next/link";
import { AnalyticsData } from "@/types/analytics";
import { formatViews, formatRelativeTime } from "@/lib/format";

export function TopVideosTable({ videos }: { videos: AnalyticsData["topVideos"] }) {
  if (videos.length === 0) {
    return <div className="card p-8 text-center text-paper-faint text-sm">No videos yet. Upload your first video to see stats here.</div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-border"><h3 className="font-display text-paper font-medium">Top videos</h3></div>
      <div className="divide-y divide-ink-border">
        {videos.map((video, i) => (
          <Link key={video.id} href={`/video/${video.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-ink-raised transition group">
            <span className="text-paper-faint text-sm font-mono w-5 text-center flex-shrink-0">{i + 1}</span>
            <div className="w-20 aspect-video rounded-lg overflow-hidden bg-ink-surface flex-shrink-0 ring-1 ring-ink-border">
              {video.thumbnailUrl
                ? <Image src={video.thumbnailUrl} alt={video.title} width={80} height={45} className="object-cover w-full h-full" />
                : <div className="w-full h-full bg-ink-surface" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-paper text-sm font-medium truncate group-hover:text-flare transition">{video.title}</p>
              <p className="text-paper-faint text-xs mt-0.5">{formatRelativeTime(video.createdAt)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-paper text-sm font-medium tabular-nums">{formatViews(video.views)}</p>
              <p className="text-paper-faint text-xs mt-0.5">{video._count.likes.toLocaleString()} likes</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
