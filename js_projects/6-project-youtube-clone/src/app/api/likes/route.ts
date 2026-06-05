// src/app/api/likes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LikeType } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId, type }: { videoId: string; type: LikeType } =
    await request.json();
  const userId = session.user.id;

  // Check if user already has a reaction on this video
  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });

  if (existing) {
    if (existing.type === type) {
      // Same type — remove the reaction (toggle off)
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    } else {
      // Different type — update it (switch like ↔ dislike)
      const updated = await prisma.like.update({
        where: { id: existing.id },
        data: { type },
      });
      return NextResponse.json({ action: "updated", like: updated });
    }
  }

  // No existing reaction — create new
  const like = await prisma.like.create({
    data: { type, userId, videoId },
  });
  return NextResponse.json({ action: "created", like });
}
