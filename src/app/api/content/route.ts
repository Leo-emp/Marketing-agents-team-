/* ============================================================
   CONTENT QUEUE API — /api/content
   ============================================================
   GET: List content items with optional filters
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = 20;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const where: any = {};
  if (status) where.status = status;
  if (platform) where.platform = platform;

  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  });
}
