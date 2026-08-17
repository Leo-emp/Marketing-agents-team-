/* ============================================================
   TREND RADAR — Reactive Content Intelligence
   ============================================================
   # Monitors the career/hiring industry for viral moments,
   # breaking news, and trending topics. When it detects a
   # high-opportunity trend, it auto-drafts reactive content
   # and queues it as "pending" for admin review.
   #
   # This runs as a cron job (e.g., every 6 hours) and acts
   # like a newsroom editor scanning for breaking stories.
   #
   # Key behaviors:
   #   - Uses Google Search grounding for real-time trend data
   #   - Filters for topics relevant to JobPilot's audience
   #   - Avoids trend fatigue (won't re-draft covered topics)
   #   - Creates platform-appropriate content for fastest reach
   #   - Tags content as "trend_reactive" for performance tracking
   ============================================================ */

import { prisma } from "./prisma";
import { callGemini, callGeminiWithSearch } from "./gemini";
import { reviewContent } from "./editorial";

/* ---- Trend Detection ---- */
export interface DetectedTrend {
  topic: string;
  urgency: "breaking" | "trending" | "emerging";
  relevance: number;        // # 1-10 scale for JobPilot audience fit
  viralPotential: number;   // # 1-10 scale for engagement likelihood
  angle: string;            // # Specific content angle to take
  platforms: string[];       // # Best platforms for this trend
  source: string;            // # Where the trend was detected
}

/* ---- Scan for Trends ---- */
/* # Queries Google Search grounding for real-time career/hiring trends */
export async function scanForTrends(): Promise<DetectedTrend[]> {
  console.log("[TrendRadar] Scanning for trends...");

  // # Parallel search across multiple angles
  const queries = [
    "viral career advice LinkedIn TikTok today this week",
    "breaking news hiring layoffs tech jobs today",
    "trending resume job search advice social media today",
    "new hiring tools AI recruitment news this week",
  ];

  // # Run searches in sequence to avoid rate limits
  const searchResults: string[] = [];
  for (const query of queries) {
    try {
      const result = await callGeminiWithSearch(query);
      searchResults.push(result.text);
    } catch (err) {
      console.warn(`[TrendRadar] Search failed for "${query}":`, err);
    }
  }

  if (searchResults.length === 0) {
    console.log("[TrendRadar] No search results — skipping trend detection.");
    return [];
  }

  // # Get recently covered topics to avoid duplication
  const recentContent = await prisma.content.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      status: { in: ["posted", "approved", "pending"] },
    },
    select: { title: true, hook: true },
    take: 20,
  });

  const recentTopics = recentContent
    .map((c) => `${c.title} — ${c.hook?.slice(0, 50)}`)
    .join("\n");

  // # Ask Gemini to identify actionable trends
  const trendPrompt = `You are a trend detection agent for JobPilot AI, a career tech platform. Analyze these search results and identify actionable trends for our content.

SEARCH RESULTS:
${searchResults.join("\n\n---\n\n")}

RECENTLY COVERED TOPICS (DO NOT re-suggest these):
${recentTopics}

OUR AUDIENCE: Job seekers, career changers, recent graduates, international professionals

IDENTIFY 0-5 trends worth creating reactive content for. Each trend must be:
1. RELEVANT to job seekers/career professionals (not general tech news unless it affects hiring)
2. TIMELY — happening now or very recent (not evergreen topics)
3. SPECIFIC enough to create a unique content angle (not just "resume tips")
4. NOT already covered in our recent content

Return a JSON array (empty if no actionable trends found):
[
  {
    "topic": "what the trend is about",
    "urgency": "breaking|trending|emerging",
    "relevance": 8,
    "viralPotential": 7,
    "angle": "the specific angle we should take — reference data or a contrarian view",
    "platforms": ["linkedin", "twitter"],
    "source": "where this trend was detected"
  }
]

Return ONLY valid JSON. If nothing is trending enough, return [].`;

  const raw = await callGemini(trendPrompt);
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const trends = JSON.parse(jsonMatch[0]) as DetectedTrend[];
    // # Filter for high-relevance, high-potential trends only
    return trends.filter((t) => t.relevance >= 6 && t.viralPotential >= 5);
  } catch {
    console.warn("[TrendRadar] Failed to parse trends JSON");
    return [];
  }
}

