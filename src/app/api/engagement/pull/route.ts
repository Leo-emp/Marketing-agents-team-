/* ============================================================
   ENGAGEMENT PULL — /api/engagement/pull
   ============================================================
   GET: Cron-triggered daily at 8 AM UTC. Pulls engagement
   metrics from platform APIs for all posted content from the
   last 7 days and updates the Content records.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/notify-admin";

// # Composite score weights (same as /api/content/[id]/engagement)
const WEIGHTS = { likes: 1, comments: 3, shares: 4, saves: 5, impressions: 0.01 };

// # Compute composite engagement score
function computeScore(likes: number, comments: number, shares: number, saves: number, impressions: number): number {
  return likes * WEIGHTS.likes + comments * WEIGHTS.comments + shares * WEIGHTS.shares + saves * WEIGHTS.saves + impressions * WEIGHTS.impressions;
}

// # Load token from DB, fall back to env var
async function getToken(platform: string, envKey: string): Promise<string | null> {
  try {
    const cred = await prisma.platformCredential.findUnique({ where: { platform } });
    if (cred?.accessToken) return cred.accessToken;
  } catch { /* fall back */ }
  return process.env[envKey] || null;
}

// # Pull LinkedIn engagement via UGC Posts API
async function pullLinkedIn(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postId)}?count=0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      likes: data.likesSummary?.totalLikes || 0,
      comments: data.commentsSummary?.totalFirstLevelComments || 0,
      shares: data.shareCount || 0,
      impressions: 0,
    };
  } catch { return null; }
}

// # Pull X/Twitter engagement via Tweet Metrics v2
async function pullTwitter(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://api.x.com/2/tweets/${postId}?tweet.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const m = data.data?.public_metrics;
    if (!m) return null;
    return {
      likes: m.like_count || 0,
      comments: m.reply_count || 0,
      shares: m.retweet_count + (m.quote_count || 0),
      impressions: m.impression_count || 0,
    };
  } catch { return null; }
}

// # Pull Instagram engagement via Graph API insights
async function pullInstagram(postId: string, token: string): Promise<{ likes: number; comments: number; saves: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(postId)}?fields=like_count,comments_count,insights.metric(saved,impressions)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    let saves = 0;
    let impressions = 0;
    if (data.insights?.data) {
      for (const insight of data.insights.data) {
        if (insight.name === "saved") saves = insight.values?.[0]?.value || 0;
        if (insight.name === "impressions") impressions = insight.values?.[0]?.value || 0;
      }
    }
    return {
      likes: data.like_count || 0,
      comments: data.comments_count || 0,
      saves,
      impressions,
    };
  } catch { return null; }
}

// # Pull TikTok engagement via Content Stats API
async function pullTikTok(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filters: { video_ids: [postId] },
        fields: ["like_count", "comment_count", "share_count", "view_count"],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const video = data.data?.videos?.[0];
    if (!video) return null;
    return {
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      impressions: video.view_count || 0,
    };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  // # Cron auth — same pattern as scheduler
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

  // # Find all posted content from the last 7 days with a platformPostId
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: sevenDaysAgo },
      platformPostId: { not: null },
    },
  });

  if (posts.length === 0) {
    return NextResponse.json({ updated: 0, message: "No recent posts to pull metrics for" });
  }

  // # Load platform tokens
  const tokens: Record<string, string | null> = {
    linkedin: await getToken("linkedin", "LINKEDIN_ACCESS_TOKEN"),
    twitter: await getToken("twitter", "TWITTER_BEARER_TOKEN"),
    instagram: await getToken("instagram", "INSTAGRAM_ACCESS_TOKEN"),
    tiktok: await getToken("tiktok", "TIKTOK_ACCESS_TOKEN"),
  };

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const token = tokens[post.platform];
    if (!token || !post.platformPostId) {
      skipped++;
      continue;
    }

    let metrics: { likes: number; comments: number; shares?: number; saves?: number; impressions: number } | null = null;

    // # Pull metrics based on platform
    switch (post.platform) {
      case "linkedin":
        metrics = await pullLinkedIn(post.platformPostId, token);
        break;
      case "twitter":
        metrics = await pullTwitter(post.platformPostId, token);
        break;
      case "instagram":
        metrics = await pullInstagram(post.platformPostId, token);
        break;
      case "tiktok":
        metrics = await pullTikTok(post.platformPostId, token);
        break;
    }

    if (metrics) {
      const likes = metrics.likes;
      const comments = metrics.comments;
      const shares = metrics.shares || 0;
      const saves = metrics.saves || 0;
      const impressions = metrics.impressions;
      const score = computeScore(likes, comments, shares, saves, impressions);

      await prisma.content.update({
        where: { id: post.id },
        data: {
          engagementLikes: likes,
          engagementComments: comments,
          engagementShares: shares,
          engagementSaves: saves,
          engagementImpressions: impressions,
          engagementScore: score,
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ updated, skipped, total: posts.length });
}
