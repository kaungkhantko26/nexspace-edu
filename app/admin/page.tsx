import { Activity, CreditCard, Flag, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const adminStats = [
  { label: "Active users", value: "2,418", icon: Users },
  { label: "AI requests", value: "84.2k", icon: Activity },
  { label: "Moderation queue", value: "17", icon: Flag },
  { label: "Subscriptions", value: "$18.6k", icon: CreditCard }
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-background">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-secondary">Admin Panel</p>
            <h1 className="font-display text-4xl font-semibold text-white">Platform operations</h1>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminStats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <stat.icon className="mb-6 h-5 w-5 text-secondary" />
              <p className="text-sm text-white/52">{stat.label}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{stat.value}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-4 overflow-hidden">
          <div className="grid grid-cols-4 border-b border-white/10 px-5 py-4 text-sm text-white/44">
            <span>User</span>
            <span>Plan</span>
            <span>Usage</span>
            <span>Status</span>
          </div>
          {[
            ["student@nexspace.ai", "Pro Student", "92%", "Healthy"],
            ["uni-admin@nexspace.ai", "University", "68%", "Review"],
            ["trial@nexspace.ai", "Free", "100%", "Limited"]
          ].map((row) => (
            <div key={row[0]} className="grid grid-cols-4 px-5 py-4 text-sm text-white/70">
              {row.map((cell) => <span key={cell}>{cell}</span>)}
            </div>
          ))}
        </Card>
      </div>
    </main>
  );
}

