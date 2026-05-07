"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bold, Bot, Check, Code2, Columns2, Highlighter, Loader2, Palette, Quote, RefreshCcw, Save, Type, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const seedNote = `# L01 Data to Intelligence

## What this lecture is about
Data wrangling turns raw files into usable evidence. The workflow is: collect, clean, validate, transform, analyze, and explain.

## Key ideas
- Raw data is rarely ready for analysis.
- Cleaning must be reproducible, not manual guesswork.
- Validation checks protect the final insight from broken inputs.
- Automation matters when the same workflow repeats across many files.

## Student review notes
1. Identify the source and format of each dataset.
2. Check missing values, duplicates, inconsistent labels, and outliers.
3. Document every transformation so another student can reproduce the result.
4. Explain what the processed data can and cannot prove.

## Assignment link
Use this structure when writing the methodology section: source, preparation steps, validation checks, limitations, and evidence produced.
`;

type NoteEditorProps = {
  moduleId: string;
  noteId: string;
};

const quickTabs = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI Chat", href: "/workspace" },
  { label: "Notes", href: "/modules" }
];

const colors = [
  { label: "Slate", value: "#334155" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#e11d48" }
];

const notesLibraryKey = "nexspace-notes-library";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>")
    .replace(/\{(#[0-9a-fA-F]{6})\|(.+?)\}/g, '<span style="color:$1">$2</span>');
}

function markdownToHtml(value: string) {
  const lines = value.split("\n");
  const html: string[] = [];
  let inList = false;
  let inOrderedList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (inOrderedList) {
        html.push("</ol>");
        inOrderedList = false;
      }
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInline(trimmed.slice(2))}</li>`);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      if (!inOrderedList) {
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${renderInline(orderedMatch[1])}</li>`);
      continue;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }
    if (inOrderedList) {
      html.push("</ol>");
      inOrderedList = false;
    }

    if (trimmed.startsWith("### ")) html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`);
    else if (trimmed.startsWith("## ")) html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`);
    else if (trimmed.startsWith("# ")) html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`);
    else if (trimmed.startsWith("> ")) html.push(`<blockquote>${renderInline(trimmed.slice(2))}</blockquote>`);
    else html.push(`<p>${renderInline(trimmed)}</p>`);
  }

  if (inList) html.push("</ul>");
  if (inOrderedList) html.push("</ol>");
  return html.join("");
}

