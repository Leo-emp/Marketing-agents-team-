/* ============================================================
   VISUAL DESIGNER AGENT
   ============================================================
   Takes generated text content and produces structured SlideData
   for the visual template renderer. Ensures image text and
   caption complement each other without repetition.
   ============================================================ */

import { callGemini } from "../gemini";
import { getBackgroundPhoto } from "./pexels";
import { getDimensions } from "./types";
import type { SlideData, SlideLayout } from "./types";
/* eslint-disable @typescript-eslint/no-explicit-any */

/* # Parse content into visual slides + complementary caption */
export async function designVisual(
  content: string,
  platform: string,
  contentType: string,
  mediaPrompt: string | null,
  topic?: string
): Promise<{ slides: SlideData[]; caption: string }> {
  const prompt = `You are a visual content designer for a premium career tech brand (JobPilot AI). Your job is to take written content and convert it into structured data for branded image slides.

BRAND VISUAL IDENTITY:
- Dark background (#09090b), clean white text
- Indigo-to-purple gradient accents
- Minimalist, premium aesthetic — think Apple or Linear design
- No emojis, no clip art, no busy layouts
- High readability and visibility
- Professional and trustworthy

AVAILABLE SLIDE LAYOUTS:
- "hero": Full-width bold headline with gradient accent bar. Best for: opening slides, key statements, bold claims.
- "stat_card": Large centered number/statistic with label below. Best for: data points, percentages, metrics.
- "tip": Numbered tip with left accent border, headline, and optional body text. Best for: actionable advice, step-by-step content.
- "quote": Large quotation mark, centered quote text, optional attribution. Best for: testimonials, powerful statements, insights.
- "list": Title with arrow-pointed bullet items. Best for: lists of 3-5 items, comparisons, checklists.
- "cta": Call-to-action card with brand logo and URL button. Best for: final slides, directing to website.
- "before_after": Side-by-side comparison showing bad vs good. Requires "beforeText" and "afterText" fields. Best for: resume rewrites, profile improvements, before/after transformations.
- "screenshot": Fake tweet/DM/notification card with avatar and author name. Include "screenshotType" (tweet/dm/notification/email) and "screenshotAuthor". Best for: social proof, recruiter messages, email examples.
- "data_chart": Horizontal bar chart with percentages. Include "bars": [{"label":"label", "value":75}]. Best for: survey results, skill comparisons, market data.
- "comparison": Two-column layout for pros/cons or versus. Include "leftColumn", "rightColumn", "leftLabel", "rightLabel". Best for: tool comparisons, approach comparisons, do vs don't.
- "numbered_steps": Step-by-step with large step numbers. Include "steps": [{"number":1, "title":"Step title", "detail":"optional detail"}]. Best for: processes, tutorials, frameworks.
- "gradient_text": Large gradient-colored headline, minimal design. Best for: powerful one-liners, key takeaways, mic-drop statements.
- "highlight_box": Key insight centered in a highlighted accent card. Best for: key takeaway slides, featured quotes, important notes.
- "split_image": Left gradient accent panel + right text content. Include "stat" for the left panel number. Best for: data-driven points, key metrics with explanation.
- "progress_bar": Multiple progress bars with labels and percentages. Include "bars": [{"label":"label", "value":75}]. Best for: skill levels, completion rates, survey data.

CONTENT TO CONVERT:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
CONTENT TYPE: ${contentType}

TASK:
${contentType === "carousel" ? `Create 7-10 slides for a carousel. Rules:
- First slide MUST be "hero" layout (bold hook slide)
- Last slide MUST be "cta" layout (call-to-action with brand URL)
- Middle slides MUST use at least 4 DIFFERENT layout types — vary between: stat_card, tip, quote, list, gradient_text, highlight_box, numbered_steps, before_after, comparison, split_image, data_chart
- NO two consecutive slides should use the same layout type
- Each slide's headline must be SHORT (15-25 words max — this text appears ON the image)
- Each slide MUST have UNIQUE photoKeywords — no repeating the same search terms across slides. Choose visually distinct backgrounds that create variety as the user swipes.` : ""}
${contentType === "single_image" || contentType === "post" ? `Create exactly 1 slide. Choose the most impactful layout for this content (hero for bold statements, stat_card for data, quote for insights, gradient_text for one-liners). The headline must be SHORT and impactful (15-25 words max — this text appears ON the image). Choose specific, visually striking photoKeywords — not generic terms like "office" or "business".` : ""}
${contentType === "reel_script" ? `Create 4-6 storyboard frames showing the key visual moments. Use "hero" for hooks, "tip" for main points, "stat_card" for data, "cta" for ending.` : ""}

CRITICAL RULES:
1. Slide text must be CONCISE — it appears on the image. 15-25 words per slide maximum.
2. Write a SEPARATE caption that COMPLEMENTS the slide text. The caption must NOT repeat what the slides say. It adds context, story, or detail.
3. No emojis anywhere.
4. Professional, clean language only.
5. For EVERY slide, include "photoKeywords" — 2-4 words describing the ideal stock photo background (e.g. "modern office workspace", "laptop interview", "professional handshake", "city skyline night"). Think about photos that create atmosphere and mood. Avoid generic keywords — be specific and visual.

BACKGROUND PHOTO GUIDELINES:
- hero slides: dramatic, wide shots (cityscapes, architecture, technology)
- stat_card slides: abstract, minimal (gradients, textures, geometric)
- tip slides: professional workplace (desk, meeting, laptop)
- quote slides: atmospheric, moody (skyline, window light, nature)
- list slides: organized, structured (workspace, planning, whiteboard)
- cta slides: aspirational, forward-looking (horizon, path, sunrise)

Return a JSON object:
{
  "slides": [
    {
      "headline": "The short punchy text on this slide",
      "subheadline": "optional secondary text",
      "body": "optional body text (only for tip/list layouts)",
      "stat": { "value": "75%", "label": "description of the stat" },
      "bullets": ["item 1", "item 2", "item 3"],
      "footer": "optional small text",
      "layout": "hero|stat_card|tip|quote|list|cta",
      "photoKeywords": "relevant stock photo search terms"
    }
  ],
  "caption": "The post caption that complements (not repeats) the visual content. 100-300 words for Instagram, 50-200 for Twitter, 100-400 for LinkedIn."
}

Only include fields relevant to each layout. For stat_card, include "stat". For list, include "bullets". For others, use headline + optional subheadline/body.
Return ONLY a valid JSON object.`;

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

  // # Validate slides array exists and is non-empty
  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("Visual designer returned empty or missing slides array");
  }

  // # Validate and normalize slide data
  const validLayouts: SlideLayout[] = ["hero", "stat_card", "tip", "quote", "list", "cta", "before_after", "screenshot", "data_chart", "comparison", "numbered_steps", "gradient_text", "highlight_box", "split_image", "progress_bar"];

  const rawSlides = ((parsed.slides || []) as Record<string, unknown>[]).map((slide: Record<string, unknown>, index: number) => {
    const layout = validLayouts.includes(slide.layout as SlideLayout)
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
      photoKeywords: slide.photoKeywords ? String(slide.photoKeywords) : undefined,
      /* # Extended fields for new layouts */
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

  // # Fetch stock photo backgrounds from Pexels for slides that have keywords
  const { width } = getDimensions(platform, contentType);
  const slides: SlideData[] = await Promise.all(
    rawSlides.map(async (slide: SlideData) => {
      if (slide.photoKeywords) {
        const photoUrl = await getBackgroundPhoto(slide.photoKeywords, width);
        if (photoUrl) {
          return { ...slide, backgroundImageUrl: photoUrl };
        }
      }
      return slide;
    })
  );

  return {
    slides,
    caption: parsed.caption || "",
  };
}
