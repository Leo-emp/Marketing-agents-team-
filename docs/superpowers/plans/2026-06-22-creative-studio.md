# Creative Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add premium AI image generation (fal.ai Flux), AI video reels (fal.ai Wan/Kling), and AI brand ambassador videos (HeyGen) to Marketing HQ, with all media hosted on Vercel Blob.

**Architecture:** fal.ai Flux replaces OpenAI as the default image generator with OpenAI as fallback. fal.ai Wan/Kling generates video clips stitched by FFmpeg. HeyGen produces talking-head ambassador videos from Gemini scripts. All generated media uploads to Vercel Blob for proper HTTPS URLs.

**Tech Stack:** Next.js 16, @fal-ai/client, @vercel/blob, fluent-ffmpeg, HeyGen REST API, Prisma/LibSQL, Gemini 2.5 Flash, Tailwind v4

## Global Constraints

- Next.js 16 with breaking changes — read `node_modules/next/dist/docs/` before writing route handlers
- `// #` comment style throughout ALL code — user is learning, every section needs explanation
- Dark theme: `#09090b` bg, indigo (#6366f1) / violet (#8b5cf6) palette
- Admin auth: `isAdmin()` from `@/lib/auth-check` — returns `Promise<boolean>`
- Cron auth: `CRON_SECRET` + `timingSafeEqual` pattern (copy from `src/app/api/blog/generate/route.ts`)
- Prisma: `import { prisma } from "@/lib/prisma"` — libsql adapter
- Gemini: `import { callGemini } from "@/lib/gemini"` — returns `Promise<string>`
- Quality: all images min 1080px shortest side, all videos 1080p, blog covers 1200x630
- fal.ai Flux Pro Ultra (`fal-ai/flux-pro/v1.1-ultra`) as default image model
- All generated media uploaded to Vercel Blob — no base64 data URLs for final output
- Image fallback chain: fal.ai Flux → OpenAI gpt-image-1 → Canvas 2D
- Existing Content model fields used as-is (no schema changes): `imageUrl`, `videoUrl`, `notes`, `contentType`
- `params` is `Promise<>` in Next.js 16 route handlers — must `await params`

## File Structure

**New files:**
- `src/lib/blob-storage.ts` — Vercel Blob upload utilities (image + video)
- `src/lib/visual/fal-image.ts` — fal.ai Flux image generation (Schnell + Pro)
- `src/lib/visual/fal-video.ts` — fal.ai Wan/Kling text-to-video generation
- `src/lib/visual/video-assembler.ts` — FFmpeg clip stitching for reels
- `src/lib/visual/heygen-avatar.ts` — HeyGen API avatar video generation
- `src/lib/ambassador.ts` — Ambassador video orchestrator (script → voice → avatar → queue)
- `src/app/api/creative/generate-image/route.ts` — Admin: on-demand image generation
- `src/app/api/creative/generate-video/route.ts` — Admin: on-demand video clip generation
- `src/app/api/creative/generate-ambassador/route.ts` — Admin: on-demand ambassador video
- `src/app/api/ambassador/generate/route.ts` — Cron: automated ambassador video Tue/Thu

**Modified files:**
- `package.json` — add @fal-ai/client, @vercel/blob, fluent-ffmpeg, @ffmpeg-installer/ffmpeg, @types/fluent-ffmpeg
- `src/app/api/visual/route.ts` — fal.ai as primary renderer, Blob upload, model selection
- `src/lib/blog-writer.ts` — fal.ai Flux + Blob for cover images
- `src/app/page.tsx` — model selector dropdown, ambassador video section, video preview
- `vercel.json` — add ambassador cron schedule

---

### Task 1: Blob Storage + fal.ai Image Provider

**Files:**
- Modify: `package.json`
- Create: `src/lib/blob-storage.ts`
- Create: `src/lib/visual/fal-image.ts`

**Interfaces:**
- Consumes: nothing (foundation task)
- Produces:
  - `uploadMedia(buffer: Buffer, filename: string, contentType: string): Promise<string>` — returns HTTPS Blob URL
  - `uploadFromUrl(url: string, filename: string): Promise<string>` — downloads remote URL, uploads to Blob
  - `generateFalImage(prompt: string, width: number, height: number, options?: { model?: "flux-pro" | "flux-schnell"; negativePrompt?: string }): Promise<Buffer | null>` — returns PNG buffer or null

- [ ] **Step 1: Install npm packages**

```bash
cd C:/Users/User/jobpilot-marketing && npm install @fal-ai/client @vercel/blob fluent-ffmpeg @ffmpeg-installer/ffmpeg && npm install -D @types/fluent-ffmpeg
```

Expected: packages install successfully, package.json updated.

- [ ] **Step 2: Create blob-storage.ts**

Create `src/lib/blob-storage.ts`:

```typescript
/* ============================================================
   VERCEL BLOB STORAGE — Media Upload Utilities
   ============================================================
   Uploads generated images and videos to Vercel Blob for
   proper HTTPS URLs. Replaces base64 data URLs that social
   platforms reject in OG tags and link previews.
   ============================================================ */

import { put } from "@vercel/blob";

// # Upload a buffer (image or video) to Vercel Blob
// # Returns the public HTTPS URL for the uploaded file
// # filename should include extension (e.g. "cover-abc123.png")
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  // # Vercel Blob requires BLOB_READ_WRITE_TOKEN env var
  // # The token is created automatically when you add Blob to your Vercel project
  const { url } = await put(filename, buffer, {
    access: "public",
    contentType,
    // # addRandomSuffix prevents filename collisions across uploads
    addRandomSuffix: true,
  });

  console.log(`[Blob] Uploaded ${filename} (${(buffer.length / 1024).toFixed(0)}KB) → ${url}`);
  return url;
}

// # Upload an image buffer — convenience wrapper with PNG content type
export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  return uploadMedia(buffer, filename, "image/png");
}

// # Upload a video buffer — convenience wrapper with MP4 content type
export async function uploadVideo(buffer: Buffer, filename: string): Promise<string> {
  return uploadMedia(buffer, filename, "video/mp4");
}

// # Download a file from a remote URL and re-upload to Vercel Blob
// # Useful for HeyGen/fal.ai results that return temporary URLs
export async function uploadFromUrl(url: string, filename: string): Promise<string> {
  // # Fetch the remote file
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download from ${url}: ${res.status}`);
  }

  // # Read as buffer
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // # Detect content type from response headers or filename extension
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    res.headers.get("content-type") ||
    (ext === "mp4" ? "video/mp4" : ext === "webm" ? "video/webm" : "image/png");

  return uploadMedia(buffer, filename, contentType);
}
```

- [ ] **Step 3: Create fal-image.ts**

Create `src/lib/visual/fal-image.ts`:

```typescript
/* ============================================================
   FAL.AI IMAGE GENERATION — Flux Pro / Schnell
   ============================================================
   Premium image generation using fal.ai's Flux models.
   Replaces OpenAI as the default image generator.
   - Flux Pro Ultra: $0.05/image, best quality, 3-5s
   - Flux Schnell: $0.003/image, fast, 1-2s
   Falls back to null on failure (caller tries OpenAI, then Canvas 2D).
   ============================================================ */

