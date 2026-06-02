import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavActions from "./NavActions";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-gray-900 text-lg tracking-tight"
        >
          BlogForge
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/blog"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Blog
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>
        <NavActions session={session} />
      </div>
    </header>
  );
}
