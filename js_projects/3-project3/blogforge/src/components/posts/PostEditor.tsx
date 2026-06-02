'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostEditorProps {
  initialData?: {
    id: string
    title: string
    content: string
    excerpt?: string
    published: boolean
  }
}

export default function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(publish: boolean) {
    if (!title.trim()) { setError('A title is required'); return }
    if (!content.trim()) { setError('Content cannot be empty'); return }

    setIsSubmitting(true)
    setError('')

    const payload = { title, content, excerpt, published: publish }
    const url = isEditing ? `/api/posts/${initialData.id}` : '/api/posts'
    const method = isEditing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setIsSubmitting(false)
      return
    }

    const post = await res.json()
    router.push(publish ? `/blog/${post.slug}` : '/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit post' : 'New post'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-3xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-300 transition-colors"
        />

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Excerpt <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="A short summary of your post..."
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Content</label>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={val => setContent(val ?? '')}
              height={500}
              preview="live"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Save draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
          <button
            onClick={() => router.back()}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
