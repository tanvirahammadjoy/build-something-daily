// src/app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followingId }: { followingId: string } = await request.json();
  const followerId = session.user.id;

  if (followerId === followingId) {
    return NextResponse.json(
      { error: "Cannot subscribe to yourself" },
      { status: 400 },
    );
  }

  const existing = await prisma.subscription.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
    return NextResponse.json({ subscribed: false });
  }

  await prisma.subscription.create({ data: { followerId, followingId } });
  return NextResponse.json({ subscribed: true });
}

// GET /api/subscriptions?followingId=xxx — check if current user subscribes
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ subscribed: false });

  const { searchParams } = new URL(request.url);
  const followingId = searchParams.get("followingId");
  if (!followingId) return NextResponse.json({ subscribed: false });

  const sub = await prisma.subscription.findUnique({
    where: {
      followerId_followingId: { followerId: session.user.id, followingId },
    },
  });
  return NextResponse.json({ subscribed: !!sub });
}
