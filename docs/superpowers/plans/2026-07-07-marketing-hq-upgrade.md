# Marketing HQ Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Marketing HQ to production-grade quality across image generation, video rendering, auto-scheduling, and engagement-driven content learning.

**Architecture:** Four-layer approach — image quality first (brand colors, OpenAI brand brief, PDF carousels), then video quality (ElevenLabs VO wiring, Remotion render route, TikTok posting), then auto-scheduling pipeline (weekly cron, 30-min scheduler, retry logic), then engagement feedback loop (auto-pull metrics, dynamic voice samples, performance digest, editorial scoring upgrade). Each layer is independently deployable.

**Tech Stack:** Next.js 16, OpenAI gpt-image-1, ElevenLabs (existing `src/lib/elevenlabs.ts`), Remotion 4, fal.ai, HeyGen, pdf-lib (new), Prisma/SQLite, Vercel Blob, Vercel Cron

## Global Constraints

- All code must have `#` comments throughout for learning (per project convention)
- Brand colors: `#3b82f6` (primary blue), `#60a5fa` (light blue), `#93c5fd` (pale blue), `#38bdf8` (sky blue glow) — NOT `#6366f1` indigo
- Mascot: white robot, blue `#3b82f6` pilot cap with wing emblem, blue screen-eyes, wing badge on chest
- OpenAI image prompts: inject full brand brief, NO layout micromanagement — let OpenAI decide design
- Anti-AI rules: no AI logos, no watermarks, no neural network imagery, must look designer-made
- All images must include `jobpilotai.co` domain
- Cron routes authenticate with `CRON_SECRET` via timing-safe comparison (follow pattern in `src/app/api/ambassador/generate/route.ts`)
- Next.js 16 — read `node_modules/next/dist/docs/` before writing any code (per AGENTS.md)
- `eslint-disable @typescript-eslint/no-explicit-any` when needed (existing pattern)

---

### Task 1: Fix Brand Colors & Add Mascot Constant

**Files:**
- Modify: `src/lib/visual/brand.ts`
- Modify: `src/remotion/ReelComposition.tsx:88-98` (gradient colors in brand header)
- Modify: `src/remotion/ReelComposition.tsx:137-141` (gradient in brand footer)

**Interfaces:**
- Produces: Updated color exports `ACCENT_1="#3b82f6"`, `ACCENT_2="#60a5fa"`, `ACCENT_3="#93c5fd"`, new `ACCENT_GLOW="#38bdf8"`, new `MASCOT_DESCRIPTION: string`

- [ ] **Step 1: Update brand.ts colors and add mascot**

Replace the accent colors and add mascot description in `src/lib/visual/brand.ts`:

```typescript
// # Accent colors — blue premium palette (matches jobpilotai.co website)
export const ACCENT_1 = "#3b82f6"; // # Primary blue (brand color)
export const ACCENT_2 = "#60a5fa"; // # Light blue (gradient pair)
export const ACCENT_3 = "#93c5fd"; // # Pale blue (highlights)
export const ACCENT_GLOW = "#38bdf8"; // # Sky blue glow (special accents)
export const ACCENT_WARM = "#f59e0b"; // # Amber (contrast accent for special moments)

// # Brand mascot — white pilot robot
// # Used contextually in OpenAI image generation, not forced into every image
export const MASCOT_DESCRIPTION = "A friendly white robot with a blue (#3b82f6) pilot cap featuring a wing emblem, blue screen-eyes showing a friendly expression, and a wing badge on its chest. Professional, approachable, clean design. No goggles.";
```

- [ ] **Step 2: Update SLIDE_PALETTE to include brand blues**

Replace the first 3 entries of `SLIDE_PALETTE` in `src/lib/visual/brand.ts`:

```typescript
export const SLIDE_PALETTE = [
  "#1e3a5f",  // # Deep navy
  "#1e40af",  // # Bold blue (brand-adjacent)
  "#1d4ed8",  // # Royal blue
  "#164e63",  // # Cyan dark
  "#065f46",  // # Emerald dark
  "#7c2d12",  // # Burnt sienna
  "#831843",  // # Magenta dark
  "#854d0e",  // # Amber dark
  "#1f2937",  // # Gunmetal
  "#0c4a6e",  // # Sky dark blue
];
```

- [ ] **Step 3: Update Remotion gradient colors**

In `src/remotion/ReelComposition.tsx`, replace the two gradient references from indigo/purple to blue:

Line ~89 (brand header logo):
```typescript
background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
```

Line ~139 (brand footer bar):
```typescript
background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
```

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds with no errors related to brand.ts or ReelComposition.tsx

- [ ] **Step 5: Commit**

```bash
git add src/lib/visual/brand.ts src/remotion/ReelComposition.tsx
git commit -m "fix: correct brand colors to #3b82f6 blue palette, add mascot constant"
```

---

### Task 2: Brand Brief Prompt Module & OpenAI Image Rewrite

**Files:**
- Create: `src/lib/visual/openai-brand-prompt.ts`
- Modify: `src/lib/visual/openai-image.ts`

**Interfaces:**
- Consumes: `BRAND_NAME`, `BRAND_URL`, `MASCOT_DESCRIPTION` from `brand.ts` (Task 1)
- Produces: `buildBrandImagePrompt(contentDirection: string, platform: string): string` — full brand brief + content direction, used by `generateImage()`

- [ ] **Step 1: Create openai-brand-prompt.ts**

Create `src/lib/visual/openai-brand-prompt.ts`:

```typescript
/* ============================================================
   OPENAI BRAND PROMPT — Full Brand Brief for Image Generation
   ============================================================
   Single source of truth for the brand context injected into
   every OpenAI gpt-image-1 image generation call.
   Provides rich product context and quality expectations.
   Does NOT prescribe layout — OpenAI decides the design.
   ============================================================ */

import { BRAND_NAME, BRAND_URL, MASCOT_DESCRIPTION, ACCENT_1 } from "./brand";

// # Build the full brand-aware image prompt
// # contentDirection: what the image should communicate (topic, headline, key message)
// # platform: target social platform (affects composition expectations)
export function buildBrandImagePrompt(contentDirection: string, platform: string): string {
  return `Create a professional, designer-grade marketing image for ${BRAND_NAME} (${BRAND_URL}).

ABOUT ${BRAND_NAME}:
${BRAND_NAME} is an AI-powered career platform — the all-in-one toolkit for job seekers. Features include:
- AI Resume Builder: ATS-optimized resumes with scoring, optimization, and complete rebuilds
- AI Cover Letter Generator: matched to specific jobs using real resume achievements
- Interview Prep Coach: AI mock interviews with real-time feedback, STAR-method coaching
- Job Search Aggregator: LinkedIn, Indeed, Glassdoor, Google Jobs — all in one dashboard
- Career Dashboard: application tracking, skill gap analysis, follow-up reminders
- AI Portfolio Builder: 9 premium templates with shareable public URLs
- Chrome Extension: one-click job saving and instant match scoring
Mission: Make job hunting effortless with AI
Values: Precision, empowerment, modern technology, accessibility, quality

BRAND VISUAL IDENTITY:
- Primary color: blue (${ACCENT_1})
- Style: clean, modern, tech-forward, premium SaaS aesthetic
- Must include "${BRAND_URL}" somewhere in the image
- Brand mascot (use when appropriate, not every image): ${MASCOT_DESCRIPTION}

