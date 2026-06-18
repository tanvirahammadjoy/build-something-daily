'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface SessionUser {
    id: string;
    name?: string | null;
    image?: string | null;
    channelHandle?: string | null;
}

export function AccountMenu({ user }: { user: SessionUser }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const channelHref = `/channel/${user.channelHandle ?? user.id}`;

    const links = [
        { href: channelHref, label: 'Your channel', icon: 'user' },
        { href: '/studio', label: 'Creator studio', icon: 'studio' },
        { href: '/watch-later', label: 'Watch later', icon: 'bookmark' },
        { href: '/history', label: 'Watch history', icon: 'history' },
        { href: '/settings/profile', label: 'Settings', icon: 'settings' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((x) => !x)}
                aria-label="Account menu"
                className="w-8 h-8 rounded-full overflow-hidden bg-ink-raised flex-shrink-0 ring-1 ring-ink-border hover:ring-flare transition"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt="Your avatar"
                        width={32}
                        height={32}
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-paper text-sm font-medium font-display">
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-64 bg-ink-surface border border-ink-border rounded-xl2 shadow-xl overflow-hidden z-50">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-border">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-raised flex-shrink-0 ring-1 ring-ink-border">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt="Your avatar"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-paper text-sm font-medium font-display">
                                    {user.name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-paper text-sm font-medium truncate">
                                {user.name}
                            </p>
                            {user.channelHandle && (
                                <p className="text-paper-faint text-xs truncate">
                                    {user.channelHandle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="py-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-paper-dim text-sm hover:bg-ink-raised hover:text-paper transition"
                            >
                                <MenuIcon name={link.icon} />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t border-ink-border py-1">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-flare text-sm hover:bg-ink-raised transition text-left"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuIcon({ name }: { name: string }) {
    const paths: Record<string, string> = {
        user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        studio: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
        bookmark:
            'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
        history: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
        settings:
            'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7.39 7.39 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
    };
    return (
        <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={paths[name] ?? paths.user}
            />
        </svg>
    );
}
