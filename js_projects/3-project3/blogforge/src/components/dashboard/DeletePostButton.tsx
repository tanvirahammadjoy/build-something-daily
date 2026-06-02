'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete post. Please try again.')
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Sure?</span>
        <button onClick={handleDelete} disabled={isDeleting}
          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50">
          {isDeleting ? '...' : 'Delete'}
        </button>
        <button onClick={() => setIsConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setIsConfirming(true)}
      className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 border border-gray-200 rounded hover:border-red-200 transition-colors">
      Delete
    </button>
  )
}
