"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CalendarDays, CheckCircle2, Clock3, Download, FileText, Plus, Settings, SlidersHorizontal, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageKind = "assignments" | "planner" | "reports" | "settings";

type Item = {
  id: string;
  title: string;
  detail: string;
  status: string;
  date?: string;
  priority?: string;
  duration?: number;
  createdAt: number;
};

type WorkspaceSettings = {
  compactMode: boolean;
  reduceMotion: boolean;
  autoSaveNotes: boolean;
  defaultMode: string;
  responseLength: string;
};

const defaultSettings: WorkspaceSettings = {
  compactMode: false,
  reduceMotion: false,
  autoSaveNotes: true,
  defaultMode: "Student Mode",
  responseLength: "Short"
};

const pageConfig = {
  assignments: {
    key: "nexspace-assignments",
    title: "Assignments",
    eyebrow: "Assignment Workspace",
    description: "Track briefs, deadlines, grading criteria, completion, and next writing actions.",
    icon: FileText,
    empty: "Add your first assignment brief."
  },
  planner: {
    key: "nexspace-planner",
    title: "Study Planner",
    eyebrow: "Planner",
    description: "Plan dated study sessions, revision blocks, and assignment milestones.",
    icon: CalendarDays,
    empty: "Add your first study session."
  },
  reports: {
    key: "nexspace-reports",
    title: "Reports",
    eyebrow: "Academic Reports",
    description: "Review saved detector, plagiarism, notes, and assignment report activity.",
    icon: BarChart3,
    empty: "Run AI Detector or Plagiarism Checker to create report history."
  },
  settings: {
    key: "nexspace-settings",
    title: "Settings",
    eyebrow: "Workspace Settings",
    description: "Configure local workspace preferences for this browser.",
    icon: Settings,
    empty: "Settings are saved automatically in this browser."
  }
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const cached = window.localStorage.getItem(key);
    return cached ? JSON.parse(cached) as T : fallback;
  } catch {
    return fallback;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function reportTitle(report: Record<string, unknown>) {
  if ("aiScore" in report) return `AI detector score ${String(report.aiScore)}%`;
  if ("similarity" in report) return `Similarity score ${String(report.similarity)}%`;
  return "Academic report";
}

export function ProductivityPage({ kind }: { kind: PageKind }) {
  const config = pageConfig[kind];
  const Icon = config.icon;
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState(today());
  const [priority, setPriority] = useState("Medium");
  const [duration, setDuration] = useState(60);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);
  const [reportVersion, setReportVersion] = useState(0);

  useEffect(() => {
    if (kind === "settings") {
      setSettings(readJson(config.key, defaultSettings));
    } else {
      setItems(readJson(config.key, []));
    }
  }, [config.key, kind]);

  const reportHistory: Array<Record<string, unknown> & { source: string }> = kind === "reports" ? ([
    ...readJson<Array<Record<string, unknown>>>("nexspace-ai-detector-reports", []).map((item) => ({ ...item, source: "AI detector" })),
    ...readJson<Array<Record<string, unknown>>>("nexspace-plagiarism-reports", []).map((item) => ({ ...item, source: "Plagiarism" }))
  ] as Array<Record<string, unknown> & { source: string }>).sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0)) : [];

  function persist(nextItems: Item[]) {
    setItems(nextItems);
    window.localStorage.setItem(config.key, JSON.stringify(nextItems));
  }

  function persistSettings(nextSettings: WorkspaceSettings) {
    setSettings(nextSettings);
    window.localStorage.setItem(config.key, JSON.stringify(nextSettings));
  }

  function addItem() {
    if (!title.trim()) return;
    const item: Item = {
      id: crypto.randomUUID(),
      title: title.trim(),
      detail: detail.trim() || (kind === "planner" ? "Focused study session." : "No details added yet."),
      status: kind === "planner" ? "Scheduled" : "In progress",
      date,
      priority,
      duration,
      createdAt: Date.now()
    };
    persist([item, ...items].slice(0, 80));
    setTitle("");
    setDetail("");
  }

  function updateItem(id: string, patch: Partial<Item>) {
    persist(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function deleteItem(id: string) {
    persist(items.filter((item) => item.id !== id));
  }

  function clearReports() {
    window.localStorage.removeItem("nexspace-ai-detector-reports");
    window.localStorage.removeItem("nexspace-plagiarism-reports");
    setReportVersion((value) => value + 1);
  }

  function exportReports() {
    const blob = new Blob([JSON.stringify(reportHistory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexspace-reports.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (kind === "settings") {
    return (
      <main className="min-h-screen bg-[#f7f8fb] p-4 pb-28 text-slate-950 sm:p-6 lg:pl-80 lg:pr-8 lg:pt-8">
        <Header config={config} Icon={Icon} />
        <section className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="text-xl font-semibold">Workspace preferences</h2>
            </div>
            <div className="mt-5 space-y-4">
              {([
                ["compactMode", "Compact dashboard spacing"],
                ["reduceMotion", "Reduce motion effects"],
                ["autoSaveNotes", "Auto-save note drafts"]
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
                  {label}
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(event) => persistSettings({ ...settings, [key]: event.target.checked })}
                    className="h-5 w-5 accent-[#5b5cf6]"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">AI defaults</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-600">
                Default chat mode
                <select value={settings.defaultMode} onChange={(event) => persistSettings({ ...settings, defaultMode: event.target.value })} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#5b5cf6]">
                  <option>Student Mode</option>
                  <option>Research Mode</option>
                  <option>Coding Mode</option>
                  <option>Assignment Helper Mode</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Response length
                <select value={settings.responseLength} onChange={(event) => persistSettings({ ...settings, responseLength: event.target.value })} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-[#5b5cf6]">
                  <option>Short</option>
                  <option>Balanced</option>
                  <option>Detailed</option>
                </select>
              </label>
            </div>
            <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Settings save immediately in local storage.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] p-4 pb-28 text-slate-950 sm:p-6 lg:pl-80 lg:pr-8 lg:pt-8">
      <Header config={config} Icon={Icon} />

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        {kind !== "reports" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="text-xl font-semibold">{kind === "planner" ? "Schedule session" : "Add assignment"}</h2>
            </div>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === "planner" ? "Session title" : "Assignment title"} className="mt-5 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#5b5cf6]" />
            <textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={kind === "planner" ? "Topic, goals, materials, or reminder..." : "Brief, rubric, grading criteria, missing sections, or next action..."} className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#5b5cf6]" />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#5b5cf6]" />
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#5b5cf6]">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input type="number" min={15} max={360} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#5b5cf6]" />
            </div>
            <Button onClick={addItem} variant="solid" className="mt-4">
              <Plus className="h-4 w-4" />
              {kind === "planner" ? "Add Session" : "Save Assignment"}
            </Button>
          </div>
        )}

        <div className={kind === "reports" ? "xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" : "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">{kind === "reports" ? "Saved reports" : `Saved ${config.title.toLowerCase()}`}</h2>
            {kind === "reports" && (
              <div className="flex gap-2">
                <Button onClick={exportReports} variant="outline" disabled={reportHistory.length === 0}><Download className="h-4 w-4" />Export</Button>
                <Button onClick={clearReports} variant="outline" disabled={reportHistory.length === 0}><Trash2 className="h-4 w-4" />Clear</Button>
              </div>
            )}
          </div>

          {kind === "reports" ? (
            <ReportList key={reportVersion} reports={reportHistory} empty={config.empty} />
          ) : items.length === 0 ? (
            <EmptyState Icon={Icon} text={config.empty} />
          ) : (
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className={item.status === "Done" ? "h-4 w-4 text-emerald-500" : "h-4 w-4 text-slate-400"} />
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600" aria-label={`Delete ${item.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{item.date}</span>
                    <span className="rounded-full bg-white px-3 py-1"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{item.duration} min</span>
                    <span className="rounded-full bg-white px-3 py-1">{item.priority} priority</span>
                    <select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value })} className="rounded-full border border-slate-200 bg-white px-3 py-1 outline-none">
                      <option>{kind === "planner" ? "Scheduled" : "In progress"}</option>
                      <option>Review</option>
                      <option>Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Header({ config, Icon }: { config: (typeof pageConfig)[PageKind]; Icon: LucideIcon }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#5b5cf6]">{config.eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{config.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
          <Button asChild variant="outline"><Link href="/workspace">AI Chat</Link></Button>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#5b5cf6]/10 text-[#5b5cf6]"><Icon className="h-5 w-5" /></span>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <div className="mt-5 grid min-h-56 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div>
        <Icon className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        <p className="font-semibold text-slate-800">{text}</p>
      </div>
    </div>
  );
}

function ReportList({ reports, empty }: { reports: Array<Record<string, unknown> & { source: string }>; empty: string }) {
  if (reports.length === 0) return <EmptyState Icon={BarChart3} text={empty} />;

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {reports.slice(0, 20).map((report, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold">{String(report.source)} · {reportTitle(report)}</p>
          <p className="mt-1 text-sm text-slate-500">Confidence: {String(report.confidence ?? 0)} · Length: {String(report.length ?? "n/a")}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">{report.createdAt ? new Date(Number(report.createdAt)).toLocaleString() : "No timestamp"}</p>
        </div>
      ))}
    </div>
  );
}
