import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function SettingsProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/settings/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, bio: true, channelHandle: true, image: true, bannerImage: true, password: true },
  });

  if (!user) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Profile settings</h1>
        <ProfileForm user={{ ...user, hasPassword: !!user.password }} />
      </div>
    </main>
  );
}
