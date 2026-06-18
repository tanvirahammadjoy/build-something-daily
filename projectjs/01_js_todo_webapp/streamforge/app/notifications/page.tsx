import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notificationLabel } from "@/types/notification";
import { formatRelativeTime } from "@/lib/format";

export default async function NotificationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/notifications");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: { id: true, name: true, image: true, channelHandle: true } },
      video: { select: { id: true, title: true, thumbnailUrl: true } },
    },
  });

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-paper mb-6">All notifications</h1>
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-paper-faint">
            <p className="text-lg font-medium text-paper-faint mb-2">Nothing here yet</p>
            <p className="text-sm">Subscribe to channels to get notified when they upload.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => {
              const href = n.video ? `/video/${n.video.id}` : `/channel/${n.actor.channelHandle ?? n.actor.id}`;
              return (
                <Link key={n.id} href={href} className="flex items-start gap-4 p-4 rounded-xl hover:bg-ink-surface transition">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-surface flex-shrink-0">
                    {n.actor.image
                      ? <Image src={n.actor.image} alt={n.actor.name ?? ""} width={40} height={40} className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-paper text-sm">{n.actor.name?.[0]?.toUpperCase() ?? "?"}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-paper-dim text-sm">{notificationLabel(n as any)}</p>
                    {n.video && <p className="text-paper-faint text-xs mt-0.5 truncate">{n.video.title}</p>}
                    <p className="text-paper-faint/70 text-xs mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  {n.video?.thumbnailUrl && (
                    <div className="w-16 aspect-video rounded-lg overflow-hidden bg-ink-surface flex-shrink-0">
                      <Image src={n.video.thumbnailUrl} alt={n.video.title} width={64} height={36} className="object-cover w-full h-full" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
