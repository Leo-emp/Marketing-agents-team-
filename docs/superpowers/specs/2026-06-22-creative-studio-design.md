# Spec 3: Creative Studio — Premium AI Visual & Video Pipeline

**Date:** 2026-06-22
**Repo:** jobpilot-marketing (primary)
**Status:** Approved

## Overview

Premium Creative Studio that upgrades Marketing HQ's visual pipeline with production-ready AI image generation, AI video reels, and a consistent AI brand ambassador. Quality is the top priority — every output must look like it came from a professional marketing agency.

**Three capabilities:**
1. **AI Image Generation** — fal.ai Flux Pro for photorealistic blog covers and social images (replaces OpenAI as default)
2. **AI Video Reels** — fal.ai Wan 2.1 / Kling 2.1 for short-form video clips, stitched into polished reels
3. **AI Brand Ambassador** — HeyGen-powered consistent AI spokesperson with lip sync, natural gestures, and branded backgrounds

**Media hosting** — All generated assets uploaded to Vercel Blob for proper HTTPS URLs (fixes the base64 data URL limitation from Spec 2).

## Quality Standard

Every generated asset must meet these bars:
- **Images:** Photorealistic, professionally composed, brand-consistent (indigo/violet palette, dark space aesthetic). No artifacts, no AI "tells."
- **Videos:** Smooth motion, proper timing, clean transitions. No stuttering, no frame glitches.
- **Ambassador videos:** Natural lip sync, realistic gestures, eye contact, professional background. Viewer should not immediately think "AI-generated."
- **Resolution:** All images minimum 1080px shortest side. All videos minimum 1080p. Blog covers 1200x630.

## Architecture

```
                    ┌──────────────────────────────────┐
                    │       CREATIVE STUDIO             │
                    │                                   │
  Content Queue ──► │  Image Provider (fal.ai Flux)     │
  (blog articles,   │    └─ Flux Schnell (routine)      │
   social posts)    │    └─ Flux Pro Ultra (premium)     │
                    │    └─ OpenAI fallback              │
                    │    └─ Canvas 2D final fallback     │
                    │                                   │
  Reel Designer ──► │  Video Provider (fal.ai)          │
  (scene scripts)   │    └─ Wan 2.1 (standard)          │
                    │    └─ Kling 2.1 (premium)         │
                    │                                   │
  Script + Voice ─► │  Avatar Provider (HeyGen API)     │
  (ElevenLabs TTS)  │    └─ Consistent AI spokesperson  │
                    │    └─ Lip sync + natural gestures  │
                    │    └─ Branded background           │
                    └─────────────┬─────────────────────┘
                                  │
                    ┌─────────────▼─────────────────────┐
                    │  Vercel Blob (media hosting)       │
                    │    └─ HTTPS URLs for all assets    │
                    │    └─ Images, videos, thumbnails   │
                    └───────────────────────────────────┘
```

## 1. Image Generation Pipeline

### Provider: fal.ai

**Default model:** `fal-ai/flux-pro/v1.1-ultra` (Flux Pro Ultra) — best quality open-source image model. ~$0.05/image, 3-5s generation time.

**Fast model:** `fal-ai/flux/schnell` — for bulk/routine content where speed matters more than maximum quality. ~$0.003/image, 1-2s.

**Fallback chain:**
1. fal.ai Flux (primary)
2. OpenAI gpt-image-1 (if fal.ai fails)
3. Canvas 2D (always works, free)

### New File: `src/lib/visual/fal-image.ts`

```typescript
generateImage(prompt: string, width: number, height: number, options?: {
  model?: "flux-pro" | "flux-schnell";
  negativePrompt?: string;
}): Promise<Buffer | null>
```

- Calls fal.ai API with the image prompt
- Maps dimensions to supported aspect ratios (fal.ai supports arbitrary sizes)
- Adds brand-consistent negative prompt: "low quality, blurry, watermark, text artifacts, distorted"
- Returns PNG buffer or null on failure

### Model Selection Defaults (per content type)

