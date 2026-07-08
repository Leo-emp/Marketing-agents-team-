/* ============================================================
   REEL DESIGNER AGENT
   ============================================================
   Converts reel script text into structured ReelConfig with
   scene timing, animation types, and layout data for Remotion.
   ============================================================ */

import { callGemini } from "../gemini";
import { fetchBRollForTopic } from "../pexels";
import { generateReelVoiceover } from "../elevenlabs";
import { uploadMedia } from "../blob-storage";
import type { ReelSceneData, ReelConfig, SceneEntrance, SceneType, MusicMood } from "./types";

// # Design a video reel from content text
export async function designReel(
  content: string,
  platform: string,
  mediaPrompt: string | null,
  topic?: string
): Promise<ReelConfig> {
  const prompt = `You are a video content designer for a premium career tech brand (JobPilot AI). Convert this reel script into structured scene data for an animated video.

BRAND VISUAL IDENTITY:
- Dark background, clean white text
- Blue gradient accents (#3b82f6 to #60a5fa)
- Minimalist, premium aesthetic
- No emojis, no busy layouts
- Professional and trustworthy

AVAILABLE SCENE TYPES:
- "brand_intro": Logo reveal (always first, always 60 frames / 2 seconds)
- "hook": Bold headline that grabs attention (90 frames / 3 seconds)
- "stat": Large animated number/percentage with label (90-120 frames)
- "tip": Tip or advice with accent border (90-150 frames)
- "list": Title with bullet items that appear one-by-one (120-150 frames)
- "quote": Powerful statement with large quote mark (90 frames)
- "cta": Call-to-action with brand URL button (always last, always 90 frames)

AVAILABLE ENTRANCE ANIMATIONS:
- "fade_in": Simple opacity fade (best for quotes, secondary text)
- "slide_up": Slides up from below with spring bounce (best for headlines, hooks)
- "slide_left": Slides in from right (best for list items)
- "scale_in": Scales up with spring (best for stats, badges)
- "typewriter": Characters appear one-by-one (best for short impactful lines)

CONTENT TO CONVERT:
${content}

${mediaPrompt ? `VISUAL DIRECTION: ${mediaPrompt}` : ""}
${topic ? `TOPIC: ${topic}` : ""}
PLATFORM: ${platform}

RULES:
1. First scene MUST be "brand_intro" with exactly 60 durationInFrames
2. Last scene MUST be "cta" with exactly 90 durationInFrames
3. Total video must be 15-45 seconds (450-1350 frames at 30fps)
4. 5-8 scenes total (including brand_intro and cta)
5. Each scene headline must be SHORT (15-25 words max -- this is text overlay on video)
6. Choose scene types that best match the content (data -> stat, advice -> tip, etc.)
7. Vary entrance animations -- don't use the same one for consecutive scenes
8. No emojis in any text

Return a JSON object:
{
  "scenes": [
    {
      "sceneType": "brand_intro",
      "headline": "",
      "entrance": "fade_in",
      "exit": "fade_out",
      "durationInFrames": 60
    },
    {
      "sceneType": "hook",
      "headline": "Short punchy hook text",
      "subheadline": "optional",
      "entrance": "slide_up",
      "exit": "fade_out",
      "durationInFrames": 90
    },
    ...more body scenes...
    {
      "sceneType": "cta",
      "headline": "Call to action text",
      "body": "optional supporting text",
      "entrance": "slide_up",
      "exit": "none",
      "durationInFrames": 90
    }
  ]
}

For "stat" scenes, include: "stat": { "value": "75%", "label": "description" }
For "list" scenes, include: "bullets": ["item 1", "item 2", "item 3"]
Return ONLY valid JSON.`;

  const raw = await callGemini(prompt);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Reel designer returned no valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // # Validate and normalize scenes
  const validSceneTypes: SceneType[] = ["brand_intro", "hook", "tip", "stat", "list", "quote", "cta"];
  const validEntrances: SceneEntrance[] = ["fade_in", "slide_up", "slide_left", "scale_in", "typewriter"];

  const scenes: ReelSceneData[] = (parsed.scenes || []).map((scene: Record<string, unknown>) => ({
    sceneType: validSceneTypes.includes(scene.sceneType as SceneType) ? scene.sceneType as SceneType : "hook",
    headline: String(scene.headline || ""),
    subheadline: scene.subheadline ? String(scene.subheadline) : undefined,
    body: scene.body ? String(scene.body) : undefined,
    stat: scene.stat && typeof scene.stat === "object"
      ? { value: String((scene.stat as Record<string, unknown>).value || ""), label: String((scene.stat as Record<string, unknown>).label || "") }
      : undefined,
    bullets: Array.isArray(scene.bullets)
      ? (scene.bullets as unknown[]).map((b: unknown) => String(b))
      : undefined,
    entrance: validEntrances.includes(scene.entrance as SceneEntrance) ? scene.entrance as SceneEntrance : "fade_in",
    exit: (scene.exit === "fade_out" || scene.exit === "slide_down" || scene.exit === "none") ? scene.exit as "fade_out" | "slide_down" | "none" : "fade_out",
    durationInFrames: typeof scene.durationInFrames === "number" ? Math.max(30, Math.min(180, scene.durationInFrames)) : 90,
    accentColor: scene.accentColor ? String(scene.accentColor) : undefined,
  }));

  // # Ensure brand_intro is first
  if (scenes.length === 0 || scenes[0].sceneType !== "brand_intro") {
    scenes.unshift({
      sceneType: "brand_intro",
      headline: "",
      entrance: "fade_in",
      exit: "fade_out",
      durationInFrames: 60,
    });
  }

  // # Ensure cta is last
  if (scenes[scenes.length - 1].sceneType !== "cta") {
    scenes.push({
      sceneType: "cta",
      headline: "Your career co-pilot is ready",
      body: "AI-powered tools for every step of your job search",
      entrance: "slide_up",
      exit: "none",
      durationInFrames: 90,
    });
  }

  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  /* # Auto-generate subtitle text from scene headlines */
  for (const scene of scenes) {
    if (!scene.subtitleText && scene.headline && scene.sceneType !== "brand_intro") {
      scene.subtitleText = scene.headline;
    }
  }

  /* # Fetch B-roll clips for non-brand scenes (runs in parallel with return) */
  let bRollClips: ReelConfig["bRollClips"] = [];
  try {
    bRollClips = await fetchBRollForTopic(topic || content, 3);
    /* # Assign B-roll to body scenes (skip brand_intro and cta) */
    const bodyScenes = scenes.filter((s) => s.sceneType !== "brand_intro" && s.sceneType !== "cta");
    for (let i = 0; i < bodyScenes.length && i < bRollClips.length; i++) {
      bodyScenes[i].backgroundVideoUrl = bRollClips[i].videoUrl;
    }
  } catch (e) {
    console.warn("[reel-designer] B-roll fetch failed, continuing without:", e);
  }

  /* # Suggest music mood based on content */
  const moodMap: Record<string, MusicMood> = {
    motivational: "inspirational",
    provocative: "dramatic",
    educational: "corporate",
    storytelling: "chill",
    data_driven: "corporate",
  };
  const detectedMood: MusicMood = moodMap[platform] || "energetic";

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
}
