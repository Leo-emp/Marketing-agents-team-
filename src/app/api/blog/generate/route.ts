/* ============================================================
   BLOG GENERATE — /api/blog/generate
   ============================================================
   GET: Cron-triggered Mon/Wed/Fri at 8 AM UTC. Runs the blog
   writer pipeline to discover a topic, write an article,
   generate a cover image, run editorial review, and queue
   the draft for approval.

   Auth: CRON_SECRET via Authorization: Bearer <secret>
   Pattern matches /api/scheduler for consistency.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateBlogArticle } from "@/lib/blog-writer";

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

  // # Run the full blog writer pipeline:
  // # discoverTopic → writeArticle → editorialReview → coverImage → queueDraft
  try {
    const result = await generateBlogArticle();

    if (result.drafted) {
      // # Success — article queued as "pending" for admin approval
      return NextResponse.json({
        drafted: 1,
        errors: 0,
        contentId: result.contentId,
      });
    }

    // # generateBlogArticle returned drafted:false with an error message
    return NextResponse.json({
      drafted: 0,
      errors: 1,
      error: result.error,
    });
  } catch (err) {
    // # Unexpected exception — log it and return 500 so Vercel Cron logs the failure
    console.error("[BlogGenerate] Pipeline threw an exception:", err);
    return NextResponse.json(
      {
        drafted: 0,
        errors: 1,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
