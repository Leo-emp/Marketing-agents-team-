/* ============================================================
   BLOG PUBLISH — /api/blog/publish
   ============================================================
   POST: Called when a blog_article Content item is approved.
   Pushes the article to the main app (jobpilotai.co) via its
   internal API, marks the content record as "posted", and
   creates social share posts (LinkedIn + Twitter) in the
   content queue as "pending" for the scheduler to auto-post.

   Auth: Admin session cookie (same pattern as all dashboard routes)
   Body: { contentId: string }
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { isAdmin, unauthorized } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  // # Admin-only — must have a valid marketing-session cookie
  if (!(await isAdmin())) return unauthorized();

  // # Parse the request body
  const body = await req.json().catch(() => null);
  if (!body || !body.contentId) {
    return NextResponse.json({ error: "contentId is required" }, { status: 400 });
  }
  const { contentId } = body as { contentId: string };

  // # Fetch the Content record from the DB
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.contentType !== "blog_article") {
    return NextResponse.json({ error: "Blog article not found" }, { status: 404 });
  }

  // # Parse slug + read-time + category from the notes JSON field
  // # These are stored by blog-writer.ts as: { slug, category, readTime, tags }
  let meta: { slug?: string; category?: string; readTime?: string; tags?: string } = {};
  try {
    meta = JSON.parse(content.notes || "{}");
  } catch {
    // # Malformed notes JSON — proceed without metadata
  }

  // # Parse metaTitle and metaDescription from researchBrief JSON field
  // # Stored by blog-writer.ts as: { topic, reasoning, slug, category, readTime, metaTitle, metaDescription }
  let briefMeta: { metaTitle?: string; metaDescription?: string } = {};
  try {
    const brief = JSON.parse(content.researchBrief || "{}");
    briefMeta = {
      metaTitle: brief.metaTitle,
      metaDescription: brief.metaDescription,
    };
  } catch {
    // # Malformed researchBrief JSON — proceed without SEO meta fields
  }

  // # Slug is required to publish — it forms the blog URL path
  const slug = meta.slug;
  if (!slug) {
    return NextResponse.json(
      { error: "Article is missing slug in notes — cannot publish without a URL path" },
      { status: 400 }
    );
  }

  // # Env vars required to push to the main app
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;
  if (!apiUrl || !apiSecret) {
    return NextResponse.json(
      { error: "JOBPILOT_API_URL or JOBPILOT_API_SECRET not configured" },
      { status: 500 }
    );
  }

  // # -------------------------------------------------------
  // # Step 1: Push the article to the main app
  // # POST to jobpilotai.co/api/internal/blog-posts
  // # -------------------------------------------------------
  const publishRes = await fetch(`${apiUrl}/api/internal/blog-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // # Shared secret — main app verifies this before accepting the post
      Authorization: `Bearer ${apiSecret}`,
    },
    body: JSON.stringify({
      slug,
      title: content.title,
      // # captionText holds the 30-word excerpt written by the blog-writer agent
      excerpt: content.captionText || "",
      // # body holds the full markdown article (post editorial review)
      content: content.body,
      category: meta.category || "Career Advice",
      // # tags: comma-separated SEO tags stored in hashtags field by blog-writer
      tags: meta.tags || null,
      // # SEO meta fields from the researchBrief JSON
      metaTitle: briefMeta.metaTitle || null,
      metaDescription: briefMeta.metaDescription || null,
      // # Cover image: base64 data URL or CDN URL depending on generation path
      coverImageUrl: content.imageUrl || null,
      readTime: meta.readTime || "2 min read",
    }),
    // # no-store: bypass any fetch cache — we always want a fresh POST
    cache: "no-store",
  });

  if (!publishRes.ok) {
    // # Main app rejected the publish — return its error to the admin dashboard
    const err = await publishRes.json().catch(() => ({ error: "Unknown error from main app" }));
    return NextResponse.json(
      { error: `Failed to publish to main app: ${err.error || publishRes.statusText}` },
      { status: publishRes.status }
    );
  }

  // # -------------------------------------------------------
  // # Step 2: Mark the content record as "posted"
  // # -------------------------------------------------------
  await prisma.content.update({
    where: { id: contentId },
    data: {
      status: "posted",
      postedAt: new Date(),
    },
  });

  // # -------------------------------------------------------
  // # Step 3: Generate social share posts for LinkedIn + Twitter
  // # Each is queued as "pending" so the scheduler can auto-post
  // # them at the right time — not immediately
  // # -------------------------------------------------------
  const blogUrl = `https://jobpilotai.co/blog/${slug}`;
  const platforms = ["linkedin", "twitter"] as const;

  // # Track how many social posts were created successfully
  let socialSharesCreated = 0;

  for (const platform of platforms) {
    try {
      // # Build the UTM-tagged link for this platform
      const utmLink = `${blogUrl}?utm_source=${platform}&utm_medium=social&utm_campaign=blog-${slug}`;

      // # Ask Gemini to write a platform-appropriate teaser for this article
      const teaserPrompt = `Write a ${
        platform === "twitter"
          ? "tweet (under 250 characters, not counting the URL)"
          : "LinkedIn post (2-3 punchy sentences)"
      } promoting this blog article. Do NOT include the link yet — I will append it.

ARTICLE TITLE: ${content.title}
ARTICLE EXCERPT: ${content.captionText || ""}

Rules:
- Hook the reader with a surprising insight or question from the article
- Do NOT use emojis
- Do NOT start with "In today's...", "Are you...", "Have you ever...", or similar clichéd openers
- Write in a confident, direct tone — expert career advisor sharing real insights
- ${platform === "twitter" ? "Keep under 250 characters — leave room for the URL" : "Keep to 2-3 sentences maximum"}

Return ONLY the post text, nothing else. No quotes, no preamble.`;

      const teaser = await callGemini(teaserPrompt);

      // # Trim whitespace and append the UTM link on a new line
      const trimmedTeaser = teaser.trim();
      const postBody = `${trimmedTeaser}\n\n${utmLink}`;

      // # Create a new Content record for the social post
      // # status "pending" means admin must approve before the scheduler sends it
      await prisma.content.create({
        data: {
          agent: "blog-writer",            // # Same agent persona as the article
          platform,                        // # "linkedin" or "twitter"
          contentType: "post",             // # Standard short-form post
          title: `[Blog Share] ${content.title}`,
          body: postBody,                  // # Teaser text + UTM link
          status: "pending",               // # Admin approves before scheduler posts
          imageUrl: content.imageUrl || null, // # Share the cover image
          // # Store metadata linking back to the source article
          researchBrief: JSON.stringify({
            blogSlug: slug,
            blogTitle: content.title,
            sourceContentId: contentId,
          }),
        },
      });

      socialSharesCreated++;
    } catch (err) {
      // # Social share failure must NOT block the main publish response
      // # The article is already published — social shares are best-effort
      console.error(`[BlogPublish] Failed to create ${platform} share post:`, err);
    }
  }

  // # All done — return summary to the admin dashboard
  return NextResponse.json({
    published: true,
    slug,
    blogUrl,
    socialSharesCreated,
  });
}
