/* ============================================================
   STRATEGY DIRECTOR — Autonomous Marketing Brain
   ============================================================
   # The Strategy Director is the autonomous decision-maker.
   # Every Sunday before the pipeline runs, it:
   #
   #   1. Analyzes last week's performance (what worked, what flopped)
   #   2. Reads current trends via Gemini + Google Search grounding
   #   3. Identifies content gaps and competitor opportunities
   #   4. Decides pillar mix, platform weighting, and topic angles
   #   5. Outputs an adaptive ContentPlan (not a static calendar)
   #
   # Unlike the old fixed DEFAULT_PLAN, the Strategy Director
   # adjusts the mix based on what's actually performing.
   # It acts like a CMO reviewing the dashboards Monday morning.
   ============================================================ */

import { prisma } from "./prisma";
import { callGemini, callGeminiWithSearch } from "./gemini";
import { generateWeeklyDigest } from "./performance-digest";
import { getTemplatePerformanceSummary } from "./visual/template-intelligence";

/* ---- Strategic Plan Output ---- */
export interface StrategicPlan {
  // # The calendar — adaptive content schedule for the week
  calendar: CalendarItem[];
  // # Strategic reasoning — why these choices were made
  reasoning: string;
  // # Pillar distribution for this week (as percentages)
  pillarMix: Record<string, number>;
  // # Platform weighting (which platforms get more content)
  platformWeighting: Record<string, number>;
  // # Topics to avoid this week (trending negatives, saturated angles)
  avoidTopics: string[];
  // # Experimental slots — content types/angles to test
  experiments: string[];
}

export interface CalendarItem {
  platform: string;
  contentType: string;
  day: string;
  pillar: string;
  topicAngle: string;
  tone: string;
  // # Priority: "must_post" | "can_skip" — lets the pipeline drop low-priority items under load
  priority: "must_post" | "can_skip";
}

