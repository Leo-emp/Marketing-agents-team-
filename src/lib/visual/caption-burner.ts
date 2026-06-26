/* ============================================================
   CAPTION BURNER — Auto-Subtitles for Ambassador Videos
   ============================================================
   Burns styled captions into video files using FFmpeg.
   Modern TikTok/Reels style: 3 words at a time, bold white
   text with black outline, positioned above platform UI.

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

// # One word at a time — karaoke-style captions
// # Each word pops on screen individually for maximum impact
const WORDS_PER_SEGMENT = 1;

// # Small delay before first caption appears
// # HeyGen videos have a brief avatar intro before speaking starts
const START_OFFSET_SECONDS = 0.3;

// # Generate the ASS (Advanced SubStation Alpha) subtitle file content
// # ASS embeds all styling directly — no FFmpeg force_style escaping needed
function generateAssContent(
  script: string,
  durationSeconds: number
): string {
  // # Split script into individual words, filter empties
  const words = script.split(/\s+/).filter((w) => w.length > 0);

  // # Each word becomes its own caption frame (word-by-word karaoke style)
  // # Filter out punctuation-only tokens that have no readable text
  const chunks = words
    .map((w) => w.toUpperCase())
    .filter((w) => /[a-zA-Z0-9]/.test(w));

  if (chunks.length === 0) return "";

  // # Distribute timing evenly — each word gets an equal time slot
  // # Subtract the start offset to account for HeyGen's intro pause
  const effectiveDuration = durationSeconds - START_OFFSET_SECONDS;
  const timePerWord = effectiveDuration / chunks.length;

  // # Build ASS dialogue lines with calculated timestamps
  // # ASS time format: H:MM:SS.cc (centiseconds, 2 decimal places)
  const dialogueLines = chunks.map((text, i) => {
    const start = START_OFFSET_SECONDS + i * timePerWord;
    const end = START_OFFSET_SECONDS + (i + 1) * timePerWord;
    return `Dialogue: 0,${formatAssTime(start)},${formatAssTime(end)},Default,,0,0,0,,${text}`;
  });

  // # Complete ASS file with embedded styling
  // # PlayRes matches 1080x1920 (9:16 vertical video)
  // # FontSize=64 — extra large for word-by-word readability on mobile
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
Style: Default,Arial,64,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,3,1,2,40,40,200,1

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

    const wordCount = script.split(/\s+/).length;
    const segmentCount = Math.ceil(wordCount / WORDS_PER_SEGMENT);
    console.log(
      `[CaptionBurner] Generated ${segmentCount} caption segments (${wordCount} words)`
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
