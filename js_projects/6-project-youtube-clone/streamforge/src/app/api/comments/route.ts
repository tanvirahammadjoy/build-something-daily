// src/app/api/comments/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

  // Fetch only top-level comments; replies are nested inside
  const comments = await prisma.comment.findMany({
    where: { videoId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true, likes: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(comments)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { videoId, text, parentId } = await request.json()

  if (!videoId || !text?.trim()) {
    return NextResponse.json({ error: 'videoId and text required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      text: text.trim(),
      userId: session.user.id,
      videoId,
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true, likes: true } },
      replies: { include: { user: { select: { id: true, name: true, image: true } }, _count: { select: { likes: true } } }, take: 5 },
    },
  })

  return NextResponse.json(comment, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
