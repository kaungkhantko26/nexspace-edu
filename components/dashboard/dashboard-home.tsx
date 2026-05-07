"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowRight, Brain, CalendarDays, Clock3, FileCheck2, Lightbulb, NotebookText, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/metric-card";

const noteHref = "/modules/aa15a56c-620f-4d33-8fd3-d896a95001b8/notes/13de39ea-f913-418d-bc2f-00caccc61f8e";

type StoredThread = {
  title: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  updatedAt: number;
};

type StoredNote = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

type DashboardState = {
  threads: StoredThread[];
  notes: StoredNote[];
  aiReports: Array<Record<string, unknown>>;
  plagiarismReports: Array<Record<string, unknown>>;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const cached = window.localStorage.getItem(key);
    return cached ? JSON.parse(cached) as T : fallback;
  } catch {
    return fallback;
  }
}

function dayLabel(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function buildChart(state: DashboardState) {
  const events = [
    ...state.threads.map((thread) => thread.updatedAt),
    ...state.notes.map((note) => note.updatedAt),
    ...state.aiReports.map((report) => Number(report.createdAt ?? 0)),
    ...state.plagiarismReports.map((report) => Number(report.createdAt ?? 0))
  ].filter(Boolean);

  return Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    const score = events.filter((time) => time >= date.getTime() && time < next.getTime()).length;
    return { day: dayLabel(offset), score };
  });
}

export function DashboardHome() {
  const [state, setState] = useState<DashboardState>({ threads: [], notes: [], aiReports: [], plagiarismReports: [] });

  useEffect(() => {
    function load() {
      setState({
        threads: readJson<StoredThread[]>("nexspace-chat-threads", []),
        notes: readJson<StoredNote[]>("nexspace-notes-library", []),
        aiReports: readJson<Array<Record<string, unknown>>>("nexspace-ai-detector-reports", []),
        plagiarismReports: readJson<Array<Record<string, unknown>>>("nexspace-plagiarism-reports", [])
      });
    }

    load();
    const interval = window.setInterval(load, 2000);
    window.addEventListener("storage", load);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", load);
    };
  }, []);

  const messageCount = state.threads.reduce((total, thread) => total + thread.messages.filter((message) => message.role === "user").length, 0);
  const checkCount = state.aiReports.length + state.plagiarismReports.length;
  const latestAiScore = Number(state.aiReports[0]?.aiScore ?? 0);
  const latestSimilarity = Number(state.plagiarismReports[0]?.similarity ?? 0);
  const chartData = buildChart(state);
  const metrics = [
    { label: "Saved Chats", value: String(state.threads.length), delta: `${messageCount} user messages` },
    { label: "Notes", value: String(state.notes.length), delta: "generated library entries" },
    { label: "Checks", value: String(checkCount), delta: "AI + plagiarism reports" },
    { label: "Latest Risk", value: `${Math.max(latestAiScore, latestSimilarity)}%`, delta: latestAiScore || latestSimilarity ? "from latest report" : "no report yet" }
  ];

  const insights = [
    { icon: FileCheck2, title: "Chat activity", description: state.threads[0]?.title ? `Last chat: ${state.threads[0].title}` : "Start a chat to build study history." },
    { icon: Lightbulb, title: "Notes library", description: state.notes[0]?.title ? `Latest note: ${state.notes[0].title}` : "Upload a lecture file to generate notes." },
    { icon: ShieldCheck, title: "Integrity tools", description: checkCount ? `${checkCount} standalone reports saved locally.` : "Run AI detector or plagiarism checker from their own pages." }
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950 lg:pl-72">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5b5cf6]">Live Student Dashboard</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-slate-950">Your real workspace activity</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">These numbers come from saved chats, generated notes, and standalone checker reports in this browser.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="solid">
              <Link href="/workspace">
                <UploadCloud className="h-4 w-4" />
                Open chat
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/modules">
                <NotebookText className="h-4 w-4" />
                Notes library
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Activity Timeline</h2>
                <p className="mt-1 text-sm text-slate-500">Chats, notes, and checker reports created over the last seven days.</p>
              </div>
              <Brain className="h-6 w-6 text-[#5b5cf6]" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b5cf6" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#5b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="score" stroke="#5b5cf6" fill="url(#score)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Live Suggestions</h2>
            <div className="mt-5 space-y-3">
              {insights.map((insight) => (
                <div key={insight.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <insight.icon className="mb-3 h-5 w-5 text-[#5b5cf6]" />
                  <p className="font-medium text-slate-950">{insight.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{insight.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Notes</h2>
              <Link href="/modules" className="inline-flex items-center gap-1 text-sm font-semibold text-[#5b5cf6]">
                View library <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3">
              {(state.notes.length ? state.notes.slice(0, 3) : [{ id: "empty", title: "No notes yet", preview: "Generate notes from /modules to populate this dashboard.", updatedAt: Date.now() }]).map((note) => (
                <Link key={note.id} href={noteHref} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#5b5cf6]/40 hover:bg-white">
                  <p className="font-semibold">{note.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{note.preview}</p>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[#5b5cf6]" />
              <h2 className="text-xl font-semibold">Quick Paths</h2>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Generate lecture notes", href: "/modules", icon: NotebookText },
                { label: "Run AI detector", href: "/ai-detector", icon: Sparkles },
                { label: "Run plagiarism checker", href: "/plagiarism", icon: ShieldCheck },
                { label: "Continue latest chat", href: "/workspace", icon: Clock3 }
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-white">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><item.icon className="h-4 w-4 text-[#5b5cf6]" />{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
