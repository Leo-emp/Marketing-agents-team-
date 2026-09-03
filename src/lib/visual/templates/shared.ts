/* ============================================================
   SHARED TEMPLATE CONSTANTS & UTILITIES
   ============================================================
   # Brand colors, logo data URI, and HTML scaffolding shared
   # across all 72 social media templates (T1-T72).
   # These match the design system in jobpilot-social-images skill.
   ============================================================ */

import { LOGO_FULL_URI } from "./logo";

// # HTML-escape user/AI content before Puppeteer renders it
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// # Full JobPilot AI logo — imported from official SVG, used in premium templates
export const LOGO_PRO_URI = LOGO_FULL_URI;

// # Legacy 120×120 PNG kept for reference (unused)
const _LOGO_PRO_LEGACY = `data:image/png;base64,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`;

// # JP monogram logo as base64 JPEG (60x60) — embedded in every template
export const LOGO_DATA_URI = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUEBAQEAwUEBAQGBQUGCA0ICAcHCBALDAkNExAUExIQEhIUFx0ZFBYcFhISGiMaHB4fISEhFBkkJyQgJh0gISD/2wBDAQUGBggHCA8ICA8gFRIVICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCAA8ADwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5C7UUdqSqAWiiigAooooAKUUlKKAEooooAQnAJNfVHhf9mLw3q/gbQ9a1XXtYtr+/so7qaGIRbIy67gBlSehHU18yaTp0usa7p+jwAmW+uYrZQPV3C/1r9IvFes6R4I8IXer6i4j03SbcKFHBcKAqIvuxwB9a6sNCMm3PY4cXUnFJQerPlHxX8D/C2k+KNF8JaHrmqXmt6k/nSLN5ey0tF+/M+1c54IUdz+suu/s8adFZyHQfEN19rUEol6ilHPoSoBX64NcWW+M/iPX73x/o+l65DJrQJFzYowQwg4WNT/cXaAP92vcfh7D4zi8EJ/wnEk76k07tGLkgzJFgYDn1zuPPIBFevgKNDETcJ03r1Pn8zxGKwtNVIVldbrRu/wDkfIt7ZXem6hcaffQNBdW0hiljbqrA4IqAV2/xZuLW5+K2svaFSqGOKQr0MixqG/UY/CuIFeHXgqdWUE7pNo+mw1V1qMKklZtJ/ehK9O+CnwrX4teNrvQ7jUptNsrOya7muYYw7A7lVVweOSx/KvMa6/wR8SvGfw5lvpfB2qpp0l+qLcM1tHMWC5Kgb1OPvHpWR0H2T4L/AGdPAnwx1Y+L77WbnVLnT1MsVzqJjgt7PA/1hA4yB0LHA6gZ5ryTxv4lu/2hPilYeA/CUkq+D9Nl8+8vQpAmA4aY56DBKxg9S2e/Hhviz4keO/HICeK/FN9qcCncLd3CQg+vlqAuffFWfCnxS8beCNLl03wvqVvp9vO/mSkWUTvK3bc7KWOOwzgdq1jNL3Xsc86cn7y36H1z498c+F/hZpGkWd5Z3ItZVNtaW9misY0jVRzkjgAqK8O8X/tBJe2Utr4S0qe1mkBX7ZeFcx+6opPPuTx6V5R4t8deKfHNxaXHijUxfSWaMkOIUjCBiCeFAznA/KuarunmNVXjSdl+J5sMpoO0q65n+A53eSRpJHZ3clmZjksT1JPrSCkpRXmHtCUUoHAoxQAlFLijFACUUuKMUAJSijFKAKAP/9k=`;

// # Brand colors — matches the design system in skill specs
export const COLORS = {
  // # Backgrounds
  darkBg: "#08090E",
  lightBg: "#F8F7F4",
  whiteBg: "#FFFFFF",
  brandBg: "#1E1B4B",
  surface: "#10111A",
  border: "#1E1F2E",
  warmDark: "#1C1914",

  // # Accents
  accent: "#6366F1",
  accentLight: "#A78BFA",
  accentSubtle: "#A5B4FC",

  // # Text on dark
  inkDark: "#E4E2DD",
  secondaryDark: "#8B8A9A",
  mutedDark: "#5A596E",

  // # Text on light
  inkLight: "#1A1A1A",
  secondaryLight: "#6B6B6B",
  mutedLight: "#8A8A8A",

  // # Semantic
  good: "#34D399",
  warn: "#F87171",
  red: "#EF4444",
  amber: "#F59E0B",
  green: "#22C55E",
  greenLight: "#4ADE80",
} as const;

// # 6 distinct gradient palettes for Teal-style templates (T19/T80/T27)
// # Rotated per post so each gets a visually different color
export const TEAL_GRADIENTS = [
  "linear-gradient(160deg,#1E1B4B 0%,#312E81 50%,#4338CA 100%)",  // # Brand indigo (signature)
  "linear-gradient(155deg,#083344 0%,#0E7490 50%,#06B6D4 100%)",  // # Teal/cyan
  "linear-gradient(160deg,#022C22 0%,#065F46 50%,#059669 100%)",  // # Deep emerald
  "linear-gradient(150deg,#0C4A6E 0%,#0369A1 50%,#0284C7 100%)",  // # Ocean blue
  "linear-gradient(155deg,#2E1065 0%,#6D28D9 50%,#7C3AED 100%)",  // # Warm violet
  "linear-gradient(160deg,#581C87 0%,#9333EA 50%,#A855F7 100%)",  // # Bright purple
];

// # Pick a gradient based on headline content — same text = same color
export function pickGradient(headline: string): string {
  let hash = 0;
  for (let i = 0; i < headline.length; i++) {
    hash = ((hash << 5) - hash + headline.charCodeAt(i)) | 0;
  }
  return TEAL_GRADIENTS[Math.abs(hash) % TEAL_GRADIENTS.length];
}

// # Font stack used in all templates
export const FONT_STACK = `'Segoe UI', system-ui, -apple-system, sans-serif`;
export const MONO_STACK = `'Cascadia Code', 'Fira Code', Consolas, monospace`;

// # Wraps a template body in a full HTML page at exact dimensions
// # No margins, no scrollbars — just the template at canvas size
export function wrapHTML(body: string, css: string, width: number, height: number): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body { font-family: ${FONT_STACK}; }
  .template { width: ${width}px; height: ${height}px; position: relative; overflow: hidden; }
  ${css}
</style></head>
<body>${body}</body></html>`;
}

