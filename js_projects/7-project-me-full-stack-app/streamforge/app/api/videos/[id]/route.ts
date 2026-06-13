import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { z } from "zod";

const UpdateVideoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["PUBLIC", "PRIVATE", "DRAFT"]).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  tagNames: z.array(z.string()).max(10).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const video = await prisma.video.findUnique({ where: { id: params.id }, select: { userId: true } });
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (video.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const result = UpdateVideoSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

  const { tagNames, ...fields } = result.data;

  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      ...fields,
      ...(tagNames !== undefined && {
        tags: {
          set: [],
          connectOrCreate: tagNames.map((name) => ({
            where: { name: name.toLowerCase().trim() },
            create: { name: name.toLowerCase().trim() },
          })),
        },
      }),
    },
    include: { tags: { select: { name: true } } },
  });

  return NextResponse.json({ video: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const video = await prisma.video.findUnique({ where: { id: params.id }, select: { userId: true, publicId: true } });
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (video.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
  } catch (err) {
    console.error("[DELETE_VIDEO] Cloudinary deletion failed:", err);
  }

  await prisma.video.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