QUALITY REQUIREMENTS (CRITICAL):
- Must look like a professional human designer created it — polished, intentional, production-ready
- NO AI-generated artifacts: no watermarks, no AI logos, no glowing neural networks, no circuit board patterns
- NO generic stock-photo feel: no floating holographic interfaces, no unnamed people pointing at screens
- NO "AI slop": no melted text, no extra fingers, no uncanny valley faces, no overly symmetrical compositions
- Text in the image must be crisp, readable, and correctly spelled
- Color palette should feel cohesive and premium — blues, whites, clean dark backgrounds
- Ready to publish on ${platform} — no additional editing needed

CONTENT DIRECTION:
${contentDirection}`;
}
```

- [ ] **Step 2: Rewrite openai-image.ts to use brand brief**

Replace the contents of `src/lib/visual/openai-image.ts`:

```typescript
/* ============================================================
   OPENAI IMAGE GENERATION — gpt-image-1 Integration
   ============================================================
   Generates premium AI marketing images using OpenAI's
   gpt-image-1 model. Injects full brand brief for consistent,
   designer-grade output. Returns raw PNG buffer or null on
   failure, allowing Canvas 2D fallback.
   ============================================================ */

import OpenAI from "openai";
import { buildBrandImagePrompt } from "./openai-brand-prompt";

// # Supported output sizes for gpt-image-1
type ImageSize = "1024x1024" | "1024x1792" | "1792x1024";

// # Map canvas dimensions to the closest supported OpenAI size
export function mapToOpenAISize(width: number, height: number): ImageSize {
  const ratio = width / height;
  // # Landscape (ratio > 1.2)
  if (ratio > 1.2) return "1792x1024";
  // # Portrait (ratio < 0.83)
  if (ratio < 0.83) return "1024x1792";
  // # Square-ish
  return "1024x1024";
}

// # Generate a marketing image using OpenAI gpt-image-1
// # Returns PNG buffer on success, null on failure (caller falls back to Canvas 2D)
export async function generateImage(
  prompt: string,
  width: number,
  height: number,
  platform: string = "social media"
): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[OpenAI Image] No OPENAI_API_KEY — falling back to Canvas 2D");
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });
    const size = mapToOpenAISize(width, height);
    // # Build the full brand-aware prompt with product context and quality rules
    const fullPrompt = buildBrandImagePrompt(prompt, platform);

    console.log(`[OpenAI Image] Generating ${size} image for ${platform}...`);

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 1,
      size,
      quality: "high",
    });

    // # Extract base64 data from response
    const imageData = response.data?.[0];
    if (!imageData?.b64_json) {
      console.warn("[OpenAI Image] No b64_json in response");
      return null;
    }

    const buffer = Buffer.from(imageData.b64_json, "base64");
    console.log(`[OpenAI Image] Generated ${(buffer.length / 1024).toFixed(0)}KB image`);
    return buffer;
  } catch (err) {
    console.error("[OpenAI Image] Generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds. No import errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/visual/openai-brand-prompt.ts src/lib/visual/openai-image.ts
git commit -m "feat: add full brand brief injection for OpenAI image generation"
```

---

### Task 3: Designer Agent Rewrite & Visual Route Simplification

**Files:**
- Modify: `src/lib/visual/designer-agent.ts`
- Modify: `src/app/api/visual/route.ts`

**Interfaces:**
- Consumes: `generateImage()` from `openai-image.ts` (Task 2), `SLIDE_PALETTE` from `brand.ts` (Task 1)
- Produces: `designVisual()` now outputs content-only slides where ALL slides get `aiImagePrompt` (OpenAI renders everything), Canvas 2D slides only via fallback

- [ ] **Step 1: Rewrite designer-agent.ts to content-only output**

Replace `src/lib/visual/designer-agent.ts`. The key change: remove all layout prescriptions (font sizes, gradient specs, element placement). The designer agent now outputs content-only JSON. Every slide gets an `aiImagePrompt` auto-generated from the content — OpenAI decides the visual design.

```typescript
/* ============================================================
   VISUAL DESIGNER AGENT V3 — Content-Only Output
   ============================================================
   Takes generated text content and produces structured SlideData.
   Every slide gets an aiImagePrompt — OpenAI gpt-image-1 renders
   all slides with full creative freedom. Canvas 2D is only used
   if OpenAI fails (automatic fallback in the visual route).
   ============================================================ */

import { callGemini } from "../gemini";
import { getDimensions, type SlideData, type SlideLayout } from "./types";
import { BRAND_NAME, BRAND_URL } from "./brand";
/* eslint-disable @typescript-eslint/no-explicit-any */

// # Valid layouts — used for Canvas 2D fallback rendering
const VALID_LAYOUTS: SlideLayout[] = [
  "hero", "stat_card", "tip", "quote", "list", "cta",
  "before_after", "screenshot", "data_chart", "comparison",
  "numbered_steps", "gradient_text", "highlight_box",
  "split_image", "progress_bar",
];

// # Auto-generate an image prompt from slide content
// # This describes WHAT to show, not HOW to lay it out
function buildSlideImagePrompt(slide: { headline: string; body?: string; stat?: { value: string; label: string }; layout: string }, platform: string, slideIndex: number, totalSlides: number): string {
  const parts: string[] = [];

  // # Context about slide position
  if (slideIndex === 0) {
    parts.push(`This is the opening slide of a ${platform} carousel — it must stop the scroll with a bold, eye-catching design.`);
  } else if (slideIndex === totalSlides - 1) {
    parts.push(`This is the final CTA slide — include "${BRAND_URL}" prominently as a call to action.`);
  } else {
    parts.push(`This is slide ${slideIndex + 1} of ${totalSlides} in a ${platform} carousel.`);
  }

  // # Content to visualize
  if (slide.headline) {
    parts.push(`Display this text prominently: "${slide.headline}"`);
  }
  if (slide.body) {
    parts.push(`Supporting text: "${slide.body}"`);
  }
  if (slide.stat) {
    parts.push(`Feature this statistic large and bold: ${slide.stat.value} — ${slide.stat.label}`);
  }

  return parts.join(" ");
}

/* ---- Main Designer Function ---- */

export async function designVisual(
  content: string,
  platform: string,
  contentType: string,
  mediaPrompt: string | null,
  topic?: string
): Promise<{ slides: SlideData[]; caption: string }> {
  const { width, height } = getDimensions(platform, contentType);
  const orientation = width > height ? "landscape" : width === height ? "square" : "portrait";
  const isSingleImage = contentType === "single_image" || contentType === "post";

  // # Determine slide count based on content type
  const slideCount = isSingleImage ? 1 : contentType === "reel_script" ? "4-6" : "4-6";

  const prompt = `You are a content strategist for ${BRAND_NAME}, a premium career tech platform. Extract the key messages from this content and structure them for a visual post.

CONTENT TO STRUCTURE:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}
FORMAT: ${contentType} (${orientation}, ${width}x${height}px)

TASK:
${isSingleImage
  ? `Extract the single most impactful message from this content. Return exactly 1 slide with a punchy headline (5-12 words) and optional body text (15-30 words).`
  : `Break this content into ${slideCount} slides. Rules:
- Slide 1: Bold hook headline that stops the scroll (5-12 words)
- Middle slides: One key insight per slide with headline + body text
- Last slide: Call-to-action mentioning ${BRAND_URL}
- Each slide headline: 5-12 words, punchy and specific
- Each slide body: 15-30 words of supporting detail (optional but preferred)
- Include stat data when the content contains numbers`}

Choose a layout type for each slide from: hero, stat_card, tip, quote, list, cta, before_after, comparison, numbered_steps, gradient_text, highlight_box.

Return a JSON object:
{
  "slides": [
    {
      "headline": "5-12 word punchy headline",
      "body": "15-30 word body text",
      "stat": { "value": "75%", "label": "of resumes rejected by ATS" },
      "bullets": ["item 1", "item 2"],
      "layout": "hero"
    }
  ],
  "caption": "Social media caption that complements the visuals (100-400 words for LinkedIn, 50-200 for Twitter, 100-300 for Instagram). Do NOT repeat slide text."
}

