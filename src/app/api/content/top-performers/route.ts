/* ============================================================
   TOP PERFORMERS API — /api/content/top-performers
   ============================================================
   GET: Returns the highest-scoring posted content by platform.
   Used by the dynamic voice sample system to feed winning
   content back into future generation prompts.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const where: any = {
    status: "posted",
    engagementScore: { not: null },
  };
  if (platform) where.platform = platform;

  const topContent = await prisma.content.findMany({
    where,
    orderBy: { engagementScore: "desc" },
    take: limit,
    select: {
      id: true,
      platform: true,
      contentType: true,
      title: true,
      body: true,
      captionText: true,
      hook: true,
      engagementLikes: true,
      engagementComments: true,
      engagementShares: true,
      engagementSaves: true,
      engagementImpressions: true,
      engagementScore: true,
      postedAt: true,
    },
  });

  return NextResponse.json({ items: topContent });
}