/* ---- Main Strategy Function ---- */
/* # Called before the weekly pipeline to generate an adaptive content plan */
export async function generateWeeklyStrategy(): Promise<StrategicPlan> {
  console.log("[StrategyDirector] Starting weekly strategy session...");

  // # Step 1: Gather performance data from last 2 weeks
  const digest = await generateWeeklyDigest();
  const templatePerf = await getTemplatePerformanceSummary();

  // # Step 2: Gather recent content to avoid repetition
  const recentContent = await prisma.content.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      status: { in: ["posted", "approved", "pending"] },
    },
    select: {
      platform: true,
      contentType: true,
      title: true,
      hook: true,
      notes: true,
      engagementScore: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const recentSummary = recentContent.map((c) =>
    `${c.platform}/${c.contentType}: "${c.title}" (hook: "${c.hook?.slice(0, 60)}...") — engagement: ${c.engagementScore ?? "pending"}`
  ).join("\n");

  // # Step 3: Research current trends (real-time via Google Search)
  let trendInsights = "";
  try {
    const trendData = await callGeminiWithSearch(
      `What are the top 5 trending topics in career advice, job searching, resume writing, and hiring right now? Focus on: new hiring trends, viral career content on LinkedIn/TikTok, any breaking news about layoffs or hiring surges, new tools or regulations. Be specific with dates, numbers, and sources.`
    );
    trendInsights = trendData.text;
  } catch (err) {
    console.warn("[StrategyDirector] Trend research failed:", err);
    trendInsights = "Trend research unavailable this week.";
  }

  // # Step 4: Ask Gemini to act as Strategy Director
  const strategyPrompt = `You are Maya Chen, the Strategy Director for JobPilot AI's marketing team. You're a seasoned CMO who makes data-driven decisions about content strategy.

TODAY: ${new Date().toISOString().split("T")[0]} (planning content for the upcoming week)

## LAST WEEK'S PERFORMANCE
${digest}

## TEMPLATE VISUAL PERFORMANCE
${templatePerf}

## RECENT CONTENT (last 14 days — avoid repeating these topics/angles):
${recentSummary}

## CURRENT INDUSTRY TRENDS
${trendInsights}

## YOUR PLATFORMS
- LinkedIn: Professional audience, carousels get 11x reach, human-voiced content wins
- Twitter/X: Contrarian takes and data hooks, no hashtags, punchy threads
- Instagram: Saves are #1 signal, actionable carousels and tip cards dominate
- TikTok: #CareerTok 2B+ views, under-30s, pattern interrupts, specific results

## CONTENT PILLARS (choose distribution based on what's performing):
1. Career Tips — Resume, interview, salary, search strategies
2. AI in Hiring — ATS, AI screening, future of hiring
3. Product Showcases — JobPilot feature demos with real results
4. Industry Insights — Job market trends, salary data, skills demand
5. Motivation — Rejection handling, mindset, encouragement
6. Behind the Scenes — Building JobPilot, startup journey

## YOUR TASK
Create a strategic content plan for THIS WEEK. Make informed decisions:

1. PILLAR MIX: Based on last week's engagement data, which pillars should get more weight? Which should we reduce? Default is equal distribution, but shift based on performance. If a pillar is underperforming, consider new angles for it rather than just cutting it.

2. PLATFORM WEIGHTING: Which platforms should get more content this week? Consider where our audience is most responsive. Minimum 2 pieces per platform, maximum 4 for the best-performing platform.

3. TOPIC ANGLES: For each content piece, specify a UNIQUE angle that hasn't been covered recently. Reference specific trends, data points, or current events.

4. EXPERIMENTS: Include 1-2 experimental content pieces — try an angle, format, or pillar we haven't tested much. Mark these as "can_skip" priority so they don't block core content.

5. AVOID LIST: Topics that are oversaturated, recently covered, or trending negatively.

Return a JSON object:
{
  "calendar": [
    {
      "platform": "linkedin",
      "contentType": "carousel|single_image|post",
      "day": "Monday|Tuesday|...",
      "pillar": "pillar name",
      "topicAngle": "specific angle for this piece — reference trends or data",
      "tone": "authoritative|provocative|educational|motivational|data_driven|storytelling|casual",
      "priority": "must_post|can_skip"
    }
  ],
  "reasoning": "2-3 sentences explaining your strategic thinking for this week",
  "pillarMix": { "career_tips": 30, "ai_in_hiring": 20, ... },
  "platformWeighting": { "linkedin": 35, "instagram": 25, "tiktok": 25, "twitter": 15 },
  "avoidTopics": ["topic to avoid", ...],
  "experiments": ["experiment description", ...]
}

Generate 10-14 content pieces total. Return ONLY valid JSON.`;

  const raw = await callGemini(strategyPrompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Strategy Director returned no valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  // # Validate the calendar
  if (!parsed.calendar || !Array.isArray(parsed.calendar) || parsed.calendar.length === 0) {
    throw new Error("Strategy Director returned empty calendar");
  }

  // # Normalize calendar items
  const calendar: CalendarItem[] = parsed.calendar.map((item: any) => ({
    platform: String(item.platform || "linkedin"),
    contentType: String(item.contentType || "single_image"),
    day: String(item.day || "Monday"),
    pillar: String(item.pillar || "career_tips"),
    topicAngle: String(item.topicAngle || ""),
    tone: String(item.tone || "educational"),
    priority: item.priority === "can_skip" ? "can_skip" : "must_post",
  }));

  const plan: StrategicPlan = {
    calendar,
    reasoning: String(parsed.reasoning || ""),
    pillarMix: parsed.pillarMix || {},
    platformWeighting: parsed.platformWeighting || {},
    avoidTopics: Array.isArray(parsed.avoidTopics) ? parsed.avoidTopics.map(String) : [],
    experiments: Array.isArray(parsed.experiments) ? parsed.experiments.map(String) : [],
  };

  // # Save the plan to DB so the pipeline can use it
  await prisma.contentPlan.create({
    data: {
      weekOf: new Date().toISOString().split("T")[0],
      plan: JSON.stringify(calendar),
      status: "active",
    },
  });

  // # Deactivate any older plans
  await prisma.contentPlan.updateMany({
    where: {
      status: "active",
      createdAt: { lt: new Date(Date.now() - 60000) },
    },
    data: { status: "completed" },
  });

  console.log(`[StrategyDirector] Plan created: ${calendar.length} pieces, reasoning: ${plan.reasoning.slice(0, 100)}...`);

  return plan;
}
