export type NotificationWithRelations = {
  id: string;
  type: "NEW_VIDEO" | "NEW_COMMENT" | "NEW_LIKE" | "NEW_SUBSCRIBER";
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
    channelHandle: string | null;
  };
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  } | null;
};

export function notificationLabel(n: NotificationWithRelations): string {
  const name = n.actor.name ?? n.actor.channelHandle ?? "Someone";
  switch (n.type) {
    case "NEW_VIDEO":
      return `${name} uploaded a new video`;
    case "NEW_COMMENT":
      return `${name} commented on your video`;
    case "NEW_LIKE":
      return `${name} liked your video`;
    case "NEW_SUBSCRIBER":
      return `${name} subscribed to your channel`;
  }
}