import { fal } from "@fal-ai/client";

// # Model IDs for fal.ai — these are the endpoint paths
const MODELS = {
  "flux-pro": "fal-ai/flux-pro/v1.1-ultra",
  "flux-schnell": "fal-ai/flux/schnell",
} as const;

// # Image model options — exposed to API routes and dashboard
export type FalImageModel = keyof typeof MODELS;

// # Configure the fal client with the API key
// # FAL_KEY env var must be set in Vercel project settings
function ensureClient() {
  const key = process.env.FAL_KEY;
  if (!key) {
    console.warn("[fal.ai] No FAL_KEY — falling back to next provider");
    return false;
  }
  fal.config({ credentials: key });
  return true;
}

// # Generate a photorealistic image using fal.ai Flux
// # Returns PNG buffer on success, null on failure (caller falls back)
export async function generateFalImage(
  prompt: string,
  width: number,
  height: number,
  options?: {
    model?: FalImageModel;
    negativePrompt?: string;
  }
): Promise<Buffer | null> {
  if (!ensureClient()) return null;

  const model = options?.model || "flux-pro";
  const endpointId = MODELS[model];

  // # Brand-consistent negative prompt — filters out common AI artifacts
  const negativePrompt =
    options?.negativePrompt ||
    "low quality, blurry, watermark, text artifacts, distorted, deformed, ugly, duplicate";

  try {
    console.log(`[fal.ai] Generating ${width}x${height} image with ${model}...`);

    // # fal.ai accepts image_size as an object with width/height
    const result = await fal.subscribe(endpointId, {
      input: {
        prompt,
        image_size: { width, height },
        num_images: 1,
        // # Flux Pro supports negative prompts; Schnell may ignore them
        ...(model === "flux-pro" ? { negative_prompt: negativePrompt } : {}),
        // # High quality settings
        num_inference_steps: model === "flux-pro" ? 28 : 4,
        guidance_scale: model === "flux-pro" ? 3.5 : 0,
        // # Enable safety checker to avoid NSFW content
        enable_safety_checker: true,
      },
      // # Log progress for observability
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`[fal.ai] Generating... ${update.status}`);
        }
      },
    });

    // # Extract the image URL from the response
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const images = (result as any).data?.images || (result as any).images;
    if (!images || images.length === 0) {
      console.warn("[fal.ai] No images in response");
      return null;
    }

    // # Download the generated image (fal.ai returns a temporary URL)
    const imageUrl = images[0].url;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      console.warn(`[fal.ai] Failed to download image: ${imageRes.status}`);
      return null;
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[fal.ai] Generated ${(buffer.length / 1024).toFixed(0)}KB image with ${model}`);
    return buffer;
  } catch (err) {
    console.error("[fal.ai] Image generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors related to blob-storage.ts or fal-image.ts. Pre-existing errors are acceptable.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add package.json package-lock.json src/lib/blob-storage.ts src/lib/visual/fal-image.ts && git commit -m "feat: add Vercel Blob storage + fal.ai Flux image provider"
```

---

### Task 2: Visual Pipeline Upgrade — fal.ai Primary + Blob Storage

**Files:**
- Modify: `src/app/api/visual/route.ts`
- Modify: `src/lib/blog-writer.ts`

**Interfaces:**
- Consumes:
  - `generateFalImage(prompt, width, height, options?)` from `@/lib/visual/fal-image`
  - `uploadImage(buffer, filename)` from `@/lib/blob-storage`
  - `generateImage(prompt, width, height, platform)` from `@/lib/visual/openai-image` (fallback)
  - `renderSlideCanvas(data, width, height)` from `@/lib/visual/canvas-renderer` (final fallback)
- Produces:
  - Updated `POST /api/visual` route that accepts optional `model` field and returns Blob URLs instead of base64
  - Updated blog writer that stores cover images as HTTPS Blob URLs

- [ ] **Step 1: Update visual API route with fal.ai primary + Blob upload**

Replace the `renderSlide` function and update `renderAndSave` in `src/app/api/visual/route.ts`:

The key changes:
1. Import `generateFalImage` and `uploadImage`
2. `renderSlide` tries fal.ai first, then OpenAI, then Canvas 2D
3. Accept optional `model` field in request body for dashboard model selection
4. Upload rendered images to Blob, return HTTPS URLs instead of base64 data URLs
5. Store Blob URLs in `imageUrl` field instead of visual IDs

Read the full current file first, then apply these modifications:

**Replace the imports block** (lines 1-18) with:

```typescript
/* ============================================================
   VISUAL API — /api/visual
   ============================================================
   POST: Generate branded PNG images from content.
   Three-tier rendering with smart fallback:
   1. fal.ai Flux (premium photorealistic — default)
   2. OpenAI gpt-image-1 (fallback)
   3. Canvas 2D @napi-rs/canvas (always works, free)
   Uploads to Vercel Blob for HTTPS URLs.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { renderSlideCanvas } from "@/lib/visual/canvas-renderer";
import { getDimensions, type SlideData, type VisualRequest } from "@/lib/visual/types";
import { designVisual } from "@/lib/visual/designer-agent";
import { generateImage } from "@/lib/visual/openai-image";
import { generateFalImage, type FalImageModel } from "@/lib/visual/fal-image";
import { uploadImage } from "@/lib/blob-storage";
```

**Replace the `renderSlide` function** with:

