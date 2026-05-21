/* ============================================================
   KPI AGENT - Performance Tracking & Analysis
   ============================================================
   Aggregates metrics, compares against goals, and generates
   AI-powered insights aligned with brand strategy.
   ============================================================ */

import { prisma } from "./prisma";
import { callGemini } from "./gemini";

/* ---- Types ---- */
export interface KpiSummary {
  platform: string;
  period: string;
  metrics: Record<string, { current: number; previous: number; change: number; changePercent: number }>;
  totalPosts: number;
}

export interface KpiAnalysis {
  insights: string[];
  recommendations: string[];
  goalProgress: { metricType: string; platform: string; current: number; target: number; percent: number }[];
}

/* # Aggregate metrics for a platform over a time period */
export async function getKpiSummary(
  platform: string,
  period: "week" | "month"
): Promise<KpiSummary> {
  const now = new Date();
  const periodDays = period === "week" ? 7 : 30;

  // # Current period dates
  const currentEnd = now.toISOString().split("T")[0];
  const currentStart = new Date(now.getTime() - periodDays * 86400000).toISOString().split("T")[0];

  // # Previous period dates
  const previousEnd = currentStart;
  const previousStart = new Date(now.getTime() - periodDays * 2 * 86400000).toISOString().split("T")[0];

  // # Query current period metrics
  const currentMetrics = await prisma.kpiMetric.findMany({
    where: {
      platform: platform === "all" ? undefined : platform,
      date: { gte: currentStart, lte: currentEnd },
    },
  });

  // # Query previous period metrics
  const previousMetrics = await prisma.kpiMetric.findMany({
    where: {
      platform: platform === "all" ? undefined : platform,
      date: { gte: previousStart, lte: previousEnd },
    },
  });

  // # Aggregate by metric type
  const aggregate = (metrics: typeof currentMetrics) => {
    const sums: Record<string, number> = {};
    for (const m of metrics) {
      sums[m.metricType] = (sums[m.metricType] || 0) + m.value;
    }
    return sums;
  };

  const current = aggregate(currentMetrics);
  const previous = aggregate(previousMetrics);

  // # Build comparison
  const allTypes = new Set([...Object.keys(current), ...Object.keys(previous)]);
  const metrics: KpiSummary["metrics"] = {};

  for (const type of allTypes) {
    const curr = current[type] || 0;
    const prev = previous[type] || 0;
    const change = curr - prev;
    const changePercent = prev > 0 ? (change / prev) * 100 : curr > 0 ? 100 : 0;
    metrics[type] = { current: curr, previous: prev, change, changePercent: Math.round(changePercent * 10) / 10 };
  }

  // # Count posted content
  const totalPosts = await prisma.content.count({
    where: {
      platform: platform === "all" ? undefined : platform,
      status: "posted",
      postedAt: { gte: new Date(currentStart) },
    },
  });

  return { platform, period, metrics, totalPosts };
}

/* # AI-powered analysis of KPI data */
export async function analyzeKpis(): Promise<KpiAnalysis> {
  // # Get all summaries
  const platforms = ["linkedin", "twitter", "instagram", "tiktok"];
  const summaries: KpiSummary[] = [];

  for (const platform of platforms) {
    const summary = await getKpiSummary(platform, "week");
    if (Object.keys(summary.metrics).length > 0) {
      summaries.push(summary);
    }
  }

  // # Get goals
  const goals = await prisma.kpiGoal.findMany();

  // # Calculate goal progress
  const goalProgress: KpiAnalysis["goalProgress"] = [];
  for (const goal of goals) {
    const summary = summaries.find((s) => s.platform === goal.platform || goal.platform === "all");
    const current = summary?.metrics[goal.metricType]?.current || 0;
    goalProgress.push({
      metricType: goal.metricType,
      platform: goal.platform,
      current,
      target: goal.targetValue,
      percent: goal.targetValue > 0 ? Math.round((current / goal.targetValue) * 100) : 0,
    });
  }

  // # Ask AI for insights
  if (summaries.length === 0) {
    return {
      insights: ["No metric data available yet. Start by adding metrics manually or connecting platform APIs."],
      recommendations: ["Post consistently across platforms and track metrics weekly to establish baselines."],
      goalProgress,
    };
  }

  const prompt = `You are a social media analytics expert. Analyze these marketing KPIs for JobPilot AI (a career tech brand).

PRIMARY GOAL: Build trustworthy, credible brand image
SECONDARY GOAL: Increase brand awareness, website traffic, users

PLATFORM METRICS (this week vs last week):
${JSON.stringify(summaries, null, 2)}

GOALS:
${JSON.stringify(goals, null, 2)}

GOAL PROGRESS:
${JSON.stringify(goalProgress, null, 2)}

Provide:
1. 3-5 specific insights based on the data (what's working, what's not, what changed)
2. 3-5 actionable recommendations to improve performance toward our goals

Be SPECIFIC. Reference actual numbers. No generic marketing advice.

Return a JSON object:
{"insights":["insight 1","insight 2",...],"recommendations":["rec 1","rec 2",...]}
Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      insights: parsed.insights || [],
      recommendations: parsed.recommendations || [],
      goalProgress,
    };
  } catch {
    return {
      insights: ["Analysis failed. Check your Gemini API key."],
      recommendations: [],
      goalProgress,
    };
  }
}
