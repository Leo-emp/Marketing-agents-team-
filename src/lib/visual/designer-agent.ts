/* ============================================================
   VISUAL DESIGNER AGENT V4 — Template-First Pipeline
   ============================================================
   # Render priority:
   #   1. HTML templates (Puppeteer) — primary for all social posts
   #   2. OpenAI gpt-image-1 — fallback if Puppeteer fails
   #   3. Canvas 2D — last resort (always works, no API needed)
   #   4. fal.ai Flux Pro — blog post covers ONLY
   #
   # The designer agent now calls Template Intelligence to pick
   # the best HTML template (t1-t186) for each slide, then maps
   # Gemini's output to TemplateContent format for rendering.
   ============================================================ */

import { callGemini } from "../gemini";
import { getDimensions, type SlideData, type SlideLayout, type TemplateLayout } from "./types";
import { BRAND_NAME, BRAND_URL } from "./brand";
import { selectTemplate, slideToTemplateContent } from "./template-intelligence";
import type { TemplateId, TemplateContent } from "./templates/shared";
/* eslint-disable @typescript-eslint/no-explicit-any */

// # Valid Canvas 2D layouts — used as last-resort fallback
const VALID_LAYOUTS: SlideLayout[] = [
  "hero", "stat_card", "tip", "quote", "list", "cta",
  "before_after", "screenshot", "data_chart", "comparison",
  "numbered_steps", "gradient_text", "highlight_box",
  "split_image", "progress_bar",
];

// # Fields each template actually renders — used to detect and fill gaps
// # so the full template layout is populated, not just the headline
const TEMPLATE_RENDERED_FIELDS: Record<string, string[]> = {
  // # LinkedIn
  t1: ["stat", "body", "eyebrow"],
  t2: ["headline", "stat", "items"],
  t3: ["headline", "body", "eyebrow"],
  t4: ["headline", "beforeText", "afterText", "bars"],
  t5: ["headline", "subheadline", "body"],
  t7: ["headline", "body"],
  t8: ["headline", "beforeText", "afterText"],
  t9: ["headline", "bars"],
  t10: ["headline", "body", "subheadline"],
  t11: ["headline", "bullets"],
  t12: ["headline", "body"],
  t13: ["headline", "items"],
  t14: ["headline", "items"],
  t15: ["headline", "steps"],
  t65: ["headline", "body", "eyebrow"],
  t66: ["headline", "annotations"],
  t67: ["stat", "bars", "headline"],
  t68: ["headline", "body", "subheadline"],
  t69: ["headline", "items"],
  t70: ["stat", "headline", "body"],
  t71: ["headline", "steps", "eyebrow"],
  t72: ["headline", "bars", "legend"],
  t73: ["headline", "items", "eyebrow"],
  t74: ["headline", "items"],
  t75: ["headline", "tips", "eyebrow", "cta"],
  t76: ["headline", "steps", "subheadline"],
  t77: ["stat", "bars", "headline", "subheadline"],
  t78: ["headline", "bars", "eyebrow"],
  t79: ["headline", "steps"],
  t80: ["headline", "body", "eyebrow"],
  // # TikTok
  t16: ["headline", "body", "tips"],
  t17: ["headline", "steps"],
  t18: ["headline", "tips", "eyebrow"],
  t19: ["headline", "body", "eyebrow"],
  t20: ["headline", "body", "eyebrow"],
  t21: ["headline", "body"],
  t28: ["stat", "headline", "body"],
  t29: ["headline", "beforeText", "afterText"],
  t31: ["headline", "steps", "subheadline"],
  t32: ["headline", "body", "eyebrow"],
  t40: ["headline", "body"],
  t41: ["headline", "body", "stat"],
  t42: ["headline", "steps"],
  t44: ["headline", "bars", "eyebrow"],
  t50: ["headline", "steps", "bullets"],
  t52: ["headline", "steps", "eyebrow"],
  t82: ["headline", "score", "annotations"],
  t83: ["headline", "items"],
  t84: ["headline", "body"],
  t85: ["headline", "bullets", "cta"],
  t86: ["headline", "items", "cta"],
  t87: ["headline", "tips", "cta"],
  t88: ["stat", "headline", "body"],
  // # Instagram
  t23: ["headline", "tips"],
  t24: ["headline", "items"],
  t26: ["headline", "items", "stat", "subheadline", "eyebrow"],
  t27: ["headline", "body", "eyebrow"],
  t34: ["headline", "body", "eyebrow"],
  t35: ["headline", "tips"],
  t36: ["headline", "stat", "bars"],
  t37: ["headline", "body"],
  t38: ["headline", "body", "stat", "subheadline", "cta"],
  t39: ["headline", "body"],
  t45: ["headline", "items", "eyebrow"],
  t46: ["headline", "steps"],
  t47: ["headline", "body", "subheadline"],
  t48: ["headline", "body", "eyebrow"],
  t53: ["headline", "body"],
  t54: ["headline", "items", "eyebrow"],
  t56: ["headline", "body", "tags"],
  t57: ["stat", "headline"],
  t58: ["headline", "tips", "eyebrow"],
  t59: ["headline", "body", "eyebrow"],
  t60: ["headline", "items", "eyebrow"],
  t61: ["headline", "score", "stat"],
  t62: ["headline", "bars", "eyebrow"],
  t63: ["headline", "body"],
  t64: ["headline", "bars"],
  t89: ["headline", "body", "eyebrow"],
  t90: ["headline", "steps", "eyebrow"],
  t91: ["headline", "bars", "stat", "subheadline", "eyebrow"],
  t92: ["headline", "tips", "eyebrow"],
  t93: ["headline", "items", "cta"],
  t94: ["headline", "bullets", "stat"],
  t95: ["headline", "body", "items"],
  t96: ["headline", "body"],
};

