import Link from "next/link";
import { BarChart3, Bot, CalendarDays, FileText, Gauge, GraduationCap, Layers3, NotebookText, Settings, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "AI Chat", href: "/workspace", icon: Bot },
  { label: "Notes Library", href: "/modules", icon: GraduationCap },
  { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Plagiarism", href: "/plagiarism", icon: ShieldCheck },
  { label: "AI Detector", href: "/ai-detector", icon: Sparkles },
  { label: "Notes", href: "/modules/aa15a56c-620f-4d33-8fd3-d896a95001b8/notes/13de39ea-f913-418d-bc2f-00caccc61f8e", icon: NotebookText },
  { label: "Flashcards", href: "/dashboard#flashcards", icon: Layers3 },
  { label: "Planner", href: "/planner", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function Sidebar() {
  return (
    <>
      <aside className="hidden h-full w-72 shrink-0 border-r border-slate-200 bg-white p-4 text-slate-950 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 rounded-2xl px-2 py-1">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#5b5cf6] text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display font-semibold">NexSpace EDU AI</span>
            <span className="block text-xs text-slate-500">Academic OS</span>
          </span>
        </Link>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Current review</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Open a module note, edit it, and read the rendered version side by side.</p>
          <Link href="/modules/aa15a56c-620f-4d33-8fd3-d896a95001b8/notes/13de39ea-f913-418d-bc2f-00caccc61f8e" className="mt-4 inline-flex text-sm font-semibold text-[#5b5cf6]">
            Continue notes
          </Link>
        </div>
      </aside>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-3xl border border-slate-200 bg-white/95 p-2 text-slate-700 shadow-2xl backdrop-blur lg:hidden">
        {items.slice(0, 5).map((item) => (
          <Link key={item.label} href={item.href} className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition hover:bg-slate-100 hover:text-slate-950">
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="max-w-full truncate">{item.label.replace("AI ", "")}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
