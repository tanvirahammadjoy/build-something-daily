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
      id: true,
      title: true,
      status: true,
      views: true,
      thumbnailUrl: true,
      createdAt: true,
      duration: true,
      _count: {
        select: { likes: { where: { isLike: true } }, comments: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Your videos</h1>
          <a
            href="/upload"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          >
            Upload new
          </a>
        </div>
        <StudioVideoTable videos={videos} />
      </div>
    </main>
  );
}
