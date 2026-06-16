/* ============================================================
   VISUAL DESIGNER AGENT V2
   ============================================================
   Takes generated text content and produces structured SlideData
   for the visual renderer. Routes single images and hero slides
   to OpenAI gpt-image-1 via aiImagePrompt; inner carousel
   slides get bold colored backgrounds via Canvas 2D.
   Post-processes to enforce color rotation and content density.
   ============================================================ */

import { callGemini } from "../gemini";
import { getBackgroundPhoto } from "./pexels";
import { getDimensions, type SlideData, type SlideLayout } from "./types";
import { SLIDE_PALETTE } from "./brand";
/* eslint-disable @typescript-eslint/no-explicit-any */

// # Valid layouts for type-checking AI responses
const VALID_LAYOUTS: SlideLayout[] = [
  "hero", "stat_card", "tip", "quote", "list", "cta",
  "before_after", "screenshot", "data_chart", "comparison",
  "numbered_steps", "gradient_text", "highlight_box",
  "split_image", "progress_bar",
];

/* ---- Post-Processing ---- */

// # Ensure 80%+ of Canvas 2D slides have backgroundColor, no consecutive duplicates
function enforceColors(slides: SlideData[]): SlideData[] {
  let colorIdx = 0;
  let lastColor = "";

  return slides.map((slide) => {
    // # Skip slides rendered by OpenAI (they have aiImagePrompt)
    if (slide.aiImagePrompt) return slide;

    // # If no backgroundColor, assign one from palette
    if (!slide.backgroundColor) {
      let color = SLIDE_PALETTE[colorIdx % SLIDE_PALETTE.length];
      if (color === lastColor) {
        colorIdx++;
        color = SLIDE_PALETTE[colorIdx % SLIDE_PALETTE.length];
      }
      slide.backgroundColor = color;
      lastColor = color;
      colorIdx++;
      return slide;
    }

    // # Prevent consecutive duplicates
    if (slide.backgroundColor === lastColor) {
      colorIdx++;
      slide.backgroundColor = SLIDE_PALETTE[colorIdx % SLIDE_PALETTE.length];
    }
    lastColor = slide.backgroundColor;
    colorIdx++;
    return slide;
  });
}

