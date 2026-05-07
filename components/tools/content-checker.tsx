"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileUp, Loader2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckerKind = "ai" | "plagiarism";

type ContentCheckerProps = {
  kind: CheckerKind;
};

const checkerCopy = {
  ai: {
    eyebrow: "AI Content Detector",
    title: "Detect AI-generated writing",
    description: "Paste or upload student writing and get AI score, human score, confidence, and sentence-level signals.",
    action: "Detect AI",
    endpoint: "/api/tools/ai-detector",
    storageKey: "nexspace-ai-detector-reports",
    icon: Sparkles
  },
  plagiarism: {
    eyebrow: "Plagiarism Checker",
    title: "Check originality and source risk",
    description: "Paste or upload an assignment draft and get similarity, source matches, duplicate paragraphs, and citation warnings.",
    action: "Check Plagiarism",
    endpoint: "/api/tools/plagiarism",
    storageKey: "nexspace-plagiarism-reports",
    icon: ShieldCheck
  }
};

function scoreColour(value: number) {
  if (value >= 70) return "#ef4444";
  if (value >= 35) return "#f59e0b";
  return "#10b981";
}

export function ContentChecker({ kind }: ContentCheckerProps) {
  const copy = checkerCopy[kind];
  const Icon = copy.icon;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceName, setSourceName] = useState("Reference source");
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFile(file: File) {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not extract file text.");
      setText(String(data.text ?? ""));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not read file.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function runCheck() {
    if (text.trim().length < 20) {
      setError("Paste or upload at least 20 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const sources = kind === "plagiarism" && sourceText.trim().length > 20
        ? [{ name: sourceName.trim() || "Reference source", text: sourceText.trim() }]
        : [];
      const response = await fetch(copy.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sources })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Analysis failed.");

      setReport(data);
      const cached = window.localStorage.getItem(copy.storageKey);
      let history: Array<Record<string, unknown>> = [];
      try {
        history = cached ? JSON.parse(cached) as Array<Record<string, unknown>> : [];
      } catch {
        history = [];
      }
      window.localStorage.setItem(copy.storageKey, JSON.stringify([{ ...data, createdAt: Date.now(), length: text.length }, ...history].slice(0, 20)));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const aiScore = Number(report?.aiScore ?? 0);
  const humanScore = Number(report?.humanScore ?? 0);
  const similarity = Number(report?.similarity ?? 0);
  const primaryScore = kind === "ai" ? aiScore : similarity;

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-4 text-slate-950 sm:p-6 lg:pl-80 lg:pr-8 lg:pt-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5b5cf6]">{copy.eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{copy.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/workspace">AI Chat</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="text-xl font-semibold">Your input content</h2>
            </div>
            <span className="text-sm font-semibold text-slate-400">{text.length} / 50000</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste text here or upload a document..."
            className="mt-5 min-h-[24rem] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 outline-none transition focus:border-[#5b5cf6] focus:bg-white"
          />
          {kind === "plagiarism" && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={sourceName}
                  onChange={(event) => setSourceName(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#5b5cf6] sm:w-56"
                  placeholder="Source name"
                />
                <textarea
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  className="min-h-28 flex-1 resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition focus:border-[#5b5cf6]"
                  placeholder="Paste reference text, uploaded source content, or lecture material for strict local similarity matching..."
                />
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadFile(file);
            }}
          />
          {error && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={runCheck} variant="solid" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {copy.action}
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isLoading}>
              <FileUp className="h-4 w-4" />
              Upload File
            </Button>
            <Button onClick={() => { setText(""); setSourceText(""); setReport(null); setError(null); }} variant="outline">
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Detailed report</h2>
          {!report ? (
            <div className="mt-5 grid min-h-[24rem] place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div>
                <Icon className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                <p className="font-semibold text-slate-800">No report yet</p>
                <p className="mt-2 text-sm text-slate-500">Run the checker to see scores and sentence-level details.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="grid place-items-center">
                <div className="grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(${scoreColour(primaryScore)} ${primaryScore * 3.6}deg, #e2e8f0 0deg)` }}>
                  <div className="grid h-32 w-32 place-items-center rounded-full bg-white">
                    <div className="text-center">
                      <p className="font-display text-4xl font-semibold">{primaryScore}%</p>
                      <p className="text-xs font-semibold text-slate-500">{kind === "ai" ? "AI Content" : "Similarity"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {kind === "ai" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Human Content</p><p className="mt-2 text-2xl font-semibold">{humanScore}%</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Confidence</p><p className="mt-2 text-2xl font-semibold">{String(report.confidence ?? 0)}%</p></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Originality</p><p className="mt-2 text-2xl font-semibold">{Math.max(0, 100 - similarity)}%</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Sources</p><p className="mt-2 text-2xl font-semibold">{Array.isArray(report.sourceMatches) ? report.sourceMatches.length : 0}</p></div>
                </div>
              )}
              <pre className="max-h-80 overflow-auto rounded-3xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{JSON.stringify(report, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
