/* ============================================================
   KPI API — /api/kpi
   ============================================================
   GET: Retrieve KPI metrics with filters
   POST: Add a new metric entry (manual data input)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { getKpiSummary } from "@/lib/kpi";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || "all";
    const period = (searchParams.get("period") || "week") as "week" | "month";

    const summary = await getKpiSummary(platform, period);

    // # Also fetch goals for this platform
    const goals = await prisma.kpiGoal.findMany({
      where: platform === "all" ? undefined : { platform },
    });

    return NextResponse.json({ summary, goals });
  } catch (e) {
    console.error("KPI fetch failed:", e);
    return NextResponse.json({ error: "Failed to load KPIs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();

    // # Adding a metric entry
    if (body.type === "metric") {
      const { platform, metricType, value, date, contentId, notes } = body;
      if (!platform || !metricType || value === undefined || !date) {
        return NextResponse.json({ error: "platform, metricType, value, and date are required" }, { status: 400 });
      }

      const metric = await prisma.kpiMetric.create({
        data: {
          platform,
          metricType,
          value: Number(value),
          date,
          contentId: contentId || null,
          notes: notes || null,
          source: "manual",
        },
      });
      return NextResponse.json(metric);
    }

    // # Adding or updating a goal
    if (body.type === "goal") {
      const { platform, metricType, targetValue, period, startDate, endDate, id } = body;

      if (id) {
        const goal = await prisma.kpiGoal.update({
          where: { id },
          data: { targetValue: Number(targetValue) },
        });
        return NextResponse.json(goal);
      }

      if (!platform || !metricType || !targetValue || !period || !startDate || !endDate) {
        return NextResponse.json({ error: "All goal fields are required" }, { status: 400 });
      }

      const goal = await prisma.kpiGoal.create({
        data: {
          platform,
          metricType,
          targetValue: Number(targetValue),
          period,
          startDate,
          endDate,
        },
      });
      return NextResponse.json(goal);
    }

    return NextResponse.json({ error: "type must be 'metric' or 'goal'" }, { status: 400 });
  } catch (e) {
    console.error("KPI creation failed:", e);
    return NextResponse.json({ error: "Failed to save KPI data" }, { status: 500 });
  }
}
