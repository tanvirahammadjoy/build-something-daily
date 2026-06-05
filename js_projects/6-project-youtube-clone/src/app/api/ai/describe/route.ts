// src/app/api/ai/describe/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, topic } = await request.json();

  if (!title || !topic) {
    return NextResponse.json(
      { error: "title and topic are required" },
      { status: 400 },
    );
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          'You are a YouTube SEO expert. Given a video title and topic, write an engaging video description (150-250 words) followed by 8-12 relevant hashtags. Format your response as JSON with keys "description" (string) and "hashtags" (array of strings without the # symbol).',
      },
      {
        role: "user",
        content: `Video title: "${title}"\nTopic: "${topic}"`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 600,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw)
    return NextResponse.json({ error: "No response from AI" }, { status: 500 });

  const result = JSON.parse(raw) as { description: string; hashtags: string[] };
  return NextResponse.json(result);
}
