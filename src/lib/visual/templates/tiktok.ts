/* ============================================================
   TIKTOK TEMPLATES — T16-T21 (Set 1: Native Formats)
   ============================================================
   # 9:16 vertical (1080×1920). Preview at 432×768 → 2.5× scale.
   # iOS-native aesthetic, neon accents, watermark-only branding.
   # Apple system fonts, low text density, anti-corporate tone.
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, esc } from "./shared";

// # All TikTok template IDs across all 4 sets
export const TIKTOK_IDS: TemplateId[] = [
  "t16", "t17", "t18", "t19", "t20", "t21",
  "t28", "t29", "t30", "t31", "t32", "t33",
  "t40", "t41", "t42", "t43", "t44",
  "t49", "t50", "t51", "t52",
  "t81", "t82", "t83", "t84", "t85", "t86", "t87", "t88",
];

// # TikTok font stacks — iOS-native feel
const TT_FONT = `-apple-system, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif`;
const TT_MONO = `'Cascadia Code', 'SF Mono', 'Fira Code', Consolas, monospace`;

// # Watermark brand — subtle bottom-left, 40% opacity
function watermark(): string {
  return `<div style="position:absolute;bottom:24px;left:24px;display:flex;align-items:center;gap:6px;opacity:0.4;z-index:5;">
    <img src="${LOGO_DATA_URI}" alt="JP" style="width:14px;height:14px;border-radius:3px;">
    <span style="font-size:7px;font-weight:600;color:#fff;letter-spacing:0.04em;">JobPilot AI</span>
  </div>`;
}

// # Page wrapper with scale transform
function wrapTT(cls: string, css: string, body: string, pw: number, ph: number, tw: number, th: number): string {
  const scale = tw / pw;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${tw}px;height:${th}px;overflow:hidden;}
  body{font-family:${TT_FONT};transform-origin:top left;transform:scale(${scale});width:${pw}px;height:${ph}px;}
  .${cls}{width:${pw}px;height:${ph}px;position:relative;overflow:hidden;}
  ${css}
</style></head>
<body><div class="${cls}">${body}</div></body></html>`;
}

/* ============================================================
   T16 — NOTES APP SCREENSHOT (iOS dark, 432×768)
   ============================================================ */
const T16_CSS = `
.t16{background:#1C1C1E;display:flex;flex-direction:column;}
.t16 .nav{display:flex;align-items:center;padding:20px 16px 10px;gap:4px;}
.t16 .nav-back{font-size:11px;color:#FFD60A;font-weight:400;}
.t16 .nav-title{font-size:8px;color:rgba(255,255,255,0.5);margin-left:auto;}
.t16 .date{font-size:7px;color:rgba(255,255,255,0.3);padding:4px 16px 8px;}
.t16 .note-title{font-size:22px;font-weight:700;color:#fff;padding:0 16px 8px;line-height:1.2;}
.t16 .note-body{font-size:12px;color:rgba(255,255,255,0.8);padding:0 16px;line-height:1.65;flex:1;}
.t16 .note-body mark{background:#FFD60A;color:#000;padding:0 3px;border-radius:2px;font-weight:600;}
.t16 .kb-bar{background:#2C2C2E;padding:10px 16px;display:flex;align-items:center;gap:8px;border-top:1px solid #3A3A3C;}
.t16 .kb-icon{width:22px;height:22px;border-radius:6px;background:#3A3A3C;display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,0.5);}
`;

