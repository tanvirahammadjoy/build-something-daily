'use client'
// src/components/layout/Navbar.tsx
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { UploadModal } from '@/components/video/UploadModal'

export function Navbar() {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-4 border-b border-neutral-800 bg-neutral-950 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <svg className="h-6 w-6 text-brand" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
          </svg>
          <span className="font-bold text-white text-lg hidden sm:block">StreamForge</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 rounded-l-full border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 px-4 text-neutral-300 hover:bg-neutral-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-full bg-neutral-800 border border-neutral-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>

              {/* Avatar dropdown */}
              <div className="relative">
                <button onClick={() => setShowMenu((v) => !v)} className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-neutral-700 hover:ring-blue-500 transition-all">
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="avatar" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-bold text-white">
                      {session.user?.name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 w-48 rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-xl z-50">
                    <p className="truncate px-3 py-2 text-xs text-neutral-400">{session.user?.email}</p>
                    <Link href={`/profile/${session.user?.id}`} className="block rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800" onClick={() => setShowMenu(false)}>
                      Your channel
                    </Link>
                    <button onClick={() => signOut()} className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="rounded-full border border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  )
}