// # Default fields to enrich when a template isn't explicitly mapped
// # Platform-specific: TikTok/Instagram favour scannable lists over paragraphs
const DEFAULT_FIELDS_BY_PLATFORM: Record<string, string[]> = {
  tiktok: ["headline", "subheadline", "bullets", "tips"],
  instagram: ["headline", "subheadline", "bullets", "tips"],
  linkedin: ["headline", "subheadline", "body", "bullets"],
  twitter: ["headline", "subheadline", "body", "bullets"],
};
const DEFAULT_RENDERED_FIELDS = ["headline", "subheadline", "body", "bullets"];

// # Check which fields the selected template needs but the content lacks
function getMissingFields(templateId: string, content: TemplateContent, platform?: string): string[] {
  const rendered = TEMPLATE_RENDERED_FIELDS[templateId]
    || (platform ? DEFAULT_FIELDS_BY_PLATFORM[platform] : null)
    || DEFAULT_RENDERED_FIELDS;

  const missing: string[] = [];
  for (const field of rendered) {
    switch (field) {
      case "headline": if (!content.headline) missing.push(field); break;
      case "subheadline": if (!content.subheadline) missing.push(field); break;
      case "body": if (!content.body) missing.push(field); break;
      case "eyebrow": if (!content.eyebrow) missing.push(field); break;
      case "stat": if (!content.stat?.value) missing.push(field); break;
      case "bullets": if (!content.bullets?.length) missing.push(field); break;
      case "steps": if (!content.steps?.length) missing.push(field); break;
      case "tips": if (!content.tips?.length) missing.push(field); break;
      case "items": if (!content.items?.length) missing.push(field); break;
      case "bars": if (!content.bars?.length) missing.push(field); break;
      case "beforeText": if (!content.beforeText) missing.push(field); break;
      case "afterText": if (!content.afterText) missing.push(field); break;
      case "tags": if (!content.tags?.length) missing.push(field); break;
      case "annotations": if (!content.annotations?.length) missing.push(field); break;
      case "score": if (content.score === undefined) missing.push(field); break;
      case "legend": if (!content.legend?.length) missing.push(field); break;
      case "cta": if (!content.cta) missing.push(field); break;
    }
  }
  return missing;
}

