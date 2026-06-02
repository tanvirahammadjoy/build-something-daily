'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EditProfileFormProps {
  userId: string
  initialName: string
  initialBio: string
}

export default function EditProfileForm({ userId, initialName, initialBio }: EditProfileFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return }
    setIsSaving(true)
    setError('')

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    } else {
      setIsOpen(false)
      router.refresh()
    }

    setIsSaving(false)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="text-sm text-blue-600 hover:underline">
        Edit profile
      </button>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Edit profile</h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Display name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            placeholder="Tell readers a bit about yourself..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={handleSave} disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        <button onClick={() => { setIsOpen(false); setName(initialName); setBio(initialBio) }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </div>
  )
}
