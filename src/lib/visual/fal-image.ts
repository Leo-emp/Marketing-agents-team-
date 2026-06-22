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
