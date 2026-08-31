/* ============================================================
   DESIGNER TEMPLATES — 19 premium multi-platform designs
   ============================================================
   # T187-T193, T194, T198-T202: Designer LinkedIn (4:5 — 1080×1350)
   # T203-T205: Designer TikTok (9:16 — 1080×1920)
   # T206-T208: Designer Instagram (4:5 — 1080×1350)
   #
   # These are high-polish, content-rich marketing templates
   # using Bricolage Grotesque / DM Sans / JetBrains Mono fonts
   # (loaded via Google Fonts in Puppeteer).
   #
   # T187: The Number — Hero stat with mini-metric grid
   # T188: The Analysis — Light data dashboard card
   # T189: The Playbook — Gradient numbered tips
   # T190: The Shift — Before/After comparison
   # T191: The Signal — Gradient insight + 3-stat bar
   # T192: The Proof — Dark social proof + quote
   # T193: The Matrix — Light 2x2 framework quadrant
   # T194: The Funnel — Conversion funnel with drop-off
   # T198: The Spotlight — Provocative one-liner
   # T199: The Calendar — Weekly heatmap grid
   # T200: The Roadmap — Milestone journey path
   # T201: The Receipt — Invoice-style cost breakdown
   # T202: The Radar — Spider chart skill assessment
   # T203: The Ticker — Breaking news alert (TikTok)
   # T204: The Verdict — Courtroom ruling card (TikTok)
   # T205: The Blueprint — Architectural wireframe (TikTok)
   # T206: The Meter — Speedometer gauge (Instagram)
   # T207: The Notification — Phone notification stack (Instagram)
   # T208: The Label — Nutrition label style (Instagram)
   #
   # LinkedIn/Instagram preview at 540×675 → scale 2× to 1080×1350
   # TikTok preview at 540×960 → scale 2× to 1080×1920
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, FONT_STACK, MONO_STACK, esc } from "./shared";

// # All designer template IDs — LinkedIn (T187-T202), TikTok (T203-T205), Instagram (T206-T208)
export const DESIGNER_IDS: TemplateId[] = [
  "t187","t188","t189","t190","t191","t192","t193",
  "t194","t198","t199","t200","t201","t202",
  "t203","t204","t205",
  "t206","t207","t208",
];

// # Preview dimensions for LinkedIn/Instagram 4:5 → 2× scale
const PW = 540, PH = 675;
// # Preview dimensions for TikTok 9:16 → 2× scale
const TK_PW = 540, TK_PH = 960;

// # Google Fonts link for designer templates (Bricolage Grotesque, DM Sans, JetBrains Mono)
const GFONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

// # Font stacks for designer templates
const DISP = `'Bricolage Grotesque', ${FONT_STACK}`;
const BODY = `'DM Sans', ${FONT_STACK}`;
const MONO = `'JetBrains Mono', ${MONO_STACK}`;

// # Flexible wrap — accepts custom preview dimensions for multi-platform support
function wrapAt(css: string, body: string, w: number, h: number, pw: number, ph: number): string {
  const sc = w / pw;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${GFONTS}<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:#000;}
body{font-family:${BODY};}
.sw{width:${pw}px;height:${ph}px;transform:scale(${sc});transform-origin:top left;}
em{font-style:normal;}
${css}
</style></head><body>
<div class="sw">${body}</div>
</body></html>`;
}

// # Wrap template body with page scaffold, fonts, and scaling (LinkedIn/Instagram 4:5)
function wrap(css: string, body: string, w: number, h: number): string {
  return wrapAt(css, body, w, h, PW, PH);
}

// # Footer — brand strip with logo, name, and domain
function footer(mode: "dark" | "light" | "gradient"): string {
  const bgC = mode === "light" ? "rgba(99,102,241,.08)" : "rgba(99,102,241,.12)";
  const nameC = mode === "light" ? "#999" : "rgba(255,255,255,.25)";
  const urlC = mode === "light" ? "#C0BDB5" : "rgba(255,255,255,.12)";
  return `<div style="display:flex;align-items:center;gap:8px;padding:12px 18px 14px;">
    <div style="width:18px;height:18px;border-radius:4px;background:${bgC};display:flex;align-items:center;justify-content:center;">
      <img src="${LOGO_DATA_URI}" alt="JP" style="width:10px;height:10px;border-radius:2px;">
    </div>
    <span style="font-size:10px;font-weight:700;letter-spacing:-.01em;color:${nameC};">JobPilot AI</span>
    <span style="font-size:9px;font-family:${MONO};margin-left:auto;letter-spacing:.02em;color:${urlC};">jobpilotai.co</span>
  </div>`;
}

// # Eyebrow with dash prefix
function eyebrow(text: string, color: string): string {
  return `<div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};display:flex;align-items:center;gap:6px;margin-bottom:16px;">
    <span style="width:14px;height:2px;background:${color};border-radius:1px;display:inline-block;"></span>${esc(text)}</div>`;
}

/* ============================================================
   T187 — THE NUMBER (Dark, hero stat + mini-metrics grid)
   ============================================================ */
