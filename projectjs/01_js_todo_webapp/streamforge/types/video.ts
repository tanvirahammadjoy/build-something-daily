export type VideoWithUser = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  duration: number;
  views: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    channelHandle: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};
