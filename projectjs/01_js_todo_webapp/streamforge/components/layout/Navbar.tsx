import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { BellIcon } from "@/components/notifications/BellIcon";
import { AccountMenu } from "@/components/layout/AccountMenu";

export async function Navbar() {
  const session = await getServerSession();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-border bg-ink/90 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 bg-flare rounded-md flex items-center justify-center transition group-hover:bg-flare-dim">
            <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span className="font-display font-bold text-lg text-paper hidden sm:block tracking-tight">StreamForge</span>
        </Link>

        <form action="/search" method="get" className="flex-1 max-w-xl">
          <div className="flex">
            <input
              name="q"
              type="search"
              placeholder="Search videos..."
              className="flex-1 px-4 py-2 bg-ink-surface border border-ink-border rounded-l-full text-paper text-sm placeholder-paper-faint focus:outline-none focus:border-flare transition"
            />
            <button type="submit" className="px-4 py-2 bg-ink-raised hover:bg-ink-border border border-l-0 border-ink-border rounded-r-full text-paper-dim transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 flex-shrink-0">
          {session ? (
            <>
              <Link href="/upload" className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-ink-raised hover:bg-ink-border text-paper text-sm rounded-full transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Upload
              </Link>
              <Link href="/subscriptions" className="text-paper-dim hover:text-paper transition p-1.5 rounded-lg hover:bg-ink-raised">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </Link>
              <BellIcon isLoggedIn={true} />
              <AccountMenu user={session.user} />
            </>
          ) : (
            <Link href="/sign-in" className="btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
