"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, CheckCircle2, FileText, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageKind = "assignments" | "planner" | "reports" | "settings";

type Item = {
  id: string;
  title: string;
  detail: string;
  status: string;
  createdAt: number;
};

const pageConfig = {
  assignments: {
    key: "nexspace-assignments",
    title: "Assignments",
    eyebrow: "Assignment Workspace",
    description: "Track briefs, deadlines, grading criteria, and next writing actions.",
    icon: FileText,
    empty: "Add your first assignment brief or task."
  },
  planner: {
    key: "nexspace-planner",
    title: "Study Planner",
    eyebrow: "Planner",
    description: "Plan study sessions, revision blocks, and assignment milestones.",
    icon: CalendarDays,
    empty: "Add your first study session."
  },
  reports: {
    key: "nexspace-reports",
    title: "Reports",
    eyebrow: "Academic Reports",
    description: "Review saved AI detector, plagiarism, notes, and assignment report activity.",
    icon: BarChart3,
    empty: "Saved reports from checker tools will appear in the dashboard and can be summarized here."
  },
  settings: {
    key: "nexspace-settings",
    title: "Settings",
    eyebrow: "Workspace Settings",
    description: "Configure local workspace preferences for this browser.",
    icon: Settings,
    empty: "Add a setting note or preference."
  }
};

function readItems(key: string) {
  try {
    const cached = window.localStorage.getItem(key);
    return cached ? JSON.parse(cached) as Item[] : [];
  } catch {
    return [];
  }
}

function readReports(key: string) {
  try {
    const cached = window.localStorage.getItem(key);
    return cached ? JSON.parse(cached) as Array<Record<string, unknown>> : [];
  } catch {
    return [];
  }
}

export function ProductivityPage({ kind }: { kind: PageKind }) {
  const config = pageConfig[kind];
  const Icon = config.icon;
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    setItems(readItems(config.key));
  }, [config.key]);

  function persist(nextItems: Item[]) {
    setItems(nextItems);
    window.localStorage.setItem(config.key, JSON.stringify(nextItems));
  }

  function addItem() {
    if (!title.trim()) return;
    persist([{
      id: crypto.randomUUID(),
      title: title.trim(),
      detail: detail.trim() || "No details added yet.",
      status: "Active",
      createdAt: Date.now()
    }, ...items].slice(0, 50));
    setTitle("");
    setDetail("");
  }

  function deleteItem(id: string) {
    persist(items.filter((item) => item.id !== id));
  }

  const reportHistory: Array<Record<string, unknown> & { source: string }> = kind === "reports" ? [
    ...readReports("nexspace-ai-detector-reports").map((item) => ({ ...item, source: "AI detector" })),
    ...readReports("nexspace-plagiarism-reports").map((item) => ({ ...item, source: "Plagiarism" }))
  ] : [];

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-4 text-slate-950 sm:p-6 lg:pl-80 lg:pr-8 lg:pt-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5b5cf6]">{config.eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
            <Button asChild variant="outline"><Link href="/workspace">AI Chat</Link></Button>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-[#5b5cf6]" />
            <h2 className="text-xl font-semibold">Add item</h2>
          </div>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="mt-5 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#5b5cf6]" />
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Details, deadline, rubric, reminder, or preference..." className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#5b5cf6]" />
          <Button onClick={addItem} variant="solid" className="mt-4">
            <Plus className="h-4 w-4" />
            Save
          </Button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Saved {config.title.toLowerCase()}</h2>
          {kind === "reports" && reportHistory.length > 0 && (
            <div className="mt-5 grid gap-3">
              {reportHistory.slice(0, 8).map((report, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold">{String(report.source)} report</p>
                  <p className="mt-1 text-sm text-slate-500">Score: {String(report.aiScore ?? report.similarity ?? 0)} · Confidence: {String(report.confidence ?? 0)}</p>
                </div>
              ))}
            </div>
          )}
          {items.length === 0 ? (
            <div className="mt-5 grid min-h-56 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div>
                <Icon className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                <p className="font-semibold text-slate-800">{config.empty}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600" aria-label={`Delete ${item.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
