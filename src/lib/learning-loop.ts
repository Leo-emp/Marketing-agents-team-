/* ============================================================
   LEARNING LOOP — Performance Intelligence Engine
   ============================================================
   # Tracks what works across every marketing dimension and
   # generates a data-driven "playbook" that agent prompts
   # can reference for informed content decisions.
   #
   # Dimensions tracked:
   #   - Hook type (data hook, question, contrarian, scenario)
   #   - Content framework (PAS, AIDA, Contrarian Flip, etc.)
   #   - Content pillar (career tips, AI in hiring, etc.)
   #   - Template ID (t1-t96 visual templates)
   #   - Posting time (day of week, hour)
   #   - Platform (linkedin, twitter, instagram, tiktok)
   #   - Content type (carousel, single_image, post)
   #   - Tone (authoritative, provocative, educational, etc.)
   #
   # The playbook is regenerated weekly and injected into agent
   # prompts so every content decision is informed by data.
   ============================================================ */

import { prisma } from "./prisma";
import { callGemini } from "./gemini";

/* ---- Playbook Types ---- */
export interface Playbook {
  // # Generated timestamp
  generatedAt: string;
  // # Natural language summary for agent prompts
  summary: string;
  // # Dimension-specific insights
  insights: PlaybookInsight[];
  // # Template recommendations
  templateRecommendations: TemplateRecommendation[];
  // # Optimal posting schedule
  postingSchedule: PostingWindow[];
  // # Content experiments to try
  experimentsToRun: string[];
}

export interface PlaybookInsight {
  dimension: string;        // # "hook_type" | "framework" | "pillar" | "platform" | "content_type" | "tone"
  finding: string;          // # What the data shows
  recommendation: string;   // # What to do about it
  confidence: "high" | "medium" | "low";  // # Based on sample size
}

export interface TemplateRecommendation {
  templateId: string;
  platform: string;
  avgEngagement: number;
  recommendation: "increase" | "maintain" | "decrease" | "test_more";
}

export interface PostingWindow {
  platform: string;
  bestDay: string;
  bestHourUTC: number;
  avgEngagement: number;
}

/* ---- Data Collection ---- */
/* # Gathers all performance data from the last 30 days */
async function collectPerformanceData() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // # Fetch all posted content with engagement data
  const content = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: since },
    },
    select: {
      id: true,
      platform: true,
      contentType: true,
      agent: true,
      hook: true,
      title: true,
      body: true,
      notes: true,
      postedAt: true,
      engagementLikes: true,
      engagementComments: true,
      engagementShares: true,
      engagementSaves: true,
      engagementImpressions: true,
      engagementScore: true,
      editorialScore: true,
      editorialHookScore: true,
      editorialSpecScore: true,
      editorialBrandScore: true,
      editorialPlatformScore: true,
    },
    orderBy: { postedAt: "desc" },
  });

  // # Fetch visual/template data for these content pieces
  const contentIds = content.map((c) => c.id);
  const visuals = await prisma.visual.findMany({
    where: { contentId: { in: contentIds } },
    select: {
      contentId: true,
      templateId: true,
      data: true,
    },
  });

  // # Map contentId → templateId for quick lookup
  const templateMap = new Map<string, string>();
  for (const v of visuals) {
    if (v.contentId) templateMap.set(v.contentId, v.templateId);
  }

  return { content, templateMap };
}

/* ---- Analyze by Dimension ---- */
/* # Groups content by a dimension and calculates avg engagement */
function analyzeByDimension(
  content: { engagementScore: number | null; [key: string]: any }[],
  keyFn: (c: any) => string | null,
): { key: string; avgEngagement: number; count: number }[] {
  const groups = new Map<string, { total: number; count: number }>();

  for (const c of content) {
    if (!c.engagementScore || c.engagementScore <= 0) continue;
    const key = keyFn(c);
    if (!key) continue;

    const group = groups.get(key) || { total: 0, count: 0 };
    group.total += c.engagementScore;
    group.count += 1;
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, { total, count }]) => ({
      key,
      avgEngagement: total / count,
      count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/* ---- Hook Type Classifier ---- */
/* # Classifies a hook into categories based on text patterns */
function classifyHookType(hook: string | null): string | null {
  if (!hook) return null;
  const h = hook.toLowerCase();
  if (/\d+%|\d+x|\$[\d,]+/.test(hook)) return "data_hook";
  if (/\?$|\?["\s]/.test(hook)) return "question";
  if (/stop|wrong|myth|actually|don.t|never/.test(h)) return "contrarian";
  if (/story|happened|walked|called|received/.test(h)) return "scenario";
  if (/here.s|this is|the truth|fact:/.test(h)) return "declarative";
  if (/most people|everyone|nobody/.test(h)) return "universalizer";
  return "other";
}

/* ---- Extract Tone from Notes ---- */
/* # Reads the tone field from content notes JSON */
function extractTone(notes: string | null): string | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed.tone || null;
  } catch {
    return null;
  }
}

/* ---- Extract Pillar from Notes ---- */
function extractPillar(notes: string | null): string | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed.pillar || null;
  } catch {
    return null;
  }
}

