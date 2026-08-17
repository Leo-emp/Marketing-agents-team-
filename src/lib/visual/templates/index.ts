/* ============================================================
   TEMPLATE ROUTER — Maps template IDs to HTML generators
   ============================================================
   # Routes T1-T72 to the correct platform template file.
   # Each template function returns a complete HTML string
   # ready for Puppeteer to screenshot at target dimensions.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { esc } from "./shared";
import { buildLinkedInTemplate, LINKEDIN_IDS } from "./linkedin";
import { buildTikTokTemplate, TIKTOK_IDS } from "./tiktok";
import { buildInstagramTemplate, INSTAGRAM_IDS } from "./instagram";

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
    background: #08090E; color: #E4E2DD;
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

// # Check if a layout string is a template ID (t1-t72)
export function isTemplateId(layout: string): layout is TemplateId {
  const match = layout.match(/^t(\d+)$/);
  if (!match) return false;
  const num = parseInt(match[1]);
  return num >= 1 && num <= 96;
}
