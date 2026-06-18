import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { UploadForm } from '@/components/upload/UploadForm';

export default async function UploadPage() {
    const session = await getServerSession();
    if (!session) redirect('/sign-in?callbackUrl=/upload');

    return (
        <main className="min-h-screen bg-ink py-12">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-paper mb-2">
                    Upload a video
                </h1>
                <p className="text-paper-faint text-sm mb-8">
                    MP4, MOV, or AVI · Max 2GB · Videos process in the
                    background
                </p>
                <UploadForm />
            </div>
        </main>
    );
}
