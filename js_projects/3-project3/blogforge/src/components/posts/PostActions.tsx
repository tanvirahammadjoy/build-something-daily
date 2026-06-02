'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  content: string
  createdAt: Date | string
  author: { id: string; name: string | null; image: string | null }
}

interface PostActionsProps {
  postId: string
  initialLikeCount: number
  initialComments: Comment[]
}

export default function PostActions({ postId, initialLikeCount, initialComments }: PostActionsProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  async function handleLike() {
    if (!session) { router.push('/login'); return }

    setLiked(prev => !prev)
    setLikeCount(prev => (liked ? prev - 1 : prev + 1))

    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    if (!res.ok) {
      setLiked(prev => !prev)
      setLikeCount(prev => (liked ? prev + 1 : prev - 1))
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) { router.push('/login'); return }
    if (!commentText.trim()) return

    setIsSubmittingComment(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setComments(prev => [newComment, ...prev])
      setCommentText('')
    }

    setIsSubmittingComment(false)
  }

  return (
    <div className="border-t border-gray-100 pt-8 space-y-8">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
            liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        {session ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
            />
            <button type="submit" disabled={isSubmittingComment || !commentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isSubmittingComment ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline">Sign in</button>{' '}
            to leave a comment.
          </p>
        )}

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                {comment.author.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