```typescript
/* # Render a single slide with three-tier fallback:
   # 1. fal.ai Flux (if slide has aiImagePrompt)
   # 2. OpenAI gpt-image-1 (if fal.ai fails)
   # 3. Canvas 2D (always works, free — text-heavy slides go here directly) */
async function renderSlide(
  slide: SlideData,
  width: number,
  height: number,
  platform: string,
  model?: string
): Promise<Buffer> {
  // # Slides with aiImagePrompt get AI image generation
  if (slide.aiImagePrompt) {
    // # If admin explicitly chose "canvas" model, skip AI generation entirely
    if (model === "canvas") {
      return renderSlideCanvas(slide, width, height);
    }

    // # If admin explicitly chose "openai", skip fal.ai
    if (model === "openai") {
      const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
      if (aiBuffer) return aiBuffer;
      console.log("[Visual API] OpenAI failed — falling back to Canvas 2D");
      return renderSlideCanvas(slide, width, height);
    }

    // # Default path: try fal.ai first
    const falModel: FalImageModel = model === "flux-schnell" ? "flux-schnell" : "flux-pro";
    const falBuffer = await generateFalImage(slide.aiImagePrompt, width, height, { model: falModel });
    if (falBuffer) return falBuffer;

    // # fal.ai failed — try OpenAI as fallback
    console.log("[Visual API] fal.ai failed — trying OpenAI fallback");
    const aiBuffer = await generateImage(slide.aiImagePrompt, width, height, platform);
    if (aiBuffer) return aiBuffer;

    // # Both AI providers failed — Canvas 2D as final fallback
    console.log("[Visual API] OpenAI also failed — rendering with Canvas 2D");
  }

  // # Non-AI slides (text-heavy, colored backgrounds) always use Canvas 2D
  return renderSlideCanvas(slide, width, height);
}
```

**Replace the `renderAndSave` function** with:

```typescript
/* # Render slides to PNGs, upload to Vercel Blob, and save Visual records */
async function renderAndSave(
  slides: SlideData[],
  platform: string,
  type: string,
  contentId: string | null,
  model?: string,
) {
  const { width, height } = getDimensions(platform, type);
  const results: { index: number; visualId: string; imageUrl: string; width: number; height: number }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide: SlideData = {
      ...slides[i],
      slideNumber: slides[i].slideNumber ?? i + 1,
      totalSlides: slides[i].totalSlides ?? slides.length,
    };

    // # Render via fal.ai / OpenAI / Canvas 2D
    const pngBuffer = await renderSlide(slide, width, height, platform, model);

    // # Upload to Vercel Blob for a proper HTTPS URL
    // # Falls back to base64 data URL if Blob upload fails (env var missing, etc.)
    let imageUrl: string;
    try {
      const filename = `visual-${platform}-${contentId || "direct"}-slide-${i}.png`;
      imageUrl = await uploadImage(pngBuffer, filename);
    } catch (err) {
      console.warn("[Visual API] Blob upload failed, using base64 fallback:", err);
      imageUrl = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    }

    // # Save a Visual record for tracking which template/layout was used
    const visual = await prisma.visual.create({
      data: {
        contentId: contentId || null,
        type: slides.length === 1 ? "single_image" : "carousel_slide",
        slideIndex: i,
        templateId: slide.layout,
        data: JSON.stringify(slide),
        width,
        height,
      },
    });

    results.push({ index: i, visualId: visual.id, imageUrl, width, height });
  }

  return results;
}
```

**In the POST handler**, update the design mode section to pass `model` and store Blob URLs:

Find the line `const results = await renderAndSave(` in the design mode block and pass `body.model`:
```typescript
      const results = await renderAndSave(
        slides,
        content.platform,
        visualType,
        content.id,
        body.model,
      );
```

Find the line `const imageUrls = results.map((r) => r.visualId).join(",");` in the design mode block and replace with:
```typescript
      // # Store Blob URLs (HTTPS) instead of visual IDs
      const imageUrls = results.map((r) => r.imageUrl).join(",");
```

Similarly in the direct mode section, update the `renderAndSave` call:
```typescript
    const results = await renderAndSave(slides, platform, type, contentId || null, body.model);
```

And update the direct mode `imageUrls` line:
```typescript
      const imageUrls = results.map((r) => r.imageUrl).join(",");
```

- [ ] **Step 2: Update blog writer to use fal.ai + Blob for cover images**

In `src/lib/blog-writer.ts`:

**Add imports** after the existing imports:
```typescript
import { generateFalImage } from "./visual/fal-image";
import { uploadImage } from "./blob-storage";
```

**Replace the Step 5 cover image block** (the try/catch that starts with `// # Step 5: Generate cover image via Visual Designer + Canvas Renderer`):

```typescript
  // # Step 5: Generate cover image via fal.ai Flux Pro + Vercel Blob
  // # Three-tier fallback: fal.ai → Canvas 2D → skip
  // # Cover image failure must NOT block queuing
  let coverImageUrl: string | null = null;

  try {
    // # Try fal.ai Flux Pro first — best photorealistic quality for blog covers
    const falBuffer = await generateFalImage(
      article.mediaPrompt,
      1200,
      630,
      { model: "flux-pro" }
    );

    if (falBuffer) {
      // # Upload to Vercel Blob for a proper HTTPS URL (no more base64 data URLs)
      const filename = `blog-cover-${article.slug}.png`;
      coverImageUrl = await uploadImage(falBuffer, filename);
    } else {
      // # fal.ai failed — fall back to Canvas 2D via Visual Designer
      console.log("[BlogWriter] fal.ai failed, falling back to Canvas 2D cover");
      const { slides } = await designVisual(
        article.title,
        "blog",
        "single_image",
        article.mediaPrompt,
        topic
      );

      if (slides.length > 0) {
        const imageBuffer = await renderSlideCanvas(slides[0], 1200, 630);
        // # Try uploading Canvas 2D result to Blob too
        try {
          const filename = `blog-cover-${article.slug}.png`;
          coverImageUrl = await uploadImage(imageBuffer, filename);
        } catch {
          // # Blob upload failed — use base64 as last resort
          coverImageUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;
        }
      }
    }
  } catch (err) {
    console.error("[BlogWriter] Cover image generation failed:", err);
  }
```

**Update the prisma.content.create call** to use `coverImageUrl` instead of `coverImageDataUrl`:

