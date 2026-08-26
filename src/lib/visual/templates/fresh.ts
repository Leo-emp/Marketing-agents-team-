/* ============================================================
   FRESH TEMPLATES — 36 unique single-image designs
   ============================================================
   # T151-T162: Fresh LinkedIn (4:5 — 1080×1350)
   # T163-T174: Fresh TikTok (9:16 — 1080×1920)
   # T175-T186: Fresh Instagram (mixed: 4:5, 1:1, 9:16)
   #
   # Each template has a unique color palette and layout.
   # Preview scale renders at half-size, wrapPage scales 2× for
   # Puppeteer screenshot to production dimensions.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, FONT_STACK, MONO_STACK, esc } from "./shared";

// # All fresh template IDs
export const FRESH_IDS: TemplateId[] = [
  "t151","t152","t153","t154","t155","t156","t157","t158","t159","t160","t161","t162",
  "t163","t164","t165","t166","t167","t168","t169","t170","t171","t172","t173","t174",
  "t175","t176","t177","t178","t179","t180","t181","t182","t183","t184","t185","t186",
];

/* ============================================================
   THEME INTERFACE + PALETTES
   ============================================================ */
interface FTheme {
  bg: string;    // # Background color/gradient
  tx: string;    // # Primary text
  t2: string;    // # Secondary text
  t3: string;    // # Muted text
  ac: string;    // # Accent
  al: string;    // # Accent light
  sf: string;    // # Surface
  br: string;    // # Border
  mode: "d"|"l"; // # Dark or light
}

const T: Record<string, FTheme> = {
  g1:  { bg: "linear-gradient(145deg,#1E1B4B,#312E81,#3B1F7E)", tx: "#fff", t2: "rgba(255,255,255,.55)", t3: "rgba(255,255,255,.3)", ac: "#A78BFA", al: "#A5B4FC", sf: "rgba(167,139,250,.12)", br: "rgba(255,255,255,.1)", mode: "d" },
  tl:  { bg: "#0F766E", tx: "#fff", t2: "rgba(255,255,255,.6)", t3: "rgba(255,255,255,.35)", ac: "#5EEAD4", al: "#99F6E4", sf: "rgba(94,234,212,.08)", br: "rgba(255,255,255,.12)", mode: "d" },
  nv:  { bg: "#1E293B", tx: "#fff", t2: "rgba(255,255,255,.5)", t3: "rgba(255,255,255,.3)", ac: "#38BDF8", al: "#7DD3FC", sf: "rgba(56,189,248,.06)", br: "rgba(255,255,255,.1)", mode: "d" },
  rs:  { bg: "#881337", tx: "#fff", t2: "rgba(255,255,255,.6)", t3: "rgba(255,255,255,.3)", ac: "#FDA4AF", al: "#FECDD3", sf: "rgba(253,164,175,.08)", br: "rgba(255,255,255,.12)", mode: "d" },
  cr:  { bg: "#FDF6EC", tx: "#1C1917", t2: "#78716C", t3: "#A8A29E", ac: "#B8860B", al: "#D4A843", sf: "#fff", br: "#E7E0D2", mode: "l" },
  mn:  { bg: "#FAFAFA", tx: "#18181B", t2: "#71717A", t3: "#A1A1AA", ac: "#18181B", al: "#3F3F46", sf: "#F4F4F5", br: "#E4E4E7", mode: "l" },
  em:  { bg: "#022C22", tx: "#fff", t2: "rgba(255,255,255,.5)", t3: "rgba(255,255,255,.3)", ac: "#34D399", al: "#6EE7B7", sf: "rgba(52,211,153,.06)", br: "rgba(255,255,255,.08)", mode: "d" },
  vt:  { bg: "#2E1065", tx: "#fff", t2: "rgba(255,255,255,.55)", t3: "rgba(255,255,255,.3)", ac: "#C084FC", al: "#E9D5FF", sf: "rgba(192,132,252,.08)", br: "rgba(255,255,255,.1)", mode: "d" },
  dk:  { bg: "#08090E", tx: "#E4E2DD", t2: "#8B8A9A", t3: "#5A596E", ac: "#6366F1", al: "#A78BFA", sf: "#10111A", br: "#1E1F2E", mode: "d" },
  br:  { bg: "#1E1B4B", tx: "#fff", t2: "rgba(255,255,255,.55)", t3: "rgba(255,255,255,.3)", ac: "#A78BFA", al: "#A5B4FC", sf: "#2E2969", br: "#3D3680", mode: "d" },
  lt:  { bg: "#F8F7F4", tx: "#1A1A1A", t2: "#6B6B6B", t3: "#8A8A8A", ac: "#6366F1", al: "#A78BFA", sf: "#fff", br: "#E2E0DB", mode: "l" },
  lw:  { bg: "#FFFFFF", tx: "#1A1A1A", t2: "#6B6B6B", t3: "#8A8A8A", ac: "#6366F1", al: "#A78BFA", sf: "#F8F7F4", br: "#E8E5DE", mode: "l" },
  am:  { bg: "#78350F", tx: "#fff", t2: "rgba(255,255,255,.6)", t3: "rgba(255,255,255,.3)", ac: "#FBBF24", al: "#FDE68A", sf: "rgba(251,191,36,.08)", br: "rgba(255,255,255,.12)", mode: "d" },
  sl:  { bg: "#0F172A", tx: "#fff", t2: "rgba(255,255,255,.45)", t3: "rgba(255,255,255,.25)", ac: "#94A3B8", al: "#CBD5E1", sf: "rgba(148,163,184,.06)", br: "rgba(255,255,255,.08)", mode: "d" },
  cy:  { bg: "#083344", tx: "#fff", t2: "rgba(255,255,255,.55)", t3: "rgba(255,255,255,.3)", ac: "#22D3EE", al: "#67E8F9", sf: "rgba(34,211,238,.06)", br: "rgba(255,255,255,.1)", mode: "d" },
  gd:  { bg: "linear-gradient(160deg,#6366F1,#A78BFA,#EC4899)", tx: "#fff", t2: "rgba(255,255,255,.7)", t3: "rgba(255,255,255,.4)", ac: "#fff", al: "rgba(255,255,255,.8)", sf: "rgba(255,255,255,.1)", br: "rgba(255,255,255,.15)", mode: "d" },
  g2:  { bg: "linear-gradient(145deg,#1E1B4B,#312E81,#3B1F7E)", tx: "#fff", t2: "rgba(255,255,255,.55)", t3: "rgba(255,255,255,.3)", ac: "#A78BFA", al: "#A5B4FC", sf: "rgba(167,139,250,.12)", br: "rgba(255,255,255,.1)", mode: "d" },
};

