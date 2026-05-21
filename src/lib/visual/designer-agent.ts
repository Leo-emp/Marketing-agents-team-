/* ============================================================
   VISUAL DESIGNER AGENT
   ============================================================
   Takes generated text content and produces structured SlideData
   for the visual template renderer. Ensures image text and
   caption complement each other without repetition.
   ============================================================ */

import { callGemini } from "../gemini";
import type { SlideData, SlideLayout } from "./types";

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

CONTENT TO CONVERT:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
CONTENT TYPE: ${contentType}

TASK:
${contentType === "carousel" ? `Create 7-10 slides for a carousel. First slide = "hero" hook. Last slide = "cta". Middle slides mix layouts based on the content. Each slide's headline must be SHORT (15-25 words max — this text appears ON the image).` : ""}
${contentType === "single_image" || contentType === "post" ? `Create exactly 1 slide. Choose the best layout for this content. The headline must be SHORT and impactful (15-25 words max — this text appears ON the image).` : ""}
${contentType === "reel_script" ? `Create 4-6 storyboard frames showing the key visual moments. Use "hero" for hooks, "tip" for main points, "stat_card" for data, "cta" for ending.` : ""}

CRITICAL RULES:
1. Slide text must be CONCISE — it appears on the image. 15-25 words per slide maximum.
2. Write a SEPARATE caption that COMPLEMENTS the slide text. The caption must NOT repeat what the slides say. It adds context, story, or detail.
3. No emojis anywhere.
4. Professional, clean language only.

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
      "layout": "hero|stat_card|tip|quote|list|cta"
    }
  ],
  "caption": "The post caption that complements (not repeats) the visual content. 100-300 words for Instagram, 50-200 for Twitter, 100-400 for LinkedIn."
}

Only include fields relevant to each layout. For stat_card, include "stat". For list, include "bullets". For others, use headline + optional subheadline/body.
Return ONLY a valid JSON object.`;

  const raw = await callGemini(prompt);

  // # Parse the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Visual designer returned no valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // # Validate and normalize slide data
  const slides: SlideData[] = (parsed.slides || []).map((slide: Record<string, unknown>, index: number) => {
    const validLayouts: SlideLayout[] = ["hero", "stat_card", "tip", "quote", "list", "cta"];
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
    };
  });

  return {
    slides,
    caption: parsed.caption || "",
  };
}