Return ONLY valid JSON.`;

  let raw = await callGemini(prompt);

  // # Parse the response — retry once if JSON is malformed
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

  const totalSlides = parsed.slides.length;

  // # Normalize slide data and auto-generate aiImagePrompt for every slide
  const slides: SlideData[] = (parsed.slides as Record<string, unknown>[]).map((slide, index) => {
    const layout = VALID_LAYOUTS.includes(slide.layout as SlideLayout)
      ? (slide.layout as SlideLayout)
      : "hero";

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
      // # Every slide gets an aiImagePrompt — OpenAI renders all slides
      aiImagePrompt: buildSlideImagePrompt(
        { headline: String(slide.headline || ""), body: slide.body ? String(slide.body) : undefined, stat: slide.stat as any, layout },
        platform,
        index,
        totalSlides
      ),
      // # Keep extended fields for Canvas 2D fallback
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

    return normalized;
  });

  return {
    slides,
    caption: parsed.caption ? String(parsed.caption) : "",
  };
}
```

- [ ] **Step 2: Simplify visual route to OpenAI primary, Canvas fallback**

In `src/app/api/visual/route.ts`, replace the `renderSlide` function and remove the fal-image import:

Remove this import line:
```typescript
import { generateFalImage, type FalImageModel } from "@/lib/visual/fal-image";
```

Replace the `renderSlide` function:
```typescript
/* # Render a single slide with two-tier fallback:
   # 1. OpenAI gpt-image-1 (primary — all slides have aiImagePrompt now)
   # 2. Canvas 2D (fallback if OpenAI fails or no API key) */
async function renderSlide(
  slide: SlideData,
  width: number,
  height: number,
  platform: string,
  model?: string
): Promise<Buffer> {
  // # If admin explicitly chose "canvas" model, skip AI generation
  if (model === "canvas") {
    return renderSlideCanvas(slide, width, height);
  }

  // # All slides have aiImagePrompt — try OpenAI first
  if (slide.aiImagePrompt) {
    const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
    if (aiBuffer) return aiBuffer;
    console.log("[Visual API] OpenAI failed — falling back to Canvas 2D");
  }

  // # Canvas 2D fallback — text-heavy rendering
  return renderSlideCanvas(slide, width, height);
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds. The fal-image module still exists but is no longer imported by the visual route.

- [ ] **Step 4: Commit**

```bash
git add src/lib/visual/designer-agent.ts src/app/api/visual/route.ts
git commit -m "feat: rewrite designer agent to content-only, simplify visual route to OpenAI primary"
```

---

### Task 4: LinkedIn Carousel PDF Export

**Files:**
- Create: `src/lib/visual/pdf-carousel.ts`
- Modify: `prisma/schema.prisma` (add `pdfUrl` field)

**Interfaces:**
- Consumes: PNG buffers from `generateImage()` (Task 2)
- Produces: `assembleCarouselPdf(images: Buffer[]): Promise<Buffer>` — returns PDF buffer under 3MB

- [ ] **Step 1: Install pdf-lib**

Run: `npm install pdf-lib`

- [ ] **Step 2: Create pdf-carousel.ts**

Create `src/lib/visual/pdf-carousel.ts`:

```typescript
/* ============================================================
   PDF CAROUSEL — LinkedIn Carousel Document Assembly
   ============================================================
   Assembles multiple PNG slide images into a single PDF file
   for LinkedIn carousel posts. Each slide is one PDF page at
   1080×1350 (portrait 4:5 ratio, LinkedIn's optimal format).
   Uses pdf-lib for zero-dependency PDF creation.
   ============================================================ */

import { PDFDocument } from "pdf-lib";

// # LinkedIn carousel dimensions (4:5 portrait)
const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

// # Max PDF file size for LinkedIn upload (3MB)
const MAX_PDF_BYTES = 3 * 1024 * 1024;

// # Assemble PNG image buffers into a multi-page PDF
// # Each image becomes one full-page slide
// # Returns the PDF as a Buffer ready for upload
export async function assembleCarouselPdf(images: Buffer[]): Promise<Buffer> {
  if (images.length === 0) {
    throw new Error("Cannot create carousel PDF with zero images");
  }

  const pdf = await PDFDocument.create();

  for (const imgBuffer of images) {
    // # Embed PNG image into the PDF
    const pngImage = await pdf.embedPng(imgBuffer);

    // # Add a page matching the slide dimensions (in PDF points — 1pt = 1px at 72dpi)
    const page = pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);

    // # Draw the image to fill the entire page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
    });
  }

  // # Serialize to bytes
  const pdfBytes = await pdf.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // # Check file size — LinkedIn rejects PDFs over ~10MB but we target 3MB
  if (pdfBuffer.length > MAX_PDF_BYTES) {
    console.warn(
      `[PDF Carousel] PDF is ${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB — over 3MB target. ` +
      `Consider reducing slide count or image quality.`
    );
  }

  console.log(
    `[PDF Carousel] Created ${images.length}-slide PDF (${(pdfBuffer.length / 1024).toFixed(0)}KB)`
  );

  return pdfBuffer;
}
```

- [ ] **Step 3: Add pdfUrl field to Prisma schema**

In `prisma/schema.prisma`, add after the `videoRenderId` line in the Content model:

```prisma
  pdfUrl         String?                           // URL of generated carousel PDF (LinkedIn)
```

- [ ] **Step 4: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 5: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/visual/pdf-carousel.ts prisma/schema.prisma
git commit -m "feat: add LinkedIn carousel PDF assembly via pdf-lib"
```

---

### Task 5: Update agents.ts Brand Colors

**Files:**
- Modify: `src/lib/agents.ts:85-86` (BRAND constant color references)

**Interfaces:**
- Consumes: Nothing new
- Produces: Corrected color references in all agent system prompts

- [ ] **Step 1: Fix color references in BRAND constant**

In `src/lib/agents.ts`, line ~85, the BRAND constant already has the correct colors (`#3b82f6`, `#38bdf8`, `#0ea5e9`). Verify this matches — no changes needed if already correct.

However, in the reel-designer.ts prompt (line ~22-26), there's a reference to "Indigo-to-purple gradient accents". Fix that:

In `src/lib/visual/reel-designer.ts`, replace:
```typescript
- Dark background, clean white text
- Indigo-to-purple gradient accents
```
with:
```typescript
- Dark background, clean white text
- Blue gradient accents (#3b82f6 to #60a5fa)
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/visual/reel-designer.ts
git commit -m "fix: update reel designer brand colors from indigo/purple to blue"
```

---

### Task 6: ElevenLabs Voiceover Integration for All Reels

**Files:**
- Modify: `src/lib/visual/reel-designer.ts`
- Modify: `src/lib/visual/caption-burner.ts`

**Interfaces:**
- Consumes: `generateReelVoiceover()` and `generateVoiceover()` from existing `src/lib/elevenlabs.ts`, `uploadMedia()` from `src/lib/blob-storage.ts`
- Produces: `designReel()` now returns `voiceoverUrl` in the ReelConfig, `burnCaptionsOnReel(videoUrl, reelConfig)` handles any reel type

The ElevenLabs module already exists at `src/lib/elevenlabs.ts` with `generateVoiceover()` and `generateReelVoiceover()`. The spec called for a new `elevenlabs-vo.ts` but that functionality is already built. Instead, we wire the existing module into the reel pipeline.

- [ ] **Step 1: Add voiceover generation to reel-designer.ts**

In `src/lib/visual/reel-designer.ts`, add the import at the top (after existing imports):