/* ============================================================
   WRAPPER + SHARED COMPONENTS
   ============================================================ */

// # Wrap template body at preview scale → target dimensions
function wrap(
  theme: FTheme,
  body: string,
  pvW: number,
  pvH: number,
  tW: number,
  tH: number,
): string {
  const sc = tW / pvW;
  const bgProp = theme.bg.includes("gradient") ? `background:${theme.bg}` : `background:${theme.bg}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${tW}px;height:${tH}px;overflow:hidden;background:#000;}
body{font-family:${FONT_STACK};}
.sw{width:${pvW}px;height:${pvH}px;transform:scale(${sc});transform-origin:top left;}
.tpl{width:${pvW}px;height:${pvH}px;${bgProp};display:flex;flex-direction:column;padding:40px 44px;position:relative;overflow:hidden;}
em{font-style:normal;}
</style></head><body>
<div class="sw"><div class="tpl">${body}</div></div>
</body></html>`;
}

// # Footer — brand strip
function ft(t: FTheme): string {
  const nc = t.mode === "d" ? "rgba(255,255,255,.25)" : "#999";
  const uc = t.mode === "d" ? "rgba(255,255,255,.12)" : "#C0BDB5";
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;">
    <div style="width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,.12);display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;">
    </div>
    <span style="font-size:10px;font-weight:700;letter-spacing:-.01em;color:${nc};">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:.02em;color:${uc};">jobpilotai.co</span>
  </div>`;
}

// # TikTok watermark footer (smaller, positioned at bottom)
function wm(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:6px;padding-top:12px;">
    <img src="${LOGO_DATA_URI}" alt="JP" style="width:14px;height:14px;border-radius:3px;">
    <span style="font-size:9px;font-weight:600;color:rgba(255,255,255,.35);">jobpilotai.co</span>
  </div>`;
}

// # Eyebrow with dash
function ey(text: string, color: string): string {
  return `<div style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${color};display:flex;align-items:center;gap:8px;margin-bottom:12px;">
    <span style="width:14px;height:2px;background:${color};border-radius:1px;display:inline-block;"></span>${esc(text)}</div>`;
}

// # Headline with optional highlight
function hd(text: string, color: string, highlight?: string, hlColor?: string, size = 34, weight = 800): string {
  let safe = esc(text);
  if (highlight && hlColor) {
    const safeHl = esc(highlight);
    if (safe.includes(safeHl)) safe = safe.replace(safeHl, `<em style="color:${hlColor};">${safeHl}</em>`);
  }
  return `<div style="font-size:${size}px;font-weight:${weight};letter-spacing:-.03em;line-height:1.15;color:${color};">${safe}</div>`;
}

// # Body text with optional bold phrase
function bd(text: string, color: string, boldPhrase?: string, boldColor?: string, size = 14): string {
  let safe = esc(text);
  if (boldPhrase && boldColor) {
    const safeBold = esc(boldPhrase);
    if (safe.includes(safeBold)) safe = safe.replace(safeBold, `<b style="color:${boldColor};">${safeBold}</b>`);
  }
  return `<div style="font-size:${size}px;color:${color};line-height:1.55;">${safe}</div>`;
}

/* ============================================================
   LINKEDIN FRESH TEMPLATES (T151-T162)
   Preview: 540×675 → 2× to 1080×1350
   ============================================================ */

const LI_PW = 540, LI_PH = 675;

