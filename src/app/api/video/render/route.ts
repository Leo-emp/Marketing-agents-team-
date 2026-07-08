/* ============================================================
   VIDEO RENDER API — /api/video/render
   ============================================================
   POST: Renders a Remotion reel composition to MP4.
   Accepts either a contentId (reads ReelConfig from visualData)
   or a raw reelConfig object. Uses Remotion's bundle() +
   renderMedia() for server-side rendering.
   Uploads the result to Vercel Blob and updates the Content record.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { isAdmin, unauthorized } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/blob-storage";
import { burnReelCaptions } from "@/lib/visual/caption-burner";
import path from "path";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import type { ReelConfig } from "@/lib/visual/types";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const body = await req.json();
    let reelConfig: ReelConfig;
    let contentId: string | null = body.contentId || null;

    // # Load reel config from Content record or use provided config
    if (contentId && !body.reelConfig) {
      const content = await prisma.content.findUnique({ where: { id: contentId } });
      if (!content?.visualData) {
        return NextResponse.json({ error: "Content not found or has no visual data" }, { status: 404 });
      }
      reelConfig = JSON.parse(content.visualData) as ReelConfig;
    } else if (body.reelConfig) {
      reelConfig = body.reelConfig as ReelConfig;
    } else {
      return NextResponse.json({ error: "Provide contentId or reelConfig" }, { status: 400 });
    }

    console.log(`[Video Render] Bundling Remotion project...`);

    // # Bundle the Remotion project (this compiles the React components)
    const bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
      webpackOverride: (config) => config,
    });

    // # Select the reel composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "Reel",
      inputProps: {
        scenes: reelConfig.scenes,
        voiceoverUrl: reelConfig.voiceoverUrl,
        musicUrl: reelConfig.musicUrl,
      },
    });

    // # Render to a temporary MP4 file
    const outputPath = path.join(tmpdir(), `reel-${randomUUID()}.mp4`);

    console.log(`[Video Render] Rendering ${reelConfig.totalDurationInFrames} frames at ${reelConfig.fps}fps...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        scenes: reelConfig.scenes,
        voiceoverUrl: reelConfig.voiceoverUrl,
        musicUrl: reelConfig.musicUrl,
      },
    });

    // # Read the rendered video and upload to Vercel Blob
    const videoBuffer = readFileSync(outputPath);
    let videoUrl = await uploadVideo(videoBuffer, `reel-${Date.now()}.mp4`);

    // # Clean up temp file
    try { unlinkSync(outputPath); } catch { /* ignore */ }

    // # Burn captions into the rendered video
    const durationSeconds = reelConfig.totalDurationInFrames / reelConfig.fps;
    videoUrl = await burnReelCaptions(videoUrl, reelConfig.scenes, durationSeconds);

    // # Update Content record if we have a contentId
    if (contentId) {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          videoUrl,
          videoRenderId: `local-${Date.now()}`,
        },
      });
    }

    console.log(`[Video Render] Complete → ${videoUrl}`);

    return NextResponse.json({
      videoUrl,
      renderId: `local-${Date.now()}`,
      durationSeconds,
      frames: reelConfig.totalDurationInFrames,
    });
  } catch (e) {
    console.error("[Video Render] Failed:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Video render failed: ${message}` }, { status: 500 });
  }
}