Find `imageUrl: coverImageDataUrl,` and replace with `imageUrl: coverImageUrl,`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No new errors from the modified files.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/app/api/visual/route.ts src/lib/blog-writer.ts && git commit -m "feat: upgrade visual pipeline — fal.ai primary + Vercel Blob hosting"
```

---

### Task 3: fal.ai Video Generation Pipeline

**Files:**
- Create: `src/lib/visual/fal-video.ts`
- Create: `src/lib/visual/video-assembler.ts`

**Interfaces:**
- Consumes:
  - `uploadFromUrl(url, filename)` from `@/lib/blob-storage`
  - `uploadVideo(buffer, filename)` from `@/lib/blob-storage`
- Produces:
  - `generateVideoClip(prompt, options?)` → `Promise<{ videoUrl: string; duration: number } | null>`
  - `assembleReel(clips, options)` → `Promise<string>` (returns Blob URL of final MP4)

- [ ] **Step 1: Create fal-video.ts**

Create `src/lib/visual/fal-video.ts`:

```typescript
/* ============================================================
   FAL.AI VIDEO GENERATION — Wan 2.1 / Kling 2.1
   ============================================================
   Generates short video clips from text prompts using fal.ai.
   - Wan 2.1: ~$0.10-0.20 per 5s clip, good quality
   - Kling 2.1: ~$0.30 per 5s clip, premium quality
   Returns the Blob URL of the generated video.
   ============================================================ */

import { fal } from "@fal-ai/client";
import { uploadFromUrl } from "@/lib/blob-storage";

// # Model IDs for fal.ai video generation
const VIDEO_MODELS = {
  "wan-2.1": "fal-ai/wan/v2.1/text-to-video",
  "kling-2.1": "fal-ai/kling-video/v2.1/standard/text-to-video",
} as const;

// # Video model options — exposed to API routes and dashboard
export type FalVideoModel = keyof typeof VIDEO_MODELS;

// # Configure the fal client with the API key
function ensureClient(): boolean {
  const key = process.env.FAL_KEY;
  if (!key) {
    console.warn("[fal.ai Video] No FAL_KEY — cannot generate video");
    return false;
  }
  fal.config({ credentials: key });
  return true;
}

