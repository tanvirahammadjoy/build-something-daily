import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "@/lib/session";
import { BellIcon } from "@/components/notifications/BellIcon";

export async function Navbar() {
  const session = await getServerSession();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">StreamForge</span>
        </Link>

        <form action="/search" method="get" className="flex-1 max-w-xl">
          <div className="flex">
            <input name="q" type="search" placeholder="Search videos..." className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-full text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" />
            <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-l-0 border-gray-700 rounded-r-full text-gray-300 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 flex-shrink-0">
          {session ? (
            <>
              <Link href="/upload" className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-full transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Upload
              </Link>
              <Link href="/subscriptions" className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </Link>
              <BellIcon isLoggedIn={true} />
              <Link href={`/channel/${session.user.channelHandle ?? session.user.id}`} className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {session.user.image
                  ? <Image src={session.user.image} alt="Your avatar" width={32} height={32} className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">{session.user.name?.[0]?.toUpperCase() ?? "?"}</div>
                }
              </Link>
            </>
          ) : (
            <Link href="/sign-in" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
