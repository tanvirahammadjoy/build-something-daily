// src/types/index.ts
import { Prisma } from "@prisma/client";

// ─── Video feed card (home grid) ─────────────────────────────────────────────
export type VideoWithUser = Prisma.VideoGetPayload<{
  include: {
    user: { select: { id: true; name: true; image: true; handle: true } };
    _count: { select: { likes: true; comments: true } };
  };
}>;

// ─── Full video (watch page) ──────────────────────────────────────────────────
export type VideoFull = Prisma.VideoGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        image: true;
        handle: true;
        _count: { select: { followers: true } };
      };
    };
    _count: { select: { likes: true; comments: true } };
  };
}>;

// ─── Comment with author + reply count ───────────────────────────────────────
export type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: { select: { id: true; name: true; image: true } };
    _count: { select: { replies: true; likes: true } };
    replies: {
      include: {
        user: { select: { id: true; name: true; image: true } };
        _count: { select: { likes: true } };
      };
      orderBy: { createdAt: "asc" };
      take: 5;
    };
  };
}>;
