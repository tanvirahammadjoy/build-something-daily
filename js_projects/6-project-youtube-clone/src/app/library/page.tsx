import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/library");
  }

  const userId = session.user.id;

  const uploadedVideos = await prisma.video.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const likedVideos = await prisma.like.findMany({
    where: {
      userId,
    },
    include: {
      video: true,
    },
  });

  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: userId,
    },
  });

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold text-lg">Your Videos</h2>

          <p className="text-3xl mt-3">{uploadedVideos.length}</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold text-lg">Liked Videos</h2>

          <p className="text-3xl mt-3">{likedVideos.length}</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold text-lg">Subscriptions</h2>

          <p className="text-3xl mt-3">{subscriptions.length}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Your Uploads</h2>

        <div className="space-y-3">
          {uploadedVideos.map((video) => (
            <div key={video.id} className="rounded-lg border p-4">
              <h3 className="font-medium">{video.title}</h3>

              <p className="text-sm text-muted-foreground">
                {video.views} views
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