```typescript
import { generateReelVoiceover } from "../elevenlabs";
import { uploadMedia } from "../blob-storage";
```

Then at the end of the `designReel` function, before the `return` statement, add voiceover generation:

```typescript
  /* # Generate voiceover from scene text via ElevenLabs */
  let voiceoverUrl: string | undefined;
  try {
    const voBase64 = await generateReelVoiceover(scenes, platform);
    if (voBase64) {
      // # Upload the base64 audio to Vercel Blob for a proper URL
      const audioBuffer = Buffer.from(voBase64.replace("data:audio/mpeg;base64,", ""), "base64");
      voiceoverUrl = await uploadMedia(audioBuffer, `reel-vo-${Date.now()}.mp3`, "audio/mpeg");
      console.log(`[reel-designer] Voiceover uploaded → ${voiceoverUrl}`);
    }
  } catch (e) {
    console.warn("[reel-designer] Voiceover generation failed, continuing without:", e);
  }
```

Then update the return object to include `voiceoverUrl`:

```typescript
  return {
    scenes,
    fps: 30,
    width: 1080,
    height: 1920,
    totalDurationInFrames,
    musicMood: detectedMood,
    bRollClips,
    voiceoverUrl,
  };
```

- [ ] **Step 2: Export a general-purpose caption burn function from caption-burner.ts**

Add this function at the end of `src/lib/visual/caption-burner.ts` (after the existing `burnCaptions` export):

```typescript
// # Burn captions into any reel video (not just ambassador)
// # Convenience wrapper that extracts spoken text from a ReelConfig
export async function burnReelCaptions(
  videoUrl: string,
  scenes: { headline: string; body?: string; sceneType: string }[],
  durationSeconds: number
): Promise<string> {
  // # Build a script from scene headlines and body text
  const parts: string[] = [];
  for (const scene of scenes) {
    if (scene.sceneType === "brand_intro") continue;
    if (scene.headline) parts.push(scene.headline);
    if (scene.body) parts.push(scene.body);
  }
  const script = parts.join(". ").replace(/\.\./g, ".");

  if (!script || script.length < 10) {
    console.warn("[CaptionBurner] Script too short for captions — returning original video");
    return videoUrl;
  }

  return burnCaptions(videoUrl, script, durationSeconds);
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/visual/reel-designer.ts src/lib/visual/caption-burner.ts
git commit -m "feat: wire ElevenLabs voiceover into all reels, add general caption burn function"
```

---

### Task 7: Remotion Video Render Route

**Files:**
- Create: `src/app/api/video/render/route.ts`

**Interfaces:**
- Consumes: `designReel()` from `reel-designer.ts` (Task 6), `burnReelCaptions()` from `caption-burner.ts` (Task 6), `uploadVideo()` from `blob-storage.ts`, Prisma `Content` model
- Produces: `POST /api/video/render` — accepts `{ contentId }` or `{ reelConfig }`, renders MP4 via Remotion `bundle()` + `renderMedia()`, returns `{ videoUrl, renderId }`

- [ ] **Step 1: Create the render route**

Create `src/app/api/video/render/route.ts`:

