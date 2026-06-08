'use client'
// src/components/video/LikeButtons.tsx
import { useState, useOptimistic, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { LikeType } from '@prisma/client'

interface LikeButtonsProps {
  videoId: string
  initialLikeCount: number
  initialUserLike: LikeType | null
}

export function LikeButtons({ videoId, initialLikeCount, initialUserLike }: LikeButtonsProps) {
  const { data: session } = useSession()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [userLike, setUserLike] = useState<LikeType | null>(initialUserLike)
  const [isPending, startTransition] = useTransition()

  async function handleReaction(type: LikeType) {
    if (!session) return

    const previousLike = userLike
    const previousCount = likeCount

    // Optimistic update
    startTransition(() => {
      if (userLike === type) {
        setUserLike(null)
        if (type === 'LIKE') setLikeCount((c) => c - 1)
      } else {
        if (previousLike === 'LIKE' && type === 'DISLIKE') setLikeCount((c) => c - 1)
        if (previousLike === null && type === 'LIKE') setLikeCount((c) => c + 1)
        if (previousLike === 'DISLIKE' && type === 'LIKE') setLikeCount((c) => c + 1)
        setUserLike(type)
      }
    })

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, type }),
      })
    } catch {
      // Rollback on error
      setUserLike(previousLike)
      setLikeCount(previousCount)
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-neutral-800 p-1">
      <button
        onClick={() => handleReaction('LIKE')}
        disabled={!session || isPending}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          userLike === 'LIKE'
            ? 'bg-blue-600 text-white'
            : 'text-neutral-300 hover:bg-neutral-700 disabled:opacity-50'
        }`}
      >
        <svg className="h-4 w-4" fill={userLike === 'LIKE' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        {likeCount}
      </button>
      <div className="h-6 w-px bg-neutral-700" />
      <button
        onClick={() => handleReaction('DISLIKE')}
        disabled={!session || isPending}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          userLike === 'DISLIKE'
            ? 'bg-red-600 text-white'
            : 'text-neutral-300 hover:bg-neutral-700 disabled:opacity-50'
        }`}
      >
        <svg className="h-4 w-4" fill={userLike === 'DISLIKE' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        Dislike
      </button>
    </div>
  )
}