/* ---- Main Playbook Generator ---- */
/* # Analyzes 30 days of data and generates the performance playbook */
export async function generatePlaybook(): Promise<Playbook> {
  console.log("[LearningLoop] Generating performance playbook...");

  const { content, templateMap } = await collectPerformanceData();

  if (content.length === 0) {
    console.log("[LearningLoop] No posted content with engagement data — returning empty playbook");
    return {
      generatedAt: new Date().toISOString(),
      summary: "PERFORMANCE PLAYBOOK: No engagement data available yet. Content has been generated but no performance metrics recorded. The system will learn as posts accumulate engagement data.",
      insights: [],
      templateRecommendations: [],
      postingSchedule: [],
      experimentsToRun: ["Try all content pillars evenly to establish baseline performance data"],
    };
  }

  // # Analyze every dimension
  const byPlatform = analyzeByDimension(content, (c) => c.platform);
  const byContentType = analyzeByDimension(content, (c) => c.contentType);
  const byHookType = analyzeByDimension(content, (c) => classifyHookType(c.hook));
  const byTone = analyzeByDimension(content, (c) => extractTone(c.notes));
  const byPillar = analyzeByDimension(content, (c) => extractPillar(c.notes));
  const byDay = analyzeByDimension(content, (c) => {
    if (!c.postedAt) return null;
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][c.postedAt.getDay()];
  });
  const byTemplate = analyzeByDimension(content, (c) => templateMap.get(c.id) || null);

  // # Build template recommendations
  const templateRecommendations: TemplateRecommendation[] = byTemplate.map((t) => ({
    templateId: t.key,
    platform: "all",
    avgEngagement: t.avgEngagement,
    recommendation: t.avgEngagement > 3 ? "increase" :
      t.count < 3 ? "test_more" :
      t.avgEngagement < 1 ? "decrease" : "maintain",
  }));

  // # Build posting schedule
  const postingSchedule: PostingWindow[] = byDay
    .filter((d) => d.count >= 2)
    .map((d) => ({
      platform: "all",
      bestDay: d.key,
      bestHourUTC: 14, // # Default — would need hourly data for precision
      avgEngagement: d.avgEngagement,
    }));

  // # Build insights
  const insights: PlaybookInsight[] = [];

  // # Platform insights
  if (byPlatform.length >= 2) {
    const best = byPlatform[0];
    const worst = byPlatform[byPlatform.length - 1];
    insights.push({
      dimension: "platform",
      finding: `${best.key} has the highest avg engagement (${best.avgEngagement.toFixed(1)}) while ${worst.key} has the lowest (${worst.avgEngagement.toFixed(1)})`,
      recommendation: `Increase content volume on ${best.key}. Experiment with new angles on ${worst.key}.`,
      confidence: best.count >= 5 ? "high" : "medium",
    });
  }

  // # Content type insights
  if (byContentType.length >= 2) {
    const best = byContentType[0];
    insights.push({
      dimension: "content_type",
      finding: `${best.key} content type performs best (avg ${best.avgEngagement.toFixed(1)}, ${best.count} posts)`,
      recommendation: `Prioritize ${best.key} format. Consider converting underperforming formats to ${best.key}.`,
      confidence: best.count >= 5 ? "high" : "medium",
    });
  }

  // # Hook type insights
  if (byHookType.length >= 2) {
    const best = byHookType[0];
    insights.push({
      dimension: "hook_type",
      finding: `"${best.key}" hooks drive the most engagement (avg ${best.avgEngagement.toFixed(1)})`,
      recommendation: `Lead with ${best.key} hooks when possible. The opening line determines 80% of engagement.`,
      confidence: best.count >= 3 ? "high" : "low",
    });
  }

  // # Pillar insights
  if (byPillar.length >= 2) {
    const best = byPillar[0];
    const worst = byPillar[byPillar.length - 1];
    insights.push({
      dimension: "pillar",
      finding: `"${best.key}" pillar outperforms (avg ${best.avgEngagement.toFixed(1)}). "${worst.key}" underperforms (avg ${worst.avgEngagement.toFixed(1)})`,
      recommendation: `Increase ${best.key} content. Find fresh angles for ${worst.key} or reduce its frequency.`,
      confidence: best.count >= 3 ? "medium" : "low",
    });
  }

  // # Template insights
  if (byTemplate.length >= 2) {
    const best = byTemplate[0];
    insights.push({
      dimension: "template",
      finding: `Template ${best.key} has the highest avg engagement (${best.avgEngagement.toFixed(1)})`,
      recommendation: `Use template ${best.key} more frequently. The visual design directly impacts engagement.`,
      confidence: best.count >= 3 ? "medium" : "low",
    });
  }

  // # Use Gemini to synthesize insights into a natural language summary
  const insightsSummary = insights.map((i) => `[${i.dimension}] ${i.finding} → ${i.recommendation} (${i.confidence} confidence)`).join("\n");
  const dataSummary = `
Platforms (by avg engagement): ${byPlatform.map((p) => `${p.key}: ${p.avgEngagement.toFixed(1)} (n=${p.count})`).join(", ")}
Content types: ${byContentType.map((c) => `${c.key}: ${c.avgEngagement.toFixed(1)} (n=${c.count})`).join(", ")}
Hook types: ${byHookType.map((h) => `${h.key}: ${h.avgEngagement.toFixed(1)} (n=${h.count})`).join(", ")}
Best posting days: ${byDay.slice(0, 3).map((d) => `${d.key}: ${d.avgEngagement.toFixed(1)}`).join(", ")}
Total posts analyzed: ${content.length}`;

  let summary: string;
  try {
    const summaryPrompt = `Synthesize this marketing performance data into a 3-4 sentence briefing for a content team. Be specific with numbers. Focus on the TOP actionable insight, the biggest opportunity, and one thing to stop doing. Write in direct, professional tone.

DATA:
${dataSummary}

INSIGHTS:
${insightsSummary}

Return ONLY the briefing text, no JSON, no headers.`;

    summary = await callGemini(summaryPrompt);
  } catch {
    // # Fallback to a simple summary
    summary = `PERFORMANCE PLAYBOOK (${content.length} posts analyzed): ${insights.slice(0, 3).map((i) => i.finding).join(". ")}`;
  }

  // # Identify experiments to run based on gaps in data
  const experimentsToRun: string[] = [];
  if (byHookType.length < 4) experimentsToRun.push("Test more hook types — data_hook, question, scenario, contrarian — to find what resonates");
  if (byPillar.length < 4) experimentsToRun.push("Cover all 6 pillars to establish baseline performance for each");
  const untestedTemplates = byTemplate.filter((t) => t.count < 2);
  if (untestedTemplates.length > 0) experimentsToRun.push(`Test templates with low usage: ${untestedTemplates.slice(0, 5).map((t) => t.key).join(", ")}`);

  const playbook: Playbook = {
    generatedAt: new Date().toISOString(),
    summary: `PERFORMANCE PLAYBOOK:\n${summary}`,
    insights,
    templateRecommendations,
    postingSchedule,
    experimentsToRun,
  };

  console.log(`[LearningLoop] Playbook generated: ${insights.length} insights, ${templateRecommendations.length} template recommendations`);

  return playbook;
}

/* ---- Get Playbook as Prompt Injection ---- */
/* # Formats the playbook as text to inject into agent prompts */
export async function getPlaybookForPrompt(): Promise<string> {
  try {
    const playbook = await generatePlaybook();
    const parts: string[] = [playbook.summary];

    if (playbook.insights.length > 0) {
      parts.push("\nKEY INSIGHTS:");
      for (const insight of playbook.insights.slice(0, 5)) {
        parts.push(`- [${insight.dimension}] ${insight.recommendation} (${insight.confidence} confidence)`);
      }
    }

    if (playbook.postingSchedule.length > 0) {
      parts.push(`\nBEST POSTING DAYS: ${playbook.postingSchedule.slice(0, 3).map((p) => `${p.bestDay} (avg ${p.avgEngagement.toFixed(1)})`).join(", ")}`);
    }

    if (playbook.experimentsToRun.length > 0) {
      parts.push(`\nEXPERIMENTS TO TRY: ${playbook.experimentsToRun.join("; ")}`);
    }

    return parts.join("\n");
  } catch (err) {
    console.warn("[LearningLoop] Failed to generate playbook:", err);
    return "PERFORMANCE PLAYBOOK: Unavailable this cycle. Use default content strategy.";
  }
}
