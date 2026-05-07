import { NextResponse } from "next/server";
import { addDays, format } from "date-fns";

export async function GET() {
  return NextResponse.json({
    sessions: [
      { id: "1", title: "Research sources", date: format(addDays(new Date(), 1), "yyyy-MM-dd"), duration: 90 },
      { id: "2", title: "Draft assignment body", date: format(addDays(new Date(), 2), "yyyy-MM-dd"), duration: 120 },
      { id: "3", title: "Citation and plagiarism pass", date: format(addDays(new Date(), 4), "yyyy-MM-dd"), duration: 75 }
    ]
  });
}