// # Field descriptions for Gemini prompt
const FIELD_SCHEMAS: Record<string, string> = {
  subheadline: '"subheadline": "short subtitle (10-15 words)"',
  body: '"body": "one punchy supporting sentence (8-15 words, no paragraph blocks)"',
  eyebrow: '"eyebrow": "short category label (2-3 words, uppercase)"',
  stat: '"stat": { "value": "number with unit like 75% or $120K", "label": "what it measures (5-8 words)" }',
  bullets: '"bullets": ["actionable item 1", "item 2", "item 3", "item 4"]',
  steps: '"steps": [{"label": "01", "title": "Step Name", "description": "brief detail 8-12 words"}, ...]  (3-4 steps)',
  tips: '"tips": [{"title": "Tip Name", "description": "brief explanation 8-12 words"}, ...]  (3-4 tips)',
  items: '"items": [{"text": "label", "value": "data", "highlighted": true/false}, ...]  (3-5 items)',
  bars: '"bars": [{"label": "Category Name", "value": 85}, ...]  (3-5 bars, values 0-100)',
  beforeText: '"beforeText": "the bad example or before state (15-25 words)"',
  afterText: '"afterText": "the improved example or after state (15-25 words)"',
  tags: '"tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]',
  annotations: '"annotations": [{"text": "full sentence", "highlights": [{"text": "key phrase", "type": "good"}], "callout": {"text": "explanation", "type": "good"}}]',
  score: '"score": 85  (number 0-100)',
  legend: '"legend": [{"label": "Series 1", "color": "#6366F1"}, {"label": "Series 2", "color": "#4B5563"}]',
  cta: '"cta": "call to action text"',
};

