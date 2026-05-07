export type DocumentChunk = {
  id: string;
  fileId: string;
  content: string;
  index: number;
};

export function chunkText(fileId: string, text: string, chunkSize = 1200): DocumentChunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks: DocumentChunk[] = [];
  for (let start = 0; start < normalized.length; start += chunkSize) {
    chunks.push({
      id: `${fileId}-${chunks.length}`,
      fileId,
      content: normalized.slice(start, start + chunkSize),
      index: chunks.length
    });
  }
  return chunks;
}

export function buildRetrievalPrompt(question: string, chunks: DocumentChunk[]) {
  return [
    "Use only the context below when possible. If context is insufficient, say what is missing.",
    ...chunks.slice(0, 6).map((chunk) => `[${chunk.id}] ${chunk.content}`),
    `Question: ${question}`
  ].join("\n\n");
}

