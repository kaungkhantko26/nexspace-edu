import { NextResponse } from "next/server";
import { z } from "zod";

const reportSchema = z.object({
  type: z.enum(["assignment", "plagiarism", "ai-detector"]),
  text: z.string().min(20).max(50000)
});

export async function POST(request: Request) {
  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  const text = parsed.data.text;
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const duplicateSignals = new Set(sentences.map((sentence) => sentence.trim().toLowerCase())).size;

  return NextResponse.json({
    id: crypto.randomUUID(),
    type: parsed.data.type,
    summary: "Initial analysis complete. Replace this deterministic scorer with the FastAPI AI pipeline for production inference.",
    scores: {
      similarity: Math.min(42, Math.round((sentences.length - duplicateSignals) * 8 + 12)),
      ai: Math.min(88, Math.round(text.split(" ").length / 18)),
      confidence: 82
    },
    recommendations: [
      "Add citations to claims with source-specific evidence.",
      "Vary sentence structure in repetitive paragraphs.",
      "Map each section to the grading criteria before final submission."
    ]
  });
}

