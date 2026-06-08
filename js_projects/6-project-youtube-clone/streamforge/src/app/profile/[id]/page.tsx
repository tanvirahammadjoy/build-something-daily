// src/app/profile/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VideoCard } from '@/components/video/VideoCard'
import { SubscribeButton } from '@/components/video/SubscribeButton'
import { formatSubscribers } from '@/lib/utils'
import Image from 'next/image'

interface ProfilePageProps {
  params: { id: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      handle: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          videos: true,
        },
      },
    },
  })

  if (!user) notFound()

  const videos = await prisma.video.findMany({
    where: { userId: user.id, published: true },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const isSubscribed = session?.user?.id
    ? !!(await prisma.subscription.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      }))
    : false

  const isOwnProfile = session?.user?.id === user.id

  return (
    <div className="pb-10">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-blue-900 via-neutral-900 to-purple-900 sm:h-48" />

      {/* Profile header */}
      <div className="px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6 -mt-10 sm:-mt-14">
          {/* Avatar */}
          <div className="relative h-20 w-20 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-full border-4 border-neutral-950 bg-neutral-800">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? ''} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>

          {/* Name + stats + subscribe */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-2">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">{user.name}</h1>
              {user.handle && (
                <p className="text-sm text-neutral-400">@{user.handle}</p>
              )}
              <div className="mt-1 flex items-center gap-3 text-sm text-neutral-400">
                <span>{formatSubscribers(user._count.followers)}</span>
                <span>·</span>
                <span>{user._count.videos} video{user._count.videos !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {!isOwnProfile && (
              <SubscribeButton channelId={user.id} initialSubscribed={isSubscribed} />
            )}
            {isOwnProfile && (
              <span className="inline-block rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-400">
                Your channel
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-4 max-w-2xl text-sm text-neutral-300 leading-relaxed">{user.bio}</p>
        )}

        {/* Divider */}
        <div className="mt-6 border-b border-neutral-800" />

        {/* Videos grid */}
        <div className="mt-6">
          <h2 className="mb-5 text-lg font-semibold text-white">Videos</h2>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500">
              <svg className="h-14 w-14 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No videos yet</p>
              {isOwnProfile && (
                <p className="text-sm">Use the Upload button in the navbar to add your first video</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
