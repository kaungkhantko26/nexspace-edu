import JSZip from "jszip";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { chunkText } from "@/lib/rag";

export type ProcessedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  text: string;
  summary: string;
  chunks: Array<{ id: string; content: string; index: number }>;
};

const textTypeByExtension = new Map([
  [".txt", "text/plain"],
  [".md", "text/plain"]
]);

function summarizeText(text: string) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const preview = sentences.slice(0, 4).join(" ");
  return preview || "Document uploaded and indexed. Ask a question to use it as context.";
}

async function extractPptxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  const slideTexts = await Promise.all(
    slideFiles.map(async (name) => {
      const xml = await zip.files[name].async("text");
      return xml
        .replace(/<a:t>/g, " ")
        .replace(/<\/a:t>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
    })
  );

  return slideTexts.filter(Boolean).join("\n\n");
}

export async function processUploadedFile(file: File): Promise<ProcessedDocument> {
  const id = crypto.randomUUID();
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
    const parsed = await pdf(buffer);
    text = parsed.text;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer });
    text = parsed.value;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    fileName.endsWith(".pptx")
  ) {
    text = await extractPptxText(buffer);
  } else if (file.type === "text/plain" || [...textTypeByExtension.keys()].some((extension) => fileName.endsWith(extension))) {
    text = buffer.toString("utf8");
  }

  const normalized = text.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
  if (normalized.length < 20) {
    throw new Error("Could not extract enough text from this file.");
  }

  const chunks = chunkText(id, normalized, 1200);

  return {
    id,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    text: normalized,
    summary: summarizeText(normalized),
    chunks: chunks.map((chunk) => ({ id: chunk.id, content: chunk.content, index: chunk.index }))
  };
}