// # Brand strip HTML — appears at the bottom of every template
// # Dark variant (white text, muted)
export function brandStripDark(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;">
    <div style="width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;">
    </div>
    <span style="font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);">jobpilotai.co</span>
  </div>`;
}

// # Brand strip — light variant
export function brandStripLight(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;">
    <div style="width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;">
    </div>
    <span style="font-size:10px;font-weight:700;letter-spacing:-0.01em;color:#999;">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:#C0BDB5;">jobpilotai.co</span>
  </div>`;
}

// # Eyebrow with dash — dark variant
export function eyebrowDark(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:8px;display:flex;align-items:center;gap:10px;">
    <span style="width:18px;height:2px;background:${COLORS.accent};border-radius:1px;display:inline-block;"></span>
    ${text}
  </div>`;
}

// # Eyebrow — light variant
export function eyebrowLight(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:8px;display:flex;align-items:center;gap:10px;">
    <span style="width:18px;height:2px;background:${COLORS.accent};border-radius:1px;display:inline-block;"></span>
    ${text}
  </div>`;
}

// # Eyebrow — brand (light purple on dark indigo) variant
export function eyebrowBrand(text: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${COLORS.accentSubtle};margin-bottom:8px;display:flex;align-items:center;gap:10px;">
    <span style="width:18px;height:2px;background:${COLORS.accentSubtle};border-radius:1px;display:inline-block;"></span>
    ${text}
  </div>`;
}

// # Premium branded footer — dark variant (for dark/gradient backgrounds)
// # Uses the full-size logo, clearly shows brand name and domain
export function proFooterDark(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:16px 0 0;">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);">
    <div style="display:flex;flex-direction:column;gap:1px;">
      <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:-0.01em;">JobPilot AI</span>
      <span style="font-size:9px;font-family:${MONO_STACK};color:rgba(255,255,255,0.35);letter-spacing:0.03em;">jobpilotai.co</span>
    </div>
  </div>`;
}

