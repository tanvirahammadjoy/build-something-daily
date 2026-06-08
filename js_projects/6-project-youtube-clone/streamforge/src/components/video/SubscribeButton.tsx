'use client'
// src/components/video/SubscribeButton.tsx
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

interface SubscribeButtonProps {
  channelId: string
  initialSubscribed: boolean
}

export function SubscribeButton({ channelId, initialSubscribed }: SubscribeButtonProps) {
  const { data: session } = useSession()
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!session) { signIn(); return }

    setLoading(true)
    const previous = subscribed
    setSubscribed((s) => !s) // optimistic

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: channelId }),
      })
      const data = await res.json()
      setSubscribed(data.subscribed)
    } catch {
      setSubscribed(previous) // rollback
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
        subscribed
          ? 'bg-neutral-700 text-white hover:bg-neutral-600'
          : 'bg-white text-black hover:bg-neutral-200'
      } disabled:opacity-60`}
    >
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  )
}
