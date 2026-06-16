import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const userId = session.user.id;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const send = (event: string, data: unknown) => {
                const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(payload));
            };

            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch {
                    clearInterval(heartbeat);
                    clearInterval(poll);
                }
            }, 30_000);

            let lastChecked = new Date();

            prisma.notification
                .count({ where: { userId, read: false } })
                .then((count) => send('unread_count', { count }))
                .catch(() => {});

            const poll = setInterval(async () => {
                try {
                    const newNotifications = await prisma.notification.findMany(
                        {
                            where: { userId, createdAt: { gt: lastChecked } },
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                            include: {
                                actor: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                        channelHandle: true,
                                    },
                                },
                                video: {
                                    select: {
                                        id: true,
                                        title: true,
                                        thumbnailUrl: true,
                                    },
                                },
                            },
                        }
                    );

                    lastChecked = new Date();

                    if (newNotifications.length > 0) {
                        send('new_notifications', {
                            notifications: newNotifications,
                        });
                        const unreadCount = await prisma.notification.count({
                            where: { userId, read: false },
                        });
                        send('unread_count', { count: unreadCount });
                    }
                } catch {}
            }, 15_000);

            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                clearInterval(poll);
                try {
                    controller.close();
                } catch {}
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
