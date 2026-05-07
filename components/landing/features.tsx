"use client";

import { motion } from "framer-motion";
import { BookOpenCheck, Bot, CalendarClock, FileSearch, FlaskConical, Highlighter, Library, ScanText } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Bot, title: "AI Chatbot", description: "Streaming workspace with academic modes, memory, markdown, and file-aware answers." },
  { icon: ScanText, title: "Plagiarism Checker", description: "Similarity scoring, source matching, heatmaps, citation flags, and copied-text highlights." },
  { icon: FlaskConical, title: "AI Detector", description: "Perplexity, burstiness, repetition signals, confidence scoring, and sentence analysis." },
  { icon: FileSearch, title: "Assignment Analyzer", description: "Extracts criteria, learning outcomes, risks, missing sections, and research structure." },
  { icon: Library, title: "Smart Notes", description: "Lecture summaries, smart tags, folders, revision mode, and instant key points." },
  { icon: BookOpenCheck, title: "Citation Generator", description: "APA, MLA, Harvard, IEEE citations with source quality checks and inline warnings." },
  { icon: Highlighter, title: "Flashcards", description: "Auto-generated flashcards with spaced repetition, quiz mode, and memory tracking." },
  { icon: CalendarClock, title: "Study Planner", description: "Calendar deadlines, suggested sessions, reminders, and productivity analytics." }
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-secondary">Feature Matrix</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Built like a serious academic command center.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: index * 0.04 }}>
              <Card className="group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                <feature.icon className="mb-7 h-7 w-7 text-secondary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mt-3">{feature.description}</CardDescription>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

