/* ============================================================
   SCHEDULER API — /api/scheduler
   ============================================================
   GET: Called by Vercel Cron every 30 minutes. Finds content
   with status "scheduled" whose scheduledFor time has passed,
   plus failed posts due for retry, then auto-posts each to
   its platform. Protected by CRON_SECRET.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { postToPlatform } from "@/lib/social-posting";
import { tagContentLinks } from "@/lib/funnel/utm";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "Server misconfigured — CRON_SECRET not set" }, { status: 500 });
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

  const now = new Date();

  // # Find all scheduled posts whose time has arrived
  const due = await prisma.content.findMany({
    where: {
      status: "scheduled",
      scheduledFor: { lte: now },
    },
    orderBy: { scheduledFor: "asc" },
  });

  // # Find failed posts that are due for retry (max 1 retry)
  const retryable = await prisma.content.findMany({
    where: {
      status: "failed",
      retryAt: { lte: now },
      retryCount: { lt: 2 },
    },
    orderBy: { retryAt: "asc" },
  });

  // # Combine scheduled + retryable posts
  const allDue = [...due, ...retryable];

  if (allDue.length === 0) {
    return NextResponse.json({ posted: 0, message: "No scheduled or retryable posts due" });
  }

  const results: { id: string; platform: string; success: boolean; error?: string }[] = [];

  for (const item of allDue) {
    // # Build the post text — use caption for visual posts, fall back to body
    let postText = item.captionText || item.body;
    // # Auto-tag jobpilotai.co links with UTM params for attribution tracking
    postText = tagContentLinks(postText, item.platform, item.id);
    if (item.hashtags && item.platform !== "twitter") {
      const tags = item.hashtags.split(",").map((t) => `#${t.trim()}`).join(" ");
      postText += `\n\n${tags}`;
    }

    const result = await postToPlatform(item.platform, postText, item.imageUrl || undefined);

    if (result.success) {
      await prisma.content.update({
        where: { id: item.id },
        data: {
          status: "posted",
          postedAt: new Date(),
          platformPostId: result.platformPostId,
        },
      });
      results.push({ id: item.id, platform: item.platform, success: true });
    } else {
      // # Set retry for 30 minutes later if first attempt, mark permanently failed if second
      const retryCount = (item.retryCount || 0) + 1;
      await prisma.content.update({
        where: { id: item.id },
        data: {
          status: "failed",
          retryAt: retryCount < 2 ? new Date(now.getTime() + 30 * 60 * 1000) : null,
          retryCount,
          notes: `Auto-post attempt ${retryCount} failed at ${now.toISOString()}: ${result.error}`,
        },
      });
      results.push({ id: item.id, platform: item.platform, success: false, error: result.error });
    }
  }

  const posted = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return NextResponse.json({ posted, failed, results });
}
