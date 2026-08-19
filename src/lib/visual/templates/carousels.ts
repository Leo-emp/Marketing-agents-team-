/* ============================================================
   CAROUSEL TEMPLATES — Multi-slide sequences for all platforms
   ============================================================
   # 12 carousel templates (4 per platform), each 5-7 slides.
   # LinkedIn carousels: 1:1 (1080×1080), rendered as PDF
   # TikTok carousels: 9:16 (1080×1920), image sequence
   # Instagram carousels: 4:5 (1080×1350), image sequence
   #
   # Each slide is rendered independently via Puppeteer and
   # assembled by pdf-carousel.ts or posted as image arrays.
   ============================================================ */

import type { CarouselContent, CarouselId } from "./shared";
import { LOGO_DATA_URI, FONT_STACK, MONO_STACK, esc } from "./shared";

// # All carousel IDs
export const CAROUSEL_IDS: CarouselId[] = [
  "lc1", "lc2", "lc3", "lc4",
  "tc1", "tc2", "tc3", "tc4",
  "ic1", "ic2", "ic3", "ic4",
];

// # Carousel metadata — slide counts and dimensions
export const CAROUSEL_META: Record<CarouselId, {
  name: string;
  platform: "linkedin" | "tiktok" | "instagram";
  slideCount: number;
  width: number;
  height: number;
}> = {
  lc1: { name: "5 Resume Mistakes", platform: "linkedin", slideCount: 7, width: 1080, height: 1080 },
  lc2: { name: "ATS Optimization Guide", platform: "linkedin", slideCount: 6, width: 1080, height: 1080 },
  lc3: { name: "Interview Prep Framework", platform: "linkedin", slideCount: 6, width: 1080, height: 1080 },
  lc4: { name: "Salary Negotiation Playbook", platform: "linkedin", slideCount: 6, width: 1080, height: 1080 },
  tc1: { name: "Job Search Red Flags", platform: "tiktok", slideCount: 6, width: 1080, height: 1920 },
  tc2: { name: "Resume Glow-Up", platform: "tiktok", slideCount: 5, width: 1080, height: 1920 },
  tc3: { name: "Interview Cheat Sheet", platform: "tiktok", slideCount: 6, width: 1080, height: 1920 },
  tc4: { name: "LinkedIn Profile Hacks", platform: "tiktok", slideCount: 6, width: 1080, height: 1920 },
  ic1: { name: "Career Growth Roadmap", platform: "instagram", slideCount: 6, width: 1080, height: 1350 },
  ic2: { name: "Cover Letter Formula", platform: "instagram", slideCount: 6, width: 1080, height: 1350 },
  ic3: { name: "Remote Work Guide", platform: "instagram", slideCount: 6, width: 1080, height: 1350 },
  ic4: { name: "Personal Brand Blueprint", platform: "instagram", slideCount: 6, width: 1080, height: 1350 },
};

/* ============================================================
   THEME SYSTEM — color palettes for each carousel
   ============================================================ */

interface Theme {
  bg: string;
  gradBg: string;          // # CTA slide gradient background
  tx: string;              // # Primary text
  t2: string;              // # Secondary text
  t3: string;              // # Faint text
  ac: string;              // # Accent
  al: string;              // # Accent light
  sf: string;              // # Surface/card bg
  mode: "d" | "l";         // # Dark or light (affects brand strip)
  serif?: boolean;         // # Use serif font for headings
}

