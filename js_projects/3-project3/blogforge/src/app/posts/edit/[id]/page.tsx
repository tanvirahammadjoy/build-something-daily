import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/posts/PostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      published: true,
      authorId: true,
    },
  });

  if (!post) notFound();
  if (post.authorId !== session.user.id) redirect("/dashboard");

  return (
    <PostEditor
      initialData={{
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt ?? "",
        published: post.published,
      }}
    />
  );
}
