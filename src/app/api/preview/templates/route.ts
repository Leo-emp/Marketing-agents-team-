/* ============================================================
   TEMPLATE PREVIEW — /api/preview/templates
   ============================================================
   # Renders all 96 HTML templates with sample content in a
   # visual gallery. Open in browser to review every template.
   # Query params: ?platform=linkedin|tiktok|instagram (filter)
   #               ?id=t1 (single template, full size)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { buildTemplateHTML } from "@/lib/visual/templates/index";
import { LINKEDIN_IDS } from "@/lib/visual/templates/linkedin";
import { TIKTOK_IDS } from "@/lib/visual/templates/tiktok";
import { INSTAGRAM_IDS } from "@/lib/visual/templates/instagram";
import type { TemplateContent, TemplateId } from "@/lib/visual/templates/shared";

// # Sample content that exercises most template fields
const SAMPLE: TemplateContent = {
  eyebrow: "Career Intelligence",
  headline: "75% of Resumes Are Rejected Before a Human Sees Them",
  headlineHighlight: "75%",
  subheadline: "And most candidates never find out why",
  body: "ATS systems scan for keywords, formatting, and structure. A great candidate with a poorly formatted resume gets filtered out before the hiring manager even opens their inbox.",
  bodyBold: "poorly formatted resume",
  stat: { value: "75%", label: "of resumes rejected by ATS" },
  bullets: [
    "Use standard section headers (Experience, Education, Skills)",
    "Include keywords from the job description naturally",
    "Avoid tables, columns, and graphics that ATS can't parse",
    "Quantify achievements with specific numbers",
  ],
  tips: [
    { title: "Match Keywords", description: "Mirror exact phrases from the job posting in your resume" },
    { title: "Simple Formatting", description: "Single column, standard fonts, no headers/footers" },
    { title: "Quantify Results", description: "Use numbers: 'increased revenue by 34%' not 'improved revenue'" },
  ],
  steps: [
    { label: "01", title: "Analyze the Job Description", description: "Highlight required skills and keywords" },
    { label: "02", title: "Optimize Your Resume", description: "Tailor content to match each application" },
    { label: "03", title: "Test with ATS Scanner", description: "Use JobPilot's analyzer to check your score" },
  ],
  bars: [
    { label: "Software Engineering", value: 92 },
    { label: "Product Management", value: 78 },
    { label: "Data Science", value: 85 },
    { label: "Marketing", value: 64 },
  ],
  items: [
    { text: "ATS Compatibility Score", value: "92/100", highlighted: true },
    { text: "Keyword Match Rate", value: "87%" },
    { text: "Formatting Issues", value: "0" },
    { text: "Missing Sections", value: "1" },
  ],
  beforeText: "Managed team and improved processes resulting in better outcomes for the department and stakeholders",
  afterText: "Led 12-person engineering team, cutting deployment time by 40% and saving $180K annually through CI/CD automation",
  cta: "Analyze your resume free at jobpilotai.co",
  score: 92,
  annotations: [
    {
      text: "Led cross-functional team of 8 engineers",
      highlights: [{ text: "Led", type: "good" }, { text: "8 engineers", type: "good" }],
      callout: { text: "Strong action verb + quantified team size", type: "good" },
    },
  ],
  tags: ["Resume", "ATS", "Job Search", "Career Tips", "AI Hiring"],
  methodName: "STAR Method",
  benchmarkAt: 75,
  legend: [
    { label: "Your Score", color: "#6366F1" },
    { label: "Industry Avg", color: "#4B5563" },
  ],
};

// # Template metadata for display labels
const TEMPLATE_NAMES: Record<string, string> = {
  t1: "Hero Stat", t2: "Product In Action", t3: "Tip Card", t4: "Before/After", t5: "Testimonial",
  t6: "Carousel Cover", t7: "Bold Statement", t8: "Myth vs Reality", t9: "Data Visual", t10: "Announcement",
  t11: "Checklist", t12: "Controversial Take", t13: "Social Proof Wall", t14: "Hot Take Poll", t15: "Step Process",
  t16: "Notes App Screenshot", t17: "Tier Ranking", t18: "Text Message Thread", t19: "Neon Statement",
  t20: "Swipe Carousel Card", t21: "Bold Color Hot Take", t22: "Editorial Carousel Cover", t23: "Save-Worthy Tip Card",
  t24: "Story Poll", t25: "Minimal Quote", t26: "Feature Breakdown", t27: "Reel Cover",
  t28: "Bold Stat", t29: "Split Contrast", t30: "Gradient Statement", t31: "Stacked Cards",
  t32: "Editorial Bold", t33: "Neon Outline", t34: "Grain Editorial", t35: "Floating Cards",
  t36: "Ring Chart", t37: "Minimal Bold", t38: "Color Block", t39: "Textured Dark",
  t40: "Brutalist Highlight", t41: "Keynote Slide", t42: "Vertical Timeline", t43: "Quote Card",
  t44: "Metric Dashboard", t45: "Clean Comparison", t46: "Step Guide", t47: "Testimonial",
  t48: "Magazine Cover", t49: "Centered Minimal", t50: "Terminal", t51: "Gradient Mesh",
  t52: "Number List", t53: "Carousel Slide", t54: "Checklist", t55: "Pull Quote",
  t56: "Profile Card", t57: "Split Stat", t58: "Myth vs Fact", t59: "Editorial Series",
  t60: "Pill Tags", t61: "Score Card", t62: "Data Table", t63: "Gradient Quote",
  t64: "Stat Bars", t65: "Split Header", t66: "Annotation Card", t67: "Salary Range",
  t68: "Quick Win", t69: "Stack Rank", t70: "Two-Number", t71: "Framework",
  t72: "Industry Benchmark", t73: "Red/Green Flag", t74: "Tool Stack", t75: "Resume Breakdown",
  t76: "Hiring Manager POV", t77: "Salary Negotiation", t78: "Quick Stat Grid", t79: "Day In The Life",
  t80: "Expert Hot Take", t81: "POV Card", t82: "Rate My Resume", t83: "Red Flag Bingo",
  t84: "Storytime", t85: "Speed Tips", t86: "Would You Rather", t87: "Recruiter DM",
  t88: "Salary Reveal", t89: "Newsletter Preview", t90: "Transformation Story", t91: "Infographic Mini",
  t92: "Expert Panel", t93: "Resource List", t94: "Weekly Recap", t95: "AMA Response",
  t96: "Achievement Unlocked",
};

// # Target dimensions per platform — these match what the templates are designed for
// # LinkedIn: all templates target 1080x1350 (carousel portrait 4:5)
// # TikTok: all templates target 1080x1920 (full screen 9:16)
// # Instagram: mixed — feed 1080x1350, grid 1080x1080, story/reel 1080x1920
const DIMS: Record<string, { w: number; h: number }> = {
  linkedin: { w: 1080, h: 1350 },
  tiktok: { w: 1080, h: 1920 },
  instagram: { w: 1080, h: 1350 },
};

// # Instagram templates that use 1:1 square format (1080x1080)
const IG_SQUARE_IDS = new Set([
  "t25", "t36", "t37", "t38", "t39", "t47", "t55", "t56",
  "t57", "t60", "t61", "t62", "t63", "t64", "t92", "t94", "t96",
  "t110", "t112", // # Premium 1:1 templates
]);

// # Instagram templates that use 9:16 story/reel format (1080x1920)
const IG_STORY_IDS = new Set(["t24", "t27", "t114"]); // # t114 = Premium Story Card

// # Get the correct render dimensions for a specific template
function getTemplateDims(id: string, platform: string): { w: number; h: number } {
  if (platform === "instagram") {
    if (IG_SQUARE_IDS.has(id)) return { w: 1080, h: 1080 };
    if (IG_STORY_IDS.has(id)) return { w: 1080, h: 1920 };
  }
  return DIMS[platform] || { w: 1080, h: 1350 };
}

function getPlatform(id: string): string {
  if (LINKEDIN_IDS.includes(id as TemplateId)) return "linkedin";
  if (TIKTOK_IDS.includes(id as TemplateId)) return "tiktok";
  if (INSTAGRAM_IDS.includes(id as TemplateId)) return "instagram";
  return "linkedin";
}

export async function GET(req: NextRequest) {
  const platformFilter = req.nextUrl.searchParams.get("platform");
  const singleId = req.nextUrl.searchParams.get("id");
  const mode = req.nextUrl.searchParams.get("mode");

  // # Single template — render full size
  if (singleId) {
    const platform = getPlatform(singleId);
    const { w, h } = getTemplateDims(singleId, platform);
    const html = buildTemplateHTML(singleId as TemplateId, SAMPLE, w, h);
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // # Build ID list
  let allIds: string[] = [
    ...LINKEDIN_IDS,
    ...TIKTOK_IDS,
    ...INSTAGRAM_IDS,
  ];

  if (platformFilter) {
    allIds = allIds.filter((id) => getPlatform(id) === platformFilter);
  }

  // # ---- FULL SIZE MODE — every template rendered at actual dimensions ----
  if (mode === "full") {
    const sections = allIds.map((id) => {
      const platform = getPlatform(id);
      const name = TEMPLATE_NAMES[id] || id;
      const { w, h } = getTemplateDims(id, platform);
      const platformColor = platform === "linkedin" ? "#0A66C2" : platform === "tiktok" ? "#FF0050" : "#E4405F";

      // # Scale template to fit 900px wide — use absolute positioning so transform works
      const scale = Math.min(900 / w, 1);
      const displayW = Math.round(w * scale);
      const displayH = Math.round(h * scale);

      return `<div class="section">
        <div class="label">
          <span class="id">${id.toUpperCase()}</span>
          <span class="badge" style="background:${platformColor}">${platform}</span>
          <span class="name">${name}</span>
          <span class="dims">${w} x ${h}px</span>
        </div>
        <div style="position:relative;width:${displayW}px;height:${displayH}px;overflow:hidden;border:2px solid #1e1f2e;border-radius:8px;margin:0 auto;">
          <iframe src="/api/preview/templates?id=${id}" width="${w}" height="${h}" style="position:absolute;top:0;left:0;border:none;transform:scale(${scale});transform-origin:top left;" loading="lazy"></iframe>
        </div>
      </div>`;
    }).join("\n");

    const fullHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>JobPilot Templates Full Size — ${allIds.length} Templates</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #09090b; color: #e4e2dd; font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; }
  h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
  .subtitle { color: #8b8a9a; font-size: 16px; margin-bottom: 12px; }
  .filters { display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap; }
  .filters a { padding: 8px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;
    background: #1e1f2e; color: #a5b4fc; transition: all 0.2s; }
  .filters a:hover, .filters a.active { background: #6366f1; color: #fff; }
  .count { background: #1e1f2e; color: #6366f1; font-weight: 800; padding: 2px 10px; border-radius: 6px; font-size: 14px; }
  .section { margin-bottom: 60px; }
  .label { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 20px;
    background: #10111a; border-radius: 10px; border: 1px solid #1e1f2e; }
  .id { font-size: 18px; font-weight: 800; color: #6366f1; letter-spacing: 0.08em; }
  .badge { font-size: 12px; font-weight: 700; color: #fff; padding: 3px 10px; border-radius: 5px;
    text-transform: uppercase; letter-spacing: 0.05em; }
  .name { font-size: 18px; font-weight: 600; color: #e4e2dd; }
  .dims { font-size: 14px; color: #5a596e; margin-left: auto; font-family: 'Cascadia Code', monospace; }
  .frame { border: 2px solid #1e1f2e; border-radius: 8px; overflow: hidden; margin: 0 auto; }
  .frame iframe { display: block; }
  .nav { position: fixed; bottom: 24px; right: 24px; display: flex; gap: 8px; z-index: 1000; }
  .nav a { padding: 10px 16px; border-radius: 8px; background: #6366f1; color: #fff; text-decoration: none;
    font-size: 13px; font-weight: 700; box-shadow: 0 4px 20px rgba(99,102,241,0.3); }
  .nav a:hover { background: #818cf8; }
</style>
</head><body>
<h1>Full Size Templates <span class="count">${allIds.length}</span></h1>
<p class="subtitle">Every template at actual render dimensions. Scroll to review.</p>
<div class="filters">
  <a href="/api/preview/templates?mode=full" ${!platformFilter ? 'class="active"' : ''}>All (96)</a>
  <a href="/api/preview/templates?mode=full&platform=linkedin" ${platformFilter === 'linkedin' ? 'class="active"' : ''}>LinkedIn (31)</a>
  <a href="/api/preview/templates?mode=full&platform=tiktok" ${platformFilter === 'tiktok' ? 'class="active"' : ''}>TikTok (29)</a>
  <a href="/api/preview/templates?mode=full&platform=instagram" ${platformFilter === 'instagram' ? 'class="active"' : ''}>Instagram (36)</a>
  <a href="/api/preview/templates">Thumbnail view</a>
</div>
${sections}
<div class="nav">
  <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">Top</a>
</div>
</body></html>`;

    return new NextResponse(fullHtml, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // # ---- THUMBNAIL MODE (default) — scaled-down preview cards ----
  const cards = allIds.map((id) => {
    const platform = getPlatform(id);
    const name = TEMPLATE_NAMES[id] || id;
    const { w, h } = getTemplateDims(id, platform);
    const aspect = h / w;
    const previewW = 320;
    const previewH = Math.round(previewW * aspect);
    const platformColor = platform === "linkedin" ? "#0A66C2" : platform === "tiktok" ? "#FF0050" : "#E4405F";

    return `<div class="card">
      <div class="preview" style="height:${previewH}px">
        <iframe src="/api/preview/templates?id=${id}" style="width:${w}px;height:${h}px;transform:scale(${previewW / w});transform-origin:top left;border:none;pointer-events:none;" loading="lazy"></iframe>
      </div>
      <div class="meta">
        <span class="id">${id.toUpperCase()}</span>
        <span class="badge" style="background:${platformColor}">${platform}</span>
      </div>
      <div class="name">${name}</div>
      <a href="/api/preview/templates?id=${id}" target="_blank" class="link">Open full size</a>
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>JobPilot Template Gallery — ${allIds.length} Templates</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #09090b; color: #e4e2dd; font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; }
  h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
  .subtitle { color: #8b8a9a; font-size: 16px; margin-bottom: 32px; }
  .filters { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
  .filters a { padding: 8px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;
    background: #1e1f2e; color: #a5b4fc; transition: all 0.2s; }
  .filters a:hover, .filters a.active { background: #6366f1; color: #fff; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
  .card { background: #10111a; border-radius: 12px; overflow: hidden; border: 1px solid #1e1f2e; transition: border-color 0.2s; }
  .card:hover { border-color: #6366f1; }
  .preview { overflow: hidden; position: relative; background: #08090e; }
  .meta { display: flex; align-items: center; gap: 8px; padding: 12px 16px 4px; }
  .id { font-size: 13px; font-weight: 800; color: #6366f1; letter-spacing: 0.08em; }
  .badge { font-size: 11px; font-weight: 700; color: #fff; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .name { font-size: 15px; font-weight: 600; padding: 0 16px 8px; color: #e4e2dd; }
  .link { display: block; padding: 8px 16px 12px; font-size: 13px; color: #a5b4fc; text-decoration: none; }
  .link:hover { color: #c4b5fd; }
  .count { background: #1e1f2e; color: #6366f1; font-weight: 800; padding: 2px 10px; border-radius: 6px; font-size: 14px; }
</style>
</head><body>
<h1>Template Gallery <span class="count">${allIds.length}</span></h1>
<p class="subtitle">All HTML/Puppeteer templates with sample content. Click "Open full size" to see at actual render dimensions.</p>
<div class="filters">
  <a href="/api/preview/templates" ${!platformFilter ? 'class="active"' : ''}>All (96)</a>
  <a href="/api/preview/templates?platform=linkedin" ${platformFilter === 'linkedin' ? 'class="active"' : ''}>LinkedIn (31)</a>
  <a href="/api/preview/templates?platform=tiktok" ${platformFilter === 'tiktok' ? 'class="active"' : ''}>TikTok (29)</a>
  <a href="/api/preview/templates?platform=instagram" ${platformFilter === 'instagram' ? 'class="active"' : ''}>Instagram (36)</a>
  <a href="/api/preview/templates?mode=full">Full size view</a>
</div>
<div class="grid">
${cards}
</div>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
