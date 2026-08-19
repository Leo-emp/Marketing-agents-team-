/* ============================================================
   INSTAGRAM TEMPLATES — T22-T27 (Set 1: Editorial Core)
   ============================================================
   # Mixed formats: 4:5 feed (540×675→2×), 1:1 grid (540×540→2×),
   # 9:16 story/reel (432×768→2.5×).
   # Editorial/magazine aesthetic, serif headlines, warm palettes.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, LOGO_PRO_URI, esc } from "./shared";

// # All Instagram template IDs across all 5 sets
export const INSTAGRAM_IDS: TemplateId[] = [
  "t22", "t23", "t24", "t25", "t26", "t27",
  "t34", "t35", "t36", "t37", "t38", "t39",
  "t45", "t46", "t47", "t48",
  "t53", "t54", "t55", "t56",
  "t57", "t58", "t59", "t60", "t61", "t62", "t63", "t64",
  "t89", "t90", "t91", "t92", "t93", "t94", "t95", "t96",
  "t109", "t110", "t111", "t112", "t113", "t114",
  "t127", "t128", "t129", "t130", "t131", "t132",
  "t145", "t146", "t147", "t148", "t149", "t150",
];

// # Instagram font stacks — serif headlines for editorial feel
const IG_SERIF = `Georgia, 'Times New Roman', serif`;
const IG_SANS = `'Segoe UI', system-ui, -apple-system, sans-serif`;
const IG_MONO = `'Cascadia Code', 'Fira Code', Consolas, monospace`;

// # Centered brand footer — subtle, uppercase
function brandFooter(color: string = "rgba(0,0,0,0.2)"): string {
  return `<div style="position:absolute;bottom:16px;left:0;right:0;text-align:center;font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${color};z-index:5;">JOBPILOT AI</div>`;
}

// # Story badge pill — centered bottom
function storyBadge(): string {
  return `<div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:14px;padding:5px 12px;z-index:5;">
    <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:3px;">
    <span style="font-family:${IG_SANS};font-size:7px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.06em;">JOBPILOT AI</span>
  </div>`;
}

// # Page wrapper with scale transform
function wrapIG(cls: string, css: string, body: string, pw: number, ph: number, tw: number, th: number): string {
  const scale = tw / pw;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${tw}px;height:${th}px;overflow:hidden;}
  body{font-family:${IG_SANS};transform-origin:top left;transform:scale(${scale});width:${pw}px;height:${ph}px;}
  .${cls}{width:${pw}px;height:${ph}px;position:relative;overflow:hidden;}
  ${css}
</style></head>
<body><div class="${cls}">${body}</div></body></html>`;
}

/* ============================================================
   T22 — EDITORIAL CAROUSEL COVER (Warm cream, 4:5 feed)
   ============================================================ */
const T22_CSS = `
.t22{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t22 .cat{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#B8860B;margin-bottom:10px;}
.t22 .rule{height:1px;background:#1A1A1A;margin-bottom:20px;}
.t22 .headline{font-family:${IG_SERIF};font-size:27px;font-weight:300;color:#1A1A1A;line-height:1.3;margin-bottom:8px;}
.t22 .headline strong{font-weight:700;}
.t22 .sub{font-family:${IG_SANS};font-size:10px;color:#8A8A8A;margin-bottom:auto;}
.t22 .footer{border-top:1px solid #E2E0DB;padding-top:12px;display:flex;align-items:center;justify-content:space-between;}
.t22 .footer .brand{font-family:${IG_SANS};font-size:7px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#B0ACA0;}
.t22 .footer .slide-ct{font-family:${IG_MONO};font-size:7px;color:#B0ACA0;}
.t22 .footer .url{font-family:${IG_MONO};font-size:6px;color:#C8C4BC;position:absolute;bottom:12px;left:50%;transform:translateX(-50%);}
`;