```typescript
/* ============================================================
   VIDEO RENDER API — /api/video/render
   ============================================================
   POST: Renders a Remotion reel composition to MP4.
   Accepts either a contentId (reads ReelConfig from visualData)
   or a raw reelConfig object. Uses Remotion's bundle() +
   renderMedia() for server-side rendering.
   Uploads the result to Vercel Blob and updates the Content record.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/blob-storage";
import { burnReelCaptions } from "@/lib/visual/caption-burner";
import path from "path";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import type { ReelConfig } from "@/lib/visual/types";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    let reelConfig: ReelConfig;
    let contentId: string | null = body.contentId || null;

    // # Load reel config from Content record or use provided config
    if (contentId && !body.reelConfig) {
      const content = await prisma.content.findUnique({ where: { id: contentId } });
      if (!content?.visualData) {
        return NextResponse.json({ error: "Content not found or has no visual data" }, { status: 404 });
      }
      reelConfig = JSON.parse(content.visualData) as ReelConfig;
    } else if (body.reelConfig) {
      reelConfig = body.reelConfig as ReelConfig;
    } else {
      return NextResponse.json({ error: "Provide contentId or reelConfig" }, { status: 400 });
    }

    console.log(`[Video Render] Bundling Remotion project...`);

    // # Bundle the Remotion project (this compiles the React components)
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    // # Select the reel composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "Reel",
      inputProps: {
        scenes: reelConfig.scenes,
        voiceoverUrl: reelConfig.voiceoverUrl,
        musicUrl: reelConfig.musicUrl,
      },
    });

    // # Render to a temporary MP4 file
    const outputPath = path.join(tmpdir(), `reel-${randomUUID()}.mp4`);

    console.log(`[Video Render] Rendering ${reelConfig.totalDurationInFrames} frames at ${reelConfig.fps}fps...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        scenes: reelConfig.scenes,
        voiceoverUrl: reelConfig.voiceoverUrl,
        musicUrl: reelConfig.musicUrl,
      },
    });

    // # Read the rendered video and upload to Vercel Blob
    const videoBuffer = readFileSync(outputPath);
    let videoUrl = await uploadVideo(videoBuffer, `reel-${Date.now()}.mp4`);

    // # Clean up temp file
    try { unlinkSync(outputPath); } catch { /* ignore */ }

    // # Burn captions into the rendered video
    const durationSeconds = reelConfig.totalDurationInFrames / reelConfig.fps;
    videoUrl = await burnReelCaptions(videoUrl, reelConfig.scenes, durationSeconds);

    // # Update Content record if we have a contentId
    if (contentId) {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          videoUrl,
          videoRenderId: `local-${Date.now()}`,
        },
      });
    }

    console.log(`[Video Render] Complete → ${videoUrl}`);

    return NextResponse.json({
      videoUrl,
      renderId: `local-${Date.now()}`,
      durationSeconds,
      frames: reelConfig.totalDurationInFrames,
    });
  } catch (e) {
    console.error("[Video Render] Failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Video render failed: ${message}` }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds. The route compiles. Note: actual rendering requires Chrome/Chromium on the server — this will work locally and on Vercel with `@remotion/renderer`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/video/render/route.ts
git commit -m "feat: add Remotion server-side video render route"
```

---

### Task 8: TikTok Content Posting API v2

**Files:**
- Modify: `src/lib/social-posting.ts`

**Interfaces:**
- Consumes: `PlatformCredential` from Prisma (existing), `fetch` for TikTok API calls
- Produces: `postToTikTok()` now handles video posts and photo carousel posts via TikTok Content Posting API v2

- [ ] **Step 1: Replace the TikTok stub with a working implementation**

In `src/lib/social-posting.ts`, replace the entire TikTok section (the `postToTikTok` function) with:

```typescript
/* ---- TikTok ---- */
/* Uses the TikTok Content Posting API v2 */
/* Supports: video posts and photo/carousel posts */
export async function postToTikTok(content: string, mediaUrl?: string, mediaType?: "video" | "photo"): Promise<PostResult> {
  const token = await getToken("tiktok", "TIKTOK_ACCESS_TOKEN");

  if (!token) {
    return { success: false, error: "TikTok not connected — go to Settings tab to connect your account" };
  }

  try {
    // # Photo/carousel posts — upload individual images
    if (mediaType === "photo" && mediaUrl) {
      const imageUrls = mediaUrl.split(",").map((u) => u.trim()).filter(Boolean);
      if (imageUrls.length === 0) {
        return { success: false, error: "No images provided for TikTok carousel" };
      }

      // # Initialize photo post with image URLs
      const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            photo_cover_index: 0,
            photo_images: imageUrls,
          },
          post_mode: "DIRECT_POST",
          media_type: "PHOTO",
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.text();
        return { success: false, error: `TikTok photo init failed: ${err}` };
      }

      const initData = await initRes.json();
      return { success: true, platformPostId: initData.data?.publish_id };
    }

    // # Video posts — upload video from URL
    if (mediaUrl && (!mediaType || mediaType === "video")) {
      // # Step 1: Initialize video upload by URL
      const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: content.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: mediaUrl,
          },
          post_mode: "DIRECT_POST",
          media_type: "VIDEO",
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.text();
        return { success: false, error: `TikTok video init failed: ${err}` };
      }

      const initData = await initRes.json();
      return { success: true, platformPostId: initData.data?.publish_id };
    }

    return { success: false, error: "TikTok requires a media URL (video or photo carousel)" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
```

- [ ] **Step 2: Update the unified poster to pass media type**

Replace the TikTok case in `postToPlatform`:

```typescript
case "tiktok": return postToTikTok(content, imageUrl, (imageUrl?.includes(",") ? "photo" : "video") as "video" | "photo");
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/social-posting.ts
git commit -m "feat: implement TikTok Content Posting API v2 (video + carousel)"
```

---

### Task 9: Prisma Schema Updates & Scheduler Upgrade

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/scheduler/route.ts`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: Existing `Content` model, `postToPlatform()` from `social-posting.ts` (Task 8)
- Produces: `retryAt`, `retryCount`, `rejectionNote`, editorial score fields on Content model. Scheduler now handles retry logic.

- [ ] **Step 1: Add new fields to Prisma schema**

In `prisma/schema.prisma`, add these fields to the Content model after `pdfUrl` (added in Task 4):

```prisma
  retryAt        DateTime?                         // When to retry a failed post
  retryCount     Int       @default(0)             // Number of post retry attempts
  rejectionNote  String?                           // Why admin rejected this content
  // # Multi-dimensional editorial scores (upgrade from single editorialScore)
  editorialHookScore     Float?                    // Hook strength 1-10
  editorialSpecScore     Float?                    // Specificity 1-10
  editorialBrandScore    Float?                    // Brand alignment 1-10
  editorialPlatformScore Float?                    // Platform fit 1-10
```

- [ ] **Step 2: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 3: Add retry logic to scheduler route**

In `src/app/api/scheduler/route.ts`, add a second query after the `due` query to find retryable posts:

```typescript
  // # Find failed posts that are due for retry (max 1 retry)
  const retryable = await prisma.content.findMany({
    where: {
      status: "failed",
      retryAt: { lte: now },
      retryCount: { lt: 1 },
    },
    orderBy: { retryAt: "asc" },
  });

  // # Combine scheduled + retryable posts
  const allDue = [...due, ...retryable];

  if (allDue.length === 0) {
    return NextResponse.json({ posted: 0, message: "No scheduled or retryable posts due" });
  }
```

Then update the loop to use `allDue` instead of `due`, and replace the failure handling block:

```typescript
    if (result.success) {
      await prisma.content.update({
        where: { id: item.id },
        data: {
          status: "posted",
          postedAt: new Date(),
          platformPostId: result.platformPostId,
        },
      });
      results.push({ id: item.id, platform: item.platform, success: true });
    } else {
      // # Set retry for 30 minutes later if first attempt, mark permanently failed if second
      const retryCount = (item.retryCount || 0) + 1;
      await prisma.content.update({
        where: { id: item.id },
        data: {
          status: retryCount >= 2 ? "failed" : "failed",
          retryAt: retryCount < 2 ? new Date(now.getTime() + 30 * 60 * 1000) : null,
          retryCount,
          notes: `Auto-post attempt ${retryCount} failed at ${now.toISOString()}: ${result.error}`,
        },
      });
      results.push({ id: item.id, platform: item.platform, success: false, error: result.error });
    }
```

- [ ] **Step 4: Update vercel.json with new cron schedule**

Replace the contents of `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/pipeline/weekly",
      "schedule": "0 22 * * 0"
    },
    {
      "path": "/api/scheduler",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/engagement/pull",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/ambassador/generate",
      "schedule": "0 7 * * 2,4"
    },
    {
      "path": "/api/email/send",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/funnel/sync",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/blog/generate",
      "schedule": "0 8 * * 1,3,5"
    }
  ]
}
```

- [ ] **Step 5: Verify build**

Run: `npx prisma generate && npx next build 2>&1 | tail -20`
Expected: Prisma generates, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/app/api/scheduler/route.ts vercel.json
git commit -m "feat: add retry logic to scheduler, update cron schedule, add editorial score fields"
```

---

### Task 10: Engagement Auto-Pull Route

**Files:**
- Create: `src/app/api/engagement/pull/route.ts`

**Interfaces:**
- Consumes: `PlatformCredential` from Prisma, `Content` model with engagement fields, `CRON_SECRET` auth pattern
- Produces: `GET /api/engagement/pull` — daily cron that pulls metrics from LinkedIn/X/Instagram/TikTok APIs and updates Content records

- [ ] **Step 1: Create the engagement pull route**

Create `src/app/api/engagement/pull/route.ts`:

```typescript
/* ============================================================
   ENGAGEMENT PULL — /api/engagement/pull
   ============================================================
   GET: Cron-triggered daily at 8 AM UTC. Pulls engagement
   metrics from platform APIs for all posted content from the
   last 7 days and updates the Content records.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// # Composite score weights (same as /api/content/[id]/engagement)
const WEIGHTS = { likes: 1, comments: 3, shares: 4, saves: 5, impressions: 0.01 };

// # Compute composite engagement score
function computeScore(likes: number, comments: number, shares: number, saves: number, impressions: number): number {
  return likes * WEIGHTS.likes + comments * WEIGHTS.comments + shares * WEIGHTS.shares + saves * WEIGHTS.saves + impressions * WEIGHTS.impressions;
}

// # Load token from DB, fall back to env var
async function getToken(platform: string, envKey: string): Promise<string | null> {
  try {
    const cred = await prisma.platformCredential.findUnique({ where: { platform } });
    if (cred?.accessToken) return cred.accessToken;
  } catch { /* fall back */ }
  return process.env[envKey] || null;
}

