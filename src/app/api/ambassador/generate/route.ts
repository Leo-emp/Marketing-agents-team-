/* ============================================================
   AMBASSADOR GENERATE — /api/ambassador/generate
   ============================================================
   GET: Cron-triggered Tue/Thu at 7 AM UTC. Generates an AI
   brand ambassador video using the full pipeline:
   topic → script → HeyGen avatar → queue for approval.

   Auth: CRON_SECRET via Authorization: Bearer <secret>
   Pattern matches /api/blog/generate for consistency.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateAmbassadorVideo } from "@/lib/ambassador";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured in Vercel env vars
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Server misconfigured — CRON_SECRET not set" },
      { status: 500 }
    );
  }

  // # Timing-safe auth check — prevents timing-based secret inference attacks
  // # Vercel Cron sends the secret as: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;

  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // # Run the full ambassador video pipeline
  try {
    const result = await generateAmbassadorVideo();

    if (result) {
      return NextResponse.json({
        generated: 1,
        contentId: result.contentId,
        videoUrl: result.videoUrl,
        duration: result.duration,
      });
    }

    return NextResponse.json({
      generated: 0,
      error: "Ambassador pipeline returned null — check HeyGen API key and avatar config",
    });
  } catch (err) {
    console.error("[AmbassadorGenerate] Pipeline threw an exception:", err);
    return NextResponse.json(
      {
        generated: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
