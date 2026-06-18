'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import {
    notificationLabel,
    NotificationWithRelations,
} from '@/types/notification';
import { formatRelativeTime } from '@/lib/format';

export function BellIcon({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAllRead } =
        useNotifications(isLoggedIn);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node)
            )
                setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = () => {
        setOpen((x) => !x);
        if (!open && unreadCount > 0) markAllRead();
    };

    if (!isLoggedIn) return null;

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={handleOpen}
                aria-label="Notifications"
                className="relative p-1.5 rounded-lg text-paper-dim hover:text-paper hover:bg-ink-raised transition"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-flare text-ink text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-80 bg-ink-surface border border-ink-border rounded-xl2 shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border">
                        <span className="font-display text-paper font-semibold text-sm">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-flare text-xs hover:text-flare-dim transition"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-paper-faint text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onClose={() => setOpen(false)}
                                />
                            ))
                        )}
                    </div>
                    <Link
                        href="/notifications"
                        onClick={() => setOpen(false)}
                        className="block text-center text-flare text-sm py-3 border-t border-ink-border hover:text-flare-dim transition"
                    >
                        View all
                    </Link>
                </div>
            )}
        </div>
    );
}

function NotificationRow({
    notification: n,
    onClose,
}: {
    notification: NotificationWithRelations;
    onClose: () => void;
}) {
    const href = n.video
        ? `/video/${n.video.id}`
        : `/channel/${n.actor.channelHandle ?? n.actor.id}`;
    return (
        <Link
            href={href}
            onClick={onClose}
            className={`flex items-start gap-3 px-4 py-3 hover:bg-ink-raised transition ${!n.read ? 'bg-flare/5' : ''}`}
        >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-ink-raised flex-shrink-0 mt-0.5">
                {n.actor.image ? (
                    <Image
                        src={n.actor.image}
                        alt={n.actor.name ?? ''}
                        width={32}
                        height={32}
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-paper text-xs">
                        {n.actor.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-paper-dim text-xs leading-snug">
                    {notificationLabel(n)}
                </p>
                {n.video && (
                    <p className="text-paper-faint text-xs mt-0.5 truncate">
                        {n.video.title}
                    </p>
                )}
                <p className="text-paper-faint/70 text-xs mt-0.5">
                    {formatRelativeTime(n.createdAt)}
                </p>
            </div>
            {!n.read && (
                <div className="w-2 h-2 rounded-full bg-flare flex-shrink-0 mt-1.5" />
            )}
        </Link>
    );
}
