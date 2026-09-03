/* ============================================================
   DESIGNER TEMPLATES â€” 39 premium multi-platform designs
   ============================================================
   # T187-T193, T194, T198-T202: Designer LinkedIn (4:5 â€” 1080Ã—1350)
   # T203-T205: Designer TikTok (9:16 â€” 1080Ã—1920)
   # T206-T208: Designer Instagram (4:5 â€” 1080Ã—1350)
   # T209-T214: Designer LinkedIn Set 5 (4:5 â€” 1080Ã—1350)
   # T215-T220: Designer LinkedIn Set 6 â€” text-only (4:5 â€” 1080Ã—1350)
   #
   # These are high-polish, content-rich marketing templates
   # using Bricolage Grotesque / DM Sans / JetBrains Mono fonts
   # (loaded via Google Fonts in Puppeteer).
   #
   # T187: The Number â€” Hero stat with mini-metric grid
   # T188: The Analysis â€” Light data dashboard card
   # T189: The Playbook â€” Gradient numbered tips
   # T190: The Shift â€” Before/After comparison
   # T191: The Signal â€” Gradient insight + 3-stat bar
   # T192: The Proof â€” Dark social proof + quote
   # T193: The Matrix â€” Light 2x2 framework quadrant
   # T194: The Funnel â€” Conversion funnel with drop-off
   # T198: The Spotlight â€” Provocative one-liner
   # T199: The Calendar â€” Weekly heatmap grid
   # T200: The Roadmap â€” Milestone journey path
   # T201: The Receipt â€” Invoice-style cost breakdown
   # T202: The Radar â€” Spider chart skill assessment
   # T203: The Ticker â€” Breaking news alert (TikTok)
   # T204: The Verdict â€” Courtroom ruling card (TikTok)
   # T205: The Blueprint â€” Architectural wireframe (TikTok)
   # T206: The Meter â€” Speedometer gauge (Instagram)
   # T207: The Notification â€” Phone notification stack (Instagram)
   # T208: The Label â€” Nutrition label style (Instagram)
   # T209: The Stack Rank â€” Teal ranked comparison bars
   # T210: The Scorecard â€” Warm cream assessment card
   # T211: The Timeline â€” Indigo gradient event cards
   # T212: The Versus â€” White red/green comparison
   # T213: The Cheat Sheet â€” Lavender reference card
   # T214: The Dashboard â€” Navy blue KPI metrics
   # T215: The Manifesto â€” Warm amber, bold statement + supporting paragraphs
   # T216: The Framework â€” Clean white + emerald, named pillars with text
   # T217: The Letter â€” Soft rose, open letter format with signature
   # T218: The Glossary â€” Deep forest green, term definitions in cards
   # T219: The Unpacked â€” Sky blue gradient, concept broken into parts
   # T220: The Dialogue â€” Warm stone, Q&A conversational format
   # T221: The Compass â€” Teal slate, four direction cards
   # T222: The Journal â€” Warm cream paper, personal reflection
   # T223: The Contrast â€” Split slate/white, opposing viewpoints
   # T224: The Memo â€” White, formal internal memo style
   # T225: The Thread â€” Deep violet, connected insights
   # T226: The Equation â€” Dark charcoal + amber, problem/action flow
   # T228: The Prescription â€” Mint/sage, medical Rx card style
   # T229: The Pinboard â€” Warm honey/amber, corkboard cards
   # T230: The Gauge â€” Navy + cyan, donut chart score (TikTok)
   # T231: The Ladder â€” Warm cream/coral, ascending effort bars (TikTok)
   # T232: The Marquee â€” Burgundy + gold, cinema marquee (TikTok)
   # T233: The Quadrant â€” Bold 2x2 color grid stats (Instagram)
   # T234: The Stamp â€” White + red, rubber stamp seal (Instagram)
   # T235: The Billboard â€” Highway green, road sign exits (Instagram)
   #
   # LinkedIn/Instagram preview at 540Ã—675 â†’ scale 2Ã— to 1080Ã—1350
   # TikTok preview at 540Ã—960 â†’ scale 2Ã— to 1080Ã—1920
   ============================================================ */

import type { TemplateContent, TemplateId } from "./shared";
import { LOGO_DATA_URI, LOGO_PRO_URI, FONT_STACK, MONO_STACK, esc } from "./shared";

// # All designer template IDs â€” LinkedIn (T187-T202, T209-T214), TikTok (T203-T205), Instagram (T206-T208)
export const DESIGNER_IDS: TemplateId[] = [
  "t187","t188","t189","t190","t191","t192","t193",
  "t194","t198","t199","t200","t201","t202",
  "t203","t204","t205",
  "t206","t207","t208",
  "t209","t210","t211","t212","t213","t214",
  "t215","t216","t217","t218","t219","t220",
  "t221","t222","t223","t224","t225","t226",
  "t228","t229",
  "t230","t231","t232",
  "t233","t234","t235",
];

// # Preview dimensions for LinkedIn/Instagram 4:5 â†’ 2Ã— scale
const PW = 540, PH = 675;
// # Preview dimensions for TikTok 9:16 â†’ 2Ã— scale
const TK_PW = 540, TK_PH = 960;

// # Google Fonts link for designer templates (Bricolage Grotesque, DM Sans, JetBrains Mono)
const GFONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

// # Font stacks for designer templates
const DISP = `'Bricolage Grotesque', ${FONT_STACK}`;
const BODY = `'DM Sans', ${FONT_STACK}`;
const MONO = `'JetBrains Mono', ${MONO_STACK}`;

// # Flexible wrap â€” accepts custom preview dimensions for multi-platform support
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

// # Footer â€” dedicated brand strip with official logo, name, and domain
function footer(mode: "dark" | "light" | "gradient"): string {
  // # Dark/gradient: subtle light border + light text; Light: subtle dark border + dark text
  const borderC = mode === "light" ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.08)";
  const nameC = mode === "light" ? "#57534E" : "rgba(255,255,255,.55)";
  const urlC = mode === "light" ? "#A8A29E" : "rgba(255,255,255,.3)";
  const logoBg = mode === "light" ? "rgba(99,102,241,.06)" : "rgba(99,102,241,.1)";
  return `<div style="display:flex;align-items:center;gap:8px;padding:10px 18px 12px;border-top:1px solid ${borderC};margin-top:auto;">
    <div style="width:20px;height:20px;border-radius:5px;background:${logoBg};display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <img src="${LOGO_PRO_URI}" alt="JobPilot" style="width:14px;height:14px;border-radius:3px;object-fit:cover;">
    </div>
    <span style="font-family:${DISP};font-size:10.5px;font-weight:700;letter-spacing:-.01em;color:${nameC};">JobPilot AI</span>
    <span style="font-size:8.5px;font-family:${MONO};margin-left:auto;letter-spacing:.02em;color:${urlC};">jobpilotai.co</span>
  </div>`;
}

// # Eyebrow with dash prefix
function eyebrow(text: string, color: string): string {
  return `<div style="font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};display:flex;align-items:center;gap:6px;margin-bottom:16px;">
    <span style="width:14px;height:2px;background:${color};border-radius:1px;display:inline-block;"></span>${esc(text)}</div>`;
}

/* ============================================================
   T187 â€” THE NUMBER (Dark, hero stat + mini-metrics grid)
   ============================================================ */
