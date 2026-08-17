/* ============================================================
   VISUAL DESIGNER AGENT V4 — Template-First Pipeline
   ============================================================
   # Render priority:
   #   1. HTML templates (Puppeteer) — primary for all social posts
   #   2. OpenAI gpt-image-1 — fallback if Puppeteer fails
   #   3. Canvas 2D — last resort (always works, no API needed)
   #   4. fal.ai Flux Pro — blog post covers ONLY
   #
   # The designer agent now calls Template Intelligence to pick
   # the best HTML template (t1-t96) for each slide, then maps
   # Gemini's output to TemplateContent format for rendering.
   ============================================================ */

import { callGemini } from "../gemini";
import { getDimensions, type SlideData, type SlideLayout } from "./types";
import { BRAND_NAME, BRAND_URL } from "./brand";
import { selectTemplate, slideToTemplateContent } from "./template-intelligence";
import type { TemplateId, TemplateContent } from "./templates/shared";
/* eslint-disable @typescript-eslint/no-explicit-any */

// # Valid Canvas 2D layouts — used as last-resort fallback
const VALID_LAYOUTS: SlideLayout[] = [
  "hero", "stat_card", "tip", "quote", "list", "cta",
  "before_after", "screenshot", "data_chart", "comparison",
  "numbered_steps", "gradient_text", "highlight_box",
  "split_image", "progress_bar",
];

// # Build an image prompt for OpenAI gpt-image-1 (fallback renderer)
// # Social platforms: branded slide with actual text content
// # Blog: editorial photography / illustration
function buildSlideImagePrompt(
  slide: { headline: string; body?: string; stat?: { value: string; label: string }; layout: string },
  platform: string,
  slideIndex: number,
  totalSlides: number,
): string {
  // # Blog covers — editorial imagery
  if (platform === "blog") {
    const topic = `${slide.headline} ${slide.body || ""}`;
    return `Professional blog cover image for an article about: ${topic}. Clean modern editorial photography or illustration. High quality, sharp, well-lit. Suitable for a career tech blog. No text overlay needed.`;
  }

  // # Social platforms — branded slides
  const parts: string[] = [];
  parts.push(`A professional branded social media slide. Dark background (#09090b to #18181b gradient). Clean sans-serif typography. Blue (#3b82f6) accent elements.`);

  if (slideIndex === 0) {
    parts.push(`Top-left: "${BRAND_NAME}" in small white text with a small blue wing icon beside it.`);
  }

  if (slide.stat) {
    parts.push(`Render this statistic very large and bold in white: "${slide.stat.value}". Below it in medium gray (#a1a1aa) text: "${slide.stat.label}".`);
  }

  if (slide.headline) {
    const size = slide.stat ? "medium-large" : "large";
    parts.push(`Render this headline in ${size} bold white text: "${slide.headline}".`);
  }

  if (slide.body) {
    parts.push(`Below the headline in smaller gray (#a1a1aa) text: "${slide.body}".`);
  }

  if (slideIndex === totalSlides - 1) {
    parts.push(`Include "${BRAND_URL}" as a prominent blue call-to-action. Below it: "Your AI Career Co-Pilot".`);
  }

  if (totalSlides > 1) {
    parts.push(`Top-right corner: small "${slideIndex + 1}/${totalSlides}" in muted text.`);
  }

  parts.push(`Clean spacing, subtle blue gradient accents or thin blue divider lines. No stock photos, no people, no hands, no generic AI imagery. This is a designed content slide, not a photograph.`);

  return parts.join(" ");
}

/* ---- Template Selection Result ---- */
/* # Stored alongside each slide so the pipeline knows what was picked */
export interface TemplateSelection {
  templateId: TemplateId;
  templateName: string;
  reasoning: string;
  templateContent: TemplateContent;
}

/* ---- Design Result ---- */
/* # Extended to include template selections for each slide */
export interface DesignResult {
  slides: SlideData[];
  caption: string;
  // # Template selections — one per slide, for HTML renderer
  templateSelections: (TemplateSelection | null)[];
}

/* ---- Main Designer Function ---- */

