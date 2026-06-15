/* ============================================================
   ENGAGEMENT API — /api/content/[id]/engagement
   ============================================================
   PATCH: Update engagement metrics for a posted content item.
   Computes a composite engagement score used to identify
   top-performing content for the voice sample feedback loop.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

type Params = { params: Promise<{ id: string }> };

/* # Composite score weights — saves and comments are highest value signals */
const WEIGHTS = {
  likes: 1,
  comments: 3,
  shares: 4,
  saves: 5,
  impressions: 0.01,
};

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // # Update only the fields provided
  const likes = body.likes ?? content.engagementLikes ?? 0;
  const comments = body.comments ?? content.engagementComments ?? 0;
  const shares = body.shares ?? content.engagementShares ?? 0;
  const saves = body.saves ?? content.engagementSaves ?? 0;
  const impressions = body.impressions ?? content.engagementImpressions ?? 0;

  // # Compute composite engagement score
  const engagementScore =
    likes * WEIGHTS.likes +
    comments * WEIGHTS.comments +
    shares * WEIGHTS.shares +
    saves * WEIGHTS.saves +
    impressions * WEIGHTS.impressions;

  const updated = await prisma.content.update({
    where: { id },
    data: {
      engagementLikes: likes,
      engagementComments: comments,
      engagementShares: shares,
      engagementSaves: saves,
      engagementImpressions: impressions,
      engagementScore,
    },
  });

  return NextResponse.json(updated);
}