// # Generate a short video clip from a text prompt
// # Returns the Vercel Blob URL and duration, or null on failure
export async function generateVideoClip(
  prompt: string,
  options?: {
    model?: FalVideoModel;
    duration?: number;
    aspectRatio?: "16:9" | "9:16" | "1:1";
  }
): Promise<{ videoUrl: string; duration: number } | null> {
  if (!ensureClient()) return null;

  const model = options?.model || "wan-2.1";
  const endpointId = VIDEO_MODELS[model];
  const duration = options?.duration || 5;
  const aspectRatio = options?.aspectRatio || "9:16";

  try {
    console.log(`[fal.ai Video] Generating ${duration}s ${aspectRatio} clip with ${model}...`);

    // # Video generation takes 30-120 seconds — fal.subscribe handles polling
    const result = await fal.subscribe(endpointId, {
      input: {
        prompt,
        // # Wan 2.1 uses duration, Kling uses duration_seconds
        ...(model === "wan-2.1"
          ? { num_frames: duration * 16, fps: 16 }
          : { duration: String(duration) }),
        aspect_ratio: aspectRatio,
      },
      // # Log progress updates
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`[fal.ai Video] ${model} rendering...`);
        }
      },
    });

    // # Extract the video URL from the response
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const video = (result as any).data?.video || (result as any).video;
    if (!video?.url) {
      console.warn("[fal.ai Video] No video URL in response");
      return null;
    }

    // # Upload the video to Vercel Blob (fal.ai URLs are temporary)
    const filename = `clip-${model}-${Date.now()}.mp4`;
    const blobUrl = await uploadFromUrl(video.url, filename);

    console.log(`[fal.ai Video] Generated ${duration}s clip → ${blobUrl}`);
    return { videoUrl: blobUrl, duration };
  } catch (err) {
    console.error("[fal.ai Video] Generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
```

- [ ] **Step 2: Create video-assembler.ts**

Create `src/lib/visual/video-assembler.ts`:

```typescript
/* ============================================================
   VIDEO ASSEMBLER — FFmpeg Clip Stitching
   ============================================================
   Stitches multiple video clips into a single reel with
   optional text overlays and background music.
   Uses fluent-ffmpeg with @ffmpeg-installer/ffmpeg for the
   binary in serverless environments.
   ============================================================ */

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { uploadVideo } from "@/lib/blob-storage";
import { readFileSync } from "fs";

// # Point fluent-ffmpeg at the installed FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

// # Clip input for the assembler — each clip has a URL and optional text overlay
interface ReelClip {
  videoUrl: string;
  textOverlay?: string;
}

// # Assembly options — output format and resolution
interface AssemblyOptions {
  musicUrl?: string;
  resolution: "1080x1920" | "1920x1080";
}

// # Download a file from a URL to a temporary local path
async function downloadToTemp(url: string, filename: string): Promise<string> {
  const dir = join(tmpdir(), "reel-assembly");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
  return filepath;
}

// # Clean up temporary files after assembly
function cleanupFiles(paths: string[]) {
  for (const p of paths) {
    try { if (existsSync(p)) unlinkSync(p); } catch { /* ignore cleanup errors */ }
  }
}

// # Assemble multiple video clips into a single reel
// # Downloads clips, concatenates with FFmpeg, uploads result to Blob
// # Returns the Vercel Blob URL of the final video
export async function assembleReel(
  clips: ReelClip[],
  options: AssemblyOptions
): Promise<string> {
  if (clips.length === 0) throw new Error("No clips to assemble");

  const tempFiles: string[] = [];
  const [width, height] = options.resolution.split("x").map(Number);

  try {
    // # Step 1: Download all clips to temp files
    console.log(`[VideoAssembler] Downloading ${clips.length} clips...`);
    const clipPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const path = await downloadToTemp(clips[i].videoUrl, `clip-${i}.mp4`);
      clipPaths.push(path);
      tempFiles.push(path);
    }

    // # Step 2: Download music if provided
    let musicPath: string | null = null;
    if (options.musicUrl) {
      musicPath = await downloadToTemp(options.musicUrl, "music.mp3");
      tempFiles.push(musicPath);
    }

    // # Step 3: Create a concat list file for FFmpeg
    const concatListPath = join(tmpdir(), "reel-assembly", "concat.txt");
    const concatContent = clipPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
    writeFileSync(concatListPath, concatContent);
    tempFiles.push(concatListPath);

    // # Step 4: Assemble with FFmpeg
    const outputPath = join(tmpdir(), "reel-assembly", `reel-${Date.now()}.mp4`);
    tempFiles.push(outputPath);

    console.log("[VideoAssembler] Stitching clips with FFmpeg...");

    await new Promise<void>((resolve, reject) => {
      let cmd = ffmpeg()
        .input(concatListPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        // # Scale all clips to the target resolution and pad if needed
        .videoFilter(`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`)
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p"]);

      // # Add background music if provided
      if (musicPath) {
        cmd = cmd
          .input(musicPath)
          // # Mix original audio (if any) with music, music at 30% volume
          .complexFilter([
            "[0:a]volume=1.0[a0]",
            "[1:a]volume=0.3[a1]",
            "[a0][a1]amix=inputs=2:duration=first[aout]",
          ])
          .outputOptions(["-map", "0:v", "-map", "[aout]"]);
      } else {
        // # No music — use original audio or generate silent audio
        cmd = cmd.outputOptions(["-c:a", "aac", "-b:a", "128k"]);
      }

      cmd
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    // # Step 5: Upload final video to Vercel Blob
    console.log("[VideoAssembler] Uploading assembled reel to Blob...");
    const videoBuffer = readFileSync(outputPath);
    const blobUrl = await uploadVideo(videoBuffer, `reel-${Date.now()}.mp4`);

    console.log(`[VideoAssembler] Reel assembled (${clips.length} clips) → ${blobUrl}`);
    return blobUrl;
  } finally {
    // # Always clean up temp files
    cleanupFiles(tempFiles);
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No new errors from the new files.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/lib/visual/fal-video.ts src/lib/visual/video-assembler.ts && git commit -m "feat: add fal.ai video generation + FFmpeg reel assembler"
```

---

### Task 4: HeyGen Avatar Provider

**Files:**
- Create: `src/lib/visual/heygen-avatar.ts`

**Interfaces:**
- Consumes:
  - `uploadFromUrl(url, filename)` from `@/lib/blob-storage`
- Produces:
  - `generateAvatarVideo(script, options?)` → `Promise<{ videoUrl: string; duration: number } | null>`
  - `listAvatars()` → `Promise<{ avatar_id: string; avatar_name: string }[]>`

- [ ] **Step 1: Create heygen-avatar.ts**

Create `src/lib/visual/heygen-avatar.ts`:

```typescript
/* ============================================================
   HEYGEN AVATAR — AI Spokesperson Video Generation
   ============================================================
   Generates production-ready talking head videos using the
   HeyGen API. Features lip sync, natural gestures, and
   consistent brand ambassador identity.
   
   HeyGen Creator plan: $24/month, 15 min/month video quota.
   Videos take 60-120s to generate, polled every 5s.
   ============================================================ */

import { uploadFromUrl } from "@/lib/blob-storage";

// # HeyGen API base URL
const HEYGEN_API = "https://api.heygen.com";

// # Default avatar and voice — set up once in HeyGen dashboard
// # These can be overridden per-video via options
const DEFAULT_AVATAR_ID = process.env.HEYGEN_AVATAR_ID || "";
const DEFAULT_VOICE_ID = process.env.HEYGEN_VOICE_ID || "";

// # Get the API key from env — fail gracefully if not set
function getApiKey(): string | null {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) {
    console.warn("[HeyGen] No HEYGEN_API_KEY — cannot generate avatar video");
    return null;
  }
  return key;
}

// # Helper to make authenticated requests to HeyGen API
async function heygenFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const key = getApiKey();
  if (!key) throw new Error("HEYGEN_API_KEY not configured");

  return fetch(`${HEYGEN_API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": key,
      ...options.headers,
    },
  });
}

// # List available avatars from the HeyGen account
// # Useful for the dashboard to show avatar selection options
export async function listAvatars(): Promise<
  { avatar_id: string; avatar_name: string }[]
> {
  try {
    const res = await heygenFetch("/v2/avatars");
    if (!res.ok) return [];

    const data = await res.json();
    return data.data?.avatars || [];
  } catch {
    return [];
  }
}

// # Generate a talking head video from a script
// # The avatar speaks the script text with lip sync and natural gestures
// # Returns the Vercel Blob URL and duration, or null on failure
export async function generateAvatarVideo(
  script: string,
  options?: {
    avatarId?: string;
    voiceId?: string;
    audioUrl?: string;
    backgroundUrl?: string;
    resolution?: "1080p" | "720p";
  }
): Promise<{ videoUrl: string; duration: number } | null> {
  const key = getApiKey();
  if (!key) return null;

  const avatarId = options?.avatarId || DEFAULT_AVATAR_ID;
  const voiceId = options?.voiceId || DEFAULT_VOICE_ID;

  if (!avatarId) {
    console.error("[HeyGen] No avatar ID configured — set HEYGEN_AVATAR_ID env var");
    return null;
  }

  try {
    console.log("[HeyGen] Creating avatar video...");

    // # Build the video generation request
    // # HeyGen v2 API uses a "video_inputs" array with clips
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const videoInput: any = {
      character: {
        type: "avatar",
        avatar_id: avatarId,
        avatar_style: "normal",
      },
      voice: options?.audioUrl
        ? { type: "audio", audio_url: options.audioUrl }
        : { type: "text", input_text: script, voice_id: voiceId },
      background: options?.backgroundUrl
        ? { type: "image", url: options.backgroundUrl }
        : { type: "color", value: "#09090b" },
    };

    // # Step 1: Create the video generation task
    const createRes = await heygenFetch("/v2/video/generate", {
      method: "POST",
      body: JSON.stringify({
        video_inputs: [videoInput],
        dimension: {
          width: 1080,
          height: 1920,
        },
        aspect_ratio: "9:16",
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      console.error("[HeyGen] Video creation failed:", err);
      return null;
    }

    const createData = await createRes.json();
    const videoId = createData.data?.video_id;

    if (!videoId) {
      console.error("[HeyGen] No video_id in response");
      return null;
    }

    console.log(`[HeyGen] Video created: ${videoId} — polling for completion...`);

    // # Step 2: Poll for completion — HeyGen takes 60-120 seconds
    // # Maximum 60 polls × 5s = 5 minutes timeout
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusRes = await heygenFetch(`/v1/video_status.get?video_id=${videoId}`);
      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();
      const status = statusData.data?.status;

      if (status === "completed") {
        const resultUrl = statusData.data?.video_url;
        const duration = statusData.data?.duration || 0;

        if (!resultUrl) {
          console.error("[HeyGen] Video completed but no URL");
          return null;
        }

        // # Upload to Vercel Blob (HeyGen URLs expire after 7 days)
        const filename = `ambassador-${Date.now()}.mp4`;
        const blobUrl = await uploadFromUrl(resultUrl, filename);

        console.log(`[HeyGen] Avatar video generated (${duration}s) → ${blobUrl}`);
        return { videoUrl: blobUrl, duration };
      }

      if (status === "failed") {
        const error = statusData.data?.error;
        console.error("[HeyGen] Video generation failed:", error);
        return null;
      }

      // # Still processing — continue polling
      console.log(`[HeyGen] Still rendering... (attempt ${attempt + 1})`);
    }

    // # Timeout after 5 minutes
    console.error("[HeyGen] Video generation timed out after 5 minutes");
    return null;
  } catch (err) {
    console.error("[HeyGen] Avatar video generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No new errors from heygen-avatar.ts.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/lib/visual/heygen-avatar.ts && git commit -m "feat: add HeyGen avatar provider for AI spokesperson videos"
```

---

### Task 5: Ambassador Pipeline + Cron

**Files:**
- Create: `src/lib/ambassador.ts`
- Create: `src/app/api/ambassador/generate/route.ts`
- Modify: `vercel.json`

**Interfaces:**
- Consumes:
  - `callGemini(prompt)` from `@/lib/gemini`
  - `generateAvatarVideo(script, options?)` from `@/lib/visual/heygen-avatar`
  - `discoverTopic(format, type, persona)` from `@/lib/research`
  - `prisma` from `@/lib/prisma`
- Produces:
  - `generateAmbassadorVideo(topic?, platform?)` → `Promise<{ contentId: string; videoUrl: string; script: string; duration: number } | null>`
  - `GET /api/ambassador/generate` — cron route (Tue/Thu 7 AM UTC)

- [ ] **Step 1: Create ambassador.ts**

Create `src/lib/ambassador.ts`:

```typescript
/* ============================================================
   AMBASSADOR VIDEO PIPELINE
   ============================================================
   Orchestrates the full AI brand ambassador video workflow:
   1. Topic discovery (or use provided topic)
   2. Script generation via Gemini (30-60s speaking script)
   3. Avatar video via HeyGen (lip sync + gestures)
   4. Queue as Content record for admin approval

   Runs automatically via cron (Tue/Thu 7 AM) and on-demand
   from the dashboard. ~2 videos/week fits within HeyGen's
   15 min/month Creator plan quota.
   ============================================================ */

import { callGemini } from "./gemini";
import { discoverTopic } from "./research";
import { generateAvatarVideo } from "./visual/heygen-avatar";
import { prisma } from "./prisma";

// # Generate a complete ambassador video from topic to queued content
export async function generateAmbassadorVideo(
  topic?: string,
  platform?: string
): Promise<{
  contentId: string;
  videoUrl: string;
  script: string;
  duration: number;
} | null> {
  const targetPlatform = platform || "tiktok";

  // # Step 1: Discover a topic if none was provided
  let videoTopic = topic || "";
  let topicReasoning = "";

  if (!videoTopic) {
    console.log("[Ambassador] Discovering trending topic...");
    const discovery = await discoverTopic(
      "video",
      "ambassador_tip",
      "career advice expert"
    );
    videoTopic = discovery.topic;
    topicReasoning = discovery.reasoning;
  }

  // # Step 2: Generate a 30-60 second speaking script via Gemini
  console.log(`[Ambassador] Writing script for: ${videoTopic}`);

  const scriptPrompt = `You are the AI brand ambassador for JobPilot AI (jobpilotai.co), a premium career tech platform. Write a speaking script for a short video.

TOPIC: ${videoTopic}
${topicReasoning ? `REASONING: ${topicReasoning}` : ""}

SCRIPT REQUIREMENTS:
1. LENGTH: 30-60 seconds when spoken (approximately 75-150 words)
2. TONE: Professional, warm, confident — like a trusted career advisor sharing insider knowledge
3. STRUCTURE:
   - Hook (first 3 seconds): A surprising insight or bold statement that grabs attention
   - Body (20-45 seconds): 2-3 actionable tips or insights with specific details
   - CTA (last 5-10 seconds): Natural mention of JobPilot AI as a tool that helps with this
4. STYLE:
   - Speak directly to the viewer ("you", "your")
   - Use conversational language — not formal or stiff
   - Include at least one specific number, stat, or example
   - No emojis, no hashtags — this is spoken word
   - No "Hey everyone" or "What's up" openers — start with the hook immediately
5. The script is read directly by an AI avatar — write exactly what should be spoken

Return ONLY the script text. No stage directions, no formatting, no labels. Just the words to be spoken.`;

  const script = await callGemini(scriptPrompt);
  const trimmedScript = script.trim();

  // # Validate script length — should be 50-200 words
  const wordCount = trimmedScript.split(/\s+/).length;
  if (wordCount < 20) {
    console.error(`[Ambassador] Script too short (${wordCount} words)`);
    return null;
  }

  // # Step 3: Generate the avatar video via HeyGen
  console.log(`[Ambassador] Generating avatar video (${wordCount} words)...`);

  const avatarResult = await generateAvatarVideo(trimmedScript, {
    // # Use default avatar and voice from env vars
    // # 9:16 vertical format for TikTok/Instagram/LinkedIn video
    resolution: "1080p",
  });

  if (!avatarResult) {
    console.error("[Ambassador] HeyGen video generation failed");
    return null;
  }

  // # Step 4: Generate a caption for social posting
  const captionPrompt = `Write a short social media caption for a ${targetPlatform} video. The video is an AI career advisor giving tips about: ${videoTopic}.

Rules:
- ${targetPlatform === "linkedin" ? "2-3 professional sentences" : "1-2 punchy sentences"}
- Include a call-to-action to follow or visit jobpilotai.co
- No emojis
- Do NOT include hashtags (those are added separately)

Return ONLY the caption text.`;

  const caption = await callGemini(captionPrompt);

  // # Step 5: Queue as Content record for admin approval
  const content = await prisma.content.create({
    data: {
      agent: "ambassador",
      platform: targetPlatform,
      contentType: "ambassador_video",
      title: `[Ambassador] ${videoTopic}`,
      body: trimmedScript,
      captionText: caption.trim(),
      mediaPrompt: videoTopic,
      imageUrl: null,
      videoUrl: avatarResult.videoUrl,
      status: "pending",
      notes: JSON.stringify({
        duration: avatarResult.duration,
        wordCount,
        topic: videoTopic,
      }),
    },
  });

  console.log(`[Ambassador] Video queued: ${content.id} (${avatarResult.duration}s)`);

  return {
    contentId: content.id,
    videoUrl: avatarResult.videoUrl,
    script: trimmedScript,
    duration: avatarResult.duration,
  };
}
```

- [ ] **Step 2: Create ambassador cron route**

Create `src/app/api/ambassador/generate/route.ts`:

```typescript
/* ============================================================
   AMBASSADOR GENERATE — /api/ambassador/generate
   ============================================================
   GET: Cron-triggered Tue/Thu at 7 AM UTC. Generates an AI
   brand ambassador video using the full pipeline:
   topic → script → HeyGen avatar → queue for approval.

   Auth: CRON_SECRET via Authorization: Bearer <secret>
   Pattern matches /api/blog/generate for consistency.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateAmbassadorVideo } from "@/lib/ambassador";

export async function GET(req: NextRequest) {
  // # Fail closed — CRON_SECRET must be configured in Vercel env vars
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Server misconfigured — CRON_SECRET not set" },
      { status: 500 }
    );
  }

  // # Timing-safe auth check — prevents timing-based secret inference attacks
  // # Vercel Cron sends the secret as: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;

  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // # Run the full ambassador video pipeline
  try {
    const result = await generateAmbassadorVideo();

    if (result) {
      return NextResponse.json({
        generated: 1,
        contentId: result.contentId,
        videoUrl: result.videoUrl,
        duration: result.duration,
      });
    }

    return NextResponse.json({
      generated: 0,
      error: "Ambassador pipeline returned null — check HeyGen API key and avatar config",
    });
  } catch (err) {
    console.error("[AmbassadorGenerate] Pipeline threw an exception:", err);
    return NextResponse.json(
      {
        generated: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Add ambassador cron to vercel.json**

In `vercel.json`, add the new cron entry to the `crons` array:

Add this object after the blog generate cron:

```json
    {
      "path": "/api/ambassador/generate",
      "schedule": "0 7 * * 2,4"
    }
```

Update the file comment to mention the new cron.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/lib/ambassador.ts src/app/api/ambassador/generate/route.ts vercel.json && git commit -m "feat: add ambassador video pipeline + Tue/Thu cron"
```

---

### Task 6: Creative Studio API Routes

**Files:**
- Create: `src/app/api/creative/generate-image/route.ts`
- Create: `src/app/api/creative/generate-video/route.ts`
- Create: `src/app/api/creative/generate-ambassador/route.ts`

**Interfaces:**
- Consumes:
  - `isAdmin()` from `@/lib/auth-check`
  - `generateFalImage(prompt, width, height, options?)` from `@/lib/visual/fal-image`
  - `uploadImage(buffer, filename)` from `@/lib/blob-storage`
  - `generateVideoClip(prompt, options?)` from `@/lib/visual/fal-video`
  - `generateAmbassadorVideo(topic?, platform?)` from `@/lib/ambassador`
- Produces:
  - `POST /api/creative/generate-image` — returns `{ imageUrl, model }`
  - `POST /api/creative/generate-video` — returns `{ videoUrl, duration }`
  - `POST /api/creative/generate-ambassador` — returns `{ contentId, videoUrl, script, duration }`

- [ ] **Step 1: Create generate-image route**

Create `src/app/api/creative/generate-image/route.ts`:

```typescript
/* ============================================================
   CREATIVE STUDIO — Generate Image
   ============================================================
   POST: Admin route for on-demand image generation.
   Accepts a prompt + dimensions + model choice.
   Returns the Vercel Blob URL of the generated image.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateFalImage, type FalImageModel } from "@/lib/visual/fal-image";
import { generateImage as generateOpenAIImage } from "@/lib/visual/openai-image";
import { uploadImage } from "@/lib/blob-storage";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { prompt, width, height, model, contentId } = body as {
      prompt: string;
      width?: number;
      height?: number;
      model?: string;
      contentId?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const w = width || 1080;
    const h = height || 1080;
    let imageBuffer: Buffer | null = null;
    let usedModel = model || "flux-pro";

    // # Route to the requested model
    if (model === "openai") {
      imageBuffer = await generateOpenAIImage(prompt, w, h);
      usedModel = "openai";
    } else {
      // # Default: fal.ai Flux
      const falModel: FalImageModel = model === "flux-schnell" ? "flux-schnell" : "flux-pro";
      imageBuffer = await generateFalImage(prompt, w, h, { model: falModel });
      usedModel = falModel;

      // # Fallback to OpenAI if fal.ai fails
      if (!imageBuffer) {
        console.log("[Creative] fal.ai failed, trying OpenAI fallback");
        imageBuffer = await generateOpenAIImage(prompt, w, h);
        usedModel = "openai-fallback";
      }
    }

    if (!imageBuffer) {
      return NextResponse.json(
        { error: "Image generation failed — all providers returned null" },
        { status: 500 }
      );
    }

    // # Upload to Vercel Blob
    const filename = `creative-${Date.now()}.png`;
    const imageUrl = await uploadImage(imageBuffer, filename);

    // # If contentId provided, update the Content record
    if (contentId) {
      await prisma.content.update({
        where: { id: contentId },
        data: { imageUrl },
      });
    }

    return NextResponse.json({ imageUrl, model: usedModel });
  } catch (err) {
    console.error("[Creative Image] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create generate-video route**

Create `src/app/api/creative/generate-video/route.ts`:

```typescript
/* ============================================================
   CREATIVE STUDIO — Generate Video Clip
   ============================================================
   POST: Admin route for on-demand video clip generation.
   Accepts a prompt + model + duration + aspect ratio.
   Returns the Vercel Blob URL of the generated video.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateVideoClip, type FalVideoModel } from "@/lib/visual/fal-video";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { prompt, model, duration, aspectRatio } = body as {
      prompt: string;
      model?: FalVideoModel;
      duration?: number;
      aspectRatio?: "16:9" | "9:16" | "1:1";
    };

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // # Generate the video clip via fal.ai
    const result = await generateVideoClip(prompt, {
      model: model || "wan-2.1",
      duration: duration || 5,
      aspectRatio: aspectRatio || "9:16",
    });

    if (!result) {
      return NextResponse.json(
        { error: "Video generation failed — check FAL_KEY and try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      videoUrl: result.videoUrl,
      duration: result.duration,
    });
  } catch (err) {
    console.error("[Creative Video] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create generate-ambassador route**

Create `src/app/api/creative/generate-ambassador/route.ts`:

```typescript
/* ============================================================
   CREATIVE STUDIO — Generate Ambassador Video
   ============================================================
   POST: Admin route for on-demand ambassador video generation.
   Accepts an optional topic and platform.
   Runs the full pipeline: topic → script → HeyGen → queue.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { generateAmbassadorVideo } from "@/lib/ambassador";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    const { topic, platform } = body as {
      topic?: string;
      platform?: string;
    };

    // # Run the full ambassador pipeline
    // # If no topic is provided, the pipeline auto-discovers a trending topic
    const result = await generateAmbassadorVideo(topic, platform);

    if (!result) {
      return NextResponse.json(
        { error: "Ambassador video generation failed — check HEYGEN_API_KEY and HEYGEN_AVATAR_ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contentId: result.contentId,
      videoUrl: result.videoUrl,
      script: result.script,
      duration: result.duration,
    });
  } catch (err) {
    console.error("[Creative Ambassador] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/app/api/creative && git commit -m "feat: add Creative Studio API routes (image, video, ambassador)"
```

---

### Task 7: Dashboard Updates — Model Selector + Ambassador + Video Preview

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  - `POST /api/creative/generate-ambassador` — returns `{ contentId, videoUrl, script, duration }`
  - `POST /api/visual` — now accepts `model` field
  - Existing `ContentItem` interface — uses `contentType: "ambassador_video"`, `videoUrl` field
- Produces:
  - Model selector dropdown on visual generation
  - Ambassador video generation card on dashboard
  - Video preview for ambassador_video and reel content types

- [ ] **Step 1: Add ambassador agent to AGENT_META**

In `src/app/page.tsx`, add to the `AGENT_META` object after the `kpi` entry:

```typescript
  ambassador: { name: "Ambassador AI", role: "Brand Spokesperson", avatar: "AM", color: "#06b6d4", contentTypes: ["ambassador_video"], description: "AI brand ambassador that creates talking-head career tip videos. Professional lip sync, natural gestures, consistent brand identity." },
```

- [ ] **Step 2: Add CONTENT_TYPE_LABELS entry**

Add to the `CONTENT_TYPE_LABELS` object:

```typescript
  ambassador_video: "Ambassador Video",
```

- [ ] **Step 3: Add model selector state**

After the `generatingVisual` state declaration, add:

```typescript
  /* ---- Creative Studio ---- */
  const [imageModel, setImageModel] = useState("flux-pro");
  const [generatingAmbassador, setGeneratingAmbassador] = useState(false);
  const [ambassadorTopic, setAmbassadorTopic] = useState("");
```

- [ ] **Step 4: Add handleGenerateAmbassador function**

After the `handleGenerateVideo` function, add:

```typescript
  // # Generate an ambassador video — full pipeline from topic to queued content
  const handleGenerateAmbassador = async () => {
    setGeneratingAmbassador(true);
    try {
      const res = await fetch("/api/creative/generate-ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: ambassadorTopic.trim() || undefined,
          platform: "tiktok",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAmbassadorTopic("");
        setNewContentId(data.contentId);
        setTimeout(() => setNewContentId(null), 5000);
        showToast(`Ambassador video generated (${data.duration}s)`, "success");
        fetchContent();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Ambassador generation failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setGeneratingAmbassador(false);
    }
  };
```

- [ ] **Step 5: Update handleGenerateVisual to pass model**

In the `handleGenerateVisual` function, update the fetch body to include the model:

Replace:
```typescript
        body: JSON.stringify({ contentId: item.id, redesign }),
```

With:
```typescript
        body: JSON.stringify({ contentId: item.id, redesign, model: imageModel }),
```

- [ ] **Step 6: Add Ambassador Video card to the queue tab**

In the queue tab section, after the "Generate Content" card (`<div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">`), add a new card:

```tsx
            {/* Ambassador Video Generation */}
            <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Ambassador Video
              </h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  value={ambassadorTopic}
                  onChange={(e) => setAmbassadorTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateAmbassador()}
                  placeholder="Leave empty for auto-trending, or enter a career tip topic"
                  className="flex-1 min-w-[300px] px-4 py-2 bg-space-700 border border-card-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleGenerateAmbassador}
                  disabled={generatingAmbassador}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                >
                  {generatingAmbassador ? "Generating Video..." : "Generate Ambassador Video"}
                </button>
              </div>
              <p className="text-text-muted text-xs mt-2">AI spokesperson presents career tips in a professional talking-head video. Uses HeyGen API (~60s to generate).</p>
            </div>
```

- [ ] **Step 7: Add model selector to visual generation button**

In the content card actions section, find the visual generation button. Before it, add a model selector dropdown that only appears for visual content types:

Replace the visual generation button block:

```typescript
                          {/* Visual generation / rendering button */}
                          {item.contentType !== "plain_text" && item.contentType !== "thread" && item.contentType !== "reel_script" && (
```

With:

```tsx
                          {/* Model selector + visual generation button */}
                          {item.contentType !== "plain_text" && item.contentType !== "thread" && item.contentType !== "reel_script" && item.contentType !== "ambassador_video" && (
                            <>
                              <select
                                value={imageModel}
                                onChange={(e) => setImageModel(e.target.value)}
                                className="px-2 py-1.5 bg-space-700 border border-card-border rounded-lg text-xs text-text-secondary"
                              >
                                <option value="flux-pro">Flux Pro (best)</option>
                                <option value="flux-schnell">Flux Schnell (fast)</option>
                                <option value="openai">OpenAI</option>
                                <option value="canvas">Canvas 2D (free)</option>
                              </select>
```

Keep the existing button but close the fragment:

```tsx
                              <button
                                onClick={() => handleGenerateVisual(item, hasVisuals)}
                                disabled={generatingVisual === item.id}
                                className="px-3 py-1.5 bg-purple-500/15 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                              >
                                {generatingVisual === item.id ? "Creating Visual..." : hasDesignData ? "Render Visual" : hasVisuals ? "Redesign Visual" : "Generate Visual"}
                              </button>
                            </>
```

And close with:
```tsx
                          )}
```

- [ ] **Step 8: Add video preview for ambassador_video content type**

In the content card, find the existing `{item.videoUrl && (` block (around line 1186). This already handles video preview for any content item with a `videoUrl`. Ambassador videos will automatically show here since they set `videoUrl` in the Content record.

Add an "Ambassador Video" badge next to the platform badge. Find the blog article badge conditional:

```typescript
                                {item.platform === "blog" && item.contentType === "blog_article" ? (
```

Add a condition for ambassador videos before it:

```tsx
                                {item.contentType === "ambassador_video" ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Ambassador Video</span>
                                ) : item.platform === "blog" && item.contentType === "blog_article" ? (
```

- [ ] **Step 9: Verify TypeScript compiles**

```bash
cd C:/Users/User/jobpilot-marketing && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 10: Commit**

```bash
cd C:/Users/User/jobpilot-marketing && git add src/app/page.tsx && git commit -m "feat: dashboard — model selector, ambassador video card, video preview"
```
