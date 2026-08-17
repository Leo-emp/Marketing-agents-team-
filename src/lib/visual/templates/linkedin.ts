/* ============================================================
   LINKEDIN TEMPLATES (T1-T15, T65-T72) — 23 Templates
   ============================================================
   # Each template function returns a complete HTML page string
   # ready for Puppeteer screenshot. CSS is embedded at preview
   # scale and transform:scale() renders at target dimensions.
   #
   # T1-T15: preview at 540×675 → scale 2× to 1080×1350
   # T65-T72: preview at 432×540 → scale 2.5× to 1080×1350
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, FONT_STACK, MONO_STACK, esc } from "./shared";

// # All LinkedIn template IDs
export const LINKEDIN_IDS: TemplateId[] = [
  "t1","t2","t3","t4","t5","t6","t7","t8",
  "t9","t10","t11","t12","t13","t14","t15",
  "t65","t66","t67","t68","t69","t70","t71","t72",
  "t73","t74","t75","t76","t77","t78","t79","t80",
];

// # Brand strip HTML for T1-T15 style (logo + name + url)
function brandStripT1Dark(): string {
  return `<div class="brand-strip">
    <div style="display:flex;align-items:center;gap:8px;">
      <img src="${LOGO_DATA_URI}" style="width:22px;height:22px;border-radius:4px;">
      <span class="name">JobPilot <span>AI</span></span>
    </div>
    <span class="url">jobpilotai.co</span>
  </div>`;
}

function brandStripT1Light(): string {
  return `<div class="brand-strip">
    <div style="display:flex;align-items:center;gap:8px;">
      <img src="${LOGO_DATA_URI}" style="width:22px;height:22px;border-radius:4px;">
      <span class="name">JobPilot <span>AI</span></span>
    </div>
    <span class="url">jobpilotai.co</span>
  </div>`;
}

// # Brand strip for T65-T72 style (compact)
function brandStripSet2Dark(): string {
  return `<div class="brand-strip">
    <div class="b-logo"><img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;"></div>
    <span class="b-name">JobPilot AI</span>
    <span class="b-url">jobpilotai.co</span>
  </div>`;
}

function brandStripSet2Light(): string {
  return `<div class="brand-strip">
    <div class="b-logo"><img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;"></div>
    <span class="b-name">JobPilot AI</span>
    <span class="b-url">jobpilotai.co</span>
  </div>`;
}

// # Wrap template body with page scaffold and scaling
function wrapPage(
  templateClass: string,
  css: string,
  body: string,
  previewW: number,
  previewH: number,
  targetW: number,
  targetH: number
): string {
  const scale = targetW / previewW;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${targetW}px;height:${targetH}px;overflow:hidden;background:#000;}
body{font-family:${FONT_STACK};}
.scale-wrap{width:${previewW}px;height:${previewH}px;transform:scale(${scale});transform-origin:top left;}
${css}
</style></head><body>
<div class="scale-wrap"><div class="${templateClass}">${body}</div></div>
</body></html>`;
}

// # Highlight a word/phrase in text with accent-light color
// # Escapes both text and highlight before inserting markup
function hl(text: string, highlight?: string): string {
  const safe = esc(text);
  if (!highlight) return safe;
  const safeHl = esc(highlight);
  if (!safe.includes(safeHl)) return safe;
  return safe.replace(safeHl, `<em>${safeHl}</em>`);
}

// # Bold a phrase in body text
// # Escapes both text and phrase before inserting markup
function boldPhrase(text: string, phrase?: string): string {
  const safe = esc(text);
  if (!phrase) return safe;
  const safePh = esc(phrase);
  if (!safe.includes(safePh)) return safe;
  return safe.replace(safePh, `<strong>${safePh}</strong>`);
}

/* ============================================================
   T1 — HERO STAT (Dark, 540×675 → 2× scale)
   ============================================================ */