// # Premium branded footer — light variant (for white/cream backgrounds)
export function proFooterLight(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:16px 0 0;">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,0.06);">
    <div style="display:flex;flex-direction:column;gap:1px;">
      <span style="font-size:11px;font-weight:700;color:#1A1A1A;letter-spacing:-0.01em;">JobPilot AI</span>
      <span style="font-size:9px;font-family:${MONO_STACK};color:#999;letter-spacing:0.03em;">jobpilotai.co</span>
    </div>
  </div>`;
}

// # Premium branded footer — bar variant (full-width dark bar at bottom)
export function proFooterBar(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:14px 20px;background:rgba(0,0,0,0.5);border-radius:10px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:24px;height:24px;border-radius:5px;">
    <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:-0.01em;">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO_STACK};margin-left:auto;color:rgba(255,255,255,0.4);letter-spacing:0.03em;">jobpilotai.co</span>
  </div>`;
}

// # Content data interface for template rendering
export interface TemplateContent {
  eyebrow?: string;
  headline: string;
  headlineHighlight?: string;       // # Word/phrase to highlight with accent-light
  body?: string;
  bodyBold?: string;                // # Phrase to bold within body text
  stat?: { value: string; label: string };
  subheadline?: string;
  bullets?: string[];
  tips?: { title: string; description: string }[];
  steps?: { label: string; title: string; description?: string }[];
  bars?: { label: string; value: number; color?: string }[];
  items?: { text: string; value?: string; highlighted?: boolean }[];
  beforeText?: string;
  afterText?: string;
  cta?: string;
  score?: number;
  annotations?: { text: string; highlights?: { text: string; type: "good" | "bad" }[]; callout?: { text: string; type: "good" | "bad" } }[];
  tags?: string[];
  methodName?: string;
  benchmarkAt?: number;
  legend?: { label: string; color: string }[];
}

