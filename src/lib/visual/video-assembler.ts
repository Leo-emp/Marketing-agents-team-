/* ============================================================
   VIDEO ASSEMBLER — FFmpeg Clip Stitching
   ============================================================
   Stitches multiple video clips into a single reel with
   optional text overlays and background music.
   Uses fluent-ffmpeg with @ffmpeg-installer/ffmpeg for the
   binary in serverless environments.
   ============================================================ */

import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { uploadVideo } from "@/lib/blob-storage";
import { readFileSync } from "fs";

// # Point fluent-ffmpeg at the installed FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

// # Clip input for the assembler — each clip has a URL and optional text overlay
interface ReelClip {
  videoUrl: string;
  textOverlay?: string;
}

// # Assembly options — output format and resolution
interface AssemblyOptions {
  musicUrl?: string;
  resolution: "1080x1920" | "1920x1080";
}

// # Download a file from a URL to a temporary local path
async function downloadToTemp(url: string, filename: string): Promise<string> {
  const dir = join(tmpdir(), "reel-assembly");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const filepath = join(dir, filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
  return filepath;
}

// # Clean up temporary files after assembly
function cleanupFiles(paths: string[]) {
  for (const p of paths) {
    try { if (existsSync(p)) unlinkSync(p); } catch { /* ignore cleanup errors */ }
  }
}

// # Assemble multiple video clips into a single reel
// # Downloads clips, concatenates with FFmpeg, uploads result to Blob
// # Returns the Vercel Blob URL of the final video
export async function assembleReel(
  clips: ReelClip[],
  options: AssemblyOptions
): Promise<string> {
  if (clips.length === 0) throw new Error("No clips to assemble");

  const tempFiles: string[] = [];
  const [width, height] = options.resolution.split("x").map(Number);

  try {
    // # Step 1: Download all clips to temp files
    console.log(`[VideoAssembler] Downloading ${clips.length} clips...`);
    const clipPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const path = await downloadToTemp(clips[i].videoUrl, `clip-${i}.mp4`);
      clipPaths.push(path);
      tempFiles.push(path);
    }

    // # Step 2: Download music if provided
    let musicPath: string | null = null;
    if (options.musicUrl) {
      musicPath = await downloadToTemp(options.musicUrl, "music.mp3");
      tempFiles.push(musicPath);
    }

    // # Step 3: Create a concat list file for FFmpeg
    const concatListPath = join(tmpdir(), "reel-assembly", "concat.txt");
    const concatContent = clipPaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
    writeFileSync(concatListPath, concatContent);
    tempFiles.push(concatListPath);

    // # Step 4: Assemble with FFmpeg
    const outputPath = join(tmpdir(), "reel-assembly", `reel-${Date.now()}.mp4`);
    tempFiles.push(outputPath);

    console.log("[VideoAssembler] Stitching clips with FFmpeg...");

    await new Promise<void>((resolve, reject) => {
      let cmd = ffmpeg()
        .input(concatListPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        // # Scale all clips to the target resolution and pad if needed
        .videoFilter(`scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`)
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p"]);

      // # Add background music if provided
      if (musicPath) {
        cmd = cmd
          .input(musicPath)
          // # Mix original audio (if any) with music, music at 30% volume
          .complexFilter([
            "[0:a]volume=1.0[a0]",
            "[1:a]volume=0.3[a1]",
            "[a0][a1]amix=inputs=2:duration=first[aout]",
          ])
          .outputOptions(["-map", "0:v", "-map", "[aout]"]);
      } else {
        // # No music — use original audio or generate silent audio
        cmd = cmd.outputOptions(["-c:a", "aac", "-b:a", "128k"]);
      }

      cmd
        .output(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    // # Step 5: Upload final video to Vercel Blob
    console.log("[VideoAssembler] Uploading assembled reel to Blob...");
    const videoBuffer = readFileSync(outputPath);
    const blobUrl = await uploadVideo(videoBuffer, `reel-${Date.now()}.mp4`);

    console.log(`[VideoAssembler] Reel assembled (${clips.length} clips) → ${blobUrl}`);
    return blobUrl;
  } finally {
    // # Always clean up temp files
    cleanupFiles(tempFiles);
  }
}