const T1_CSS = `
.t1{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t1::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(30,31,46,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(30,31,46,0.5) 1px,transparent 1px);background-size:40px 40px;opacity:0.08;mask-image:radial-gradient(ellipse 60% 40% at 50% 30%,black,transparent);-webkit-mask-image:radial-gradient(ellipse 60% 40% at 50% 30%,black,transparent);}
.t1 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:28px;position:relative;display:flex;align-items:center;gap:6px;}
.t1 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t1 .stat{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;}
.t1 .stat .number{font-size:120px;font-weight:900;letter-spacing:-0.05em;line-height:0.85;color:#E4E2DD;}
.t1 .stat .unit{font-size:38px;font-weight:300;color:#8B8A9A;margin-top:2px;}
.t1 .context{position:relative;font-size:13px;color:#8B8A9A;line-height:1.5;margin-top:20px;max-width:340px;}
.t1 .context strong{color:#E4E2DD;font-weight:600;}
.t1 .brand-strip{position:relative;display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:24px;}
.t1 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t1 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t1 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT1(c: TemplateContent, w: number, h: number): string {
  const value = esc(c.stat?.value || c.headline);
  const label = esc(c.stat?.label || "");
  const ctx = c.body ? boldPhrase(c.body, c.bodyBold) : "";
  return wrapPage("t1", T1_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DATA POINT")}</div>
    <div class="stat">
      <div class="number">${value}</div>
      ${label ? `<div class="unit">${label}</div>` : ""}
    </div>
    ${ctx ? `<div class="context">${ctx}</div>` : ""}
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T3 — TIP CARD (Brand bg, 540×675 → 2× scale)
   ============================================================ */
const T3_CSS = `
.t3{width:540px;height:675px;background:#1E1B4B;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t3::before{content:'';position:absolute;top:-100px;right:-100px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%);}
.t3 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#A5B4FC;margin-bottom:28px;position:relative;display:flex;align-items:center;gap:6px;}
.t3 .eyebrow::before{content:'';width:12px;height:1.5px;background:#A5B4FC;}
.t3 .headline{font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#FFF;margin-bottom:32px;position:relative;max-width:380px;}
.t3 .tips{position:relative;flex:1;display:flex;flex-direction:column;gap:14px;}
.t3 .tip-item{display:flex;gap:12px;align-items:flex-start;}
.t3 .tip-num{width:24px;height:24px;border-radius:5px;background:rgba(165,180,252,0.15);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#A5B4FC;flex-shrink:0;}
.t3 .tip-text{font-size:12px;color:#C7D2FE;line-height:1.45;padding-top:3px;}
.t3 .tip-text strong{color:#FFF;font-weight:700;}
.t3 .brand-strip{position:relative;display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:24px;}
.t3 .brand-strip .name{font-size:11px;font-weight:700;color:#FFF;}
.t3 .brand-strip .name span{font-weight:400;color:#6366F1;}
.t3 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#6366F1;}
`;

function buildT3(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  return wrapPage("t3", T3_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "CAREER TIPS")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="tips">
      ${tips.map((t, i) => `<div class="tip-item">
        <div class="tip-num">${i + 1}</div>
        <div class="tip-text"><strong>${esc(t.title)}</strong> ${esc(t.description)}</div>
      </div>`).join("")}
    </div>
    <div class="brand-strip">
      <div style="display:flex;align-items:center;gap:8px;">
        <img src="${LOGO_DATA_URI}" style="width:22px;height:22px;border-radius:4px;">
        <span class="name">JobPilot <span>AI</span></span>
      </div>
      <span class="url">jobpilotai.co</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T65 — SPLIT HEADER (Dark, 432×540 → 2.5× scale)
   ============================================================ */
const T65_CSS = `
.t65{width:432px;height:540px;background:#08090E;display:flex;flex-direction:column;padding:0;}
.t65 .sh-top{flex:1;display:flex;flex-direction:column;justify-content:center;padding:44px 40px 32px;background:radial-gradient(ellipse at 70% 90%,rgba(99,102,241,0.06) 0%,transparent 60%),#08090E;}
.t65 .sh-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:18px;display:flex;align-items:center;gap:10px;}
.t65 .sh-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t65 .sh-headline{font-size:34px;font-weight:800;color:#fff;line-height:1.15;letter-spacing:-0.03em;}
.t65 .sh-headline em{font-style:normal;color:#A78BFA;}
.t65 .sh-bar{width:100%;height:3px;background:linear-gradient(90deg,#6366F1,#A78BFA 40%,rgba(167,139,250,0.05) 100%);}
.t65 .sh-bottom{padding:28px 40px 36px;display:flex;flex-direction:column;}
.t65 .sh-body{font-size:15px;color:rgba(255,255,255,0.4);line-height:1.65;max-width:320px;}
.t65 .sh-body strong{color:rgba(255,255,255,0.75);font-weight:600;}
.t65 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t65 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
.t65 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t65 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
`;

function buildT65(c: TemplateContent, w: number, h: number): string {
  const headline = hl(c.headline, c.headlineHighlight);
  const body = c.body ? boldPhrase(c.body, c.bodyBold) : "";
  return wrapPage("t65", T65_CSS, `
    <div class="sh-top">
      <div class="sh-ey">${esc(c.eyebrow || "RESUME STRATEGY")}</div>
      <div class="sh-headline">${headline}</div>
    </div>
    <div class="sh-bar"></div>
    <div class="sh-bottom">
      <div class="sh-body">${body}</div>
      ${brandStripSet2Dark()}
    </div>
  `, 432, 540, w, h);
}

/* ============================================================
   T66 — ANNOTATION CARD (Light, 432×540 → 2.5× scale)
   ============================================================ */
const T66_CSS = `
.t66{width:432px;height:540px;background:#F8F7F4;display:flex;flex-direction:column;padding:40px 36px;}
.t66 .an-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t66 .an-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t66 .an-title{font-size:22px;font-weight:800;color:#1A1A1A;letter-spacing:-0.02em;margin-bottom:22px;line-height:1.2;}
.t66 .an-doc{background:#fff;border:1px solid #E8E5DE;border-radius:10px;padding:22px 24px;position:relative;flex:1;display:flex;flex-direction:column;gap:14px;}
.t66 .an-line{display:flex;align-items:flex-start;gap:12px;position:relative;}
.t66 .an-text{font-size:13px;color:#555;line-height:1.5;flex:1;}
.t66 .an-text .hl{background:rgba(99,102,241,0.08);border-bottom:2px solid #6366F1;padding:1px 4px;border-radius:2px;color:#1A1A1A;font-weight:600;}
.t66 .an-text .hl-warn{background:rgba(239,68,68,0.06);border-bottom:2px solid #EF4444;padding:1px 4px;border-radius:2px;color:#B91C1C;font-weight:600;}
.t66 .an-rule{width:100%;height:1px;background:#F0EEEA;}
.t66 .an-score{display:flex;align-items:center;gap:10px;margin-top:4px;}
.t66 .an-score-bar{flex:1;height:5px;background:#F0EEEA;border-radius:3px;overflow:hidden;}
.t66 .an-score-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t66 .an-score-val{font-size:14px;font-weight:800;color:#6366F1;font-variant-numeric:tabular-nums;}
.t66 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t66 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
.t66 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:#999;}
.t66 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:#C0BDB5;}
`;

function buildT66(c: TemplateContent, w: number, h: number): string {
  const annotations = c.annotations || [];
  const score = c.score || 78;
  return wrapPage("t66", T66_CSS, `
    <div class="an-ey">${esc(c.eyebrow || "RESUME ANALYSIS")}</div>
    <div class="an-title">${esc(c.headline)}</div>
    <div class="an-doc">
      ${annotations.map((a, i) => `
        <div class="an-line">
          <div class="an-text">${esc(a.text)}</div>
        </div>
        ${i < annotations.length - 1 ? '<div class="an-rule"></div>' : ""}
      `).join("")}
      <div class="an-rule"></div>
      <div class="an-score">
        <div class="an-score-bar"><div class="an-score-fill" style="width:${score}%"></div></div>
        <div class="an-score-val">${score}%</div>
      </div>
    </div>
    ${brandStripSet2Light()}
  `, 432, 540, w, h);
}

/* ============================================================
   T67 — SALARY RANGE (Dark, 432×540 → 2.5× scale)
   ============================================================ */
const T67_CSS = `
.t67{width:432px;height:540px;background:#08090E;display:flex;flex-direction:column;padding:44px 40px;}
.t67 .sr-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t67 .sr-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t67 .sr-title{font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:8px;}
.t67 .sr-sub{font-size:13px;color:rgba(255,255,255,0.3);margin-bottom:32px;}
.t67 .sr-roles{display:flex;flex-direction:column;gap:26px;flex:1;}
.t67 .sr-role-name{font-size:13px;font-weight:700;color:rgba(255,255,255,0.7);margin-bottom:10px;}
.t67 .sr-track{height:10px;background:#111118;border-radius:5px;position:relative;overflow:visible;}
.t67 .sr-fill{position:absolute;top:0;height:100%;border-radius:5px;background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t67 .sr-marker{position:absolute;top:-6px;width:2px;height:22px;background:#fff;border-radius:1px;}
.t67 .sr-labels{display:flex;justify-content:space-between;margin-top:8px;}
.t67 .sr-label{font-size:11px;font-weight:600;color:rgba(255,255,255,0.3);font-variant-numeric:tabular-nums;}
.t67 .sr-label.mid{color:#fff;font-weight:800;}
.t67 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t67 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t67 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
.t67 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT67(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapPage("t67", T67_CSS, `
    <div class="sr-ey">${esc(c.eyebrow || "COMPENSATION DATA")}</div>
    <div class="sr-title">${esc(c.headline)}</div>
    <div class="sr-sub">${esc(c.subheadline || "")}</div>
    <div class="sr-roles">
      ${bars.map(b => {
        const min = Math.max(0, b.value - 30);
        const max = Math.min(100, b.value + 25);
        return `<div class="sr-role">
          <div class="sr-role-name">${esc(b.label)}</div>
          <div class="sr-track">
            <div class="sr-fill" style="left:${min}%;width:${max - min}%"></div>
            <div class="sr-marker" style="left:${b.value}%"></div>
          </div>
          <div class="sr-labels">
            <span class="sr-label">${esc(b.color || "")}</span>
            <span class="sr-label mid">${b.value}%</span>
            <span class="sr-label"></span>
          </div>
        </div>`;
      }).join("")}
    </div>
    ${brandStripSet2Dark()}
  `, 432, 540, w, h);
}

/* ============================================================
   T68 — QUICK WIN (Brand gradient, 432×540 → 2.5× scale)
   ============================================================ */
const T68_CSS = `
.t68{width:432px;height:540px;background:linear-gradient(145deg,#1E1B4B 0%,#312E81 50%,#3B1F7E 100%);display:flex;flex-direction:column;justify-content:center;padding:52px 40px;position:relative;}
.t68 .qw-glow{position:absolute;width:280px;height:280px;border-radius:50%;filter:blur(100px);opacity:0.12;z-index:1;}
.t68 .qw-g1{background:#A78BFA;top:-10%;right:-15%;}
.t68 .qw-g2{background:#6366F1;bottom:-5%;left:-10%;}
.t68 .qw-badge{position:relative;z-index:2;display:inline-flex;align-items:center;gap:8px;background:rgba(167,139,250,0.12);border:1px solid rgba(167,139,250,0.15);border-radius:24px;padding:6px 16px;align-self:flex-start;margin-bottom:28px;}
.t68 .qw-badge-dot{width:6px;height:6px;border-radius:50%;background:#A78BFA;}
.t68 .qw-badge-text{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C4B5FD;}
.t68 .qw-headline{position:relative;z-index:2;font-size:32px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.03em;margin-bottom:20px;}
.t68 .qw-rule{position:relative;z-index:2;width:36px;height:2px;border-radius:1px;background:rgba(255,255,255,0.15);margin-bottom:20px;}
.t68 .qw-body{position:relative;z-index:2;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.65;max-width:300px;}
.t68 .qw-body strong{color:rgba(255,255,255,0.85);font-weight:600;}
.t68 .brand-strip{position:relative;z-index:2;margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t68 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t68 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
.t68 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT68(c: TemplateContent, w: number, h: number): string {
  const body = c.body ? boldPhrase(c.body, c.bodyBold) : "";
  return wrapPage("t68", T68_CSS, `
    <div class="qw-glow qw-g1"></div>
    <div class="qw-glow qw-g2"></div>
    <div class="qw-badge">
      <div class="qw-badge-dot"></div>
      <span class="qw-badge-text">${esc(c.eyebrow || "QUICK WIN")}</span>
    </div>
    <div class="qw-headline">${esc(c.headline)}</div>
    <div class="qw-rule"></div>
    <div class="qw-body">${body}</div>
    ${brandStripSet2Dark()}
  `, 432, 540, w, h);
}

/* ============================================================
   T69 — STACK RANK (Dark, 432×540 → 2.5× scale)
   ============================================================ */
const T69_CSS = `
.t69{width:432px;height:540px;background:#08090E;display:flex;flex-direction:column;padding:40px 36px;}
.t69 .rk-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t69 .rk-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t69 .rk-title{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:26px;line-height:1.2;}
.t69 .rk-items{display:flex;flex-direction:column;gap:10px;flex:1;}
.t69 .rk-item{display:flex;align-items:center;gap:16px;padding:14px 18px;background:#111118;border:1px solid #1A1B28;border-radius:10px;position:relative;}
.t69 .rk-item.top{background:rgba(99,102,241,0.06);border-color:rgba(99,102,241,0.15);}
.t69 .rk-num{font-size:22px;font-weight:900;letter-spacing:-0.04em;width:32px;text-align:center;flex-shrink:0;font-variant-numeric:tabular-nums;}
.t69 .rk-item.top .rk-num{color:#6366F1;}
.t69 .rk-item:not(.top) .rk-num{color:rgba(255,255,255,0.15);}
.t69 .rk-sep{width:1px;height:28px;background:#1E1F2E;flex-shrink:0;}
.t69 .rk-item.top .rk-sep{background:rgba(99,102,241,0.2);}
.t69 .rk-text{font-size:14px;font-weight:600;color:rgba(255,255,255,0.7);flex:1;}
.t69 .rk-item.top .rk-text{color:#fff;}
.t69 .rk-pct{font-size:13px;font-weight:800;color:rgba(255,255,255,0.2);font-variant-numeric:tabular-nums;}
.t69 .rk-item.top .rk-pct{color:#A78BFA;}
.t69 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t69 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t69 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
.t69 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT69(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapPage("t69", T69_CSS, `
    <div class="rk-ey">${esc(c.eyebrow || "JOB SEARCH DATA")}</div>
    <div class="rk-title">${esc(c.headline)}</div>
    <div class="rk-items">
      ${items.map((item, i) => `<div class="rk-item${item.highlighted ? " top" : ""}">
        <div class="rk-num">${i + 1}</div>
        <div class="rk-sep"></div>
        <div class="rk-text">${esc(item.text)}</div>
        ${item.value ? `<div class="rk-pct">${esc(item.value)}</div>` : ""}
      </div>`).join("")}
    </div>
    ${brandStripSet2Dark()}
  `, 432, 540, w, h);
}

/* ============================================================
   T70 — TWO-NUMBER (Light, 432×540 → 2.5× scale)
   ============================================================ */
const T70_CSS = `
.t70{width:432px;height:540px;background:#F8F7F4;display:flex;flex-direction:column;padding:40px 36px;}
.t70 .tn-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t70 .tn-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t70 .tn-title{font-size:20px;font-weight:800;color:#1A1A1A;letter-spacing:-0.02em;margin-bottom:28px;line-height:1.2;}
.t70 .tn-pair{display:flex;gap:2px;flex:1;}
.t70 .tn-block{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:32px 20px;border-radius:12px;}
.t70 .tn-block-bad{background:#FEF2F2;}
.t70 .tn-block-good{background:#F0FDF4;}
.t70 .tn-tag{font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;padding:3px 10px;border-radius:4px;}
.t70 .tn-block-bad .tn-tag{background:rgba(220,38,38,0.08);color:#DC2626;}
.t70 .tn-block-good .tn-tag{background:rgba(22,163,74,0.08);color:#16A34A;}
.t70 .tn-num{font-size:56px;font-weight:900;letter-spacing:-0.05em;line-height:1;margin-bottom:8px;}
.t70 .tn-block-bad .tn-num{color:#B91C1C;}
.t70 .tn-block-good .tn-num{color:#16A34A;}
.t70 .tn-unit{font-size:14px;font-weight:600;margin-bottom:10px;}
.t70 .tn-block-bad .tn-unit{color:rgba(185,28,28,0.5);}
.t70 .tn-block-good .tn-unit{color:rgba(22,163,74,0.5);}
.t70 .tn-desc{font-size:12px;color:#777;line-height:1.45;}
.t70 .tn-cta{margin-top:20px;text-align:center;font-size:12px;font-weight:600;color:#6366F1;}
.t70 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t70 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:#999;}
.t70 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:#C0BDB5;}
.t70 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT70(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const bad = bars[0] || { label: "Before", value: 0 };
  const good = bars[1] || { label: "After", value: 0 };
  return wrapPage("t70", T70_CSS, `
    <div class="tn-ey">${esc(c.eyebrow || "JOB SEARCH DATA")}</div>
    <div class="tn-title">${esc(c.headline)}</div>
    <div class="tn-pair">
      <div class="tn-block tn-block-bad">
        <div class="tn-tag">${esc(bad.label)}</div>
        <div class="tn-num">${bad.value}%</div>
        <div class="tn-unit">${esc(bad.color || "response rate")}</div>
        <div class="tn-desc">${esc(c.beforeText || "")}</div>
      </div>
      <div class="tn-block tn-block-good">
        <div class="tn-tag">${esc(good.label)}</div>
        <div class="tn-num">${good.value}%</div>
        <div class="tn-unit">${esc(good.color || "response rate")}</div>
        <div class="tn-desc">${esc(c.afterText || "")}</div>
      </div>
    </div>
    ${c.cta ? `<div class="tn-cta">${esc(c.cta)}</div>` : ""}
    ${brandStripSet2Light()}
  `, 432, 540, w, h);
}

/* ============================================================
   T71 — FRAMEWORK (Dark, 432×540 → 2.5× scale)
   ============================================================ */
const T71_CSS = `
.t71{width:432px;height:540px;background:#08090E;display:flex;flex-direction:column;padding:40px 36px;}
.t71 .fw-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t71 .fw-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t71 .fw-name{font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.03em;margin-bottom:6px;}
.t71 .fw-sub{font-size:13px;color:rgba(255,255,255,0.3);margin-bottom:26px;}
.t71 .fw-steps{display:flex;flex-direction:column;gap:12px;flex:1;}
.t71 .fw-step{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;background:#111118;border:1px solid #1A1B28;border-radius:10px;}
.t71 .fw-letter{width:32px;height:32px;border-radius:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.15);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#6366F1;flex-shrink:0;}
.t71 .fw-step-content{flex:1;padding-top:2px;}
.t71 .fw-step-head{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;}
.t71 .fw-step-desc{font-size:11px;color:rgba(255,255,255,0.35);line-height:1.45;}
.t71 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t71 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t71 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
.t71 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT71(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapPage("t71", T71_CSS, `
    <div class="fw-ey">${esc(c.eyebrow || "METHOD")}</div>
    <div class="fw-name">${esc(c.methodName || c.headline)}</div>
    <div class="fw-sub">${esc(c.subheadline || "")}</div>
    <div class="fw-steps">
      ${steps.map(s => `<div class="fw-step">
        <div class="fw-letter">${esc(s.label)}</div>
        <div class="fw-step-content">
          <div class="fw-step-head">${esc(s.title)}</div>
          ${s.description ? `<div class="fw-step-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${brandStripSet2Dark()}
  `, 432, 540, w, h);
}

/* ============================================================
   T72 — INDUSTRY BENCHMARK (Dark, 432×540 → 2.5× scale)
   ============================================================ */
const T72_CSS = `
.t72{width:432px;height:540px;background:#08090E;display:flex;flex-direction:column;padding:40px 36px;}
.t72 .bm-ey{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(99,102,241,0.45);margin-bottom:8px;display:flex;align-items:center;gap:10px;}
.t72 .bm-ey::before{content:'';width:18px;height:2px;background:#6366F1;border-radius:1px;}
.t72 .bm-title{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:24px;line-height:1.2;}
.t72 .bm-chart{display:flex;flex-direction:column;gap:16px;flex:1;}
.t72 .bm-row-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;}
.t72 .bm-row-label{font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);}
.t72 .bm-row-val{font-size:14px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;}
.t72 .bm-track{height:10px;background:#111118;border-radius:5px;position:relative;overflow:visible;}
.t72 .bm-fill{height:100%;border-radius:5px;}
.t72 .bm-fill-accent{background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t72 .bm-fill-green{background:linear-gradient(90deg,#22C55E,#4ADE80);}
.t72 .bm-fill-muted{background:#2A2B3A;}
.t72 .bm-benchmark{position:absolute;top:-8px;bottom:-8px;width:2px;background:#F59E0B;border-radius:1px;z-index:2;}
.t72 .bm-benchmark-label{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:700;color:#F59E0B;letter-spacing:0.06em;text-transform:uppercase;white-space:nowrap;}
.t72 .bm-legend{display:flex;gap:18px;margin-top:6px;}
.t72 .bm-legend-item{display:flex;align-items:center;gap:6px;font-size:10px;color:rgba(255,255,255,0.25);}
.t72 .bm-legend-dot{width:8px;height:8px;border-radius:2px;}
.t72 .bm-legend-dot.acc{background:#6366F1;}
.t72 .bm-legend-dot.avg{background:#F59E0B;}
.t72 .brand-strip{margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:16px;}
.t72 .b-name{font-size:10px;font-weight:700;letter-spacing:-0.01em;color:rgba(255,255,255,0.25);}
.t72 .b-url{font-size:9px;font-family:${MONO_STACK};margin-left:auto;letter-spacing:0.02em;color:rgba(255,255,255,0.12);}
.t72 .b-logo{width:18px;height:18px;border-radius:4px;background:rgba(99,102,241,0.12);display:flex;align-items:center;justify-content:center;}
`;

function buildT72(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const benchmarkAt = c.benchmarkAt || 62;
  return wrapPage("t72", T72_CSS, `
    <div class="bm-ey">${esc(c.eyebrow || "INDUSTRY DATA")}</div>
    <div class="bm-title">${esc(c.headline)}</div>
    <div class="bm-chart">
      ${bars.map((b, i) => {
        const fillClass = b.value > 70 ? "bm-fill-accent" : b.value > 50 ? "bm-fill-green" : "bm-fill-muted";
        return `<div class="bm-row">
          <div class="bm-row-top">
            <span class="bm-row-label">${esc(b.label)}</span>
            <span class="bm-row-val">${b.value}%</span>
          </div>
          <div class="bm-track">
            <div class="bm-fill ${fillClass}" style="width:${b.value}%"></div>
            ${i === 0 ? `<div class="bm-benchmark" style="left:${benchmarkAt}%"><span class="bm-benchmark-label">Avg</span></div>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="bm-legend">
      <div class="bm-legend-item"><div class="bm-legend-dot acc"></div>Above avg</div>
      <div class="bm-legend-item"><div class="bm-legend-dot avg"></div>Industry avg</div>
    </div>
    ${brandStripSet2Dark()}
  `, 432, 540, w, h);
}

/* ============================================================
   T2 — PRODUCT IN ACTION (Light, 540×675 → 2× scale)
   ============================================================ */
const T2_CSS = `
.t2{width:540px;height:675px;background:#F8F7F4;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t2 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t2 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t2 .headline{font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;color:#1A1A1A;margin-bottom:6px;}
.t2 .sub{font-size:12px;color:#6B6B6B;margin-bottom:20px;}
.t2 .ui-panel{background:#fff;border:1px solid #E2E0DB;border-radius:8px;overflow:hidden;flex:1;display:flex;flex-direction:column;}
.t2 .tab-bar{display:flex;border-bottom:1px solid #E2E0DB;padding:0 16px;}
.t2 .tab{padding:10px 14px;font-size:9px;font-weight:600;color:#8A8A8A;border-bottom:2px solid transparent;}
.t2 .tab.active{color:#6366F1;border-color:#6366F1;background:#F0EEFF;}
.t2 .panel-body{padding:18px 20px;flex:1;display:flex;flex-direction:column;gap:12px;}
.t2 .score-row{display:flex;align-items:center;gap:14px;}
.t2 .score-ring{width:50px;height:50px;border-radius:50%;border:4px solid #E2E0DB;border-top-color:#6366F1;border-right-color:#6366F1;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#6366F1;}
.t2 .score-label{font-size:10px;color:#6B6B6B;}
.t2 .score-label strong{color:#1A1A1A;font-size:12px;display:block;}
.t2 .skill-row{display:flex;align-items:center;gap:8px;font-size:10px;color:#4A4A4A;}
.t2 .skill-check{width:16px;height:16px;border-radius:4px;background:#F0FDF4;color:#16A34A;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
.t2 .skill-cross{width:16px;height:16px;border-radius:4px;background:#FEF2F2;color:#DC2626;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
.t2 .cta-btn{margin-top:auto;background:#6366F1;color:#fff;border:none;border-radius:6px;padding:10px;font-size:10px;font-weight:700;text-align:center;}
.t2 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:16px;}
.t2 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t2 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t2 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT2(c: TemplateContent, w: number, h: number): string {
  const skills = c.items || [
    { text: "Python", highlighted: true },
    { text: "SQL", highlighted: true },
    { text: "AWS", highlighted: false },
    { text: "React", highlighted: true },
  ];
  return wrapPage("t2", T2_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "PRODUCT IN ACTION")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    <div class="ui-panel">
      <div class="tab-bar">
        <div class="tab active">Resume Intelligence</div>
        <div class="tab">Cover Letter</div>
        <div class="tab">Interview</div>
      </div>
      <div class="panel-body">
        <div class="score-row">
          <div class="score-ring">${esc(c.stat?.value || "92%")}</div>
          <div class="score-label"><strong>${esc(c.stat?.label || "ATS Match Score")}</strong>Based on 47 criteria</div>
        </div>
        ${skills.map(s => `<div class="skill-row">
          <div class="${s.highlighted ? "skill-check" : "skill-cross"}">${s.highlighted ? "✓" : "✕"}</div>
          ${esc(s.text)}
        </div>`).join("")}
        <div class="cta-btn">Optimize Resume →</div>
      </div>
    </div>
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T4 — BEFORE/AFTER (Dark, 540×675 → 2× scale)
   ============================================================ */
const T4_CSS = `
.t4{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t4 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t4 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t4 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:24px;}
.t4 .split{display:flex;gap:14px;flex:1;}
.t4 .col{flex:1;display:flex;flex-direction:column;gap:8px;}
.t4 .label{font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;align-self:flex-start;margin-bottom:4px;}
.t4 .label-bad{background:rgba(239,68,68,0.12);color:#EF4444;}
.t4 .label-good{background:rgba(34,211,153,0.12);color:#34D399;}
.t4 .bar{height:18px;border-radius:4px;width:100%;}
.t4 .bar-bad{background:#2A2B3A;}
.t4 .bar-good{background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t4 .bar-partial{background:#2A2B3A;width:60%;}
.t4 .score{display:flex;align-items:baseline;gap:6px;margin-top:auto;padding-top:12px;}
.t4 .score-num{font-size:22px;font-weight:900;font-variant-numeric:tabular-nums;}
.t4 .score-bad{color:#EF4444;}
.t4 .score-good{color:#34D399;}
.t4 .score-label{font-size:9px;color:#5A596E;}
.t4 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;position:relative;}
.t4 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t4 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t4 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT4(c: TemplateContent, w: number, h: number): string {
  const beforeScore = c.bars?.[0]?.value || 34;
  const afterScore = c.bars?.[1]?.value || 91;
  return wrapPage("t4", T4_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "TRANSFORMATION")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="split">
      <div class="col">
        <div class="label label-bad">BEFORE</div>
        <div class="bar bar-bad"></div><div class="bar bar-partial"></div>
        <div class="bar bar-bad"></div><div class="bar bar-partial"></div>
        <div class="bar bar-bad"></div><div class="bar bar-bad"></div>
        <div class="score"><span class="score-num score-bad">${beforeScore}%</span><span class="score-label">ATS match</span></div>
      </div>
      <div class="col">
        <div class="label label-good">AFTER JOBPILOT</div>
        <div class="bar bar-good"></div><div class="bar bar-good" style="width:90%"></div>
        <div class="bar bar-good"></div><div class="bar bar-good" style="width:85%"></div>
        <div class="bar bar-good" style="width:95%"></div><div class="bar bar-good"></div>
        <div class="score"><span class="score-num score-good">${afterScore}%</span><span class="score-label">ATS match</span></div>
      </div>
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T5 — TESTIMONIAL (Light, 540×675 → 2× scale)
   ============================================================ */
const T5_CSS = `
.t5{width:540px;height:675px;background:#FAFAF8;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t5 .big-quote{font-size:80px;color:rgba(99,102,241,0.15);font-weight:900;line-height:0.8;margin-bottom:12px;}
.t5 .quote-text{font-size:20px;font-weight:600;color:#1A1A1A;line-height:1.45;flex:1;display:flex;align-items:center;}
.t5 .attr-row{display:flex;align-items:center;gap:14px;margin-top:20px;}
.t5 .avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;flex-shrink:0;}
.t5 .attr-text{font-size:11px;color:#6B6B6B;line-height:1.4;}
.t5 .attr-text strong{color:#1A1A1A;display:block;}
.t5 .stars{display:flex;gap:3px;margin-top:12px;}
.t5 .star{width:16px;height:16px;color:#F59E0B;font-size:14px;}
.t5 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;border-top:1px solid #E8E4DD;}
.t5 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t5 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t5 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT5(c: TemplateContent, w: number, h: number): string {
  const initials = (c.subheadline || "JD").substring(0, 2).toUpperCase();
  return wrapPage("t5", T5_CSS, `
    <div class="big-quote">"</div>
    <div class="quote-text">${esc(c.headline)}</div>
    <div class="stars">${"★★★★★".split("").map(() => '<div class="star">★</div>').join("")}</div>
    <div class="attr-row">
      <div class="avatar">${esc(initials)}</div>
      <div class="attr-text"><strong>${esc(c.subheadline || "Jane Doe")}</strong>${esc(c.body || "Product Manager at Google")}</div>
    </div>
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T6 — CAROUSEL COVER (Dark, 540×540 → 2× to 1080×1080)
   ============================================================ */
const T6_CSS = `
.t6{width:540px;height:540px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t6 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:24px;display:flex;align-items:center;gap:6px;}
.t6 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t6 .big-num{font-size:110px;font-weight:900;letter-spacing:-0.05em;line-height:0.85;color:#E4E2DD;}
.t6 .num-label{font-size:14px;font-weight:600;color:#5A596E;margin-top:4px;margin-bottom:16px;}
.t6 .accent-line{width:40px;height:3px;background:#6366F1;border-radius:2px;margin-bottom:16px;}
.t6 .headline{font-size:22px;font-weight:700;color:#E4E2DD;line-height:1.3;max-width:360px;}
.t6 .headline em{font-style:normal;color:#A78BFA;}
.t6 .bottom-row{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;border-top:1px solid #1E1F2E;}
.t6 .swipe{font-size:9px;color:#5A596E;display:flex;align-items:center;gap:6px;}
.t6 .dots{display:flex;gap:4px;}
.t6 .dot{width:6px;height:6px;border-radius:3px;background:#2A2B3A;}
.t6 .dot.active{background:#6366F1;width:14px;}
.t6 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t6 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t6 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT6(c: TemplateContent, w: number, h: number): string {
  const headline = hl(c.headline, c.headlineHighlight);
  return wrapPage("t6", T6_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DEEP DIVE")}</div>
    <div class="big-num">${esc(c.stat?.value || "73%")}</div>
    <div class="num-label">${esc(c.stat?.label || "")}</div>
    <div class="accent-line"></div>
    <div class="headline">${headline}</div>
    <div class="bottom-row">
      <div class="swipe">Swipe to learn →</div>
      <div class="dots"><div class="dot active"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    </div>
  `, 540, 540, w, h);
}

/* ============================================================
   T7 — BOLD STATEMENT (Solid color, 540×675 → 2× scale)
   ============================================================ */
const T7_CSS = `
.t7{width:540px;height:675px;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t7 .top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:auto;}
.t7 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);}
.t7 .slide-count{font-size:9px;font-weight:600;color:rgba(255,255,255,0.35);font-variant-numeric:tabular-nums;}
.t7 .headline{font-size:42px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.03em;max-width:420px;}
.t7 .hook{font-size:14px;color:rgba(255,255,255,0.6);margin-top:110px;line-height:1.5;max-width:360px;}
.t7 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:24px;}
.t7 .brand-strip .name{font-size:11px;font-weight:700;color:#fff;}
.t7 .brand-strip .name span{font-weight:400;color:rgba(255,255,255,0.4);}
.t7 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:rgba(255,255,255,0.3);}
`;

function buildT7(c: TemplateContent, w: number, h: number): string {
  const bgColors = ["#2E1065", "#312E81", "#1E293B"];
  const bg = c.stat?.value ? bgColors[parseInt(c.stat.value) % 3] : bgColors[0];
  return wrapPage("t7", T7_CSS + `.t7{background:${bg};}`, `
    <div class="top-row">
      <div class="eyebrow">${esc(c.eyebrow || "BOLD STATEMENT")}</div>
      <div class="slide-count">${esc(c.stat?.label || "1/7")}</div>
    </div>
    <div class="headline">${esc(c.headline)}</div>
    ${c.body ? `<div class="hook">${esc(c.body)}</div>` : ""}
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T8 — MYTH VS REALITY (Light, 540×675 → 2× scale)
   ============================================================ */
const T8_CSS = `
.t8{width:540px;height:675px;background:#F8F7F4;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t8 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t8 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t8 .headline{font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;margin-bottom:24px;line-height:1.15;}
.t8 .pair{display:flex;flex-direction:column;gap:2px;margin-bottom:16px;}
.t8 .myth{background:#FEF2F2;border:1px solid #FECACA;border-radius:8px 8px 2px 2px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;}
.t8 .reality{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:2px 2px 8px 8px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;}
.t8 .icon{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0;}
.t8 .icon-bad{background:#DC2626;color:#fff;}
.t8 .icon-good{background:#16A34A;color:#fff;}
.t8 .block-label{font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;}
.t8 .label-bad{color:#DC2626;}
.t8 .label-good{color:#16A34A;}
.t8 .block-text{font-size:12px;color:#4A4A4A;line-height:1.45;font-weight:500;}
.t8 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t8 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t8 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t8 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT8(c: TemplateContent, w: number, h: number): string {
  const pairs = c.tips || [];
  return wrapPage("t8", T8_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "MYTH VS REALITY")}</div>
    <div class="headline">${esc(c.headline)}</div>
    ${pairs.map(p => `<div class="pair">
      <div class="myth"><div class="icon icon-bad">✕</div><div><div class="block-label label-bad">MYTH</div><div class="block-text">${esc(p.title)}</div></div></div>
      <div class="reality"><div class="icon icon-good">✓</div><div><div class="block-label label-good">REALITY</div><div class="block-text">${esc(p.description)}</div></div></div>
    </div>`).join("")}
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T9 — DATA VISUAL (Dark, 540×675 → 2× scale)
   ============================================================ */
const T9_CSS = `
.t9{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t9 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t9 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t9 .headline{font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:28px;line-height:1.15;}
.t9 .bars{display:flex;flex-direction:column;gap:14px;flex:1;}
.t9 .bar-row{display:flex;align-items:center;gap:10px;}
.t9 .bar-label{width:100px;text-align:right;font-size:10px;color:#5A596E;flex-shrink:0;}
.t9 .bar-track{flex:1;height:28px;background:#10111A;border-radius:4px;position:relative;overflow:hidden;}
.t9 .bar-fill{height:100%;border-radius:4px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;}
.t9 .bar-fill.top{background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t9 .bar-fill.mid{background:#6366F1;}
.t9 .bar-fill.low{background:#2A2B3A;}
.t9 .bar-pct{font-size:9px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;}
.t9 .source{font-size:7px;color:#3A3A4A;margin-top:12px;}
.t9 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;position:relative;}
.t9 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t9 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t9 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT9(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapPage("t9", T9_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DATA")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="bars">
      ${bars.map((b, i) => {
        const cls = i === 0 ? "top" : i < 3 ? "mid" : "low";
        return `<div class="bar-row">
          <div class="bar-label">${esc(b.label)}</div>
          <div class="bar-track"><div class="bar-fill ${cls}" style="width:${b.value}%"><span class="bar-pct">${b.value}%</span></div></div>
        </div>`;
      }).join("")}
    </div>
    <div class="source">${esc(c.subheadline || "Source: JobPilot AI analysis")}</div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T10 — ANNOUNCEMENT (Brand gradient, 540×675 → 2× scale)
   ============================================================ */
const T10_CSS = `
.t10{width:540px;height:675px;background:linear-gradient(145deg,#1E1B4B 0%,#312E81 50%,#3B1F7E 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t10::before{content:'';position:absolute;top:-80px;right:-80px;width:250px;height:250px;border-radius:50%;background:rgba(167,139,250,0.12);filter:blur(60px);}
.t10::after{content:'';position:absolute;bottom:-60px;left:-60px;width:200px;height:200px;border-radius:50%;background:rgba(99,102,241,0.1);filter:blur(60px);}
.t10 .pill{display:inline-flex;align-items:center;gap:6px;background:rgba(167,139,250,0.2);border:1px solid rgba(167,139,250,0.3);border-radius:20px;padding:5px 14px;font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C4B5FD;align-self:flex-start;margin-bottom:24px;position:relative;z-index:2;}
.t10 .headline{font-size:34px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.03em;margin-bottom:12px;position:relative;z-index:2;}
.t10 .sub{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:28px;max-width:380px;position:relative;z-index:2;}
.t10 .features{display:flex;flex-direction:column;gap:12px;position:relative;z-index:2;}
.t10 .feat{display:flex;align-items:center;gap:10px;font-size:12px;color:#fff;}
.t10 .feat-icon{width:22px;height:22px;border-radius:50%;background:rgba(99,102,241,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;}
.t10 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:24px;position:relative;z-index:2;}
.t10 .brand-strip .name{font-size:11px;font-weight:700;color:#fff;}
.t10 .brand-strip .name span{font-weight:400;color:rgba(255,255,255,0.4);}
.t10 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:rgba(255,255,255,0.3);}
`;

function buildT10(c: TemplateContent, w: number, h: number): string {
  const features = c.bullets || [];
  return wrapPage("t10", T10_CSS, `
    <div class="pill">${esc(c.eyebrow || "NEW FEATURE")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="sub">${esc(c.body || "")}</div>
    <div class="features">
      ${features.map(f => `<div class="feat"><div class="feat-icon">✓</div>${esc(f)}</div>`).join("")}
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T11 — CHECKLIST (White, 540×675 → 2× scale)
   ============================================================ */
const T11_CSS = `
.t11{width:540px;height:675px;background:#FFFFFF;border:1px solid #E8E4DD;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t11 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t11 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t11 .headline{font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;margin-bottom:24px;}
.t11 .items{display:flex;flex-direction:column;gap:8px;flex:1;}
.t11 .item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;font-size:12px;}
.t11 .item-done{background:#F0FDF4;}
.t11 .item-todo{background:#F8F7F4;}
.t11 .check{width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;}
.t11 .check-done{background:#6366F1;color:#fff;}
.t11 .check-todo{border:2px solid #D4D0C8;color:transparent;}
.t11 .item-done .text{color:#6B6B6B;text-decoration:line-through;}
.t11 .item-todo .text{color:#1A1A1A;font-weight:500;}
.t11 .cta-line{font-size:10px;color:#6366F1;font-weight:600;margin-top:12px;}
.t11 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t11 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t11 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t11 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT11(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapPage("t11", T11_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "CHECKLIST")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="items">
      ${items.map(item => `<div class="item ${item.highlighted ? "item-done" : "item-todo"}">
        <div class="check ${item.highlighted ? "check-done" : "check-todo"}">${item.highlighted ? "✓" : ""}</div>
        <span class="text">${esc(item.text)}</span>
      </div>`).join("")}
    </div>
    ${c.cta ? `<div class="cta-line">${esc(c.cta)}</div>` : ""}
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T12 — CONTROVERSIAL TAKE (Dark + red, 540×675 → 2× scale)
   ============================================================ */
const T12_CSS = `
.t12{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t12 .warn-strip{display:flex;align-items:center;gap:8px;margin-bottom:32px;}
.t12 .warn-icon{width:22px;height:22px;border-radius:50%;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;font-size:11px;color:#EF4444;font-weight:800;}
.t12 .warn-label{font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#EF4444;}
.t12 .headline{font-size:38px;font-weight:900;color:#E4E2DD;line-height:1.15;letter-spacing:-0.03em;margin-bottom:20px;}
.t12 .headline s{color:#EF4444;text-decoration:line-through;text-decoration-thickness:3px;}
.t12 .red-rule{width:40px;height:3px;background:#EF4444;border-radius:2px;margin-bottom:20px;}
.t12 .counter{font-size:14px;color:#8B8A9A;line-height:1.5;max-width:380px;}
.t12 .counter strong{color:#E4E2DD;font-weight:700;}
.t12 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:24px;position:relative;}
.t12 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t12 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t12 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT12(c: TemplateContent, w: number, h: number): string {
  const body = c.body ? boldPhrase(c.body, c.bodyBold) : "";
  return wrapPage("t12", T12_CSS, `
    <div class="warn-strip">
      <div class="warn-icon">!</div>
      <div class="warn-label">UNPOPULAR OPINION</div>
    </div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="red-rule"></div>
    ${body ? `<div class="counter">${body}</div>` : ""}
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T13 — SOCIAL PROOF WALL (Light, 540×675 → 2× scale)
   ============================================================ */
const T13_CSS = `
.t13{width:540px;height:675px;background:#F8F7F4;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t13 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t13 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t13 .big-num{font-size:72px;font-weight:900;letter-spacing:-0.05em;color:#1A1A1A;line-height:0.9;}
.t13 .num-label{font-size:13px;color:#6B6B6B;margin-top:4px;margin-bottom:28px;}
.t13 .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;flex:1;}
.t13 .card{background:#fff;border:1px solid #E8E4DD;border-radius:8px;padding:16px;display:flex;flex-direction:column;}
.t13 .card-val{font-size:24px;font-weight:800;color:#1A1A1A;font-variant-numeric:tabular-nums;}
.t13 .card-val.accent{color:#6366F1;}
.t13 .card-label{font-size:9px;color:#8A8A8A;margin-top:4px;margin-bottom:auto;}
.t13 .card-bar{height:4px;background:#E8E4DD;border-radius:2px;margin-top:8px;overflow:hidden;}
.t13 .card-bar-fill{height:100%;background:#6366F1;border-radius:2px;}
.t13 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t13 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t13 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t13 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT13(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapPage("t13", T13_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "SOCIAL PROOF")}</div>
    <div class="big-num">${esc(c.stat?.value || "12K+")}</div>
    <div class="num-label">${esc(c.stat?.label || "resumes optimized")}</div>
    <div class="grid">
      ${bars.map((b, i) => `<div class="card">
        <div class="card-val${i < 2 ? " accent" : ""}">${esc(String(b.value))}</div>
        <div class="card-label">${esc(b.label)}</div>
        <div class="card-bar"><div class="card-bar-fill" style="width:${Math.min(b.value, 100)}%"></div></div>
      </div>`).join("")}
    </div>
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T14 — HOT TAKE POLL (Ocean bg, 540×675 → 2× scale)
   ============================================================ */
const T14_CSS = `
.t14{width:540px;height:675px;background:#0C4A6E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t14 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:24px;display:flex;align-items:center;gap:6px;}
.t14 .eyebrow::before{content:'';width:12px;height:1.5px;background:rgba(255,255,255,0.3);}
.t14 .headline{font-size:34px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.03em;margin-bottom:32px;}
.t14 .options{display:flex;flex-direction:column;gap:10px;flex:1;}
.t14 .option{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);}
.t14 .option.hot{border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);}
.t14 .opt-letter{width:28px;height:28px;border-radius:6px;border:1.5px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);flex-shrink:0;}
.t14 .option.hot .opt-letter{border-color:#fff;color:#fff;}
.t14 .opt-text{font-size:13px;color:rgba(255,255,255,0.7);flex:1;}
.t14 .option.hot .opt-text{color:#fff;font-weight:600;}
.t14 .cta{font-size:10px;color:rgba(255,255,255,0.4);text-align:center;margin-top:16px;}
.t14 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t14 .brand-strip .name{font-size:11px;font-weight:700;color:#fff;}
.t14 .brand-strip .name span{font-weight:400;color:rgba(255,255,255,0.4);}
.t14 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:rgba(255,255,255,0.3);}
`;

function buildT14(c: TemplateContent, w: number, h: number): string {
  const options = c.items || [];
  const letters = ["A", "B", "C", "D"];
  return wrapPage("t14", T14_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "HOT TAKE")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="options">
      ${options.map((o, i) => `<div class="option${o.highlighted ? " hot" : ""}">
        <div class="opt-letter">${letters[i] || ""}</div>
        <div class="opt-text">${esc(o.text)}</div>
      </div>`).join("")}
    </div>
    <div class="cta">Drop your answer in the comments ↓</div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T15 — STEP PROCESS (Dark, 540×675 → 2× scale)
   ============================================================ */
const T15_CSS = `
.t15{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t15 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t15 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t15 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:28px;}
.t15 .steps{display:flex;flex-direction:column;gap:0;flex:1;position:relative;}
.t15 .step{display:flex;gap:16px;align-items:flex-start;position:relative;padding-bottom:20px;}
.t15 .step::before{content:'';position:absolute;left:13px;top:28px;bottom:0;width:2px;background:#1E1F2E;}
.t15 .step:last-child::before{display:none;}
.t15 .step-dot{width:28px;height:28px;border-radius:50%;border:2px solid #6366F1;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#6366F1;flex-shrink:0;background:#08090E;z-index:1;}
.t15 .step:first-child .step-dot{background:#6366F1;color:#fff;}
.t15 .step-content{padding-top:4px;}
.t15 .step-title{font-size:13px;font-weight:700;color:#E4E2DD;margin-bottom:3px;}
.t15 .step-desc{font-size:10px;color:#5A596E;line-height:1.45;}
.t15 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;position:relative;}
.t15 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t15 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t15 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT15(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapPage("t15", T15_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "PROCESS")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="steps">
      ${steps.map(s => `<div class="step">
        <div class="step-dot">${esc(s.label)}</div>
        <div class="step-content">
          <div class="step-title">${esc(s.title)}</div>
          ${s.description ? `<div class="step-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T73 — RED FLAG / GREEN FLAG (Split card, 540×675)
   ============================================================ */
const T73_CSS = `
.t73{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t73 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t73 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t73 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:24px;}
.t73 .flags{display:flex;flex-direction:column;gap:8px;flex:1;}
.t73 .flag{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:6px;}
.t73 .flag-red{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);}
.t73 .flag-green{background:rgba(34,211,153,0.08);border:1px solid rgba(34,211,153,0.15);}
.t73 .flag-icon{font-size:12px;flex-shrink:0;margin-top:1px;}
.t73 .flag-text{font-size:11px;color:#E4E2DD;line-height:1.45;font-weight:500;}
.t73 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;position:relative;}
.t73 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t73 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t73 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT73(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapPage("t73", T73_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "RED FLAG / GREEN FLAG")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="flags">
      ${items.map(item => `<div class="flag ${item.highlighted ? "flag-green" : "flag-red"}">
        <div class="flag-icon">${item.highlighted ? "🟢" : "🔴"}</div>
        <div class="flag-text">${esc(item.text)}</div>
      </div>`).join("")}
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T74 — TOOL STACK (Grid of tools + ratings, light, 540×675)
   ============================================================ */
const T74_CSS = `
.t74{width:540px;height:675px;background:#F8F7F4;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t74 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t74 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t74 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;margin-bottom:20px;}
.t74 .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;}
.t74 .tool{background:#fff;border:1px solid #E8E4DD;border-radius:8px;padding:14px;display:flex;flex-direction:column;}
.t74 .tool-name{font-size:12px;font-weight:700;color:#1A1A1A;margin-bottom:4px;}
.t74 .tool-desc{font-size:8px;color:#8A8A8A;line-height:1.4;margin-bottom:auto;}
.t74 .tool-rating{display:flex;gap:2px;margin-top:8px;}
.t74 .star-on{width:10px;height:10px;border-radius:50%;background:#6366F1;}
.t74 .star-off{width:10px;height:10px;border-radius:50%;background:#E2E0DB;}
.t74 .tool-tag{font-size:7px;font-weight:600;color:#6366F1;margin-top:4px;}
.t74 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t74 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t74 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t74 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT74(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapPage("t74", T74_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "TOOL STACK")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="grid">
      ${items.map(item => {
        const rating = parseInt(item.value || "4");
        return `<div class="tool">
          <div class="tool-name">${esc(item.text)}</div>
          <div class="tool-desc">${esc(item.highlighted ? "Essential" : "Recommended")}</div>
          <div class="tool-rating">${Array.from({length:5}, (_, i) => `<div class="${i < rating ? "star-on" : "star-off"}"></div>`).join("")}</div>
          ${item.highlighted ? '<div class="tool-tag">Must-have</div>' : ""}
        </div>`;
      }).join("")}
    </div>
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T75 — RESUME BREAKDOWN (Annotated section, dark, 540×675)
   ============================================================ */
const T75_CSS = `
.t75{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t75 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t75 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t75 .headline{font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:20px;}
.t75 .resume-card{background:#111118;border:1px solid #1E1F2E;border-radius:8px;padding:20px;flex:1;display:flex;flex-direction:column;gap:10px;}
.t75 .section{display:flex;flex-direction:column;gap:4px;}
.t75 .section-label{font-size:7px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6366F1;display:flex;align-items:center;gap:6px;}
.t75 .section-label .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.t75 .dot-good{background:#34D399;}
.t75 .dot-warn{background:#F59E0B;}
.t75 .dot-bad{background:#EF4444;}
.t75 .section-text{font-size:10px;color:rgba(255,255,255,0.6);line-height:1.5;padding-left:12px;border-left:2px solid #1E1F2E;}
.t75 .verdict{font-size:9px;color:#8B8A9A;margin-top:auto;padding-top:12px;border-top:1px solid #1E1F2E;}
.t75 .verdict strong{color:#34D399;font-weight:700;}
.t75 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;}
.t75 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t75 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t75 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT75(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  const dotClass = (i: number) => i === 0 ? "dot-good" : i === tips.length - 1 ? "dot-bad" : "dot-warn";
  return wrapPage("t75", T75_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "RESUME BREAKDOWN")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="resume-card">
      ${tips.map((t, i) => `<div class="section">
        <div class="section-label"><div class="dot ${dotClass(i)}"></div>${esc(t.title)}</div>
        <div class="section-text">${esc(t.description)}</div>
      </div>`).join("")}
      ${c.cta ? `<div class="verdict"><strong>Verdict:</strong> ${esc(c.cta)}</div>` : ""}
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T76 — HIRING MANAGER POV (Perspective card, light, 540×675)
   ============================================================ */
const T76_CSS = `
.t76{width:540px;height:675px;background:#F8F7F4;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t76 .pov-badge{display:inline-flex;align-items:center;gap:6px;background:#1A1A1A;color:#fff;padding:5px 14px;border-radius:20px;font-size:8px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;align-self:flex-start;margin-bottom:20px;}
.t76 .pov-badge .eye{font-size:10px;}
.t76 .headline{font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;line-height:1.15;margin-bottom:20px;}
.t76 .insights{display:flex;flex-direction:column;gap:10px;flex:1;}
.t76 .insight{padding:12px 14px;border-radius:6px;background:#fff;border:1px solid #E8E4DD;display:flex;gap:10px;align-items:flex-start;}
.t76 .insight-num{width:22px;height:22px;border-radius:50%;background:#1A1A1A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;}
.t76 .insight-text{font-size:11px;color:#4A4A4A;line-height:1.45;}
.t76 .insight-text strong{color:#1A1A1A;font-weight:700;}
.t76 .source{font-size:8px;color:#8A8A8A;font-style:italic;margin-top:auto;padding-top:12px;}
.t76 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;}
.t76 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t76 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t76 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT76(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapPage("t76", T76_CSS, `
    <div class="pov-badge"><span class="eye">👁</span> HIRING MANAGER POV</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="insights">
      ${steps.map(s => `<div class="insight">
        <div class="insight-num">${esc(s.label)}</div>
        <div class="insight-text">${esc(s.title)}${s.description ? ` — <strong>${esc(s.description)}</strong>` : ""}</div>
      </div>`).join("")}
    </div>
    ${c.subheadline ? `<div class="source">"${esc(c.subheadline)}"</div>` : ""}
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T77 — SALARY NEGOTIATION (Range visual, dark gradient, 540×675)
   ============================================================ */
const T77_CSS = `
.t77{width:540px;height:675px;background:linear-gradient(145deg,#1E1B4B,#312E81,#3B1F7E);position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t77::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(167,139,250,0.1);filter:blur(60px);}
.t77 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(167,139,250,0.6);margin-bottom:20px;position:relative;z-index:1;}
.t77 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#fff;margin-bottom:8px;position:relative;z-index:1;}
.t77 .sub{font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:28px;position:relative;z-index:1;}
.t77 .ranges{display:flex;flex-direction:column;gap:16px;flex:1;position:relative;z-index:1;}
.t77 .range{display:flex;flex-direction:column;gap:6px;}
.t77 .range-header{display:flex;justify-content:space-between;font-size:10px;}
.t77 .range-label{color:rgba(255,255,255,0.6);font-weight:500;}
.t77 .range-value{color:#fff;font-weight:700;font-variant-numeric:tabular-nums;}
.t77 .range-track{height:8px;background:rgba(255,255,255,0.08);border-radius:4px;position:relative;overflow:hidden;}
.t77 .range-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t77 .range-marker{position:absolute;top:-4px;width:3px;height:16px;background:#fff;border-radius:2px;}
.t77 .tip{font-size:9px;color:rgba(255,255,255,0.35);margin-top:auto;padding-top:16px;line-height:1.5;position:relative;z-index:1;}
.t77 .tip strong{color:#A78BFA;font-weight:600;}
.t77 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;position:relative;z-index:1;}
.t77 .brand-strip .name{font-size:11px;font-weight:700;color:#fff;}
.t77 .brand-strip .name span{font-weight:400;color:rgba(255,255,255,0.3);}
.t77 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:rgba(255,255,255,0.2);}
`;

function buildT77(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapPage("t77", T77_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "SALARY GUIDE")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    <div class="ranges">
      ${bars.map(b => {
        const pct = Math.min(b.value, 100);
        return `<div class="range">
          <div class="range-header"><span class="range-label">${esc(b.label)}</span><span class="range-value">${esc(b.color || "$" + b.value + "K")}</span></div>
          <div class="range-track"><div class="range-fill" style="width:${pct}%"></div></div>
        </div>`;
      }).join("")}
    </div>
    ${c.body ? `<div class="tip">${esc(c.body)}</div>` : ""}
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T78 — QUICK STAT GRID (2×3 mini dashboard, dark, 540×675)
   ============================================================ */
const T78_CSS = `
.t78{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t78 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t78 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t78 .headline{font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#E4E2DD;margin-bottom:24px;}
.t78 .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;flex:1;}
.t78 .cell{background:#111118;border:1px solid #1E1F2E;border-radius:8px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.t78 .cell-val{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;margin-bottom:4px;}
.t78 .cell-val.accent{color:#6366F1;}
.t78 .cell-val.good{color:#34D399;}
.t78 .cell-val.white{color:#E4E2DD;}
.t78 .cell-label{font-size:8px;color:#5A596E;line-height:1.3;}
.t78 .cell-trend{font-size:8px;font-weight:600;margin-top:auto;padding-top:6px;}
.t78 .trend-up{color:#34D399;}
.t78 .trend-down{color:#EF4444;}
.t78 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;position:relative;}
.t78 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t78 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t78 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT78(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const valColors = ["accent", "good", "white", "accent", "good", "white"];
  return wrapPage("t78", T78_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "BY THE NUMBERS")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="grid">
      ${bars.map((b, i) => `<div class="cell">
        <div class="cell-val ${valColors[i % 6]}">${esc(String(b.value))}</div>
        <div class="cell-label">${esc(b.label)}</div>
        ${b.color ? `<div class="cell-trend ${b.color === "up" ? "trend-up" : "trend-down"}">${b.color === "up" ? "↑" : "↓"}</div>` : ""}
      </div>`).join("")}
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   T79 — DAY IN THE LIFE (Timeline/schedule, light, 540×675)
   ============================================================ */
const T79_CSS = `
.t79{width:540px;height:675px;background:#FFFFFF;border:1px solid #E8E4DD;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t79 .eyebrow{font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.t79 .eyebrow::before{content:'';width:12px;height:1.5px;background:#6366F1;}
.t79 .headline{font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;margin-bottom:24px;}
.t79 .timeline{display:flex;flex-direction:column;gap:0;flex:1;}
.t79 .slot{display:flex;gap:14px;padding-bottom:12px;position:relative;}
.t79 .slot::before{content:'';position:absolute;left:24px;top:18px;bottom:0;width:1px;background:#E8E4DD;}
.t79 .slot:last-child::before{display:none;}
.t79 .time{width:50px;font-size:9px;font-weight:700;color:#6366F1;font-variant-numeric:tabular-nums;text-align:right;flex-shrink:0;padding-top:2px;}
.t79 .slot-dot{width:8px;height:8px;border-radius:50%;border:2px solid #6366F1;background:#fff;flex-shrink:0;z-index:1;margin-top:4px;}
.t79 .slot:first-child .slot-dot{background:#6366F1;}
.t79 .slot-content{padding-top:0;}
.t79 .slot-title{font-size:12px;font-weight:700;color:#1A1A1A;margin-bottom:2px;}
.t79 .slot-desc{font-size:9px;color:#8A8A8A;line-height:1.4;}
.t79 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;}
.t79 .brand-strip .name{font-size:11px;font-weight:700;color:#1A1A1A;}
.t79 .brand-strip .name span{font-weight:400;color:#8A8A8A;}
.t79 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#8A8A8A;}
`;

function buildT79(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapPage("t79", T79_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DAY IN THE LIFE")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="timeline">
      ${steps.map(s => `<div class="slot">
        <div class="time">${esc(s.label)}</div>
        <div class="slot-dot"></div>
        <div class="slot-content">
          <div class="slot-title">${esc(s.title)}</div>
          ${s.description ? `<div class="slot-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${brandStripT1Light()}
  `, 540, 675, w, h);
}

/* ============================================================
   T80 — EXPERT HOT TAKE (Authority card, dark, 540×675)
   ============================================================ */
const T80_CSS = `
.t80{width:540px;height:675px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;padding:40px 44px;}
.t80::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#6366F1,#A78BFA,#6366F1);}
.t80 .meta{display:flex;align-items:center;gap:10px;margin-bottom:24px;margin-top:8px;}
.t80 .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.t80 .avatar img{width:20px;height:20px;border-radius:4px;}
.t80 .meta-text{display:flex;flex-direction:column;}
.t80 .meta-name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t80 .meta-role{font-size:8px;color:#5A596E;}
.t80 .take{font-size:28px;font-weight:900;color:#E4E2DD;line-height:1.2;letter-spacing:-0.03em;flex:1;display:flex;align-items:center;}
.t80 .take em{font-style:normal;color:#A78BFA;}
.t80 .context{font-size:11px;color:#5A596E;line-height:1.5;margin-top:auto;padding-top:16px;border-top:1px solid #1E1F2E;}
.t80 .context strong{color:#8B8A9A;font-weight:600;}
.t80 .engage{display:flex;gap:16px;margin-top:12px;}
.t80 .engage-item{font-size:9px;color:#5A596E;display:flex;align-items:center;gap:4px;}
.t80 .brand-strip{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:16px;position:relative;}
.t80 .brand-strip .name{font-size:11px;font-weight:700;color:#E4E2DD;}
.t80 .brand-strip .name span{font-weight:400;color:#5A596E;}
.t80 .brand-strip .url{font-family:${MONO_STACK};font-size:7px;color:#5A596E;}
`;

function buildT80(c: TemplateContent, w: number, h: number): string {
  const headline = esc(c.headline);
  const kw = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = kw ? headline.replace(kw, `<em>${kw}</em>`) : headline;
  const body = c.body ? esc(c.body) : "";
  const boldBody = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapPage("t80", T80_CSS, `
    <div class="meta">
      <div class="avatar"><img src="${LOGO_DATA_URI}" alt="JP"></div>
      <div class="meta-text"><span class="meta-name">${esc(c.subheadline || "JobPilot AI")}</span><span class="meta-role">${esc(c.eyebrow || "Career Intelligence")}</span></div>
    </div>
    <div class="take">${styled}</div>
    ${body ? `<div class="context">${boldBody}</div>` : ""}
    <div class="engage">
      <div class="engage-item">💬 Agree or disagree?</div>
      <div class="engage-item">🔖 Save</div>
    </div>
    ${brandStripT1Dark()}
  `, 540, 675, w, h);
}

/* ============================================================
   ROUTER — Dispatches template ID to the correct builder
   ============================================================ */
export function buildLinkedInTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): string {
  switch (templateId) {
    case "t1":  return buildT1(content, width, height);
    case "t2":  return buildT2(content, width, height);
    case "t3":  return buildT3(content, width, height);
    case "t4":  return buildT4(content, width, height);
    case "t5":  return buildT5(content, width, height);
    case "t6":  return buildT6(content, width, height);
    case "t7":  return buildT7(content, width, height);
    case "t8":  return buildT8(content, width, height);
    case "t9":  return buildT9(content, width, height);
    case "t10": return buildT10(content, width, height);
    case "t11": return buildT11(content, width, height);
    case "t12": return buildT12(content, width, height);
    case "t13": return buildT13(content, width, height);
    case "t14": return buildT14(content, width, height);
    case "t15": return buildT15(content, width, height);
    case "t65": return buildT65(content, width, height);
    case "t66": return buildT66(content, width, height);
    case "t67": return buildT67(content, width, height);
    case "t68": return buildT68(content, width, height);
    case "t69": return buildT69(content, width, height);
    case "t70": return buildT70(content, width, height);
    case "t71": return buildT71(content, width, height);
    case "t72": return buildT72(content, width, height);
    case "t73": return buildT73(content, width, height);
    case "t74": return buildT74(content, width, height);
    case "t75": return buildT75(content, width, height);
    case "t76": return buildT76(content, width, height);
    case "t77": return buildT77(content, width, height);
    case "t78": return buildT78(content, width, height);
    case "t79": return buildT79(content, width, height);
    case "t80": return buildT80(content, width, height);
    default:
      // # Fallback: render as T68 Quick Win (most versatile)
      return buildT68(content, width, height);
  }
}
