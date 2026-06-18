import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateVideoSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(5000).optional(),
    publicId: z.string().min(1),
    videoUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    // Cloudinary returns duration as a float (e.g. 12.533) — coerce to int
    duration: z.coerce.number().min(0).optional(),
    tagNames: z.array(z.string()).max(10).optional(),
});

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    const result = CreateVideoSchema.safeParse(body);
    if (!result.success) {
        console.error('[UPLOAD] Validation error:', result.error.errors);
        return NextResponse.json(
            { error: result.error.errors[0].message },
            { status: 400 }
        );
    }

    const {
        title,
        description,
        publicId,
        videoUrl,
        thumbnailUrl,
        duration,
        tagNames,
    } = result.data;

    const video = await prisma.video.create({
        data: {
            title,
            description,
            publicId,
            videoUrl,
            thumbnailUrl: thumbnailUrl ?? null,
            // Math.round handles any float that slipped past coerce
            duration: duration ? Math.round(duration) : 0,
            status: 'PUBLIC',
            userId: session.user.id,
            tags: {
                connectOrCreate: (tagNames ?? []).map((name) => ({
                    where: { name: name.toLowerCase().trim() },
                    create: { name: name.toLowerCase().trim() },
                })),
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    channelHandle: true,
                },
            },
            tags: true,
        },
    });

    // Fan-out new-video notifications to subscribers
    const subscriptions = await prisma.subscription.findMany({
        where: { channelId: session.user.id },
        select: { subscriberId: true },
    });

    if (subscriptions.length > 0) {
        await prisma.notification.createMany({
            data: subscriptions.map(({ subscriberId }) => ({
                type: 'NEW_VIDEO' as const,
                userId: subscriberId,
                actorId: session.user.id,
                videoId: video.id,
            })),
            skipDuplicates: true,
        });
    }

    return NextResponse.json({ video }, { status: 201 });
}
