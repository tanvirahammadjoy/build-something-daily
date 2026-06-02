import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PostEditor from "@/components/posts/PostEditor";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return <PostEditor />;
}
