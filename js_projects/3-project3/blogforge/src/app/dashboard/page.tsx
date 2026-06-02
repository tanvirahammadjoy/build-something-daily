import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DeletePostButton from "@/components/dashboard/DeletePostButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    include: {
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.length - publishedCount;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-amber-400">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {publishedCount} published · {draftCount} drafts
          </p>
        </div>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">You haven&apos;t written anything yet.</p>
          <Link href="/posts/new" className="text-blue-600 hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {posts.map((post) => (
            <div key={post.id} className="py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      post.published
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h2 className="font-medium text-gray-900 truncate">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {post._count.likes} likes · {post._count.comments} comments
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/posts/edit/${post.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                >
                  Edit
                </Link>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