// # Pull LinkedIn engagement via UGC Posts API
async function pullLinkedIn(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postId)}?count=0`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      likes: data.likesSummary?.totalLikes || 0,
      comments: data.commentsSummary?.totalFirstLevelComments || 0,
      shares: data.shareCount || 0,
      impressions: 0, // # LinkedIn doesn't expose impressions via this endpoint
    };
  } catch { return null; }
}

// # Pull X/Twitter engagement via Tweet Metrics v2
async function pullTwitter(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://api.x.com/2/tweets/${postId}?tweet.fields=public_metrics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const m = data.data?.public_metrics;
    if (!m) return null;
    return {
      likes: m.like_count || 0,
      comments: m.reply_count || 0,
      shares: m.retweet_count + (m.quote_count || 0),
      impressions: m.impression_count || 0,
    };
  } catch { return null; }
}

// # Pull Instagram engagement via Graph API insights
async function pullInstagram(postId: string, token: string): Promise<{ likes: number; comments: number; saves: number; impressions: number } | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${postId}?fields=like_count,comments_count,insights.metric(saved,impressions)&access_token=${token}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    let saves = 0;
    let impressions = 0;
    if (data.insights?.data) {
      for (const insight of data.insights.data) {
        if (insight.name === "saved") saves = insight.values?.[0]?.value || 0;
        if (insight.name === "impressions") impressions = insight.values?.[0]?.value || 0;
      }
    }
    return {
      likes: data.like_count || 0,
      comments: data.comments_count || 0,
      saves,
      impressions,
    };
  } catch { return null; }
}

// # Pull TikTok engagement via Content Stats API
async function pullTikTok(postId: string, token: string): Promise<{ likes: number; comments: number; shares: number; impressions: number } | null> {
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filters: { video_ids: [postId] },
        fields: ["like_count", "comment_count", "share_count", "view_count"],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const video = data.data?.videos?.[0];
    if (!video) return null;
    return {
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      impressions: video.view_count || 0,
    };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  // # Cron auth — same pattern as ambassador/generate
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // # Find all posted content from the last 7 days with a platformPostId
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: sevenDaysAgo },
      platformPostId: { not: null },
    },
  });

  if (posts.length === 0) {
    return NextResponse.json({ updated: 0, message: "No recent posts to pull metrics for" });
  }

  // # Load platform tokens
  const tokens: Record<string, string | null> = {
    linkedin: await getToken("linkedin", "LINKEDIN_ACCESS_TOKEN"),
    twitter: await getToken("twitter", "TWITTER_BEARER_TOKEN"),
    instagram: await getToken("instagram", "INSTAGRAM_ACCESS_TOKEN"),
    tiktok: await getToken("tiktok", "TIKTOK_ACCESS_TOKEN"),
  };

  let updated = 0;
  let skipped = 0;

  for (const post of posts) {
    const token = tokens[post.platform];
    if (!token || !post.platformPostId) {
      skipped++;
      continue;
    }

    let metrics: { likes: number; comments: number; shares?: number; saves?: number; impressions: number } | null = null;

    // # Pull metrics based on platform
    switch (post.platform) {
      case "linkedin":
        metrics = await pullLinkedIn(post.platformPostId, token);
        break;
      case "twitter":
        metrics = await pullTwitter(post.platformPostId, token);
        break;
      case "instagram":
        metrics = await pullInstagram(post.platformPostId, token);
        break;
      case "tiktok":
        metrics = await pullTikTok(post.platformPostId, token);
        break;
    }

    if (metrics) {
      const likes = metrics.likes;
      const comments = metrics.comments;
      const shares = metrics.shares || 0;
      const saves = metrics.saves || 0;
      const impressions = metrics.impressions;
      const score = computeScore(likes, comments, shares, saves, impressions);

      await prisma.content.update({
        where: { id: post.id },
        data: {
          engagementLikes: likes,
          engagementComments: comments,
          engagementShares: shares,
          engagementSaves: saves,
          engagementImpressions: impressions,
          engagementScore: score,
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ updated, skipped, total: posts.length });
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/engagement/pull/route.ts
git commit -m "feat: add daily engagement auto-pull cron from platform APIs"
```

---

### Task 11: Dynamic Voice Samples & Performance Digest

**Files:**
- Create: `src/lib/dynamic-voice.ts`
- Create: `src/lib/performance-digest.ts`

**Interfaces:**
- Consumes: `prisma` for querying Content records with engagement scores
- Produces: `buildDynamicVoiceSamples(platform: string, contentType: string): Promise<string>` — returns few-shot prompt section; `generateWeeklyDigest(): Promise<string>` — returns performance summary for strategist prompt

- [ ] **Step 1: Create dynamic-voice.ts**

Create `src/lib/dynamic-voice.ts`:

```typescript
/* ============================================================
   DYNAMIC VOICE SAMPLES — Performance-Driven Few-Shot Examples
   ============================================================
   Replaces static voice samples with real top-performing content
   from the database. Falls back to static samples when there
   isn't enough engagement data yet (first few weeks).
   ============================================================ */

import { prisma } from "./prisma";
import { getVoiceSamplesPrompt } from "./voice-samples";

// # Get top-performing content for a platform + content type combo
async function getTopPerformers(
  platform: string,
  contentType: string,
  limit: number = 3,
  daysBack: number = 30
): Promise<{ body: string; engagementScore: number; platform: string; contentType: string }[]> {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const where: any = {
    status: "posted",
    engagementScore: { not: null, gt: 0 },
    postedAt: { gte: since },
  };
  // # Filter by platform if specified
  if (platform) where.platform = platform;
  // # Filter by content type if specified (but allow broad matches)
  if (contentType && contentType !== "post") where.contentType = contentType;

  const results = await prisma.content.findMany({
    where,
    orderBy: { engagementScore: "desc" },
    take: limit,
    select: {
      body: true,
      engagementScore: true,
      platform: true,
      contentType: true,
    },
  });

  return results.map((r) => ({
    body: r.body,
    engagementScore: r.engagementScore || 0,
    platform: r.platform,
    contentType: r.contentType,
  }));
}

// # Build voice samples from top performers for injection into agent prompts
// # Falls back to static samples when insufficient data
export async function buildDynamicVoiceSamples(
  platform: string,
  contentType: string
): Promise<string> {
  const topPosts = await getTopPerformers(platform, contentType);

  // # Not enough data yet — fall back to static voice samples
  if (topPosts.length < 2) {
    return getVoiceSamplesPrompt(platform);
  }

  // # Build few-shot examples from real top-performing content
  const examples = topPosts
    .map((post, i) => `EXAMPLE ${i + 1} (engagement score: ${post.engagementScore.toFixed(1)}):\n---\n${post.body}\n---`)
    .join("\n\n");

  return `VOICE REFERENCE — Your Best-Performing ${platform.toUpperCase()} Content:
Here are your top-performing posts on ${platform} from the last 30 days. Study what made them work — the hooks, the specificity, the tone. Write content at this quality level or better.

${examples}

Use these as style references, not templates. Match the energy and specificity, but create original content.`;
}
```

- [ ] **Step 2: Create performance-digest.ts**

Create `src/lib/performance-digest.ts`:

```typescript
/* ============================================================
   PERFORMANCE DIGEST — Weekly Analytics for Content Strategy
   ============================================================
   Generates a performance summary of the last week's content.
   Injected into the strategist agent's prompt during the Sunday
   night pipeline so the next week's plan learns from what
   actually worked.
   ============================================================ */

import { prisma } from "./prisma";

// # Generate a weekly performance digest for the strategist
export async function generateWeeklyDigest(): Promise<string> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // # Get all posted content from the last 7 days with engagement data
  const recentPosts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: oneWeekAgo },
      engagementScore: { not: null },
    },
    orderBy: { engagementScore: "desc" },
    select: {
      platform: true,
      contentType: true,
      title: true,
      body: true,
      hook: true,
      engagementScore: true,
      engagementLikes: true,
      engagementComments: true,
      engagementShares: true,
      engagementSaves: true,
      engagementImpressions: true,
    },
  });

  if (recentPosts.length === 0) {
    return "PERFORMANCE DIGEST: No posted content with engagement data from the past week. This is likely the first week — focus on quality and variety.";
  }

  // # Top 3 performers
  const top3 = recentPosts.slice(0, 3);
  const topSection = top3
    .map((p, i) => `  ${i + 1}. [${p.platform}/${p.contentType}] "${p.hook || p.title}" — score: ${p.engagementScore?.toFixed(1)} (${p.engagementLikes || 0} likes, ${p.engagementComments || 0} comments, ${p.engagementShares || 0} shares)`)
    .join("\n");

  // # Bottom 3 performers
  const bottom3 = recentPosts.slice(-3).reverse();
  const bottomSection = bottom3
    .map((p, i) => `  ${i + 1}. [${p.platform}/${p.contentType}] "${p.hook || p.title}" — score: ${p.engagementScore?.toFixed(1)}`)
    .join("\n");

  // # Platform averages
  const platformScores: Record<string, number[]> = {};
  for (const post of recentPosts) {
    if (!platformScores[post.platform]) platformScores[post.platform] = [];
    platformScores[post.platform].push(post.engagementScore || 0);
  }
  const platformAvg = Object.entries(platformScores)
    .map(([platform, scores]) => `  ${platform}: avg score ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} (${scores.length} posts)`)
    .join("\n");

  // # Content type performance
  const typeScores: Record<string, number[]> = {};
  for (const post of recentPosts) {
    if (!typeScores[post.contentType]) typeScores[post.contentType] = [];
    typeScores[post.contentType].push(post.engagementScore || 0);
  }
  const typeAvg = Object.entries(typeScores)
    .map(([type, scores]) => `  ${type}: avg score ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} (${scores.length} posts)`)
    .join("\n");

  // # Week-over-week trend
  const prevWeekPosts = await prisma.content.findMany({
    where: {
      status: "posted",
      postedAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
      engagementScore: { not: null },
    },
    select: { engagementScore: true },
  });

  let trendNote = "Not enough data for week-over-week comparison.";
  if (prevWeekPosts.length >= 3) {
    const thisWeekAvg = recentPosts.reduce((s, p) => s + (p.engagementScore || 0), 0) / recentPosts.length;
    const lastWeekAvg = prevWeekPosts.reduce((s, p) => s + (p.engagementScore || 0), 0) / prevWeekPosts.length;
    const change = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg * 100).toFixed(0);
    trendNote = `Week-over-week: ${Number(change) >= 0 ? "+" : ""}${change}% (this week avg: ${thisWeekAvg.toFixed(1)}, last week avg: ${lastWeekAvg.toFixed(1)})`;
  }

  return `LAST WEEK'S PERFORMANCE DIGEST:

