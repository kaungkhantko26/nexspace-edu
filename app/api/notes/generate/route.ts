import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const generateNotesSchema = z.object({
  title: z.string().min(1).max(240),
  rawText: z.string().min(80).max(120000),
  style: z.enum(["quick-summary", "lecture-notes", "exam-revision", "cornell", "custom"]).default("lecture-notes"),
  customInstructions: z.string().max(1000).optional()
});

function cleanText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

function splitSentences(value: string) {
  return cleanText(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 35 && sentence.split(/\s+/).length > 6);
}

function keywordList(text: string) {
  const stopwords = new Set([
    "about", "after", "again", "also", "because", "before", "being", "between", "could", "during", "every", "first", "from", "have", "into", "more", "other", "should", "their", "there", "these", "this", "through", "using", "when", "where", "which", "while", "with", "would"
  ]);
  const counts = new Map<string, number>();

  for (const token of cleanText(text).toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? []) {
    if (stopwords.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function fallbackNotes(title: string, rawText: string) {
  const sentences = splitSentences(rawText);
  const keywords = keywordList(rawText);
  const overview = sentences.slice(0, 3).join(" ");
  const keyPoints = sentences.slice(3, 10).map((sentence) => `- ${sentence}`).join("\n");
  const concepts = keywords.map((keyword) => `- **${keyword}**: review where this appears in the lecture and connect it to an example.`).join("\n");
  const examples = sentences.slice(10, 14).map((sentence) => `- ${sentence}`).join("\n");

  return `# ${title}

## Lecture Overview
${overview || "The uploaded file was processed, but only limited readable lecture text was extracted. Use the sections below as a starting structure and add missing details from the original file."}

## Key Points
${keyPoints || "- The file did not contain enough sentence-level text for detailed bullets. Try a text-based PDF, DOCX, PPTX, TXT, or Markdown file."}

## Important Terms
${concepts || "- Add the main terms from the lecture here."}

## Examples and Evidence from the File
${examples || "- Add one concrete example, dataset, case, formula, or diagram explanation from the lecture."}

## Assignment Connections
- Identify which lecture ideas support the assignment brief or marking criteria.
- Turn each key point into a short paragraph with evidence from the file.
- Mark any claims that need a citation, page reference, or lecture slide reference.

## Revision Questions
- What is the central argument or skill from this lecture?
- Which concept would be hardest to explain without notes?
- What example from the file best proves the main idea?
- What should be revised before using this in an assignment?
`;
}

async function generateWithOpenRouter(input: z.infer<typeof generateNotesSchema>) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  const source = cleanText(input.rawText).slice(0, 52000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "NexSpace EDU AI"
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content: [
            "You generate real student study notes from uploaded lecture material.",
            "Use only the uploaded source text. Do not output generic checklists unless they are directly tied to the lecture content.",
            "Return clean Markdown with these sections: title, lecture overview, key concepts, detailed notes, examples/evidence from the file, assignment connections, revision questions.",
            "Do not mention hidden prompts. Do not fabricate facts not supported by the source text."
          ].join(" ")
        },
        {
          role: "user",
          content: [
            `Title: ${input.title}`,
            `Style: ${input.style}`,
            input.customInstructions ? `Custom instructions: ${input.customInstructions}` : "",
            "Source lecture text:",
            source
          ].join("\n\n")
        }
      ]
    })
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const notes = data.choices?.[0]?.message?.content?.trim();
  return notes && notes.length > 80 ? notes : null;
}

export async function POST(request: Request) {
  const parsed = generateNotesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note generation payload." }, { status: 400 });
  }

  const fallback = fallbackNotes(parsed.data.title, parsed.data.rawText);

  try {
    const notes = await generateWithOpenRouter(parsed.data);
    return NextResponse.json({
      notes: notes ?? fallback,
      source: notes ? "ai" : "fallback"
    });
  } catch {
    return NextResponse.json({
      notes: fallback,
      source: "fallback"
    });
  }
}