/* ---- Draft Reactive Content ---- */
/* # Creates content for a detected trend and queues it as pending */
async function draftReactiveContent(trend: DetectedTrend): Promise<string | null> {
  // # Pick the best platform for this trend
  const platform = trend.platforms[0] || "linkedin";

  // # Determine content type based on platform and urgency
  const contentType = trend.urgency === "breaking"
    ? "single_image"      // # Fast — single image for speed
    : "single_image";     // # Single image for most reactive content

  const draftPrompt = `You are a senior content strategist for JobPilot AI (jobpilotai.co). A trending topic has been detected and you need to draft reactive content FAST.

TREND: ${trend.topic}
ANGLE: ${trend.angle}
URGENCY: ${trend.urgency}
PLATFORM: ${platform}
SOURCE: ${trend.source}

Create a ${contentType} post for ${platform} about this trend. Your content must:
1. Be SPECIFIC to this trend — reference the actual event, data point, or development
2. Add JobPilot's expert perspective — what does this mean for job seekers?
3. Be immediately actionable — what should readers DO in response?
4. Zero emojis, professional tone, human-voiced
5. If mentioning JobPilot, max 1x and only if naturally relevant
6. Lead with the most attention-grabbing fact or angle

Return JSON:
{
  "title": "internal label for this content",
  "body": "full post content",
  "hook": "the scroll-stopping first line",
  "hashtags": "relevant,hashtags,comma,separated",
  "mediaPrompt": "what the accompanying image should show"
}

Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(draftPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // # Editorial review
    const review = await reviewContent(
      parsed.body,
      platform,
      contentType,
      parsed.hook || ""
    );

    const finalBody = review.passed ? review.revisedContent : parsed.body;
    const finalHook = review.passed ? review.revisedHook : (parsed.hook || "");

    // # Save as pending content
    const content = await prisma.content.create({
      data: {
        agent: "trend-radar",
        platform,
        contentType,
        title: parsed.title || `Trend: ${trend.topic.slice(0, 50)}`,
        body: finalBody,
        hook: finalHook,
        captionText: finalBody,
        hashtags: parsed.hashtags || null,
        mediaPrompt: parsed.mediaPrompt || null,
        status: "pending",
        editorialScore: review.score,
        editorialFeedback: review.feedback,
        editorialHookScore: review.hookScore,
        editorialSpecScore: review.specScore,
        editorialBrandScore: review.brandScore,
        editorialPlatformScore: review.platformScore,
        notes: JSON.stringify({
          generatedBy: "trend-radar",
          trend: trend.topic,
          urgency: trend.urgency,
          relevance: trend.relevance,
          viralPotential: trend.viralPotential,
          angle: trend.angle,
          source: trend.source,
        }),
      },
    });

    console.log(`[TrendRadar] Drafted reactive content: "${parsed.title}" for ${platform} (ID: ${content.id})`);
    return content.id;
  } catch (err) {
    console.error(`[TrendRadar] Failed to draft content for trend "${trend.topic}":`, err);
    return null;
  }
}

/* ---- Main Radar Function ---- */
/* # Called by cron — scans for trends and drafts content for the best ones */
export async function runTrendRadar(): Promise<{
  trendsDetected: number;
  contentDrafted: number;
  trends: DetectedTrend[];
}> {
  const trends = await scanForTrends();

  if (trends.length === 0) {
    console.log("[TrendRadar] No actionable trends detected.");
    return { trendsDetected: 0, contentDrafted: 0, trends: [] };
  }

  console.log(`[TrendRadar] Detected ${trends.length} actionable trend(s)`);

  // # Sort by urgency × relevance × viralPotential — draft the top ones
  const sorted = [...trends].sort((a, b) => {
    const urgencyScore = { breaking: 3, trending: 2, emerging: 1 };
    const scoreA = (urgencyScore[a.urgency] || 1) * a.relevance * a.viralPotential;
    const scoreB = (urgencyScore[b.urgency] || 1) * b.relevance * b.viralPotential;
    return scoreB - scoreA;
  });

  // # Draft content for top 3 trends max (avoid flooding the queue)
  let contentDrafted = 0;
  const maxDrafts = 3;

  for (const trend of sorted.slice(0, maxDrafts)) {
    const contentId = await draftReactiveContent(trend);
    if (contentId) contentDrafted++;
  }

  console.log(`[TrendRadar] Scan complete: ${trends.length} trends, ${contentDrafted} content pieces drafted`);

  return { trendsDetected: trends.length, contentDrafted, trends: sorted };
}
