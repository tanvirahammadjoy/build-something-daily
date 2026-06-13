import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

function verifyCloudinaryWebhook(
    body: string,
    signature: string,
    timestamp: string
): boolean {
    const secret = process.env.CLOUDINARY_WEBHOOK_SECRET!;
    const expected = createHmac('sha1', secret)
        .update(body + timestamp)
        .digest('hex');
    return expected === signature;
}

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get('x-cld-signature') ?? '';
    const timestamp = req.headers.get('x-cld-timestamp') ?? '';

    if (!verifyCloudinaryWebhook(rawBody, signature, timestamp))
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
        });

    const payload = JSON.parse(rawBody);
    const { notification_type, public_id, eager, duration } = payload;

    if (notification_type !== 'eager')
        return new Response(JSON.stringify({ received: true }));

    const hlsUrl = eager?.[0]?.secure_url ?? null;
    const video = await prisma.video.findFirst({
        where: { publicId: public_id },
    });
    if (!video) return new Response(JSON.stringify({ received: true }));

    await prisma.video.update({
        where: { id: video.id },
        data: {
            status: 'PUBLIC',
            videoUrl: hlsUrl ?? video.videoUrl,
            duration: duration ? Math.round(duration) : video.duration,
        },
    });

    const subscriptions = await prisma.subscription.findMany({
        where: { channelId: video.userId },
        select: { subscriberId: true },
    });

    if (subscriptions.length > 0) {
        await prisma.notification.createMany({
            data: subscriptions.map(({ subscriberId }) => ({
                type: 'NEW_VIDEO' as const,
                userId: subscriberId,
                actorId: video.userId,
                videoId: video.id,
            })),
            skipDuplicates: true,
        });
    }

    return new Response(JSON.stringify({ received: true }));
}