const THEMES: Record<CarouselId, Theme> = {
  lc1: { bg: "#08090E", gradBg: "linear-gradient(145deg,#1E1B4B,#312E81)", tx: "#fff", t2: "rgba(255,255,255,.4)", t3: "rgba(255,255,255,.3)", ac: "#6366F1", al: "#A78BFA", sf: "rgba(99,102,241,.06)", mode: "d" },
  lc2: { bg: "#0F766E", gradBg: "linear-gradient(180deg,#0F766E,#0D9488)", tx: "#fff", t2: "rgba(255,255,255,.45)", t3: "rgba(255,255,255,.3)", ac: "#5EEAD4", al: "#99F6E4", sf: "rgba(255,255,255,.08)", mode: "d" },
  lc3: { bg: "#FDF6EC", gradBg: "#FDF6EC", tx: "#1C1917", t2: "#78716C", t3: "#A8A29E", ac: "#B8860B", al: "#D4A843", sf: "#fff", mode: "l", serif: true },
  lc4: { bg: "#2E1065", gradBg: "linear-gradient(145deg,#2E1065,#4C1D95)", tx: "#fff", t2: "rgba(255,255,255,.4)", t3: "rgba(255,255,255,.3)", ac: "#C084FC", al: "#E9D5FF", sf: "rgba(192,132,252,.08)", mode: "d" },
  tc1: { bg: "#08090E", gradBg: "linear-gradient(180deg,#08090E,#1E1B4B)", tx: "#fff", t2: "rgba(255,255,255,.35)", t3: "rgba(255,255,255,.25)", ac: "#EF4444", al: "#FCA5A5", sf: "rgba(239,68,68,.06)", mode: "d" },
  tc2: { bg: "#022C22", gradBg: "linear-gradient(180deg,#022C22,#064E3B)", tx: "#fff", t2: "rgba(255,255,255,.5)", t3: "rgba(255,255,255,.3)", ac: "#34D399", al: "#6EE7B7", sf: "rgba(52,211,153,.06)", mode: "d" },
  tc3: { bg: "#78350F", gradBg: "linear-gradient(180deg,#78350F,#92400E)", tx: "#fff", t2: "rgba(255,255,255,.5)", t3: "rgba(255,255,255,.3)", ac: "#FBBF24", al: "#FDE68A", sf: "rgba(251,191,36,.08)", mode: "d" },
  tc4: { bg: "#1E293B", gradBg: "linear-gradient(180deg,#1E293B,#0F172A)", tx: "#fff", t2: "rgba(255,255,255,.35)", t3: "rgba(255,255,255,.25)", ac: "#38BDF8", al: "#7DD3FC", sf: "rgba(56,189,248,.06)", mode: "d" },
  ic1: { bg: "linear-gradient(145deg,#1E1B4B,#312E81)", gradBg: "linear-gradient(145deg,#312E81,#4C1D95)", tx: "#fff", t2: "rgba(255,255,255,.4)", t3: "rgba(255,255,255,.3)", ac: "#6366F1", al: "#A5B4FC", sf: "rgba(99,102,241,.06)", mode: "d" },
  ic2: { bg: "#FAFAFA", gradBg: "#FAFAFA", tx: "#18181B", t2: "#71717A", t3: "#A1A1AA", ac: "#18181B", al: "#3F3F46", sf: "#F4F4F5", mode: "l" },
  ic3: { bg: "#083344", gradBg: "linear-gradient(180deg,#083344,#164E63)", tx: "#fff", t2: "rgba(255,255,255,.4)", t3: "rgba(255,255,255,.3)", ac: "#22D3EE", al: "#67E8F9", sf: "rgba(34,211,238,.06)", mode: "d" },
  ic4: { bg: "#0F172A", gradBg: "linear-gradient(180deg,#0F172A,#1E293B)", tx: "#fff", t2: "rgba(255,255,255,.4)", t3: "rgba(255,255,255,.3)", ac: "#F59E0B", al: "#FCD34D", sf: "rgba(245,158,11,.06)", mode: "d" },
};

/* ============================================================
   WRAPPER — scales preview-size slide to production dimensions
   ============================================================ */

// # Preview dimensions per platform
const PREVIEW: Record<string, { w: number; h: number }> = {
  linkedin: { w: 540, h: 540 },
  tiktok: { w: 540, h: 960 },
  instagram: { w: 540, h: 675 },
};

// # Wrap a slide body in a full HTML page at target dimensions
function wrapSlide(
  platform: string,
  bg: string,
  body: string,
  targetW: number,
  targetH: number,
): string {
  const pv = PREVIEW[platform];
  const scale = targetW / pv.w;
  // # Detect gradient vs solid bg
  const bgProp = bg.includes("gradient") ? `background:${bg}` : `background:${bg}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${targetW}px;height:${targetH}px;overflow:hidden;background:#000;}
body{font-family:${FONT_STACK};}
.sw{width:${pv.w}px;height:${pv.h}px;transform:scale(${scale});transform-origin:top left;}
.sl{width:${pv.w}px;height:${pv.h}px;${bgProp};display:flex;flex-direction:column;padding:40px 44px;position:relative;overflow:hidden;}
</style></head><body>
<div class="sw"><div class="sl">${body}</div></div>
</body></html>`;
}

