import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-red-50 rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet. Be the first to write one!</p>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="border-b border-gray-100 pb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>{post.author.name}</span>
                <span>·</span>
                <time>{formatDate(post.createdAt)}</time>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              {post.excerpt && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{post._count.likes} likes</span>
                <span>{post._count.comments} comments</span>
                <Link href={`/blog/${post.slug}`}
                  className="ml-auto text-blue-600 hover:underline font-medium">
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
