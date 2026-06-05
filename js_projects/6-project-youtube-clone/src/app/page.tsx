// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import { VideoCard } from "@/components/video/VideoCard";

interface HomePageProps {
  searchParams: { q?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";

  const videos = await prisma.video.findMany({
    where: {
      published: true,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return (
    <div className="p-6">
      {q && (
        <p className="mb-4 text-sm text-neutral-400">
          {videos.length} results for{" "}
          <span className="font-medium text-white">"{q}"</span>
        </p>
      )}
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-500">
          <svg
            className="h-16 w-16 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">No videos found</p>
          {q && <p className="text-sm">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