| Content Type | Default Model | Rationale |
|---|---|---|
| Blog cover (1200x630) | Flux Pro Ultra | Premium quality for SEO landing pages |
| Social single image | Flux Pro Ultra | Brand representation on feeds |
| Carousel hero slide | Flux Pro Ultra | First slide = scroll-stopper |
| Carousel inner slides | Canvas 2D | Text-heavy, bold colors, free |
| Reel thumbnail | Flux Schnell | Fast, just needs to be eye-catching |

### Dashboard Model Override

When generating visuals from the dashboard, an admin can override the default model via a dropdown. Available options:
- Flux Pro Ultra (best quality)
- Flux Schnell (fast)
- OpenAI gpt-image-1 (alternative style)
- Canvas 2D only (free, no API call)

The selected model is passed through the visual API route to the renderer.

## 2. AI Video Reels Pipeline

### Provider: fal.ai

**Standard model:** `fal-ai/wan/v2.1/text-to-video` (Wan 2.1) — good quality, cheapest option. ~$0.10-0.20 per 5s clip.

**Premium model:** `fal-ai/kling-video/v2.1/standard/text-to-video` (Kling 2.1) — higher quality, more realistic motion. ~$0.30 per 5s clip.

### New File: `src/lib/visual/fal-video.ts`

```typescript
generateVideoClip(prompt: string, options?: {
  model?: "wan-2.1" | "kling-2.1";
  duration?: 5;  // seconds
  aspectRatio?: "16:9" | "9:16" | "1:1";
}): Promise<{ videoUrl: string; thumbnailUrl: string } | null>
```

- Calls fal.ai text-to-video API
- Polls for completion (video gen takes 30-120s)
- Downloads the result and uploads to Vercel Blob
- Returns HTTPS URL for the video clip

### Reel Assembly

The existing `ReelConfig` from the Reel Designer Agent defines scenes. Each scene becomes a video clip:

```
ReelConfig.scenes[0] → fal.ai generates 5s clip → Vercel Blob
ReelConfig.scenes[1] → fal.ai generates 5s clip → Vercel Blob
...
Clips + music + text overlays → assembled into final reel
```

**Assembly approach:** Server-side using `fluent-ffmpeg` (ffmpeg wrapper for Node.js). Vercel Functions have a 300s timeout which is enough for stitching 4-6 clips.

**New File: `src/lib/visual/video-assembler.ts`**

```typescript
assembleReel(clips: { videoUrl: string; textOverlay?: string }[], options: {
  musicUrl?: string;
  outputFormat: "mp4";
  resolution: "1080x1920" | "1920x1080";
}): Promise<string>  // returns Vercel Blob URL of final video
```

### FFmpeg on Vercel

FFmpeg is available on Vercel Functions via the `@ffmpeg-installer/ffmpeg` package. It provides a static binary that works in the serverless environment. Combined with `fluent-ffmpeg` for the Node.js API.

## 3. AI Brand Ambassador (HeyGen)

### Provider: HeyGen API

**Plan:** Creator ($24/month) — 15 minutes of video/month, API access, premium avatars.

**Avatar setup (one-time, in HeyGen dashboard):**
1. Select a professional stock avatar (or later create a custom one from your own video)
2. Choose a voice that matches the brand tone (professional, warm, confident)
3. Design a branded background template (dark space theme with indigo/violet accents, JobPilot logo)

### New File: `src/lib/visual/heygen-avatar.ts`

```typescript
generateAvatarVideo(script: string, options?: {
  avatarId?: string;     // defaults to the JobPilot brand avatar
  voiceId?: string;      // HeyGen voice OR use custom audio
  audioUrl?: string;     // ElevenLabs voiceover URL (overrides voiceId)
  backgroundUrl?: string; // custom background image
  resolution?: "1080p";
}): Promise<{ videoUrl: string; duration: number } | null>
```

- Sends script (or audio URL) to HeyGen API
- Polls for video completion (~60-120s)
- Downloads and uploads to Vercel Blob
- Returns HTTPS URL

