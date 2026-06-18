import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StudioVideoTable } from "@/components/studio/StudioVideoTable";

export default async function StudioVideosPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/studio/videos");

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, status: true, views: true,
      thumbnailUrl: true, createdAt: true, duration: true,
      _count: { select: { likes: { where: { isLike: true } }, comments: true } },
    },
  });

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-paper">Your videos</h1>
          <a href="/upload" className="px-4 py-2 bg-flare hover:bg-flare-dim text-paper text-sm font-medium rounded-lg transition">
            Upload new
          </a>
        </div>
        <StudioVideoTable videos={videos} />
      </div>
    </main>
  );
}
