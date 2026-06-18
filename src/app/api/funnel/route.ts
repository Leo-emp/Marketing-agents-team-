/* ============================================================
   FUNNEL API — /api/funnel
   ============================================================
   GET: Returns funnel conversion data with optional filters.
   POST: Triggers AI-powered funnel analysis.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { getFunnelData, analyzeFunnel } from "@/lib/funnel/analytics";

// # GET /api/funnel — returns funnel stage counts with optional filters
export async function GET(req: NextRequest) {
  // # Admin-only — reject non-admins immediately
  if (!(await isAdmin())) return unauthorized();

  try {
    // # Parse optional query params: ?source=twitter&start=2026-01-01&end=2026-06-30
    const { searchParams } = new URL(req.url);
    const utmSource = searchParams.get("source") || undefined;
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const data = await getFunnelData({ utmSource, startDate, endDate });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Funnel data fetch failed:", err);
    return NextResponse.json({ error: "Failed to load funnel data" }, { status: 500 });
  }
}

// # POST /api/funnel — triggers AI analysis of the funnel (no body needed)
export async function POST() {
  // # Admin-only — AI analysis is a privileged operation
  if (!(await isAdmin())) return unauthorized();

  try {
    const analysis = await analyzeFunnel();
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Funnel analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