function t187(c: TemplateContent, w: number, h: number): string {
  // # Extract stat from content or use defaults
  const statValue = c.stat?.value || "6.2";
  const statLabel = c.stat?.label || "seconds";
  const bodyText = c.body || "The average time a recruiter spends on your resume before deciding. In that narrow window, your formatting and keywords determine everything.";
  const bodyBold = c.bodyBold || "In that narrow window, your formatting and keywords determine everything.";
  const metrics = c.items || [
    { text: "Rejected by ATS before human review", value: "73%" },
    { text: "More interviews with optimization", value: "3.2Ã—", highlighted: true },
    { text: "Average match score after", value: "89%" },
  ];
  const cta = c.cta || "See your resume score â†’";

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
   T188 â€” THE ANALYSIS (Light dashboard with score + bars)
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
  const cta = c.cta || "Optimize Resume â†’";

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

  const tagsHtml = tags.map(t => `<span class="d188-s"><i>âœ“</i> ${esc(t)}</span>`).join("");

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
   T189 â€” THE PLAYBOOK (Gradient, numbered tip cards)
   ============================================================ */
function t189(c: TemplateContent, w: number, h: number): string {
  const tips = c.tips || [
    { title: "Generic objectives.", description: "Replace with a tailored professional summary that mirrors the role." },
    { title: "Listing duties.", description: "Quantify your impact â€” numbers, percentages, and measurable outcomes." },
    { title: "One-size resume.", description: "Customize keywords and emphasis for each application you submit." },
    { title: "Missing keywords.", description: "Mirror the exact language and terminology from the job description." },
    { title: "Cluttered formatting.", description: "Use clean, ATS-friendly structure with consistent hierarchy." },
  ];
  const cta = c.cta || "Fix all 5 in under 2 minutes with AI â†’";

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
   T190 â€” THE SHIFT (Dark, before/after comparison)
   ============================================================ */
function t190(c: TemplateContent, w: number, h: number): string {
  const beforeText = c.beforeText || "34%";
  const afterText = c.afterText || "92%";
  const beforeItems = c.bullets?.slice(0, 4) || ["Missing keywords", "Weak action verbs", "No quantified metrics", "Poor formatting"];
  const afterItems = c.tags?.slice(0, 4) || ["Keywords matched", "Impact verbs", "Quantified results", "Clean structure"];
  const cta = c.cta || "2.7Ã— more interview callbacks";

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
    `<div class="d190-i"><span class="d190-ic">âœ—</span> ${esc(item)}</div>`
  ).join("");
  const afterHtml = afterItems.map(item =>
    `<div class="d190-i"><span class="d190-ic">âœ“</span> ${esc(item)}</div>`
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
   T191 â€” THE SIGNAL (Gradient, insight statement + 3 stats)
   ============================================================ */
function t191(c: TemplateContent, w: number, h: number): string {
  const bodyText = c.body || "Most qualified candidates never get past automated screening. Your skills aren't the problem â€” your formatting is.";
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
   T192 â€” THE PROOF (Dark, social proof + metric grid + quote)
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
    { text: "More interviews", value: "3.2Ã—" },
    { text: "Countries served", value: "47" },
    { text: "User rating", value: "4.8â˜…" },
  ];
  const quote = c.body || "Got 3 interviews in my first week after optimizing. The keyword matching alone was worth it.";
  const quoteAuthor = c.subheadline || "Sarah K. Â· Product Manager at Shopify";

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
        <div class="d192-qa"><strong>${esc(quoteAuthor.split(" Â· ")[0])}</strong> Â· ${esc(quoteAuthor.split(" Â· ").slice(1).join(" Â· ") || "")}</div>
      </div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T193 â€” THE MATRIX (Light, 2x2 framework quadrant)
   ============================================================ */
function t193(c: TemplateContent, w: number, h: number): string {
  // # 4 quadrant cells with titles, descriptions, and category tags
  const cells = c.tips || [
    { title: "Keyword Alignment", description: "Match 80%+ of job description keywords to pass ATS filters" },
    { title: "Impact Metrics", description: "Quantify every achievement with numbers, percentages, revenue" },
    { title: "Clean Structure", description: "Consistent formatting, clear hierarchy, proper section order" },
    { title: "Role Tailoring", description: "Customize summary and skills for each application you send" },
  ];
  // # Tags for each cell â€” defaults match the 4 pillars concept
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
   T194 â€” THE FUNNEL (Dark, application pipeline drop-off)
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

  // # Width percentages for funnel bars (widestâ†’narrowest)
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
   T198 â€” THE SPOTLIGHT (Gradient, dramatic one-liner)
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
   T199 â€” THE CALENDAR (Dark, weekly heatmap grid)
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
   T200 â€” THE ROADMAP (Dark, milestone journey path)
   # LinkedIn 4:5 â€” winding career/process path with connected nodes
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
      <div class="d200-tip">${esc(c.cta || "Your roadmap starts with one upload â†’")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T201 â€” THE RECEIPT (Light, invoice-style cost breakdown)
   # LinkedIn 4:5 â€” shows what bad habits "cost" in time/money
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
        <div class="d201-hdr">${esc(c.subheadline || "â€” â€” â€” ITEMIZED BREAKDOWN â€” â€” â€”")}</div>
        <div class="d201-lines">${linesHtml}</div>
        <div class="d201-divider"></div>
        <div class="d201-total">
          <span class="d201-total-label">Total</span>
          <span class="d201-total-val">${esc(total.value)}</span>
        </div>
        <div class="d201-total-unit">${esc(total.label)}</div>
        <div class="d201-saved">${esc(c.cta || "JobPilot AI cuts this to under 3 hours â†’")}</div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T202 â€” THE RADAR (Dark, spider chart skill assessment)
   # LinkedIn 4:5 â€” SVG radar/spider chart with 6 dimensions
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

  // # Data polygon â€” filled area showing scores
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
      <div class="d202-score">${esc(c.cta || "Map your skills â†’ jobpilotai.co")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T203 â€” THE TICKER (Dark, breaking news alert â€” TikTok 9:16)
   # Stock ticker / breaking news style for job market alerts
   ============================================================ */
function t203(c: TemplateContent, w: number, h: number): string {
  // # News ticker items
  const tickerItems = c.items || [
    { text: "Remote hiring up 34% in Q3", value: "â†‘" },
    { text: "AI roles median $185K", value: "â†‘" },
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
  let safeBody = esc(c.body || "The job market is shifting faster than your resume can keep up. AI-optimized candidates are landing interviews 3Ã— faster.");
  const safeBold = esc(c.bodyBold || "3Ã— faster");
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
        <span>JobPilot AI Â· jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  // # TikTok uses TK_PW/TK_PH preview dimensions
  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T204 â€” THE VERDICT (Dark, courtroom ruling card â€” TikTok 9:16)
   # Judge's verdict on a career debate with evidence + ruling
   ============================================================ */
function t204(c: TemplateContent, w: number, h: number): string {
  // # Evidence items with verdicts
  const evidence = c.tips || [
    { title: "One-page resumes only", description: "TRUE for <10 years experience, FALSE for senior roles" },
    { title: "Always include an objective", description: "OUTDATED â€” replaced by professional summary since 2020" },
    { title: "Keywords must match exactly", description: "PARTIALLY TRUE â€” ATS uses semantic matching now" },
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
.d204-claim::before{content:'Â§';font-family:${MONO};font-size:10px;color:rgba(167,139,250,.4);}
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
        <span class="d204-badge-icon">âš–</span>
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
        <span>JobPilot AI Â· jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T205 â€” THE BLUEPRINT (Blueprint, architectural wireframe â€” TikTok 9:16)
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
        <p class="d205-sub">${esc(c.subheadline || "REV 2.0 â€” Optimized for 2026 hiring landscape")}</p>
      </div>
      <div class="d205-modules">${modulesHtml}</div>
      <div class="d205-stamp">
        <div class="d205-stamp-line"></div>
        <span class="d205-stamp-text">${esc(c.cta || "Build your system â†’ jobpilotai.co")}</span>
        <div class="d205-stamp-line"></div>
      </div>
      <div class="d205-wm">
        <img src="${LOGO_DATA_URI}" alt="JP">
        <span>JobPilot AI Â· jobpilotai.co</span>
      </div>
    </div>
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T206 â€” THE METER (Dark, speedometer gauge â€” Instagram 4:5)
   # Semi-circular gauge with needle showing readiness score
   ============================================================ */
function t206(c: TemplateContent, w: number, h: number): string {
  // # Score 0-100 for the gauge needle position
  const scoreVal = parseInt(c.stat?.value || "72", 10);
  const scoreLabel = c.stat?.label || "Resume Readiness Score";
  const clampedScore = Math.min(100, Math.max(0, scoreVal));

  // # Calculate needle angle: 0% = -90deg (left), 100% = 90deg (right)
  const needleAngle = -90 + (clampedScore / 100) * 180;

  // # SVG arc for the gauge â€” semi-circle from left to right
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

  // # Needle â€” from center, pointing at the score angle
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
      <div class="d206-tip">${esc(c.cta || "Check your readiness score â†’ jobpilotai.co")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T207 â€” THE NOTIFICATION (Light, phone notification stack â€” Instagram 4:5)
   # Cascading phone notifications showing job search alerts
   ============================================================ */
function t207(c: TemplateContent, w: number, h: number): string {
  // # Notification items â€” each is a phone notification card
  const notifications = c.tips || [
    { title: "Resume Score Updated", description: "Your ATS match jumped from 54% to 91% for Product Manager at Stripe" },
    { title: "New Job Match Found", description: "Senior PM role at Notion â€” 94% match with your optimized resume" },
    { title: "Interview Prep Ready", description: "12 company-specific questions generated based on Notion's recent earnings call" },
    { title: "Application Deadline", description: "Stripe PM role closes in 48 hours â€” your cover letter is ready to send" },
  ];

  // # Notification icon backgrounds â€” each gets a different accent
  const iconColors = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];
  const iconSymbols = ["â†‘", "â˜…", "?", "!"];

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
      <div class="d207-tip">${esc(c.cta || "Start getting these notifications â†’ jobpilotai.co")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T208 â€” THE LABEL (Warm, nutrition label style â€” Instagram 4:5)
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
      <div class="d208-tip">${esc(c.cta || "Check your resume's ingredients â†’ jobpilotai.co")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T209 â€” THE STACK RANK (Bold teal, ranked comparison bars)
   # LinkedIn 4:5 â€” vibrant teal background with white/cream content,
   # stacked bars ranking items best-to-worst with score badges
   ============================================================ */
function t209(c: TemplateContent, w: number, h: number): string {
  // # 5 ranked items with scores
  const items = c.items || [
    { text: "Tailored resume per role", value: "94", highlighted: true },
    { text: "LinkedIn with custom headline", value: "87" },
    { text: "Generic resume, strong skills", value: "62" },
    { text: "Cold applying without research", value: "38" },
    { text: "Mass-apply with one resume", value: "12" },
  ];

  const css = `
.d209{width:${PW}px;height:${PH}px;background:linear-gradient(155deg,#0D9488,#14B8A6 40%,#2DD4BF);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d209::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,.1),transparent 70%);pointer-events:none;}
.d209::after{content:'';position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(0,0,0,.08),transparent 70%);pointer-events:none;}
.d209 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d209-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 1px 2px rgba(0,0,0,.1);}
.d209-sub{font-size:9.5px;color:rgba(255,255,255,.6);margin-bottom:16px;}
.d209-list{display:flex;flex-direction:column;gap:6px;flex:1;justify-content:center;}
.d209-row{display:flex;align-items:center;gap:8px;}
.d209-rank{font-family:${MONO};font-size:9px;font-weight:600;color:rgba(255,255,255,.4);width:16px;text-align:center;}
.d209-rank.top{color:#fff;}
.d209-track{flex:1;height:34px;background:rgba(0,0,0,.12);border-radius:6px;position:relative;overflow:hidden;}
.d209-fill{height:100%;border-radius:6px;display:flex;align-items:center;padding:0 10px;gap:6px;}
.d209-fill.top{background:rgba(255,255,255,.95);}
.d209-fill.top .d209-label{color:#0D9488;}
.d209-fill.top .d209-score{color:#0D9488;}
.d209-fill.mid{background:rgba(255,255,255,.35);}
.d209-fill.low{background:rgba(255,255,255,.15);}
.d209-label{font-size:8.5px;font-weight:600;color:rgba(255,255,255,.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.d209-score{font-family:${MONO};font-size:10px;font-weight:700;color:#fff;margin-left:auto;white-space:nowrap;}
.d209-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(13,148,136,.3);border:1px solid rgba(13,148,136,.5);border-radius:4px;padding:1px 5px;font-family:${MONO};font-size:7px;font-weight:600;color:#0D9488;margin-left:6px;}
.d209-insight{font-size:9px;font-weight:600;color:#fff;text-align:center;margin-top:auto;padding-top:8px;text-shadow:0 1px 2px rgba(0,0,0,.1);}`;

  const rowsHtml = items.slice(0, 6).map((item, i) => {
    // # Calculate bar width as percentage of max value
    const val = parseInt(String(item.value || "0"));
    const barWidth = Math.max(20, val);
    const isTop = i === 0 || item.highlighted;
    const tierClass = isTop ? "top" : val > 50 ? "mid" : "low";
    const rankClass = isTop ? "top" : "";
    const badge = isTop ? `<span class="d209-badge">BEST</span>` : "";

    return `<div class="d209-row">
      <div class="d209-rank ${rankClass}">#${i + 1}</div>
      <div class="d209-track">
        <div class="d209-fill ${tierClass}" style="width:${barWidth}%;">
          <span class="d209-label">${esc(item.text)}${badge}</span>
          <span class="d209-score">${esc(String(item.value || ""))}%</span>
        </div>
      </div>
    </div>`;
  }).join("");

  const body = `<div class="d209">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Strategy Ranking", "rgba(99,102,241,.45)")}
      <h2 class="d209-tt">${esc(c.headline || "Job Search Strategies Ranked by Interview Rate")}</h2>
      <p class="d209-sub">${esc(c.subheadline || "Based on outcomes from 5,200+ job seekers tracked over 6 months")}</p>
      <div class="d209-list">${rowsHtml}</div>
      <div class="d209-insight">${esc(c.cta || "Tailoring beats volume every single time")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T210 â€” THE SCORECARD (Warm cream + coral accents, assessment card)
   # LinkedIn 4:5 â€” warm cream background with coral/amber accents,
   # progress ring, category bars, pass/fail verdict
   ============================================================ */
function t210(c: TemplateContent, w: number, h: number): string {
  // # Overall score
  const score = c.score || 72;
  // # Category breakdowns
  const categories = c.bars || [
    { label: "Keywords & ATS Match", value: 85 },
    { label: "Formatting & Layout", value: 78 },
    { label: "Impact Statements", value: 64 },
    { label: "Skills Alignment", value: 71 },
    { label: "Summary Strength", value: 58 },
  ];
  // # Verdict based on score
  const isPassing = score >= 70;

  const css = `
.d210{width:${PW}px;height:${PH}px;background:#FFF7ED;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d210::before{content:'';position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(251,146,60,.1),transparent 70%);pointer-events:none;}
.d210 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d210-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#1C1917;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d210-sub{font-size:9.5px;color:#A8A29E;margin-bottom:14px;}
.d210-card{background:#fff;border:1px solid #FED7AA;border-radius:10px;padding:16px;flex:1;display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(251,146,60,.06);}
.d210-top{display:flex;align-items:center;gap:14px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #FEF3C7;}
.d210-ring{position:relative;width:60px;height:60px;flex-shrink:0;}
.d210-ring svg{transform:rotate(-90deg);}
.d210-ring-val{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:${DISP};font-size:18px;font-weight:800;color:#1C1917;}
.d210-verdict{flex:1;}
.d210-verdict-label{font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;}
.d210-verdict-text{font-family:${DISP};font-size:13px;font-weight:700;color:#1C1917;margin-top:2px;}
.d210-cats{display:flex;flex-direction:column;gap:7px;flex:1;justify-content:center;}
.d210-cat{display:flex;align-items:center;gap:8px;}
.d210-cat-label{font-size:9px;font-weight:600;color:#78716C;width:130px;flex-shrink:0;}
.d210-cat-track{flex:1;height:8px;background:#FEF3C7;border-radius:4px;overflow:hidden;}
.d210-cat-fill{height:100%;border-radius:4px;}
.d210-cat-val{font-family:${MONO};font-size:9px;font-weight:700;width:28px;text-align:right;}`;

  // # SVG progress ring
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = isPassing ? "#F97316" : "#EF4444";
  const verdictColor = isPassing ? "#EA580C" : "#DC2626";
  const verdictBg = isPassing ? "#FFF7ED" : "#FEF2F2";
  const verdictText = isPassing ? "PASSING" : "NEEDS WORK";

  const ringHtml = `<div class="d210-ring">
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="24" fill="none" stroke="#F0EEEA" stroke-width="5"/>
      <circle cx="30" cy="30" r="24" fill="none" stroke="${ringColor}" stroke-width="5"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
    </svg>
    <div class="d210-ring-val">${score}</div>
  </div>`;

  const catsHtml = categories.slice(0, 6).map(cat => {
    const barColor = cat.value >= 75 ? "#F97316" : cat.value >= 50 ? "#FBBF24" : "#EF4444";
    const valColor = cat.value >= 75 ? "#EA580C" : cat.value >= 50 ? "#D97706" : "#DC2626";
    return `<div class="d210-cat">
      <span class="d210-cat-label">${esc(cat.label)}</span>
      <div class="d210-cat-track"><div class="d210-cat-fill" style="width:${cat.value}%;background:${barColor};"></div></div>
      <span class="d210-cat-val" style="color:${valColor};">${cat.value}%</span>
    </div>`;
  }).join("");

  const body = `<div class="d210">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Resume Analysis", "#6366F1")}
      <h2 class="d210-tt">${esc(c.headline || "Your Resume Scorecard")}</h2>
      <p class="d210-sub">${esc(c.subheadline || "AI analysis across 5 critical dimensions")}</p>
      <div class="d210-card">
        <div class="d210-top">
          ${ringHtml}
          <div class="d210-verdict">
            <div class="d210-verdict-label" style="color:${verdictColor};">${verdictText}</div>
            <div class="d210-verdict-text">${esc(c.body || "Strong foundation with 2 areas to improve before applying")}</div>
            <div style="display:inline-block;margin-top:4px;padding:2px 6px;border-radius:3px;background:${verdictBg};font-size:7.5px;font-weight:700;color:${verdictColor};">${score}/100 Overall</div>
          </div>
        </div>
        <div class="d210-cats">${catsHtml}</div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T211 â€” THE TIMELINE (Rich indigo gradient, event cards)
   # LinkedIn 4:5 â€” bold indigo-to-violet gradient background,
   # vertical timeline rail with frosted glass event cards
   ============================================================ */
function t211(c: TemplateContent, w: number, h: number): string {
  // # Timeline events
  const events = c.steps || [
    { label: "Week 1", title: "Resume Overhaul", description: "Rewrite with ATS keywords, quantified impact, clean format" },
    { label: "Week 2", title: "LinkedIn Optimization", description: "Custom headline, About section, featured posts, 500+ connections" },
    { label: "Week 3", title: "Targeted Applications", description: "20 tailored apps to dream companies, tracked in spreadsheet" },
    { label: "Week 4", title: "Interview Sprint", description: "Mock interviews, STAR stories, salary research, offer negotiation" },
  ];

  const css = `
.d211{width:${PW}px;height:${PH}px;background:linear-gradient(160deg,#312E81,#4338CA 40%,#6366F1 80%,#818CF8);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d211::before{content:'';position:absolute;top:-40px;left:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(255,255,255,.08),transparent 70%);pointer-events:none;}
.d211::after{content:'';position:absolute;bottom:-50px;right:-50px;width:200px;height:200px;background:radial-gradient(circle,rgba(167,139,250,.15),transparent 70%);pointer-events:none;}
.d211 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d211-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 1px 3px rgba(0,0,0,.15);}
.d211-sub{font-size:9.5px;color:rgba(255,255,255,.55);margin-bottom:14px;}
.d211-rail{display:flex;flex-direction:column;gap:0;flex:1;justify-content:center;position:relative;padding-left:24px;}
.d211-rail::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,.2));border-radius:1px;}
.d211-ev{display:flex;gap:12px;position:relative;padding:6px 0;}
.d211-dot{position:absolute;left:-21px;top:10px;width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(99,102,241,.6);z-index:2;}
.d211-dot.active{background:#fff;border-color:#fff;box-shadow:0 0 10px rgba(255,255,255,.3);}
.d211-card{background:rgba(255,255,255,.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:10px 12px;flex:1;}
.d211-card.active{border-color:rgba(255,255,255,.35);background:rgba(255,255,255,.2);}
.d211-label{font-family:${MONO};font-size:7.5px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}
.d211-label.active{color:rgba(255,255,255,.8);}
.d211-card-title{font-family:${DISP};font-size:12px;font-weight:700;color:#fff;margin-bottom:3px;}
.d211-card-desc{font-size:8.5px;line-height:1.45;color:rgba(255,255,255,.5);}
.d211-cta{font-size:9px;font-weight:600;color:#fff;text-align:center;margin-top:auto;padding-top:8px;text-shadow:0 1px 2px rgba(0,0,0,.1);}`;

  const eventsHtml = events.slice(0, 5).map((ev, i) => {
    const isActive = i === 0;
    const dotClass = isActive ? "d211-dot active" : "d211-dot";
    const cardClass = isActive ? "d211-card active" : "d211-card";
    const labelClass = isActive ? "d211-label active" : "d211-label";
    return `<div class="d211-ev">
      <div class="${dotClass}"></div>
      <div class="${cardClass}">
        <div class="${labelClass}">${esc(ev.label || `Step ${i + 1}`)}</div>
        <div class="d211-card-title">${esc(ev.title)}</div>
        <div class="d211-card-desc">${esc(ev.description || "")}</div>
      </div>
    </div>`;
  }).join("");

  const body = `<div class="d211">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Career Plan", "rgba(99,102,241,.45)")}
      <h2 class="d211-tt">${esc(c.headline || "The 4-Week Job Search Sprint")}</h2>
      <p class="d211-sub">${esc(c.subheadline || "A proven week-by-week system for landing interviews faster")}</p>
      <div class="d211-rail">${eventsHtml}</div>
      <div class="d211-cta">${esc(c.cta || "Start your sprint at jobpilotai.co")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T212 â€” THE VERSUS (Clean white + bold red/green, comparison)
   # LinkedIn 4:5 â€” bright white card with vivid red vs green columns,
   # head-to-head comparison with check/cross markers
   ============================================================ */
function t212(c: TemplateContent, w: number, h: number): string {
  // # Comparison items (left = option A, right = option B)
  const optionA = c.beforeText || "Manual Approach";
  const optionB = c.afterText || "With JobPilot AI";
  const rows = c.tips || [
    { title: "Resume tailoring", description: "2-3 hours per application vs 30 seconds" },
    { title: "ATS keyword matching", description: "Guesswork vs AI-powered analysis" },
    { title: "Cover letter writing", description: "Copy-paste template vs role-specific generation" },
    { title: "Interview preparation", description: "Generic Googling vs company-specific Q&A" },
    { title: "Application tracking", description: "Spreadsheet chaos vs built-in pipeline" },
  ];

  const css = `
.d212{width:${PW}px;height:${PH}px;background:#FAFAF9;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d212 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d212-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#1C1917;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d212-sub{font-size:9.5px;color:#A8A29E;margin-bottom:14px;}
.d212-table{flex:1;display:flex;flex-direction:column;justify-content:center;}
.d212-header{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;}
.d212-colA{background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:8px 10px;text-align:center;}
.d212-colB{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:8px 10px;text-align:center;}
.d212-col-name{font-family:${DISP};font-size:10px;font-weight:700;}
.d212-colA .d212-col-name{color:#DC2626;}
.d212-colB .d212-col-name{color:#16A34A;}
.d212-rows{display:flex;flex-direction:column;gap:4px;}
.d212-row{display:grid;grid-template-columns:1fr 1fr;gap:4px;}
.d212-cellA{background:#fff;border:1px solid #FEE2E2;border-radius:6px;padding:8px 10px;display:flex;align-items:flex-start;gap:6px;}
.d212-cellB{background:#fff;border:1px solid #D1FAE5;border-radius:6px;padding:8px 10px;display:flex;align-items:flex-start;gap:6px;}
.d212-icon{width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;flex-shrink:0;margin-top:1px;}
.d212-icon.bad{background:#FEE2E2;color:#DC2626;}
.d212-icon.good{background:#D1FAE5;color:#16A34A;}
.d212-cell-title{font-size:8.5px;font-weight:700;color:#1C1917;margin-bottom:1px;}
.d212-cell-desc{font-size:7.5px;color:#78716C;line-height:1.35;}
.d212-winner{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:auto;padding-top:8px;}
.d212-winner-badge{background:linear-gradient(135deg,#16A34A,#22C55E);border-radius:4px;padding:3px 8px;font-size:8px;font-weight:700;color:#fff;letter-spacing:.04em;}`;

  const rowsHtml = rows.slice(0, 6).map(row => {
    // # Split description by "vs" to get A and B sides
    const parts = (row.description || "").split(/\s+vs\.?\s+/i);
    const descA = parts[0] || row.description || "";
    const descB = parts[1] || "";

    return `<div class="d212-row">
      <div class="d212-cellA">
        <div class="d212-icon bad">x</div>
        <div><div class="d212-cell-title">${esc(row.title)}</div><div class="d212-cell-desc">${esc(descA)}</div></div>
      </div>
      <div class="d212-cellB">
        <div class="d212-icon good">&#10003;</div>
        <div><div class="d212-cell-title">${esc(row.title)}</div><div class="d212-cell-desc">${esc(descB || descA)}</div></div>
      </div>
    </div>`;
  }).join("");

  const body = `<div class="d212">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Comparison", "rgba(99,102,241,.45)")}
      <h2 class="d212-tt">${esc(c.headline || "Manual Job Search vs AI-Powered")}</h2>
      <p class="d212-sub">${esc(c.subheadline || "Side-by-side breakdown of time, effort, and results")}</p>
      <div class="d212-table">
        <div class="d212-header">
          <div class="d212-colA"><div class="d212-col-name">${esc(optionA)}</div></div>
          <div class="d212-colB"><div class="d212-col-name">${esc(optionB)}</div></div>
        </div>
        <div class="d212-rows">${rowsHtml}</div>
      </div>
      <div class="d212-winner">
        <span class="d212-winner-badge">CLEAR WINNER</span>
        <span style="font-size:9px;font-weight:600;color:#16A34A;">${esc(optionB)}</span>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T213 â€” THE CHEAT SHEET (Soft lavender, dense reference card)
   # LinkedIn 4:5 â€” lavender background with white content cards,
   # organized reference sections, maximum information density.
   ============================================================ */
function t213(c: TemplateContent, w: number, h: number): string {
  // # Sections with items
  const tips = c.tips || [
    { title: "Power Verbs", description: "Led, Increased, Reduced, Launched, Negotiated, Automated" },
    { title: "Quantify Everything", description: "Revenue +34%, Team of 12, 50K users, Saved $200K annually" },
    { title: "ATS Keywords", description: "Mirror exact phrases from job posting, not synonyms" },
  ];
  const tags = c.tags || ["Google Docs", "Single Column", "Standard Fonts", "No Headers/Footers", "PDF Export"];
  const bullets = c.bullets || [
    "Remove graduation dates if 10+ years ago",
    "Delete 'References available upon request'",
    "Cut any role older than 15 years",
  ];

  const css = `
.d213{width:${PW}px;height:${PH}px;background:linear-gradient(170deg,#EDE9FE,#F5F3FF 40%,#FAF5FF);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d213::before{content:'';position:absolute;bottom:-30px;right:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(139,92,246,.08),transparent 70%);pointer-events:none;}
.d213 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d213-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#1E1B4B;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d213-sub{font-size:9.5px;color:#7C3AED;margin-bottom:12px;font-weight:500;}
.d213-sections{flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center;}
.d213-sec{background:#fff;border:1px solid #DDD6FE;border-radius:8px;padding:10px 12px;box-shadow:0 1px 4px rgba(139,92,246,.05);}
.d213-sec-head{display:flex;align-items:center;gap:6px;margin-bottom:6px;}
.d213-sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.d213-sec-title{font-family:${DISP};font-size:10px;font-weight:700;color:#1E1B4B;letter-spacing:-.01em;}
.d213-sec-body{font-size:8.5px;line-height:1.5;color:#6B7280;}
.d213-sec-body strong{color:#1E1B4B;font-weight:700;}
.d213-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.d213-tag{font-family:${MONO};font-size:7.5px;font-weight:500;color:#7C3AED;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.15);border-radius:3px;padding:2px 6px;}
.d213-removes{background:#fff;border:1px solid #DDD6FE;border-radius:8px;padding:10px 12px;box-shadow:0 1px 4px rgba(139,92,246,.05);}
.d213-rem-title{font-family:${DISP};font-size:10px;font-weight:700;color:#DC2626;margin-bottom:5px;display:flex;align-items:center;gap:5px;}
.d213-rem-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:3px;}
.d213-rem-item{font-size:8.5px;color:#6B7280;display:flex;align-items:center;gap:5px;}
.d213-rem-item::before{content:'x';font-size:7px;font-weight:700;color:#EF4444;background:rgba(239,68,68,.08);border-radius:50%;width:12px;height:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.d213-save{text-align:center;font-size:8.5px;font-weight:600;color:#7C3AED;margin-top:auto;padding-top:8px;}`;

  const secColors = ["#7C3AED", "#A78BFA", "#C084FC"];
  const tipsHtml = tips.slice(0, 4).map((tip, i) => {
    const color = secColors[i % secColors.length];
    return `<div class="d213-sec">
      <div class="d213-sec-head">
        <div class="d213-sec-dot" style="background:${color};"></div>
        <div class="d213-sec-title">${esc(tip.title)}</div>
      </div>
      <div class="d213-sec-body">${esc(tip.description)}</div>
    </div>`;
  }).join("");

  const tagsHtml = tags.slice(0, 6).map(t => `<span class="d213-tag">${esc(t)}</span>`).join("");

  const removesHtml = bullets.slice(0, 4).map(b => `<li class="d213-rem-item">${esc(b)}</li>`).join("");

  const body = `<div class="d213">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Reference Card", "#6366F1")}
      <h2 class="d213-tt">${esc(c.headline || "The Resume Cheat Sheet")}</h2>
      <p class="d213-sub">${esc(c.subheadline || "Everything you need on one card. Save this.")}</p>
      <div class="d213-sections">
        ${tipsHtml}
        <div class="d213-sec">
          <div class="d213-sec-head">
            <div class="d213-sec-dot" style="background:#818CF8;"></div>
            <div class="d213-sec-title">Format Rules</div>
          </div>
          <div class="d213-tags">${tagsHtml}</div>
        </div>
        <div class="d213-removes">
          <div class="d213-rem-title">Remove These</div>
          <ul class="d213-rem-list">${removesHtml}</ul>
        </div>
      </div>
      <div class="d213-save">${esc(c.cta || "Bookmark this for your next application")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T214 â€” THE DASHBOARD (Bold navy + bright accents, KPI cards)
   # LinkedIn 4:5 â€” deep navy background with bright cyan/green/amber
   # KPI cards, bar chart, and trend indicators
   ============================================================ */
function t214(c: TemplateContent, w: number, h: number): string {
  // # KPI cards
  const kpis = c.items || [
    { text: "Applications Sent", value: "142", highlighted: false },
    { text: "Response Rate", value: "23%", highlighted: true },
    { text: "Interviews Booked", value: "18", highlighted: false },
    { text: "Avg. Days to Reply", value: "4.2", highlighted: false },
  ];
  // # Trend bars (weekly data)
  const bars = c.bars || [
    { label: "W1", value: 12 },
    { label: "W2", value: 18 },
    { label: "W3", value: 24 },
    { label: "W4", value: 31 },
    { label: "W5", value: 28 },
    { label: "W6", value: 37 },
    { label: "W7", value: 42 },
    { label: "W8", value: 48 },
  ];

  const maxBar = Math.max(...bars.map(b => b.value), 1);

  const css = `
.d214{width:${PW}px;height:${PH}px;background:linear-gradient(165deg,#0F172A,#1E293B 60%,#334155);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d214::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(6,182,212,.1),transparent 70%);pointer-events:none;}
.d214::after{content:'';position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(250,204,21,.06),transparent 70%);pointer-events:none;}
.d214 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d214-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#F1F5F9;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d214-sub{font-size:9.5px;color:rgba(148,163,184,.6);margin-bottom:14px;}
.d214-kpis{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;}
.d214-kpi{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 12px;}
.d214-kpi.hl{border-color:rgba(6,182,212,.3);background:rgba(6,182,212,.08);}
.d214-kpi-val{font-family:${DISP};font-size:22px;font-weight:800;color:#F1F5F9;font-variant-numeric:tabular-nums;}
.d214-kpi.hl .d214-kpi-val{color:#22D3EE;}
.d214-kpi-label{font-size:8px;color:rgba(148,163,184,.4);margin-top:2px;}
.d214-kpi-trend{font-family:${MONO};font-size:7px;font-weight:600;margin-top:3px;}
.d214-chart{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:12px;flex:1;display:flex;flex-direction:column;}
.d214-chart-title{font-size:9px;font-weight:700;color:rgba(148,163,184,.5);margin-bottom:8px;}
.d214-bars{display:flex;align-items:flex-end;gap:4px;flex:1;}
.d214-bar-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.d214-bar-fill{width:100%;border-radius:3px 3px 0 0;min-height:4px;}
.d214-bar-label{font-family:${MONO};font-size:6.5px;color:rgba(148,163,184,.3);}
.d214-bar-val{font-family:${MONO};font-size:7px;font-weight:600;color:rgba(148,163,184,.5);}
.d214-insight{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:auto;padding-top:8px;}
.d214-insight-badge{font-family:${MONO};font-size:7px;font-weight:600;color:#34D399;background:rgba(52,211,153,.12);border-radius:3px;padding:2px 5px;}`;

  const kpisHtml = kpis.slice(0, 4).map((kpi, i) => {
    const hlClass = kpi.highlighted ? " hl" : "";
    // # Generate a fake trend for visual interest
    const trends = ["+12%", "+23%", "+8%", "-1.3d"];
    const trendColor = trends[i]?.startsWith("+") ? "#22D3EE" : "#FB923C";
    return `<div class="d214-kpi${hlClass}">
      <div class="d214-kpi-val">${esc(String(kpi.value || ""))}</div>
      <div class="d214-kpi-label">${esc(kpi.text)}</div>
      <div class="d214-kpi-trend" style="color:${trendColor};">${trends[i] || ""} vs last month</div>
    </div>`;
  }).join("");

  const barsHtml = bars.slice(0, 10).map((bar, i) => {
    const height = Math.round((bar.value / maxBar) * 100);
    const isLast = i === bars.length - 1;
    const barBg = isLast
      ? "linear-gradient(180deg,#22D3EE,#06B6D4)"
      : `rgba(6,182,212,${0.15 + (i / bars.length) * 0.35})`;
    return `<div class="d214-bar-col">
      <div class="d214-bar-val">${bar.value}</div>
      <div class="d214-bar-fill" style="height:${height}%;background:${barBg};"></div>
      <div class="d214-bar-label">${esc(bar.label)}</div>
    </div>`;
  }).join("");

  const body = `<div class="d214">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Analytics", "rgba(99,102,241,.45)")}
      <h2 class="d214-tt">${esc(c.headline || "Your Job Search Dashboard This Month")}</h2>
      <p class="d214-sub">${esc(c.subheadline || "Real-time metrics from your application pipeline")}</p>
      <div class="d214-kpis">${kpisHtml}</div>
      <div class="d214-chart">
        <div class="d214-chart-title">Weekly Application Volume</div>
        <div class="d214-bars">${barsHtml}</div>
      </div>
      <div class="d214-insight">
        <span class="d214-insight-badge">+42% MoM</span>
        <span style="font-size:8.5px;color:rgba(148,163,184,.5);">${esc(c.cta || "Response rate trending up since resume optimization")}</span>
      </div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T215 â€” THE MANIFESTO (Warm amber gradient, bold statement)
   # LinkedIn 4:5 â€” rich amber/gold gradient, big opening statement
   # with supporting paragraph blocks and strong closing line.
   # Pure text â€” no numbers, no percentages.
   ============================================================ */
function t215(c: TemplateContent, w: number, h: number): string {
  // # Supporting paragraphs
  const tips = c.tips || [
    { title: "Stop optimizing for algorithms", description: "The best resumes are written for humans first. A real person reads the top third before anything else." },
    { title: "Skills decay faster than you think", description: "What made you competitive two years ago is table stakes today. Continuous reinvention is the only moat." },
    { title: "Your network is not your safety net", description: "Connections only convert when you have given before you needed. Start building equity now, not when you are desperate." },
  ];

  const css = `
.d215{width:${PW}px;height:${PH}px;background:linear-gradient(155deg,#92400E,#B45309 35%,#D97706 70%,#F59E0B);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d215::before{content:'';position:absolute;top:-50px;right:-50px;width:180px;height:180px;background:radial-gradient(circle,rgba(255,255,255,.08),transparent 70%);pointer-events:none;}
.d215::after{content:'';position:absolute;bottom:-40px;left:30%;width:200px;height:200px;background:radial-gradient(circle,rgba(0,0,0,.06),transparent 70%);pointer-events:none;}
.d215 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d215-tt{font-family:${DISP};font-size:26px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.08;margin-bottom:6px;text-shadow:0 2px 4px rgba(0,0,0,.12);}
.d215-sub{font-size:10px;color:rgba(255,255,255,.55);margin-bottom:18px;line-height:1.5;}
.d215-divider{width:32px;height:2px;background:rgba(255,255,255,.35);border-radius:1px;margin-bottom:16px;}
.d215-blocks{display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center;}
.d215-block{border-left:3px solid rgba(255,255,255,.3);padding-left:14px;}
.d215-block-title{font-family:${DISP};font-size:11px;font-weight:700;color:#fff;margin-bottom:3px;letter-spacing:-.01em;}
.d215-block-body{font-size:11.5px;line-height:1.5;color:rgba(255,255,255,.6);}
.d215-closer{font-family:${DISP};font-size:12px;font-weight:700;color:#fff;text-align:center;margin-top:auto;padding-top:12px;letter-spacing:-.01em;text-shadow:0 1px 2px rgba(0,0,0,.1);}`;

  // # Build paragraph blocks
  const blocksHtml = tips.slice(0, 4).map(tip =>
    `<div class="d215-block">
      <div class="d215-block-title">${esc(tip.title)}</div>
      <div class="d215-block-body">${esc(tip.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d215">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Career Manifesto", "rgba(255,255,255,.45)")}
      <h2 class="d215-tt">${esc(c.headline || "Everything You Think You Know About Job Searching Is Wrong")}</h2>
      <p class="d215-sub">${esc(c.subheadline || "A few uncomfortable truths that changed how I approach career moves")}</p>
      <div class="d215-divider"></div>
      <div class="d215-blocks">${blocksHtml}</div>
      <div class="d215-closer">${esc(c.cta || "The job market rewards clarity over conformity")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T216 â€” THE FRAMEWORK (Clean white + emerald, named pillars)
   # LinkedIn 4:5 â€” crisp white background with emerald/green accents,
   # named framework with pillar cards described in pure text.
   # No numbers â€” concept-driven.
   ============================================================ */
function t216(c: TemplateContent, w: number, h: number): string {
  // # Framework pillars
  const tips = c.tips || [
    { title: "Clarity", description: "Know what role you want, what you bring, and what you will not compromise on. Vague goals produce vague results." },
    { title: "Proof", description: "Every claim on your resume needs a story behind it. If you cannot explain the impact in one sentence, rewrite it." },
    { title: "Reach", description: "Apply to fewer roles, but invest more in each one. A tailored application beats ten generic ones every time." },
    { title: "Timing", description: "The best opportunities surface before they are posted. Build relationships early, and you get the call first." },
  ];

  const css = `
.d216{width:${PW}px;height:${PH}px;background:#FAFAF9;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d216::before{content:'';position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:radial-gradient(circle,rgba(5,150,105,.06),transparent 70%);pointer-events:none;}
.d216 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d216-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#1C1917;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d216-sub{font-size:9.5px;color:#6B7280;margin-bottom:14px;line-height:1.5;}
.d216-name{display:inline-flex;align-items:center;gap:5px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:5px;padding:4px 10px;font-family:${DISP};font-size:9px;font-weight:700;color:#059669;letter-spacing:.04em;text-transform:uppercase;margin-bottom:12px;}
.d216-pillars{display:flex;flex-direction:column;gap:6px;flex:1;justify-content:center;}
.d216-pillar{background:#fff;border:1px solid #D1FAE5;border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 1px 3px rgba(5,150,105,.04);}
.d216-pip{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px;}
.d216-pillar-content{flex:1;}
.d216-pillar-title{font-family:${DISP};font-size:12px;font-weight:700;color:#1C1917;margin-bottom:3px;letter-spacing:-.01em;}
.d216-pillar-desc{font-size:11px;line-height:1.5;color:#6B7280;}
.d216-bottom{font-size:9px;font-weight:600;color:#059669;text-align:center;margin-top:auto;padding-top:10px;}`;

  // # Emerald shade variations for each pillar dot
  const dotColors = ["#059669", "#10B981", "#34D399", "#6EE7B7"];

  const pillarsHtml = tips.slice(0, 4).map((tip, i) =>
    `<div class="d216-pillar">
      <div class="d216-pip" style="background:${dotColors[i % dotColors.length]};"></div>
      <div class="d216-pillar-content">
        <div class="d216-pillar-title">${esc(tip.title)}</div>
        <div class="d216-pillar-desc">${esc(tip.description)}</div>
      </div>
    </div>`
  ).join("");

  const body = `<div class="d216">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Framework", "#6366F1")}
      <h2 class="d216-tt">${esc(c.headline || "The CPRT Framework for Landing Your Next Role")}</h2>
      <p class="d216-sub">${esc(c.subheadline || "Four pillars that separate strategic job seekers from everyone else")}</p>
      <div class="d216-name">${esc(c.body || "CPRT Method")}</div>
      <div class="d216-pillars">${pillarsHtml}</div>
      <div class="d216-bottom">${esc(c.cta || "Strategy beats volume. Always.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T217 â€” THE LETTER (Soft rose gradient, open letter format)
   # LinkedIn 4:5 â€” gentle rose/blush gradient, handwritten-feel
   # open letter with greeting, flowing paragraphs, and signature.
   # Pure prose â€” no lists, no data, no numbers.
   ============================================================ */
function t217(c: TemplateContent, w: number, h: number): string {
  // # Letter paragraphs
  const paragraphs = c.bullets || [
    "I know you are tired. Tired of tailoring. Tired of waiting. Tired of the silence that follows every application.",
    "But here is what I have learned after watching thousands of job searches: the people who land are not the most qualified. They are the most intentional.",
    "One focused application, one real connection, one genuine conversation will always outperform a hundred copy-pasted tries.",
    "You are closer than you think. Keep going.",
  ];

  const css = `
.d217{width:${PW}px;height:${PH}px;background:linear-gradient(165deg,#FDF2F8,#FCE7F3 40%,#FBCFE8 85%,#F9A8D4);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d217::before{content:'';position:absolute;top:-30px;left:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(244,63,94,.06),transparent 70%);pointer-events:none;}
.d217::after{content:'';position:absolute;bottom:-40px;right:-20px;width:160px;height:160px;background:radial-gradient(circle,rgba(236,72,153,.08),transparent 70%);pointer-events:none;}
.d217 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 20px 8px;flex:1;}
.d217-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#831843;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d217-greeting{font-family:${DISP};font-size:13px;font-weight:700;color:#9D174D;margin-bottom:14px;margin-top:4px;}
.d217-letter{flex:1;display:flex;flex-direction:column;gap:10px;justify-content:center;padding:14px 16px;background:rgba(255,255,255,.45);border-radius:10px;border:1px solid rgba(244,63,94,.1);}
.d217-para{font-size:12px;line-height:1.6;color:#6B2142;}
.d217-sig{display:flex;flex-direction:column;align-items:flex-end;margin-top:12px;padding-top:8px;border-top:1px solid rgba(157,23,77,.1);}
.d217-sig-name{font-family:${DISP};font-size:11px;font-weight:700;color:#9D174D;letter-spacing:-.01em;}
.d217-sig-role{font-size:8px;color:rgba(107,33,66,.5);margin-top:1px;}`;

  // # Build letter paragraphs
  const parasHtml = paragraphs.slice(0, 5).map(p =>
    `<p class="d217-para">${esc(p)}</p>`
  ).join("");

  const body = `<div class="d217">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Open Letter", "#BE185D")}
      <h2 class="d217-tt">${esc(c.headline || "A Note to Every Job Seeker Running on Empty")}</h2>
      <div class="d217-greeting">${esc(c.subheadline || "Dear exhausted applicant,")}</div>
      <div class="d217-letter">
        ${parasHtml}
        <div class="d217-sig">
          <div class="d217-sig-name">${esc(c.afterText || "The JobPilot Team")}</div>
          <div class="d217-sig-role">${esc(c.cta || "We built this for you")}</div>
        </div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T218 â€” THE GLOSSARY (Deep forest green, term definitions)
   # LinkedIn 4:5 â€” rich dark green gradient, stacked definition
   # cards with terms and explanations. Dictionary-style layout.
   # Pure text definitions â€” no metrics, no charts.
   ============================================================ */
function t218(c: TemplateContent, w: number, h: number): string {
  // # Term definitions
  const tips = c.tips || [
    { title: "ATS", description: "The automated gatekeeper that scans your resume before a human ever sees it. If it cannot parse your format, you are invisible." },
    { title: "Keyword Stuffing", description: "Cramming buzzwords into your resume hoping the system picks them up. It backfires. Modern ATS measures context and relevance, not frequency." },
    { title: "Tailoring", description: "Rewriting your resume for each role so the language mirrors the job description. Not optional. This is the difference between getting seen and getting filtered." },
    { title: "Hidden Job Market", description: "Roles filled through referrals and internal moves before they are ever posted publicly. This is where most senior hires happen." },
  ];

  const css = `
.d218{width:${PW}px;height:${PH}px;background:linear-gradient(160deg,#064E3B,#065F46 50%,#047857);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d218::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(52,211,153,.08),transparent 70%);pointer-events:none;}
.d218::after{content:'';position:absolute;bottom:-30px;left:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(6,95,70,.3),transparent 70%);pointer-events:none;}
.d218 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d218-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#ECFDF5;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 1px 3px rgba(0,0,0,.15);}
.d218-sub{font-size:9.5px;color:rgba(167,243,208,.5);margin-bottom:14px;line-height:1.5;}
.d218-entries{display:flex;flex-direction:column;gap:6px;flex:1;justify-content:center;}
.d218-entry{background:rgba(255,255,255,.07);border:1px solid rgba(167,243,208,.12);border-radius:8px;padding:12px 14px;backdrop-filter:blur(4px);}
.d218-term{font-family:${DISP};font-size:13px;font-weight:800;color:#6EE7B7;margin-bottom:4px;letter-spacing:-.01em;}
.d218-def{font-size:11.5px;line-height:1.5;color:rgba(236,253,245,.8);}
.d218-accent{display:inline-block;width:3px;height:3px;border-radius:50%;background:#34D399;margin-right:6px;vertical-align:middle;}
.d218-footer-text{font-size:8.5px;font-weight:500;color:rgba(167,243,208,.35);text-align:center;margin-top:auto;padding-top:8px;}`;

  // # Build definition entries
  const entriesHtml = tips.slice(0, 5).map(tip =>
    `<div class="d218-entry">
      <div class="d218-term"><span class="d218-accent"></span>${esc(tip.title)}</div>
      <div class="d218-def">${esc(tip.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d218">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Glossary", "rgba(110,231,183,.4)")}
      <h2 class="d218-tt">${esc(c.headline || "Job Search Terms You Should Actually Understand")}</h2>
      <p class="d218-sub">${esc(c.subheadline || "The vocabulary that separates informed candidates from confused ones")}</p>
      <div class="d218-entries">${entriesHtml}</div>
      <div class="d218-footer-text">${esc(c.cta || "Know the language. Play the game.")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T219 â€” THE UNPACKED (Bright sky blue gradient, concept breakdown)
   # LinkedIn 4:5 â€” vivid sky blue gradient, takes one concept
   # and breaks it into "What / Why / How" text sections.
   # No numbers â€” pure explanatory prose.
   ============================================================ */
function t219(c: TemplateContent, w: number, h: number): string {
  // # Three sections: What, Why, How
  const sections = c.tips || [
    { title: "What it is", description: "Resume tailoring means rewriting parts of your resume so it mirrors the exact language, priorities, and keywords in a specific job description." },
    { title: "Why it matters", description: "Hiring managers and ATS systems both scan for pattern matches. A generic resume forces them to guess whether you fit. A tailored one makes the answer obvious." },
    { title: "How to do it", description: "Read the job posting three times. Highlight the recurring phrases. Rewrite your bullet points using those same words, backed by your real experience. It takes ten minutes and changes everything." },
  ];

  const css = `
.d219{width:${PW}px;height:${PH}px;background:linear-gradient(155deg,#0369A1,#0284C7 30%,#0EA5E9 65%,#38BDF8);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d219::before{content:'';position:absolute;top:-50px;left:-50px;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,.07),transparent 70%);pointer-events:none;}
.d219::after{content:'';position:absolute;bottom:-30px;right:-30px;width:140px;height:140px;background:radial-gradient(circle,rgba(2,132,199,.3),transparent 70%);pointer-events:none;}
.d219 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;}
.d219-tt{font-family:${DISP};font-size:24px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.08;margin-bottom:4px;text-shadow:0 2px 4px rgba(0,0,0,.1);}
.d219-sub{font-size:10px;color:rgba(255,255,255,.5);margin-bottom:16px;line-height:1.5;}
.d219-sections{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center;}
.d219-sec{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:14px 16px;backdrop-filter:blur(6px);}
.d219-sec-label{font-family:${MONO};font-size:7.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:5px;}
.d219-sec-title{font-family:${DISP};font-size:12px;font-weight:700;color:#fff;margin-bottom:4px;letter-spacing:-.01em;}
.d219-sec-body{font-size:11.5px;line-height:1.5;color:rgba(255,255,255,.85);}
.d219-takeaway{font-size:9.5px;font-weight:600;color:#fff;text-align:center;margin-top:auto;padding-top:10px;text-shadow:0 1px 2px rgba(0,0,0,.1);}`;

  // # Section labels
  const labels = ["01 â€”", "02 â€”", "03 â€”", "04 â€”"];

  const secsHtml = sections.slice(0, 4).map((sec, i) =>
    `<div class="d219-sec">
      <div class="d219-sec-label">${labels[i] || ""} ${esc(sec.title)}</div>
      <div class="d219-sec-body">${esc(sec.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d219">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Unpacked", "rgba(255,255,255,.4)")}
      <h2 class="d219-tt">${esc(c.headline || "Resume Tailoring, Explained in Plain English")}</h2>
      <p class="d219-sub">${esc(c.subheadline || "One concept. Three angles. Everything you need to know.")}</p>
      <div class="d219-sections">${secsHtml}</div>
      <div class="d219-takeaway">${esc(c.cta || "Simple concept. Life-changing habit.")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T220 â€” THE DIALOGUE (Warm stone/sand, Q&A format)
   # LinkedIn 4:5 â€” warm neutral stone background, alternating
   # question/answer pairs in conversational speech-bubble style.
   # Pure text â€” no data, no visuals.
   ============================================================ */
function t220(c: TemplateContent, w: number, h: number): string {
  // # Q&A pairs stored as tips (title=question, description=answer)
  const pairs = c.tips || [
    { title: "Should I use a skills-based or chronological resume?", description: "Chronological. Always. Hiring managers want to see your career story, not a skills list they cannot verify. The only exception is a genuine career pivot." },
    { title: "How long should my resume be?", description: "One page if you have fewer than ten years of experience. Two pages if you have more. Zero exceptions. Everything else is noise." },
    { title: "Do cover letters still matter?", description: "For the roles where they are optional, no one reads them. For the roles where they are required, everyone reads them. Match the effort to the ask." },
  ];

  const css = `
.d220{width:${PW}px;height:${PH}px;background:#F5F0EB;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d220::before{content:'';position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:radial-gradient(circle,rgba(180,83,9,.04),transparent 70%);pointer-events:none;}
.d220 .bd{display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;position:relative;z-index:1;}
.d220-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#292524;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d220-sub{font-size:9.5px;color:#78716C;margin-bottom:14px;line-height:1.5;}
.d220-pairs{display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center;}
.d220-pair{display:flex;flex-direction:column;gap:4px;}
.d220-q{background:#fff;border:1px solid #E7E5E4;border-radius:8px 8px 8px 2px;padding:10px 14px;position:relative;}
.d220-q::before{content:'Q';position:absolute;top:8px;left:-18px;width:14px;height:14px;background:#D97706;border-radius:3px;font-family:${MONO};font-size:7px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;}
.d220-q-text{font-family:${DISP};font-size:12px;font-weight:700;color:#292524;line-height:1.35;letter-spacing:-.01em;}
.d220-a{background:#292524;border-radius:8px 8px 2px 8px;padding:10px 14px;margin-left:20px;position:relative;}
.d220-a::before{content:'A';position:absolute;top:8px;right:-18px;width:14px;height:14px;background:#059669;border-radius:3px;font-family:${MONO};font-size:7px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;}
.d220-a-text{font-size:11.5px;line-height:1.5;color:rgba(245,240,235,.7);}
.d220-bottom{font-size:9px;font-weight:600;color:#78716C;text-align:center;margin-top:auto;padding-top:10px;}`;

  // # Build Q&A pairs
  const pairsHtml = pairs.slice(0, 4).map(pair =>
    `<div class="d220-pair">
      <div class="d220-q"><div class="d220-q-text">${esc(pair.title)}</div></div>
      <div class="d220-a"><div class="d220-a-text">${esc(pair.description)}</div></div>
    </div>`
  ).join("");

  const body = `<div class="d220">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Honest Answers", "#D97706")}
      <h2 class="d220-tt">${esc(c.headline || "Questions Everyone Asks But Nobody Answers Straight")}</h2>
      <p class="d220-sub">${esc(c.subheadline || "No fluff. No hedge. Just the real answer.")}</p>
      <div class="d220-pairs">${pairsHtml}</div>
      <div class="d220-bottom">${esc(c.cta || "Ask better questions. Get better results.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T221 â€” THE COMPASS (Dark navy + teal, four directional cards)
   # LinkedIn 4:5 â€” deep navy background with teal accent cards,
   # four direction-themed advice blocks. Pure text, no data.
   ============================================================ */
function t221(c: TemplateContent, w: number, h: number): string {
  // # Four direction cards
  const tips = c.tips || [
    { title: "Look Inward", description: "Before you search outward, name what you actually want. Role, pace, culture, growth. Clarity is the strategy most people skip." },
    { title: "Look Backward", description: "Your best proof is in your history. Mine your past work for stories that show impact, not just responsibility." },
    { title: "Look Around", description: "Study the market like a researcher, not a shopper. Understand what companies need right now, not what they needed last year." },
    { title: "Look Forward", description: "Position yourself for where the industry is going. The candidates who land are the ones who speak the language of tomorrow." },
  ];

  // # Teal icon shapes for each card
  const icons = ["&#9670;", "&#9671;", "&#9674;", "&#9675;"];

  const css = `
.d221{width:${PW}px;height:${PH}px;background:linear-gradient(170deg,#0F172A,#1E293B 60%,#0F172A);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d221::before{content:'';position:absolute;top:-60px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(20,184,166,.06),transparent 70%);pointer-events:none;}
.d221 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:20px 18px 6px;flex:1;min-height:0;}
.d221-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#F0FDFA;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 1px 3px rgba(0,0,0,.2);}
.d221-sub{font-size:9.5px;color:rgba(153,246,228,.4);margin-bottom:12px;line-height:1.5;}
.d221-cards{display:flex;flex-direction:column;gap:6px;flex:1;justify-content:center;min-height:0;}
.d221-card{background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.15);border-radius:8px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;}
.d221-icon{width:22px;height:22px;border-radius:5px;background:rgba(20,184,166,.15);display:flex;align-items:center;justify-content:center;font-size:10px;color:#5EEAD4;flex-shrink:0;margin-top:1px;}
.d221-card-title{font-family:${DISP};font-size:11.5px;font-weight:700;color:#99F6E4;margin-bottom:2px;letter-spacing:-.01em;}
.d221-card-desc{font-size:10.5px;line-height:1.5;color:rgba(240,253,250,.45);}
.d221-closer{font-size:9px;font-weight:600;color:rgba(153,246,228,.35);text-align:center;margin-top:auto;padding-top:8px;}`;

  const cardsHtml = tips.slice(0, 4).map((tip, i) =>
    `<div class="d221-card">
      <div class="d221-icon">${icons[i]}</div>
      <div>
        <div class="d221-card-title">${esc(tip.title)}</div>
        <div class="d221-card-desc">${esc(tip.description)}</div>
      </div>
    </div>`
  ).join("");

  const body = `<div class="d221">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Career Compass", "rgba(94,234,212,.35)")}
      <h2 class="d221-tt">${esc(c.headline || "Four Directions Every Job Seeker Should Look Before Moving")}</h2>
      <p class="d221-sub">${esc(c.subheadline || "A framework for seeing the full picture before you make your next move")}</p>
      <div class="d221-cards">${cardsHtml}</div>
      <div class="d221-closer">${esc(c.cta || "Direction first. Speed second.")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T222 â€” THE JOURNAL (Warm cream paper, personal reflection)
   # LinkedIn 4:5 â€” warm parchment background with subtle texture,
   # personal diary/reflection style with italic quotes and insight.
   ============================================================ */
function t222(c: TemplateContent, w: number, h: number): string {
  // # Journal paragraphs
  const paragraphs = c.bullets || [
    "I used to think job searching was about proving yourself to strangers. It is not. It is about finding the people who already need what you do best.",
    "The hardest lesson was learning that rejection is not feedback. It is noise. The only signal that matters is the conversation that follows.",
    "Today I know this: the best opportunities do not come from applying harder. They come from being visible to the right people, in the right rooms, saying the right things.",
  ];

  const css = `
.d222{width:${PW}px;height:${PH}px;background:#FAF7F2;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d222::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(180,140,100,.04) 28px,rgba(180,140,100,.04) 29px);pointer-events:none;}
.d222::after{content:'';position:absolute;left:46px;top:0;bottom:0;width:1px;background:rgba(220,80,80,.08);pointer-events:none;}
.d222 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:20px 18px 6px 52px;flex:1;min-height:0;}
.d222-date{font-family:${MONO};font-size:8px;color:#B8A080;letter-spacing:.06em;margin-bottom:12px;}
.d222-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#3F2E1E;letter-spacing:-.02em;line-height:1.15;margin-bottom:6px;}
.d222-sub{font-size:9.5px;color:#9C8B78;margin-bottom:12px;line-height:1.5;font-style:italic;}
.d222-entries{display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center;min-height:0;}
.d222-entry{font-size:11.5px;line-height:1.6;color:#5C4A3A;position:relative;padding-left:12px;border-left:2px solid rgba(180,140,100,.2);}
.d222-entry em{font-style:italic;color:#3F2E1E;font-weight:600;}
.d222-closer{font-family:${DISP};font-size:10px;font-weight:700;color:#9C8B78;text-align:right;margin-top:auto;padding-top:8px;font-style:italic;}`;

  const entriesHtml = paragraphs.slice(0, 4).map(p =>
    `<div class="d222-entry">${esc(p)}</div>`
  ).join("");

  const body = `<div class="d222">
    <div class="bd">
      <div class="d222-date">${esc(c.body || "Career Notes")}</div>
      ${eyebrow(c.eyebrow || "Reflection", "#B8A080")}
      <h2 class="d222-tt">${esc(c.headline || "What I Wish Someone Told Me Before I Started Searching")}</h2>
      <p class="d222-sub">${esc(c.subheadline || "Three lessons that changed how I think about career moves")}</p>
      <div class="d222-entries">${entriesHtml}</div>
      <div class="d222-closer">${esc(c.cta || "Write your own playbook.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T223 â€” THE CONTRAST (Split slate/white, opposing viewpoints)
   # LinkedIn 4:5 â€” split layout with dark top (myth) and light
   # bottom (truth), showing what people believe vs reality.
   ============================================================ */
function t223(c: TemplateContent, w: number, h: number): string {
  // # Contrast pairs stored as tips (title = myth, description = truth)
  const pairs = c.tips || [
    { title: "Apply to as many jobs as possible", description: "Three targeted applications with tailored resumes will outperform fifty generic ones every single time. Volume is a trap." },
    { title: "Your resume needs to list everything you have done", description: "Your resume is a highlight reel, not a biography. Cut anything older than ten years unless it is directly relevant to this role." },
    { title: "Networking means asking for favors", description: "Networking means building relationships before you need them. Give first. Ask second. The referrals follow naturally." },
  ];

  const css = `
.d223{width:${PW}px;height:${PH}px;background:#F8F9FA;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d223 .bd{display:flex;flex-direction:column;padding:20px 18px 6px;flex:1;min-height:0;}
.d223-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#1E293B;letter-spacing:-.03em;line-height:1.12;margin-bottom:5px;}
.d223-sub{font-size:9.5px;color:#64748B;margin-bottom:12px;line-height:1.5;}
.d223-pairs{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center;min-height:0;}
.d223-pair{border-radius:8px;overflow:hidden;border:1px solid #E2E8F0;}
.d223-myth{background:#1E293B;padding:9px 12px;position:relative;}
.d223-myth::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#EF4444;}
.d223-myth-label{font-family:${MONO};font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#F87171;margin-bottom:3px;}
.d223-myth-text{font-size:11px;font-weight:600;color:rgba(255,255,255,.7);line-height:1.4;}
.d223-truth{background:#fff;padding:9px 12px;position:relative;}
.d223-truth::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#10B981;}
.d223-truth-label{font-family:${MONO};font-size:7px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#10B981;margin-bottom:3px;}
.d223-truth-text{font-size:10.5px;color:#475569;line-height:1.5;}
.d223-closer{font-size:9px;font-weight:600;color:#64748B;text-align:center;margin-top:auto;padding-top:8px;}`;

  const pairsHtml = pairs.slice(0, 3).map(pair =>
    `<div class="d223-pair">
      <div class="d223-myth">
        <div class="d223-myth-label">What people believe</div>
        <div class="d223-myth-text">${esc(pair.title)}</div>
      </div>
      <div class="d223-truth">
        <div class="d223-truth-label">What is actually true</div>
        <div class="d223-truth-text">${esc(pair.description)}</div>
      </div>
    </div>`
  ).join("");

  const body = `<div class="d223">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Reality Check", "#6366F1")}
      <h2 class="d223-tt">${esc(c.headline || "Three Job Search Beliefs That Are Quietly Holding You Back")}</h2>
      <p class="d223-sub">${esc(c.subheadline || "What everyone assumes versus what actually works")}</p>
      <div class="d223-pairs">${pairsHtml}</div>
      <div class="d223-closer">${esc(c.cta || "Question the default. Find the edge.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T224 â€” THE MEMO (Corporate white + steel blue, memo format)
   # LinkedIn 4:5 â€” clean white background, styled as internal
   # memo with To/From/Re header and structured body.
   ============================================================ */
function t224(c: TemplateContent, w: number, h: number): string {
  // # Memo body points
  const bullets = c.bullets || [
    "The candidates who advance are not necessarily the most experienced. They are the ones who make the hiring manager's job easier.",
    "A tailored resume does not mean rewriting from scratch. It means adjusting the top third to mirror the language of the job description.",
    "Follow-up is not desperation. One well-timed message after an interview shows initiative and keeps you top of mind.",
  ];

  const css = `
.d224{width:${PW}px;height:${PH}px;background:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden;border:1px solid #E5E7EB;}
.d224 .bd{display:flex;flex-direction:column;padding:20px 18px 6px;flex:1;min-height:0;}
.d224-header{border:1px solid #DBEAFE;border-radius:8px;padding:10px 12px;margin-bottom:12px;background:#F8FAFC;}
.d224-field{display:flex;gap:6px;font-size:9px;line-height:1.8;}
.d224-field-label{font-family:${MONO};font-weight:700;color:#3B82F6;min-width:32px;text-transform:uppercase;letter-spacing:.04em;}
.d224-field-value{color:#475569;font-weight:500;}
.d224-divider{height:1px;background:linear-gradient(90deg,#3B82F6,#DBEAFE 50%,transparent);margin-bottom:12px;}
.d224-tt{font-family:${DISP};font-size:20px;font-weight:800;color:#1E293B;letter-spacing:-.02em;line-height:1.15;margin-bottom:6px;}
.d224-body{display:flex;flex-direction:column;gap:10px;flex:1;justify-content:center;min-height:0;}
.d224-para{font-size:11px;line-height:1.55;color:#475569;padding-left:12px;border-left:2px solid #BFDBFE;position:relative;}
.d224-para strong{color:#1E293B;font-weight:700;}
.d224-stamp{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;}
.d224-stamp-badge{font-family:${MONO};font-size:7.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#3B82F6;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;padding:3px 8px;}`;

  const parasHtml = bullets.slice(0, 4).map(p =>
    `<div class="d224-para">${esc(p)}</div>`
  ).join("");

  const body = `<div class="d224">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Internal Memo", "#3B82F6")}
      <div class="d224-header">
        <div class="d224-field"><span class="d224-field-label">To</span><span class="d224-field-value">${esc(c.body || "Every job seeker who wants an unfair advantage")}</span></div>
        <div class="d224-field"><span class="d224-field-label">From</span><span class="d224-field-value">${esc(c.afterText || "Someone who reviews resumes for a living")}</span></div>
        <div class="d224-field"><span class="d224-field-label">Re</span><span class="d224-field-value">${esc(c.subheadline || "What I wish every applicant understood")}</span></div>
      </div>
      <div class="d224-divider"></div>
      <h2 class="d224-tt">${esc(c.headline || "Three Things That Actually Move the Needle in a Job Search")}</h2>
      <div class="d224-body">${parasHtml}</div>
      <div class="d224-stamp">
        <div class="d224-stamp-badge">${esc(c.cta || "Act on this today")}</div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T225 â€” THE THREAD (Deep violet gradient, connected insights)
   # LinkedIn 4:5 â€” rich violet/purple gradient with connected
   # insight points joined by a vertical thread line.
   ============================================================ */
function t225(c: TemplateContent, w: number, h: number): string {
  // # Thread points
  const tips = c.tips || [
    { title: "Your resume is not about you", description: "It is about the problem the company needs solved. Frame every bullet around their pain, not your history." },
    { title: "Interviews are not exams", description: "They are conversations. The best candidates ask questions that reveal they have already thought about the role." },
    { title: "Rejection is redirection", description: "Every no narrows the field. The right role does not reject you, it recognizes you. Stay patient and stay specific." },
    { title: "Consistency compounds", description: "One connection a day. One application a week. One skill a month. Small moves, sustained, beat big bursts every time." },
  ];

  const css = `
.d225{width:${PW}px;height:${PH}px;background:linear-gradient(165deg,#2E1065,#4C1D95 40%,#6D28D9 80%,#7C3AED);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d225::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(167,139,250,.1),transparent 70%);pointer-events:none;}
.d225 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:20px 18px 6px;flex:1;min-height:0;}
.d225-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 2px 4px rgba(0,0,0,.15);}
.d225-sub{font-size:9.5px;color:rgba(196,181,253,.45);margin-bottom:12px;line-height:1.5;}
.d225-thread{display:flex;flex-direction:column;gap:0;flex:1;justify-content:center;min-height:0;position:relative;padding-left:20px;}
.d225-thread::before{content:'';position:absolute;left:7px;top:10px;bottom:10px;width:1.5px;background:linear-gradient(180deg,rgba(167,139,250,.4),rgba(167,139,250,.15));border-radius:1px;}
.d225-point{position:relative;padding:8px 0;}
.d225-point::before{content:'';position:absolute;left:-17px;top:14px;width:8px;height:8px;border-radius:50%;background:#A78BFA;border:2px solid #4C1D95;z-index:1;}
.d225-point-title{font-family:${DISP};font-size:11.5px;font-weight:700;color:#E9D5FF;margin-bottom:2px;letter-spacing:-.01em;}
.d225-point-desc{font-size:10.5px;line-height:1.5;color:rgba(233,213,255,.4);}
.d225-closer{font-size:9px;font-weight:600;color:rgba(196,181,253,.35);text-align:center;margin-top:auto;padding-top:6px;}`;

  const pointsHtml = tips.slice(0, 4).map(tip =>
    `<div class="d225-point">
      <div class="d225-point-title">${esc(tip.title)}</div>
      <div class="d225-point-desc">${esc(tip.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d225">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Thread", "rgba(167,139,250,.4)")}
      <h2 class="d225-tt">${esc(c.headline || "Four Truths That Changed How I Think About Career Growth")}</h2>
      <p class="d225-sub">${esc(c.subheadline || "A thread on the things nobody teaches you about job searching")}</p>
      <div class="d225-thread">${pointsHtml}</div>
      <div class="d225-closer">${esc(c.cta || "Save this. Come back to it.")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T226 â€” THE EQUATION (Dark charcoal + amber, problem/action flow)
   # LinkedIn 4:5 â€” dark charcoal with warm amber accents,
   # structured as Problem â†’ Insight â†’ Action sequential flow.
   ============================================================ */
function t226(c: TemplateContent, w: number, h: number): string {
  // # Three flow steps
  const steps = c.tips || [
    { title: "The Problem", description: "Most job seekers spend hours perfecting their resume and minutes on the application. They optimize the wrong step and wonder why nothing lands." },
    { title: "The Insight", description: "The resume gets you noticed. The application gets you considered. The follow-up gets you remembered. Most people stop at step one." },
    { title: "The Action", description: "For every role you care about, invest ten minutes tailoring, five minutes researching the team, and two minutes writing a note that proves you did both." },
  ];

  // # Step flow indicators
  const stepIcons = ["?", "!", "&#10003;"];
  const stepColors = ["#F59E0B", "#FB923C", "#34D399"];

  const css = `
.d226{width:${PW}px;height:${PH}px;background:linear-gradient(170deg,#1C1917,#292524 50%,#1C1917);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d226::before{content:'';position:absolute;top:-50px;right:-30px;width:180px;height:180px;background:radial-gradient(circle,rgba(245,158,11,.05),transparent 70%);pointer-events:none;}
.d226 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:20px 18px 6px;flex:1;min-height:0;}
.d226-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#FEFCE8;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;text-shadow:0 1px 3px rgba(0,0,0,.2);}
.d226-sub{font-size:9.5px;color:rgba(253,230,138,.35);margin-bottom:12px;line-height:1.5;}
.d226-flow{display:flex;flex-direction:column;gap:6px;flex:1;justify-content:center;min-height:0;}
.d226-step{background:rgba(255,255,255,.04);border:1px solid rgba(245,158,11,.1);border-radius:10px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;}
.d226-step-icon{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:${DISP};font-size:13px;font-weight:800;flex-shrink:0;margin-top:1px;}
.d226-step-title{font-family:${DISP};font-size:11.5px;font-weight:700;margin-bottom:3px;letter-spacing:-.01em;}
.d226-step-desc{font-size:10.5px;line-height:1.5;color:rgba(254,252,232,.4);}
.d226-arrow{text-align:center;font-size:14px;color:rgba(245,158,11,.2);line-height:1;}
.d226-closer{font-size:9px;font-weight:600;color:rgba(253,230,138,.3);text-align:center;margin-top:auto;padding-top:8px;}`;

  const stepsHtml = steps.slice(0, 3).map((step, i) => {
    const arrow = i < 2 ? `<div class="d226-arrow">&#8595;</div>` : "";
    return `<div class="d226-step">
      <div class="d226-step-icon" style="background:${stepColors[i]}20;color:${stepColors[i]};">${stepIcons[i]}</div>
      <div>
        <div class="d226-step-title" style="color:${stepColors[i]};">${esc(step.title)}</div>
        <div class="d226-step-desc">${esc(step.description)}</div>
      </div>
    </div>${arrow}`;
  }).join("");

  const body = `<div class="d226">
    <div class="bd">
      ${eyebrow(c.eyebrow || "The Equation", "rgba(245,158,11,.35)")}
      <h2 class="d226-tt">${esc(c.headline || "Why Your Applications Are Not Converting")}</h2>
      <p class="d226-sub">${esc(c.subheadline || "The problem, the insight, and the fix")}</p>
      <div class="d226-flow">${stepsHtml}</div>
      <div class="d226-closer">${esc(c.cta || "Diagnose first. Then act.")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T228 â€” THE PRESCRIPTION (Fresh mint/sage, medical Rx card style)
   # LinkedIn 4:5 â€” mint/sage gradient with Rx symbol and
   # prescription-pad layout diagnosing career problems.
   ============================================================ */
function t228(c: TemplateContent, w: number, h: number): string {
  // # Prescription items
  const tips = c.tips || [
    { title: "Tailored Keywords", description: "Mirror exact phrases from the job posting in your top 3 bullet points. Generic summaries get filtered out by ATS." },
    { title: "Quantified Impact", description: "Replace every responsibility with a result. Numbers make reviewers pause and read closer." },
    { title: "Strategic Follow-Up", description: "Send one note 48 hours after applying. Reference something specific about the team or product." },
  ];

  const css = `
.d228{width:${PW}px;height:${PH}px;background:linear-gradient(170deg,#ECFDF5,#D1FAE5 40%,#A7F3D0);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d228::before{content:'';position:absolute;bottom:-30px;right:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(16,185,129,.06),transparent 70%);pointer-events:none;}
.d228 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;min-height:0;}
.d228-rx{font-family:${DISP};font-size:38px;font-weight:800;color:rgba(6,95,70,.12);position:absolute;top:14px;right:18px;letter-spacing:-.02em;}
.d228-tt{font-family:${DISP};font-size:21px;font-weight:800;color:#064E3B;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d228-sub{font-size:9.5px;color:rgba(6,78,59,.45);margin-bottom:12px;line-height:1.5;}
.d228-pad{background:#fff;border:1px solid #A7F3D0;border-radius:10px;padding:14px 14px 10px;flex:1;display:flex;flex-direction:column;box-shadow:0 1px 4px rgba(16,185,129,.06);}
.d228-pad-header{display:flex;align-items:center;gap:6px;padding-bottom:8px;border-bottom:1px solid #D1FAE5;margin-bottom:10px;}
.d228-pad-icon{width:20px;height:20px;border-radius:50%;background:rgba(16,185,129,.1);display:flex;align-items:center;justify-content:center;font-family:${DISP};font-size:10px;font-weight:800;color:#059669;}
.d228-pad-title{font-family:${MONO};font-size:8.5px;font-weight:600;color:#6B7280;letter-spacing:.04em;text-transform:uppercase;}
.d228-items{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center;}
.d228-item{display:flex;gap:10px;align-items:flex-start;}
.d228-item-num{font-family:${MONO};font-size:10px;font-weight:700;color:#10B981;background:rgba(16,185,129,.08);border-radius:4px;padding:2px 6px;flex-shrink:0;margin-top:1px;}
.d228-item-title{font-family:${DISP};font-size:11px;font-weight:700;color:#064E3B;margin-bottom:2px;letter-spacing:-.01em;}
.d228-item-desc{font-size:10px;line-height:1.5;color:#4B5563;}
.d228-sig{display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:8px;}
.d228-sig-line{width:60px;height:1px;background:linear-gradient(90deg,#10B981,transparent);}
.d228-sig-text{font-family:${DISP};font-size:8.5px;font-weight:600;color:rgba(6,78,59,.35);font-style:italic;}`;

  const itemsHtml = tips.slice(0, 4).map((tip, i) =>
    `<div class="d228-item">
      <div class="d228-item-num">Rx${i + 1}</div>
      <div>
        <div class="d228-item-title">${esc(tip.title)}</div>
        <div class="d228-item-desc">${esc(tip.description)}</div>
      </div>
    </div>`
  ).join("");

  const body = `<div class="d228">
    <div class="bd">
      <div class="d228-rx">Rx</div>
      ${eyebrow(c.eyebrow || "Career Diagnosis", "#059669")}
      <h2 class="d228-tt">${esc(c.headline || "Your Job Search Is Sick. Here Is the Treatment Plan.")}</h2>
      <p class="d228-sub">${esc(c.subheadline || "A prescription for the three most common application failures")}</p>
      <div class="d228-pad">
        <div class="d228-pad-header">
          <div class="d228-pad-icon">+</div>
          <div class="d228-pad-title">${esc(c.body || "Treatment Protocol")}</div>
        </div>
        <div class="d228-items">${itemsHtml}</div>
        <div class="d228-sig">
          <div class="d228-sig-line"></div>
          <div class="d228-sig-text">${esc(c.cta || "Apply as directed. Results in 2-4 weeks.")}</div>
        </div>
      </div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T229 â€” THE PINBOARD (Warm honey/amber, corkboard with cards)
   # LinkedIn 4:5 â€” warm amber/honey background with pinned note
   # cards at slight angles, pushpin accents, tactile feel.
   ============================================================ */
function t229(c: TemplateContent, w: number, h: number): string {
  // # Pinned cards
  const tips = c.tips || [
    { title: "Stop mass-applying", description: "10 tailored apps beat 100 generic ones. Every recruiter says this. Almost nobody does it." },
    { title: "Your network is a verb", description: "Networking is not collecting contacts. It is having conversations that leave people wanting to help you." },
    { title: "Learn the ATS game", description: "68% of resumes get filtered before a human sees them. Format matters as much as content." },
    { title: "Follow up. Always.", description: "A short thank-you note after interviews puts you in the top 10% of candidates automatically." },
  ];

  // # Slight rotations for natural pinboard feel
  const rotations = ["-1.2deg", "0.8deg", "-0.5deg", "1deg"];
  const pinColors = ["#EF4444", "#3B82F6", "#F59E0B", "#10B981"];

  const css = `
.d229{width:${PW}px;height:${PH}px;background:linear-gradient(170deg,#FEF3C7,#FDE68A 40%,#FCD34D);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d229::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(180,130,40,.02) 12px,rgba(180,130,40,.02) 13px);pointer-events:none;}
.d229 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:22px 18px 8px;flex:1;min-height:0;}
.d229-tt{font-family:${DISP};font-size:22px;font-weight:800;color:#78350F;letter-spacing:-.03em;line-height:1.12;margin-bottom:4px;}
.d229-sub{font-size:9.5px;color:rgba(120,53,15,.45);margin-bottom:12px;line-height:1.4;}
.d229-board{flex:1;display:flex;flex-direction:column;gap:6px;justify-content:center;min-height:0;}
.d229-card{background:#FFFBEB;border:1px solid rgba(217,180,80,.2);border-radius:6px;padding:10px 12px;position:relative;box-shadow:1px 2px 6px rgba(120,53,15,.06);}
.d229-pin{position:absolute;top:-4px;left:16px;width:10px;height:10px;border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,.15);}
.d229-card-title{font-family:${DISP};font-size:11px;font-weight:700;color:#92400E;margin-bottom:3px;letter-spacing:-.01em;}
.d229-card-desc{font-size:10px;line-height:1.5;color:#78716C;}
.d229-closer{font-size:9px;font-weight:600;color:rgba(120,53,15,.35);text-align:center;margin-top:auto;padding-top:8px;}`;

  const cardsHtml = tips.slice(0, 4).map((tip, i) =>
    `<div class="d229-card" style="transform:rotate(${rotations[i]});">
      <div class="d229-pin" style="background:${pinColors[i]};"></div>
      <div class="d229-card-title">${esc(tip.title)}</div>
      <div class="d229-card-desc">${esc(tip.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d229">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Pinned Notes", "#92400E")}
      <h2 class="d229-tt">${esc(c.headline || "Four Things I Have Pinned Above My Desk During Every Job Search")}</h2>
      <p class="d229-sub">${esc(c.subheadline || "Reminders that keep me focused when the process gets overwhelming")}</p>
      <div class="d229-board">${cardsHtml}</div>
      <div class="d229-closer">${esc(c.cta || "Pin these. Read them daily.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T230 — THE GAUGE (Deep navy + cyan, donut chart — TikTok 9:16)
   # Large CSS donut gauge with stat center + metric bars below.
   # Visual-first design where the gauge IS the layout.
   ============================================================ */
function t230(c: TemplateContent, w: number, h: number): string {
  // # Score for the donut fill percentage
  const scoreVal = parseInt(c.stat?.value || "72", 10);
  const clampedScore = Math.min(100, Math.max(0, scoreVal));

  // # Metric items below gauge
  const metrics = c.items || [
    { text: "Keywords Matched", value: "89%" },
    { text: "Format Score", value: "94%" },
    { text: "Impact Language", value: "61%" },
  ];

  const metricColors = ["#06B6D4", "#22C55E", "#F59E0B"];

  const css = `
.d230{width:${TK_PW}px;height:${TK_PH}px;background:#0B1222;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d230::before{content:'';position:absolute;top:45%;left:50%;width:340px;height:340px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(6,182,212,.06),transparent 60%);pointer-events:none;}
.d230 .bd{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;padding:40px 24px 16px;flex:1;min-height:0;}
.d230-tt{font-family:${DISP};font-size:44px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.08;text-align:center;margin-bottom:6px;max-width:460px;}
.d230-sub{font-size:17px;color:rgba(6,182,212,.45);text-align:center;margin-bottom:28px;}
.d230-gauge{width:240px;height:240px;border-radius:50%;background:conic-gradient(#06B6D4 0% ${clampedScore}%,rgba(255,255,255,.06) ${clampedScore}% 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}
.d230-gauge-inner{width:178px;height:178px;border-radius:50%;background:#0B1222;display:flex;align-items:center;justify-content:center;flex-direction:column;}
.d230-gauge-num{font-family:${DISP};font-size:72px;font-weight:900;color:#06B6D4;letter-spacing:-.04em;line-height:1;}
.d230-gauge-label{font-family:${MONO};font-size:12px;font-weight:600;color:rgba(6,182,212,.4);letter-spacing:.08em;text-transform:uppercase;margin-top:4px;}
.d230-stat-label{font-size:16px;color:rgba(232,229,221,.35);text-align:center;margin-bottom:28px;}
.d230-metrics{width:100%;display:flex;flex-direction:column;gap:14px;margin-top:auto;}
.d230-metric{display:flex;align-items:center;gap:10px;}
.d230-metric-label{font-size:17px;font-weight:600;color:rgba(232,229,221,.6);flex:1;}
.d230-metric-val{font-family:${MONO};font-size:18px;font-weight:700;min-width:42px;text-align:right;}
.d230-metric-bar{flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;max-width:130px;}
.d230-metric-fill{height:100%;border-radius:4px;}`;

  const metricsHtml = metrics.slice(0, 4).map((m, i) => {
    const pct = parseInt(m.value || "0", 10);
    const color = metricColors[i % metricColors.length];
    return `<div class="d230-metric">
      <span class="d230-metric-label">${esc(m.text)}</span>
      <span class="d230-metric-val" style="color:${color};">${esc(m.value || "")}</span>
      <div class="d230-metric-bar"><div class="d230-metric-fill" style="width:${Math.min(100,pct)}%;background:${color};"></div></div>
    </div>`;
  }).join("");

  const body = `<div class="d230">
    <div class="bd">
      <h2 class="d230-tt">${esc(c.headline || "How Ready Is Your Resume Right Now?")}</h2>
      <p class="d230-sub">${esc(c.subheadline || "Real-time analysis across key dimensions")}</p>
      <div class="d230-gauge">
        <div class="d230-gauge-inner">
          <div class="d230-gauge-num">${clampedScore}</div>
          <div class="d230-gauge-label">${esc(c.stat?.label || "Overall Score")}</div>
        </div>
      </div>
      <p class="d230-stat-label">${esc(c.body || "Based on analysis of 50,000+ successful resumes")}</p>
      <div class="d230-metrics">${metricsHtml}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T231 — THE LADDER (Warm cream to coral, ascending bars — TikTok 9:16)
   # Ascending horizontal bars showing effort vs results. Each
   # step wider than the last. Color gradient red to cyan.
   ============================================================ */
function t231(c: TemplateContent, w: number, h: number): string {
  // # Ascending steps from worst to best strategy
  const steps = c.items || [
    { text: "Mass-apply, one resume", value: "12%" },
    { text: "Basic customization", value: "28%" },
    { text: "Tailored per role", value: "54%" },
    { text: "Tailored + warm intro", value: "81%" },
    { text: "Full AI-optimized pipeline", value: "94%" },
  ];

  const stepColors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4"];

  const css = `
.d231{width:${TK_PW}px;height:${TK_PH}px;background:linear-gradient(175deg,#FFF7ED,#FFF1E6 40%,#FFE4CC);display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d231 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:40px 20px 16px;flex:1;min-height:0;}
.d231-tt{font-family:${DISP};font-size:44px;font-weight:800;color:#7C2D12;letter-spacing:-.03em;line-height:1.08;margin-bottom:8px;}
.d231-sub{font-size:17px;color:rgba(124,45,18,.45);margin-bottom:28px;line-height:1.4;}
.d231-ladder{display:flex;flex-direction:column-reverse;gap:12px;flex:1;justify-content:center;align-items:flex-start;width:100%;}
.d231-step{height:56px;border-radius:10px;display:flex;align-items:center;padding:0 16px;gap:8px;}
.d231-step-label{font-family:${DISP};font-size:17px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.d231-step-val{font-family:${MONO};font-size:18px;font-weight:700;color:rgba(255,255,255,.85);margin-left:auto;white-space:nowrap;}
.d231-arrow{font-size:15px;font-weight:600;color:rgba(124,45,18,.25);text-align:center;margin-top:auto;padding-top:10px;}`;

  // # Widths ascending from narrow (worst) to full (best)
  const widths = [40, 55, 70, 85, 100];
  const stepsHtml = steps.slice(0, 5).map((s, i) => {
    const bw = widths[i] || 100;
    const color = stepColors[i % stepColors.length];
    return `<div class="d231-step" style="width:${bw}%;background:${color};">
      <span class="d231-step-label">${esc(s.text)}</span>
      <span class="d231-step-val">${esc(s.value || "")}</span>
    </div>`;
  }).join("");

  const body = `<div class="d231">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Interview Rate", "#9A3412")}
      <h2 class="d231-tt">${esc(c.headline || "The Effort Ladder: More Input, More Interviews")}</h2>
      <p class="d231-sub">${esc(c.subheadline || "Each step up doubles your chances. Where are you right now?")}</p>
      <div class="d231-ladder">${stepsHtml}</div>
      <div class="d231-arrow">${esc(c.cta || "Climb the ladder. Start optimizing today.")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T232 — THE MARQUEE (Burgundy + gold, cinema marquee — TikTok 9:16)
   # Theater marquee with light-bulb dots, dramatic title,
   # and cream ticket-stub section below.
   ============================================================ */
function t232(c: TemplateContent, w: number, h: number): string {
  // # Ticket stub wisdom lines
  const bullets = c.bullets || [
    "Your resume is not about you. It is about the problem the company needs solved.",
    "Apply to fewer roles. Prepare more for each one.",
    "The best candidates do not have the most experience. They tell the best stories.",
  ];

  const css = `
.d232{width:${TK_PW}px;height:${TK_PH}px;background:#2A0A18;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d232::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 25%,rgba(212,168,83,.05),transparent 55%);pointer-events:none;}
.d232 .bd{position:relative;z-index:1;display:flex;flex-direction:column;padding:32px 20px 16px;flex:1;min-height:0;}
.d232-lights{height:16px;background:repeating-radial-gradient(circle,#D4A853 0 2.5px,transparent 3px 13px);background-size:13px 13px;border-radius:6px 6px 0 0;opacity:.6;margin-bottom:0;}
.d232-marquee{background:linear-gradient(180deg,#3B0A1A,#2A0A18);border:2px solid rgba(212,168,83,.25);border-top:none;border-radius:0 0 10px 10px;padding:24px 20px;text-align:center;margin-bottom:24px;}
.d232-now{font-family:${MONO};font-size:13px;font-weight:700;color:rgba(212,168,83,.5);letter-spacing:.2em;text-transform:uppercase;margin-bottom:12px;}
.d232-tt{font-family:${DISP};font-size:46px;font-weight:900;color:#F5E6C8;letter-spacing:-.03em;line-height:1.06;}
.d232-ticket{background:#F5E6C8;border-radius:10px;padding:24px 22px 16px;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d232-ticket::before{content:'';position:absolute;top:-1px;left:10px;right:10px;height:2px;border-top:2px dashed rgba(42,10,24,.12);}
.d232-ticket-label{font-family:${MONO};font-size:12px;font-weight:700;color:rgba(42,10,24,.3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:16px;}
.d232-lines{display:flex;flex-direction:column;gap:16px;}
.d232-line{font-family:${DISP};font-size:19px;font-weight:600;color:#3B0A1A;line-height:1.45;padding-left:14px;border-left:3px solid rgba(212,168,83,.35);}
.d232-admit{font-family:${MONO};font-size:12px;font-weight:700;color:rgba(42,10,24,.2);letter-spacing:.1em;text-transform:uppercase;text-align:center;padding-top:16px;}`;

  const linesHtml = bullets.slice(0, 4).map(b =>
    `<div class="d232-line">${esc(b)}</div>`
  ).join("");

  const body = `<div class="d232">
    <div class="bd">
      <div class="d232-lights"></div>
      <div class="d232-marquee">
        <div class="d232-now">${esc(c.eyebrow || "Now Showing")}</div>
        <h2 class="d232-tt">${esc(c.headline || "Career Truths Nobody Tells You at Orientation")}</h2>
      </div>
      <div class="d232-ticket">
        <div class="d232-ticket-label">${esc(c.subheadline || "Program Notes")}</div>
        <div class="d232-lines">${linesHtml}</div>
        <div class="d232-admit">${esc(c.cta || "Admit one. Apply what resonates.")}</div>
      </div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrapAt(css, body, w, h, TK_PW, TK_PH);
}

/* ============================================================
   T233 — THE QUADRANT (Bold 2x2 color grid — Instagram 4:5)
   # Four saturated color cells with large stats. Visual-first
   # grid layout, not a text list. Maximum feed impact.
   ============================================================ */
function t233(c: TemplateContent, w: number, h: number): string {
  // # Four quadrant stats
  const items = c.items || [
    { text: "Skills Match", value: "92%" },
    { text: "ATS Score", value: "87%" },
    { text: "Readability", value: "95%" },
    { text: "Impact Words", value: "64%" },
  ];

  const quadBgs = ["#0F766E", "#C2410C", "#1E3A8A", "#92400E"];

  const css = `
.d233{width:${PW}px;height:${PH}px;background:#111;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d233 .bd{display:flex;flex-direction:column;padding:18px 14px 8px;flex:1;min-height:0;}
.d233-tt{font-family:${DISP};font-size:30px;font-weight:800;color:#E8E5DD;letter-spacing:-.03em;line-height:1.1;text-align:center;margin-bottom:6px;}
.d233-sub{font-size:14px;color:rgba(232,229,221,.35);text-align:center;margin-bottom:12px;}
.d233-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;flex:1;}
.d233-cell{border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px 12px;}
.d233-cell-val{font-family:${DISP};font-size:56px;font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,.2);}
.d233-cell-label{font-family:${DISP};font-size:16px;font-weight:700;color:rgba(255,255,255,.75);text-align:center;}
.d233-closer{font-size:13px;font-weight:600;color:rgba(232,229,221,.3);text-align:center;margin-top:auto;padding-top:8px;}`;

  const cellsHtml = items.slice(0, 4).map((item, i) =>
    `<div class="d233-cell" style="background:${quadBgs[i]};">
      <div class="d233-cell-val">${esc(item.value || "")}</div>
      <div class="d233-cell-label">${esc(item.text)}</div>
    </div>`
  ).join("");

  const body = `<div class="d233">
    <div class="bd">
      <h2 class="d233-tt">${esc(c.headline || "Your Resume at a Glance")}</h2>
      <p class="d233-sub">${esc(c.subheadline || "Four dimensions that decide if you get the interview")}</p>
      <div class="d233-grid">${cellsHtml}</div>
      <div class="d233-closer">${esc(c.cta || "Which quadrant needs work?")}</div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T234 — THE STAMP (White + red, rubber stamp seal — Instagram 4:5)
   # Dominant circular rubber stamp impression with certification
   # text inside. Bold, iconic, unmistakable in the feed.
   ============================================================ */
function t234(c: TemplateContent, w: number, h: number): string {
  // # Certification details below stamp
  const details = c.tips || [
    { title: "Keywords Optimized", description: "ATS-ready formatting with role-specific language" },
    { title: "Impact Quantified", description: "Every achievement backed by measurable results" },
    { title: "Story Structured", description: "Clear narrative arc from problem to outcome" },
  ];

  const css = `
.d234{width:${PW}px;height:${PH}px;background:#FAFAF7;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d234 .bd{display:flex;flex-direction:column;align-items:center;padding:22px 18px 8px;flex:1;min-height:0;}
.d234-tt{font-family:${DISP};font-size:28px;font-weight:800;color:#1A1A1A;letter-spacing:-.03em;line-height:1.12;text-align:center;margin-bottom:14px;max-width:440px;}
.d234-stamp{width:230px;height:230px;border:5px solid #C41E3A;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-6deg);position:relative;margin:0 auto 16px;}
.d234-stamp::before{content:'';position:absolute;inset:5px;border:2px solid #C41E3A;border-radius:50%;opacity:.3;}
.d234-stamp-main{font-family:${DISP};font-size:34px;font-weight:900;color:#C41E3A;letter-spacing:.06em;text-transform:uppercase;line-height:1;}
.d234-stamp-sub{font-family:${MONO};font-size:12px;font-weight:600;color:rgba(196,30,58,.5);letter-spacing:.1em;text-transform:uppercase;margin-top:6px;}
.d234-stamp-date{font-family:${MONO};font-size:11px;color:rgba(196,30,58,.35);margin-top:8px;letter-spacing:.06em;}
.d234-details{width:100%;display:flex;flex-direction:column;gap:8px;margin-top:auto;}
.d234-detail{padding:10px 14px;background:rgba(196,30,58,.03);border-radius:6px;border-left:3px solid rgba(196,30,58,.15);}
.d234-detail-title{font-family:${DISP};font-size:15px;font-weight:700;color:#1A1A1A;margin-bottom:2px;}
.d234-detail-desc{font-size:13px;color:#78716C;line-height:1.45;}
.d234-note{font-size:12px;color:rgba(0,0,0,.2);text-align:center;margin-top:8px;font-style:italic;}`;

  const detailsHtml = details.slice(0, 3).map(d =>
    `<div class="d234-detail">
      <div class="d234-detail-title">${esc(d.title)}</div>
      <div class="d234-detail-desc">${esc(d.description)}</div>
    </div>`
  ).join("");

  const body = `<div class="d234">
    <div class="bd">
      ${eyebrow(c.eyebrow || "Certification", "#C41E3A")}
      <h2 class="d234-tt">${esc(c.headline || "Is Your Resume Certified Interview-Ready?")}</h2>
      <div class="d234-stamp">
        <div class="d234-stamp-main">${esc(c.stat?.value || "Certified")}</div>
        <div class="d234-stamp-sub">${esc(c.stat?.label || "Interview Ready")}</div>
        <div class="d234-stamp-date">${esc(c.body || "Verified Sep 2026")}</div>
      </div>
      <div class="d234-details">${detailsHtml}</div>
      <div class="d234-note">${esc(c.cta || "Get your certification at jobpilotai.co")}</div>
    </div>
    ${footer("light")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   T235 — THE BILLBOARD (Highway green, road sign — Instagram 4:5)
   # Highway sign aesthetic with route marker, arrow destinations,
   # and time-to-milestone estimates. Bold, iconic, unique.
   ============================================================ */
function t235(c: TemplateContent, w: number, h: number): string {
  // # Highway exit destinations
  const destinations = c.items || [
    { text: "Resume Optimization", value: "2 days" },
    { text: "Cover Letter Draft", value: "30 min" },
    { text: "Interview Preparation", value: "1 week" },
    { text: "Salary Negotiation", value: "3 days" },
  ];

  const css = `
.d235{width:${PW}px;height:${PH}px;background:#006B3F;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.d235 .bd{display:flex;flex-direction:column;padding:18px 14px 8px;flex:1;min-height:0;}
.d235-sign{border:3px solid rgba(255,255,255,.8);border-radius:12px;padding:18px 20px;flex:1;display:flex;flex-direction:column;position:relative;}
.d235-sign::before{content:'';position:absolute;inset:-7px;border:2px solid rgba(255,255,255,.15);border-radius:16px;pointer-events:none;}
.d235-route{display:inline-flex;align-items:center;justify-content:center;width:40px;height:34px;background:#fff;border-radius:4px 4px 10px 10px;margin-bottom:12px;align-self:flex-start;}
.d235-route-num{font-family:${DISP};font-size:19px;font-weight:900;color:#006B3F;}
.d235-tt{font-family:${DISP};font-size:32px;font-weight:800;color:#fff;letter-spacing:-.02em;line-height:1.1;margin-bottom:8px;}
.d235-sub{font-size:14px;color:rgba(255,255,255,.5);margin-bottom:16px;}
.d235-exits{display:flex;flex-direction:column;gap:12px;flex:1;justify-content:center;}
.d235-exit{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.12);}
.d235-exit:last-child{border-bottom:none;}
.d235-exit-arrow{font-family:${DISP};font-size:22px;font-weight:800;color:rgba(255,255,255,.4);}
.d235-exit-name{font-family:${DISP};font-size:19px;font-weight:700;color:#fff;flex:1;}
.d235-exit-dist{font-family:${MONO};font-size:15px;font-weight:600;color:rgba(255,255,255,.6);text-align:right;}
.d235-next{font-size:14px;font-weight:600;color:rgba(255,255,255,.3);text-align:center;margin-top:auto;padding-top:10px;}`;

  const exitsHtml = destinations.slice(0, 5).map(d =>
    `<div class="d235-exit">
      <span class="d235-exit-arrow">&#8594;</span>
      <span class="d235-exit-name">${esc(d.text)}</span>
      <span class="d235-exit-dist">${esc(d.value || "")}</span>
    </div>`
  ).join("");

  const body = `<div class="d235">
    <div class="bd">
      <div class="d235-sign">
        <div class="d235-route"><span class="d235-route-num">${esc(c.eyebrow || "JP")}</span></div>
        <h2 class="d235-tt">${esc(c.headline || "Career Roadmap: Next Exits")}</h2>
        <p class="d235-sub">${esc(c.subheadline || "Estimated time to each milestone with AI assistance")}</p>
        <div class="d235-exits">${exitsHtml}</div>
        <div class="d235-next">${esc(c.cta || "Take the next exit. Start today.")}</div>
      </div>
    </div>
    ${footer("dark")}
  </div>`;

  return wrap(css, body, w, h);
}

/* ============================================================
   BUILDER MAP + EXPORT
   ============================================================ */
const BUILDERS: Record<string, (c: TemplateContent, w: number, h: number) => string> = {
  t187, t188, t189, t190, t191, t192, t193, t194, t198, t199,
  t200, t201, t202,    // # LinkedIn set 4
  t203, t204, t205,    // # TikTok set 4
  t206, t207, t208,    // # Instagram set 4
  t209, t210, t211, t212, t213, t214,  // # LinkedIn set 5
  t215, t216, t217, t218, t219, t220,  // # LinkedIn set 6 â€” text-only
  t221, t222, t223, t224, t225, t226,  // # LinkedIn set 7 â€” text-only with footer
  t228, t229,  // # LinkedIn set 8 â€” fresh designs with footer
  t230, t231, t232,  // # TikTok set 5 â€” fresh designs with footer
  t233, t234, t235,  // # Instagram set 5 â€” fresh designs with footer
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
