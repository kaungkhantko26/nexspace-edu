import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Free", price: "$0", features: ["10 AI messages/day", "3 document uploads", "Basic plagiarism scan"] },
  { name: "Pro Student", price: "$12", features: ["Unlimited workspace chats", "RAG document memory", "AI detector and planner", "Advanced analytics"] },
  { name: "University License", price: "Custom", features: ["Admin console", "Team analytics", "SSO and audit logs", "Dedicated AI routing"] }
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-semibold text-white">Subscription system ready for Stripe.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`p-6 ${index === 1 ? "shadow-glow ring-1 ring-secondary/40" : ""}`}>
              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-3 font-display text-4xl font-bold">{plan.price}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <p key={feature} className="flex items-center gap-3 text-sm text-white/64">
                    <Check className="h-4 w-4 text-secondary" />
                    {feature}
                  </p>
                ))}
              </div>
              <Button className="mt-8 w-full" variant={index === 1 ? "primary" : "glass"}>Choose plan</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

