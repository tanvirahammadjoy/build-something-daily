export type AnalyticsData = {
    totals: {
        views: number;
        likes: number;
        subscribers: number;
        videos: number;
    };
    timeline: {
        date: string;
        views: number;
        likes: number;
        subscribers: number;
    }[];
    topVideos: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
        views: number;
        createdAt: string;
        _count: { likes: number };
    }[];
};
