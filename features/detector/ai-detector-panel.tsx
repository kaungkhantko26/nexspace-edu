import { Card } from "@/components/ui/card";

const signals = [
  ["Perplexity", "Medium", 62],
  ["Burstiness", "High", 78],
  ["Repetitive structure", "Low", 21],
  ["Sentence fingerprint", "Watch", 54]
] as const;

export function AiDetectorPanel() {
  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl font-semibold">AI-generated content detector</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-sm text-white/52">Human Score</p>
          <p className="mt-3 font-display text-4xl font-semibold">71%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-sm text-white/52">AI Score</p>
          <p className="mt-3 font-display text-4xl font-semibold">29%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-sm text-white/52">Confidence</p>
          <p className="mt-3 font-display text-4xl font-semibold">84%</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {signals.map(([label, status, score]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between text-sm text-white/62">
              <span>{label}</span>
              <span>{status}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