TOP PERFORMERS:
${topSection}

LOWEST PERFORMERS:
${bottomSection}

PLATFORM AVERAGES:
${platformAvg}

CONTENT TYPE PERFORMANCE:
${typeAvg}

TREND: ${trendNote}

Use this data to inform your content strategy. Double down on what's working. Avoid patterns from the lowest performers.`;
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dynamic-voice.ts src/lib/performance-digest.ts
git commit -m "feat: add dynamic voice samples from top performers and weekly performance digest"
```

---

### Task 12: Editorial Agent Multi-Dimensional Scoring

**Files:**
- Modify: `src/lib/editorial.ts`

**Interfaces:**
- Consumes: `buildDynamicVoiceSamples()` from `dynamic-voice.ts` (Task 11)
- Produces: `EditorialReview` now includes `hookScore`, `specScore`, `brandScore`, `platformScore` (all 1-10). `reviewContent()` now accepts optional `topPerformerContext` parameter.

- [ ] **Step 1: Update EditorialReview type and reviewContent function**

In `src/lib/editorial.ts`, update the `EditorialReview` interface:

```typescript
export interface EditorialReview {
  score: number;            // # 1-10 overall quality score
  passed: boolean;          // # true if all dimension scores >= 7
  feedback: string;         // # Specific feedback on what was fixed or flagged
  revisedContent: string;   // # The improved version (or original if score >= 9)
  revisedHook: string;      // # Improved first line
  issues: string[];         // # List of specific issues found
  // # Multi-dimensional scores
  hookScore: number;        // # Hook strength 1-10
  specScore: number;        // # Specificity 1-10
  brandScore: number;       // # Brand alignment 1-10
  platformScore: number;    // # Platform fit 1-10
}
```

Update the `reviewContent` function signature to accept top performer context:

```typescript
export async function reviewContent(
  content: string,
  platform: string,
  contentType: string,
  hook: string,
  topPerformerContext?: string
): Promise<EditorialReview> {
```

Add the top performer context to the prompt (insert before the "TASK:" section):

```typescript
${topPerformerContext ? `\nTOP-PERFORMING CONTENT FOR REFERENCE:\n${topPerformerContext}\n\nCompare the content under review against these high performers. Does it match their quality, specificity, and voice?\n` : ""}
```

Update the JSON return format in the prompt to include dimension scores:

```
{
  "score": 8,
  "hookScore": 7,
  "specScore": 8,
  "brandScore": 9,
  "platformScore": 8,
  "issues": [...],
  "feedback": "...",
  "revisedContent": "...",
  "revisedHook": "..."
}
```

Update the parsed return to include the new fields:

```typescript
    return {
      score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
      passed: [parsed.hookScore, parsed.specScore, parsed.brandScore, parsed.platformScore]
        .every((s) => (Number(s) || 5) >= 7),
      feedback: String(parsed.feedback || ""),
      revisedContent: String(parsed.revisedContent || content),
      revisedHook: String(parsed.revisedHook || hook),
      issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
      hookScore: Math.min(10, Math.max(1, Number(parsed.hookScore) || 5)),
      specScore: Math.min(10, Math.max(1, Number(parsed.specScore) || 5)),
      brandScore: Math.min(10, Math.max(1, Number(parsed.brandScore) || 5)),
      platformScore: Math.min(10, Math.max(1, Number(parsed.platformScore) || 5)),
    };
```

Update `buildPassthrough` to include the new fields:

```typescript
function buildPassthrough(content: string, hook: string): EditorialReview {
  return {
    score: 0,
    passed: true,
    feedback: "Editorial review unavailable — using original content",
    revisedContent: content,
    revisedHook: hook,
    issues: [],
    hookScore: 0,
    specScore: 0,
    brandScore: 0,
    platformScore: 0,
  };
}
```

- [ ] **Step 2: Verify build — fix any callers of reviewContent**

The existing callers in `agents.ts` call `reviewContent(body, platform, contentType, hook)` — the new `topPerformerContext` parameter is optional, so existing calls won't break.

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/editorial.ts
git commit -m "feat: upgrade editorial agent with multi-dimensional scoring and top-performer context"
```

---

### Task 13: Weekly Pipeline Route

**Files:**
- Create: `src/app/api/pipeline/weekly/route.ts`

**Interfaces:**
- Consumes: `generateWeeklyDigest()` from `performance-digest.ts` (Task 11), `buildDynamicVoiceSamples()` from `dynamic-voice.ts` (Task 11), agents system from `agents.ts`, `designVisual()` from `designer-agent.ts` (Task 3), `assembleCarouselPdf()` from `pdf-carousel.ts` (Task 4), `uploadMedia()` from `blob-storage.ts`, CRON_SECRET auth pattern
- Produces: `GET /api/pipeline/weekly` — Sunday night cron that generates a full week of content, renders visuals, and queues everything for approval

- [ ] **Step 1: Create the weekly pipeline route**

Create `src/app/api/pipeline/weekly/route.ts`:

```typescript
/* ============================================================
   WEEKLY PIPELINE — /api/pipeline/weekly
   ============================================================
   GET: Cron-triggered Sunday 10 PM UTC. Generates a full
   week of content: pulls performance data, creates a plan via
   the strategist agent, generates all content, renders visuals,
   and queues everything with status "pending" for admin review.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/gemini";
import { generateWeeklyDigest } from "@/lib/performance-digest";
import { buildDynamicVoiceSamples } from "@/lib/dynamic-voice";
import { designVisual } from "@/lib/visual/designer-agent";
import { assembleCarouselPdf } from "@/lib/visual/pdf-carousel";
import { generateImage } from "@/lib/visual/openai-image";
import { uploadImage, uploadMedia } from "@/lib/blob-storage";
import { getDimensions } from "@/lib/visual/types";
import { reviewContent } from "@/lib/editorial";

// # Default calendar config — generates a balanced mix of content types
// # This can be overridden by a ContentPlan or dashboard settings
const DEFAULT_PLAN = [
  { platform: "linkedin", contentType: "carousel", day: "Monday" },
  { platform: "twitter", contentType: "single_image", day: "Monday" },
  { platform: "instagram", contentType: "single_image", day: "Tuesday" },
  { platform: "tiktok", contentType: "carousel", day: "Tuesday" },
  { platform: "linkedin", contentType: "single_image", day: "Wednesday" },
  { platform: "twitter", contentType: "post", day: "Wednesday" },
  { platform: "instagram", contentType: "carousel", day: "Thursday" },
  { platform: "tiktok", contentType: "single_image", day: "Thursday" },
  { platform: "linkedin", contentType: "single_image", day: "Friday" },
  { platform: "linkedin", contentType: "carousel", day: "Saturday" },
  { platform: "instagram", contentType: "single_image", day: "Sunday" },
];

export async function GET(req: NextRequest) {
  // # Cron auth
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { title: string; platform: string; contentType: string; status: string; error?: string }[] = [];

  try {
    // # Step 1: Pull performance digest
    console.log("[Pipeline] Pulling performance digest...");
    const digest = await generateWeeklyDigest();

    // # Step 2: Check for a custom calendar config (ContentPlan with status "active")
    const activePlan = await prisma.contentPlan.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });

    let calendarItems = DEFAULT_PLAN;
    if (activePlan?.plan) {
      try {
        const parsed = JSON.parse(activePlan.plan);
        if (Array.isArray(parsed) && parsed.length > 0) {
          calendarItems = parsed;
        }
      } catch { /* use default */ }
    }

    // # Step 3: Generate content for each calendar item
    for (const item of calendarItems) {
      try {
        console.log(`[Pipeline] Generating ${item.platform}/${item.contentType} for ${item.day}...`);

        // # Get dynamic voice samples for this platform
        const voiceSamples = await buildDynamicVoiceSamples(item.platform, item.contentType);

        // # Generate content via Gemini with performance context
        const contentPrompt = `You are a senior content strategist for JobPilot AI (jobpilotai.co), a premium career tech platform.

${digest}

${voiceSamples}

Create a ${item.contentType} post for ${item.platform}. Choose a topic that will perform well based on the performance data above. Write the content in the same voice and quality as the top performers.

RULES:
- Zero emojis
- Specific numbers, data, or scenarios — not generic advice
- One clear takeaway per piece
- If mentioning JobPilot, be natural (1-2x max, never the focus)
- ${item.contentType === "carousel" ? "Create content for a 4-6 slide carousel. Slide 1 is the hook, last slide is CTA." : ""}
- ${item.contentType === "post" ? "Plain text post, no image needed." : ""}

Return JSON:
{
  "title": "internal label for this content",
  "body": "the full post content",
  "hook": "the first line / scroll-stopper",
  "hashtags": "comma,separated,hashtags",
  "mediaPrompt": "brief description of what the accompanying image should show"
}

Return ONLY valid JSON.`;

        const raw = await callGemini(contentPrompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const parsed = JSON.parse(jsonMatch[0]);

        // # Editorial review
        const review = await reviewContent(
          parsed.body,
          item.platform,
          item.contentType,
          parsed.hook || ""
        );

        const finalBody = review.passed ? review.revisedContent : parsed.body;
        const finalHook = review.passed ? review.revisedHook : (parsed.hook || "");

        // # Create Content record
        const content = await prisma.content.create({
          data: {
            agent: "pipeline",
            platform: item.platform,
            contentType: item.contentType,
            title: parsed.title || `${item.day} ${item.platform} ${item.contentType}`,
            body: finalBody,
            hook: finalHook,
            captionText: finalBody,
            hashtags: parsed.hashtags || null,
            mediaPrompt: parsed.mediaPrompt || null,
            status: "pending",
            editorialScore: review.score,
            editorialFeedback: review.feedback,
            editorialHookScore: review.hookScore,
            editorialSpecScore: review.specScore,
            editorialBrandScore: review.brandScore,
            editorialPlatformScore: review.platformScore,
            notes: JSON.stringify({ day: item.day, generatedBy: "weekly-pipeline" }),
          },
        });

        // # Render visuals for image-based content types
        if (item.contentType !== "post" && item.contentType !== "thread") {
          try {
            const design = await designVisual(
              finalBody,
              item.platform,
              item.contentType,
              parsed.mediaPrompt,
              parsed.title
            );

            const { width, height } = getDimensions(item.platform, item.contentType);
            const imageBuffers: Buffer[] = [];

            // # Render each slide via OpenAI
            for (const slide of design.slides) {
              if (slide.aiImagePrompt) {
                const imgBuffer = await generateImage(slide.aiImagePrompt, width, height, item.platform);
                if (imgBuffer) {
                  imageBuffers.push(imgBuffer);
                }
              }
            }

            if (imageBuffers.length > 0) {
              // # Upload images to Blob
              const imageUrls: string[] = [];
              for (let i = 0; i < imageBuffers.length; i++) {
                const url = await uploadImage(imageBuffers[i], `pipeline-${content.id}-slide-${i}.png`);
                imageUrls.push(url);
              }

              // # For carousels on LinkedIn, also create a PDF
              let pdfUrl: string | null = null;
              if (item.contentType === "carousel" && item.platform === "linkedin" && imageBuffers.length > 1) {
                const pdfBuffer = await assembleCarouselPdf(imageBuffers);
                pdfUrl = await uploadMedia(pdfBuffer, `pipeline-${content.id}-carousel.pdf`, "application/pdf");
              }

              // # Update Content record with image URLs
              await prisma.content.update({
                where: { id: content.id },
                data: {
                  imageUrl: imageUrls.join(","),
                  pdfUrl,
                  visualData: JSON.stringify(design.slides),
                  captionText: design.caption || finalBody,
                },
              });
            }
          } catch (vizErr) {
            console.warn(`[Pipeline] Visual generation failed for ${content.id}:`, vizErr);
          }
        }

        results.push({ title: parsed.title, platform: item.platform, contentType: item.contentType, status: "queued" });
      } catch (itemErr) {
        const msg = itemErr instanceof Error ? itemErr.message : "Unknown error";
        console.error(`[Pipeline] Failed to generate ${item.platform}/${item.contentType}:`, msg);
        results.push({ title: "FAILED", platform: item.platform, contentType: item.contentType, status: "error", error: msg });
      }
    }

    const queued = results.filter((r) => r.status === "queued").length;
    const errored = results.filter((r) => r.status === "error").length;

    return NextResponse.json({ queued, errored, results });
  } catch (e) {
    console.error("[Pipeline] Fatal error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/pipeline/weekly/route.ts
git commit -m "feat: add Sunday night weekly content pipeline with auto-generation and approval queue"
```

---

### Task 14: Final Verification & Sync Database

**Files:**
- No new files — verification only

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified build, synced database schema

- [ ] **Step 1: Regenerate Prisma client with all schema changes**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 2: Sync the database schema**

Run: `node scripts/sync-db.mjs`
Expected: Schema sync completes without errors.

- [ ] **Step 3: Full build verification**

Run: `npx next build 2>&1 | tail -30`
Expected: Build succeeds with zero errors. All new routes and modules compile.

- [ ] **Step 4: Verify all new routes are accessible**

Check that these route files exist:
- `src/app/api/video/render/route.ts`
- `src/app/api/engagement/pull/route.ts`
- `src/app/api/pipeline/weekly/route.ts`

Run: `ls src/app/api/video/render/route.ts src/app/api/engagement/pull/route.ts src/app/api/pipeline/weekly/route.ts`
Expected: All three files listed.

- [ ] **Step 5: Commit if any changes needed**

```bash
git add -A
git commit -m "chore: final verification pass — prisma regenerate and schema sync"
```