// # Template ID type — all 72 templates
export type TemplateId =
  // # LinkedIn Set 1 (T1-T15)
  | "t1" | "t2" | "t3" | "t4" | "t5" | "t7" | "t8"
  | "t9" | "t10" | "t11" | "t12" | "t13" | "t14" | "t15"
  // # TikTok Set 1 (T16-T21)
  | "t16" | "t17" | "t18" | "t19" | "t20" | "t21"
  // # Instagram Set 1 (T22-T27)
  | "t23" | "t24" | "t26" | "t27"
  // # TikTok Set 2 (T28-T33)
  | "t28" | "t29" | "t31" | "t32" | "t33"
  // # Instagram Set 2 (T34-T39)
  | "t34" | "t35" | "t36" | "t37" | "t38" | "t39"
  // # TikTok Set 3 (T40-T44)
  | "t40" | "t41" | "t42" | "t44"
  // # Instagram Set 3 (T45-T48)
  | "t45" | "t46" | "t47" | "t48"
  // # TikTok Set 4 (T49-T52)
  | "t49" | "t50" | "t52"
  // # Instagram Set 4 (T53-T56)
  | "t53" | "t54" | "t56"
  // # Instagram Set 5 (T57-T64)
  | "t57" | "t58" | "t59" | "t60" | "t61" | "t62" | "t63" | "t64"
  // # LinkedIn Set 2 (T65-T72)
  | "t65" | "t66" | "t67" | "t68" | "t69" | "t70" | "t71" | "t72"
  // # LinkedIn Set 3 (T73-T80)
  | "t73" | "t74" | "t75" | "t76" | "t77" | "t78" | "t79" | "t80"
  // # TikTok Set 5 (T81-T88)
  | "t81" | "t82" | "t83" | "t84" | "t85" | "t86" | "t88"
  // # Instagram Set 6 (T89-T96)
  | "t89" | "t90" | "t91" | "t92" | "t93" | "t94" | "t95" | "t96"
  // # Premium LinkedIn (T97-T102)
  | "t97" | "t98" | "t99" | "t100" | "t101" | "t102"
  // # Premium TikTok (T103-T108)
  | "t103" | "t104" | "t105" | "t106" | "t107" | "t108"
  // # Premium Instagram (T109-T114)
  | "t109" | "t110" | "t111" | "t112" | "t113" | "t114"
  // # Fresh Pro LinkedIn (T115-T120)
  | "t115" | "t116" | "t117" | "t118" | "t119" | "t120"
  // # Fresh Pro TikTok (T121-T126)
  | "t121" | "t122" | "t123" | "t124" | "t125" | "t126"
  // # Fresh Pro Instagram (T127-T132)
  | "t127" | "t128" | "t129" | "t130" | "t131" | "t132"
  // # Pro Set 3 LinkedIn (T133-T138)
  | "t133" | "t134" | "t135" | "t136" | "t137" | "t138"
  // # Pro Set 3 TikTok (T139-T144)
  | "t139" | "t140" | "t141" | "t142" | "t143" | "t144"
  // # Pro Set 3 Instagram (T145-T150)
  | "t145" | "t146" | "t147" | "t148" | "t149" | "t150"
  // # Fresh LinkedIn (T151-T162)
  | "t151" | "t152" | "t153" | "t154" | "t155" | "t156"
  | "t157" | "t158" | "t159" | "t160" | "t161" | "t162"
  // # Fresh TikTok (T163-T174)
  | "t163" | "t164" | "t165" | "t166" | "t167" | "t168"
  | "t169" | "t170" | "t171" | "t172" | "t173" | "t174"
  // # Fresh Instagram (T175-T186)
  | "t175" | "t176" | "t177" | "t178" | "t179" | "t180"
  | "t181" | "t182" | "t183" | "t184" | "t185" | "t186"
  // # Designer LinkedIn (T187-T193)
  | "t187" | "t188" | "t189" | "t190" | "t191" | "t192" | "t193"
  | "t194" | "t198" | "t199"
  // # Designer TikTok (T203-T205), Instagram (T206-T208), LinkedIn (T200-T202)
  | "t200" | "t201" | "t202"
  | "t203" | "t204" | "t205"
  | "t206" | "t207" | "t208"
  // # Designer LinkedIn Set 5 (T209-T214)
  | "t209" | "t210" | "t211" | "t212" | "t213" | "t214"
  // # Designer LinkedIn Set 6 — text-only (T215-T220)
  | "t215" | "t216" | "t217" | "t218" | "t219" | "t220"
  // # Designer LinkedIn Set 7 — text-only with footer (T221-T226)
  | "t221" | "t222" | "t223" | "t224" | "t225" | "t226"
  // # Designer LinkedIn Set 8 — fresh designs with footer (T228-T229)
  | "t228" | "t229"
  // # Designer TikTok Set 5 (T230-T232) + Instagram Set 5 (T233-T235)
  | "t230" | "t231" | "t232" | "t233" | "t234" | "t235";

// # Carousel template IDs — 12 carousels (4 per platform)
export type CarouselId =
  | "lc1" | "lc2" | "lc3" | "lc4"   // # LinkedIn carousels (1:1)
  | "tc1" | "tc2" | "tc3" | "tc4"   // # TikTok carousels (9:16)
  | "ic1" | "ic2" | "ic3" | "ic4";  // # Instagram carousels (4:5)

// # Content structure for carousel slide rendering
// # AI agent fills this to customize carousel text
export interface CarouselContent {
  coverTitle?: string;         // # Main title on cover slide ({ac}...{/ac} for accent)
  coverSubtitle?: string;      // # Subtitle below cover title
  eyebrow?: string;            // # Category label
  ctaTitle?: string;           // # CTA slide title ({ac}...{/ac} for accent)
  ctaSubtitle?: string;        // # CTA supporting text
  ctaButton?: string;          // # CTA button label
  slides: {
    label?: string;            // # Slide label ("MISTAKE #1", "STEP 2")
    heading: string;           // # Slide title
    body: string;              // # Main content
    bodyBold?: string;         // # Phrase to bold within body
    before?: string;           // # Before text (comparison slides)
    after?: string;            // # After text (comparison slides)
    items?: string[];          // # List items
  }[];
}
