import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { generateUploadSignature } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { folder = 'streamforge/videos', resource_type = 'video' } = body;

    // Sign ONLY the params that will be sent in every upload request.
    // Do NOT include eager/eager_notification_url here — they cause
    // signature mismatches when the browser sends a direct upload.
    const signatureData = generateUploadSignature({
        folder,
        resource_type,
    });

    return NextResponse.json({
        ...signatureData,
        folder,
        resource_type,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
}
