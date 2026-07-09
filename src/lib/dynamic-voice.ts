/* ============================================================
   DYNAMIC VOICE SAMPLES — Performance-Driven Few-Shot Examples
   ============================================================
   Replaces static voice samples with real top-performing content
   from the database. Falls back to static samples when there
   isn't enough engagement data yet (first few weeks).
   ============================================================ */

import { prisma } from "./prisma";
import { getVoiceSamplesPrompt } from "./voice-samples";

/* eslint-disable @typescript-eslint/no-explicit-any */

// # Get top-performing content for a platform + content type combo
async function getTopPerformers(
  platform: string,
  contentType: string,
  limit: number = 3,
  daysBack: number = 30
): Promise<{ body: string; engagementScore: number; platform: string; contentType: string }[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const where: any = {
    status: "posted",
    engagementScore: { not: null, gt: 0 },
    postedAt: { gte: since },
  };
  // # Filter by platform if specified
  if (platform) where.platform = platform;
  // # Filter by content type if specified (but allow broad matches)
  if (contentType && contentType !== "post") where.contentType = contentType;

  const results = await prisma.content.findMany({
    where,
    orderBy: { engagementScore: "desc" },
    take: limit,
    select: {
      body: true,
      engagementScore: true,
      platform: true,
      contentType: true,
    },
  });

  return results.map((r) => ({
    body: r.body,
    engagementScore: r.engagementScore || 0,
    platform: r.platform,
    contentType: r.contentType,
  }));
}

// # Build voice samples from top performers for injection into agent prompts
// # Falls back to static samples when insufficient data
export async function buildDynamicVoiceSamples(
  platform: string,
  contentType: string
): Promise<string> {
  const topPosts = await getTopPerformers(platform, contentType);

  // # Not enough data yet — fall back to static voice samples
  if (topPosts.length < 2) {
    return getVoiceSamplesPrompt(platform);
  }

  // # Build few-shot examples from real top-performing content
  const examples = topPosts
    .map((post, i) => `EXAMPLE ${i + 1} (engagement score: ${post.engagementScore.toFixed(1)}):\n---\n${post.body}\n---`)
    .join("\n\n");

  return `VOICE REFERENCE — Your Best-Performing ${platform.toUpperCase()} Content:
Here are your top-performing posts on ${platform} from the last 30 days. Study what made them work — the hooks, the specificity, the tone. Write content at this quality level or better.

${examples}

Use these as style references, not templates. Match the energy and specificity, but create original content.`;
}