function t187(c: TemplateContent, w: number, h: number): string {
  // # Extract stat from content or use defaults
  const statValue = c.stat?.value || "6.2";
  const statLabel = c.stat?.label || "seconds";
  const bodyText = c.body || "The average time a recruiter spends on your resume before deciding. In that narrow window, your formatting and keywords determine everything.";
  const bodyBold = c.bodyBold || "In that narrow window, your formatting and keywords determine everything.";
  const metrics = c.items || [
    { text: "Rejected by ATS before human review", value: "73%" },
    { text: "More interviews with optimization", value: "3.2×", highlighted: true },
    { text: "Average match score after", value: "89%" },
  ];
  const cta = c.cta || "See your resume score →";

  // # Escape body text and bold the phrase
  let safeBody = esc(bodyText);
  const safeBold = esc(bodyBold);
  if (safeBody.includes(safeBold)) {
    safeBody = safeBody.replace(safeBold, `<strong style="color:rgba(232,229,221,.65);font-weight:600;">${safeBold}</strong>`);
  }

  const css = `
.d187{width:${PW}px;height:${PH}px;background:#0B0D14;background-image:radial-gradient(circle at 1px 1px,rgba(99,102,241,.04) 1px,transparent 0);background-size:20px 20px;position:relative;overflow:hidden;display:flex;flex-direction:column;}
.d187-bar{position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,#6366F1,#A78BFA 60%,#6366F1);box-shadow:0 0 12px rgba(99,102,241,.25);}
.d187 .bd{display:flex;flex-direction:column;padding:22px 18px 8px 22px;flex:1;}
.d187-num{font-family:${DISP};font-size:76px;font-weight:800;line-height:.85;letter-spacing:-.05em;background:linear-gradient(135deg,#6366F1,#A78BFA 60%,#C4B5FD);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.d187-unit{font-family:${DISP};font-size:24px;font-weight:400;color:rgba(232,229,221,.35);margin-top:2px;}
.d187-desc{font-size:11.5px;line-height:1.6;color:rgba(232,229,221,.35);max-width:300px;margin-top:10px;}
.d187-line{width:36px;height:2.5px;background:linear-gradient(90deg,#6366F1,#A78BFA);border-radius:1px;margin:10px 0;}
.d187-ms{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.d187-m{background:linear-gradient(145deg,#12141D,#111320);border:1px solid #1C1E2A;border-radius:8px;padding:9px 8px;}
.d187-v{font-family:${DISP};font-size:19px;font-weight:800;color:#E8E5DD;font-variant-numeric:tabular-nums;}
.d187-v.ac{color:#A78BFA;}
.d187-l{font-size:7.5px;line-height:1.3;margin-top:2px;color:rgba(232,229,221,.25);}
.d187-cta{font-size:11px;font-weight:700;color:#818CF8;letter-spacing:.02em;margin-top:10px;}`;

  const metricsHtml = metrics.map(m => {
    const acClass = m.highlighted ? ' ac' : '';
    return `<div class="d187-m"><div class="d187-v${acClass}">${esc(m.value || "")}</div><div class="d187-l">${esc(m.text)}</div></div>`;
  }).join("");

  const body = `<div class="d187">
    <div class="d187-bar"></div>
    <div class="bd">
      ${eyebrow(c.eyebrow || "Career Insight", "rgba(99,102,241,.45)")}
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
        <div class="d187-num">${esc(statValue)}</div>
        <div class="d187-unit">${esc(statLabel)}</div>
        <p class="d187-desc">${safeBody}</p>
        <div class="d187-line"></div>
      </div>
      <div class="d187-ms">${metricsHtml}</div>
      <div class="d187-cta">${esc(cta)}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T188 — THE ANALYSIS (Light dashboard with score + bars)
   ============================================================ */
function t188(c: TemplateContent, w: number, h: number): string {
  const score = c.score || 91;
  const subheadline = c.subheadline || "Senior Product Manager at Stripe";
  const bars = c.bars || [
    { label: "Keywords", value: 94 },
    { label: "Formatting", value: 88 },
    { label: "Impact Verbs", value: 96 },
    { label: "Structure", value: 91 },
    { label: "Density", value: 87 },
  ];
  const tags = c.tags || ["Product Strategy", "Data Analysis", "Stakeholder Mgmt", "User Research", "Agile"];
  const cta = c.cta || "Optimize Resume →";

  const css = `
.d188{width:${PW}px;height:${PH}px;background:#F5F2EC;display:flex;flex-direction:column;}
.d188 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d188-tt{font-family:${DISP};font-size:24px;font-weight:700;color:#1A1A1A;letter-spacing:-.03em;line-height:1.1;}
.d188-sub{font-size:11px;color:#8A8A8A;margin-top:2px;margin-bottom:10px;}
.d188-pn{background:#fff;border:1px solid #E8E4DD;border-radius:10px;padding:14px 14px 12px;box-shadow:0 1px 3px rgba(0,0,0,.04);flex:1;display:flex;flex-direction:column;}
.d188-sr{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #F0EEEA;}
.d188-sn{font-family:${DISP};font-size:32px;font-weight:800;color:#6366F1;font-variant-numeric:tabular-nums;}
.d188-g{height:5px;background:#F0EEEA;border-radius:3px;overflow:hidden;}
.d188-gf{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366F1,#A78BFA);}
.d188-cs{display:flex;flex-direction:column;gap:7px;flex:1;}
.d188-c{display:flex;align-items:center;gap:8px;}
.d188-cn{font-size:10px;font-weight:500;color:#555;width:72px;flex-shrink:0;}
.d188-cb{flex:1;height:4px;background:#F0EEEA;border-radius:2px;overflow:hidden;}
.d188-cf{height:100%;border-radius:2px;}
.d188-cf.hi{background:linear-gradient(90deg,#6366F1,#818CF8);}.d188-cf.md{background:#A78BFA;}
.d188-cv{font-family:${MONO};font-size:9px;font-weight:500;color:#1A1A1A;width:28px;text-align:right;font-variant-numeric:tabular-nums;}
.d188-sk{display:flex;flex-wrap:wrap;gap:4px;margin-top:auto;padding-top:8px;border-top:1px solid #F0EEEA;}
.d188-s{font-size:8px;font-weight:600;padding:3px 6px;border-radius:4px;background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;display:flex;align-items:center;gap:3px;}
.d188-s i{font-style:normal;font-size:7px;}
.d188-btn{margin-top:8px;text-align:center;background:linear-gradient(135deg,#6366F1,#7C3AED);color:#fff;padding:8px;border-radius:7px;font-size:10px;font-weight:700;letter-spacing:.02em;box-shadow:0 2px 8px rgba(99,102,241,.25);}`;

  const barsHtml = bars.map(b => {
    const cls = b.value >= 90 ? "hi" : "md";
    return `<div class="d188-c"><span class="d188-cn">${esc(b.label)}</span><div class="d188-cb"><div class="d188-cf ${cls}" style="width:${b.value}%"></div></div><span class="d188-cv">${b.value}%</span></div>`;
  }).join("");

  const tagsHtml = tags.map(t => `<span class="d188-s"><i>✓</i> ${esc(t)}</span>`).join("");

  const body = `<div class="d188">
    <div class="bd">
      ${eyebrow(c.eyebrow || "AI-Powered", "#6366F1")}
      <h2 class="d188-tt">${esc(c.headline || "Your Resume, Decoded")}</h2>
      <p class="d188-sub">${esc(subheadline)}</p>
      <div class="d188-pn">
        <div class="d188-sr">
          <div class="d188-sn">${score}</div>
          <div style="flex:1;">
            <div style="font-size:9px;font-weight:600;color:#1A1A1A;margin-bottom:4px;">ATS Compatibility Score</div>
            <div class="d188-g"><div class="d188-gf" style="width:${score}%"></div></div>
          </div>
        </div>
        <div class="d188-cs">${barsHtml}</div>
        <div class="d188-sk">${tagsHtml}</div>
        <div class="d188-btn">${esc(cta)}</div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T189 — THE PLAYBOOK (Gradient, numbered tip cards)
   ============================================================ */
function t189(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [
    { title: "Generic objectives.", description: "Replace with a tailored professional summary that mirrors the role." },
    { title: "Listing duties.", description: "Quantify your impact — numbers, percentages, and measurable outcomes." },
    { title: "One-size resume.", description: "Customize keywords and emphasis for each application you submit." },
    { title: "Missing keywords.", description: "Mirror the exact language and terminology from the job description." },
    { title: "Cluttered formatting.", description: "Use clean, ATS-friendly structure with consistent hierarchy." },
  ];
  const cta = c.cta || "Fix all 5 in under 2 minutes with AI →";

  const css = `
.d189{width:${PW}px;height:${PH}px;background:linear-gradient(145deg,#1E1B4B,#312E81 50%,#3B1F7E);color:#fff;position:relative;overflow:hidden;}
.d189::before,.d189::after{content:'';position:absolute;border-radius:50%;pointer-events:none;}
.d189::before{width:200px;height:200px;top:-50px;right:-40px;background:radial-gradient(circle,rgba(167,139,250,.15),transparent 70%);}
.d189::after{width:160px;height:160px;bottom:40px;left:-40px;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 70%);}
.d189 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d189-tt{font-family:${DISP};font-size:21px;font-weight:700;letter-spacing:-.03em;line-height:1.15;margin-bottom:10px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08);}
.d189-ts{display:flex;flex-direction:column;gap:6px;flex:1;}
.d189-t{display:flex;gap:9px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 11px;box-shadow:0 1px 3px rgba(0,0,0,.08);}
.d189-tn{font-family:${DISP};font-size:13px;font-weight:800;color:#A5B4FC;min-width:18px;font-variant-numeric:tabular-nums;}
.d189-tx{font-size:10px;line-height:1.4;color:rgba(255,255,255,.6);}
.d189-tx strong{color:#fff;font-weight:600;}
.d189-cta{margin-top:10px;font-size:10px;font-weight:700;color:#C4B5FD;letter-spacing:.01em;text-align:center;}`;

  const tipsHtml = tips.map((tip, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `<div class="d189-t"><span class="d189-tn">${num}</span><p class="d189-tx"><strong>${esc(tip.title)}</strong> ${esc(tip.description)}</p></div>`;
  }).join("");

  const body = `<div class="d189">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Expert Strategies", "#A5B4FC")}
      <h2 class="d189-tt">${esc(c.headline || "5 Resume Mistakes Costing You Interviews")}</h2>
      <div class="d189-ts">${tipsHtml}</div>
      <div class="d189-cta">${esc(cta)}</div>
    </div>
    ${footer("gradient")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T190 — THE SHIFT (Dark, before/after comparison)
   ============================================================ */
function t190(c: TemplateContent, w: number, h: number): string {
  const beforeText = c.beforeText || "34%";
  const afterText = c.afterText || "92%";
  const beforeItems = c.bullets?.slice(0, 4) || ["Missing keywords", "Weak action verbs", "No quantified metrics", "Poor formatting"];
  const afterItems = c.tags?.slice(0, 4) || ["Keywords matched", "Impact verbs", "Quantified results", "Clean structure"];
  const cta = c.cta || "2.7× more interview callbacks";

  const css = `
.d190{width:${PW}px;height:${PH}px;background:#0B0D14;color:#E8E5DD;display:flex;flex-direction:column;}
.d190 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d190-tt{font-family:${DISP};font-size:22px;font-weight:700;letter-spacing:-.03em;line-height:1.1;margin-bottom:14px;}
.d190-ps{display:grid;grid-template-columns:1fr 1fr;gap:7px;flex:1;margin-bottom:10px;}
.d190-p{border-radius:7px;padding:10px 9px;display:flex;flex-direction:column;}
.d190-p.bf{background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);box-shadow:inset 0 1px 0 rgba(239,68,68,.06);}
.d190-p.af{background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.15);box-shadow:inset 0 1px 0 rgba(52,211,153,.06);}
.d190-bg{font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 5px;border-radius:3px;width:fit-content;margin-bottom:6px;}
.d190-p.bf .d190-bg{background:rgba(239,68,68,.15);color:#F87171;}
.d190-p.af .d190-bg{background:rgba(52,211,153,.15);color:#34D399;}
.d190-sc{font-family:${DISP};font-size:32px;font-weight:800;font-variant-numeric:tabular-nums;line-height:1;}
.d190-p.bf .d190-sc{color:#F87171;}.d190-p.af .d190-sc{color:#34D399;}
.d190-sl{font-size:8px;color:rgba(232,229,221,.35);margin-bottom:8px;}
.d190-is{display:flex;flex-direction:column;gap:4px;flex:1;}
.d190-i{display:flex;align-items:center;gap:4px;font-size:9px;}
.d190-ic{font-size:8px;}
.d190-p.bf .d190-ic{color:#F87171;}.d190-p.af .d190-ic{color:#34D399;}
.d190-p.bf .d190-i{color:rgba(232,229,221,.3);}.d190-p.af .d190-i{color:rgba(232,229,221,.6);}
.d190-r{text-align:center;font-size:12px;font-weight:700;color:#C4B5FD;background:rgba(167,139,250,.08);padding:6px 12px;border-radius:6px;border:1px solid rgba(167,139,250,.1);}`;

  const beforeHtml = beforeItems.map(item =>
    `<div class="d190-i"><span class="d190-ic">✗</span> ${esc(item)}</div>`
  ).join("");
  const afterHtml = afterItems.map(item =>
    `<div class="d190-i"><span class="d190-ic">✓</span> ${esc(item)}</div>`
  ).join("");

  const body = `<div class="d190">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Transformation", "rgba(99,102,241,.45)")}
      <h2 class="d190-tt">${esc(c.headline || "Same Resume. Different Approach.")}</h2>
      <div class="d190-ps">
        <div class="d190-p bf">
          <div class="d190-bg">Before</div>
          <div class="d190-sc">${esc(beforeText)}</div>
          <div class="d190-sl">ATS Score</div>
          <div class="d190-is">${beforeHtml}</div>
        </div>
        <div class="d190-p af">
          <div class="d190-bg">After JobPilot</div>
          <div class="d190-sc">${esc(afterText)}</div>
          <div class="d190-sl">ATS Score</div>
          <div class="d190-is">${afterHtml}</div>
        </div>
      </div>
      <div class="d190-r">${esc(cta)}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T191 — THE SIGNAL (Gradient, insight statement + 3 stats)
   ============================================================ */
function t191(c: TemplateContent, w: number, h: number): string {
  const bodyText = c.body || "Most qualified candidates never get past automated screening. Your skills aren't the problem — your formatting is.";
  const bodyBold = c.bodyBold || "Your skills aren't the problem";
  const stats = c.items || [
    { text: "ATS filtered", value: "75%" },
    { text: "Lack keywords", value: "40%" },
    { text: "Scan time", value: "6 sec" },
  ];

  // # Escape and bold the body text
  let safeBody = esc(bodyText);
  const safeBold = esc(bodyBold);
  if (safeBody.includes(safeBold)) {
    safeBody = safeBody.replace(safeBold, `<strong style="color:rgba(255,255,255,.8);font-weight:600;">${safeBold}</strong>`);
  }

  // # Handle headline with highlight
  let headlineHtml = esc(c.headline || "Your resume isn't bad. It's just invisible to the algorithm.");
  const hlWord = esc(c.headlineHighlight || "invisible");
  if (headlineHtml.includes(hlWord)) {
    headlineHtml = headlineHtml.replace(hlWord, `<em style="color:#C4B5FD;">${hlWord}</em>`);
  }

  const css = `
.d191{width:${PW}px;height:${PH}px;background:linear-gradient(145deg,#1E1B4B,#312E81 50%,#3B1F7E);color:#fff;position:relative;overflow:hidden;}
.d191::before,.d191::after{content:'';position:absolute;border-radius:50%;pointer-events:none;}
.d191::before{width:240px;height:240px;top:-80px;right:-60px;background:radial-gradient(circle,rgba(167,139,250,.14),transparent 70%);}
.d191::after{width:180px;height:180px;bottom:-20px;left:-50px;background:radial-gradient(circle,rgba(99,102,241,.1),transparent 70%);}
.d191 .bd{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;padding:28px 20px 16px;flex:1;}
.d191-bg{display:inline-flex;align-items:center;gap:5px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.15);border-radius:20px;padding:3px 10px 3px 7px;margin-bottom:18px;width:fit-content;}
.d191-bd{width:5px;height:5px;border-radius:50%;background:#A78BFA;}
.d191-bt{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C4B5FD;}
.d191-st{font-family:${DISP};font-size:27px;font-weight:700;line-height:1.15;letter-spacing:-.03em;}
.d191-rl{width:40px;height:2px;background:linear-gradient(90deg,#A78BFA,rgba(167,139,250,.2));border-radius:1px;margin:12px 0;}
.d191-cx{font-size:12px;line-height:1.55;color:rgba(255,255,255,.45);max-width:280px;}
.d191-ss{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:20px;}
.d191-sv{text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:8px 4px;}
.d191-vl{font-family:${DISP};font-size:18px;font-weight:700;font-variant-numeric:tabular-nums;}
.d191-lb{font-size:7.5px;color:rgba(255,255,255,.35);margin-top:1px;}`;

  const statsHtml = stats.map(s =>
    `<div class="d191-sv"><div class="d191-vl">${esc(s.value || "")}</div><div class="d191-lb">${esc(s.text)}</div></div>`
  ).join("");

  const body = `<div class="d191">
    <div class="bd">
      <div class="d191-bg"><div class="d191-bd"></div><span class="d191-bt">${esc(c.eyebrow || "Hiring Truth")}</span></div>
      <h2 class="d191-st">${headlineHtml}</h2>
      <div class="d191-rl"></div>
      <p class="d191-cx">${safeBody}</p>
      <div class="d191-ss">${statsHtml}</div>
    </div>
    ${footer("gradient")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T192 — THE PROOF (Dark, social proof + metric grid + quote)
   ============================================================ */
function t192(c: TemplateContent, w: number, h: number): string {
  const heroValue = c.stat?.value || "24,000+";
  const heroLabel = c.stat?.label || "resumes optimized and counting";
  const gridItems = c.bars || [
    { label: "Avg match score", value: 91, color: "i" },
    { label: "More interviews", value: 78, color: "v" },
    { label: "Countries served", value: 65, color: "g" },
    { label: "User rating", value: 96, color: "a" },
  ];
  const gridValues = c.items || [
    { text: "Avg match score", value: "91%" },
    { text: "More interviews", value: "3.2×" },
    { text: "Countries served", value: "47" },
    { text: "User rating", value: "4.8★" },
  ];
  const quote = c.body || "Got 3 interviews in my first week after optimizing. The keyword matching alone was worth it.";
  const quoteAuthor = c.subheadline || "Sarah K. · Product Manager at Shopify";

  const css = `
.d192{width:${PW}px;height:${PH}px;background:#0B0D14;background-image:radial-gradient(circle at 1px 1px,rgba(99,102,241,.04) 1px,transparent 0);background-size:20px 20px;color:#E8E5DD;display:flex;flex-direction:column;}
.d192 .bd{display:flex;flex-direction:column;padding:22px 18px 16px;flex:1;}
.d192-hn{font-family:${DISP};font-size:56px;font-weight:800;line-height:.95;letter-spacing:-.04em;background:linear-gradient(135deg,#6366F1,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.d192-hl{font-size:11px;color:rgba(232,229,221,.35);margin-top:2px;}
.d192-gr{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:12px 0;}
.d192-cd{background:linear-gradient(145deg,#12141D,#111320);border:1px solid #1C1E2A;border-radius:8px;padding:10px 10px 8px;}
.d192-cv{font-family:${DISP};font-size:24px;font-weight:800;font-variant-numeric:tabular-nums;color:#E8E5DD;}
.d192-cv.ac{color:#A78BFA;}
.d192-cl{font-size:8px;color:rgba(232,229,221,.3);margin-top:2px;}
.d192-cb{height:3px;background:#1C1E2A;border-radius:2px;margin-top:6px;overflow:hidden;}
.d192-cf{height:100%;border-radius:2px;}
.d192-cf.i{background:linear-gradient(90deg,#6366F1,#818CF8);}
.d192-cf.v{background:linear-gradient(90deg,#8B5CF6,#A78BFA);}
.d192-cf.g{background:linear-gradient(90deg,#22C55E,#34D399);}
.d192-cf.a{background:linear-gradient(90deg,#F59E0B,#FBBF24);}
.d192-q{margin-top:auto;margin-bottom:6px;background:linear-gradient(135deg,#12141D,#141625);border-left:3px solid #818CF8;border-radius:0 7px 7px 0;padding:10px 12px;}
.d192-qt{font-size:11px;font-weight:500;font-style:italic;line-height:1.5;color:rgba(232,229,221,.6);}
.d192-qa{font-size:8px;color:rgba(232,229,221,.3);margin-top:5px;}
.d192-qa strong{color:rgba(232,229,221,.5);font-weight:600;}`;

  const gridHtml = gridItems.map((item, i) => {
    const val = gridValues[i];
    const acClass = (i === 0 || i === 3) ? ' ac' : '';
    const colorClass = item.color || "i";
    return `<div class="d192-cd"><div class="d192-cv${acClass}">${esc(val?.value || String(item.value))}</div><div class="d192-cl">${esc(val?.text || item.label)}</div><div class="d192-cb"><div class="d192-cf ${colorClass}" style="width:${item.value}%"></div></div></div>`;
  }).join("");

  const body = `<div class="d192">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Social Proof", "rgba(99,102,241,.45)")}
      <div>
        <div class="d192-hn">${esc(heroValue)}</div>
        <div class="d192-hl">${esc(heroLabel)}</div>
      </div>
      <div class="d192-gr">${gridHtml}</div>
      <div class="d192-q">
        <p class="d192-qt">"${esc(quote)}"</p>
        <div class="d192-qa"><strong>${esc(quoteAuthor.split(" · ")[0])}</strong> · ${esc(quoteAuthor.split(" · ").slice(1).join(" · ") || "")}</div>
      </div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T193 — THE MATRIX (Light, 2x2 framework quadrant)
   ============================================================ */
function t193(c: TemplateContent, w: number, h: number): string {
  // # 4 quadrant cells with titles, descriptions, and category tags
  const cells = c.tips || [
    { title: "Keyword Alignment", description: "Match 80%+ of job description keywords to pass ATS filters" },
    { title: "Impact Metrics", description: "Quantify every achievement with numbers, percentages, revenue" },
    { title: "Clean Structure", description: "Consistent formatting, clear hierarchy, proper section order" },
    { title: "Role Tailoring", description: "Customize summary and skills for each application you send" },
  ];
  // # Tags for each cell — defaults match the 4 pillars concept
  const cellTags = c.tags || ["ATS Critical", "High Impact", "Readability", "Conversion"];
  // # 4 gradient pairs for top-border accents
  const gradients = [
    "linear-gradient(90deg,#6366F1,#818CF8)",
    "linear-gradient(90deg,#A78BFA,#C4B5FD)",
    "linear-gradient(90deg,#34D399,#6EE7B7)",
    "linear-gradient(90deg,#F472B6,#F9A8D4)",
  ];

  const css = `
.d193{width:${PW}px;height:${PH}px;background:#F8F7F4;display:flex;flex-direction:column;}
.d193 .bd{display:flex;flex-direction:column;padding:22px 20px 8px;flex:1;}
.d193-tt{font-family:${DISP};font-size:20px;font-weight:800;color:#1A1A1A;letter-spacing:-.03em;line-height:1.12;margin-bottom:6px;}
.d193-sub{font-size:9.5px;color:#888;margin-bottom:16px;}
.d193-gr{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:1;}
.d193-c{border-radius:9px;padding:12px 12px 10px;display:flex;flex-direction:column;position:relative;overflow:hidden;background:#FEFEFE;border:1px solid #EEECEA;}
.d193-c::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;border-radius:2px 2px 0 0;}
.d193-c.c0::before{background:${gradients[0]};}
.d193-c.c1::before{background:${gradients[1]};}
.d193-c.c2::before{background:${gradients[2]};}
.d193-c.c3::before{background:${gradients[3]};}
.d193-cn{font-family:${DISP};font-size:10px;font-weight:800;color:rgba(0,0,0,.12);margin-bottom:6px;}
.d193-ct{font-family:${DISP};font-size:12px;font-weight:700;color:#1A1A1A;line-height:1.2;margin-bottom:5px;}
.d193-cd{font-size:9px;line-height:1.45;color:#777;flex:1;}
.d193-tag{display:inline-flex;align-items:center;margin-top:6px;font-size:7px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border-radius:3px;background:rgba(99,102,241,.06);color:#6366F1;}`;

  const cellsHtml = cells.slice(0, 4).map((cell, i) => {
    const num = String(i + 1).padStart(2, "0");
    const tag = cellTags[i] || "";
    return `<div class="d193-c c${i}">
      <div class="d193-cn">${num}</div>
      <h3 class="d193-ct">${esc(cell.title)}</h3>
      <p class="d193-cd">${esc(cell.description)}</p>
      ${tag ? `<span class="d193-tag">${esc(tag)}</span>` : ""}
    </div>`;
  }).join("");

  const body = `<div class="d193">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Strategic Framework", "#6366F1")}
      <h2 class="d193-tt">${esc(c.headline || "The 4 Pillars of a High-Converting Resume")}</h2>
      <p class="d193-sub">${esc(c.subheadline || "Each pillar directly impacts your ATS score and recruiter engagement")}</p>
      <div class="d193-gr">${cellsHtml}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T194 — THE FUNNEL (Dark, application pipeline drop-off)
   ============================================================ */
function t194(c: TemplateContent, w: number, h: number): string {
  // # 5 funnel stages narrowing from top to bottom
  const stages = c.items || [
    { text: "Applications Sent", value: "1,000" },
    { text: "Passed ATS Screening", value: "270" },
    { text: "Reviewed by Recruiter", value: "85" },
    { text: "Phone Screen Invited", value: "24" },
    { text: "Final Interview", value: "6" },
  ];

  // # Width percentages for funnel bars (widest→narrowest)
  const widths = [100, 72, 48, 30, 18];
  // # Gradient colors per bar
  const fills = [
    "linear-gradient(90deg,#6366F1,#818CF8)",
    "linear-gradient(90deg,#7C72F6,#9B8AFB)",
    "linear-gradient(90deg,#8B7EF8,#A78BFA)",
    "linear-gradient(90deg,#9F8FFB,#C4B5FD)",
    "linear-gradient(90deg,#B5A5FD,#DDD6FE)",
  ];

  const css = `
.d194{width:${PW}px;height:${PH}px;background:#08090E;position:relative;overflow:hidden;display:flex;flex-direction:column;}
.d194::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(99,102,241,.08),transparent 70%);pointer-events:none;}
.d194 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d194-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.12;margin-bottom:6px;}
.d194-sub{font-size:9.5px;color:rgba(232,229,221,.3);margin-bottom:18px;}
.d194-fn{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;justify-content:center;}
.d194-st{display:flex;align-items:center;gap:8px;width:100%;}
.d194-num{font-family:${DISP};font-size:16px;font-weight:800;color:#E8E5DD;width:50px;text-align:right;font-variant-numeric:tabular-nums;}
.d194-bar{height:28px;border-radius:6px;display:flex;align-items:center;justify-content:flex-end;padding:0 10px;transition:width .3s;}
.d194-lab{font-size:8.5px;font-weight:600;color:rgba(255,255,255,.7);white-space:nowrap;}
.d194-drop{font-family:${MONO};font-size:7px;color:rgba(232,229,221,.2);text-align:center;margin:0 0 0 58px;}`;

  const stagesHtml = stages.slice(0, 5).map((s, i) => {
    const w = widths[i] || 18;
    const dropPct = i > 0 ? Math.round((1 - parseInt(String(stages[i]?.value || "0").replace(/,/g, "")) / parseInt(String(stages[i - 1]?.value || "1").replace(/,/g, ""))) * 100) : 0;
    const dropHtml = i > 0 ? `<div class="d194-drop">${dropPct}% drop-off</div>` : "";
    return `${dropHtml}<div class="d194-st">
      <div class="d194-num">${esc(s.value || "")}</div>
      <div class="d194-bar" style="width:${w}%;background:${fills[i]};">
        <span class="d194-lab">${esc(s.text)}</span>
      </div>
    </div>`;
  }).join("");

  const body = `<div class="d194">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Application Pipeline", "rgba(99,102,241,.45)")}
      <h2 class="d194-tt">${esc(c.headline || "Where 99.4% of Candidates Drop Off")}</h2>
      <p class="d194-sub">${esc(c.subheadline || "Average conversion through a typical hiring funnel")}</p>
      <div class="d194-fn">${stagesHtml}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T198 — THE SPOTLIGHT (Gradient, dramatic one-liner)
   ============================================================ */
function t198(c: TemplateContent, w: number, h: number): string {
  // # Build headline with gradient-highlighted word
  let headlineHtml = esc(c.headline || "The best resume in the room still loses to the most optimized one.");
  const hlWord = esc(c.headlineHighlight || "optimized");
  if (headlineHtml.includes(hlWord)) {
    headlineHtml = headlineHtml.replace(
      hlWord,
      `<em style="background:linear-gradient(135deg,#C4B5FD,#A78BFA,#818CF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${hlWord}</em>`
    );
  }

  const css = `
.d198{width:${PW}px;height:${PH}px;background:linear-gradient(155deg,#1E1B4B 0%,#312E81 40%,#3B1F7E 70%,#2E1065 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;}
.d198::before{content:'';position:absolute;width:320px;height:320px;top:50%;left:50%;transform:translate(-50%,-55%);background:radial-gradient(circle,rgba(167,139,250,.12) 0%,rgba(99,102,241,.04) 40%,transparent 60%);pointer-events:none;}
.d198::after{content:'';position:absolute;bottom:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(99,102,241,.06),transparent 60%);pointer-events:none;}
.d198 .bd{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;padding:28px 22px 14px;flex:1;}
.d198-tt{font-family:${DISP};font-size:30px;font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.03em;}
.d198-line{width:40px;height:2.5px;background:linear-gradient(90deg,#A78BFA,rgba(167,139,250,.2));border-radius:2px;margin:20px 0;}
.d198-body{font-size:12px;line-height:1.6;color:rgba(255,255,255,.35);max-width:280px;}
.d198-body strong{color:rgba(255,255,255,.7);font-weight:600;}
.d198-pill{display:inline-flex;align-items:center;gap:5px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.15);border-radius:20px;padding:5px 12px;margin-top:16px;}
.d198-pill-dot{width:5px;height:5px;border-radius:50%;background:#A78BFA;box-shadow:0 0 6px rgba(167,139,250,.4);}
.d198-pill-text{font-size:9px;font-weight:600;color:#C4B5FD;}`;

  // # Escape body + bold phrase
  let safeBody = esc(c.body || "ATS algorithms don't read quality. They read patterns. JobPilot makes sure yours match.");
  const safeBold = esc(c.bodyBold || "They read patterns");
  if (safeBody.includes(safeBold)) {
    safeBody = safeBody.replace(safeBold, `<strong>${safeBold}</strong>`);
  }

  const body = `<div class="d198">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Truth Bomb", "#A5B4FC")}
      <h2 class="d198-tt">${headlineHtml}</h2>
      <div class="d198-line"></div>
      <p class="d198-body">${safeBody}</p>
      <div class="d198-pill">
        <span class="d198-pill-dot"></span>
        <span class="d198-pill-text">${esc(c.cta || "See your optimization score")}</span>
      </div>
    </div>
    ${footer("gradient")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T199 — THE CALENDAR (Dark, weekly heatmap grid)
   ============================================================ */
function t199(c: TemplateContent, w: number, h: number): string {
  // # 5 days x 4 time slots heatmap
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = ["6-9am", "9-12pm", "12-3pm", "3-6pm"];
  // # Heat values 0-4 (0=cold, 4=hot)
  const heat = c.bars?.map(b => b.value) || [
    2, 3, 2, 3, 1,  // # 6-9am
    4, 4, 3, 4, 2,  // # 9-12pm
    1, 2, 1, 2, 1,  // # 12-3pm
    3, 3, 2, 3, 2,  // # 3-6pm
  ];
  // # Heat colors from cold to hot
  const heatColors = [
    "rgba(99,102,241,.05)",   // # 0: almost invisible
    "rgba(99,102,241,.12)",   // # 1: cool
    "rgba(99,102,241,.25)",   // # 2: warm
    "rgba(99,102,241,.45)",   // # 3: hot
    "rgba(99,102,241,.7)",    // # 4: hottest
  ];

  const css = `
.d199{width:${PW}px;height:${PH}px;background:#08090E;display:flex;flex-direction:column;}
.d199 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d199-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.12;margin-bottom:6px;}
.d199-sub{font-size:9.5px;color:rgba(232,229,221,.3);margin-bottom:16px;}
.d199-grid{display:grid;grid-template-columns:48px repeat(5,1fr);gap:3px;flex:1;align-content:center;}
.d199-hdr{font-family:${MONO};font-size:8px;font-weight:500;color:rgba(232,229,221,.3);text-align:center;padding:4px 0;}
.d199-slot{font-family:${MONO};font-size:7px;font-weight:500;color:rgba(232,229,221,.25);display:flex;align-items:center;justify-content:flex-end;padding-right:6px;}
.d199-cell{border-radius:4px;display:flex;align-items:center;justify-content:center;min-height:32px;font-family:${MONO};font-size:7px;font-weight:500;color:rgba(255,255,255,.5);}
.d199-legend{display:flex;align-items:center;gap:6px;justify-content:center;margin-top:auto;padding-top:10px;}
.d199-legend-label{font-size:7.5px;color:rgba(232,229,221,.25);}
.d199-legend-bar{display:flex;gap:2px;}
.d199-legend-swatch{width:14px;height:8px;border-radius:2px;}
.d199-tip{text-align:center;font-size:9px;font-weight:600;color:#A78BFA;margin-top:8px;}`;

  // # Build grid HTML
  let gridHtml = `<div class="d199-hdr"></div>`; // # empty top-left
  gridHtml += days.map(d => `<div class="d199-hdr">${d}</div>`).join("");

  for (let row = 0; row < 4; row++) {
    gridHtml += `<div class="d199-slot">${slots[row]}</div>`;
    for (let col = 0; col < 5; col++) {
      const val = heat[row * 5 + col] || 0;
      const clampedVal = Math.min(4, Math.max(0, val));
      const labels = ["", "", "", "Good", "Best"];
      gridHtml += `<div class="d199-cell" style="background:${heatColors[clampedVal]};">${labels[clampedVal]}</div>`;
    }
  }

  const legendHtml = heatColors.map(c => `<div class="d199-legend-swatch" style="background:${c};"></div>`).join("");

  const body = `<div class="d199">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Timing Strategy", "rgba(99,102,241,.45)")}
      <h2 class="d199-tt">${esc(c.headline || "The Best Times to Submit Job Applications")}</h2>
      <p class="d199-sub">${esc(c.subheadline || "Based on recruiter response patterns across 8,000+ applications")}</p>
      <div class="d199-grid">${gridHtml}</div>
      <div class="d199-legend">
        <span class="d199-legend-label">Low</span>
        <div class="d199-legend-bar">${legendHtml}</div>
        <span class="d199-legend-label">High</span>
      </div>
      <div class="d199-tip">${esc(c.cta || "Tuesday & Thursday mornings get 2.3x more responses")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T200 — THE ROADMAP (Dark, milestone journey path)
   # LinkedIn 4:5 — winding career/process path with connected nodes
   ============================================================ */
function t200(c: TemplateContent, w: number, h: number): string {
  // # 4-5 milestone nodes along a path
  const milestones = c.items || [
    { text: "Resume uploaded", value: "Day 1", highlighted: false },
    { text: "ATS keywords optimized", value: "Day 2", highlighted: false },
    { text: "Cover letter generated", value: "Day 3", highlighted: true },
    { text: "Applications sent", value: "Day 5", highlighted: false },
    { text: "Interview scheduled", value: "Day 8", highlighted: false },
  ];

  // # Build SVG path connecting all nodes in a zigzag pattern
  const nodeCount = Math.min(milestones.length, 5);
  // # Node positions: zigzag left-right pattern
  const positions = [
    { x: 120, y: 60 },
    { x: 380, y: 140 },
    { x: 140, y: 220 },
    { x: 360, y: 300 },
    { x: 200, y: 380 },
  ];

  // # SVG path data connecting nodes with bezier curves
  let pathD = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < nodeCount; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // # Build node circles + labels
  const nodesHtml = milestones.slice(0, nodeCount).map((m, i) => {
    const p = positions[i];
    const isActive = m.highlighted;
    // # Active node gets bright accent, others get muted style
    const fill = isActive ? "#6366F1" : "rgba(99,102,241,.15)";
    const stroke = isActive ? "#A78BFA" : "rgba(99,102,241,.3)";
    const textColor = isActive ? "#fff" : "rgba(232,229,221,.6)";
    const valueColor = isActive ? "#A78BFA" : "rgba(232,229,221,.3)";
    // # Label on left or right depending on position
    const labelX = p.x > 250 ? p.x - 130 : p.x + 30;
    const labelAnchor = p.x > 250 ? "end" : "start";
    const adjustedLabelX = p.x > 250 ? p.x - 30 : p.x + 30;
    return `
      <circle cx="${p.x}" cy="${p.y}" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="${DISP}">${i + 1}</text>
      <text x="${adjustedLabelX}" y="${p.y - 4}" text-anchor="${labelAnchor}" fill="${textColor}" font-size="10" font-weight="600" font-family="${BODY}">${esc(m.text)}</text>
      <text x="${adjustedLabelX}" y="${p.y + 10}" text-anchor="${labelAnchor}" fill="${valueColor}" font-size="8" font-weight="500" font-family="${MONO}">${esc(m.value || "")}</text>
    `;
  }).join("");

  const css = `
.d200{width:${PW}px;height:${PH}px;background:#0B0D14;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d200::before{content:'';position:absolute;top:0;right:0;width:200px;height:200px;background:radial-gradient(circle,rgba(99,102,241,.06),transparent 60%);pointer-events:none;}
.d200 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d200-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d200-sub{font-size:9px;color:rgba(232,229,221,.3);margin-bottom:8px;}
.d200-map{flex:1;display:flex;align-items:center;justify-content:center;}
.d200-tip{font-size:9px;font-weight:600;color:#A78BFA;text-align:center;margin-top:4px;}`;

  const body = `<div class="d200">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Career Path", "rgba(99,102,241,.45)")}
      <h2 class="d200-tt">${esc(c.headline || "From Upload to Interview in 8 Days")}</h2>
      <p class="d200-sub">${esc(c.subheadline || "The optimized job search timeline")}</p>
      <div class="d200-map">
        <svg width="500" height="440" viewBox="0 0 500 440" fill="none">
          <path d="${pathD}" stroke="rgba(99,102,241,.2)" stroke-width="2" fill="none" stroke-dasharray="6 4"/>
          ${nodesHtml}
        </svg>
      </div>
      <div class="d200-tip">${esc(c.cta || "Your roadmap starts with one upload →")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T201 — THE RECEIPT (Light, invoice-style cost breakdown)
   # LinkedIn 4:5 — shows what bad habits "cost" in time/money
   ============================================================ */
function t201(c: TemplateContent, w: number, h: number): string {
  // # Line items showing costs of bad job search habits
  const items = c.items || [
    { text: "Manually tailoring each resume", value: "4.2 hrs" },
    { text: "Generic cover letters (rejected)", value: "12 apps" },
    { text: "Missed ATS keywords", value: "67%" },
    { text: "Interview prep without data", value: "3.5 hrs" },
    { text: "Applying to poor-fit roles", value: "28 apps" },
  ];
  // # Total / bottom line
  const total = c.stat || { value: "47+", label: "hours wasted per month" };

  // # Build receipt line items
  const linesHtml = items.map(it =>
    `<div class="d201-line">
      <span class="d201-item">${esc(it.text)}</span>
      <span class="d201-dots"></span>
      <span class="d201-val">${esc(it.value || "")}</span>
    </div>`
  ).join("");

  const css = `
.d201{width:${PW}px;height:${PH}px;background:#FAFAF8;display:flex;flex-direction:column;position:relative;}
.d201 .bd{display:flex;flex-direction:column;padding:22px 22px 8px;flex:1;}
.d201-receipt{background:#fff;border:1px solid #E8E5DE;border-radius:8px;padding:18px 16px;margin-top:8px;flex:1;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d201-receipt::after{content:'';position:absolute;bottom:0;left:0;right:0;height:8px;background:repeating-linear-gradient(90deg,transparent 0,transparent 6px,#FAFAF8 6px,#FAFAF8 12px);opacity:.6;}
.d201-hdr{font-family:${MONO};font-size:9px;font-weight:600;color:#8A8A8A;letter-spacing:.1em;text-transform:uppercase;text-align:center;padding-bottom:10px;border-bottom:1px dashed #E2E0DB;}
.d201-tt{font-family:${DISP};font-size:20px;font-weight:800;color:#1A1A1A;letter-spacing:-.03em;line-height:1.15;margin-bottom:4px;}
.d201-lines{display:flex;flex-direction:column;gap:8px;padding:12px 0;flex:1;}
.d201-line{display:flex;align-items:baseline;gap:4px;}
.d201-item{font-size:10px;color:#4A4A4A;white-space:nowrap;}
.d201-dots{flex:1;border-bottom:1px dotted #D0CEC8;margin:0 2px;min-width:20px;}
.d201-val{font-family:${MONO};font-size:10px;font-weight:600;color:#1A1A1A;white-space:nowrap;}
.d201-divider{border-top:1px dashed #E2E0DB;margin:4px 0 8px;}
.d201-total{display:flex;align-items:baseline;justify-content:space-between;}
.d201-total-label{font-size:11px;font-weight:700;color:#6B6B6B;text-transform:uppercase;letter-spacing:.06em;}
.d201-total-val{font-family:${DISP};font-size:28px;font-weight:800;color:#EF4444;letter-spacing:-.03em;}
.d201-total-unit{font-size:9px;color:#8A8A8A;text-align:right;margin-top:2px;}
.d201-saved{text-align:center;margin-top:8px;font-size:9px;font-weight:600;color:#22C55E;}`;

  const body = `<div class="d201">
    <div class="bd">
      ${eyebrow(c.eyebrow || "The Real Cost", "#6366F1")}
      <h2 class="d201-tt">${esc(c.headline || "Your Monthly Job Search Invoice")}</h2>
      <div class="d201-receipt">
        <div class="d201-hdr">${esc(c.subheadline || "— — — ITEMIZED BREAKDOWN — — —")}</div>
        <div class="d201-lines">${linesHtml}</div>
        <div class="d201-divider"></div>
        <div class="d201-total">
          <span class="d201-total-label">Total</span>
          <span class="d201-total-val">${esc(total.value)}</span>
        </div>
        <div class="d201-total-unit">${esc(total.label)}</div>
        <div class="d201-saved">${esc(c.cta || "JobPilot AI cuts this to under 3 hours →")}</div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T202 — THE RADAR (Dark, spider chart skill assessment)
   # LinkedIn 4:5 — SVG radar/spider chart with 6 dimensions
   ============================================================ */
function t202(c: TemplateContent, w: number, h: number): string {
  // # 6 skill dimensions with scores 0-100
  const dimensions = c.bars || [
    { label: "Keywords", value: 85 },
    { label: "Formatting", value: 70 },
    { label: "Impact Verbs", value: 55 },
    { label: "Quantified Results", value: 40 },
    { label: "Role Alignment", value: 90 },
    { label: "ATS Parsing", value: 75 },
  ];
  const dimCount = Math.min(dimensions.length, 6);
  const score = c.stat?.value || "69";

  // # Calculate polygon points for the radar chart
  const cx = 200, cy = 175, maxR = 120;
  const angleStep = (2 * Math.PI) / dimCount;
  const startAngle = -Math.PI / 2; // # Start from top

  // # Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];
  const ringPaths = rings.map(pct => {
    const pts = Array.from({ length: dimCount }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return `${cx + Math.cos(angle) * maxR * pct},${cy + Math.sin(angle) * maxR * pct}`;
    });
    return `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(99,102,241,.1)" stroke-width="1"/>`;
  }).join("");

  // # Axis lines from center to each vertex
  const axisLines = Array.from({ length: dimCount }, (_, i) => {
    const angle = startAngle + i * angleStep;
    const ex = cx + Math.cos(angle) * maxR;
    const ey = cy + Math.sin(angle) * maxR;
    return `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="rgba(99,102,241,.08)" stroke-width="1"/>`;
  }).join("");

  // # Data polygon — filled area showing scores
  const dataPts = dimensions.slice(0, dimCount).map((d, i) => {
    const angle = startAngle + i * angleStep;
    const r = (d.value / 100) * maxR;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");

  // # Axis labels positioned outside the chart
  const labels = dimensions.slice(0, dimCount).map((d, i) => {
    const angle = startAngle + i * angleStep;
    const lx = cx + Math.cos(angle) * (maxR + 28);
    const ly = cy + Math.sin(angle) * (maxR + 28);
    const anchor = Math.abs(Math.cos(angle)) < 0.1 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
    return `<text x="${lx}" y="${ly + 3}" text-anchor="${anchor}" fill="rgba(232,229,221,.5)" font-size="8.5" font-weight="500" font-family="${BODY}">${esc(d.label)}</text>
      <text x="${lx}" y="${ly + 14}" text-anchor="${anchor}" fill="#A78BFA" font-size="8" font-weight="700" font-family="${MONO}">${d.value}%</text>`;
  }).join("");

  // # Data point dots on each vertex
  const dots = dimensions.slice(0, dimCount).map((d, i) => {
    const angle = startAngle + i * angleStep;
    const r = (d.value / 100) * maxR;
    const dx = cx + Math.cos(angle) * r;
    const dy = cy + Math.sin(angle) * r;
    return `<circle cx="${dx}" cy="${dy}" r="3.5" fill="#6366F1" stroke="#A78BFA" stroke-width="1.5"/>`;
  }).join("");

  const css = `
.d202{width:${PW}px;height:${PH}px;background:#0B0D14;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d202::before{content:'';position:absolute;width:300px;height:300px;top:35%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(99,102,241,.06),transparent 60%);pointer-events:none;}
.d202 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d202-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d202-sub{font-size:9px;color:rgba(232,229,221,.3);margin-bottom:4px;}
.d202-chart{flex:1;display:flex;align-items:center;justify-content:center;}
.d202-score{font-family:${DISP};font-size:9px;font-weight:700;color:rgba(232,229,221,.4);text-align:center;margin-top:2px;}
.d202-score em{font-style:normal;font-size:28px;color:#A78BFA;display:block;letter-spacing:-.03em;}`;

  const body = `<div class="d202">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Skill Assessment", "rgba(99,102,241,.45)")}
      <h2 class="d202-tt">${esc(c.headline || "Your Resume's Skill Coverage Map")}</h2>
      <p class="d202-sub">${esc(c.subheadline || "How well does your resume match this role?")}</p>
      <div class="d202-chart">
        <svg width="400" height="380" viewBox="0 0 400 380" fill="none">
          ${ringPaths}
          ${axisLines}
          <polygon points="${dataPts}" fill="rgba(99,102,241,.15)" stroke="#6366F1" stroke-width="2"/>
          ${dots}
          <text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="#A78BFA" font-size="22" font-weight="800" font-family="${DISP}">${esc(score)}</text>
          <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="rgba(232,229,221,.3)" font-size="7" font-weight="500" font-family="${MONO}">OVERALL</text>
          ${labels}
        </svg>
      </div>
      <div class="d202-score">${esc(c.cta || "Map your skills → jobpilotai.co")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T203 — THE TICKER (Dark, breaking news alert — TikTok 9:16)
   # Stock ticker / breaking news style for job market alerts
   ============================================================ */
function t203(c: TemplateContent, w: number, h: number): string {
  // # News ticker items
  const tickerItems = c.items || [
    { text: "Remote hiring up 34% in Q3", value: "↑" },
    { text: "AI roles median $185K", value: "↑" },
    { text: "Cover letters now read by 72% of recruiters", value: "NEW" },
  ];

  const css = `
.d203{width:${TK_PW}px;height:${TK_PH}px;background:#0A0C12;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d203::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#EF4444,#F97316,#EF4444);box-shadow:0 0 20px rgba(239,68,68,.3);}
.d203 .bd{display:flex;flex-direction:column;padding:40px 24px 16px;flex:1;}
.d203-alert{display:flex;align-items:center;gap:8px;margin-bottom:24px;}
.d203-live{width:8px;height:8px;border-radius:50%;background:#EF4444;box-shadow:0 0 8px rgba(239,68,68,.5);}
.d203-live-text{font-family:${MONO};font-size:10px;font-weight:700;color:#EF4444;letter-spacing:.12em;text-transform:uppercase;}
.d203-cat{font-size:9px;font-weight:600;color:rgba(232,229,221,.3);letter-spacing:.08em;text-transform:uppercase;margin-left:auto;}
.d203-tt{font-family:${DISP};font-size:36px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.1;margin-bottom:12px;}
.d203-stat{font-family:${DISP};font-size:80px;font-weight:900;letter-spacing:-.05em;background:linear-gradient(135deg,#EF4444,#F97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center;margin:20px 0;line-height:.9;}
.d203-stat-label{font-size:14px;color:rgba(232,229,221,.4);text-align:center;margin-bottom:24px;}
.d203-body{font-size:14px;color:rgba(232,229,221,.5);line-height:1.6;text-align:center;max-width:380px;margin:0 auto;}
.d203-body strong{color:rgba(232,229,221,.8);font-weight:600;}
.d203-ticker{margin-top:auto;border-top:1px solid rgba(239,68,68,.15);padding-top:12px;display:flex;flex-direction:column;gap:6px;}
.d203-tick{display:flex;align-items:center;gap:8px;font-size:10px;color:rgba(232,229,221,.4);}
.d203-tick-val{font-family:${MONO};font-size:9px;font-weight:700;color:#22C55E;min-width:28px;}
.d203-wm{display:flex;align-items:center;gap:6px;justify-content:center;padding:8px 0 12px;}
.d203-wm img{width:10px;height:10px;border-radius:2px;}
.d203-wm span{font-size:8px;color:rgba(255,255,255,.15);}`;

  // # Escape body + bold phrase
  let safeBody = esc(c.body || "The job market is shifting faster than your resume can keep up. AI-optimized candidates are landing interviews 3× faster.");
  const safeBold = esc(c.bodyBold || "3× faster");
  if (safeBody.includes(safeBold)) {
    safeBody = safeBody.replace(safeBold, `<strong>${safeBold}</strong>`);
  }

  const tickerHtml = tickerItems.map(it =>
    `<div class="d203-tick">
      <span class="d203-tick-val">${esc(it.value || "")}</span>
      <span>${esc(it.text)}</span>
    </div>`
  ).join("");

  const statVal = c.stat?.value || "73%";
  const statLabel = c.stat?.label || "of applications rejected before human review";

  const body = `<div class="d203">
    <div class="bd">
      <div class="d203-alert">
        <div class="d203-live"></div>
        <span class="d203-live-text">Breaking</span>
        <span class="d203-cat">${esc(c.eyebrow || "Job Market Alert")}</span>
      </div>
      <h2 class="d203-tt">${esc(c.headline || "The Number Recruiters Don't Want You to See")}</h2>
      <div class="d203-stat">${esc(statVal)}</div>
      <div class="d203-stat-label">${esc(statLabel)}</div>
      <p class="d203-body">${safeBody}</p>
      <div class="d203-ticker">${tickerHtml}</div>
      <div class="d203-wm">
        <img src="${LOGO_DATA_URI}" alt="JP">
        <span>JobPilot AI · jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  // # TikTok uses TK_PW/TK_PH preview dimensions
  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T204 — THE VERDICT (Dark, courtroom ruling card — TikTok 9:16)
   # Judge's verdict on a career debate with evidence + ruling
   ============================================================ */
function t204(c: TemplateContent, w: number, h: number): string {
  // # Evidence items with verdicts
  const evidence = c.tips || [
    { title: "One-page resumes only", description: "TRUE for <10 years experience, FALSE for senior roles" },
    { title: "Always include an objective", description: "OUTDATED — replaced by professional summary since 2020" },
    { title: "Keywords must match exactly", description: "PARTIALLY TRUE — ATS uses semantic matching now" },
  ];

  const css = `
.d204{width:${TK_PW}px;height:${TK_PH}px;background:#0B0D14;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d204::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#A78BFA,transparent);}
.d204 .bd{display:flex;flex-direction:column;padding:40px 24px 16px;flex:1;}
.d204-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.15);border-radius:6px;padding:6px 14px;margin-bottom:16px;align-self:flex-start;}
.d204-badge-icon{font-size:14px;}
.d204-badge-text{font-family:${MONO};font-size:10px;font-weight:700;color:#A78BFA;letter-spacing:.1em;text-transform:uppercase;}
.d204-tt{font-family:${DISP};font-size:32px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.1;margin-bottom:20px;}
.d204-evidence{display:flex;flex-direction:column;gap:12px;flex:1;justify-content:center;}
.d204-item{background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.08);border-radius:8px;padding:14px 16px;}
.d204-claim{font-size:12px;font-weight:700;color:rgba(232,229,221,.8);margin-bottom:6px;display:flex;align-items:center;gap:6px;}
.d204-claim::before{content:'§';font-family:${MONO};font-size:10px;color:rgba(167,139,250,.4);}
.d204-ruling{font-size:11px;color:rgba(232,229,221,.4);line-height:1.5;}
.d204-final{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(167,139,250,.08));border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:16px 18px;margin-top:auto;text-align:center;}
.d204-final-label{font-family:${MONO};font-size:8px;font-weight:700;color:rgba(167,139,250,.5);letter-spacing:.15em;text-transform:uppercase;margin-bottom:6px;}
.d204-final-text{font-family:${DISP};font-size:16px;font-weight:700;color:#fff;line-height:1.3;}
.d204-wm{display:flex;align-items:center;gap:6px;justify-content:center;padding:8px 0 12px;}
.d204-wm img{width:10px;height:10px;border-radius:2px;}
.d204-wm span{font-size:8px;color:rgba(255,255,255,.15);}`;

  const evidenceHtml = evidence.map(e =>
    `<div class="d204-item">
      <div class="d204-claim">${esc(e.title)}</div>
      <div class="d204-ruling">${esc(e.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d204">
    <div class="bd">
      <div class="d204-badge">
        <span class="d204-badge-icon">⚖</span>
        <span class="d204-badge-text">${esc(c.eyebrow || "The Verdict")}</span>
      </div>
      <h2 class="d204-tt">${esc(c.headline || "Resume Advice on Trial: What's Actually True?")}</h2>
      <div class="d204-evidence">${evidenceHtml}</div>
      <div class="d204-final">
        <div class="d204-final-label">Final Ruling</div>
        <div class="d204-final-text">${esc(c.body || "Most resume advice is outdated. Data-driven optimization beats tradition every time.")}</div>
      </div>
      <div class="d204-wm">
        <img src="${LOGO_DATA_URI}" alt="JP">
        <span>JobPilot AI · jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T205 — THE BLUEPRINT (Blueprint, architectural wireframe — TikTok 9:16)
   # Technical drawing style showing career architecture
   ============================================================ */
function t205(c: TemplateContent, w: number, h: number): string {
  // # Blueprint components/modules
  const modules = c.tips || [
    { title: "Resume Engine", description: "ATS keyword optimization + formatting" },
    { title: "Cover Letter AI", description: "Role-specific generation in 30 seconds" },
    { title: "Interview Prep", description: "Company research + practice questions" },
    { title: "Application Tracker", description: "Status monitoring + follow-up alerts" },
  ];

  const css = `
.d205{width:${TK_PW}px;height:${TK_PH}px;background:#0C1929;background-image:linear-gradient(rgba(56,189,248,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.04) 1px,transparent 1px);background-size:20px 20px;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d205::before{content:'';position:absolute;top:20px;left:20px;right:20px;bottom:20px;border:1px solid rgba(56,189,248,.08);border-radius:4px;pointer-events:none;}
.d205 .bd{display:flex;flex-direction:column;padding:44px 28px 16px;flex:1;position:relative;z-index:1;}
.d205-title-block{border:1px solid rgba(56,189,248,.12);border-radius:4px;padding:10px 14px;margin-bottom:20px;}
.d205-title-label{font-family:${MONO};font-size:8px;font-weight:500;color:rgba(56,189,248,.3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;}
.d205-tt{font-family:${DISP};font-size:28px;font-weight:800;color:#E2F0FF;letter-spacing:-.03em;line-height:1.1;}
.d205-sub{font-size:10px;color:rgba(56,189,248,.35);margin-top:4px;}
.d205-modules{display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center;}
.d205-mod{border:1px dashed rgba(56,189,248,.15);border-radius:6px;padding:14px 16px;position:relative;display:flex;align-items:flex-start;gap:12px;}
.d205-mod-num{font-family:${MONO};font-size:9px;font-weight:700;color:rgba(56,189,248,.3);background:rgba(56,189,248,.06);border-radius:4px;padding:3px 6px;flex-shrink:0;}
.d205-mod-body{display:flex;flex-direction:column;gap:3px;}
.d205-mod-name{font-size:13px;font-weight:700;color:#E2F0FF;}
.d205-mod-desc{font-size:10px;color:rgba(56,189,248,.4);line-height:1.4;}
.d205-connector{width:1px;height:10px;background:rgba(56,189,248,.12);margin:0 auto;position:relative;}
.d205-connector::before{content:'';position:absolute;top:-2px;left:-2px;width:5px;height:5px;border-radius:50%;background:rgba(56,189,248,.2);}
.d205-stamp{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:auto;padding-top:12px;}
.d205-stamp-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(56,189,248,.12),transparent);}
.d205-stamp-text{font-family:${MONO};font-size:8px;font-weight:600;color:rgba(56,189,248,.25);letter-spacing:.1em;text-transform:uppercase;}
.d205-wm{display:flex;align-items:center;gap:6px;justify-content:center;padding:8px 0 12px;}
.d205-wm img{width:10px;height:10px;border-radius:2px;}
.d205-wm span{font-size:8px;color:rgba(255,255,255,.15);}`;

  // # Build modules with connectors between them
  const modulesHtml = modules.map((m, i) => {
    const connector = i < modules.length - 1
      ? `<div class="d205-connector"></div>`
      : "";
    return `<div class="d205-mod">
      <span class="d205-mod-num">${String(i + 1).padStart(2, "0")}</span>
      <div class="d205-mod-body">
        <div class="d205-mod-name">${esc(m.title)}</div>
        <div class="d205-mod-desc">${esc(m.description)}</div>
      </div>
    </div>${connector}`;
  }).join("");

  const body = `<div class="d205">
    <div class="bd">
      <div class="d205-title-block">
        <div class="d205-title-label">${esc(c.eyebrow || "System Architecture")}</div>
        <h2 class="d205-tt">${esc(c.headline || "The AI Job Search Blueprint")}</h2>
        <p class="d205-sub">${esc(c.subheadline || "REV 2.0 — Optimized for 2026 hiring landscape")}</p>
      </div>
      <div class="d205-modules">${modulesHtml}</div>
      <div class="d205-stamp">
        <div class="d205-stamp-line"></div>
        <span class="d205-stamp-text">${esc(c.cta || "Build your system → jobpilotai.co")}</span>
        <div class="d205-stamp-line"></div>
      </div>
      <div class="d205-wm">
        <img src="${LOGO_DATA_URI}" alt="JP">
        <span>JobPilot AI · jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T206 — THE METER (Dark, speedometer gauge — Instagram 4:5)
   # Semi-circular gauge with needle showing readiness score
   ============================================================ */
function t206(c: TemplateContent, w: number, h: number): string {
  // # Score 0-100 for the gauge needle position
  const scoreVal = parseInt(c.stat?.value || "72", 10);
  const scoreLabel = c.stat?.label || "Resume Readiness Score";
  const clampedScore = Math.min(100, Math.max(0, scoreVal));

  // # Calculate needle angle: 0% = -90deg (left), 100% = 90deg (right)
  const needleAngle = -90 + (clampedScore / 100) * 180;

  // # SVG arc for the gauge — semi-circle from left to right
  // # Center at (200, 220), radius 140
  const gCx = 200, gCy = 220, gR = 140;

  // # Color zones on the gauge arc
  // # Red (0-30%), Yellow (30-60%), Green (60-100%)
  const zoneArcs = [
    { start: -90, end: -36, color: "#EF4444" },  // # Red zone
    { start: -36, end: 18, color: "#F59E0B" },    // # Yellow zone
    { start: 18, end: 90, color: "#22C55E" },     // # Green zone
  ];

  // # Helper to convert angle to SVG point
  const angleToPoint = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: gCx + Math.cos(rad) * gR, y: gCy + Math.sin(rad) * gR };
  };

  // # Build arc paths for each zone
  const arcPaths = zoneArcs.map(z => {
    const p1 = angleToPoint(z.start);
    const p2 = angleToPoint(z.end);
    const largeArc = (z.end - z.start) > 180 ? 1 : 0;
    return `<path d="M ${p1.x} ${p1.y} A ${gR} ${gR} 0 ${largeArc} 1 ${p2.x} ${p2.y}" stroke="${z.color}" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }).join("");

  // # Gauge tick marks every 10%
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const pct = i * 10;
    const angleDeg = -90 + (pct / 100) * 180;
    const outerR = gR + 10;
    const innerR = gR + 3;
    const outer = angleToPoint(angleDeg);
    const innerPt = { x: gCx + Math.cos((angleDeg * Math.PI) / 180) * innerR, y: gCy + Math.sin((angleDeg * Math.PI) / 180) * innerR };
    const labelR = gR + 22;
    const labelPt = { x: gCx + Math.cos((angleDeg * Math.PI) / 180) * labelR, y: gCy + Math.sin((angleDeg * Math.PI) / 180) * labelR };
    // # Adjust outer point for tick
    const outerPt = { x: gCx + Math.cos((angleDeg * Math.PI) / 180) * outerR, y: gCy + Math.sin((angleDeg * Math.PI) / 180) * outerR };
    return `<line x1="${innerPt.x}" y1="${innerPt.y}" x2="${outerPt.x}" y2="${outerPt.y}" stroke="rgba(232,229,221,.15)" stroke-width="1.5"/>
      ${(i % 2 === 0) ? `<text x="${labelPt.x}" y="${labelPt.y + 3}" text-anchor="middle" fill="rgba(232,229,221,.25)" font-size="7" font-family="${MONO}">${pct}</text>` : ""}`;
  }).join("");

  // # Needle — from center, pointing at the score angle
  const needleEnd = { x: gCx + Math.cos((needleAngle * Math.PI) / 180) * (gR - 10), y: gCy + Math.sin((needleAngle * Math.PI) / 180) * (gR - 10) };

  // # Breakdown items below gauge
  const breakdownItems = c.items || [
    { text: "ATS Keywords", value: "85%", highlighted: false },
    { text: "Formatting", value: "90%", highlighted: true },
    { text: "Impact Metrics", value: "45%", highlighted: false },
  ];

  const css = `
.d206{width:${PW}px;height:${PH}px;background:#0B0D14;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d206::before{content:'';position:absolute;width:280px;height:280px;top:30%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(99,102,241,.05),transparent 60%);pointer-events:none;}
.d206 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d206-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d206-sub{font-size:9px;color:rgba(232,229,221,.3);margin-bottom:8px;}
.d206-gauge{display:flex;justify-content:center;margin:4px 0;}
.d206-breakdown{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
.d206-bk-item{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(99,102,241,.04);border:1px solid rgba(99,102,241,.06);border-radius:6px;}
.d206-bk-text{font-size:10px;color:rgba(232,229,221,.5);flex:1;}
.d206-bk-val{font-family:${MONO};font-size:10px;font-weight:700;color:#A78BFA;}
.d206-bk-bar{width:60px;height:4px;background:rgba(99,102,241,.08);border-radius:2px;overflow:hidden;}
.d206-bk-fill{height:100%;border-radius:2px;background:#6366F1;}
.d206-tip{font-size:9px;font-weight:600;color:#A78BFA;text-align:center;margin-top:auto;padding-top:6px;}`;

  const breakdownHtml = breakdownItems.map(it => {
    const pct = parseInt(it.value || "0", 10);
    return `<div class="d206-bk-item">
      <span class="d206-bk-text">${esc(it.text)}</span>
      <span class="d206-bk-val">${esc(it.value || "")}</span>
      <div class="d206-bk-bar"><div class="d206-bk-fill" style="width:${Math.min(100, pct)}%;"></div></div>
    </div>`;
  }).join("");

  const body = `<div class="d206">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Readiness Check", "rgba(99,102,241,.45)")}
      <h2 class="d206-tt">${esc(c.headline || "How Interview-Ready Is Your Resume?")}</h2>
      <p class="d206-sub">${esc(c.subheadline || "Real-time analysis across 6 key dimensions")}</p>
      <div class="d206-gauge">
        <svg width="400" height="260" viewBox="0 0 400 260" fill="none">
          ${arcPaths}
          ${ticks}
          <circle cx="${gCx}" cy="${gCy}" r="6" fill="#1E1F2E" stroke="#6366F1" stroke-width="2"/>
          <line x1="${gCx}" y1="${gCy}" x2="${needleEnd.x}" y2="${needleEnd.y}" stroke="#E8E5DD" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="${gCx}" cy="${gCy}" r="3" fill="#6366F1"/>
          <text x="${gCx}" y="${gCy + 35}" text-anchor="middle" fill="#A78BFA" font-size="28" font-weight="800" font-family="${DISP}">${clampedScore}</text>
          <text x="${gCx}" y="${gCy + 48}" text-anchor="middle" fill="rgba(232,229,221,.3)" font-size="8" font-weight="500" font-family="${MONO}">${esc(scoreLabel)}</text>
        </svg>
      </div>
      <div class="d206-breakdown">${breakdownHtml}</div>
      <div class="d206-tip">${esc(c.cta || "Check your readiness score → jobpilotai.co")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T207 — THE NOTIFICATION (Light, phone notification stack — Instagram 4:5)
   # Cascading phone notifications showing job search alerts
   ============================================================ */
function t207(c: TemplateContent, w: number, h: number): string {
  // # Notification items — each is a phone notification card
  const notifications = c.tips || [
    { title: "Resume Score Updated", description: "Your ATS match jumped from 54% to 91% for Product Manager at Stripe" },
    { title: "New Job Match Found", description: "Senior PM role at Notion — 94% match with your optimized resume" },
    { title: "Interview Prep Ready", description: "12 company-specific questions generated based on Notion's recent earnings call" },
    { title: "Application Deadline", description: "Stripe PM role closes in 48 hours — your cover letter is ready to send" },
  ];

  // # Notification icon backgrounds — each gets a different accent
  const iconColors = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];
  const iconSymbols = ["↑", "★", "?", "!"];

  const css = `
.d207{width:${PW}px;height:${PH}px;background:#F5F5F0;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d207 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d207-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#1A1A1A;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d207-sub{font-size:9px;color:#8A8A8A;margin-bottom:12px;}
.d207-stack{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center;}
.d207-notif{background:#fff;border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.03);transition:transform .2s;}
.d207-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#fff;}
.d207-notif-body{flex:1;min-width:0;}
.d207-notif-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}
.d207-notif-title{font-size:10px;font-weight:700;color:#1A1A1A;}
.d207-notif-time{font-size:7px;color:#B0B0B0;}
.d207-notif-desc{font-size:9px;color:#6B6B6B;line-height:1.45;}
.d207-badge{position:absolute;top:22px;right:22px;background:#EF4444;color:#fff;font-size:9px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.d207-tip{font-size:9px;font-weight:600;color:#6366F1;text-align:center;margin-top:auto;padding-top:6px;}`;

  const times = ["Just now", "2m ago", "15m ago", "1h ago"];
  const notifsHtml = notifications.map((n, i) => {
    const bg = iconColors[i % iconColors.length];
    const sym = iconSymbols[i % iconSymbols.length];
    const time = times[i % times.length];
    return `<div class="d207-notif">
      <div class="d207-icon" style="background:${bg};">${sym}</div>
      <div class="d207-notif-body">
        <div class="d207-notif-head">
          <span class="d207-notif-title">${esc(n.title)}</span>
          <span class="d207-notif-time">${time}</span>
        </div>
        <div class="d207-notif-desc">${esc(n.description)}</div>
      </div>
    </div>`;
  }).join("");

  const body = `<div class="d207">
    <div class="d207-badge">${notifications.length}</div>
    <div class="bd">
      ${eyebrow(c.eyebrow || "Your Job Search", "#6366F1")}
      <h2 class="d207-tt">${esc(c.headline || "This Is What an AI-Powered Job Search Looks Like")}</h2>
      <p class="d207-sub">${esc(c.subheadline || "Real notifications from a JobPilot user's first week")}</p>
      <div class="d207-stack">${notifsHtml}</div>
      <div class="d207-tip">${esc(c.cta || "Start getting these notifications → jobpilotai.co")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T208 — THE LABEL (Warm, nutrition label style — Instagram 4:5)
   # Product-style label showing "ingredients" of a good resume
   ============================================================ */
function t208(c: TemplateContent, w: number, h: number): string {
  // # "Ingredients" with daily value percentages
  const ingredients = c.items || [
    { text: "Action Verbs (Led, Built, Drove)", value: "95%" },
    { text: "Quantified Achievements", value: "80%" },
    { text: "ATS-Compatible Formatting", value: "100%" },
    { text: "Role-Specific Keywords", value: "90%" },
    { text: "Professional Summary", value: "75%" },
    { text: "Measurable Impact Metrics", value: "85%" },
  ];

  const css = `
.d208{width:${PW}px;height:${PH}px;background:#FAF8F3;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d208 .bd{display:flex;flex-direction:column;padding:22px 22px 8px;flex:1;}
.d208-label{background:#fff;border:2px solid #1A1A1A;border-radius:4px;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;}
.d208-label-hdr{background:#1A1A1A;padding:10px 14px;text-align:center;}
.d208-label-title{font-family:${DISP};font-size:20px;font-weight:900;color:#fff;letter-spacing:-.02em;}
.d208-label-sub{font-size:8px;color:rgba(255,255,255,.5);margin-top:2px;letter-spacing:.06em;text-transform:uppercase;}
.d208-serving{padding:8px 14px;border-bottom:1px solid #1A1A1A;font-size:9px;color:#4A4A4A;}
.d208-serving strong{font-weight:700;color:#1A1A1A;}
.d208-amts{padding:4px 14px;display:flex;justify-content:space-between;border-bottom:8px solid #1A1A1A;font-family:${MONO};font-size:7px;font-weight:700;color:#1A1A1A;letter-spacing:.06em;text-transform:uppercase;}
.d208-rows{padding:0 14px;flex:1;display:flex;flex-direction:column;}
.d208-row{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #E8E5DE;}
.d208-row:last-child{border-bottom:none;}
.d208-row-name{font-size:10px;color:#1A1A1A;flex:1;}
.d208-row-bold{font-weight:700;}
.d208-row-val{font-family:${MONO};font-size:10px;font-weight:700;color:#1A1A1A;min-width:36px;text-align:right;}
.d208-row-bar{width:50px;height:4px;background:#E8E5DE;border-radius:2px;margin-left:8px;overflow:hidden;}
.d208-row-fill{height:100%;border-radius:2px;}
.d208-footnote{padding:8px 14px;border-top:1px solid #E8E5DE;font-size:7.5px;color:#8A8A8A;line-height:1.4;}
.d208-tip{font-size:9px;font-weight:600;color:#6366F1;text-align:center;margin-top:6px;}`;

  // # Determine fill color based on percentage (red < 60, yellow 60-80, green > 80)
  const fillColor = (val: string) => {
    const num = parseInt(val, 10);
    if (num >= 80) return "#22C55E";
    if (num >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const rowsHtml = ingredients.map((it, i) =>
    `<div class="d208-row">
      <span class="d208-row-name ${i < 2 ? "d208-row-bold" : ""}">${esc(it.text)}</span>
      <span class="d208-row-val">${esc(it.value || "")}</span>
      <div class="d208-row-bar"><div class="d208-row-fill" style="width:${parseInt(it.value || "0", 10)}%;background:${fillColor(it.value || "0")};"></div></div>
    </div>`
  ).join("");

  const body = `<div class="d208">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Resume Ingredients", "#6366F1")}
      <div class="d208-label">
        <div class="d208-label-hdr">
          <div class="d208-label-title">${esc(c.headline || "Resume Composition Facts")}</div>
          <div class="d208-label-sub">${esc(c.subheadline || "What makes a resume that actually gets interviews")}</div>
        </div>
        <div class="d208-serving">
          <strong>${esc(c.body || "Serving Size:")}</strong> ${esc(c.bodyBold || "1 Optimized Resume (1-2 pages)")}
        </div>
        <div class="d208-amts">
          <span>Ingredient</span>
          <span>% Present</span>
        </div>
        <div class="d208-rows">${rowsHtml}</div>
        <div class="d208-footnote">* Percentages based on analysis of 50,000+ resumes that led to interviews. Individual results may vary based on industry and role.</div>
      </div>
      <div class="d208-tip">${esc(c.cta || "Check your resume's ingredients → jobpilotai.co")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   BUILDER MAP + EXPORT
   ============================================================ */
const BUILDERS: Record<string, (c: TemplateContent, w: number, h: number) => string> = {
  t187, t188, t189, t190, t191, t192, t193, t194, t198, t199,
  t200, t201, t202,    // # LinkedIn new
  t203, t204, t205,    // # TikTok new
  t206, t207, t208,    // # Instagram new
};

// # Build a designer template HTML page
export function buildDesignerTemplate(
  templateId: TemplateId,
  content: TemplateContent,
  width: number,
  height: number,
): string {
  const builder = BUILDERS[templateId];
  if (!builder) throw new Error(`Unknown designer template: ${templateId}`);
  return builder(content, width, height);
}
