/* ============================================================
   VARIATION COMPARISON API — /api/content/compare
   ============================================================
   GET: Compare A/B variations within a group. Returns all
   variations with their engagement data, highlights the
   winner, and surfaces patterns from top performers.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");

  if (!group) {
    // # No group specified — return all groups with summary stats
    const groups = await prisma.content.groupBy({
      by: ["variationGroup"],
      where: { variationGroup: { not: null } },
      _count: { id: true },
      _max: { engagementScore: true },
      orderBy: { _max: { engagementScore: "desc" } },
    });

    return NextResponse.json({
      groups: groups.map((g) => ({
        variationGroup: g.variationGroup,
        count: g._count.id,
        topScore: g._max.engagementScore,
      })),
    });
  }

  // # Return all variations in this group with full engagement data
  const variations = await prisma.content.findMany({
    where: { variationGroup: group },
    orderBy: { engagementScore: "desc" },
    select: {
      id: true,
      title: true,
      hook: true,
      body: true,
      contentType: true,
      platform: true,
      status: true,
      editorialScore: true,
      engagementLikes: true,
      engagementComments: true,
      engagementShares: true,
      engagementSaves: true,
      engagementImpressions: true,
      engagementScore: true,
      postedAt: true,
      createdAt: true,
    },
  });

  // # Identify the winner (highest engagement score among posted variations)
  const posted = variations.filter((v) => v.status === "posted" && v.engagementScore != null);
  const winner = posted.length > 0 ? posted[0] : null;

  // # Calculate engagement rate for each posted variation
  const withRates = variations.map((v) => {
    const impressions = v.engagementImpressions || 0;
    const totalEngagement = (v.engagementLikes || 0) + (v.engagementComments || 0) + (v.engagementShares || 0) + (v.engagementSaves || 0);
    const engagementRate = impressions > 0 ? (totalEngagement / impressions) * 100 : 0;
    return { ...v, engagementRate: Math.round(engagementRate * 100) / 100 };
  });

  return NextResponse.json({
    variationGroup: group,
    variations: withRates,
    winner: winner ? winner.id : null,
    totalVariations: variations.length,
    postedCount: posted.length,
  });
}
