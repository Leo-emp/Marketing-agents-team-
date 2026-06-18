/* ============================================================
   FUNNEL SYNC CRON — /api/funnel/sync
   ============================================================
   GET: Called by Vercel Cron every hour. Polls the main app
   for new user lifecycle events. Protected by CRON_SECRET.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { syncFunnelEvents } from "@/lib/funnel/sync";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  // # Timing-safe comparison prevents timing attacks on the secret
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
    // # Run the sync and return how many events were processed
    const result = await syncFunnelEvents();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Funnel sync cron failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
