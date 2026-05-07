import { Card } from "@/components/ui/card";

const sources = [
  { name: "University repository", match: 18 },
  { name: "Uploaded lecture notes", match: 11 },
  { name: "Public web sources", match: 7 }
];

export function PlagiarismPanel() {
  return (
    <Card className="p-6">
      <h2 className="font-display text-2xl font-semibold">Turnitin-style similarity report</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-[14rem_1fr]">
        <div className="grid place-items-center rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="grid h-36 w-36 place-items-center rounded-full border-[10px] border-secondary/70 bg-background text-center">
            <span className="font-display text-4xl font-semibold">23%</span>
            <span className="-mt-5 text-xs text-white/44">similarity</span>
          </div>
        </div>
        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.name} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex justify-between text-sm">
                <span>{source.name}</span>
                <span className="text-secondary">{source.match}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${source.match * 3}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

