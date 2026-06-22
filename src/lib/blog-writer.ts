/* ============================================================
   BLOG WRITER AGENT - SEO Article Pipeline
   ============================================================
   Generates 200-400 word SEO blog articles for jobpilotai.co.
   Pipeline: topic discovery → write → cover image → editorial
   review → queue as Content record for admin approval.

   Key adaptations from original brief:
   - Uses renderSlideCanvas() (not renderSlide) — actual export name
   - renderSlideCanvas returns Buffer not string; stored as base64 data URL
   - SlideData has no width/height fields; dimensions passed to renderer directly
   - All Prisma Content model fields verified to exist
   ============================================================ */

import { callGemini } from "./gemini";
import { discoverTopic } from "./research";
import { reviewContent } from "./editorial";
import { designVisual } from "./visual/designer-agent";
import { renderSlideCanvas } from "./visual/canvas-renderer";
import { prisma } from "./prisma";
import { generateFalImage } from "./visual/fal-image";
import { uploadImage } from "./blob-storage";

// # Fixed categories matching the jobpilotai.co blog taxonomy
const CATEGORIES = [
  "Resume Tips", "Interview Prep", "LinkedIn", "Cover Letters",
  "Career Change", "Job Search", "Career Advice", "Networking",
];

// # Blog article shape parsed from Gemini response
interface BlogArticle {
  title: string;
  slug: string;
  content: string;         // # Full markdown body
  excerpt: string;         // # ~30 word summary for listing card
  category: string;
  tags: string;            // # Comma-separated SEO tags
  metaDescription: string; // # Under 160 chars for search results
  mediaPrompt: string;     // # Description for cover image generation
}

