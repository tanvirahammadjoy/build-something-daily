import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import EditProfileForm from "@/components/profile/EditProfileForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: user?.name ? `${user.name}'s Profile` : "Profile" };
}

async function getProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      posts: {
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, session] = await Promise.all([
    getProfile(id),
    getServerSession(authOptions),
  ]);

  if (!profile) notFound();

  const isOwner = session?.user?.id === profile.id;
  const totalLikes = profile.posts.reduce((sum, p) => sum + p._count.likes, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start gap-5 mb-10">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 shrink-0 overflow-hidden">
          {profile.image ? (
            <img
              src={profile.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            (profile.name?.[0]?.toUpperCase() ?? "?")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.name}
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            Member since {formatDate(profile.createdAt)}
          </p>
          <div className="flex items-center gap-5 text-sm">
            <span>
              <strong className="text-gray-900">{profile.posts.length}</strong>
              <span className="text-gray-500 ml-1">posts</span>
            </span>
            <span>
              <strong className="text-gray-900">{totalLikes}</strong>
              <span className="text-gray-500 ml-1">total likes</span>
            </span>
          </div>
          {profile.bio && (
            <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-prose">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {isOwner && (
        <EditProfileForm
          userId={profile.id}
          initialName={profile.name ?? ""}
          initialBio={profile.bio ?? ""}
        />
      )}

      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          Published posts
        </h2>
        {profile.posts.length === 0 ? (
          <p className="text-gray-500 text-sm">No published posts yet.</p>
        ) : (
          <div className="space-y-5">
            {profile.posts.map((post) => (
              <article key={post.id} className="border-b border-gray-100 pb-5">
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                    {post.title}
                  </h3>
                </Link>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>{post._count.likes} likes</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