function buildT16(c: TemplateContent, w: number, h: number): string {
  const bodyText = esc(c.body || "");
  const highlights = c.tips || [];
  let html = bodyText;
  highlights.forEach(t => {
    const escaped = esc(t.title);
    html = html.replace(escaped, `<mark>${escaped}</mark>`);
  });

  return wrapTT("t16", T16_CSS, `
    <div class="nav"><span class="nav-back">‹ Notes</span><span class="nav-title">iCloud</span></div>
    <div class="date">${esc(c.eyebrow || "Today at 2:34 AM")}</div>
    <div class="note-title">${esc(c.headline)}</div>
    <div class="note-body">${html}</div>
    <div class="kb-bar">
      <div class="kb-icon">Aa</div><div class="kb-icon">✓</div><div class="kb-icon">📷</div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T17 — TIER RANKING (Pure black, 432×768)
   ============================================================ */
const T17_CSS = `
.t17{background:#0F0F0F;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t17 .title{font-size:21px;font-weight:900;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:24px;}
.t17 .tiers{display:flex;flex-direction:column;gap:8px;flex:1;}
.t17 .tier{display:flex;align-items:center;gap:10px;}
.t17 .tier-letter{width:32px;height:32px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;}
.t17 .tier-items{display:flex;flex-wrap:wrap;gap:5px;flex:1;}
.t17 .chip{background:#1A1A1A;border:1px solid #2A2A2A;border-radius:14px;padding:5px 10px;font-size:8px;font-weight:600;color:rgba(255,255,255,0.8);}
.t17 .cta{font-size:9px;color:rgba(255,255,255,0.35);text-align:center;margin-top:auto;padding-top:16px;}
`;

function buildT17(c: TemplateContent, w: number, h: number): string {
  const tiers = c.steps || [];
  const colors: Record<string, string> = { S: "#FF1744", A: "#FF9100", B: "#FFEA00", C: "#69F0AE", D: "#448AFF" };
  return wrapTT("t17", T17_CSS, `
    <div class="title">${esc(c.headline)}</div>
    <div class="tiers">
      ${tiers.map(t => `<div class="tier">
        <div class="tier-letter" style="background:${colors[t.label] || "#6366F1"}">${esc(t.label)}</div>
        <div class="tier-items">
          ${(t.description || "").split(",").map(item => `<div class="chip">${esc(item.trim())}</div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
    <div class="cta">Comment your ranking ↓</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T18 — TEXT MESSAGE THREAD (iMessage, 432×768)
   ============================================================ */
const T18_CSS = `
.t18{background:#000;display:flex;flex-direction:column;}
.t18 .header{display:flex;align-items:center;gap:8px;padding:20px 16px 12px;border-bottom:1px solid #1C1C1E;}
.t18 .avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#A78BFA);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.t18 .avatar img{width:16px;height:16px;border-radius:3px;}
.t18 .hdr-text{display:flex;flex-direction:column;}
.t18 .hdr-name{font-size:10px;font-weight:600;color:#fff;}
.t18 .hdr-role{font-size:7px;color:rgba(255,255,255,0.4);}
.t18 .msgs{flex:1;padding:12px 16px;display:flex;flex-direction:column;gap:6px;overflow:hidden;}
.t18 .ts{font-size:6px;color:rgba(255,255,255,0.25);text-align:center;margin:4px 0;}
.t18 .bubble{max-width:75%;padding:8px 10px;border-radius:12px;font-size:10px;line-height:1.45;}
.t18 .me{background:#0A84FF;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
.t18 .them{background:#1C1C1E;color:rgba(255,255,255,0.9);align-self:flex-start;border-bottom-left-radius:4px;}
.t18 .input-bar{background:#1C1C1E;padding:10px 16px;display:flex;align-items:center;gap:8px;border-top:1px solid #2C2C2E;}
.t18 .input-field{flex:1;background:#2C2C2E;border-radius:14px;padding:7px 12px;font-size:8px;color:rgba(255,255,255,0.3);}
.t18 .send-btn{width:22px;height:22px;border-radius:50%;background:#0A84FF;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;}
`;

function buildT18(c: TemplateContent, w: number, h: number): string {
  const messages = c.tips || [];
  return wrapTT("t18", T18_CSS, `
    <div class="header">
      <div class="avatar"><img src="${LOGO_DATA_URI}" alt="JP"></div>
      <div class="hdr-text"><span class="hdr-name">JobPilot AI</span><span class="hdr-role">Career Assistant</span></div>
    </div>
    <div class="msgs">
      <div class="ts">${esc(c.eyebrow || "Today 10:24 AM")}</div>
      ${messages.map((m, i) => `<div class="bubble ${i % 2 === 0 ? "me" : "them"}">${esc(i % 2 === 0 ? m.title : m.description)}</div>`).join("")}
    </div>
    <div class="input-bar">
      <div class="input-field">iMessage</div>
      <div class="send-btn">↑</div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T19 — NEON STATEMENT (Pure black + glow, 432×768)
   ============================================================ */
const T19_CSS = `
.t19{background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t19 .tag{font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:32px;}
.t19 .statement{font-size:42px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.03em;margin-bottom:20px;}
.t19 .neon{display:inline;}
.t19 .sub{font-size:14px;color:rgba(255,255,255,0.45);max-width:340px;line-height:1.5;}
.t19 .glow-bg{position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(80px);opacity:0.06;z-index:0;}
`;

function buildT19(c: TemplateContent, w: number, h: number): string {
  const neonColors = ["#00FF88", "#FF006E", "#FFD60A", "#00D4FF"];
  const idx = c.stat?.value ? parseInt(c.stat.value) % 4 : 0;
  const neon = neonColors[idx];
  const headline = esc(c.headline);
  const keyword = esc(c.headlineHighlight || "");
  const styled = keyword ? headline.replace(keyword, `<span class="neon" style="color:${neon};text-shadow:0 0 20px ${neon}66,0 0 40px ${neon}26">${keyword}</span>`) : headline;

  return wrapTT("t19", T19_CSS, `
    <div class="glow-bg" style="background:${neon};top:30%;left:20%;"></div>
    <div class="tag" style="color:${neon}">HOT TAKE</div>
    <div class="statement" style="position:relative;z-index:1;">${styled}</div>
    ${c.body ? `<div class="sub" style="position:relative;z-index:1;">${esc(c.body)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T20 — SWIPE CAROUSEL CARD (Warm cream, 432×768)
   ============================================================ */
const T20_CSS = `
.t20{background:#FFFBF0;display:flex;flex-direction:column;padding:60px 28px 32px;}
.t20 .badge{display:inline-flex;align-self:flex-start;background:#000;color:#fff;padding:5px 12px;border-radius:14px;font-size:8px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;}
.t20 .slide-num{font-size:52px;font-weight:900;color:#000;letter-spacing:-0.04em;margin-bottom:6px;}
.t20 .title{font-size:22px;font-weight:800;color:#000;line-height:1.2;margin-bottom:16px;max-width:340px;}
.t20 .body{font-size:13px;color:#4A4A4A;line-height:1.6;flex:1;max-width:360px;}
.t20 .body strong{color:#000;font-weight:700;}
.t20 .bottom{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:20px;}
.t20 .dots{display:flex;gap:4px;}
.t20 .dot{width:6px;height:6px;border-radius:3px;background:#D4D0C8;}
.t20 .dot.active{background:#000;width:14px;}
.t20 .swipe{font-size:9px;color:#8A8A8A;font-weight:500;}
`;

function buildT20(c: TemplateContent, w: number, h: number): string {
  const body = c.body ? esc(c.body) : "";
  const boldBody = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapTT("t20", T20_CSS, `
    <div class="badge">${esc(c.eyebrow || "CAREER TIPS")}</div>
    <div class="slide-num">${esc(c.stat?.value || "01")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="body">${boldBody}</div>
    <div class="bottom">
      <div class="dots"><div class="dot active"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <div class="swipe">Swipe for more →</div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T21 — BOLD COLOR HOT TAKE (Vibrant gradient, 432×768)
   ============================================================ */
const T21_CSS = `
.t21{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t21 .label{font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin-bottom:32px;}
.t21 .statement{font-size:32px;font-weight:900;color:#fff;line-height:1.15;letter-spacing:-0.02em;margin-bottom:20px;max-width:360px;}
.t21 .statement s{text-decoration:line-through;text-decoration-thickness:3px;opacity:0.7;}
.t21 .divider{width:40px;height:3px;background:rgba(255,255,255,0.3);border-radius:2px;margin-bottom:20px;}
.t21 .counter{font-size:14px;color:rgba(255,255,255,0.8);max-width:340px;line-height:1.5;}
`;

function buildT21(c: TemplateContent, w: number, h: number): string {
  const gradients = [
    "linear-gradient(145deg,#FF006E,#FF4D8D,#FF8EB5)",
    "linear-gradient(145deg,#0066FF,#4D00FF,#8B5CF6)",
    "linear-gradient(145deg,#FF9500,#FF3B30,#CC2936)",
    "linear-gradient(145deg,#00BFA5,#00C853,#69F0AE)",
  ];
  const idx = c.stat?.value ? parseInt(c.stat.value) % 4 : 0;
  return wrapTT("t21", T21_CSS + `.t21{background:${gradients[idx]};}`, `
    <div class="label">UNPOPULAR OPINION</div>
    <div class="statement">${esc(c.headline)}</div>
    <div class="divider"></div>
    ${c.body ? `<div class="counter">${esc(c.body)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T28 — BOLD STAT (Brand indigo, 432×768)
   ============================================================ */
const T28_CSS = `
.t28{background:#1E1B4B;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t28 .eyebrow{font-size:4px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:24px;}
.t28 .big-num{font-size:48px;font-weight:900;background:linear-gradient(180deg,#fff 40%,rgba(255,255,255,0.3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
.t28 .unit{font-size:14px;font-weight:300;color:rgba(255,255,255,0.4);margin-top:4px;margin-bottom:20px;}
.t28 .context{font-size:7px;color:rgba(255,255,255,0.7);line-height:1.5;max-width:300px;}
.t28 .context strong{color:#fff;font-weight:700;}
.t28 .divider{width:28px;height:1.5px;background:rgba(167,139,250,0.4);margin:16px 0;}
.t28 .cta{font-size:4px;color:#A78BFA;letter-spacing:0.08em;}
`;

function buildT28(c: TemplateContent, w: number, h: number): string {
  const body = esc(c.body || "");
  const bold = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapTT("t28", T28_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "")}</div>
    <div class="big-num">${esc(c.stat?.value || c.headline)}</div>
    <div class="unit">${esc(c.stat?.label || "")}</div>
    <div class="context">${bold}</div>
    <div class="divider"></div>
    <div class="cta">${esc(c.cta || "Save this →")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T29 — SPLIT CONTRAST (Dark/Light split, 432×768)
   ============================================================ */
const T29_CSS = `
.t29{display:flex;width:432px;height:768px;position:relative;}
.t29 .left{width:50%;background:#08090E;padding:60px 16px 32px 20px;display:flex;flex-direction:column;}
.t29 .right{width:50%;background:#F4F2ED;padding:60px 20px 32px 16px;display:flex;flex-direction:column;}
.t29 .label{font-size:5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:3px 8px;border-radius:3px;align-self:flex-start;margin-bottom:14px;}
.t29 .label-bad{background:rgba(239,68,68,0.15);color:#EF4444;}
.t29 .label-good{background:rgba(34,211,153,0.15);color:#22C55E;}
.t29 .heading{font-size:8px;font-weight:600;margin-bottom:12px;}
.t29 .heading-l{color:rgba(255,255,255,0.8);}
.t29 .heading-r{color:#1A1A1A;}
.t29 .item{display:flex;align-items:center;gap:5px;font-size:7px;margin-bottom:6px;line-height:1.4;}
.t29 .item-l{color:rgba(255,255,255,0.5);}
.t29 .item-r{color:#4A4A4A;}
.t29 .dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}
.t29 .dot-bad{background:#EF4444;}
.t29 .dot-good{background:#22C55E;}
.t29 .center-line{position:absolute;left:50%;top:15%;bottom:15%;width:1px;background:linear-gradient(180deg,transparent,#6366F1,transparent);z-index:2;}
`;

function buildT29(c: TemplateContent, w: number, h: number): string {
  const leftItems = c.bullets || [];
  const rightItems = c.tips?.map(t => t.title) || [];
  return wrapTT("t29", T29_CSS, `
    <div class="left">
      <div class="label label-bad">WITHOUT</div>
      <div class="heading heading-l">${esc(c.beforeText || "Generic approach")}</div>
      ${leftItems.map(b => `<div class="item item-l"><div class="dot dot-bad"></div>${esc(b)}</div>`).join("")}
    </div>
    <div class="right">
      <div class="label label-good">WITH JOBPILOT</div>
      <div class="heading heading-r">${esc(c.afterText || "AI-powered")}</div>
      ${rightItems.map(t => `<div class="item item-r"><div class="dot dot-good"></div>${esc(t)}</div>`).join("")}
    </div>
    <div class="center-line"></div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T30 — GRADIENT STATEMENT (Purple gradient, 432×768)
   ============================================================ */
const T30_CSS = `
.t30{background:linear-gradient(165deg,#0F0F1A,#1a103a,#2d1054);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;position:relative;}
.t30::before{content:'';position:absolute;top:25%;right:10%;width:180px;height:180px;border-radius:50%;background:#A78BFA;filter:blur(80px);opacity:0.15;}
.t30::after{content:'';position:absolute;bottom:30%;left:15%;width:140px;height:140px;border-radius:50%;background:#FF006E;filter:blur(70px);opacity:0.1;}
.t30 .statement{font-size:13px;font-weight:800;color:#fff;line-height:1.4;max-width:340px;position:relative;z-index:1;}
.t30 .gradient-word{background:linear-gradient(90deg,#A78BFA,#FF006E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.t30 .sub{font-size:5px;color:rgba(255,255,255,0.35);margin-top:16px;position:relative;z-index:1;}
`;

function buildT30(c: TemplateContent, w: number, h: number): string {
  const text = esc(c.headline);
  const kw = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = kw ? text.replace(kw, `<span class="gradient-word">${kw}</span>`) : text;
  return wrapTT("t30", T30_CSS, `
    <div class="statement">${styled}</div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T31 — STACKED CARDS (Dark glass, 432×768)
   ============================================================ */
const T31_CSS = `
.t31{background:#0A0A0F;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t31 .title{font-size:7px;font-weight:800;color:#fff;margin-bottom:4px;}
.t31 .sub{font-size:4px;color:rgba(255,255,255,0.3);margin-bottom:20px;}
.t31 .cards{display:flex;flex-direction:column;gap:8px;flex:1;}
.t31 .card{background:#13131C;border:1px solid #1E1F2E;border-radius:8px;padding:14px 16px;position:relative;}
.t31 .card.accent{border-left:3px solid #6366F1;}
.t31 .card-num{font-size:4px;color:rgba(99,102,241,0.5);font-weight:600;margin-bottom:6px;}
.t31 .card-title{font-size:6px;font-weight:700;color:#fff;margin-bottom:4px;}
.t31 .card-body{font-size:4px;color:rgba(255,255,255,0.4);line-height:1.5;}
`;

function buildT31(c: TemplateContent, w: number, h: number): string {
  const cards = c.steps || [];
  return wrapTT("t31", T31_CSS, `
    <div class="title">${esc(c.headline)}</div>
    <div class="sub">${esc(c.subheadline || "")}</div>
    <div class="cards">
      ${cards.map((s, i) => `<div class="card${i === 0 ? " accent" : ""}">
        <div class="card-num">${esc(s.label)}</div>
        <div class="card-title">${esc(s.title)}</div>
        ${s.description ? `<div class="card-body">${esc(s.description)}</div>` : ""}
      </div>`).join("")}
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T32 — EDITORIAL BOLD (Cream, typography contrast, 432×768)
   ============================================================ */
const T32_CSS = `
.t32{background:#F5F0E8;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t32 .eyebrow{font-size:4px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#6366F1;margin-bottom:24px;display:flex;align-items:center;gap:5px;}
.t32 .eyebrow::before{content:'';width:10px;height:1.5px;background:#6366F1;}
.t32 .lines{display:flex;flex-direction:column;gap:4px;margin-bottom:20px;}
.t32 .line-thin{font-size:14px;font-weight:300;text-transform:uppercase;color:#8A8580;letter-spacing:0.06em;}
.t32 .line-heavy{font-size:14px;font-weight:900;text-transform:uppercase;color:#0A0A0A;letter-spacing:0.02em;}
.t32 .accent-bar{width:100%;height:2px;background:linear-gradient(90deg,transparent,#6366F1,transparent);margin-bottom:20px;}
.t32 .sub{font-size:5px;color:#6B6560;max-width:300px;line-height:1.5;}
.t32 .tag{font-size:4px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A09890;margin-top:20px;padding:4px 10px;border:1px solid #D4CFC6;border-radius:12px;}
`;

function buildT32(c: TemplateContent, w: number, h: number): string {
  const lines = (c.headline || "").split("/").map(l => l.trim());
  return wrapTT("t32", T32_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "CAREER ADVICE")}</div>
    <div class="lines">
      ${lines.map((l, i) => `<div class="${i % 2 === 0 ? "line-heavy" : "line-thin"}">${esc(l)}</div>`).join("")}
    </div>
    <div class="accent-bar"></div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="tag">${esc(c.cta)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T33 — NEON OUTLINE (Pure black, outlined text + glow, 432×768)
   ============================================================ */
const T33_CSS = `
.t33{background:#050508;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t33 .badge{font-size:4px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#00FFB2;border:1px solid rgba(0,255,178,0.3);border-radius:10px;padding:3px 10px;margin-bottom:28px;}
.t33 .text{font-size:11px;font-weight:800;color:transparent;-webkit-text-stroke:1px #fff;line-height:1.4;max-width:360px;}
.t33 .text .filled{-webkit-text-stroke:0;color:#fff;}
.t33 .text .glow{-webkit-text-stroke:0;color:#00FFB2;text-shadow:0 0 20px rgba(0,255,178,0.4),0 0 40px rgba(0,255,178,0.15);}
.t33 .sub{font-size:5px;color:rgba(255,255,255,0.3);margin-top:20px;max-width:300px;line-height:1.5;}
.t33 .grad-line{width:60px;height:1px;background:linear-gradient(90deg,transparent,#00FFB2,transparent);margin:16px 0;}
.t33 .cta{font-size:4px;color:rgba(0,255,178,0.5);}
`;

function buildT33(c: TemplateContent, w: number, h: number): string {
  const text = esc(c.headline);
  const kw = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = kw ? text.replace(kw, `<span class="glow">${kw}</span>`) : text;
  return wrapTT("t33", T33_CSS, `
    <div class="badge">${esc(c.eyebrow || "INSIGHT")}</div>
    <div class="text">${styled}</div>
    <div class="grad-line"></div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta">${esc(c.cta)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T40 — BRUTALIST HIGHLIGHT (Cream, inverted blocks, 432×768)
   ============================================================ */
const T40_CSS = `
.t40{background:#F5F0E8;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:60px 28px;}
.t40 .words{display:flex;flex-direction:column;gap:4px;margin-bottom:20px;}
.t40 .word{font-size:17px;font-weight:900;text-transform:uppercase;color:#0A0A0A;line-height:1.2;}
.t40 .word.hl{display:inline-block;background:#0A0A0A;color:#F5F0E8;padding:2px 8px;}
.t40 .full-rule{width:100%;height:2px;background:#0A0A0A;margin-bottom:16px;}
.t40 .sub{font-size:5px;color:#5A5550;line-height:1.5;max-width:340px;margin-bottom:16px;}
.t40 .foot{display:flex;align-items:center;justify-content:space-between;width:100%;}
.t40 .tag{font-size:4px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8A8580;}
.t40 .arrow{font-size:8px;color:#0A0A0A;}
`;

function buildT40(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  const fallbackWords = c.headline.split(" ").map((w, i) => ({ text: w, highlighted: i % 3 === 1 }));
  const words = items.length > 0 ? items : fallbackWords;
  return wrapTT("t40", T40_CSS, `
    <div class="words">
      ${words.map(w => `<div class="word${w.highlighted ? " hl" : ""}">${esc(w.text)}</div>`).join("")}
    </div>
    <div class="full-rule"></div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    <div class="foot">
      <div class="tag">${esc(c.eyebrow || "")}</div>
      <div class="arrow">→</div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T41 — KEYNOTE SLIDE (Dark, pitch-deck, 432×768)
   ============================================================ */
const T41_CSS = `
.t41{background:#0C0C12;display:flex;flex-direction:column;padding:60px 28px 32px;}
.t41 .slide-num{font-size:4px;color:rgba(99,102,241,0.5);font-weight:600;margin-bottom:auto;}
.t41 .headline{font-size:10px;font-weight:700;color:#fff;line-height:1.4;max-width:340px;margin-bottom:12px;}
.t41 .headline em{font-style:normal;color:#6366F1;}
.t41 .thin-rule{width:32px;height:1px;background:rgba(255,255,255,0.08);margin-bottom:12px;}
.t41 .body{font-size:5px;color:rgba(255,255,255,0.35);line-height:1.6;max-width:300px;margin-bottom:auto;}
.t41 .foot{display:flex;align-items:center;justify-content:space-between;}
.t41 .foot-brand{font-size:4px;font-weight:600;color:rgba(255,255,255,0.2);}
.t41 .foot-page{font-size:4px;color:rgba(255,255,255,0.15);font-variant-numeric:tabular-nums;}
`;

function buildT41(c: TemplateContent, w: number, h: number): string {
  const headline = esc(c.headline);
  const kw = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = kw ? headline.replace(kw, `<em>${kw}</em>`) : headline;
  return wrapTT("t41", T41_CSS, `
    <div class="slide-num">${esc(c.stat?.label || "01")}</div>
    <div class="headline">${styled}</div>
    <div class="thin-rule"></div>
    ${c.body ? `<div class="body">${esc(c.body)}</div>` : ""}
    <div class="foot">
      <div class="foot-brand">JobPilot AI</div>
      <div class="foot-page">${esc(c.stat?.value || "1 / 5")}</div>
    </div>
  `, 432, 768, w, h);
}

/* ============================================================
   T42 — VERTICAL TIMELINE (Dark, connected dots, 432×768)
   ============================================================ */
const T42_CSS = `
.t42{background:#08090E;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t42 .cat{font-size:4px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.5);margin-bottom:8px;}
.t42 .title{font-size:8px;font-weight:800;color:#fff;margin-bottom:20px;}
.t42 .steps{display:flex;flex-direction:column;gap:0;flex:1;}
.t42 .step{display:flex;gap:12px;position:relative;padding-bottom:16px;}
.t42 .step::before{content:'';position:absolute;left:5px;top:12px;bottom:0;width:1px;background:#1E1F2E;}
.t42 .step:last-child::before{display:none;}
.t42 .dot{width:10px;height:10px;border-radius:50%;border:1.5px solid #6366F1;flex-shrink:0;background:#08090E;z-index:1;margin-top:1px;}
.t42 .step:first-child .dot{background:#6366F1;box-shadow:0 0 8px rgba(99,102,241,0.4);}
.t42 .step-content{padding-top:0;}
.t42 .step-title{font-size:5px;font-weight:700;color:#fff;margin-bottom:2px;}
.t42 .step-desc{font-size:4px;color:rgba(255,255,255,0.35);line-height:1.45;}
.t42 .result{background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:6px;padding:10px 12px;margin-top:8px;}
.t42 .result-title{font-size:5px;font-weight:700;color:#A78BFA;margin-bottom:2px;}
.t42 .result-desc{font-size:4px;color:rgba(255,255,255,0.4);}
`;

function buildT42(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapTT("t42", T42_CSS, `
    <div class="cat">${esc(c.eyebrow || "WORKFLOW")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="steps">
      ${steps.map(s => `<div class="step">
        <div class="dot"></div>
        <div class="step-content">
          <div class="step-title">${esc(s.title)}</div>
          ${s.description ? `<div class="step-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${c.cta ? `<div class="result"><div class="result-title">${esc(c.cta)}</div><div class="result-desc">${esc(c.body || "")}</div></div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T43 — QUOTE CARD (Warm dark, serif, 432×768)
   ============================================================ */
const T43_CSS = `
.t43{background:#161210;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;}
.t43 .big-q{font-family:Georgia,'Times New Roman',serif;font-size:40px;color:rgba(196,164,112,0.1);margin-bottom:12px;line-height:0.6;}
.t43 .quote{font-family:Georgia,'Times New Roman',serif;font-size:8px;font-style:italic;color:#E8DFD0;line-height:1.55;max-width:320px;margin-bottom:16px;}
.t43 .gold-rule{width:24px;height:1px;background:rgba(196,164,112,0.25);margin-bottom:12px;}
.t43 .attr{font-size:4px;color:rgba(196,164,112,0.5);letter-spacing:0.08em;margin-bottom:2px;}
.t43 .role{font-size:4px;color:rgba(196,164,112,0.25);}
`;

function buildT43(c: TemplateContent, w: number, h: number): string {
  return wrapTT("t43", T43_CSS, `
    <div class="big-q">"</div>
    <div class="quote">${esc(c.headline)}</div>
    <div class="gold-rule"></div>
    <div class="attr">${esc(c.subheadline || "")}</div>
    <div class="role">${esc(c.body || "")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T44 — METRIC DASHBOARD (Dark, SaaS grid, 432×768)
   ============================================================ */
const T44_CSS = `
.t44{background:#08090E;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t44 .eyebrow{font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.4);margin-bottom:8px;}
.t44 .title{font-size:7px;font-weight:800;color:#fff;margin-bottom:16px;}
.t44 .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;}
.t44 .metric{background:#111118;border:1px solid #1A1B28;border-radius:6px;padding:12px;}
.t44 .m-label{font-size:4px;color:rgba(255,255,255,0.4);margin-bottom:6px;}
.t44 .m-value{font-size:11px;font-weight:800;font-variant-numeric:tabular-nums;}
.t44 .m-change{font-size:4px;font-weight:600;margin-top:4px;}
.t44 .m-up{color:#22C55E;}
.t44 .m-accent{color:#6366F1;}
.t44 .m-white{color:#fff;}
.t44 .progress{margin-bottom:auto;}
.t44 .p-label{font-size:4px;color:rgba(255,255,255,0.3);margin-bottom:4px;}
.t44 .p-track{height:4px;background:#1A1B28;border-radius:2px;overflow:hidden;}
.t44 .p-fill{height:100%;background:linear-gradient(90deg,#6366F1,#A78BFA);border-radius:2px;}
`;

function buildT44(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const metrics = bars.slice(0, 4);
  const progress = bars[4];
  const colors = ["m-accent", "m-up", "m-white", "m-accent"];
  return wrapTT("t44", T44_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "DASHBOARD")}</div>
    <div class="title">${esc(c.headline)}</div>
    <div class="grid">
      ${metrics.map((m, i) => `<div class="metric">
        <div class="m-label">${esc(m.label)}</div>
        <div class="m-value ${colors[i] || "m-white"}">${esc(String(m.value))}</div>
        <div class="m-change ${m.value > 0 ? "m-up" : ""}">${m.color ? esc(m.color) : "↑"}</div>
      </div>`).join("")}
    </div>
    ${progress ? `<div class="progress">
      <div class="p-label">${esc(progress.label)}</div>
      <div class="p-track"><div class="p-fill" style="width:${Math.min(progress.value, 100)}%"></div></div>
    </div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T49 — CENTERED MINIMAL (Maximum negative space, 432×768)
   ============================================================ */
const T49_CSS = `
.t49{background:#0A0A0F;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 32px;text-align:center;}
.t49 .line-top{width:1px;height:48px;background:linear-gradient(180deg,transparent,#6366F1);margin-bottom:32px;}
.t49 .statement{font-size:9px;font-weight:600;color:#fff;line-height:1.55;max-width:320px;}
.t49 .statement em{font-style:normal;color:#6366F1;}
.t49 .line-bot{width:1px;height:48px;background:linear-gradient(180deg,#6366F1,transparent);margin-top:32px;}
.t49 .tiny-brand{position:absolute;bottom:16px;left:0;right:0;text-align:center;font-size:3px;color:rgba(255,255,255,0.12);}
`;

function buildT49(c: TemplateContent, w: number, h: number): string {
  const text = esc(c.headline);
  const kw = c.headlineHighlight ? esc(c.headlineHighlight) : "";
  const styled = kw ? text.replace(kw, `<em>${kw}</em>`) : text;
  return wrapTT("t49", T49_CSS, `
    <div class="line-top"></div>
    <div class="statement">${styled}</div>
    <div class="line-bot"></div>
    <div class="tiny-brand">JOBPILOT AI</div>
  `, 432, 768, w, h);
}

/* ============================================================
   T50 — TERMINAL (Code/hacker aesthetic, 432×768)
   ============================================================ */
const T50_CSS = `
.t50{background:#0C0C0C;display:flex;flex-direction:column;padding:40px 16px 32px;font-family:${TT_MONO};}
.t50 .dots{display:flex;gap:4px;margin-bottom:16px;}
.t50 .dot{width:6px;height:6px;border-radius:50%;}
.t50 .dot-r{background:#FF5F57;}
.t50 .dot-y{background:#FEBC2E;}
.t50 .dot-g{background:#28C840;}
.t50 .lines{display:flex;flex-direction:column;gap:4px;flex:1;}
.t50 .prompt{display:flex;gap:4px;font-size:5px;align-items:flex-start;}
.t50 .user{color:#22C55E;}
.t50 .path{color:#6366F1;}
.t50 .cmd{color:rgba(255,255,255,0.8);}
.t50 .flag{color:#FFD60A;}
.t50 .str{color:#22C55E;}
.t50 .comment{color:rgba(255,255,255,0.25);font-style:italic;}
.t50 .output{background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:4px;padding:8px 10px;margin-top:8px;}
.t50 .out-line{font-size:5px;color:rgba(255,255,255,0.6);margin-bottom:3px;}
.t50 .out-val{color:#22C55E;font-weight:700;}
.t50 .cursor{display:inline-block;width:4px;height:8px;background:#fff;animation:blink 1s step-end infinite;margin-left:2px;vertical-align:middle;}
@keyframes blink{50%{opacity:0;}}
`;

function buildT50(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapTT("t50", T50_CSS, `
    <div class="dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    <div class="lines">
      ${steps.map(s => `<div class="prompt">
        <span class="user">→</span>
        <span class="path">~/career</span>
        <span class="cmd">${esc(s.title)}</span>
      </div>
      ${s.description ? `<div class="prompt"><span class="comment"># ${esc(s.description)}</span></div>` : ""}`).join("")}
      <div class="output">
        ${c.bullets?.map(b => `<div class="out-line"><span class="out-val">${esc(b)}</span></div>`).join("") || ""}
      </div>
      <div class="prompt"><span class="user">→</span><span class="cursor"></span></div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T51 — GRADIENT MESH (Layered radial gradients, 432×768)
   ============================================================ */
const T51_CSS = `
.t51{background:#0C0C16;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;position:relative;}
.t51::before{content:'';position:absolute;top:20%;right:5%;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,#6366F1 0%,transparent 70%);opacity:0.15;}
.t51::after{content:'';position:absolute;bottom:25%;left:10%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,#A78BFA 0%,transparent 70%);opacity:0.12;}
.t51 .eyebrow{font-size:4px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:20px;position:relative;z-index:1;}
.t51 .headline{font-size:12px;font-weight:800;color:#fff;line-height:1.3;max-width:340px;margin-bottom:10px;position:relative;z-index:1;}
.t51 .thin-rule{width:32px;height:1px;background:rgba(255,255,255,0.15);margin-bottom:10px;position:relative;z-index:1;}
.t51 .sub{font-size:5px;color:rgba(255,255,255,0.4);max-width:300px;line-height:1.5;margin-bottom:20px;position:relative;z-index:1;}
.t51 .cta-btn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:6px 16px;font-size:4px;font-weight:600;color:#fff;backdrop-filter:blur(8px);position:relative;z-index:1;}
`;

function buildT51(c: TemplateContent, w: number, h: number): string {
  return wrapTT("t51", T51_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "")}</div>
    <div class="headline">${esc(c.headline)}</div>
    <div class="thin-rule"></div>
    ${c.body ? `<div class="sub">${esc(c.body)}</div>` : ""}
    ${c.cta ? `<div class="cta-btn">${esc(c.cta)}</div>` : ""}
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T52 — NUMBER LIST (Dark, big gradient numbers, 432×768)
   ============================================================ */
const T52_CSS = `
.t52{background:#08090E;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t52 .eyebrow{font-size:3px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(99,102,241,0.4);margin-bottom:20px;}
.t52 .items{display:flex;flex-direction:column;gap:18px;flex:1;}
.t52 .item{display:flex;gap:12px;align-items:flex-start;}
.t52 .num{width:21px;font-size:19px;font-weight:900;background:linear-gradient(180deg,#6366F1,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;flex-shrink:0;font-variant-numeric:tabular-nums;line-height:1;}
.t52 .item-content{padding-top:1px;}
.t52 .item-title{font-size:6px;font-weight:700;color:#fff;margin-bottom:2px;}
.t52 .item-desc{font-size:4px;color:rgba(255,255,255,0.3);line-height:1.45;}
`;

function buildT52(c: TemplateContent, w: number, h: number): string {
  const steps = c.steps || [];
  return wrapTT("t52", T52_CSS, `
    <div class="eyebrow">${esc(c.eyebrow || "")}</div>
    <div class="items">
      ${steps.map(s => `<div class="item">
        <div class="num">${esc(s.label)}</div>
        <div class="item-content">
          <div class="item-title">${esc(s.title)}</div>
          ${s.description ? `<div class="item-desc">${esc(s.description)}</div>` : ""}
        </div>
      </div>`).join("")}
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T81 — POV CARD (First person perspective, 432×768)
   ============================================================ */
const T81_CSS = `
.t81{background:#0A0A0A;display:flex;flex-direction:column;padding:60px 28px 32px;}
.t81 .pov-tag{font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#00D4FF;margin-bottom:24px;text-align:center;}
.t81 .context{font-size:10px;color:rgba(255,255,255,0.35);text-align:center;margin-bottom:16px;}
.t81 .statement{font-size:28px;font-weight:900;color:#fff;text-align:center;line-height:1.2;letter-spacing:-0.02em;flex:1;display:flex;align-items:center;justify-content:center;max-width:380px;margin:0 auto;}
.t81 .reaction{display:flex;gap:8px;justify-content:center;margin-top:auto;padding-top:20px;}
.t81 .react-pill{background:#1C1C1E;border-radius:14px;padding:6px 12px;font-size:8px;color:rgba(255,255,255,0.6);}
`;

function buildT81(c: TemplateContent, w: number, h: number): string {
  return wrapTT("t81", T81_CSS, `
    <div class="pov-tag">POV</div>
    <div class="context">${esc(c.eyebrow || "you just got your first tech interview")}</div>
    <div class="statement">${esc(c.headline)}</div>
    <div class="reaction">
      <div class="react-pill">😭 relatable</div>
      <div class="react-pill">💀 been there</div>
    </div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T82 — RATE MY RESUME (Scoring interface, 432×768)
   ============================================================ */
const T82_CSS = `
.t82{background:#08090E;display:flex;flex-direction:column;padding:60px 20px 32px;}
.t82 .header{text-align:center;margin-bottom:24px;}
.t82 .title{font-size:14px;font-weight:800;color:#fff;margin-bottom:4px;}
.t82 .sub{font-size:7px;color:rgba(255,255,255,0.3);}
.t82 .score-ring{width:80px;height:80px;margin:0 auto 20px;position:relative;}
.t82 .score-ring svg{width:80px;height:80px;overflow:visible;}
.t82 .score-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.t82 .score-num{font-size:24px;font-weight:900;color:#fff;}
.t82 .score-max{font-size:7px;color:rgba(255,255,255,0.3);}
.t82 .criteria{display:flex;flex-direction:column;gap:8px;flex:1;}
.t82 .crit{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#111118;border:1px solid #1E1F2E;border-radius:6px;}
.t82 .crit-label{font-size:7px;color:rgba(255,255,255,0.6);flex:1;}
.t82 .crit-bar{width:90px;height:5px;background:#1E1F2E;border-radius:3px;overflow:hidden;}
.t82 .crit-fill{height:100%;border-radius:3px;}
.t82 .fill-good{background:#34D399;}
.t82 .fill-ok{background:#F59E0B;}
.t82 .fill-bad{background:#EF4444;}
.t82 .crit-score{font-size:7px;font-weight:700;color:#fff;width:20px;text-align:right;font-variant-numeric:tabular-nums;}
.t82 .verdict{text-align:center;font-size:7px;font-weight:600;color:#A78BFA;margin-top:auto;padding-top:12px;}
`;

function buildT82(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  const score = c.score || 72;
  const dash = (score / 100) * 220;
  const fillCls = (v: number) => v >= 80 ? "fill-good" : v >= 50 ? "fill-ok" : "fill-bad";
  return wrapTT("t82", T82_CSS, `
    <div class="header">
      <div class="title">${esc(c.headline || "Rate My Resume")}</div>
      <div class="sub">${esc(c.subheadline || "AI-powered analysis")}</div>
    </div>
    <div class="score-ring">
      <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="#1E1F2E" stroke-width="4"/><circle cx="40" cy="40" r="35" fill="none" stroke="#6366F1" stroke-width="4" stroke-dasharray="${dash} 220" stroke-linecap="round" transform="rotate(-90 40 40)"/></svg>
      <div class="score-center"><div class="score-num">${score}</div><div class="score-max">/ 100</div></div>
    </div>
    <div class="criteria">
      ${bars.map(b => `<div class="crit">
        <div class="crit-label">${esc(b.label)}</div>
        <div class="crit-bar"><div class="crit-fill ${fillCls(b.value)}" style="width:${Math.min(b.value, 100)}%"></div></div>
        <div class="crit-score">${b.value}</div>
      </div>`).join("")}
    </div>
    <div class="verdict">${esc(c.cta || "Drop your resume for a free score ↓")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T83 — RED FLAG BINGO (Bingo card, 432×768)
   ============================================================ */
const T83_CSS = `
.t83{background:#0F0F0F;display:flex;flex-direction:column;padding:60px 16px 32px;align-items:center;}
.t83 .title{font-size:14px;font-weight:900;color:#fff;text-transform:uppercase;text-align:center;margin-bottom:6px;}
.t83 .sub{font-size:7px;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:20px;}
.t83 .bingo{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;width:100%;max-width:400px;flex:1;}
.t83 .cell{background:#1A1A1A;border:1px solid #2A2A2A;border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px 8px;font-size:8px;font-weight:600;color:rgba(255,255,255,0.7);line-height:1.3;}
.t83 .cell.hit{background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.25);color:#EF4444;}
.t83 .cell.free{background:rgba(99,102,241,0.12);border-color:rgba(99,102,241,0.25);color:#A78BFA;font-size:9px;font-weight:800;}
.t83 .cta{font-size:7px;color:rgba(255,255,255,0.3);text-align:center;margin-top:auto;padding-top:12px;}
`;

function buildT83(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapTT("t83", T83_CSS, `
    <div class="title">${esc(c.headline || "RED FLAG BINGO")}</div>
    <div class="sub">${esc(c.subheadline || "How many have you seen?")}</div>
    <div class="bingo">
      ${items.map((item, i) => {
        const cls = i === 4 ? "cell free" : item.highlighted ? "cell hit" : "cell";
        return `<div class="${cls}">${i === 4 ? "FREE" : esc(item.text)}</div>`;
      }).join("")}
    </div>
    <div class="cta">${esc(c.cta || "Tag someone who needs this 💀")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T84 — STORYTIME (Text overlay on gradient, 432×768)
   ============================================================ */
const T84_CSS = `
.t84{background:linear-gradient(170deg,#0F0F1A,#1a103a,#0F0F1A);display:flex;flex-direction:column;padding:60px 28px 32px;}
.t84 .tag{font-size:7px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(167,139,250,0.6);margin-bottom:auto;}
.t84 .hook{font-size:24px;font-weight:900;color:#fff;line-height:1.2;margin-bottom:20px;max-width:380px;}
.t84 .body{font-size:10px;color:rgba(255,255,255,0.55);line-height:1.65;flex:1;max-width:360px;}
.t84 .body strong{color:#fff;font-weight:700;}
.t84 .thread{font-size:7px;color:rgba(167,139,250,0.5);margin-top:auto;padding-top:16px;display:flex;align-items:center;gap:6px;}
.t84 .thread::before{content:'';width:16px;height:1px;background:rgba(167,139,250,0.3);}
`;

function buildT84(c: TemplateContent, w: number, h: number): string {
  const body = esc(c.body || "");
  const bold = c.bodyBold ? body.replace(esc(c.bodyBold), `<strong>${esc(c.bodyBold)}</strong>`) : body;
  return wrapTT("t84", T84_CSS, `
    <div class="tag">${esc(c.eyebrow || "STORYTIME")}</div>
    <div class="hook">${esc(c.headline)}</div>
    <div class="body">${bold}</div>
    <div class="thread">${esc(c.cta || "Read the full story ↓")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T85 — SPEED TIPS (Rapid-fire list + neon, 432×768)
   ============================================================ */
const T85_CSS = `
.t85{background:#0A0A0A;display:flex;flex-direction:column;padding:60px 24px 32px;}
.t85 .header{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
.t85 .flash{font-size:18px;}
.t85 .title{font-size:12px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:0.04em;}
.t85 .tips{display:flex;flex-direction:column;gap:14px;flex:1;}
.t85 .tip{display:flex;gap:12px;align-items:flex-start;}
.t85 .tip-num{font-size:18px;font-weight:900;color:#00FF88;text-shadow:0 0 12px rgba(0,255,136,0.3);flex-shrink:0;width:20px;text-align:right;font-variant-numeric:tabular-nums;}
.t85 .tip-text{font-size:9px;font-weight:600;color:rgba(255,255,255,0.85);line-height:1.45;padding-top:3px;}
.t85 .save{font-size:7px;color:rgba(0,255,136,0.4);text-align:center;margin-top:auto;padding-top:16px;}
`;

function buildT85(c: TemplateContent, w: number, h: number): string {
  const bullets = c.bullets || [];
  return wrapTT("t85", T85_CSS, `
    <div class="header">
      <div class="flash">⚡</div>
      <div class="title">${esc(c.headline)}</div>
    </div>
    <div class="tips">
      ${bullets.map((b, i) => `<div class="tip">
        <div class="tip-num">${i + 1}</div>
        <div class="tip-text">${esc(b)}</div>
      </div>`).join("")}
    </div>
    <div class="save">${esc(c.cta || "Save this for later →")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T86 — WOULD YOU RATHER (Two options split, 432×768)
   ============================================================ */
const T86_CSS = `
.t86{display:flex;flex-direction:column;width:432px;height:768px;position:relative;}
.t86 .q-header{position:absolute;top:0;left:0;right:0;padding:60px 28px 16px;text-align:center;z-index:3;}
.t86 .q-label{font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:10px;}
.t86 .q-text{font-size:14px;font-weight:800;color:#fff;}
.t86 .split{display:flex;flex:1;}
.t86 .opt{flex:1;display:flex;align-items:center;justify-content:center;padding:28px;text-align:center;}
.t86 .opt-a{background:linear-gradient(180deg,#6366F1,#4F46E5);}
.t86 .opt-b{background:linear-gradient(180deg,#FF006E,#DB0060);}
.t86 .opt-text{font-size:14px;font-weight:800;color:#fff;line-height:1.3;max-width:170px;}
.t86 .vs{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;background:#0A0A0A;border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#fff;z-index:3;}
.t86 .cta{position:absolute;bottom:32px;left:0;right:0;text-align:center;font-size:7px;color:rgba(255,255,255,0.4);z-index:3;}
`;

function buildT86(c: TemplateContent, w: number, h: number): string {
  const items = c.items || [];
  return wrapTT("t86", T86_CSS, `
    <div class="q-header">
      <div class="q-label">WOULD YOU RATHER</div>
      <div class="q-text">${esc(c.headline)}</div>
    </div>
    <div class="split">
      <div class="opt opt-a"><div class="opt-text">${esc(items[0]?.text || "Option A")}</div></div>
      <div class="opt opt-b"><div class="opt-text">${esc(items[1]?.text || "Option B")}</div></div>
    </div>
    <div class="vs">VS</div>
    <div class="cta">${esc(c.cta || "Comment your answer ↓")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T87 — RECRUITER DM (Chat UI variant, 432×768)
   ============================================================ */
const T87_CSS = `
.t87{background:#0A0A0A;display:flex;flex-direction:column;}
.t87 .top-bar{background:#1C1C1E;padding:18px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #2C2C2E;}
.t87 .notif{width:7px;height:7px;border-radius:50%;background:#FF3B30;flex-shrink:0;}
.t87 .top-title{font-size:9px;font-weight:600;color:rgba(255,255,255,0.8);}
.t87 .top-badge{font-size:7px;font-weight:700;color:#0A84FF;margin-left:auto;}
.t87 .msgs{flex:1;padding:16px 16px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
.t87 .dm{padding:12px 14px;border-radius:12px;max-width:82%;font-size:8px;line-height:1.5;}
.t87 .dm-recruiter{background:#1C1C1E;color:rgba(255,255,255,0.85);align-self:flex-start;border-bottom-left-radius:2px;}
.t87 .dm-you{background:#6366F1;color:#fff;align-self:flex-end;border-bottom-right-radius:2px;}
.t87 .dm-label{font-size:6px;font-weight:600;color:rgba(255,255,255,0.3);margin-bottom:4px;}
.t87 .dm-bold{font-weight:700;color:#fff;}
.t87 .reaction{font-size:7px;margin-top:12px;text-align:center;color:rgba(255,255,255,0.25);}
`;

function buildT87(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [];
  return wrapTT("t87", T87_CSS, `
    <div class="top-bar">
      <div class="notif"></div>
      <div class="top-title">${esc(c.headline || "LinkedIn DMs")}</div>
      <div class="top-badge">NEW</div>
    </div>
    <div class="msgs">
      ${tips.map((t, i) => `<div>
        <div class="dm-label">${i % 2 === 0 ? "Recruiter" : "You"}</div>
        <div class="dm ${i % 2 === 0 ? "dm-recruiter" : "dm-you"}">${esc(i % 2 === 0 ? t.title : t.description)}</div>
      </div>`).join("")}
    </div>
    <div class="reaction">${esc(c.cta || "What would YOU reply? Comment ↓")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   T88 — SALARY REVEAL (Dramatic number, 432×768)
   ============================================================ */
const T88_CSS = `
.t88{background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 28px;text-align:center;position:relative;}
.t88::before{content:'';position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;border-radius:50%;background:#6366F1;filter:blur(100px);opacity:0.08;}
.t88 .context{font-size:8px;color:rgba(255,255,255,0.35);letter-spacing:0.1em;margin-bottom:16px;position:relative;z-index:1;}
.t88 .role{font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);margin-bottom:28px;position:relative;z-index:1;}
.t88 .salary{font-size:64px;font-weight:900;color:#fff;letter-spacing:-0.04em;line-height:1;position:relative;z-index:1;}
.t88 .salary-sub{font-size:10px;color:rgba(255,255,255,0.3);margin-top:6px;position:relative;z-index:1;}
.t88 .range{display:flex;gap:24px;margin-top:28px;position:relative;z-index:1;}
.t88 .range-item{text-align:center;}
.t88 .range-val{font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);font-variant-numeric:tabular-nums;}
.t88 .range-label{font-size:6px;color:rgba(255,255,255,0.2);margin-top:3px;}
.t88 .cta{font-size:7px;color:rgba(255,255,255,0.25);margin-top:auto;position:relative;z-index:1;}
`;

function buildT88(c: TemplateContent, w: number, h: number): string {
  const bars = c.bars || [];
  return wrapTT("t88", T88_CSS, `
    <div class="context">${esc(c.eyebrow || "2026 SALARY DATA")}</div>
    <div class="role">${esc(c.subheadline || "")}</div>
    <div class="salary">${esc(c.stat?.value || c.headline)}</div>
    <div class="salary-sub">${esc(c.stat?.label || "average base salary")}</div>
    <div class="range">
      ${bars.map(b => `<div class="range-item"><div class="range-val">${esc(String(b.value))}</div><div class="range-label">${esc(b.label)}</div></div>`).join("")}
    </div>
    <div class="cta">${esc(c.cta || "Is yours above or below? Comment ↓")}</div>
    ${watermark()}
  `, 432, 768, w, h);
}

/* ============================================================
   ROUTER
   ============================================================ */
export function buildTikTokTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number
): string {
  switch (templateId) {
    case "t16": return buildT16(content, width, height);
    case "t17": return buildT17(content, width, height);
    case "t18": return buildT18(content, width, height);
    case "t19": return buildT19(content, width, height);
    case "t20": return buildT20(content, width, height);
    case "t21": return buildT21(content, width, height);
    case "t28": return buildT28(content, width, height);
    case "t29": return buildT29(content, width, height);
    case "t30": return buildT30(content, width, height);
    case "t31": return buildT31(content, width, height);
    case "t32": return buildT32(content, width, height);
    case "t33": return buildT33(content, width, height);
    case "t40": return buildT40(content, width, height);
    case "t41": return buildT41(content, width, height);
    case "t42": return buildT42(content, width, height);
    case "t43": return buildT43(content, width, height);
    case "t44": return buildT44(content, width, height);
    case "t49": return buildT49(content, width, height);
    case "t50": return buildT50(content, width, height);
    case "t51": return buildT51(content, width, height);
    case "t52": return buildT52(content, width, height);
    case "t81": return buildT81(content, width, height);
    case "t82": return buildT82(content, width, height);
    case "t83": return buildT83(content, width, height);
    case "t84": return buildT84(content, width, height);
    case "t85": return buildT85(content, width, height);
    case "t86": return buildT86(content, width, height);
    case "t87": return buildT87(content, width, height);
    case "t88": return buildT88(content, width, height);
    default:
      return buildT19(content, width, height);
  }
}
