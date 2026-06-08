// src/app/subscriptions/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoCard } from '@/components/video/VideoCard'

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/api/auth/signin')

  // Get IDs of channels the user follows
  const subscriptions = await prisma.subscription.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })
  const followingIds = subscriptions.map((s) => s.followingId)

  const videos = await prisma.video.findMany({
    where: {
      published: true,
      userId: { in: followingIds },
    },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
  })

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Subscriptions</h1>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-500">
          <svg className="h-16 w-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">Nothing here yet</p>
          <p className="text-sm">Subscribe to channels to see their latest videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
