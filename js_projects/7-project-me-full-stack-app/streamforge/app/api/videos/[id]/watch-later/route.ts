import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ saved: false });

  const entry = await prisma.watchLater.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
    select: { id: true },
  });

  return NextResponse.json({ saved: !!entry });
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.watchLater.upsert({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
    create: { userId: session.user.id, videoId: params.id },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.watchLater.deleteMany({ where: { userId: session.user.id, videoId: params.id } });
  return NextResponse.json({ saved: false });
}
