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

// # Build a scene-descriptive prompt for AI image generation (fal.ai Flux)
// # Flux models render photorealistic scenes — they cannot render text
// # So the prompt describes a VISUAL SCENE that supports the content topic
function buildSlideImagePrompt(
  slide: { headline: string; body?: string; stat?: { value: string; label: string }; layout: string },
  platform: string,
  mediaPrompt?: string | null,
): string {
  // # Use the content creator's mediaPrompt as the base if available
  if (mediaPrompt) {
    return `${mediaPrompt}. Professional photography style, high quality, clean modern aesthetic, sharp focus, natural lighting. For ${platform} marketing.`;
  }

  // # Auto-derive a scene from the headline/body topic keywords
  const topicText = `${slide.headline} ${slide.body || ""}`.toLowerCase();

  // # Map common career/job topics to visual scenes
  const sceneMap: [RegExp, string][] = [
    [/interview|hiring|recruiter/, "Professional in a modern glass-walled office during a job interview, confident posture, warm lighting, corporate setting"],
    [/resume|cv|ats/, "Clean modern desk with a laptop showing a professional document, warm natural light from a window, minimal workspace"],
    [/linkedin|profile|network/, "Professional networking event in a modern venue, business people connecting, warm ambient lighting"],
    [/salary|negotiate|compensation/, "Confident professional at a polished conference table in a high-rise office, city skyline through windows"],
    [/remote|work from home|wfh/, "Stylish home office setup with a laptop, coffee cup, plant, natural light from large windows, clean minimal design"],
    [/career|growth|promotion/, "Person ascending modern floating staircase in a bright atrium, upward perspective, success metaphor"],
    [/job search|application|apply/, "Person at a modern desk with multiple screens, focused and productive, soft blue accent lighting"],
    [/skill|learn|course/, "Modern workspace with books, laptop, and digital tools, growth-oriented imagery, warm light"],
    [/scam|fraud|warning|safety/, "Professional cybersecurity concept, shield icon, secure workspace, blue-toned lighting, tech protection theme"],
    [/ai|technology|tool/, "Futuristic workspace with holographic interfaces, clean tech aesthetic, blue and purple accents"],
  ];

  for (const [pattern, scene] of sceneMap) {
    if (pattern.test(topicText)) {
      return `${scene}. Professional photography, high quality, ${platform} marketing visual.`;
    }
  }

  // # Generic professional fallback
  return `Modern professional workspace with clean design, laptop and career-related imagery, warm natural lighting, premium aesthetic. For ${platform} marketing.`;
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
      "imagePrompt": "A photographic SCENE description for AI image generation. Describe what the viewer should SEE: people, settings, objects, lighting, mood, colors. Do NOT include any text to render — the AI cannot render text. Example: 'Confident professional at a modern desk reviewing documents, warm natural light from large windows, clean minimal office, success atmosphere'"
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
      // # Prefer Gemini's scene-descriptive imagePrompt, fall back to auto-generated
      aiImagePrompt: slide.imagePrompt
        ? String(slide.imagePrompt)
        : buildSlideImagePrompt(
            { headline: String(slide.headline || ""), body: slide.body ? String(slide.body) : undefined, stat: slide.stat as any, layout },
            platform,
            mediaPrompt,
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