function buildT22(c: TemplateContent, w: number, h: number): string {
  const headline = esc(c.headline);
  const boldPhrase = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = boldPhrase ? headline.replace(boldPhrase, `<strong>${boldPhrase}</strong>`) : headline;

  return wrapIG("t22", T22_CSS, `
    <div class="cat">${esc(c.eyebrow || "CAREER STRATEGY")}</div>
    <div class="rule"></div>
    <div class="headline">${styled}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    <div class="footer">
      <span class="brand">JobPilot AI</span>
      <span class="slide-ct">${esc(c.stat?.value || "01 / 07")}</span>
      <span class="url">jobpilotai.co</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T23 — SAVE-WORTHY TIP CARD (Warm gradient, 4:5 feed)
   ============================================================ */
const T23_CSS = `
.t23{background:linear-gradient(170deg,#E8E4D9,#F5F1E8,#FAF8F5);display:flex;flex-direction:column;padding:44px 40px 32px;}
.t23 .save-tag{display:flex;align-items:center;gap:6px;font-family:${IG_SANS};font-size:6px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8B7355;margin-bottom:20px;}
.t23 .save-tag .bk{font-size:10px;}
.t23 .headline{font-family:${IG_SANS};font-size:22px;font-weight:800;color:#1A1A1A;line-height:1.2;margin-bottom:24px;letter-spacing:-0.02em;}
.t23 .tips{display:flex;flex-direction:column;gap:14px;flex:1;}
.t23 .tip{display:flex;gap:10px;align-items:flex-start;}
.t23 .tip-num{width:18px;height:18px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0;margin-top:2px;}
.t23 .tip-text{font-family:${IG_SANS};font-size:11px;color:#4A4A4A;line-height:1.5;}
.t23 .tip-text strong{color:#1A1A1A;font-weight:700;}
.t23 .bottom{font-family:${IG_SANS};font-size:6px;color:#B0ACA0;text-align:center;margin-top:auto;padding-top:16px;letter-spacing:0.06em;}
`;

function buildT23(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  return wrapIG("t23", T23_CSS, `
    <div class="save-tag"><span class="bk">🔖</span> SAVE FOR LATER</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="tips">
      ${tips.map((t, i) => `<div class="tip">
        <div class="tip-num">${i + 1}</div>
        <div class="tip-text"><strong>${esc(t.title)}</strong> — ${esc(t.description)}</div>
      </div>`).join("")}
    </div>
    <div class="bottom">Bookmark this · jobpilotai.co</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T24 — STORY POLL (Brand gradient, 9:16 story)
   ============================================================ */
const T24_CSS = `
.t24{background:linear-gradient(165deg,#6366F1,#8B5CF6,#A78BFA);display:flex;flex-direction:column;padding:60px 28px 32px;align-items:center;}
.t24 .question{font-family:${IG_SANS};font-size:22px;font-weight:800;color:#fff;text-align:center;line-height:1.2;margin-bottom:28px;margin-top:40px;max-width:360px;}
.t24 .options{display:flex;flex-direction:column;gap:8px;width:100%;max-width:360px;}
.t24 .option{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);position:relative;overflow:hidden;}
.t24 .option.voted{border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);}
.t24 .opt-letter{width:22px;height:22px;border-radius:4px;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:rgba(255,255,255,0.6);flex-shrink:0;}
.t24 .option.voted .opt-letter{border-color:#fff;color:#fff;}
.t24 .opt-text{font-family:${IG_SANS};font-size:10px;color:rgba(255,255,255,0.7);flex:1;}
.t24 .option.voted .opt-text{color:#fff;font-weight:600;}
.t24 .opt-pct{font-family:${IG_SANS};font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);}
.t24 .option.voted .opt-pct{color:#fff;}
`;

function buildT24(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  const letters = ["A", "B", "C", "D"];
  return wrapIG("t24", T24_CSS, `
    <div class="question">${esc(c.headline)}</div>
    <div class="options">
      ${items.map((item, i) => `<div class="option${item.highlighted ? " voted" : ""}">
        <div class="opt-letter">${letters[i] || ""}</div>
        <div class="opt-text">${esc(item.text)}</div>
        <div class="opt-pct">${esc(item.value || "")}</div>
      </div>`).join("")}
    </div>
    ${storyBadge()}
  `, 432, 768, w, h);
}

/* ============================================================
   T25 — MINIMAL QUOTE (White, 1:1 grid)
   ============================================================ */
const T25_CSS = `
.t25{background:#FFFFFF;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 50px;text-align:center;}
.t25 .rule-top{width:60px;height:1px;background:#1A1A1A;margin-bottom:32px;}
.t25 .quote{font-family:${IG_SERIF};font-size:18px;font-weight:400;font-style:italic;color:#1A1A1A;line-height:1.5;max-width:380px;margin-bottom:32px;}
.t25 .quote strong{font-weight:700;font-style:italic;}
.t25 .rule-bot{width:60px;height:1px;background:#1A1A1A;margin-bottom:20px;}
.t25 .attr{font-family:${IG_SANS};font-size:7px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#B0ACA0;}
`;

function buildT25(c: TemplateContent, w: number, h: number): string {
  const quote = esc(c.headline);
  const highlight = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = highlight ? quote.replace(highlight, `<strong>${highlight}</strong>`) : quote;

  return wrapIG("t25", T25_CSS, `
    <div class="rule-top"></div>
    <div class="quote">${styled}</div>
    <div class="rule-bot"></div>
    <div class="attr">${esc(c.subheadline || "JOBPILOT AI")}</div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T26 — FEATURE BREAKDOWN (Warm cream, 4:5 feed)
   ============================================================ */
const T26_CSS = `
.t26{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t26 .eyebrow{font-family:${IG_SANS};font-size:6px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:14px;display:flex;align-items:center;gap:6px;}
.t26 .eyebrow::before{content:'';width:10px;height:1.5px;background:#6366F1;}
.t26 .feat-name{font-family:${IG_SANS};font-size:18px;font-weight:800;color:#1A1A1A;margin-bottom:4px;letter-spacing:-0.02em;}
.t26 .feat-desc{font-family:${IG_SANS};font-size:9px;color:#8A8A8A;margin-bottom:16px;}
.t26 .ui-card{background:#fff;border:1px solid #E8E4DD;border-radius:8px;overflow:hidden;flex:1;display:flex;flex-direction:column;}
.t26 .tab-bar{display:flex;border-bottom:1px solid #E8E4DD;padding:0 12px;}
.t26 .tab{padding:8px 10px;font-size:7px;font-weight:600;color:#8A8A8A;border-bottom:2px solid transparent;}
.t26 .tab.active{color:#6366F1;border-color:#6366F1;}
.t26 .card-body{padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:10px;}
.t26 .score-row{display:flex;align-items:center;gap:12px;}
.t26 .ring{width:44px;height:44px;border-radius:50%;border:3px solid #E2E0DB;border-top-color:#6366F1;border-right-color:#6366F1;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#6366F1;flex-shrink:0;}
.t26 .score-text{font-size:8px;color:#6B6B6B;}
.t26 .score-text strong{color:#1A1A1A;font-size:10px;display:block;}
.t26 .match-row{display:flex;align-items:center;gap:6px;font-size:8px;color:#4A4A4A;}
.t26 .chk{width:14px;height:14px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;flex-shrink:0;}
.t26 .chk-good{background:#F0FDF4;color:#16A34A;}
.t26 .chk-bad{background:#FEF2F2;color:#DC2626;}
.t26 .cta-btn{margin-top:auto;background:#6366F1;color:#fff;border-radius:5px;padding:8px;font-size:8px;font-weight:700;text-align:center;}
.t26 .url{font-family:${IG_MONO};font-size:5px;color:#C8C4BC;text-align:center;margin-top:auto;padding-top:12px;}
`;

function buildT26(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [
    { text: "Python", highlighted: true },
    { text: "SQL", highlighted: true },
    { text: "AWS", highlighted: false },
  ];
  return wrapIG("t26", T26_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "HOW IT WORKS")}</div>
    <div class="feat-name">${esc(c.headline)}</div>
    <div class="feat-desc">${esc(c.subheadline || "")}</div>
    <div class="ui-card">
      <div class="tab-bar">
        <div class="tab active">Resume Analysis</div>
        <div class="tab">Cover Letter</div>
        <div class="tab">Interview</div>
      </div>
      <div class="card-body">
        <div class="score-row">
          <div class="ring">${esc(c.stat?.value || "92%")}</div>
          <div class="score-text"><strong>${esc(c.stat?.label || "ATS Match Score")}</strong>Based on 47 criteria</div>
        </div>
        ${items.map(item => `<div class="match-row">
          <div class="chk ${item.highlighted ? "chk-good" : "chk-bad"}">${item.highlighted ? "✓" : "✕"}</div>
          ${esc(item.text)}
        </div>`).join("")}
        <div class="cta-btn">Optimize Resume →</div>
      </div>
    </div>
    <div class="url">jobpilotai.co</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T27 — REEL COVER (Dark + accent glow, 9:16 reel)
   ============================================================ */
const T27_CSS = `
.t27{background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;position:relative;}
.t27::before{content:'';position:absolute;bottom:20%;left:30%;width:200px;height:200px;border-radius:50%;background:#6366F1;filter:blur(80px);opacity:0.08;}
.t27 .ep-tag{font-family:${IG_SANS};font-size:6px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:28px;position:relative;z-index:1;}
.t27 .hero{font-family:${IG_SANS};font-size:38px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.03em;margin-bottom:12px;max-width:380px;position:relative;z-index:1;}
.t27 .hero .accent{color:#A78BFA;}
.t27 .sub{font-family:${IG_SANS};font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:32px;position:relative;z-index:1;}
.t27 .play{width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;position:relative;z-index:1;}
.t27 .play::after{content:'';width:0;height:0;border-style:solid;border-width:5px 0 5px 8px;border-color:transparent transparent transparent rgba(255,255,255,0.6);margin-left:2px;}
`;

function buildT27(c: TemplateContent, w: number, h: number): string {
  const headline = esc(c.headline);
  const accent = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = accent ? headline.replace(accent, `<span class="accent">${accent}</span>`) : headline;

  return wrapIG("t27", T27_CSS, `
    <div class="ep-tag">${esc(c.eyebrow || "EPISODE 01")}</div>
    <div class="hero">${styled}</div>
    ${c.subheadline ? `<div class="sub">${esc(c.subheadline)}</div>` : ""}
    <div class="play"></div>
    ${storyBadge()}
  `, 432, 768, w, h);
}

/* ============================================================
   T34 — GRAIN EDITORIAL (Warm dark + grain, 4:5 feed)
   ============================================================ */
const T34_CSS = `
.t34{background:#1C1914;display:flex;flex-direction:column;padding:44px 40px 32px;position:relative;}
.t34::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0.28;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px;}
.t34 .cat{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(196,164,112,0.5);position:relative;z-index:3;}
.t34 .big-num{font-family:${IG_SERIF};font-size:26px;color:rgba(255,255,255,0.03);position:absolute;top:36px;right:36px;font-weight:300;z-index:3;}
.t34 .headline{font-family:${IG_SERIF};font-size:10px;font-weight:400;color:#F0E6D3;line-height:1.4;margin-top:auto;margin-bottom:8px;max-width:380px;position:relative;z-index:3;}
.t34 .gold-rule{width:32px;height:1px;background:#C4A470;margin-bottom:8px;position:relative;z-index:3;}
.t34 .body{font-family:${IG_SANS};font-size:5px;color:rgba(240,230,211,0.45);line-height:1.6;max-width:360px;position:relative;z-index:3;}
.t34 .foot{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.25);letter-spacing:0.12em;text-transform:uppercase;margin-top:auto;padding-top:16px;position:relative;z-index:3;}
`;

function buildT34(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t34", T34_CSS, `
    <div class="cat">${esc(c.eyebrow || "CAREER STRATEGY")}</div>
    <div class="big-num">${esc(c.stat?.value || "01")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="gold-rule"></div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    <div class="foot">JOBPILOT AI</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T35 — FLOATING CARDS (Pastel gradient, 4:5 feed)
   ============================================================ */
const T35_CSS = `
.t35{background:linear-gradient(160deg,#EDE9FE,#DBEAFE,#E0F2FE);display:flex;flex-direction:column;padding:44px 40px 32px;}
.t35 .cat{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.6);margin-bottom:6px;}
.t35 .heading{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#1E1B4B;margin-bottom:20px;}
.t35 .cards{display:flex;flex-direction:column;gap:10px;flex:1;}
.t35 .card{background:rgba(255,255,255,0.85);border-radius:10px;padding:14px 16px;display:flex;gap:10px;align-items:flex-start;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,0.04);}
.t35 .icon-sq{width:14px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0;}
.t35 .card-title{font-family:${IG_SANS};font-size:5px;font-weight:700;color:#1E1B4B;margin-bottom:2px;}
.t35 .card-desc{font-family:${IG_SANS};font-size:4px;color:#6B6B6B;line-height:1.45;}
`;

function buildT35(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  const iconColors = ["#6366F1", "#22C55E", "#F59E0B"];
  return wrapIG("t35", T35_CSS, `
    <div class="cat">${esc(c.eyebrow || "FEATURES")}</div>
    <div class="heading">${esc(c.headline)}</div>
    <div class="cards">
      ${tips.map((t, i) => `<div class="card">
        <div class="icon-sq" style="background:${iconColors[i % 3]}20;color:${iconColors[i % 3]}">✦</div>
        <div>
          <div class="card-title">${esc(t.title)}</div>
          <div class="card-desc">${esc(t.description)}</div>
        </div>
      </div>`).join("")}
    </div>
    ${brandFooter("rgba(30,27,75,0.2)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T36 — RING CHART (Dark, 1:1 grid)
   ============================================================ */
const T36_CSS = `
.t36{background:#08090E;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t36 .eyebrow{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.5);margin-bottom:6px;}
.t36 .title{font-family:${IG_SANS};font-size:8px;font-weight:800;color:#fff;margin-bottom:20px;}
.t36 .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;}
.t36 .metric{background:#111118;border:1px solid #1E1F2E;border-radius:10px;padding:14px;display:flex;flex-direction:column;align-items:center;text-align:center;}
.t36 .ring{width:44px;height:44px;margin-bottom:8px;}
.t36 .m-val{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;}
.t36 .m-label{font-family:${IG_SANS};font-size:3px;color:rgba(255,255,255,0.4);margin-top:4px;}
.t36 .foot{display:flex;justify-content:space-between;margin-top:auto;padding-top:12px;}
.t36 .foot-brand{font-family:${IG_SANS};font-size:3px;color:rgba(255,255,255,0.15);letter-spacing:0.1em;text-transform:uppercase;}
.t36 .foot-src{font-family:${IG_MONO};font-size:3px;color:rgba(255,255,255,0.1);}
`;

function buildT36(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapIG("t36", T36_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DATA")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="grid">
      ${bars.map(b => {
        const pct = Math.min(b.value, 100);
        const dash = (pct / 100) * 126;
        return `<div class="metric">
          <svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="#1A1B28" stroke-width="3"/><circle cx="22" cy="22" r="20" fill="none" stroke="#6366F1" stroke-width="3" stroke-dasharray="${dash} 126" stroke-linecap="round" transform="rotate(-90 22 22)"/></svg>
          <div class="m-val">${esc(String(b.value))}%</div>
          <div class="m-label">${esc(b.label)}</div>
        </div>`;
      }).join("")}
    </div>
    <div class="foot"><span class="foot-brand">JOBPILOT AI</span><span class="foot-src">${esc(c.subheadline || "")}</span></div>
  `, 540, 540, w, h);
}

/* ============================================================
   T37 — MINIMAL BOLD (Off-white, 1:1 grid)
   ============================================================ */
const T37_CSS = `
.t37{background:#FAFAF8;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 50px;text-align:center;}
.t37 .word{font-family:${IG_SANS};font-size:22px;font-weight:900;color:#000;text-transform:uppercase;letter-spacing:-0.05em;line-height:1.1;}
.t37 .dot{width:4px;height:4px;border-radius:50%;background:#6366F1;margin:14px 0;}
.t37 .sub{font-family:${IG_SANS};font-size:5px;color:#6B6B6B;max-width:300px;line-height:1.5;}
.t37 .foot{position:absolute;bottom:14px;left:0;right:0;text-align:center;font-family:${IG_SANS};font-size:3px;color:#CCC;letter-spacing:0.1em;text-transform:uppercase;}
`;

function buildT37(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t37", T37_CSS, `
    <div class="word">${esc(c.headline)}</div>
    <div class="dot"></div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    <div class="foot">JOBPILOT AI</div>
  `, 540, 540, w, h);
}

/* ============================================================
   T38 — COLOR BLOCK (2x2 grid, 1:1)
   ============================================================ */
const T38_CSS = `
.t38{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;width:540px;height:540px;}
.t38 .blk-hero{grid-row:1/3;background:#1E1B4B;padding:32px 24px;display:flex;flex-direction:column;justify-content:center;}
.t38 .blk-hero .h{font-family:${IG_SANS};font-size:9px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:6px;}
.t38 .blk-hero .sub{font-family:${IG_SANS};font-size:4px;color:rgba(255,255,255,0.4);line-height:1.5;}
.t38 .blk-stat{background:#EDE9FE;padding:24px 20px;display:flex;flex-direction:column;justify-content:center;}
.t38 .blk-stat .num{font-family:${IG_SANS};font-size:14px;font-weight:800;color:#6366F1;}
.t38 .blk-stat .label{font-family:${IG_SANS};font-size:4px;color:#6B6B6B;margin-top:4px;}
.t38 .blk-body{background:#F4F2ED;padding:24px 20px;display:flex;flex-direction:column;justify-content:center;}
.t38 .blk-body .text{font-family:${IG_SANS};font-size:4px;color:#4A4A4A;line-height:1.5;}
.t38 .blk-body .tag{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A09890;margin-top:8px;padding:3px 8px;border:1px solid #D4CFC6;border-radius:10px;align-self:flex-start;}
`;

function buildT38(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t38", T38_CSS, `
    <div class="blk-hero">
      <div class="h">${esc(c.headline)}</div>
      <div class="sub">${esc(c.subheadline || "")}</div>
    </div>
    <div class="blk-stat">
      <div class="num">${esc(c.stat?.value || "92%")}</div>
      <div class="label">${esc(c.stat?.label || "")}</div>
    </div>
    <div class="blk-body">
      <div class="text">${esc(c.body || "")}</div>
      ${c.cta ? `<div class="tag">${esc(c.cta)}</div>` : ""}
    </div>
  `, 540, 540, w, h);
}

/* ============================================================
   T39 — TEXTURED DARK (Dark + grain + gold, 1:1 grid)
   ============================================================ */
const T39_CSS = `
.t39{background:#0C0B10;display:flex;flex-direction:column;padding:44px 40px 32px;position:relative;}
.t39::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0.28;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px;}
.t39 .gold-bar{width:20px;height:2px;background:linear-gradient(90deg,#C4A470,transparent);margin-bottom:16px;position:relative;z-index:3;}
.t39 .headline{font-family:${IG_SERIF};font-size:10px;font-weight:400;color:#E8DFD0;line-height:1.4;margin-bottom:auto;position:relative;z-index:3;}
.t39 .body{font-family:${IG_SANS};font-size:5px;color:rgba(232,223,208,0.35);line-height:1.6;margin-bottom:12px;position:relative;z-index:3;}
.t39 .stats{display:flex;gap:20px;margin-bottom:12px;position:relative;z-index:3;}
.t39 .st-num{font-family:${IG_SANS};font-size:8px;font-weight:800;color:#C4A470;font-variant-numeric:tabular-nums;}
.t39 .st-label{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.35);margin-top:2px;}
.t39 .gold-line{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(196,164,112,0.2),transparent);margin-bottom:8px;position:relative;z-index:3;}
.t39 .foot{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.2);letter-spacing:0.12em;text-transform:uppercase;text-align:center;position:relative;z-index:3;}
`;

function buildT39(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapIG("t39", T39_CSS, `
    <div class="gold-bar"></div>
    <div class="headline">${esc(c.headline)}</div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    <div class="stats">
      ${bars.map(b => `<div><div class="st-num">${esc(String(b.value))}</div><div class="st-label">${esc(b.label)}</div></div>`).join("")}
    </div>
    <div class="gold-line"></div>
    <div class="foot">JOBPILOT AI</div>
  `, 540, 540, w, h);
}

/* ============================================================
   T45 — CLEAN COMPARISON (White, 4:5 feed)
   ============================================================ */
const T45_CSS = `
.t45{background:#FFFFFF;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t45 .eyebrow{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:10px;}
.t45 .title{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#1A1A1A;margin-bottom:16px;}
.t45 table{width:100%;border-collapse:collapse;flex:1;}
.t45 th{font-family:${IG_SANS};font-size:4px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:8px 6px;text-align:center;border-bottom:2px solid #1A1A1A;}
.t45 th:first-child{text-align:left;}
.t45 th.col-bad{color:#DC2626;}
.t45 th.col-good{color:#6366F1;}
.t45 td{font-family:${IG_SANS};font-size:4px;padding:7px 6px;border-bottom:1px solid #F0EEEB;text-align:center;}
.t45 td:first-child{text-align:left;color:#4A4A4A;font-weight:500;}
.t45 .ck{font-size:6px;font-weight:700;}
.t45 .ck-y{color:#22C55E;}
.t45 .ck-n{color:#DC2626;}
.t45 .ck-p{color:#F59E0B;}
`;

function buildT45(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapIG("t45", T45_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "COMPARISON")}</div>
    <div class="title">${esc(c.headline)}</div>
    <table>
      <tr><th>Feature</th><th class="col-bad">Generic</th><th class="col-good">AI-Powered</th></tr>
      ${items.map(item => {
        const vals = (item.value || "n,y").split(",");
        const marks = vals.map(v => v.trim() === "y" ? '<span class="ck ck-y">✓</span>' : v.trim() === "p" ? '<span class="ck ck-p">~</span>' : '<span class="ck ck-n">✕</span>');
        return `<tr><td>${esc(item.text)}</td><td>${marks[0] || ""}</td><td>${marks[1] || ""}</td></tr>`;
      }).join("")}
    </table>
    ${brandFooter("rgba(0,0,0,0.15)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T46 — STEP GUIDE (Cream, 4:5 feed)
   ============================================================ */
const T46_CSS = `
.t46{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t46 .eyebrow{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:10px;}
.t46 .title{font-family:${IG_SANS};font-size:6px;font-weight:800;color:#1A1A1A;margin-bottom:24px;}
.t46 .steps{display:flex;flex-direction:column;gap:0;flex:1;}
.t46 .step{display:flex;gap:12px;position:relative;padding-bottom:16px;}
.t46 .step::before{content:'';position:absolute;left:5px;top:12px;bottom:0;width:1px;background:#E2E0DB;}
.t46 .step:last-child::before{display:none;}
.t46 .step-sq{width:11px;height:11px;border-radius:3px;background:#6366F1;display:flex;align-items:center;justify-content:center;font-size:5px;font-weight:700;color:#fff;flex-shrink:0;z-index:1;}
.t46 .step-title{font-family:${IG_SANS};font-size:5px;font-weight:700;color:#1A1A1A;margin-bottom:2px;}
.t46 .step-desc{font-family:${IG_SANS};font-size:4px;color:#8A8A8A;line-height:1.45;}
`;

function buildT46(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapIG("t46", T46_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "STEP-BY-STEP")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="steps">
      ${steps.map(s => `<div class="step">
        <div class="step-sq">${esc(s.label)}</div>
        <div>
          <div class="step-title">${esc(s.title)}</div>
          ${s.description ? `<div class="step-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${brandFooter("rgba(0,0,0,0.15)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T47 — TESTIMONIAL (Warm gradient, 1:1 grid)
   ============================================================ */
const T47_CSS = `
.t47{background:linear-gradient(170deg,#FAF8F5,#F0EDE6);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 44px;text-align:center;}
.t47 .stars{display:flex;gap:3px;margin-bottom:16px;}
.t47 .star{font-size:9px;color:#F59E0B;}
.t47 .quote{font-family:${IG_SERIF};font-size:7px;font-style:italic;color:#1A1A1A;line-height:1.55;max-width:380px;margin-bottom:16px;}
.t47 .thin-rule{width:24px;height:1px;background:#D4D0C8;margin-bottom:12px;}
.t47 .attr-row{display:flex;align-items:center;gap:10px;}
.t47 .avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;}
.t47 .attr-text{text-align:left;}
.t47 .attr-name{font-family:${IG_SANS};font-size:5px;font-weight:700;color:#1A1A1A;}
.t47 .attr-role{font-family:${IG_SANS};font-size:4px;color:#8A8A8A;}
`;

function buildT47(c: TemplateContent, w: number, h: number): string {
  const initials = (c.subheadline || "JD").substring(0, 2).toUpperCase();
  return wrapIG("t47", T47_CSS, `
    <div class="stars">${"★★★★★".split("").map(() => '<div class="star">★</div>').join("")}</div>
    <div class="quote">${esc(c.headline)}</div>
    <div class="thin-rule"></div>
    <div class="attr-row">
      <div class="avatar">${esc(initials)}</div>
      <div class="attr-text">
        <div class="attr-name">${esc(c.subheadline || "")}</div>
        <div class="attr-role">${esc(c.body || "")}</div>
      </div>
    </div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T48 — MAGAZINE COVER (Brand indigo, 4:5 feed)
   ============================================================ */
const T48_CSS = `
.t48{background:#1E1B4B;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t48 .issue{font-family:${IG_SANS};font-size:3px;color:rgba(255,255,255,0.2);letter-spacing:0.1em;text-transform:uppercase;position:absolute;top:24px;left:36px;}
.t48 .logo{font-family:${IG_SANS};font-size:4px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase;position:absolute;top:24px;right:36px;}
.t48 .cat{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(196,181,253,0.6);margin-top:auto;margin-bottom:8px;}
.t48 .headline{font-family:${IG_SERIF};font-size:10px;font-weight:400;color:#fff;line-height:1.35;margin-bottom:8px;}
.t48 .deck{font-family:${IG_SANS};font-size:5px;color:rgba(255,255,255,0.4);line-height:1.5;margin-bottom:16px;}
.t48 .violet-rule{width:100%;height:1.5px;background:linear-gradient(90deg,#A78BFA,#6366F1,transparent);margin-bottom:10px;}
.t48 .meta{font-family:${IG_SANS};font-size:4px;color:rgba(255,255,255,0.2);display:flex;gap:12px;}
`;

function buildT48(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t48", T48_CSS, `
    <div class="issue">${esc(c.stat?.label || "ISSUE 01")}</div>
    <div class="logo">JOBPILOT AI</div>
    <div class="cat">${esc(c.eyebrow || "CAREER STRATEGY")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="deck">${esc(c.body || "")}</div>
    <div class="violet-rule"></div>
    <div class="meta">
      <span>${esc(c.stat?.value || "4 min read")}</span>
      <span>${esc(c.subheadline || "")}</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T53 — CAROUSEL SLIDE (White, 4:5 feed)
   ============================================================ */
const T53_CSS = `
.t53{background:#FFFFFF;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t53 .counter{font-family:${IG_SANS};font-size:4px;font-weight:600;color:#6366F1;font-variant-numeric:tabular-nums;margin-bottom:16px;}
.t53 .title{font-family:${IG_SANS};font-size:10px;font-weight:800;color:#1A1A1A;margin-bottom:8px;letter-spacing:-0.02em;}
.t53 .accent-rule{width:28px;height:2px;background:#6366F1;border-radius:1px;margin-bottom:16px;}
.t53 .body{font-family:${IG_SANS};font-size:6px;color:#4A4A4A;line-height:1.6;flex:1;}
.t53 .body strong{color:#1A1A1A;font-weight:700;}
.t53 .dots{display:flex;gap:3px;align-items:center;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);}
.t53 .dot{width:3px;height:3px;border-radius:50%;background:#D4D0C8;}
.t53 .dot.active{width:7px;background:#6366F1;border-radius:3px;}
.t53 .swipe{font-family:${IG_SANS};font-size:3px;color:#B0ACA0;position:absolute;bottom:24px;right:36px;}
`;

function buildT53(c: TemplateContent, w: number, h: number): string {
  const body = esc(c.body || "");
  const bold = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapIG("t53", T53_CSS, `
    <div class="counter">${esc(c.stat?.value || "03 / 07")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="accent-rule"></div>
    <div class="body">${bold}</div>
    <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot active"></div><div class="dot"></div><div class="dot"></div></div>
    <div class="swipe">Swipe →</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T54 — CHECKLIST (Cream, 4:5 feed)
   ============================================================ */
const T54_CSS = `
.t54{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t54 .eyebrow{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:10px;}
.t54 .title{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#1A1A1A;margin-bottom:20px;}
.t54 .items{display:flex;flex-direction:column;gap:6px;flex:1;}
.t54 .item{display:flex;align-items:center;gap:8px;font-family:${IG_SANS};font-size:5px;}
.t54 .check{width:8px;height:8px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:5px;font-weight:700;flex-shrink:0;}
.t54 .check-done{background:#6366F1;color:#fff;}
.t54 .check-todo{border:1.5px solid #D4D0C8;}
.t54 .item-done{color:#8A8A8A;text-decoration:line-through;}
.t54 .item-todo{color:#1A1A1A;font-weight:500;}
.t54 .progress{margin-top:auto;padding-top:12px;}
.t54 .p-row{display:flex;align-items:center;gap:8px;}
.t54 .p-track{flex:1;height:3px;background:#E2E0DB;border-radius:2px;overflow:hidden;}
.t54 .p-fill{height:100%;background:#6366F1;border-radius:2px;}
.t54 .p-pct{font-family:${IG_SANS};font-size:4px;font-weight:600;color:#6366F1;}
`;

function buildT54(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  const done = items.filter(i => i.highlighted).length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  return wrapIG("t54", T54_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "CHECKLIST")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="items">
      ${items.map(item => `<div class="item">
        <div class="check ${item.highlighted ? "check-done" : "check-todo"}">${item.highlighted ? "✓" : ""}</div>
        <span class="${item.highlighted ? "item-done" : "item-todo"}">${esc(item.text)}</span>
      </div>`).join("")}
    </div>
    <div class="progress"><div class="p-row"><div class="p-track"><div class="p-fill" style="width:${pct}%"></div></div><div class="p-pct">${pct}%</div></div></div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T55 — PULL QUOTE (Warm dark, drop cap, 1:1 grid)
   ============================================================ */
const T55_CSS = `
.t55{background:#1C1914;display:flex;flex-direction:column;padding:44px 40px 32px;position:relative;}
.t55 .cat{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(196,164,112,0.4);margin-bottom:auto;position:relative;z-index:1;}
.t55 .quote-area{display:flex;gap:4px;position:relative;z-index:1;margin-bottom:auto;}
.t55 .drop{font-family:${IG_SERIF};font-size:29px;font-weight:400;color:rgba(196,164,112,0.3);line-height:0.85;float:left;margin-right:4px;margin-top:4px;}
.t55 .q-text{font-family:${IG_SERIF};font-size:7px;font-weight:400;color:#E8DFD0;line-height:1.55;}
.t55 .gold-rule{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(196,164,112,0.2),transparent);margin-bottom:8px;position:relative;z-index:1;}
.t55 .attr{font-family:${IG_SANS};font-size:4px;color:rgba(196,164,112,0.35);position:relative;z-index:1;}
.t55 .foot{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.2);letter-spacing:0.12em;text-transform:uppercase;text-align:center;margin-top:auto;position:relative;z-index:1;}
`;

function buildT55(c: TemplateContent, w: number, h: number): string {
  const firstLetter = (c.headline || "T")[0];
  const rest = (c.headline || "").substring(1);
  return wrapIG("t55", T55_CSS, `
    <div class="cat">${esc(c.eyebrow || "")}</div>
    <div class="quote-area">
      <div class="drop">${esc(firstLetter)}</div>
      <div class="q-text">${esc(rest)}</div>
    </div>
    <div class="gold-rule"></div>
    <div class="attr">${esc(c.subheadline || "")}</div>
    <div class="foot">JOBPILOT AI</div>
  `, 540, 540, w, h);
}

/* ============================================================
   T56 — PROFILE CARD (Pastel gradient, 1:1 grid)
   ============================================================ */
const T56_CSS = `
.t56{background:linear-gradient(170deg,#EDE9FE,#DBEAFE,#F0FDFA);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 44px;text-align:center;}
.t56 .avatar-sq{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:10px;margin-bottom:10px;}
.t56 .name{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#1E1B4B;margin-bottom:3px;}
.t56 .tagline{font-family:${IG_SANS};font-size:4px;color:#6B6B6B;margin-bottom:14px;}
.t56 .stats-card{background:rgba(255,255,255,0.7);border-radius:8px;padding:12px 16px;display:flex;gap:16px;backdrop-filter:blur(8px);margin-bottom:14px;}
.t56 .st{text-align:center;}
.t56 .st-num{font-family:${IG_SANS};font-size:8px;font-weight:800;color:#1E1B4B;}
.t56 .st-label{font-family:${IG_SANS};font-size:3px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#8A8A8A;margin-top:2px;}
.t56 .desc{font-family:${IG_SANS};font-size:4px;color:#6B6B6B;max-width:340px;line-height:1.5;margin-bottom:14px;}
.t56 .cta-btn{background:#6366F1;color:#fff;border-radius:4px;padding:6px 20px;font-family:${IG_SANS};font-size:4px;font-weight:700;box-shadow:0 2px 6px rgba(99,102,241,0.3);}
`;

function buildT56(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapIG("t56", T56_CSS, `
    <div class="avatar-sq">👤</div>
    <div class="name">${esc(c.headline)}</div>
    <div class="tagline">${esc(c.subheadline || "")}</div>
    <div class="stats-card">
      ${bars.map(b => `<div class="st"><div class="st-num">${esc(String(b.value))}</div><div class="st-label">${esc(b.label)}</div></div>`).join("")}
    </div>
    ${c.body ? `<div class="desc">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta-btn">${esc(c.cta)}</div>` : ""}
  `, 540, 540, w, h);
}

/* ============================================================
   T57 — SPLIT STAT (Dark, 1:1 grid)
   ============================================================ */
const T57_CSS = `
.t57{background:#08090E;display:grid;grid-template-columns:1fr 1fr;width:540px;height:540px;}
.t57 .left{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;border-right:1px solid #1A1B28;}
.t57 .big-num{font-family:${IG_SANS};font-size:35px;font-weight:900;background:linear-gradient(180deg,#fff 40%,rgba(255,255,255,0.3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
.t57 .unit{font-family:${IG_SANS};font-size:6px;color:#6366F1;margin-top:4px;}
.t57 .right{display:flex;flex-direction:column;justify-content:center;padding:24px;}
.t57 .eyebrow{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.4);margin-bottom:8px;}
.t57 .title{font-family:${IG_SANS};font-size:8px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1.3;}
.t57 .desc{font-family:${IG_SANS};font-size:5px;color:rgba(255,255,255,0.3);line-height:1.5;}
.t57 .foot{position:absolute;bottom:14px;left:0;right:0;text-align:center;font-family:${IG_SANS};font-size:3px;color:rgba(255,255,255,0.12);letter-spacing:0.1em;text-transform:uppercase;}
`;

function buildT57(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t57", T57_CSS, `
    <div class="left">
      <div class="big-num">${esc(c.stat?.value || "92%")}</div>
      <div class="unit">${esc(c.stat?.label || "")}</div>
    </div>
    <div class="right">
      <div class="eyebrow">${esc(c.eyebrow || "")}</div>
      <div class="title">${esc(c.headline)}</div>
      <div class="desc">${esc(c.body || "")}</div>
    </div>
    <div class="foot">JOBPILOT AI</div>
  `, 540, 540, w, h);
}

/* ============================================================
   T58 — MYTH VS FACT (White, 4:5 feed)
   ============================================================ */
const T58_CSS = `
.t58{background:#FFFFFF;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t58 .eyebrow{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:10px;}
.t58 .title{font-family:${IG_SANS};font-size:9px;font-weight:800;color:#1A1A1A;margin-bottom:20px;}
.t58 .pair{display:flex;flex-direction:column;gap:1px;margin-bottom:14px;}
.t58 .myth{background:#FEF2F2;border-radius:6px 6px 1px 1px;padding:12px 14px;display:flex;gap:8px;align-items:flex-start;}
.t58 .fact{background:#F0FDF4;border-radius:1px 1px 6px 6px;padding:12px 14px;display:flex;gap:8px;align-items:flex-start;}
.t58 .tag{font-family:${IG_SANS};font-size:4px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 6px;border-radius:3px;flex-shrink:0;}
.t58 .tag-myth{background:#DC2626;color:#fff;}
.t58 .tag-fact{background:#16A34A;color:#fff;}
.t58 .pair-text{font-family:${IG_SANS};font-size:5px;color:#4A4A4A;line-height:1.45;}
`;

function buildT58(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  return wrapIG("t58", T58_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "MYTH VS FACT")}</div>
    <div class="title">${esc(c.headline)}</div>
    ${tips.map(t => `<div class="pair">
      <div class="myth"><div class="tag tag-myth">MYTH</div><div class="pair-text">${esc(t.title)}</div></div>
      <div class="fact"><div class="tag tag-fact">FACT</div><div class="pair-text">${esc(t.description)}</div></div>
    </div>`).join("")}
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T59 — EDITORIAL SERIES (Warm dark + grain, 4:5 feed)
   ============================================================ */
const T59_CSS = `
.t59{background:#1C1914;display:flex;flex-direction:column;padding:44px 40px 32px;position:relative;}
.t59::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0.28;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px;}
.t59 .top-row{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:3;margin-bottom:auto;}
.t59 .series{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(196,164,112,0.5);}
.t59 .big-num{font-family:${IG_SERIF};font-size:29px;color:rgba(196,164,112,0.12);font-weight:300;line-height:1;}
.t59 .cat{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(196,164,112,0.5);margin-bottom:8px;position:relative;z-index:3;}
.t59 .headline{font-family:${IG_SERIF};font-size:12px;font-weight:400;color:#E8DFD0;line-height:1.35;margin-bottom:8px;position:relative;z-index:3;}
.t59 .gold-rule{width:36px;height:1px;background:#C4A470;margin-bottom:8px;position:relative;z-index:3;}
.t59 .desc{font-family:${IG_SANS};font-size:6px;color:rgba(232,223,208,0.45);line-height:1.5;position:relative;z-index:3;}
.t59 .foot{display:flex;justify-content:space-between;margin-top:auto;padding-top:16px;position:relative;z-index:3;}
.t59 .foot-brand{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.2);letter-spacing:0.1em;text-transform:uppercase;}
.t59 .foot-read{font-family:${IG_SANS};font-size:3px;color:rgba(196,164,112,0.2);}
`;

function buildT59(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t59", T59_CSS, `
    <div class="top-row">
      <div class="series">${esc(c.eyebrow || "DEEP DIVE")}</div>
      <div class="big-num">${esc(c.stat?.value || "01")}</div>
    </div>
    <div class="cat">${esc(c.tags?.[0] || "CAREER STRATEGY")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="gold-rule"></div>
    ${c.body ? `<div class="desc">${esc(c.body)}</div>` : ""}
    <div class="foot"><span class="foot-brand">JOBPILOT AI</span><span class="foot-read">${esc(c.stat?.label || "4 min read")}</span></div>
  `, 540, 675, w, h);
}

/* ============================================================
   T60 — PILL TAGS (Dark, skill match pills, 1:1 grid)
   ============================================================ */
const T60_CSS = `
.t60{background:#08090E;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t60 .eyebrow{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.4);margin-bottom:8px;}
.t60 .title{font-family:${IG_SANS};font-size:9px;font-weight:800;color:#fff;margin-bottom:20px;}
.t60 .pills{display:flex;flex-wrap:wrap;gap:6px;flex:1;align-content:flex-start;}
.t60 .pill{padding:5px 10px;border-radius:12px;font-family:${IG_SANS};font-size:6px;font-weight:600;}
.t60 .pill-match{background:rgba(99,102,241,0.12);color:#6366F1;border:1px solid rgba(99,102,241,0.15);}
.t60 .pill-miss{background:transparent;color:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.08);}
.t60 .legend{display:flex;gap:12px;margin-top:auto;padding-top:12px;}
.t60 .leg-item{display:flex;align-items:center;gap:4px;font-family:${IG_SANS};font-size:4px;color:rgba(255,255,255,0.3);}
.t60 .leg-dot{width:4px;height:4px;border-radius:50%;}
.t60 .leg-dot-m{background:#6366F1;}
.t60 .leg-dot-x{background:rgba(255,255,255,0.3);}
`;

function buildT60(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapIG("t60", T60_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "SKILL MATCH")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="pills">
      ${items.map(item => `<div class="pill ${item.highlighted ? "pill-match" : "pill-miss"}">${esc(item.text)}</div>`).join("")}
    </div>
    <div class="legend">
      <div class="leg-item"><div class="leg-dot leg-dot-m"></div>Matched</div>
      <div class="leg-item"><div class="leg-dot leg-dot-x"></div>Missing</div>
    </div>
    ${brandFooter("rgba(255,255,255,0.08)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T61 — SCORE CARD (Pastel gradient, SVG donut, 1:1 grid)
   ============================================================ */
const T61_CSS = `
.t61{background:linear-gradient(170deg,#EDE9FE,#F5F3FF,#DBEAFE);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 44px;text-align:center;}
.t61 .label{font-family:${IG_SANS};font-size:5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(99,102,241,0.5);margin-bottom:14px;}
.t61 .ring-wrap{position:relative;width:64px;height:64px;margin-bottom:14px;}
.t61 .ring-wrap svg{width:64px;height:64px;}
.t61 .ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.t61 .ring-num{font-family:${IG_SANS};font-size:19px;font-weight:900;color:#1E1B4B;}
.t61 .ring-unit{font-family:${IG_SANS};font-size:6px;color:#6366F1;}
.t61 .title{font-family:${IG_SANS};font-size:7px;font-weight:700;color:#1E1B4B;margin-bottom:4px;}
.t61 .desc{font-family:${IG_SANS};font-size:5px;color:#6B6B6B;max-width:340px;line-height:1.5;}
`;

function buildT61(c: TemplateContent, w: number, h: number): string {
  const pct = c.score || parseInt(c.stat?.value || "85") || 85;
  const dash = (pct / 100) * 176;
  return wrapIG("t61", T61_CSS, `
    <div class="label">${esc(c.eyebrow || "YOUR SCORE")}</div>
    <div class="ring-wrap">
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#E2E0DB" stroke-width="4"/><circle cx="32" cy="32" r="28" fill="none" stroke="#6366F1" stroke-width="4" stroke-dasharray="${dash} 176" stroke-linecap="round" transform="rotate(-90 32 32)"/></svg>
      <div class="ring-center"><div class="ring-num">${pct}</div><div class="ring-unit">${esc(c.stat?.label || "%")}</div></div>
    </div>
    <div class="title">${esc(c.headline)}</div>
    ${c.body ? `<div class="desc">${esc(c.body)}</div>` : ""}
    ${brandFooter("rgba(30,27,75,0.15)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T62 — DATA TABLE (Off-white, 1:1 grid)
   ============================================================ */
const T62_CSS = `
.t62{background:#FAFAF8;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t62 .eyebrow{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:16px;}
.t62 .rows{display:flex;flex-direction:column;flex:1;}
.t62 .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #ECEAE6;}
.t62 .row:first-child{border-bottom:2px solid #1A1A1A;padding-bottom:10px;margin-bottom:2px;}
.t62 .key{font-family:${IG_SANS};font-size:6px;color:#666;}
.t62 .val{font-family:${IG_SANS};font-size:7px;font-weight:800;text-align:right;font-variant-numeric:tabular-nums;}
.t62 .val-accent{color:#6366F1;}
.t62 .val-good{color:#22C55E;}
.t62 .val-default{color:#1A1A1A;}
`;

function buildT62(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapIG("t62", T62_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DATA")}</div>
    <div class="rows">
      ${bars.map((b, i) => {
        const cls = i === 0 ? "val-accent" : b.color === "green" ? "val-good" : "val-default";
        return `<div class="row"><span class="key">${esc(b.label)}</span><span class="val ${cls}">${esc(String(b.value))}</span></div>`;
      }).join("")}
    </div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T63 — GRADIENT QUOTE (Pink-pastel gradient, 1:1 grid)
   ============================================================ */
const T63_CSS = `
.t63{background:linear-gradient(160deg,#FDF2F8,#EDE9FE,#DBEAFE);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 48px;text-align:center;}
.t63 .big-q{font-family:${IG_SERIF};font-size:26px;color:rgba(99,102,241,0.15);margin-bottom:8px;line-height:0.6;}
.t63 .quote{font-family:${IG_SANS};font-size:9px;font-weight:600;color:#1E1B4B;line-height:1.45;max-width:380px;margin-bottom:12px;}
.t63 .accent-rule{width:28px;height:2px;background:#6366F1;border-radius:1px;margin-bottom:10px;}
.t63 .attr{font-family:${IG_SANS};font-size:6px;color:#6366F1;font-weight:600;}
.t63 .role{font-family:${IG_SANS};font-size:5px;color:#8A8A8A;margin-top:2px;}
`;

function buildT63(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t63", T63_CSS, `
    <div class="big-q">"</div>
    <div class="quote">${esc(c.headline)}</div>
    <div class="accent-rule"></div>
    <div class="attr">${esc(c.subheadline || "")}</div>
    ${c.body ? `<div class="role">${esc(c.body)}</div>` : ""}
    ${brandFooter("rgba(30,27,75,0.12)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T64 — STAT BARS (Dark, gradient fill bars, 1:1 grid)
   ============================================================ */
const T64_CSS = `
.t64{background:#08090E;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t64 .eyebrow{font-family:${IG_SANS};font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.4);margin-bottom:8px;}
.t64 .title{font-family:${IG_SANS};font-size:9px;font-weight:800;color:#fff;margin-bottom:24px;}
.t64 .stats{display:flex;flex-direction:column;gap:18px;flex:1;}
.t64 .stat{display:flex;flex-direction:column;gap:4px;}
.t64 .stat-row{display:flex;justify-content:space-between;align-items:baseline;}
.t64 .stat-label{font-family:${IG_SANS};font-size:6px;color:rgba(255,255,255,0.5);}
.t64 .stat-val{font-family:${IG_SANS};font-size:7px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums;}
.t64 .bar-track{height:4px;background:#1A1B28;border-radius:2px;overflow:hidden;}
.t64 .bar-fill{height:100%;border-radius:2px;}
.t64 .fill-1{background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t64 .fill-2{background:linear-gradient(90deg,#22C55E,#4ADE80);}
.t64 .fill-3{background:linear-gradient(90deg,#F59E0B,#FBBF24);}
`;

function buildT64(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const fills = ["fill-1", "fill-2", "fill-3"];
  return wrapIG("t64", T64_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "METRICS")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="stats">
      ${bars.map((b, i) => `<div class="stat">
        <div class="stat-row"><span class="stat-label">${esc(b.label)}</span><span class="stat-val">${esc(String(b.value))}%</span></div>
        <div class="bar-track"><div class="bar-fill ${fills[i % 3]}" style="width:${Math.min(b.value, 100)}%"></div></div>
      </div>`).join("")}
    </div>
    ${brandFooter("rgba(255,255,255,0.08)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T89 — NEWSLETTER PREVIEW (Editorial text card, 4:5 feed)
   ============================================================ */
const T89_CSS = `
.t89{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;border:1px solid #E8E4DD;}
.t89 .masthead{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:2px solid #1A1A1A;margin-bottom:20px;}
.t89 .masthead-name{font-family:${IG_SERIF};font-size:16px;font-weight:400;color:#1A1A1A;}
.t89 .masthead-issue{font-family:${IG_SANS};font-size:7px;color:#8A8A8A;letter-spacing:0.08em;text-transform:uppercase;}
.t89 .cat{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#B8860B;margin-bottom:12px;}
.t89 .headline{font-family:${IG_SERIF};font-size:28px;font-weight:700;color:#1A1A1A;line-height:1.2;margin-bottom:12px;}
.t89 .deck{font-family:${IG_SERIF};font-size:12px;font-weight:300;color:#6B6B6B;line-height:1.45;margin-bottom:20px;font-style:italic;}
.t89 .excerpt{font-family:${IG_SANS};font-size:10px;color:#4A4A4A;line-height:1.65;flex:1;column-count:2;column-gap:20px;}
.t89 .read-more{font-family:${IG_SANS};font-size:9px;font-weight:600;color:#6366F1;margin-top:auto;padding-top:16px;}
`;

function buildT89(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t89", T89_CSS, `
    <div class="masthead">
      <div class="masthead-name">The JobPilot Weekly</div>
      <div class="masthead-issue">${esc(c.stat?.label || "Issue #12")}</div>
    </div>
    <div class="cat">${esc(c.eyebrow || "THIS WEEK")}</div>
    <div class="headline">${esc(c.headline)}</div>
    ${c.subheadline ? `<div class="deck">${esc(c.subheadline)}</div>` : ""}
    ${c.body ? `<div class="excerpt">${esc(c.body)}</div>` : ""}
    <div class="read-more">${esc(c.cta || "Read the full issue → Link in bio")}</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T90 — TRANSFORMATION STORY (Before/after timeline, 4:5 feed)
   ============================================================ */
const T90_CSS = `
.t90{background:linear-gradient(170deg,#FAF8F5,#F0EDE6);display:flex;flex-direction:column;padding:44px 40px 32px;}
.t90 .eyebrow{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#6366F1;margin-bottom:16px;}
.t90 .headline{font-family:${IG_SANS};font-size:24px;font-weight:800;color:#1A1A1A;margin-bottom:28px;letter-spacing:-0.02em;}
.t90 .journey{display:flex;flex-direction:column;gap:0;flex:1;position:relative;}
.t90 .journey::before{content:'';position:absolute;left:16px;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#EF4444,#F59E0B,#22C55E);}
.t90 .point{display:flex;gap:16px;padding-bottom:20px;position:relative;}
.t90 .dot{width:12px;height:12px;border-radius:50%;border:2px solid;flex-shrink:0;background:#FAF8F5;z-index:1;margin-top:2px;margin-left:11px;}
.t90 .dot-start{border-color:#EF4444;}
.t90 .dot-mid{border-color:#F59E0B;}
.t90 .dot-end{border-color:#22C55E;background:#22C55E;}
.t90 .point-time{font-family:${IG_SANS};font-size:7px;font-weight:600;color:#8A8A8A;margin-bottom:3px;}
.t90 .point-title{font-family:${IG_SANS};font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:3px;}
.t90 .point-desc{font-family:${IG_SANS};font-size:9px;color:#8A8A8A;line-height:1.45;}
`;

function buildT90(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  const dotCls = (i: number, total: number) => i === 0 ? "dot-start" : i === total - 1 ? "dot-end" : "dot-mid";
  return wrapIG("t90", T90_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "TRANSFORMATION")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="journey">
      ${steps.map((s, i) => `<div class="point">
        <div class="dot ${dotCls(i, steps.length)}"></div>
        <div>
          <div class="point-time">${esc(s.label)}</div>
          <div class="point-title">${esc(s.title)}</div>
          ${s.description ? `<div class="point-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T91 — INFOGRAPHIC MINI (Data storytelling, 4:5 feed)
   ============================================================ */
const T91_CSS = `
.t91{background:#08090E;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t91 .eyebrow{font-family:${IG_SANS};font-size:7px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.5);margin-bottom:12px;}
.t91 .headline{font-family:${IG_SANS};font-size:22px;font-weight:800;color:#fff;margin-bottom:6px;}
.t91 .sub{font-family:${IG_SANS};font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:24px;}
.t91 .hero-stat{text-align:center;margin-bottom:28px;}
.t91 .hero-num{font-family:${IG_SANS};font-size:72px;font-weight:900;background:linear-gradient(180deg,#fff,rgba(255,255,255,0.4));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
.t91 .hero-label{font-family:${IG_SANS};font-size:10px;color:rgba(255,255,255,0.3);margin-top:6px;}
.t91 .data-rows{display:flex;flex-direction:column;gap:12px;flex:1;}
.t91 .d-row{display:flex;align-items:center;gap:10px;}
.t91 .d-label{font-family:${IG_SANS};font-size:9px;color:rgba(255,255,255,0.45);width:90px;text-align:right;flex-shrink:0;}
.t91 .d-track{flex:1;height:10px;background:#111118;border-radius:5px;overflow:hidden;}
.t91 .d-fill{height:100%;border-radius:5px;}
.t91 .d-fill-1{background:linear-gradient(90deg,#6366F1,#A78BFA);}
.t91 .d-fill-2{background:linear-gradient(90deg,#22C55E,#4ADE80);}
.t91 .d-fill-3{background:linear-gradient(90deg,#F59E0B,#FBBF24);}
.t91 .d-val{font-family:${IG_SANS};font-size:10px;font-weight:700;color:#fff;width:36px;font-variant-numeric:tabular-nums;}
.t91 .source{font-family:${IG_SANS};font-size:7px;color:rgba(255,255,255,0.15);margin-top:auto;padding-top:12px;}
`;

function buildT91(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const fills = ["d-fill-1", "d-fill-2", "d-fill-3"];
  return wrapIG("t91", T91_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DATA INSIGHT")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    <div class="hero-stat">
      <div class="hero-num">${esc(c.stat?.value || "")}</div>
      <div class="hero-label">${esc(c.stat?.label || "")}</div>
    </div>
    <div class="data-rows">
      ${bars.map((b, i) => `<div class="d-row">
        <div class="d-label">${esc(b.label)}</div>
        <div class="d-track"><div class="d-fill ${fills[i % 3]}" style="width:${Math.min(b.value, 100)}%"></div></div>
        <div class="d-val">${b.value}%</div>
      </div>`).join("")}
    </div>
    <div class="source">${esc(c.body || "Source: JobPilot AI analysis")}</div>
    ${brandFooter("rgba(255,255,255,0.08)")}
  `, 540, 675, w, h);
}

/* ============================================================
   T92 — EXPERT PANEL (Multi-quote card, 1:1 grid)
   ============================================================ */
const T92_CSS = `
.t92{background:#FFFFFF;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t92 .eyebrow{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#6366F1;margin-bottom:14px;}
.t92 .title{font-family:${IG_SANS};font-size:22px;font-weight:800;color:#1A1A1A;margin-bottom:20px;}
.t92 .quotes{display:flex;flex-direction:column;gap:12px;flex:1;}
.t92 .qt{padding:14px 16px;border-radius:8px;background:#F8F7F4;border-left:3px solid #6366F1;}
.t92 .qt-text{font-family:${IG_SERIF};font-size:11px;font-style:italic;color:#4A4A4A;line-height:1.5;margin-bottom:8px;}
.t92 .qt-attr{display:flex;align-items:center;gap:8px;}
.t92 .qt-dot{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;}
.t92 .qt-name{font-family:${IG_SANS};font-size:9px;font-weight:600;color:#1A1A1A;}
`;

function buildT92(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  return wrapIG("t92", T92_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "EXPERT PANEL")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="quotes">
      ${tips.map(t => {
        const init = (t.title || "E")[0].toUpperCase();
        return `<div class="qt">
          <div class="qt-text">"${esc(t.description)}"</div>
          <div class="qt-attr">
            <div class="qt-dot">${esc(init)}</div>
            <div><div class="qt-name">${esc(t.title)}</div></div>
          </div>
        </div>`;
      }).join("")}
    </div>
    ${brandFooter("rgba(0,0,0,0.12)")}
  `, 540, 540, w, h);
}

/* ============================================================
   T93 — RESOURCE LIST (Curated tools/links, 4:5 feed)
   ============================================================ */
const T93_CSS = `
.t93{background:#FAF8F5;display:flex;flex-direction:column;padding:44px 40px 32px;}
.t93 .save-tag{display:flex;align-items:center;gap:6px;font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8B7355;margin-bottom:20px;}
.t93 .headline{font-family:${IG_SANS};font-size:22px;font-weight:800;color:#1A1A1A;margin-bottom:24px;letter-spacing:-0.02em;}
.t93 .resources{display:flex;flex-direction:column;gap:10px;flex:1;}
.t93 .res{display:flex;gap:12px;align-items:center;padding:14px 16px;background:#fff;border:1px solid #E8E4DD;border-radius:8px;}
.t93 .res-num{font-family:${IG_SANS};font-size:18px;font-weight:800;color:#6366F1;width:22px;text-align:center;flex-shrink:0;}
.t93 .res-body{flex:1;}
.t93 .res-name{font-family:${IG_SANS};font-size:12px;font-weight:700;color:#1A1A1A;margin-bottom:2px;}
.t93 .res-desc{font-family:${IG_SANS};font-size:9px;color:#8A8A8A;}
.t93 .res-tag{font-family:${IG_SANS};font-size:7px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6366F1;background:rgba(99,102,241,0.08);padding:3px 8px;border-radius:4px;flex-shrink:0;}
.t93 .bottom{font-family:${IG_SANS};font-size:7px;color:#B0ACA0;text-align:center;margin-top:auto;padding-top:16px;}
`;

function buildT93(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapIG("t93", T93_CSS, `
    <div class="save-tag">🔖 SAVE THIS LIST</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="resources">
      ${items.map((item, i) => `<div class="res">
        <div class="res-num">${i + 1}</div>
        <div class="res-body">
          <div class="res-name">${esc(item.text)}</div>
          <div class="res-desc">${esc(item.value || "")}</div>
        </div>
        ${item.highlighted ? '<div class="res-tag">FREE</div>' : ""}
      </div>`).join("")}
    </div>
    <div class="bottom">${esc(c.cta || "Bookmark this · jobpilotai.co")}</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T94 — WEEKLY RECAP (Digest format, 1:1 grid)
   ============================================================ */
const T94_CSS = `
.t94{background:#1C1914;display:flex;flex-direction:column;padding:44px 40px 32px;position:relative;}
.t94::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0.2;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:128px 128px;}
.t94 .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;position:relative;z-index:3;}
.t94 .header-title{font-family:${IG_SERIF};font-size:22px;color:#E8DFD0;font-weight:400;}
.t94 .header-date{font-family:${IG_SANS};font-size:8px;color:rgba(196,164,112,0.4);}
.t94 .gold-rule{width:100%;height:1px;background:rgba(196,164,112,0.25);margin-bottom:20px;position:relative;z-index:3;}
.t94 .items{display:flex;flex-direction:column;gap:14px;flex:1;position:relative;z-index:3;}
.t94 .item{display:flex;gap:10px;align-items:flex-start;}
.t94 .item-bullet{width:6px;height:6px;border-radius:50%;background:#C4A470;flex-shrink:0;margin-top:5px;}
.t94 .item-text{font-family:${IG_SANS};font-size:11px;color:#E8DFD0;line-height:1.5;}
.t94 .item-text strong{color:#C4A470;font-weight:600;}
.t94 .foot{font-family:${IG_SANS};font-size:7px;color:rgba(196,164,112,0.2);letter-spacing:0.12em;text-transform:uppercase;text-align:center;margin-top:auto;padding-top:16px;position:relative;z-index:3;}
`;

function buildT94(c: TemplateContent, w: number, h: number): string {
  const bullets = c.bullets || [];
  return wrapIG("t94", T94_CSS, `
    <div class="header">
      <div class="header-title">${esc(c.headline || "This Week in Careers")}</div>
      <div class="header-date">${esc(c.stat?.value || "")}</div>
    </div>
    <div class="gold-rule"></div>
    <div class="items">
      ${bullets.map(b => {
        const parts = b.split(":");
        const text = parts.length > 1 ? `<strong>${esc(parts[0])}:</strong> ${esc(parts.slice(1).join(":"))}` : esc(b);
        return `<div class="item"><div class="item-bullet"></div><div class="item-text">${text}</div></div>`;
      }).join("")}
    </div>
    <div class="foot">JOBPILOT AI</div>
  `, 540, 540, w, h);
}

/* ============================================================
   T95 — AMA RESPONSE (Question + answer card, 4:5 feed)
   ============================================================ */
const T95_CSS = `
.t95{background:linear-gradient(170deg,#EDE9FE,#DBEAFE,#E0F2FE);display:flex;flex-direction:column;padding:44px 40px 32px;}
.t95 .ama-tag{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#6366F1;margin-bottom:20px;display:flex;align-items:center;gap:8px;}
.t95 .ama-tag::before{content:'';width:14px;height:1.5px;background:#6366F1;}
.t95 .q-card{background:rgba(255,255,255,0.7);border-radius:12px;padding:24px;margin-bottom:24px;backdrop-filter:blur(8px);}
.t95 .q-label{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#6366F1;margin-bottom:10px;}
.t95 .q-text{font-family:${IG_SERIF};font-size:20px;font-weight:700;color:#1E1B4B;line-height:1.25;}
.t95 .a-section{flex:1;}
.t95 .a-label{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#22C55E;margin-bottom:12px;}
.t95 .a-text{font-family:${IG_SANS};font-size:12px;color:#1E1B4B;line-height:1.6;}
.t95 .a-text strong{font-weight:700;}
.t95 .cta{font-family:${IG_SANS};font-size:9px;color:#6366F1;font-weight:600;margin-top:auto;padding-top:16px;}
`;

function buildT95(c: TemplateContent, w: number, h: number): string {
  const body = esc(c.body || "");
  const bold = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapIG("t95", T95_CSS, `
    <div class="ama-tag">ASK ME ANYTHING</div>
    <div class="q-card">
      <div class="q-label">QUESTION</div>
      <div class="q-text">${esc(c.headline)}</div>
    </div>
    <div class="a-section">
      <div class="a-label">ANSWER</div>
      <div class="a-text">${bold}</div>
    </div>
    <div class="cta">${esc(c.cta || "Drop your question in the comments →")}</div>
  `, 540, 675, w, h);
}

/* ============================================================
   T96 — ACHIEVEMENT UNLOCKED (Gamified milestone, 1:1 grid)
   ============================================================ */
const T96_CSS = `
.t96{background:#08090E;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 40px;text-align:center;}
.t96 .badge-ring{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 0 40px rgba(99,102,241,0.3);}
.t96 .badge-inner{width:84px;height:84px;border-radius:50%;background:#08090E;display:flex;align-items:center;justify-content:center;font-size:36px;}
.t96 .unlocked{font-family:${IG_SANS};font-size:7px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#A78BFA;margin-bottom:14px;}
.t96 .title{font-family:${IG_SANS};font-size:24px;font-weight:800;color:#fff;margin-bottom:8px;}
.t96 .desc{font-family:${IG_SANS};font-size:10px;color:rgba(255,255,255,0.4);max-width:340px;line-height:1.5;margin-bottom:24px;}
.t96 .xp-bar{width:280px;height:10px;background:#1E1F2E;border-radius:5px;overflow:hidden;margin-bottom:6px;}
.t96 .xp-fill{height:100%;background:linear-gradient(90deg,#6366F1,#A78BFA);border-radius:5px;}
.t96 .xp-label{font-family:${IG_SANS};font-size:8px;color:rgba(255,255,255,0.25);font-variant-numeric:tabular-nums;}
`;

function buildT96(c: TemplateContent, w: number, h: number): string {
  const pct = c.score || parseInt(c.stat?.value || "75") || 75;
  return wrapIG("t96", T96_CSS, `
    <div class="badge-ring"><div class="badge-inner">🏆</div></div>
    <div class="unlocked">ACHIEVEMENT UNLOCKED</div>
    <div class="title">${esc(c.headline)}</div>
    ${c.body ? `<div class="desc">${esc(c.body)}</div>` : ""}
    <div class="xp-bar"><div class="xp-fill" style="width:${pct}%"></div></div>
    <div class="xp-label">${esc(c.stat?.label || `${pct}% complete`)}</div>
    ${brandFooter("rgba(255,255,255,0.08)")}
  `, 540, 540, w, h);
}

/* ============================================================
   PREMIUM INSTAGRAM TEMPLATES (T109-T114)
   ============================================================
   # Polished, editorial designs with prominent branding.
   # T109, T111, T113: 4:5 feed (540×675 → 2× to 1080×1350)
   # T110, T112: 1:1 grid (540×540 → 2× to 1080×1080)
   # T114: 9:16 story (432×768 → 2.5× to 1080×1920)
   ============================================================ */

// # Premium brand footer for Instagram — logo + name + domain, centered
function proIgFooter(color: string = "rgba(255,255,255,0.7)"): string {
  return `<div style="position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:8px;z-index:5;">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:20px;height:20px;border-radius:4px;">
    <span style="font-family:${IG_SANS};font-size:9px;font-weight:700;color:${color};letter-spacing:0.04em;">JobPilot AI</span>
    <span style="font-family:${IG_MONO};font-size:7px;color:${color};opacity:0.6;letter-spacing:0.03em;">jobpilotai.co</span>
  </div>`;
}

// # Premium brand footer in a bar style for dark backgrounds
function proIgFooterBar(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:14px 0 0;border-top:1px solid rgba(255,255,255,0.06);">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:24px;height:24px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);">
    <span style="font-family:${IG_SANS};font-size:10px;font-weight:700;color:rgba(255,255,255,0.8);">JobPilot AI</span>
    <span style="font-family:${IG_MONO};font-size:8px;color:rgba(255,255,255,0.3);margin-left:auto;letter-spacing:0.03em;">jobpilotai.co</span>
  </div>`;
}

// # Premium brand footer for light backgrounds
function proIgFooterLight(): string {
  return `<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding:14px 0 0;border-top:1px solid rgba(0,0,0,0.06);">
    <img src="${LOGO_PRO_URI}" alt="JobPilot AI" style="width:24px;height:24px;border-radius:5px;border:1px solid rgba(0,0,0,0.06);">
    <span style="font-family:${IG_SANS};font-size:10px;font-weight:700;color:#333;">JobPilot AI</span>
    <span style="font-family:${IG_MONO};font-size:8px;color:#BBB;margin-left:auto;letter-spacing:0.03em;">jobpilotai.co</span>
  </div>`;
}

/* ============================================================
   T109 — MAGAZINE EDITORIAL (Warm cream, serif headline, 4:5)
   ============================================================
   # Premium editorial layout with serif headline and clean rules.
   # Warm cream background with rich typography hierarchy.
   # Best for: carousel covers, thought leadership, insights.
   ============================================================ */
const T109_CSS = `
/* # Warm cream background — editorial/magazine feel */
.t109{background:#FAF7F2;display:flex;flex-direction:column;padding:44px 40px 28px;}
/* # Category label — gold, uppercase, small */
.t109 .cat{font-family:${IG_SANS};font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#B8860B;margin-bottom:8px;}
/* # Top rule — thin black line */
.t109 .rule{height:1px;background:#1A1A1A;margin-bottom:24px;}
/* # Serif headline — large, elegant, high contrast */
.t109 .hdl{font-family:${IG_SERIF};font-size:28px;font-weight:400;color:#1A1A1A;line-height:1.3;margin-bottom:8px;max-width:420px;}
.t109 .hdl strong{font-weight:700;}
/* # Subheadline */
.t109 .sub{font-family:${IG_SANS};font-size:11px;color:#8A8A8A;line-height:1.5;margin-bottom:auto;}
/* # Pull quote / featured text block */
.t109 .pullquote{border-left:3px solid #B8860B;padding-left:16px;margin:20px 0;font-family:${IG_SERIF};font-size:14px;color:#555;line-height:1.5;font-style:italic;}
/* # Bottom rule */
.t109 .rule-bottom{height:1px;background:#E2E0DB;margin-top:auto;}
/* # Footer */
.t109 .footer{display:flex;align-items:center;gap:10px;padding-top:12px;}
.t109 .footer img{width:22px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,0.06);}
.t109 .footer .fname{font-family:${IG_SANS};font-size:9px;font-weight:700;color:#999;letter-spacing:0.04em;}
.t109 .footer .furl{font-family:${IG_MONO};font-size:7px;color:#C8C4BC;margin-left:auto;letter-spacing:0.03em;}
`;

function buildT109(c: TemplateContent, w: number, h: number): string {
  // # Support headline highlight as bold
  const headline = c.headlineHighlight
    ? esc(c.headline).replace(esc(c.headlineHighlight), `<strong>${esc(c.headlineHighlight)}</strong>`)
    : esc(c.headline);
  const body = c.body ? esc(c.body) : "";

  return wrapIG("t109", T109_CSS, `
    <div class="cat">${esc(c.eyebrow || "CAREER INSIGHT")}</div>
    <div class="rule"></div>
    <div class="hdl">${headline}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    ${body ? `<div class="pullquote">${body}</div>` : ""}
    <div class="rule-bottom"></div>
    <div class="footer">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="fname">JobPilot AI</span>
      <span class="furl">jobpilotai.co</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T110 — MINIMAL TIP (White, single focus tip, 1:1)
   ============================================================
   # Ultra-clean white design with one bold tip in focus.
   # Large number accent, minimal distractions, save-worthy.
   # Best for: single tips, daily advice, quick wins.
   ============================================================ */
const T110_CSS = `
/* # Pure white background */
.t110{background:#FFFFFF;display:flex;flex-direction:column;padding:40px 36px 28px;}
/* # Large number accent — oversized, muted */
.t110 .num{font-size:80px;font-weight:900;letter-spacing:-0.04em;line-height:0.85;color:rgba(99,102,241,0.08);margin-bottom:4px;}
/* # Eyebrow */
.t110 .ey{font-family:${IG_SANS};font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
.t110 .ey::before{content:'';width:14px;height:2px;background:#6366F1;border-radius:1px;}
/* # Bold tip headline */
.t110 .hdl{font-size:22px;font-weight:800;color:#111;letter-spacing:-0.02em;line-height:1.25;margin-bottom:12px;max-width:420px;}
/* # Description text */
.t110 .desc{font-size:12px;color:#777;line-height:1.6;max-width:400px;}
.t110 .desc strong{color:#333;font-weight:600;}
/* # CTA pill */
.t110 .cta{display:inline-flex;align-items:center;gap:4px;margin-top:auto;padding:8px 16px;border-radius:6px;background:#6366F1;font-family:${IG_SANS};font-size:10px;font-weight:700;color:#FFF;}
/* # Footer */
.t110 .footer{display:flex;align-items:center;gap:8px;padding-top:14px;margin-top:16px;border-top:1px solid #F0F0F0;}
.t110 .footer img{width:20px;height:20px;border-radius:4px;border:1px solid rgba(0,0,0,0.06);}
.t110 .footer .fname{font-family:${IG_SANS};font-size:9px;font-weight:700;color:#999;}
.t110 .footer .furl{font-family:${IG_MONO};font-size:7px;color:#CCC;margin-left:auto;letter-spacing:0.03em;}
`;

function buildT110(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t110", T110_CSS, `
    <div class="num">01</div>
    <div class="ey">${esc(c.eyebrow || "DAILY TIP")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    ${c.body ? `<div class="desc">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta">${esc(c.cta)} →</div>` : ""}
    <div class="footer">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="fname">JobPilot AI</span>
      <span class="furl">jobpilotai.co</span>
    </div>
  `, 540, 540, w, h);
}

/* ============================================================
   T111 — GRADIENT OVERLAY (Indigo gradient with white text, 4:5)
   ============================================================
   # Rich gradient background with overlaid white text.
   # Semi-transparent card area for readability.
   # Best for: announcements, key messages, feature highlights.
   ============================================================ */
const T111_CSS = `
/* # Rich gradient background */
.t111{background:linear-gradient(135deg,#312E81 0%,#4C1D95 50%,#5B21B6 100%);display:flex;flex-direction:column;padding:44px 36px 28px;}
/* # Subtle grid texture */
.t111::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;}
/* # Eyebrow */
.t111 .ey{font-family:${IG_SANS};font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#C4B5FD;margin-bottom:auto;position:relative;z-index:1;display:flex;align-items:center;gap:8px;}
.t111 .ey::before{content:'';width:14px;height:2px;background:#C4B5FD;border-radius:1px;}
/* # Headline — large white serif */
.t111 .hdl{font-family:${IG_SERIF};font-size:30px;font-weight:400;color:#FFF;line-height:1.3;position:relative;z-index:1;margin-bottom:16px;max-width:440px;}
.t111 .hdl strong{font-weight:700;}
/* # Body text */
.t111 .body{font-family:${IG_SANS};font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;position:relative;z-index:1;max-width:400px;}
.t111 .body strong{color:rgba(255,255,255,0.85);font-weight:600;}
/* # Footer */
.t111 .footer{display:flex;align-items:center;gap:10px;padding-top:16px;margin-top:auto;border-top:1px solid rgba(255,255,255,0.08);position:relative;z-index:1;}
.t111 .footer img{width:22px;height:22px;border-radius:5px;border:1px solid rgba(255,255,255,0.12);}
.t111 .footer .fname{font-family:${IG_SANS};font-size:9px;font-weight:700;color:rgba(255,255,255,0.8);}
.t111 .footer .furl{font-family:${IG_MONO};font-size:7px;color:rgba(255,255,255,0.3);margin-left:auto;letter-spacing:0.03em;}
`;

function buildT111(c: TemplateContent, w: number, h: number): string {
  const headline = c.headlineHighlight
    ? esc(c.headline).replace(esc(c.headlineHighlight), `<strong>${esc(c.headlineHighlight)}</strong>`)
    : esc(c.headline);
  const body = c.body ? esc(c.body) : "";

  return wrapIG("t111", T111_CSS, `
    <div class="ey">${esc(c.eyebrow || "FEATURED")}</div>
    <div class="hdl">${headline}</div>
    ${body ? `<div class="body">${body}</div>` : ""}
    <div class="footer">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="fname">JobPilot AI</span>
      <span class="furl">jobpilotai.co</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T112 — BOLD STATEMENT (Solid color bg, one statement, 1:1)
   ============================================================
   # Strong solid-color background with a single bold statement.
   # High impact, save-worthy, shareable.
   # Best for: quotes, bold opinions, mindset content.
   ============================================================ */
const T112_CSS = `
/* # Deep indigo solid background */
.t112{background:#1E1B4B;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px 36px;text-align:center;}
/* # Decorative quote mark */
.t112::before{content:'"';position:absolute;top:30px;left:50%;transform:translateX(-50%);font-family:${IG_SERIF};font-size:200px;font-weight:700;color:rgba(99,102,241,0.06);pointer-events:none;line-height:1;}
/* # The bold statement */
.t112 .statement{font-family:${IG_SERIF};font-size:24px;font-weight:400;color:#FFF;line-height:1.4;position:relative;z-index:1;max-width:420px;}
.t112 .statement strong{font-weight:700;}
/* # Attribution / source */
.t112 .attr{font-family:${IG_SANS};font-size:9px;font-weight:600;color:#A78BFA;margin-top:20px;letter-spacing:0.08em;text-transform:uppercase;position:relative;z-index:1;}
/* # Thin rule */
.t112 .rule{width:32px;height:2px;background:#6366F1;border-radius:1px;margin:16px auto 0;position:relative;z-index:1;}
/* # Footer centered */
.t112 .footer{position:absolute;bottom:20px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:8px;z-index:1;}
.t112 .footer img{width:18px;height:18px;border-radius:4px;}
.t112 .footer .fname{font-family:${IG_SANS};font-size:8px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.04em;}
.t112 .footer .furl{font-family:${IG_MONO};font-size:7px;color:rgba(255,255,255,0.2);letter-spacing:0.03em;}
`;

function buildT112(c: TemplateContent, w: number, h: number): string {
  const headline = c.headlineHighlight
    ? esc(c.headline).replace(esc(c.headlineHighlight), `<strong>${esc(c.headlineHighlight)}</strong>`)
    : esc(c.headline);

  return wrapIG("t112", T112_CSS, `
    <div class="statement">${headline}</div>
    <div class="rule"></div>
    <div class="attr">${esc(c.subheadline || c.eyebrow || "— JobPilot AI")}</div>
    <div class="footer">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="fname">JobPilot AI</span>
      <span class="furl">jobpilotai.co</span>
    </div>
  `, 540, 540, w, h);
}

/* ============================================================
   T113 — DATA BARS (Horizontal bar chart on white, 4:5)
   ============================================================
   # Professional white layout with horizontal bar chart.
   # Clean data visualization for engagement-driving content.
   # Best for: survey results, comparisons, rankings, data.
   ============================================================ */
const T113_CSS = `
/* # White background */
.t113{background:#FFFFFF;display:flex;flex-direction:column;padding:40px 36px 28px;}
/* # Eyebrow */
.t113 .ey{font-family:${IG_SANS};font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:8px;display:flex;align-items:center;gap:8px;}
.t113 .ey::before{content:'';width:14px;height:2px;background:#6366F1;border-radius:1px;}
/* # Headline */
.t113 .hdl{font-size:22px;font-weight:800;color:#111;letter-spacing:-0.02em;line-height:1.2;margin-bottom:24px;}
/* # Bars container */
.t113 .bars{display:flex;flex-direction:column;gap:14px;flex:1;}
/* # Each bar row */
.t113 .bar-row{display:flex;flex-direction:column;gap:4px;}
.t113 .bar-label{display:flex;justify-content:space-between;font-family:${IG_SANS};font-size:11px;color:#555;}
.t113 .bar-label .val{font-weight:700;color:#111;}
/* # Bar track + fill */
.t113 .bar-track{height:8px;background:#F0F0F0;border-radius:4px;overflow:hidden;}
.t113 .bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#6366F1,#A78BFA);}
/* # Footer */
.t113 .footer{display:flex;align-items:center;gap:10px;padding-top:14px;margin-top:auto;border-top:1px solid #F0F0F0;}
.t113 .footer img{width:22px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,0.06);}
.t113 .footer .fname{font-family:${IG_SANS};font-size:9px;font-weight:700;color:#999;}
.t113 .footer .furl{font-family:${IG_MONO};font-size:7px;color:#CCC;margin-left:auto;letter-spacing:0.03em;}
`;

function buildT113(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapIG("t113", T113_CSS, `
    <div class="ey">${esc(c.eyebrow || "DATA INSIGHT")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="bars">
      ${bars.map(b => `<div class="bar-row">
        <div class="bar-label"><span>${esc(b.label)}</span><span class="val">${b.value}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(b.value, 100)}%"></div></div>
      </div>`).join("")}
    </div>
    <div class="footer">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="fname">JobPilot AI</span>
      <span class="furl">jobpilotai.co</span>
    </div>
  `, 540, 675, w, h);
}

/* ============================================================
   T114 — STORY CARD (Floating card on dark gradient, 9:16)
   ============================================================
   # Instagram story format with a frosted card floating on
   # dark gradient background. Animated-look accents.
   # Best for: story tips, announcements, quick advice.
   ============================================================ */
const T114_CSS = `
/* # Dark gradient background */
.t114{background:linear-gradient(180deg,#0C0D18 0%,#151830 40%,#0C0D18 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px 24px;}
/* # Glow orb top */
.t114::before{content:'';position:absolute;top:80px;right:-20px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%);pointer-events:none;}
/* # Glow orb bottom */
.t114::after{content:'';position:absolute;bottom:120px;left:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,0.08),transparent 70%);pointer-events:none;}
/* # The floating card */
.t114 .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px 24px;width:100%;max-width:380px;display:flex;flex-direction:column;position:relative;z-index:1;}
/* # Eyebrow inside card */
.t114 .card .ey{font-family:${IG_SANS};font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6366F1;margin-bottom:14px;display:flex;align-items:center;gap:6px;}
.t114 .card .ey::before{content:'';width:10px;height:2px;background:#6366F1;border-radius:1px;}
/* # Headline */
.t114 .card .hdl{font-size:20px;font-weight:800;color:#FFF;line-height:1.25;letter-spacing:-0.02em;margin-bottom:12px;}
/* # Body text */
.t114 .card .body{font-family:${IG_SANS};font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6;}
.t114 .card .body strong{color:rgba(255,255,255,0.75);font-weight:600;}
/* # Tips inside card */
.t114 .card .tips{display:flex;flex-direction:column;gap:10px;margin-top:12px;}
.t114 .card .tip{display:flex;gap:8px;align-items:flex-start;font-family:${IG_SANS};font-size:11px;color:rgba(255,255,255,0.5);line-height:1.4;}
.t114 .card .tip::before{content:'→';color:#6366F1;font-weight:700;flex-shrink:0;}
/* # Brand badge below card */
.t114 .badge{display:flex;align-items:center;gap:6px;margin-top:24px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:8px 14px;position:relative;z-index:1;}
.t114 .badge img{width:18px;height:18px;border-radius:4px;}
.t114 .badge .bname{font-family:${IG_SANS};font-size:9px;font-weight:700;color:rgba(255,255,255,0.6);}
.t114 .badge .burl{font-family:${IG_MONO};font-size:7px;color:rgba(255,255,255,0.25);margin-left:auto;letter-spacing:0.03em;}
`;

function buildT114(c: TemplateContent, w: number, h: number): string {
  const body = c.body ? esc(c.body) : "";
  const tips = c.tips || [];
  const bullets = c.bullets || [];

  return wrapIG("t114", T114_CSS, `
    <div class="card">
      <div class="ey">${esc(c.eyebrow || "QUICK TIP")}</div>
      <div class="hdl">${esc(c.headline)}</div>
      ${body ? `<div class="body">${body}</div>` : ""}
      ${tips.length > 0 ? `<div class="tips">
        ${tips.slice(0, 4).map(t => `<div class="tip"><strong>${esc(t.title)}</strong> ${esc(t.description)}</div>`).join("")}
      </div>` : ""}
      ${bullets.length > 0 && tips.length === 0 ? `<div class="tips">
        ${bullets.slice(0, 4).map(b => `<div class="tip">${esc(b)}</div>`).join("")}
      </div>` : ""}
    </div>
    <div class="badge">
      <img src="${LOGO_PRO_URI}" alt="JobPilot AI">
      <span class="bname">JobPilot AI</span>
      <span class="burl">jobpilotai.co</span>
    </div>
  `, 432, 768, w, h);
}

/* ============================================================
   FRESH PRO TEMPLATES — T127-T132
   ============================================================
   # White/grey/cream backgrounds, navy/coral/teal/rose accents.
   # Editorial, clean, high-contrast. Mixed formats.
   ============================================================ */

// # T127 — Magazine Spread: Cream bg, charcoal rules, serif headline (4:5)
const T127_CSS = `
.t127{width:540px;height:675px;background:#FAF9F7;display:flex;flex-direction:column;padding:40px 38px 24px;font-family:${IG_SANS};position:relative;}
.t127 .cat{font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#B8860B;margin-bottom:6px;}
.t127 .rule-top{height:1.5px;background:#1A1A1A;margin-bottom:16px;}
.t127 .hdl{font-family:${IG_SERIF};font-size:26px;font-weight:400;color:#1A1A1A;line-height:1.3;margin-bottom:8px;}
.t127 .hdl strong{font-weight:700;}
.t127 .sub{font-size:11px;color:#8A8A8A;margin-bottom:auto;line-height:1.5;}
.t127 .pull{border-left:2.5px solid #B8860B;padding-left:14px;margin:16px 0;font-family:${IG_SERIF};font-size:13px;color:#555;font-style:italic;line-height:1.5;}
.t127 .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:12px;}
.t127 .col{font-size:10px;color:#666;line-height:1.6;}
.t127 .col strong{color:#1A1A1A;font-weight:600;}
.t127 .rule-btm{height:1px;background:#E2E0DB;}
.t127 .ftr{display:flex;align-items:center;gap:6px;padding-top:8px;font-size:9px;color:#999;}
.t127 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#C8C4BC;}
`;
function buildT127(c: TemplateContent, w: number, h: number): string {
  const cols = c.bullets || [];
  return wrapIG("t127", T127_CSS, `
    <div class="cat">${esc(c.eyebrow || "CAREER INSIGHT")}</div>
    <div class="rule-top"></div>
    <div class="hdl">${esc(c.headline)}</div>
    ${c.subheadline ? `<div class="sub">${esc(c.subheadline)}</div>` : ""}
    ${c.body ? `<div class="pull">"${esc(c.body)}"</div>` : ""}
    ${cols.length >= 2 ? `<div class="cols">
      <div class="col">${esc(cols[0])}</div>
      <div class="col">${esc(cols[1])}</div>
    </div>` : ""}
    <div class="rule-btm"></div>
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 675, w, h);
}

// # T128 — Minimal Grid: White bg, 2×2 grey cards, teal accents (1:1)
const T128_CSS = `
.t128{width:540px;height:540px;background:#FFFFFF;display:flex;flex-direction:column;padding:36px 34px 24px;font-family:${IG_SANS};position:relative;}
.t128 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#0D9488;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.t128 .ey::before{content:'';width:14px;height:2px;background:#0D9488;border-radius:1px;}
.t128 .hdl{font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.02em;line-height:1.2;margin-bottom:14px;}
.t128 .grid4{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;}
.t128 .g-card{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px 14px;display:flex;flex-direction:column;}
.t128 .g-num{font-size:20px;font-weight:900;color:#0D9488;margin-bottom:4px;font-variant-numeric:tabular-nums;}
.t128 .g-lbl{font-size:8px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:auto;}
.t128 .g-bar{height:3px;background:#E5E7EB;border-radius:2px;overflow:hidden;margin-top:8px;}
.t128 .g-fill{height:100%;background:linear-gradient(90deg,#0D9488,#2DD4BF);border-radius:2px;}
.t128 .ftr{display:flex;align-items:center;gap:6px;padding-top:8px;font-size:9px;color:#999;}
.t128 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#C8C4BC;}
`;
function buildT128(c: TemplateContent, w: number, h: number): string {
  const bars = (c.bars || []).slice(0, 4);
  return wrapIG("t128", T128_CSS, `
    <div class="ey">${esc(c.eyebrow || "KEY METRICS")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="grid4">
      ${bars.map(b => `<div class="g-card">
        <div class="g-num">${esc(b.label)}</div>
        <div class="g-lbl">${esc(b.color || "")}</div>
        <div class="g-bar"><div class="g-fill" style="width:${b.value}%"></div></div>
      </div>`).join("")}
    </div>
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 540, w, h);
}

// # T129 — Gradient Soft: Blush→lavender pastel gradient, white text (4:5)
const T129_CSS = `
.t129{width:540px;height:675px;background:linear-gradient(145deg,#FDF2F8,#F5F3FF,#EDE9FE);display:flex;flex-direction:column;padding:44px 38px 28px;font-family:${IG_SANS};position:relative;}
.t129 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#7C3AED;margin-bottom:auto;display:flex;align-items:center;gap:8px;}
.t129 .ey::before{content:'';width:14px;height:2px;background:#7C3AED;border-radius:1px;}
.t129 .hdl{font-family:${IG_SERIF};font-size:26px;font-weight:400;color:#1E1B4B;line-height:1.35;margin-bottom:10px;}
.t129 .hdl strong{font-weight:700;}
.t129 .body{font-size:12px;color:#6B7280;line-height:1.6;margin-bottom:auto;}
.t129 .tips{display:flex;flex-direction:column;gap:8px;margin-bottom:8px;}
.t129 .tip{display:flex;gap:8px;align-items:flex-start;font-size:10px;color:#4B5563;}
.t129 .tip::before{content:'→';color:#7C3AED;font-weight:700;flex-shrink:0;}
.t129 .ftr{display:flex;align-items:center;gap:6px;padding-top:10px;border-top:1px solid rgba(124,58,237,0.1);font-size:9px;color:#7C3AED;}
.t129 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:rgba(124,58,237,0.4);}
`;
function buildT129(c: TemplateContent, w: number, h: number): string {
  const tips = c.bullets || [];
  return wrapIG("t129", T129_CSS, `
    <div class="ey">${esc(c.eyebrow || "FEATURED")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    ${tips.length ? `<div class="tips">${tips.slice(0, 4).map(t => `<div class="tip">${esc(t)}</div>`).join("")}</div>` : ""}
    <div class="ftr"><span>JobPilot AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 675, w, h);
}

// # T130 — Typography Hero: White bg, massive bold headline, coral line (1:1)
const T130_CSS = `
.t130{width:540px;height:540px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:center;padding:40px 36px;font-family:${IG_SANS};position:relative;}
.t130 .ey{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#EA580C;margin-bottom:16px;}
.t130 .hdl{font-size:32px;font-weight:900;color:#111827;letter-spacing:-0.04em;line-height:1.1;margin-bottom:12px;}
.t130 .hdl em{font-style:normal;color:#EA580C;}
.t130 .line{width:40px;height:3px;background:linear-gradient(90deg,#EA580C,#FDBA74);border-radius:2px;margin-bottom:12px;}
.t130 .body{font-size:12px;color:#9CA3AF;line-height:1.6;max-width:380px;}
.t130 .body strong{color:#374151;font-weight:700;}
.t130 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;font-size:9px;color:#999;}
.t130 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#C8C4BC;}
`;
function buildT130(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t130", T130_CSS, `
    <div class="ey">${esc(c.eyebrow || "TRUTH BOMB")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="line"></div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 540, w, h);
}

// # T131 — Data Story: Light grey bg, clean horizontal bars with navy fills (4:5)
const T131_CSS = `
.t131{width:540px;height:675px;background:#F3F4F6;display:flex;flex-direction:column;padding:40px 38px 24px;font-family:${IG_SANS};position:relative;}
.t131 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#1E3A5A;margin-bottom:10px;display:flex;align-items:center;gap:8px;opacity:0.6;}
.t131 .ey::before{content:'';width:14px;height:2px;background:#1E3A5A;border-radius:1px;}
.t131 .hdl{font-size:24px;font-weight:800;color:#111827;letter-spacing:-0.03em;line-height:1.2;margin-bottom:6px;}
.t131 .sub{font-size:10px;color:#9CA3AF;margin-bottom:20px;}
.t131 .bars{flex:1;display:flex;flex-direction:column;gap:12px;}
.t131 .bar-row{display:flex;flex-direction:column;gap:3px;}
.t131 .bar-meta{display:flex;justify-content:space-between;font-size:10px;}
.t131 .bar-meta .lbl{color:#374151;font-weight:600;}
.t131 .bar-meta .val{color:#1E3A5A;font-weight:800;font-variant-numeric:tabular-nums;}
.t131 .bar-track{height:6px;background:#E5E7EB;border-radius:3px;overflow:hidden;}
.t131 .bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#1E3A5A,#3B82F6);}
.t131 .source{font-size:7px;color:#D1D5DB;margin-top:8px;}
.t131 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;font-size:9px;color:#999;}
.t131 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#C8C4BC;}
`;
function buildT131(c: TemplateContent, w: number, h: number): string {
  const bars = (c.bars || []).slice(0, 6);
  return wrapIG("t131", T131_CSS, `
    <div class="ey">${esc(c.eyebrow || "DATA INSIGHT")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    ${c.subheadline ? `<div class="sub">${esc(c.subheadline)}</div>` : ""}
    <div class="bars">
      ${bars.map(b => `<div class="bar-row">
        <div class="bar-meta"><span class="lbl">${esc(b.label)}</span><span class="val">${b.value}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${b.value}%"></div></div>
      </div>`).join("")}
    </div>
    ${c.body ? `<div class="source">${esc(c.body)}</div>` : ""}
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 675, w, h);
}

// # T132 — Story Minimal: White bg, thin grey border frame, rose accent (9:16)
const T132_CSS = `
.t132{width:432px;height:768px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:50px 32px;font-family:${IG_SANS};position:relative;}
.t132 .frame{position:absolute;top:20px;left:20px;right:20px;bottom:20px;border:1px solid #E5E7EB;border-radius:12px;pointer-events:none;}
.t132 .ey{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#E11D48;margin-bottom:16px;position:relative;z-index:1;}
.t132 .hdl{font-family:${IG_SERIF};font-size:24px;font-weight:400;color:#111827;line-height:1.35;margin-bottom:10px;position:relative;z-index:1;}
.t132 .hdl strong{font-weight:700;}
.t132 .divider{width:30px;height:2px;background:#E11D48;border-radius:1px;margin-bottom:12px;}
.t132 .body{font-size:11px;color:#9CA3AF;line-height:1.6;max-width:300px;position:relative;z-index:1;}
.t132 .cta-pill{display:inline-flex;padding:8px 18px;border-radius:6px;background:#E11D48;font-size:10px;font-weight:700;color:#fff;margin-top:20px;position:relative;z-index:1;}
`;
function buildT132(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t132", T132_CSS, `
    <div class="frame"></div>
    <div class="ey">${esc(c.eyebrow || "STORY")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="divider"></div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta-pill">${esc(c.cta)}</div>` : ""}
    ${storyBadge()}
  `, 432, 768, w, h);
}


/* ============================================================
   PRO SET 3 — T145-T150
   ============================================================
   # Slate, emerald, amber, sky blue on white/grey/cream.
   # Polaroid, split editorial, infographic, duo-tone, card stack.
   ============================================================ */

// # T145 — Polaroid: White bg, photo-frame card with caption, slate accent (4:5)
const T145_CSS = `
.t145{width:540px;height:675px;background:#F1F5F9;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 38px;font-family:${IG_SANS};position:relative;}
.t145 .card{background:#FFFFFF;border-radius:4px;padding:16px 16px 24px;box-shadow:0 2px 8px rgba(0,0,0,0.08),0 0 1px rgba(0,0,0,0.05);transform:rotate(-1.5deg);max-width:380px;width:100%;}
.t145 .card-img{background:linear-gradient(135deg,#E2E8F0,#CBD5E1);border-radius:2px;height:180px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;overflow:hidden;}
.t145 .card-img .placeholder{font-size:36px;color:#94A3B8;font-weight:800;letter-spacing:-0.04em;}
.t145 .card-caption{font-family:${IG_SERIF};font-size:14px;color:#1E293B;line-height:1.4;font-style:italic;}
.t145 .card-meta{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:9px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
.t145 .ftr{position:absolute;bottom:16px;left:0;right:0;text-align:center;font-size:8px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#94A3B8;}
`;
function buildT145(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t145", T145_CSS, `
    <div class="card">
      <div class="card-img"><div class="placeholder">${esc(c.stat?.value || "📸")}</div></div>
      <div class="card-caption">${esc(c.headline)}</div>
      <div class="card-meta">
        <span>${esc(c.eyebrow || "JOBPILOT AI")}</span>
        <span>${esc(c.subheadline || "2026")}</span>
      </div>
    </div>
    <div class="ftr">JOBPILOT AI</div>
  `, 540, 675, w, h);
}

// # T146 — Split Editorial: White bg, horizontal split with slate accent (1:1)
const T146_CSS = `
.t146{width:540px;height:540px;background:#FFFFFF;display:grid;grid-template-rows:1fr auto 1fr;font-family:${IG_SANS};position:relative;}
.t146 .top{padding:28px 34px 16px;display:flex;flex-direction:column;justify-content:flex-end;}
.t146 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#475569;margin-bottom:8px;display:flex;align-items:center;gap:8px;}
.t146 .ey::before{content:'';width:14px;height:2px;background:#475569;border-radius:1px;}
.t146 .hdl{font-family:${IG_SERIF};font-size:22px;font-weight:700;color:#0F172A;letter-spacing:-0.02em;line-height:1.25;}
.t146 .divider{height:1px;background:linear-gradient(90deg,#475569 40%,#E2E8F0);}
.t146 .bottom{padding:16px 34px 24px;display:flex;flex-direction:column;}
.t146 .body{font-size:12px;color:#64748B;line-height:1.6;}
.t146 .body strong{color:#0F172A;font-weight:700;}
.t146 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;font-size:9px;color:#94A3B8;}
.t146 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#CBD5E1;}
`;
function buildT146(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t146", T146_CSS, `
    <div class="top">
      <div class="ey">${esc(c.eyebrow || "INSIGHT")}</div>
      <div class="hdl">${esc(c.headline)}</div>
    </div>
    <div class="divider"></div>
    <div class="bottom">
      ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
      <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
    </div>
  `, 540, 540, w, h);
}

// # T147 — Infographic: White bg, numbered flow with connecting lines, emerald (4:5)
const T147_CSS = `
.t147{width:540px;height:675px;background:#FFFFFF;display:flex;flex-direction:column;padding:40px 38px 24px;font-family:${IG_SANS};position:relative;}
.t147 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#059669;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.t147 .ey::before{content:'';width:14px;height:2px;background:#059669;border-radius:1px;}
.t147 .hdl{font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.02em;line-height:1.2;margin-bottom:18px;}
.t147 .flow{flex:1;display:flex;flex-direction:column;gap:0;}
.t147 .node{display:flex;gap:14px;align-items:flex-start;}
.t147 .node-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;}
.t147 .node-num.active{background:#059669;color:#fff;}
.t147 .node-num.done{background:#DCFCE7;color:#059669;border:1px solid #BBF7D0;}
.t147 .node-t{font-size:12px;font-weight:700;color:#111827;padding-top:4px;}
.t147 .node-d{font-size:9px;color:#9CA3AF;margin-top:2px;line-height:1.4;}
.t147 .connector{width:2px;height:14px;background:#D1FAE5;margin-left:13px;}
.t147 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;font-size:9px;color:#999;}
.t147 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#C8C4BC;}
`;
function buildT147(c: TemplateContent, w: number, h: number): string {
  const steps = (c.steps || c.tips || []).slice(0, 4);
  return wrapIG("t147", T147_CSS, `
    <div class="ey">${esc(c.eyebrow || "HOW IT WORKS")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="flow">
      ${steps.map((s, i) => `
        ${i > 0 ? '<div class="connector"></div>' : ""}
        <div class="node">
          <div class="node-num ${i === 0 ? "active" : "done"}">${i + 1}</div>
          <div>
            <div class="node-t">${esc(s.title)}</div>
            <div class="node-d">${esc(s.description || "")}</div>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 675, w, h);
}

// # T148 — Duo-Tone: Sky blue top, white bottom, clean split (1:1)
const T148_CSS = `
.t148{width:540px;height:540px;background:#FFFFFF;display:flex;flex-direction:column;font-family:${IG_SANS};position:relative;overflow:hidden;}
.t148 .top{background:#0284C7;padding:28px 34px 24px;display:flex;flex-direction:column;justify-content:flex-end;flex:1;}
.t148 .ey{font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px;}
.t148 .hdl{font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;line-height:1.2;}
.t148 .bottom{padding:20px 34px 24px;display:flex;flex-direction:column;}
.t148 .body{font-size:11px;color:#64748B;line-height:1.6;margin-bottom:auto;}
.t148 .tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
.t148 .tag{padding:3px 10px;border-radius:12px;background:#F0F9FF;border:1px solid #BAE6FD;font-size:8px;font-weight:600;color:#0284C7;}
.t148 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:6px;font-size:9px;color:#94A3B8;}
.t148 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#CBD5E1;}
`;
function buildT148(c: TemplateContent, w: number, h: number): string {
  const tags = c.tags || [];
  return wrapIG("t148", T148_CSS, `
    <div class="top">
      <div class="ey">${esc(c.eyebrow || "FEATURED")}</div>
      <div class="hdl">${esc(c.headline)}</div>
    </div>
    <div class="bottom">
      ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
      ${tags.length ? `<div class="tags">${tags.slice(0, 5).map(t => `<div class="tag">${esc(t)}</div>`).join("")}</div>` : ""}
      <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
    </div>
  `, 540, 540, w, h);
}

// # T149 — Card Stack: Cream bg, overlapping cards with tips, amber accent (4:5)
const T149_CSS = `
.t149{width:540px;height:675px;background:#FEFCE8;display:flex;flex-direction:column;padding:40px 38px 24px;font-family:${IG_SANS};position:relative;}
.t149 .ey{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#D97706;margin-bottom:10px;display:flex;align-items:center;gap:8px;}
.t149 .ey::before{content:'';width:14px;height:2px;background:#D97706;border-radius:1px;}
.t149 .hdl{font-size:22px;font-weight:800;color:#1C1917;letter-spacing:-0.02em;line-height:1.2;margin-bottom:16px;}
.t149 .stack{flex:1;display:flex;flex-direction:column;gap:8px;position:relative;}
.t149 .scard{background:#FFFFFF;border:1px solid #FDE68A;border-radius:10px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);display:flex;gap:10px;align-items:flex-start;}
.t149 .scard-num{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#D97706,#FBBF24);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;}
.t149 .scard-t{font-size:11px;font-weight:700;color:#1C1917;}
.t149 .scard-d{font-size:9px;color:#78716C;margin-top:2px;line-height:1.4;}
.t149 .ftr{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;font-size:9px;color:#A8A29E;}
.t149 .ftr .url{margin-left:auto;font-family:${IG_MONO};font-size:7px;color:#D6D3D1;}
`;
function buildT149(c: TemplateContent, w: number, h: number): string {
  const tips = (c.tips || []).slice(0, 4);
  return wrapIG("t149", T149_CSS, `
    <div class="ey">${esc(c.eyebrow || "TIPS")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    <div class="stack">
      ${tips.map((t, i) => `<div class="scard">
        <div class="scard-num">${i + 1}</div>
        <div><div class="scard-t">${esc(t.title)}</div><div class="scard-d">${esc(t.description)}</div></div>
      </div>`).join("")}
    </div>
    <div class="ftr"><span>JOBPILOT AI</span><span class="url">jobpilotai.co</span></div>
  `, 540, 675, w, h);
}

// # T150 — Clean Story CTA: White bg, centered headline, sky blue CTA button (9:16)
const T150_CSS = `
.t150{width:432px;height:768px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:50px 32px;font-family:${IG_SANS};position:relative;}
.t150 .icon{font-size:36px;margin-bottom:16px;}
.t150 .ey{font-size:8px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#0284C7;margin-bottom:14px;}
.t150 .hdl{font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.03em;line-height:1.2;margin-bottom:10px;}
.t150 .body{font-size:11px;color:#94A3B8;line-height:1.6;max-width:300px;margin-bottom:20px;}
.t150 .cta-btn{display:inline-flex;padding:10px 24px;border-radius:8px;background:linear-gradient(135deg,#0284C7,#38BDF8);font-size:12px;font-weight:700;color:#fff;letter-spacing:0.02em;box-shadow:0 2px 8px rgba(2,132,199,0.25);}
.t150 .swipe{font-size:8px;color:#CBD5E1;margin-top:20px;letter-spacing:0.12em;text-transform:uppercase;}
`;
function buildT150(c: TemplateContent, w: number, h: number): string {
  return wrapIG("t150", T150_CSS, `
    <div class="icon">${esc(c.stat?.value || "🚀")}</div>
    <div class="ey">${esc(c.eyebrow || "TRY IT NOW")}</div>
    <div class="hdl">${esc(c.headline)}</div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta-btn">${esc(c.cta)}</div>` : ""}
    <div class="swipe">Swipe up ↑</div>
    ${storyBadge()}
  `, 432, 768, w, h);
}


/* ============================================================
   ROUTER
   ============================================================ */
export function buildInstagramTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): string {
  switch (templateId) {
    case "t22": return buildT22(content, width, height);
    case "t23": return buildT23(content, width, height);
    case "t24": return buildT24(content, width, height);
    case "t25": return buildT25(content, width, height);
    case "t26": return buildT26(content, width, height);
    case "t27": return buildT27(content, width, height);
    case "t34": return buildT34(content, width, height);
    case "t35": return buildT35(content, width, height);
    case "t36": return buildT36(content, width, height);
    case "t37": return buildT37(content, width, height);
    case "t38": return buildT38(content, width, height);
    case "t39": return buildT39(content, width, height);
    case "t45": return buildT45(content, width, height);
    case "t46": return buildT46(content, width, height);
    case "t47": return buildT47(content, width, height);
    case "t48": return buildT48(content, width, height);
    case "t53": return buildT53(content, width, height);
    case "t54": return buildT54(content, width, height);
    case "t55": return buildT55(content, width, height);
    case "t56": return buildT56(content, width, height);
    case "t57": return buildT57(content, width, height);
    case "t58": return buildT58(content, width, height);
    case "t59": return buildT59(content, width, height);
    case "t60": return buildT60(content, width, height);
    case "t61": return buildT61(content, width, height);
    case "t62": return buildT62(content, width, height);
    case "t63": return buildT63(content, width, height);
    case "t64": return buildT64(content, width, height);
    case "t89": return buildT89(content, width, height);
    case "t90": return buildT90(content, width, height);
    case "t91": return buildT91(content, width, height);
    case "t92": return buildT92(content, width, height);
    case "t93": return buildT93(content, width, height);
    case "t94": return buildT94(content, width, height);
    case "t95": return buildT95(content, width, height);
    case "t96": return buildT96(content, width, height);
    // # Premium templates
    case "t109": return buildT109(content, width, height);
    case "t110": return buildT110(content, width, height);
    case "t111": return buildT111(content, width, height);
    case "t112": return buildT112(content, width, height);
    case "t113": return buildT113(content, width, height);
    case "t114": return buildT114(content, width, height);
    // # Fresh Pro templates
    case "t127": return buildT127(content, width, height);
    case "t128": return buildT128(content, width, height);
    case "t129": return buildT129(content, width, height);
    case "t130": return buildT130(content, width, height);
    case "t131": return buildT131(content, width, height);
    case "t132": return buildT132(content, width, height);
    // # Pro Set 3 templates
    case "t145": return buildT145(content, width, height);
    case "t146": return buildT146(content, width, height);
    case "t147": return buildT147(content, width, height);
    case "t148": return buildT148(content, width, height);
    case "t149": return buildT149(content, width, height);
    case "t150": return buildT150(content, width, height);
    default:
      return buildT22(content, width, height);
  }
}
