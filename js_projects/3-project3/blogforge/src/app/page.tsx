import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getRecentPosts() {
  return prisma.post.findMany({
    where: { published: true },
    take: 3,
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Ideas worth sharing
        </h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
          A place to write, read, and connect with writers on the topics that
          matter to you.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
          >
            Start writing
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 text-gray-700 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Read posts
          </Link>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="py-12 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent posts</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.author.name}</span>
                  <span>·</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/blog"
              className="text-sm text-blue-600 hover:underline"
            >
              View all posts →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
