"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Clock3, FileUp, Loader2, MessageSquareText, NotebookText, Save, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const noteHref = "/modules/aa15a56c-620f-4d33-8fd3-d896a95001b8/notes/13de39ea-f913-418d-bc2f-00caccc61f8e";
const noteStorageKey = "nexspace-note:aa15a56c-620f-4d33-8fd3-d896a95001b8:13de39ea-f913-418d-bc2f-00caccc61f8e";
const noteSourceKey = `${noteStorageKey}:source`;
const notesLibraryKey = "nexspace-notes-library";

const quickTabs = [
  { label: "Dashboard", href: "/dashboard", icon: Save },
  { label: "AI Chat", href: "/workspace", icon: MessageSquareText },
  { label: "Notes Editor", href: noteHref, icon: NotebookText }
];

type LibraryNote = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

export function NotesHub() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generatedTitle, setGeneratedTitle] = useState("No generated note yet");
  const [generatedPreview, setGeneratedPreview] = useState("Upload a PDF, DOCX, PPTX, TXT, or Markdown file. NexSpace will extract the text and create a clean study note you can edit side by side.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryNote[]>([]);

  useEffect(() => {
    try {
      const cachedLibrary = window.localStorage.getItem(notesLibraryKey);
      if (cachedLibrary) {
        setLibrary(JSON.parse(cachedLibrary) as LibraryNote[]);
      }
    } catch {
      window.localStorage.removeItem(notesLibraryKey);
    }

    const cachedNote = window.localStorage.getItem(noteStorageKey);
    if (cachedNote) {
      setGeneratedTitle(cachedNote.match(/^#\s+(.+)$/m)?.[1] ?? "Current generated note");
      setGeneratedPreview(cachedNote);
    }
  }, []);

  function saveToLibrary(title: string, notes: string) {
    const nextNote: LibraryNote = {
      id: crypto.randomUUID(),
      title,
      preview: notes.replace(/^#\s+/m, "").slice(0, 180),
      updatedAt: Date.now()
    };
    const nextLibrary = [nextNote, ...library].slice(0, 12);
    setLibrary(nextLibrary);
    window.localStorage.setItem(notesLibraryKey, JSON.stringify(nextLibrary));
  }

  async function generateFromFile(file: File) {
    setIsGenerating(true);
    setError(null);

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

      window.localStorage.setItem(noteStorageKey, generated.notes);
      window.localStorage.setItem(noteSourceKey, rawText);
      setGeneratedTitle(title);
      setGeneratedPreview(generated.notes);
      saveToLibrary(title, generated.notes);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not generate notes from this file.");
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-4 text-slate-950 sm:p-6 lg:pl-80 lg:pr-8 lg:pt-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5b5cf6]">Notes Workspace</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Upload a file and generate study notes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">This page is now focused on notes. Upload course material, generate a clean draft, then open the editor for formatting, highlights, colors, and side-by-side reading.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickTabs.map((tab) => (
              <Button key={tab.href} asChild variant="outline">
                <Link href={tab.href}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-[#5b5cf6]" />
            <h2 className="text-xl font-semibold">Auto-generate notes</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Files are extracted, then passed into the notes generator so the output is based on the lecture file, not a fixed checklist.</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void generateFromFile(file);
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="mt-5 flex min-h-56 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#5b5cf6] hover:bg-[#5b5cf6]/5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#5b5cf6]" /> : <FileUp className="mb-4 h-10 w-10 text-slate-400" />}
            <span className="font-semibold text-slate-800">{isGenerating ? "Generating notes..." : "Click to upload course file"}</span>
            <span className="mt-2 text-sm text-slate-500">PDF, DOCX, PPTX, TXT, MD</span>
          </button>
          {error && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Generated draft</p>
              <h2 className="mt-1 text-2xl font-semibold">{generatedTitle}</h2>
            </div>
            <Button asChild variant="solid">
              <Link href={noteHref}>
                <Bot className="h-4 w-4" />
                Edit and read
              </Link>
            </Button>
          </div>
          <pre className="mt-5 max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
            {generatedPreview}
          </pre>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#5b5cf6]">Notes Library</p>
            <h2 className="mt-1 text-2xl font-semibold">Generated notes history</h2>
          </div>
          <Clock3 className="h-5 w-5 text-slate-400" />
        </div>
        {library.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No notes generated yet</p>
            <p className="mt-2 text-sm text-slate-500">Upload a lecture file above. Generated notes will appear here so `/modules` works like a notes library.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {library.map((note) => (
              <Link key={note.id} href={noteHref} className="group relative block min-h-56 rounded-[1.35rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#5b5cf6]/40 hover:shadow-xl">
                <span className="absolute -bottom-2 left-5 right-5 h-5 rounded-b-3xl bg-slate-200 transition group-hover:bg-[#5b5cf6]/20" />
                <span className="absolute -bottom-4 left-9 right-9 h-5 rounded-b-3xl bg-slate-300 transition group-hover:bg-[#00d1ff]/20" />
                <span className="relative z-10 mb-4 inline-flex rounded-full bg-[#5b5cf6]/10 px-3 py-1 text-xs font-semibold text-[#5b5cf6]">Study note</span>
                <p className="relative z-10 font-display text-xl font-semibold text-slate-950">{note.title}</p>
                <p className="relative z-10 mt-3 line-clamp-4 text-sm leading-6 text-slate-500">{note.preview}</p>
                <p className="relative z-10 mt-5 text-xs font-semibold text-slate-400">{new Date(note.updatedAt).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
