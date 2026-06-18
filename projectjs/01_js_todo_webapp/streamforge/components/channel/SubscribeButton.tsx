'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    channelId: string;
    initialSubscribed: boolean;
    isLoggedIn: boolean;
}

export function SubscribeButton({
    channelId,
    initialSubscribed,
    isLoggedIn,
}: Props) {
    const router = useRouter();
    const [subscribed, setSubscribed] = useState(initialSubscribed);
    const [isPending, startTransition] = useTransition();

    const handleClick = async () => {
        if (!isLoggedIn) {
            router.push('/sign-in');
            return;
        }
        setSubscribed((prev) => !prev);
        try {
            const res = await fetch(`/api/channels/${channelId}/subscribe`, {
                method: subscribed ? 'DELETE' : 'POST',
            });
            if (!res.ok) setSubscribed((prev) => !prev);
            else startTransition(() => router.refresh());
        } catch {
            setSubscribed((prev) => !prev);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={subscribed ? 'btn-secondary' : 'btn-primary'}
        >
            {subscribed ? 'Subscribed' : 'Subscribe'}
        </button>
    );
}
