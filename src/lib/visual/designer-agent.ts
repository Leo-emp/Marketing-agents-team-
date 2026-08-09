/* ============================================================
   VISUAL DESIGNER AGENT V3 — Content-Only Output
   ============================================================
   Takes generated text content and produces structured SlideData.
   Every slide gets an aiImagePrompt — OpenAI gpt-image-1 renders
   all slides with full creative freedom. Canvas 2D is only used
   if OpenAI fails (automatic fallback in the visual route).
   ============================================================ */

import { callGemini } from "../gemini";
import { getDimensions, type SlideData, type SlideLayout } from "./types";
import { BRAND_NAME, BRAND_URL } from "./brand";
/* eslint-disable @typescript-eslint/no-explicit-any */

// # Valid layouts — used for Canvas 2D fallback rendering
const VALID_LAYOUTS: SlideLayout[] = [
  "hero", "stat_card", "tip", "quote", "list", "cta",
  "before_after", "screenshot", "data_chart", "comparison",
  "numbered_steps", "gradient_text", "highlight_box",
  "split_image", "progress_bar",
];

// # Build an image prompt for AI rendering (Flux Pro / GPT-image-1)
// # Social platforms: branded slide with actual text content about JobPilot AI
// # Blog: can use scenic/editorial imagery
function buildSlideImagePrompt(
  slide: { headline: string; body?: string; stat?: { value: string; label: string }; layout: string },
  platform: string,
  slideIndex: number,
  totalSlides: number,
): string {
  // # Blog covers — editorial imagery is fine
  if (platform === "blog") {
    const topic = `${slide.headline} ${slide.body || ""}`;
    return `Professional blog cover image for an article about: ${topic}. Clean modern editorial photography or illustration. High quality, sharp, well-lit. Suitable for a career tech blog. No text overlay needed.`;
  }

  // # Social platforms — branded slides with intentional content text
  const parts: string[] = [];

  parts.push(`A professional branded social media slide. Dark background (#09090b to #18181b gradient). Clean sans-serif typography. Blue (#3b82f6) accent elements.`);

  // # Brand element on first slide
  if (slideIndex === 0) {
    parts.push(`Top-left: "${BRAND_NAME}" in small white text with a small blue wing icon beside it.`);
  }

  // # Stat prominently if present
  if (slide.stat) {
    parts.push(`Render this statistic very large and bold in white: "${slide.stat.value}". Below it in medium gray (#a1a1aa) text: "${slide.stat.label}".`);
  }

  // # Headline — always present
  if (slide.headline) {
    const size = slide.stat ? "medium-large" : "large";
    parts.push(`Render this headline in ${size} bold white text: "${slide.headline}".`);
  }

  // # Body text
  if (slide.body) {
    parts.push(`Below the headline in smaller gray (#a1a1aa) text: "${slide.body}".`);
  }

  // # CTA slide
  if (slideIndex === totalSlides - 1) {
    parts.push(`Include "${BRAND_URL}" as a prominent blue call-to-action. Below it: "Your AI Career Co-Pilot".`);
  }

  // # Slide counter for carousels
  if (totalSlides > 1) {
    parts.push(`Top-right corner: small "${slideIndex + 1}/${totalSlides}" in muted text.`);
  }

  parts.push(`Clean spacing, subtle blue gradient accents or thin blue divider lines. No stock photos, no people, no hands, no generic AI imagery. This is a designed content slide, not a photograph.`);

  return parts.join(" ");
}

/* ---- Main Designer Function ---- */

