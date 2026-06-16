/* ============================================================
   OPENAI IMAGE GENERATION — gpt-image-1 Integration
   ============================================================
   Generates premium AI marketing images using OpenAI's
   gpt-image-1 model. Returns raw PNG buffer or null on failure,
   allowing Canvas 2D fallback.
   ============================================================ */

import OpenAI from "openai";
import { BRAND_NAME, BRAND_URL } from "./brand";

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

// # Brand prompt prefix — ensures consistent brand identity across all generated images
function buildPrompt(userPrompt: string, platform: string): string {
  return `Create a professional social media marketing graphic for ${BRAND_NAME}, a career tech platform.

BRAND REQUIREMENTS:
- Color scheme: indigo (#6366f1) and violet (#8b5cf6) as primary brand colors
- Style: premium, modern, clean, bold, high-contrast
- Typography: large, readable text prominently displayed
- Include brand URL "${BRAND_URL}" subtly in the corner
- Ready to publish on ${platform}
- No stock photo watermarks, no placeholder text
- Photorealistic quality with clean vector-style text overlays

CONTENT DIRECTION:
${userPrompt}`;
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
    const fullPrompt = buildPrompt(prompt, platform);

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
