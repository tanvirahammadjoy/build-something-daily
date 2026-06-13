import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateVideoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  publicId: z.string().min(1),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  tagNames: z.array(z.string()).max(10).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = CreateVideoSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

  const { title, description, publicId, videoUrl, thumbnailUrl, duration, tagNames } = result.data;

  const video = await prisma.video.create({
    data: {
      title, description, publicId, videoUrl,
      thumbnailUrl: thumbnailUrl ?? null,
      duration: duration ?? 0,
      status: "PROCESSING",
      userId: session.user.id,
      tags: {
        connectOrCreate: (tagNames ?? []).map((name) => ({
          where: { name: name.toLowerCase().trim() },
          create: { name: name.toLowerCase().trim() },
        })),
      },
    },
    include: {
      user: { select: { id: true, name: true, image: true, channelHandle: true } },
      tags: true,
    },
  });

  return NextResponse.json({ video }, { status: 201 });
}
