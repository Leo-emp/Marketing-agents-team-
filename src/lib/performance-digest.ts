/* ============================================================
   PERFORMANCE DIGEST — Weekly Analytics for Content Strategy
   ============================================================
   Generates a performance summary of the last week's content.
   Injected into the strategist agent's prompt during the Sunday
   night pipeline so the next week's plan learns from what
   actually worked.
   ============================================================ */

import { prisma } from "./prisma";

// # Generate a weekly performance digest for the strategist
export async function generateWeeklyDigest(): Promise<string> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // # Get all posted content from the last 7 days with engagement data
  const recentPosts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: oneWeekAgo },
      engagementScore: { not: null },
    },
    orderBy: { engagementScore: "desc" },
    select: {
      platform: true,
      contentType: true,
      title: true,
      body: true,
      hook: true,
      engagementScore: true,
      engagementLikes: true,
      engagementComments: true,
      engagementShares: true,
      engagementSaves: true,
      engagementImpressions: true,
    },
  });

  if (recentPosts.length === 0) {
    return "PERFORMANCE DIGEST: No posted content with engagement data from the past week. This is likely the first week — focus on quality and variety.";
  }

  // # Top 3 performers
  const top3 = recentPosts.slice(0, 3);
  const topSection = top3
    .map((p, i) => `  ${i + 1}. [${p.platform}/${p.contentType}] "${p.hook || p.title}" — score: ${p.engagementScore?.toFixed(1)} (${p.engagementLikes || 0} likes, ${p.engagementComments || 0} comments, ${p.engagementShares || 0} shares)`)
    .join("\n");

  // # Bottom 3 performers
  const bottom3 = recentPosts.slice(-3).reverse();
  const bottomSection = bottom3
    .map((p, i) => `  ${i + 1}. [${p.platform}/${p.contentType}] "${p.hook || p.title}" — score: ${p.engagementScore?.toFixed(1)}`)
    .join("\n");

  // # Platform averages
  const platformScores: Record<string, number[]> = {};
  for (const post of recentPosts) {
    if (!platformScores[post.platform]) platformScores[post.platform] = [];
    platformScores[post.platform].push(post.engagementScore || 0);
  }
  const platformAvg = Object.entries(platformScores)
    .map(([platform, scores]) => `  ${platform}: avg score ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} (${scores.length} posts)`)
    .join("\n");

  // # Content type performance
  const typeScores: Record<string, number[]> = {};
  for (const post of recentPosts) {
    if (!typeScores[post.contentType]) typeScores[post.contentType] = [];
    typeScores[post.contentType].push(post.engagementScore || 0);
  }
  const typeAvg = Object.entries(typeScores)
    .map(([type, scores]) => `  ${type}: avg score ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} (${scores.length} posts)`)
    .join("\n");

  // # Week-over-week trend
  const prevWeekPosts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
      engagementScore: { not: null },
    },
    select: { engagementScore: true },
  });

  let trendNote = "Not enough data for week-over-week comparison.";
  if (prevWeekPosts.length >= 3) {
    const thisWeekAvg = recentPosts.reduce((s, p) => s + (p.engagementScore || 0), 0) / recentPosts.length;
    const lastWeekAvg = prevWeekPosts.reduce((s, p) => s + (p.engagementScore || 0), 0) / prevWeekPosts.length;
    const change = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg * 100).toFixed(0);
    trendNote = `Week-over-week: ${Number(change) >= 0 ? "+" : ""}${change}% (this week avg: ${thisWeekAvg.toFixed(1)}, last week avg: ${lastWeekAvg.toFixed(1)})`;
  }

  return `LAST WEEK'S PERFORMANCE DIGEST:

TOP PERFORMERS:
${topSection}

LOWEST PERFORMERS:
${bottomSection}

PLATFORM AVERAGES:
${platformAvg}

CONTENT TYPE PERFORMANCE:
${typeAvg}

TREND: ${trendNote}

Use this data to inform your content strategy. Double down on what's working. Avoid patterns from the lowest performers.`;
}