// # T151 (F1) — Gradient Authority
function t151(c: TemplateContent, w: number, h: number): string {
  const t = T.g1;
  return wrap(t, `
    ${ey(c.eyebrow || "THE INSIGHT", "#A5B4FC")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline, "#fff", c.headlineHighlight, "#A5B4FC", 28)}
      <div style="width:24px;height:2px;background:linear-gradient(90deg,#A78BFA,#EC4899);border-radius:1px;margin:12px 0;"></div>
      ${c.body ? bd(c.body, "rgba(255,255,255,.55)", c.bodyBold, "rgba(255,255,255,.8)") : ""}
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T152 (F2) — Teal Metrics / Bar Chart
function t152(c: TemplateContent, w: number, h: number): string {
  const t = T.tl;
  const bars = c.bars || [
    { label: "Keywords", value: 94 },
    { label: "Impact", value: 87 },
    { label: "Format", value: 82 },
    { label: "Skills", value: 71 },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "YOUR RESULTS", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Resume Score Breakdown", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
        ${bars.map((b, i) => {
          const opacity = i <= 1 ? 1 : i === 2 ? 0.7 : 0.4;
          const gradient = i === 0 ? "background:linear-gradient(90deg,#0D9488,#5EEAD4)" : `background:#14B8A6;opacity:${opacity}`;
          const vc = i <= 2 ? t.ac : t.t2;
          return `<div style="display:flex;align-items:center;gap:8px;">
            <div style="font-size:12px;color:${t.t2};width:80px;text-align:right;flex-shrink:0;">${esc(b.label)}</div>
            <div style="flex:1;height:10px;border-radius:5px;background:${t.sf};overflow:hidden;">
              <div style="width:${b.value}%;height:100%;border-radius:5px;${gradient};"></div>
            </div>
            <div style="font-size:12px;font-weight:800;color:${vc};width:36px;text-align:right;">${b.value}%</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T153 (F3) — Navy Split
function t153(c: TemplateContent, w: number, h: number): string {
  const t = T.nv;
  return wrap(t, `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${ey(c.eyebrow || "TRUTH", "#7DD3FC")}
      ${hd(c.headline || "Your Resume Gets 6 Seconds.", "#fff", c.headlineHighlight || "6 Seconds.", "#38BDF8", 34)}
    </div>
    <div style="height:2px;background:linear-gradient(90deg,#38BDF8,transparent);border-radius:1px;margin:10px 0;"></div>
    ${c.body ? bd(c.body, "rgba(255,255,255,.5)", c.bodyBold, "rgba(255,255,255,.8)") : ""}
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T154 (F4) — Rose Hot Take
function t154(c: TemplateContent, w: number, h: number): string {
  const t = T.rs;
  return wrap(t, `
    ${ey(c.eyebrow || "HOT TAKE", "#FECDD3")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline, "#fff", c.headlineHighlight, "#FDA4AF", 28)}
    </div>
    <div style="width:24px;height:2px;background:#FDA4AF;border-radius:1px;margin:8px 0;"></div>
    ${c.body ? bd(c.body, "rgba(255,255,255,.55)", c.bodyBold, "rgba(255,255,255,.8)") : ""}
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T155 (F5) — Cream Editorial / Serif Quote
function t155(c: TemplateContent, w: number, h: number): string {
  const t = T.cr;
  return wrap(t, `
    ${ey(c.eyebrow || "EDITORIAL", t.ac)}
    <div style="font-size:48px;color:${t.ac};opacity:.15;font-family:Georgia,serif;line-height:.8;">"</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline, "#1C1917", c.headlineHighlight, t.ac, 24, 600)}
    </div>
    <div style="width:24px;height:2px;background:${t.ac};border-radius:1px;margin:10px 0;"></div>
    <div style="font-size:11px;color:${t.t3};">${esc(c.body || "Career Intelligence Report, 2026")}</div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T156 (F6) — Minimal Checklist
function t156(c: TemplateContent, w: number, h: number): string {
  const t = T.mn;
  const items = c.items || [
    { text: "Tailored to this specific role", highlighted: true },
    { text: "Keywords from job posting", highlighted: true },
    { text: "Metrics on every bullet", highlighted: true },
    { text: "ATS score checked (85%+)", highlighted: false },
    { text: "Saved as PDF format", highlighted: false },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "PRE-APPLY CHECKLIST", t.ac)}
    ${hd(c.headline || "Before You Hit Submit", t.tx, undefined, undefined, 22)}
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:16px;flex:1;">
      ${items.map(it => {
        const checked = it.highlighted;
        const checkBox = checked
          ? `<div style="width:16px;height:16px;border-radius:4px;background:${t.ac};display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;flex-shrink:0;">✓</div>`
          : `<div style="width:16px;height:16px;border-radius:4px;border:1.5px solid #D4D4D8;flex-shrink:0;"></div>`;
        const txtColor = checked ? t.tx : t.t2;
        const bg = checked ? t.sf : "transparent";
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:${bg};">
          ${checkBox}<span style="font-size:13px;color:${txtColor};">${esc(it.text)}</span>
        </div>`;
      }).join("")}
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T157 (F7) — Emerald Tips
function t157(c: TemplateContent, w: number, h: number): string {
  const t = T.em;
  const tips = c.tips || [
    { title: "Replace \"responsible for\"", description: "with action verbs that show impact" },
    { title: "Add a number", description: "to every single bullet point — revenue, %, team size" },
    { title: "Mirror the job posting", description: "— use their exact phrasing, not synonyms" },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "POWER MOVES", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "3 Changes That Triple Your Callbacks", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px;">
        ${tips.map((tip, i) => `<div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="min-width:20px;height:20px;border-radius:5px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);color:${t.ac};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <div style="font-size:13px;color:${t.t2};line-height:1.45;padding-top:1px;"><b style="color:${t.tx};font-weight:600;">${esc(tip.title)}</b> ${esc(tip.description)}</div>
        </div>`).join("")}
      </div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T158 (F8) — Violet Big Stat
function t158(c: TemplateContent, w: number, h: number): string {
  const t = T.vt;
  const val = c.stat?.value || c.headline || "73%";
  const label = c.stat?.label || c.subheadline || "of resumes rejected by ATS";
  return wrap(t, `
    ${ey(c.eyebrow || "THE NUMBER", "#E9D5FF")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:96px;font-weight:900;letter-spacing:-.06em;color:${t.ac};line-height:1;text-shadow:0 0 60px rgba(192,132,252,.2);">${esc(val)}</div>
      <div style="font-size:16px;font-weight:300;color:${t.t2};margin-top:8px;">${esc(label)}</div>
    </div>
    <div style="width:24px;height:2px;background:${t.ac};border-radius:1px;margin:10px auto;"></div>
    ${c.body ? `<div style="font-size:13px;color:${t.t3};text-align:center;">${esc(c.body)}</div>` : ""}
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T159 (F9) — Dark Do vs Don't
function t159(c: TemplateContent, w: number, h: number): string {
  const t = T.dk;
  return wrap(t, `
    ${ey(c.eyebrow || "RIGHT vs WRONG", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Resume Bullet Points", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
        <div style="background:rgba(52,211,153,.04);border:1px solid rgba(52,211,153,.12);border-radius:8px;padding:14px;">
          <div style="font-size:10px;font-weight:800;color:#34D399;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;">✓ STRONG</div>
          <div style="font-size:13px;color:${t.tx};line-height:1.45;">${esc(c.beforeText || "Led 12-person team to deliver $2.3M project 3 weeks ahead of deadline")}</div>
        </div>
        <div style="background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.12);border-radius:8px;padding:14px;">
          <div style="font-size:10px;font-weight:800;color:#F87171;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px;">✕ WEAK</div>
          <div style="font-size:13px;color:${t.t2};line-height:1.45;">${esc(c.afterText || "Responsible for managing various projects and ensuring timely delivery")}</div>
        </div>
      </div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T160 (F10) — Brand Announcement
function t160(c: TemplateContent, w: number, h: number): string {
  const t = T.br;
  const features = c.bullets || [
    "Real-time feedback on answers",
    "Company-specific prep questions",
    "Confidence scoring & analytics",
  ];
  return wrap(t, `
    <div style="display:inline-flex;padding:5px 14px;border-radius:14px;background:rgba(167,139,250,.15);border:1px solid rgba(165,180,252,.2);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#A5B4FC;margin-bottom:12px;">✦ ${esc(c.eyebrow || "JUST SHIPPED")}</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline, "#fff", c.headlineHighlight, t.al, 28)}
      ${c.body ? `<div style="font-size:14px;color:${t.t2};margin:10px 0 14px;line-height:1.55;">${esc(c.body)}</div>` : ""}
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${features.map(f => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${t.t2};">
          <span style="width:14px;height:14px;border-radius:50%;background:#2E2969;display:flex;align-items:center;justify-content:center;font-size:9px;color:#A5B4FC;">✓</span>${esc(f)}
        </div>`).join("")}
      </div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T161 (F11) — Light Salary Data / Range Bars
function t161(c: TemplateContent, w: number, h: number): string {
  const t = T.lt;
  const bars = c.bars || [
    { label: "Senior", value: 85, color: "#6366F1" },
    { label: "Mid-Level", value: 62, color: "#6366F1" },
    { label: "Junior", value: 40, color: "#A78BFA" },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "SALARY INTEL", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Software Engineer Comp 2026", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
        ${bars.map((b, i) => {
          const range = i === 0 ? "$145-225K" : i === 1 ? "$95-155K" : "$65-105K";
          const vc = i <= 1 ? t.ac : t.t2;
          const opacity = i === 0 ? 1 : i === 1 ? 0.7 : 0.4;
          return `<div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:12px;font-weight:700;color:${t.tx};">${esc(b.label)}</span>
              <span style="font-size:12px;font-weight:800;color:${vc};">${range}</span>
            </div>
            <div style="height:10px;background:#F0EEEA;border-radius:5px;overflow:hidden;">
              <div style="width:${b.value}%;height:100%;border-radius:5px;background:linear-gradient(90deg,#6366F1,#A78BFA);opacity:${opacity};"></div>
            </div>
          </div>`;
        }).join("")}
      </div>
      <div style="font-size:10px;color:${t.t3};margin-top:12px;">Source: Levels.fyi &amp; Glassdoor 2026</div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

// # T162 (F12) — Dark Social Proof
function t162(c: TemplateContent, w: number, h: number): string {
  const t = T.dk;
  return wrap(t, `
    ${ey(c.eyebrow || "TRACTION", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:72px;font-weight:900;letter-spacing:-.05em;color:${t.tx};line-height:.85;">${esc(c.stat?.value || c.headline || "12K+")}</div>
      <div style="font-size:18px;font-weight:300;color:${t.t2};margin-top:4px;">${esc(c.stat?.label || c.subheadline || "resumes optimized this month")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px;">
        <div style="background:${t.sf};border:1px solid ${t.br};border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:${t.ac};">92%</div>
          <div style="font-size:10px;color:${t.t3};margin-top:2px;">avg match rate</div>
        </div>
        <div style="background:${t.sf};border:1px solid ${t.br};border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:${t.al};">3.2×</div>
          <div style="font-size:10px;color:${t.t3};margin-top:2px;">more callbacks</div>
        </div>
      </div>
    </div>
    ${ft(t)}
  `, LI_PW, LI_PH, w, h);
}

/* ============================================================
   TIKTOK FRESH TEMPLATES (T163-T174)
   Preview: 540×960 → 2× to 1080×1920
   ============================================================ */

const TK_PW = 540, TK_PH = 960;

// # T163 (TF1) — Neon Countdown
function t163(c: TemplateContent, w: number, h: number): string {
  const t = T.dk;
  const items = c.items || [
    { text: "No metrics — quantify everything", highlighted: true },
    { text: "Generic objective — use summary" },
    { text: "Wrong file type — always PDF" },
    { text: "No keywords — mirror the posting" },
    { text: "Too many pages — one page only", highlighted: true },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "TOP 5", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Resume Mistakes Costing You Interviews", t.tx, c.headlineHighlight, t.al, 26)}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">
        ${items.map((it, i) => {
          const num = items.length - i;
          const col = (i === 0 || i === items.length - 1) ? t.ac : t.al;
          const parts = it.text.split(" — ");
          return `<div style="display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:8px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.12);">
            <div style="font-size:22px;font-weight:900;color:${col};width:24px;">${num}</div>
            <div style="font-size:13px;color:rgba(255,255,255,.6);"><b style="color:#fff;">${esc(parts[0])}</b>${parts[1] ? ` — ${esc(parts[1])}` : ""}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T164 (TF2) — Teal Terminal
function t164(c: TemplateContent, w: number, h: number): string {
  const t = T.tl;
  return wrap(t, `
    ${ey(c.eyebrow || "LIVE SCAN", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:${MONO_STACK};font-size:13px;line-height:2.2;color:${t.ac};">
        <div style="color:${t.t3};">$ jobpilot scan resume.pdf</div>
        <div><span style="color:#FBBF24;">→</span> Analyzing keywords...</div>
        <div><span style="color:${t.ac};">✓</span> Matched: 14/16 skills</div>
        <div><span style="color:${t.ac};">✓</span> Format: ATS-compatible</div>
        <div><span style="color:#F87171;">✕</span> Missing: cloud certification</div>
        <div style="margin-top:8px;"><span style="color:#FBBF24;">→</span> Score: <span style="font-weight:700;">${esc(c.stat?.value || "91%")}</span></div>
        <div style="color:${t.t3};margin-top:8px;">$ jobpilot optimize --auto</div>
        <div><span style="color:${t.ac};">✓</span> Boosted to <span style="font-weight:700;">${esc(c.stat?.label || "96%")}</span></div>
      </div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T165 (TF3) — Rose POV
function t165(c: TemplateContent, w: number, h: number): string {
  const t = T.rs;
  return wrap(t, `
    ${ey(c.eyebrow || "POV", "#FECDD3")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "You optimized your resume with AI and now recruiters are DMing you", "#fff", c.headlineHighlight || "DMing you", "#FDA4AF", 36)}
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T166 (TF4) — Amber Flashcard
function t166(c: TemplateContent, w: number, h: number): string {
  const t = T.am;
  return wrap(t, `
    <div style="display:inline-flex;padding:4px 12px;border-radius:12px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2);font-size:10px;font-weight:800;color:${t.ac};letter-spacing:.1em;">CAREER VOCAB</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:42px;font-weight:900;color:#fff;letter-spacing:-.03em;">${esc(c.headline || "ATS Score")}</div>
      <div style="width:20px;height:2px;background:${t.ac};margin:10px auto;border-radius:1px;"></div>
      <div style="font-size:14px;color:${t.t2};line-height:1.55;max-width:90%;margin:0 auto;">${esc(c.body || "The percentage match between your resume and a specific job posting's requirements.")}</div>
      ${c.subheadline ? `<div style="background:${t.sf};border:1px solid ${t.br};border-radius:8px;padding:10px 14px;margin-top:14px;font-size:12px;color:${t.al};font-style:italic;">"${esc(c.subheadline)}"</div>` : ""}
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T167 (TF5) — Gradient CTA
function t167(c: TemplateContent, w: number, h: number): string {
  const t = T.gd;
  return wrap(t, `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      ${hd(c.headline || "Your Dream Job Is Already Posted", "#fff", c.headlineHighlight, t.al, 38)}
      <div style="font-size:16px;color:rgba(255,255,255,.6);margin-top:10px;">${esc(c.body || "Your resume just hasn't found it yet.")}</div>
      <div style="margin-top:20px;">
        <div style="display:inline-flex;padding:10px 24px;border-radius:10px;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);font-size:15px;font-weight:700;color:#fff;">${esc(c.cta || "Get Your Score Free →")}</div>
      </div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T168 (TF6) — Slate Would You Rather
function t168(c: TemplateContent, w: number, h: number): string {
  const t = T.sl;
  return wrap(t, `
    ${ey(c.eyebrow || "WOULD YOU RATHER", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;">
      <div style="background:${t.sf};border:1px solid ${t.br};border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:${t.al};">${esc(c.beforeText || "Apply to 100 jobs")}</div>
        <div style="font-size:12px;color:${t.t3};margin-top:6px;">${esc(c.body || "same generic resume every time")}</div>
      </div>
      <div style="font-size:14px;font-weight:900;color:rgba(255,255,255,.2);text-align:center;">OR</div>
      <div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:10px;padding:20px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#34D399;">${esc(c.afterText || "Apply to 10 jobs")}</div>
        <div style="font-size:12px;color:${t.t3};margin-top:6px;">${esc(c.subheadline || "each tailored with AI in 47 seconds")}</div>
      </div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);text-align:center;margin-top:8px;">Comment below ↓</div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T169 (TF7) — Cyan Score Ring
function t169(c: TemplateContent, w: number, h: number): string {
  const t = T.cy;
  const score = parseInt(c.stat?.value || "85");
  const dashoffset = 175.9 * (1 - score / 100);
  return wrap(t, `
    ${ey(c.eyebrow || "RATE MY RESUME", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <svg width="160" height="160" viewBox="0 0 70 70"><circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/><circle cx="35" cy="35" r="28" fill="none" stroke="${t.ac}" stroke-width="5" stroke-linecap="round" stroke-dasharray="175.9" stroke-dashoffset="${dashoffset}" transform="rotate(-90 35 35)"/></svg>
      <div style="font-size:52px;font-weight:900;color:${t.ac};margin-top:-105px;position:relative;">${score}%</div>
      <div style="font-size:11px;color:${t.t3};margin-top:50px;letter-spacing:.1em;text-transform:uppercase;">${esc(c.stat?.label || "ATS Compatible")}</div>
      <div style="font-size:13px;color:${t.t2};margin-top:14px;">${esc(c.body || "Score yours free ↓ link in bio")}</div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T170 (TF8) — Emerald Myth Buster
function t170(c: TemplateContent, w: number, h: number): string {
  const t = T.em;
  return wrap(t, `
    ${ey(c.eyebrow || "MYTH vs REALITY", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px;">
      <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:16px;">
        <div style="font-size:11px;font-weight:800;color:#F87171;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">✕ MYTH</div>
        <div style="font-size:14px;color:${t.tx};line-height:1.45;">${esc(c.beforeText || "A longer resume shows more experience and impresses recruiters.")}</div>
      </div>
      <div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:10px;padding:16px;">
        <div style="font-size:11px;font-weight:800;color:#34D399;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">✓ REALITY</div>
        <div style="font-size:14px;color:${t.tx};line-height:1.45;">${esc(c.afterText || "Recruiters spend 6 seconds scanning. One focused page beats three unfocused ones.")}</div>
      </div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T171 (TF9) — Violet Storytime
function t171(c: TemplateContent, w: number, h: number): string {
  const t = T.vt;
  return wrap(t, `
    <div style="font-size:11px;font-weight:600;color:${t.t3};letter-spacing:.12em;text-transform:uppercase;">STORYTIME</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "I Applied to 200 Jobs and Heard Nothing Back.", "#fff", c.headlineHighlight || "200 Jobs", t.ac, 30)}
      <div style="width:20px;height:2px;background:${t.ac};border-radius:1px;margin:14px 0;"></div>
      ${hd(c.subheadline || "Then I Changed One Thing.", t.t2, "One Thing.", t.al, 24, 500)}
      <div style="font-size:13px;color:${t.t3};margin-top:14px;">${esc(c.body || "The answer was in my keywords →")}</div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T172 (TF10) — Cream iMessage
function t172(c: TemplateContent, w: number, h: number): string {
  const t = T.cr;
  const msgs = c.bullets || [
    "how's the job search?",
    "used AI to optimize my resume",
    "got 3 interviews this week",
    "wait what 😳",
    "send me the link rn",
  ];
  return wrap(t, `
    <div style="font-size:11px;color:${t.t3};text-align:center;margin-bottom:10px;">iMessage · Today</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:10px;">
      ${msgs.map((m, i) => {
        const isMe = i === 1 || i === 2;
        const align = isMe ? "flex-end" : "flex-start";
        const bg = isMe ? "#007AFF" : "#E5E5EA";
        const color = isMe ? "#fff" : "#000";
        return `<div style="align-self:${align};background:${bg};border-radius:14px;padding:10px 14px;font-size:14px;color:${color};max-width:78%;">${esc(m)}</div>`;
      }).join("")}
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T173 (TF11) — Navy Tier List
function t173(c: TemplateContent, w: number, h: number): string {
  const t = T.nv;
  const tiers = c.items || [
    { text: "Reverse Chronological", value: "S", highlighted: true },
    { text: "Combination / Hybrid", value: "A" },
    { text: "Functional", value: "B" },
    { text: "Creative / Infographic", value: "D" },
  ];
  const tierColors: Record<string, string> = { S: "#FFD700", A: "#34D399", B: "#38BDF8", C: "#FBBF24", D: "#F87171" };
  return wrap(t, `
    ${ey(c.eyebrow || "TIER LIST", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Resume Formats Ranked", t.tx, c.headlineHighlight, t.al, 26)}
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
        ${tiers.map(tier => {
          const v = tier.value || "B";
          const col = tierColors[v] || "#94A3B8";
          return `<div style="display:flex;align-items:center;gap:10px;">
            <div style="width:30px;height:20px;border-radius:5px;background:${col};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#000;">${esc(v)}</div>
            <div style="font-size:14px;font-weight:600;color:${t.tx};">${esc(tier.text)}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

// # T174 (TF12) — Dark Recruiter DMs
function t174(c: TemplateContent, w: number, h: number): string {
  const t = T.dk;
  return wrap(t, `
    ${ey(c.eyebrow || "AFTER OPTIMIZING", t.al)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;">
      <div style="font-size:11px;color:${t.t3};margin-bottom:4px;">LinkedIn Messages</div>
      <div style="background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.1);border-radius:10px;padding:14px;">
        <div style="font-size:10px;font-weight:700;color:${t.ac};margin-bottom:4px;">Recruiter @ Google</div>
        <div style="font-size:13px;color:${t.t2};">${esc(c.beforeText || "Your profile stood out. We have a perfect role for your background.")}</div>
      </div>
      <div style="background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.1);border-radius:10px;padding:14px;">
        <div style="font-size:10px;font-weight:700;color:${t.al};margin-bottom:4px;">Recruiter @ Stripe</div>
        <div style="font-size:13px;color:${t.t2};">${esc(c.afterText || "Loved your resume — keyword match is exactly what we need. Call?")}</div>
      </div>
    </div>
    <div style="font-size:13px;font-weight:600;text-align:center;color:${t.t3};margin-top:10px;">This is what happens when you optimize →</div>
    ${wm()}
  `, TK_PW, TK_PH, w, h);
}

/* ============================================================
   INSTAGRAM FRESH TEMPLATES (T175-T186)
   T175-T178: 4:5 (540×675)  T179-T182: 1:1 (540×540)
   T183-T186: 9:16 (540×960)
   ============================================================ */

const IG45_PW = 540, IG45_PH = 675;
const IG11_PW = 540, IG11_PH = 540;
const IG916_PW = 540, IG916_PH = 960;

// # T175 (IF1) — Emerald Authority (4:5)
function t175(c: TemplateContent, w: number, h: number): string {
  const t = T.em;
  return wrap(t, `
    ${ey(c.eyebrow || "CAREER INTEL", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "The Skills Gap Nobody Warns You About", t.tx, c.headlineHighlight, t.al, 28)}
      <div style="width:20px;height:2px;background:${t.ac};border-radius:1px;margin:12px 0;"></div>
      ${c.body ? bd(c.body, t.t2, c.bodyBold, t.tx) : ""}
    </div>
    ${ft(t)}
  `, IG45_PW, IG45_PH, w, h);
}

// # T176 (IF2) — Cream Serif Quote (4:5)
function t176(c: TemplateContent, w: number, h: number): string {
  const t = T.cr;
  return wrap(t, `
    ${ey(c.eyebrow || "WISDOM", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:48px;color:${t.ac};opacity:.12;font-family:Georgia,serif;line-height:.7;">"</div>
      ${hd(c.headline, "#1C1917", c.headlineHighlight, t.ac, 24, 600)}
      <div style="width:20px;height:2px;background:${t.ac};border-radius:1px;margin:12px 0;"></div>
      <div style="font-size:11px;color:${t.t3};">${esc(c.body || "The AI-First Job Seeker, 2026")}</div>
    </div>
    ${ft(t)}
  `, IG45_PW, IG45_PH, w, h);
}

// # T177 (IF3) — Navy Before/After (4:5)
function t177(c: TemplateContent, w: number, h: number): string {
  const t = T.nv;
  return wrap(t, `
    ${ey(c.eyebrow || "TRANSFORMATION", "#7DD3FC")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Same Person. Different Resume.", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;gap:10px;margin-top:14px;">
        <div style="flex:1;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:16px;text-align:center;">
          <div style="font-size:10px;font-weight:800;color:#F87171;letter-spacing:.06em;margin-bottom:6px;">BEFORE</div>
          <div style="font-size:40px;font-weight:900;color:#F87171;">${esc(c.beforeText || "34%")}</div>
          <div style="font-size:10px;color:${t.t3};margin-top:4px;">ATS match</div>
        </div>
        <div style="flex:1;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.15);border-radius:10px;padding:16px;text-align:center;">
          <div style="font-size:10px;font-weight:800;color:#34D399;letter-spacing:.06em;margin-bottom:6px;">AFTER</div>
          <div style="font-size:40px;font-weight:900;color:#34D399;">${esc(c.afterText || "92%")}</div>
          <div style="font-size:10px;color:${t.t3};margin-top:4px;">ATS match</div>
        </div>
      </div>
    </div>
    ${ft(t)}
  `, IG45_PW, IG45_PH, w, h);
}

// # T178 (IF4) — Violet Carousel Cover (4:5)
function t178(c: TemplateContent, w: number, h: number): string {
  const t = T.vt;
  return wrap(t, `
    ${ey(c.eyebrow || "DEEP DIVE", "#E9D5FF")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:80px;font-weight:900;color:${t.ac};letter-spacing:-.06em;line-height:1;">${esc(c.stat?.value || c.headline || "7")}</div>
      <div style="font-size:16px;font-weight:600;color:${t.t2};margin-top:8px;">${esc(c.stat?.label || c.subheadline || "Resume Sections ATS Actually Reads")}</div>
      <div style="width:24px;height:2px;background:${t.ac};border-radius:1px;margin:14px auto;"></div>
      <div style="font-size:12px;color:${t.t3};">${esc(c.body || "(Most people get #4 wrong)")}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:11px;color:${t.t3};">Swipe to learn →</div>
      <div style="display:flex;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:${t.ac};"></span><span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);"></span><span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.15);"></span></div>
    </div>
    ${ft(t)}
  `, IG45_PW, IG45_PH, w, h);
}

// # T179 (IF5) — Minimal Big Stat (1:1)
function t179(c: TemplateContent, w: number, h: number): string {
  const t = T.mn;
  return wrap(t, `
    ${ey(c.eyebrow || "THE DATA", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:96px;font-weight:900;color:${t.tx};letter-spacing:-.06em;line-height:1;">${esc(c.stat?.value || c.headline || "6s")}</div>
      <div style="font-size:15px;font-weight:400;color:${t.t2};margin-top:8px;">${esc(c.stat?.label || c.body || "average time a recruiter spends on your resume")}</div>
    </div>
    ${ft(t)}
  `, IG11_PW, IG11_PH, w, h);
}

// # T180 (IF6) — Teal Tip Trio (1:1)
function t180(c: TemplateContent, w: number, h: number): string {
  const t = T.tl;
  const tips = c.tips || [
    { title: "Quantify results", description: "— add numbers to every bullet" },
    { title: "Mirror keywords", description: "— match the posting exactly" },
    { title: "One page", description: "— always, unless 15+ yrs" },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "QUICK WINS", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "Fix These Before Applying", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px;">
        ${tips.map((tip, i) => `<div style="display:flex;gap:8px;align-items:flex-start;">
          <div style="min-width:20px;height:20px;border-radius:5px;border:1px solid rgba(94,234,212,.25);color:${t.ac};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${i + 1}</div>
          <div style="font-size:13px;color:${t.t2};line-height:1.45;"><b style="color:${t.tx};">${esc(tip.title)}</b> ${esc(tip.description)}</div>
        </div>`).join("")}
      </div>
    </div>
    ${ft(t)}
  `, IG11_PW, IG11_PH, w, h);
}

// # T181 (IF7) — Rose Bold Take (1:1)
function t181(c: TemplateContent, w: number, h: number): string {
  const t = T.rs;
  return wrap(t, `
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      ${hd(c.headline || "Your Experience Doesn't Get You Hired", t.tx, c.headlineHighlight || "Experience", t.ac, 28)}
      <div style="width:20px;height:2px;background:${t.ac};border-radius:1px;margin:12px auto;"></div>
      <div style="font-size:14px;color:${t.t2};text-align:center;">Your <b style="color:${t.tx};">${esc(c.bodyBold || "keywords")}</b> do.</div>
    </div>
    ${ft(t)}
  `, IG11_PW, IG11_PH, w, h);
}

// # T182 (IF8) — Dark Feature Grid (1:1)
function t182(c: TemplateContent, w: number, h: number): string {
  const t = T.dk;
  const features = [
    { emoji: "⚡", title: "Resume AI", desc: "6s optimization" },
    { emoji: "🎯", title: "Job Match", desc: "Perfect fit finder" },
    { emoji: "📝", title: "Cover Letter", desc: "30s generation" },
    { emoji: "🎤", title: "Interview AI", desc: "Practice coach" },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "WHAT WE DO", t.al)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${features.map(f => `<div style="background:${t.sf};border:1px solid ${t.br};border-radius:8px;padding:14px;text-align:center;">
          <div style="font-size:18px;margin-bottom:4px;">${f.emoji}</div>
          <div style="font-size:12px;font-weight:700;color:${t.tx};">${f.title}</div>
          <div style="font-size:10px;color:${t.t3};margin-top:2px;">${f.desc}</div>
        </div>`).join("")}
      </div>
    </div>
    ${ft(t)}
  `, IG11_PW, IG11_PH, w, h);
}

// # T183 (IF9) — Gradient Story CTA (9:16)
function t183(c: TemplateContent, w: number, h: number): string {
  const t = T.g2;
  return wrap(t, `
    ${ey(c.eyebrow || "FREE TOOL", "#A5B4FC")}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      ${hd(c.headline || "Check Your Resume Score in 6 Seconds", "#fff", c.headlineHighlight || "6 Seconds", "#A5B4FC", 34)}
      <div style="margin-top:20px;">
        <div style="display:inline-flex;padding:10px 24px;border-radius:10px;background:rgba(255,255,255,.15);font-size:15px;font-weight:700;color:#fff;">${esc(c.cta || "Try It Free →")}</div>
      </div>
    </div>
    <div style="text-align:center;font-size:11px;color:rgba(255,255,255,.3);margin-bottom:8px;">Tap link in bio ↓</div>
    ${ft(t)}
  `, IG916_PW, IG916_PH, w, h);
}

// # T184 (IF10) — Amber Poll Story (9:16)
function t184(c: TemplateContent, w: number, h: number): string {
  const t = T.am;
  const options = c.items || [
    { text: "Relevant experience" },
    { text: "Keyword optimization", highlighted: true },
    { text: "Clean formatting" },
    { text: "Education & certs" },
  ];
  const letters = ["A", "B", "C", "D"];
  return wrap(t, `
    <div style="font-size:11px;font-weight:700;color:${t.ac};letter-spacing:.14em;text-transform:uppercase;">YOUR TAKE</div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "What matters most on a resume?", t.tx, c.headlineHighlight, t.al, 26)}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">
        ${options.map((o, i) => {
          const hot = o.highlighted;
          const borderCol = hot ? t.ac : `${t.ac}33`;
          const bg = hot ? t.sf : "transparent";
          const circBorder = hot ? t.ac : "rgba(255,255,255,.2)";
          const circColor = hot ? t.ac : t.t3;
          const txtColor = hot ? t.al : t.t2;
          const fw = hot ? "font-weight:600;" : "";
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;border:1px solid ${borderCol};background:${bg};">
            <div style="width:20px;height:20px;border-radius:50%;border:1px solid ${circBorder};color:${circColor};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;">${letters[i]}</div>
            <div style="font-size:13px;color:${txtColor};${fw}">${esc(o.text)}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,.25);text-align:center;">Vote in stories poll ↑</div>
    ${ft(t)}
  `, IG916_PW, IG916_PH, w, h);
}

// # T185 (IF11) — Light Steps Story (9:16)
function t185(c: TemplateContent, w: number, h: number): string {
  const t = T.lw;
  const steps = c.steps || [
    { label: "1", title: "Upload Resume", description: "AI scans in 6 seconds" },
    { label: "2", title: "Paste Job URL", description: "Match against listing" },
    { label: "3", title: "Get AI Score", description: "Gaps, fixes, keywords" },
    { label: "4", title: "Apply with Edge", description: "92% avg match rate" },
  ];
  return wrap(t, `
    ${ey(c.eyebrow || "HOW IT WORKS", t.ac)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      ${hd(c.headline || "From Upload to Interview", t.tx, c.headlineHighlight, t.al, 22)}
      <div style="display:flex;flex-direction:column;margin-top:16px;">
        ${steps.map((s, i) => {
          const isFirst = i === 0;
          const dot = isFirst
            ? `<div style="width:20px;height:20px;border-radius:50%;background:${t.ac};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;">${s.label}</div>`
            : `<div style="width:20px;height:20px;border-radius:50%;border:1px solid ${t.br};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${t.t3};flex-shrink:0;">${s.label}</div>`;
          const line = i < steps.length - 1 ? `<div style="width:1.5px;height:14px;background:${t.br};margin-left:9px;"></div>` : "";
          return `<div style="display:flex;gap:10px;align-items:flex-start;">
            ${dot}
            <div><div style="font-size:14px;font-weight:700;color:${t.tx};">${esc(s.title)}</div><div style="font-size:11px;color:${t.t3};">${esc(s.description || "")}</div></div>
          </div>${line}`;
        }).join("")}
      </div>
    </div>
    ${ft(t)}
  `, IG916_PW, IG916_PH, w, h);
}

// # T186 (IF12) — Gradient Salary Reveal (9:16)
function t186(c: TemplateContent, w: number, h: number): string {
  const t = T.g1;
  return wrap(t, `
    ${ey(c.eyebrow || "SALARY REVEAL", t.al)}
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:11px;color:${t.t3};letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">${esc(c.subheadline || "Senior Software Engineer")}</div>
      <div style="font-size:80px;font-weight:900;color:${t.ac};letter-spacing:-.05em;line-height:1;">${esc(c.stat?.value || c.headline || "$185K")}</div>
      <div style="font-size:16px;color:${t.al};margin-top:8px;">${esc(c.stat?.label || "+ $40K stock + $15K bonus")}</div>
      <div style="width:24px;height:1.5px;background:rgba(99,102,241,.3);margin:14px auto;"></div>
      <div style="font-size:13px;color:${t.t3};">${esc(c.body || "Total comp: $240K/yr")}</div>
    </div>
    <div style="font-size:13px;text-align:center;color:${t.t3};margin-bottom:8px;">${esc(c.cta || "Know your worth before you negotiate →")}</div>
    ${wm()}
  `, IG916_PW, IG916_PH, w, h);
}

/* ============================================================
   MAIN ROUTER
   ============================================================ */

const BUILDERS: Record<string, (c: TemplateContent, w: number, h: number) => string> = {
  t151, t152, t153, t154, t155, t156, t157, t158, t159, t160, t161, t162,
  t163, t164, t165, t166, t167, t168, t169, t170, t171, t172, t173, t174,
  t175, t176, t177, t178, t179, t180, t181, t182, t183, t184, t185, t186,
};

// # Build a fresh template HTML page
export function buildFreshTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number,
): string {
  const builder = BUILDERS[templateId];
  if (!builder) throw new Error(`Unknown fresh template: ${templateId}`);
  return builder(content, width, height);
}
