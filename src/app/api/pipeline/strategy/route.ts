/* ============================================================
   STRATEGY DIRECTOR CRON — /api/pipeline/strategy
   ============================================================
   # GET: Cron-triggered Sunday 9 PM UTC (1 hour before weekly
   # pipeline). Generates an adaptive content plan based on
   # performance data, trends, and content gaps.
   #
   # The weekly pipeline then reads the active ContentPlan
   # and uses it instead of the static DEFAULT_PLAN.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateWeeklyStrategy } from "@/lib/strategy-director";

export async function GET(req: NextRequest) {
  // # Cron auth
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
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

  try {
    const plan = await generateWeeklyStrategy();
    return NextResponse.json({
      calendarItems: plan.calendar.length,
      reasoning: plan.reasoning,
      pillarMix: plan.pillarMix,
      platformWeighting: plan.platformWeighting,
      experiments: plan.experiments,
      avoidTopics: plan.avoidTopics,
    });
  } catch (e) {
    console.error("[StrategyDirector] Cron error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Strategy generation failed" },
      { status: 500 }
    );
  }
}
