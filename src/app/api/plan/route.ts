/* ============================================================
   PLAN API — /api/plan
   ============================================================
   POST: Generate a weekly content plan via the strategist agent
   GET:  Retrieve saved content plans
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePlan } from "@/lib/agents";
import { isAdmin, unauthorized } from "@/lib/auth-check";

/* # Generate a new content plan */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { weekOf, context } = await req.json();

    if (!weekOf) {
      return NextResponse.json({ error: "weekOf is required (e.g. 2026-05-25)" }, { status: 400 });
    }

    const plan = await generatePlan(weekOf, context);

    const saved = await prisma.contentPlan.create({
      data: {
        weekOf,
        plan: JSON.stringify(plan),
        status: "draft",
      },
    });

    return NextResponse.json({ id: saved.id, weekOf, plan, status: "draft" });
  } catch (e) {
    console.error("Plan generation failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Plan generation failed: ${message}` }, { status: 500 });
  }
}

/* # List all content plans */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();

  const plans = await prisma.contentPlan.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    plans.map((p) => ({
      ...p,
      plan: JSON.parse(p.plan),
    }))
  );
}
