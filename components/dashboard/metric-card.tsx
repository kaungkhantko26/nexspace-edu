import { ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <ArrowUpRight className="h-4 w-4 text-[#5b5cf6]" />
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-semibold text-emerald-600">{delta}</p>
    </div>
  );
}
