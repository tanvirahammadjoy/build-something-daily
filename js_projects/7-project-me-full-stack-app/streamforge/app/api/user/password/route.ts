import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
});

export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const result = PasswordSchema.safeParse(body);
    if (!result.success)
        return NextResponse.json(
            { error: result.error.errors[0].message },
            { status: 400 }
        );

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
    });
    if (!user?.password)
        return NextResponse.json(
            {
                error: 'Your account uses GitHub sign-in. No password to change.',
            },
            { status: 400 }
        );

    const match = await bcrypt.compare(
        result.data.currentPassword,
        user.password
    );
    if (!match)
        return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
        );

    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: await bcrypt.hash(result.data.newPassword, 12) },
    });
    return NextResponse.json({ ok: true });
}
