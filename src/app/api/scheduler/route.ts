/* ============================================================
   SCHEDULER API — /api/scheduler
   ============================================================
   GET: Called by Vercel Cron every 5 minutes. Finds content
   with status "scheduled" whose scheduledFor time has passed,
   then auto-posts each to its platform. Protected by
   CRON_SECRET to prevent unauthorized triggers.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToPlatform } from "@/lib/social-posting";

export async function GET(req: NextRequest) {
  // # Verify the request is from Vercel Cron using the shared secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

  if (due.length === 0) {
    return NextResponse.json({ posted: 0, message: "No scheduled posts due" });
  }

  const results: { id: string; platform: string; success: boolean; error?: string }[] = [];

  for (const item of due) {
    // # Build the post text — use caption for visual posts, fall back to body
    let postText = item.captionText || item.body;
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
      // # Mark failed posts with a note so admin can see what happened
      await prisma.content.update({
        where: { id: item.id },
        data: {
          notes: `Auto-post failed at ${now.toISOString()}: ${result.error}`,
        },
      });
      results.push({ id: item.id, platform: item.platform, success: false, error: result.error });
    }
  }

  const posted = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return NextResponse.json({ posted, failed, results });
}
