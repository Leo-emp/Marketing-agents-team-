/* ============================================================
   EMAIL SENDS API — /api/email/sends
   ============================================================
   GET: List recent email sends with optional limit.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  // # Admin-only endpoint — reject non-authenticated requests
  if (!(await isAdmin())) return unauthorized();
  // # Parse the limit param, default 50, cap at 200 to prevent abuse
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
  // # Return sends in reverse-chronological order (newest first)
  const sends = await prisma.emailSend.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });
  return NextResponse.json(sends);
}
