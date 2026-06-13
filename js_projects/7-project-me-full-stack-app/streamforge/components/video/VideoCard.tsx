import Image from "next/image";
import Link from "next/link";
import { VideoWithUser } from "@/types/video";
import { formatViews, formatDuration, formatRelativeTime } from "@/lib/format";

export function VideoCard({ video }: { video: VideoWithUser }) {
  const channelHref = `/channel/${video.user.channelHandle ?? video.user.id}`;
  return (
    <div className="group flex flex-col gap-2">
      <Link href={`/video/${video.id}`} className="relative block overflow-hidden rounded-xl bg-gray-800 aspect-video">
        {video.thumbnailUrl
          ? <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover transition-transform duration-200 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          : <div className="w-full h-full flex items-center justify-center bg-gray-800"><svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        }
        {video.duration > 0 && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">{formatDuration(video.duration)}</span>
        )}
      </Link>
      <div className="flex gap-3">
        <Link href={channelHref} className="flex-shrink-0 mt-0.5">
          {video.user.image
            ? <Image src={video.user.image} alt={video.user.name ?? "Channel"} width={36} height={36} className="rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium">{video.user.name?.[0]?.toUpperCase() ?? "?"}</div>
          }
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/video/${video.id}`}><h3 className="text-white text-sm font-medium line-clamp-2 leading-snug hover:text-gray-200 transition">{video.title}</h3></Link>
          <Link href={channelHref}><p className="text-gray-400 text-xs mt-1 hover:text-gray-300 transition truncate">{video.user.name ?? video.user.channelHandle}</p></Link>
          <p className="text-gray-500 text-xs mt-0.5">{formatViews(video.views)} · {formatRelativeTime(video.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
