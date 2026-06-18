'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type UploadState = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

export function UploadForm() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [state, setState] = useState<UploadState>('idle');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ title: '', description: '', tags: '' });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        if (!allowed.includes(selected.type)) {
            setError('Only MP4, MOV, and AVI files are supported.');
            return;
        }
        if (selected.size > 2 * 1024 * 1024 * 1024) {
            setError('File must be under 2 GB.');
            return;
        }
        setError('');
        setFile(selected);
        if (!form.title)
            setForm((f) => ({
                ...f,
                title: selected.name.replace(/\.[^.]+$/, ''),
            }));
    };

    // Step 1: get a short-lived upload signature from our server
    async function getSignature(folder: string, resource_type = 'video') {
        const res = await fetch('/api/cloudinary/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder, resource_type }),
        });
        if (!res.ok) throw new Error('Failed to get upload signature');
        return res.json() as Promise<{
            signature: string;
            timestamp: number;
            apiKey: string;
            cloudName: string;
            folder: string;
            resource_type: string;
        }>;
    }

    // Step 2: upload directly to Cloudinary via XHR (fetch cannot track upload progress)
    // IMPORTANT: FormData must contain EXACTLY the same params that were signed.
    // Any extra field will cause a 400 "Upload preset must be specified" or signature error.
    async function uploadToCloudinary(
        file: File,
        sig: Awaited<ReturnType<typeof getSignature>>
    ): Promise<{ public_id: string; secure_url: string; duration?: number }> {
        return new Promise((resolve, reject) => {
            const fd = new FormData();
            // These four fields must match the signature exactly
            fd.append('file', file);
            fd.append('api_key', sig.apiKey);
            fd.append('timestamp', String(sig.timestamp));
            fd.append('signature', sig.signature);
            // Signed params
            fd.append('folder', sig.folder);
            fd.append('resource_type', sig.resource_type);

            const xhr = new XMLHttpRequest();
            xhr.open(
                'POST',
                `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resource_type}/upload`
            );

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable)
                    setProgress(Math.round((e.loaded / e.total) * 100));
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    // Log the full Cloudinary error for debugging
                    console.error(
                        'Cloudinary error response:',
                        xhr.responseText
                    );
                    const body = JSON.parse(xhr.responseText);
                    reject(
                        new Error(
                            body?.error?.message ??
                                `Upload failed (${xhr.status})`
                        )
                    );
                }
            };
            xhr.onerror = () =>
                reject(new Error('Network error during upload'));
            xhr.send(fd);
        });
    }

    // Step 3 (optional): upload a thumbnail image
    async function uploadThumbnail(file: File): Promise<string> {
        const sig = await getSignature('streamforge/thumbnails', 'image');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', String(sig.timestamp));
        fd.append('signature', sig.signature);
        fd.append('folder', sig.folder);
        fd.append('resource_type', sig.resource_type);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            { method: 'POST', body: fd }
        );
        if (!res.ok) throw new Error('Thumbnail upload failed');
        return (await res.json()).secure_url as string;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setError('');
        setState('uploading');
        setProgress(0);

        try {
            // 1. Get signature
            const sig = await getSignature('streamforge/videos', 'video');

            // 2. Upload video
            const { public_id, secure_url, duration } =
                await uploadToCloudinary(file, sig);

            // 3. Optional thumbnail
            let thumbnailUrl: string | undefined;
            if (thumbnail) {
                thumbnailUrl = await uploadThumbnail(thumbnail);
            }

            // 4. Save metadata to our DB
            setState('saving');
            const tagNames = form.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const saveRes = await fetch('/api/videos/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    publicId: public_id,
                    videoUrl: secure_url,
                    thumbnailUrl,
                    duration,
                    tagNames,
                }),
            });

            if (!saveRes.ok) {
                const data = await saveRes.json();
                throw new Error(data.error ?? 'Failed to save video');
            }

            const { video } = await saveRes.json();
            setState('done');
            router.push(`/video/${video.id}`);
        } catch (err) {
            setState('error');
            setError(err instanceof Error ? err.message : 'Upload failed');
            console.error('Upload error:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Drop zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl2 p-10 text-center cursor-pointer transition ${
                    file
                        ? 'border-flare bg-flare-tint'
                        : 'border-ink-border hover:border-ink-borderStrong'
                }`}
            >
                <input
                    title="Select video file"
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {file ? (
                    <div>
                        <p className="text-paper font-medium">{file.name}</p>
                        <p className="text-paper-faint text-sm mt-1">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB · Click
                            to change
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="text-4xl mb-3">🎬</div>
                        <p className="text-paper-dim font-medium font-display">
                            Drop your video here or click to browse
                        </p>
                        <p className="text-paper-faint text-sm mt-1">
                            MP4, MOV, AVI · Max 2 GB
                        </p>
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-paper-faint mb-1.5">
                        Title
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        placeholder="Give your video a title"
                        maxLength={100}
                        className="input-base"
                    />
                </div>

                <div>
                    <label className="block text-sm text-paper-faint mb-1.5">
                        Description{' '}
                        <span className="text-paper-faint/70">(optional)</span>
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        placeholder="Tell viewers about your video..."
                        rows={4}
                        maxLength={5000}
                        className="input-base resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-paper-faint mb-1.5">
                        Tags{' '}
                        <span className="text-paper-faint/70">
                            (comma-separated)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={form.tags}
                        onChange={(e) =>
                            setForm({ ...form, tags: e.target.value })
                        }
                        placeholder="nextjs, tutorial, webdev"
                        className="input-base"
                    />
                </div>

                <div>
                    <label className="block text-sm text-paper-faint mb-1.5">
                        Custom thumbnail{' '}
                        <span className="text-paper-faint/70">(optional)</span>
                    </label>
                    <input
                        title="Select thumbnail image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            setThumbnail(e.target.files?.[0] ?? null)
                        }
                        className="w-full text-sm text-paper-faint file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-ink-raised file:text-paper-dim hover:file:bg-ink-border"
                    />
                </div>
            </div>

            {/* Progress */}
            {(state === 'uploading' || state === 'saving') && (
                <div>
                    <div className="flex justify-between text-sm text-paper-faint mb-1.5">
                        <span>
                            {state === 'uploading'
                                ? 'Uploading to Cloudinary...'
                                : 'Saving...'}
                        </span>
                        <span>
                            {state === 'uploading' ? `${progress}%` : ''}
                        </span>
                    </div>
                    <div className="w-full bg-ink-surface rounded-full h-2 ring-1 ring-ink-border overflow-hidden">
                        <div
                            className="bg-flare h-2 rounded-full transition-all duration-300"
                            style={{
                                width:
                                    state === 'saving'
                                        ? '100%'
                                        : `${progress}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {error && <p className="text-flare text-sm">{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={
                    !file ||
                    !form.title ||
                    state === 'uploading' ||
                    state === 'saving'
                }
                className="btn-primary w-full py-3"
            >
                {state === 'uploading'
                    ? `Uploading... ${progress}%`
                    : state === 'saving'
                      ? 'Saving metadata...'
                      : 'Upload video'}
            </button>
        </div>
    );
}
