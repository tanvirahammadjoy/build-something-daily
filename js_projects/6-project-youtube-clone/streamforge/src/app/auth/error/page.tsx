'use client'
// src/app/auth/error/page.tsx
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'Server configuration error. Check your OAuth credentials.',
  AccessDenied: 'Access was denied. You may not have permission to sign in.',
  Verification: 'The sign-in link has expired. Please request a new one.',
  Default: 'An unexpected error occurred during sign in.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Default'
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-white">Sign in failed</h1>
        <p className="mb-6 text-sm text-neutral-400">{message}</p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}
