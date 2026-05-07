import Link from "next/link";
import { BrainCircuit, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = ["Features", "AI Workspace", "Pricing", "About", "Contact"];

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4">
      <nav className="glass mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-background shadow-glow">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="font-display text-base font-semibold tracking-normal text-white">NexSpace EDU AI</span>
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link} href={`#${link.toLowerCase().replaceAll(" ", "-")}`} className="text-sm text-white/62 transition hover:text-white">
              {link}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/workspace">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

