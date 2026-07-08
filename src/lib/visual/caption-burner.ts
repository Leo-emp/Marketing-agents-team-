/* ============================================================
   CAPTION BURNER — Auto-Subtitles for Ambassador Videos
   ============================================================
   Burns styled captions into video files using FFmpeg.
   Word-by-word karaoke style with speech-aligned timing.
   Bold white text, black outline, positioned above platform UI.

   Takes a video URL + script + duration → generates timed ASS
   subtitles → burns into video → uploads to Vercel Blob.
   ============================================================ */

import { execFileSync } from "child_process";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  rmdirSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { uploadVideo } from "@/lib/blob-storage";

// # Small delay before first caption appears
// # HeyGen videos have a brief avatar intro before speaking starts
const START_OFFSET_SECONDS = 0.3;

// # Sentence-ending punctuation — used to detect sentence boundaries
const SENTENCE_ENDERS = /[.!?]/;

// # Apply natural capitalization to the script words
// # Only the first letter of each sentence is capitalized, rest lowercase
// # This looks clean and professional — not shouty like ALL CAPS
function naturalCase(words: string[]): string[] {
  let sentenceStart = true;
  return words.map((word) => {
    // # Lowercase the entire word first
    const lower = word.toLowerCase();
    let result: string;

    if (sentenceStart) {
      // # Capitalize the first letter of the sentence
      result = lower.charAt(0).toUpperCase() + lower.slice(1);
    } else {
      result = lower;
    }

    // # Check if this word ends a sentence (period, !, ?)
    // # The next word will start a new sentence
    sentenceStart = SENTENCE_ENDERS.test(word);
    return result;
  });
}

// # Calculate speech-aligned timing for each word
// # Longer words take longer to say — use character count as a proxy
// # for speaking duration instead of distributing time evenly
function calculateWordTimings(
  words: string[],
  durationSeconds: number
): { start: number; end: number }[] {
  // # Strip punctuation to get pure letter counts for timing
  const letterCounts = words.map(
    (w) => Math.max(w.replace(/[^a-zA-Z]/g, "").length, 1)
  );
  const totalLetters = letterCounts.reduce((sum, c) => sum + c, 0);

  // # Each word gets time proportional to its letter count
  // # A 7-letter word gets ~3.5x the time of a 2-letter word
  const effectiveDuration = durationSeconds - START_OFFSET_SECONDS;
  const timings: { start: number; end: number }[] = [];
  let cursor = START_OFFSET_SECONDS;

  for (let i = 0; i < words.length; i++) {
    const wordDuration = (letterCounts[i] / totalLetters) * effectiveDuration;
    timings.push({ start: cursor, end: cursor + wordDuration });
    cursor += wordDuration;
  }

  // # Add a small natural pause after sentence-ending punctuation
  // # This makes the captions feel more aligned with speech rhythm
  for (let i = 0; i < words.length - 1; i++) {
    if (SENTENCE_ENDERS.test(words[i])) {
      // # Steal 0.15s from the next word and add it as dead time
      const pause = Math.min(0.15, timings[i + 1].end - timings[i + 1].start);
      timings[i + 1].start += pause;
    }
  }

  return timings;
}

// # Generate the ASS (Advanced SubStation Alpha) subtitle file content
// # ASS embeds all styling directly — no FFmpeg force_style escaping needed
function generateAssContent(
  script: string,
  durationSeconds: number
): string {
  // # Split script into individual words, filter empties
  const rawWords = script.split(/\s+/).filter((w) => w.length > 0);

  // # Filter out punctuation-only tokens (lone dashes, etc.)
  const words = rawWords.filter((w) => /[a-zA-Z0-9]/.test(w));
  if (words.length === 0) return "";

  // # Apply natural capitalization — only first letter of each sentence
  const displayWords = naturalCase(words);

  // # Calculate speech-aligned timing based on word length
  const timings = calculateWordTimings(words, durationSeconds);

  // # Build ASS dialogue lines with calculated timestamps
  const dialogueLines = displayWords.map((text, i) => {
    return `Dialogue: 0,${formatAssTime(timings[i].start)},${formatAssTime(timings[i].end)},Default,,0,0,0,,${text}`;
  });

  // # Complete ASS file with embedded styling
  // # PlayRes matches 1080x1920 (9:16 vertical video)
  // # FontSize=52 — balanced size: readable on mobile without overwhelming
  // # PrimaryColour &H00FFFFFF = white text
  // # OutlineColour &H00000000 = black outline
  // # BackColour &H80000000 = semi-transparent black shadow
  // # Outline=3 = thick outline for readability
  // # Alignment=2 = bottom center
  // # MarginV=200 = pushed above TikTok/IG bottom UI elements
  return `[Script Info]
Title: Ambassador Captions
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,40,40,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogueLines.join("\n")}
`;
}