/* ============================================================
   REUSABLE SLIDE COMPONENTS
   ============================================================ */

// # Brand strip footer — adapts to dark/light mode
function footer(t: Theme): string {
  const nameColor = t.mode === "d" ? "rgba(255,255,255,.25)" : "#999";
  const urlColor = t.mode === "d" ? "rgba(255,255,255,.12)" : "#C0BDB5";
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;">
    <div style="width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,.12);display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;">
    </div>
    <span style="font-size:10px;font-weight:700;letter-spacing:-.01em;color:${nameColor};">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:.02em;color:${urlColor};">jobpilotai.co</span>
  </div>`;
}

// # Dot indicators showing current slide position
function dots(total: number, active: number, color: string): string {
  let h = '<div style="display:flex;gap:4px;justify-content:center;padding:6px 0 0;">';
  for (let i = 0; i < total; i++) {
    const c = i === active ? color : "rgba(128,128,128,.25)";
    h += `<span style="width:6px;height:6px;border-radius:50%;background:${c};"></span>`;
  }
  return h + "</div>";
}

// # Eyebrow label with dash
function eyebrow(text: string, color: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${color};display:flex;align-items:center;gap:8px;">
    <span style="width:14px;height:2px;background:${color};border-radius:1px;display:inline-block;"></span>
    ${text}
  </div>`;
}

// # Slide number badge (top-right corner)
function slideNum(current: number, total: number): string {
  return `<div style="position:absolute;top:16px;right:16px;font-size:10px;font-weight:700;color:rgba(255,255,255,.2);">${current}/${total}</div>`;
}

// # Heading — uses serif or sans based on theme
function heading(text: string, t: Theme, size = 34): string {
  const font = t.serif ? "Georgia,'Times New Roman',serif" : "inherit";
  const weight = t.serif ? 700 : 800;
  return `<div style="font-size:${size}px;font-weight:${weight};letter-spacing:-.03em;line-height:1.15;color:${t.tx};${t.serif ? `font-family:${font};` : ""}">${text}</div>`;
}

/* ============================================================
   COVER SLIDE — hook title + "Swipe →" indicator
   ============================================================ */
