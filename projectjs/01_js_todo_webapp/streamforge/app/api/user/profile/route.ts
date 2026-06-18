import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  channelHandle: z
    .string().min(3).max(30)
    .regex(/^@[a-z0-9_]+$/, "Handle must start with @ and contain only lowercase letters, numbers and underscores")
    .optional(),
  image: z.string().url().optional().nullable(),
  bannerImage: z.string().url().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = ProfileSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

  if (result.data.channelHandle) {
    const taken = await prisma.user.findFirst({
      where: { channelHandle: result.data.channelHandle, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (taken) return NextResponse.json({ error: "Channel handle already taken" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: result.data,
    select: { id: true, name: true, bio: true, channelHandle: true, image: true, bannerImage: true },
  });

  return NextResponse.json({ user: updated });
}