// # Format seconds into ASS timestamp: H:MM:SS.cc
// # ASS uses centiseconds (2 decimal places), not milliseconds
function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  // # Centiseconds = hundredths of a second
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

// # Download a remote file to a local directory
async function downloadToTemp(
  url: string,
  filename: string,
  dir: string
): Promise<string> {
  const filepath = join(dir, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
  return filepath;
}

// # Remove all files in a temp directory and the directory itself
function cleanupDir(dir: string) {
  try {
    for (const file of readdirSync(dir)) {
      unlinkSync(join(dir, file));
    }
    rmdirSync(dir);
  } catch {
    /* ignore cleanup errors — temp files will be garbage collected */
  }
}

// # Burn captions into a video and upload the result to Vercel Blob
// # Returns the HTTPS URL of the captioned video
// # If captioning fails, returns the original video URL (graceful degradation)
export async function burnCaptions(
  videoUrl: string,
  script: string,
  durationSeconds: number
): Promise<string> {
  // # Create a unique temp directory — avoids race conditions between
  // # concurrent function invocations on the same warm Vercel instance
  const workDir = join(tmpdir(), `captions-${randomUUID()}`);
  mkdirSync(workDir, { recursive: true });

  try {
    // # Step 1: Download the source video from Vercel Blob
    console.log("[CaptionBurner] Downloading video...");
    await downloadToTemp(videoUrl, "input.mp4", workDir);

    // # Step 2: Generate the ASS subtitle file with timed captions
    const assContent = generateAssContent(script, durationSeconds);
    if (!assContent) {
      console.warn("[CaptionBurner] No caption segments generated — returning original");
      return videoUrl;
    }
    writeFileSync(join(workDir, "captions.ass"), assContent, "utf-8");

    const wordCount = script.split(/\s+/).filter((w) => w.length > 0).length;
    console.log(
      `[CaptionBurner] Generated ${wordCount} word-by-word caption segments`
    );

    // # Step 3: Burn subtitles into the video with FFmpeg
    // # Using cwd=workDir so all file paths are relative — avoids
    // # cross-platform path escaping issues in the ASS filter
    // # -c:a copy preserves the original audio without re-encoding
    console.log("[CaptionBurner] Burning captions with FFmpeg...");
    execFileSync(
      ffmpegPath,
      [
        "-i", "input.mp4",
        "-vf", "ass=captions.ass",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-y", "captioned.mp4",
      ],
      {
        cwd: workDir,
        timeout: 120_000,
        stdio: "pipe",
      }
    );

    // # Step 4: Upload the captioned video to Vercel Blob
    const captionedBuffer = readFileSync(join(workDir, "captioned.mp4"));
    const blobUrl = await uploadVideo(
      captionedBuffer,
      `ambassador-captioned-${Date.now()}.mp4`
    );

    console.log(`[CaptionBurner] Captioned video uploaded → ${blobUrl}`);
    return blobUrl;
  } catch (err) {
    // # Caption burning failed — return original video without captions
    // # The video is still usable, just without subtitles
    console.error(
      "[CaptionBurner] Failed to burn captions — using original video:",
      err instanceof Error ? err.message : err
    );
    return videoUrl;
  } finally {
    // # Always clean up temp files
    cleanupDir(workDir);
  }
}

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
