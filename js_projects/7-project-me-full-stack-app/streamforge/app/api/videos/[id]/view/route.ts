import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.video.update({ where: { id: params.id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ ok: true });
}
