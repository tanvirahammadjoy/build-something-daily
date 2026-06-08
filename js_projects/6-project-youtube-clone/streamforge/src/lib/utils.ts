// src/lib/utils.ts
import { formatDistanceToNow } from 'date-fns'
import { clsx, type ClassValue } from 'clsx'

/** Tailwind class merging helper */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** 14200 → "14K views" */
export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`
  return `${views} views`
}

/** 3842 (seconds) → "1:04:02" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Date → "2 days ago" */
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/** Subscriber count → "12.4K subscribers" */
export function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M subscribers`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K subscribers`
  return `${count} subscribers`
}