// # Generate missing content fields for the selected template
async function enrichContentForTemplate(
  templateId: string,
  templateName: string,
  content: TemplateContent,
  originalText: string,
  platform?: string,
): Promise<TemplateContent> {
  const missing = getMissingFields(templateId, content, platform);
  if (missing.length === 0) return content;

  const fieldSchemas = missing.map(f => FIELD_SCHEMAS[f]).filter(Boolean).join(",\n  ");

  const prompt = `You are generating content for a "${templateName}" visual template (${templateId}) for ${BRAND_NAME}.

The template needs these additional fields that are currently missing. Generate them based on the original content.

ORIGINAL CONTENT:
Headline: ${content.headline}
${content.body ? `Body: ${content.body}` : ""}
${content.subheadline ? `Subtitle: ${content.subheadline}` : ""}

CONTEXT (full post text):
${originalText.slice(0, 400)}

MISSING FIELDS TO GENERATE:
${missing.join(", ")}

Return ONLY a JSON object with these fields:
{
  ${fieldSchemas}
}

QUALITY RULES:
- Every field must provide STANDALONE VALUE — the reader should learn something specific.
- Tips/items MUST include concrete "how" details (10-25 words each), never vague labels like "Recommended" or "Essential".
- Stats/bars MUST use specific, realistic numbers — never round numbers like 50% or 100%.
- Body text must add a real insight, technique, or data point — not restate the headline.
- Before/After text must show actual resume language, not generic descriptions.
- Items must have meaningful text (not just category names) and values that tell a story.
- Steps must start with an action verb and include a specific technique in the description.
- Tags should be highly specific keywords (not generic like "career" or "jobs").

BAD ENRICHMENT:
- tip: { title: "Network", description: "Networking is important" }
- bar: { label: "Skills", value: 80 }
- item: { text: "Resume", value: "Good" }

GOOD ENRICHMENT:
- tip: { title: "Hidden Job Market", description: "80% of roles are filled through referrals — message 3 people per week at target companies on LinkedIn" }
- bar: { label: "Python proficiency", value: 67 }
- item: { text: "ATS-optimized formatting with single-column layout", value: "92%" }

Make the content specific, actionable, and relevant to the headline "${content.headline}".
${platform ? `Platform: ${platform} — tailor content density and tone accordingly.` : ""}
Use real-sounding data points and industry-specific language.
Return ONLY valid JSON.`;

  try {
    const raw = await callGemini(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return content;
    const generated = JSON.parse(match[0]);

    const enriched = { ...content };
    if (generated.subheadline && missing.includes("subheadline")) enriched.subheadline = String(generated.subheadline);
    if (generated.body && missing.includes("body")) enriched.body = String(generated.body);
    if (generated.eyebrow && missing.includes("eyebrow")) enriched.eyebrow = String(generated.eyebrow);
    if (generated.cta && missing.includes("cta")) enriched.cta = String(generated.cta);
    if (generated.score !== undefined && missing.includes("score")) enriched.score = Number(generated.score);
    if (generated.stat && missing.includes("stat")) {
      enriched.stat = { value: String(generated.stat.value || ""), label: String(generated.stat.label || "") };
    }
    if (Array.isArray(generated.bullets) && missing.includes("bullets")) {
      enriched.bullets = generated.bullets.map(String);
    }
    if (Array.isArray(generated.steps) && missing.includes("steps")) {
      enriched.steps = generated.steps.map((s: any) => ({
        label: String(s.label || s.number || ""),
        title: String(s.title || ""),
        description: s.description ? String(s.description) : undefined,
      }));
    }
    if (Array.isArray(generated.tips) && missing.includes("tips")) {
      enriched.tips = generated.tips.map((t: any) => ({
        title: String(t.title || ""),
        description: String(t.description || ""),
      }));
    }
    if (Array.isArray(generated.items) && missing.includes("items")) {
      enriched.items = generated.items.map((it: any) => ({
        text: String(it.text || ""),
        value: it.value !== undefined ? String(it.value) : undefined,
        highlighted: it.highlighted ?? false,
      }));
    }
    if (Array.isArray(generated.bars) && missing.includes("bars")) {
      enriched.bars = generated.bars.map((b: any) => ({
        label: String(b.label || ""),
        value: Number(b.value) || 0,
        color: b.color ? String(b.color) : undefined,
      }));
    }
    if (generated.beforeText && missing.includes("beforeText")) enriched.beforeText = String(generated.beforeText);
    if (generated.afterText && missing.includes("afterText")) enriched.afterText = String(generated.afterText);
    if (Array.isArray(generated.tags) && missing.includes("tags")) enriched.tags = generated.tags.map(String);
    if (Array.isArray(generated.annotations) && missing.includes("annotations")) enriched.annotations = generated.annotations as any;
    if (Array.isArray(generated.legend) && missing.includes("legend")) enriched.legend = generated.legend as any;

    console.log(`[Designer] Enriched ${missing.length} missing fields for ${templateId}: ${missing.join(", ")}`);
    return enriched;
  } catch (err) {
    console.warn(`[Designer] Content enrichment failed for ${templateId}:`, err);
    return content;
  }
}

// # Build an image prompt for OpenAI gpt-image-1 (fallback renderer)
// # Social platforms: branded slide with actual text content
// # Blog: editorial photography / illustration
function buildSlideImagePrompt(
  slide: { headline: string; body?: string; stat?: { value: string; label: string }; layout: string },
  platform: string,
  slideIndex: number,
  totalSlides: number,
): string {
  // # Blog covers — editorial imagery
  if (platform === "blog") {
    const topic = `${slide.headline} ${slide.body || ""}`;
    return `Professional blog cover image for an article about: ${topic}. Clean modern editorial photography or illustration. High quality, sharp, well-lit. Suitable for a career tech blog. No text overlay needed.`;
  }

  // # Social platforms — branded slides
  const parts: string[] = [];
  parts.push(`A professional branded social media slide. Dark background (#09090b to #18181b gradient). Clean sans-serif typography. Blue (#3b82f6) accent elements.`);

  if (slideIndex === 0) {
    parts.push(`Top-left: "${BRAND_NAME}" in small white text with a small blue wing icon beside it.`);
  }

  if (slide.stat) {
    parts.push(`Render this statistic very large and bold in white: "${slide.stat.value}". Below it in medium gray (#a1a1aa) text: "${slide.stat.label}".`);
  }

  if (slide.headline) {
    const size = slide.stat ? "medium-large" : "large";
    parts.push(`Render this headline in ${size} bold white text: "${slide.headline}".`);
  }

  if (slide.body) {
    parts.push(`Below the headline in smaller gray (#a1a1aa) text: "${slide.body}".`);
  }

  if (slideIndex === totalSlides - 1) {
    parts.push(`Include "${BRAND_URL}" as a prominent blue call-to-action. Below it: "Your AI Career Co-Pilot".`);
  }

  if (totalSlides > 1) {
    parts.push(`Top-right corner: small "${slideIndex + 1}/${totalSlides}" in muted text.`);
  }

  parts.push(`Clean spacing, subtle blue gradient accents or thin blue divider lines. No stock photos, no people, no hands, no generic AI imagery. This is a designed content slide, not a photograph.`);

  return parts.join(" ");
}

/* ---- Template Selection Result ---- */
/* # Stored alongside each slide so the pipeline knows what was picked */
export interface TemplateSelection {
  templateId: TemplateId;
  templateName: string;
  reasoning: string;
  templateContent: TemplateContent;
}

/* ---- Design Result ---- */
/* # Extended to include template selections for each slide */
export interface DesignResult {
  slides: SlideData[];
  caption: string;
  // # Template selections — one per slide, for HTML renderer
  templateSelections: (TemplateSelection | null)[];
}

/* ---- Main Designer Function ---- */

export async function designVisual(
  content: string,
  platform: string,
  contentType: string,
  mediaPrompt: string | null,
  topic?: string,
  pillar?: string,
): Promise<DesignResult> {
  const { width, height } = getDimensions(platform, contentType);
  const orientation = width > height ? "landscape" : width === height ? "square" : "portrait";
  const isSingleImage = contentType === "single_image" || contentType === "post";

  const slideCount = isSingleImage ? 1 : "4-6";

  // # Step 1: Generate structured slide data via Gemini
  // # Content quality prompt — requires specific, actionable, value-packed content
  // # that gives the reader a real takeaway, not vague labels or empty filler
  const prompt = `You are an expert content strategist for ${BRAND_NAME}, a premium career tech platform. Your job is to create HIGH-VALUE visual content that makes people stop scrolling and SAVE the post.

CONTENT TO STRUCTURE:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
FORMAT: ${contentType} (${orientation}, ${width}x${height}px)

CONTENT QUALITY RULES (CRITICAL — follow these exactly):
1. Every piece of text must provide STANDALONE VALUE. The reader should learn something specific just from reading the image.
2. NEVER use vague labels like "Recommended", "Essential", "Must-have", "Important" as descriptions. These say nothing.
3. Tips MUST include a concrete "how" — not just "Quantify Achievements" but "Replace 'managed team' with 'Led 12-person team that increased revenue 34%'"
4. Stats MUST be specific and surprising — not "many companies" but "73% of Fortune 500 companies"
5. Body text MUST add real insight beyond the headline — a specific technique, a real example, or a data point.
6. Items/cards MUST have meaningful descriptions (10-25 words each) that explain the WHY or HOW, not just a category name.
7. Bars/data MUST use realistic, specific numbers that tell a story — never round numbers like 50%, 80%, 100%.
8. Before/After examples MUST show actual resume text, not descriptions of what to do.
9. Headlines MUST create urgency, curiosity, or surprise — never be a plain label like "Resume Tips" or "Career Advice".
10. Every slide must pass the "would I save this?" test — if a viewer would not screenshot or bookmark this content, it is not good enough.
11. For roadmap/timeline content: use specific milestones with dates or durations, not vague phases.
12. For receipt/cost content: use specific dollar amounts, time costs, or opportunity costs — make the reader feel the pain.
13. For data visualizations (radar, meter, bars): use 4-6 dimensions with realistic asymmetric values that reveal a pattern.

BAD CONTENT (never do this):
- "Keyword Alignment — Recommended" (vague label, no value)
- "Optimize your resume — Essential" (generic advice)
- "Use AI tools — Must-have" (empty instruction)

GOOD CONTENT (always do this):
- "Keyword Alignment — Mirror the exact job title and 3-5 hard skills from the posting into your experience section"
- "ATS Formatting — Single-column layout, standard fonts, no tables or images that parsers skip"
- "73% of resumes are rejected before a human sees them — here's the 6-second test recruiters actually use"

TASK:
${isSingleImage
  ? `Create exactly 1 slide with maximum impact. The headline must be punchy (5-12 words) and the body text (15-30 words) must deliver a specific, useful insight — not a vague restatement of the headline.`
  : `Break this content into ${slideCount} slides. Rules:
- Slide 1: Bold hook headline that creates curiosity or states a surprising fact (5-12 words)
- Middle slides: One SPECIFIC, ACTIONABLE insight per slide with headline + body text that delivers real value
- Last slide: Call-to-action mentioning ${BRAND_URL}
- Each slide headline: 5-12 words, punchy and specific
- Each slide body: 15-30 words of CONCRETE supporting detail (a technique, example, or stat — not a restatement)
- Include real-sounding stat data with specific numbers whenever possible`}

Choose a layout type for each slide from: hero, stat_card, tip, quote, list, cta, before_after, comparison, numbered_steps, gradient_text, highlight_box.

CAPTION RULES (for the "caption" field in your JSON response):
Write a HIGH-QUALITY social media caption. Length: ${platform === 'linkedin' ? '150-400 words' : platform === 'twitter' ? '50-180 words' : '80-250 words'}.
Structure for ${platform === 'linkedin' ? 'LinkedIn' : platform === 'twitter' ? 'Twitter' : 'Instagram'}:
- Line 1: A HOOK that makes people stop scrolling. Use a surprising stat, contrarian take, personal confession, or bold claim. Never start with 'Did you know' or 'Here are X tips'.
- Lines 2-4: The MEAT — expand on the hook with a specific story, real example, or data-backed insight. Write like you are talking to a friend, not writing an essay.
- Last 2 lines: A QUESTION or CTA that invites comments. Ask something specific and debatable, not generic like 'What do you think?'
${platform === 'linkedin' ? '- Use line breaks between paragraphs (use \\n). No emoji.' : ''}
${platform === 'instagram' ? '- Add 5-10 relevant hashtags at the end (mix of broad + niche). No emoji in the main text.' : ''}
${platform === 'twitter' ? '- Punchy and direct. No hashtags unless truly relevant.' : ''}
- Do NOT repeat or summarize what the image already says. The caption should ADD new context, a personal angle, or a deeper insight.
- Write in first person ('I', 'we') — not third person brand voice.
- Include at least ONE specific number, stat, or real example.
- Sound like a thoughtful human, not a corporate brand. No buzzwords like 'leverage', 'unlock', 'game-changer', 'empower'.
- No emoji anywhere in the caption.
- End with a specific question that invites real debate, not a yes/no question.
BAD CAPTION: 'Your resume matters! Here are some tips to improve it. Check out JobPilot AI for more. What do you think?'
GOOD CAPTION: 'I reviewed 200+ resumes last month. The #1 reason people get ghosted after applying? Their resume passes ATS but fails the 6-second human scan.\\nRecruiters spend an average of 6.2 seconds on each resume. In that window, they are looking for exactly 3 things...\\nWhat is the one change you made to your resume that actually got results?'

Return a JSON object:
{
  "slides": [
    {
      "headline": "5-12 word punchy headline",
      "subheadline": "optional subtitle with a specific claim or stat",
      "body": "15-30 words of concrete, actionable detail — a technique, example, or data point",
      "stat": { "value": "73%", "label": "of resumes rejected before human review" },
      "bullets": ["Specific actionable item with detail", "Another concrete technique"],
      "layout": "hero",
      "eyebrow": "optional category label",
      "beforeText": "Actual bad resume text example",
      "afterText": "Actual improved resume text example",
      "steps": [{"number": 1, "title": "Action verb + object", "detail": "specific how-to in 10-15 words"}],
      "bars": [{"label": "Specific category", "value": 73}],
      "tips": [{"title": "Specific technique name", "description": "10-25 word explanation of exactly how to do it"}],
      "tags": ["keyword1", "keyword2"],
      "cta": "call to action text"
    }
  ],
  "caption": "Your high-quality caption here following the CAPTION RULES above"
}

Return ONLY valid JSON.`;

  let raw = await callGemini(prompt);

  // # Parse response — retry once if JSON is malformed
  let parsed: { slides?: unknown[]; caption?: string };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (firstErr) {
    console.warn("[Visual Designer] First JSON parse failed, retrying:", firstErr);
    raw = await callGemini(
      `Your previous response was not valid JSON. Return ONLY a valid JSON object with "slides" array and "caption" string. No explanation, no markdown. The original request was:\n\n${prompt}`
    );
    const retryMatch = raw.match(/\{[\s\S]*\}/);
    if (!retryMatch) throw new Error("Visual designer returned no valid JSON after retry");
    parsed = JSON.parse(retryMatch[0]);
  }

  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("Visual designer returned empty or missing slides array");
  }

  // # Enforce single slide for single_image — Gemini sometimes returns multiple
  if (isSingleImage && parsed.slides.length > 1) {
    parsed.slides = [parsed.slides[0]];
  }

  const totalSlides = parsed.slides.length;

  // # Step 2: Normalize slides and build both SlideData + TemplateContent
  const slides: SlideData[] = [];
  const templateSelections: (TemplateSelection | null)[] = [];
  // # For carousels, lock to ONE template so all slides share the same style
  let carouselLockedTemplate: { templateId: TemplateId; templateName: string; reasoning: string } | null = null;
  const isCarouselType = contentType === "carousel";

  for (let index = 0; index < parsed.slides.length; index++) {
    const slide = parsed.slides[index] as Record<string, unknown>;

    const layout = VALID_LAYOUTS.includes(slide.layout as SlideLayout)
      ? (slide.layout as SlideLayout)
      : "hero";

    // # Normalize to SlideData (used by OpenAI/Canvas fallbacks)
    const normalized: SlideData = {
      headline: String(slide.headline || ""),
      subheadline: slide.subheadline ? String(slide.subheadline) : undefined,
      body: slide.body ? String(slide.body) : undefined,
      stat: slide.stat && typeof slide.stat === "object"
        ? { value: String((slide.stat as any).value || ""), label: String((slide.stat as any).label || "") }
        : undefined,
      bullets: Array.isArray(slide.bullets)
        ? (slide.bullets as unknown[]).map(String)
        : undefined,
      footer: slide.footer ? String(slide.footer) : undefined,
      layout,
      slideNumber: index + 1,
      totalSlides,
      aiImagePrompt: slide.imagePrompt
        ? String(slide.imagePrompt)
        : buildSlideImagePrompt(
            { headline: String(slide.headline || ""), body: slide.body ? String(slide.body) : undefined, stat: slide.stat as any, layout },
            platform,
            index,
            totalSlides,
          ),
      beforeText: slide.beforeText ? String(slide.beforeText) : undefined,
      afterText: slide.afterText ? String(slide.afterText) : undefined,
      bars: Array.isArray(slide.bars)
        ? (slide.bars as { label: unknown; value: unknown; color?: unknown }[]).map((b) => ({ label: String(b.label || ""), value: Number(b.value) || 0, color: b.color ? String(b.color) : undefined }))
        : undefined,
      steps: Array.isArray(slide.steps)
        ? (slide.steps as { number: unknown; title: unknown; detail?: unknown }[]).map((s) => ({ number: Number(s.number) || 0, title: String(s.title || ""), detail: s.detail ? String(s.detail) : undefined }))
        : undefined,
      leftColumn: Array.isArray(slide.leftColumn) ? (slide.leftColumn as unknown[]).map(String) : undefined,
      rightColumn: Array.isArray(slide.rightColumn) ? (slide.rightColumn as unknown[]).map(String) : undefined,
      leftLabel: slide.leftLabel ? String(slide.leftLabel) : undefined,
      rightLabel: slide.rightLabel ? String(slide.rightLabel) : undefined,
    };

    slides.push(normalized);

    // # Step 3: Select an HTML template for this slide (non-blog only)
    if (platform !== "blog") {
      try {
        // # For carousels: pick template on slide 1, reuse for all slides
        let selection: { templateId: TemplateId; templateName: string; reasoning: string };
        if (isCarouselType && carouselLockedTemplate) {
          selection = carouselLockedTemplate;
        } else {
          const slideText = [normalized.headline, normalized.body, normalized.subheadline]
            .filter(Boolean).join(" ");
          selection = await selectTemplate(platform, contentType, slideText, pillar, undefined);

          // # Reject cover-only templates (no body/bullets/tips/steps/items/bars)
          // # These render as just a headline with empty middle — useless
          const contentFields = new Set(["body", "bullets", "tips", "steps", "items", "bars", "beforeText", "afterText", "annotations"]);
          const fields = TEMPLATE_RENDERED_FIELDS[selection.templateId] || [];
          if (!fields.some((f: string) => contentFields.has(f))) {
            console.log(`[Designer] Rejected cover-only template ${selection.templateId}, re-selecting...`);
            for (let retry = 0; retry < 3; retry++) {
              selection = await selectTemplate(platform, contentType, slideText, pillar, undefined);
              const retryFields = TEMPLATE_RENDERED_FIELDS[selection.templateId] || [];
              if (retryFields.some((f: string) => contentFields.has(f))) break;
              console.log(`[Designer] Retry ${retry + 1}: ${selection.templateId} also cover-only`);
            }
          }

          if (isCarouselType) carouselLockedTemplate = selection;
        }

        // # Convert SlideData → TemplateContent for the HTML renderer
        let templateContent = slideToTemplateContent(normalized);

        // # Merge in Gemini's extra fields that slideToTemplateContent doesn't know about
        if (slide.eyebrow) templateContent.eyebrow = String(slide.eyebrow);
        if (slide.headlineHighlight) templateContent.headlineHighlight = String(slide.headlineHighlight);
        if (slide.bodyBold) templateContent.bodyBold = String(slide.bodyBold);
        if (slide.cta) templateContent.cta = String(slide.cta);
        if (slide.score !== undefined) templateContent.score = Number(slide.score);
        if (Array.isArray(slide.tags)) templateContent.tags = (slide.tags as unknown[]).map(String);
        if (Array.isArray(slide.annotations)) templateContent.annotations = slide.annotations as any;
        if (slide.methodName) templateContent.methodName = String(slide.methodName);
        if (slide.benchmarkAt !== undefined) templateContent.benchmarkAt = Number(slide.benchmarkAt);
        if (Array.isArray(slide.legend)) templateContent.legend = slide.legend as any;

        // # Enrich content — generate missing fields the template needs
        // # to render fully (e.g. steps for T76, items for T13, bars for T9)
        templateContent = await enrichContentForTemplate(
          selection.templateId,
          selection.templateName,
          templateContent,
          content,
          platform,
        );

        // # Merge enriched fields back into the slide so render functions
        // # that call slideToTemplateContent(slide) get the full content
        // # (generate/route.ts and visual/route.ts re-derive from slide data)
        const stringFields = ["body", "subheadline", "eyebrow", "cta", "beforeText", "afterText"] as const;
        for (const k of stringFields) {
          if (templateContent[k] && !(normalized as any)[k]) (normalized as any)[k] = templateContent[k];
        }
        if (templateContent.stat?.value && !normalized.stat) normalized.stat = templateContent.stat as any;
        if (templateContent.score !== undefined && (normalized as any).score === undefined) (normalized as any).score = templateContent.score;
        const arrayFields = ["bullets", "steps", "tips", "items", "bars", "tags", "annotations", "legend"] as const;
        for (const k of arrayFields) {
          if ((templateContent as any)[k]?.length && !(normalized as any)[k]?.length) (normalized as any)[k] = (templateContent as any)[k];
        }

        // # Inject template ID into slide.layout so the Visual API
        // # renders via Puppeteer HTML templates (primary path)
        normalized.layout = selection.templateId as TemplateLayout;

        templateSelections.push({
          templateId: selection.templateId,
          templateName: selection.templateName,
          reasoning: isCarouselType && index > 0 ? `Locked to carousel template ${selection.templateId}` : selection.reasoning,
          templateContent,
        });

        console.log(`[Designer] Slide ${index + 1}: ${isCarouselType && index > 0 ? "locked to" : "selected"} template ${selection.templateId} "${selection.templateName}"${isCarouselType && index > 0 ? " (carousel consistency)" : ` — ${selection.reasoning}`}`);
      } catch (err) {
        console.warn(`[Designer] Template selection failed for slide ${index + 1}, will use fallback:`, err);
        templateSelections.push(null);
      }
    } else {
      // # Blog covers don't use HTML templates
      templateSelections.push(null);
    }
  }

  return {
    slides,
    caption: parsed.caption ? String(parsed.caption) : "",
    templateSelections,
  };
}
