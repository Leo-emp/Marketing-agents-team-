/* ============================================================
   TREND RADAR CRON — /api/pipeline/trend-radar
   ============================================================
   # GET: Cron-triggered every 6 hours. Scans for trending
   # career/hiring topics and auto-drafts reactive content.
   # Content is queued as "pending" for admin review.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { runTrendRadar } from "@/lib/trend-radar";

export async function GET(req: NextRequest) {
  // # Cron auth — same secret as weekly pipeline
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runTrendRadar();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[TrendRadar] Cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Trend radar failed" },
      { status: 500 }
    );
  }
}
