import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "15mb" }));

const analyzeSchema = z.object({
  text: z.string().min(20).max(50000)
});

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "nexspace-api" });
});

app.post("/api/assignment/analyze", (request, response) => {
  const parsed = analyzeSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid assignment text" });
    return;
  }

  response.json({
    summary: "Assignment brief processed.",
    criteria: ["Pass criteria", "Merit criteria", "Distinction criteria"],
    missingSections: ["Methodology evidence", "Evaluation paragraph", "Reference quality review"],
    recommendations: ["Create a criteria map", "Add source-linked claims", "Reserve time for citation cleanup"]
  });
});

app.post("/api/plagiarism/check", (request, response) => {
  const parsed = analyzeSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid text" });
    return;
  }

  response.json({
    similarity: 21,
    duplicateParagraphs: 2,
    sources: [
      { title: "Uploaded document", url: "local://document", match: 13 },
      { title: "Public source", url: "https://example.edu/source", match: 8 }
    ]
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`NexSpace API listening on ${port}`);
});

