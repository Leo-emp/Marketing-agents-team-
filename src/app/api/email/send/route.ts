/* ============================================================
   EMAIL SEND CRON — /api/email/send
   ============================================================
   GET: Called by Vercel Cron every 30 minutes. Evaluates all
   active email sequences and sends due emails with anti-annoyance
   controls. Protected by CRON_SECRET.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { evaluateAndSendEmails } from "@/lib/email/sequences";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  // # Verify cron authorization (same pattern as /api/scheduler)
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
    // # Run the sequence engine
    const result = await evaluateAndSendEmails();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Email send cron failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
