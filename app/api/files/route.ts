import { NextResponse } from "next/server";
import { processUploadedFile } from "@/lib/file-processing";

export const runtime = "nodejs";

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown"
]);

const allowedExtensions = [".pdf", ".docx", ".pptx", ".txt", ".md"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const lowerName = file.name.toLowerCase();

  if (!allowedTypes.has(file.type) && !allowedExtensions.some((extension) => lowerName.endsWith(extension))) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 413 });
  }

  try {
    const document = await processUploadedFile(file);
    return NextResponse.json({
      ...document,
      status: "indexed",
      pipeline: ["extract", "chunk", "embed-ready", "retrieve-ready", "answer-ready"],
      message: "File text extracted and attached to the active AI context."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File extraction failed" },
      { status: 422 }
    );
  }
}
