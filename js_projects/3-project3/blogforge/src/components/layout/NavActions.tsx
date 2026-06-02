'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import type { Session } from 'next-auth'

export default function NavActions({ session }: { session: Session | null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
          Sign in
        </Link>
        <Link href="/register" className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
          Get started
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      <Link href="/posts/new"
        className="hidden sm:block text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
        + New post
      </Link>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 hover:ring-2 hover:ring-blue-500 transition-all overflow-hidden">
          {session.user.image
            ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            : session.user.name?.[0]?.toUpperCase() ?? '?'
          }
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
            </div>
            <Link href={`/profile/${session.user.id}`}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setDropdownOpen(false)}>
              Your profile
            </Link>
            <Link href="/dashboard"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setDropdownOpen(false)}>
              Dashboard
            </Link>
            <hr className="my-1 border-gray-50" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