// # Ensure content density — add body/subheadline if missing
function enforceContentDensity(slides: SlideData[]): SlideData[] {
  return slides.map((slide) => {
    const layout = slide.layout;

    // # Layouts that should always have a body or subheadline
    const needsBody = ["tip", "hero", "highlight_box", "split_image", "cta"];
    const needsSub = ["hero", "gradient_text", "quote"];

    if (needsBody.includes(layout) && !slide.body && slide.subheadline) {
      slide.body = slide.subheadline;
    }

    if (needsSub.includes(layout) && !slide.subheadline && slide.body) {
      slide.subheadline = slide.body;
    }

    return slide;
  });
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

  const prompt = `You are a premium visual content designer for JobPilot AI, a career tech platform. Convert written content into structured data for branded marketing images.

BRAND VISUAL IDENTITY:
- Bold colored backgrounds — vibrant, professional, white-text-safe
- Available palette: ${SLIDE_PALETTE.map((c, i) => `"${c}"`).join(", ")}
- Indigo (#6366f1) and violet (#8b5cf6) accent colors
- Clean, modern aesthetic — think premium marketing agency output
- High readability: large text, bold fonts, strong contrast
- Professional and trustworthy

AVAILABLE SLIDE LAYOUTS:
- "hero": Full-width bold headline. Best for: opening slides, bold claims, hooks.
- "stat_card": Massive centered number/statistic with label. Best for: data, metrics.
- "tip": Numbered tip with accent border, headline, and body. Best for: actionable advice.
- "quote": Large centered quote text with attribution. Best for: testimonials, insights.
- "list": Title with bullet items (3-6 items). Best for: lists, checklists.
- "cta": Call-to-action with brand logo and URL. Best for: final slides.
- "before_after": Side-by-side bad vs good comparison. Requires "beforeText" and "afterText". Best for: transformations.
- "screenshot": Fake tweet/DM/notification. Requires "screenshotType" and "screenshotAuthor". Best for: social proof.
- "data_chart": Horizontal bar chart. Requires "bars" array. Best for: survey data, comparisons.
- "comparison": Two-column pros/cons. Requires "leftColumn", "rightColumn", "leftLabel", "rightLabel". Best for: versus content.
- "numbered_steps": Step-by-step process. Requires "steps" array. Best for: tutorials, frameworks.
- "gradient_text": Large gradient headline, minimal design. Best for: powerful statements.
- "highlight_box": Key insight in highlighted card. Best for: takeaways.
- "split_image": Left accent panel + right text. Best for: data-driven points.
- "progress_bar": Multiple progress bars. Requires "bars" array. Best for: skill levels.

CONTENT TO CONVERT:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
CONTENT TYPE: ${contentType}
IMAGE DIMENSIONS: ${width}x${height}px (${orientation} format)

TASK:
${contentType === "carousel" ? `Create 7-10 slides for a carousel. Rules:
- Slide 1 MUST be "hero" layout (bold hook that stops the scroll)
- Last slide MUST be "cta" layout
- Middle slides: use at least 4 DIFFERENT layout types
- NO two consecutive slides should use the same layout
- Slide 1 (hero): include "aiImagePrompt" — a detailed prompt for AI image generation describing the ideal marketing visual for this hook slide. Describe the composition, mood, colors (indigo/violet brand), text placement, and any visual metaphors. This will be used to generate the hero image with AI.
- Slides 2 through last: include "backgroundColor" from the palette above. Vary colors — no two consecutive slides should have the same backgroundColor.
- Include "photoKeywords" on 2-3 slides (alongside backgroundColor) for a textured photo-tinted effect. Choose visually distinct, specific keywords.` : ""}
${isSingleImage ? `Create exactly 1 slide. This slide MUST include "aiImagePrompt" — a detailed prompt for AI image generation. Describe:
- The visual composition and layout
- Text to display prominently (the headline)
- Brand colors: indigo (#6366f1) and violet (#8b5cf6)
- Mood and atmosphere
- Any visual metaphors, icons, or decorative elements
- The platform (${platform}) and orientation (${orientation})
Choose the most impactful layout (hero, stat_card, quote, gradient_text).` : ""}
${contentType === "reel_script" ? `Create 4-6 storyboard frames. Use "hero" for hooks, "tip" for main points, "stat_card" for data, "cta" for ending. Include "backgroundColor" from the palette.` : ""}

CONTENT DENSITY RULES (CRITICAL — follow exactly):
1. Headline: 5-12 words — punchy and specific, not generic
2. Body: 15-30 words — REQUIRED for tip, hero, highlight_box, split_image, cta layouts
3. Subheadline: 8-15 words — REQUIRED for hero and gradient_text layouts
4. Bullets: 4-6 items of 5-10 words each for list layout
5. Steps: include both title AND detail for each step
6. Before/After: 15-25 words each side
7. Every slide must have the headline PLUS at least one supporting text field (body, subheadline, bullets, stat, etc.)

BACKGROUND RULES:
- 80%+ of Canvas 2D slides (non-aiImagePrompt) must have "backgroundColor"
- Use colors from the palette above — do NOT invent your own colors
- No two consecutive slides should have the same backgroundColor
- Include "photoKeywords" on 2-3 slides for texture variety

PHOTO KEYWORDS GUIDELINES (when used):
- Be specific and visual: "modern glass office building", "laptop coding dark room", "handshake business deal"
- NOT generic: avoid just "office", "business", "professional"
- Match the slide's topic and mood

Return a JSON object:
{
  "slides": [
    {
      "headline": "5-12 word punchy headline",
      "subheadline": "8-15 word supporting text",
      "body": "15-30 word body paragraph with real substance",
      "stat": { "value": "75%", "label": "description of the stat" },
      "bullets": ["5-10 word item 1", "5-10 word item 2"],
      "footer": "optional small text",
      "layout": "hero|stat_card|tip|quote|list|cta|...",
      "backgroundColor": "#hex from palette (for Canvas 2D slides)",
      "aiImagePrompt": "detailed AI image generation prompt (for OpenAI slides)",
      "photoKeywords": "specific stock photo search terms"
    }
  ],
  "caption": "The post caption that complements the visuals. 100-300 words for Instagram, 50-200 for Twitter, 100-400 for LinkedIn. Do NOT repeat slide text."
}

Include only fields relevant to each layout. Return ONLY valid JSON.`;

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

  // # Normalize and validate slide data
  const rawSlides = ((parsed.slides || []) as Record<string, unknown>[]).map((slide: Record<string, unknown>, index: number) => {
    const layout = VALID_LAYOUTS.includes(slide.layout as SlideLayout)
      ? (slide.layout as SlideLayout)
      : "hero";

    return {
      headline: String(slide.headline || ""),
      subheadline: slide.subheadline ? String(slide.subheadline) : undefined,
      body: slide.body ? String(slide.body) : undefined,
      stat: slide.stat && typeof slide.stat === "object"
        ? { value: String((slide.stat as Record<string, unknown>).value || ""), label: String((slide.stat as Record<string, unknown>).label || "") }
        : undefined,
      bullets: Array.isArray(slide.bullets)
        ? (slide.bullets as unknown[]).map((b: unknown) => String(b))
        : undefined,
      footer: slide.footer ? String(slide.footer) : undefined,
      layout,
      slideNumber: index + 1,
      totalSlides: (parsed.slides || []).length,
      backgroundColor: slide.backgroundColor ? String(slide.backgroundColor) : undefined,
      aiImagePrompt: slide.aiImagePrompt ? String(slide.aiImagePrompt) : undefined,
      photoKeywords: slide.photoKeywords ? String(slide.photoKeywords) : undefined,
      beforeText: slide.beforeText ? String(slide.beforeText) : undefined,
      afterText: slide.afterText ? String(slide.afterText) : undefined,
      screenshotType: slide.screenshotType ? String(slide.screenshotType) as SlideData["screenshotType"] : undefined,
      screenshotAuthor: slide.screenshotAuthor ? String(slide.screenshotAuthor) : undefined,
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
  });

  // # Post-process: enforce color rotation and content density
  let processedSlides = enforceColors(rawSlides);
  processedSlides = enforceContentDensity(processedSlides);

  // # Fetch stock photos for slides that have photoKeywords (and no aiImagePrompt)
  const slides: SlideData[] = await Promise.all(
    processedSlides.map(async (slide: SlideData) => {
      if (slide.photoKeywords && !slide.aiImagePrompt) {
        const photoUrl = await getBackgroundPhoto(slide.photoKeywords, width, height);
        if (photoUrl) {
          return { ...slide, backgroundImageUrl: photoUrl };
        }
      }
      return slide;
    })
  );

  return {
    slides,
    caption: parsed.caption ? String(parsed.caption) : "",
  };
}
