import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const baseHandle = name.toLowerCase().replace(/\s+/g, "_");
    const channelHandle = `@${baseHandle}_${Math.floor(Math.random() * 9000) + 1000}`;

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, channelHandle },
      select: { id: true, name: true, email: true, channelHandle: true, createdAt: true },
    });

    return NextResponse.json({ message: "Account created successfully", user }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
