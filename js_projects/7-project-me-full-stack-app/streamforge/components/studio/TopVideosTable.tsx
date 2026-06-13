import Image from "next/image";
import Link from "next/link";
import { AnalyticsData } from "@/types/analytics";
import { formatViews, formatRelativeTime } from "@/lib/format";

export function TopVideosTable({ videos }: { videos: AnalyticsData["topVideos"] }) {
  if (videos.length === 0) {
    return <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 text-sm">No videos yet. Upload your first video to see stats here.</div>;
  }
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800"><h3 className="text-white font-medium">Top videos</h3></div>
      <div className="divide-y divide-gray-800">
        {videos.map((video, i) => (
          <Link key={video.id} href={`/video/${video.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/50 transition group">
            <span className="text-gray-600 text-sm font-mono w-5 text-center flex-shrink-0">{i + 1}</span>
            <div className="w-20 aspect-video rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
              {video.thumbnailUrl
                ? <Image src={video.thumbnailUrl} alt={video.title} width={80} height={45} className="object-cover w-full h-full" />
                : <div className="w-full h-full bg-gray-700" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-blue-400 transition">{video.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{formatRelativeTime(video.createdAt)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white text-sm font-medium tabular-nums">{formatViews(video.views)}</p>
              <p className="text-gray-500 text-xs mt-0.5">{video._count.likes.toLocaleString()} likes</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
