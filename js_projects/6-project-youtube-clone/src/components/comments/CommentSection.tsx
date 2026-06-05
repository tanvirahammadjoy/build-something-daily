'use client'
// src/components/comments/CommentSection.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Session } from 'next-auth'
import { CommentWithUser } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface CommentSectionProps {
  videoId: string
  commentCount: number
  session: Session | null
}

export function CommentSection({ videoId, commentCount, session }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/comments?videoId=${videoId}`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false) })
  }, [videoId])

  async function handleSubmit(e: React.FormEvent, parentId?: string) {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, text, parentId: parentId ?? null }),
    })
    const comment: CommentWithUser = await res.json()

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), comment], _count: { ...c._count, replies: c._count.replies + 1 } }
            : c
        )
      )
      setReplyTo(null)
    } else {
      setComments((prev) => [comment, ...prev])
    }

    setText('')
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/comments?id=${id}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {commentCount} Comments
      </h2>

      {/* New comment input */}
      {session && (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6 flex gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-700">
            {session.user?.image && (
              <Image src={session.user.image} alt="avatar" fill className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border-b border-neutral-700 bg-transparent pb-1 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 transition-colors"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setText('')}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-neutral-800" />
                <div className="h-3 w-full rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                session={session}
                onDelete={handleDelete}
                onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                showReplyInput={replyTo === comment.id}
                replyText={text}
                onReplyTextChange={setText}
                onReplySubmit={(e) => handleSubmit(e, comment.id)}
              />
              {/* Nested replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-3 space-y-4 border-l border-neutral-800 pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply as CommentWithUser}
                      session={session}
                      onDelete={handleDelete}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithUser
  session: Session | null
  onDelete: (id: string) => void
  onReply?: () => void
  showReplyInput?: boolean
  replyText?: string
  onReplyTextChange?: (v: string) => void
  onReplySubmit?: (e: React.FormEvent) => void
  isReply?: boolean
}

function CommentItem({ comment, session, onDelete, onReply, showReplyInput, replyText, onReplyTextChange, onReplySubmit, isReply }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-700">
        {comment.user.image && (
          <Image src={comment.user.image} alt={comment.user.name ?? ''} fill className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{comment.user.name}</span>
          <span className="text-xs text-neutral-500">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
        <div className="mt-2 flex items-center gap-3">
          {!isReply && onReply && (
            <button onClick={onReply} className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
              Reply
            </button>
          )}
          {session?.user?.id === comment.userId && (
            <button onClick={() => onDelete(comment.id)} className="text-xs font-medium text-neutral-500 hover:text-red-400 transition-colors">
              Delete
            </button>
          )}
          {comment._count.replies > 0 && !isReply && (
            <span className="text-xs text-neutral-500">{comment._count.replies} replies</span>
          )}
        </div>
        {showReplyInput && onReplySubmit && (
          <form onSubmit={onReplySubmit} className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => onReplyTextChange?.(e.target.value)}
              placeholder={`Reply to ${comment.user.name}...`}
              className="flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500"
            />
            <button type="submit" disabled={!replyText?.trim()} className="rounded-full bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
              Reply
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
