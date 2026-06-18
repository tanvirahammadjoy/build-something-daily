'use client';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
    tags: string[];
    activeTag?: string;
    activeSort?: string;
}

export function CategoryPills({ tags, activeTag, activeSort }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const navigate = (params: Record<string, string | undefined>) => {
        const next = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([k, v]) => {
            if (v) next.set(k, v);
            else next.delete(k);
        });
        router.push(`/?${next}`);
    };

    const pillBase =
        'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer';
    const active = `${pillBase} bg-flare text-ink`;
    const inactive = `${pillBase} bg-ink-surface text-paper-dim hover:bg-ink-raised hover:text-paper ring-1 ring-ink-border`;

    return (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            <button
                onClick={() => navigate({ sort: undefined, tag: activeTag })}
                className={
                    !activeTag && activeSort !== 'trending' ? active : inactive
                }
            >
                All
            </button>
            <button
                onClick={() => navigate({ sort: 'trending', tag: activeTag })}
                className={activeSort === 'trending' ? active : inactive}
            >
                Trending
            </button>
            <div className="w-px bg-ink-border flex-shrink-0 self-stretch mx-1" />
            {tags.map((tag) => (
                <button
                    type="button"
                    key={tag}
                    onClick={() =>
                        navigate({
                            tag: activeTag === tag ? undefined : tag,
                            sort: activeSort,
                        })
                    }
                    className={activeTag === tag ? active : inactive}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}
