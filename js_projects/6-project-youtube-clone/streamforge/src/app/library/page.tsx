// src/app/library/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoCard } from '@/components/video/VideoCard'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin')

  // Videos the user has liked
  const likedVideos = await prisma.like.findMany({
    where: {
      userId: session.user.id,
      type: 'LIKE',
      videoId: { not: null },
    },
    include: {
      video: {
        include: {
          user: { select: { id: true, name: true, image: true, handle: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
  })

  // Videos the user uploaded
  const uploadedVideos = await prisma.video.findMany({
    where: { userId: session.user.id, published: true },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const liked = likedVideos.map((l) => l.video).filter(Boolean)

  return (
    <div className="p-6 space-y-10">
      {/* Uploaded videos */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-white">Your videos</h2>
        {uploadedVideos.length === 0 ? (
          <EmptyState
            icon="upload"
            title="No videos yet"
            subtitle="Upload your first video using the Upload button in the navbar"
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uploadedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>

      {/* Liked videos */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-white">Liked videos</h2>
        {liked.length === 0 ? (
          <EmptyState
            icon="heart"
            title="No liked videos"
            subtitle="Videos you like will appear here"
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {liked.map((video) => video && <VideoCard key={video.id} video={video} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }: { icon: 'upload' | 'heart'; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-800 py-16 text-neutral-500">
      {icon === 'upload' ? (
        <svg className="h-12 w-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ) : (
        <svg className="h-12 w-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      )}
      <p className="font-medium">{title}</p>
      <p className="text-sm">{subtitle}</p>
    </div>
  )
}
