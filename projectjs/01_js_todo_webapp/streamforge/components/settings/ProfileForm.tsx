'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Props {
    user: {
        id: string;
        name: string | null;
        bio: string | null;
        channelHandle: string | null;
        image: string | null;
        bannerImage: string | null;
        hasPassword: boolean;
    };
}

type Tab = 'profile' | 'password';

export function ProfileForm({ user }: Props) {
    const { update: updateSession } = useSession();
    const [tab, setTab] = useState<Tab>('profile');
    const [form, setForm] = useState({
        name: user.name ?? '',
        bio: user.bio ?? '',
        channelHandle: user.channelHandle ?? '',
    });
    const [avatarUrl, setAvatarUrl] = useState(user.image ?? '');
    const [bannerUrl, setBannerUrl] = useState(user.bannerImage ?? '');
    const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(
        null
    );
    const [saving, setSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{
        ok: boolean;
        text: string;
    } | null>(null);
    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirm: '',
    });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(
        null
    );

    async function uploadImage(
        file: File,
        folder: 'avatars' | 'banners'
    ): Promise<string> {
        const sigRes = await fetch('/api/cloudinary/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                folder: `streamforge/${folder}`,
                resource_type: 'image',
            }),
        });
        const { signature, timestamp, apiKey } = await sigRes.json();
        const fd = new FormData();
        fd.append('file', file);
        fd.append('signature', signature);
        fd.append('timestamp', String(timestamp));
        fd.append('api_key', apiKey);
        fd.append('folder', `streamforge/${folder}`);
        fd.append('resource_type', 'image');
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: fd }
        );
        return (await res.json()).secure_url as string;
    }

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'avatar' | 'banner'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(type);
        try {
            const url = await uploadImage(
                file,
                type === 'avatar' ? 'avatars' : 'banners'
            );
            if (type === 'avatar') setAvatarUrl(url);
            else setBannerUrl(url);
        } catch {
            setProfileMsg({ ok: false, text: 'Image upload failed.' });
        } finally {
            setUploading(null);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        setProfileMsg(null);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    image: avatarUrl || null,
                    bannerImage: bannerUrl || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await updateSession({
                name: data.user.name,
                image: data.user.image,
                channelHandle: data.user.channelHandle,
                bannerImage: data.user.bannerImage,
            });
            setProfileMsg({ ok: true, text: 'Profile saved successfully.' });
        } catch (err) {
            setProfileMsg({
                ok: false,
                text: err instanceof Error ? err.message : 'Save failed.',
            });
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwMsg({ ok: false, text: 'New passwords do not match.' });
            return;
        }
        setPwSaving(true);
        setPwMsg(null);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: pwForm.currentPassword,
                    newPassword: pwForm.newPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPwMsg({ ok: true, text: 'Password changed successfully.' });
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
        } catch (err) {
            setPwMsg({
                ok: false,
                text: err instanceof Error ? err.message : 'Failed.',
            });
        } finally {
            setPwSaving(false);
        }
    };

    const tabCls = (t: Tab) =>
        `px-4 py-2 text-sm font-medium rounded-full transition ${tab === t ? 'bg-ink-surface text-paper' : 'text-paper-faint hover:text-paper-dim'}`;

    return (
        <div>
            <div className="flex gap-2 mb-8">
                <button
                    className={tabCls('profile')}
                    onClick={() => setTab('profile')}
                >
                    Profile
                </button>
                {user.hasPassword && (
                    <button
                        className={tabCls('password')}
                        onClick={() => setTab('password')}
                    >
                        Password
                    </button>
                )}
            </div>

            {tab === 'profile' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-paper-faint mb-2">
                            Channel banner
                        </label>
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-ink-surface group cursor-pointer">
                            {bannerUrl && (
                                <Image
                                    src={bannerUrl}
                                    alt="Banner"
                                    fill
                                    className="object-cover"
                                />
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                <span className="text-paper text-sm font-medium">
                                    {uploading === 'banner'
                                        ? 'Uploading...'
                                        : 'Change banner'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageChange(e, 'banner')
                                    }
                                    disabled={!!uploading}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-ink-raised flex-shrink-0 group cursor-pointer">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-paper text-2xl">
                                    {form.name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                <span className="text-paper text-xs text-center">
                                    {uploading === 'avatar' ? '...' : 'Change'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageChange(e, 'avatar')
                                    }
                                    disabled={!!uploading}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-paper-faint">
                            Recommended: square image, at least 200×200px.
                        </p>
                    </div>
                    {[
                        {
                            label: 'Display name',
                            key: 'name',
                            placeholder: 'Your name',
                        },
                        {
                            label: 'Channel handle',
                            key: 'channelHandle',
                            placeholder: '@your_handle',
                        },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-sm text-paper-faint mb-1.5">
                                {label}
                            </label>
                            <input
                                type="text"
                                value={form[key as keyof typeof form]}
                                onChange={(e) =>
                                    setForm({ ...form, [key]: e.target.value })
                                }
                                placeholder={placeholder}
                                maxLength={50}
                                className="w-full px-4 py-2.5 rounded-lg bg-ink-surface border border-ink-border text-paper placeholder-paper-faint focus:outline-none focus:border-flare transition"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm text-paper-faint mb-1.5">
                            Bio
                        </label>
                        <textarea
                            placeholder="Your bio"
                            value={form.bio}
                            onChange={(e) =>
                                setForm({ ...form, bio: e.target.value })
                            }
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2.5 rounded-lg bg-ink-surface border border-ink-border text-paper placeholder-paper-faint focus:outline-none focus:border-flare transition resize-none"
                        />
                        <p className="text-right text-paper-faint/70 text-xs mt-1">
                            {form.bio.length}/500
                        </p>
                    </div>
                    {profileMsg && (
                        <p
                            className={`text-sm ${profileMsg.ok ? 'text-flare' : 'text-flare'}`}
                        >
                            {profileMsg.text}
                        </p>
                    )}
                    <button
                        onClick={saveProfile}
                        disabled={saving || !!uploading}
                        className="px-6 py-2.5 bg-flare hover:bg-flare-dim text-paper text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save profile'}
                    </button>
                </div>
            )}

            {tab === 'password' && (
                <div className="space-y-4 max-w-md">
                    {[
                        { label: 'Current password', key: 'currentPassword' },
                        { label: 'New password', key: 'newPassword' },
                        { label: 'Confirm new password', key: 'confirm' },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <label className="block text-sm text-paper-faint mb-1.5">
                                {label}
                            </label>
                            <input
                                placeholder={label}
                                type="password"
                                value={pwForm[key as keyof typeof pwForm]}
                                onChange={(e) =>
                                    setPwForm({
                                        ...pwForm,
                                        [key]: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2.5 rounded-lg bg-ink-surface border border-ink-border text-paper focus:outline-none focus:border-flare transition"
                            />
                        </div>
                    ))}
                    {pwMsg && (
                        <p
                            className={`text-sm ${pwMsg.ok ? 'text-flare' : 'text-flare'}`}
                        >
                            {pwMsg.text}
                        </p>
                    )}
                    <button
                        onClick={savePassword}
                        disabled={
                            pwSaving ||
                            !pwForm.currentPassword ||
                            !pwForm.newPassword
                        }
                        className="px-6 py-2.5 bg-flare hover:bg-flare-dim text-paper text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                        {pwSaving ? 'Changing...' : 'Change password'}
                    </button>
                </div>
            )}
        </div>
    );
}
