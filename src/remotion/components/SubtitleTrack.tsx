/* ============================================================
   SUBTITLE TRACK - Burned-in Captions for Reels
   ============================================================
   Renders word-by-word animated subtitles synced to scene
   timing. 85% of social media video is watched on mute —
   subtitles are essential for engagement and accessibility.
   ============================================================ */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { ReelSceneData } from "../../lib/visual/types";

interface SubtitleTrackProps {
  scenes: ReelSceneData[];
}

/* # Calculate which scene is active at the current frame */
function getActiveScene(scenes: ReelSceneData[], frame: number): { scene: ReelSceneData; localFrame: number; sceneStart: number } | null {
  let accumulated = 0;
  for (const scene of scenes) {
    if (frame >= accumulated && frame < accumulated + scene.durationInFrames) {
      return { scene, localFrame: frame - accumulated, sceneStart: accumulated };
    }
    accumulated += scene.durationInFrames;
  }
  return null;
}

/* # Split text into displayable word chunks (3-4 words per chunk) */
function getWordChunks(text: string, wordsPerChunk: number = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(" "));
  }
  return chunks;
}

export function SubtitleTrack({ scenes }: SubtitleTrackProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = getActiveScene(scenes, frame);
  if (!active) return null;

  const { scene, localFrame } = active;
  const text = scene.subtitleText || scene.headline;

  /* # Skip brand_intro and scenes with no text */
  if (scene.sceneType === "brand_intro" || !text) return null;

  /* # Split into word chunks and animate them sequentially */
  const chunks = getWordChunks(text, 3);
  if (chunks.length === 0) return null;

  /* # Calculate which chunk should be showing based on local frame */
  const framesPerChunk = Math.floor(scene.durationInFrames / chunks.length);
  const currentChunkIndex = Math.min(
    Math.floor(localFrame / framesPerChunk),
    chunks.length - 1
  );
  const currentChunk = chunks[currentChunkIndex];
  const chunkLocalFrame = localFrame - (currentChunkIndex * framesPerChunk);

  /* # Spring entrance for each new chunk */
  const scale = spring({
    frame: chunkLocalFrame,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  /* # Fade opacity */
  const opacity = interpolate(
    chunkLocalFrame,
    [0, 5, framesPerChunk - 5, framesPerChunk],
    [0, 1, 1, 0.5],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          borderRadius: 12,
          padding: "12px 24px",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Geist, sans-serif",
            textAlign: "center",
            lineHeight: 1.3,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {currentChunk}
        </span>
      </div>
    </div>
  );
}
