import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { generateUploadSignature } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { folder = 'streamforge/videos', ...extraParams } = body;

    const signatureData = generateUploadSignature({
        folder,
        resource_type: 'video',
        eager: 'sp_hd/m3u8|sp_sd/mp4',
        eager_async: 'true',
        eager_notification_url: `${process.env.NEXTAUTH_URL}/api/cloudinary/webhook`,
        ...extraParams,
    });

    return NextResponse.json(signatureData);
}
