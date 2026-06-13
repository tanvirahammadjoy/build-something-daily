import { VideoGrid } from "@/components/video/VideoGrid";
import { SearchFilters } from "@/components/search/SearchFilters";
import { VideoWithUser } from "@/types/video";

interface Props {
  searchParams: { q?: string; tag?: string; sort?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", tag, sort = "relevance" } = searchParams;

  if (!q && !tag) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Search for videos, channels, or topics.</p>
      </main>
    );
  }

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/search?q=${encodeURIComponent(q)}&sort=${sort}${tag ? `&tag=${tag}` : ""}`,
    { cache: "no-store" }
  );
  const { videos, nextCursor } = await res.json();

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-white text-lg">
            {videos.length > 0 ? `Results for "${q || `#${tag}`}"` : `No results for "${q || `#${tag}`}"`}
          </h1>
          <SearchFilters activeSort={sort} q={q} tag={tag} />
        </div>
        <VideoGrid initialVideos={videos as VideoWithUser[]} initialCursor={nextCursor} sort={sort} tag={tag} />
      </div>
    </main>
  );
}
