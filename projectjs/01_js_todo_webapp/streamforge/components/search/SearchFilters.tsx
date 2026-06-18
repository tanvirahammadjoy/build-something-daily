'use client';
import { useRouter } from 'next/navigation';

interface Props {
    activeSort: string;
    q?: string;
    tag?: string;
}

export function SearchFilters({ activeSort, q, tag }: Props) {
    const router = useRouter();
    const setSort = (sort: string) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (tag) params.set('tag', tag);
        params.set('sort', sort);
        router.push(`/search?${params}`);
    };

    return (
        <div className="flex gap-2">
            <span className="text-paper-faint text-sm self-center">
                Sort by:
            </span>
            {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'date', label: 'Upload date' },
                { value: 'views', label: 'View count' },
            ].map((o) => (
                <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${activeSort === o.value ? 'bg-flare text-ink font-medium' : 'bg-ink-surface text-paper-dim hover:bg-ink-raised ring-1 ring-ink-border'}`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
