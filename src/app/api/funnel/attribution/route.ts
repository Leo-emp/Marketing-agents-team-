/* ============================================================
   ATTRIBUTION API — /api/funnel/attribution
   ============================================================
   GET: Returns per-channel attribution breakdown (signups,
   first use, Pro upgrades, conversion rate, revenue).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { getAttribution } from "@/lib/funnel/analytics";

// # GET /api/funnel/attribution — returns attribution rows grouped by UTM source
export async function GET(req: NextRequest) {
  // # Admin-only — revenue and attribution data is sensitive
  if (!(await isAdmin())) return unauthorized();

  try {
    // # Parse optional date range: ?start=2026-01-01&end=2026-06-30
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const rows = await getAttribution({ startDate, endDate });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Attribution fetch failed:", err);
    return NextResponse.json({ error: "Failed to load attribution" }, { status: 500 });
  }
}
