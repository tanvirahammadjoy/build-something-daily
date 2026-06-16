import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { StatCard } from '@/components/studio/StatCard';
import {
    ViewsChart,
    EngagementChart,
} from '@/components/studio/AnalyticsCharts';
import { TopVideosTable } from '@/components/studio/TopVideosTable';
import { RangeSelector } from '@/components/studio/RangeSelector';
import { AnalyticsData } from '@/types/analytics';

export default async function StudioPage({
    searchParams,
}: {
    searchParams: { range?: string };
}) {
    const session = await getServerSession();
    if (!session) redirect('/sign-in?callbackUrl=/studio');

    const range = searchParams.range ?? '30d';

    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/studio/analytics?range=${range}`,
        { cache: 'no-store' }
    );
    const data: AnalyticsData = await res.json();
    const { totals, timeline, topVideos } = data;

    const mid = Math.floor(timeline.length / 2);
    const firstHalf = timeline.slice(0, mid).reduce((s, d) => s + d.views, 0);
    const secondHalf = timeline.slice(mid).reduce((s, d) => s + d.views, 0);
    const viewTrend =
        firstHalf === 0
            ? null
            : Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

    return (
        <main className="min-h-screen bg-gray-950">
            <div className="max-w-screen-xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Creator studio
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {session.user.name ??
                                session.user.channelHandle ??
                                'Your channel'}
                        </p>
                    </div>
                    <RangeSelector active={range} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total views"
                        value={totals.views}
                        subtext={
                            viewTrend !== null
                                ? `${viewTrend >= 0 ? '+' : ''}${viewTrend}% vs prior period`
                                : undefined
                        }
                        accent="blue"
                    />
                    <StatCard
                        label="Total likes"
                        value={totals.likes}
                        accent="purple"
                    />
                    <StatCard
                        label="Subscribers"
                        value={totals.subscribers}
                        accent="green"
                    />
                    <StatCard
                        label="Videos published"
                        value={totals.videos}
                        accent="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    <ViewsChart timeline={timeline} />
                    <EngagementChart timeline={timeline} />
                </div>

                <TopVideosTable videos={topVideos} />
            </div>
        </main>
    );
}
