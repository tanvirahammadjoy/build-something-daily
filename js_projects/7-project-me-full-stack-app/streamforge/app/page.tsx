import { prisma } from '@/lib/prisma';
import { VideoGrid } from '@/components/video/VideoGrid';
import { CategoryPills } from '@/components/home/CategoryPills';
import { VideoWithUser } from '@/types/video';

interface Props {
    searchParams: { sort?: string; tag?: string };
}

export default async function HomePage({ searchParams }: Props) {
    const { sort, tag } = await searchParams;

    const orderBy =
        sort === 'trending'
            ? [{ views: 'desc' as const }, { createdAt: 'desc' as const }]
            : [{ createdAt: 'desc' as const }];

    const where = {
        status: 'PUBLIC' as const,
        ...(tag ? { tags: { some: { name: tag } } } : {}),
    };

    const raw = await prisma.video.findMany({
        where,
        orderBy,
        take: 13,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    channelHandle: true,
                },
            },
            _count: {
                select: { likes: { where: { isLike: true } }, comments: true },
            },
        },
    });

    const hasNextPage = raw.length > 12;
    const videos = hasNextPage ? raw.slice(0, 12) : raw;
    const nextCursor = hasNextPage ? videos[videos.length - 1].id : null;

    const popularTags = await prisma.tag.findMany({
        take: 20,
        include: { _count: { select: { videos: true } } },
        orderBy: { videos: { _count: 'desc' } },
    });

    return (
        <main className="min-h-screen bg-gray-950">
            <div className="max-w-screen-xl mx-auto px-4 py-6">
                <CategoryPills
                    tags={popularTags.map((t) => t.name)}
                    activeTag={tag}
                    activeSort={sort}
                />
                <VideoGrid
                    initialVideos={videos as VideoWithUser[]}
                    initialCursor={nextCursor}
                    sort={sort}
                    tag={tag}
                />
            </div>
        </main>
    );
}
