/* ============================================================
   RESEARCH API — /api/research
   ============================================================
   POST: Conduct real-time research on a topic using Gemini
   with Google Search grounding. Returns trends, data points,
   angles, and sources.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { conductResearch } from "@/lib/research";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { topic, platform, context } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const brief = await conductResearch(topic, platform || "all", context);
    return NextResponse.json(brief);
  } catch (e) {
    console.error("Research failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Research failed: ${message}` }, { status: 500 });
  }
}
