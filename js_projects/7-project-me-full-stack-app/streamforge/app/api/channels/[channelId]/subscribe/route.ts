import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { channelId: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.id === params.channelId)
    return NextResponse.json({ error: "Cannot subscribe to yourself" }, { status: 400 });

  await prisma.subscription.upsert({
    where: { subscriberId_channelId: { subscriberId: session.user.id, channelId: params.channelId } },
    create: { subscriberId: session.user.id, channelId: params.channelId },
    update: {},
  });

  return NextResponse.json({ subscribed: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { channelId: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.subscription.deleteMany({
    where: { subscriberId: session.user.id, channelId: params.channelId },
  });

  return NextResponse.json({ subscribed: false });
}
