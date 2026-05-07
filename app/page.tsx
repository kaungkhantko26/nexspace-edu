import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
    </main>
  );
}

