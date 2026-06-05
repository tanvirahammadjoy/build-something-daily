'use client'
// src/components/video/UploadModal.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UploadModalProps {
  onClose: () => void
}

type Step = 'form' | 'uploading' | 'done'

export function UploadModal({ onClose }: UploadModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAIGenerate() {
    if (!title || !topic) { setError('Enter a title and topic first'); return }
    setAiLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic }),
      })
      const data = await res.json()
      setDescription(data.description)
      setHashtags(data.hashtags)
    } catch {
      setError('AI generation failed. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !videoUrl) { setError('Title and video URL are required'); return }

    setStep('uploading')
    try {
      const fullDescription = description
        ? `${description}\n\n${hashtags.map((h) => `#${h}`).join(' ')}`
        : undefined

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: fullDescription, videoUrl, thumbnailUrl: thumbnailUrl || undefined }),
      })
      const video = await res.json()
      setStep('done')
      setTimeout(() => {
        onClose()
        router.push(`/watch/${video.id}`)
        router.refresh()
      }, 1200)
    } catch {
      setError('Upload failed. Please try again.')
      setStep('form')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Upload video</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'done' ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white">Video published!</p>
            <p className="text-sm text-neutral-400">Redirecting to your video...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* AI section */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L9.5 8.5H3L8.3 12.6L6.2 19L12 15.2L17.8 19L15.7 12.6L21 8.5H14.5L12 2Z" />
                </svg>
                <span className="text-sm font-medium text-purple-300">Smart helper</span>
              </div>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your video topic briefly..."
                className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading || !title || !topic}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {aiLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : 'Generate description & tags'}
              </button>

              {hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-neutral-700 px-2.5 py-0.5 text-xs text-neutral-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Video description (or use Smart helper above)"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Video URL *</label>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or UploadThing URL"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Thumbnail URL</label>
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://... (optional)"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={step === 'uploading'}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {step === 'uploading' ? 'Publishing...' : 'Publish video'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
