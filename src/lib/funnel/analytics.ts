/* ============================================================
   FUNNEL ANALYTICS - Conversion rates and attribution breakdown
   ============================================================
   Calculates funnel drop-off rates and per-channel attribution
   from FunnelEvent data. Powers the Funnel dashboard tab.
   ============================================================ */

import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";

// # Funnel stages in order — mirrors the user journey in the main app
const STAGES = ["signup", "first_ai_use", "fifth_ai_use", "pro_upgrade"] as const;

export interface FunnelStage {
  name: string;
  count: number;
  percent: number; // # Relative to signups (first stage = 100%)
}

export interface FunnelData {
  stages: FunnelStage[];
  totalSignups: number;
}

export interface AttributionRow {
  channel: string;
  signups: number;
  firstUse: number;
  proUpgrades: number;
  convRate: number;   // # Pro upgrades / signups as percentage
  estRevenue: number; // # Pro upgrades × £9.99
}

// # Build funnel data with optional filters
export async function getFunnelData(filters: {
  utmSource?: string;
  startDate?: string;
  endDate?: string;
}): Promise<FunnelData> {
  // # Build where clause from filters — only include defined filters
  const where: Record<string, unknown> = {};
  if (filters.utmSource) where.utmSource = filters.utmSource;
  if (filters.startDate || filters.endDate) {
    // # eventDate filter uses Prisma's gte/lte range operators
    where.eventDate = {};
    if (filters.startDate) (where.eventDate as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters.endDate) (where.eventDate as Record<string, unknown>).lte = new Date(filters.endDate);
  }

  // # Count events for each stage sequentially
  const stages: FunnelStage[] = [];
  let signupCount = 0;

  for (const stage of STAGES) {
    const count = await prisma.funnelEvent.count({
      where: { ...where, eventType: stage },
    });
    // # Store signup count separately so we can calculate % for all stages
    if (stage === "signup") signupCount = count;
    stages.push({
      name: stage,
      count,
      // # Round to 1 decimal: (count / signups) * 100, avoid division by zero
      percent: signupCount > 0 ? Math.round((count / signupCount) * 1000) / 10 : 0,
    });
  }

  return { stages, totalSignups: signupCount };
}

// # Attribution breakdown by UTM source channel
export async function getAttribution(filters: {
  startDate?: string;
  endDate?: string;
}): Promise<AttributionRow[]> {
  const where: Record<string, unknown> = {};
  if (filters.startDate || filters.endDate) {
    where.eventDate = {};
    if (filters.startDate) (where.eventDate as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters.endDate) (where.eventDate as Record<string, unknown>).lte = new Date(filters.endDate);
  }

  // # Fetch all events in range — then group in memory (dataset is bounded)
  const allEvents = await prisma.funnelEvent.findMany({ where });

  // # Group events by UTM source — normalize null/empty to "direct"
  const bySource = new Map<string, typeof allEvents>();
  for (const evt of allEvents) {
    const source = evt.utmSource || "direct";
    const list = bySource.get(source) || [];
    list.push(evt);
    bySource.set(source, list);
  }

  // # Build attribution rows with conversion metrics per channel
  const rows: AttributionRow[] = [];
  const pricePerPro = 9.99; // # £9.99/month Pro plan price

  for (const [channel, events] of bySource) {
    const signups = events.filter((e) => e.eventType === "signup").length;
    const firstUse = events.filter((e) => e.eventType === "first_ai_use").length;
    const proUpgrades = events.filter((e) => e.eventType === "pro_upgrade").length;
    // # convRate: percentage of signups that converted to Pro
    const convRate = signups > 0 ? Math.round((proUpgrades / signups) * 1000) / 10 : 0;

    rows.push({
      channel,
      signups,
      firstUse,
      proUpgrades,
      convRate,
      // # Estimated MRR from this channel — round to 2 decimal places
      estRevenue: Math.round(proUpgrades * pricePerPro * 100) / 100,
    });
  }

  // # Sort by signups descending so highest-volume channels appear first
  rows.sort((a, b) => b.signups - a.signups);
  return rows;
}

// # AI-powered funnel insights using the Gemini analyst
export async function analyzeFunnel(): Promise<{
  insights: string[];
  recommendations: string[];
}> {
  // # Load current funnel and attribution data to pass to the AI
  const funnel = await getFunnelData({});
  const attribution = await getAttribution({});

  // # Guard: no data yet — return helpful message instead of confusing AI
  if (funnel.totalSignups === 0) {
    return {
      insights: ["No funnel data yet. Sync with the main app to start tracking."],
      recommendations: ["Configure JOBPILOT_API_URL and JOBPILOT_API_SECRET, then run funnel sync."],
    };
  }

  const prompt = `You are a growth marketing analyst. Analyze this conversion funnel and attribution data for JobPilot AI (a career tech SaaS at £9.99/month Pro plan).

FUNNEL:
${JSON.stringify(funnel.stages, null, 2)}

ATTRIBUTION BY CHANNEL:
${JSON.stringify(attribution, null, 2)}

Provide:
1. 3-5 specific insights (what's working, what's dropping off, which channels convert best)
2. 3-5 actionable recommendations to improve conversion rates

Be SPECIFIC. Reference actual numbers and percentages. No generic advice.

Return JSON: {"insights":["..."],"recommendations":["..."]}
Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    // # Extract JSON block from the response — Gemini may include markdown
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]);
  } catch {
    // # Graceful degradation — don't crash the dashboard if AI fails
    return {
      insights: ["Funnel analysis failed — check Gemini API key."],
      recommendations: [],
    };
  }
}