### Ambassador Video Pipeline

```
1. Topic Discovery (Research Agent — existing)
   ↓
2. Script Generation (Gemini — 30-60s speaking script)
   ↓
3. Voiceover (ElevenLabs — existing integration from Luminous Will)
   ↓
4. Avatar Video (HeyGen API — lip sync + gestures + branded background)
   ↓
5. Upload to Vercel Blob → HTTPS URL
   ↓
6. Queue as Content (platform: "tiktok" / "linkedin" / "instagram", status: "pending")
   ↓
7. Admin approves → auto-post to platforms
```

### New File: `src/lib/ambassador.ts`

```typescript
generateAmbassadorVideo(topic: string, platform: string): Promise<{
  contentId: string;
  videoUrl: string;
  script: string;
  duration: number;
} | null>
```

This is the orchestrator function that chains: research → script → voice → avatar → queue.

### New Cron: Ambassador Video Generation

**Route:** `GET /api/ambassador/generate`
**Schedule:** `0 7 * * 2,4` (Tuesday/Thursday 7 AM UTC — interleaves with blog Mon/Wed/Fri)
**Auth:** `CRON_SECRET` with timing-safe comparison

Generates 1 ambassador video per run. 2 per week fits comfortably in HeyGen's 15 min/month quota (2 videos × 4 weeks × 45s avg = 6 min/month).

## 4. Vercel Blob Storage

### Package: `@vercel/blob`

All generated media uploads to Vercel Blob for proper HTTPS URLs.

### New File: `src/lib/blob-storage.ts`

```typescript
// Upload an image buffer and return the HTTPS URL
uploadImage(buffer: Buffer, filename: string): Promise<string>

// Upload a video buffer and return the HTTPS URL
uploadVideo(buffer: Buffer, filename: string): Promise<string>

// Upload from a remote URL (download + re-upload to Blob)
uploadFromUrl(url: string, filename: string): Promise<string>
```

### Integration Points

1. **Visual API route** — after rendering any image, upload to Blob before storing URL
2. **Blog Writer Agent** — cover images stored as Blob URLs (fixes OG image issue from Spec 2)
3. **Video generation** — all clips and final reels uploaded to Blob
4. **Ambassador videos** — HeyGen output uploaded to Blob

### Blob Token

Requires `BLOB_READ_WRITE_TOKEN` env var on Vercel. Created automatically when you add the Vercel Blob store to your project.

## 5. Dashboard Changes

### Model Selector on Visual Generation

When clicking "Generate Visual" on a content item, the modal shows:
- **Model dropdown:** Flux Pro Ultra (default), Flux Schnell, OpenAI, Canvas 2D only
- **Preview area:** shows the generated image before saving
- **Regenerate button:** re-run with same or different model

### Ambassador Video Section

New "Ambassador Videos" card on the dashboard:
- **Generate Video** button — pick a topic or enter custom script
- **Recent videos** list — shows last 10 generated ambassador videos with thumbnails
- **Status indicators:** generating (spinner), ready for approval, posted

### Video Preview

Content items with `contentType: "ambassador_video"` or `contentType: "reel"` show:
- Video thumbnail instead of image preview
- Play button overlay
- Duration badge (e.g., "0:45")

## 6. Content Model Extensions

### Marketing HQ Content Model — New Content Types

No schema changes needed. New content uses existing `Content` model fields:

| Field | Ambassador Video | Video Reel |
|---|---|---|
| `platform` | "tiktok" / "linkedin" / "instagram" | same |
| `contentType` | "ambassador_video" | "reel" |
| `body` | script text | scene descriptions |
| `imageUrl` | Vercel Blob video URL | Vercel Blob video URL |
| `notes` | JSON: `{ avatarId, voiceId, duration, thumbnailUrl }` | JSON: `{ clips[], musicUrl, duration }` |
| `mediaPrompt` | topic/visual direction | topic/visual direction |

## 7. API Routes

### New Routes