export async function designVisual(
  content: string,
  platform: string,
  contentType: string,
  mediaPrompt: string | null,
  topic?: string,
  pillar?: string,
): Promise<DesignResult> {
  const { width, height } = getDimensions(platform, contentType);
  const orientation = width > height ? "landscape" : width === height ? "square" : "portrait";
  const isSingleImage = contentType === "single_image" || contentType === "post";

  const slideCount = isSingleImage ? 1 : "4-6";

  // # Step 1: Generate structured slide data via Gemini
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
      "subheadline": "optional subtitle",
      "body": "15-30 word body text",
      "stat": { "value": "75%", "label": "of resumes rejected by ATS" },
      "bullets": ["item 1", "item 2"],
      "layout": "hero",
      "eyebrow": "optional category label",
      "beforeText": "bad example text (for comparison slides)",
      "afterText": "good example text (for comparison slides)",
      "steps": [{"number": 1, "title": "Step name", "detail": "brief detail"}],
      "bars": [{"label": "Category", "value": 85}],
      "tips": [{"title": "Tip name", "description": "brief description"}],
      "tags": ["keyword1", "keyword2"],
      "cta": "call to action text"
    }
  ],
  "caption": "Social media caption that complements the visuals (100-400 words for LinkedIn, 50-200 for Twitter, 100-300 for Instagram). Do NOT repeat slide text."
}

Return ONLY valid JSON.`;

  let raw = await callGemini(prompt);

  // # Parse response — retry once if JSON is malformed
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

  // # Step 2: Normalize slides and build both SlideData + TemplateContent
  const slides: SlideData[] = [];
  const templateSelections: (TemplateSelection | null)[] = [];

  for (let index = 0; index < parsed.slides.length; index++) {
    const slide = parsed.slides[index] as Record<string, unknown>;

    const layout = VALID_LAYOUTS.includes(slide.layout as SlideLayout)
      ? (slide.layout as SlideLayout)
      : "hero";

    // # Normalize to SlideData (used by OpenAI/Canvas fallbacks)
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
      aiImagePrompt: slide.imagePrompt
        ? String(slide.imagePrompt)
        : buildSlideImagePrompt(
            { headline: String(slide.headline || ""), body: slide.body ? String(slide.body) : undefined, stat: slide.stat as any, layout },
            platform,
            index,
            totalSlides,
          ),
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

    slides.push(normalized);

    // # Step 3: Select an HTML template for this slide (non-blog only)
    if (platform !== "blog") {
      try {
        // # Build the full content text for template matching
        const slideText = [normalized.headline, normalized.body, normalized.subheadline]
          .filter(Boolean).join(" ");

        const selection = await selectTemplate(
          platform,
          contentType,
          slideText,
          pillar,
          undefined,
        );

        // # Convert SlideData → TemplateContent for the HTML renderer
        const templateContent = slideToTemplateContent(normalized);

        // # Merge in Gemini's extra fields that slideToTemplateContent doesn't know about
        if (slide.eyebrow) templateContent.eyebrow = String(slide.eyebrow);
        if (slide.headlineHighlight) templateContent.headlineHighlight = String(slide.headlineHighlight);
        if (slide.bodyBold) templateContent.bodyBold = String(slide.bodyBold);
        if (slide.cta) templateContent.cta = String(slide.cta);
        if (slide.score !== undefined) templateContent.score = Number(slide.score);
        if (Array.isArray(slide.tags)) templateContent.tags = (slide.tags as unknown[]).map(String);
        if (Array.isArray(slide.annotations)) templateContent.annotations = slide.annotations as any;
        if (slide.methodName) templateContent.methodName = String(slide.methodName);
        if (slide.benchmarkAt !== undefined) templateContent.benchmarkAt = Number(slide.benchmarkAt);
        if (Array.isArray(slide.legend)) templateContent.legend = slide.legend as any;

        templateSelections.push({
          templateId: selection.templateId,
          templateName: selection.templateName,
          reasoning: selection.reasoning,
          templateContent,
        });

        console.log(`[Designer] Slide ${index + 1}: selected template ${selection.templateId} "${selection.templateName}" — ${selection.reasoning}`);
      } catch (err) {
        console.warn(`[Designer] Template selection failed for slide ${index + 1}, will use fallback:`, err);
        templateSelections.push(null);
      }
    } else {
      // # Blog covers don't use HTML templates
      templateSelections.push(null);
    }
  }

  return {
    slides,
    caption: parsed.caption ? String(parsed.caption) : "",
    templateSelections,
  };
}
