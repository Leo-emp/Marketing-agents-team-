/* ============================================================
   ELEVENLABS TTS - AI Voiceover for Reels
   ============================================================
   Generates natural-sounding voiceover audio from reel scripts
   using ElevenLabs Text-to-Speech API. Returns audio as a
   base64 data URL or buffer for Remotion to consume.

   Get your API key at: https://elevenlabs.io/
   ============================================================ */

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

/* # Available voice presets — map to ElevenLabs voice IDs */
export const VOICES = {
  /* # Professional male — confident, clear, authoritative */
  male_professional: "pNInz6obpgDQGcFmaJgB",
  /* # Professional female — warm, trustworthy, engaging */
  female_professional: "EXAVITQu4vr4xnSDxMaL",
  /* # Casual male — friendly, relatable, conversational */
  male_casual: "VR6AewLTigWG4xSOukaG",
  /* # Casual female — upbeat, energetic, youthful */
  female_casual: "jBpfAIEhoDqmGiTBPBuZ",
} as const;

export type VoicePreset = keyof typeof VOICES;

/* # Platform → recommended voice mapping */
const PLATFORM_VOICE: Record<string, VoicePreset> = {
  linkedin: "male_professional",
  twitter: "male_casual",
  instagram: "female_casual",
  tiktok: "female_casual",
};

/* # Extract spoken text from a reel script (strip directions, keep dialogue) */
export function extractSpokenText(scenes: { headline: string; body?: string; sceneType: string }[]): string {
  const parts: string[] = [];

  for (const scene of scenes) {
    if (scene.sceneType === "brand_intro") continue;

    if (scene.headline) {
      /* # Clean up formatting markers */
      const cleaned = scene.headline
        .replace(/\[.*?\]/g, "")
        .replace(/\(.*?\)/g, "")
        .replace(/\*.*?\*/g, "")
        .trim();
      if (cleaned) parts.push(cleaned);
    }

    if (scene.body) {
      const cleaned = scene.body
        .replace(/\[.*?\]/g, "")
        .replace(/\(.*?\)/g, "")
        .trim();
      if (cleaned) parts.push(cleaned);
    }
  }

  return parts.join(". ").replace(/\.\./g, ".");
}

/* # Generate voiceover audio from text using ElevenLabs */
export async function generateVoiceover(
  text: string,
  platform?: string,
  voicePreset?: VoicePreset
): Promise<{ audioUrl: string; durationEstimate: number } | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn("[elevenlabs] ELEVENLABS_API_KEY not configured, skipping voiceover");
    return null;
  }

  /* # Select voice based on platform or explicit preset */
  const preset = voicePreset || (platform ? PLATFORM_VOICE[platform] : "male_professional");
  const voiceId = VOICES[preset] || VOICES.male_professional;

  try {
    const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("[elevenlabs] API error:", res.status, error);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    /* # Rough duration estimate: ~150 words per minute */
    const wordCount = text.split(/\s+/).length;
    const durationEstimate = Math.ceil((wordCount / 150) * 60);

    return { audioUrl, durationEstimate };
  } catch (e) {
    console.error("[elevenlabs] Failed to generate voiceover:", e);
    return null;
  }
}

/* # Generate voiceover for a full reel and return the audio URL */
export async function generateReelVoiceover(
  scenes: { headline: string; body?: string; sceneType: string }[],
  platform?: string
): Promise<string | null> {
  const spokenText = extractSpokenText(scenes);
  if (!spokenText || spokenText.length < 10) return null;

  const result = await generateVoiceover(spokenText, platform);
  return result?.audioUrl || null;
}
