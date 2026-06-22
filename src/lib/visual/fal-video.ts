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