function buildCover(
  t: Theme,
  platform: string,
  title: string,
  subtitle: string,
  emoji: string,
  total: number,
): string {
  const s = esc(subtitle);
  // # TikTok gets emoji above title, others get it inline
  const emojiBlock = emoji ? `<div style="font-size:${platform === "tiktok" ? 48 : 36}px;margin-bottom:8px;">${emoji}</div>` : "";
  const titleHtml = title.replace(/\{ac\}(.*?)\{\/ac\}/g, `<span style="color:${t.al};">$1</span>`);
  const headSize = platform === "tiktok" ? 42 : platform === "instagram" ? 38 : 34;
  const subSize = platform === "tiktok" ? 16 : 13;

  return `
    ${emojiBlock}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;${platform !== "linkedin" ? "" : "align-items:center;text-align:center;"}">
      ${heading(titleHtml, t, headSize)}
      ${s ? `<div style="width:24px;height:2px;background:${t.ac};border-radius:1px;margin:12px ${platform === "linkedin" ? "auto" : "0"};"></div>` : ""}
      ${s ? `<div style="font-size:${subSize}px;color:${t.t3};margin-top:4px;">${s}</div>` : ""}
    </div>
    ${dots(total, 0, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   NUMBERED CONTENT SLIDE — label + heading + body
   ============================================================ */
function buildNumbered(
  t: Theme,
  platform: string,
  label: string,
  title: string,
  body: string,
  bodyBold: string | undefined,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 32 : platform === "instagram" ? 28 : 26;
  const bodySize = platform === "tiktok" ? 16 : 13;
  const bodyHtml = bodyBold
    ? esc(body).replace(esc(bodyBold), `<b style="color:${t.tx};">${esc(bodyBold)}</b>`)
    : esc(body);

  return `
    <div style="font-size:${platform === "tiktok" ? 13 : 11}px;font-weight:700;color:${t.ac};letter-spacing:.1em;text-transform:uppercase;">${esc(label)}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="margin-top:12px;font-size:${bodySize}px;color:${t.t2};line-height:1.55;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   BEFORE/AFTER COMPARISON SLIDE
   ============================================================ */
function buildComparison(
  t: Theme,
  platform: string,
  beforeText: string,
  afterText: string,
  slideIdx: number,
  total: number,
): string {
  const fs = platform === "tiktok" ? 14 : 12;
  const lblFs = platform === "tiktok" ? 12 : 10;
  return `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;">
      <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:8px;padding:16px;">
        <div style="font-size:${lblFs}px;font-weight:800;color:#F87171;letter-spacing:.08em;margin-bottom:6px;">❌ BEFORE</div>
        <div style="font-size:${fs}px;color:${t.t2};line-height:1.45;">${esc(beforeText)}</div>
      </div>
      <div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:8px;padding:16px;">
        <div style="font-size:${lblFs}px;font-weight:800;color:#34D399;letter-spacing:.08em;margin-bottom:6px;">✅ AFTER</div>
        <div style="font-size:${fs}px;color:${t.t2};line-height:1.45;">${esc(afterText)}</div>
      </div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   STEP SLIDE — numbered circle + title + description
   ============================================================ */
function buildStep(
  t: Theme,
  platform: string,
  stepNum: number,
  stepLabel: string,
  title: string,
  body: string,
  bodyBold: string | undefined,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 32 : platform === "instagram" ? 28 : 26;
  const bodySize = platform === "tiktok" ? 16 : 13;
  const bodyHtml = bodyBold
    ? esc(body).replace(esc(bodyBold), `<b style="color:${t.tx};">${esc(bodyBold)}</b>`)
    : esc(body);

  return `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="background:${t.sf};border-radius:6px;padding:6px 10px;">
        <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.08em;">${esc(stepLabel)}</div>
      </div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="font-size:${bodySize}px;color:${t.t2};line-height:1.55;margin-top:12px;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   FORMULA/TIP BOX SLIDE — question + boxed formula
   ============================================================ */
function buildFormula(
  t: Theme,
  platform: string,
  label: string,
  question: string,
  formula: string,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 28 : 24;
  const bodySize = platform === "tiktok" ? 14 : 12;
  return `
    <div style="font-size:${platform === "tiktok" ? 13 : 11}px;font-weight:700;color:${t.ac};letter-spacing:.1em;">${esc(label)}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(question), t, headSize)}
      <div style="background:${t.sf};border-radius:8px;padding:14px 16px;margin-top:14px;">
        <div style="font-size:${platform === "tiktok" ? 12 : 10}px;font-weight:700;color:${t.ac};margin-bottom:6px;">FORMULA:</div>
        <div style="font-size:${bodySize}px;color:${t.t2};line-height:1.55;">${esc(formula)}</div>
      </div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   STAT SLIDE — big number + context
   ============================================================ */
function buildStat(
  t: Theme,
  platform: string,
  label: string,
  stats: { value: string; desc: string }[],
  slideIdx: number,
  total: number,
): string {
  const numSize = platform === "tiktok" ? 64 : 52;
  const descSize = platform === "tiktok" ? 16 : 13;
  return `
    <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.08em;">${esc(label)}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px;">
      ${stats.map(s => `
        <div>
          <div style="font-size:${numSize}px;font-weight:900;color:${t.ac};letter-spacing:-.04em;line-height:1;">${esc(s.value)}</div>
          <div style="font-size:${descSize}px;color:${t.t2};margin-top:4px;">${esc(s.desc)}</div>
        </div>
      `).join("")}
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   LETTER SLIDE — large decorative letter (STAR method)
   ============================================================ */
function buildLetter(
  t: Theme,
  letter: string,
  word: string,
  body: string,
  bodyBold: string | undefined,
  slideIdx: number,
  total: number,
): string {
  const bodyHtml = bodyBold
    ? esc(body).replace(esc(bodyBold), `<b style="color:${t.tx};">${esc(bodyBold)}</b>`)
    : esc(body);
  return `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:72px;font-weight:900;color:${t.ac};opacity:.15;line-height:.9;">${esc(letter)}</div>
      ${heading(esc(word), t, 28)}
      <div style="font-size:13px;color:${t.t2};line-height:1.55;margin-top:12px;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   HACK SLIDE — labeled tip with good/bad examples
   ============================================================ */
function buildHack(
  t: Theme,
  platform: string,
  label: string,
  title: string,
  body: string,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 30 : 26;
  const bodySize = platform === "tiktok" ? 14 : 12;
  // # Body supports inline ❌/✅ markers
  const bodyHtml = esc(body)
    .replace(/❌/g, `<b style="color:#F87171;">❌</b>`)
    .replace(/✅/g, `<b style="color:${t.ac};">✅</b>`);

  return `
    <div style="background:${t.sf};border-radius:6px;padding:6px 10px;width:fit-content;">
      <div style="font-size:${platform === "tiktok" ? 13 : 11}px;font-weight:700;color:${t.ac};">${esc(label)}</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="font-size:${bodySize}px;color:${t.t2};line-height:1.55;margin-top:12px;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   LIST SLIDE — bullet points with dot markers
   ============================================================ */
function buildList(
  t: Theme,
  platform: string,
  label: string,
  title: string,
  items: { text: string; muted?: boolean }[],
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 28 : 24;
  const itemSize = platform === "tiktok" ? 16 : 13;
  return `
    <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.08em;">${esc(label)}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
        ${items.map(it => {
          const color = it.muted ? t.t3 : t.tx;
          const dotColor = it.muted ? "rgba(128,128,128,.25)" : t.ac;
          return `<div style="display:flex;gap:8px;align-items:center;">
            <div style="width:6px;height:6px;border-radius:50%;background:${dotColor};flex-shrink:0;"></div>
            <div style="font-size:${itemSize}px;font-weight:600;color:${color};">${esc(it.text)}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   PARAGRAPH SLIDE — labeled section (cover letter formula)
   ============================================================ */
function buildParagraph(
  t: Theme,
  platform: string,
  label: string,
  title: string,
  body: string,
  bodyBold: string | undefined,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 30 : platform === "instagram" ? 28 : 26;
  const bodySize = platform === "tiktok" ? 16 : 13;
  const bodyHtml = bodyBold
    ? esc(body).replace(esc(bodyBold), `<b style="color:${t.tx};">${esc(bodyBold)}</b>`)
    : esc(body);

  return `
    <div style="background:${t.sf};border-radius:6px;padding:6px 10px;width:fit-content;">
      <div style="font-size:11px;font-weight:700;color:${t.ac};">${esc(label)}</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="font-size:${bodySize}px;color:${t.t2};line-height:1.55;margin-top:12px;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   PILLAR SLIDE — content with eyebrow label (personal brand)
   ============================================================ */
function buildPillar(
  t: Theme,
  platform: string,
  label: string,
  title: string,
  body: string,
  bodyBold: string | undefined,
  slideIdx: number,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 30 : platform === "instagram" ? 28 : 26;
  const bodySize = platform === "tiktok" ? 16 : 13;
  const bodyHtml = bodyBold
    ? esc(body).replace(esc(bodyBold), `<b style="color:${t.tx};">${esc(bodyBold)}</b>`)
    : esc(body);

  return `
    <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.08em;">${esc(label)}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${heading(esc(title), t, headSize)}
      <div style="font-size:${bodySize}px;color:${t.t2};line-height:1.55;margin-top:12px;">${bodyHtml}</div>
    </div>
    ${dots(total, slideIdx, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   CTA SLIDE — closing call-to-action
   ============================================================ */
function buildCTA(
  t: Theme,
  platform: string,
  title: string,
  subtitle: string,
  buttonText: string,
  total: number,
): string {
  const headSize = platform === "tiktok" ? 30 : platform === "instagram" ? 28 : 26;
  const subSize = platform === "tiktok" ? 14 : 12;
  const titleHtml = title.replace(/\{ac\}(.*?)\{\/ac\}/g, `<span style="color:${t.al};">$1</span>`);
  const btnBg = t.mode === "d" ? "rgba(255,255,255,.15)" : t.ac;
  const btnColor = t.mode === "d" ? "#fff" : "#fff";

  return `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
      ${heading(titleHtml, t, headSize)}
      ${subtitle ? `<div style="font-size:${subSize}px;color:${t.t3};margin-top:8px;">${esc(subtitle)}</div>` : ""}
      <div style="margin-top:16px;padding:8px 24px;background:${btnBg};border-radius:8px;font-size:${platform === "tiktok" ? 16 : 14}px;font-weight:700;color:${btnColor};">${esc(buttonText)}</div>
    </div>
    ${dots(total, total - 1, t.ac)}
    ${footer(t)}`;
}

/* ============================================================
   CAROUSEL SLIDE BUILDERS — one function per carousel
   ============================================================
   # Each takes (slideIndex, content, width, height) and returns
   # a complete HTML document ready for Puppeteer screenshot.
   # Content fields used vary by carousel design.
   ============================================================ */

// # LC1: 5 Resume Mistakes (LinkedIn 1:1, 7 slides, dark/indigo)
function buildLC1(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.lc1;
  const slides = c.slides || [];
  const total = 7;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "linkedin", c.coverTitle || "5\nResume Mistakes\nCosting You Interviews", c.coverSubtitle || "Swipe to learn →", "", total);
  } else if (si >= 1 && si <= 5) {
    const s = slides[si - 1] || { heading: "", body: "", label: `MISTAKE #${si}` };
    body = buildNumbered(t, "linkedin", s.label || `MISTAKE #${si}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "linkedin", c.ctaTitle || "Fix All 5 in\n{ac}6 Seconds{/ac}", c.ctaSubtitle || "", c.ctaButton || "Try JobPilot AI Free →", total);
  }

  return wrapSlide("linkedin", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # LC2: ATS Optimization Guide (LinkedIn 1:1, 6 slides, teal)
function buildLC2(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.lc2;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "linkedin", c.coverTitle || "How to Beat\nthe ATS in\n{ac}2026{/ac}", c.coverSubtitle || "", "", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `STEP ${si}` };
    body = buildStep(t, "linkedin", si, s.label || `STEP ${si}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "linkedin", c.ctaTitle || "Or Let AI\nDo It For You", c.ctaSubtitle || "Upload → Paste job URL → Done", c.ctaButton || "jobpilotai.co →", total);
  }

  return wrapSlide("linkedin", t.bg, body, w, h);
}

// # LC3: Interview Prep / STAR Method (LinkedIn 1:1, 6 slides, cream/serif)
function buildLC3(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.lc3;
  const slides = c.slides || [];
  const total = 6;
  const letters = ["S", "T", "A", "R"];
  let body: string;

  if (si === 0) {
    body = buildCover(t, "linkedin", c.coverTitle || "The STAR Method\n— {ac}Decoded{/ac}", c.coverSubtitle || "", "", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: letters[si - 1], body: "" };
    body = buildLetter(t, letters[si - 1], s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "linkedin", c.ctaTitle || "Practice with\n{ac}AI Interview Coach{/ac}", c.ctaSubtitle || "Real questions. Real-time feedback.", c.ctaButton || "Start Practicing →", total);
  }

  return wrapSlide("linkedin", t.bg, body, w, h);
}

// # LC4: Salary Negotiation (LinkedIn 1:1, 6 slides, violet)
function buildLC4(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.lc4;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "linkedin", c.coverTitle || "$$$\nSalary\nNegotiation\nPlaybook", c.coverSubtitle || "", "", total);
  } else if (si === 1) {
    const s = slides[0] || { heading: "", body: "", label: "THE DATA" };
    body = buildStat(t, "linkedin", s.label || "THE DATA", [
      { value: "73%", desc: "of employers expect you to negotiate" },
      { value: "$7.5K", desc: "average increase from one conversation" },
    ], si, total);
  } else if (si >= 2 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `RULE #${si - 1}` };
    body = buildNumbered(t, "linkedin", s.label || `RULE #${si - 1}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "linkedin", c.ctaTitle || "Know Your Worth\n{ac}Before You Ask{/ac}", c.ctaSubtitle || "AI-powered salary insights", c.ctaButton || "Check Now →", total);
  }

  return wrapSlide("linkedin", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # TC1: Job Search Red Flags (TikTok 9:16, 6 slides, dark/red)
function buildTC1(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.tc1;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "tiktok", c.coverTitle || "Red Flags in\nJob Postings", c.coverSubtitle || "Swipe if you don't wanna\nget scammed →", "🚩", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `🚩 FLAG #${si}` };
    body = buildNumbered(t, "tiktok", s.label || `🚩 FLAG #${si}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "tiktok", c.ctaTitle || "Let AI Scan\nJob Posts\n{ac}For You{/ac}", c.ctaSubtitle || "", c.ctaButton || "Link in bio ↓", total);
  }

  return wrapSlide("tiktok", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # TC2: Resume Glow-Up (TikTok 9:16, 5 slides, emerald)
function buildTC2(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.tc2;
  const slides = c.slides || [];
  const total = 5;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "tiktok", c.coverTitle || "Resume\n{ac}Glow-Up{/ac}", c.coverSubtitle || "Before vs After →", "✨", total);
  } else if (si >= 1 && si <= 3) {
    const s = slides[si - 1] || { before: "", after: "" };
    body = buildComparison(t, "tiktok", s.before || "", s.after || "", si, total);
  } else {
    body = buildCTA(t, "tiktok", c.ctaTitle || "Get Your\n{ac}Free Glow-Up{/ac}", c.ctaSubtitle || "AI rewrites your bullets in seconds", c.ctaButton || "jobpilotai.co →", total);
  }

  return wrapSlide("tiktok", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # TC3: Interview Cheat Sheet (TikTok 9:16, 6 slides, amber)
function buildTC3(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.tc3;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "tiktok", c.coverTitle || "Interview\n{ac}Cheat Sheet{/ac}", c.coverSubtitle || "Save this for later →", "🗣️", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `Q${si}` };
    body = buildFormula(t, "tiktok", s.label || `Q${si}`, s.heading, s.body, si, total);
  } else {
    body = buildCTA(t, "tiktok", c.ctaTitle || "Practice with\n{ac}AI Coach{/ac}", c.ctaSubtitle || "Get real-time feedback on your answers", c.ctaButton || "Link in bio ↓", total);
  }

  return wrapSlide("tiktok", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # TC4: LinkedIn Profile Hacks (TikTok 9:16, 6 slides, navy/blue)
function buildTC4(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.tc4;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "tiktok", c.coverTitle || "LinkedIn\n{ac}Profile Hacks{/ac}", c.coverSubtitle || "5 changes, 10 mins →", "💼", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "" };
    const label = si <= 3 ? `HACK ${si}` : "HACK 4 & 5";
    body = buildHack(t, "tiktok", s.label || label, s.heading, s.body, si, total);
  } else {
    body = buildCTA(t, "tiktok", c.ctaTitle || "Optimize Your\n{ac}Whole Profile{/ac}", c.ctaSubtitle || "AI analyzes what recruiters see", c.ctaButton || "jobpilotai.co →", total);
  }

  return wrapSlide("tiktok", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # IC1: Career Growth Roadmap (Instagram 4:5, 6 slides, gradient/indigo)
function buildIC1(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.ic1;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "instagram", c.coverTitle || "Your First\n{ac}$100K{/ac} Job", c.coverSubtitle || "6 steps. No shortcuts. →", "", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: "" };
    body = `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:24px;height:24px;border-radius:50%;background:${t.ac};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;">${si}</div>
        <div style="font-size:12px;font-weight:700;color:${t.al};">${esc(s.label || "")}</div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        ${heading(esc(s.heading), t, 28)}
        <div style="font-size:13px;color:${t.t2};line-height:1.55;margin-top:12px;">${esc(s.body)}</div>
      </div>
      ${dots(total, si, t.ac)}
      ${footer(t)}`;
  } else {
    body = buildCTA(t, "instagram", c.ctaTitle || "Start\n{ac}Step 1{/ac}\nToday", c.ctaSubtitle || "", c.ctaButton || "jobpilotai.co →", total);
  }

  return wrapSlide("instagram", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # IC2: Cover Letter Formula (Instagram 4:5, 6 slides, minimal/light)
function buildIC2(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.ic2;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.12em;">THE FORMULA</div>
        ${heading(esc(c.coverTitle || "Cover Letter\nThat Gets Read"), t, 38)}
        <div style="width:24px;height:3px;background:${t.ac};border-radius:1px;margin-top:12px;"></div>
      </div>
      ${dots(total, 0, t.ac)}
      ${footer(t)}`;
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `PARAGRAPH ${si}` };
    body = buildParagraph(t, "instagram", s.label || `PARAGRAPH ${si}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "instagram", c.ctaTitle || "Generate Yours\nin 30 Seconds", c.ctaSubtitle || "AI writes it. You own it.", c.ctaButton || "Try Free →", total);
  }

  return wrapSlide("instagram", t.bg, body, w, h);
}

// # IC3: Remote Work Guide (Instagram 4:5, 6 slides, cyan dark)
function buildIC3(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.ic3;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "instagram", c.coverTitle || "Land a\n{ac}Remote{/ac}\nJob", c.coverSubtitle || "", "", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: "" };
    if (s.items && s.items.length > 0) {
      body = buildList(t, "instagram", s.label || "", s.heading, s.items.map(it => ({ text: it })), si, total);
    } else if (si === 4) {
      // # Stat slide for the "3x" data point
      body = buildStat(t, "instagram", s.label || "PRO TIP", [
        { value: s.heading || "3×", desc: s.body || "more interviews when your resume mentions remote-specific skills" },
      ], si, total);
    } else {
      body = buildNumbered(t, "instagram", s.label || "", s.heading, s.body, s.bodyBold, si, total);
    }
  } else {
    body = buildCTA(t, "instagram", c.ctaTitle || "Optimize for\n{ac}Remote Roles{/ac}", c.ctaSubtitle || "AI tailors your resume to remote jobs", c.ctaButton || "Start Free →", total);
  }

  return wrapSlide("instagram", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

// # IC4: Personal Brand Blueprint (Instagram 4:5, 6 slides, slate/amber)
function buildIC4(si: number, c: CarouselContent, w: number, h: number): string {
  const t = THEMES.ic4;
  const slides = c.slides || [];
  const total = 6;
  let body: string;

  if (si === 0) {
    body = buildCover(t, "instagram", c.coverTitle || "Build Your\n{ac}Personal{/ac}\nBrand", c.coverSubtitle || "", "", total);
  } else if (si >= 1 && si <= 4) {
    const s = slides[si - 1] || { heading: "", body: "", label: `PILLAR ${si}` };
    body = buildPillar(t, "instagram", s.label || `PILLAR ${si}`, s.heading, s.body, s.bodyBold, si, total);
  } else {
    body = buildCTA(t, "instagram", c.ctaTitle || "Start With\nYour {ac}Resume{/ac}", c.ctaSubtitle || "Your brand starts with how you present yourself", c.ctaButton || "jobpilotai.co →", total);
  }

  return wrapSlide("instagram", si === total - 1 ? t.gradBg : t.bg, body, w, h);
}

/* ============================================================
   MAIN ROUTER — builds any carousel slide by ID + index
   ============================================================ */

// # Maps carousel ID to its builder function
const BUILDERS: Record<CarouselId, (si: number, c: CarouselContent, w: number, h: number) => string> = {
  lc1: buildLC1, lc2: buildLC2, lc3: buildLC3, lc4: buildLC4,
  tc1: buildTC1, tc2: buildTC2, tc3: buildTC3, tc4: buildTC4,
  ic1: buildIC1, ic2: buildIC2, ic3: buildIC3, ic4: buildIC4,
};

// # Build a single carousel slide HTML page
// # slideIndex is 0-based (0 = cover, last = CTA)
export function buildCarouselSlide(
  carouselId: CarouselId,
  slideIndex: number,
  content: CarouselContent,
  width?: number,
  height?: number,
): string {
  const meta = CAROUSEL_META[carouselId];
  if (!meta) throw new Error(`Unknown carousel: ${carouselId}`);

  if (slideIndex < 0 || slideIndex >= meta.slideCount) {
    throw new Error(`Slide index ${slideIndex} out of range for ${carouselId} (0-${meta.slideCount - 1})`);
  }

  const w = width || meta.width;
  const h = height || meta.height;
  return BUILDERS[carouselId](slideIndex, content, w, h);
}

// # Build all slides for a carousel, returns array of HTML strings
export function buildCarouselAllSlides(
  carouselId: CarouselId,
  content: CarouselContent,
  width?: number,
  height?: number,
): string[] {
  const meta = CAROUSEL_META[carouselId];
  if (!meta) throw new Error(`Unknown carousel: ${carouselId}`);

  const w = width || meta.width;
  const h = height || meta.height;
  const slides: string[] = [];

  for (let i = 0; i < meta.slideCount; i++) {
    slides.push(BUILDERS[carouselId](i, content, w, h));
  }

  return slides;
}

// # Check if a string is a carousel ID
export function isCarouselId(id: string): id is CarouselId {
  return CAROUSEL_IDS.includes(id as CarouselId);
}
