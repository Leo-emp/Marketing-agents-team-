/* ============================================================
   TEMPLATE ROUTER — Maps template IDs to HTML generators
   ============================================================
   # Routes T1-T208 to the correct platform template file.
   # Routes carousel IDs (lc1-lc4, tc1-tc4, ic1-ic4) to
   # the carousel system for multi-slide sequences.
   # Each function returns a complete HTML string ready for
   # Puppeteer to screenshot at target dimensions.
   ============================================================ */

import type { TemplateContent, TemplateId, CarouselContent, CarouselId } from "./shared";
import { esc } from "./shared";
import { buildLinkedInTemplate, LINKEDIN_IDS } from "./linkedin";
import { buildTikTokTemplate, TIKTOK_IDS } from "./tiktok";
import { buildInstagramTemplate, INSTAGRAM_IDS } from "./instagram";
import {
  buildCarouselSlide,
  buildCarouselAllSlides,
  isCarouselId,
  CAROUSEL_IDS,
  CAROUSEL_META,
} from "./carousels";
import { buildFreshTemplate, FRESH_IDS } from "./fresh";
import { buildDesignerTemplate, DESIGNER_IDS } from "./designer";

// # Build a complete HTML page for a given template
// # Returns HTML string ready for Puppeteer rendering
export function buildTemplateHTML(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): string {
  // # LinkedIn templates (T1-T15, T65-T72)
  if (LINKEDIN_IDS.includes(templateId)) {
    return buildLinkedInTemplate(templateId, content, width, height);
  }

  // # TikTok templates (T16-T21, T28-T33, T40-T44, T49-T52)
  if (TIKTOK_IDS.includes(templateId)) {
    return buildTikTokTemplate(templateId, content, width, height);
  }

  // # Instagram templates (T22-T27, T34-T39, T45-T48, T53-T56, T57-T64)
  if (INSTAGRAM_IDS.includes(templateId)) {
    return buildInstagramTemplate(templateId, content, width, height);
  }

  // # Fresh templates (T151-T186: LinkedIn, TikTok, Instagram)
  if (FRESH_IDS.includes(templateId)) {
    return buildFreshTemplate(templateId, content, width, height);
  }

  // # Designer templates (T187-T208: LinkedIn, TikTok, Instagram)
  if (DESIGNER_IDS.includes(templateId)) {
    return buildDesignerTemplate(templateId, content, width, height);
  }

  // # Fallback — render a simple branded card
  return buildFallbackTemplate(templateId, content, width, height);
}

// # Simple fallback for templates not yet implemented
function buildFallbackTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .template {
    width: ${width}px; height: ${height}px;
    background: linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
    color: #E4E2DD;
    font-family: 'Segoe UI', system-ui, sans-serif;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 80px; text-align: center;
  }
  .id { font-size: 14px; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; color: #6366F1; margin-bottom: 24px; }
  .headline { font-size: 48px; font-weight: 800; letter-spacing: -0.03em;
    line-height: 1.1; max-width: 800px; }
  .body { font-size: 20px; color: #8B8A9A; margin-top: 24px;
    line-height: 1.5; max-width: 600px; }
</style></head>
<body><div class="template">
  <div class="id">${esc(templateId.toUpperCase())}</div>
  <div class="headline">${esc(content.headline)}</div>
  ${content.body ? `<div class="body">${esc(content.body)}</div>` : ""}
</div></body></html>`;
}

// # Check if a layout string is a template ID (t1-t186)
export function isTemplateId(layout: string): layout is TemplateId {
  const match = layout.match(/^t(\d+)$/);
  if (!match) return false;
  const num = parseInt(match[1]);
  return num >= 1 && num <= 214;
}

// # Instagram templates that render at 1:1 (1080×1080)
const IG_SQUARE: Set<string> = new Set([
  "t36","t37","t38","t39","t47","t56",
  "t57","t60","t61","t62","t63","t64","t92","t94","t96",
  "t110","t112",
  "t179","t180","t181","t182",
]);

// # Instagram templates that render at 9:16 (1080×1920)
const IG_STORY: Set<string> = new Set([
  "t24","t27","t114","t132","t150",
  "t183","t184","t185","t186",
]);

// # Get the correct native render dimensions for any template ID
// # Templates are designed at a fixed aspect ratio — this returns
// # the target pixel size they should be rendered at (not the
// # preview scale). The visual pipeline must use these dimensions
// # instead of the platform/contentType fallback to avoid clipping.
export function getTemplateDimensions(templateId: string): { width: number; height: number } | null {
  if (!isTemplateId(templateId)) return null;

  // # LinkedIn → 1080×1350 (4:5 portrait)
  if (LINKEDIN_IDS.includes(templateId as TemplateId)) {
    return { width: 1080, height: 1350 };
  }

  // # TikTok → 1080×1920 (9:16 full screen)
  if (TIKTOK_IDS.includes(templateId as TemplateId)) {
    return { width: 1080, height: 1920 };
  }

  // # Instagram — depends on the specific template
  if (INSTAGRAM_IDS.includes(templateId as TemplateId)) {
    if (IG_SQUARE.has(templateId)) return { width: 1080, height: 1080 };
    if (IG_STORY.has(templateId)) return { width: 1080, height: 1920 };
    return { width: 1080, height: 1350 };
  }

  // # Fresh templates — LinkedIn (T151-T162), TikTok (T163-T174), Instagram (T175-T186)
  if (FRESH_IDS.includes(templateId as TemplateId)) {
    const num = parseInt(templateId.slice(1));
    if (num <= 162) return { width: 1080, height: 1350 };
    if (num <= 174) return { width: 1080, height: 1920 };
    // # Instagram fresh: T175-T178 (4:5), T179-T182 (1:1), T183-T186 (9:16)
    if (num <= 178) return { width: 1080, height: 1350 };
    if (num <= 182) return { width: 1080, height: 1080 };
    return { width: 1080, height: 1920 };
  }

  // # Designer templates — multi-platform (T187-T208)
  if (DESIGNER_IDS.includes(templateId as TemplateId)) {
    const num = parseInt(templateId.slice(1));
    // # T203-T205: TikTok 9:16
    if (num >= 203 && num <= 205) return { width: 1080, height: 1920 };
    // # Everything else (LinkedIn T187-T202, Instagram T206-T208): 4:5 portrait
    return { width: 1080, height: 1350 };
  }

  return { width: 1080, height: 1350 };
}

// # Re-export carousel system for direct use
export {
  buildCarouselSlide,
  buildCarouselAllSlides,
  isCarouselId,
  CAROUSEL_IDS,
  CAROUSEL_META,
};
export { buildFreshTemplate, FRESH_IDS };
export { buildDesignerTemplate, DESIGNER_IDS };
export type { CarouselContent, CarouselId };