export function NoteEditor({ moduleId, noteId }: NoteEditorProps) {
  const storageKey = useMemo(() => `nexspace-note:${moduleId}:${noteId}`, [moduleId, noteId]);
  const sourceKey = useMemo(() => `${storageKey}:source`, [storageKey]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const syncSourceRef = useRef<"editor" | "preview" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(seedNote);
  const [sourceText, setSourceText] = useState("");
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const cached = window.localStorage.getItem(storageKey);
    if (cached) setContent(cached);
    const cachedSource = window.localStorage.getItem(sourceKey);
    if (cachedSource) setSourceText(cachedSource);
  }, [sourceKey, storageKey]);

  function saveToLibrary(title: string, notes: string) {
    const cached = window.localStorage.getItem(notesLibraryKey);
    let library: Array<{ id: string; title: string; preview: string; updatedAt: number }> = [];
    try {
      library = cached ? JSON.parse(cached) as Array<{ id: string; title: string; preview: string; updatedAt: number }> : [];
    } catch {
      library = [];
    }
    const nextLibrary = [{
      id: crypto.randomUUID(),
      title,
      preview: notes.replace(/^#\s+/m, "").slice(0, 180),
      updatedAt: Date.now()
    }, ...library].slice(0, 12);
    window.localStorage.setItem(notesLibraryKey, JSON.stringify(nextLibrary));
  }

  function saveNote() {
    window.localStorage.setItem(storageKey, content);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function syncScroll(source: "editor" | "preview") {
    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (!editor || !preview || syncSourceRef.current) return;

    const sourceElement = source === "editor" ? editor : preview;
    const targetElement = source === "editor" ? preview : editor;
    const sourceScrollable = sourceElement.scrollHeight - sourceElement.clientHeight;
    const targetScrollable = targetElement.scrollHeight - targetElement.clientHeight;
    const ratio = sourceScrollable > 0 ? sourceElement.scrollTop / sourceScrollable : 0;

    syncSourceRef.current = source;
    targetElement.scrollTop = ratio * targetScrollable;
    requestAnimationFrame(() => {
      syncSourceRef.current = null;
    });
  }

  async function regenerateNote() {
    setIsGenerating(true);
    setUploadError(null);

    try {
      const rawText = sourceText.trim().length > 80 ? sourceText : content;
      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.match(/^#\s+(.+)$/m)?.[1] ?? "Regenerated Lecture Notes",
          rawText,
          style: "lecture-notes"
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Note regeneration failed.");
      }

      setContent(data.notes);
      window.localStorage.setItem(storageKey, data.notes);
      saveToLibrary(data.notes.match(/^#\s+(.+)$/m)?.[1] ?? "Regenerated Lecture Notes", data.notes);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not regenerate notes.");
    } finally {
      setIsGenerating(false);
    }
  }

  function applyWrap(prefix: string, suffix = prefix) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((current) => `${current}${prefix}text${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || "text";
    const next = `${content.slice(0, start)}${prefix}${selected}${suffix}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }

  function applyBlock(type: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? content.length;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const marker = type === "h1" ? "# " : type === "h2" ? "## " : type === "h3" ? "### " : type === "quote" ? "> " : "";
    setContent(`${content.slice(0, lineStart)}${marker}${content.slice(lineStart)}`);
  }

  async function autoGenerateFromFile(file: File) {
    setIsGenerating(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not process file.");
      }

      const rawText = String(data.text ?? "");
      if (rawText.trim().length < 80) {
        throw new Error("The file text was too short to generate real lecture notes.");
      }

      const title = `Notes from ${data.name ?? file.name}`;
      const notesResponse = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          rawText,
          style: "lecture-notes"
        })
      });
      const generated = await notesResponse.json();

      if (!notesResponse.ok) {
        throw new Error(generated.error ?? "Note generation failed.");
      }

      setSourceText(rawText);
      setContent(generated.notes);
      window.localStorage.setItem(storageKey, generated.notes);
      window.localStorage.setItem(sourceKey, rawText);
      saveToLibrary(title, generated.notes);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not generate notes from this file.");
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950 lg:pl-72">
      <div className="border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/modules" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Notes
            </Link>
            <nav className="mt-3 flex flex-wrap gap-2">
              {quickTabs.map((tab) => (
                <Link key={tab.href} href={tab.href} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#5b5cf6]/40 hover:text-[#5b5cf6]">
                  {tab.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <div>
                <h1 className="font-display text-3xl font-semibold">L01 Data to Intelligence</h1>
                <p className="mt-1 text-sm text-slate-500">C230 Data Wrangling and Automation</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void autoGenerateFromFile(file);
              }}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload and Generate
            </Button>
            <Button variant="outline" onClick={() => void regenerateNote()} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Regenerate from Lecture
            </Button>
            <Button onClick={saveNote} variant="solid">
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved" : "Save to Module"}
            </Button>
          </div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-8">
        <div className="flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Columns2 className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="font-semibold">Edit Your Notes</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Markdown</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <button onClick={() => applyWrap("**")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-slate-950" aria-label="Bold">
              <Bold className="h-4 w-4" />
            </button>
            <button onClick={() => applyWrap("==")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-slate-950" aria-label="Highlight">
              <Highlighter className="h-4 w-4" />
            </button>
            <button onClick={() => applyWrap("`")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-slate-950" aria-label="Inline code">
              <Code2 className="h-4 w-4" />
            </button>
            <button onClick={() => applyBlock("quote")} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:text-slate-950" aria-label="Quote">
              <Quote className="h-4 w-4" />
            </button>
            <select onChange={(event) => applyBlock(event.target.value)} defaultValue="" className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
              <option value="" disabled>Font</option>
              <option value="h1">Title</option>
              <option value="h2">Section</option>
              <option value="h3">Small Heading</option>
            </select>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
              <Palette className="h-4 w-4 text-slate-500" />
              {colors.map((color) => (
                <button key={color.value} onClick={() => applyWrap(`{${color.value}|`, "}")} className="h-5 w-5 rounded-full border border-slate-200" style={{ backgroundColor: color.value }} aria-label={`${color.label} text`} />
              ))}
            </div>
            <button onClick={() => applyBlock("h2")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-950">
              <Type className="mr-1 inline h-3.5 w-3.5" />
              Section
            </button>
          </div>
          {uploadError && <p className="border-b border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">{uploadError}</p>}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onScroll={() => syncScroll("editor")}
            className="min-h-0 flex-1 resize-none bg-white p-5 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Write or paste lecture notes here..."
          />
        </div>

        <div className="flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="font-semibold">Read and Review</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live preview</span>
          </div>
          <article ref={previewRef} onScroll={() => syncScroll("preview")} className="min-h-0 flex-1 overflow-y-auto p-6">
            <div
              className="prose prose-slate max-w-none prose-headings:font-display prose-h1:text-3xl prose-h2:text-xl prose-p:leading-7 prose-li:leading-7 prose-mark:rounded prose-mark:bg-amber-200/70 prose-mark:px-1 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          </article>
        </div>
      </section>
    </main>
  );
}
