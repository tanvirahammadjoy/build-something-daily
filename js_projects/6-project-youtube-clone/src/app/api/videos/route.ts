// src/app/api/videos/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const cursor = searchParams.get('cursor')
  const limit = 12

  const videos = await prisma.video.findMany({
    where: {
      published: true,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  let nextCursor: string | null = null
  if (videos.length > limit) {
    nextCursor = videos[limit].id
    videos.pop()
  }

  return NextResponse.json({ videos, nextCursor })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, videoUrl, thumbnailUrl, duration } = body

  if (!title || !videoUrl) {
    return NextResponse.json({ error: 'title and videoUrl are required' }, { status: 400 })
  }

  const video = await prisma.video.create({
    data: {
      title,
      description: description ?? null,
      videoUrl,
      thumbnailUrl: thumbnailUrl ?? null,
      duration: duration ?? null,
      userId: session.user.id,
    },
  })

  return NextResponse.json(video, { status: 201 })
}
