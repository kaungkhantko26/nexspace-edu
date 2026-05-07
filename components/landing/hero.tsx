"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, FileUp, MessageSquareText, NotebookText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiOrb } from "@/components/landing/ai-orb";

const cards = [
  { label: "Open AI Workspace", value: "Chat", meta: "upload first, send when ready", href: "/workspace", icon: MessageSquareText },
  { label: "Review Modules", value: "Study", meta: "notes, lectures, progress", href: "/modules", icon: BookOpenCheck },
  { label: "Edit Current Notes", value: "Notes", meta: "write and read side by side", href: "/modules/aa15a56c-620f-4d33-8fd3-d896a95001b8/notes/13de39ea-f913-418d-bc2f-00caccc61f8e", icon: NotebookText }
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden px-4 pt-32 sm:pt-40">
      <div className="grid-bg absolute inset-0 -z-20" />
      <div className="absolute left-1/2 top-16 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <AiOrb />
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur">
            <Sparkles className="h-4 w-4 text-secondary" />
            Academic OS for research, writing, and revision
          </div>
          <h1 className="text-balance font-display text-5xl font-bold leading-[1.02] text-white sm:text-7xl lg:text-8xl">
            Everything a Student Needs. One AI Workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">
            Chat with course materials, analyze assignments, generate citations, detect plagiarism risk, plan deadlines, and turn lectures into revision systems.
          </p>
          <div className="mt-6 grid max-w-2xl gap-2 sm:grid-cols-3">
            {["Attach files first", "Ask in any AI mode", "Review saved notes"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70 backdrop-blur">
                <span className="mb-2 block text-xs font-semibold text-secondary">0{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/dashboard">
                Start Learning <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass">
              <Link href="/workspace">
                <FileUp className="h-4 w-4" />
                Upload Assignment
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/workspace">
                <MessageSquareText className="h-4 w-4" />
                Try AI Assistant
              </Link>
            </Button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18, duration: 0.8 }} className="relative min-h-[34rem]">
          <div className="glass absolute right-0 top-8 w-full max-w-md rounded-[2rem] p-5 animate-float">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Start here</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Ready</span>
            </div>
            <div className="space-y-3">
              {cards.map((card) => (
                <Link key={card.label} href={card.href} className="block rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-white/25 hover:bg-white/[0.1]">
                  <div className="flex items-end justify-between">
                    <span className="flex items-center gap-2 text-sm text-white/70">
                      <card.icon className="h-4 w-4 text-secondary" />
                      {card.label}
                    </span>
                    <span className="font-display text-2xl font-semibold text-white">{card.value}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent" style={{ width: "78%" }} />
                  </div>
                  <p className="mt-2 text-xs text-white/42">{card.meta}</p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
