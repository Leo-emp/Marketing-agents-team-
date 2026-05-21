/* ============================================================
   KPI ANALYZE — /api/kpi/analyze
   ============================================================
   POST: Run AI-powered analysis on current KPI data.
   Returns insights, recommendations, and goal progress.
   ============================================================ */

import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { analyzeKpis } from "@/lib/kpi";

export async function POST() {
  if (!(await isAdmin())) return unauthorized();

  try {
    const analysis = await analyzeKpis();
    return NextResponse.json(analysis);
  } catch (e) {
    console.error("KPI analysis failed:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