export async function designVisual(
  content: string,
  platform: string,
  contentType: string,
  mediaPrompt: string | null,
  topic?: string
): Promise<{ slides: SlideData[]; caption: string }> {
  const { width, height } = getDimensions(platform, contentType);
  const orientation = width > height ? "landscape" : width === height ? "square" : "portrait";
  const isSingleImage = contentType === "single_image" || contentType === "post";

  // # Determine slide count based on content type
  const slideCount = isSingleImage ? 1 : contentType === "reel_script" ? "4-6" : "4-6";

  const prompt = `You are a content strategist for ${BRAND_NAME}, a premium career tech platform. Extract the key messages from this content and structure them for a visual post.

CONTENT TO STRUCTURE:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
FORMAT: ${contentType} (${orientation}, ${width}x${height}px)

TASK:
${isSingleImage
  ? `Extract the single most impactful message from this content. Return exactly 1 slide with a punchy headline (5-12 words) and optional body text (15-30 words).`
  : `Break this content into ${slideCount} slides. Rules:
- Slide 1: Bold hook headline that stops the scroll (5-12 words)
- Middle slides: One key insight per slide with headline + body text
- Last slide: Call-to-action mentioning ${BRAND_URL}
- Each slide headline: 5-12 words, punchy and specific
- Each slide body: 15-30 words of supporting detail (optional but preferred)
- Include stat data when the content contains numbers`}

Choose a layout type for each slide from: hero, stat_card, tip, quote, list, cta, before_after, comparison, numbered_steps, gradient_text, highlight_box.

Return a JSON object:
{
  "slides": [
    {
      "headline": "5-12 word punchy headline",
      "body": "15-30 word body text",
      "stat": { "value": "75%", "label": "of resumes rejected by ATS" },
      "bullets": ["item 1", "item 2"],
      "layout": "hero",
      "imagePrompt": "${platform === "blog"
        ? "For blog covers: describe a scenic/editorial image that fits the article topic. Can include photography, illustrations, or abstract visuals. Example: 'Aerial view of a modern city skyline at golden hour, warm tones, editorial magazine quality'"
        : "For social slides: describe a BRANDED SLIDE DESIGN with the EXACT text to render on a dark background. Include: the headline text in large bold white, body text in smaller gray, stat numbers extra large, blue (#3b82f6) accents, JobPilot AI branding. NO stock photos, NO people, NO hands — this is a designed content card. Example: 'Dark slide (#09090b). Large bold white text: YOUR RESUME IS INVISIBLE. Below in gray: 75% of resumes never reach a human. Blue accent divider line. Top-left: JobPilot AI with blue wing icon. Clean SaaS slide design.'"
      }"
    }
  ],
  "caption": "Social media caption that complements the visuals (100-400 words for LinkedIn, 50-200 for Twitter, 100-300 for Instagram). Do NOT repeat slide text."
}

Return ONLY valid JSON.`;

  let raw = await callGemini(prompt);

  // # Parse the response — retry once if JSON is malformed
  let parsed: { slides?: unknown[]; caption?: string };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (firstErr) {
    console.warn("[Visual Designer] First JSON parse failed, retrying:", firstErr);
    raw = await callGemini(
      `Your previous response was not valid JSON. Return ONLY a valid JSON object with "slides" array and "caption" string. No explanation, no markdown. The original request was:\n\n${prompt}`
    );
    const retryMatch = raw.match(/\{[\s\S]*\}/);
    if (!retryMatch) throw new Error("Visual designer returned no valid JSON after retry");
    parsed = JSON.parse(retryMatch[0]);
  }

  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("Visual designer returned empty or missing slides array");
  }

  const totalSlides = parsed.slides.length;

  // # Normalize slide data and auto-generate aiImagePrompt for every slide
  const slides: SlideData[] = (parsed.slides as Record<string, unknown>[]).map((slide, index) => {
    const layout = VALID_LAYOUTS.includes(slide.layout as SlideLayout)
      ? (slide.layout as SlideLayout)
      : "hero";

    const normalized: SlideData = {
      headline: String(slide.headline || ""),
      subheadline: slide.subheadline ? String(slide.subheadline) : undefined,
      body: slide.body ? String(slide.body) : undefined,
      stat: slide.stat && typeof slide.stat === "object"
        ? { value: String((slide.stat as any).value || ""), label: String((slide.stat as any).label || "") }
        : undefined,
      bullets: Array.isArray(slide.bullets)
        ? (slide.bullets as unknown[]).map(String)
        : undefined,
      footer: slide.footer ? String(slide.footer) : undefined,
      layout,
      slideNumber: index + 1,
      totalSlides,
      // # Prefer Gemini's imagePrompt, fall back to auto-generated branded prompt
      aiImagePrompt: slide.imagePrompt
        ? String(slide.imagePrompt)
        : buildSlideImagePrompt(
            { headline: String(slide.headline || ""), body: slide.body ? String(slide.body) : undefined, stat: slide.stat as any, layout },
            platform,
            index,
            totalSlides,
          ),
      // # Keep extended fields for Canvas 2D fallback
      beforeText: slide.beforeText ? String(slide.beforeText) : undefined,
      afterText: slide.afterText ? String(slide.afterText) : undefined,
      bars: Array.isArray(slide.bars)
        ? (slide.bars as { label: unknown; value: unknown; color?: unknown }[]).map((b) => ({ label: String(b.label || ""), value: Number(b.value) || 0, color: b.color ? String(b.color) : undefined }))
        : undefined,
      steps: Array.isArray(slide.steps)
        ? (slide.steps as { number: unknown; title: unknown; detail?: unknown }[]).map((s) => ({ number: Number(s.number) || 0, title: String(s.title || ""), detail: s.detail ? String(s.detail) : undefined }))
        : undefined,
      leftColumn: Array.isArray(slide.leftColumn) ? (slide.leftColumn as unknown[]).map(String) : undefined,
      rightColumn: Array.isArray(slide.rightColumn) ? (slide.rightColumn as unknown[]).map(String) : undefined,
      leftLabel: slide.leftLabel ? String(slide.leftLabel) : undefined,
      rightLabel: slide.rightLabel ? String(slide.rightLabel) : undefined,
    };

    return normalized;
  });

  return {
    slides,
    caption: parsed.caption ? String(parsed.caption) : "",
  };
}