// # Fetch slugs from the main app to avoid publishing duplicate topics
async function getExistingSlugs(): Promise<string[]> {
  const apiUrl = process.env.JOBPILOT_API_URL;
  const apiSecret = process.env.JOBPILOT_API_SECRET;

  // # If env vars are not configured, skip duplicate check — non-fatal
  if (!apiUrl || !apiSecret) return [];

  try {
    const res = await fetch(`${apiUrl}/api/internal/blog-posts`, {
      headers: { Authorization: `Bearer ${apiSecret}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slugs || [];
  } catch {
    // # Network failure should not block article generation
    return [];
  }
}

// # Calculate estimated read time from word count (average 200 WPM)
function calcReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// # Main pipeline — discover topic → write article → generate cover → review → queue
export async function generateBlogArticle(): Promise<{
  drafted: boolean;
  contentId?: string;
  error?: string;
}> {
  // # Step 1: Discover a trending topic via real-time research
  // # discoverTopic returns { topic, reasoning, researchBrief }
  const { topic, reasoning, researchBrief } = await discoverTopic(
    "blog",
    "article",
    "expert career advisor"
  );

  // # Step 2: Fetch existing slugs to avoid duplicates in the blog
  const existingSlugs = await getExistingSlugs();

  // # Step 3: Generate the full article via Gemini
  const writePrompt = `You are a senior career content writer for JobPilot AI (jobpilotai.co), an all-in-one AI career platform.

TOPIC: ${topic}
REASONING: ${reasoning}

RESEARCH DATA:
${researchBrief.rawBrief}

EXISTING BLOG SLUGS (DO NOT duplicate these topics):
${existingSlugs.slice(-30).join(", ") || "none yet"}

WRITE A BLOG ARTICLE following these rules:

1. LENGTH: 200-400 words. Punchy, scannable, no padding. Every sentence earns its place.
2. TITLE: SEO-optimized with the target keyword near the front. Specific and compelling.
3. STRUCTURE: Use ## H2 and ### H3 headings for featured snippets. Short paragraphs (2-3 sentences max).
4. CONTENT:
   - One clear takeaway per section
   - At least 2 specific numbers, stats, or data points
   - One internal link to a JobPilot feature using markdown: [feature name](https://jobpilotai.co/features/...)
   - CTA at the end driving to a specific JobPilot tool
   - No fluff, no filler, no "In today's competitive..." openers
5. TONE: Expert career advisor sharing real insights. Confident, not salesy. No emojis.
6. SLUG: URL-friendly, lowercase, hyphens, no stop words. Must NOT be in the existing slugs list.
7. META DESCRIPTION: Under 160 characters, includes target keyword, compelling for search results.
8. CATEGORY: One of: ${CATEGORIES.join(", ")}
9. TAGS: 3-5 comma-separated SEO tags relevant to the article
10. MEDIA PROMPT: Describe a professional cover image (1200x630) for this article. Dark theme, space aesthetic, indigo/violet colors. Describe the composition, visual metaphor, and mood. This will be used to generate the cover image with AI.

Return a JSON object:
{
  "title": "The SEO-Optimized Title",
  "slug": "the-url-slug",
  "content": "## Full markdown article here...",
  "excerpt": "A ~30 word excerpt for the blog listing card.",
  "category": "One of the categories",
  "tags": "tag1, tag2, tag3",
  "metaDescription": "Under 160 char meta description",
  "mediaPrompt": "Description for cover image generation"
}

Return ONLY valid JSON.`;

  const raw = await callGemini(writePrompt);

  // # Extract JSON object from Gemini's response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { drafted: false, error: "Failed to parse article JSON from Gemini" };
  }

  let article: BlogArticle;
  try {
    article = JSON.parse(jsonMatch[0]);
  } catch {
    return { drafted: false, error: "Article JSON was malformed — could not parse" };
  }

  // # Validate category — fall back to generic if Gemini hallucinated a new one
  if (!CATEGORIES.includes(article.category)) {
    article.category = "Career Advice";
  }

  // # Validate slug uniqueness — append timestamp fragment if already taken
  if (existingSlugs.includes(article.slug)) {
    article.slug = `${article.slug}-${Date.now().toString(36)}`;
  }

  // # Step 4: Editorial review — max 2 passes to improve quality
  // # reviewContent returns { score, passed, feedback, revisedContent, revisedHook, issues }
  let finalContent = article.content;
  let editorialScore = 0;
  let editorialFeedback = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const review = await reviewContent(
      finalContent,
      "blog",
      "article",
      article.title // # Hook = article title for blog posts
    );

    editorialScore = review.score;
    editorialFeedback = review.feedback;

    // # Always use the revised content (editor improves even passing content)
    finalContent = review.revisedContent;

    if (review.passed) {
      // # Quality gate passed — stop iterating
      break;
    }
    // # Score below 7 — loop again with the revised content as input
  }

  // # Step 5: Generate cover image via fal.ai Flux Pro + Vercel Blob
  // # Three-tier fallback: fal.ai → Canvas 2D → skip
  // # Cover image failure must NOT block queuing
  let coverImageUrl: string | null = null;

  try {
    // # Try fal.ai Flux Pro first — best photorealistic quality for blog covers
    const falBuffer = await generateFalImage(
      article.mediaPrompt,
      1200,
      630,
      { model: "flux-pro" }
    );

    if (falBuffer) {
      // # Upload to Vercel Blob for a proper HTTPS URL (no more base64 data URLs)
      const filename = `blog-cover-${article.slug}.png`;
      coverImageUrl = await uploadImage(falBuffer, filename);
    } else {
      // # fal.ai failed — fall back to Canvas 2D via Visual Designer
      console.log("[BlogWriter] fal.ai failed, falling back to Canvas 2D cover");
      const { slides } = await designVisual(
        article.title,
        "blog",
        "single_image",
        article.mediaPrompt,
        topic
      );

      if (slides.length > 0) {
        const imageBuffer = await renderSlideCanvas(slides[0], 1200, 630);
        // # Try uploading Canvas 2D result to Blob too
        try {
          const filename = `blog-cover-${article.slug}.png`;
          coverImageUrl = await uploadImage(imageBuffer, filename);
        } catch {
          // # Blob upload failed — use base64 as last resort
          coverImageUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;
        }
      }
    }
  } catch (err) {
    console.error("[BlogWriter] Cover image generation failed:", err);
  }

  // # Step 6: Queue as Content record for admin review and approval
  const readTime = calcReadTime(finalContent);

  const content = await prisma.content.create({
    data: {
      // # Core identity fields
      agent: "blog-writer",      // # Which AI agent created this
      platform: "blog",          // # Target: jobpilotai.co/blog
      contentType: "blog_article", // # Content format identifier

      // # Content fields — all verified to exist in Content model
      title: article.title,        // # Internal label + SEO title
      body: finalContent,          // # Full markdown article (post-editorial)
      captionText: article.excerpt, // # 30-word excerpt for listing card
      hook: article.metaDescription, // # Meta description stored in hook field
      mediaPrompt: article.mediaPrompt, // # Prompt used to generate cover image
      imageUrl: coverImageUrl, // # HTTPS Blob URL of cover image (null if generation failed)
      hashtags: article.tags,      // # Comma-separated SEO tags

      // # Workflow fields
      status: "pending",           // # Awaits admin approval before publishing

      // # Editorial review results — Float? and String? confirmed in schema
      editorialScore,
      editorialFeedback,

      // # Research + blog-specific metadata stored in researchBrief JSON field
      researchBrief: JSON.stringify({
        topic,
        reasoning,
        slug: article.slug,
        category: article.category,
        readTime,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
      }),

      // # Additional blog metadata in notes field
      // # Includes slug (needed by main app when publishing) and category
      notes: JSON.stringify({
        slug: article.slug,
        category: article.category,
        readTime,
        tags: article.tags,
      }),
    },
  });

  return { drafted: true, contentId: content.id };
}
