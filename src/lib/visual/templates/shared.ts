/* ============================================================
   SHARED TEMPLATE CONSTANTS & UTILITIES
   ============================================================
   # Brand colors, logo data URI, and HTML scaffolding shared
   # across all 72 social media templates (T1-T72).
   # These match the design system in jobpilot-social-images skill.
   ============================================================ */

// # HTML-escape user/AI content before Puppeteer renders it
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  | "t1" | "t2" | "t3" | "t4" | "t5" | "t6" | "t7" | "t8"
  | "t9" | "t10" | "t11" | "t12" | "t13" | "t14" | "t15"
  // # TikTok Set 1 (T16-T21)
  | "t16" | "t17" | "t18" | "t19" | "t20" | "t21"
  // # Instagram Set 1 (T22-T27)
  | "t22" | "t23" | "t24" | "t25" | "t26" | "t27"
  // # TikTok Set 2 (T28-T33)
  | "t28" | "t29" | "t30" | "t31" | "t32" | "t33"
  // # Instagram Set 2 (T34-T39)
  | "t34" | "t35" | "t36" | "t37" | "t38" | "t39"
  // # TikTok Set 3 (T40-T44)
  | "t40" | "t41" | "t42" | "t43" | "t44"
  // # Instagram Set 3 (T45-T48)
  | "t45" | "t46" | "t47" | "t48"
  // # TikTok Set 4 (T49-T52)
  | "t49" | "t50" | "t51" | "t52"
  // # Instagram Set 4 (T53-T56)
  | "t53" | "t54" | "t55" | "t56"
  // # Instagram Set 5 (T57-T64)
  | "t57" | "t58" | "t59" | "t60" | "t61" | "t62" | "t63" | "t64"
  // # LinkedIn Set 2 (T65-T72)
  | "t65" | "t66" | "t67" | "t68" | "t69" | "t70" | "t71" | "t72"
  // # LinkedIn Set 3 (T73-T80)
  | "t73" | "t74" | "t75" | "t76" | "t77" | "t78" | "t79" | "t80"
  // # TikTok Set 5 (T81-T88)
  | "t81" | "t82" | "t83" | "t84" | "t85" | "t86" | "t87" | "t88"
  // # Instagram Set 6 (T89-T96)
  | "t89" | "t90" | "t91" | "t92" | "t93" | "t94" | "t95" | "t96";
