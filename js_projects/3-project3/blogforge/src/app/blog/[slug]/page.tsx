import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import PostActions from '@/components/posts/PostActions'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 160),
  }
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, name: true, image: true, bio: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { likes: true } },
    },
  })
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <article className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3">
          {post.author.image && (
            <img src={post.author.image} alt={post.author.name ?? ''} className="w-9 h-9 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </header>

      <div className="prose prose-gray max-w-none mb-12">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <PostActions
        postId={post.id}
        initialLikeCount={post._count.likes}
        initialComments={post.comments}
      />
    </article>
  )
}
