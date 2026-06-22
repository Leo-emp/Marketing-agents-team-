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
