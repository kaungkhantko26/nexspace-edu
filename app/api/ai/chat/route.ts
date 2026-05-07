import { NextResponse } from "next/server";
import { chatRequestSchema, generateChatResponse } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const message = await generateChatResponse(parsed.data);
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI request failed" }, { status: 502 });
  }
}