**`POST /api/creative/generate-image`** — Generate a single image
- Auth: `isAdmin()`
- Body: `{ prompt, width, height, model?, contentId? }`
- Returns: `{ imageUrl, model, cost }`

**`POST /api/creative/generate-video`** — Generate a video clip
- Auth: `isAdmin()`
- Body: `{ prompt, model?, duration?, aspectRatio? }`
- Returns: `{ videoUrl, thumbnailUrl, duration }`

**`POST /api/creative/generate-ambassador`** — Generate an ambassador video
- Auth: `isAdmin()`
- Body: `{ topic?, script?, platform? }`
- Returns: `{ contentId, videoUrl, script, duration }`

**`GET /api/ambassador/generate`** — Cron-triggered ambassador video generation
- Auth: `CRON_SECRET`
- Schedule: `0 7 * * 2,4` (Tue/Thu 7 AM UTC)
- Generates 1 ambassador video and queues it

### Modified Routes

**`POST /api/visual`** — Updated to use fal.ai as primary renderer + Vercel Blob storage
**`POST /api/blog/publish`** — Cover images now use Blob URLs (no more base64)

## 8. Environment Variables

New env vars needed:

| Variable | Where | Purpose |
|---|---|---|
| `FAL_KEY` | jobpilot-marketing | fal.ai API key for Flux/Wan/Kling |
| `HEYGEN_API_KEY` | jobpilot-marketing | HeyGen API key for avatar videos |
| `BLOB_READ_WRITE_TOKEN` | jobpilot-marketing | Vercel Blob storage token |

Existing env vars (no changes):
- `OPENAI_API_KEY` — kept as fallback for image gen
- `PEXELS_API_KEY` — kept for stock photo backgrounds
- `ELEVENLABS_API_KEY` — if ElevenLabs integration is added (currently in Luminous Will, not Marketing HQ)
- `CRON_SECRET` — for the new ambassador cron

## 9. Estimated Costs

| Item | Volume | Unit Cost | Monthly Cost |
|---|---|---|---|
| Flux Pro Ultra (images) | ~60/month | $0.05 | $3.00 |
| Flux Schnell (thumbnails) | ~30/month | $0.003 | $0.09 |
| Wan 2.1 (video clips) | ~24/month | $0.15 | $3.60 |
| HeyGen (ambassador) | 8 videos/month | included | $24.00 |
| Vercel Blob | ~2 GB/month | $0.023/GB | $0.05 |
| **Total** | | | **~$31/month** |

## 10. Out of Scope

- Custom avatar creation from user's own video (future — HeyGen supports this)
- ElevenLabs integration within Marketing HQ (use HeyGen's built-in voices for now; add ElevenLabs later if voice quality needs upgrading)
- Real-time video preview/editing in the dashboard (videos are generated async, previewed after completion)
- Multi-language ambassador videos (future enhancement)
- A/B testing different avatars or visual styles
- Advanced video editing (cuts, transitions, effects beyond what FFmpeg provides)
- Remotion Lambda deployment (replaced by fal.ai video generation — simpler, no AWS needed)

## 11. Dependencies

New npm packages:

| Package | Purpose |
|---|---|
| `@fal-ai/client` | fal.ai SDK for image and video generation |
| `@vercel/blob` | Vercel Blob storage SDK |
| `fluent-ffmpeg` | FFmpeg wrapper for video assembly |
| `@ffmpeg-installer/ffmpeg` | FFmpeg binary for serverless |

## 12. Migration Notes

- The existing `openai-image.ts` stays in the codebase but moves to fallback position
- Canvas 2D renderer (`canvas-renderer.ts`) stays untouched — still used for text-heavy carousel slides
- Blog covers (Spec 2) will automatically benefit from Blob URLs once this spec is deployed
- The Reel Designer Agent (`reel-designer.ts`) stays — it produces the scripts; fal.ai does the rendering
- The `PLATFORM_DIMENSIONS` in `types.ts` stays — fal.ai respects arbitrary aspect ratios
