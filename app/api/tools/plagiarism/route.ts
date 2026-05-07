import { NextResponse } from "next/server";
import { z } from "zod";

const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8001";

const requestSchema = z.object({
  text: z.string().min(20).max(50000),
  sources: z.array(z.object({
    name: z.string().optional(),
    url: z.string().optional(),
    text: z.string().optional()
  })).optional()
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plagiarism payload" }, { status: 400 });
  }

  try {
    const response = await fetch(`${aiServiceUrl}/plagiarism`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: parsed.data.text,
        sources: parsed.data.sources ?? []
      })
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Python plagiarism service is unavailable. Set AI_SERVICE_URL in production." }, { status: 503 });
  }
}
