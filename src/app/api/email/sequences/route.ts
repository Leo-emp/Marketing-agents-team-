/* ============================================================
   EMAIL SEQUENCES API — /api/email/sequences
   ============================================================
   GET: List all email sequences.
   PATCH: Update sequence status (activate/pause/draft).
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET() {
  // # Admin-only endpoint — reject non-authenticated requests
  if (!(await isAdmin())) return unauthorized();
  // # Return sequences ordered by priority descending (highest first)
  const sequences = await prisma.emailSequence.findMany({
    orderBy: { priority: "desc" },
  });
  return NextResponse.json(sequences);
}

export async function PATCH(req: NextRequest) {
  // # Admin-only endpoint — reject non-authenticated requests
  if (!(await isAdmin())) return unauthorized();
  const { id, status } = await req.json();
  // # Validate that id and status are provided and status is a known value
  if (!id || !["draft", "active", "paused"].includes(status)) {
    return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
  }
  // # Update the sequence status in the database
  const updated = await prisma.emailSequence.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}
